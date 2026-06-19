<template>
  <div class="base-table">
    <div
      :class="['base-table__scroll', { 'base-table__scroll--loading': loading && rows.length > 0 }]"
      :style="{ minHeight: viewportHeight }"
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
            <th v-if="showIndex" class="base-table__index-head">{{ indexLabel }}</th>
            <th
              v-for="col in columns"
              :key="col.key"
              :class="[`text-${col.align ?? 'left'}`, col.headerClass]"
            >
              {{ col.label }}
            </th>
          </tr>
        </thead>

        <tbody>
          <template v-if="loading && rows.length === 0">
            <tr
              v-for="n in rowsPerPage"
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
              v-for="(row, index) in rows"
              :key="resolveRowKey(row, index)"
              :class="['base-table__row', resolveRowClass(row, index)]"
            >
              <td v-if="showIndex" class="base-table__index-cell">{{ indexOffset + index + 1 }}</td>
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

            <tr v-if="fillerRowHeight > 0" class="base-table__filler-row">
              <td :colspan="totalColumnCount" :style="{ height: `${fillerRowHeight}px` }" />
            </tr>
          </template>

          <tr v-else class="base-table__empty-row">
            <td :colspan="totalColumnCount" class="base-table__empty">
              <slot name="empty">{{ emptyText }}</slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div ref="paginationRef" class="base-table__pagination">
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
</template>

<script setup lang="ts" generic="T extends object">
import { computed, watch } from 'vue';
import BasePagination from 'components/base/BasePagination.vue';
import { useTablePagination } from 'src/composables/use-table-pagination';

export interface BaseTableColumn {
  /** Property key on the row object (also the cell/skeleton slot name suffix). */
  key: string;
  label: string;
  align?: 'left' | 'center' | 'right';
  /** Column width applied via <colgroup> (e.g. '200px', 'auto'). */
  width?: string;
  headerClass?: string;
}

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
  }>(),
  {
    loading: false,
    rowsPerPage: 10,
    rowHeight: 72,
    headerHeight: 53,
    emptyText: 'ไม่มีข้อมูล',
    minWidth: '720px',
    showIndex: false,
    indexLabel: 'ลำดับ',
    indexWidth: '64px',
    indexOffset: 0,
    page: 1,
    totalPages: 1,
    maxPages: 7,
  },
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

const totalColumnCount = computed(() => props.columns.length + (props.showIndex ? 1 : 0));

const fillerRowHeight = computed(() =>
  Math.max(0, (props.rowsPerPage - props.rows.length) * props.rowHeight),
);

const viewportHeight = computed(
  () => `${props.rowsPerPage * props.rowHeight + props.headerHeight}px`,
);
const bodyHeight = computed(() => `${props.rowsPerPage * props.rowHeight}px`);

const rowHeightCss = computed(() => `${props.rowHeight}px`);

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
  height: var(--base-table-body-height) !important;
  padding: 38px 18px;
  color: var(--base-table-empty-ink);
  text-align: center;
  vertical-align: middle;
}

.base-table__pagination {
  display: flex;
  justify-content: flex-end;
  min-height: 72px;
  padding: 22px 24px 24px;
}
</style>
