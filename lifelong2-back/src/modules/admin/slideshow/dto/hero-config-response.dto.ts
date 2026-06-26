export interface HeroTextSegmentResponse {
  id: string;
  text: string;
  color: string;
  fontWeight?: number;
}

export interface HeroTextLineResponse {
  id: string;
  label: string;
  enabled: boolean;
  segments: HeroTextSegmentResponse[];
  effect: string;
  durationMs: number;
  gapMs: number;
  fontFamily: string;
  fontSizePx: number;
  fontWeight: number;
  lineHeight: number;
  letterSpacing: string;
}

export interface HeroTextBlockResponse {
  enabled: boolean;
  xPercent: number;
  yPercent: number;
  widthPercent: number;
  gapPx: number;
  textAlign: string;
  backgroundEnabled: boolean;
  backgroundColor: string;
  paddingTopPx: number;
  paddingRightPx: number;
  paddingBottomPx: number;
  paddingLeftPx: number;
  borderRadiusPx: number;
  lines: HeroTextLineResponse[];
}

export interface HeroSlideResponse {
  id: string;
  name: string;
  imageUrl: string;
  enabled: boolean;
  backgroundPosition: string;
  overlayColor: string;
  overlayOpacity: number;
  textBlock: HeroTextBlockResponse | null;
  startDate: string | null;
  endDate: string | null;
}

export interface HeroConfigResponseDto {
  slideDurationMs: number | null;
  initialDelayMs: number | null;
  slides: HeroSlideResponse[];
}

export interface SlideshowImageUploadResponseDto {
  filename: string;
  imgSize: string;
  imgType: string;
  path: string;
  url: string;
}
