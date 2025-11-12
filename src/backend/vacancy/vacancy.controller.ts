import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { VacancyService } from './vacancy.service';
import { CreateVacancyDto } from './dto/create-vacancy.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'; // 1. Наш главный Guard
import { RolesGuard } from '../auth/guards/roles.guard';     // 2. Guard для проверки ролей
import { Roles } from '../auth/decorators/roles.decorator';   // 3. Декоратор для указания ролей
import { Role } from '../user/enums/role.enum';               // 4. Enum с ролями (USER, EMPLOYER, ADMIN)

@Controller('vacancies')
export class VacancyController {
  constructor(private readonly vacancyService: VacancyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard) // Сначала проверяем JWT, потом проверяем роли
  @Roles(Role.EMPLOYER) // Доступ к этому эндпоинту есть ТОЛЬКО у работодателя
  create(
    @Body() createVacancyDto: CreateVacancyDto,
    @Request() req, // Получаем данные пользователя из запроса (которые добавил JwtAuthGuard)
  ) {
    // req.user будет содержать payload из JWT, например { userId: 1, role: 'employer', companyId: 42 }
    const companyId = req.user.companyId; 
    
    // Передаем DTO и ID компании в сервис
    return this.vacancyService.create(createVacancyDto, companyId);
  }

  // ... тут будут другие методы (GET, PATCH, DELETE)
}