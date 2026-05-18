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

    <AdminSurfaceCard
      eyebrow="Registration Statistics"
      title="สถิติการลงทะเบียน"
      subtitle="ติดตามจำนวนผู้เรียนและค่าลงทะเบียน แยกตามคณะหรือส่วนงานจากข้อมูลจริงในระบบ"
      body-padding="none"
    >
      <template #header-actions>
        <AdminActionButton
          variant="primary"
          icon="download"
          label="ส่งออก"
          class="registration-statistics-report__export-btn"
          @click="exportDialogOpen = true"
        />
      </template>
      <div class="registration-statistics-report__filters">
        <BaseDateRangeFilter
          v-model="dateRange"
          label="วันที่เปิดเรียน"
          from-hint="ตั้งแต่"
          to-hint="ถึง"
          class="registration-statistics-report__date-filter"
        />

        <div class="registration-statistics-report__field">
          <div class="registration-statistics-report__field-label">คณะ/ส่วนงาน</div>
          <q-select
            v-model="selectedFacultyId"
            outlined
            dense
            clearable
            emit-value
            map-options
            :options="facultyOptions"
            option-label="label"
            option-value="id"
            placeholder="เลือกคณะ/ส่วนงาน"
            hint=" "
            class="registration-statistics-report__select"
          />
        </div>

        <div class="registration-statistics-report__field">
          <div class="registration-statistics-report__field-label">ประเภท</div>
          <q-select
            v-model="selectedTypeCourseId"
            outlined
            dense
            clearable
            emit-value
            map-options
            :options="courseTypeOptions"
            option-label="label"
            option-value="id"
            placeholder="เลือกประเภท"
            hint=" "
            class="registration-statistics-report__select"
          />
        </div>

        <div
          class="registration-statistics-report__field registration-statistics-report__field--actions"
        >
          <div class="registration-statistics-report__filter-actions">
            <AdminActionButton
              variant="primary"
              icon="filter_alt"
              label="แสดงผล"
              :loading="isLoading"
              class="registration-statistics-report__filter-btn"
              @click="applyFilters"
            />
            <AdminActionButton
              variant="secondary"
              icon="restart_alt"
              label="ล้างตัวกรอง"
              class="registration-statistics-report__filter-btn"
              @click="resetFilters"
            />
          </div>
        </div>
      </div>

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
              <th class="registration-statistics-report-table__index">ลำดับ</th>
              <th>ชื่อรายวิชา</th>
              <th>ผู้รับผิดชอบรายวิชา</th>
              <th>วันที่เปิด-ปิดการเรียนการสอน</th>
              <th class="text-right">จำนวนผู้เรียน</th>
              <th class="text-right">ค่าลงทะเบียนรวม</th>
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
                        <span>คณะ/ส่วนงาน</span>
                        <strong>{{ group.facultyName }}</strong>
                      </div>
                      <div class="registration-statistics-report__group-metrics">
                        <span>{{ formatCount(group.totalCourses) }} วิชา</span>
                        <span>{{ formatCount(group.totalLearners) }} คน</span>
                        <span>{{ formatCurrency(group.totalRegistrationFees) }}</span>
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
                        {{ item.responsibleName || 'ไม่ระบุผู้รับผิดชอบ' }}
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
                      <span>คน</span>
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
                    ยอดรวมคณะจากข้อมูลที่กรอง
                  </td>
                  <td class="text-right">
                    <div class="registration-statistics-report__metric-cell">
                      <strong>{{ formatCount(group.totalLearners) }}</strong>
                      <span>คน</span>
                    </div>
                  </td>
                  <td class="text-right">
                    <div class="registration-statistics-report__metric-cell">
                      <strong>{{ formatCurrency(group.totalRegistrationFees) }}</strong>
                      <span>ค่าลงทะเบียนรวม</span>
                    </div>
                  </td>
                </tr>
              </template>
            </template>

            <tr v-else>
              <td colspan="6" class="registration-statistics-report-table__empty">
                ไม่พบข้อมูลสถิติการลงทะเบียนตามตัวกรองที่เลือก
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
    </AdminSurfaceCard>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import AdminActionButton from 'components/admin/AdminActionButton.vue';
