import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('LLTOPENCLASSCLICK')
export class LltOpenclassClick {
  @PrimaryGeneratedColumn({ name: 'CLICK_ID' })
  id: number;

  @Column({ name: 'OPENCLASS_ID', nullable: true })
  openclassId: number;

  @Column({ name: 'CREATEUSER', type: 'varchar', length: 100, nullable: true })
  createUser: string | null;

  @Column({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date | null;
}
