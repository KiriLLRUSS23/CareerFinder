import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { User } from '../user/entities/user.entity';
import { Role } from '../user/enums/role.enum';

// Тип данных, который мы зашифруем в JWT
export interface JwtPayload {
  userId: number;
  email: string;
  role: Role;
  companyId?: number; // Включаем, если это EMPLOYER
}

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService, // Сервис для работы с пользователями
    private jwtService: JwtService,     // Сервис для работы с JWT
  ) {}

  /**
   * Проверяет учетные данные пользователя при входе
   */
  async validateUser(email: string, pass: string): Promise<Omit<User, 'password'>> {
    const user = await this.userService.findByEmail(email, true); // true = включить пароль в запрос

    if (user && (await user.validatePassword(pass))) {
      // 'validatePassword' - метод из User.entity.ts
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  /**
   * Логика входа (Login)
   */
  async login(loginDto: LoginDto) {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    // Собираем payload для токена
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company?.id, // Добавляем companyId, если он есть
    };

    return {
      accessToken: this.jwtService.sign(payload), // Создаем токен
      user: payload, // Возвращаем базовую информацию о пользователе
    };
  }

  /**
   * Логика регистрации (Register)
   */
  async register(registerDto: RegisterDto) {
    const existingUser = await this.userService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new BadRequestException('Пользователь с таким email уже существует');
    }

    // Логика создания компании для Работодателя
    let companyId: number | undefined = undefined;
    if (registerDto.role === Role.EMPLOYER) {
      if (!registerDto.companyName) {
        throw new BadRequestException('Название компании обязательно для работодателя');
      }
      // TODO: Здесь должна быть логика поиска или создания компании
      // company = await this.companyService.findOrCreate(registerDto.companyName);
      // companyId = company.id;
      
      // Пока мы не создали CompanyService, этот код будет падать.
      // Временно закомментируем или упростим.
      console.warn('Логика создания компании еще не реализована в Auth.Service');
    }
    
    // Создаем пользователя
    const user = await this.userService.create({
      ...registerDto,
      // company: companyId ? { id: companyId } : undefined, // Передаем ID компании
    });

    // Убираем пароль из ответа
    const { password, ...result } = user;
    return result;
  }
}