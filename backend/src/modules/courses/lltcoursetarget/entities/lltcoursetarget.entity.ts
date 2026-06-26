import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('LLTCOURSETARGET')
export class Lltcoursetarget {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'COSETARGET_ID',
    comment: 'Auto ID',
  })
  id: number;

  @Column({
    name: 'COSE_ID',
    type: 'int',
    nullable: true,
    comment: 'รหัสรายวิชา',
  })
  courseId: number | null;

  @Column({
    name: 'TARGET_ID',
    type: 'tinyint',
    nullable: true,
    comment: 'รหัสกลุ่มเป้าหมาย',
  })
  targetId: number | null;

  @Column({
    name: 'SUBTARGET_ID',
    type: 'tinyint',
    nullable: true,
    comment: 'รหัสกลุ่มเป้าหมายย่อย / (LLTSUBTARGET)',
  })
  subtargetId: number | null;

  @Column({
    name: 'COSETARGET_SEQ',
    type: 'tinyint',
    nullable: true,
    comment: 'ลำดับความสำคัญของกลุ่มเป้าหมาย',
  })
  sequence: number | null;

  @Column({
    name: 'COSETARGET_OTHER',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'อื่น ระบุ',
  })
  other: string | null;

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
