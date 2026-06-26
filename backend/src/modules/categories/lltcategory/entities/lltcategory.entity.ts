import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('LLTCATEGORY')
export class Lltcategory {
  @PrimaryGeneratedColumn({
    type: 'tinyint',
    name: 'CATEGORY_ID',
    comment: 'Auto ID',
  })
  id: number;

  @Column({
    name: 'CATEGORY_NAME',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'ชื่อหมวดของรายวิชา/หลักสูตรระยะสั้น',
  })
  name: string | null;

  @Column({
    name: 'CATEGORY_NAME_EN',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'English name of the category',
  })
  nameEn: string | null;

  @Column({
    name: 'CATEGORY_ACTIVE',
    type: 'varchar',
    length: 1,
    nullable: true,
    comment: 'Y=เปิด, N=ปิด',
  })
  activeFlag: string | null;

  @Column({
    name: 'CATEGORY_URL',
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  url: string | null;

  @Column({
    name: 'CATEGORY_ICON',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'Material icon name',
  })
  icon: string | null;

  @Column({
    name: 'CATEGORY_COLOR',
    type: 'varchar',
    length: 7,
    nullable: true,
    comment: 'Hex color e.g. #F5A623',
  })
  color: string | null;

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
