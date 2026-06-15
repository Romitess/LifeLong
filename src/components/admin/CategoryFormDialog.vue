<template>
  <q-dialog
    v-model="dialogModel"
    class="admin-dialog"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="category-form-dialog">
      <q-card-section class="category-form-dialog__header">
        <div
          class="category-form-dialog__icon-wrap"
          :style="{ backgroundColor: previewBackground, color: form.color }"
        >
          <q-icon :name="form.icon || 'category'" size="32px" />
        </div>

        <div class="category-form-dialog__heading">
          <p class="category-form-dialog__eyebrow">
            {{ isEditing ? 'Edit Category' : 'New Category' }}
          </p>
          <h2>{{ isEditing ? 'แก้ไขหมวดหมู่' : 'เพิ่มหมวดหมู่ใหม่' }}</h2>
          <span v-if="usageHint" class="category-form-dialog__usage-hint">
            <q-icon name="info" size="14px" />
            {{ usageHint }}
          </span>
        </div>
      </q-card-section>

      <q-form ref="formRef" greedy class="category-form-dialog__form" @submit.prevent="onSubmit">
        <q-card-section class="category-form-dialog__body">
          <div class="category-form-dialog__grid">
            <q-input
              v-model="form.name"
              outlined
              dense
              stack-label
              label="ชื่อหมวดหมู่ (ภาษาไทย) *"
              hide-bottom-space
              :rules="nameRules"
              class="category-form-dialog__field--full"
              @blur="autofillSlug"
            />

            <q-input
              v-model="form.nameEn"
              outlined
              dense
              stack-label
              label="ชื่อหมวดหมู่ (English)"
              hide-bottom-space
            />

            <q-input
              v-model="form.slug"
              outlined
              dense
              stack-label
              label="Slug *"
              hint="ใช้เป็น identifier ใน URL"
              :rules="slugRules"
              hide-bottom-space
            />

            <q-input
              v-model="form.description"
              outlined
              dense
              type="textarea"
              autogrow
              stack-label
              label="คำอธิบาย (ภาษาไทย)"
              class="category-form-dialog__field--full"
            />

            <q-input
              v-model="form.descriptionEn"
              outlined
              dense
              type="textarea"
              autogrow
              stack-label
              label="คำอธิบาย (English)"
              class="category-form-dialog__field--full"
            />

            <ColorPickerInput
              v-model="form.color"
              label="สีประจำหมวดหมู่ *"
              hide-bottom-space
              class="category-form-dialog__field--full"
            />
          </div>

          <q-expansion-item
            v-model="iconSectionOpen"
            dense
            dense-toggle
            expand-separator
            switch-toggle-side
            header-class="category-form-dialog__icon-expansion-header"
            class="category-form-dialog__icon-section"
            icon="palette"
            label="เลือกไอคอน"
            caption="เปิดเพื่อเลือกหรือพิมพ์ชื่อ material icon"
          >
            <div class="category-form-dialog__icon-section-body">
              <div class="category-form-dialog__icon-section-header">
                <span>ระบุชื่อ icon</span>
                <q-input
                  v-model="form.icon"
                  outlined
                  dense
                  placeholder="material icon name"
                  class="category-form-dialog__icon-input"
                />
              </div>
              <div class="category-form-dialog__icon-grid">
                <button
                  v-for="icon in iconOptions"
                  :key="icon"
                  type="button"
                  :class="[
                    'category-form-dialog__icon-cell',
                    { 'category-form-dialog__icon-cell--active': form.icon === icon },
                  ]"
                  :style="{
                    borderColor: form.icon === icon ? form.color : undefined,
                    color: form.icon === icon ? form.color : undefined,
                  }"
                  @click="form.icon = icon"
                >
                  <q-icon :name="icon" size="22px" />
                </button>
              </div>
            </div>
          </q-expansion-item>

          <q-toggle
            v-model="form.isActive"
            color="positive"
            :label="form.isActive ? 'เผยแพร่หมวดหมู่นี้' : 'ซ่อนหมวดหมู่นี้'"
          />
        </q-card-section>

        <q-card-actions class="category-form-dialog__actions">
          <AppActionButton
            variant="secondary"
            label="ยกเลิก"
            no-caps
            type="button"
            @click="onCancel"
          />
          <AppActionButton
            variant="primary"
            :label="isEditing ? 'บันทึกการแก้ไข' : 'เพิ่มหมวดหมู่'"
            :icon="isEditing ? 'save' : 'add'"
            no-caps
            type="submit"
          />
        </q-card-actions>
      </q-form>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { QForm, ValidationRule } from 'quasar';
