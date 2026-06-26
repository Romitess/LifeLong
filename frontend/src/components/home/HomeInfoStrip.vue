<template>
  <div class="home-info-strip">
    <div class="section-container">
      <div
        v-motion
        :initial="rowInitial"
        :visible-once="rowVisibleOnce"
        class="row q-col-gutter-lg"
      >
        <div v-for="item in items" :key="item.label" :class="colClass">
          <BaseInfoCard
            v-bind="{
              class: cardClass,
              variant,
              tone: item.tone,
              icon: item.icon,
              title: item.label,
              description: item.description,
              value: item.value ?? '',
              valueSuffix: item.valueSuffix ?? '',
              valueCommas: item.valueCommas ?? false,
              ...(item.numericValue !== undefined ? { numericValue: item.numericValue } : {}),
            }"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import BaseInfoCard from 'components/base/BaseInfoCard.vue';

export interface HomeInfoItem {
  icon: string;
  label: string;
  description: string;
  /** ค่าแสดงผลแบบ static string (ใช้เมื่อไม่ต้องการ count-up) */
  value?: string;
  /** ถ้าใส่ numericValue จะ animate count-up จาก 0 → ค่านี้ตอน scroll */
  numericValue?: number;
  valueSuffix?: string;
  /** true ถ้าตัวเลขต้องการ comma separator: 50000 → "50,000" */
  valueCommas?: boolean;
  tone: 'gold' | 'blue' | 'positive' | 'accent';
}

interface Props {
  items: HomeInfoItem[];
  variant?: 'stat' | 'feature';
  colClass?: string;
  cardClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'feature',
  colClass: 'col-12 col-md-4',
  cardClass: '',
});

// Animate the entire row as one unit — bottom-to-top, no left-to-right stagger
const rowInitial = { opacity: 0, y: 28 };

const rowVisibleOnce = computed(() => ({
  opacity: 1,
  y: 0,
  transition: {
    type: props.variant === 'stat' ? 'spring' : 'keyframes',
    ...(props.variant === 'stat'
      ? { stiffness: 220, damping: 22, mass: 1 }
      : { duration: 550, ease: [0.22, 1, 0.36, 1] }),
  },
}));
</script>
