<template>
  <div class="chapter-tab">
    <AdminSurfaceCard
      eyebrow="Chapter Structure"
      title="บทเรียน"
      subtitle="โครงสร้างบทเรียนและหัวข้อย่อยของรายวิชา"
      body-padding="lg"
    >
      <template v-if="!readonly" #header-actions>
        <AdminActionButton variant="primary" icon="add" label="เพิ่มบทเรียน" @click="addChapter" />
      </template>

      <div v-if="chapters.length === 0" class="chapter-tab__empty">
        <q-icon name="menu_book" size="40px" color="grey-4" />
        <p class="text-grey-5">
          {{ readonly ? 'ไม่มีบทเรียน' : 'ยังไม่มีบทเรียน กดเพิ่มบทเรียนเพื่อเริ่มต้น' }}
        </p>
      </div>

      <div v-else class="chapter-tab__list">
        <div v-for="(chapter, idx) in chapters" :key="idx">
          <AdminSurfaceCard surface="subtle" body-padding="md">
            <!-- Header row -->
            <div class="chapter-tab__card-header">
              <span class="chapter-tab__seq">{{ idx + 1 }}</span>
              <div v-if="!readonly" class="chapter-tab__card-actions">
                <q-btn
                  flat
                  round
                  dense
                  icon="arrow_upward"
                  :color="idx === 0 ? 'grey-6' : 'primary'"
                  size="sm"
                  :disable="idx === 0"
                  @click="moveUp(idx)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="arrow_downward"
                  :color="idx === chapters.length - 1 ? 'grey-6' : 'primary'"
                  size="sm"
                  :disable="idx === chapters.length - 1"
                  @click="moveDown(idx)"
                />
                <q-btn
                  flat
                  round
                  dense
                  icon="delete_outline"
                  color="negative"
                  size="sm"
                  @click="removeChapter(idx)"
                />
              </div>
            </div>

            <!-- Chapter fields -->
            <div class="chapter-tab__fields">
              <div class="chapter-tab__field chapter-tab__field--full">
                <div class="chapter-tab__label">
                  ชื่อบทเรียน <span class="chapter-tab__required">*</span>
                </div>
                <q-input
                  v-model="chapter.subject"
                  outlined
                  dense
                  type="text"
                  placeholder="เช่น แนะนำรายวิชาและเครื่องมือที่ใช้"
                  class="chapter-tab__input"
                />
              </div>

              <div class="chapter-tab__field">
                <div class="chapter-tab__label">
                  จำนวนชั่วโมง <span class="chapter-tab__optional">(ไม่บังคับ)</span>
                </div>
                <div class="chapter-tab__hour-wrap">
                  <q-input
                    v-model.number="chapter.hour"
                    outlined
                    dense
                    type="number"
                    min="0"
                    placeholder="0"
                    class="chapter-tab__input chapter-tab__input--compact"
                  />
                  <span class="chapter-tab__unit">ชม.</span>
                </div>
              </div>

              <div class="chapter-tab__field">
                <div class="chapter-tab__label">
                  รูปแบบการเรียน <span class="chapter-tab__optional">(ไม่บังคับ)</span>
                </div>
                <q-select
                  v-model="chapter.chapterTypeId"
                  :options="chapterTypeOptions"
                  option-value="id"
                  option-label="label"
                  emit-value
                  map-options
                  outlined
                  dense
                  clearable
                  placeholder="เลือกรูปแบบ"
                  class="chapter-tab__input"
                />
              </div>

              <div
                v-if="isOtherType(chapter.chapterTypeId)"
                class="chapter-tab__field chapter-tab__field--full"
              >
                <div class="chapter-tab__label">ระบุรูปแบบการเรียน</div>
                <q-input
                  v-model="chapter.chapterTypeOther"
                  outlined
                  dense
                  type="text"
                  placeholder="ระบุรูปแบบการเรียนอื่นๆ"
                  class="chapter-tab__input"
                />
              </div>
            </div>

            <!-- Subchapters -->
            <div class="chapter-tab__subchapters">
              <div class="chapter-tab__sub-header">
                <span class="chapter-tab__sub-title">หัวข้อย่อย</span>
                <BaseButton
                  v-if="!readonly"
                  flat
                  dense
                  no-caps
                  color="primary"
                  text-color="primary"
                  icon="add"
                  label="เพิ่มหัวข้อย่อย"
                  class="chapter-tab__sub-add-btn"
                  @click="addSubchapter(idx)"
                />
              </div>
              <div
                v-for="(sub, sIdx) in chapter.subchapters"
                :key="sIdx"
                class="chapter-tab__sub-row"
              >
                <span class="chapter-tab__sub-seq">{{ idx + 1 }}.{{ sIdx + 1 }}</span>
                <q-input
                  v-model="sub.subject"
                  outlined
                  dense
                  type="text"
                  placeholder="ชื่อหัวข้อย่อย"
                  class="chapter-tab__input chapter-tab__sub-input"
                />
                <q-btn
                  v-if="!readonly"
                  flat
                  round
                  dense
                  icon="close"
                  color="negative"
                  size="sm"
                  @click="removeSubchapter(idx, sIdx)"
                />
              </div>
            </div>
          </AdminSurfaceCard>
        </div>
      </div>
    </AdminSurfaceCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ChapterTypeFormOption, CourseChapterPayload } from 'src/types/admin-courses';
