<template>
  <div class="revenue-trend-container">
    <div class="chart-header row items-center justify-between q-mb-md">
      <div class="row items-center q-gutter-sm">
        <div class="trend-indicator text-positive row items-center no-wrap">
          <q-icon name="trending_up" size="20px" class="q-mr-xs" />
          <span class="text-weight-bold">+12.5%</span>
        </div>
        <div class="text-caption text-grey-6 text-weight-medium">เมื่อเทียบกับเดือนที่แล้ว</div>
      </div>
    </div>

    <div class="chart-body relative-position">
      <svg viewBox="0 0 400 200" class="trend-svg" preserveAspectRatio="none">
        <!-- Subtle Grid Lines (Minimal) -->
        <g class="grid-lines">
          <line
            x1="0"
            y1="40"
            x2="400"
            y2="40"
            stroke="#f1f5f9"
            stroke-width="1"
            stroke-dasharray="8 8"
          />
          <line
            x1="0"
            y1="80"
            x2="400"
            y2="80"
            stroke="#f1f5f9"
            stroke-width="1"
            stroke-dasharray="8 8"
          />
          <line
            x1="0"
            y1="120"
            x2="400"
            y2="120"
            stroke="#f1f5f9"
            stroke-width="1"
            stroke-dasharray="8 8"
          />
          <line
            x1="0"
            y1="160"
            x2="400"
            y2="160"
            stroke="#f1f5f9"
            stroke-width="1"
            stroke-dasharray="8 8"
          />
        </g>

        <!-- Single Thick Trend Line (Rounded Style) -->
        <path
          :d="linePath"
          fill="transparent"
          stroke="#3aa6b9"
          stroke-width="6"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="main-trend-line"
        />

        <!-- Subtle Glow Filter for the line -->
        <defs>
          <filter id="lineGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>
      </svg>

      <!-- Labels -->
      <div class="x-labels row justify-between q-mt-lg q-px-xs">
        <div
          v-for="label in labels"
          :key="label"
          class="text-caption text-grey-5 text-weight-bolder"
        >
          {{ label }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  data: number[];
  labels: string[];
}>();

interface Point {
  x: number;
  y: number;
}

const points = computed<Point[]>(() => {
  const width = 400;
  const height = 200;
  if (props.data.length === 0) return [];

  const max = Math.max(...props.data) * 1.25;
  const stepX = width / (props.data.length - 1);

  return props.data.map((val, i) => ({
    x: i * stepX,
    y: height - (val / max) * height,
  }));
});

const linePath = computed(() => {
  if (points.value.length === 0) return '';
  return `M ${points.value.map((p) => `${p.x},${p.y}`).join(' L ')}`;
});
</script>

<style scoped lang="scss">
.revenue-trend-container {
  width: 100%;
}

.trend-svg {
  width: 100%;
  height: 240px;
  display: block;
  overflow: visible;
}

.main-trend-line {
  transition: all 0.5s ease;
  filter: drop-shadow(0 4px 12px rgba(58, 166, 185, 0.2));
}

.x-labels {
  border-top: 1px solid #f1f5f9;
  padding-top: 12px;
}
</style>
