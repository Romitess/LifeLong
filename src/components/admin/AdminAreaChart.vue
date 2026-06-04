<template>
  <div class="admin-area-chart" ref="containerRef">
    <div class="admin-area-chart__legend">
      <div v-for="serie in series" :key="serie.id" class="admin-area-chart__legend-item">
        <span class="admin-area-chart__legend-dot" :style="{ background: serie.color }" />
        <span class="admin-area-chart__legend-label">{{ serie.label }}</span>
        <strong v-if="serie.totalLabel" class="admin-area-chart__legend-total">
          {{ serie.totalLabel }}
        </strong>
      </div>
    </div>

    <svg
      class="admin-area-chart__svg"
      :viewBox="`0 0 ${width} ${height}`"
      preserveAspectRatio="none"
      role="img"
      :aria-label="ariaLabel"
      @mouseleave="onMouseLeave"
      @mousemove="onMouseMove"
    >
      <defs>
        <linearGradient
          v-for="serie in series"
          :id="`area-gradient-${chartId}-${serie.id}`"
          :key="serie.id"
          x1="0"
          x2="0"
          y1="0"
          y2="1"
        >
          <stop offset="0%" :stop-color="serie.color" stop-opacity="0.34" />
          <stop offset="100%" :stop-color="serie.color" stop-opacity="0" />
        </linearGradient>
      </defs>

      <!-- horizontal grid -->
      <g class="admin-area-chart__grid">
        <line
          v-for="(tick, index) in yTicks"
          :key="index"
          :x1="paddingX"
          :x2="width - paddingX"
          :y1="tick.y"
          :y2="tick.y"
          stroke-dasharray="2 6"
        />
        <text
          v-for="(tick, index) in yTicks"
          :key="`label-${index}`"
          :x="paddingX - 10"
          :y="tick.y + 4"
          text-anchor="end"
        >
          {{ tick.label }}
        </text>
      </g>

      <!-- areas -->
      <g v-for="serie in seriesPaths" :key="`area-${serie.id}`">
        <path
          :d="serie.areaPath"
          :fill="`url(#area-gradient-${chartId}-${serie.id})`"
          stroke="none"
        />
        <path
          :d="serie.linePath"
          fill="none"
          :stroke="serie.color"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <circle
          v-for="(point, idx) in serie.points"
          :key="idx"
          :cx="point.x"
          :cy="point.y"
          :r="hoveredIndex === idx ? 5 : 0"
          :fill="serie.color"
          stroke="#ffffff"
          stroke-width="2"
        />
      </g>

      <!-- x labels -->
      <g class="admin-area-chart__x-labels">
        <text
          v-for="(label, index) in xLabels"
          :key="label + index"
          :x="xPositions[index]"
          :y="height - paddingBottom + 18"
          text-anchor="middle"
        >
          {{ label }}
        </text>
      </g>

      <!-- hover guide -->
      <line
        v-if="hoveredIndex !== null"
        class="admin-area-chart__hover-line"
        :x1="xPositions[hoveredIndex]"
        :x2="xPositions[hoveredIndex]"
        :y1="paddingTop"
        :y2="height - paddingBottom"
      />
    </svg>

    <Transition name="admin-area-chart__tooltip-fade">
      <div v-if="hoveredIndex !== null" class="admin-area-chart__tooltip" :style="tooltipStyle">
        <span class="admin-area-chart__tooltip-period">{{ xLabels[hoveredIndex] }}</span>
        <div v-for="serie in series" :key="serie.id" class="admin-area-chart__tooltip-row">
          <span class="admin-area-chart__tooltip-dot" :style="{ background: serie.color }" />
          <span class="admin-area-chart__tooltip-label">{{ serie.label }}</span>
          <strong>{{ formatTooltipValue(serie.values[hoveredIndex] ?? 0, serie) }}</strong>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';

export interface AreaChartSeries {
  id: string;
  label: string;
  color: string;
  values: number[];
  totalLabel?: string;
  unit?: string;
  formatValue?: (value: number) => string;
}

interface Props {
  series: AreaChartSeries[];
  xLabels: string[];
  height?: number;
  ariaLabel?: string;
  yTickCount?: number;
  formatYTick?: (value: number) => string;
}

