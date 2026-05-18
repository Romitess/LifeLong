<template>
  <div class="course-form">
    <q-banner v-if="error" rounded dense class="bg-negative text-white q-mb-md">
      {{ error }}
    </q-banner>

    <!-- ข้อมูลทั่วไป -->
    <AdminSurfaceCard
      eyebrow="Course Registry"
      title="ข้อมูลทั่วไป"
      body-padding="lg"
      class="q-mb-md"
    >
      <div class="course-form__grid">
        <!-- ชื่อรายวิชา TH -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            ชื่อรายวิชา (ภาษาไทย) <span class="course-form__required">*</span>
          </div>
          <q-input
            v-model="form.nameTh"
            outlined
            dense
            placeholder="กรอกชื่อรายวิชาภาษาไทย"
            :rules="[requiredRule]"
            hide-bottom-space
            class="course-form__input"
          />
        </div>

        <!-- ชื่อรายวิชา EN -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            ชื่อรายวิชา (ภาษาอังกฤษ) <span class="course-form__required">*</span>
          </div>
          <q-input
            v-model="form.nameEn"
            outlined
            dense
            placeholder="Enter course name in English"
            :rules="[requiredRule]"
            hide-bottom-space
            class="course-form__input"
          />
        </div>

        <!-- คณะ -->
        <div class="course-form__field">
          <div class="course-form__label">
            คณะ/ส่วนงานที่รับผิดชอบ <span class="course-form__required">*</span>
          </div>
          <q-select
            v-model="form.facultyId"
            outlined
            dense
            emit-value
            map-options
            :options="formOptions.faculties"
            option-label="label"
            option-value="id"
            placeholder="เลือกคณะ/ส่วนงาน"
            :rules="[requiredRule]"
            hide-bottom-space
            class="course-form__select"
          />
        </div>

        <!-- หมวดวิชา -->
        <div class="course-form__field">
          <div class="course-form__label">
            หมวดวิชา <span class="course-form__required">*</span>
          </div>
          <q-select
            v-model="form.categoryId"
            outlined
            dense
            emit-value
            map-options
            :options="formOptions.categories"
            option-label="label"
            option-value="id"
            placeholder="เลือกหมวดวิชา"
            :rules="[requiredRule]"
            hide-bottom-space
            class="course-form__select"
            @update:model-value="form.subcategoryId = undefined"
          />
        </div>

        <!-- หมู่วิชา -->
        <div class="course-form__field">
          <div class="course-form__label">หมู่วิชา</div>
          <q-select
            v-model="form.subcategoryId"
            outlined
            dense
            emit-value
            map-options
            clearable
            :options="filteredSubcategories"
            option-label="label"
            option-value="id"
            placeholder="เลือกหมู่วิชา"
            :disable="!form.categoryId"
            hide-bottom-space
            class="course-form__select"
          />
        </div>

        <!-- ประเภทของรายวิชา -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            ประเภทของรายวิชา <span class="course-form__required">*</span>
          </div>
          <div class="course-form__options-list">
            <q-radio
              v-for="opt in formOptions.courseTypes"
              :key="opt.id"
              v-model="form.typeCourseId"
              :val="opt.id"
              :label="opt.label"
              color="primary"
              class="course-form__radio"
            />
          </div>
        </div>

        <!-- ระยะเวลาในการเรียนการสอน -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            ระยะเวลาในการเรียนการสอน <span class="course-form__required">*</span>
          </div>
          <div class="course-form__hours-row">
            <div class="course-form__hours-item">
              <q-input
                v-model.number="form.theoryHours"
                outlined
                dense
                type="number"
                min="0"
                placeholder="0"
                class="course-form__hours-input"
                @keypress="onNumberKeypress"
              />
              <span class="course-form__hours-label">ชั่วโมง ทฤษฎี</span>
            </div>
            <div class="course-form__hours-item">
              <q-input
                v-model.number="form.practiceHours"
                outlined
                dense
                type="number"
                min="0"
                placeholder="0"
                class="course-form__hours-input"
                @keypress="onNumberKeypress"
              />
              <span class="course-form__hours-label">ชั่วโมง ปฏิบัติ</span>
            </div>
            <div class="course-form__hours-item course-form__hours-item--total">
              <span class="course-form__hours-total">{{ totalHours }}</span>
              <span class="course-form__hours-label">ชั่วโมง รวม</span>
            </div>
          </div>
        </div>

        <!-- รูปแบบการเรียนการสอน -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            รูปแบบการเรียนการสอน <span class="course-form__required">*</span>
          </div>
          <div class="course-form__options-row">
            <q-radio
              v-for="opt in formOptions.studyTypes"
              :key="opt.id"
              v-model="form.studyTypeId"
              :val="opt.id"
              :label="opt.label"
              color="primary"
              class="course-form__radio"
            />
          </div>
        </div>

        <!-- รูปแบบของรายวิชา -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">รูปแบบของรายวิชา</div>
          <div class="course-form__options-row">
            <q-checkbox
              v-for="opt in formOptions.skills"
              :key="opt.id"
              v-model="form.skillIds"
              :val="opt.id"
              :label="opt.label"
              color="primary"
              class="course-form__checkbox"
            />
          </div>
        </div>

        <!-- ระยะเวลาที่อนุมัติ -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            ระยะเวลาที่อนุมัติให้หลักสูตรดำเนินการได้ <span class="course-form__required">*</span>
          </div>
          <div class="course-form__date-range">
            <BaseDateInput
              v-model="form.startDate"
              :rules="[requiredRule]"
              class="course-form__date-input"
            />
            <span class="course-form__date-sep">ถึง</span>
            <BaseDateInput
              ref="endDateInputRef"
              v-model="form.endDate"
              :rules="[requiredRule, endDateRule]"
              :options="(d: string) => !startDateForCalendar || d >= startDateForCalendar"
              class="course-form__date-input"
            />
          </div>
        </div>

        <!-- แนบไฟล์ CBS -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">แนบไฟล์ CBS 001 หรือ CBS 002</div>
          <div class="course-form__upload-area" @dragover.prevent @drop.prevent="onFileDrop">
            <template v-if="!form.file">
              <q-icon name="upload_file" size="32px" color="grey-5" />
              <p class="course-form__upload-hint">สามารถเลือกไฟล์ได้สูงสุด 1 ไฟล์</p>
              <q-btn
                outline
                no-caps
                color="primary"
                label="เลือกไฟล์"
                size="sm"
                @click="triggerFileInput"
              />
              <p class="course-form__upload-note">
                เลือกไฟล์เฉพาะนามสกุล pdf ที่มีขนาดไม่เกิน 2MB เท่านั้น
              </p>
            </template>
            <template v-else>
              <q-icon name="picture_as_pdf" size="28px" color="negative" />
              <span class="course-form__file-name">{{ form.file.name }}</span>
              <span class="course-form__file-size">{{ formatSize(form.file.size) }}</span>
              <q-btn
                flat
                round
                dense
                icon="close"
                color="grey-6"
                size="sm"
                @click="form.file = undefined"
              />
            </template>
          </div>
          <input
            ref="fileInputRef"
            type="file"
            accept=".pdf,application/pdf"
            class="hidden"
            @change="onFileChange"
          />
          <div v-if="fileError" class="course-form__file-error">{{ fileError }}</div>
        </div>

        <!-- กลุ่มเป้าหมาย -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">กลุ่มเป้าหมายที่เข้ารับการศึกษา</div>
          <div class="course-form__targets">
            <div
              v-for="target in formOptions.targets"
              :key="target.id"
              class="course-form__target-item"
            >
              <q-checkbox
                v-model="selectedTargetIds"
                :val="target.id"
                :label="target.label"
                color="primary"
                class="course-form__target-checkbox"
              />
              <template v-if="target.subtargets.length && selectedTargetIds.includes(target.id)">
                <div class="course-form__subtargets">
                  <template v-for="sub in target.subtargets" :key="sub.id">
                    <q-checkbox
                      v-model="selectedSubtargetIds"
                      :val="sub.id"
                      :label="sub.label"
                      color="primary"
                      dense
                      class="course-form__subtarget-checkbox"
                    />
                    <q-input
                      v-if="sub.isOther && selectedSubtargetIds.includes(sub.id)"
                      v-model="subtargetOtherText[sub.id]"
                      outlined
                      dense
                      placeholder="ระบุ"
                      class="course-form__subtarget-other"
                    />
                  </template>
                </div>
              </template>
              <template v-if="target.isOther && selectedTargetIds.includes(target.id)">
                <q-input
                  v-model="targetOtherText[target.id]"
                  outlined
                  dense
                  placeholder="ระบุ"
                  class="course-form__target-other"
                />
              </template>
            </div>
          </div>
        </div>

        <!-- การจัดการเรียนการสอน -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            การจัดการเรียนการสอน <span class="course-form__required">*</span>
          </div>
          <div class="course-form__options-list">
            <div
              v-for="classType in formOptions.classTypes"
              :key="classType.id"
              class="course-form__mgmt-option"
            >
              <q-radio
                v-model="form.classTypeId"
                :val="classType.id"
                :label="classType.label"
                color="primary"
                class="course-form__radio"
              />
              <div v-if="form.classTypeId === classType.id" class="course-form__fee-row">
                <div class="course-form__fee-field">
                  <div class="course-form__label-sm">
                    ค่าธรรมเนียม <span class="course-form__required">*</span>
                  </div>
                  <div class="course-form__fee-input-wrap">
                    <q-input
                      v-model.number="form.classFee"
                      outlined
                      dense
                      type="number"
                      min="0"
                      placeholder="0"
                      :rules="[feeRule]"
                      hide-bottom-space
                      class="course-form__fee-input"
                      @keypress="onNumberKeypress"
                    />
                    <span class="course-form__fee-unit">บาท (ถ้าฟรีให้ใส่ 0)</span>
                  </div>
                </div>
                <div class="course-form__fee-field">
                  <div class="course-form__label-sm">หมายเหตุค่าธรรมเนียม</div>
                  <q-input
                    v-model="form.classFeeRemark"
                    outlined
                    dense
                    placeholder="หมายเหตุ (ถ้ามี)"
                    class="course-form__remark-input"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminSurfaceCard>

    <!-- ข้อมูลในการติดต่อสอบถาม -->
    <AdminSurfaceCard title="ข้อมูลในการติดต่อสอบถาม" body-padding="lg" class="q-mb-lg">
      <div class="course-form__grid">
        <div class="course-form__field">
          <div class="course-form__label">
            ชื่อ - สกุล <span class="course-form__required">*</span>
          </div>
          <q-input
            v-model="form.contactName"
            outlined
            dense
            placeholder="ชื่อ - นามสกุล"
            :rules="[requiredRule]"
            hide-bottom-space
            class="course-form__input"
          />
        </div>

        <div class="course-form__field">
          <div class="course-form__label">
            เบอร์โทรศัพท์ <span class="course-form__required">*</span>
          </div>
          <q-input
            v-model="form.contactTel"
            outlined
            dense
            placeholder="0812345678"
            :rules="[requiredRule, phoneRule]"
            hide-bottom-space
            class="course-form__input"
            @keypress="onPhoneKeypress"
          />
        </div>

        <div class="course-form__field">
          <div class="course-form__label">อีเมล <span class="course-form__required">*</span></div>
          <q-input
            v-model="form.contactEmail"
            outlined
            dense
            type="email"
            placeholder="example@buu.ac.th"
            :rules="[requiredRule, emailRule]"
            hide-bottom-space
            class="course-form__input"
          />
        </div>

        <div class="course-form__field">
          <div class="course-form__label">เว็บไซต์</div>
          <q-input
            v-model="form.contactUrl"
            outlined
            dense
            placeholder="https://"
            hide-bottom-space
            class="course-form__input"
          />
        </div>
      </div>
    </AdminSurfaceCard>

    <!-- Actions -->
    <div class="course-form__actions">
      <AdminActionButton
        variant="secondary"
        label="ยกเลิก"
        class="course-form__btn"
        @click="$emit('cancel')"
      />
      <AdminActionButton
        variant="primary"
        icon="save"
        label="บันทึก"
        :loading="isSaving"
        class="course-form__btn course-form__btn--save"
        @click="submit"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { useAdminCourseForm } from 'src/composables/use-admin-course-form';
