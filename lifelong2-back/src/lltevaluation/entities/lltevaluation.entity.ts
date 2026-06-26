import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('LLTEVALUATION')
export class Lltevaluation {
  @PrimaryColumn({
    type: 'tinyint',
    name: 'EVA_ID',
  })
  id: number;
  @Column({
    name: 'EVA_NAME',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'ชื่อการประเมินผล',
  })
  name: string | null;
  @Column({
    name: 'EVA_OTHER',
    type: 'varchar',
    length: 1,
    nullable: true,
    comment: 'สถานะเป็นอื่นๆ ได้เเก่ Y/N',
  })
  other: string | null;
}
