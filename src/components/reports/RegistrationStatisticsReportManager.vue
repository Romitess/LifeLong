<template>
  <div class="registration-statistics-report">
    <div class="row q-col-gutter-md registration-statistics-report__stats">
      <div v-for="stat in stats" :key="stat.label" class="col-12 col-sm-6 col-md-4">
        <BaseInfoCard
          variant="stat"
          :tone="stat.tone"
          :icon="stat.icon"
          :value="stat.value"
          :title="stat.label"
          :description="stat.description"
        />
      </div>
    </div>

    <AppSurfaceCard
      :eyebrow="t('finance.registrationStatistics.eyebrow')"
      :title="t('finance.registrationStatistics.cardTitle')"
      :subtitle="t('finance.registrationStatistics.cardSubtitle')"
      body-padding="none"
    >
      <template #header-actions>
        <div class="registration-statistics-report__header-actions">
          <q-select
            v-model="selectedFeeType"
            :options="feeTypeOptions"
            option-value="value"
            option-label="label"
            dense
            outlined
            emit-value
            map-options
            class="registration-statistics-report__filter"
            style="min-width: 160px"
            @update:model-value="handleSearch"
          />
          <AppSearchInput
            v-model="searchQuery"
            :placeholder="t('finance.registrationStatistics.searchPlaceholder')"
            class="registration-statistics-report__search"
            @update:model-value="handleSearch"
          />
          <TableExportActions
            :pdf-config="pdfConfig"
            :csv-config="csvConfig"
            :pdf-label="
              selectedRows.length > 0
                ? `${t('finance.registrationStatistics.export.pdfBtn')} (${selectedRows.length})`
                : t('finance.registrationStatistics.export.pdfBtn')
            "
            :csv-label="
              selectedRows.length > 0
                ? `${t('finance.registrationStatistics.export.csvBtn')} (${selectedRows.length})`
                : t('finance.registrationStatistics.export.csvBtn')
            "
            @exported="selectedRows = []"
          />
        </div>
      </template>

      <q-banner v-if="error" rounded dense class="bg-negative text-white q-ma-md">
        {{ error }}
      </q-banner>

      <BaseTable
        :columns="flatColumns"
        :rows="flatRows"
        :page="currentPage"
        :total-pages="pagination.totalPages"
        :rows-per-page="rowsPerPage"
        :loading="isLoading"
        show-index
        show-rows-per-page
        height-mode="auto"
        @page-change="handlePageChange"
        @rows-per-page-change="handleRowsPerPageChange"
      >
        <template #header-selection>
          <q-checkbox v-model="allSelected" dense />
        </template>

        <template #cell-selection="{ row }">
          <q-checkbox v-model="selectedRows" :val="row" dense />
        </template>
        <template #cell-courseName="{ row }">
          <div style="white-space: pre-wrap; word-break: break-word">
            {{ row.courseName }}
            <div style="color: #94a3b8; font-size: 0.78rem">{{ row.courseCode || '' }}</div>
          </div>
        </template>

        <template #cell-courseOwner="{ row }">
          {{ row.responsibleName || t('finance.registrationStatistics.table.noOwner') }}
        </template>

        <template #cell-facultyName="{ row }">
          {{ row.facultyName }}
        </template>

        <template #cell-dates="{ row }">
          {{ formatDateRange(row.startDate, row.endDate) }}
        </template>

        <template #cell-learnerCount="{ row }">
          {{ formatCount(row.learnerCount) }}
        </template>

        <template #cell-totalFee="{ row }">
          {{
            getSafeAmount(row.registrationFee) === 0
              ? '฿0'
              : formatCurrency(getSafeAmount(row.registrationFee))
          }}
        </template>
      </BaseTable>
    </AppSurfaceCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import AppSearchInput from 'components/common/AppSearchInput.vue';
import AppSurfaceCard from 'components/common/AppSurfaceCard.vue';
import BaseTable from 'components/base/BaseTable.vue';
import type { BaseTableColumn } from 'components/base/BaseTable.vue';
import TableExportActions from 'components/common/TableExportActions.vue';
import type { PdfExportConfig, CsvExportConfig } from 'src/types/export-types';
import { useAdminRegistrationStatisticsReport } from 'src/composables/use-admin-registration-statistics-report';
import type { AdminRegistrationStatisticsReportResponse } from 'src/types/admin-registration-statistics-report';
import { formatCount, formatCurrency } from 'src/utils/course-format';
import { useI18n } from 'vue-i18n';
import { date } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';

