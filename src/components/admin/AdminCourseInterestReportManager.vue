<template>
  <div class="course-interest-report">
    <div class="row q-col-gutter-md course-interest-report__stats">
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
      eyebrow="Course Interest Report"
      title="รายวิชาที่ได้รับความสนใจ"
      subtitle="เรียงตามจำนวนการเข้าชมรายวิชาและจำนวนผู้ลงทะเบียนจากฐานข้อมูลจริง"
      body-padding="none"
    >
      <template #header-actions>
        <q-input
          v-model="search"
          outlined
          dense
          debounce="250"
          placeholder="ค้นหาด้วยชื่อรายวิชา รหัสวิชา หรือผู้รับผิดชอบ..."
          class="course-interest-report__search"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
      </template>

      <q-banner v-if="error" rounded dense class="bg-negative text-white q-ma-md">
        {{ error }}
      </q-banner>

      <div class="course-interest-report__table-wrap">
        <table class="course-interest-report-table">
          <colgroup>
            <col class="course-interest-report-table__col-index" />
            <col class="course-interest-report-table__col-course" />
            <col class="course-interest-report-table__col-owner" />
            <col class="course-interest-report-table__col-dates" />
            <col class="course-interest-report-table__col-views" />
            <col class="course-interest-report-table__col-enrollments" />
          </colgroup>
          <thead>
            <tr>
              <th class="course-interest-report-table__index">ลำดับ</th>
              <th>ชื่อรายวิชา</th>
              <th>ผู้รับผิดชอบรายวิชา</th>
              <th>วันที่เปิด-ปิดการเรียนการสอน</th>
              <th class="text-right">จำนวนการเข้าชมรายวิชา</th>
              <th class="text-right">จำนวนผู้ลงทะเบียน</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="isLoading">
              <tr
                v-for="skeletonIndex in rowsPerPage"
                :key="`skeleton-${skeletonIndex}`"
                class="course-interest-report-table__skeleton-row"
              >
                <td class="course-interest-report-table__index">
                  <q-skeleton type="text" width="24px" class="q-mx-auto" />
                </td>
                <td>
                  <div class="course-interest-report__course-cell">
                    <q-skeleton type="QAvatar" size="42px" />
                    <div
                      class="course-interest-report__course-copy course-interest-report__course-copy--skeleton"
                    >
                      <q-skeleton type="text" width="85%" />
                      <q-skeleton type="text" width="38%" />
                    </div>
                  </div>
                </td>
                <td><q-skeleton type="QChip" width="90%" /></td>
                <td>
                  <div class="course-interest-report__date-cell">
                    <q-skeleton type="text" width="78%" />
                    <q-skeleton type="text" width="46%" />
                  </div>
                </td>
                <td class="text-right">
                  <div class="course-interest-report__metric-cell">
                    <q-skeleton
                      type="text"
                      width="40px"
                      class="course-interest-report__metric-skeleton"
                    />
                    <q-skeleton
                      type="text"
                      width="24px"
                      class="course-interest-report__metric-skeleton"
                    />
                  </div>
                </td>
                <td class="text-right">
                  <div class="course-interest-report__metric-cell">
                    <q-skeleton
                      type="text"
                      width="40px"
                      class="course-interest-report__metric-skeleton"
                    />
                    <q-skeleton
                      type="text"
                      width="24px"
                      class="course-interest-report__metric-skeleton"
                    />
                  </div>
                </td>
              </tr>
            </template>

            <template v-else-if="items.length > 0">
              <tr
                v-for="(item, index) in items"
                :key="item.courseId"
                class="course-interest-report-table__data-row"
              >
                <td class="course-interest-report-table__index">
                  {{ getRowNumber(index) }}
                </td>
                <td>
                  <div class="course-interest-report__course-cell">
                    <span class="course-interest-report__course-icon">
                      <q-icon name="menu_book" />
                    </span>
                    <div class="course-interest-report__course-copy">
                      <strong>{{ item.courseName }}</strong>
                      <span>{{ item.courseCode || `COURSE-${item.courseId}` }}</span>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="course-interest-report__owner-cell">
                    <span class="course-interest-report__owner-chip">
                      <q-icon name="badge" size="15px" />
                      {{ item.responsibleName || 'ไม่ระบุผู้รับผิดชอบ' }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="course-interest-report__date-cell">
                    <strong>{{ formatDateRange(item.startDate, item.endDate) }}</strong>
                    <span>{{ getDateStatus(item.startDate, item.endDate) }}</span>
                  </div>
                </td>
                <td class="text-right">
                  <div class="course-interest-report__metric-cell">
                    <strong>{{ formatCount(item.viewCount) }}</strong>
                    <span>ครั้ง</span>
                  </div>
                </td>
                <td class="text-right">
                  <div class="course-interest-report__metric-cell">
                    <strong>{{ formatCount(item.enrollmentCount) }}</strong>
                    <span>คน</span>
                  </div>
                </td>
              </tr>

              <tr v-if="fillerRowHeight > 0" class="course-interest-report-table__filler-row">
                <td colspan="6" :style="{ height: `${fillerRowHeight}px` }"></td>
              </tr>
            </template>

            <tr v-else>
              <td colspan="6" class="course-interest-report-table__empty">
                {{ search ? 'ไม่พบรายวิชาที่ตรงกับคำค้นหา' : 'ยังไม่มีข้อมูลรายงานในระบบ' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        v-if="pagination.totalPages > 1"
        ref="paginationRef"
        class="course-interest-report__pagination"
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
import { computed, nextTick, onMounted, ref, watch } from 'vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import BaseInfoCard from 'components/base/BaseInfoCard.vue';
import BasePagination from 'components/base/BasePagination.vue';
import { useAdminCourseInterestReport } from 'src/composables/use-admin-course-interest-report';
import { formatCount } from 'src/utils/course-format';

const rowsPerPage = 10;
const tableRowHeight = 76;
const tableHeaderHeight = 57;
const search = ref('');
const currentPage = ref(1);
const paginationRef = ref<HTMLElement | null>(null);

const { items, summary, pagination, isLoading, error, fetchData } = useAdminCourseInterestReport();

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
    label: 'ยอดเข้าชมรวม',
    value: formatCount(summary.value.totalViews),
    description: 'จำนวนการเข้าชมรายวิชาสะสมทั้งหมด',
    icon: 'visibility',
    tone: 'indigo',
  },
  {
    label: 'ผู้ลงทะเบียนรวม',
    value: formatCount(summary.value.totalEnrollments),
    description: 'จำนวนผู้ลงทะเบียนสะสมทั้งหมด',
    icon: 'how_to_reg',
    tone: 'positive',
  },
]);

