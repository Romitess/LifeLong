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

    <AppSurfaceCard
      eyebrow="Course Interest Report"
      title="รายวิชาที่ได้รับความสนใจ"
      subtitle="เรียงตามจำนวนการเข้าชมรายวิชาและจำนวนผู้ลงทะเบียนจากฐานข้อมูลจริง"
      body-padding="none"
    >
      <template #header-actions>
        <AppSearchInput
          v-model="search"
          placeholder="ค้นหาด้วยชื่อรายวิชา รหัสวิชา หรือผู้รับผิดชอบ..."
          :debounce="250"
          class="course-interest-report__search"
        />
      </template>

      <q-banner v-if="error" rounded dense class="bg-negative text-white q-ma-md">
        {{ error }}
      </q-banner>

      <div class="course-interest-report__table-wrap">
        <BaseTable
          :columns="tableColumns"
          :rows="items"
          row-key="courseId"
          :loading="isLoading"
          :rows-per-page="rowsPerPage"
          :row-height="76"
          :header-height="57"
          min-width="1080px"
          height-mode="stable"
          show-index
          :index-offset="(pagination.page - 1) * pagination.pageSize"
          :page="currentPage"
          :total-pages="pagination.totalPages"
          :on-page-change="loadReport"
          show-rows-per-page
          :on-rows-per-page-change="onRowsPerPageChange"
          :empty-text="search ? 'ไม่พบรายวิชาที่ตรงกับคำค้นหา' : 'ยังไม่มีข้อมูลรายงานในระบบ'"
        >
          <!-- COURSE -->
          <template #cell-course="{ row }">
            <div class="course-interest-report__course-cell">
              <span class="course-interest-report__course-icon">
                <q-icon name="menu_book" />
              </span>
              <div class="course-interest-report__course-copy">
                <strong>{{ row.courseName }}</strong>
                <span>{{ row.courseCode || `COURSE-${row.courseId}` }}</span>
              </div>
            </div>
          </template>
          <template #skeleton-course>
            <div class="course-interest-report__course-cell">
              <q-skeleton type="QAvatar" size="42px" />
              <div
                class="course-interest-report__course-copy course-interest-report__course-copy--skeleton"
              >
                <q-skeleton type="text" width="85%" />
                <q-skeleton type="text" width="38%" />
              </div>
            </div>
          </template>

          <!-- OWNER -->
          <template #cell-owner="{ row }">
            <div class="course-interest-report__owner-cell">
              <span class="course-interest-report__owner-chip">
                <q-icon name="badge" size="15px" />
                {{ row.responsibleName || 'ไม่ระบุผู้รับผิดชอบ' }}
              </span>
            </div>
          </template>
          <template #skeleton-owner>
            <q-skeleton type="QChip" width="90%" />
          </template>

          <!-- DATES -->
          <template #cell-dates="{ row }">
            <div class="course-interest-report__date-cell">
              <strong>{{ formatDateRange(row.startDate, row.endDate) }}</strong>
              <span>{{ getDateStatus(row.startDate, row.endDate) }}</span>
            </div>
          </template>
          <template #skeleton-dates>
            <div class="course-interest-report__date-cell">
              <q-skeleton type="text" width="78%" />
              <q-skeleton type="text" width="46%" />
            </div>
          </template>

          <!-- VIEWS -->
          <template #cell-views="{ row }">
            <div class="course-interest-report__metric-cell">
              <strong>{{ formatCount(row.viewCount) }}</strong>
              <span>ครั้ง</span>
            </div>
          </template>
          <template #skeleton-views>
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
          </template>

          <!-- ENROLLMENTS -->
          <template #cell-enrollments="{ row }">
            <div class="course-interest-report__metric-cell">
              <strong>{{ formatCount(row.enrollmentCount) }}</strong>
              <span>คน</span>
            </div>
          </template>
          <template #skeleton-enrollments>
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
          </template>
        </BaseTable>
      </div>
    </AppSurfaceCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import AppSearchInput from 'components/common/AppSearchInput.vue';
import AppSurfaceCard from 'components/common/AppSurfaceCard.vue';
import BaseInfoCard from 'components/base/BaseInfoCard.vue';
import BaseTable, { type BaseTableColumn } from 'components/base/BaseTable.vue';
import { useAdminCourseInterestReport } from 'src/composables/use-admin-course-interest-report';
import { useTablePagination } from 'src/composables/use-table-pagination';
import { formatCount } from 'src/utils/course-format';

const rowsPerPage = ref(10);
const search = ref('');

const { items, summary, pagination, isLoading, error, fetchData } = useAdminCourseInterestReport();

const { currentPage } = useTablePagination({
  onPageChange: (page) => loadReport(page),
  isSamePage: (page) => page === pagination.value.page,
});

const tableColumns: BaseTableColumn[] = [
  { key: 'course', label: 'ชื่อรายวิชา', width: 'auto', sortable: true, sortKey: 'courseName' },
  {
    key: 'owner',
    label: 'ผู้รับผิดชอบรายวิชา',
    width: '260px',
    sortable: true,
    sortKey: 'responsibleName',
  },
  {
    key: 'dates',
    label: 'วันที่เปิด-ปิดการเรียนการสอน',
    width: '250px',
    sortable: true,
    sortKey: 'startDate',
  },
  {
    key: 'views',
    label: 'จำนวนการเข้าชมรายวิชา',
    align: 'right',
    width: '150px',
    sortable: true,
    sortKey: 'viewCount',
  },
  {
    key: 'enrollments',
    label: 'จำนวนผู้ลงทะเบียน',
    align: 'right',
    width: '150px',
    sortable: true,
    sortKey: 'enrollmentCount',
  },
];

async function onRowsPerPageChange(value: number): Promise<void> {
  rowsPerPage.value = value;
  currentPage.value = 1;
  await loadReport(1);
}

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
    pageSize: rowsPerPage.value,
    search: search.value,
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
}

.course-interest-report__search {
  width: min(280px, 100%);
}

.course-interest-report__table-wrap {
  overflow-x: auto;
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
    line-clamp: 2;
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
    line-clamp: 2;
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
}
</style>
