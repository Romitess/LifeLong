import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('LLTCOURSESKILL')
export class Lltcourseskill {
  @PrimaryGeneratedColumn({ name: 'COURSESKILL_ID' })
  id: number;

  @Column({ name: 'COSE_ID', type: 'int' })
  courseId: number;

  @Column({ name: 'SKILL_ID', type: 'int' })
  skillId: number;

  @Column({ name: 'SKILL_WEIGHT', type: 'decimal', precision: 5, scale: 2, default: 0 })
  skillWeight: number;

  @Column({ name: 'CREATEUSER', length: 100, nullable: true })
  createUser: string;

  @CreateDateColumn({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date;

  @Column({ name: 'UPDATEUSER', length: 100, nullable: true })
  updateUser: string;

  @UpdateDateColumn({ name: 'UPDATEDATE', type: 'datetime', nullable: true })
  updateDate: Date;
}
