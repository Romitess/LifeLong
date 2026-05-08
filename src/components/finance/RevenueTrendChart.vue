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
      <!-- Simple SVG Grid & Line Chart -->
      <svg viewBox="0 0 400 200" class="trend-svg" preserveAspectRatio="none">
        <!-- Grid Lines -->
        <line x1="0" y1="40" x2="400" y2="40" stroke="#f1f5f9" stroke-width="1" />
        <line x1="0" y1="80" x2="400" y2="80" stroke="#f1f5f9" stroke-width="1" />
        <line x1="0" y1="120" x2="400" y2="120" stroke="#f1f5f9" stroke-width="1" />
        <line x1="0" y1="160" x2="400" y2="160" stroke="#f1f5f9" stroke-width="1" />

        <!-- Area Fill -->
        <path :d="areaPath" fill="url(#trendGradient)" opacity="0.3" />

        <!-- Main Line -->
        <path
          :d="linePath"
          fill="transparent"
          stroke="#3aa6b9"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        />

        <!-- Data Points -->
        <circle
          v-for="(point, index) in points"
          :key="index"
          :cx="point.x"
          :cy="point.y"
          r="4"
          fill="white"
          stroke="#3aa6b9"
          stroke-width="2"
          class="chart-point"
        />

        <!-- Gradient Definition -->
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#3aa6b9" />
            <stop offset="100%" stop-color="#3aa6b9" stop-opacity="0" />
          </linearGradient>
        </defs>
      </svg>

      <!-- Labels -->
      <div class="x-labels row justify-between q-mt-sm q-px-xs">
        <div v-for="label in labels" :key="label" class="text-caption text-grey-5 text-weight-bold">
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

const points = computed(() => {
  const width = 400;
  const height = 200;
  const max = Math.max(...props.data) * 1.2;
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

const areaPath = computed(() => {
  if (points.value.length === 0) return '';
  const first = points.value[0];
  const last = points.value[points.value.length - 1];
  if (first === undefined || last === undefined) return '';
  return `M 0,200 L ${first.x},${first.y} ${points.value.map((p) => `${p.x},${p.y}`).join(' L ')} L ${last.x},200 Z`;
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
}

.chart-point {
  cursor: pointer;
  transition: r 0.2s ease;
  &:hover {
    r: 6;
  }
}

.x-labels {
  border-top: 1px solid #f1f5f9;
  padding-top: 8px;
}
</style>
