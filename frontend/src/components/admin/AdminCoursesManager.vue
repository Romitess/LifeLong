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
        :row-height="88"
        :header-height="57"
        min-width="1320px"
        show-index
        :index-offset="(pagination.page - 1) * pagination.pageSize"
        :page="pagination.page"
        :total-pages="pagination.totalPages"
        :on-page-change="load"
        show-rows-per-page
        :on-rows-per-page-change="onRowsPerPageChange"
        :empty-text="
          hasActiveFilters ? 'ไม่พบรายวิชาที่ตรงกับเงื่อนไขการค้นหา' : 'ยังไม่มีรายวิชาในระบบ'
        "
      >
        <template #cell-cover="{ row }">
          <div class="courses-cell__cover">
            <img v-if="getImageUrl(row.imageUrl)" :src="getImageUrl(row.imageUrl)" alt="" />
            <q-icon v-else name="menu_book" size="22px" color="grey-6" />
          </div>
        </template>
        <template #skeleton-cover>
          <q-skeleton width="64px" height="48px" class="q-mx-auto" />
        </template>

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

        <template #cell-registration="{ row }">
          <span class="courses-cell__duration">
            {{ formatDateRange(row.registrationStart, row.registrationEnd) }}
          </span>
        </template>

        <template #cell-fee="{ row }">
          <span class="courses-cell__fee">{{ formatPrice(row.classFee) }}</span>
        </template>

        <template #cell-capacity="{ row }">
          <span class="courses-cell__capacity">{{ formatCapacity(row) }}</span>
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

        <template #cell-status="{ row }">
          <BaseToggle
            :model-value="row.status === 'Y'"
            color="positive"
            :disable="isPublishUpdating(row.courseId)"
            :aria-label="row.status === 'Y' ? 'ปิดเผยแพร่รายวิชา' : 'เผยแพร่รายวิชา'"
            @update:model-value="
              (value: boolean | null | undefined) => toggleCoursePublication(row, Boolean(value))
            "
          >
            <q-tooltip>
              {{ row.status === 'Y' ? 'ปิดเผยแพร่รายวิชา' : 'เผยแพร่รายวิชา' }}
            </q-tooltip>
          </BaseToggle>
        </template>
        <template #skeleton-status>
          <q-skeleton width="44px" height="24px" class="q-mx-auto" />
        </template>

        <template #cell-moodle="{ row }">
          <BaseStatusBadge
            :color="row.moodleSyncStatus === 'Y' ? 'positive' : 'grey-6'"
            :label="row.moodleSyncStatus === 'Y' ? 'ส่งข้อมูลแล้ว' : 'ยังไม่ส่ง'"
          />
        </template>
        <template #skeleton-moodle>
          <q-skeleton type="QChip" width="92px" class="q-mx-auto" />
        </template>

        <template #cell-actions="{ row }">
          <div class="courses-cell__actions">
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
import BaseToggle from 'components/base/BaseToggle.vue';
import { useAdminCourses } from 'src/composables/use-admin-courses';
import { isNewTabClick, resolveFullUrl } from 'src/composables/use-nav-link';
import { getImageUrl } from 'src/services/image.service';
import type { AdminCourseItem } from 'src/types/admin-courses';

const $q = useQuasar();
const router = useRouter();
const {
  items,
  filterOptions,
  pagination,
  isLoading,
  error,
  fetchData,
  removeCourse,
  publishCourse,
  unpublishCourse,
} = useAdminCourses();

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
const publishUpdatingIds = ref<Set<number>>(new Set());

const rowsPerPage = ref(10);

