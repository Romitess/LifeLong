import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('LLTSUBTARGET')
export class Lltsubtarget {
  @PrimaryColumn({
    type: 'tinyint',
    name: 'SUBTARGET_ID',
    comment: 'รหัสกลุ่มเป้าหมายย่อย',
  })
  id: number;

  @Column({
    name: 'TARGET_ID',
    type: 'tinyint',
    nullable: true,
    comment: 'รหัสกลุ่มเป้าหมาย',
  })
  targetId: number | null;

  @Column({
    name: 'SUBTARGET_NAME',
    type: 'varchar',
    length: 50,
    nullable: true,
    comment: 'ชื่อกลุ่มเป้าหมายย่อย',
  })
  name: string | null;

  @Column({
    name: 'SUBTARGET_OTHER',
    type: 'varchar',
    length: 1,
    nullable: true,
    comment: 'อื่นๆ ได้แก่ Y ให้ระบุข้อมูลเพิ่มเติมได้',
  })
  other: string | null;

  @Column({
    name: 'SUBTARGET_SEQ',
    type: 'tinyint',
    nullable: true,
    comment: 'ลำดับ',
  })
  sequence: number | null;
}
