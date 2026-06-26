import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Lltfaculty } from '../../faculties/lltfaculty/entities/lltfaculty.entity';
import { Role } from '../enums/role.enum';

@Entity('LLT_AUTH_USERS')
export class LltAuthUser {
  @PrimaryGeneratedColumn({ name: 'USER_ID' })
  id: number;

  @Column({ name: 'USERNAME', length: 100, unique: true })
  username: string;

  @Column({ name: 'EMAIL', length: 150, unique: true })
  email: string;

  @Column({ name: 'PASSWORD', length: 255 })
  password: string;

  @Column({ name: 'ROLE', length: 50, comment: 'Admin, Instructor, Student' })
  role: Role;

  @Column({
    name: 'FAC_ID',
    type: 'tinyint',
    nullable: true,
    comment: 'รหัสคณะ/ส่วนงาน',
  })
  facId: number | null;

  @Column({ name: 'CREATEUSER', length: 100, nullable: true })
  createUser: string;

  @CreateDateColumn({ name: 'CREATEDATE', type: 'datetime' })
  createDate: Date;

  @Column({ name: 'UPDATEUSER', length: 100, nullable: true })
  updateUser: string;

  @UpdateDateColumn({ name: 'UPDATEDATE', type: 'datetime' })
  updateDate: Date;

  @ManyToOne(() => Lltfaculty, { nullable: true })
  @JoinColumn({ name: 'FAC_ID' })
  faculty: Lltfaculty | null;
}