interface DateRangeValue {
  start: string | null;
  end: string | null;
}

const props = defineProps<{
  initialFacultyId?: number | null;
  showFacultyFilter?: boolean;
  mockData?: AdminRegistrationStatisticsReportResponse;
}>();

const rowsPerPage = ref(10);
const currentPage = ref(1);
const searchQuery = ref('');
const dateRange = ref<DateRangeValue>({
  start: null,
  end: null,
});
const selectedFacultyId = ref<number | null>(null);
const selectedTypeCourseId = ref<number | null>(null);
const selectedFeeType = ref<'all' | 'free' | 'paid'>('all');

const feeTypeOptions = computed(() => [
  { label: t('finance.registrationStatistics.filter.allFees'), value: 'all' },
  { label: t('finance.registrationStatistics.filter.free'), value: 'free' },
  { label: t('finance.registrationStatistics.filter.paid'), value: 'paid' },
]);
const selectedRows = ref<FlatCourseRow[]>([]);

const allSelected = computed({
  get() {
    return flatRows.value.length > 0 && selectedRows.value.length === flatRows.value.length;
  },
  set(val: boolean) {
    if (val) {
      selectedRows.value = [...flatRows.value];
    } else {
      selectedRows.value = [];
    }
  },
});

const { groups, filterOptions, summary, pagination, generatedAt, isLoading, error, fetchData } =
  useAdminRegistrationStatisticsReport();

const { t, locale } = useI18n();
const authStore = useAuthStore();
const userFacName = computed(() => authStore.user?.facName || authStore.user?.faculty || 'All');

const FACULTY_I18N_MAP: Record<string, string> = {
  คณะวิทยาการสารสนเทศ: 'informatics',
  คณะวิทยาศาสตร์: 'science',
  คณะพยาบาลศาสตร์: 'nursing',
  คณะบริหารธุรกิจ: 'business',
  คณะวิศวกรรมศาสตร์: 'engineering',
  สำนักคอมพิวเตอร์: 'computerCenter',
  คณะมนุษยศาสตร์และสังคมศาสตร์: 'humanities',
};

const stats = computed<
  {
    label: string;
    value: string;
    description: string;
    icon: string;
    tone: 'primary' | 'indigo' | 'positive';
  }[]
>(() => [
  {
    label: t('finance.registrationStatistics.stats.coursesFound'),
    value: formatCount(summary.value.totalCourses),
    description: t('finance.registrationStatistics.stats.coursesFoundDesc'),
    icon: 'menu_book',
    tone: 'primary',
  },
  {
    label: t('finance.registrationStatistics.stats.totalLearners'),
    value: formatCount(summary.value.totalLearners),
    description: t('finance.registrationStatistics.stats.totalLearnersDesc'),
    icon: 'groups',
    tone: 'indigo',
  },
  {
    label: t('finance.registrationStatistics.stats.totalFees'),
    value: formatCurrency(summary.value.totalRegistrationFees),
    description: t('finance.registrationStatistics.stats.totalFeesDesc'),
    icon: 'payments',
    tone: 'positive',
  },
]);

interface FlatCourseRow {
  courseId: number;
  courseCode: string | null;
  courseName: string;
  responsibleName: string | null;
  facultyName: string;
  startDate: string | null;
  endDate: string | null;
  learnerCount: number;
  unitPrice: number;
  registrationFee: number;
}

const flatRows = computed<FlatCourseRow[]>(() => {
  const rows: FlatCourseRow[] = [];
  for (const group of groups.value) {
    for (const item of group.items) {
      rows.push({
        courseId: item.courseId,
        courseCode: item.courseCode,
        courseName: item.courseName,
        responsibleName: item.responsibleName,
        facultyName: (() => {
          const key = FACULTY_I18N_MAP[group.facultyName];
          return key ? t(`common.faculties.${key}`) : group.facultyName;
        })(),
        startDate: item.startDate,
        endDate: item.endDate,
        learnerCount: item.learnerCount,
        unitPrice: item.unitPrice,
        registrationFee: item.registrationFee,
      });
    }
  }
  return rows;
});

