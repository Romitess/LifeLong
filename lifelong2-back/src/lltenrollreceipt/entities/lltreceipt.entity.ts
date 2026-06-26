import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Lltenrollreceipt } from './lltenrollreceipt.entity';
import { Lltexportreceiptlog } from './lltexportreceiptlog.entity';

@Entity('LLTRECEIPT')
export class Lltreceipt {
  @PrimaryGeneratedColumn({ name: 'RECEIPT_ID' })
  id: number;

  @Column({ name: 'ENROLLRECEIPT_ID', type: 'int', nullable: true })
  enrollReceiptId: number;

  @Column({ name: 'RECEIPT_FILENAME', type: 'varchar', length: 255, nullable: true })
  receiptFilename: string;

  @Column({ name: 'RECEIPT_TYPE', type: 'varchar', length: 1, nullable: true })
  receiptType: string;

  @Column({ name: 'RECEIPT_CREATE', type: 'varchar', length: 255, nullable: true })
  receiptCreate: string;

  @Column({ name: 'CREATEUSER', type: 'varchar', length: 100, nullable: true })
  createUser: string;

  @Column({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date;

  @Column({ name: 'UPDATEPROG', type: 'varchar', length: 100, nullable: true })
  updateProg: string;

  @ManyToOne(() => Lltenrollreceipt)
  @JoinColumn({ name: 'ENROLLRECEIPT_ID' })
  enrollReceipt: Lltenrollreceipt;

  @OneToMany(() => Lltexportreceiptlog, (log) => log.receipt)
  logs: Lltexportreceiptlog[];
}
