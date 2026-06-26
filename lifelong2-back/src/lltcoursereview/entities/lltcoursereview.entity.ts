import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('LLTCOURSEREVIEW')
export class Lltcoursereview {
  @PrimaryGeneratedColumn({ name: 'REVIEW_ID' })
  id: number;

  @Column({ name: 'COSE_ID', type: 'int' })
  courseId: number;

  @Column({ name: 'USER_ID', type: 'int' })
  userId: number;

  @Column({ name: 'ENROLL_ID', type: 'int', nullable: true })
  enrollId: number | null;

  @Column({ name: 'REVIEW_RATING', type: 'tinyint' })
  rating: number;

  @Column({ name: 'REVIEW_COMMENT', type: 'varchar', length: 1000, nullable: true })
  comment: string | null;

  @Column({ name: 'REVIEW_STATUS', type: 'enum', enum: ['A', 'P', 'H'], default: 'A' })
  status: string;

  @Column({ name: 'CREATEUSER', type: 'varchar', length: 100, nullable: true })
  createUser: string | null;

  @Column({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date | null;

  @Column({ name: 'UPDATEUSER', type: 'varchar', length: 100, nullable: true })
  updateUser: string | null;

  @Column({ name: 'UPDATEDATE', type: 'datetime', nullable: true })
  updateDate: Date | null;
}
