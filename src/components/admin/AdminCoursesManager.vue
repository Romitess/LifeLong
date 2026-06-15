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
          <div class="courses-manager__field">
            <div class="courses-manager__field-label">ชื่อรายวิชา</div>
            <q-input
              v-model="filterCourseName"
              outlined
              dense
              clearable
              placeholder="ระบุชื่อรายวิชา"
              hint=" "
              class="courses-manager__input"
              @keyup.enter="applyFilters"
            />
          </div>

          <div class="courses-manager__field">
            <div class="courses-manager__field-label">คณะ/ส่วนงาน</div>
            <q-select
              v-model="filterFacultyId"
              outlined
              dense
              clearable
              emit-value
              map-options
              :options="filterOptions.faculties"
              option-label="label"
              option-value="id"
              placeholder="เลือกคณะ/ส่วนงาน"
              hint=" "
              class="courses-manager__select"
            />
          </div>

          <div class="courses-manager__field">
            <div class="courses-manager__field-label">ประเภท</div>
            <q-select
              v-model="filterTypeCourseId"
              outlined
              dense
              clearable
              emit-value
              map-options
              :options="filterOptions.courseTypes"
              option-label="label"
              option-value="id"
              placeholder="เลือกประเภท"
              hint=" "
              class="courses-manager__select"
            />
          </div>

          <div class="courses-manager__field">
            <div class="courses-manager__field-label">ค่าใช้จ่าย</div>
            <q-select
              v-model="filterFeeType"
              outlined
              dense
              clearable
              emit-value
              map-options
              :options="feeTypeOptions"
              option-label="label"
              option-value="value"
              placeholder="ทั้งหมด"
              hint=" "
              class="courses-manager__select"
            />
          </div>

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

      <div
        :class="[
          'courses-manager__table-wrap',
          { 'courses-manager__table-wrap--loading': isLoading && items.length > 0 },
        ]"
      >
        <table class="courses-manager-table">
          <colgroup>
            <col class="courses-manager-table__col-index" />
            <col class="courses-manager-table__col-faculty" />
            <col class="courses-manager-table__col-name" />
            <col class="courses-manager-table__col-duration" />
            <col class="courses-manager-table__col-responsible" />
            <col class="courses-manager-table__col-type" />
            <col class="courses-manager-table__col-copy" />
            <col class="courses-manager-table__col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th class="courses-manager-table__index">ลำดับ</th>
              <th>คณะ/ส่วนงาน</th>
              <th>ชื่อรายวิชา</th>
              <th>ระยะเวลาที่อนุมัติให้หลักสูตรดำเนินการได้</th>
              <th>ผู้รับผิดชอบรายวิชา</th>
              <th class="text-center">ประเภท</th>
              <th class="text-center">คัดลอก</th>
              <th class="text-center">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="isLoading && items.length === 0">
              <tr
                v-for="n in rowsPerPage"
                :key="`sk-${n}`"
                class="courses-manager-table__skeleton-row"
              >
                <td class="courses-manager-table__index">
                  <q-skeleton type="text" width="24px" class="q-mx-auto" />
                </td>
                <td><q-skeleton type="text" width="80%" /></td>
                <td>
                  <q-skeleton type="text" width="90%" />
                  <q-skeleton type="text" width="60%" class="q-mt-xs" />
                </td>
                <td><q-skeleton type="text" width="76%" /></td>
                <td><q-skeleton type="text" width="70%" /></td>
                <td class="text-center">
                  <q-skeleton type="QChip" width="72px" class="q-mx-auto" />
                </td>
                <td class="text-center">
                  <q-skeleton type="QBtn" width="34px" height="34px" class="q-mx-auto" />
                </td>
                <td class="text-center">
                  <div class="courses-manager-table__actions-cell">
                    <q-skeleton type="QBtn" width="34px" height="34px" />
                    <q-skeleton type="QBtn" width="34px" height="34px" />
                    <q-skeleton type="QBtn" width="34px" height="34px" />
                  </div>
                </td>
              </tr>
            </template>

            <template v-else-if="items.length > 0 || isLoading">
              <tr
                v-for="(item, index) in items"
                :key="item.courseId"
                class="courses-manager-table__row"
              >
                <td class="courses-manager-table__index">
                  {{ (pagination.page - 1) * pagination.pageSize + index + 1 }}
                </td>
                <td>
                  <span class="courses-manager-table__faculty">{{ item.facultyName }}</span>
                </td>
                <td>
                  <div class="courses-manager-table__name-cell">
                    <span class="courses-manager-table__title">{{ item.titleTh ?? '-' }}</span>
                    <span v-if="item.courseCode" class="courses-manager-table__code">
                      {{ item.courseCode }}
                    </span>
                  </div>
                </td>
                <td>
                  <span class="courses-manager-table__duration">
                    {{ formatDateRange(item.startDate, item.endDate) }}
                  </span>
                </td>
                <td>
                  <span class="courses-manager-table__responsible">
                    {{ item.responsibleName ?? '-' }}
                  </span>
                </td>
                <td class="text-center">
                  <q-badge
                    rounded
                    :color="getTypeColor(item.typeCourseId)"
                    :label="item.typeCourseName"
                    class="courses-manager-table__type-badge"
                  />
                </td>
                <td class="text-center">
                  <q-btn
                    dense
                    round
                    unelevated
                    icon="content_copy"
                    size="sm"
                    class="courses-manager-action-btn courses-manager-action-btn--copy"
                    aria-label="คัดลอก"
                    tag="a"
                    :href="resolveFullUrl(`/admin/courses/${item.courseId}/copy`)"
                    @click="navClick(`/admin/courses/${item.courseId}/copy`, $event)"
                  >
                    <q-tooltip>คัดลอก</q-tooltip>
                  </q-btn>
                </td>
                <td class="text-center">
                  <div class="courses-manager-table__actions-cell">
                    <q-btn
                      dense
                      round
                      unelevated
                      icon="visibility"
                      size="sm"
                      class="courses-manager-action-btn courses-manager-action-btn--view"
                      aria-label="ดูรายละเอียด"
                      tag="a"
                      :href="resolveFullUrl(`/admin/courses/${item.courseId}`)"
                      @click="navClick(`/admin/courses/${item.courseId}`, $event)"
                    >
                      <q-tooltip>ดูรายละเอียด</q-tooltip>
                    </q-btn>
                    <q-btn
                      dense
                      round
                      unelevated
                      icon="edit"
                      size="sm"
                      class="courses-manager-action-btn courses-manager-action-btn--edit"
                      aria-label="แก้ไข"
                      tag="a"
                      :href="resolveFullUrl(`/admin/courses/${item.courseId}/edit`)"
                      @click="navClick(`/admin/courses/${item.courseId}/edit`, $event)"
                    >
                      <q-tooltip>แก้ไข</q-tooltip>
                    </q-btn>
                    <q-btn
                      dense
                      round
                      unelevated
                      icon="delete"
                      size="sm"
                      class="courses-manager-action-btn courses-manager-action-btn--delete"
                      aria-label="ลบ"
                      @click="askDelete(item)"
                    >
                      <q-tooltip>ลบ</q-tooltip>
                    </q-btn>
                  </div>
                </td>
              </tr>

              <tr v-if="fillerRowHeight > 0" class="courses-manager-table__filler-row">
                <td colspan="8" :style="{ height: `${fillerRowHeight}px` }" />
              </tr>
            </template>

            <tr v-else>
              <td colspan="8" class="courses-manager-table__empty">
                {{
                  hasActiveFilters
                    ? 'ไม่พบรายวิชาที่ตรงกับเงื่อนไขการค้นหา'
                    : 'ยังไม่มีรายวิชาในระบบ'
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.totalPages > 1" ref="paginationRef" class="courses-manager__pagination">
        <BasePagination
          :model-value="currentPage"
          :max="pagination.totalPages"
          :max-pages="7"
          :disable="isLoading"
          gutter="md"
          @update:model-value="handlePageChange"
        />
      </div>
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
import { computed, nextTick, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import AppActionButton from 'components/admin/AppActionButton.vue';
import AppConfirmDialog from 'components/admin/AppConfirmDialog.vue';
import AppSearchInput from 'components/admin/AppSearchInput.vue';
import AppSurfaceCard from 'components/admin/AppSurfaceCard.vue';
import BasePagination from 'components/base/BasePagination.vue';
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
const currentPage = ref(1);
const paginationRef = ref<HTMLElement | null>(null);
const confirmDeleteOpen = ref(false);
const pendingDeleteId = ref<number | null>(null);
const pendingDeleteTitle = ref<string>('');

const rowsPerPage = 10;
const tableRowHeight = 72;
const tableHeaderHeight = 57;

const fillerRowHeight = computed(() =>
  Math.max(0, (rowsPerPage - items.value.length) * tableRowHeight),
);

async function preservePaginationPosition(update: () => Promise<void> | void): Promise<void> {
  const anchorTop =
    typeof window !== 'undefined' ? paginationRef.value?.getBoundingClientRect().top : undefined;
  await update();
  await nextTick();
  if (typeof window === 'undefined' || anchorTop === undefined || !paginationRef.value) return;
  const nextTop = paginationRef.value.getBoundingClientRect().top;
  if (Math.abs(nextTop - anchorTop) < 1) return;
  window.scrollBy({ top: nextTop - anchorTop, behavior: 'auto' });
}

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

const tableViewportHeight = `${rowsPerPage * tableRowHeight + tableHeaderHeight}px`;

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
    currentPage.value = pagination.value.page;
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

async function handlePageChange(page: number): Promise<void> {
  if (page === currentPage.value && page === pagination.value.page) return;
  await preservePaginationPosition(async () => {
    currentPage.value = page;
    await load(page);
  });
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
.courses-manager {
  --courses-manager-row-height: v-bind('`${tableRowHeight}px`');
  --courses-manager-table-height: v-bind('tableViewportHeight');
}

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

.courses-manager__table-wrap {
  overflow-x: auto;
  min-height: var(--courses-manager-table-height);
  position: relative;
}

.courses-manager__table-wrap--loading tbody {
  opacity: 0.45;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.courses-manager-table {
  width: 100%;
  min-width: 1100px;
  border-collapse: collapse;

  th,
  td {
    padding: 14px 16px;
    border-bottom: 1px solid var(--admin-line);
    vertical-align: middle;
  }

  thead th {
    background: #f8fafc;
    color: #475467;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  tbody tr.courses-manager-table__skeleton-row:hover,
  tbody tr.courses-manager-table__filler-row:hover {
    background: transparent;
  }

  tbody td {
    height: var(--courses-manager-row-height);
  }
}

.courses-manager-table__col-index {
  width: 64px;
}
.courses-manager-table__col-faculty {
  width: 180px;
}
.courses-manager-table__col-name {
  width: auto;
}
.courses-manager-table__col-duration {
  width: 190px;
}
.courses-manager-table__col-responsible {
  width: 160px;
}
.courses-manager-table__col-type {
  width: 130px;
}
.courses-manager-table__col-copy {
  width: 80px;
}
.courses-manager-table__col-actions {
  width: 130px;
}

.courses-manager-table__index {
  color: #1d4ed8;
  font-weight: 800;
  text-align: center;
  width: 64px;
}

.courses-manager-table__row {
  background: #ffffff;

  &:hover {
    background: rgba(37, 99, 235, 0.03);
  }
}

.courses-manager-table__skeleton-row td {
  background: #ffffff;
}

.courses-manager-table__filler-row td {
  padding: 0 !important;
  border-bottom: 0 !important;
  background: transparent !important;
}

.courses-manager-table__empty {
  height: calc(var(--courses-manager-table-height) - 1px) !important;
  padding: 38px 18px !important;
  color: #64748b;
  text-align: center;
  vertical-align: middle !important;
}

.courses-manager-table__faculty {
  display: -webkit-box;
  overflow: hidden;
  color: var(--admin-muted);
  font-size: 0.82rem;
  font-weight: 700;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.courses-manager-table__name-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.courses-manager-table__title {
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

.courses-manager-table__code {
  color: var(--admin-muted);
  font-size: 0.75rem;
  font-weight: 700;
}

.courses-manager-table__duration {
  color: var(--admin-ink);
  font-size: 0.82rem;
  font-weight: 700;
  white-space: nowrap;
}

.courses-manager-table__responsible {
  display: -webkit-box;
  overflow: hidden;
  color: var(--admin-ink);
  font-size: 0.85rem;
  font-weight: 600;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.courses-manager-table__type-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
}

.courses-manager-table__actions-cell {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.courses-manager__pagination {
  display: flex;
  justify-content: center;
  min-height: 72px;
  padding: 22px 24px 24px;
}

.courses-manager-action-btn {
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

.courses-manager-action-btn--copy {
  --action-color: #0f766e;
  --action-border: rgba(20, 184, 166, 0.28);
  --action-ring: rgba(20, 184, 166, 0.12);
}

.courses-manager-action-btn--view {
  --action-color: #1d4ed8;
  --action-border: rgba(37, 99, 235, 0.22);
  --action-ring: rgba(37, 99, 235, 0.1);
}

.courses-manager-action-btn--edit {
  --action-color: var(--admin-gold);
  --action-border: rgba(245, 166, 35, 0.28);
  --action-ring: rgba(245, 166, 35, 0.1);
}

.courses-manager-action-btn--delete {
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
