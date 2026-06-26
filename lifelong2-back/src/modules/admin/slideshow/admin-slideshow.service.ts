import { Injectable } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { HeroConfigDto, HeroSlideDto } from './dto/hero-config.dto';
import {
  HeroConfigResponseDto,
  HeroSlideResponse,
  HeroTextBlockResponse,
} from './dto/hero-config-response.dto';

export const DEFAULT_SLIDESHOW_GROUP = 'main';

interface ConfigRow {
  durationMs: number | string | null;
  initialDelayMs: number | string | null;
}

interface SlideRow {
  id: number | string;
  name: string | null;
  imageUrl: string | null;
  status: string | null;
  startDate: Date | string | null;
  endDate: Date | string | null;
  layout: string | null;
}

interface SlideLayout {
  backgroundPosition?: string;
  overlayColor?: string;
  overlayOpacity?: number;
  textBlock?: HeroTextBlockResponse | null;
}

@Injectable()
export class AdminSlideshowService {
  constructor(private readonly dataSource: DataSource) {}

  async getConfig(group: string = DEFAULT_SLIDESHOW_GROUP): Promise<HeroConfigResponseDto> {
    const configRows = await this.dataSource.query<ConfigRow[]>(
      `SELECT SLIDE_DURATION_MS AS durationMs, INITIAL_DELAY_MS AS initialDelayMs
       FROM LLTSLIDESHOWCONFIG WHERE CONFIG_KEY = ?`,
      [group],
    );

    const slideRows = await this.dataSource.query<SlideRow[]>(
      `SELECT SLIDE_ID AS id, SLIDE_NAMETH AS name, SLIDE_URL AS imageUrl, SLIDE_STATUS AS status,
              SLIDE_STARTDATE AS startDate, SLIDE_ENDDATE AS endDate, SLIDE_LAYOUT AS layout
       FROM LLTSLIDESHOW WHERE SLIDE_GROUP = ?
       ORDER BY SLIDE_ORDER ASC, SLIDE_ID ASC`,
      [group],
    );

    return {
      slideDurationMs: toNullableInt(configRows[0]?.durationMs),
      initialDelayMs: toNullableInt(configRows[0]?.initialDelayMs),
      slides: slideRows.map((row) => this.mapSlideRow(row)),
    };
  }

  async saveConfig(
    dto: HeroConfigDto,
    group: string = DEFAULT_SLIDESHOW_GROUP,
  ): Promise<HeroConfigResponseDto> {
    await this.dataSource.transaction(async (manager: EntityManager) => {
      await manager.query(
        `INSERT INTO LLTSLIDESHOWCONFIG
           (CONFIG_KEY, SLIDE_DURATION_MS, INITIAL_DELAY_MS, CREATEDATE, UPDATEDATE, UPDATEPROG)
         VALUES (?, ?, ?, NOW(), NOW(), 'ADMIN')
         ON DUPLICATE KEY UPDATE
           SLIDE_DURATION_MS = VALUES(SLIDE_DURATION_MS),
           INITIAL_DELAY_MS = VALUES(INITIAL_DELAY_MS),
           UPDATEDATE = NOW(),
           UPDATEPROG = 'ADMIN'`,
        [group, dto.slideDurationMs, dto.initialDelayMs],
      );

      // Full replace keeps the save idempotent: same payload -> same resulting rows.
      await manager.query(`DELETE FROM LLTSLIDESHOW WHERE SLIDE_GROUP = ?`, [group]);

      let order = 0;
      for (const slide of dto.slides) {
        await manager.query(
          `INSERT INTO LLTSLIDESHOW
             (SLIDE_NAMETH, SLIDE_FILENAME, SLIDE_STATUS, SLIDE_STARTDATE, SLIDE_ENDDATE,
              SLIDE_PATH, SLIDE_URL, SLIDE_GROUP, SLIDE_ORDER, SLIDE_LAYOUT,
              CREATEDATE, UPDATEDATE, UPDATEPROG)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), 'ADMIN')`,
          [
            slide.name,
            deriveFilename(slide.imageUrl),
            slide.enabled ? 'Y' : 'N',
            dmyToIso(slide.startDate),
            dmyToIso(slide.endDate),
            deriveRelativePath(slide.imageUrl),
            slide.imageUrl,
            group,
            order,
            buildSlideLayout(slide),
          ],
        );
        order += 1;
      }
    });

    return this.getConfig(group);
  }

  private mapSlideRow(row: SlideRow): HeroSlideResponse {
    const layout = parseLayout(row.layout);
    return {
      id: String(row.id),
      name: row.name ?? '',
      imageUrl: row.imageUrl ?? '',
      enabled: row.status === 'Y',
      backgroundPosition: layout.backgroundPosition ?? 'center center',
      overlayColor: layout.overlayColor ?? '#0f172a',
      overlayOpacity: typeof layout.overlayOpacity === 'number' ? layout.overlayOpacity : 0,
      textBlock: layout.textBlock ?? null,
      startDate: formatDbDateToDmy(row.startDate),
      endDate: formatDbDateToDmy(row.endDate),
    };
  }
}

function buildSlideLayout(slide: HeroSlideDto): string {
  const layout: SlideLayout = {
    backgroundPosition: slide.backgroundPosition,
    overlayColor: slide.overlayColor,
    overlayOpacity: slide.overlayOpacity,
    textBlock: slide.textBlock,
  };
  return JSON.stringify(layout);
}

function parseLayout(raw: unknown): SlideLayout {
  if (!raw) return {};
  // MariaDB returns JSON columns as strings; guard against drivers that pre-parse.
  if (typeof raw === 'object') return raw;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw) as SlideLayout;
    } catch {
      return {};
    }
  }
  return {};
}

function toNullableInt(value: number | string | null | undefined): number | null {
  if (value === null || value === undefined) return null;
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : null;
}

function deriveFilename(imageUrl: string): string | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('data:')) return null;
  const withoutQuery = imageUrl.split('?')[0] ?? imageUrl;
  const segments = withoutQuery.split('/');
  return segments[segments.length - 1] || null;
}

function deriveRelativePath(imageUrl: string): string | null {
  if (!imageUrl) return null;
  const match = imageUrl.match(/\/uploads\/.+$/);
  return match ? match[0].replace(/^\//, '') : null;
}

function dmyToIso(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const parts = trimmed.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts;
    if (day && month && year) {
      return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }
  }
  return null;
}

function formatDbDateToDmy(value: Date | string | null): string | null {
  if (!value) return null;
  let year: number;
  let month: number;
  let day: number;
  if (value instanceof Date) {
    year = value.getFullYear();
    month = value.getMonth() + 1;
    day = value.getDate();
  } else {
    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (!match) return null;
    year = Number(match[1]);
    month = Number(match[2]);
    day = Number(match[3]);
  }
  const dd = String(day).padStart(2, '0');
  const mm = String(month).padStart(2, '0');
  return `${dd}/${mm}/${year}`;
}
