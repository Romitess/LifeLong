import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('LLTOPENCLASS')
export class LltOpenclass {
  @PrimaryGeneratedColumn({ name: 'OPENCLASS_ID' })
  id: number;

  @Column({ name: 'COSE_ID', nullable: true })
  courseId: number;

  @Column({ name: 'OPENCLASS_PUBLIC', length: 1, nullable: true, comment: 'Y=เผยแพร่' })
  isPublic: string;

  @Column({ name: 'OPENCLASS_REGSTARTDATE', type: 'date', nullable: true })
  regStartDate: Date | null;

  @Column({ name: 'OPENCLASS_REGENDDATE', type: 'date', nullable: true })
  regEndDate: Date | null;

  @Column({ name: 'OPENCLASS_PAYSTARTDATE', type: 'date', nullable: true })
  payStartDate: Date | null;

  @Column({ name: 'OPENCLASS_PAYENDDATE', type: 'date', nullable: true })
  payEndDate: Date | null;

  @Column({ name: 'OPENCLASS_CLASSSTARTDATE', type: 'date', nullable: true })
  classStartDate: Date | null;

  @Column({ name: 'OPENCLASS_CLASSENDDATE', type: 'date', nullable: true })
  classEndDate: Date | null;

  @Column({ name: 'OPENCLASS_NUMOPEN', nullable: true })
  numOpen: number;

  @Column({ name: 'GRADEM_ID', type: 'tinyint', nullable: true })
  grademId: number;

  @Column({ name: 'TYPECLASS_ID', type: 'tinyint', nullable: true })
  typeclassId: number;

  @Column({ name: 'OPENCLASS_AMOUNT', nullable: true, comment: '0=ฟรี' })
  amount: number;

  @Column({ name: 'OPENCLASS_GEN', length: 100, nullable: true })
  gen: string;

  @Column({ name: 'OPENCLASS_GROUP', length: 100, nullable: true })
  group: string;

  @Column({ name: 'OPENCLASS_NOTICE', length: 1, nullable: true, comment: 'Y=แนะนำ' })
  notice: string;

  @Column({ name: 'OPENCLASS_VDO', length: 255, nullable: true })
  vdo: string;

  @Column({ name: 'OPENCLASS_CONTRACTNAME', length: 100, nullable: true })
  contractName: string;

  @Column({ name: 'OPENCLASS_CONTRACTTEL', length: 30, nullable: true })
  contractTel: string;

  @Column({ name: 'OPENCLASS_CONTRACTEMAIL', length: 100, nullable: true })
  contractEmail: string;

  @Column({ name: 'OPENCLASS_CONTRACTURL', length: 255, nullable: true })
  contractUrl: string;

  @Column({ name: 'OPENCLASS_CONTRACTNAME2', length: 100, nullable: true })
  contractName2: string;

  @Column({ name: 'OPENCLASS_CONTRACTTEL2', length: 30, nullable: true })
  contractTel2: string;

  @Column({ name: 'OPENCLASS_CONTRACTEMAIL2', length: 100, nullable: true })
  contractEmail2: string;

  @Column({ name: 'OPENCLASS_CONTRACTURL2', length: 255, nullable: true })
  contractUrl2: string;

  @Column({ name: 'OPENCLASS_TEACHTIME', length: 255, nullable: true })
  teachTime: string;

  @Column({ name: 'LMS_STATUS', length: 1, nullable: true, comment: 'Y=ส่งแล้ว, N=ยังไม่ส่ง' })
  lmsStatus: string;

  @Column({ name: 'LMS_ID', nullable: true })
  lmsId: number;

  @Column({ name: 'LMS_USER', length: 100, nullable: true })
  lmsUser: string;

  @Column({ name: 'LMS_DATE', type: 'datetime', nullable: true })
  lmsDate: Date;
}