const props = withDefaults(defineProps<Props>(), {
  height: 260,
  ariaLabel: 'Area chart',
  yTickCount: 4,
  formatYTick: (value: number) => Math.round(value).toLocaleString('th-TH'),
});

const chartId = `area-${Math.random().toString(36).slice(2, 9)}`;

const containerRef = ref<HTMLDivElement | null>(null);
const width = ref(720);
const hoveredIndex = ref<number | null>(null);
const tooltipX = ref(0);

const paddingX = 48;
const paddingTop = 16;
const paddingBottom = 32;

let resizeObserver: ResizeObserver | null = null;

onMounted(() => {
  if (!containerRef.value || typeof ResizeObserver === 'undefined') return;
  resizeObserver = new ResizeObserver((entries) => {
    const entry = entries[0];
    if (entry) {
      width.value = Math.max(320, Math.round(entry.contentRect.width));
    }
  });
  resizeObserver.observe(containerRef.value);
});

onBeforeUnmount(() => {
  resizeObserver?.disconnect();
});

const maxValue = computed(() => {
  const allValues = props.series.flatMap((serie) => serie.values);
  if (allValues.length === 0) return 100;
  const max = Math.max(...allValues);
  if (max === 0) return 10;
  const magnitude = 10 ** Math.floor(Math.log10(max));
  return Math.ceil(max / magnitude) * magnitude;
});

const xPositions = computed<number[]>(() => {
  const count = props.xLabels.length;
  if (count <= 1) return [width.value / 2];
  const usable = width.value - paddingX * 2;
  return Array.from({ length: count }, (_, index) => paddingX + (usable * index) / (count - 1));
});

