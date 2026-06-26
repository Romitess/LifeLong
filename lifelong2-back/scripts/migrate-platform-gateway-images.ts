import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { copyFile, mkdir, readFile, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { basename, extname, join } from 'node:path';
import { tmpdir } from 'node:os';
import { randomUUID } from 'node:crypto';
import { AppModule } from '../src/app.module';
import { PlatformGatewayService } from '../src/modules/platform-gateway/platform-gateway.service';
import { assertBufferMagic } from '../src/common/utils/file-magic.validator';

type ImageCategory = 'system' | 'course' | 'cert-template' | 'cert-signer';

interface MigrationItem {
  label: string;
  category: ImageCategory;
  table: string;
  idColumn: string;
  id: number | string;
  source: string | null;
  updateSql: string;
  updateParams: (uploaded: { fileName: string; path: string; url: string }) => unknown[];
}

const apply = process.argv.includes('--apply');
// Optional scope filter, e.g. --only=course or --only=course,system.
// When omitted, every category is migrated.
const onlyArg = process.argv.find((arg) => arg.startsWith('--only='));
const onlyCategories = onlyArg
  ? new Set(
      onlyArg
        .slice('--only='.length)
        .split(',')
        .map((value) => value.trim())
        .filter(Boolean),
    )
  : null;
const excludedSourceFragments = [
  'uploads/cert-signers/1779086036249-650742920_122102711439146307_1902246139277062488_n.jpg',
];

async function main(): Promise<void> {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ['warn', 'error'] });
  const dataSource = app.get(DataSource);
  const platformGateway = app.get(PlatformGatewayService);
  const uploadCache = new Map<string, { fileName: string; path: string; url: string }>();

  try {
    const allItems = await collectItems(dataSource);
    const items = onlyCategories
      ? allItems.filter((item) => onlyCategories.has(item.category))
      : allItems;
    const planned = await Promise.all(
      items.map(async (item) => {
        const localPath = resolveLocalPath(item.source);
        return {
          item,
          localPath,
          isAllowedImage:
            localPath && existsSync(localPath) ? await isAllowedImageFile(localPath) : false,
        };
      }),
    );
    const alreadyGateway = planned.filter(({ item }) => item.source && isGatewayUrl(item.source));
    const externalSources = planned.filter(({ item }) => {
      if (!item.source || isGatewayUrl(item.source)) return false;
      return isExternalUrl(item.source);
    });
    const missingLocal = planned.filter(({ item, localPath }) => {
      if (!item.source || isGatewayUrl(item.source)) return false;
      if (isExternalUrl(item.source)) return false;
      if (isExcludedSource(item.source)) return false;
      return !localPath || !existsSync(localPath);
    });
    const nonImages = planned.filter(({ item, localPath, isAllowedImage }) => {
      if (!item.source || isGatewayUrl(item.source)) return false;
      if (isExternalUrl(item.source)) return false;
      if (isExcludedSource(item.source)) return false;
      if (!localPath || !existsSync(localPath)) return false;
      return !isAllowedImage;
    });
    const excluded = planned.filter(({ item }) => {
      if (!item.source || isGatewayUrl(item.source)) return false;
      return isExcludedSource(item.source);
    });
    const pending = planned.filter(({ item, localPath, isAllowedImage }) => {
      if (!item.source || isGatewayUrl(item.source)) return false;
      if (isExternalUrl(item.source)) return false;
      if (isExcludedSource(item.source)) return false;
      if (!localPath || !existsSync(localPath)) return false;
      if (!isAllowedImage) return false;
      return true;
    });

    console.log(
      JSON.stringify(
        {
          mode: apply ? 'apply' : 'dry-run',
          scope: onlyCategories ? [...onlyCategories] : 'all',
          totalCandidates: items.length,
          alreadyGateway: alreadyGateway.length,
          externalSources: externalSources.length,
          localFilesFound: pending.length,
          missingLocal: missingLocal.length,
          nonImages: nonImages.length,
          excluded: excluded.length,
        },
        null,
        2,
      ),
    );

    for (const { item, localPath } of pending) {
      if (!localPath) continue;
      if (!apply) {
        console.log(`[dry-run] ${item.label} ${item.id}: ${item.source} -> ${localPath}`);
        continue;
      }

      let uploaded = uploadCache.get(localPath);
      if (!uploaded) {
        const tempPath = await copyToTemp(localPath);
        const fileStat = await stat(localPath);
        uploaded = await platformGateway.uploadByCategory(item.category, {
          path: tempPath,
          filename: basename(localPath),
          originalname: basename(localPath),
          mimetype: guessMimeType(localPath),
          size: fileStat.size,
        } as Express.Multer.File);
        uploadCache.set(localPath, uploaded);
      }

      await dataSource.query(item.updateSql, item.updateParams(uploaded));
      console.log(`[migrated] ${item.label} ${item.id}: ${item.source} -> ${uploaded.url}`);
    }

    if (!apply) {
      for (const { item } of alreadyGateway) {
        console.log(`[skip:gateway] ${item.label} ${item.id}: ${item.source}`);
      }
      for (const { item } of externalSources) {
        console.log(`[skip:external] ${item.label} ${item.id}: ${item.source}`);
      }
      for (const { item, localPath } of missingLocal) {
        console.log(
          `[skip:missing-local] ${item.label} ${item.id}: ${item.source} -> ${localPath}`,
        );
      }
      for (const { item, localPath } of nonImages) {
        console.log(`[skip:non-image] ${item.label} ${item.id}: ${item.source} -> ${localPath}`);
      }
      for (const { item } of excluded) {
        console.log(`[skip:excluded] ${item.label} ${item.id}: ${item.source}`);
      }
    }
  } finally {
    await app.close();
  }
}