import BaseButton from 'components/base/BaseButton.vue';
import AdminSurfaceCard from './AdminSurfaceCard.vue';
import AdminActionButton from './AdminActionButton.vue';

interface Props {
  modelValue: CourseChapterPayload[];
  chapterTypes: ChapterTypeFormOption[];
  readonly?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits<{ 'update:modelValue': [value: CourseChapterPayload[]] }>();

const chapters = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const chapterTypeOptions = computed(() => props.chapterTypes);

function isOtherType(typeId: number | undefined): boolean {
  if (!typeId) return false;
  return props.chapterTypes.find((t) => t.id === typeId)?.isOther ?? false;
}

function newChapter(): CourseChapterPayload {
  return { subject: '', subchapters: [] };
}

function addChapter(): void {
  emit('update:modelValue', [...chapters.value, newChapter()]);
}

function removeChapter(idx: number): void {
  const next = [...chapters.value];
  next.splice(idx, 1);
  emit('update:modelValue', next);
}

function moveUp(idx: number): void {
  if (idx === 0) return;
  const next = [...chapters.value] as CourseChapterPayload[];
  const tmp = next[idx - 1]!;
  next[idx - 1] = next[idx]!;
  next[idx] = tmp;
  emit('update:modelValue', next);
}

function moveDown(idx: number): void {
  if (idx >= chapters.value.length - 1) return;
  const next = [...chapters.value] as CourseChapterPayload[];
  const tmp = next[idx]!;
  next[idx] = next[idx + 1]!;
  next[idx + 1] = tmp;
  emit('update:modelValue', next);
}

function addSubchapter(chapIdx: number): void {
  const next = chapters.value.map((ch, i) => {
    if (i !== chapIdx) return ch;
    return { ...ch, subchapters: [...(ch.subchapters ?? []), { subject: '' }] };
  });
  emit('update:modelValue', next);
}

function removeSubchapter(chapIdx: number, subIdx: number): void {
  const next = chapters.value.map((ch, i) => {
    if (i !== chapIdx) return ch;
    const subs = [...(ch.subchapters ?? [])];
    subs.splice(subIdx, 1);
    return { ...ch, subchapters: subs };
  });
  emit('update:modelValue', next);
}
</script>

<style scoped lang="scss">
.chapter-tab__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 40px 0;

  p {
    margin: 0;
    font-size: 0.9rem;
  }
}

.chapter-tab__list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chapter-tab__card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.chapter-tab__seq {
  font-size: 0.85rem;
  font-weight: 700;
  color: $primary;
  background: rgba($primary, 0.1);
  border-radius: 50%;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chapter-tab__card-actions {
  display: flex;
  gap: 4px;
}

.chapter-tab__fields {
  display: grid;
  grid-template-columns: 1fr minmax(140px, 200px) minmax(200px, 280px);
  gap: 12px 16px;
  align-items: start;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
}

.chapter-tab__field--full {
  grid-column: 1 / -1;
}

.chapter-tab__label {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--admin-navy);
  margin-bottom: 4px;
}

.chapter-tab__required {
  color: $negative;
}

.chapter-tab__optional {
  color: var(--admin-muted);
  font-weight: 400;
}

.chapter-tab__input {
  width: 100%;
}

.chapter-tab__input--compact {
  width: 100%;
}

.chapter-tab__hour-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chapter-tab__unit {
  font-size: 0.85rem;
  color: var(--admin-muted);
  white-space: nowrap;
}

.chapter-tab__subchapters {
  margin-top: 16px;
  padding-top: 12px;
  border-top: 1px solid rgba($primary, 0.1);
}

.chapter-tab__sub-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.chapter-tab__sub-title {
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--admin-muted);
}

.chapter-tab__sub-add-btn {
  padding: 0 4px !important;
  min-height: 36px;
  border: none !important;
  box-shadow: none !important;

  :deep(.q-btn__content) {
    gap: 6px;
    font-size: 0.86rem;
    font-weight: 800;
    letter-spacing: 0;
  }
}

.chapter-tab__sub-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.chapter-tab__sub-seq {
  font-size: 0.75rem;
  color: var(--admin-muted);
  min-width: 28px;
  text-align: right;
}

.chapter-tab__sub-input {
  flex: 1;
}
</style>