const tableColumns: BaseTableColumn[] = [
  { key: 'cover', label: 'รูป', align: 'center', width: '96px' },
  { key: 'faculty', label: 'คณะ/ส่วนงาน', width: '180px', sortable: true, sortKey: 'facultyName' },
  { key: 'name', label: 'ชื่อรายวิชา', width: '220px', sortable: true, sortKey: 'titleTh' },
  {
    key: 'duration',
    label: 'ระยะเวลาที่อนุมัติให้หลักสูตรดำเนินการได้',
    width: '190px',
    sortable: true,
    sortKey: 'startDate',
  },
  {
    key: 'registration',
    label: 'ลงทะเบียน',
    width: '170px',
    sortable: true,
    sortKey: 'registrationStart',
  },
  {
    key: 'fee',
    label: 'ค่าใช้จ่าย',
    align: 'right',
    width: '110px',
    sortable: true,
    sortKey: 'classFee',
  },
  {
    key: 'capacity',
    label: 'ผู้ลงทะเบียน',
    align: 'center',
    width: '120px',
    sortable: true,
    sortKey: 'enrolledCount',
  },
  {
    key: 'responsible',
    label: 'ผู้รับผิดชอบรายวิชา',
    width: '160px',
    sortable: true,
    sortKey: 'responsibleName',
  },
  {
    key: 'type',
    label: 'ประเภท',
    align: 'center',
    width: '130px',
    sortable: true,
    sortKey: 'typeCourseName',
  },
  {
    key: 'status',
    label: 'เผยแพร่',
    align: 'center',
    width: '90px',
    sortable: true,
    sortKey: 'status',
  },
  {
    key: 'moodle',
    label: 'Moodle',
    align: 'center',
    width: '120px',
    sortable: true,
    sortKey: 'moodleSyncStatus',
  },
  { key: 'actions', label: 'ดำเนินการ', align: 'center', width: '96px' },
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
      pageSize: rowsPerPage.value,
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

async function onRowsPerPageChange(newSize: number): Promise<void> {
  rowsPerPage.value = newSize;
  await load(1);
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

function isPublishUpdating(courseId: number): boolean {
  return publishUpdatingIds.value.has(courseId);
}

function setPublishUpdating(courseId: number, updating: boolean): void {
  const next = new Set(publishUpdatingIds.value);
  if (updating) next.add(courseId);
  else next.delete(courseId);
  publishUpdatingIds.value = next;
}

async function toggleCoursePublication(
  item: AdminCourseItem,
  shouldPublish: boolean,
): Promise<void> {
  if (isPublishUpdating(item.courseId)) return;

  const previousStatus = item.status;
  const previousPublished = item.published;
  item.status = shouldPublish ? 'Y' : 'N';
  item.published = shouldPublish ? 'Y' : 'N';
  setPublishUpdating(item.courseId, true);

  try {
    if (shouldPublish) {
      const result = await publishCourse(item.courseId);
      $q.notify({
        type: result.warnings.length > 0 ? 'warning' : 'positive',
        message:
          result.warnings.length > 0
            ? `เปิดเผยแพร่แล้ว (${result.warnings.join(', ')})`
            : 'เปิดเผยแพร่รายวิชาเรียบร้อย',
        position: 'top',
      });
    } else {
      await unpublishCourse(item.courseId);
      $q.notify({ type: 'positive', message: 'ปิดเผยแพร่รายวิชาเรียบร้อย', position: 'top' });
    }
  } catch {
    item.status = previousStatus;
    item.published = previousPublished;
    $q.notify({
      type: 'negative',
      message: shouldPublish ? 'เปิดเผยแพร่รายวิชาไม่สำเร็จ' : 'ปิดเผยแพร่รายวิชาไม่สำเร็จ',
      position: 'top',
    });
  } finally {
    setPublishUpdating(item.courseId, false);
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

function formatPrice(value: number | null): string {
  const amount = Number(value ?? 0);
  if (amount <= 0) return 'ไม่มีค่าใช้จ่าย';
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatCapacity(item: AdminCourseItem): string {
  const enrolled = item.enrolledCount.toLocaleString('th-TH');
  if (!item.maxSeats || item.maxSeats <= 0) return enrolled;
  return `${enrolled}/${item.maxSeats.toLocaleString('th-TH')}`;
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

.courses-cell__cover {
  display: inline-flex;
  overflow: hidden;
  width: 64px;
  height: 48px;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(16, 35, 63, 0.08);
  border-radius: 8px;
  background: #f8fafc;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
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
  white-space: normal;
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

.courses-cell__fee,
.courses-cell__capacity {
  color: var(--admin-ink);
  font-size: 0.85rem;
  font-weight: 800;
}

.courses-cell__fee {
  display: inline-block;
  max-width: 100%;
  overflow-wrap: anywhere;
}

.courses-cell__actions {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
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
