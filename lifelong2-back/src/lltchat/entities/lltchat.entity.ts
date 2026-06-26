import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('LLTCHAT')
export class Lltchat {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'CHAT_ID',
    comment: 'Auto ID',
  })
  id: number;

  @Column({
    name: 'ENROLL_ID',
    type: 'int',
    nullable: true,
    comment: 'รหัสการลงทะเบียน/(LLTENROLL)',
  })
  enrollId: number | null;

  @Column({
    name: 'CHAT_SENDER',
    type: 'int',
    nullable: true,
    comment: 'รหัสของผู้ส่งข้อความ/(PSNTPERSON,LLTUMUSER)',
  })
  sender: number | null;

  @Column({
    name: 'CHAT_PSNID',
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: 'รหัสผู้สอน/(PSNTPERSON)',
  })
  psnId: string | null;

  @Column({
    name: 'CHAT_USERID',
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: 'รหัสผู้เรียน/(LLTUMUSER)',
  })
  userId: string | null;

  @Column({
    name: 'CHAT_MESSAGE',
    type: 'varchar',
    length: 500,
    nullable: true,
    comment: 'ข้อความ',
  })
  message: string | null;

  @Column({
    name: 'CHAT_TIME',
    type: 'datetime',
    nullable: true,
    comment: 'เวลาส่งข้อความ',
  })
  chatTime: Date | null;

  @Column({
    name: 'CHAT_STATUS',
    type: 'varchar',
    length: 1,
    nullable: true,
    comment: 'สถานะการอ่านข้อความ',
  })
  status: string | null;

  @Column({
    name: 'CHAT_TYPESENDER',
    type: 'varchar',
    length: 1,
    nullable: true,
    comment: 'ผู้ส่งข้อความ U=ผู้เรียน, T=ผู้สอน',
  })
  typeSender: string | null;

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
