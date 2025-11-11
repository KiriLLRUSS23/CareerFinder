import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { User } from '../../../domain/user/entities/user.entity';
import { UserService } from '../../../domain/user/user.service';
import { HybridCryptoModule } from '../hybrid-crypto/hybrid-crypto.module';
import { RegionalComplianceModule } from '../../compliance/regional/regional-compliance.module';
import { DataMaskingService } from '../../compliance/data-masking.service';

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { 
          expiresIn: configService.get<string>('JWT_EXPIRES_IN'),
        },
      }),
    }),
    TypeOrmModule.forFeature([User]),
    HybridCryptoModule,
    RegionalComplianceModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, UserService, DataMaskingService],
  exports: [AuthService],
})
export class AuthModule {}
