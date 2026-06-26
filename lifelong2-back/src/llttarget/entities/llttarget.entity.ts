import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('LLTTARGET')
export class Llttarget {
  @PrimaryColumn({
    type: 'tinyint',
    name: 'TARGET_ID',
    comment: 'รหัสกลุ่มเป้าหมาย',
  })
  id: number;

  @Column({
    name: 'TARGET_NAME',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'ชื่อกลุ่มเป้าหมาย',
  })
  name: string | null;

  @Column({
    name: 'TARGET_SEQ',
    type: 'tinyint',
    nullable: true,
    comment: 'ลำดับ',
  })
  sequence: number | null;

  @Column({
    name: 'TARGET_OTHER',
    type: 'varchar',
    length: 1,
    nullable: true,
    comment: 'อื่นๆ ได้แก่ Y ให้ระบุข้อมูลเพิ่มเติมได้',
  })
  other: string | null;
}
