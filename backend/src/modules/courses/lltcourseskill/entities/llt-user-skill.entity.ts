import { Entity, Column, PrimaryColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';

@Entity('LLTUSER_SKILL')
export class LltUserSkill {
  @PrimaryColumn({ name: 'USER_ID', type: 'int' })
  userId: number;

  @PrimaryColumn({ name: 'SKILL_ID', type: 'int' })
  skillId: number;

  @Column({ name: 'SKILL_SCORE', type: 'decimal', precision: 10, scale: 2, default: 0 })
  skillScore: number;

  @Column({ name: 'CREATEUSER', length: 100, nullable: true })
  createUser: string;

  @CreateDateColumn({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date;

  @Column({ name: 'UPDATEUSER', length: 100, nullable: true })
  updateUser: string;

  @UpdateDateColumn({ name: 'UPDATEDATE', type: 'datetime', nullable: true })
  updateDate: Date;
}
