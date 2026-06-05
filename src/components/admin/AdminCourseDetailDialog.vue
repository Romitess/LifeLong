<template>
  <q-dialog
    v-model="dialogModel"
    class="admin-dialog"
    transition-show="scale"
    transition-hide="scale"
    maximized
  >
    <q-card class="course-detail-dialog">
      <q-card-section class="course-detail-dialog__header">
        <div class="course-detail-dialog__title-row">
          <div>
            <div class="course-detail-dialog__code">{{ course?.courseCode }}</div>
            <h2 class="course-detail-dialog__title">{{ course?.nameTh }}</h2>
            <div class="course-detail-dialog__title-en">{{ course?.nameEn }}</div>
          </div>
          <q-btn flat round dense icon="close" @click="dialogModel = false" />
        </div>
      </q-card-section>

      <q-card-section class="course-detail-dialog__body">
        <div v-if="loading" class="course-detail-dialog__loading">
          <q-spinner size="40px" color="primary" />
        </div>

        <template v-else-if="course">
          <!-- ข้อมูลหลัก -->
          <div class="detail-section">
            <div class="detail-section__title">ข้อมูลทั่วไป</div>
            <div class="detail-grid">
              <DetailField
                label="คณะ/ส่วนงาน"
                :value="labelOf(options?.faculties, course.facultyId)"
              />
              <DetailField
                label="ประเภทหลักสูตร"
                :value="labelOf(options?.courseTypes, course.typeCourseId)"
              />
              <DetailField
                label="รูปแบบการเรียน"
                :value="labelOf(options?.studyTypes, course.studyTypeId)"
              />
              <DetailField
                label="หมวดหมู่"
                :value="labelOf(options?.categories, course.categoryId)"
              />
              <DetailField
                label="หมวดหมู่ย่อย"
                :value="labelOf(options?.subcategories, course.subcategoryId)"
              />
              <DetailField label="ทักษะ" :value="skillLabels" />
              <DetailField label="วันเริ่ม" :value="course.startDate" />
              <DetailField label="วันสิ้นสุด" :value="course.endDate" />
              <DetailField label="เปิดรับสมัคร" :value="course.registrationStart" />
              <DetailField label="ปิดรับสมัคร" :value="course.registrationEnd" />
              <DetailField label="จำนวนที่นั่ง" :value="course.maxSeats" />
              <DetailField label="จำนวนชั่วโมง (ทฤษฎี)" :value="course.theoryHours" />
              <DetailField label="จำนวนชั่วโมง (ปฏิบัติ)" :value="course.practiceHours" />
              <DetailField
                v-if="course.typeCourseId === 2"
                label="Credit Bank"
                :value="course.creditBank"
              />
            </div>
            <div v-if="course.description" class="detail-field detail-field--full">
              <div class="detail-field__label">เกี่ยวกับรายวิชา</div>
              <div class="detail-field__value detail-field__value--multiline">
                {{ course.description }}
              </div>
            </div>
            <div v-if="course.summary" class="detail-field detail-field--full">
              <div class="detail-field__label">วัตถุประสงค์รายวิชา</div>
              <ol class="detail-objective-list">
                <li v-for="(line, i) in course.summary.split('\n').filter(Boolean)" :key="i">
                  {{ line }}
                </li>
              </ol>
            </div>
            <DetailField label="คุณสมบัติเบื้องต้น" :value="course.precondition" full />
          </div>

          <!-- วุฒิบัตร -->
          <div v-if="course.certificate === 'Y'" class="detail-section">
            <div class="detail-section__title">วุฒิบัตร</div>
            <div class="detail-grid">
              <DetailField label="มีวุฒิบัตร" value="มี" />
              <DetailField label="ชื่อวุฒิบัตร" :value="course.certificateName" />
            </div>
          </div>

          <!-- ค่าธรรมเนียม -->
          <div v-if="course.classTypeId" class="detail-section">
            <div class="detail-section__title">ค่าธรรมเนียม</div>
            <div class="detail-grid">
              <DetailField
                label="ประเภทชั้นเรียน"
                :value="labelOf(options?.classTypes, course.classTypeId)"
              />
              <DetailField
                label="ค่าธรรมเนียม"
                :value="course.classFee != null ? `${course.classFee} บาท` : null"
              />
              <DetailField label="หมายเหตุ" :value="course.classFeeRemark" />
            </div>
          </div>

          <!-- ผู้ติดต่อ -->
          <div class="detail-section">
            <div class="detail-section__title">ผู้ติดต่อ</div>
            <div class="detail-grid">
              <DetailField label="ชื่อ" :value="course.contactName" />
              <DetailField label="เบอร์โทร" :value="course.contactTel" />
              <DetailField label="อีเมล" :value="course.contactEmail" />
              <DetailField label="URL" :value="course.contactUrl" />
            </div>
          </div>

          <!-- ผู้สอน -->
          <div v-if="course.instructors.length" class="detail-section">
            <div class="detail-section__title">ผู้สอน</div>
            <div class="detail-list">
              <div v-for="(ins, i) in course.instructors" :key="i" class="detail-list__item">
                {{ ins.email }}
              </div>
            </div>
          </div>

          <!-- กลุ่มเป้าหมาย -->
          <div v-if="course.targets.length" class="detail-section">
            <div class="detail-section__title">กลุ่มเป้าหมาย</div>
            <div class="detail-list">
              <div v-for="(t, i) in course.targets" :key="i" class="detail-list__item">
                {{ targetLabel(t) }}
              </div>
            </div>
          </div>

          <!-- บทเรียน -->
          <div v-if="course.chapters.length" class="detail-section">
            <div class="detail-section__title">บทเรียน</div>
            <div v-for="(ch, i) in course.chapters" :key="i" class="chapter-item">
              <div class="chapter-item__header">
                <span class="chapter-item__seq">{{ i + 1 }}</span>
                <span class="chapter-item__name">{{ ch.subject }}</span>
                <span v-if="ch.hour" class="chapter-item__meta">{{ ch.hour }} ชม.</span>
                <span v-if="ch.chapterTypeId" class="chapter-item__meta">
                  {{ chapterTypeLabel(ch) }}
                </span>
              </div>
              <div v-if="ch.subchapters?.length" class="chapter-item__subs">
                <div v-for="(sub, j) in ch.subchapters" :key="j" class="chapter-item__sub">
                  {{ i + 1 }}.{{ j + 1 }} {{ sub.subject }}
                </div>
              </div>
            </div>
          </div>
        </template>
      </q-card-section>

      <q-card-actions class="course-detail-dialog__footer">
        <AppActionButton variant="secondary" label="ปิด" @click="dialogModel = false" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type {
  AdminCourseDetail,
  AdminCourseFormOptions,
  CourseChapterPayload,
} from 'src/types/admin-courses';
import AppActionButton from './AppActionButton.vue';

