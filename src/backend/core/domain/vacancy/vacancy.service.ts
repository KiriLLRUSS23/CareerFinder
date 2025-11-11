import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { VacancyRepository } from './repositories/vacancy.repository';
import { CreateVacancyDto } from './dtos/create-vacancy.dto';
import { UpdateVacancyDto } from './dtos/update-vacancy.dto';
import { Vacancy } from './entities/vacancy.entity';
import { User } from '../../domain/user/entities/user.entity';
import { AIComplianceCopilotService } from '../../infrastructure/compliance/ai-copilot.service';
import { RegionalRulesService } from '../../infrastructure/compliance/regional/regional-rules.service';
import { VacancyStatus } from './enums/vacancy-status.enum';
import { ComplianceResult } from '../../infrastructure/compliance/types/compliance-result.interface';
import { CarbonTrackingService } from '../../application/services/carbon/carbon-tracking.service';

@Injectable()
export class VacancyService {
  constructor(
    private readonly vacancyRepository: VacancyRepository,
    private readonly complianceCopilot: AIComplianceCopilotService,
    private readonly regionalRules: RegionalRulesService,
    private readonly carbonTracking: CarbonTrackingService,
  ) {}

  async createVacancy(createDto: CreateVacancyDto, currentUser: User): Promise<Vacancy> {
    // Regional compliance validation
    const regionalRules = await this.regionalRules.getRegionalRules(
      createDto.region,
      createDto.industry,
      currentUser.preferredLanguage,
    );

    // AI compliance check
    const complianceResult = await this.complianceCopilot.checkVacancyCompliance(
      createDto,
      regionalRules,
    );

    if (!complianceResult.passed) {
      throw new ForbiddenException({
        message: 'Vacancy does not comply with regional labor laws',
        violations: complianceResult.violations,
        suggestions: complianceResult.suggestions,
      });
    }

    // Create vacancy with compliance metadata
    const vacancy = await this.vacancyRepository.create({
      ...createDto,
      employerId: currentUser.id,
      complianceScore: complianceResult.score,
      complianceMetadata: complianceResult.metadata,
      status: complianceResult.score >= 0.9 ? VacancyStatus.PUBLISHED : VacancyStatus.PENDING_REVIEW,
      regionalCoefficients: regionalRules.coefficients,
    });

    // Track carbon impact of vacancy creation
    await this.carbonTracking.trackVacancyCreation(vacancy);

    return vacancy;
  }

  async findAll(region?: string, industry?: string, salaryMin?: number, salaryMax?: number) {
    return this.vacancyRepository.findAllPublished({
      region,
      industry,
      salaryMin,
      salaryMax,
      status: VacancyStatus.PUBLISHED,
    });
  }

  async findOne(id: string, currentUser: User): Promise<Vacancy> {
    const vacancy = await this.vacancyRepository.findById(id);
    if (!vacancy) {
      throw new NotFoundException('Vacancy not found');
    }

    // Check if user has access based on regional compliance
    if (vacancy.region !== currentUser.region) {
      const canAccess = await this.regionalRules.canAccessCrossRegionalVacancy(
        currentUser.region,
        vacancy.region,
      );
      if (!canAccess) {
        throw new ForbiddenException('No access to cross-regional vacancies');
      }
    }

    return vacancy;
  }

  async updateVacancy(id: string, updateDto: UpdateVacancyDto, currentUser: User): Promise<Vacancy> {
    const vacancy = await this.findOne(id, currentUser);
    
    if (vacancy.employerId !== currentUser.id) {
      throw new ForbiddenException('You can only update your own vacancies');
    }

    // Re-check compliance for updated vacancy
    const regionalRules = await this.regionalRules.getRegionalRules(
      updateDto.region || vacancy.region,
      updateDto.industry || vacancy.industry,
      currentUser.preferredLanguage,
    );

    const complianceResult = await this.complianceCopilot.checkVacancyCompliance(
      { ...vacancy, ...updateDto },
      regionalRules,
    );

    return this.vacancyRepository.update(id, {
      ...updateDto,
      complianceScore: complianceResult.score,
      complianceMetadata: complianceResult.metadata,
      status: complianceResult.score >= 0.9 ? VacancyStatus.PUBLISHED : VacancyStatus.PENDING_REVIEW,
      regionalCoefficients: regionalRules.coefficients,
    });
  }

  async removeVacancy(id: string, currentUser: User): Promise<void> {
    const vacancy = await this.findOne(id, currentUser);
    
    if (vacancy.employerId !== currentUser.id) {
      throw new ForbiddenException('You can only delete your own vacancies');
    }

    await this.vacancyRepository.softDelete(id);
  }

  async searchVacancies(query: string, filters: any, currentUser: User) {
    // Vector-based search with regional weighting
    return this.vacancyRepository.searchWithRegionalWeighting(
      query,
      filters,
      currentUser.region,
      currentUser.skills,
    );
  }

  async getRegionalStatistics(region: string) {
    return this.vacancyRepository.getRegionalStatistics(region);
  }

  async processGovernmentIntegration() {
    // Daily sync with government APIs
    return this.vacancyRepository.syncWithGovernmentAPIs();
  }
}
