import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('LLTOPENCLASS')
export class Lltopenclass {
  @PrimaryGeneratedColumn({
    name: 'OPENCLASS_ID',
    comment: 'รหัสอ้างอิงตารางรายวิชาที่เปิดสอน (Auto ID)',
  })
  id: number;

  @Column({ name: 'COSE_ID', type: 'int', nullable: true, comment: 'รหัสรายวิชา (LLTCOURSE)' })
  courseId: number | null;

  @Column({
    name: 'OPENCLASS_PUBLIC',
    type: 'varchar',
    length: 1,
    nullable: true,
    comment: 'Y=เผยแพร่',
  })
  isPublic: string | null;

  @Column({
    name: 'OPENCLASS_REGSTARTDATE',
    type: 'date',
    nullable: true,
    comment: 'วันที่เปิดลงทะเบียน',
  })
  regStartDate: Date | null;

  @Column({
    name: 'OPENCLASS_REGENDDATE',
    type: 'date',
    nullable: true,
    comment: 'วันที่ปิดลงทะเบียน',
  })
  regEndDate: Date | null;

  @Column({
    name: 'OPENCLASS_PAYSTARTDATE',
    type: 'date',
    nullable: true,
    comment: 'วันที่เปิดให้ชำระเงิน',
  })
  payStartDate: Date | null;

  @Column({
    name: 'OPENCLASS_PAYENDDATE',
    type: 'date',
    nullable: true,
    comment: 'วันที่ปิดให้ชำระเงิน',
  })
  payEndDate: Date | null;

  @Column({
    name: 'OPENCLASS_CLASSSTARTDATE',
    type: 'date',
    nullable: true,
    comment: 'วันที่เริ่มต้นการเรียนการสอน',
  })
  classStartDate: Date | null;

  @Column({
    name: 'OPENCLASS_CLASSENDDATE',
    type: 'date',
    nullable: true,
    comment: 'วันที่สิ้นสุดการเรียนการสอน',
  })
  classEndDate: Date | null;

  @Column({ name: 'OPENCLASS_NUMOPEN', type: 'int', nullable: true, comment: 'จำนวนรับ' })
  numOpen: number | null;

  @Column({ name: 'GRADEM_ID', type: 'tinyint', nullable: true, comment: 'รหัสรูปแบบผลการเรียน' })
  grademId: number | null;

  @Column({
    name: 'TYPECLASS_ID',
    type: 'tinyint',
    nullable: true,
    comment: 'รหัสจัดการเรียนการสอน (LLTTYPECLASS)',
  })
  typeclassId: number | null;

  @Column({
    name: 'OPENCLASS_AMOUNT',
    type: 'int',
    nullable: true,
    comment: 'ค่าธรรมเนียม ถ้าฟรีให้ใส่ 0',
  })
  amount: number | null;

  @Column({ name: 'OPENCLASS_GEN', type: 'varchar', length: 100, nullable: true, comment: 'รุ่น' })
  gen: string | null;

  @Column({
    name: 'OPENCLASS_GROUP',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'กลุ่ม',
  })
  group: string | null;

  @Column({
    name: 'OPENCLASS_NOTICE',
    type: 'varchar',
    length: 1,
    nullable: true,
    comment: 'Y=แนะนำ',
  })
  notice: string | null;

  @Column({
    name: 'OPENCLASS_VDO',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'ลิ้งก์วีดีโอแนะนำรายวิชา',
  })
  vdo: string | null;

  @Column({
    name: 'OPENCLASS_CONTRACTNAME',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'ชื่อ-สกุลผู้ติดต่อ คนที่ 1',
  })
  contractName: string | null;

  @Column({
    name: 'OPENCLASS_CONTRACTTEL',
    type: 'varchar',
    length: 30,
    nullable: true,
    comment: 'เบอร์โทรศัพท์ผู้ติดต่อ คนที่ 1',
  })
  contractTel: string | null;

  @Column({
    name: 'OPENCLASS_CONTRACTEMAIL',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'อีเมลผู้ติดต่อ คนที่ 1',
  })
  contractEmail: string | null;

  @Column({
    name: 'OPENCLASS_CONTRACTURL',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'เว็บไซต์ผู้ติดต่อ คนที่ 1',
  })
  contractUrl: string | null;

  @Column({
    name: 'OPENCLASS_CONTRACTNAME2',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'ชื่อ-สกุลผู้ติดต่อ คนที่ 2',
  })
  contractName2: string | null;

  @Column({
    name: 'OPENCLASS_CONTRACTTEL2',
    type: 'varchar',
    length: 30,
    nullable: true,
    comment: 'เบอร์โทรศัพท์ผู้ติดต่อ คนที่ 2',
  })
  contractTel2: string | null;

  @Column({
    name: 'OPENCLASS_CONTRACTEMAIL2',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'อีเมลผู้ติดต่อ คนที่ 2',
  })
  contractEmail2: string | null;

  @Column({
    name: 'OPENCLASS_CONTRACTURL2',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'เว็บไซต์ผู้ติดต่อ คนที่ 2',
  })
  contractUrl2: string | null;

  @Column({
    name: 'OPENCLASS_TEACHTIME',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'ตารางเรียน',
  })
  teachTime: string | null;

  @Column({
    name: 'OPENCLASS_MOOC_URL',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'URL รายวิชาในระบบ MOOC',
  })
  moocUrl: string | null;

  @Column({
    name: 'OPENCLASS_GRADE_STATUS',
    type: 'varchar',
    length: 1,
    nullable: true,
    comment: 'Y=อนุมัติผลการเรียน, NULL=ยังไม่อนุมัติ',
  })
  gradeStatus: string | null;

  @Column({
    name: 'OPENCLASS_GRADE_APPROVE',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'ข้อมูลประกอบการอนุมัติผลการเรียน',
  })
  gradeApprove: string | null;

  @Column({
    name: 'COSTPLAN_ID',
    type: 'int',
    nullable: true,
    comment: 'รหัสตารางผังแหล่งเงิน (LLTCOSTPLAN)',
  })
  costplanId: number | null;

  @Column({
    name: 'LMS_STATUS',
    type: 'varchar',
    length: 1,
    nullable: true,
    comment: 'Y=ส่งแล้ว, N=ยังไม่ได้ส่ง',
  })
  lmsStatus: string | null;

  @Column({ name: 'LMS_ID', type: 'int', nullable: true, comment: 'รหัสอ้างอิงรายวิชาในระบบ LMS' })
  lmsId: number | null;

  @Column({
    name: 'LMS_USER',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'ชื่อผู้ใช้ที่ส่งข้อมูลเข้า LMS',
  })
  lmsUser: string | null;

  @Column({
    name: 'LMS_DATE',
    type: 'datetime',
    nullable: true,
    comment: 'วันที่ส่งข้อมูลเข้า LMS',
  })
  lmsDate: Date | null;

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
}