import AppActionButton from 'components/admin/AppActionButton.vue';
import ColorPickerInput from 'src/components/common/ColorPickerInput.vue';
import type { Category, CategoryFormPayload } from 'src/types/category';

interface Props {
  modelValue: boolean;
  category?: Category | null;
  existingNames?: string[];
  existingSlugs?: string[];
  usageCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  category: null,
  existingNames: () => [],
  existingSlugs: () => [],
  usageCount: 0,
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'submit', payload: CategoryFormPayload): void;
}>();

const formRef = ref<QForm | null>(null);
const iconSectionOpen = ref(false);

const dialogModel = computed<boolean>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const isEditing = computed(() => Boolean(props.category?.id));

const usageHint = computed(() => {
  if (!isEditing.value || props.usageCount === 0) return '';
  return `มี ${props.usageCount} รายวิชาที่ใช้หมวดหมู่นี้ การเปลี่ยนชื่อจะอัปเดตให้รายวิชาทั้งหมดอัตโนมัติ`;
});

const defaultForm = (): CategoryFormPayload => ({
  name: '',
  nameEn: '',
  slug: '',
  description: '',
  descriptionEn: '',
  icon: 'category',
  color: '#F5A623',
  isActive: true,
});

const form = reactive<CategoryFormPayload>(defaultForm());

const iconOptions = [
  'category',
  'school',
  'computer',
  'translate',
  'palette',
  'self_improvement',
  'health_and_safety',
  'engineering',
  'functions',
  'science',
  'business_center',
  'auto_stories',
  'design_services',
  'music_note',
  'sports_esports',
  'spa',
  'eco',
  'menu_book',
  'travel_explore',
  'public',
  'theaters',
  'agriculture',
  'restaurant',
  'biotech',
];

const nameRules: ValidationRule[] = [
  (value) => (typeof value === 'string' && value.trim().length > 0) || 'กรุณาระบุชื่อหมวดหมู่',
  (value) => {
    const normalized = String(value ?? '')
      .trim()
      .toLowerCase();
    const collisions = props.existingNames.map((name) => name.trim().toLowerCase());
    return !collisions.includes(normalized) || 'มีหมวดหมู่ชื่อนี้อยู่แล้ว';
  },
];

const slugRules: ValidationRule[] = [
  (value) => (typeof value === 'string' && value.trim().length > 0) || 'กรุณาระบุ slug',
  (value) =>
    /^[a-z0-9-]+$/.test(String(value ?? '').trim()) ||
    'slug รองรับตัวอักษรพิมพ์เล็ก ตัวเลข และ - เท่านั้น',
  (value) => {
    const normalized = String(value ?? '')
      .trim()
      .toLowerCase();
    const collisions = props.existingSlugs.map((slug) => slug.trim().toLowerCase());
    return !collisions.includes(normalized) || 'slug นี้ถูกใช้งานแล้ว';
  },
];

const previewBackground = computed(() => `${form.color}1f`);

function applyCategory(category: Category | null): void {
  const next = category
    ? {
        name: category.name,
        nameEn: category.nameEn ?? '',
        slug: category.slug,
        description: category.description ?? '',
        descriptionEn: category.descriptionEn ?? '',
        icon: category.icon,
        color: category.color,
        isActive: category.isActive,
      }
    : defaultForm();

  Object.assign(form, next);
}

watch(
  () => [props.modelValue, props.category] as const,
  ([open, category]) => {
    if (open) {
      applyCategory(category ?? null);
      iconSectionOpen.value = false;
      formRef.value?.resetValidation();
    }
  },
  { immediate: true },
);

function autofillSlug(): void {
  if (form.slug.trim().length > 0) return;
  const candidate = form.nameEn && form.nameEn.length > 0 ? form.nameEn : form.name;
  const fallback = candidate.trim().toLowerCase();
  if (!fallback) return;

  form.slug = fallback
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

async function onSubmit(): Promise<void> {
  const isValid = await formRef.value?.validate();
  if (!isValid) return;

  emit('submit', {
    name: form.name.trim(),
    nameEn: (form.nameEn ?? '').trim(),
    slug: form.slug.trim().toLowerCase(),
    description: (form.description ?? '').trim(),
    descriptionEn: (form.descriptionEn ?? '').trim(),
    icon: form.icon || 'category',
    color: form.color,
    isActive: form.isActive,
  });
}

function onCancel(): void {
  dialogModel.value = false;
}
</script>

<style lang="scss" scoped>
.category-form-dialog {
  position: relative;
  width: min(640px, calc(100vw - 32px));
  max-height: min(860px, calc(100vh - 40px));
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 28px 64px rgba(15, 23, 42, 0.24);
}

.category-form-dialog__header {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 16px;
  padding: 24px 24px 8px;
  align-items: flex-start;
}

.category-form-dialog__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(245, 166, 35, 0.16);
  transition: background 0.2s ease;
}

