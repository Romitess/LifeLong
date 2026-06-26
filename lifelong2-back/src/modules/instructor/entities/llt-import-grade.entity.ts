import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('LLTIMPORTGRADE')
export class LltImportGrade {
  @PrimaryGeneratedColumn({ name: 'IMPORTG_ID' })
  id: number;

  @Column({ name: 'OPENCLASS_ID', type: 'int', nullable: true })
  openclassId: number | null;

  @Column({ name: 'USER_ID', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'USER_CODE', type: 'varchar', length: 8, nullable: true })
  userCode: string | null;

  @Column({ name: 'GRADE', type: 'varchar', length: 3, nullable: true })
  grade: string | null;

  @Column({ name: 'GRADEI_ID', type: 'tinyint', nullable: true })
  gradeItemId: number | null;
}
