import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../../core/infrastructure/security/auth.module';
import { VacanciesModule } from '../../core/domain/vacancy/vacancies.module';
import { ComplianceModule } from '../../core/infrastructure/compliance/compliance.module';
import { CarbonModule } from '../../core/application/services/carbon/carbon.module';
import { RegionalModule } from '../../core/infrastructure/compliance/regional/regional.module';
import { SharedModule } from '../../shared/config/shared.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [
        // Загрузка конфигурации из файлов
      ],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST') || 'localhost',
        port: configService.get<number>('DB_PORT') || 5432,
        username: configService.get<string>('DB_USERNAME') || 'careerfinder',
        password: configService.get<string>('DB_PASSWORD') || 'securepassword',
        database: configService.get<string>('DB_DATABASE') || 'careerfinder_v7',
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: configService.get<boolean>('DB_SYNCHRONIZE') || false,
        migrations: [__dirname + '/../../database/migrations/*{.ts,.js}'],
        migrationsRun: true,
        logging: configService.get<boolean>('DB_LOGGING') || false,
        ssl: configService.get<boolean>('DB_SSL') || false,
        extra: {
          max: configService.get<number>('DB_MAX_CONNECTIONS') || 20,
          idleTimeoutMillis: configService.get<number>('DB_IDLE_TIMEOUT') || 30000,
        },
      }),
    }),
    SharedModule,
    AuthModule,
    VacanciesModule,
    ComplianceModule,
    CarbonModule,
    RegionalModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
