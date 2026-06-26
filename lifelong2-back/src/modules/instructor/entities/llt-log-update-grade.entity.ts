import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('LLTLOGUPDATEGRADE')
export class LltLogUpdateGrade {
  @PrimaryGeneratedColumn({ name: 'LOG_AUTOID' })
  id: number;

  @Column({ name: 'ENROLL_ID', type: 'int', nullable: true })
  enrollId: number | null;

  @Column({ name: 'GRADEI_ID_OLD', type: 'tinyint', nullable: true })
  gradeItemIdOld: number | null;

  @Column({ name: 'UPDATEUSER_OLD', type: 'varchar', length: 100, nullable: true })
  updateUserOld: string | null;

  @Column({ name: 'UPDATEDATE_OLD', type: 'datetime', nullable: true })
  updateDateOld: Date | null;

  @Column({ name: 'UPDATEPROG_OLD', type: 'varchar', length: 100, nullable: true })
  updateProgOld: string | null;

  @Column({ name: 'GRADEI_ID_NEW', type: 'tinyint', nullable: true })
  gradeItemIdNew: number | null;

  @Column({ name: 'UPDATEUSER_NEW', type: 'varchar', length: 100, nullable: true })
  updateUserNew: string | null;

  @Column({ name: 'UPDATEDATE_NEW', type: 'datetime', nullable: true })
  updateDateNew: Date | null;

  @Column({ name: 'UPDATEPROG_NEW', type: 'varchar', length: 100, nullable: true })
  updateProgNew: string | null;
}
