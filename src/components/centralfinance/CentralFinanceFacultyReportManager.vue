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
        <div class="centralfinance-faculty-report__header-actions">
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
            <col class="centralfinance-faculty-report-table__col-dates" />
            <col class="centralfinance-faculty-report-table__col-learners" />
            <col class="centralfinance-faculty-report-table__col-price" />
            <col class="centralfinance-faculty-report-table__col-fee" />
          </colgroup>
          <thead>
            <tr>
              <th class="centralfinance-faculty-report-table__index">
                {{ t('finance.registrationStatistics.table.index') }}
              </th>
              <th>{{ t('finance.registrationStatistics.table.courseName') }}</th>
              <th>{{ t('finance.registrationStatistics.table.dates') }}</th>
              <th class="text-right">
                {{ t('finance.registrationStatistics.table.learnersCount') }}
              </th>
              <th class="text-right">{{ t('finance.registrationStatistics.table.unitPrice') }}</th>
              <th class="text-right">
                {{ t('finance.registrationStatistics.table.totalRevenue') }}
              </th>
            </tr>
          </thead>
          <tbody>
            <template v-if="isLoading">
              <tr
                v-for="skeletonIndex in ITEMS_PER_PAGE"
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
                <td class="text-right">
                  <div class="centralfinance-faculty-report__metric-cell">
                    <q-skeleton
                      type="text"
                      width="60px"
                      class="centralfinance-faculty-report__metric-skeleton"
                    />
                    <q-skeleton
                      type="text"
                      width="28px"
                      class="centralfinance-faculty-report__metric-skeleton"
                    />
                  </div>
                </td>
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

            <template v-else-if="pagedGroups.length > 0">
              <template v-for="group in pagedGroups" :key="group.facultyId">
                <tr class="centralfinance-faculty-report-table__group-row">
                  <td colspan="6">
                    <div class="centralfinance-faculty-report__group-header">
                      <div class="centralfinance-faculty-report__group-heading">
                        <span>{{ t('finance.registrationStatistics.table.faculty') }}</span>
                        <strong>{{ overrideFacultyLabel ?? group.facultyName }}</strong>
                      </div>
                      <div class="centralfinance-faculty-report__group-course-count">
                        {{ formatCount(group.totalCourses) }}
                        {{ t('finance.registrationStatistics.table.coursesSuffix') }}
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
                        <span class="centralfinance-faculty-report__course-owner">
                          <q-icon name="badge" size="13px" />
                          {{
                            item.responsibleName ||
                            t('finance.registrationStatistics.table.noOwner')
                          }}
                        </span>
                      </div>
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
                        getEffectiveUnitPrice(
                          item.unitPrice,
                          item.registrationFee,
                          item.learnerCount,
                        ) === 0
                          ? t('finance.registrationStatistics.table.unitPriceFree')
                          : formatCurrency(
                              getEffectiveUnitPrice(
                                item.unitPrice,
                                item.registrationFee,
                                item.learnerCount,
                              ),
                            )
                      }}</strong>
                      <span>{{ t('finance.registrationStatistics.table.unitPriceSuffix') }}</span>
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="centralfinance-faculty-report__metric-cell">
                      <strong>{{
                        getSafeAmount(item.registrationFee) === 0
                          ? '฿0'
                          : formatCurrency(getSafeAmount(item.registrationFee))
                      }}</strong>
                      <span>{{ t('finance.registrationStatistics.table.totalRevenue') }}</span>
                    </div>
                  </td>
                </tr>

                <tr class="centralfinance-faculty-report-table__group-total-row">
                  <td colspan="3" class="centralfinance-faculty-report-table__group-total-label">
                    {{ t('finance.registrationStatistics.table.groupTotalPrefix') }}
                  </td>
                  <td class="text-right">
                    <div class="centralfinance-faculty-report__metric-cell">
                      <strong>{{ formatCount(group.totalLearners) }}</strong>
                      <span>{{ t('finance.registrationStatistics.table.learnersSuffix') }}</span>
                    </div>
                  </td>
                  <td></td>
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
        v-if="totalClientPages > 1"
        ref="paginationRef"
        class="centralfinance-faculty-report__pagination"
      >
        <BasePagination
          :model-value="clientPage"
          :max="totalClientPages"
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

const ITEMS_PER_PAGE = 10;
const clientPage = ref(1);
const paginationRef = ref<HTMLElement | null>(null);
const exportDialogOpen = ref(false);
const searchQuery = ref('');
const dateRange = ref<DateRangeValue>({ start: null, end: null });
const selectedFacultyId = ref<number | null>(null);
const selectedTypeCourseId = ref<number | null>(null);

