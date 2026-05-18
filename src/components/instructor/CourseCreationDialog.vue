<template>
  <q-dialog
    v-model="internalModelValue"
    persistent
    full-width
    position="bottom"
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="course-creation-card">
      <!-- ─── HEADER ─── -->
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h5 text-weight-bold text-blue-grey-9">
          <q-icon name="add_circle" color="primary" size="32px" class="q-mr-sm" />
          สร้างรายวิชาใหม่ (ข้อมูลครบถ้วน)
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <q-card-section class="q-pa-none">
        <q-stepper
          v-model="step"
          ref="stepper"
          color="primary"
          animated
          flat
          header-class="text-weight-bold"
          class="course-stepper"
        >
          <!-- ─── STEP 1: BASIC INFO & OBJECTIVES ─── -->
          <q-step :name="1" title="ข้อมูลและวัตถุประสงค์" icon="info" :done="step > 1">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.title"
                  label="ชื่อรายวิชา (ภาษาไทย) *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'จำเป็น']"
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input v-model="form.titleEn" label="Course Title (English)" outlined dense />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model="form.code"
                  label="รหัสรายวิชา *"
                  outlined
                  dense
                  mask="AAAA####"
                  :rules="[(val) => !!val || 'จำเป็น']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.category"
                  :options="categories"
                  label="หมวดหมู่ *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'จำเป็น']"
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.faculty"
                  :options="faculties"
                  label="คณะ/หน่วยงาน *"
                  outlined
                  dense
                  :rules="[(val) => !!val || 'จำเป็น']"
                />
              </div>
              <div class="col-12">
                <q-input
                  v-model="form.description"
                  type="textarea"
                  label="รายละเอียดหลักสูตร *"
                  outlined
                  dense
                  rows="3"
                  :rules="[(val) => !!val || 'จำเป็น']"
                />
              </div>

              <div class="col-12">
                <div class="text-subtitle2 q-mb-sm row items-center">
                  วัตถุประสงค์รายวิชา
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="add"
                    size="sm"
                    class="q-ml-sm"
                    @click="addObjective"
                  />
                </div>
                <div
                  v-for="(obj, index) in form.objectives"
                  :key="index"
                  class="row q-gutter-sm q-mb-sm"
                >
                  <q-input
                    v-model="form.objectives[index]"
                    outlined
                    dense
                    class="col"
                    :placeholder="`วัตถุประสงค์ที่ ${index + 1}`"
                  />
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="remove"
                    size="sm"
                    @click="removeObjective(index)"
                    v-if="form.objectives.length > 1"
                  />
                </div>
              </div>
            </div>
          </q-step>

          <!-- ─── STEP 2: SYLLABUS & SCHEDULE ─── -->
          <q-step :name="2" title="เนื้อหาและตารางเรียน" icon="menu_book" :done="step > 2">
            <div class="row q-col-gutter-lg">
              <!-- Syllabus -->
              <div class="col-12 col-md-7">
                <div class="text-subtitle2 q-mb-sm row items-center">
                  เนื้อหาหลักสูตร (รายสัปดาห์/โมดูล)
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="add"
                    size="sm"
                    class="q-ml-sm"
                    @click="addSyllabus"
                  />
                </div>
                <div
                  v-for="(item, index) in form.syllabus"
                  :key="index"
                  class="bg-grey-1 q-pa-sm q-mb-sm rounded-borders row items-center q-gutter-x-sm"
                >
                  <div class="text-caption text-weight-bold">สัปดาห์ที่ {{ index + 1 }}:</div>
                  <q-input
                    v-model="form.syllabus[index]"
                    outlined
                    dense
                    class="col"
                    placeholder="หัวข้อการสอน"
                  />
                  <q-btn
                    flat
                    round
                    color="negative"
                    icon="delete"
                    size="sm"
                    @click="removeSyllabus(index)"
                    v-if="form.syllabus.length > 1"
                  />
                </div>
              </div>

              <!-- Schedule -->
              <div class="col-12 col-md-5">
                <div class="text-subtitle2 q-mb-sm row items-center">
                  ตารางเรียน (วัน-เวลา-สถานที่)
                  <q-btn
                    flat
                    round
                    color="primary"
                    icon="add"
                    size="sm"
                    class="q-ml-sm"
                    @click="addSchedule"
                  />
                </div>
                <div
                  v-for="(sch, index) in form.schedules"
                  :key="index"
                  class="q-mb-md q-pa-sm border-dashed rounded-borders"
                >
                  <div class="row q-col-gutter-xs">
                    <div class="col-4">
                      <q-select v-model="sch.day" :options="days" label="วัน" outlined dense />
                    </div>
                    <div class="col-8">
                      <q-input
                        v-model="sch.time"
                        label="เวลา (เช่น 09:00 - 12:00)"
                        outlined
                        dense
                      />
                    </div>
                    <div class="col-10 q-mt-xs">
                      <q-input v-model="sch.room" label="ห้องเรียน/ลิงก์" outlined dense />
                    </div>
                    <div class="col-2 q-mt-xs text-right">
                      <q-btn
                        flat
                        round
                        color="negative"
                        icon="remove"
                        size="sm"
                        @click="removeSchedule(index)"
                        v-if="form.schedules.length > 1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </q-step>

          <!-- ─── STEP 3: ADDITIONAL INFO & REGISTRATION ─── -->
          <q-step :name="3" title="ข้อมูลเพิ่มเติม" icon="more_horiz" :done="step > 3">
            <div class="row q-col-gutter-md">
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.targetGroup"
                  label="กลุ่มเป้าหมาย"
                  outlined
                  dense
                  placeholder="เช่น นิสิต, บุคคลทั่วไปที่สนใจ..."
                />
              </div>
              <div class="col-12 col-md-6">
                <q-input
                  v-model="form.prerequisites"
                  label="คุณสมบัติเบื้องต้น"
                  outlined
                  dense
                  placeholder="เช่น ไม่มี, พื้นฐานการใช้งานคอมพิวเตอร์..."
                />
              </div>
              <div class="col-12 col-md-4">
                <q-select
                  v-model="form.certificateType"
                  :options="['ประกาศนียบัตร', 'วุฒิบัตร', 'ไม่มี']"
                  label="ประเภทวุฒิบัตร"
                  outlined
                  dense
                />
              </div>
              <div class="col-12 col-md-4">
                <q-input
                  v-model.number="form.maxSeats"
                  type="number"
                  label="จำนวนที่นั่งสูงสุด *"
                  outlined
                  dense
                  suffix="ที่นั่ง"
                />
              </div>
              <div class="col-12 col-md-4">
                <div class="row q-gutter-sm items-center full-height">
                  <div class="text-caption">รูปแบบ:</div>
                  <q-checkbox v-model="form.deliveryModes" val="Online" label="Online" />
                  <q-checkbox v-model="form.deliveryModes" val="Onsite" label="Onsite" />
                </div>
              </div>
              <div class="col-12 col-md-6">
                <div class="text-subtitle2 q-mb-xs">ช่วงเวลาเปิดรับสมัคร *</div>
                <div class="row q-col-gutter-sm">
                  <div class="col-6">
                    <BaseDateInput
                      v-model="form.registrationStart"
                      value-format="YYYY-MM-DD"
                      label="เริ่ม"
                    />
                  </div>
                  <div class="col-6">
                    <BaseDateInput
                      v-model="form.registrationEnd"
                      value-format="YYYY-MM-DD"
                      label="สิ้นสุด"
                    />
                  </div>
                </div>
              </div>
            </div>
          </q-step>

          <!-- ─── STEP 4: PRICING & CONTACT ─── -->
          <q-step :name="4" title="ราคาและติดต่อ" icon="payments" :done="step > 4">
            <div class="column q-gutter-y-md">
              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="form.priceStudent"
                    type="number"
                    label="ราคานิสิต (บาท)"
                    outlined
                    dense
                    prefix="฿"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-input
                    v-model.number="form.priceExternal"
                    type="number"
                    label="ราคาบุคคลทั่วไป (บาท)"
                    outlined
                    dense
                    prefix="฿"
                  />
                </div>
                <div class="col-12 col-md-4">
                  <q-toggle
                    v-model="form.isFree"
                    label="วิชานี้เรียนฟรี"
                    color="positive"
                    class="q-mt-sm"
                  />
                </div>
              </div>

              <q-separator />

              <div class="row q-col-gutter-md">
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.contactEmail"
                    label="อีเมลติดต่อสอบถาม *"
                    outlined
                    dense
                    icon="mail"
                    :rules="[(val) => !!val || 'จำเป็น']"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.contactPhone"
                    label="เบอร์โทรศัพท์ติดต่อ *"
                    outlined
                    dense
                    icon="phone"
                    :rules="[(val) => !!val || 'จำเป็น']"
                  />
                </div>
              </div>
            </div>
          </q-step>

          <!-- ─── STEP 5: REVIEW ─── -->
          <q-step :name="5" title="สรุปข้อมูล" icon="check_circle">
            <div class="row q-col-gutter-lg">
              <div class="col-12 col-md-8">
                <q-card flat bordered class="bg-blue-grey-1">
                  <q-card-section>
                    <div class="text-subtitle1 text-weight-bold q-mb-md">พรีวิวข้อมูลรายวิชา</div>
                    <div class="row q-col-gutter-sm text-caption">
                      <div class="col-4 text-grey-7">ชื่อวิชา:</div>
                      <div class="col-8">{{ form.title }}</div>
                      <div class="col-4 text-grey-7">เนื้อหา:</div>
                      <div class="col-8">{{ form.syllabus.length }} สัปดาห์</div>
                      <div class="col-4 text-grey-7">ตารางเรียน:</div>
                      <div class="col-8">{{ form.schedules.length }} ช่วงเวลา</div>
                      <div class="col-4 text-grey-7">ราคา:</div>
                      <div class="col-8">
                        {{ form.isFree ? 'ฟรี' : '฿' + form.priceExternal.toLocaleString() }}
                      </div>
                      <div class="col-4 text-grey-7">ติดต่อ:</div>
                      <div class="col-8">{{ form.contactEmail }} | {{ form.contactPhone }}</div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>
              <div class="col-12 col-md-4">
                <div
                  class="text-center q-pa-lg border-dashed rounded-borders full-height flex flex-center column"
                >
                  <q-icon name="image" size="64px" color="primary" />
                  <q-btn outline color="primary" label="อัปโหลดรูปปก" size="sm" class="q-mt-md" />
                </div>
              </div>
            </div>
          </q-step>

          <!-- ─── NAVIGATION ─── -->
          <template v-slot:navigation>
            <q-stepper-navigation class="row items-center justify-end q-gutter-sm q-pa-md">
              <q-btn
                v-if="step > 1"
                flat
                color="primary"
                @click="stepper?.previous()"
                label="ย้อนกลับ"
              />
              <q-btn
                v-if="step < 5"
                unelevated
                color="primary"
                @click="stepper?.next()"
                label="ถัดไป"
                class="q-px-xl"
              />
              <q-btn
                v-if="step === 5"
                unelevated
                color="positive"
                @click="onSubmit"
                label="สร้างรายวิชาสมบูรณ์"
                icon="done_all"
                class="q-px-xl"
                :loading="loading"
              />
            </q-stepper-navigation>
          </template>
        </q-stepper>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useQuasar, QStepper } from 'quasar';
