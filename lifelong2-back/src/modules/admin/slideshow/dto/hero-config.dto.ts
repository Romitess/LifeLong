import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const TEXT_EFFECTS = ['typewriter', 'fade', 'slide-up', 'none'] as const;
const TEXT_ALIGNS = ['left', 'center', 'right'] as const;

export class HeroTextSegmentDto {
  @IsString()
  id!: string;

  @IsString()
  text!: string;

  @IsString()
  color!: string;

  @IsOptional()
  @IsNumber()
  fontWeight?: number;
}

export class HeroTextLineDto {
  @IsString()
  id!: string;

  @IsString()
  label!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeroTextSegmentDto)
  segments!: HeroTextSegmentDto[];

  @IsIn(TEXT_EFFECTS)
  effect!: (typeof TEXT_EFFECTS)[number];

  @IsNumber()
  durationMs!: number;

  @IsNumber()
  gapMs!: number;

  @IsString()
  fontFamily!: string;

  @IsNumber()
  fontSizePx!: number;

  @IsNumber()
  fontWeight!: number;

  @IsNumber()
  lineHeight!: number;

  @IsString()
  letterSpacing!: string;
}

export class HeroTextBlockDto {
  @IsBoolean()
  enabled!: boolean;

  @IsNumber()
  xPercent!: number;

  @IsNumber()
  yPercent!: number;

  @IsNumber()
  widthPercent!: number;

  @IsNumber()
  gapPx!: number;

  @IsIn(TEXT_ALIGNS)
  textAlign!: (typeof TEXT_ALIGNS)[number];

  @IsBoolean()
  backgroundEnabled!: boolean;

  @IsString()
  backgroundColor!: string;

  @IsNumber()
  paddingTopPx!: number;

  @IsNumber()
  paddingRightPx!: number;

  @IsNumber()
  paddingBottomPx!: number;

  @IsNumber()
  paddingLeftPx!: number;

  @IsNumber()
  borderRadiusPx!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeroTextLineDto)
  lines!: HeroTextLineDto[];
}

export class HeroSlideDto {
  @IsString()
  id!: string;

  @IsString()
  name!: string;

  @IsString()
  imageUrl!: string;

  @IsBoolean()
  enabled!: boolean;

  @IsString()
  backgroundPosition!: string;

  @IsString()
  overlayColor!: string;

  @IsNumber()
  @Min(0)
  @Max(1)
  overlayOpacity!: number;

  @ValidateNested()
  @Type(() => HeroTextBlockDto)
  textBlock!: HeroTextBlockDto;

  @IsOptional()
  @IsString()
  startDate?: string | null;

  @IsOptional()
  @IsString()
  endDate?: string | null;
}

export class HeroConfigDto {
  @IsInt()
  @Min(0)
  slideDurationMs!: number;

  @IsInt()
  @Min(0)
  initialDelayMs!: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeroSlideDto)
  slides!: HeroSlideDto[];
}