import type { CourseTargetPayload } from 'src/types/admin-courses';
import BaseDateInput from 'components/base/BaseDateInput.vue';
import AdminSurfaceCard from './AdminSurfaceCard.vue';
import AdminActionButton from './AdminActionButton.vue';

const emit = defineEmits<{
  cancel: [];
  saved: [courseId: number];
}>();

const { formOptions, isSaving, error, fetchFormOptions, createCourse } = useAdminCourseForm();
void fetchFormOptions();

const form = reactive({
  nameTh: '',
  nameEn: '',
  facultyId: undefined as number | undefined,
  typeCourseId: undefined as number | undefined,
  theoryHours: undefined as number | undefined,
  practiceHours: undefined as number | undefined,
  studyTypeId: undefined as number | undefined,
  skillIds: [] as number[],
  startDate: '',
  endDate: '',
  categoryId: undefined as number | undefined,
  subcategoryId: undefined as number | undefined,
  classTypeId: undefined as number | undefined,
  classFee: undefined as number | undefined,
  classFeeRemark: '',
  contactName: '',
  contactTel: '',
  contactEmail: '',
  contactUrl: '',
  file: undefined as File | undefined,
});

const selectedTargetIds = ref<number[]>([]);
const selectedSubtargetIds = ref<number[]>([]);
const subtargetOtherText = ref<Record<number, string>>({});
const targetOtherText = ref<Record<number, string>>({});

