<template>
  <div class="admin-donut-chart">
    <div class="admin-donut-chart__chart">
      <svg :viewBox="`0 0 ${size} ${size}`" class="admin-donut-chart__svg">
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
          class="admin-donut-chart__segment"
        />
      </svg>
      <div class="admin-donut-chart__center">
        <span class="admin-donut-chart__center-label">{{ centerLabel }}</span>
        <strong class="admin-donut-chart__center-value">{{ centerValue }}</strong>
        <span v-if="centerHint" class="admin-donut-chart__center-hint">
          {{ centerHint }}
        </span>
      </div>
    </div>

    <ul class="admin-donut-chart__legend">
      <li
        v-for="segment in segmentsWithPercent"
        :key="segment.id"
        class="admin-donut-chart__legend-item"
      >
        <span class="admin-donut-chart__legend-dot" :style="{ background: segment.color }" />
        <span class="admin-donut-chart__legend-label">{{ segment.label }}</span>
        <span class="admin-donut-chart__legend-value">
          {{ segment.valueLabel }}
        </span>
        <span class="admin-donut-chart__legend-percent">{{ segment.percentLabel }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

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
  size: 220,
  strokeWidth: 26,
  formatValue: (value: number) => value.toLocaleString('th-TH'),
});

const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);

const total = computed(() => props.data.reduce((sum, segment) => sum + segment.value, 0));

const segments = computed(() => {
  const safeTotal = total.value || 1;
  let offset = 0;
  return props.data
    .filter((segment) => segment.value > 0)
    .map((segment) => {
      const length = (segment.value / safeTotal) * circumference.value;
      const result = { ...segment, length, offset };
      offset += length;
      return result;
    });
});

const segmentsWithPercent = computed(() => {
  const safeTotal = total.value || 1;
  return props.data.map((segment) => ({
    ...segment,
    valueLabel: props.formatValue(segment.value),
    percentLabel: `${Math.round((segment.value / safeTotal) * 100)}%`,
  }));
});
</script>

<style lang="scss" scoped>
.admin-donut-chart {
  display: grid;
  grid-template-columns: minmax(180px, 240px) minmax(0, 1fr);
  gap: 24px;
  align-items: center;
}

.admin-donut-chart__chart {
  position: relative;
  width: 100%;
  max-width: 240px;
  aspect-ratio: 1;
  margin: 0 auto;
}

.admin-donut-chart__svg {
  width: 100%;
  height: 100%;
  display: block;
}

.admin-donut-chart__segment {
  transition: stroke-dasharray 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.admin-donut-chart__center {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2px;
  text-align: center;
}

.admin-donut-chart__center-label {
  color: #475569;
  font-size: 0.7rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.12em;
}

.admin-donut-chart__center-value {
  color: var(--admin-navy);
  font-size: 1.7rem;
  font-weight: 900;
  line-height: 1;
}

.admin-donut-chart__center-hint {
  color: #475569;
  font-size: 0.74rem;
  font-weight: 800;
}

.admin-donut-chart__legend {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
}

.admin-donut-chart__legend-item {
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 10px;
}

.admin-donut-chart__legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.admin-donut-chart__legend-label {
  color: var(--admin-navy);
  font-size: 0.88rem;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.admin-donut-chart__legend-value {
  color: #475569;
  font-size: 0.82rem;
  font-weight: 800;
}

.admin-donut-chart__legend-percent {
  min-width: 42px;
  text-align: right;
  color: var(--admin-navy);
  font-size: 0.86rem;
  font-weight: 900;
}

@media (max-width: 720px) {
  .admin-donut-chart {
    grid-template-columns: 1fr;
  }
}
</style>
