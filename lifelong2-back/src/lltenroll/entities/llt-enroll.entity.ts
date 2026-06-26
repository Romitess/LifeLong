import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('LLTENROLL')
export class LltEnroll {
  @PrimaryGeneratedColumn({ name: 'ENROLL_ID' })
  id: number;

  @Column({ name: 'OPENCLASS_ID', nullable: true })
  openclassId: number;

  @Column({ name: 'COSE_ID', nullable: true })
  courseId: number;

  @Column({ name: 'USER_ID', nullable: true })
  userId: number;

  @Column({ name: 'ENROLL_DATE', type: 'date', nullable: true })
  enrollDate: Date;

  @Column({ name: 'ENROLL_AMOUNT', nullable: true, default: 0 })
  amount: number;

  @Column({ name: 'ENROLL_BALANCE', nullable: true, default: 0 })
  balance: number;

  @Column({ name: 'ENROLL_PAYSTATUS', length: 1, nullable: true })
  payStatus: string;

  @Column({ name: 'ENROLL_STATUS', length: 1, nullable: true })
  status: string;

  @Column({ name: 'ENROLL_CITIZEN', type: 'varchar', length: 20, nullable: true })
  citizen: string | null;

  @Column({ name: 'ENROLL_NAMERECEIPT', type: 'varchar', length: 255, nullable: true })
  nameReceipt: string | null;

  @Column({ name: 'ENROLL_ADDRESS', type: 'varchar', length: 1000, nullable: true })
  address: string | null;

  @Column({ name: 'ENROLL_TELEPHONE', type: 'varchar', length: 50, nullable: true })
  telephone: string | null;

  @Column({ name: 'GRADEI_ID', type: 'int', nullable: true })
  gradeItemId: number | null;

  @Column({ name: 'LMS_FINALSCORE', type: 'decimal', precision: 10, scale: 5, nullable: true })
  lmsFinalscore: number | null;

  @Column({ name: 'LMS_UPDATEUSER', type: 'varchar', length: 100, nullable: true })
  lmsUpdateUser: string | null;

  @Column({ name: 'LMS_UPDATEDATE', type: 'datetime', nullable: true })
  lmsUpdateDate: Date | null;

  @Column({ name: 'ENROLL_APPROVEGRADE', type: 'varchar', length: 1, nullable: true })
  approveGrade: string | null;

  @Column({ name: 'ENROLL_APPROVEGRADE_DETAIL', type: 'varchar', length: 1000, nullable: true })
  approveGradeDetail: string | null;

  @Column({ name: 'UPDATEDATEGRADE', type: 'datetime', nullable: true })
  updateDateGrade: Date | null;

  @Column({ name: 'CREATEUSER', length: 100, nullable: true })
  createUser: string;

  @CreateDateColumn({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date;

  @Column({ name: 'UPDATEUSER', type: 'varchar', length: 100, nullable: true })
  updateUser: string | null;

  @Column({ name: 'UPDATEDATE', type: 'datetime', nullable: true })
  updateDate: Date | null;

  @Column({ name: 'UPDATEPROG', type: 'varchar', length: 100, nullable: true })
  updateProg: string | null;
}
