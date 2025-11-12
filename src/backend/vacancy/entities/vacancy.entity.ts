import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm';
import { Company } from '../../company/entities/company.entity'; // Предполагаем, что есть сущность Company
import { EmploymentType } from '../dto/create-vacancy.dto'; // Можем переиспользовать Enum

@Entity('vacancies') // Название таблицы в БД
export class Vacancy {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  description: string;

  @Column('simple-array', { nullable: true })
  skills: string[];

  @Column({ type: 'integer', nullable: true })
  salaryMin?: number;

  @Column({ type: 'integer', nullable: true })
  salaryMax?: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string;

  @Column({
    type: 'enum',
    enum: EmploymentType,
    default: EmploymentType.FULL_TIME,
  })
  employmentType: EmploymentType;

  // Связь: Много вакансий принадлежит одной компании
  @ManyToOne(() => Company, (company) => company.vacancies)
  company: Company;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}