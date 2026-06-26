import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('LLTSKILL')
export class LltSkill {
  @PrimaryGeneratedColumn({ name: 'SKILL_ID' })
  id: number;

  @Column({ name: 'SKILL_NAME', length: 100 })
  name: string;
}
