import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('LLTUMUSER')
export class LltumUser {
  @PrimaryGeneratedColumn({ name: 'USER_ID' })
  id: number;

  @Column({ name: 'USER_FNAMETH', type: 'varchar', length: 50, nullable: true })
  firstNameTh: string | null;

  @Column({ name: 'USER_LNAMETH', type: 'varchar', length: 50, nullable: true })
  lastNameTh: string | null;

  @Column({ name: 'USER_FNAMEEN', type: 'varchar', length: 50, nullable: true })
  firstNameEn: string | null;

  @Column({ name: 'USER_LNAMEEN', type: 'varchar', length: 50, nullable: true })
  lastNameEn: string | null;

  @Column({ name: 'USER_TEL', type: 'varchar', length: 30, nullable: true })
  tel: string | null;

  @Column({ name: 'USER_USERNAME', type: 'varchar', length: 150, nullable: true })
  username: string | null;

  @Column({ name: 'USER_EMAIL', type: 'varchar', length: 150, nullable: true })
  email: string | null;

  @Column({ name: 'USER_PASSWORD', type: 'varchar', length: 300, nullable: true })
  password: string | null;

  @Column({ name: 'USER_STATUS', type: 'varchar', length: 1, nullable: true })
  status: string | null;

  @Column({ name: 'CREATEUSER', type: 'varchar', length: 100, nullable: true })
  createUser: string | null;

  @CreateDateColumn({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date;

  @Column({ name: 'LMS_ID', type: 'int', nullable: true })
  lmsId: number | null;

  @Column({ name: 'STUDENTCODE', type: 'varchar', length: 10, nullable: true })
  studentCode: string | null;

  @Column({ name: 'USER_CODE', type: 'varchar', length: 8, nullable: true })
  userCode: string | null;

  @Column({ name: 'USER_CITIZEN_ID', type: 'varchar', length: 13, nullable: true, unique: true })
  userCitizenId: string | null;

  @Column({ name: 'USER_IMAGE_URL', type: 'varchar', length: 2048, nullable: true })
  imageUrl: string | null;
}
