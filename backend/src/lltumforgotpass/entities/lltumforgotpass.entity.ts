import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('LLTUMFORGOTPASS')
export class Lltumforgotpass {
  @PrimaryGeneratedColumn({ type: 'int', name: 'FGP_ID', comment: 'Auto ID' })
  id: number;

  @Column({ type: 'varchar', length: 150, name: 'FGP_EMAIL', comment: 'อีเมลของผู้ใช้' })
  email: string;

  @Column({ type: 'datetime', name: 'FGP_STARTDATE', comment: 'วันเวลาที่แจ้ง' })
  startDate: Date;

  @Column({
    type: 'datetime',
    name: 'FGP_ENDDATE',
    nullable: true,
    comment: 'วันเวลาที่เปลี่ยนรหัสผ่าน',
  })
  endDate: Date | null;

  @Column({
    type: 'varchar',
    length: 1,
    name: 'FGP_STATUS',
    comment: 'สถานะของความสำเร็จ ได้เเก่ Y ใส่รหัสผ่านใหม่สำเร็จ',
  })
  status: string;

  @Column({
    type: 'varchar',
    length: 50,
    name: 'FGP_KEY',
    comment: 'รหัสสำหรับยืนยันการเปลี่ยนรหัสผ่าน',
  })
  key: string;

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
  updateProgram: string | null;
}
