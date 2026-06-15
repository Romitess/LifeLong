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

    <AppSurfaceCard
      eyebrow="Category Manager"
      title="รายการหมวด/หมู่วิชา"
      subtitle="ข้อมูลหน้านี้เชื่อมกับ LLTCATEGORY และ LLTSUBCATEGORY โดยตรง"
      body-padding="none"
    >
      <template #header-actions>
        <AppSearchInput
          v-model="search"
          placeholder="ค้นหาหมวด/หมู่..."
          :debounce="200"
          class="categories-manager__search"
        />
        <AppActionButton
          variant="primary"
          icon="add"
          label="เพิ่มหมวด"
          class="categories-manager__add-btn"
          @click="openCreateCategoryDialog"
        />
      </template>

      <div class="categories-manager__table">
        <table class="categories-manager-table">
          <colgroup>
            <col class="categories-manager-table__col-index" />
            <col class="categories-manager-table__col-name" />
            <col class="categories-manager-table__col-courses" />
            <col class="categories-manager-table__col-trend" />
            <col class="categories-manager-table__col-status" />
            <col class="categories-manager-table__col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th class="categories-manager-table__index">ลำดับ</th>
              <th>หมวด/หมู่วิชา</th>
              <th class="text-right">รายวิชา</th>
              <th>อัตราเปิดรับ</th>
              <th class="text-center">สถานะ</th>
              <th class="text-right">จัดการ</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="isLoading">
              <tr
                v-for="skeletonIndex in rowsPerPage"
                :key="`skeleton-${skeletonIndex}`"
                class="categories-manager-table__skeleton-row"
              >
                <td class="categories-manager-table__index">
                  <q-skeleton type="text" width="28px" class="q-mx-auto" />
                </td>
                <td>
                  <div class="category-cell">
                    <q-skeleton type="QAvatar" size="36px" />
                    <div class="category-cell__copy category-cell__copy--skeleton">
                      <q-skeleton type="text" width="82%" />
                      <q-skeleton type="text" width="44%" />
                    </div>
                  </div>
                </td>
                <td class="text-right">
                  <div class="category-cell__courses">
                    <q-skeleton
                      type="text"
                      width="34px"
                      class="categories-manager__metric-skeleton"
                    />
                    <q-skeleton
                      type="text"
                      width="74px"
                      class="categories-manager__metric-skeleton"
                    />
                  </div>
                </td>
                <td>
                  <div class="categories-manager__progress">
                    <q-skeleton type="rect" height="7px" />
                    <q-skeleton type="text" width="28px" />
                  </div>
                </td>
                <td class="text-center">
                  <div class="category-cell__status">
                    <q-skeleton type="QToggle" width="42px" />
                    <q-skeleton type="QChip" width="64px" />
                  </div>
                </td>
                <td class="text-right">
                  <div class="category-cell__actions">
                    <q-skeleton type="QBtn" width="82px" height="34px" />
                    <q-skeleton type="QBtn" width="34px" height="34px" />
                    <q-skeleton type="QBtn" width="34px" height="34px" />
                  </div>
                </td>
              </tr>
            </template>

            <template v-else-if="paginatedRows.length > 0">
              <tr
                v-for="row in paginatedRows"
                :key="row.key"
                :class="
                  row.kind === 'category'
                    ? 'categories-manager-table__category-row'
                    : 'categories-manager-table__subcategory-row'
                "
              >
                <td class="categories-manager-table__index">
                  {{ row.displayIndex }}
                </td>
                <td>
                  <div
                    :class="[
                      'category-cell',
                      { 'category-cell--subcategory': row.kind === 'subcategory' },
                    ]"
                  >
                    <span
                      :class="[
                        'category-cell__icon',
                        row.kind === 'category'
                          ? 'category-cell__icon--category'
                          : 'category-cell__icon--subcategory',
                      ]"
                      :style="
                        row.kind === 'category' && row.category.color
                          ? { background: `${row.category.color}1a`, color: row.category.color }
                          : {}
                      "
                    >
                      <q-icon
                        :name="
                          row.kind === 'category'
                            ? row.category.icon || 'category'
                            : 'subdirectory_arrow_right'
                        "
                      />
                    </span>
                    <div class="category-cell__copy">
                      <span class="category-cell__name">
                        {{
                          row.kind === 'category'
                            ? row.category.name || '-'
                            : row.subcategory.name || '-'
                        }}
                      </span>
                      <span v-if="row.kind === 'category'" class="category-cell__meta">
                        หมวด {{ row.displayIndex }} · {{ row.category.subcategories.length }} หมู่
                      </span>
                    </div>
                  </div>
                </td>
                <td class="text-right">
                  <div class="category-cell__courses">
                    <strong>{{
                      row.kind === 'category'
                        ? row.category.courseCount
                        : row.subcategory.courseCount
                    }}</strong>
                    <span>
                      เปิดรับ
                      {{
                        row.kind === 'category'
                          ? `${row.category.activeCourseCount}/${row.category.courseCount}`
                          : `${row.subcategory.activeCourseCount}/${row.subcategory.courseCount}`
                      }}
                    </span>
                  </div>
                </td>
                <td>
                  <div class="categories-manager__progress">
                    <q-linear-progress
                      rounded
                      size="7px"
                      :value="
                        getTrendValue(row.kind === 'category' ? row.category : row.subcategory)
                      "
                      :color="
                        (row.kind === 'category'
                          ? row.category.activeCourseCount
                          : row.subcategory.activeCourseCount) > 0
                          ? 'primary'
                          : 'grey-5'
                      "
                    />
                    <span>
                      {{
                        Math.round(
                          getTrendValue(row.kind === 'category' ? row.category : row.subcategory) *
                            100,
                        )
                      }}%
                    </span>
                  </div>
                </td>
                <td class="text-center">
                  <div class="category-cell__status">
                    <q-toggle
                      :model-value="
                        row.kind === 'category'
                          ? row.category.activeFlag === 'Y'
                          : row.subcategory.activeFlag === 'Y'
                      "
                      color="positive"
                      dense
                      @update:model-value="
                        (value) =>
                          row.kind === 'category'
                            ? toggleCategoryStatus(row.category, value)
                            : toggleSubcategoryStatus(row.subcategory, value)
                      "
                    />
                    <q-badge
                      rounded
                      :color="
                        (row.kind === 'category'
                          ? row.category.activeFlag
                          : row.subcategory.activeFlag) === 'Y'
                          ? 'positive'
                          : 'grey-6'
                      "
                      :label="
                        (row.kind === 'category'
                          ? row.category.activeFlag
                          : row.subcategory.activeFlag) === 'Y'
                          ? 'เผยแพร่'
                          : 'ซ่อน'
                      "
                      class="category-cell__status-badge"
                    />
                  </div>
                </td>
                <td class="text-right">
                  <div class="category-cell__actions">
                    <template v-if="row.kind === 'category'">
                      <AppActionButton
                        variant="primary"
                        icon="add"
                        label="เพิ่มหมู่"
                        class="categories-manager__sub-add-btn"
                        @click="openCreateSubcategoryDialog(row.category)"
                      />
                      <q-btn
                        dense
                        round
                        unelevated
                        icon="edit"
                        size="sm"
                        class="categories-manager-action-btn categories-manager-action-btn--edit"
                        aria-label="แก้ไขหมวด"
                        @click="openEditCategoryDialog(row.category)"
                      >
                        <q-tooltip>แก้ไขหมวด</q-tooltip>
                      </q-btn>
                      <q-btn
                        dense
                        round
                        unelevated
                        icon="delete"
                        size="sm"
                        class="categories-manager-action-btn categories-manager-action-btn--delete"
                        :disable="!canDeleteCategory(row.category)"
                        aria-label="ลบหมวด"
                        @click="askDeleteCategory(row.category)"
                      >
                        <q-tooltip>ลบหมวด</q-tooltip>
                      </q-btn>
                    </template>
                    <template v-else>
                      <q-btn
                        dense
                        round
                        unelevated
                        icon="edit"
                        size="sm"
                        class="categories-manager-action-btn categories-manager-action-btn--edit"
                        aria-label="แก้ไขหมู่"
                        @click="openEditSubcategoryDialog(row.subcategory)"
                      >
                        <q-tooltip>แก้ไขหมู่</q-tooltip>
                      </q-btn>
                      <q-btn
                        dense
                        round
                        unelevated
                        icon="delete"
                        size="sm"
                        class="categories-manager-action-btn categories-manager-action-btn--delete"
                        :disable="row.subcategory.courseCount > 0"
                        aria-label="ลบหมู่"
                        @click="askDeleteSubcategory(row.subcategory)"
                      >
                        <q-tooltip>ลบหมู่</q-tooltip>
                      </q-btn>
                    </template>
                  </div>
                </td>
              </tr>

              <tr v-if="fillerRowHeight > 0" class="categories-manager-table__filler-row">
                <td colspan="6" :style="{ height: `${fillerRowHeight}px` }"></td>
              </tr>
            </template>

            <tr v-else>
              <td colspan="6" class="categories-manager-table__empty">
                {{ search ? 'ไม่พบหมวด/หมู่ที่ตรงกับคำค้นหา' : 'ยังไม่มีหมวด/หมู่ในระบบ' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="totalPages > 1" ref="paginationRef" class="categories-manager__pagination">
        <BasePagination
          :model-value="currentPage"
          :max="totalPages"
          :max-pages="7"
          gutter="md"
          @update:model-value="handlePageChange"
        />
      </div>
    </AppSurfaceCard>

    <q-dialog
      v-model="formDialogOpen"
      class="admin-dialog"
      transition-show="scale"
      transition-hide="scale"
    >
      <q-card class="taxonomy-dialog">
        <q-card-section class="taxonomy-dialog__header">
          <div
            class="taxonomy-dialog__icon-wrap"
            :style="
              dialogMode === 'category' && form.color
                ? { background: `${form.color}22`, color: form.color }
                : selectedParentCategory?.color
                  ? {
                      background: `${selectedParentCategory.color}22`,
                      color: selectedParentCategory.color,
                    }
                  : {}
            "
          >
            <q-icon
              :name="
                dialogMode === 'category'
                  ? form.icon || 'category'
                  : selectedParentCategory?.icon || 'account_tree'
              "
              size="30px"
            />
          </div>
          <div>
            <p>{{ dialogMode === 'category' ? 'Category' : 'Subcategory' }}</p>
            <h2>{{ dialogTitle }}</h2>
            <span v-if="selectedParentCategory">
              สร้างหมู่ภายใต้หมวด {{ selectedParentCategory.name }}
            </span>
          </div>
          <q-btn v-close-popup dense flat round icon="close" />
        </q-card-section>

        <q-form ref="formRef" greedy @submit.prevent="submitForm">
          <q-card-section class="taxonomy-dialog__body">
            <q-input
              v-model="form.name"
              outlined
              dense
              stack-label
              label="ชื่อ *"
              :rules="nameRules"
              class="admin-editor-field"
              hide-bottom-space
            />

            <template v-if="dialogMode === 'category'">
              <!-- Icon picker -->
              <div class="taxonomy-field-label q-mt-md q-mb-xs">Icon</div>
              <div class="taxonomy-icon-grid">
                <button
                  v-for="ic in PRESET_ICONS"
                  :key="ic"
                  type="button"
                  class="taxonomy-icon-cell"
                  :class="{ 'taxonomy-icon-cell--active': form.icon === ic }"
                  :style="form.icon === ic ? { color: form.color, borderColor: form.color } : {}"
                  @click="form.icon = ic"
                >
                  <q-icon :name="ic" size="20px" />
                </button>
              </div>

              <!-- Color picker -->
              <ColorPickerInput v-model="form.color" label="สี" class="q-mt-md" />
            </template>

            <q-toggle
              v-model="form.isActive"
              color="positive"
              :label="form.isActive ? 'เผยแพร่' : 'ซ่อน'"
              class="q-mt-sm"
            />
          </q-card-section>

          <q-card-actions class="taxonomy-dialog__actions">
            <AppActionButton
              variant="secondary"
              label="ยกเลิก"
              no-caps
              type="button"
              @click="formDialogOpen = false"
            />
            <AppActionButton
              variant="primary"
              no-caps
              :loading="isSaving"
              :label="editingNode ? 'บันทึก' : 'สร้าง'"
              :icon="editingNode ? 'save' : 'add'"
              type="submit"
            />
          </q-card-actions>
        </q-form>
      </q-card>
    </q-dialog>

    <AppConfirmDialog
      v-model="confirmDeleteOpen"
      :title="deleteTitle"
      :message="deleteConfirmMessage"
      confirm-label="ลบ"
      cancel-label="ยกเลิก"
      confirm-color="negative"
      icon-color="negative"
      @confirm="confirmDelete"
      @cancel="pendingDelete = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref, watch } from 'vue';
import type { QForm, ValidationRule } from 'quasar';
import { useQuasar } from 'quasar';
import AppActionButton from 'components/admin/AppActionButton.vue';
import AppConfirmDialog from 'components/admin/AppConfirmDialog.vue';
import AppSearchInput from 'components/admin/AppSearchInput.vue';
import AppSurfaceCard from 'components/admin/AppSurfaceCard.vue';
import BaseInfoCard from 'components/base/BaseInfoCard.vue';
import BasePagination from 'components/base/BasePagination.vue';
import { useAdminCourseTaxonomy } from 'src/composables/use-admin-course-taxonomy';
import ColorPickerInput from 'src/components/common/ColorPickerInput.vue';
import type { AdminCourseCategory, AdminCourseSubcategory } from 'src/types/admin-course-taxonomy';

type StatTone = 'primary' | 'positive' | 'indigo';
type DialogMode = 'category' | 'subcategory';
type DeleteTarget =
  | { type: 'category'; item: AdminCourseCategory }
  | { type: 'subcategory'; item: AdminCourseSubcategory };

interface CategoryStat {
  icon: string;
  value: string;
  label: string;
  description: string;
  tone: StatTone;
}

interface CountableNode {
  courseCount: number;
  activeCourseCount: number;
}

interface TaxonomyFormState {
  name: string;
  isActive: boolean;
  icon: string;
  color: string;
}

type CategoryTableRow =
  | {
      kind: 'category';
      key: string;
      displayIndex: string;
      category: AdminCourseCategory;
    }
  | {
      kind: 'subcategory';
      key: string;
      displayIndex: string;
      subcategory: AdminCourseSubcategory;
    };

const $q = useQuasar();
const formRef = ref<QForm | null>(null);
const search = ref('');
const currentPage = ref(1);
const rowsPerPage = 10;
const tableRowHeight = 76;
const tableHeaderHeight = 57;
const paginationRef = ref<HTMLElement | null>(null);
const formDialogOpen = ref(false);
const confirmDeleteOpen = ref(false);
const dialogMode = ref<DialogMode>('category');
const editingNode = ref<AdminCourseCategory | AdminCourseSubcategory | null>(null);
const selectedParentCategory = ref<AdminCourseCategory | null>(null);
const pendingDelete = ref<DeleteTarget | null>(null);

const PRESET_ICONS = [
  'category',
  'translate',
  'computer',
  'school',
  'self_improvement',
  'functions',
  'health_and_safety',
  'restaurant',
  'engineering',
  'public',
  'business_center',
  'eco',
  'palette',
  'gavel',
  'agriculture',
  'science',
  'psychology',
  'music_note',
  'sports',
  'build',
] as const;

const form = reactive<TaxonomyFormState>({
  name: '',
  isActive: true,
  icon: 'category',
  color: '#6B7280',
});

const {
  categories,
  isLoading,
  isSaving,
  totalSubcategories,
  totalCourseCount,
  activeNodeCount,
  fetchData,
  createCategory,
  updateCategory,
  deleteCategory,
  createSubcategory,
  updateSubcategory,
  deleteSubcategory,
} = useAdminCourseTaxonomy();

onMounted(() => {
  void loadCategories();
});

const filteredCategories = computed<AdminCourseCategory[]>(() => {
  const keyword = search.value.trim().toLowerCase();
  if (!keyword) return categories.value;

  return categories.value
    .map((category) => {
      const categoryMatched = category.name.toLowerCase().includes(keyword);
      const matchedSubcategories = category.subcategories.filter((subcategory) =>
        subcategory.name.toLowerCase().includes(keyword),
      );

      if (categoryMatched) {
        return category;
      }

      if (matchedSubcategories.length > 0) {
        return { ...category, subcategories: matchedSubcategories };
      }

      return null;
    })
    .filter((category): category is AdminCourseCategory => category !== null);
});

const flattenedRows = computed<CategoryTableRow[]>(() => {
  let categoryNumber = 0;

  return filteredCategories.value.flatMap((category) => {
    categoryNumber += 1;

    const categoryRow: CategoryTableRow = {
      kind: 'category',
      key: `cat-${category.id}`,
      displayIndex: `${categoryNumber}`,
      category,
    };

    const subcategoryRows: CategoryTableRow[] = category.subcategories.map(
      (subcategory, subcategoryIndex) => ({
        kind: 'subcategory',
        key: `sub-${subcategory.id}`,
        displayIndex: `${categoryNumber}.${subcategoryIndex + 1}`,
        subcategory,
      }),
    );

    return [categoryRow, ...subcategoryRows];
  });
});

const totalPages = computed(() => Math.max(1, Math.ceil(flattenedRows.value.length / rowsPerPage)));

const paginatedRows = computed<CategoryTableRow[]>(() => {
  const start = (currentPage.value - 1) * rowsPerPage;
  return flattenedRows.value.slice(start, start + rowsPerPage);
});

const categoryStats = computed<CategoryStat[]>(() => [
  {
    icon: 'category',
    value: categories.value.length.toString(),
    label: 'หมวดทั้งหมด',
    description: 'จำนวนหมวดวิชาในฐานข้อมูล',
    tone: 'primary',
  },
  {
    icon: 'account_tree',
    value: totalSubcategories.value.toString(),
    label: 'หมู่ทั้งหมด',
    description: 'จำนวนหมู่วิชาภายใต้หมวด',
    tone: 'positive',
  },
  {
    icon: 'library_books',
    value: totalCourseCount.value.toString(),
    label: 'รายวิชาที่ผูกอยู่',
    description: `รายการเผยแพร่ ${activeNodeCount.value} หมวด/หมู่`,
    tone: 'indigo',
  },
]);

const dialogTitle = computed(() => {
  if (dialogMode.value === 'category') {
    return editingNode.value ? 'แก้ไขหมวดวิชา' : 'เพิ่มหมวดวิชา';
  }

  return editingNode.value ? 'แก้ไขหมู่วิชา' : 'เพิ่มหมู่วิชา';
});

const deleteTitle = computed(() =>
  pendingDelete.value?.type === 'subcategory' ? 'ลบหมู่วิชา' : 'ลบหมวดวิชา',
);

const deleteConfirmMessage = computed(() => {
  const target = pendingDelete.value;
  if (!target) return '';
  return `ต้องการลบ "${target.item.name}" ใช่หรือไม่ การดำเนินการนี้ไม่สามารถย้อนกลับได้`;
});

const nameRules: ValidationRule[] = [
  (value) => (typeof value === 'string' && value.trim().length > 0) || 'กรุณาระบุชื่อ',
  (value) => !isNameDuplicated(String(value ?? '')) || 'มีชื่อนี้อยู่แล้ว',
];

watch(formDialogOpen, (isOpen) => {
  if (!isOpen) {
    editingNode.value = null;
    selectedParentCategory.value = null;
    resetForm();
  }
});

watch(search, () => {
  currentPage.value = 1;
});

watch(totalPages, (maxPage) => {
  if (currentPage.value > maxPage) {
    currentPage.value = maxPage;
  }
});

function getTrendValue(node: CountableNode): number {
  if (node.courseCount === 0) return 0;
  return node.activeCourseCount / node.courseCount;
}

function canDeleteCategory(category: AdminCourseCategory): boolean {
  const subcategoryCourseCount = category.subcategories.reduce(
    (sum, subcategory) => sum + subcategory.courseCount,
    0,
  );

  return category.courseCount + subcategoryCourseCount === 0;
}

const fillerRowHeight = computed(() =>
  Math.max(0, (rowsPerPage - paginatedRows.value.length) * tableRowHeight),
);

const tableViewportHeight = `${rowsPerPage * tableRowHeight + tableHeaderHeight}px`;

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
  if (page === currentPage.value) {
    return;
  }

  await preservePaginationPosition(() => {
    currentPage.value = page;
  });
}

async function loadCategories(): Promise<void> {
  try {
    await fetchData();
  } catch (error: unknown) {
    notifyError(error, 'ไม่สามารถโหลดหมวด/หมู่วิชาได้');
  }
}

function resetForm(): void {
  form.name = '';
  form.isActive = true;
  form.icon = 'category';
  form.color = '#6B7280';
}

function fillForm(
  name: string,
  activeFlag: string,
  icon?: string | null,
  color?: string | null,
): void {
  form.name = name;
  form.isActive = activeFlag === 'Y';
  form.icon = icon ?? 'category';
  form.color = color ?? '#6B7280';
}

function openCreateCategoryDialog(): void {
  resetForm();
  dialogMode.value = 'category';
  editingNode.value = null;
  selectedParentCategory.value = null;
  formDialogOpen.value = true;
}

function openEditCategoryDialog(category: AdminCourseCategory): void {
  dialogMode.value = 'category';
  editingNode.value = category;
  selectedParentCategory.value = null;
  fillForm(category.name, category.activeFlag, category.icon, category.color);
  formDialogOpen.value = true;
}

function openCreateSubcategoryDialog(category: AdminCourseCategory): void {
  resetForm();
  dialogMode.value = 'subcategory';
  editingNode.value = null;
  selectedParentCategory.value = category;
  formDialogOpen.value = true;
}

function openEditSubcategoryDialog(subcategory: AdminCourseSubcategory): void {
  dialogMode.value = 'subcategory';
  editingNode.value = subcategory;
  selectedParentCategory.value =
    categories.value.find((category) => category.id === subcategory.categoryId) ?? null;
  fillForm(subcategory.name, subcategory.activeFlag);
  formDialogOpen.value = true;
}

async function submitForm(): Promise<void> {
  const valid = await formRef.value?.validate();
  if (!valid) return;

  try {
    const activeFlag = form.isActive ? 'Y' : 'N';

    if (dialogMode.value === 'category') {
      if (editingNode.value) {
        await updateCategory(editingNode.value.id, {
          name: form.name.trim(),
          activeFlag,
          icon: form.icon.trim() || undefined,
          color: form.color.trim() || undefined,
        });
      } else {
        await createCategory({
          name: form.name.trim(),
          activeFlag,
          icon: form.icon.trim() || undefined,
          color: form.color.trim() || undefined,
        });
      }
    } else {
      const parentCategoryId = selectedParentCategory.value?.id;
      if (!parentCategoryId) {
        $q.notify({ type: 'negative', message: 'ไม่พบหมวดหลักของหมู่วิชา', position: 'top' });
        return;
      }

      if (editingNode.value) {
        await updateSubcategory(editingNode.value.id, {
          categoryId: parentCategoryId,
          name: form.name.trim(),
          activeFlag,
        });
      } else {
        await createSubcategory({
          categoryId: parentCategoryId,
          name: form.name.trim(),
          activeFlag,
        });
      }
    }

    $q.notify({ type: 'positive', message: 'บันทึกข้อมูลเรียบร้อย', position: 'top' });
    formDialogOpen.value = false;
  } catch (error: unknown) {
    notifyError(error, 'บันทึกข้อมูลไม่สำเร็จ');
  }
}

function toggleCategoryStatus(category: AdminCourseCategory, isActive: boolean): void {
  const previousActiveFlag = category.activeFlag;
  const nextActiveFlag = isActive ? 'Y' : 'N';
  category.activeFlag = nextActiveFlag;

  void updateCategory(category.id, {
    name: category.name,
    activeFlag: nextActiveFlag,
  })
    .then(() => {
      $q.notify({ type: 'positive', message: 'อัปเดตสถานะหมวดแล้ว', position: 'top' });
    })
    .catch((error: unknown) => {
      category.activeFlag = previousActiveFlag;
      notifyError(error, 'อัปเดตสถานะไม่สำเร็จ');
    });
}

function toggleSubcategoryStatus(subcategory: AdminCourseSubcategory, isActive: boolean): void {
  const previousActiveFlag = subcategory.activeFlag;
  const nextActiveFlag = isActive ? 'Y' : 'N';
  subcategory.activeFlag = nextActiveFlag;

  void updateSubcategory(subcategory.id, {
    categoryId: subcategory.categoryId,
    name: subcategory.name,
    activeFlag: nextActiveFlag,
  })
    .then(() => {
      $q.notify({ type: 'positive', message: 'อัปเดตสถานะหมู่แล้ว', position: 'top' });
    })
    .catch((error: unknown) => {
      subcategory.activeFlag = previousActiveFlag;
      notifyError(error, 'อัปเดตสถานะไม่สำเร็จ');
    });
}

function askDeleteCategory(category: AdminCourseCategory): void {
  pendingDelete.value = { type: 'category', item: category };
  confirmDeleteOpen.value = true;
}

function askDeleteSubcategory(subcategory: AdminCourseSubcategory): void {
  pendingDelete.value = { type: 'subcategory', item: subcategory };
  confirmDeleteOpen.value = true;
}

async function confirmDelete(): Promise<void> {
  const target = pendingDelete.value;
  if (!target) return;

  try {
    if (target.type === 'category') {
      await deleteCategory(target.item.id);
    } else {
      await deleteSubcategory(target.item.id);
    }

    $q.notify({ type: 'positive', message: 'ลบข้อมูลเรียบร้อย', position: 'top' });
  } catch (error: unknown) {
    notifyError(error, 'ลบข้อมูลไม่สำเร็จ');
  } finally {
    pendingDelete.value = null;
  }
}

function isNameDuplicated(name: string): boolean {
  const normalized = name.trim().toLowerCase();
  if (!normalized) return false;

  if (dialogMode.value === 'category') {
    return categories.value.some(
      (category) =>
        category.id !== editingNode.value?.id && category.name.trim().toLowerCase() === normalized,
    );
  }

  const category = selectedParentCategory.value;
  if (!category) return false;

  return category.subcategories.some(
    (subcategory) =>
      subcategory.id !== editingNode.value?.id &&
      subcategory.name.trim().toLowerCase() === normalized,
  );
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  return '';
}

function notifyError(error: unknown, fallbackMessage: string): void {
  $q.notify({
    type: 'negative',
    message: getErrorMessage(error) || fallbackMessage,
    position: 'top',
  });
}
</script>

<style lang="scss" scoped>
.categories-manager__stats {
  margin-bottom: 18px;
  align-items: stretch;
}

.categories-manager {
  --categories-manager-row-height: v-bind('`${tableRowHeight}px`');
  --categories-manager-table-height: v-bind('tableViewportHeight');
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
  min-height: 40px !important;
  padding: 0 16px !important;
  font-size: 0.875rem !important;
  white-space: nowrap;
}

.categories-manager__sub-add-btn {
  min-height: 32px !important;
  padding: 0 12px !important;
  font-size: 0.8rem !important;
  white-space: nowrap;
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
  min-height: var(--categories-manager-table-height);
}

.categories-manager-table {
  width: 100%;
  min-width: 960px;
  border-collapse: collapse;

  th,
  td {
    padding: 16px 18px;
    border-bottom: 1px solid var(--admin-line); // token admin (เดิม rogue ink rgba(15,23,42,.08))
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

  tbody tr.categories-manager-table__filler-row:hover,
  tbody tr.categories-manager-table__skeleton-row:hover {
    background: transparent;
  }

  tbody td {
    height: var(--categories-manager-row-height);
  }
}

.categories-manager-table__category-row {
  background: #ffffff;

  &:hover {
    background: rgba(245, 166, 35, 0.05);
  }
}

.categories-manager-table__subcategory-row {
  background: #f8fafc;

  &:hover {
    background: #f1f5f9;
  }
}

.categories-manager-table__index {
  width: 88px;
  color: #1d4ed8;
  font-weight: 800;
  text-align: center;
}

.categories-manager-table__col-index {
  width: 88px;
}

.categories-manager-table__col-name {
  width: auto;
}

.categories-manager-table__col-courses {
  width: 132px;
}

.categories-manager-table__col-trend {
  width: 160px;
}

.categories-manager-table__col-status {
  width: 144px;
}

.categories-manager-table__col-actions {
  width: 214px;
}

.categories-manager-table__empty {
  height: calc(var(--categories-manager-table-height) - 1px);
  padding: 38px 18px !important;
  color: #64748b;
  text-align: center;
  vertical-align: middle !important;
}

.categories-manager-table__skeleton-row td {
  background: #ffffff;
}

.categories-manager-table__filler-row td {
  padding: 0 !important;
  border-bottom: 0 !important;
  background: transparent !important;
}

.category-cell {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr);
  gap: 12px;
  align-items: flex-start;
  min-width: 0;
}

.category-cell--subcategory {
  padding-left: 18px;
}

.category-cell__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
}