const fileInputRef = ref<HTMLInputElement | null>(null);
const fileError = ref<string | null>(null);
const endDateInputRef = ref<InstanceType<typeof BaseDateInput> | null>(null);

// Re-validate end date whenever start date changes (catches reversed date entry order)
watch(
  () => form.startDate,
  () => {
    if (form.endDate) void nextTick(() => endDateInputRef.value?.validate());
  },
);

const totalHours = computed(() => (form.theoryHours ?? 0) + (form.practiceHours ?? 0));

const filteredSubcategories = computed(() =>
  form.categoryId
    ? formOptions.value.subcategories.filter((s) => s.categoryId === form.categoryId)
    : [],
);

const requiredRule = (v: unknown) => !!v || 'กรุณากรอกข้อมูล';
const emailRule = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) || 'รูปแบบอีเมลไม่ถูกต้อง';
const phoneRule = (v: string) =>
  /^\d{9,10}$/.test(v) || 'กรุณากรอกเบอร์โทรศัพท์เป็นตัวเลข 9-10 หลัก';
const feeRule = (v: unknown) =>
  (v !== undefined && v !== null && v !== '' && Number(v) >= 0) ||
  'กรุณากรอกค่าธรรมเนียม (ถ้าฟรีใส่ 0)';
// Convert DD/MM/YYYY → YYYY-MM-DD for backend submission
function toDatabaseDate(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split('/');
  return `${y ?? ''}-${m ?? ''}-${d ?? ''}`;
}