import BaseDateInput from 'components/base/BaseDateInput.vue';
import type { Course, DeliveryMode } from 'src/types/course';

interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['update:modelValue', 'created']);

const $q = useQuasar();
const step = ref(1);
const loading = ref(false);
const stepper = ref<QStepper | null>(null);

const internalModelValue = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
});

const categories = [
  'วิทยาศาสตร์และเทคโนโลยี',
  'ธุรกิจและการจัดการ',
  'ศิลปะและการออกแบบ',
  'ภาษาและการสื่อสาร',
];
const faculties = ['คณะวิทยาการสารสนเทศ', 'คณะวิทยาศาสตร์', 'คณะวิศวกรรมศาสตร์'];
const days = [
  'วันจันทร์',
  'วันอังคาร',
  'วันพุธ',
  'วันพฤหัสบดี',
  'วันศุกร์',
  'วันเสาร์',
  'วันอาทิตย์',
];

const form = reactive({
  title: '',
  titleEn: '',
  code: '',
  category: '',
  faculty: '',
  description: '',
  objectives: [''],
  syllabus: [''],
  schedules: [{ day: '', time: '', room: '' }],
  registrationStart: '',
  registrationEnd: '',
  deliveryModes: [] as string[],
  maxSeats: 40,
  targetGroup: '',
  prerequisites: 'ไม่มี',
  certificateType: 'ประกาศนียบัตร',
  isFree: false,
  priceStudent: 0,
  priceExternal: 888,
  contactEmail: 'gem@buu.ac.th',
  contactPhone: '038-102-222 ต่อ 4001',
});

