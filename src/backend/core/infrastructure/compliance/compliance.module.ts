import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComplianceController } from './compliance.controller';
import { AIComplianceCopilotService } from './ai-copilot.service';
import { RuleBasedComplianceEngine } from './rule-based-engine.service';
import { ComplianceAudit } from './entities/compliance-audit.entity';
import { ComplianceAuditRepository } from './repositories/compliance-audit.repository';
import { HybridCryptoModule } from '../security/hybrid-crypto/hybrid-crypto.module';
import { RegionalComplianceModule } from './regional/regional-compliance.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([ComplianceAudit]),
    HybridCryptoModule,
    RegionalComplianceModule,
    ConfigModule,
  ],
  controllers: [ComplianceController],
  providers: [
    AIComplianceCopilotService,
    RuleBasedComplianceEngine,
    ComplianceAuditRepository,
  ],
  exports: [AIComplianceCopilotService, RuleBasedComplianceEngine],
})
export class ComplianceModule {}
