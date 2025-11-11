import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../../domain/user/user.service';
import { User } from '../../../domain/user/entities/user.entity';
import { HybridCryptoService } from '../hybrid-crypto/hybrid-crypto.service';
import { SignInDto } from '../dtos/sign-in.dto';
import { SignUpDto } from '../dtos/sign-up.dto';
import { UserRole } from '../../../domain/user/enums/user-role.enum';
import { RegionalComplianceService } from '../../compliance/regional/regional-compliance.service';
import { PersonalDataMaskingService } from '../../compliance/data-masking.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UserService,
    private readonly cryptoService: HybridCryptoService,
    private readonly regionalCompliance: RegionalComplianceService,
    private readonly dataMasking: PersonalDataMaskingService,
  ) {}

  async validateUser(username: string, password: string): Promise<User> {
    const user = await this.userService.findByUsername(username);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Validate password with hybrid cryptography
    const isValid = await this.cryptoService.verifyPassword(
      password,
      user.passwordHash,
      user.salt,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid password');
    }

    // Check regional compliance restrictions
    await this.regionalCompliance.checkUserAccess(user);

    return this.dataMasking.maskPersonalData(user);
  }

  async signIn(signInDto: SignInDto) {
    const user = await this.validateUser(signInDto.username, signInDto.password);
    
    // Generate tokens with quantum-safe JWT
    const payload = {
      username: user.username,
      sub: user.id,
      role: user.role,
      region: user.region,
    };

    const accessToken = await this.cryptoService.signJwt(
      this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
      }),
      user.id,
    );

    const refreshToken = await this.cryptoService.signJwt(
      this.jwtService.sign(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRES_IN'),
      }),
      user.id,
    );

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      user: this.dataMasking.maskPersonalData(user),
    };
  }

  async signUp(signUpDto: SignUpDto) {
    // Regional compliance validation for new users
    await this.regionalCompliance.validateNewUser(signUpDto);

    // Mask sensitive personal data before storage
    const maskedDto = this.dataMasking.maskRegistrationData(signUpDto);

    // Generate password hash with hybrid cryptography
    const { passwordHash, salt } = await this.cryptoService.hashPassword(
      maskedDto.password,
    );

    const user = await this.userService.create({
      ...maskedDto,
      passwordHash,
      salt,
      role: UserRole.USER,
      complianceScore: 1.0,
    });

    return this.dataMasking.maskPersonalData(user);
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userService.findById(payload.sub);
      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const newPayload = {
        username: user.username,
        sub: user.id,
        role: user.role,
        region: user.region,
      };

      const newAccessToken = await this.cryptoService.signJwt(
        this.jwtService.sign(newPayload, {
          secret: this.configService.get<string>('JWT_SECRET'),
          expiresIn: this.configService.get<string>('JWT_EXPIRES_IN'),
        }),
        user.id,
      );

      return { access_token: newAccessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