.category-cell__icon--category {
  color: #b7791f;
  background: rgba(245, 166, 35, 0.14);
}

.category-cell__icon--subcategory {
  color: #2563eb;
  background: rgba(37, 99, 235, 0.1);
}

.category-cell__copy {
  display: grid;
  gap: 4px;
  min-width: 0;
  min-height: 56px;
  align-content: center;
}

.category-cell__copy--skeleton {
  width: 100%;
}

.category-cell__name {
  display: -webkit-box;
  min-width: 0;
  color: var(--admin-navy);
  font-size: 0.95rem;
  font-weight: 850;
  line-height: 1.42;
  overflow: hidden;
  overflow-wrap: anywhere;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  min-height: calc(1.42em * 2);
  text-wrap: pretty;
}

.category-cell__meta,
.category-cell__courses span {
  color: var(--admin-muted);
  font-size: 0.75rem;
  font-weight: 700;
}

.category-cell__meta {
  display: block;
  min-height: 1.2em;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.category-cell__courses {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}

.categories-manager__metric-skeleton {
  margin-left: auto;
}

.category-cell__status {
  display: inline-grid;
  grid-template-columns: 42px 64px;
  align-items: center;
  gap: 8px;
  justify-content: center;
  width: 114px;
}

.category-cell__status :deep(.q-toggle) {
  width: 42px;
  min-width: 42px;
}

.category-cell__status-badge {
  justify-content: center;
  width: 64px;
  min-width: 64px;
}

.category-cell__actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  justify-content: flex-end;
}

