import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('LLTCOURSETYPECLASS')
export class Lltcoursetypeclass {
  @PrimaryColumn({
    name: 'COSE_ID',
    type: 'int',
    comment: 'รหัสรายวิชา',
  })
  courseId: number;

  @PrimaryColumn({
    name: 'TYPECLASS_ID',
    type: 'tinyint',
    comment: 'รหัสประเภทกลุ่มเรียน',
  })
  typeclassId: number;

  @Column({
    name: 'COSETYPECLASS_AMOUNT',
    type: 'int',
    nullable: true,
    comment: 'ค่าธรรมเนียม (0=ฟรี)',
  })
  amount: number | null;

  @Column({
    name: 'COSETYPECLASS_REMARK',
    type: 'text',
    nullable: true,
    comment: 'หมายเหตุ',
  })
  remark: string | null;

  @Column({
    name: 'CREATEUSER',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'ชื่อผู้ใช้ที่สร้างข้อมูล',
  })
  createUser: string | null;

  @Column({
    name: 'CREATEDATE',
    type: 'datetime',
    nullable: true,
    comment: 'วัน-เวลาที่สร้างข้อมูล',
  })
  createDate: Date | null;

  @Column({
    name: 'UPDATEUSER',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'ชื่อผู้ใช้ที่แก้ไขข้อมูลล่าสุด',
  })
  updateUser: string | null;

  @Column({
    name: 'UPDATEDATE',
    type: 'datetime',
    nullable: true,
    comment: 'วัน-เวลาที่แก้ไขข้อมูลล่าสุด',
  })
  updateDate: Date | null;

  @Column({
    name: 'UPDATEPROG',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'โปรแกรมที่แก้ไขข้อมูลล่าสุด',
  })
  updateProg: string | null;
}