const { groups, filterOptions, summary, isLoading, error, fetchData } =
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

const allItemsFlat = computed(() =>
  groups.value.flatMap((group) => group.items.map((item) => ({ item, group }))),
);

const filteredItemsFlat = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return allItemsFlat.value;
  return allItemsFlat.value.filter(
    ({ item }) =>
      item.courseName?.toLowerCase().includes(query) ||
      item.courseCode?.toLowerCase().includes(query) ||
      item.responsibleName?.toLowerCase().includes(query),
  );
});

const totalClientPages = computed(() =>
  Math.max(1, Math.ceil(filteredItemsFlat.value.length / ITEMS_PER_PAGE)),
);

const pagedGroups = computed(() => {
  const start = (clientPage.value - 1) * ITEMS_PER_PAGE;
  const slice = filteredItemsFlat.value.slice(start, start + ITEMS_PER_PAGE);

  if (slice.length === 0) return [];

  // When viewing all faculties, merge into a single group to avoid duplicate headers
  if (props.overrideFacultyLabel !== undefined) {
    const pageItems = slice.map(({ item }) => item);
    return [
      {
        facultyId: 0,
        facultyName: props.overrideFacultyLabel,
        items: pageItems,
        totalCourses: filteredItemsFlat.value.length,
        totalLearners: filteredItemsFlat.value.reduce(
          (sum, { item }) => sum + item.learnerCount,
          0,
        ),
        totalRegistrationFees: filteredItemsFlat.value.reduce(
          (sum, { item }) =>
            sum + (Number.isFinite(item.registrationFee) ? item.registrationFee : 0),
          0,
        ),
      },
    ];
  }

  // When viewing a specific faculty, group by faculty
  type GroupEntry = {
    group: (typeof groups.value)[number];
    items: (typeof groups.value)[number]['items'];
  };
  const map = new Map<number, GroupEntry>();

  for (const { item, group } of slice) {
    if (!map.has(group.facultyId)) {
      map.set(group.facultyId, { group, items: [] });
    }
    map.get(group.facultyId)!.items.push(item);
  }

  return Array.from(map.values()).map(({ group, items }) => ({
    ...group,
    items,
    totalCourses: items.length,
    totalLearners: items.reduce((sum, i) => sum + i.learnerCount, 0),
    totalRegistrationFees: items.reduce(
      (sum, i) => sum + (Number.isFinite(i.registrationFee) ? i.registrationFee : 0),
      0,
    ),
  }));
});

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

function getEffectiveUnitPrice(
  unitPrice: number,
  registrationFee: number,
  learnerCount: number,
): number {
  const safe = Number.isFinite(unitPrice) ? unitPrice : 0;
  const safeFee = getSafeAmount(registrationFee);
  const safeCount = Number.isFinite(learnerCount) ? learnerCount : 0;
  return safe > 0 ? safe : safeCount > 0 ? Math.round(safeFee / safeCount) : 0;
}

function loadReport(): Promise<void> {
  clientPage.value = 1;
  return fetchData({
    page: 1,
    pageSize: 100,
    ...(selectedFacultyId.value !== null && { facultyId: selectedFacultyId.value }),
    ...(selectedTypeCourseId.value !== null && { typeCourseId: selectedTypeCourseId.value }),
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

function handleSearch(): void {
  clientPage.value = 1;
}

async function handlePageChange(page: number): Promise<void> {
  if (page === clientPage.value) return;

  await preservePaginationPosition(() => {
    clientPage.value = page;
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

.centralfinance-faculty-report__header-actions {
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

.centralfinance-faculty-report__search {
  min-width: 220px;
  flex: 1 1 220px;

  @media (max-width: 599px) {
    min-width: 0;
    flex: none;
  }
}

.centralfinance-faculty-report__table-wrap {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
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

.centralfinance-faculty-report-table__col-dates {
  width: 220px;
}

.centralfinance-faculty-report-table__col-learners,
.centralfinance-faculty-report-table__col-price,
.centralfinance-faculty-report-table__col-fee {
  width: 150px;
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

.centralfinance-faculty-report__course-owner {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #0f766e;
  font-size: 0.72rem;
  font-weight: 700;
  margin-top: 2px;
}

.centralfinance-faculty-report__group-course-count {
  color: #b7791f;
  font-size: 0.82rem;
  font-weight: 800;
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

@media (max-width: 760px) {
  .centralfinance-faculty-report__stats {
    margin-bottom: 12px;
  }

  .centralfinance-faculty-report__pagination {
    padding: 16px 12px 20px;
  }
}
</style>
