import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module'; // Импорт UserModule
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './strategies/jwt.strategy';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    UserModule, // Для доступа к UserService
    PassportModule,
    ConfigModule, // Для доступа к .env переменным
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'), // Берем секрет из .env
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRES_IN', '30d'), // Срок жизни токена
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy], // JwtStrategy регистрируется здесь
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}