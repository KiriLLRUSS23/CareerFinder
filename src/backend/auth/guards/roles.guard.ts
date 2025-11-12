import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '../../user/enums/role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    // 1. Получаем роли, необходимые для доступа (из декоратора @Roles)
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Если роли не указаны (@Roles), то доступ разрешен (контролируется только JwtAuthGuard)
    if (!requiredRoles) {
      return true;
    }

    // 2. Получаем объект user (из JwtStrategy)
    const { user } = context.switchToHttp().getRequest();

    // 3. Сравниваем роль пользователя с необходимыми ролями
    return requiredRoles.some((role) => user.role === role);
  }
}