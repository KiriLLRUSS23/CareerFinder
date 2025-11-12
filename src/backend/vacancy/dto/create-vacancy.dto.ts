import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  Min,
  IsArray,
  ArrayMinSize,
} from 'class-validator';

// Определим типы занятости
export enum EmploymentType {
  FULL_TIME = 'full_time',
  PART_TIME = 'part_time',
  CONTRACT = 'contract',
  FREELANCE = 'freelance',
  INTERNSHIP = 'internship',
}

export class CreateVacancyDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(1)
  @IsOptional()
  skills: string[]; // Массив ключевых навыков

  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMin?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  salaryMax?: number;

  @IsString()
  @IsOptional()
  location?: string; // Например, "Москва, Россия"

  @IsEnum(EmploymentType)
  @IsNotEmpty()
  employmentType: EmploymentType;
  
  // ID компании, которая публикует вакансию
  // Мы получим его не из DTO, а из аутентифицированного пользователя
  // companyId: number; 
}