const flatColumns = computed<BaseTableColumn[]>(() => [
  {
    key: 'selection',
    label: '',
    align: 'center',
    sortable: false,
    width: '40px',
  },
  {
    key: 'courseName',
    label: t('finance.registrationStatistics.table.courseName'),
    sortable: true,
  },
  {
    key: 'courseOwner',
    label: t('finance.registrationStatistics.table.courseOwner'),
    sortable: true,
    width: '220px',
  },
  {
    key: 'facultyName',
    label: t('finance.registrationStatistics.table.faculty'),
    sortable: true,
    width: '200px',
  },
  {
    key: 'dates',
    label: t('finance.registrationStatistics.table.dates'),
    sortable: true,
    width: '220px',
  },
  {
    key: 'learnerCount',
    label: t('finance.registrationStatistics.table.learnersCount'),
    align: 'right',
    sortable: true,
    width: '140px',
  },
  {
    key: 'totalFee',
    label: t('finance.registrationStatistics.table.totalFee'),
    align: 'right',
    sortable: true,
    width: '160px',
  },
]);

const pdfConfig = computed<PdfExportConfig | null>(() => {
  const dataToExport = selectedRows.value.length > 0 ? selectedRows.value : flatRows.value;
  if (dataToExport.length === 0) return null;

  const rows = dataToExport.map((row, index) => [
    index + 1,
    row.courseCode ? `${row.courseCode} : ${row.courseName}` : row.courseName,
    row.facultyName,
    row.responsibleName || '-',
    formatDateRange(row.startDate, row.endDate),
    row.learnerCount,
    formatCurrency(getSafeAmount(row.registrationFee)),
  ]);

  const todayStr = date.formatDate(new Date(), 'DDMMYYYY');
  const facNameStr = userFacName.value.replace(/\s+/g, '_');
  const filename = `facultyreport_${facNameStr}_${todayStr}`;

  return {
    filename,
    titles: [t('finance.registrationStatistics.export.reportTitle')],
    titleStartY: 40,
    startY: 55,
    head: [
      [
        t('finance.registrationStatistics.export.no'),
        t('finance.registrationStatistics.export.courseName'),
        t('finance.registrationStatistics.export.faculty'),
        t('finance.registrationStatistics.export.owner'),
        t('finance.registrationStatistics.export.dates'),
        t('finance.registrationStatistics.export.learners'),
        t('finance.registrationStatistics.export.fees'),
      ],
    ],
    body: rows,
    styles: {
      fontSize: 8,
      cellPadding: 4,
      valign: 'top',
    },
    headStyles: {
      fontSize: 8,
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 30 },
      1: {},
      2: {},
      3: {},
      4: { halign: 'center', cellWidth: 100 },
      5: { halign: 'center', cellWidth: 60 },
      6: { halign: 'right', cellWidth: 70 },
    },
  };
});

const csvConfig = computed<CsvExportConfig | null>(() => {
  const dataToExport = selectedRows.value.length > 0 ? selectedRows.value : flatRows.value;
  if (dataToExport.length === 0) return null;

  const todayStr = date.formatDate(new Date(), 'DD_MM_YYYY');
  const facNameStr = userFacName.value.replace(/\s+/g, '_');

  return {
    filename: `facultyreport_${facNameStr}_${todayStr}.csv`,
    headers: [
      t('finance.registrationStatistics.export.no'),
      t('finance.registrationStatistics.export.courseName'),
      t('finance.registrationStatistics.export.courseCode'),
      t('finance.registrationStatistics.export.faculty'),
      t('finance.registrationStatistics.export.owner'),
      t('finance.registrationStatistics.export.dates'),
      t('finance.registrationStatistics.export.learners'),
      t('finance.registrationStatistics.export.fees'),
    ],
    data: dataToExport.map((row, index) => [
      index + 1,
      row.courseName,
      row.courseCode || '',
      row.facultyName,
      row.responsibleName || '-',
      formatDateRange(row.startDate, row.endDate),
      row.learnerCount,
      getSafeAmount(row.registrationFee),
    ]),
  };
});

function handleRowsPerPageChange(val: number) {
  rowsPerPage.value = val;
  currentPage.value = 1;
  selectedRows.value = [];
  void loadReport(1);
}

