<template>
  <div class="courses-manager">
    <AppSurfaceCard
      eyebrow="Course Registry"
      title="ทะเบียนรายวิชา/หลักสูตรระยะสั้น"
      subtitle="รายการรายวิชาและหลักสูตรระยะสั้นทั้งหมดในระบบ"
      body-padding="none"
    >
      <template #header-actions>
        <AppActionButton
          variant="primary"
          icon="add"
          label="เพิ่มทะเบียนรายวิชา/หลักสูตรระยะสั้น"
          class="courses-manager__add-btn"
          tag="a"
          :href="resolveFullUrl('/admin/courses/new')"
          @click="navClick('/admin/courses/new', $event)"
        />
      </template>

      <div class="courses-manager__filters">
        <div class="courses-manager__filter-row">
          <BaseInput
            v-model="filterCourseName"
            label="ชื่อรายวิชา"
            clearable
            placeholder="ระบุชื่อรายวิชา"
            hint=" "
            class="courses-manager__field"
            @keyup.enter="applyFilters"
          />

          <BaseSelect
            v-model="filterFacultyId"
            label="คณะ/ส่วนงาน"
            clearable
            emit-value
            map-options
            :options="filterOptions.faculties"
            option-label="label"
            option-value="id"
            placeholder="เลือกคณะ/ส่วนงาน"
            hint=" "
            class="courses-manager__field"
          />

          <BaseSelect
            v-model="filterTypeCourseId"
            label="ประเภท"
            clearable
            emit-value
            map-options
            :options="filterOptions.courseTypes"
            option-label="label"
            option-value="id"
            placeholder="เลือกประเภท"
            hint=" "
            class="courses-manager__field"
          />

          <BaseSelect
            v-model="filterFeeType"
            label="ค่าใช้จ่าย"
            clearable
            emit-value
            map-options
            :options="feeTypeOptions"
            option-label="label"
            option-value="value"
            placeholder="ทั้งหมด"
            hint=" "
            class="courses-manager__field"
          />

          <div class="courses-manager__field courses-manager__field--actions">
            <div class="courses-manager__filter-actions">
              <AppActionButton
                variant="primary"
                icon="filter_alt"
                label="แสดงผล"
                :loading="isLoading"
                class="courses-manager__filter-btn"
                @click="applyFilters"
              />
              <AppActionButton
                variant="secondary"
                icon="restart_alt"
                label="ล้างตัวกรอง"
                class="courses-manager__filter-btn"
                @click="resetFilters"
              />
            </div>
          </div>
        </div>

        <div class="courses-manager__search-row">
          <AppSearchInput
            v-model="globalSearch"
            placeholder="ค้นหาจากทุกคอลัมน์..."
            class="courses-manager__search"
            @update:model-value="onSearchChange"
            @clear="clearSearch"
          />
        </div>
      </div>

      <q-banner v-if="error" rounded dense class="bg-negative text-white q-ma-md">
        {{ error }}
      </q-banner>

      <BaseTable
        :columns="tableColumns"
        :rows="items"
        row-key="courseId"
        :loading="isLoading"
        :rows-per-page="rowsPerPage"
        :row-height="72"
        :header-height="57"
        min-width="1100px"
        show-index
        :index-offset="(pagination.page - 1) * pagination.pageSize"
        :page="pagination.page"
        :total-pages="pagination.totalPages"
        :on-page-change="load"
        :empty-text="
          hasActiveFilters ? 'ไม่พบรายวิชาที่ตรงกับเงื่อนไขการค้นหา' : 'ยังไม่มีรายวิชาในระบบ'
        "
      >
        <template #cell-faculty="{ row }">
          <span class="courses-cell__faculty">{{ row.facultyName }}</span>
        </template>

        <template #cell-name="{ row }">
          <div class="courses-cell__name">
            <span class="courses-cell__title">{{ row.titleTh ?? '-' }}</span>
            <span v-if="row.courseCode" class="courses-cell__code">{{ row.courseCode }}</span>
          </div>
        </template>
        <template #skeleton-name>
          <q-skeleton type="text" width="90%" />
          <q-skeleton type="text" width="60%" class="q-mt-xs" />
        </template>

        <template #cell-duration="{ row }">
          <span class="courses-cell__duration">
            {{ formatDateRange(row.startDate, row.endDate) }}
          </span>
        </template>

        <template #cell-responsible="{ row }">
          <span class="courses-cell__responsible">{{ row.responsibleName ?? '-' }}</span>
        </template>

        <template #cell-type="{ row }">
          <BaseStatusBadge :color="getTypeColor(row.typeCourseId)" :label="row.typeCourseName" />
        </template>
        <template #skeleton-type>
          <q-skeleton type="QChip" width="72px" class="q-mx-auto" />
        </template>

        <template #cell-copy="{ row }">
          <AppIconButton
            icon="content_copy"
            size="sm"
            tone="copy"
            class="courses-action-btn courses-action-btn--copy"
            aria-label="คัดลอก"
            tag="a"
            :href="resolveFullUrl(`/admin/courses/${row.courseId}/copy`)"
            @click="navClick(`/admin/courses/${row.courseId}/copy`, $event)"
          >
            <q-tooltip>คัดลอก</q-tooltip>
          </AppIconButton>
        </template>
        <template #skeleton-copy>
          <q-skeleton type="QBtn" width="34px" height="34px" class="q-mx-auto" />
        </template>

        <template #cell-actions="{ row }">
          <div class="courses-cell__actions">
            <AppIconButton
              icon="visibility"
              size="sm"
              tone="view"
              class="courses-action-btn courses-action-btn--view"
              aria-label="ดูรายละเอียด"
              tag="a"
              :href="resolveFullUrl(`/admin/courses/${row.courseId}`)"
              @click="navClick(`/admin/courses/${row.courseId}`, $event)"
            >
              <q-tooltip>ดูรายละเอียด</q-tooltip>
            </AppIconButton>
            <AppIconButton
              icon="edit"
              size="sm"
              tone="edit"
              class="courses-action-btn courses-action-btn--edit"
              aria-label="แก้ไข"
              tag="a"
              :href="resolveFullUrl(`/admin/courses/${row.courseId}/edit`)"
              @click="navClick(`/admin/courses/${row.courseId}/edit`, $event)"
            >
              <q-tooltip>แก้ไข</q-tooltip>
            </AppIconButton>
            <AppIconButton
              icon="delete"
              size="sm"
              tone="delete"
              class="courses-action-btn courses-action-btn--delete"
              aria-label="ลบ"
              @click="askDelete(row)"
            >
              <q-tooltip>ลบ</q-tooltip>
            </AppIconButton>
          </div>
        </template>
        <template #skeleton-actions>
          <div class="courses-cell__actions">
            <q-skeleton type="QBtn" width="34px" height="34px" />
            <q-skeleton type="QBtn" width="34px" height="34px" />
            <q-skeleton type="QBtn" width="34px" height="34px" />
          </div>
        </template>
      </BaseTable>
    </AppSurfaceCard>

    <AppConfirmDialog
      v-model="confirmDeleteOpen"
      title="ลบรายวิชา"
      :message="deleteMessage"
      confirm-label="ลบ"
      cancel-label="ยกเลิก"
      confirm-color="negative"
      icon-color="negative"
      @confirm="confirmDelete"
      @cancel="pendingDeleteId = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import AppIconButton from 'components/common/AppIconButton.vue';
