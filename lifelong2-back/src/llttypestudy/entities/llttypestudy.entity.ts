import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('LLTTYPESTUDY')
export class Llttypestudy {
  @PrimaryColumn({
    type: 'tinyint',
    name: 'TYPESTUDY_ID',
  })
  id: number;

  @Column({
    name: 'TYPESTUDY_NAME',
    type: 'varchar',
    length: 255,
    nullable: true,
    comment: 'Online, Onsite, Online & Onsite, Self-Paced Learning',
  })
  name: string | null;
}
