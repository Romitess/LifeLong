import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('LLTNOTIFICATION')
export class Lltnotification {
  @PrimaryGeneratedColumn({ name: 'NOTIF_ID' })
  id: number;

  @Column({ name: 'USER_ID' })
  userId: number;

  @Column({ name: 'NOTIF_TYPE', length: 50, default: 'announcement' })
  type: string;

  @Column({ name: 'NOTIF_TITLE', length: 255 })
  title: string;

  @Column({ name: 'NOTIF_MESSAGE', type: 'text' })
  message: string;

  @Column({ name: 'REF_ID', type: 'int', nullable: true })
  refId: number | null;

  @Column({ name: 'REF_TYPE', type: 'varchar', length: 50, nullable: true })
  refType: string | null;

  @Column({ name: 'IS_READ', type: 'tinyint', default: 0 })
  isRead: boolean;

  @CreateDateColumn({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date;
}
