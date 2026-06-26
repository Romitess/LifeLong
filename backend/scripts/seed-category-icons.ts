import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { loadEnv } from '../src/config/env-loader';

loadEnv();

const ds = new DataSource({
  type: 'mysql',
  host: process.env.DB_HOST ?? 'localhost',
  port: Number(process.env.DB_PORT ?? 3306),
  username: process.env.DB_USER ?? 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME ?? 'lifelong2',
});

const ICON_COLOR_MAP: Record<string, { icon: string; color: string }> = {
  ภาษาและการสื่อสาร:        { icon: 'translate',         color: '#2196F3' },
  คอมพิวเตอร์และเทคโนโลยี:  { icon: 'computer',          color: '#00A6A6' },
  การศึกษาและการฝึกอบรม:    { icon: 'school',             color: '#3F51B5' },
  ทักษะชีวิตและการพัฒนาตนเอง: { icon: 'self_improvement', color: '#8BC34A' },
  คณิตศาสตร์และวิทยาศาสตร์: { icon: 'functions',          color: '#673AB7' },
  สุขภาพและการแพทย์:         { icon: 'health_and_safety', color: '#E91E63' },
  อาหารและโภชนาการ:          { icon: 'restaurant',        color: '#F97316' },
  วิศวกรรมและสถาปัตยกรรม:   { icon: 'engineering',       color: '#FF9800' },
  'สังคม การเมืองการปกครอง': { icon: 'public',            color: '#0F766E' },
  ธุรกิจและการบริหารจัดการ:  { icon: 'business_center',   color: '#2563EB' },
  เกษตรและสิ่งแวดล้อม:       { icon: 'eco',               color: '#16A34A' },
  ศิลปวัฒนธรรมและศาสนา:     { icon: 'palette',           color: '#F5A623' },

  // DB names that differ from mock
  หมวดหมู่ทั่วไป:            { icon: 'category',          color: '#6B7280' },
  ธุรกิจและการจัดการ:        { icon: 'business_center',   color: '#2563EB' },
  ศิลปะและการออกแบบ:         { icon: 'palette',           color: '#F5A623' },
  กฎหมายและสังคมศาสตร์:      { icon: 'gavel',             color: '#64748B' },
  'Agriculture, forestry, fisheries and veterinary (เกษตรศาสตร์ วนศาสตร์ การประมงและสัตวแพทย์)':
                               { icon: 'agriculture',       color: '#15803D' },
};

async function main() {
  await ds.initialize();
  console.log('Connected to DB');

  const rows = await ds.query<{ CATEGORY_ID: number; CATEGORY_NAME: string }[]>(
    'SELECT CATEGORY_ID, CATEGORY_NAME FROM LLTCATEGORY',
  );

  let updated = 0;
  let skipped = 0;

  for (const row of rows) {
    const name = row.CATEGORY_NAME?.trim() ?? '';
    const mapping = ICON_COLOR_MAP[name];

    if (!mapping) {
      console.log(`  [skip] no mapping for: "${name}"`);
      skipped++;
      continue;
    }

    await ds.query(
      'UPDATE LLTCATEGORY SET CATEGORY_ICON = ?, CATEGORY_COLOR = ? WHERE CATEGORY_ID = ?',
      [mapping.icon, mapping.color, row.CATEGORY_ID],
    );
    console.log(`  [ok]   id=${row.CATEGORY_ID} "${name}" → icon=${mapping.icon} color=${mapping.color}`);
    updated++;
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
  await ds.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
