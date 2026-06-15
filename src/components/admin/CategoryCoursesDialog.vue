<template>
  <q-dialog
    v-model="dialogModel"
    class="admin-dialog"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="category-courses-dialog">
      <q-card-section class="category-courses-dialog__header">
        <div
          class="category-courses-dialog__icon-wrap"
          :style="{
            backgroundColor: category ? `${category.color}1f` : 'rgba(245, 166, 35, 0.16)',
            color: category?.color ?? '#b7791f',
          }"
        >
          <q-icon :name="category?.icon ?? 'category'" size="32px" />
        </div>

        <div class="category-courses-dialog__heading">
          <p class="category-courses-dialog__eyebrow">Courses in Category</p>
          <h2>{{ category?.name ?? 'หมวดหมู่' }}</h2>
          <span v-if="category?.nameEn" class="category-courses-dialog__subtitle">
            {{ category.nameEn }}
          </span>
        </div>
      </q-card-section>

      <q-card-section class="category-courses-dialog__summary">
        <div class="category-courses-dialog__metric">
          <span class="category-courses-dialog__metric-label">รายวิชาทั้งหมด</span>
          <strong class="category-courses-dialog__metric-value">{{ courses.length }}</strong>
        </div>
        <div class="category-courses-dialog__metric">
          <span class="category-courses-dialog__metric-label">เปิดรับ</span>
          <strong class="category-courses-dialog__metric-value text-positive">
            {{ activeCount }}
          </strong>
        </div>
        <div class="category-courses-dialog__metric">
          <span class="category-courses-dialog__metric-label">ปิดรับ</span>
          <strong class="category-courses-dialog__metric-value text-grey-7">
            {{ courses.length - activeCount }}
          </strong>
        </div>
      </q-card-section>

      <q-card-section class="category-courses-dialog__body">
        <div v-if="courses.length === 0" class="category-courses-dialog__empty">
          <div
            class="category-courses-dialog__empty-preview"
            :style="{
              '--category-accent': category?.color ?? '#F5A623',
              '--category-accent-soft': category
                ? `${category.color}14`
                : 'rgba(245, 166, 35, 0.08)',
            }"
          >
            <div class="category-courses-dialog__empty-preview-chip">
              <q-icon name="visibility" size="16px" />
              <span>Preview บนหน้า main</span>
            </div>

            <div class="category-courses-dialog__empty-preview-card">
              <div
                class="category-courses-dialog__empty-preview-icon"
                :style="{
                  backgroundColor: category ? `${category.color}1f` : 'rgba(245, 166, 35, 0.16)',
                  color: category?.color ?? '#b7791f',
                }"
              >
                <q-icon :name="category?.icon ?? 'category'" size="28px" />
              </div>

              <div class="category-courses-dialog__empty-preview-copy">
                <strong>{{ category?.name ?? 'หมวดหมู่' }}</strong>
                <span v-if="category?.nameEn">{{ category.nameEn }}</span>
                <p>
                  {{
                    category?.description ||
                    'หมวดหมู่นี้พร้อมแสดงในระบบแล้ว และสามารถเชื่อมรายวิชาเพิ่มได้ภายหลัง'
                  }}
                </p>
              </div>

              <div class="category-courses-dialog__empty-preview-meta">
                <span>{{ category?.slug ?? 'category' }}</span>
                <span>0 รายวิชา</span>
              </div>
            </div>
          </div>

          <p>หมวดหมู่นี้มีอยู่ใน taxonomy ของหน้า main แล้ว แต่ยังไม่มีรายวิชาเชื่อมอยู่</p>
        </div>

        <ul v-else class="category-courses-dialog__list">
          <li v-for="course in courses" :key="course.id" class="category-courses-dialog__item">
            <div
              class="category-courses-dialog__item-cover"
              :style="{
                backgroundColor: course.cover.backgroundColor,
                color: course.cover.accentColor,
              }"
            >
              <q-icon :name="course.cover.icon" size="22px" />
            </div>
            <div class="category-courses-dialog__item-copy">
              <div class="category-courses-dialog__item-code">{{ course.code }}</div>
              <div class="category-courses-dialog__item-title">{{ course.title }}</div>
              <div v-if="course.titleEn" class="category-courses-dialog__item-title-en">
                {{ course.titleEn }}
              </div>
            </div>
            <div class="category-courses-dialog__item-meta">
              <q-badge
                rounded
                :color="course.isActive ? 'positive' : 'grey-6'"
                :label="course.isActive ? 'เปิดรับ' : 'ปิดรับ'"
              />
              <span class="category-courses-dialog__item-seats">
                {{ course.enrolledCount }}/{{ course.maxSeats }} ที่นั่ง
              </span>
            </div>
          </li>
        </ul>
      </q-card-section>

      <q-card-actions class="category-courses-dialog__actions">
        <AppActionButton
          variant="secondary"
          label="ปิด"
          icon="close"
          no-caps
          @click="dialogModel = false"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import AppActionButton from 'components/admin/AppActionButton.vue';
import type { Category } from 'src/types/category';
import type { Course } from 'src/types/course';

