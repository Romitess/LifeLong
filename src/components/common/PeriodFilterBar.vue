<template>
  <!-- 1px sentinel above the sticky bar so the IntersectionObserver can detect "stuck" -->
  <div ref="sentinelRef" class="period-filter-sentinel" />

  <div class="period-filter-bar" :class="{ 'period-filter-bar--stuck': stuck }">
    <div class="period-filter-bar__row1">
      <span class="period-filter-bar__label q-mr-sm">
        <q-icon name="filter_alt" size="14px" class="q-mr-xs" /> {{ filterLabel }}
      </span>

      <button
        v-for="opt in resolvedPresets"
        :key="opt.value"
        class="period-filter-bar__item"
        :class="{ 'period-filter-bar__item--active': period.preset === opt.value }"
        @click="applyDatePreset(opt.value)"
      >
        {{ opt.label }}
      </button>

      <slot name="append"></slot>
      <q-btn
        flat
        dense
        round
        icon="filter_alt_off"
        color="negative"
        class="q-ml-sm"
        @click="clearFilters"
      >
        <q-tooltip>{{ clearLabel }}</q-tooltip>
      </q-btn>
    </div>

    <div class="period-filter-bar__row2">
      <span class="period-filter-bar__sub-label q-mr-sm">{{ customLabel }}</span>
      <q-input
        :model-value="dateRangeDisplay"
        readonly
        borderless
        dense
        :placeholder="customPlaceholder"
        class="period-filter-bar__input period-filter-bar__input--range"
      >
        <template #append>
          <q-icon name="event" class="cursor-pointer" color="primary">
            <q-popup-proxy cover transition-show="scale" transition-hide="scale">
              <q-date
                :model-value="dateRangeModel"
                range
                mask="DD/MM/YYYY"
                color="primary"
                @update:model-value="onDateRangePicked"
              >
                <div class="row items-center justify-end q-gutter-sm">
                  <q-btn label="ยกเลิก" color="primary" flat v-close-popup />
                  <q-btn label="ตกลง" color="primary" flat v-close-popup />
                </div>
              </q-date>
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue';

export interface PeriodFilterValue {
  preset: string;
  dateFrom: string;
  dateTo: string;
}

export interface PeriodPresetOption {
  label: string;
  value: string;
}

const DEFAULT_PRESETS: PeriodPresetOption[] = [
  { label: 'วันนี้', value: 'today' },
  { label: 'สัปดาห์นี้', value: 'thisWeek' },
  { label: 'เดือนนี้', value: 'thisMonth' },
  { label: 'ปีนี้', value: 'thisYear' },
  { label: 'ทั้งหมด', value: 'allTime' },
  { label: 'กำหนดเอง', value: 'custom' },
];

const period = defineModel<PeriodFilterValue>({ required: true });

const props = withDefaults(
  defineProps<{
    presets?: PeriodPresetOption[];
    filterLabel?: string;
    clearLabel?: string;
    customLabel?: string;
    customPlaceholder?: string;
  }>(),
  {
    filterLabel: 'ตัวกรอง',
    clearLabel: 'ล้างตัวกรอง',
    customLabel: 'กำหนดช่วงเวลาเอง',
    customPlaceholder: 'เลือกช่วงเวลา',
  },
);

const emit = defineEmits<{
  change: [];
  clear: [];
}>();

const resolvedPresets = computed(() => props.presets ?? DEFAULT_PRESETS);