// Helper functions for dynamic lists
const addObjective = () => form.objectives.push('');
const removeObjective = (index: number) => form.objectives.splice(index, 1);
const addSyllabus = () => form.syllabus.push('');
const removeSyllabus = (index: number) => form.syllabus.splice(index, 1);
const addSchedule = () => form.schedules.push({ day: '', time: '', room: '' });
const removeSchedule = (index: number) => form.schedules.splice(index, 1);

function onSubmit() {
  loading.value = true;

  // Create a proper Course object from form data
  const newCourse: Course = {
    id: String(Date.now()),
    code: form.code,
    title: form.title,
    titleEn: form.titleEn,
    imageUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80', // Default mock image
    cover: {
      icon: 'school',
      accentColor: '#f5a623',
      backgroundColor: '#1e3a5f',
    },
    registrationStart: form.registrationStart,
    registrationEnd: form.registrationEnd,
    registrationStartDate: form.registrationStart,
    registrationEndDate: form.registrationEnd,
    price: form.isFree ? 0 : form.priceExternal,
    isFree: form.isFree,
    views: 0,
    status: 'เปิดรับสมัคร',
    deliveryModes: form.deliveryModes as DeliveryMode[],
    isActive: true,
    faculty: form.faculty,
    category: form.category,
    maxSeats: form.maxSeats,
    enrolledCount: 0,
  };

  setTimeout(() => {
    loading.value = false;
    $q.notify({ type: 'positive', message: 'สร้างรายวิชาเสร็จสมบูรณ์!', position: 'top' });
    emit('created', newCourse);
    internalModelValue.value = false;
    resetForm();
  }, 1500);
}

function resetForm() {
  step.value = 1;
  // (In real app, reset to initial state)
}
</script>

<style lang="scss" scoped>
.course-creation-card {
  max-width: 1100px;
  width: 100%;
  border-radius: 16px 16px 0 0;
}
.course-stepper {
  min-height: 520px;
}
.border-dashed {
  border: 2px dashed #e0e0e0;
}
:deep(.q-stepper__step-content) {
  padding: 20px 24px;
}
</style>
