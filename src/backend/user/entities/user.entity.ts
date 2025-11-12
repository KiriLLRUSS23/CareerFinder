import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  BeforeInsert,
  OneToMany,
} from 'typeorm';
import { Role } from '../enums/role.enum';
import { Company } from '../../company/entities/company.entity';
// import { Resume } from '../../resume/entities/resume.entity'; // Раскомментировать, когда будет Resume
import * as bcrypt from 'bcrypt';

@Entity('users') // Таблица 'users' в PostgreSQL
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255, select: false }) // 'select: false' - не возвращать пароль по умолчанию
  password: string;

  @Column({ type: 'varchar', length: 100 })
  firstName: string;

  @Column({ type: 'varchar', length: 100 })
  lastName: string;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.CANDIDATE, // По умолчанию все - соискатели
  })
  role: Role;

  @Column({ type: 'boolean', default: false })
  isVerified: boolean; // Подтвержден ли email

  // Связь: Многие пользователи (работодатели) могут быть в одной компании
  @ManyToOne(() => Company, (company) => company.employees, { nullable: true })
  company: Company;

  /*
  // Связь: Один соискатель (CANDIDATE) может иметь много резюме
  @OneToMany(() => Resume, (resume) => resume.user)
  resumes: Resume[];
  */

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Хук TypeORM для хеширования пароля перед сохранением
  @BeforeInsert()
  async hashPassword() {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // Метод для проверки пароля (будет использоваться в AuthService)
  async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }
}