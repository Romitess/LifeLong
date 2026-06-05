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
            :placeholder="t('finance.registrationStatistics.searchPlaceholder')"
            class="registration-statistics-report__search"
            @update:model-value="handleSearch"
          />
          <AppActionButton
            variant="primary"
            icon="download"
            :label="t('finance.registrationStatistics.exportBtn')"
            class="registration-statistics-report__export-btn"
            @click="exportDialogOpen = true"
          />
        </div>
      </template>

      <AdminRegistrationExportDialog
        v-model="exportDialogOpen"
        :date-range="dateRange"
        :faculty-id="selectedFacultyId"
        :type-course-id="selectedTypeCourseId"
        :faculty-options="facultyOptions"
        :course-type-options="courseTypeOptions"
      />

      <q-banner v-if="error" rounded dense class="bg-negative text-white q-ma-md">
        {{ error }}
      </q-banner>

      <div class="registration-statistics-report__table-wrap">
        <table class="registration-statistics-report-table">
          <colgroup>
            <col class="registration-statistics-report-table__col-index" />
            <col class="registration-statistics-report-table__col-course" />
            <col class="registration-statistics-report-table__col-owner" />
            <col class="registration-statistics-report-table__col-dates" />
            <col class="registration-statistics-report-table__col-learners" />
            <col class="registration-statistics-report-table__col-fee" />
          </colgroup>
          <thead>
            <tr>
              <th class="registration-statistics-report-table__index">
                {{ t('finance.registrationStatistics.table.index') }}
              </th>
              <th>{{ t('finance.registrationStatistics.table.courseName') }}</th>
              <th>{{ t('finance.registrationStatistics.table.courseOwner') }}</th>
              <th>{{ t('finance.registrationStatistics.table.dates') }}</th>
              <th class="text-right">
                {{ t('finance.registrationStatistics.table.learnersCount') }}
              </th>
              <th class="text-right">{{ t('finance.registrationStatistics.table.totalFee') }}</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="isLoading">
              <tr
                v-for="skeletonIndex in rowsPerPage"
                :key="`registration-skeleton-${skeletonIndex}`"
                class="registration-statistics-report-table__skeleton-row"
              >
                <td class="registration-statistics-report-table__index">
                  <q-skeleton type="text" width="24px" class="q-mx-auto" />
                </td>
                <td>
                  <div class="registration-statistics-report__course-cell">
                    <q-skeleton type="QAvatar" size="42px" />
                    <div
                      class="registration-statistics-report__course-copy registration-statistics-report__course-copy--skeleton"
                    >
                      <q-skeleton type="text" width="85%" />
                      <q-skeleton type="text" width="38%" />
                    </div>
                  </div>
                </td>
                <td><q-skeleton type="QChip" width="90%" /></td>
                <td>
                  <div class="registration-statistics-report__date-cell">
                    <q-skeleton type="text" width="78%" />
                    <q-skeleton type="text" width="44%" />
                  </div>
                </td>
                <td class="text-right">
                  <div class="registration-statistics-report__metric-cell">
                    <q-skeleton
                      type="text"
                      width="40px"
                      class="registration-statistics-report__metric-skeleton"
                    />
                    <q-skeleton
                      type="text"
                      width="24px"
                      class="registration-statistics-report__metric-skeleton"
                    />
                  </div>
                </td>
                <td class="text-right">
                  <div class="registration-statistics-report__metric-cell">
                    <q-skeleton
                      type="text"
                      width="72px"
                      class="registration-statistics-report__metric-skeleton"
                    />
                    <q-skeleton
                      type="text"
                      width="36px"
                      class="registration-statistics-report__metric-skeleton"
                    />
                  </div>
                </td>
              </tr>
            </template>

            <template v-else-if="groups.length > 0">
              <template v-for="group in groups" :key="group.facultyId">
                <tr class="registration-statistics-report-table__group-row">
                  <td colspan="6">
                    <div class="registration-statistics-report__group-header">
                      <div class="registration-statistics-report__group-heading">
                        <span>{{ t('finance.registrationStatistics.table.faculty') }}</span>
                        <strong>{{ group.facultyName }}</strong>
                      </div>
                    </div>
                  </td>
                </tr>

                <tr
                  v-for="item in group.items"
                  :key="`${group.facultyId}-${item.courseId}`"
                  class="registration-statistics-report-table__data-row"
                >
                  <td class="registration-statistics-report-table__index">
                    {{ item.rowNumber }}
                  </td>
                  <td>
                    <div class="registration-statistics-report__course-cell">
                      <span class="registration-statistics-report__course-icon">
                        <q-icon name="school" />
                      </span>
                      <div class="registration-statistics-report__course-copy">
                        <strong>{{ item.courseName }}</strong>
                        <span>{{ item.courseCode || `COURSE-${item.courseId}` }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="registration-statistics-report__owner-cell">
                      <span class="registration-statistics-report__owner-chip">
                        <q-icon name="badge" size="15px" />
                        {{
                          item.responsibleName || t('finance.registrationStatistics.table.noOwner')
                        }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="registration-statistics-report__date-cell">
                      <strong>{{ formatDateRange(item.startDate, item.endDate) }}</strong>
                      <span>{{ getDateHint(item.startDate) }}</span>
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="registration-statistics-report__metric-cell">
                      <strong>{{ formatCount(item.learnerCount) }}</strong>
                      <span>{{ t('finance.registrationStatistics.table.learnersSuffix') }}</span>
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="registration-statistics-report__metric-cell">
                      <strong>{{
                        getSafeAmount(item.registrationFee) === 0
                          ? '฿0'
                          : formatCurrency(getSafeAmount(item.registrationFee))
                      }}</strong>
                      <span>{{
                        getUnitPriceLabel(item.unitPrice, item.registrationFee, item.learnerCount)
                      }}</span>
                    </div>
                  </td>
                </tr>

                <tr class="registration-statistics-report-table__group-total-row">
                  <td colspan="4" class="registration-statistics-report-table__group-total-label">
                    {{ t('finance.registrationStatistics.table.groupTotalPrefix') }}
                  </td>
                  <td class="text-right">
                    <div class="registration-statistics-report__metric-cell">
                      <strong>{{ formatCount(group.totalLearners) }}</strong>
                      <span>{{ t('finance.registrationStatistics.table.learnersSuffix') }}</span>
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="registration-statistics-report__metric-cell">
                      <strong>{{ formatCurrency(group.totalRegistrationFees) }}</strong>
                      <span>{{ t('finance.registrationStatistics.table.totalFee') }}</span>
                    </div>
                  </td>
                </tr>
              </template>
            </template>

            <tr v-else>
              <td colspan="6" class="registration-statistics-report-table__empty">
                {{ t('finance.registrationStatistics.table.noData') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="pagination.totalPages > 1"
        ref="paginationRef"
        class="registration-statistics-report__pagination"
      >
        <BasePagination
          :model-value="currentPage"
          :max="pagination.totalPages"
          :max-pages="7"
          gutter="md"
          :disable="isLoading"
          @update:model-value="handlePageChange"
        />
      </div>
    </AppSurfaceCard>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import AppActionButton from 'components/admin/AppActionButton.vue';
import AdminRegistrationExportDialog from 'components/admin/AdminRegistrationExportDialog.vue';
import AppSearchInput from 'components/admin/AppSearchInput.vue';
import AppSurfaceCard from 'components/admin/AppSurfaceCard.vue';
import BasePagination from 'components/base/BasePagination.vue';
import { useAdminRegistrationStatisticsReport } from 'src/composables/use-admin-registration-statistics-report';
import type { AdminRegistrationStatisticsReportResponse } from 'src/types/admin-registration-statistics-report';
import { formatCount, formatCurrency } from 'src/utils/course-format';
import { useI18n } from 'vue-i18n';

interface DateRangeValue {
  start: string | null;
  end: string | null;
}

const props = defineProps<{
  initialFacultyId?: number | null;
  showFacultyFilter?: boolean;
  mockData?: AdminRegistrationStatisticsReportResponse;
}>();

const rowsPerPage = 10;
const currentPage = ref(1);
const paginationRef = ref<HTMLElement | null>(null);
const exportDialogOpen = ref(false);
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

const facultyOptions = computed(() => filterOptions.value.faculties);
const courseTypeOptions = computed(() => filterOptions.value.courseTypes);

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

function getUnitPriceLabel(
  unitPrice: number,
  registrationFee: number,
  learnerCount: number,
): string {
  const safeUnitPrice = Number.isFinite(unitPrice) ? unitPrice : 0;
  const safeRegistrationFee = getSafeAmount(registrationFee);
  const safeLearnerCount = Number.isFinite(learnerCount) ? learnerCount : 0;
  const fallbackUnitPrice =
    safeUnitPrice > 0
      ? safeUnitPrice
      : safeLearnerCount > 0
        ? Math.round(safeRegistrationFee / safeLearnerCount)
        : 0;

  return fallbackUnitPrice === 0
    ? t('finance.registrationStatistics.table.priceSetFree')
    : `${t('finance.registrationStatistics.table.priceSetPrefix')} ${formatCurrency(fallbackUnitPrice)}`;
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

  const paginatedGroups = filteredGroups.slice((page - 1) * rowsPerPage, page * rowsPerPage);

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
    pageSize: rowsPerPage,
    total: filteredGroups.length,
    totalPages: Math.max(1, Math.ceil(filteredGroups.length / rowsPerPage)),
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
    pageSize: rowsPerPage,
    startDate: normalizeDateForApi(dateRange.value.start),
    endDate: normalizeDateForApi(dateRange.value.end),
    facultyId: selectedFacultyId.value,
    typeCourseId: selectedTypeCourseId.value,
    search: searchQuery.value || null,
  });
}

async function preservePaginationPosition(update: () => Promise<void> | void): Promise<void> {
  const anchorTop =
    typeof window !== 'undefined' ? paginationRef.value?.getBoundingClientRect().top : undefined;

  await update();
  await nextTick();

  if (typeof window === 'undefined' || anchorTop === undefined || !paginationRef.value) {
    return;
  }

  const nextTop = paginationRef.value.getBoundingClientRect().top;
  if (Math.abs(nextTop - anchorTop) < 1) {
    return;
  }

  window.scrollBy({ top: nextTop - anchorTop, behavior: 'auto' });
}

async function handleSearch(): Promise<void> {
  currentPage.value = 1;
  await loadReport(1);
}

async function handlePageChange(page: number): Promise<void> {
  if (page === currentPage.value && page === pagination.value.page) {
    return;
  }

  await preservePaginationPosition(async () => {
    currentPage.value = page;
    await loadReport(page);
  });
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

function getDateHint(startDate: string | null): string {
  if (!startDate) {
    return t('finance.registrationStatistics.table.noStartDate');
  }

  return `${t('finance.registrationStatistics.table.startHint')} ${formatDate(startDate)}`;
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

.registration-statistics-report__table-wrap {
  overflow-x: auto;
  min-height: 0;
}

.registration-statistics-report-table {
  width: 100%;
  min-width: 1080px;
  border-collapse: collapse;

  th,
  td {
    padding: 16px 18px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    vertical-align: middle;
  }

  thead th {
    border-bottom: none;
  }

  thead th {
    color: #475467;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: #f8fafc;
  }

  tbody tr.registration-statistics-report-table__group-row:hover,
  tbody tr.registration-statistics-report-table__group-total-row:hover,
  tbody tr.registration-statistics-report-table__skeleton-row:hover {
    background: transparent;
  }

  tbody tr:nth-child(even) {
    background: rgba(248, 250, 252, 0.58);
  }

  tbody tr:hover {
    background: rgba(245, 166, 35, 0.05);
  }
}

.registration-statistics-report-table__col-index {
  width: 88px;
}

.registration-statistics-report-table__col-owner {
  width: 260px;
}

.registration-statistics-report-table__col-dates {
  width: 250px;
}

.registration-statistics-report-table__col-learners,
.registration-statistics-report-table__col-fee {
  width: 160px;
}

.registration-statistics-report-table__index {
  text-align: center;
  color: #1d4ed8;
  font-weight: 800;
}

.registration-statistics-report-table__group-row td {
  padding: 0;
  background: #ffffff !important;
  border-bottom: none;
  border-top: none;
}

.registration-statistics-report__group-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 18px 22px 14px;
  margin-top: 0;
  border-top: 1px solid rgba(245, 166, 35, 0.18);
  background: linear-gradient(90deg, rgba(245, 166, 35, 0.1), rgba(255, 255, 255, 0.98));
}

.registration-statistics-report__group-heading {
  display: grid;
  gap: 4px;

  span {
    color: #b7791f;
    font-size: 0.72rem;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  strong {
    color: var(--admin-navy);
    font-size: 1rem;
    font-weight: 900;
    line-height: 1.35;
  }
}

.registration-statistics-report-table__group-total-row td {
  background: rgba(248, 250, 252, 0.88) !important;
}

.registration-statistics-report-table__group-total-label {
  color: var(--admin-navy);
  font-size: 0.86rem;
  font-weight: 850;
}

.registration-statistics-report-table__empty {
  min-height: 220px;
  padding: 38px 18px !important;
  color: #64748b;
  text-align: center;
  vertical-align: middle !important;
}

.registration-statistics-report-table__skeleton-row td {
  background: #ffffff;
}

.registration-statistics-report__course-cell {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.registration-statistics-report__course-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 14px;
  color: #ffffff;
  background: linear-gradient(135deg, $primary, #d88b0a);
  box-shadow: 0 10px 18px rgba($primary, 0.22);
  flex: 0 0 42px;
}

.registration-statistics-report__course-copy {
  display: flex;
  min-width: 0;
  min-height: 50px;
  flex-direction: column;
  justify-content: center;
  gap: 4px;

  strong {
    display: -webkit-box;
    color: var(--admin-navy);
    font-size: 0.95rem;
    font-weight: 850;
    line-height: 1.42;
    overflow: hidden;
    overflow-wrap: anywhere;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    text-wrap: pretty;
  }

  span {
    color: var(--admin-muted);
    font-size: 0.75rem;
    font-weight: 700;
    white-space: nowrap;
  }
}

.registration-statistics-report__course-copy--skeleton {
  width: 100%;
}

.registration-statistics-report__owner-cell {
  display: flex;
}

.registration-statistics-report__owner-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  color: #0f766e;
  background: rgba(20, 184, 166, 0.1);
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.4;
  max-width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.registration-statistics-report__owner-chip :deep(.q-icon) {
  flex-shrink: 0;
  color: currentColor;
}

thead th {
  border-bottom: none;
}

/* Remove top border for group header row so it sticks to thead */
tbody tr.registration-statistics-report-table__group-row td {
  border-top: none !important;
}

.registration-statistics-report__date-cell,
.registration-statistics-report__metric-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    display: -webkit-box;
    color: var(--admin-navy);
    font-size: 0.95rem;
    font-weight: 850;
    line-height: 1.42;
    overflow: hidden;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  span {
    color: var(--admin-muted);
    font-size: 0.75rem;
    font-weight: 700;
  }
}

.registration-statistics-report__metric-cell {
  align-items: flex-end;
}

.registration-statistics-report__metric-skeleton {
  margin-left: auto;
}

.registration-statistics-report__pagination {
  display: flex;
  justify-content: center;
  min-height: 72px;
  padding: 22px 24px 24px;
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

  .registration-statistics-report__group-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .registration-statistics-report__group-metrics {
    justify-content: flex-start;
  }

  .registration-statistics-report__table-wrap,
  .registration-statistics-report-table__empty {
    min-height: 680px;
    height: 680px;
  }
}
</style>
