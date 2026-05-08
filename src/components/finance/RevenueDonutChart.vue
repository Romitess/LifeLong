<template>
  <div class="revenue-pie-container">
    <div class="pie-chart-wrap">
      <svg viewBox="0 0 200 200" class="pie-svg">
        <!-- Pie Segments using path arcs — no gaps -->
        <path
          v-for="(segment, index) in segments"
          :key="index"
          :d="segment.path"
          :fill="segment.color"
          class="pie-segment"
          :class="{
            'pie-segment--active': activeIndex === index,
            'pie-segment--dimmed': activeIndex !== -1 && activeIndex !== index,
          }"
          @mouseenter="activeIndex = index"
          @mouseleave="activeIndex = -1"
          @click="activeIndex = activeIndex === index ? -1 : index"
        />

        <!-- Center white circle (donut hole) -->
        <circle cx="100" cy="100" r="52" fill="white" class="donut-hole" />

        <!-- Center text -->
        <g v-if="activeIndex === -1" class="center-text">
          <text x="100" y="96" text-anchor="middle" class="pie-center-label">ยอดรวม</text>
          <text x="100" y="112" text-anchor="middle" class="pie-center-value">
            ฿{{ totalAmount.toLocaleString() }}
          </text>
        </g>
        <g v-else-if="activeSegment" class="center-text">
          <text x="100" y="90" text-anchor="middle" class="pie-active-name">
            {{ activeSegment.name }}
          </text>
          <text x="100" y="108" text-anchor="middle" class="pie-active-amount">
            ฿{{ activeSegment.amount.toLocaleString() }}
          </text>
          <text x="100" y="122" text-anchor="middle" class="pie-active-percent">
            {{ activeSegment.percent }}%
          </text>
        </g>
      </svg>

      <!-- Floating tooltip on hover -->
      <div
        v-if="activeSegment && activeIndex !== -1"
        class="pie-tooltip shadow-6"
        :style="tooltipStyle"
      >
        <div class="row items-center q-mb-xs">
          <div class="tooltip-dot" :style="{ background: activeSegment.color }"></div>
          <div class="text-weight-bold text-dark">{{ activeSegment.name }}</div>
        </div>
        <div class="text-body2 text-weight-bolder text-primary">
          ฿{{ activeSegment.amount.toLocaleString() }}
        </div>
        <div class="text-caption text-grey-6">{{ activeSegment.percent }}% ของรายรับทั้งหมด</div>
      </div>
    </div>

    <!-- Legend -->
    <div class="pie-legend">
      <div
        v-for="(item, index) in data"
        :key="item.name"
        class="legend-row"
        :class="{ 'legend-row--active': activeIndex === index }"
        @mouseenter="activeIndex = index"
        @mouseleave="activeIndex = -1"
      >
        <div class="row items-center no-wrap">
          <div class="legend-color" :style="{ background: item.color }"></div>
          <div
            class="text-body2 text-weight-bold"
            :class="activeIndex === index ? 'text-primary' : 'text-grey-8'"
          >
            {{ item.name }}
          </div>
        </div>
        <div class="text-body2 text-weight-bolder text-dark">{{ item.percent }}%</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface PieDataItem {
  name: string;
  amount: number;
  percent: number;
  color: string;
}

const props = defineProps<{
  data: PieDataItem[];
}>();

const activeIndex = ref(-1);

const totalAmount = computed(() => props.data.reduce((acc, curr) => acc + curr.amount, 0));

const activeSegment = computed(() => {
  if (activeIndex.value >= 0 && activeIndex.value < segments.value.length) {
    return segments.value[activeIndex.value];
  }
  return null;
});

// Calculate tooltip position based on active segment midpoint
const tooltipStyle = computed(() => {
  if (!activeSegment.value) return {};
  const seg = activeSegment.value;
  // Position tooltip near the midpoint of the arc, outside the chart
  const midAngle = seg.startAngle + (seg.endAngle - seg.startAngle) / 2;
  const rad = (midAngle * Math.PI) / 180;
  // Place tooltip further out from center
  const tx = 100 + Math.cos(rad) * 120;
  const ty = 100 + Math.sin(rad) * 120;
  // Convert SVG coords to percentage
  const leftPct = (tx / 200) * 100;
  const topPct = (ty / 200) * 100;
  return {
    left: `${leftPct}%`,
    top: `${topPct}%`,
    transform: 'translate(-50%, -50%)',
  };
});

// Build SVG arc paths for each slice
const segments = computed(() => {
  const cx = 100;
  const cy = 100;
  const r = 90; // outer radius
  let currentAngle = -90; // start from top

  return props.data.map((item) => {
    const sliceAngle = (item.percent / 100) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + sliceAngle;
    currentAngle = endAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = cx + r * Math.cos(startRad);
    const y1 = cy + r * Math.sin(startRad);
    const x2 = cx + r * Math.cos(endRad);
    const y2 = cy + r * Math.sin(endRad);

    const largeArcFlag = sliceAngle > 180 ? 1 : 0;

    const path = [
      `M ${cx} ${cy}`,
      `L ${x1} ${y1}`,
      `A ${r} ${r} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    return {
      ...item,
      path,
      startAngle,
      endAngle,
    };
  });
});
</script>

<style scoped lang="scss">
.revenue-pie-container {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 40px;
  width: 100%;
  padding: 20px 0;

  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
}

.pie-chart-wrap {
  width: 260px;
  height: 260px;
  position: relative;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 220px;
    height: 220px;
  }
}

.pie-svg {
  width: 100%;
  height: 100%;
  overflow: visible;
}

.pie-segment {
  cursor: pointer;
  transition:
    transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.25s ease;
  transform-origin: 100px 100px;

  &:hover,
  &--active {
    transform: scale(1.05);
    filter: brightness(1.1);
  }
}

.pie-segment--dimmed {
  opacity: 0.5;
}

.donut-hole {
  pointer-events: none;
  filter: drop-shadow(0 0 6px rgba(0, 0, 0, 0.05));
}

.center-text {
  pointer-events: none;
}

.pie-center-label {
  font-size: 10px;
  font-weight: 700;
  fill: #94a3b8;
  letter-spacing: 0.5px;
}

.pie-center-value {
  font-size: 16px;
  font-weight: 900;
  fill: #1e293b;
}

.pie-active-name {
  font-size: 9px;
  font-weight: 700;
  fill: #64748b;
}

.pie-active-amount {
  font-size: 14px;
  font-weight: 900;
  fill: #1e293b;
}

.pie-active-percent {
  font-size: 11px;
  font-weight: 800;
  fill: #3aa6b9;
}

/* Tooltip */
.pie-tooltip {
  position: absolute;
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  min-width: 180px;
  pointer-events: none;
  z-index: 10;
  border: 1px solid #e2e8f0;
}

.tooltip-dot {
  width: 10px;
  height: 10px;
  border-radius: 3px;
  margin-right: 8px;
  flex-shrink: 0;
}

/* Legend */
.pie-legend {
  flex: 1;
  max-width: 360px;
  min-width: 280px;
}

.legend-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  margin-bottom: 8px;
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover,
  &--active {
    background: #f0f9ff;
    border-color: #bae6fd;
    transform: translateX(6px);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  }
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 4px;
  margin-right: 12px;
  flex-shrink: 0;
}
</style>
