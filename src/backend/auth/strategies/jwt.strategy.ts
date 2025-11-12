import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../auth.service'; // Импортируем наш тип Payload

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Ищем токен в "Bearer <token>"
      ignoreExpiration: false, // Не игнорируем истекший срок
      secretOrKey: configService.get<string>('JWT_SECRET'), // Тот же секрет, что и в AuthModule
    });
  }

  /**
   * Этот метод вызывается Passport'ом после успешной валидации токена.
   * Он помещает возвращаемое значение в request.user
   */
  async validate(payload: JwtPayload) {
    // Здесь мы можем дополнительно проверить, существует ли пользователь в БД,
    // но для производительности часто доверяют payload, если токен валиден.
    
    if (!payload.userId || !payload.role) {
       throw new UnauthorizedException('Невалидный токена');
    }
    
    // Этот объект будет доступен в req.user в контроллерах
    return {
      userId: payload.userId,
      email: payload.email,
      role: payload.role,
      companyId: payload.companyId,
    };
  }
}