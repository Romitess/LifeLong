<template>
  <div class="admin-bar-chart">
    <div v-for="item in normalizedItems" :key="item.id" class="admin-bar-chart__row">
      <div class="admin-bar-chart__row-head">
        <div class="admin-bar-chart__label">
          <span
            v-if="item.icon"
            class="admin-bar-chart__icon-wrap"
            :style="{ backgroundColor: `${item.color}1f`, color: item.color }"
          >
            <q-icon :name="item.icon" size="18px" />
          </span>
          <div class="admin-bar-chart__label-copy">
            <strong>{{ item.label }}</strong>
            <span v-if="item.sublabel">{{ item.sublabel }}</span>
          </div>
        </div>
        <div class="admin-bar-chart__value">
          <strong>{{ item.valueLabel }}</strong>
          <span v-if="item.helperLabel">{{ item.helperLabel }}</span>
        </div>
      </div>
      <div class="admin-bar-chart__track">
        <div
          class="admin-bar-chart__fill"
          :style="{
            '--bar-w': `${item.percent}%`,
            background: `linear-gradient(90deg, ${item.color}, ${lightenColor(item.color)})`,
          }"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

export interface BarChartItem {
  id: string;
  label: string;
  sublabel?: string;
  value: number;
  valueLabel?: string;
  helperLabel?: string;
  color?: string;
  icon?: string;
}

interface Props {
  items: BarChartItem[];
  defaultColor?: string;
  formatValue?: (value: number) => string;
}

const props = withDefaults(defineProps<Props>(), {
  defaultColor: '#f5a623',
  formatValue: (value: number) => value.toLocaleString('th-TH'),
});

const maxValue = computed(() => {
  const max = Math.max(...props.items.map((item) => item.value), 1);
  return max;
});

const normalizedItems = computed(() =>
  props.items.map((item) => {
    const color = item.color ?? props.defaultColor;
    const ratio = item.value / maxValue.value;
    const percent = Math.max(6, Math.round(ratio * 100));
    return {
      ...item,
      color,
      percent,
      valueLabel: item.valueLabel ?? props.formatValue(item.value),
    };
  }),
);

function clampHex(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

function lightenColor(hex: string, amount = 0.4): string {
  if (!hex.startsWith('#') || hex.length < 7) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const lr = clampHex(r + (255 - r) * amount);
  const lg = clampHex(g + (255 - g) * amount);
  const lb = clampHex(b + (255 - b) * amount);
  return `rgb(${lr}, ${lg}, ${lb})`;
}
</script>

<style lang="scss" scoped>
@keyframes barRowIn {
  from {
    opacity: 0;
    transform: translateX(-8px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

.admin-bar-chart {
  display: grid;
  gap: 16px;
  width: 100%;
  min-width: 0;
}

.admin-bar-chart__row {
  display: grid;
  gap: 8px;
  width: 100%;
  min-width: 0;
  animation: barRowIn 0.45s ease-out both;

  @for $i from 1 through 10 {
    &:nth-child(#{$i}) {
      animation-delay: #{($i - 1) * 0.07}s;
    }
  }
}

.admin-bar-chart__row-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-width: 0;
}

.admin-bar-chart__label {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  flex: 1;
}

.admin-bar-chart__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  flex-shrink: 0;
}

.admin-bar-chart__label-copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.admin-bar-chart__label-copy strong {
  color: var(--admin-navy);
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.3;
  white-space: normal;
  overflow-wrap: anywhere;
}

.admin-bar-chart__label-copy span {
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
}

.admin-bar-chart__value {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
  flex-shrink: 0;
  text-align: right;
}

.admin-bar-chart__value strong {
  color: var(--admin-navy);
  font-size: 0.95rem;
  font-weight: 900;
  line-height: 1;
}

.admin-bar-chart__value span {
  color: #475569;
  font-size: 0.74rem;
  font-weight: 800;
}

.admin-bar-chart__track {
  height: 10px;
  border-radius: 999px;
  background: rgba(16, 35, 63, 0.06);
  overflow: hidden;
  width: 100%;
  min-width: 0;
}

@keyframes barGrow {
  from {
    width: 0;
  }
  to {
    width: var(--bar-w, 100%);
  }
}

.admin-bar-chart__fill {
  height: 100%;
  border-radius: inherit;
  width: var(--bar-w, 100%);
  animation: barGrow 0.9s cubic-bezier(0.4, 0, 0.2, 1) both;
  box-shadow: 0 4px 10px rgba(245, 166, 35, 0.18);
}
</style>