// Convert DD/MM/YYYY → YYYY/MM/DD for q-date options callback comparison
// (q-date always passes YYYY/MM/DD to options regardless of mask)
const startDateForCalendar = computed(() => {
  if (!form.startDate || form.startDate.length < 10) return '';
  const [d, m, y] = form.startDate.split('/');
  return `${y}/${m}/${d}`;
});

const endDateRule = (v: string) => {
  if (!form.startDate || form.startDate.length < 10 || v.length < 10) return true;
  return (
    toDatabaseDate(v) >= toDatabaseDate(form.startDate) || 'วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่มต้น'
  );
};

function onPhoneKeypress(e: KeyboardEvent) {
  if (!/\d/.test(e.key)) e.preventDefault();
}

function onNumberKeypress(e: KeyboardEvent) {
  if (!/[\d.]/.test(e.key)) e.preventDefault();
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function triggerFileInput() {
  fileInputRef.value?.click();
}

function validateAndSetFile(file: File) {
  fileError.value = null;
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
  if (!isPdf) {
    fileError.value = 'รองรับเฉพาะไฟล์ PDF เท่านั้น';
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    fileError.value = 'ขนาดไฟล์ต้องไม่เกิน 2MB';
    return;
  }
  form.file = file;
}

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement;
  if (input.files?.[0]) validateAndSetFile(input.files[0]);
  input.value = '';
}

function onFileDrop(e: DragEvent) {
  const file = e.dataTransfer?.files[0];
  if (file) validateAndSetFile(file);
}

function buildTargets(): CourseTargetPayload[] {
  const targets: CourseTargetPayload[] = [];

  for (const tid of selectedTargetIds.value) {
    const target = formOptions.value.targets.find((t) => t.id === tid);
    if (!target) continue;

    if (target.subtargets.length) {
      const checkedSubs = target.subtargets.filter((s) =>
        selectedSubtargetIds.value.includes(s.id),
      );
      if (checkedSubs.length) {
        for (const sub of checkedSubs) {
          const entry: CourseTargetPayload = { targetId: tid, subtargetId: sub.id };
          if (sub.isOther) entry.other = subtargetOtherText.value[sub.id];
          targets.push(entry);
        }
      } else {
        targets.push({ targetId: tid });
      }
    } else {
      const entry: CourseTargetPayload = { targetId: tid };
      if (target.isOther) entry.other = targetOtherText.value[tid];
      targets.push(entry);
    }
  }

  return targets;
}

