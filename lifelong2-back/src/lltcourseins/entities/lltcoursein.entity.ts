import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('LLTCOURSEINS')
export class Lltcoursein {
  @PrimaryGeneratedColumn({ name: 'COSEINS_ID', comment: 'Auto ID' })
  id: number;

  @Column({ name: 'COSE_ID', nullable: true })
  courseId: number;

  @Column({ name: 'PSN_ID', length: 10, nullable: true })
  psnId: string;

  @Column({ name: 'FAC_ID_PSN', length: 2, nullable: true })
  facIdPsn: string;

  @Column({ name: 'COSEINS_EMAIL', length: 100, nullable: true })
  email: string;

  @Column({ name: 'COSEINS_ADMIN', length: 1, nullable: true, comment: 'Y=ผู้รับผิดชอบรายวิชา' })
  isAdmin: string;

  @Column({ name: 'COSEINS_TEACHER', length: 1, nullable: true, comment: 'Y=ผู้สอน' })
  isTeacher: string;

  @Column({ name: 'COSEINS_EDUCATION', type: 'text', nullable: true })
  education: string;

  @Column({ name: 'CREATEUSER', length: 100, nullable: true })
  createUser: string;

  @Column({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date;

  @Column({ name: 'UPDATEUSER', length: 100, nullable: true })
  updateUser: string;

  @Column({ name: 'UPDATEDATE', type: 'datetime', nullable: true })
  updateDate: Date;
}
