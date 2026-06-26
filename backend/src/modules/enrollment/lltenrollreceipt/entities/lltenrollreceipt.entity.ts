import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Lltreceipt } from './lltreceipt.entity';

@Entity('LLTENROLLRECEIPT')
export class Lltenrollreceipt {
  @PrimaryGeneratedColumn({ name: 'ENROLLRECEIPT_ID' })
  id: number;

  @Column({ name: 'ENROLL_ID', type: 'int', nullable: true })
  enrollId: number | null;

  @Column({ name: 'ENROLL_CODE', type: 'varchar', length: 7, nullable: true })
  enrollCode: string | null;

  @Column({ name: 'USER_ID', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'USER_FNAMETH', type: 'varchar', length: 50, nullable: true })
  userFnameTh: string | null;

  @Column({ name: 'USER_LNAMETH', type: 'varchar', length: 50, nullable: true })
  userLnameTh: string | null;

  @Column({ name: 'OPENCLASS_ID', type: 'int', nullable: true })
  openclassId: number | null;

  @Column({ name: 'OPENCLASS_GEN', type: 'varchar', length: 100, nullable: true })
  openclassGen: string | null;

  @Column({ name: 'OPENCLASS_GROUP', type: 'varchar', length: 100, nullable: true })
  openclassGroup: string | null;

  @Column({ name: 'COSE_ID', type: 'int', nullable: true })
  coseId: number | null;

  @Column({ name: 'COSE_CODE', type: 'varchar', length: 9, nullable: true })
  coseCode: string | null;

  @Column({ name: 'COSE_NAMETH', type: 'varchar', length: 255, nullable: true })
  coseNameTh: string | null;

  @Column({ name: 'COSE_NAMEEN', type: 'varchar', length: 255, nullable: true })
  coseNameEn: string | null;

  @Column({ name: 'FAC_ID', type: 'tinyint', nullable: true })
  facId: number | null;

  @Column({ name: 'FAC_NAME', type: 'varchar', length: 255, nullable: true })
  facName: string | null;

  @Column({ name: 'AMOUNT', type: 'int', nullable: true })
  amount: number | null;

  @Column({ name: 'PAYDATE', type: 'date', nullable: true })
  payDate: string | null;

  @Column({ name: 'PAYTIME', type: 'time', nullable: true })
  payTime: string | null;

  @Column({ name: 'BANK_NAME', type: 'varchar', length: 50, nullable: true })
  bankName: string | null;

  @Column({ name: 'TRANS_CODE', type: 'varchar', length: 10, nullable: true })
  transCode: string | null;

  @Column({ name: 'EFFECTIVE_DATE', type: 'date', nullable: true })
  effectiveDate: Date | null;

  @Column({ name: 'BUDYEAR', type: 'varchar', length: 4, nullable: true })
  budYear: string | null;

  @Column({ name: 'RECEIPT_NO', type: 'bigint', nullable: true })
  receiptNo: number | null;

  @Column({ name: 'RECEIPT_NAME', type: 'varchar', length: 100, nullable: true })
  receiptName: string | null;

  @Column({ name: 'RECEIPT_STATUS', type: 'varchar', length: 1, default: 'Y', nullable: true })
  receiptStatus: string | null;

  @Column({ name: 'CASHIER_NAME', type: 'varchar', length: 255, nullable: true })
  cashierName: string | null;

  @Column({ name: 'BOOKNO', type: 'varchar', length: 4, nullable: true })
  bookNo: string | null;

  @Column({ name: 'RUNNO', type: 'int', nullable: true })
  runNo: number | null;

  @Column({ name: 'RECEIPT_ID_REAL', type: 'int', nullable: true })
  receiptIdReal: number | null;

  @Column({ name: 'RECEIPT_ID_COPY', type: 'int', nullable: true })
  receiptIdCopy: number | null;

  @Column({ name: 'PAY_COMPANYACCOUNT', type: 'varchar', length: 20, nullable: true })
  payCompanyAccount: string | null;

  @Column({ name: 'PAY_COMPANYNAME', type: 'varchar', length: 255, nullable: true })
  payCompanyName: string | null;

  @Column({ name: 'PAY_SERVICECODE', type: 'varchar', length: 10, nullable: true })
  payServiceCode: string | null;

  @Column({ name: 'RECEIPT_CANCLEDATE', type: 'datetime', nullable: true })
  receiptCancleDate: Date | null;

  @Column({ name: 'RECEIPT_CANCLEUSER_ID', type: 'int', nullable: true })
  receiptCancleUserId: number | null;

  @Column({ name: 'RECEIPT_CANCLEUSER_NAME', type: 'varchar', length: 255, nullable: true })
  receiptCancleUserName: string | null;

  @Column({ name: 'RECEIPT_CANCLEREMARK', type: 'varchar', length: 500, nullable: true })
  receiptCancleRemark: string | null;

  @Column({ name: 'RECEIPT_CANCLERECEIPTNEW', type: 'bigint', nullable: true })
  receiptCancleReceiptNew: number | null;

  @Column({ name: 'CREATEUSER', type: 'varchar', length: 100, nullable: true })
  createUser: string | null;

  @Column({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date | null;

  @Column({ name: 'UPDATEUSER', type: 'varchar', length: 100, nullable: true })
  updateUser: string | null;

  @Column({ name: 'UPDATEDATE', type: 'datetime', nullable: true })
  updateDate: Date | null;

  @Column({ name: 'UPDATEPROG', type: 'varchar', length: 100, nullable: true })
  updateProg: string | null;

  @ManyToOne(() => Lltreceipt)
  @JoinColumn({ name: 'RECEIPT_ID_REAL' })
  realReceipt: Lltreceipt | null;

  @ManyToOne(() => Lltreceipt)
  @JoinColumn({ name: 'RECEIPT_ID_COPY' })
  copyReceipt: Lltreceipt | null;
}