watch(
  () => props.initialFacultyId,
  (facultyId) => {
    selectedFacultyId.value = facultyId ?? null;
  },
  { immediate: true },
);

watch(
  () => props.mockData,
  (data) => {
    if (!data) {
      return;
    }

    groups.value = data.groups;
    filterOptions.value = data.filterOptions;
    summary.value = data.summary;
    pagination.value = data.pagination;
    generatedAt.value = data.generatedAt;
    isLoading.value = false;
    error.value = null;
  },
  { immediate: true },
);

function normalizeDateForApi(value: string | null): string | null {
  if (!value) {
    return null;
  }

  const trimmedValue = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
    return trimmedValue;
  }

  const slashDateMatch = trimmedValue.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!slashDateMatch) {
    return null;
  }

  const [, day, month, year] = slashDateMatch;
  return `${year}-${month}-${day}`;
}

function getSafeAmount(value: number): number {
  return Number.isFinite(value) ? value : 0;
}

function applyMockFilters(page = 1): void {
  if (!props.mockData) {
    return;
  }

  const normalizedStartDate = normalizeDateForApi(dateRange.value.start);
  const normalizedEndDate = normalizeDateForApi(dateRange.value.end);
  const searchLower = searchQuery.value.trim().toLowerCase();

  const filteredGroups = props.mockData.groups
    .map((group) => {
      const filteredItems = group.items.filter((item) => {
        const matchesFaculty =
          selectedFacultyId.value === null ||
          selectedFacultyId.value === undefined ||
          group.facultyId === selectedFacultyId.value;

        const matchesDateRange =
          (!normalizedStartDate || !item.startDate || item.startDate >= normalizedStartDate) &&
          (!normalizedEndDate || !item.endDate || item.endDate <= normalizedEndDate);

        const matchesSearch =
          !searchLower ||
          item.courseName?.toLowerCase().includes(searchLower) ||
          item.courseCode?.toLowerCase().includes(searchLower) ||
          item.responsibleName?.toLowerCase().includes(searchLower);

        const fee = getSafeAmount(item.unitPrice) + getSafeAmount(item.registrationFee);
        const matchesFeeType =
          !selectedFeeType.value ||
          selectedFeeType.value === 'all' ||
          (selectedFeeType.value === 'free' && fee === 0) ||
          (selectedFeeType.value === 'paid' && fee > 0);

        return matchesFaculty && matchesDateRange && matchesSearch && matchesFeeType;
      });

      const normalizedItems = filteredItems.map((item, index) => ({
        ...item,
        rowNumber: index + 1,
      }));

      const totalLearners = normalizedItems.reduce((total, item) => total + item.learnerCount, 0);
      const totalRegistrationFees = normalizedItems.reduce(
        (total, item) => total + item.registrationFee,
        0,
      );

      return {
        ...group,
        totalCourses: normalizedItems.length,
        totalLearners,
        totalRegistrationFees,
        items: normalizedItems,
      };
    })
    .filter((group) => group.items.length > 0);

  const paginatedGroups = filteredGroups.slice(
    (page - 1) * rowsPerPage.value,
    page * rowsPerPage.value,
  );

  groups.value = paginatedGroups;
  summary.value = {
    totalCourses: filteredGroups.reduce((total, group) => total + group.totalCourses, 0),
    totalLearners: filteredGroups.reduce((total, group) => total + group.totalLearners, 0),
    totalRegistrationFees: filteredGroups.reduce(
      (total, group) => total + group.totalRegistrationFees,
      0,
    ),
  };
  pagination.value = {
    page,
    pageSize: rowsPerPage.value,
    total: filteredGroups.length,
    totalPages: Math.max(1, Math.ceil(filteredGroups.length / rowsPerPage.value)),
  };
  generatedAt.value = props.mockData.generatedAt;
  isLoading.value = false;
  error.value = null;
}

function loadReport(page = 1): Promise<void> {
  if (props.mockData) {
    applyMockFilters(page);
    return Promise.resolve();
  }

  return fetchData({
    page,
    pageSize: rowsPerPage.value,
    startDate: normalizeDateForApi(dateRange.value.start),
    endDate: normalizeDateForApi(dateRange.value.end),
    facultyId: selectedFacultyId.value,
    typeCourseId: selectedTypeCourseId.value,
    feeType: selectedFeeType.value === 'all' ? null : selectedFeeType.value,
    search: searchQuery.value || null,
  });
}

