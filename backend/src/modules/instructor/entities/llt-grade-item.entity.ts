import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('LLTGRADEITEM')
export class LltGradeItem {
  @PrimaryGeneratedColumn({ name: 'GRADEI_ID' })
  id: number;

  @Column({ name: 'GRADEM_ID', type: 'int', nullable: true })
  gradeModeId: number | null;

  @Column({ name: 'GRADEI_NAME', type: 'varchar', length: 10, nullable: true })
  name: string | null;

  @Column({ name: 'GRADEI_PASS', type: 'varchar', length: 1, nullable: true })
  isPass: string | null;
}
