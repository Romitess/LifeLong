import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('LLTCOURSECHAPTER')
export class Lltcoursechapter {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'COSECHAP_ID',
    comment: 'Auto ID',
  })
  id: number;

  @Column({
    name: 'COSE_ID',
    type: 'int',
    comment: 'รหัสรายวิชา /(LLTCOURSE)',
  })
  courseId: number;

  @Column({
    name: 'COSECHAP_SUBJECT',
    type: 'varchar',
    length: 1000,
    nullable: true,
    comment: 'เนื้อหาและรายละเอียด',
  })
  name: string | null;

  @Column({
    name: 'COSECHAP_HOUR',
    type: 'decimal',
    precision: 5,
    scale: 2,
    nullable: true,
    comment: 'จำนวนชั่วโมงการเรียนรู้',
  })
  hour: number | null;

  @Column({ name: 'CREATEUSER', type: 'varchar', length: 100, nullable: true })
  createUser: string | null;

  @Column({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date | null;

  @Column({ name: 'UPDATEUSER', type: 'varchar', length: 100, nullable: true })
  updateUser: string | null;

  @Column({ name: 'UPDATEDATE', type: 'datetime', nullable: true })
  updateDate: Date | null;

  @Column({ name: 'UPDATEPROG', type: 'varchar', length: 100, nullable: true })
  updateProgram: string | null;

  @Column({ name: 'COSECHAP_SEQ', type: 'tinyint', comment: 'ลำดับ', nullable: true })
  seq: number | null;
}