import AdminRegistrationExportDialog from 'components/admin/AdminRegistrationExportDialog.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import BaseDateRangeFilter from 'components/base/BaseDateRangeFilter.vue';
import BaseInfoCard from 'components/base/BaseInfoCard.vue';
import BasePagination from 'components/base/BasePagination.vue';
import { useAdminRegistrationStatisticsReport } from 'src/composables/use-admin-registration-statistics-report';
import { formatCount, formatCurrency } from 'src/utils/course-format';

interface DateRangeValue {
  start: string | null;
  end: string | null;
}

const rowsPerPage = 10;
const currentPage = ref(1);
const paginationRef = ref<HTMLElement | null>(null);
const exportDialogOpen = ref(false);
const dateRange = ref<DateRangeValue>({
  start: null,
  end: null,
});
const selectedFacultyId = ref<number | null>(null);
const selectedTypeCourseId = ref<number | null>(null);

const { groups, filterOptions, summary, pagination, isLoading, error, fetchData } =
  useAdminRegistrationStatisticsReport();

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
    label: 'รายวิชาที่พบ',
    value: formatCount(summary.value.totalCourses),
    description: 'จำนวนรายวิชาที่ตรงกับตัวกรองปัจจุบัน',
    icon: 'menu_book',
    tone: 'primary',
  },
  {
    label: 'ผู้เรียนรวม',
    value: formatCount(summary.value.totalLearners),
    description: 'จำนวนผู้เรียนสะสมจากรายวิชาที่แสดงผล',
    icon: 'groups',
    tone: 'indigo',
  },
  {
    label: 'ค่าลงทะเบียนรวม',
    value: formatCurrency(summary.value.totalRegistrationFees),
    description: 'ผลรวมค่าลงทะเบียนจริงจากผู้เรียนทั้งหมด',
    icon: 'payments',
    tone: 'positive',
  },
]);

const facultyOptions = computed(() => filterOptions.value.faculties);
const courseTypeOptions = computed(() => filterOptions.value.courseTypes);

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
    ? 'ราคาตั้งไว้: ฟรี'
    : `ราคาตั้งไว้: ${formatCurrency(fallbackUnitPrice)}`;
}

function loadReport(page = 1): Promise<void> {
  return fetchData({
    page,
    pageSize: rowsPerPage,
    startDate: normalizeDateForApi(dateRange.value.start),
    endDate: normalizeDateForApi(dateRange.value.end),
    facultyId: selectedFacultyId.value,
    typeCourseId: selectedTypeCourseId.value,
  });
}

function applyFilters(): void {
  currentPage.value = 1;
  void loadReport(1);
}

function resetFilters(): void {
  dateRange.value = { start: null, end: null };
  selectedFacultyId.value = null;
  selectedTypeCourseId.value = null;
  currentPage.value = 1;
  void loadReport(1);
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

  return startDate ? `เริ่ม ${formatDate(startDate)}` : `สิ้นสุด ${formatDate(endDate)}`;
}

function getDateHint(startDate: string | null): string {
  if (!startDate) {
    return 'ไม่ระบุวันเปิดเรียน';
  }

  return `เปิดเรียน ${formatDate(startDate)}`;
}

onMounted(() => {
  void loadReport();
});
</script>

<style lang="scss" scoped>
.registration-statistics-report__stats {
  margin-bottom: 18px;
}

.registration-statistics-report__filters {
  display: grid;
  grid-template-columns: minmax(260px, 1.2fr) minmax(220px, 1fr) minmax(220px, 1fr) auto;
  gap: 14px;
  align-items: end;
  padding: 22px 24px 18px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.92), rgba(255, 255, 255, 0.96));
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
  min-height: 760px;
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
  border-bottom: 0;
}

.registration-statistics-report__group-header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  padding: 18px 22px 14px;
  margin-top: 6px;
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

.registration-statistics-report__group-metrics {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  gap: 10px;

  span {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-height: 34px;
    padding: 6px 12px;
    border-radius: 999px;
    color: #0f766e;
    background: rgba(20, 184, 166, 0.1);
    font-size: 0.76rem;
    font-weight: 800;
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
  height: 760px;
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
    min-height: calc(1.42em * 2);
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
  max-width: 100%;
  padding: 8px 12px;
  border-radius: 999px;
  color: #0f766e;
  background: rgba(20, 184, 166, 0.1);
  font-size: 0.75rem;
  font-weight: 700;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.registration-statistics-report__date-cell,
.registration-statistics-report__metric-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    display: -webkit-box;
    min-height: calc(1.42em * 2);
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

  .registration-statistics-report__filter-actions {
    justify-content: flex-start;
  }
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
