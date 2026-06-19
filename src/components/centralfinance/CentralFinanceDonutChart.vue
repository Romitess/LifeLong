<template>
  <div class="cf-donut-chart">
    <div class="cf-donut-chart__chart">
      <svg :viewBox="`0 0 ${size} ${size}`" class="cf-donut-chart__svg">
        <circle
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          fill="none"
          stroke="rgba(16, 35, 63, 0.06)"
          :stroke-width="strokeWidth"
        />
        <circle
          v-for="segment in segments"
          :key="segment.id"
          :cx="size / 2"
          :cy="size / 2"
          :r="radius"
          fill="none"
          :stroke="segment.color"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
          :stroke-dasharray="`${segment.length} ${circumference}`"
          :stroke-dashoffset="-segment.offset"
          :transform="`rotate(-90 ${size / 2} ${size / 2})`"
          class="cf-donut-chart__segment"
        />
      </svg>
      <div class="cf-donut-chart__center">
        <span class="cf-donut-chart__center-label">{{ centerLabel }}</span>
        <strong class="cf-donut-chart__center-value">{{ centerValue }}</strong>
        <span v-if="centerHint" class="cf-donut-chart__center-hint">{{ centerHint }}</span>
      </div>
    </div>

    <ul class="cf-donut-chart__legend">
      <li
        v-for="segment in segmentsWithPercent"
        :key="segment.id"
        class="cf-donut-chart__legend-item"
      >
        <span class="cf-donut-chart__legend-dot" :style="{ background: segment.color }" />
        <span class="cf-donut-chart__legend-name">{{ segment.label }}</span>
        <span class="cf-donut-chart__legend-value">{{ segment.valueLabel }}</span>
        <span class="cf-donut-chart__legend-percent">{{ segment.percentLabel }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

export interface DonutChartSegment {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface Props {
  data: DonutChartSegment[];
  centerLabel?: string;
  centerValue?: string;
  centerHint?: string;
  size?: number;
  strokeWidth?: number;
  formatValue?: (value: number) => string;
}

const props = withDefaults(defineProps<Props>(), {
  centerLabel: 'รวม',
  centerValue: '',
  centerHint: '',
  size: 200,
  strokeWidth: 24,
  formatValue: (value: number) => value.toLocaleString('th-TH'),
});

const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const total = computed(() => props.data.reduce((sum, s) => sum + s.value, 0));

const drawProgress = ref(0);
let raf: number | null = null;

onMounted(() => {
  const DURATION = 1100;
  const start = performance.now();
  const tick = (now: number) => {
    const p = Math.min((now - start) / DURATION, 1);
    drawProgress.value = 1 - Math.pow(1 - p, 3);
    if (p < 1) {
      raf = requestAnimationFrame(tick);
    } else {
      drawProgress.value = 1;
      raf = null;
    }
  };
  raf = requestAnimationFrame(tick);
});

onUnmounted(() => {
  if (raf !== null) cancelAnimationFrame(raf);
});

const segments = computed(() => {
  const safeTotal = total.value || 1;
  const p = drawProgress.value;
  let offset = 0;
  return props.data
    .filter((s) => s.value > 0)
    .map((s) => {
      const fullLength = (s.value / safeTotal) * circumference.value;
      const length = fullLength * p;
      const result = { ...s, length, offset: offset * p };
      offset += fullLength;
      return result;
    });
});

const segmentsWithPercent = computed(() => {
  const safeTotal = total.value || 1;
  return props.data.map((s) => ({
    ...s,
    valueLabel: props.formatValue(s.value),
    percentLabel: `${Math.round((s.value / safeTotal) * 100)}%`,
  }));
});
</script>

<style lang="scss" scoped>
.cf-donut-chart {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
}

.cf-donut-chart__chart {
  position: relative;
  width: 200px;
  aspect-ratio: 1;
  flex-shrink: 0;
}

.cf-donut-chart__svg {
  width: 100%;
  height: 100%;
  display: block;
}

.cf-donut-chart__segment {
  will-change: stroke-dasharray, stroke-dashoffset;
}

.cf-donut-chart__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-align: center;
}

.cf-donut-chart__center-label {
  color: #475569;
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.cf-donut-chart__center-value {
  color: var(--finance-navy, #10233f);
  font-size: 1.5rem;
  font-weight: 900;
  line-height: 1;
}

.cf-donut-chart__center-hint {
  color: #475569;
  font-size: 0.72rem;
  font-weight: 800;
}

.cf-donut-chart__legend {
  list-style: none;
  margin: 0;
  padding: 0;
  width: 100%;
  display: grid;
  gap: 8px;
  max-height: 220px;
  overflow-y: auto;
  padding-right: 4px;

  &::-webkit-scrollbar {
    width: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(16, 35, 63, 0.18);
    border-radius: 999px;

    &:hover {
      background: rgba(16, 35, 63, 0.32);
    }
  }
}

.cf-donut-chart__legend-item {
  display: grid;
  grid-template-columns: 10px 1fr auto auto;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: 10px;
  // background: rgba(16, 35, 63, 0.03);
  transition: background 0.15s ease;

  &:hover {
    background: rgba(16, 35, 63, 0.07);
  }
}

.cf-donut-chart__legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  flex-shrink: 0;
}

.cf-donut-chart__legend-name {
  color: var(--finance-navy, #10233f);
  font-size: 0.85rem;
  font-weight: 700;
  line-height: 1.35;
  word-break: break-word;
}

.cf-donut-chart__legend-value {
  color: #475569;
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}

.cf-donut-chart__legend-percent {
  min-width: 38px;
  text-align: right;
  color: var(--finance-navy, #10233f);
  font-size: 0.85rem;
  font-weight: 900;
}
</style>
