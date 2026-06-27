import { MigrationInterface, QueryRunner } from 'typeorm';

const FACULTY_EN_NAMES: { name: string; nameEn: string }[] = [
  { name: 'คณะวิทยาศาสตร์', nameEn: 'Faculty of Science' },
  { name: 'คณะศิลปกรรมศาสตร์', nameEn: 'Faculty of Fine and Applied Arts' },
  { name: 'คณะวิศวกรรมศาสตร์', nameEn: 'Faculty of Engineering' },
  { name: 'คณะมนุษยศาสตร์และสังคมศาสตร์', nameEn: 'Faculty of Humanities and Social Sciences' },
  { name: 'สำนักคอมพิวเตอร์', nameEn: 'Computer Center' },
  { name: 'คณะวิทยาศาสตร์การกีฬา', nameEn: 'Faculty of Sports Science' },
  { name: 'คณะวิทยาการสารสนเทศ', nameEn: 'Faculty of Informatics' },
  { name: 'คณะพยาบาลศาสตร์', nameEn: 'Faculty of Nursing' },
  { name: 'คณะบริหารธุรกิจ', nameEn: 'Faculty of Business Administration' },
];

export class SeedFacNameEnInLltfaculty1749900000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    for (const faculty of FACULTY_EN_NAMES) {
      await queryRunner.query(
        `UPDATE LLTFACULTY SET FAC_NAMEEN = ? WHERE FAC_NAME = ? AND FAC_NAMEEN IS NULL`,
        [faculty.nameEn, faculty.name],
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`UPDATE LLTFACULTY SET FAC_NAMEEN = NULL`);
  }
}
