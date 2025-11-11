import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CarbonEmission } from '../entities/carbon-emission.entity';
import { Vacancy } from '../../../domain/vacancy/entities/vacancy.entity';
import { User } from '../../../domain/user/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { RegionalRulesService } from '../../../infrastructure/compliance/regional/regional-rules.service';
import { CarbonBudgetExceededError } from '../exceptions/carbon-budget-exceeded.error';

@Injectable()
export class CarbonTrackingService {
  private readonly logger = new Logger(CarbonTrackingService.name);
  private readonly CO2_BUDGET_KG_MONTH: number;
  private readonly EMERGENCY_THRESHOLD: number;

  constructor(
    @InjectRepository(CarbonEmission)
    private readonly carbonRepository: Repository<CarbonEmission>,
    private readonly configService: ConfigService,
    private readonly regionalRules: RegionalRulesService,
  ) {
    this.CO2_BUDGET_KG_MONTH = this.configService.get<number>('carbon.co2_budget_kg_month') || 100;
    this.EMERGENCY_THRESHOLD = this.CO2_BUDGET_KG_MONTH * 1.2; // 120% of budget
  }

  async trackVacancyCreation(vacancy: Vacancy): Promise<CarbonEmission> {
    // Calculate carbon footprint based on vacancy complexity and region
    const regionalFactor = await this.getRegionalCarbonFactor(vacancy.region);
    const complexityFactor = this.calculateComplexityFactor(vacancy);
    
    const co2Kg = 0.5 * regionalFactor * complexityFactor; // Base 0.5kg per vacancy
    
    return this.recordEmission({
      entityType: 'vacancy',
      entityId: vacancy.id,
      co2Kg,
      region: vacancy.region,
      activityType: 'creation',
      metadata: {
        salaryRange: vacancy.salaryRange,
        industry: vacancy.industry,
        complexityScore: complexityFactor,
      },
    });
  }

  async trackUserActivity(user: User, activityType: string): Promise<CarbonEmission> {
    const regionalFactor = await this.getRegionalCarbonFactor(user.region);
    const activityFactors = {
      'login': 0.01,
      'search': 0.05,
      'apply': 0.1,
      'profile_update': 0.03,
    };
    
    const baseFactor = activityFactors[activityType] || 0.02;
    const co2Kg = baseFactor * regionalFactor;
    
    return this.recordEmission({
      entityType: 'user',
      entityId: user.id,
      co2Kg,
      region: user.region,
      activityType,
      metadata: {
        userRole: user.role,
        deviceType: 'web', // Will be enhanced with device detection
      },
    });
  }

  private async getRegionalCarbonFactor(region: string): Promise<number> {
    const regionalRules = await this.regionalRules.getRegionalRules(region, 'general', 'russian');
    return regionalRules.carbonFactor || 1.0;
  }

  private calculateComplexityFactor(vacancy: Vacancy): number {
    let factor = 1.0;
    
    // Complexity based on requirements
    if (vacancy.requirements?.length > 10) factor += 0.2;
    if (vacancy.skills?.length > 8) factor += 0.15;
    if (vacancy.experienceYears > 5) factor += 0.1;
    
    // Complexity based on salary range
    const avgSalary = (vacancy.salaryMin + vacancy.salaryMax) / 2;
    if (avgSalary > 200000) factor += 0.25;
    
    return Math.min(2.0, factor); // Cap at 2x
  }

  private async recordEmission(emissionData: any): Promise<CarbonEmission> {
    const emission = this.carbonRepository.create(emissionData);
    const savedEmission = await this.carbonRepository.save(emission);
    
    // Check budget after recording
    await this.checkBudgetThreshold();
    
    return savedEmission;
  }

  async checkBudgetThreshold(): Promise<void> {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const totalEmissions = await this.carbonRepository
      .createQueryBuilder('emission')
      .where('EXTRACT(MONTH FROM emission.timestamp) = :month', { month: currentMonth })
      .andWhere('EXTRACT(YEAR FROM emission.timestamp) = :year', { year: currentYear })
      .select('SUM(emission.co2Kg)', 'total')
      .getRawOne();
    
    const totalCo2Kg = parseFloat(totalEmissions.total) || 0;
    
    if (totalCo2Kg >= this.EMERGENCY_THRESHOLD) {
      this.logger.error();
      throw new CarbonBudgetExceededError(
        ,
        totalCo2Kg,
        this.CO2_BUDGET_KG_MONTH
      );
    } else if (totalCo2Kg >= this.CO2_BUDGET_KG_MONTH * 0.8) {
      this.logger.warn();
      // Trigger automatic offset purchase
      // await this.carbonOffsetService.purchaseAutomaticOffsets(totalCo2Kg - this.CO2_BUDGET_KG_MONTH * 0.8);
    }
  }

  async getCarbonDashboardData(region?: string): Promise<any> {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    const queryBuilder = this.carbonRepository
      .createQueryBuilder('emission')
      .where('EXTRACT(MONTH FROM emission.timestamp) = :month', { month: currentMonth })
      .andWhere('EXTRACT(YEAR FROM emission.timestamp) = :year', { year: currentYear });
    
    if (region) {
      queryBuilder.andWhere('emission.region = :region', { region });
    }
    
    const [totalEmissions, emissionsByType, regionalBreakdown] = await Promise.all([
      queryBuilder
        .select('SUM(emission.co2Kg)', 'total')
        .getRawOne(),
        
      queryBuilder
        .select('emission.activityType', 'activityType')
        .addSelect('SUM(emission.co2Kg)', 'total')
        .groupBy('emission.activityType')
        .getRawMany(),
        
      queryBuilder
        .select('emission.region', 'region')
        .addSelect('SUM(emission.co2Kg)', 'total')
        .groupBy('emission.region')
        .getRawMany()
    ]);
    
    return {
      totalEmissions: parseFloat(totalEmissions.total) || 0,
      budget: this.CO2_BUDGET_KG_MONTH,
      utilization: Math.min(100, Math.round((parseFloat(totalEmissions.total) || 0) / this.CO2_BUDGET_KG_MONTH * 100)),
      emissionsByType,
      regionalBreakdown,
      offsetProjects: await this.getActiveOffsetProjects(region),
    };
  }

  private async getActiveOffsetProjects(region?: string): Promise<any[]> {
    // Stub for offset projects integration
    return [
      {
        name: "Volga Forest Restoration",
        location: "Samara Region",
        provider: "veb-rf-esg",
        co2OffsetTons: 60,
        verification: "iso-14064",
        progress: 25,
        communityBenefits: ['jobs-creation', 'biodiversity-protection']
      },
      {
        name: "Energy Efficiency Program", 
        location: "Tatarstan",
        provider: "yandex-cloud",
        co2OffsetTons: 40,
        verification: "internal-audit",
        progress: 15,
        technology: "solar-panels-enterprise"
      }
    ].filter(project => !region || project.location.toLowerCase().includes(region.toLowerCase()));
  }
}
