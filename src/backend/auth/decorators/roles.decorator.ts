import { SetMetadata } from '@nestjs/common';
import { Role } from '../../user/enums/role.enum';

export const ROLES_KEY = 'roles';
/**
 * Декоратор @Roles(Role.ADMIN, Role.EMPLOYER)
 * Прикрепляет массив ролей к метаданным эндпоинта.
 */
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);