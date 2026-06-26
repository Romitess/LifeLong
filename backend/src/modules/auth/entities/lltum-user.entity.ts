import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('LLTUMUSER')
export class LltumUser {
  @PrimaryGeneratedColumn({ name: 'USER_ID' })
  id: number;

  @Column({ name: 'USER_FNAMETH', length: 50, nullable: true })
  firstNameTh: string;

  @Column({ name: 'USER_LNAMETH', length: 50, nullable: true })
  lastNameTh: string;

  @Column({ name: 'USER_FNAMEEN', length: 50, nullable: true })
  firstNameEn: string;

  @Column({ name: 'USER_LNAMEEN', length: 50, nullable: true })
  lastNameEn: string;

  @Column({ name: 'USER_TEL', length: 30, nullable: true })
  tel: string;

  @Column({ name: 'USER_USERNAME', length: 150, nullable: true })
  username: string;

  @Column({ name: 'USER_EMAIL', length: 150, nullable: true })
  email: string;

  @Column({ name: 'USER_PASSWORD', length: 300, nullable: true })
  password: string;

  @Column({ name: 'USER_STATUS', length: 1, nullable: true })
  status: string;

  @Column({ name: 'CREATEUSER', length: 100, nullable: true })
  createUser: string;

  @CreateDateColumn({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date;

  @Column({ name: 'LMS_ID', nullable: true })
  lmsId: number;

  @Column({ name: 'STUDENTCODE', type: 'varchar', length: 10, nullable: true })
  studentCode: string | null;

  @Column({ name: 'USER_CODE', type: 'varchar', length: 8, nullable: true })
  userCode: string | null;

  @Column({ name: 'USER_CITIZEN_ID', type: 'varchar', length: 13, nullable: true, unique: true })
  userCitizenId: string | null;
}
