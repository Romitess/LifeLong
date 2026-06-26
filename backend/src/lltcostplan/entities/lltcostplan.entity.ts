import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('LLTCOSTPLAN')
export class Lltcostplan {
  @PrimaryGeneratedColumn({
    type: 'int',
    name: 'COSTPLAN_ID',
    comment: 'รหัสอ้างอิงตารางผังแหล่งเงิน (Auto ID)',
  })
  id: number;

  @Column({
    name: 'FAC_ID',
    type: 'tinyint',
    nullable: true,
    comment: 'รหัสคณะ/ส่วนงานที่รับผิดชอบ / (LLTFACULTY)',
  })
  facId: number | null;

  @Column({
    name: 'COSTPLAN_CODE',
    type: 'varchar',
    length: 10,
    nullable: true,
    comment: 'รหัสผังแหล่งเงิน',
  })
  costplanCode: string | null;

  @Column({
    name: 'COSTPLAN_NAME',
    type: 'varchar',
    length: 200,
    nullable: true,
    comment: 'ชื่อผังแหล่งเงิน',
  })
  costplanName: string | null;

  @Column({
    name: 'COSTPLAN_STATUS',
    type: 'varchar',
    length: 1,
    nullable: true,
    comment: 'สถานะการใช้งาน ได้แก่ Y เปิด N ปิด',
  })
  costplanStatus: string | null;

  @Column({
    name: 'CREATEUSER',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'ชื่อผู้ใช้ที่สร้างข้อมูล',
  })
  createUser: string | null;

  @Column({
    name: 'CREATEDATE',
    type: 'datetime',
    nullable: true,
    comment: 'วัน-เวลาที่สร้างข้อมูล',
  })
  createDate: Date | null;

  @Column({
    name: 'UPDATEUSER',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'ชื่อผู้ใช้ที่แก้ไขข้อมูลล่าสุด',
  })
  updateUser: string | null;

  @Column({
    name: 'UPDATEDATE',
    type: 'datetime',
    nullable: true,
    comment: 'วัน-เวลาที่แก้ไขข้อมูลล่าสุด',
  })
  updateDate: Date | null;

  @Column({
    name: 'UPDATEPROG',
    type: 'varchar',
    length: 100,
    nullable: true,
    comment: 'โปรแกรมที่แก้ไขข้อมูลล่าสุด',
  })
  updateProgram: string | null;
}
