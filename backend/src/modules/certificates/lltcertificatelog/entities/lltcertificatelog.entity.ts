import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('LLTCERTIFICATELOG')
export class Lltcertificatelog {
  @PrimaryGeneratedColumn({ type: 'int', name: 'CLID', comment: 'Auto ID' })
  id: number;

  @Column({ type: 'int', name: 'USER_ID', comment: 'รหัสผู้ใช้งาน / (LLTUMUSER)' })
  userId: number;

  @Column({ type: 'varchar', name: 'CLIP', length: 255, comment: 'หมายเลข IP Address' })
  clip: string;

  @Column({ type: 'varchar', name: 'CLDEVICE', length: 255, comment: 'อุปกรณ์ที่ใช้' })
  device: string;

  @Column({ name: 'CREATEUSER', type: 'varchar', length: 100, nullable: true })
  createUser: string | null;

  @Column({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date | null;
}
