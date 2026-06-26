import { Injectable, Logger } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { HeroConfigDto, HeroSlideDto } from './dto/hero-config.dto';
import {
  HeroConfigResponseDto,
  HeroSlideResponse,
  HeroTextBlockResponse,
} from './dto/hero-config-response.dto';
import { PlatformGatewayService } from '../../platform-gateway/platform-gateway.service';

export const DEFAULT_SLIDESHOW_GROUP = 'main';

interface ConfigRow {
  durationMs: number | string | null;
  initialDelayMs: number | string | null;
}

interface SlideRow {
  id: number | string;
  name: string | null;
  path: string | null;
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
  private readonly logger = new Logger(AdminSlideshowService.name);

  constructor(
    private readonly dataSource: DataSource,
    private readonly platformGatewayService: PlatformGatewayService,
  ) {}

  async getConfig(group: string = DEFAULT_SLIDESHOW_GROUP): Promise<HeroConfigResponseDto> {
    const configRows = await this.dataSource.query<ConfigRow[]>(
      `SELECT SLIDE_DURATION_MS AS durationMs, INITIAL_DELAY_MS AS initialDelayMs
       FROM LLTSLIDESHOWCONFIG WHERE CONFIG_KEY = ?`,
      [group],
    );

    const slideRows = await this.dataSource.query<SlideRow[]>(
      `SELECT SLIDE_ID AS id, SLIDE_NAMETH AS name, SLIDE_PATH AS path,
              SLIDE_URL AS imageUrl, SLIDE_STATUS AS status,
              SLIDE_STARTDATE AS startDate, SLIDE_ENDDATE AS endDate, SLIDE_LAYOUT AS layout
       FROM LLTSLIDESHOW WHERE SLIDE_GROUP = ?
       ORDER BY SLIDE_ORDER ASC, SLIDE_ID ASC`,
      [group],
    );

    return {
      slideDurationMs: toNullableInt(configRows[0]?.durationMs),
      initialDelayMs: toNullableInt(configRows[0]?.initialDelayMs),
      slides: await Promise.all(slideRows.map((row) => this.mapSlideRow(row))),
    };
  }

  async saveConfig(
    dto: HeroConfigDto,
    group: string = DEFAULT_SLIDESHOW_GROUP,
  ): Promise<HeroConfigResponseDto> {
    const currentSlides = await this.dataSource.query<SlideRow[]>(
      `SELECT SLIDE_PATH AS path, SLIDE_URL AS imageUrl FROM LLTSLIDESHOW WHERE SLIDE_GROUP = ?`,
      [group],
    );
    const newImagePaths = new Set(
      dto.slides.map((slide) => deriveGatewayPath(slide.imageUrl)).filter(isString),
    );

    const deletedPaths = currentSlides
      .map((row) => row.path || deriveGatewayPath(row.imageUrl ?? ''))
      .filter((path): path is string => typeof path === 'string' && !newImagePaths.has(path));

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
        const gatewayPath = deriveGatewayPath(slide.imageUrl);
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
            gatewayPath,
            slide.imageUrl,
            group,
            order,
            buildSlideLayout(slide),
          ],
        );
        order += 1;
      }
    });

    for (const gatewayPath of deletedPaths) {
      if (gatewayPath) {
        await this.platformGatewayService.deleteFile(gatewayPath).catch((err: unknown) => {
          const message = err instanceof Error ? err.message : String(err);
          this.logger.warn(`Failed to delete old hero image from gateway: ${message}`);
        });
      }
    }

    return this.getConfig(group);
  }

  private async mapSlideRow(row: SlideRow): Promise<HeroSlideResponse> {
    const layout = parseLayout(row.layout);
    return {
      id: String(row.id),
      name: row.name ?? '',
      imageUrl: await this.resolveGatewayImageUrl(row.path, row.imageUrl),
      enabled: row.status === 'Y',
      backgroundPosition: layout.backgroundPosition ?? 'center center',
      overlayColor: layout.overlayColor ?? '#0f172a',
      overlayOpacity: typeof layout.overlayOpacity === 'number' ? layout.overlayOpacity : 0,
      textBlock: layout.textBlock ?? null,
      startDate: formatDbDateToDmy(row.startDate),
      endDate: formatDbDateToDmy(row.endDate),
    };
  }

  private async resolveGatewayImageUrl(
    path: string | null,
    imageUrl: string | null,
  ): Promise<string> {
    const gatewayPath = path || deriveRelativePath(imageUrl ?? '');
    if (!gatewayPath) return '';

    try {
      return await this.platformGatewayService.getPublicFileUrl(gatewayPath);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      this.logger.warn(`Failed to resolve hero image from gateway: ${message}`);
      return '';
    }
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

function deriveGatewayPath(imageUrl: string): string | null {
  return deriveRelativePath(imageUrl) || deriveSystemPathFromFilename(imageUrl);
}

function deriveSystemPathFromFilename(imageUrl: string): string | null {
  const fileName = deriveFilename(imageUrl);
  return fileName ? `uploads/system/${fileName}` : null;
}

function isString(value: string | null): value is string {
  return typeof value === 'string' && value.length > 0;
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
