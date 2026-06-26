import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('LLTANNOUNCEMENT')
export class Lltannouncement {
  @PrimaryGeneratedColumn({ name: 'ANNC_ID' })
  id: number;

  @Column({ name: 'COSE_ID' })
  courseId: number;

  @Column({ name: 'ANNC_TITLE', length: 255 })
  title: string;

  @Column({ name: 'ANNC_CONTENT', type: 'text' })
  content: string;

  @Column({ name: 'CREATEUSER', length: 100, nullable: true })
  createUser: string;

  @CreateDateColumn({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date;

  @Column({ name: 'UPDATEUSER', type: 'varchar', length: 100, nullable: true })
  updateUser: string | null;

  @UpdateDateColumn({ name: 'UPDATEDATE', type: 'datetime', nullable: true })
  updateDate: Date | null;
}