import AppActionButton from 'components/common/AppActionButton.vue';
import AppConfirmDialog from 'components/common/AppConfirmDialog.vue';
import AppSearchInput from 'components/common/AppSearchInput.vue';
import AppSurfaceCard from 'components/common/AppSurfaceCard.vue';
import BaseInput from 'components/base/BaseInput.vue';
import BaseSelect from 'components/base/BaseSelect.vue';
import BaseTable, { type BaseTableColumn } from 'components/base/BaseTable.vue';
import BaseStatusBadge from 'components/base/BaseStatusBadge.vue';
import { useAdminCourses } from 'src/composables/use-admin-courses';
import { isNewTabClick, resolveFullUrl } from 'src/composables/use-nav-link';
import type { AdminCourseItem } from 'src/types/admin-courses';

const $q = useQuasar();
const router = useRouter();
const { items, filterOptions, pagination, isLoading, error, fetchData, removeCourse } =
  useAdminCourses();

const filterCourseName = ref<string>('');
const filterFacultyId = ref<number | null>(null);
const filterTypeCourseId = ref<number | null>(null);
const filterFeeType = ref<'free' | 'paid' | null>(null);
const globalSearch = ref<string>('');

const feeTypeOptions = [
  { label: 'ฟรี', value: 'free' },
  { label: 'เสียเงิน', value: 'paid' },
];
const confirmDeleteOpen = ref(false);
const pendingDeleteId = ref<number | null>(null);
const pendingDeleteTitle = ref<string>('');

