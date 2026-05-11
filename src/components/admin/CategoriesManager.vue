<template>
  <div class="categories-manager">
    <div class="row q-col-gutter-md categories-manager__stats">
      <div v-for="stat in categoryStats" :key="stat.label" class="col-12 col-sm-6 col-md-4">
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

    <AdminSurfaceCard eyebrow="Category Manager" title="รายการหมวด/หมู่วิชา" body-padding="none">
      <template #header-actions>
        <q-input
          v-model="search"
          outlined
          dense
          debounce="200"
          placeholder="ค้นหาหมวด/หมู่วิชา..."
          class="categories-manager__search"
        >
          <template #prepend><q-icon name="search" /></template>
        </q-input>
        <q-btn
          unelevated
          dense
          no-caps
          size="sm"
          icon="add"
          label="เพิ่มหมวด/หมู่"
          color="amber-8"
          text-color="white"
          class="categories-manager__add-btn"
          @click="openCreateDialog"
        />
      </template>

      <div class="categories-manager__table">
        <table class="categories-manager-table">
          <colgroup>
            <col class="categories-manager-table__col-index" />
            <col />
            <col class="categories-manager-table__col-slug" />
            <col class="categories-manager-table__col-courses" />
            <col class="categories-manager-table__col-trend" />
            <col class="categories-manager-table__col-status" />
            <col class="categories-manager-table__col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th class="categories-manager-table__index">ลำดับ</th>
              <th>หมวด/หมู่วิชา</th>
              <th>Slug</th>
              <th class="text-right">รายวิชา</th>
              <th>อัตราเปิดรับ</th>
              <th class="text-center">สถานะ</th>
              <th class="text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(row, index) in paginatedCategories" :key="row.id">
              <td class="categories-manager-table__index">
                {{ firstRowIndex + index + 1 }}
              </td>
              <td>
                <div class="category-cell">
                  <span
                    class="category-cell__icon"
                    :style="{ color: row.color, backgroundColor: `${row.color}1f` }"
                  >
                    <q-icon :name="row.icon" />
                  </span>
                  <div class="category-cell__copy">
                    <span class="category-cell__name">{{ row.name }}</span>
                    <span v-if="row.nameEn" class="category-cell__name-en">
                      {{ row.nameEn }}
                    </span>
                  </div>
                </div>
              </td>
              <td>
                <code class="category-cell__slug">{{ row.slug }}</code>
              </td>
              <td class="text-right">
                <div class="category-cell__courses">
                  <button
                    type="button"
                    class="category-cell__count-btn"
                    @click="openCoursesDialog(row)"
                  >
                    {{ row.courseCount }}
                    <q-tooltip>
                      {{
                        row.courseCount > 0
                          ? 'ดูรายวิชาทั้งหมด'
                          : 'ดู mockup หมวด/หมู่ที่ยังไม่มีรายวิชา'
                      }}
                    </q-tooltip>
                  </button>
                  <span class="category-cell__count-detail">
                    {{
                      row.courseCount > 0
                        ? `เปิดรับ ${row.activeCourseCount}/${row.courseCount}`
                        : 'ยังไม่มีรายวิชา'
                    }}
                  </span>
                </div>
              </td>
              <td>
                <div class="categories-manager__progress">
                  <q-linear-progress
                    rounded
                    size="7px"
                    :value="getTrendValue(row)"
                    :color="row.activeCourseCount > 0 ? 'primary' : 'grey-5'"
                  />
                  <span>{{ Math.round(getTrendValue(row) * 100) }}%</span>
                </div>
              </td>
              <td class="text-center">
                <div class="category-cell__status">
                  <q-toggle
                    :model-value="row.isActive"
                    color="positive"
                    dense
                    @update:model-value="toggleCategoryStatus(row)"
                  />
                  <q-badge
                    rounded
                    :color="row.isActive ? 'positive' : 'grey-6'"
                    :label="row.isActive ? 'เผยแพร่' : 'ซ่อน'"
                  />
                </div>
              </td>
              <td class="text-right">
                <div class="category-cell__actions">
                  <q-btn
                    dense
                    round
                    unelevated
                    icon="visibility"
                    size="sm"
                    class="categories-manager-action-btn categories-manager-action-btn--view"
                    aria-label="ดูรายวิชา"
                    @click="openCoursesDialog(row)"
                  >
                    <q-tooltip>
                      {{
                        row.courseCount === 0
                          ? 'ดู mockup หมวด/หมู่ที่ยังไม่มีรายวิชา'
                          : 'ดูรายวิชาทั้งหมด'
                      }}
                    </q-tooltip>
                  </q-btn>
                  <q-btn
                    dense
                    round
                    unelevated
                    icon="edit"
                    size="sm"
                    class="categories-manager-action-btn categories-manager-action-btn--edit"
                    aria-label="แก้ไข"
                    @click="openEditDialog(row)"
                  >
                    <q-tooltip>แก้ไขหมวด/หมู่วิชา</q-tooltip>
                  </q-btn>
                  <q-btn
                    dense
                    round
                    unelevated
                    icon="delete"
                    size="sm"
                    class="categories-manager-action-btn categories-manager-action-btn--delete"
                    :disable="row.courseCount > 0"
                    aria-label="ลบ"
                    @click="askDeleteCategory(row)"
                  >
                    <q-tooltip>
                      {{
                        row.courseCount > 0
                          ? 'ไม่สามารถลบได้ มีรายวิชาใช้งานอยู่'
                          : 'ลบหมวด/หมู่วิชา'
                      }}
                    </q-tooltip>
                  </q-btn>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedCategories.length === 0">
              <td colspan="7" class="categories-manager-table__empty">
                {{ search ? 'ไม่พบหมวด/หมู่ที่ตรงกับคำค้นหา' : 'ยังไม่มีหมวด/หมู่ในระบบ' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filteredCategories.length > rowsPerPage" class="categories-manager__pagination">
        <BasePagination v-model="currentPage" :max="pageCount" :max-pages="7" gutter="md" />
      </div>
    </AdminSurfaceCard>

    <CategoryFormDialog
      v-model="dialogOpen"
      :category="selectedCategory"
      :existing-names="existingNames"
      :existing-slugs="existingSlugs"
      :usage-count="selectedUsageCount"
      @submit="handleSubmit"
    />

    <CategoryCoursesDialog
      v-model="coursesDialogOpen"
      :category="categoryForCoursesDialog"
      :courses="coursesForDialog"
    />

    <AdminConfirmDialog
      v-model="confirmDeleteOpen"
      title="ลบหมวด/หมู่วิชา"
      :message="deleteConfirmMessage"
      confirm-label="ลบหมวด/หมู่"
      cancel-label="ยกเลิก"
      confirm-color="negative"
      icon-color="negative"
      @confirm="confirmDelete"
      @cancel="categoryPendingDelete = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import AdminConfirmDialog from 'components/admin/AdminConfirmDialog.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import BaseInfoCard from 'components/base/BaseInfoCard.vue';
import BasePagination from 'components/base/BasePagination.vue';
import CategoryCoursesDialog from 'components/admin/CategoryCoursesDialog.vue';
import CategoryFormDialog from 'components/admin/CategoryFormDialog.vue';
import { useCategoryStore } from 'src/stores/category-store';
import { useCourseStore } from 'src/stores/course-store';
import type { Category, CategoryFormPayload, CategoryWithUsage } from 'src/types/category';
import type { Course } from 'src/types/course';

type StatTone = 'primary' | 'positive' | 'indigo';

interface CategoryStat {
  icon: string;
  value: string;
  label: string;
  description: string;
  tone: StatTone;
}

const $q = useQuasar();
const categoryStore = useCategoryStore();
const courseStore = useCourseStore();

const search = ref('');
const dialogOpen = ref(false);
const selectedCategory = ref<Category | null>(null);
const confirmDeleteOpen = ref(false);
const categoryPendingDelete = ref<CategoryWithUsage | null>(null);
const coursesDialogOpen = ref(false);
const categoryForCoursesDialog = ref<Category | null>(null);

const rowsPerPage = 8;
const currentPage = ref(1);

onMounted(() => {
  courseStore.init();
  categoryStore.init();
});

const categoryRows = computed<CategoryWithUsage[]>(() => categoryStore.categoriesWithUsage);

const filteredCategories = computed<CategoryWithUsage[]>(() => {
  const keyword = search.value.trim().toLowerCase();
  if (!keyword) return categoryRows.value;
  return categoryRows.value.filter((row) => {
    const haystack = [row.name, row.nameEn ?? '', row.slug, row.description ?? '']
      .join(' ')
      .toLowerCase();
    return haystack.includes(keyword);
  });
});

const pageCount = computed(() =>
  Math.max(1, Math.ceil(filteredCategories.value.length / rowsPerPage)),
);
const firstRowIndex = computed(() => (currentPage.value - 1) * rowsPerPage);
const paginatedCategories = computed(() =>
  filteredCategories.value.slice(firstRowIndex.value, firstRowIndex.value + rowsPerPage),
);

watch(search, () => {
  currentPage.value = 1;
});
watch(pageCount, (count) => {
  if (currentPage.value > count) currentPage.value = count;
});

function getTrendValue(row: CategoryWithUsage): number {
  if (row.courseCount === 0) return 0;
  return row.activeCourseCount / row.courseCount;
}

const categoryStats = computed<CategoryStat[]>(() => [
  {
    icon: 'category',
    value: categoryRows.value.length.toString(),
    label: 'หมวด/หมู่ทั้งหมด',
    description: 'จำนวนหมวด/หมู่วิชาที่อยู่ในระบบ',
    tone: 'primary',
  },
  {
    icon: 'visibility',
    value: categoryRows.value.filter((row) => row.isActive).length.toString(),
    label: 'กำลังเผยแพร่',
    description: 'หมวด/หมู่ที่แสดงต่อผู้ใช้งาน',
    tone: 'positive',
  },
  {
    icon: 'library_books',
    value: courseStore.courses.length.toString(),
    label: 'รายวิชาในระบบ',
    description: 'จำนวนรายวิชาในทุกหมวด/หมู่',
    tone: 'indigo',
  },
]);

const existingNames = computed(() => {
  const names = categoryStore.categories.map((category) => category.name);
  if (!selectedCategory.value) return names;
  return names.filter((name) => name !== selectedCategory.value?.name);
});

const existingSlugs = computed(() => {
  const slugs = categoryStore.categories.map((category) => category.slug);
  if (!selectedCategory.value) return slugs;
  return slugs.filter((slug) => slug !== selectedCategory.value?.slug);
});

const selectedUsageCount = computed(() => {
  if (!selectedCategory.value) return 0;
  return categoryStore.countCourses(selectedCategory.value.name);
});

const deleteConfirmMessage = computed(() => {
  const target = categoryPendingDelete.value;
  if (!target) return '';
  return `คุณต้องการลบหมวด/หมู่ "${target.name}" ใช่หรือไม่ การดำเนินการนี้ไม่สามารถย้อนกลับได้`;
});

const coursesForDialog = computed<Course[]>(() => {
  const target = categoryForCoursesDialog.value;
  if (!target) return [];
  return courseStore.courses.filter((course) => course.category === target.name);
});

function openCreateDialog(): void {
  selectedCategory.value = null;
  dialogOpen.value = true;
}

function openEditDialog(row: CategoryWithUsage): void {
  const category = categoryStore.findById(row.id);
  selectedCategory.value = category ?? null;
  dialogOpen.value = true;
}

function openCoursesDialog(row: CategoryWithUsage): void {
  const category = categoryStore.findById(row.id);
  categoryForCoursesDialog.value = category ?? null;
  coursesDialogOpen.value = true;
}

function handleSubmit(payload: CategoryFormPayload): void {
  if (selectedCategory.value) {
    const updated = categoryStore.update(selectedCategory.value.id, payload);
    if (updated) {
      $q.notify({
        type: 'positive',
        message: `อัปเดตหมวด/หมู่ "${updated.name}" เรียบร้อย`,
        position: 'top',
      });
    }
  } else {
    const created = categoryStore.create(payload);
    $q.notify({
      type: 'positive',
      message: `เพิ่มหมวด/หมู่ "${created.name}" เรียบร้อย`,
      position: 'top',
    });
  }

  dialogOpen.value = false;
  selectedCategory.value = null;
}

function toggleCategoryStatus(row: CategoryWithUsage): void {
  categoryStore.toggleActive(row.id);
  const after = categoryStore.findById(row.id);
  if (!after) return;

  $q.notify({
    type: after.isActive ? 'positive' : 'info',
    message: `${after.isActive ? 'เผยแพร่' : 'ซ่อน'}หมวด/หมู่ "${after.name}" แล้ว`,
    position: 'top',
  });
}

function askDeleteCategory(row: CategoryWithUsage): void {
  if (row.courseCount > 0) {
    $q.notify({
      type: 'warning',
      message: `ไม่สามารถลบ "${row.name}" ได้ เนื่องจากมีรายวิชาใช้งานอยู่ ${row.courseCount} รายการ`,
      position: 'top',
    });
    return;
  }

  categoryPendingDelete.value = row;
  confirmDeleteOpen.value = true;
}

function confirmDelete(): void {
  const target = categoryPendingDelete.value;
  if (!target) return;

  const removed = categoryStore.remove(target.id);
  if (removed) {
    $q.notify({
      type: 'positive',
      message: `ลบหมวด/หมู่ "${target.name}" เรียบร้อย`,
      position: 'top',
    });
  } else {
    $q.notify({
      type: 'negative',
      message: 'ไม่สามารถลบหมวด/หมู่นี้ได้',
      position: 'top',
    });
  }

  categoryPendingDelete.value = null;
}
</script>

<style lang="scss" scoped>
.categories-manager__stats {
  margin-bottom: 18px;
  align-items: stretch;
}

.categories-manager__stats > [class*='col-'] {
  display: flex;
}

.categories-manager__stats :deep(.base-info-card) {
  width: 100%;
}

.categories-manager__search {
  width: min(280px, 100%);
}

.categories-manager__add-btn {
  border-radius: 8px;
  padding: 4px 12px;
  font-weight: 700;
  font-size: 0.82rem;
}

.categories-manager__progress {
  display: grid;
  grid-template-columns: minmax(90px, 1fr) 42px;
  gap: 8px;
  align-items: center;
  color: var(--admin-muted);
  font-size: 0.78rem;
  font-weight: 800;
}

.categories-manager__table {
  overflow-x: auto;
  min-height: 640px;
}

.categories-manager-table {
  width: 100%;
  border-collapse: collapse;
  background: #ffffff;

  thead th {
    padding: 14px 18px;
    color: #64748b;
    font-size: 0.78rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    text-align: left;
    background: rgba(15, 23, 42, 0.04);
    border-bottom: 1px solid #dce4ee;
    white-space: nowrap;
  }

  thead th.text-right {
    text-align: right;
  }

  thead th.text-center {
    text-align: center;
  }

  tbody td {
    padding: 14px 18px;
    border-bottom: 1px solid #eef2f7;
    color: #1f2937;
    font-size: 0.92rem;
    vertical-align: middle;
  }

  tbody tr:hover {
    background: rgba(245, 166, 35, 0.04);
  }

  tbody tr:last-child td {
    border-bottom: 0;
  }
}

.categories-manager-table__index {
  width: 64px;
  color: #94a3b8;
  font-weight: 800;
  text-align: center;
}

.categories-manager-table__col-index {
  width: 64px;
}

.categories-manager-table__col-slug {
  width: 180px;
}

.categories-manager-table__col-courses {
  width: 120px;
}

.categories-manager-table__col-trend {
  width: 180px;
}

.categories-manager-table__col-status {
  width: 160px;
}

.categories-manager-table__col-actions {
  width: 160px;
}

.categories-manager-table__empty {
  padding: 32px 16px !important;
  color: #94a3b8;
  font-weight: 700;
  text-align: center;
}

.category-cell {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
}

.category-cell__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

.category-cell__copy {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.category-cell__name {
  color: var(--admin-navy);
  font-weight: 800;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-cell__name-en {
  color: var(--admin-muted);
  font-size: 0.78rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-cell__slug {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(15, 23, 42, 0.05);
  color: #475569;
  font-size: 0.78rem;
  font-weight: 700;
}

.category-cell__courses {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.category-cell__count-btn {
  appearance: none;
  border: 0;
  background: transparent;
  color: var(--admin-navy);
  font-size: 0.95rem;
  font-weight: 850;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.category-cell__count-btn:not(:disabled):hover {
  color: #b7791f;
  text-decoration: underline;
}

.category-cell__count-btn:disabled {
  cursor: default;
  color: #94a3b8;
}

.category-cell__count-detail {
  color: var(--admin-muted);
  font-size: 0.72rem;
  font-weight: 700;
}

.category-cell__status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
}

.category-cell__actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.categories-manager-action-btn {
  --admin-action-color: var(--admin-info-ink);
  --admin-action-border: rgba(16, 35, 63, 0.12);
  --admin-action-ring: rgba(16, 35, 63, 0.08);
  width: 34px;
  height: 34px;
  min-height: 34px;
  margin: 0;
  background: #ffffff !important;
  color: var(--admin-action-color) !important;
  border: 1px solid var(--admin-action-border) !important;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06) !important;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease,
    color 0.18s ease;

  :deep(.q-icon) {
    font-size: 18px;
  }

  &:hover {
    transform: translateY(-2px);
    border-color: var(--admin-action-border) !important;
    box-shadow:
      0 8px 18px rgba(15, 23, 42, 0.12),
      0 0 0 1px var(--admin-action-ring) !important;
  }

  &.disabled,
  &[disabled] {
    box-shadow: none !important;
    background: #f1f5f9 !important;
    color: #94a3b8 !important;
    transform: none;
  }
}

.categories-manager-action-btn--view {
  --admin-action-color: var(--admin-info-ink);
  --admin-action-border: rgba(16, 35, 63, 0.16);
  --admin-action-ring: rgba(16, 35, 63, 0.08);
}

.categories-manager-action-btn--edit {
  --admin-action-color: var(--admin-gold);
  --admin-action-border: rgba(245, 166, 35, 0.28);
  --admin-action-ring: rgba(245, 166, 35, 0.1);
}

.categories-manager-action-btn--delete {
  --admin-action-color: var(--admin-danger-ink);
  --admin-action-border: rgba(225, 29, 72, 0.18);
  --admin-action-ring: rgba(225, 29, 72, 0.08);
}

.categories-manager__pagination {
  display: flex;
  justify-content: center;
  padding: 24px 18px 22px;
  border-top: 1px solid #dce4ee;
  background: #ffffff;
}
</style>
