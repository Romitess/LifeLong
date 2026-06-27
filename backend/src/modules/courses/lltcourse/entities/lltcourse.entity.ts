import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { DB_FIELD_LENGTHS } from '../../../../common/constants';

@Entity('LLTCOURSE')
export class Lltcourse {
  @PrimaryGeneratedColumn({ name: 'COSE_ID', comment: 'Auto ID' })
  id: number;

  @Column({ name: 'COSE_CODE', length: 9, nullable: true, comment: 'CYYFFXNNN' })
  code: string;

  @Column({ name: 'COSE_NAMETH', length: DB_FIELD_LENGTHS.NAME, nullable: true })
  titleTh: string;

  @Column({ name: 'COSE_NAMEEN', length: 255, nullable: true })
  titleEn: string;

  @Column({ name: 'FAC_ID', type: 'tinyint', nullable: true })
  facultyId: number;

  @Column({ name: 'TYPECOSE_ID', type: 'tinyint', nullable: true })
  typeCourseId: number;

  @Column({ name: 'TYPESTUDY_ID', type: 'tinyint', nullable: true })
  typestudyId: number;

  @Column({ name: 'COSE_HOUR', type: 'int', nullable: true })
  hours: number;

  @Column({ name: 'COSE_THEORYHOUR', type: 'int', nullable: true })
  theoryHour: number;

  @Column({ name: 'COSE_ACTIONHOUR', type: 'int', nullable: true })
  actionHour: number;

  @Column({ name: 'COSE_CREDITBANK', type: 'decimal', precision: 5, scale: 2, nullable: true })
  creditBank: number;

  @Column({ name: 'COSE_STARTDATE', type: 'date', nullable: true })
  startDate: Date;

  @Column({ name: 'COSE_ENDDATE', type: 'date', nullable: true })
  endDate: Date;

  @Column({ name: 'COSE_YEAR', length: 4, nullable: true })
  year: string;

  @Column({ name: 'CATEGORY_ID', type: 'tinyint', nullable: true })
  categoryId: number;

  @Column({ name: 'SUBCATEGORY_ID', type: 'tinyint', nullable: true })
  subcategoryId: number;

  @Column({ name: 'EVA_ID', type: 'tinyint', nullable: true })
  evaId: number | null;

  @Column({ name: 'COSE_OBJECTIVE', type: 'text', nullable: true })
  objective: string;

  @Column({ name: 'COSE_DESCRIPTION', type: 'text', nullable: true })
  description: string;

  @Column({ name: 'COSE_LO', type: 'text', nullable: true })
  lo: string;

  @Column({ name: 'COSE_COMPETENCY', type: 'text', nullable: true })
  competency: string;

  @Column({ name: 'COSE_EVALUATION', type: 'text', nullable: true })
  evaluation: string;

  @Column({ name: 'COSE_CERTIFICATE', length: 1, nullable: true, comment: 'Y=มี, N=ไม่มี' })
  certificate: string;

  @Column({ name: 'COSE_CERTIFICATENAME', length: 255, nullable: true })
  certificateName: string;

  @Column({ name: 'COSE_PRECONDITION', type: 'text', nullable: true })
  precondition: string;

  @Column({ name: 'COSE_PROPERTY', type: 'text', nullable: true })
  property: string;

  @Column({ name: 'COSE_PRIVILEGE', type: 'text', nullable: true })
  privilege: string;

  @Column({ name: 'COSE_KEYWORD', length: 400, nullable: true })
  keyword: string;

  @Column({ name: 'COSE_REMARKCHAPTER', type: 'text', nullable: true })
  remarkChapter: string;

  @Column({ name: 'COSE_CONTRACTNAME', length: 100, nullable: true })
  contractName: string;

  @Column({ name: 'COSE_CONTRACTTEL', length: 30, nullable: true })
  contractTel: string;

  @Column({ name: 'COSE_CONTRACTEMAIL', length: 100, nullable: true })
  contractEmail: string;

  @Column({ name: 'COSE_CONTRACTURL', length: 255, nullable: true })
  contractUrl: string;

  @Column({ name: 'COSE_STATUS', length: 1, nullable: true, comment: 'Y=เปิด, N=ปิด' })
  status: string;

  @Column({ name: 'COSE_IMAGE_URL', type: 'varchar', length: 2048, nullable: true })
  imageUrl: string | null;

  @Column({ name: 'COSE_IMAGE_CROP', type: 'varchar', length: 512, nullable: true })
  imageCrop: string | null;

  @Column({ name: 'CREATEUSER', length: 100, nullable: true })
  createUser: string;

  @CreateDateColumn({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date;

  @Column({ name: 'UPDATEUSER', length: 100, nullable: true })
  updateUser: string;

  @UpdateDateColumn({ name: 'UPDATEDATE', type: 'datetime', nullable: true })
  updateDate: Date;
}