const DetailField = {
  props: ['label', 'value', 'full'],
  template: `
    <div :class="['detail-field', full ? 'detail-field--full' : '']">
      <div class="detail-field__label">{{ label }}</div>
      <div class="detail-field__value">{{ value ?? '—' }}</div>
    </div>
  `,
};

interface Props {
  modelValue: boolean;
  course: AdminCourseDetail | null;
  loading?: boolean;
  options: AdminCourseFormOptions | null;
}

const props = withDefaults(defineProps<Props>(), { loading: false });
const emit = defineEmits<{ 'update:modelValue': [v: boolean] }>();

const dialogModel = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});

function labelOf(
  list: { id: number; label: string }[] | undefined,
  id: number | null,
): string | null {
  if (!list || id == null) return null;
  return list.find((o) => o.id === id)?.label ?? null;
}

const skillLabels = computed(() => {
  if (!props.options || !props.course?.skillIds.length) return null;
  return props.course.skillIds
    .map((id) => props.options!.skills.find((s) => s.id === id)?.label)
    .filter(Boolean)
    .join(', ');
});

function targetLabel(t: {
  targetId: number;
  subtargetId: number | null;
  other: string | null;
}): string {
  const target = props.options?.targets.find((o) => o.id === t.targetId);
  if (!target) return String(t.targetId);
  if (!t.subtargetId) return target.label;
  const sub = target.subtargets.find((s) => s.id === t.subtargetId);
  const subLabel = sub ? (sub.isOther && t.other ? t.other : sub.label) : '';
  return subLabel ? `${target.label} — ${subLabel}` : target.label;
}

