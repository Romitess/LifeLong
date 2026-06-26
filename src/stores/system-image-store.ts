import { defineStore } from 'pinia';
import { fetchHeroConfig, saveHeroConfig } from 'src/services/slideshow-service';

export interface HeroTextSegment {
  id: string;
  text: string;
  color: string;
  fontWeight?: number;
}

export type HeroTextEffect = 'typewriter' | 'fade' | 'slide-up' | 'none';

export interface HeroTextLine {
  id: string;
  label: string;
  enabled: boolean;
  segments: HeroTextSegment[];
  effect: HeroTextEffect;
  durationMs: number;
  gapMs: number;
  fontFamily: string;
  fontSizePx: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
}

export interface HeroTextBlock {
  enabled: boolean;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  gapPx: number;
  textAlign: 'left' | 'center' | 'right';
  backgroundEnabled: boolean;
  backgroundColor: string;
  paddingTopPx: number;
  paddingRightPx: number;
  paddingBottomPx: number;
  paddingLeftPx: number;
  borderRadiusPx: number;
  lines: HeroTextLine[];
}

export interface HeroSlideTemplate {
  id: string;
  name: string;
  imageUrl: string;
  enabled: boolean;
  backgroundPosition: string;
  overlayColor: string;
  overlayOpacity: number;
  textBlock: HeroTextBlock;
  startDate: string | null;
  endDate: string | null;
}

export interface HeroTemplateConfig {
  slideDurationMs: number;
  initialDelayMs: number;
  slides: HeroSlideTemplate[];
}

const DEFAULT_FONT_STACK = "'IBM Plex Sans Thai', 'Noto Sans Thai', sans-serif";
const BACKEND_PUBLIC_URL = (
  import.meta.env.VITE_BACKEND_PUBLIC_URL ||
  import.meta.env.VITE_API_URL ||
  'http://localhost:3000'
)
  .replace(/\/api\/?$/, '')
  .replace(/\/+$/, '');
const heroImageUrl = (filename: string) => `${BACKEND_PUBLIC_URL}/uploads/system/${filename}`;

const DEFAULT_HERO_CONFIG: HeroTemplateConfig = {
  slideDurationMs: 12000,
  initialDelayMs: 250,
  slides: [
    {
      id: 'main-short-course',
      name: 'Main Short Course Hero',
      imageUrl: heroImageUrl('homepicture1.png'),
      enabled: true,
      backgroundPosition: 'center 60%',
      overlayColor: '#ffffff',
      overlayOpacity: 0,
      startDate: '01/05/2026',
      endDate: '31/12/2026',
      textBlock: {
        enabled: true,
        xPercent: 8,
        yPercent: 18,
        widthPercent: 56,
        gapPx: 10,
        textAlign: 'left',
        backgroundEnabled: false,
        backgroundColor: '#FFFFFFB8',
        paddingTopPx: 0,
        paddingRightPx: 0,
        paddingBottomPx: 0,
        paddingLeftPx: 0,
        borderRadiusPx: 28,
        lines: [
          {
            id: 'buu-title',
            label: 'BUU title',
            enabled: true,
            effect: 'typewriter',
            durationMs: 1300,
            gapMs: 120,
            fontFamily: DEFAULT_FONT_STACK,
            fontSizePx: 96,
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: '0',
            segments: [
              { id: 'buu-title-bu', text: 'BU', color: '#f7d046', fontWeight: 800 },
              { id: 'buu-title-u', text: 'U', color: '#7c7c7c', fontWeight: 800 },
            ],
          },
          {
            id: 'course-title',
            label: 'Course title',
            enabled: true,
            effect: 'typewriter',
            durationMs: 1300,
            gapMs: 120,
            fontFamily: DEFAULT_FONT_STACK,
            fontSizePx: 72,
            fontWeight: 800,
            lineHeight: 0.95,
            letterSpacing: '0',
            segments: [{ id: 'course-title-main', text: 'SHORT COURSE', color: '#1a237e' }],
          },
          {
            id: 'course-body-1',
            label: 'Description line 1',
            enabled: true,
            effect: 'fade',
            durationMs: 520,
            gapMs: 100,
            fontFamily: DEFAULT_FONT_STACK,
            fontSizePx: 22,
            fontWeight: 500,
            lineHeight: 1.45,
            letterSpacing: '0',
            segments: [
              {
                id: 'course-body-1-main',
                text: 'หลักสูตรระยะสั้นที่ออกแบบมาเพื่อเพิ่มพูนทักษะ และสมรรถนะ',
                color: '#667085',
              },
            ],
          },
          {
            id: 'course-body-2',
            label: 'Description line 2',
            enabled: true,
            effect: 'fade',
            durationMs: 520,
            gapMs: 0,
            fontFamily: DEFAULT_FONT_STACK,
            fontSizePx: 22,
            fontWeight: 500,
            lineHeight: 1.45,
            letterSpacing: '0',
            segments: [
              {
                id: 'course-body-2-main',
                text: 'ในด้านต่าง ๆ ให้กับผู้เรียนทุกช่วงวัยในการพัฒนาตนเองอย่างต่อเนื่อง.',
                color: '#667085',
              },
            ],
          },
        ],
      },
    },
    {
      id: 'main-catalog',
      name: 'Catalog Hero',
      imageUrl: heroImageUrl('homepicture2.png'),
      enabled: true,
      backgroundPosition: 'center 58%',
      overlayColor: '#0f172a',
      overlayOpacity: 0,
      startDate: '01/05/2026',
      endDate: '31/12/2026',
      textBlock: createEmptyTextBlock(),
    },
  ],
};