const rowsPerPage = 10;

const tableColumns: BaseTableColumn[] = [
  { key: 'faculty', label: 'คณะ/ส่วนงาน', width: '180px' },
  { key: 'name', label: 'ชื่อรายวิชา', width: 'auto' },
  { key: 'duration', label: 'ระยะเวลาที่อนุมัติให้หลักสูตรดำเนินการได้', width: '190px' },
  { key: 'responsible', label: 'ผู้รับผิดชอบรายวิชา', width: '160px' },
  { key: 'type', label: 'ประเภท', align: 'center', width: '130px' },
  { key: 'copy', label: 'คัดลอก', align: 'center', width: '80px' },
  { key: 'actions', label: 'ดำเนินการ', align: 'center', width: '130px' },
];

const hasActiveFilters = computed(
  () =>
    !!filterCourseName.value ||
    filterFacultyId.value !== null ||
    filterTypeCourseId.value !== null ||
    filterFeeType.value !== null ||
    !!globalSearch.value,
);

const deleteMessage = computed(() =>
  pendingDeleteTitle.value
    ? `ต้องการลบรายวิชา "${pendingDeleteTitle.value}" ใช่หรือไม่ การดำเนินการนี้ไม่สามารถย้อนกลับได้`
    : 'ต้องการลบรายวิชานี้ใช่หรือไม่',
);

onMounted(() => {
  void load();
});

async function load(page = 1): Promise<void> {
  try {
    await fetchData({
      page,
      pageSize: rowsPerPage,
      courseName: filterCourseName.value || null,
      facultyId: filterFacultyId.value,
      typeCourseId: filterTypeCourseId.value,
      feeType: filterFeeType.value,
      search: globalSearch.value || null,
    });
  } catch {
    $q.notify({ type: 'negative', message: 'ไม่สามารถโหลดข้อมูลรายวิชาได้', position: 'top' });
  }
}

async function applyFilters(): Promise<void> {
  await load(1);
}

async function resetFilters(): Promise<void> {
  filterCourseName.value = '';
  filterFacultyId.value = null;
  filterTypeCourseId.value = null;
  filterFeeType.value = null;
  globalSearch.value = '';
  await load(1);
}

async function onSearchChange(): Promise<void> {
  await load(1);
}

function clearSearch(): void {
  globalSearch.value = '';
  void load(1);
}

function navClick(path: string, event: Event): void {
  if (isNewTabClick(event)) {
    return;
  }
  event.preventDefault();
  void router.push(path);
}

function askDelete(item: AdminCourseItem): void {
  pendingDeleteId.value = item.courseId;
  pendingDeleteTitle.value = item.titleTh ?? '';
  confirmDeleteOpen.value = true;
}

async function confirmDelete(): Promise<void> {
  if (pendingDeleteId.value === null) return;
  const id = pendingDeleteId.value;
  pendingDeleteId.value = null;

  try {
    await removeCourse(id);
    $q.notify({ type: 'positive', message: 'ลบรายวิชาเรียบร้อย', position: 'top' });

    if (items.value.length === 0 && pagination.value.page > 1) {
      await load(pagination.value.page - 1);
    }
  } catch {
    $q.notify({ type: 'negative', message: 'ลบรายวิชาไม่สำเร็จ', position: 'top' });
  }
}

function formatDate(value: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(date);
}

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return '-';
  if (startDate && endDate) return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  return startDate ? `เริ่ม ${formatDate(startDate)}` : `สิ้นสุด ${formatDate(endDate)}`;
}

const typeColors = ['primary', 'teal-7', 'deep-orange-7', 'purple-7', 'blue-grey-7'];
function getTypeColor(typeCourseId: number): string {
  return typeColors[(typeCourseId - 1) % typeColors.length] ?? 'grey-6';
}
</script>

