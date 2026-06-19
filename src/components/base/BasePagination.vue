<template>
  <nav
    v-bind="$attrs"
    class="base-pagination row no-wrap items-center"
    :style="paginationStyle"
    :aria-disabled="disable ? 'true' : 'false'"
    aria-label="Pagination"
    @mousedown.prevent
  >
    <div class="base-pagination__content row no-wrap items-center" :style="gutterStyle">
      <button
        v-if="boundaryLinks"
        type="button"
        :disabled="disable || currentPage <= 1"
        :aria-label="firstPageLabel"
        class="base-pagination__btn"
        @click="emitPage(1)"
      >
        <q-icon :name="iconFirst" />
      </button>

      <button
        v-if="directionLinks"
        type="button"
        :disabled="disable || currentPage <= 1"
        :aria-label="previousPageLabel"
        class="base-pagination__btn"
        @click="emitPage(currentPage - 1)"
      >
        <q-icon :name="iconPrev" />
      </button>

      <template v-for="item in paginationItems" :key="item.key">
        <span v-if="item.type === 'ellipsis'" class="base-pagination__ellipsis" aria-hidden="true">
          ...
        </span>
        <button
          v-else
          type="button"
          :disabled="disable"
          :aria-label="`หน้า ${item.page}`"
          :aria-current="item.page === currentPage ? 'true' : 'false'"
          class="base-pagination__btn"
          @click="emitPage(item.page)"
        >
          {{ item.page }}
        </button>
      </template>

      <button
        v-if="directionLinks"
        type="button"
        :disabled="disable || currentPage >= normalizedMax"
        :aria-label="nextPageLabel"
        class="base-pagination__btn"
        @click="emitPage(currentPage + 1)"
      >
        <q-icon :name="iconNext" />
      </button>

      <button
        v-if="boundaryLinks"
        type="button"
        :disabled="disable || currentPage >= normalizedMax"
        :aria-label="lastPageLabel"
        class="base-pagination__btn"
        @click="emitPage(normalizedMax)"
      >
        <q-icon :name="iconLast" />
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: number;
  max: number;
  maxPages?: number;
  gutter?: string;
  directionLinks?: boolean;
  boundaryLinks?: boolean;
  boundaryNumbers?: boolean;
  color?: string;
  activeColor?: string;
  activeTextColor?: string;
  iconPrev?: string;
  iconNext?: string;
  iconFirst?: string;
  iconLast?: string;
  disable?: boolean;
}

type PaginationItem =
  | { key: string; type: 'page'; page: number }
  | { key: string; type: 'ellipsis' };

const props = withDefaults(defineProps<Props>(), {
  maxPages: 7,
  gutter: 'md',
  directionLinks: true,
  boundaryLinks: false,
  boundaryNumbers: true,
  color: 'grey-7',
  activeColor: 'primary',
  activeTextColor: 'white',
  iconPrev: 'chevron_left',
  iconNext: 'chevron_right',
  iconFirst: 'first_page',
  iconLast: 'last_page',
  disable: false,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: number): void;
}>();

const firstPageLabel = 'หน้าแรก';
const previousPageLabel = 'หน้าก่อนหน้า';
const nextPageLabel = 'หน้าถัดไป';
const lastPageLabel = 'หน้าสุดท้าย';

const gutterSizeByName: Record<string, string> = {
  none: '0px',
  xs: '4px',
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
};

const normalizedMax = computed(() => Math.max(1, Math.trunc(props.max)));
const currentPage = computed(() => clampPage(props.modelValue));
const normalizedMaxPages = computed(() => Math.max(3, Math.trunc(props.maxPages)));

const gutterStyle = computed(() => {
  const gutter = gutterSizeByName[props.gutter] ?? props.gutter;
  return gutter ? { gap: gutter } : undefined;
});

