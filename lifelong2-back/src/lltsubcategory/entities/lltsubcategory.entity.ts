import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('LLTSUBCATEGORY')
export class Lltsubcategory {
  @PrimaryGeneratedColumn({
    type: 'tinyint',
    name: 'SUBCATEGORY_ID',
    comment: 'Auto ID',
  })
  id: number;

  @Column({
    name: 'SUBCATEGORY_NAME',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'ชื่อหมู่ของรายวิชา/หลักสูตรระยะสั้น',
  })
  name: string | null;

  @Column({
    name: 'SUBCATEGORY_ACTIVE',
    type: 'varchar',
    length: 1,
    nullable: true,
    comment: 'Y=เปิด, N=ปิด',
  })
  activeFlag: string | null;

  @Column({
    name: 'CATEGORY_ID',
    type: 'tinyint',
    nullable: true,
    comment: 'FK',
  })
  categoryId: number | null;

  @Column({
    name: 'SUBCATEGORY_URL',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  url: string | null;

  @Column({ name: 'CREATEUSER', type: 'varchar', length: 100, nullable: true })
  createUser: string | null;

  @Column({ name: 'CREATEDATE', type: 'datetime', nullable: true })
  createDate: Date | null;

  @Column({ name: 'UPDATEUSER', type: 'varchar', length: 100, nullable: true })
  updateUser: string | null;

  @Column({ name: 'UPDATEDATE', type: 'datetime', nullable: true })
  updateDate: Date | null;

  @Column({ name: 'UPDATEPROG', type: 'varchar', length: 100, nullable: true })
  updateProgram: string | null;

  @Column({ name: 'LMS_ID', type: 'int', nullable: true })
  lmsId: number | null;

  @Column({ name: 'LMS_USER', type: 'varchar', length: 100, nullable: true })
  lmsUser: string | null;

  @Column({ name: 'LMS_DATE', type: 'datetime', nullable: true })
  lmsDate: Date | null;
}