function valueToY(value: number): number {
  const usable = props.height - paddingTop - paddingBottom;
  return paddingTop + usable - (value / maxValue.value) * usable;
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

function buildSmoothPath(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0]!.x} ${points[0]!.y}`;

  const segments: string[] = [`M ${points[0]!.x} ${points[0]!.y}`];
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(i - 1, 0)]!;
    const p1 = points[i]!;
    const p2 = points[i + 1]!;
    const p3 = points[Math.min(i + 2, points.length - 1)]!;

    const tension = 0.18;
    const cp1x = p1.x + (p2.x - p0.x) * tension;
    const minY = Math.min(p1.y, p2.y);
    const maxY = Math.max(p1.y, p2.y);
    const cp1y = clamp(p1.y + (p2.y - p0.y) * tension, minY, maxY);
    const cp2x = p2.x - (p3.x - p1.x) * tension;
    const cp2y = clamp(p2.y - (p3.y - p1.y) * tension, minY, maxY);

    segments.push(`C ${cp1x} ${cp1y} ${cp2x} ${cp2y} ${p2.x} ${p2.y}`);
  }
  return segments.join(' ');
}

const seriesPaths = computed(() =>
  props.series.map((serie) => {
    const points = serie.values.map((value, index) => ({
      x: xPositions.value[index] ?? paddingX,
      y: valueToY(value),
    }));

    const linePath = buildSmoothPath(points);
    const baselineY = props.height - paddingBottom;
    const last = points[points.length - 1];
    const first = points[0];
    const areaPath =
      points.length > 0 && first && last
        ? `${linePath} L ${last.x} ${baselineY} L ${first.x} ${baselineY} Z`
        : '';

    return {
      ...serie,
      points,
      linePath,
      areaPath,
    };
  }),
);

const yTicks = computed(() => {
  const ticks = [];
  for (let i = 0; i <= props.yTickCount; i += 1) {
    const value = (maxValue.value * i) / props.yTickCount;
    ticks.push({
      value,
      label: props.formatYTick(value),
      y: valueToY(value),
    });
  }
  return ticks.reverse();
});

const tooltipStyle = computed(() => ({
  left: `${tooltipX.value}px`,
}));

function onMouseMove(event: MouseEvent): void {
  const svg = event.currentTarget as SVGSVGElement;
  const rect = svg.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * width.value;

  let nearestIndex = 0;
  let smallestDiff = Number.POSITIVE_INFINITY;
  xPositions.value.forEach((position, index) => {
    const diff = Math.abs(position - x);
    if (diff < smallestDiff) {
      smallestDiff = diff;
      nearestIndex = index;
    }
  });

  hoveredIndex.value = nearestIndex;
  const targetX = xPositions.value[nearestIndex] ?? 0;
  tooltipX.value = (targetX / width.value) * rect.width;
}

function onMouseLeave(): void {
  hoveredIndex.value = null;
}

function formatTooltipValue(value: number, serie: AreaChartSeries): string {
  if (serie.formatValue) return serie.formatValue(value);
  const formatted = value.toLocaleString('th-TH');
  return serie.unit ? `${formatted} ${serie.unit}` : formatted;
}
</script>

<style lang="scss" scoped>
@keyframes areaChartReveal {
  from {
    clip-path: inset(0 100% 0 0);
    opacity: 0;
  }
  to {
    clip-path: inset(0 0% 0 0);
    opacity: 1;
  }
}

.admin-area-chart {
  position: relative;
  width: 100%;
}

.admin-area-chart__svg {
  animation: areaChartReveal 0.9s cubic-bezier(0.4, 0, 0.2, 1) both;
}

.admin-area-chart__legend {
  display: flex;
  flex-wrap: wrap;
  gap: 22px;
  margin-bottom: 14px;
}

.admin-area-chart__legend-item {
  display: inline-flex;
  align-items: baseline;
  gap: 8px;
  color: var(--admin-muted);
  font-size: 0.82rem;
  font-weight: 700;
}

.admin-area-chart__legend-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.admin-area-chart__legend-label {
  color: var(--admin-muted);
}

.admin-area-chart__legend-total {
  color: var(--admin-navy);
  font-size: 0.95rem;
  font-weight: 900;
}

.admin-area-chart__svg {
  width: 100%;
  height: v-bind('`${props.height}px`');
  display: block;
  cursor: crosshair;
}

.admin-area-chart__grid line {
  stroke: rgba(16, 35, 63, 0.16);
  stroke-width: 1;
}

.admin-area-chart__grid text {
  fill: #475569;
  font-size: 11px;
  font-weight: 800;
}

.admin-area-chart__x-labels text {
  fill: #475569;
  font-size: 11px;
  font-weight: 800;
}

.admin-area-chart__hover-line {
  stroke: rgba(16, 35, 63, 0.25);
  stroke-dasharray: 4 4;
  stroke-width: 1;
  pointer-events: none;
}

.admin-area-chart__tooltip {
  position: absolute;
  bottom: 100%;
  transform: translateX(-50%);
  margin-bottom: 12px;
  display: grid;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 12px;
  background: #ffffff;
  color: var(--admin-navy);
  font-size: 0.78rem;
  font-weight: 700;
  white-space: nowrap;
  border: 1px solid rgba(16, 35, 63, 0.12);
  box-shadow: 0 18px 32px rgba(16, 35, 63, 0.18);
  pointer-events: none;
}

.admin-area-chart__tooltip::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: -6px;
  transform: translateX(-50%) rotate(45deg);
  width: 10px;
  height: 10px;
  background: #ffffff;
  border-right: 1px solid rgba(16, 35, 63, 0.12);
  border-bottom: 1px solid rgba(16, 35, 63, 0.12);
}

.admin-area-chart__tooltip-period {
  color: #475569;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.admin-area-chart__tooltip-row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  min-width: 180px;
}

.admin-area-chart__tooltip-label {
  color: #475569;
  font-weight: 700;
}

.admin-area-chart__tooltip-row strong {
  margin-left: auto;
  color: var(--admin-navy);
  font-size: 0.9rem;
  font-weight: 900;
}

.admin-area-chart__tooltip-dot {
  display: inline-block;
  width: 10px;
  height: 10px;
  border-radius: 999px;
  box-shadow: 0 0 0 2px #ffffff;
}

.admin-area-chart__tooltip-fade-enter-active,
.admin-area-chart__tooltip-fade-leave-active {
  transition: opacity 0.15s ease;
}

.admin-area-chart__tooltip-fade-enter-from,
.admin-area-chart__tooltip-fade-leave-to {
  opacity: 0;
}
</style>
