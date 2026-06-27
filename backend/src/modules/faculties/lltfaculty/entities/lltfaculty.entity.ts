import { Column, Entity, PrimaryColumn, OneToMany } from 'typeorm';
import { LltAuthUser } from '../../../auth/entities/llt-auth-user.entity';

@Entity('LLTFACULTY')
export class Lltfaculty {
  @PrimaryColumn({
    type: 'tinyint',
    name: 'FAC_ID',
    comment: 'รหัสคณะ/ส่วนงานฝั่งระบบทะเบียน',
  })
  id: number;

  @Column({
    name: 'FAC_NAME',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'ชื่อคณะ/ส่วนงาน',
  })
  name: string | null;

  @Column({
    name: 'FAC_NAMEEN',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'English name of the faculty',
  })
  nameEn: string | null;

  @Column({
    name: 'FAC_ID_PSN',
    type: 'varchar',
    length: 3,
    nullable: true,
    comment: 'รหัสคณะ/ส่วนงานฝั่งระบบบุคลากร',
  })
  facIdPsn: string | null;

  @Column({
    name: 'CAMPUS_ID',
    type: 'tinyint',
    nullable: true,
    comment: 'รหัสวิทยาเขต',
  })
  campusId: number | null;

  @Column({
    name: 'CAMPUS_NAME',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'ชื่อวิทยาเขต',
  })
  campusName: string | null;

  @Column({
    name: 'FAC_SEQ',
    type: 'tinyint',
    nullable: true,
    comment: 'ลำดับข้อมูล',
  })
  facSeq: number | null;

  @Column({
    name: 'FAC_ACTIVE',
    type: 'varchar',
    length: 1,
    nullable: true,
    comment: 'สถานะการเปิดใช้งาน ได้แก่ Y เปิด N ปิด',
  })
  facActive: string | null;

  @Column({
    name: 'FAC_TYPE',
    type: 'varchar',
    length: 1,
    nullable: true,
    comment: 'ประเภท ได้แก่ O ส่วนงาน F คณะ',
  })
  facType: string | null;

  @Column({
    name: 'COMPCODE',
    type: 'varchar',
    length: 5,
    nullable: true,
    comment: 'Com Code ของคณะ',
  })
  compCode: string | null;

  @Column({
    name: 'SUFFIX',
    type: 'varchar',
    length: 2,
    nullable: true,
    comment: 'Suffix ของคณะ',
  })
  suffix: string | null;

  @OneToMany(() => LltAuthUser, (user) => user.faculty, { lazy: true })
  users: LltAuthUser[] | null;
}
