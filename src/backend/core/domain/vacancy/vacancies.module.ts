import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VacancyController } from './vacancy.controller';
import { VacancyService } from './vacancy.service';
import { Vacancy } from './entities/vacancy.entity';
import { VacancyRepository } from './repositories/vacancy.repository';
import { ComplianceModule } from '../../infrastructure/compliance/compliance.module';
import { RegionalComplianceModule } from '../../infrastructure/compliance/regional/regional-compliance.module';
import { HybridCryptoModule } from '../../infrastructure/security/hybrid-crypto/hybrid-crypto.module';
import { AIComplianceCopilotService } from '../../infrastructure/compliance/ai-copilot.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vacancy]),
    ComplianceModule,
    RegionalComplianceModule,
    HybridCryptoModule,
  ],
  controllers: [VacancyController],
  providers: [VacancyService, VacancyRepository, AIComplianceCopilotService],
  exports: [VacancyService],
})
export class VacanciesModule {}