function createEmptyTextBlock(): HeroTextBlock {
  return {
    enabled: false,
    xPercent: 8,
    yPercent: 18,
    widthPercent: 56,
    gapPx: 10,
    textAlign: 'left',
    backgroundEnabled: false,
    backgroundColor: '#FFFFFFB8',
    paddingTopPx: 0,
    paddingRightPx: 0,
    paddingBottomPx: 0,
    paddingLeftPx: 0,
    borderRadiusPx: 28,
    lines: [],
  };
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function cloneHeroConfig(config: HeroTemplateConfig): HeroTemplateConfig {
  return JSON.parse(JSON.stringify(config)) as HeroTemplateConfig;
}

export function cloneHeroTemplateConfig(config: HeroTemplateConfig): HeroTemplateConfig {
  return cloneHeroConfig(config);
}

export function createDefaultHeroTemplateConfig(): HeroTemplateConfig {
  return cloneHeroConfig(DEFAULT_HERO_CONFIG);
}

export function createHeroTextSegment(line: HeroTextLine): HeroTextSegment {
  return {
    id: createId('segment'),
    text: 'ช่วงข้อความ',
    color: '#f5a623',
    fontWeight: line.fontWeight,
  };
}

export function createHeroTextLine(lineIndex: number): HeroTextLine {
  return {
    id: createId('hero-line'),
    label: `Line ${lineIndex + 1}`,
    enabled: true,
    effect: 'fade',
    durationMs: 1100,
    gapMs: 120,
    fontFamily: DEFAULT_FONT_STACK,
    fontSizePx: 40,
    fontWeight: 800,
    lineHeight: 1.05,
    letterSpacing: '0',
    segments: [{ id: createId('segment'), text: 'ข้อความใหม่', color: '#1a237e' }],
  };
}

export function createHeroSlideTemplate(
  imageUrl: string,
  name = 'New Hero Image',
): HeroSlideTemplate {
  return {
    id: createId('main-hero'),
    name,
    imageUrl,
    enabled: true,
    backgroundPosition: 'center center',
    overlayColor: '#0f172a',
    overlayOpacity: 0.12,
    startDate: null,
    endDate: null,
    textBlock: createEmptyTextBlock(),
  };
}

function clampNumber(value: unknown, fallback: number, min: number, max: number): number {
  const numericValue = typeof value === 'number' && Number.isFinite(value) ? value : fallback;
  return Math.min(Math.max(numericValue, min), max);
}

function parseLegacyFontSizePx(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== 'string') {
    return fallback;
  }

  const trimmedValue = value.trim();
  const pxMatch = trimmedValue.match(/^(\d+(?:\.\d+)?)px$/);
  if (pxMatch?.[1]) {
    return Number(pxMatch[1]);
  }

  const remMatch = trimmedValue.match(/^(\d+(?:\.\d+)?)rem$/);
  if (remMatch?.[1]) {
    return Number(remMatch[1]) * 16;
  }

  const clampValues = Array.from(trimmedValue.matchAll(/(\d+(?:\.\d+)?)(rem|px)/g));
  if (clampValues.length > 0) {
    const parsedValues = clampValues.map((match) => {
      const numericValue = Number(match[1]);
      return match[2] === 'rem' ? numericValue * 16 : numericValue;
    });
    return parsedValues[Math.floor(parsedValues.length / 2)] ?? fallback;
  }

  return fallback;
}