function loadReport(page = 1): Promise<void> {
  return fetchData({
    page,
    pageSize: rowsPerPage,
    search: search.value,
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

async function handlePageChange(page: number): Promise<void> {
  if (page === currentPage.value && page === pagination.value.page) {
    return;
  }

  await preservePaginationPosition(async () => {
    currentPage.value = page;
    await loadReport(page);
  });
}

function getRowNumber(index: number): number {
  return index + 1 + (pagination.value.page - 1) * pagination.value.pageSize;
}

const fillerRowHeight = computed(() =>
  Math.max(0, (rowsPerPage - items.value.length) * tableRowHeight),
);
const tableViewportHeight = `${rowsPerPage * tableRowHeight + tableHeaderHeight}px`;

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

function getDateStatus(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) {
    return 'ไม่ระบุช่วงเวลา';
  }

  const now = new Date();
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  if (start && start.getTime() > now.getTime()) {
    return 'ยังไม่เปิดสอน';
  }

  if (end && end.getTime() < now.getTime()) {
    return 'สิ้นสุดการสอนแล้ว';
  }

  return 'อยู่ในช่วงการเรียนการสอน';
}

onMounted(() => {
  void loadReport();
});

watch(search, () => {
  currentPage.value = 1;
  void loadReport(1);
});

watch(
  () => pagination.value.page,
  (page) => {
    currentPage.value = page;
  },
);
</script>

<style lang="scss" scoped>
.course-interest-report__stats {
  margin-bottom: 18px;
}

.course-interest-report {
  --course-interest-report-row-height: v-bind('`${tableRowHeight}px`');
  --course-interest-report-table-height: v-bind('tableViewportHeight');
}

.course-interest-report__search {
  width: min(280px, 100%);
}

.course-interest-report__table-wrap {
  overflow-x: auto;
  min-height: var(--course-interest-report-table-height);
}

.course-interest-report-table {
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

  tbody tr:nth-child(even) {
    background: rgba(248, 250, 252, 0.7);
  }

  tbody tr:hover {
    background: rgba(245, 166, 35, 0.06);
  }

  tbody tr.course-interest-report-table__filler-row:hover,
  tbody tr.course-interest-report-table__skeleton-row:hover {
    background: transparent;
  }

  tbody td {
    height: var(--course-interest-report-row-height);
  }
}

.course-interest-report-table__col-index {
  width: 88px;
}

.course-interest-report-table__col-owner {
  width: 260px;
}

.course-interest-report-table__col-dates {
  width: 250px;
}

.course-interest-report-table__col-views,
.course-interest-report-table__col-enrollments {
  width: 150px;
}

.course-interest-report-table__index {
  text-align: center;
  color: #1d4ed8;
  font-weight: 800;
}

.course-interest-report-table__empty {
  height: calc(var(--course-interest-report-table-height) - 1px);
  padding: 38px 18px !important;
  color: #64748b;
  text-align: center;
  vertical-align: middle !important;
}

.course-interest-report-table__skeleton-row td {
  background: #ffffff;
}

.course-interest-report-table__filler-row td {
  padding: 0 !important;
  border-bottom: 0 !important;
  background: transparent !important;
}

.course-interest-report__course-cell {
  display: flex;
  align-items: flex-start;
  gap: 12px;
}

.course-interest-report__course-icon {
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

.course-interest-report__course-copy {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 4px;
  min-height: 50px;
  justify-content: center;

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
    min-height: calc(1.42em * 2);
    text-wrap: pretty;
  }

  span {
    color: var(--admin-muted);
    font-size: 0.75rem;
    font-weight: 700;
  }
}

.course-interest-report__course-copy--skeleton {
  width: 100%;
}

.course-interest-report__owner-cell {
  display: flex;
}

.course-interest-report__owner-chip {
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

.course-interest-report__date-cell,
.course-interest-report__metric-cell {
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
    min-height: calc(1.42em * 2);
  }

  span {
    color: var(--admin-muted);
    font-size: 0.75rem;
    font-weight: 700;
  }
}

.course-interest-report__metric-cell {
  align-items: flex-end;
}

.course-interest-report__metric-skeleton {
  margin-left: auto;
}

.course-interest-report__pagination {
  display: flex;
  justify-content: center;
  min-height: 72px;
  padding: 22px 24px 24px;
}

@media (max-width: 900px) {
  .course-interest-report__search {
    width: 100%;
  }

  .course-interest-report-table__empty {
    height: calc(var(--course-interest-report-table-height) - 1px);
  }
}
</style>
