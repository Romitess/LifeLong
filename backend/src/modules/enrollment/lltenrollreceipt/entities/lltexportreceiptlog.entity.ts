import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Lltreceipt } from './lltreceipt.entity';

@Entity('LLTEXPORTRECEIPTLOG')
export class Lltexportreceiptlog {
  @PrimaryGeneratedColumn({ name: 'RECEIPTLOG_ID' })
  id: number;

  @Column({ name: 'RECEIPT_ID', type: 'int', nullable: true })
  receiptId: number | null;

  @Column({ name: 'USER_ID', type: 'int', nullable: true })
  userId: number | null;

  @Column({ name: 'RECEIPT_IP', type: 'varchar', length: 255, nullable: true })
  receiptIp: string | null;

  @Column({ name: 'RECEIPT_DEVICE', type: 'varchar', length: 255, nullable: true })
  receiptDevice: string | null;

  @Column({ name: 'CREATEUSER', type: 'varchar', length: 100, nullable: true })
  createUser: string | null;

  @Column({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date | null;

  @Column({ name: 'CREATEPROG', type: 'varchar', length: 100, nullable: true })
  createProg: string | null;

  @ManyToOne(() => Lltreceipt, (receipt) => receipt.logs)
  @JoinColumn({ name: 'RECEIPT_ID' })
  receipt: Lltreceipt;
}