interface Props {
  modelValue: boolean;
  category: Category | null;
  courses: Course[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
}>();

const dialogModel = computed<boolean>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const activeCount = computed(() => props.courses.filter((course) => course.isActive).length);
</script>

<style lang="scss" scoped>
.category-courses-dialog {
  position: relative;
  width: min(640px, calc(100vw - 32px));
  max-height: min(760px, calc(100vh - 40px));
  display: flex;
  flex-direction: column;
  border-radius: 20px;
  overflow: hidden;
  background: #ffffff;
  box-shadow: 0 28px 64px rgba(15, 23, 42, 0.24);
}

.category-courses-dialog__header {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 16px;
  padding: 24px 24px 8px;
  align-items: flex-start;
}

.category-courses-dialog__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
}

.category-courses-dialog__heading {
  min-width: 0;
}

.category-courses-dialog__eyebrow {
  margin: 0 0 4px;
  color: #b7791f;
  font-size: 0.72rem;
  font-weight: 950;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.category-courses-dialog__heading h2 {
  margin: 0;
  color: #10223c;
  font-size: 1.25rem;
  font-weight: 900;
  line-height: 1.3;
}

.category-courses-dialog__subtitle {
  display: block;
  margin-top: 4px;
  color: #64748b;
  font-size: 0.85rem;
  font-weight: 600;
}

.category-courses-dialog__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  padding: 12px 24px 0;
}

.category-courses-dialog__metric {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 14px;
  border-radius: 12px;
  background: #f8fafc;
  border: 1px solid var(--admin-line);
}

.category-courses-dialog__metric-label {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.category-courses-dialog__metric-value {
  color: #10223c;
  font-size: 1.4rem;
  font-weight: 900;
  line-height: 1;
}

.category-courses-dialog__body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  overscroll-behavior: contain;
  padding: 16px 24px 8px;
}

.category-courses-dialog__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 16px 0 24px;
  color: #64748b;
  text-align: center;
}

.category-courses-dialog__empty p {
  margin: 0;
  font-weight: 700;
}

.category-courses-dialog__empty-preview {
  width: min(100%, 520px);
  display: grid;
  gap: 12px;
}

.category-courses-dialog__empty-preview-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: fit-content;
  margin: 0 auto;
  padding: 8px 14px;
  border-radius: 999px;
  background: var(--category-accent-soft);
  color: var(--category-accent);
  font-size: 0.78rem;
  font-weight: 800;
}

.category-courses-dialog__empty-preview-card {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 14px;
  padding: 18px;
  border: 1px solid var(--admin-line);
  border-radius: 18px;
  background:
    linear-gradient(135deg, var(--category-accent-soft), rgba(255, 255, 255, 0.98) 42%), #ffffff;
  box-shadow: 0 16px 30px rgba(15, 23, 42, 0.06);
  text-align: left;
}

.category-courses-dialog__empty-preview-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 18px;
}

.category-courses-dialog__empty-preview-copy {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.category-courses-dialog__empty-preview-copy strong {
  color: #10223c;
  font-size: 1rem;
  font-weight: 900;
  line-height: 1.3;
}

.category-courses-dialog__empty-preview-copy span {
  color: #64748b;
  font-size: 0.82rem;
  font-weight: 700;
}

.category-courses-dialog__empty-preview-copy p {
  margin: 6px 0 0;
  color: #475569;
  font-size: 0.86rem;
  font-weight: 600;
  line-height: 1.6;
}

.category-courses-dialog__empty-preview-meta {
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-top: 2px;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.category-courses-dialog__list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 10px;
}

.category-courses-dialog__item {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) auto;
  gap: 14px;
  align-items: center;
  padding: 12px 14px;
  border: 1px solid var(--admin-line);
  border-radius: 14px;
  background: #ffffff;
  transition:
    transform 0.15s ease,
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.category-courses-dialog__item:hover {
  transform: translateY(-1px);
  border-color: rgba(245, 166, 35, 0.32);
  box-shadow: 0 8px 16px rgba(15, 23, 42, 0.06);
}

.category-courses-dialog__item-cover {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 12px;
}

.category-courses-dialog__item-copy {
  min-width: 0;
}

.category-courses-dialog__item-code {
  color: #b7791f;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.category-courses-dialog__item-title {
  color: #10223c;
  font-size: 0.95rem;
  font-weight: 800;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-courses-dialog__item-title-en {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
}

.category-courses-dialog__item-meta {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
}

.category-courses-dialog__item-seats {
  color: #64748b;
  font-size: 0.72rem;
  font-weight: 700;
}

.category-courses-dialog__actions {
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  padding: 0 24px 24px;
}

.category-courses-dialog__actions > * {
  width: 100%;
}

@media (max-width: 600px) {
  .category-courses-dialog {
    width: min(calc(100vw - 20px), 640px);
    max-height: calc(100vh - 20px);
  }

  .category-courses-dialog__summary {
    grid-template-columns: 1fr;
  }

  .category-courses-dialog__empty-preview-card,
  .category-courses-dialog__item {
    grid-template-columns: 1fr;
  }

  .category-courses-dialog__empty-preview-meta,
  .category-courses-dialog__item-meta {
    grid-column: 1 / -1;
    flex-direction: column;
    align-items: flex-start;
    justify-content: flex-start;
  }
}
</style>
