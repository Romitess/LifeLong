import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('LLTCOURSESUBCHAPTER')
export class Lltcoursesubchapter {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'COSESUBCHAP_ID',
    comment: 'Auto ID',
  })
  id: number;

  @Column({
    name: 'COSECHAP_ID',
    type: 'int',
    comment: 'รหัสหัวข้อหลักในโครงสร้างหรือเนื้อหา / (LLTCOURSECHAPTER)',
  })
  chapterId: number;

  @Column({
    name: 'COSESUBCHAP_SUBJECT',
    type: 'varchar',
    length: 1000,
    nullable: true,
    comment: 'เนื้อหาและรายละเอียดของหัวข้อย่อย',
  })
  subject: string | null;

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

  @Column({ name: 'COSESUBCHAP_SEQ', type: 'tinyint', comment: 'ลำดับ', nullable: true })
  seq: number | null;
}
