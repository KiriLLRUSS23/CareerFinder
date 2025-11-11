import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CarbonTrackingService } from './carbon-tracking.service';
import { CarbonOffsetService } from './carbon-offset.service';
import { CarbonDashboardController } from '../../../apps/carbon-dashboard/carbon-dashboard.controller';
import { CarbonEmission } from '../entities/carbon-emission.entity';
import { OffsetProject } from '../entities/offset-project.entity';
import { ComplianceModule } from '../../infrastructure/compliance/compliance.module';
import { RegionalComplianceModule } from '../../infrastructure/compliance/regional/regional-compliance.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CarbonEmission, OffsetProject]),
    ComplianceModule,
    RegionalComplianceModule,
  ],
  controllers: [CarbonDashboardController],
  providers: [CarbonTrackingService, CarbonOffsetService],
  exports: [CarbonTrackingService, CarbonOffsetService],
})
export class CarbonModule {}
