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
        <div class="row items-center q-gutter-x-sm">
          <AppSearchInput
            v-model="searchQuery"
            placeholder="ค้นหา..."
            class="registration-statistics-report__search"
            @update:model-value="handleSearch"
          />
          <TableExportActions
            :pdf-config="pdfConfig"
            :csv-config="csvConfig"
            pdf-label="ส่งออก PDF"
            csv-label="ส่งออก CSV"
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

const { groups, filterOptions, summary, pagination, generatedAt, isLoading, error, fetchData } =
  useAdminRegistrationStatisticsReport();

const { t } = useI18n();

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
        facultyName: group.facultyName,
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
  if (flatRows.value.length === 0) return null;

  const rows = flatRows.value.map((row, index) => [
    index + 1,
    row.courseCode ? `${row.courseCode} : ${row.courseName}` : row.courseName,
    row.facultyName,
    row.responsibleName || '-',
    formatDateRange(row.startDate, row.endDate),
    row.learnerCount,
    formatCurrency(getSafeAmount(row.registrationFee)),
  ]);

  const todayStr = date.formatDate(new Date(), 'DDMMYYYY');
  const filename = `registration_statistics_${todayStr}`;

  return {
    filename,
    titles: ['รายงานสถิติการลงทะเบียน'],
    titleStartY: 40,
    startY: 55,
    head: [
      [
        'ลำดับ',
        'ชื่อรายวิชา',
        'คณะ/ส่วนงาน',
        'ผู้รับผิดชอบรายวิชา',
        'วันที่เปิด-ปิดการเรียนการสอน',
        'จำนวนผู้เรียน (คน)',
        'ค่าลงทะเบียนรวม (บาท)',
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
      0: { halign: 'center', cellWidth: 28 },
      1: { cellWidth: 150 },
      2: { cellWidth: 90 },
      3: { cellWidth: 90 },
      4: { halign: 'center', cellWidth: 80 },
      5: { halign: 'center', cellWidth: 50 },
      6: { halign: 'right', cellWidth: 60 },
    },
  };
});

const csvConfig = computed<CsvExportConfig | null>(() => {
  if (flatRows.value.length === 0) return null;

  return {
    filename: `registration_statistics_${date.formatDate(new Date(), 'DDMMYYYY')}.csv`,
    headers: [
      'ลำดับ',
      'ชื่อรายวิชา',
      'รหัสวิชา',
      'คณะ/ส่วนงาน',
      'ผู้รับผิดชอบรายวิชา',
      'วันที่เปิด-ปิดการเรียนการสอน',
      'จำนวนผู้เรียน (คน)',
      'ค่าลงทะเบียนรวม (บาท)',
    ],
    data: flatRows.value.map((row, index) => [
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

        return matchesFaculty && matchesDateRange && matchesSearch;
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
    search: searchQuery.value || null,
  });
}

async function handleSearch(): Promise<void> {
  currentPage.value = 1;
  await loadReport(1);
}

async function handlePageChange(page: number): Promise<void> {
  if (page === currentPage.value && page === pagination.value.page) {
    return;
  }

  currentPage.value = page;
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

  return new Intl.DateTimeFormat('th-TH', {
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
  min-width: 260px;
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
