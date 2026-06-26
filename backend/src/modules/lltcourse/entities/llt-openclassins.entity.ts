import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity('LLTOPENCLASSINS')
export class LltOpenclassIns {
  @PrimaryColumn({ name: 'OPENCLASS_ID' })
  openclassId: number;

  @PrimaryColumn({ name: 'COSEINS_ID' })
  courseinId: number;

  @Column({ name: 'CREATEUSER', length: 100, nullable: true })
  createUser: string;

  @Column({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date;
}
