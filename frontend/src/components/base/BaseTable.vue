<template>
  <div class="base-table">
    <div
      :class="['base-table__scroll', { 'base-table__scroll--loading': loading && rows.length > 0 }]"
      :style="scrollStyle"
    >
      <table class="base-table__table" :style="{ minWidth }">
        <colgroup>
          <col v-if="showIndex" :style="{ width: indexWidth }" />
          <col
            v-for="col in columns"
            :key="col.key"
            :style="col.width ? { width: col.width } : undefined"
          />
        </colgroup>

        <thead>
          <tr>
            <th
              v-if="showIndex"
              class="base-table__index-head text-center"
              :aria-sort="
                sortBy === '__index__'
                  ? sortDirection === 'asc'
                    ? 'ascending'
                    : 'descending'
                  : 'none'
              "
            >
              <button
                type="button"
                class="base-table__sort-btn"
                :class="{ 'base-table__sort-btn--active': sortBy === '__index__' }"
                :aria-label="`เรียงตาม ${resolvedIndexLabel}`"
                @click="toggleIndexSort"
              >
                <span>{{ resolvedIndexLabel }}</span>
                <q-icon
                  :name="
                    sortBy !== '__index__'
                      ? 'unfold_more'
                      : sortDirection === 'asc'
                        ? 'arrow_upward'
                        : 'arrow_downward'
                  "
                  size="16px"
                  class="base-table__sort-icon"
                  :class="{
                    'base-table__sort-icon--active': sortBy === '__index__',
                    'base-table__sort-icon--asc': sortBy === '__index__' && sortDirection === 'asc',
                    'base-table__sort-icon--desc':
                      sortBy === '__index__' && sortDirection === 'desc',
                  }"
                />
              </button>
            </th>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[`text-${col.align ?? 'left'}`, col.headerClass]"
              :aria-sort="getAriaSortValue(col)"
            >
              <slot :name="`header-${col.key}`" :col="col">
                <button
                  v-if="col.sortable"
                  type="button"
                  class="base-table__sort-btn"
                  :class="{ 'base-table__sort-btn--active': sortBy === (col.sortKey ?? col.key) }"
                  :aria-label="`เรียงตาม ${col.label}`"
                  @click="toggleSort(col)"
                >
                  <span>{{ col.label }}</span>
                  <q-icon
                    :name="getSortIcon(col)"
                    size="16px"
                    class="base-table__sort-icon"
                    :class="{
                      'base-table__sort-icon--active': sortBy === (col.sortKey ?? col.key),
                      'base-table__sort-icon--asc':
                        sortBy === (col.sortKey ?? col.key) && sortDirection === 'asc',
                      'base-table__sort-icon--desc':
                        sortBy === (col.sortKey ?? col.key) && sortDirection === 'desc',
                    }"
                  />
                </button>
                <template v-else>{{ col.label }}</template>
              </slot>
            </th>
          </tr>
        </thead>

        <tbody>
          <template v-if="loading && rows.length === 0">
            <tr
              v-for="n in skeletonRowCount"
              :key="`base-table-skeleton-${n}`"
              class="base-table__skeleton-row"
            >
              <td v-if="showIndex" class="base-table__index-cell">
                <q-skeleton type="text" width="24px" class="q-mx-auto" />
              </td>
              <td v-for="col in columns" :key="col.key" :class="`text-${col.align ?? 'left'}`">
                <slot :name="`skeleton-${col.key}`">
                  <q-skeleton type="text" width="70%" />
                </slot>
              </td>
            </tr>
          </template>

          <template v-else-if="rows.length > 0 || loading">
            <tr
              v-for="(row, index) in sortedRows"
              :key="resolveRowKey(row, index)"
              :class="['base-table__row', resolveRowClass(row, index)]"
            >
              <td v-if="showIndex" class="base-table__index-cell">
                {{ getDisplayIndex(index) }}
              </td>
              <td v-for="col in columns" :key="col.key" :class="`text-${col.align ?? 'left'}`">
                <slot
                  :name="`cell-${col.key}`"
                  :row="row"
                  :index="index"
                  :value="cellValue(row, col.key)"
                >
                  {{ cellValue(row, col.key) }}
                </slot>
              </td>
            </tr>

            <tr
              v-if="heightMode === 'stable' && fillerRowHeight > 0"
              class="base-table__filler-row"
            >
              <td :colspan="totalColumnCount" :style="{ height: `${fillerRowHeight}px` }" />
            </tr>
          </template>

          <tr v-else class="base-table__empty-row">
            <td :colspan="totalColumnCount" class="base-table__empty" :style="emptyStyle">
              <slot name="empty">{{ resolvedEmptyText }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div ref="paginationRef" class="base-table__footer">
      <div v-if="showRowsPerPage" class="base-table__rows-per-page">
        <span class="base-table__rpp-label">{{ resolvedRowsPerPageLabelPrefix }}</span>
        <BaseSelect
          :model-value="rowsPerPage"
          :options="resolvedRowsPerPageOptions"
          :disable="loading"
          emit-value
          map-options
          options-dense
          class="base-table__rpp-select"
          @update:model-value="onRowsPerPageSelect"
        />
        <span class="base-table__rpp-label">{{ resolvedRowsPerPageLabelSuffix }}</span>
      </div>

      <div class="base-table__pagination">
        <BasePagination
          :model-value="currentPage"
          :max="Math.max(1, totalPages)"
          :max-pages="maxPages"
          :boundary-links="true"
          :boundary-numbers="true"
          :disable="loading"
          gutter="md"
          @update:model-value="handlePageChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends object">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import BasePagination from 'components/base/BasePagination.vue';
import BaseSelect from 'components/base/BaseSelect.vue';
import { useTablePagination } from 'src/composables/use-table-pagination';

export interface BaseTableColumn {
  /** Property key on the row object (also the cell/skeleton slot name suffix). */
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  /** Column width applied via <colgroup> (e.g. '200px', 'auto'). */
  width?: string;
  headerClass?: string;
  /** If true, the column header is clickable and sorts the current-page rows. */
  sortable?: boolean;
  /** Override the row property key used for sorting (default: `key`). */
  sortKey?: string;
  /** Override the value used for sorting when the displayed value is derived. */
  sortValue?: (row: unknown) => unknown;
}

type SortDirection = 'asc' | 'desc' | null;

const props = withDefaults(
  defineProps<{
    columns: BaseTableColumn[];
    rows: T[];
    /** Row key: a property name, a resolver, or omit to fall back to the row index. */
    rowKey?: string | ((row: T, index: number) => string | number);
    /** Per-row class(es) — e.g. to style hierarchy levels (category vs subcategory). */
    rowClass?: (row: T, index: number) => string | string[] | undefined;
    loading?: boolean;
    /** Rows per page — drives skeleton count and the fixed viewport height. */
    rowsPerPage?: number;
    rowHeight?: number;
    headerHeight?: number;
    emptyText?: string;
    minWidth?: string;
    /** Render an auto-numbered leading column. */
    showIndex?: boolean;
    indexLabel?: string;
    indexWidth?: string;
    /** Number of rows before the first row on this page, for the index column. */
    indexOffset?: number;
    /** Current (authoritative) page — keep in sync with the server's reported page. */
    page?: number;
    totalPages?: number;
    maxPages?: number;
    /** Called with the requested page; await your fetch here for server-side tables. */
    onPageChange?: (page: number) => Promise<void> | void;
    /**
     * 'auto': table height fits the actual rows (no filler). Good for pages with varying data.
     * 'stable': table height is always rowsPerPage * rowHeight (filler rows when data is short).
     */
    heightMode?: 'auto' | 'stable';
    /** Show rows-per-page selector in the footer. */
    showRowsPerPage?: boolean;
    /** Selectable options for rows-per-page. */
    rowsPerPageOptions?: number[];
    /** Label text before the rows-per-page selector */
    rowsPerPageLabelPrefix?: string;
    /** Label text after the rows-per-page selector */
    rowsPerPageLabelSuffix?: string;
    /** Called when user changes rows-per-page. Parent should update `rowsPerPage` accordingly. */
    onRowsPerPageChange?: (rowsPerPage: number) => Promise<void> | void;
    /** How many skeleton rows to show during initial loading (defaults to rowsPerPage). */
    loadingSkeletonRows?: number;
    /** Minimum height for the empty state (px). */
    emptyMinHeight?: number;
  }>(),
  {
    loading: false,
    rowsPerPage: 10,
    rowHeight: 72,
    headerHeight: 53,
    minWidth: '720px',
    showIndex: false,
    indexWidth: '64px',
    indexOffset: 0,
    page: 1,
    totalPages: 1,
    maxPages: 7,
    heightMode: 'auto',
    showRowsPerPage: false,
    rowsPerPageOptions: () => [10, 25, 50],
    emptyMinHeight: 240,
  },
);

const { t } = useI18n();

const resolvedEmptyText = computed(
  () => props.emptyText ?? t('baseTable.emptyText', 'ไม่มีข้อมูล'),
);
const resolvedIndexLabel = computed(() => props.indexLabel ?? t('baseTable.indexLabel', 'ลำดับ'));
const resolvedRowsPerPageLabelPrefix = computed(
  () => props.rowsPerPageLabelPrefix ?? t('baseTable.rowsPerPagePrefix', 'แสดง'),
);
const resolvedRowsPerPageLabelSuffix = computed(
  () => props.rowsPerPageLabelSuffix ?? t('baseTable.rowsPerPageSuffix', 'รายการ / หน้า'),
);

const { currentPage, paginationRef, handlePageChange } = useTablePagination({
  onPageChange: (page) => props.onPageChange?.(page),
  isSamePage: (page) => page === props.page,
});

// Mirror the authoritative page (handles server-side clamping of out-of-range pages).
watch(
  () => props.page,
  (page) => (currentPage.value = page),
  { immediate: true },
);

// ——— Internal sort state (current-page only) ———
const sortBy = ref<string | null>(null);
const sortDirection = ref<SortDirection>(null);

function toggleSort(col: BaseTableColumn): void {
  const key = col.sortKey ?? col.key;
  if (sortBy.value !== key) {
    sortBy.value = key;
    sortDirection.value = 'asc';
  } else if (sortDirection.value === 'asc') {
    sortDirection.value = 'desc';
  } else {
    sortBy.value = null;
    sortDirection.value = null;
  }
}

function toggleIndexSort(): void {
  if (sortBy.value !== '__index__') {
    sortBy.value = '__index__';
    sortDirection.value = 'asc';
  } else if (sortDirection.value === 'asc') {
    sortDirection.value = 'desc';
  } else {
    sortBy.value = null;
    sortDirection.value = null;
  }
}

function getSortIcon(col: BaseTableColumn): string {
  const key = col.sortKey ?? col.key;
  if (sortBy.value !== key) return 'unfold_more';
  return sortDirection.value === 'asc' ? 'arrow_upward' : 'arrow_downward';
}

function getAriaSortValue(col: BaseTableColumn): 'ascending' | 'descending' | 'none' | undefined {
  if (!col.sortable) return undefined;
  const key = col.sortKey ?? col.key;
  if (sortBy.value !== key) return 'none';
  return sortDirection.value === 'asc' ? 'ascending' : 'descending';
}

/**
 * Default comparator: handles number, numeric string, Thai/string via localeCompare,
 * and pushes null/undefined to the end.
 */
function defaultCompare(a: unknown, b: unknown, dir: 'asc' | 'desc'): number {
  const isNullishA = a === null || a === undefined || a === '';
  const isNullishB = b === null || b === undefined || b === '';

  if (isNullishA && isNullishB) return 0;
  if (isNullishA) return 1; // nullish always last
  if (isNullishB) return -1;

  const numA = typeof a === 'number' ? a : Number(a);
  const numB = typeof b === 'number' ? b : Number(b);

  let result: number;
  if (!Number.isNaN(numA) && !Number.isNaN(numB)) {
    result = numA - numB;
  } else {
    result = `${a as string | number}`.localeCompare(`${b as string | number}`, 'th');
  }

  return dir === 'desc' ? -result : result;
}

const sortedRows = computed<T[]>(() => {
  if (!sortBy.value || !sortDirection.value) return props.rows;

  if (sortBy.value === '__index__') {
    return sortDirection.value === 'asc' ? [...props.rows] : [...props.rows].reverse();
  }

  const key = sortBy.value;
  const dir = sortDirection.value;
  const activeColumn = props.columns.find((col) => (col.sortKey ?? col.key) === key);

  return [...props.rows].sort((a, b) => {
    const valA = activeColumn?.sortValue?.(a) ?? (a as Record<string, unknown>)[key];
    const valB = activeColumn?.sortValue?.(b) ?? (b as Record<string, unknown>)[key];
    return defaultCompare(valA, valB, dir);
  });
});

// ——— Layout computations ———
const totalColumnCount = computed(() => props.columns.length + (props.showIndex ? 1 : 0));

const skeletonRowCount = computed(() => props.loadingSkeletonRows ?? props.rowsPerPage);

const fillerRowHeight = computed(() =>
  Math.max(0, (props.rowsPerPage - props.rows.length) * props.rowHeight),
);

const scrollStyle = computed(() => {
  if (props.heightMode === 'stable') {
    return { minHeight: `${props.rowsPerPage * props.rowHeight + props.headerHeight}px` };
  }
  // auto mode — no forced height
  return undefined;
});

const emptyStyle = computed(() => ({
  height: `${props.emptyMinHeight}px`,
}));

const bodyHeight = computed(() => `${props.rowsPerPage * props.rowHeight}px`);
const rowHeightCss = computed(() => `${props.rowHeight}px`);

// ——— Rows-per-page ———
const resolvedRowsPerPageOptions = computed(() => {
  const opts = [...props.rowsPerPageOptions];
  if (!opts.includes(props.rowsPerPage)) {
    opts.push(props.rowsPerPage);
  }
  return opts.sort((a, b) => a - b);
});

function onRowsPerPageSelect(raw: unknown): void {
  const value = Number(raw);
  if (!Number.isNaN(value) && value !== props.rowsPerPage) {
    void props.onRowsPerPageChange?.(value);
  }
}

// ——— Helpers ———
function resolveRowKey(row: T, index: number): string | number {
  const key = props.rowKey;
  if (typeof key === 'function') {
    return key(row, index);
  }
  if (key != null) {
    return (row as Record<string, unknown>)[key] as string | number;
  }
  return index;
}

function getDisplayIndex(loopIndex: number): number {
  if (sortBy.value === '__index__' && sortDirection.value === 'desc') {
    return props.indexOffset + props.rows.length - loopIndex;
  }
  return props.indexOffset + loopIndex + 1;
}

function resolveRowClass(row: T, index: number): string | string[] | undefined {
  return props.rowClass?.(row, index);
}

function cellValue(row: T, key: string): unknown {
  return (row as Record<string, unknown>)[key];
}
</script>

<style lang="scss" scoped>
.base-table {
  // Token-first with fallbacks so the table also works outside the admin theme.
  --base-table-line: var(--admin-line, rgba(16, 35, 63, 0.1));
  --base-table-head-bg: #f8fafc;
  --base-table-head-ink: #475467;
  --base-table-index-ink: var(--q-primary);
  --base-table-row-bg: #ffffff;
  --base-table-row-hover: rgba(37, 99, 235, 0.03);
  --base-table-empty-ink: #64748b;
  --base-table-row-height: v-bind(rowHeightCss);
  --base-table-body-height: v-bind(bodyHeight);
}

.base-table__scroll {
  overflow-x: auto;
}

.base-table__scroll--loading tbody {
  opacity: 0.45;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.base-table__table {
  width: 100%;
  border-collapse: collapse;

  th,
  td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--base-table-line);
    vertical-align: middle;
  }

  thead th {
    background: var(--base-table-head-bg);
    color: var(--base-table-head-ink);
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  tbody td {
    height: var(--base-table-row-height);
  }

  tbody tr.base-table__skeleton-row:hover,
  tbody tr.base-table__filler-row:hover {
    background: transparent;
  }
}

.base-table__index-head {
  width: 64px;
  text-align: center;
}

.base-table__index-cell {
  color: var(--base-table-index-ink);
  font-weight: 800;
  text-align: center;
}

.base-table__row {
  background: var(--base-table-row-bg);

  &:hover {
    background: var(--base-table-row-hover);
  }
}

.base-table__skeleton-row td {
  background: #ffffff;
}

.base-table__filler-row td {
  padding: 0 !important;
  border-bottom: 0 !important;
  background: transparent !important;
}

.base-table__empty {
  padding: 38px 18px;
  color: var(--base-table-empty-ink);
  text-align: center;
  vertical-align: middle;
}

// ——— Sort button ———
.base-table__sort-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0;
  margin: 0;
  appearance: none;
  background: transparent;
  border: none;
  color: inherit;
  font: inherit;
  font-size: inherit;
  font-weight: inherit;
  letter-spacing: inherit;
  text-transform: inherit;
  cursor: pointer;
  white-space: nowrap;
  outline: none;
  border-radius: 4px;
  transition: color 0.15s ease;

  &:hover {
    color: var(--q-primary, #1976d2);
  }

  &:focus-visible {
    box-shadow: 0 0 0 2px rgba(25, 118, 210, 0.35);
  }
}

.base-table__sort-icon {
  opacity: 0.3;
  transition:
    opacity 0.15s ease,
    transform 0.2s ease;
}

.base-table__sort-icon--active {
  opacity: 1;
  color: var(--q-primary, #1976d2);
}

// ——— Footer ———
.base-table__footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 16px;
  min-height: 72px;
  padding: 22px 24px 24px;
}

.base-table__pagination {
  margin-left: auto;
}

// ——— Rows per page selector ———
.base-table__rows-per-page {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.base-table__rpp-label {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 600;
  white-space: nowrap;
}

.base-table__rpp-select {
  width: 72px;

  :deep(.q-field__control) {
    min-height: 36px !important;
    height: 36px !important;
    border-radius: 10px !important;
  }

  :deep(.q-field__native) {
    font-size: 0.85rem;
    font-weight: 700;
    color: var(--admin-navy, #10233f);
    padding-top: 0;
    padding-bottom: 0;
  }

  :deep(.q-field__marginal) {
    height: 36px !important;
  }
}

@media (max-width: 600px) {
  .base-table__footer {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
    padding: 16px;
  }

  .base-table__rows-per-page {
    justify-content: center;
  }

  .base-table__pagination {
    margin-left: 0;
    display: flex;
    justify-content: flex-end;
    overflow-x: auto;
  }
}
</style>