const paginationStyle = computed(() => ({
  '--base-pagination-ink': resolveColor(props.color),
  '--base-pagination-active-bg': resolveColor(props.activeColor),
  '--base-pagination-active-ink': resolveColor(props.activeTextColor),
}));

const paginationItems = computed<PaginationItem[]>(() => {
  const total = normalizedMax.value;
  const maxPages = normalizedMaxPages.value;

  if (total <= maxPages) {
    return pageRange(1, total);
  }

  if (!props.boundaryNumbers) {
    const half = Math.floor(maxPages / 2);
    const start = Math.max(1, Math.min(total - maxPages + 1, currentPage.value - half));
    return pageRange(start, start + maxPages - 1);
  }

  const visibleSlots = Math.max(5, maxPages);
  const sideCount = Math.max(0, Math.floor((visibleSlots - 5) / 2));
  let start = currentPage.value - sideCount;
  let end = currentPage.value + sideCount;

  if (start <= 3) {
    start = 2;
    end = visibleSlots - 2;
  } else if (end >= total - 2) {
    start = total - visibleSlots + 3;
    end = total - 1;
  }

  const items: PaginationItem[] = [{ key: 'page-1', type: 'page', page: 1 }];

  if (start > 2) {
    items.push({ key: 'ellipsis-start', type: 'ellipsis' });
  }

  items.push(...pageRange(start, end));

  if (end < total - 1) {
    items.push({ key: 'ellipsis-end', type: 'ellipsis' });
  }

  items.push({ key: `page-${total}`, type: 'page', page: total });
  return items;
});

function pageRange(start: number, end: number): PaginationItem[] {
  const items: PaginationItem[] = [];
  for (let page = start; page <= end; page += 1) {
    items.push({ key: `page-${page}`, type: 'page', page });
  }
  return items;
}

function clampPage(page: number): number {
  return Math.min(normalizedMax.value, Math.max(1, Math.trunc(page)));
}

function emitPage(page: number): void {
  if (props.disable) {
    return;
  }

  const nextPage = clampPage(page);
  if (nextPage !== props.modelValue) {
    emit('update:modelValue', nextPage);
  }
}

function resolveColor(color: string): string {
  if (color === 'white') {
    return '#ffffff';
  }

  if (color.startsWith('#') || color.startsWith('rgb') || color.startsWith('var(')) {
    return color;
  }

  return `var(--q-${color}, ${color})`;
}
</script>

<style lang="scss" scoped>
.base-pagination {
  --base-pagination-ink: #344054;
  --base-pagination-active-bg: var(--q-primary);
  --base-pagination-active-ink: #ffffff;
}

.base-pagination__content {
  align-items: center;
}

.base-pagination__btn {
  display: inline-flex;
  flex: 0 0 40px;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  min-height: 40px;
  padding: 0;
  appearance: none;
  border-radius: 50% !important;
  font: inherit;
  font-weight: 600;
  transform: none !important;
  cursor: pointer;
  background-color: #ffffff !important;
  color: var(--base-pagination-ink) !important;
  border: 1px solid #dce4ee !important;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06) !important;
  transition:
    background-color 0.2s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    color 0.2s ease;

  &:not([aria-current='true']):hover {
    background-color: #ffffff !important;
    color: inherit !important;
    transform: translateY(-2px) !important;
    border-color: rgba(245, 166, 35, 0.24) !important;
    box-shadow:
      0 12px 24px rgba(17, 24, 39, 0.08),
      0 0 0 1px rgba(245, 166, 35, 0.08) !important;
  }

  &[aria-current='true'] {
    background-color: var(--base-pagination-active-bg) !important;
    color: var(--base-pagination-active-ink) !important;
    border-color: var(--base-pagination-active-bg) !important;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.45;
    transform: none !important;
    box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06) !important;
  }
}

.base-pagination__ellipsis {
  display: inline-flex;
  flex: 0 0 24px;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 40px;
  color: #667085;
  font-weight: 700;
  user-select: none;
}
</style>
