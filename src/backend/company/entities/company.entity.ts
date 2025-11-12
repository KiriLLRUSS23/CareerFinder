import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Vacancy } from '../../vacancy/entities/vacancy.entity'; // Импортируем Vacancy

@Entity('companies') // Таблица 'companies'
export class Company {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  name: string; // Название компании

  @Column({ type: 'text', nullable: true })
  description?: string; // Описание

  @Column({ type: 'varchar', length: 255, nullable: true })
  website?: string; // Сайт компании

  @Column({ type: 'varchar', length: 255, nullable: true })
  location?: string; // Головной офис

  // Связь: У одной компании может быть много сотрудников (User с ролью EMPLOYER)
  @OneToMany(() => User, (user) => user.company)
  employees: User[];

  // Связь: У одной компании может быть много вакансий
  @OneToMany(() => Vacancy, (vacancy) => vacancy.company)
  vacancies: Vacancy[]; // Ссылка на сущность Vacancy

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}