<style lang="scss" scoped>
.courses-manager__add-btn {
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.84rem;
}

.courses-manager__filters {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 18px 24px 4px;
  border-bottom: 1px solid var(--admin-line);
}

.courses-manager__filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;
}

.courses-manager__search-row {
  padding: 12px 0 10px;
}

.courses-manager__field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1 1 200px;
  min-width: 160px;
}

.courses-manager__filter-row > .courses-manager__field:nth-child(1) {
  flex: 1 1 360px;
  min-width: 320px;
}

.courses-manager__filter-row > .courses-manager__field:nth-child(2) {
  flex: 0 1 220px;
  min-width: 220px;
}

.courses-manager__filter-row > .courses-manager__field:nth-child(3),
.courses-manager__filter-row > .courses-manager__field:nth-child(4) {
  flex: 0 1 150px;
  min-width: 150px;
}

.courses-manager__field--actions {
  flex: 0 0 auto;
  justify-content: flex-end;
  padding-top: 24px;
}

.courses-manager__field-label {
  color: #475467;
  font-size: 0.8rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.courses-manager__input,
.courses-manager__select {
  min-width: 160px;
}

.courses-manager__search {
  width: min(400px, 100%);
}

.courses-manager__filter-actions {
  display: flex;
  gap: 8px;
  align-items: center;
}

.courses-manager__filter-btn {
  min-height: 40px;
  height: 40px;
  padding: 0 20px;
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: 800;
}

.courses-manager__filter-btn--primary {
  box-shadow: 0 10px 22px rgba($primary, 0.2);
}

.courses-cell__faculty {
  display: -webkit-box;
  overflow: hidden;
  color: var(--admin-muted);
  font-size: 0.82rem;
  font-weight: 700;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.courses-cell__name {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.courses-cell__title {
  display: -webkit-box;
  overflow: hidden;
  color: var(--admin-navy);
  font-size: 0.92rem;
  font-weight: 800;
  line-height: 1.4;
  min-height: calc(1.4em * 2);
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.courses-cell__code {
  color: var(--admin-muted);
  font-size: 0.75rem;
  font-weight: 700;
}

.courses-cell__duration {
  color: var(--admin-ink);
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}

.courses-cell__responsible {
  display: -webkit-box;
  overflow: hidden;
  color: var(--admin-ink);
  font-size: 0.85rem;
  font-weight: 600;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.courses-cell__actions {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.courses-action-btn {
  --action-color: var(--admin-info-ink);
  --action-border: rgba(16, 35, 63, 0.12);
  --action-ring: rgba(16, 35, 63, 0.08);
  width: 34px;
  height: 34px;
  min-height: 34px;
  background: #ffffff !important;
  color: var(--action-color) !important;
  border: 1px solid var(--action-border) !important;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06) !important;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;

  :deep(.q-icon) {
    font-size: 17px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 8px 18px rgba(15, 23, 42, 0.12),
      0 0 0 1px var(--action-ring) !important;
  }
}

.courses-action-btn--copy {
  --action-color: #0f766e;
  --action-border: rgba(20, 184, 166, 0.28);
  --action-ring: rgba(20, 184, 166, 0.12);
}

.courses-action-btn--view {
  --action-color: #1d4ed8;
  --action-border: rgba(37, 99, 235, 0.22);
  --action-ring: rgba(37, 99, 235, 0.1);
}

.courses-action-btn--edit {
  --action-color: var(--admin-gold);
  --action-border: rgba(245, 166, 35, 0.28);
  --action-ring: rgba(245, 166, 35, 0.1);
}

.courses-action-btn--delete {
  --action-color: var(--admin-danger-ink);
  --action-border: rgba(225, 29, 72, 0.18);
  --action-ring: rgba(225, 29, 72, 0.08);
}

@media (max-width: 900px) {
  .courses-manager__filters {
    padding: 14px 16px 4px;
  }

  .courses-manager__filter-row {
    gap: 12px;
  }

  .courses-manager__field--actions {
    width: 100%;
    padding-top: 0;
  }

  .courses-manager__add-btn {
    font-size: 0.8rem;
  }
}
</style>
