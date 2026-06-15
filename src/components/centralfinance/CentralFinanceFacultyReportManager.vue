<template>
  <div class="centralfinance-faculty-report">
    <div class="row q-col-gutter-md centralfinance-faculty-report__stats">
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
          <q-input
            v-model="searchQuery"
            :placeholder="t('finance.registrationStatistics.searchPlaceholder')"
            outlined
            dense
            class="bg-white centralfinance-faculty-report__search"
            @update:model-value="handleSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="grey-6" />
            </template>
          </q-input>
          <q-btn
            color="primary"
            icon="download"
            :label="t('finance.registrationStatistics.exportBtn')"
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
        export-endpoint="/api/centralfinance/reports/registration-statistics/export"
      />

      <q-banner v-if="error" rounded dense class="bg-negative text-white q-ma-md">
        {{ error }}
      </q-banner>

      <div class="centralfinance-faculty-report__table-wrap">
        <table class="centralfinance-faculty-report-table">
          <colgroup>
            <col class="centralfinance-faculty-report-table__col-index" />
            <col class="centralfinance-faculty-report-table__col-course" />
            <col class="centralfinance-faculty-report-table__col-owner" />
            <col class="centralfinance-faculty-report-table__col-dates" />
            <col class="centralfinance-faculty-report-table__col-learners" />
            <col class="centralfinance-faculty-report-table__col-fee" />
          </colgroup>
          <thead>
            <tr>
              <th class="centralfinance-faculty-report-table__index">
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
                :key="`skeleton-${skeletonIndex}`"
                class="centralfinance-faculty-report-table__skeleton-row"
              >
                <td class="centralfinance-faculty-report-table__index">
                  <q-skeleton type="text" width="24px" class="q-mx-auto" />
                </td>
                <td>
                  <div class="centralfinance-faculty-report__course-cell">
                    <q-skeleton type="QAvatar" size="42px" />
                    <div
                      class="centralfinance-faculty-report__course-copy centralfinance-faculty-report__course-copy--skeleton"
                    >
                      <q-skeleton type="text" width="85%" />
                      <q-skeleton type="text" width="38%" />
                    </div>
                  </div>
                </td>
                <td><q-skeleton type="QChip" width="90%" /></td>
                <td>
                  <div class="centralfinance-faculty-report__date-cell">
                    <q-skeleton type="text" width="78%" />
                    <q-skeleton type="text" width="44%" />
                  </div>
                </td>
                <td class="text-right">
                  <div class="centralfinance-faculty-report__metric-cell">
                    <q-skeleton
                      type="text"
                      width="40px"
                      class="centralfinance-faculty-report__metric-skeleton"
                    />
                    <q-skeleton
                      type="text"
                      width="24px"
                      class="centralfinance-faculty-report__metric-skeleton"
                    />
                  </div>
                </td>
                <td class="text-right">
                  <div class="centralfinance-faculty-report__metric-cell">
                    <q-skeleton
                      type="text"
                      width="72px"
                      class="centralfinance-faculty-report__metric-skeleton"
                    />
                    <q-skeleton
                      type="text"
                      width="36px"
                      class="centralfinance-faculty-report__metric-skeleton"
                    />
                  </div>
                </td>
              </tr>
            </template>

            <template v-else-if="groups.length > 0">
              <template v-for="group in groups" :key="group.facultyId">
                <tr class="centralfinance-faculty-report-table__group-row">
                  <td colspan="6">
                    <div class="centralfinance-faculty-report__group-header">
                      <div class="centralfinance-faculty-report__group-heading">
                        <span>{{ t('finance.registrationStatistics.table.faculty') }}</span>
                        <strong>{{ overrideFacultyLabel ?? group.facultyName }}</strong>
                      </div>
                    </div>
                  </td>
                </tr>

                <tr
                  v-for="item in group.items"
                  :key="`${group.facultyId}-${item.courseId}`"
                  class="centralfinance-faculty-report-table__data-row"
                >
                  <td class="centralfinance-faculty-report-table__index">
                    {{ item.rowNumber }}
                  </td>
                  <td>
                    <div class="centralfinance-faculty-report__course-cell">
                      <span class="centralfinance-faculty-report__course-icon">
                        <q-icon name="school" />
                      </span>
                      <div class="centralfinance-faculty-report__course-copy">
                        <strong>{{ item.courseName }}</strong>
                        <span>{{ item.courseCode || `COURSE-${item.courseId}` }}</span>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="centralfinance-faculty-report__owner-cell">
                      <span class="centralfinance-faculty-report__owner-chip">
                        <q-icon name="badge" size="15px" />
                        {{
                          item.responsibleName || t('finance.registrationStatistics.table.noOwner')
                        }}
                      </span>
                    </div>
                  </td>
                  <td>
                    <div class="centralfinance-faculty-report__date-cell">
                      <strong>{{ formatDateRange(item.startDate, item.endDate) }}</strong>
                      <span>{{ getDateHint(item.startDate) }}</span>
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="centralfinance-faculty-report__metric-cell">
                      <strong>{{ formatCount(item.learnerCount) }}</strong>
                      <span>{{ t('finance.registrationStatistics.table.learnersSuffix') }}</span>
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="centralfinance-faculty-report__metric-cell">
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

                <tr class="centralfinance-faculty-report-table__group-total-row">
                  <td colspan="4" class="centralfinance-faculty-report-table__group-total-label">
                    {{ t('finance.registrationStatistics.table.groupTotalPrefix') }}
                  </td>
                  <td class="text-right">
                    <div class="centralfinance-faculty-report__metric-cell">
                      <strong>{{ formatCount(group.totalLearners) }}</strong>
                      <span>{{ t('finance.registrationStatistics.table.learnersSuffix') }}</span>
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="centralfinance-faculty-report__metric-cell">
                      <strong>{{ formatCurrency(group.totalRegistrationFees) }}</strong>
                      <span>{{ t('finance.registrationStatistics.table.totalFee') }}</span>
                    </div>
                  </td>
                </tr>
              </template>
            </template>

            <tr v-else>
              <td colspan="6" class="centralfinance-faculty-report-table__empty">
                {{ t('finance.registrationStatistics.table.noData') }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="pagination.totalPages > 1"
        ref="paginationRef"
        class="centralfinance-faculty-report__pagination"
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
import { useI18n } from 'vue-i18n';
import AdminRegistrationExportDialog from 'components/admin/AdminRegistrationExportDialog.vue';
import AppSurfaceCard from 'components/admin/AppSurfaceCard.vue';
import BasePagination from 'components/base/BasePagination.vue';
import BaseInfoCard from 'components/base/BaseInfoCard.vue';
import { useCentralFinanceFacultyReport } from 'src/composables/use-centralfinance-faculty-report';
import { formatCount, formatCurrency } from 'src/utils/course-format';

interface DateRangeValue {
  start: string | null;
  end: string | null;
}

const props = defineProps<{
  initialFacultyId?: number | null;
  overrideFacultyLabel?: string | undefined;
}>();

const { t } = useI18n();

const rowsPerPage = 10;
const currentPage = ref(1);
const paginationRef = ref<HTMLElement | null>(null);
const exportDialogOpen = ref(false);
const searchQuery = ref('');
const dateRange = ref<DateRangeValue>({ start: null, end: null });
const selectedFacultyId = ref<number | null>(null);
const selectedTypeCourseId = ref<number | null>(null);

const { groups, filterOptions, summary, pagination, isLoading, error, fetchData } =
  useCentralFinanceFacultyReport();

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

function loadReport(page = 1): Promise<void> {
  return fetchData({
    page,
    pageSize: rowsPerPage,
    startDate: dateRange.value.start,
    endDate: dateRange.value.end,
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
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(date);
}

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return '-';

  if (startDate && endDate) {
    return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  }

  return startDate
    ? `${t('finance.registrationStatistics.table.startPrefix')} ${formatDate(startDate)}`
    : `${t('finance.registrationStatistics.table.endPrefix')} ${formatDate(endDate)}`;
}

function getDateHint(startDate: string | null): string {
  if (!startDate) return t('finance.registrationStatistics.table.noStartDate');
  return `${t('finance.registrationStatistics.table.startHint')} ${formatDate(startDate)}`;
}

onMounted(() => {
  void loadReport();
});
</script>

<style lang="scss" scoped>
.centralfinance-faculty-report__stats {
  margin-bottom: 18px;
}

.centralfinance-faculty-report__search {
  min-width: 260px;
}

.centralfinance-faculty-report__table-wrap {
  overflow-x: auto;
  min-height: 0;
}

.centralfinance-faculty-report-table {
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
    color: #475467;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    background: #f8fafc;
    border-bottom: none;
  }

  tbody tr.centralfinance-faculty-report-table__group-row:hover,
  tbody tr.centralfinance-faculty-report-table__group-total-row:hover,
  tbody tr.centralfinance-faculty-report-table__skeleton-row:hover {
    background: transparent;
  }

  tbody tr:nth-child(even) {
    background: rgba(248, 250, 252, 0.58);
  }

  tbody tr:hover {
    background: rgba(245, 166, 35, 0.05);
  }
}

.centralfinance-faculty-report-table__col-index {
  width: 88px;
}

.centralfinance-faculty-report-table__col-owner {
  width: 260px;
}

.centralfinance-faculty-report-table__col-dates {
  width: 250px;
}

.centralfinance-faculty-report-table__col-learners,
.centralfinance-faculty-report-table__col-fee {
  width: 160px;
}

.centralfinance-faculty-report-table__index {
  text-align: center;
  color: #1d4ed8;
  font-weight: 800;
}

.centralfinance-faculty-report-table__group-row td {
  padding: 0;
  background: #ffffff !important;
  border-bottom: none;
  border-top: none;
}

.centralfinance-faculty-report__group-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 18px 22px 14px;
  border-top: 1px solid rgba(245, 166, 35, 0.18);
  background: linear-gradient(90deg, rgba(245, 166, 35, 0.1), rgba(255, 255, 255, 0.98));
}

