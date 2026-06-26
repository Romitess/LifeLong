import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('LLTTYPESTUDENT')
export class Llttypestudent {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'STUTYPE_ID',
    comment: 'Auto ID',
  })
  id: number;

  @Column({
    type: 'varchar',
    length: 255,
    name: 'STUTYPE_NAME',
    comment: 'ชื่อประเภทผู้เรียน',
    nullable: true,
  })
  name: string | null;

  @Column({
    type: 'varchar',
    name: 'STUTYPE_STATUS',
    comment: 'สถานะการใช้งาน ได้แก่ Y เปิด N ปิด',
    nullable: true,
  })
  status: string | null;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'CREATEUSER',
    comment: 'ชื่อผู้ใช้ที่สร้างข้อมูล',
    nullable: true,
  })
  createUser: string | null;

  @Column({
    type: 'datetime',
    name: 'CREATEDATE',
    comment: 'วัน-เวลาที่สร้างข้อมูล',
    nullable: true,
  })
  createDate: Date | null;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'UPDATEUSER',
    comment: 'ชื่อผู้ใช้ที่แก้ไขข้อมูล',
    nullable: true,
  })
  updateUser: string | null;

  @Column({
    type: 'datetime',
    name: 'UPDATEDATE',
    comment: 'วัน-เวลาที่แก้ไขข้อมูลล่าสุด',
    nullable: true,
  })
  updateDate: Date | null;

  @Column({
    type: 'varchar',
    length: 100,
    name: 'UPDATEPROG',
    comment: 'โปรแกรมที่แก้ไขข้อมูลล่าสุด',
    nullable: true,
  })
  updateProg: string | null;
}