async function collectItems(dataSource: DataSource): Promise<MigrationItem[]> {
  const items: MigrationItem[] = [];

  const slides = await dataSource.query<
    { id: number | string; imageUrl: string | null; imagePath: string | null }[]
  >(
    `SELECT SLIDE_ID AS id, SLIDE_URL AS imageUrl, SLIDE_PATH AS imagePath
     FROM LLTSLIDESHOW
     WHERE SLIDE_STATUS = 'Y'
       AND (SLIDE_URL IS NOT NULL OR SLIDE_PATH IS NOT NULL)`,
  );
  for (const row of slides) {
    items.push({
      label: 'LLTSLIDESHOW',
      category: 'system',
      table: 'LLTSLIDESHOW',
      idColumn: 'SLIDE_ID',
      id: row.id,
      source: row.imageUrl || row.imagePath,
      updateSql:
        'UPDATE LLTSLIDESHOW SET SLIDE_FILENAME = ?, SLIDE_PATH = ?, SLIDE_URL = ?, UPDATEDATE = NOW(), UPDATEPROG = ? WHERE SLIDE_ID = ?',
      updateParams: (uploaded) => [
        uploaded.fileName,
        uploaded.path.replace(/^\//, ''),
        uploaded.url,
        'MIGRATE_PLATFORM_GATEWAY',
        row.id,
      ],
    });
  }

  const courses = await dataSource.query<{ id: number | string; imageUrl: string | null }[]>(
    `SELECT COSE_ID AS id, COSE_IMAGE_URL AS imageUrl
     FROM LLTCOURSE
     WHERE COSE_STATUS = 'Y'
       AND COSE_IMAGE_URL IS NOT NULL`,
  );
  for (const row of courses) {
    items.push({
      label: 'LLTCOURSE',
      category: 'course',
      table: 'LLTCOURSE',
      idColumn: 'COSE_ID',
      id: row.id,
      source: row.imageUrl,
      updateSql:
        'UPDATE LLTCOURSE SET COSE_IMAGE_URL = ?, UPDATEDATE = NOW(), UPDATEPROG = ? WHERE COSE_ID = ?',
      updateParams: (uploaded) => [uploaded.url, 'MIGRATE_PLATFORM_GATEWAY', row.id],
    });
  }

  const templates = await dataSource.query<
    { id: number | string; path: string | null; url: string | null }[]
  >(
    `SELECT TEMP_ID AS id, TEMP_PATH AS path, TEMP_URL AS url
     FROM LLTTEMPLATECERTIFICATE
     WHERE TEMP_STATUS = 'Y'
       AND (TEMP_PATH IS NOT NULL OR TEMP_URL IS NOT NULL)`,
  );
  for (const row of templates) {
    items.push({
      label: 'LLTTEMPLATECERTIFICATE',
      category: 'cert-template',
      table: 'LLTTEMPLATECERTIFICATE',
      idColumn: 'TEMP_ID',
      id: row.id,
      source: row.url || row.path,
      updateSql:
        'UPDATE LLTTEMPLATECERTIFICATE SET TEMP_FILENAME = ?, TEMP_PATH = ?, TEMP_URL = ?, UPDATEDATE = NOW(), UPDATEPROG = ? WHERE TEMP_ID = ?',
      updateParams: (uploaded) => [
        uploaded.fileName,
        uploaded.path,
        uploaded.url,
        'MIGRATE_PLATFORM_GATEWAY',
        row.id,
      ],
    });
  }

  const signers = await dataSource.query<
    { id: number | string; path: string | null; url: string | null }[]
  >(
    `SELECT SIGN_ID AS id, SIGN_PATH AS path, SIGN_URL AS url
     FROM LLTSIGNCERTIFICATE
     WHERE SIGN_STATUS = 'Y'
       AND (SIGN_PATH IS NOT NULL OR SIGN_URL IS NOT NULL)`,
  );
  for (const row of signers) {
    items.push({
      label: 'LLTSIGNCERTIFICATE',
      category: 'cert-signer',
      table: 'LLTSIGNCERTIFICATE',
      idColumn: 'SIGN_ID',
      id: row.id,
      source: row.url || row.path,
      updateSql:
        'UPDATE LLTSIGNCERTIFICATE SET SIGN_FILENAME = ?, SIGN_PATH = ?, SIGN_URL = ?, UPDATEDATE = NOW(), UPDATEPROG = ? WHERE SIGN_ID = ?',
      updateParams: (uploaded) => [
        uploaded.fileName,
        uploaded.path,
        uploaded.url,
        'MIGRATE_PLATFORM_GATEWAY',
        row.id,
      ],
    });
  }

  return items;
}

function resolveLocalPath(source: string | null): string | null {
  if (!source) return null;
  const withoutQuery = source.split('?')[0] || source;
  const match = withoutQuery.match(/\/uploads\/.+$/);
  const relative = match ? match[0] : withoutQuery.startsWith('uploads/') ? `/${withoutQuery}` : '';
  if (!relative) return null;
  return join(process.cwd(), relative.replace(/^\//, ''));
}

function isGatewayUrl(source: string): boolean {
  return source.startsWith('/api/uploads/') || /\/api\/uploads\//.test(source);
}

function isExternalUrl(source: string): boolean {
  return /^https?:\/\//i.test(source) && !/\/uploads\//.test(source);
}

function isExcludedSource(source: string): boolean {
  const normalized = source.split('?')[0]?.replace(/\\/g, '/') || source;
  return excludedSourceFragments.some((fragment) => normalized.includes(fragment));
}

async function isAllowedImageFile(filePath: string): Promise<boolean> {
  if (!['.jpg', '.jpeg', '.png', '.webp'].includes(extname(filePath).toLowerCase())) return false;
  try {
    assertBufferMagic(await readFile(filePath), ['jpeg', 'png', 'webp']);
    return true;
  } catch {
    return false;
  }
}

async function copyToTemp(localPath: string): Promise<string> {
  const tempDir = join(tmpdir(), 'lll-platform-gateway-migration');
  await mkdir(tempDir, { recursive: true });
  const tempPath = join(tempDir, `${randomUUID()}-${basename(localPath)}`);
  await copyFile(localPath, tempPath);
  return tempPath;
}

function guessMimeType(filePath: string): string {
  const lower = filePath.toLowerCase();
  if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if (lower.endsWith('.png')) return 'image/png';
  if (lower.endsWith('.webp')) return 'image/webp';
  return 'application/octet-stream';
}

void main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exit(1);
});
