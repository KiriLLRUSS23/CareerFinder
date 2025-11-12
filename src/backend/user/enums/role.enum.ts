/**
 * Определяет роли пользователей в системе.
 * Используется в RolesGuard и User.entity.
 */
export enum Role {
  // Соискатель (ищет работу)
  CANDIDATE = 'candidate',
  
  // Работодатель (публикует вакансии)
  EMPLOYER = 'employer',
  
  // Администратор (управляет системой)
  ADMIN = 'admin',
}