function formatDateInput(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

const dateRangeModel = computed<{ from: string; to: string } | string | null>(() => {
  const { dateFrom, dateTo } = period.value;
  if (dateFrom && dateTo && dateFrom !== dateTo) {
    return { from: dateFrom, to: dateTo };
  }
  return dateFrom || null;
});

const dateRangeDisplay = computed(() => {
  const { dateFrom, dateTo } = period.value;
  if (dateFrom && dateTo && dateFrom !== dateTo) {
    return `${dateFrom} - ${dateTo}`;
  }
  return dateFrom || '';
});

function onDateRangePicked(val: { from: string; to: string } | string | null) {
  if (val !== null && typeof val === 'object' && 'from' in val && 'to' in val) {
    period.value.dateFrom = val.from;
    period.value.dateTo = val.to;
  } else if (typeof val === 'string') {
    period.value.dateFrom = val;
    period.value.dateTo = val;
  } else {
    period.value.dateFrom = '';
    period.value.dateTo = '';
  }
  period.value.preset = 'custom';
  emit('change');
}

function applyDatePreset(preset: string) {
  period.value.preset = preset;
  const now = new Date();

  if (preset === 'today') {
    period.value.dateFrom = formatDateInput(now);
    period.value.dateTo = formatDateInput(now);
  } else if (preset === 'thisWeek') {
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1);
    const start = new Date(now.getFullYear(), now.getMonth(), diff);
    const end = new Date(start.getFullYear(), start.getMonth(), start.getDate() + 6);
    period.value.dateFrom = formatDateInput(start);
    period.value.dateTo = formatDateInput(end);
  } else if (preset === 'thisMonth') {
    period.value.dateFrom = formatDateInput(new Date(now.getFullYear(), now.getMonth(), 1));
    period.value.dateTo = formatDateInput(new Date(now.getFullYear(), now.getMonth() + 1, 0));
  } else if (preset === 'thisYear') {
    period.value.dateFrom = formatDateInput(new Date(now.getFullYear(), 0, 1));
    period.value.dateTo = formatDateInput(new Date(now.getFullYear(), 11, 31));
  } else if (preset === 'allTime') {
    period.value.dateFrom = '';
    period.value.dateTo = '';
  }

  if (preset !== 'custom') {
    emit('change');
  }
}

function clearFilters() {
  period.value.dateFrom = '';
  period.value.dateTo = '';
  period.value.preset = 'allTime';
  emit('clear');
  emit('change');
}

// Sticky "stuck" detection (drop shadow once it sticks under the header).
const sentinelRef = ref<HTMLElement | null>(null);
const stuck = ref(false);
let stickyObserver: IntersectionObserver | null = null;

onMounted(() => {
  if (sentinelRef.value) {
    stickyObserver = new IntersectionObserver(
      ([entry]) => {
        stuck.value = !(entry?.isIntersecting ?? true);
      },
      { threshold: 0, rootMargin: '-73px 0px 0px 0px' },
    );
    stickyObserver.observe(sentinelRef.value);
  }
});

onUnmounted(() => {
  stickyObserver?.disconnect();
});
</script>

<style scoped lang="scss">
.period-filter-sentinel {
  height: 1px;
}

.period-filter-bar {
  position: sticky;
  top: 80px;
  z-index: 9;
  margin-bottom: 16px;
  border-radius: var(--admin-radius-lg, 16px);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px) saturate(1.8);
  -webkit-backdrop-filter: blur(16px) saturate(1.8);
  border: 1px solid rgba(17, 24, 39, 0.08);
  transition: box-shadow 0.2s ease;
  overflow: clip;

  &--stuck {
    box-shadow:
      0 6px 28px rgba(17, 24, 39, 0.1),
      0 1px 4px rgba(17, 24, 39, 0.05);
  }
}

.period-filter-bar__row1,
.period-filter-bar__row2 {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
  gap: 2px;
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.period-filter-bar__row1 {
  padding: 8px 8px 4px;
  min-height: 52px;
}

.period-filter-bar__row2 {
  padding: 4px 8px 8px;
  border-top: 1px solid rgba(17, 24, 39, 0.06);
}

.period-filter-bar__label,
.period-filter-bar__sub-label {
  display: inline-flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--admin-navy, #10233f);
  padding-left: 8px;
  white-space: nowrap;
}

.period-filter-bar__sub-label {
  font-size: 0.76rem;
  color: #64748b;
}

.period-filter-bar__item {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  border: none;
  border-radius: 10px;
  min-height: 40px;
  padding: 0 14px;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.83rem;
  font-weight: 700;
  color: var(--admin-muted, #64748b);
  white-space: nowrap;
  transition: all 0.2s ease;

  &:hover {
    background: rgba($primary, 0.04);
    color: var(--admin-navy, #10233f);
  }

  &--active {
    background: rgba($primary, 0.08) !important;
    box-shadow: inset 4px 0 0 $primary;
    color: var(--admin-navy, #10233f);
  }
}

.period-filter-bar__input {
  width: 140px;
  background: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 0 12px;
  transition: all 0.2s ease;

  &--range {
    width: 220px;
  }

  &:focus-within {
    border-color: #0d9488;
    box-shadow: 0 0 0 2px rgba(13, 148, 136, 0.1);
  }
}
</style>
