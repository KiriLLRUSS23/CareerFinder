import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { RegionalRulesService } from '../../../infrastructure/compliance/regional/regional-rules.service';
import { ComplianceService } from '../../../infrastructure/compliance/compliance.service';
import { CarbonTrackingService } from '../carbon/carbon-tracking.service';
import { MLModelService } from '../../../infrastructure/ml/MLModelService';

@Injectable()
export class RegulatoryIntelligenceService {
  private readonly logger = new Logger(RegulatoryIntelligenceService.name);
  private readonly lookAheadMonths: number;
  private readonly confidenceThreshold: number;
  private readonly dataSources: string[];
  private readonly updateFrequency: string;
  private readonly alertLeadTimeHours: number;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
    private readonly regionalRules: RegionalRulesService,
    private readonly complianceService: ComplianceService,
    private readonly carbonTracking: CarbonTrackingService,
    private readonly mlModel: MLModelService,
  ) {
    this.lookAheadMonths = this.configService.get<number>('regulatory_intelligence.look_ahead_months') || 3;
    this.confidenceThreshold = this.configService.get<number>('regulatory_intelligence.confidence_threshold') || 0.8;
    this.dataSources = this.configService.get<string[]>('regulatory_intelligence.data_sources') || [
      'mintrud.gov.ru',
      'rosminzdrav.gov.ru',
      'fss.ru',
      'pfr.gov.ru'
    ];
    this.updateFrequency = this.configService.get<string>('regulatory_intelligence.update_frequency') || 'daily';
    this.alertLeadTimeHours = this.configService.get<number>('regulatory_intelligence.alert_lead_time') || 72;
  }

  async forecastRegulatoryChanges(region: string, industry: string): Promise<RegulatoryForecast> {
    try {
      // Collect current regulatory data from all sources
      const regulatoryData = await this.collectRegulatoryData(region, industry);
      
      // Get regional rules for context
      const regionalRules = await this.regionalRules.getRegionalRules(region, industry, 'russian');
      
      // Use ML model to forecast changes
      const forecast = await this.mlModel.predictRegulatoryChanges(
        regulatoryData,
        regionalRules,
        this.lookAheadMonths,
        this.confidenceThreshold
      );
      
      // Track carbon impact of forecasting operation
      await this.carbonTracking.trackMLInference('regulatory-forecast', {
        region,
        industry,
        dataPoints: regulatoryData.length,
        forecastMonths: this.lookAheadMonths
      });
      
      return this.enrichForecastWithActionableInsights(forecast, regionalRules);
    } catch (error) {
      this.logger.error('Regulatory forecasting failed', error);
      
      // Fallback to rule-based forecasting
      return this.fallbackRuleBasedForecasting(region, industry);
    }
  }

  private async collectRegulatoryData(region: string, industry: string): Promise<any[]> {
    const promises = this.dataSources.map(source => 
      this.httpService.get(, {
        params: {
          region,
          industry,
          timestamp: new Date().toISOString()
        },
        timeout: 10000
      }).toPromise()
    );
    
    try {
      const results = await Promise.all(promises);
      return results.flatMap(result => result?.data?.regulations || []);
    } catch (error) {
      this.logger.error('Failed to collect regulatory data', error);
      return [];
    }
  }

  private enrichForecastWithActionableInsights(forecast: RegulatoryForecast, regionalRules: any): RegulatoryForecast {
    const enrichedForecast = { ...forecast };
    
    // Add actionable recommendations
    enrichedForecast.recommendations = this.generateRecommendations(forecast, regionalRules);
    
    // Add implementation timeline
    enrichedForecast.implementationTimeline = this.calculateImplementationTimeline(forecast);
    
    // Add impact assessment
    enrichedForecast.impactAssessment = this.assessBusinessImpact(forecast, regionalRules);
    
    // Add compliance checklist
    enrichedForecast.complianceChecklist = this.generateComplianceChecklist(forecast, regionalRules);
    
    return enrichedForecast;
  }

  private generateRecommendations(forecast: RegulatoryForecast, regionalRules: any): Recommendation[] {
    const recommendations: Recommendation[] = [];
    
    for (const change of forecast.predictedChanges) {
      if (change.confidence >= this.confidenceThreshold && change.impact === 'high') {
        if (change.type === 'tax_rate_change') {
          recommendations.push({
            title: 'Обновление системы налогообложения',
            description: ,
            priority: 'high',
            timeline: '30 дней до вступления в силу',
            responsibleRoles: ['financial_analyst', 'compliance_officer']
          });
        } else if (change.type === 'minimum_wage_change') {
          recommendations.push({
            title: 'Корректировка зарплатных данных',
            description: ,
            priority: 'high',
            timeline: '14 дней до вступления в силу',
            responsibleRoles: ['hr_manager', 'payroll_specialist']
          });
        } else if (change.type === 'benefit_requirements_change') {
          recommendations.push({
            title: 'Обновление пакета социальных гарантий',
            description: ,
            priority: 'medium',
            timeline: '45 дней до вступления в силу',
            responsibleRoles: ['hr_manager', 'legal_counsel']
          });
        }
      }
    }
    
    return recommendations;
  }

  private calculateImplementationTimeline(forecast: RegulatoryForecast): TimelineItem[] {
    const timeline: TimelineItem[] = [];
    const currentDate = new Date();
    
    for (const change of forecast.predictedChanges) {
      if (change.confidence >= this.confidenceThreshold) {
        const effectiveDate = new Date(change.effectiveDate);
        const preparationDate = new Date(effectiveDate);
        preparationDate.setDate(preparationDate.getDate() - this.alertLeadTimeHours / 24);
        
        timeline.push({
          phase: 'preparation',
          startDate: currentDate.toISOString(),
          endDate: preparationDate.toISOString(),
          activities: [
            'Анализ изменений',
            'Обновление внутренних политик',
            'Обучение сотрудников',
            'Тестирование системы'
          ],
          responsibleRoles: ['compliance_officer', 'legal_counsel', 'hr_manager']
        });
        
        timeline.push({
          phase: 'implementation',
          startDate: preparationDate.toISOString(),
          endDate: effectiveDate.toISOString(),
          activities: [
            'Обновление системы',
            'Тестирование изменений',
            'Валидация с регуляторами',
            'Продуктовое развертывание'
          ],
          responsibleRoles: ['system_administrator', 'compliance_officer', 'qa_engineer']
        });
        
        timeline.push({
          phase: 'monitoring',
          startDate: effectiveDate.toISOString(),
          endDate: new Date(effectiveDate.getFullYear() + 1, effectiveDate.getMonth(), effectiveDate.getDate()).toISOString(),
          activities: [
            'Мониторинг соблюдения',
            'Сбор обратной связи',
            'Корректировка процессов',
            'Отчетность регуляторам'
          ],
          responsibleRoles: ['compliance_officer', 'legal_counsel', 'data_analyst']
        });
      }
    }
    
    return timeline;
  }

  private assessBusinessImpact(forecast: RegulatoryForecast, regionalRules: any): ImpactAssessment {
    let financialImpact = 0;
    let operationalImpact = 0;
    let complianceRisk = 0;
    const affectedAreas = [];
    
    for (const change of forecast.predictedChanges) {
      if (change.confidence >= this.confidenceThreshold) {
        if (change.type === 'tax_rate_change') {
          financialImpact += Math.abs(change.predictedValue - change.currentValue) * 0.1; // 10% revenue impact per 1% tax change
          affectedAreas.push('financial_operations');
        } else if (change.type === 'minimum_wage_change') {
          financialImpact += Math.abs(change.predictedValue - change.currentValue) * 0.05; // 5% cost impact per 1000 RUB wage change
          operationalImpact += 0.3; // moderate operational impact
          affectedAreas.push('hr_operations', 'payroll');
        } else if (change.type === 'benefit_requirements_change') {
          financialImpact += 0.2; // 20% cost increase for new benefits
          operationalImpact += 0.4; // high operational impact for implementation
          affectedAreas.push('hr_operations', 'employee_relations');
        }
        
        if (change.impact === 'high') {
          complianceRisk += 0.5;
        } else if (change.impact === 'medium') {
          complianceRisk += 0.3;
        }
      }
    }
    
    return {
      financialImpact: Math.min(1.0, financialImpact),
      operationalImpact: Math.min(1.0, operationalImpact),
      complianceRisk: Math.min(1.0, complianceRisk),
      affectedAreas: [...new Set(affectedAreas)],
      mitigationStrategy: this.generateMitigationStrategy(forecast, regionalRules)
    };
  }

  private generateMitigationStrategy(forecast: RegulatoryForecast, regionalRules: any): MitigationStrategy {
    const highImpactChanges = forecast.predictedChanges.filter(
      change => change.confidence >= this.confidenceThreshold && change.impact === 'high'
    );
    
    return {
      proactiveMeasures: [
        ,
        'Создать рабочую группу по адаптации к изменениям',
        'Разработать план поэтапного внедрения изменений',
        'Подготовить коммуникационные материалы для клиентов'
      ],
      contingencyPlans: [
        'Определить fallback-стратегии для критических изменений',
        'Установить лимиты бюджета на внезапные изменения',
        'Подготовить шаблоны юридических документов для быстрой адаптации',
        
      ],
      stakeholderEngagement: [
        'Регулярные встречи с регуляторами',
        'Консультации с отраслевыми ассоциациями',
        'Обратная связь от корпоративных клиентов',
        
      ],
      timelineAdjustments: highImpactChanges.map(change => ({
        changeId: change.id,
        originalTimeline: change.effectiveDate,
        adjustedTimeline: this.calculateAdjustedTimeline(change),
        confidenceLevel: change.confidence,
        justification: 
      }))
    };
  }

  private generateComplianceChecklist(forecast: RegulatoryForecast, regionalRules: any): ComplianceChecklistItem[] {
    const checklist: ComplianceChecklistItem[] = [];
    
    for (const change of forecast.predictedChanges) {
      if (change.confidence >= this.confidenceThreshold) {
        checklist.push({
          title: ,
          description: ,
          dueDate: new Date(new Date(change.effectiveDate).getTime() - this.alertLeadTimeHours * 60 * 60 * 1000).toISOString(),
          priority: change.impact === 'high' ? 'critical' : change.impact === 'medium' ? 'high' : 'medium',
          responsibleRole: 'compliance_officer',
          status: 'pending',
          completionCriteria: [
            'Документация изменений обновлена',
            'Система протестирована с новыми требованиями',
            'Обучение сотрудников проведено',
            'Клиенты уведомлены об изменениях'
          ],
          evidenceRequirements: [
            'Тестовые сценарии',
            'Отчеты о соблюдении',
            'Планы обучения',
            'Коммуникационные материалы'
          ]
        });
      }
    }
    
    return checklist;
  }

  private fallbackRuleBasedForecasting(region: string, industry: string): RegulatoryForecast {
    this.logger.warn('Using rule-based fallback forecasting');
    
    // Get current regional rules
    const regionalRules = this.regionalRules.getRuleDefinitions(region, industry);
    
    // Simple rule-based prediction
    const predictedChanges = [];
    
    // Minimum wage typically increases annually
    const currentMinWage = regionalRules.minimum_wage || 20000;
    predictedChanges.push({
      id: ,
      type: 'minimum_wage_change',
      description: ,
      currentValue: currentMinWage,
      predictedValue: currentMinWage * 1.08, // 8% annual increase
      effectiveDate: new Date(new Date().getFullYear() + 1, 0, 1).toISOString(),
      confidence: 0.75,
      impact: 'medium',
      region,
      industry
    });
    
    // Tax changes based on regional development
    if (['tatarstan', 'samara'].includes(region)) {
      predictedChanges.push({
        id: ,
        type: 'tax_benefits_change',
        description: ,
        currentValue: 0.03,
        predictedValue: 0.015,
        effectiveDate: new Date(new Date().getFullYear() + 1, 3, 1).toISOString(),
        confidence: 0.65,
        impact: 'high',
        region,
        industry: 'it'
      });
    }
    
    return {
      forecastId: ,
      region,
      industry,
      forecastDate: new Date().toISOString(),
      predictedChanges,
      overallConfidence: 0.7,
      forecastHorizonMonths: this.lookAheadMonths,
      dataSourcesUsed: ['historical_trends', 'regional_development_plans'],
      modelVersion: 'rule-based-fallback-1.0',
      recommendations: [],
      implementationTimeline: [],
      impactAssessment: {
        financialImpact: 0.3,
        operationalImpact: 0.2,
        complianceRisk: 0.1,
        affectedAreas: ['hr_operations', 'financial_operations'],
        mitigationStrategy: {
          proactiveMeasures: ['Мониторинг региональных инициатив', 'Консультации с экспертами'],
          contingencyPlans: ['Резервный бюджет на изменения', 'Гибкие бизнес-процессы'],
          stakeholderEngagement: ['Регулярные встречи с регуляторами'],
          timelineAdjustments: []
        }
      },
      complianceChecklist: []
    };
  }

  async getRegulatoryAlerts(userId: string, userPreferences: UserPreferences): Promise<RegulatoryAlert[]> {
    const { region, industry, notificationPreferences } = userPreferences;
    
    // Get recent forecasts
    const recentForecasts = await this.getRecentForecasts(region, industry);
    
    const alerts: RegulatoryAlert[] = [];
    
    for (const forecast of recentForecasts) {
      for (const change of forecast.predictedChanges) {
        if (change.confidence >= this.confidenceThreshold && 
            this.isChangeRelevantToUser(change, userPreferences) &&
            this.isAlertTimingAppropriate(change, notificationPreferences)) {
          
          alerts.push({
            alertId: ,
            userId,
            changeId: change.id,
            title: this.generateAlertTitle(change, region),
            message: this.generateAlertMessage(change, region, userPreferences.language),
            severity: this.calculateAlertSeverity(change, userPreferences),
            dueDate: new Date(new Date(change.effectiveDate).getTime() - this.alertLeadTimeHours * 60 * 60 * 1000),
            actions: this.generateAlertActions(change, region),
            read: false,
            createdAt: new Date(),
            metadata: {
              region,
              industry,
              forecastConfidence: change.confidence,
              impactLevel: change.impact
            }
          });
        }
      }
    }
    
    return alerts;
  }

  private isChangeRelevantToUser(change: PredictedChange, userPreferences: UserPreferences): boolean {
    // Check if change is relevant to user's industry
    if (userPreferences.industry && change.industry && change.industry !== userPreferences.industry) {
      return false;
    }
    
    // For regional-specific changes
    if (change.region && change.region !== userPreferences.region) {
      // Check if user has cross-regional operations
      if (!userPreferences.crossRegionalAccess) {
        return false;
      }
    }
    
    // Check impact level preference
    if (userPreferences.alertThreshold && change.impact !== 'high') {
      return false;
    }
    
    return true;
  }

  private calculateAlertSeverity(change: PredictedChange, userPreferences: UserPreferences): 'critical' | 'high' | 'medium' | 'low' {
    let severityLevel = 0;
    
    // Base severity on impact
    if (change.impact === 'high') severityLevel += 3;
    else if (change.impact === 'medium') severityLevel += 2;
    else severityLevel += 1;
    
    // Boost severity based on confidence
    if (change.confidence >= 0.9) severityLevel += 2;
    else if (change.confidence >= 0.8) severityLevel += 1;
    
    // Boost severity for financial impacts
    if (['tax_rate_change', 'minimum_wage_change', 'benefit_requirements_change'].includes(change.type)) {
      severityLevel += 1;
    }
    
    // Adjust based on user preferences
    if (userPreferences.alertSensitivity === 'high') {
      severityLevel += 1;
    } else if (userPreferences.alertSensitivity === 'low') {
      severityLevel -= 1;
    }
    
    if (severityLevel >= 5) return 'critical';
    if (severityLevel >= 4) return 'high';
    if (severityLevel >= 3) return 'medium';
    return 'low';
  }

  private async getRecentForecasts(region: string, industry: string): Promise<RegulatoryForecast[]> {
    // This would typically query a database for cached forecasts
    // For now, we'll generate a fresh forecast
    const forecast = await this.forecastRegulatoryChanges(region, industry);
    return [forecast];
  }
}
