import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('LLTUMTLOG')
export class LltUmtlog {
  @PrimaryGeneratedColumn({ name: 'ULID' })
  ulid: number;

  @Column({ name: 'ULUSID', length: 11, nullable: true })
  ulusid: string;

  @Column({ name: 'ULLOGINTIME', type: 'datetime', nullable: true })
  ullogintime: Date;

  @Column({ name: 'ULTOTIME', length: 10, nullable: true })
  ultotime: string;

  @Column({ name: 'ULIP', length: 100, nullable: true })
  ulip: string;

  @Column({ name: 'ULCMD', length: 200, nullable: true })
  ulcmd: string;

  @Column({ name: 'ULLOGOUTTIME', type: 'datetime', nullable: true })
  ullogouttime: Date;

  @Column({ name: 'ULUSLOGIN', length: 200, nullable: true })
  uluslogin: string;

  @Column({ name: 'ULTYPE', length: 1, nullable: true })
  ultype: string;
}