.centralfinance-faculty-report__group-heading {
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

.centralfinance-faculty-report-table__group-total-row td {
  background: rgba(248, 250, 252, 0.88) !important;
}

.centralfinance-faculty-report-table__group-total-label {
  color: var(--admin-navy);
  font-size: 0.86rem;
  font-weight: 850;
}

.centralfinance-faculty-report-table__empty {
  min-height: 220px;
  padding: 38px 18px !important;
  color: #64748b;
  text-align: center;
  vertical-align: middle !important;
}

.centralfinance-faculty-report-table__skeleton-row td {
  background: #ffffff;
}

.centralfinance-faculty-report__course-cell {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.centralfinance-faculty-report__course-icon {
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

.centralfinance-faculty-report__course-copy {
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

.centralfinance-faculty-report__course-copy--skeleton {
  width: 100%;
}

.centralfinance-faculty-report__owner-cell {
  display: flex;
}

.centralfinance-faculty-report__owner-chip {
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

.centralfinance-faculty-report__owner-chip :deep(.q-icon) {
  flex-shrink: 0;
  color: currentColor;
}

tbody tr.centralfinance-faculty-report-table__group-row td {
  border-top: none !important;
}

.centralfinance-faculty-report__date-cell,
.centralfinance-faculty-report__metric-cell {
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

.centralfinance-faculty-report__metric-cell {
  align-items: flex-end;
}

.centralfinance-faculty-report__metric-skeleton {
  margin-left: auto;
}

.centralfinance-faculty-report__pagination {
  display: flex;
  justify-content: center;
  min-height: 72px;
  padding: 22px 24px 24px;
}

@media (max-width: 900px) {
  .centralfinance-faculty-report__table-wrap {
    min-height: 680px;
    height: 680px;
  }
}
</style>
