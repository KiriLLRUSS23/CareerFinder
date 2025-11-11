import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { ComplianceService } from '../../../compliance/compliance.service';
import { CarbonTrackingService } from '../../../../application/services/carbon/carbon-tracking.service';
import { RegionalRulesService } from '../../../compliance/regional/regional-rules.service';

@Injectable()
export class SAPIntegrationService {
  private readonly logger = new Logger(SAPIntegrationService.name);
  private readonly sapEndpoint: string;
  private readonly sapCredentials: {
    clientId: string;
    clientSecret: string;
  };
  private readonly sapOauthUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly complianceService: ComplianceService,
    private readonly carbonTracking: CarbonTrackingService,
    private readonly regionalRules: RegionalRulesService,
  ) {
    this.sapEndpoint = this.configService.get<string>('integrations.hr_systems.sap.endpoint') || 'https://sap.enterprise.api/v1';
    this.sapOauthUrl = this.configService.get<string>('integrations.hr_systems.sap.oauth_url') || 'https://sap.oauth.com/token';
    this.sapCredentials = {
      clientId: this.configService.get<string>('integrations.hr_systems.sap.client_id') || 'careerfinder-sap-client',
      clientSecret: this.configService.get<string>('integrations.hr_systems.sap.client_secret') || 'secure-sap-secret-change-me',
    };
  }

  private async getAccessToken(): Promise<string> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(this.sapOauthUrl, 
          new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.sapCredentials.clientId,
            client_secret: this.sapCredentials.clientSecret,
            scope: 'hr.read hr.write'
          }),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        )
      );

      return response.data.access_token;
    } catch (error) {
      this.logger.error('SAP OAuth failed', error);
      throw new Error('Failed to obtain SAP access token');
    }
  }

  async syncCoreHRData(clientId: string, region: string): Promise<IntegrationResult> {
    try {
      const accessToken = await this.getAccessToken();
      const regionalRules = await this.regionalRules.getRegionalRules(region, 'general', 'russian');
      
      const response = await firstValueFrom(
        this.httpService.get(, {
          headers: {
            'Authorization': ,
            'X-Region': region,
            'X-Client-ID': clientId,
            'X-Compliance-Version': '2025.08'
          },
          params: {
            clientId,
            lastSyncDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
          }
        })
      );

      const hrData = response.data;
      let syncedCount = 0;
      const errors = [];

      // Process organizational units
      for (const orgUnit of hrData.organizationalUnits) {
        try {
          await this.orgUnitService.syncOrgUnit({
            ...orgUnit,
            clientId,
            region,
            sourceSystem: 'sap'
          });
          syncedCount++;
        } catch (error) {
          errors.push({
            orgUnitId: orgUnit.id,
            error: error.message
          });
        }
      }

      // Process positions
      for (const position of hrData.positions) {
        try {
          // Apply compliance check for position
          const complianceCheck = await this.complianceService.checkPositionCompliance(position, regionalRules);
          
          if (complianceCheck.passed) {
            await this.positionService.syncPosition({
              ...position,
              clientId,
              region,
              sourceSystem: 'sap'
            });
            syncedCount++;
            
            await this.carbonTracking.trackIntegrationActivity('sap-position-sync', position.id, region);
          } else {
            errors.push({
              positionId: position.id,
              violations: complianceCheck.violations
            });
          }
        } catch (error) {
          errors.push({
            positionId: position.id,
            error: error.message
          });
        }
      }

      return {
        success: true,
        recordsProcessed: hrData.organizationalUnits.length + hrData.positions.length,
        recordsSynced: syncedCount,
        errors,
        timestamp: new Date(),
        complianceScore: syncedCount / (hrData.organizationalUnits.length + hrData.positions.length),
        carbonImpact: syncedCount * 0.07 // 0.07kg CO2 per record
      };
    } catch (error) {
      this.logger.error('SAP core HR sync failed', error);
      throw new Error();
    }
  }
}