function chapterTypeLabel(ch: CourseChapterPayload): string | null {
  const type = props.options?.chapterTypes.find((t) => t.id === ch.chapterTypeId);
  if (!type) return null;
  if (type.isOther && ch.chapterTypeOther) return `${ch.chapterTypeOther} (อื่นๆ)`;
  return type.label;
}
</script>

<style scoped lang="scss">
.course-detail-dialog {
  display: flex;
  flex-direction: column;
  max-width: 860px;
  width: 100%;
  margin: auto;
  max-height: 90vh;
  border-radius: 12px;
  overflow: hidden;
}

.course-detail-dialog__header {
  background: var(--admin-navy);
  color: white;
  padding: 20px 24px 16px;
}

.course-detail-dialog__title-row {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.course-detail-dialog__code {
  font-size: 0.75rem;
  opacity: 0.7;
  letter-spacing: 0.05em;
}

.course-detail-dialog__title {
  font-size: 1.15rem;
  font-weight: 700;
  margin: 4px 0 2px;
}

.course-detail-dialog__title-en {
  font-size: 0.85rem;
  opacity: 0.75;
}

.course-detail-dialog__body {
  flex: 1;
  overflow-y: auto;
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.course-detail-dialog__loading {
  display: flex;
  justify-content: center;
  padding: 40px;
}

.course-detail-dialog__footer {
  padding: 12px 24px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  justify-content: flex-end;
}

.detail-section__title {
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--admin-navy);
  margin-bottom: 10px;
  padding-bottom: 6px;
  border-bottom: 2px solid rgba(var(--q-primary), 0.15);
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 10px 16px;
}

.detail-field__label {
  font-size: 0.72rem;
  color: var(--admin-muted);
  font-weight: 600;
  margin-bottom: 2px;
}

.detail-field__value {
  font-size: 0.875rem;
  color: var(--admin-navy);
}

.detail-field__value--multiline {
  white-space: pre-wrap;
  line-height: 1.6;
}

.detail-field--full {
  grid-column: 1 / -1;
}

.detail-list__item {
  font-size: 0.875rem;
  padding: 4px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  color: var(--admin-navy);
}

.chapter-item {
  padding: 10px 12px;
  border: 1px solid rgba(0, 0, 0, 0.07);
  border-radius: 8px;
  margin-bottom: 8px;
}

.chapter-item__header {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chapter-item__seq {
  font-size: 0.75rem;
  font-weight: 700;
  color: $primary;
  background: rgba($primary, 0.1);
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.chapter-item__name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--admin-navy);
  flex: 1;
}

.chapter-item__meta {
  font-size: 0.75rem;
  color: var(--admin-muted);
  background: rgba(0, 0, 0, 0.05);
  padding: 2px 8px;
  border-radius: 10px;
}

.chapter-item__subs {
  margin-top: 6px;
  padding-left: 32px;
}

.chapter-item__sub {
  font-size: 0.8rem;
  color: var(--admin-muted);
  padding: 2px 0;
}

.detail-objective-list {
  margin: 4px 0 0 16px;
  padding: 0;
  font-size: 0.875rem;
  color: var(--admin-navy);
  line-height: 1.7;
}
</style>
