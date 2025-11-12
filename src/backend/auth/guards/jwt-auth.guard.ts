import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Этот Guard автоматически запускает JWT Strategy (jwt.strategy.ts)
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}