async function handleSearch(): Promise<void> {
  currentPage.value = 1;
  selectedRows.value = [];
  await loadReport(1);
}

async function handlePageChange(page: number): Promise<void> {
  if (page === currentPage.value && page === pagination.value.page) {
    return;
  }

  currentPage.value = page;
  selectedRows.value = [];
  await loadReport(page);
}

function formatDate(value: string | null): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return '-';
  }

  const localeStr = locale.value === 'th' ? 'th-TH' : 'en-US';
  return new Intl.DateTimeFormat(localeStr, {
    dateStyle: 'medium',
  }).format(date);
}

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) {
    return '-';
  }

  if (startDate && endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  return startDate
    ? `${t('finance.registrationStatistics.table.startPrefix')} ${formatDate(startDate)}`
    : `${t('finance.registrationStatistics.table.endPrefix')} ${formatDate(endDate)}`;
}

onMounted(() => {
  if (props.mockData) {
    return;
  }

  void loadReport();
});
</script>

<style lang="scss" scoped>
.registration-statistics-report__stats {
  margin-bottom: 18px;
}

.registration-statistics-report__header-actions {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 599px) {
    flex-direction: column;
    align-items: stretch;
    width: 100%;
  }
}

.registration-statistics-report__date-filter,
.registration-statistics-report__field,
.registration-statistics-report__select {
  min-width: 0;
}

.registration-statistics-report__field {
  display: grid;
  gap: 6px;
  align-content: start;
}

.registration-statistics-report__field-label {
  color: #6b7280;
  font-size: 0.78rem;
  font-weight: 600;
}

.registration-statistics-report__field-label--ghost {
  visibility: hidden;
}

.registration-statistics-report__field-label,
.registration-statistics-report__field-label--ghost {
  min-height: 24px;
}

.registration-statistics-report__filter-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  margin-bottom: 22px; /* Match q-field__bottom height */
}

.registration-statistics-report__filter-btn {
  min-height: 40px;
  height: 40px;
  padding: 0 20px;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 800;
}

.registration-statistics-report__filter-btn--primary {
  box-shadow: 0 10px 22px rgba($primary, 0.2);
}

.registration-statistics-report__export-btn {
  min-height: 38px;
  height: 38px;
  padding: 0 16px;
  border-radius: 12px;
  font-size: 0.88rem;
  font-weight: 700;
  box-shadow: 0 8px 18px rgba(0, 121, 107, 0.16);
}

.registration-statistics-report__search {
  min-width: 220px;
  flex: 1 1 220px;

  @media (max-width: 599px) {
    min-width: 0;
    flex: none;
  }
}

.registration-statistics-report__filter {
  :deep(.q-field__control) {
    background: #ffffff !important;
  }

  :deep(.q-field__control::before) {
    border-color: rgba(17, 24, 39, 0.14) !important;
  }

  :deep(.q-field__control:hover::before) {
    border-color: rgba(17, 24, 39, 0.22) !important;
  }

  &.q-field--focused :deep(.q-field__control::after) {
    border-color: var(--q-primary) !important;
  }

  :deep(.q-field__native),
  :deep(.q-field__input) {
    color: #1f2937;
    font-size: 0.95rem;
    font-weight: 500;
  }
}

.registration-statistics-report__action-spacer {
  min-height: 22px;
}

.registration-statistics-report__select {
  :deep(.q-field__bottom) {
    min-height: 22px;
    padding-top: 4px;
  }
}

.registration-statistics-report__date-filter {
  :deep(.base-date-range-filter__label) {
    min-height: 24px;
  }
}

@media (max-width: 1200px) {
  .registration-statistics-report__filters {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .registration-statistics-report__filters--compact {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .registration-statistics-report__filter-actions {
    justify-content: flex-start;
  }
}

.registration-statistics-report__filters--compact {
  grid-template-columns: minmax(260px, 1.2fr) minmax(220px, 1fr) auto;
}

@media (max-width: 900px) {
  .registration-statistics-report__filters {
    grid-template-columns: 1fr;
  }
}
</style>
