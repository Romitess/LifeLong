import { Entity, PrimaryColumn, Column } from 'typeorm';

// Composite PK (USER_ID + STUTYPE_ID) — all writes use raw DataSource.query via ON DUPLICATE KEY UPDATE.
@Entity('LLTPRIVILEGE')
export class LltPrivilege {
  @PrimaryColumn({ name: 'USER_ID', type: 'int' })
  userId: number;

  @PrimaryColumn({ name: 'STUTYPE_ID', type: 'int' })
  stutypeId: number;

  @Column({ name: 'USER_CITIZEN', type: 'varchar', length: 13, nullable: true })
  userCitizen: string | null;

  @Column({ name: 'CREATEUSER', type: 'varchar', length: 100, nullable: true })
  createUser: string | null;

  @Column({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date | null;

  @Column({ name: 'UPDATEUSER', type: 'varchar', length: 100, nullable: true })
  updateUser: string | null;

  @Column({ name: 'UPDATEDATE', type: 'datetime', nullable: true })
  updateDate: Date | null;

  @Column({ name: 'UPDATEPROG', type: 'varchar', length: 100, nullable: true })
  updateProg: string | null;
}