function normalizeTextEffect(value: unknown): HeroTextEffect {
  return value === 'typewriter' || value === 'fade' || value === 'slide-up' || value === 'none'
    ? value
    : 'fade';
}

function normalizeSegment(segment: Partial<HeroTextSegment>, index: number): HeroTextSegment {
  return {
    id: typeof segment.id === 'string' ? segment.id : createId(`segment-${index}`),
    text: typeof segment.text === 'string' ? segment.text : '',
    color: typeof segment.color === 'string' ? segment.color : '#1a237e',
    ...(typeof segment.fontWeight === 'number'
      ? { fontWeight: clampNumber(segment.fontWeight, 800, 100, 1000) }
      : {}),
  };
}

function normalizeLine(
  line: Partial<HeroTextLine> & { fontSize?: unknown },
  index: number,
): HeroTextLine {
  const segments = Array.isArray(line.segments)
    ? line.segments.map((segment, segmentIndex) => normalizeSegment(segment, segmentIndex))
    : [{ id: createId('segment'), text: 'ข้อความใหม่', color: '#1a237e' }];

  return {
    id: typeof line.id === 'string' ? line.id : createId(`line-${index}`),
    label: typeof line.label === 'string' ? line.label : `Line ${index + 1}`,
    enabled: typeof line.enabled === 'boolean' ? line.enabled : true,
    segments,
    effect: normalizeTextEffect(line.effect),
    durationMs: clampNumber(line.durationMs, 1300, 80, 10000),
    gapMs: clampNumber(line.gapMs, 120, 0, 5000),
    fontFamily: typeof line.fontFamily === 'string' ? line.fontFamily : DEFAULT_FONT_STACK,
    fontSizePx: clampNumber(
      parseLegacyFontSizePx(line.fontSizePx ?? line.fontSize, 40),
      40,
      10,
      160,
    ),
    fontWeight: clampNumber(line.fontWeight, 800, 100, 1000),
    lineHeight: clampNumber(line.lineHeight, 1, 0.7, 2.5),
    letterSpacing: typeof line.letterSpacing === 'string' ? line.letterSpacing : '0',
  };
}

function normalizeTextBlock(block: Partial<HeroTextBlock> | undefined): HeroTextBlock {
  const fallback = createEmptyTextBlock();

  if (!block || typeof block !== 'object') {
    return fallback;
  }

  return {
    enabled: typeof block.enabled === 'boolean' ? block.enabled : fallback.enabled,
    xPercent: clampNumber(block.xPercent, fallback.xPercent, 0, 100),
    yPercent: clampNumber(block.yPercent, fallback.yPercent, 0, 100),
    widthPercent: clampNumber(block.widthPercent, fallback.widthPercent, 16, 100),
    gapPx: clampNumber(block.gapPx, fallback.gapPx, 0, 80),
    textAlign:
      block.textAlign === 'center' || block.textAlign === 'right' || block.textAlign === 'left'
        ? block.textAlign
        : fallback.textAlign,
    backgroundEnabled:
      typeof block.backgroundEnabled === 'boolean'
        ? block.backgroundEnabled
        : fallback.backgroundEnabled,
    backgroundColor:
      typeof block.backgroundColor === 'string' ? block.backgroundColor : fallback.backgroundColor,
    paddingTopPx: clampNumber(block.paddingTopPx, fallback.paddingTopPx, 0, 100),
    paddingRightPx: clampNumber(block.paddingRightPx, fallback.paddingRightPx, 0, 100),
    paddingBottomPx: clampNumber(block.paddingBottomPx, fallback.paddingBottomPx, 0, 100),
    paddingLeftPx: clampNumber(block.paddingLeftPx, fallback.paddingLeftPx, 0, 100),
    borderRadiusPx: clampNumber(block.borderRadiusPx, fallback.borderRadiusPx, 0, 80),
    lines: Array.isArray(block.lines)
      ? block.lines.map((line, lineIndex) => normalizeLine(line, lineIndex))
      : fallback.lines,
  };
}