async function submit() {
  if (
    !form.nameTh ||
    !form.nameEn ||
    !form.facultyId ||
    !form.typeCourseId ||
    !form.studyTypeId ||
    !form.startDate ||
    !form.endDate ||
    !form.categoryId ||
    !form.classTypeId ||
    !form.contactName ||
    !form.contactTel ||
    !form.contactEmail
  ) {
    error.value = 'กรุณากรอกข้อมูลที่จำเป็นให้ครบถ้วน';
    return;
  }

  if (
    form.endDate.length === 10 &&
    form.startDate.length === 10 &&
    toDatabaseDate(form.endDate) < toDatabaseDate(form.startDate)
  ) {
    error.value = 'วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่มต้น';
    return;
  }

  try {
    const result = await createCourse({
      nameTh: form.nameTh,
      nameEn: form.nameEn,
      facultyId: form.facultyId,
      typeCourseId: form.typeCourseId,
      theoryHours: form.theoryHours,
      practiceHours: form.practiceHours,
      studyTypeId: form.studyTypeId,
      skillIds: form.skillIds,
      startDate: toDatabaseDate(form.startDate),
      endDate: toDatabaseDate(form.endDate),
      categoryId: form.categoryId,
      subcategoryId: form.subcategoryId,
      targets: buildTargets(),
      classTypeId: form.classTypeId,
      classFee: form.classFee,
      classFeeRemark: form.classFeeRemark,
      contactName: form.contactName,
      contactTel: form.contactTel,
      contactEmail: form.contactEmail,
      contactUrl: form.contactUrl || undefined,
      file: form.file,
    });
    emit('saved', result.courseId);
  } catch {
    // error is set in composable
  }
}
</script>

<style scoped lang="scss">
.course-form__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px 28px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
}

.course-form__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.course-form__field--full {
  grid-column: 1 / -1;
}

.course-form__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--admin-navy, #1a2240);
}

.course-form__required {
  color: #e53e3e;
  margin-left: 2px;
}

.course-form__input,
.course-form__select {
  width: 100%;
}

.course-form__options-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.course-form__options-row {
  display: flex;
  flex-wrap: wrap;
  gap: 4px 20px;
}

.course-form__hours-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.course-form__hours-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.course-form__hours-item--total {
  background: #f7f8fa;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 6px 14px;
}

.course-form__hours-input {
  width: 80px;
}

.course-form__hours-total {
  font-size: 1rem;
  font-weight: 700;
  color: var(--admin-navy, #1a2240);
}

.course-form__hours-label {
  font-size: 0.82rem;
  color: #718096;
  white-space: nowrap;
}

.course-form__date-range {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.course-form__date-input {
  width: 200px;
}

.course-form__date-sep {
  font-size: 0.85rem;
  color: #718096;
}

.course-form__upload-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 120px;
  border: 2px dashed #cbd5e0;
  border-radius: 10px;
  padding: 20px;
  cursor: pointer;
  transition: border-color 0.2s;
  background: #fafbfc;

  &:hover {
    border-color: var(--q-primary);
  }
}

.course-form__upload-hint {
  margin: 0;
  font-size: 0.85rem;
  color: #718096;
}

.course-form__upload-note {
  margin: 0;
  font-size: 0.75rem;
  color: #a0aec0;
  text-align: center;
}

.course-form__file-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--admin-navy, #1a2240);
}

.course-form__file-size {
  font-size: 0.75rem;
  color: #718096;
}

.course-form__file-error {
  margin-top: 4px;
  font-size: 0.75rem;
  color: #e53e3e;
}

.course-form__targets {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.course-form__target-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.course-form__subtargets {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 12px;
  padding-left: 32px;
}

.course-form__subtarget-other,
.course-form__target-other {
  width: 200px;
  margin-left: 32px;
}

.course-form__mgmt-option {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.course-form__fee-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 24px;
  padding-left: 32px;
  padding-bottom: 4px;
}

.course-form__fee-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.course-form__label-sm {
  font-size: 0.8rem;
  font-weight: 600;
  color: #4a5568;
}

.course-form__fee-input-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
}

.course-form__fee-input {
  width: 120px;
}

.course-form__fee-unit {
  font-size: 0.8rem;
  color: #718096;
  white-space: nowrap;
}

.course-form__remark-input {
  width: 280px;
}

.course-form__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-bottom: 32px;
}

.course-form__btn--save {
  min-width: 120px;
}

.hidden {
  display: none;
}
</style>