.category-form-dialog__heading {
  min-width: 0;
}

.category-form-dialog__eyebrow {
  margin: 0 0 4px;
  color: #b7791f;
  font-size: 0.72rem;
  font-weight: 950;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.category-form-dialog__heading h2 {
  margin: 0;
  color: #10223c;
  font-size: 1.2rem;
  font-weight: 900;
  line-height: 1.3;
}

.category-form-dialog__form {
  display: flex;
  flex: 1;
  min-height: 0;
  flex-direction: column;
}

.category-form-dialog__usage-hint {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 8px;
  padding: 6px 12px;
  border-radius: 999px;
  background: rgba(245, 166, 35, 0.14);
  color: #b45309;
  font-size: 0.78rem;
  font-weight: 700;
}

.category-form-dialog__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 18px 24px 6px;
  display: grid;
  gap: 20px;
}

.category-form-dialog__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.category-form-dialog__field--full {
  grid-column: span 2;
}

.category-form-dialog__icon-section {
  border: 1px dashed var(--admin-line);
  border-radius: 14px;
  background: #f8fafc;
}

.category-form-dialog__icon-section :deep(.q-item) {
  min-height: 58px;
  padding: 12px 14px;
}

.category-form-dialog__icon-section :deep(.q-item__label) {
  color: #10223c;
  font-size: 0.9rem;
  font-weight: 850;
}

.category-form-dialog__icon-section :deep(.q-item__label--caption) {
  margin-top: 4px;
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 600;
}

.category-form-dialog__icon-section :deep(.q-item__section--side) {
  color: var(--admin-muted);
}

.category-form-dialog__icon-section :deep(.q-expansion-item__toggle-icon) {
  color: var(--admin-muted);
  transition: color 0.18s ease;
}

.category-form-dialog__icon-section :deep(.q-item:hover .q-expansion-item__toggle-icon) {
  color: var(--admin-navy);
}

.category-form-dialog__icon-section
  :deep(.q-expansion-item--expanded .q-expansion-item__toggle-icon) {
  color: var(--admin-accent-ink);
}

.category-form-dialog__icon-section-body {
  display: grid;
  gap: 10px;
  padding: 0 14px 14px;
}

.category-form-dialog__icon-section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #10223c;
  font-size: 0.85rem;
  font-weight: 800;
}

.category-form-dialog__icon-input {
  width: min(220px, 100%);
}

.category-form-dialog__icon-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(0, 1fr));
  gap: 8px;
}

.category-form-dialog__icon-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  border-radius: 10px;
  border: 1px solid rgba(16, 35, 63, 0.12);
  background: #ffffff;
  color: #475569;
  cursor: pointer;
  transition:
    transform 0.12s ease,
    border-color 0.12s ease,
    color 0.12s ease;
}

.category-form-dialog__icon-cell:hover {
  transform: translateY(-1px);
  border-color: rgba(245, 166, 35, 0.4);
  color: #b7791f;
}

.category-form-dialog__icon-cell--active {
  background: rgba(245, 166, 35, 0.12);
  border-width: 2px;
}

.category-form-dialog__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 0 24px 24px;
}

.category-form-dialog__actions > * {
  width: 100%;
}

@media (max-width: 720px) {
  .category-form-dialog {
    width: min(calc(100vw - 20px), 640px);
    max-height: calc(100vh - 20px);
  }

  .category-form-dialog__grid {
    grid-template-columns: 1fr;
  }

  .category-form-dialog__field--full {
    grid-column: auto;
  }

  .category-form-dialog__icon-grid {
    grid-template-columns: repeat(6, minmax(0, 1fr));
  }

  .category-form-dialog__actions {
    grid-template-columns: 1fr;
  }

  .category-form-dialog__icon-section-header {
    flex-direction: column;
    align-items: stretch;
  }

  .category-form-dialog__icon-input {
    width: 100%;
  }
}
</style>