function normalizeDateString(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseDmyDate(value: string | null): Date | null {
  if (!value) return null;
  const parts = value.split('/');
  if (parts.length === 3) {
    const [day, month, year] = parts.map(Number);
    if (
      Number.isFinite(day) &&
      Number.isFinite(month) &&
      Number.isFinite(year) &&
      day &&
      month &&
      year
    ) {
      return new Date(year, month - 1, day);
    }
  }
  const fallback = new Date(value);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isSlideScheduledOn(slide: HeroSlideTemplate, target: Date): boolean {
  const start = parseDmyDate(slide.startDate);
  const end = parseDmyDate(slide.endDate);
  if (start && target < start) return false;
  if (end && target > end) return false;
  return true;
}

function normalizeSlide(slide: Partial<HeroSlideTemplate>, index: number): HeroSlideTemplate {
  return {
    id: typeof slide.id === 'string' ? slide.id : createId(`hero-slide-${index}`),
    name: typeof slide.name === 'string' ? slide.name : `Hero ${index + 1}`,
    imageUrl:
      typeof slide.imageUrl === 'string' && slide.imageUrl
        ? slide.imageUrl
        : heroImageUrl('homepicture1.png'),
    enabled: typeof slide.enabled === 'boolean' ? slide.enabled : true,
    backgroundPosition:
      typeof slide.backgroundPosition === 'string' ? slide.backgroundPosition : 'center 60%',
    overlayColor: typeof slide.overlayColor === 'string' ? slide.overlayColor : '#ffffff',
    overlayOpacity: clampNumber(slide.overlayOpacity, 0, 0, 1),
    startDate: normalizeDateString(slide.startDate),
    endDate: normalizeDateString(slide.endDate),
    textBlock: normalizeTextBlock(slide.textBlock),
  };
}

function normalizeHeroConfig(value: unknown): HeroTemplateConfig {
  if (!value || typeof value !== 'object') {
    return cloneHeroConfig(DEFAULT_HERO_CONFIG);
  }

  const partialConfig = value as Partial<HeroTemplateConfig>;
  const slides = Array.isArray(partialConfig.slides)
    ? partialConfig.slides.map((slide, index) => normalizeSlide(slide, index))
    : cloneHeroConfig(DEFAULT_HERO_CONFIG).slides;
  const usableSlides =
    slides.filter((slide) => slide.enabled).length >= 2
      ? slides
      : cloneHeroConfig(DEFAULT_HERO_CONFIG).slides;

  return {
    slideDurationMs: clampNumber(partialConfig.slideDurationMs, 12000, 3000, 60000),
    initialDelayMs: clampNumber(partialConfig.initialDelayMs, 250, 0, 5000),
    slides: usableSlides.length > 0 ? usableSlides : cloneHeroConfig(DEFAULT_HERO_CONFIG).slides,
  };
}

export const useSystemImageStore = defineStore('systemImage', {
  state: (): { heroConfig: HeroTemplateConfig; initialized: boolean } => ({
    heroConfig: cloneHeroConfig(DEFAULT_HERO_CONFIG),
    initialized: false,
  }),

  getters: {
    activeHeroSlides(state): HeroSlideTemplate[] {
      const today = startOfToday();
      const scheduledSlides = state.heroConfig.slides.filter(
        (slide) => slide.enabled && isSlideScheduledOn(slide, today),
      );
      if (scheduledSlides.length > 0) {
        return scheduledSlides;
      }
      const enabledSlides = state.heroConfig.slides.filter((slide) => slide.enabled);
      if (enabledSlides.length > 0) {
        return enabledSlides;
      }
      return state.heroConfig.slides.slice(0, 1);
    },
  },

  actions: {
    async init(): Promise<void> {
      if (this.initialized) {
        return;
      }

      this.initialized = true;
      await this.reloadFromServer();
    },

    // DB is the single source of truth. Falls back to defaults (display only) on
    // an empty store or a failed request so the hero never renders blank.
    async reloadFromServer(): Promise<void> {
      try {
        const raw = await fetchHeroConfig();
        this.heroConfig = normalizeHeroConfig(raw);
      } catch (error) {
        console.warn('Failed to load hero config from server', error);
        this.heroConfig = createDefaultHeroTemplateConfig();
      }
    },

    // Persists the full config to the backend, then syncs state from the
    // normalized server response. Rejects on failure so callers can surface it.
    async setHeroConfig(config: HeroTemplateConfig): Promise<void> {
      const saved = await saveHeroConfig(normalizeHeroConfig(config));
      this.heroConfig = normalizeHeroConfig(saved);
    },
  },
});