.categories-manager__pagination {
  display: flex;
  justify-content: center;
  min-height: 72px;
  padding: 22px 24px 24px;
}

@media (max-width: 900px) {
  .categories-manager-table__empty {
    height: calc(var(--categories-manager-table-height) - 1px);
  }
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

.taxonomy-dialog {
  width: min(520px, calc(100vw - 32px));
  overflow: hidden;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 28px 64px rgba(15, 23, 42, 0.24);
}

.taxonomy-dialog__header {
  display: grid;
  grid-template-columns: 56px minmax(0, 1fr) auto;
  gap: 16px;
  align-items: flex-start;
  padding: 24px 24px 14px;
}

.taxonomy-dialog__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 16px;
  color: var(--admin-gold);
  background: rgba(245, 166, 35, 0.16);
}

.taxonomy-dialog__header {
  p {
    margin: 0 0 4px;
    color: var(--admin-accent-ink);
    font-size: 0.75rem;
    font-weight: 900;
    text-transform: uppercase;
  }

  h2 {
    margin: 0;
    color: var(--admin-navy);
    font-size: 1.15rem;
    font-weight: 850;
    line-height: 1.35;
  }

  span {
    display: block;
    margin-top: 6px;
    color: var(--admin-muted);
    font-size: 0.86rem;
  }
}

.taxonomy-dialog__body {
  display: grid;
  gap: 16px;
  padding: 10px 24px 14px;
}

.taxonomy-dialog__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 0 24px 24px;
}

.taxonomy-dialog__actions > * {
  width: 100%;
}

@media (max-width: 760px) {
  .categories-manager__search {
    width: 100%;
  }

  .category-cell--subcategory {
    padding-left: 8px;
  }

  .taxonomy-dialog__header,
  .taxonomy-dialog__actions {
    grid-template-columns: 1fr;
  }
}

.taxonomy-field-label {
  font-size: 0.78rem;
  font-weight: 700;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.taxonomy-icon-grid {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
}

.taxonomy-icon-cell {
  display: grid;
  place-items: center;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 1.5px solid rgba(17, 24, 39, 0.1);
  background: #f8fafc;
  color: #64748b;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    border-color: rgba(17, 24, 39, 0.3);
    background: #f1f5f9;
  }

  &--active {
    background: rgba(245, 166, 35, 0.1);
    border-width: 2px;
  }
}
</style>
