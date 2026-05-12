<template>
  <q-page class="bg-grey-1 q-py-lg">
    <div class="section-container" style="max-width: 1100px; margin: 0 auto">
      <q-card class="course-creation-card shadow-1 border-radius-lg">
        <!-- ─── HEADER ─── -->
        <q-card-section class="row items-center q-pb-none q-pt-lg q-px-lg">
          <q-btn flat round icon="arrow_back" color="primary" @click="goBack" class="q-mr-sm" />
          <div class="text-h5 text-weight-bold text-blue-grey-9">
            <q-icon name="add_circle" color="primary" size="32px" class="q-mr-sm" />
            สร้างรายวิชาใหม่ (ข้อมูลครบถ้วน)
          </div>
        </q-card-section>

        <q-card-section class="q-pa-md">
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

                <!-- Course Image Upload -->
                <div class="col-12">
                  <div class="text-subtitle2 q-mb-sm">รูปหน้าปกรายวิชา (Thumbnail)</div>
                  <div class="row q-col-gutter-md items-center">
                    <div class="col-12 col-md-4">
                      <q-file
                        v-model="form.image"
                        label="เลือกรูปภาพ *"
                        outlined
                        dense
                        accept=".jpg, .jpeg, .png"
                        max-file-size="2048576"
                        @rejected="onFileRejected"
                      >
                        <template v-slot:prepend>
                          <q-icon name="image" />
                        </template>
                      </q-file>
                    </div>
                    <div class="col-12 col-md-8">
                      <div
                        v-if="imagePreview"
                        class="image-preview-container bg-grey-2 rounded-borders q-pa-xs"
                        style="width: 200px; height: 120px; overflow: hidden"
                      >
                        <q-img
                          :src="imagePreview"
                          spinner-color="primary"
                          style="height: 100%; width: 100%; object-fit: cover"
                        />
                      </div>
                    </div>
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
                    class="bg-white q-pa-md q-mb-md rounded-borders border-grey shadow-1"
                  >
                    <div class="row items-center q-gutter-x-sm q-mb-sm">
                      <div class="text-subtitle2 text-primary">สัปดาห์ที่ {{ index + 1 }}</div>
                      <q-space />
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
                    <q-input
                      v-model="item.topic"
                      outlined
                      dense
                      class="full-width q-mb-sm"
                      placeholder="หัวข้อการสอน"
                    />

                    <!-- Activities List -->
                    <div class="bg-grey-1 q-pa-sm rounded-borders">
                      <div class="row items-center justify-between q-mb-xs">
                        <div class="text-caption text-weight-bold text-grey-8">
                          กิจกรรมในสัปดาห์นี้:
                        </div>
                        <q-btn-dropdown
                          flat
                          dense
                          no-caps
                          color="primary"
                          label="เพิ่มกิจกรรม"
                          icon="add"
                          size="sm"
                        >
                          <q-list dense>
                            <q-item
                              clickable
                              v-close-popup
                              @click="openActivityDialog(index, 'quiz')"
                            >
                              <q-item-section avatar>
                                <q-icon name="quiz" color="orange" size="xs" />
                              </q-item-section>
                              <q-item-section>แบบทดสอบ (Quiz)</q-item-section>
                            </q-item>
                            <q-item
                              clickable
                              v-close-popup
                              @click="openActivityDialog(index, 'assign')"
                            >
                              <q-item-section avatar>
                                <q-icon name="assignment" color="blue" size="xs" />
                              </q-item-section>
                              <q-item-section>การส่งงาน (Assignment)</q-item-section>
                            </q-item>
                          </q-list>
                        </q-btn-dropdown>
                      </div>

                      <div
                        v-if="item.activities.length === 0"
                        class="text-center text-grey-5 text-caption q-py-xs"
                      >
                        ยังไม่มีกิจกรรม
                      </div>

                      <q-chip
                        v-for="(act, aIdx) in item.activities"
                        :key="aIdx"
                        dense
                        removable
                        @remove="removeActivity(index, aIdx)"
                        :color="act.type === 'quiz' ? 'orange-1' : 'blue-1'"
                        :text-color="act.type === 'quiz' ? 'orange-9' : 'blue-9'"
                        class="q-ma-xs"
                      >
                        <q-avatar :icon="act.type === 'quiz' ? 'quiz' : 'assignment'" />
                        {{ act.name }}
                      </q-chip>
                    </div>
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
                        <div class="row q-col-gutter-xs">
                          <div class="col-6">
                            <q-input
                              v-model="sch.startTime"
                              label="เวลาเริ่ม"
                              outlined
                              dense
                              mask="time"
                              hide-bottom-space
                            >
                              <template v-slot:append>
                                <q-icon name="access_time" class="cursor-pointer">
                                  <q-popup-proxy
                                    cover
                                    transition-show="scale"
                                    transition-hide="scale"
                                  >
                                    <q-time v-model="sch.startTime" format24h>
                                      <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="ตกลง" color="primary" flat />
                                      </div>
                                    </q-time>
                                  </q-popup-proxy>
                                </q-icon>
                              </template>
                            </q-input>
                          </div>
                          <div class="col-6">
                            <q-input
                              v-model="sch.endTime"
                              label="เวลาสิ้นสุด"
                              outlined
                              dense
                              mask="time"
                              hide-bottom-space
                            >
                              <template v-slot:append>
                                <q-icon name="access_time" class="cursor-pointer">
                                  <q-popup-proxy
                                    cover
                                    transition-show="scale"
                                    transition-hide="scale"
                                  >
                                    <q-time v-model="sch.endTime" format24h>
                                      <div class="row items-center justify-end">
                                        <q-btn v-close-popup label="ตกลง" color="primary" flat />
                                      </div>
                                    </q-time>
                                  </q-popup-proxy>
                                </q-icon>
                              </template>
                            </q-input>
                          </div>
                        </div>
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
                  <q-input
                    v-model.number="form.totalHours"
                    type="number"
                    label="จำนวนชั่วโมงรวม *"
                    outlined
                    dense
                    suffix="ชั่วโมง"
                    min="1"
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
                      <q-input
                        v-model="form.registrationStart"
                        outlined
                        dense
                        type="date"
                        label="เริ่ม"
                      />
                    </div>
                    <div class="col-6">
                      <q-input
                        v-model="form.registrationEnd"
                        outlined
                        dense
                        type="date"
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
                        <div class="col-4 text-grey-7">จำนวนชั่วโมงรวม:</div>
                        <div class="col-8">{{ form.totalHours }} ชั่วโมง</div>
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
                    class="text-center q-pa-sm border-dashed rounded-borders full-height flex flex-center column bg-grey-1"
                    style="min-height: 200px; overflow: hidden"
                  >
                    <div v-if="imagePreview" class="full-width full-height">
                      <q-img
                        :src="imagePreview"
                        style="max-height: 180px; width: 100%; object-fit: cover"
                        class="rounded-borders"
                      />
                      <div class="text-caption q-mt-xs text-primary">รูปหน้าปกที่คุณเลือก</div>
                    </div>
                    <template v-else>
                      <q-icon name="image" size="64px" color="grey-5" />
                      <div class="text-grey-7 q-mt-sm">ยังไม่ได้เลือกรูปหน้าปก</div>
                      <q-btn
                        flat
                        color="primary"
                        label="กลับไปเลือกรูปในขั้นตอนที่ 1"
                        size="sm"
                        @click="step = 1"
                      />
                    </template>
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

      <!-- Activity Creation Dialog -->
      <q-dialog v-model="activityDialog.show" persistent>
        <q-card style="min-width: 350px">
          <q-card-section class="row items-center q-pb-none">
            <div class="text-h6">
              <q-icon
                :name="activityDialog.type === 'quiz' ? 'quiz' : 'assignment'"
                :color="activityDialog.type === 'quiz' ? 'orange' : 'blue'"
                size="sm"
                class="q-mr-sm"
              />
              เพิ่ม{{ activityDialog.type === 'quiz' ? 'แบบทดสอบ' : 'การส่งงาน' }}
            </div>
            <q-space />
            <q-btn icon="close" flat round dense v-close-popup />
          </q-card-section>

          <q-card-section class="q-pt-md">
            <q-input
              v-model="activityDialog.name"
              label="ชื่อกิจกรรม *"
              outlined
              dense
              autofocus
              @keyup.enter="saveActivity"
            />
          </q-card-section>

          <q-card-actions align="right" class="text-primary">
            <q-btn flat label="ยกเลิก" v-close-popup />
            <q-btn unelevated color="primary" label="ตกลง" @click="saveActivity" />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';
import { useQuasar, QStepper } from 'quasar';
import { useRouter } from 'vue-router';
import { useCourseStore } from 'src/stores/course-store';
import { useAuthStore } from 'src/stores/auth-store';
import type { DeliveryMode } from 'src/types/course';
import type { CourseDetail } from 'src/types/course-detail';
import { api } from 'src/boot/axios';

const $q = useQuasar();
const router = useRouter();
const courseStore = useCourseStore();
const authStore = useAuthStore();

const step = ref(1);
const loading = ref(false);
const stepper = ref<QStepper | null>(null);

// Activity Dialog state with clear typing
interface ActivityDialogState {
  show: boolean;
  type: 'quiz' | 'assign';
  name: string;
  weekIndex: number;
}

const activityDialog = reactive<ActivityDialogState>({
  show: false,
  type: 'quiz',
  name: '',
  weekIndex: -1,
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
  syllabus: [
    {
      topic: 'บทนำและความรู้พื้นฐาน',
      activities: [] as { type: 'quiz' | 'assign'; name: string }[],
    },
  ],
  schedules: [{ day: '', startTime: '09:00', endTime: '12:00', room: '' }],
  registrationStart: '',
  registrationEnd: '',
  deliveryModes: [] as string[],
  maxSeats: 40,
  totalHours: 15,
  targetGroup: '',
  prerequisites: 'ไม่มี',
  certificateType: 'ประกาศนียบัตร',
  isFree: false,
  priceStudent: 0,
  priceExternal: 888,
  contactEmail: 'gem@buu.ac.th',
  contactPhone: '038-102-222 ต่อ 4001',
  image: null as File | null,
});

const imagePreview = ref<string | null>(null);

watch(
  () => form.image,
  (newFile: File | null) => {
    if (newFile) {
      imagePreview.value = URL.createObjectURL(newFile);
    } else {
      imagePreview.value = null;
    }
  },
);

const onFileRejected = () => {
  $q.notify({
    type: 'negative',
    message: 'ไฟล์ต้องเป็นรูปภาพ (.jpg, .png) และขนาดไม่เกิน 2MB',
  });
};

// Helper functions for dynamic lists
const addObjective = () => form.objectives.push('');
const removeObjective = (index: number) => form.objectives.splice(index, 1);
const addSyllabus = () => form.syllabus.push({ topic: '', activities: [] });
const removeSyllabus = (index: number) => form.syllabus.splice(index, 1);
const addSchedule = () =>
  form.schedules.push({ day: '', startTime: '09:00', endTime: '12:00', room: '' });
const removeSchedule = (index: number) => form.schedules.splice(index, 1);

// Activity methods
const openActivityDialog = (weekIndex: number, type: 'quiz' | 'assign') => {
  activityDialog.weekIndex = weekIndex;
  activityDialog.type = type;
  activityDialog.name = type === 'quiz' ? 'แบบทดสอบย่อย' : 'งานที่มอบหมาย';
  activityDialog.show = true;
};

const saveActivity = () => {
  if (!activityDialog.name || activityDialog.weekIndex === -1) return;

  const targetWeek = form.syllabus[activityDialog.weekIndex];
  if (targetWeek) {
    targetWeek.activities.push({
      type: activityDialog.type,
      name: activityDialog.name,
    });
  }

  activityDialog.show = false;
};

const removeActivity = (weekIndex: number, actIndex: number) => {
  const targetWeek = form.syllabus[weekIndex];
  if (targetWeek) {
    targetWeek.activities.splice(actIndex, 1);
  }
};

const thaiShortMonths = [
  'ม.ค.',
  'ก.พ.',
  'มี.ค.',
  'เม.ย.',
  'พ.ค.',
  'มิ.ย.',
  'ก.ค.',
  'ส.ค.',
  'ก.ย.',
  'ต.ค.',
  'พ.ย.',
  'ธ.ค.',
];

function parseDateInput(dateText: string): Date | null {
  const [year, month, day] = dateText.split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function formatThaiShortDate(dateText: string, includeYear: boolean): string {
  const date = parseDateInput(dateText);
  if (!date) return dateText;
  const day = date.getDate();
  const month = thaiShortMonths[date.getMonth()] ?? '';
  const year = date.getFullYear() + 543;
  return includeYear ? `${day} ${month} ${year}` : `${day} ${month}`;
}

function formatEnglishShortDate(dateText: string): string {
  const date = parseDateInput(dateText);
  if (!date) return dateText;
  return date.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function goBack() {
  void router.back();
}

async function onSubmit() {
  loading.value = true;

  try {
    const registrationStartLabel = formatThaiShortDate(form.registrationStart, false);
    const registrationEndLabel = formatThaiShortDate(form.registrationEnd, true);
    const registrationStartEnLabel = formatEnglishShortDate(form.registrationStart);
    const registrationEndEnLabel = formatEnglishShortDate(form.registrationEnd);
    const cover = JSON.stringify({
      icon: 'school',
      accentColor: '#f5a623',
      backgroundColor: '#1e3a5f',
    });
    const imageUrl =
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';

    // 1. Create Course in DB + Moodle
    const formData = new FormData();
    formData.append('fullname', form.title);
    formData.append('shortname', form.code);
    formData.append('summary', form.description);
    formData.append('titleEn', form.titleEn);
    formData.append('hours', form.totalHours.toString());
    formData.append('startDate', form.registrationStart);
    formData.append('endDate', form.registrationEnd);
    formData.append('imageUrl', imageUrl);
    formData.append('price', (form.isFree ? 0 : form.priceExternal).toString());
    formData.append('maxSeats', form.maxSeats.toString());
    formData.append('deliveryModes', JSON.stringify(form.deliveryModes));
    formData.append('cover', cover);
    formData.append('courseStatus', form.certificateType);
    formData.append('facultyName', form.faculty);
    formData.append('categoryName', form.category);
    formData.append('registrationStart', registrationStartLabel);
    formData.append('registrationStartEn', registrationStartEnLabel);
    formData.append('registrationEnd', registrationEndLabel);
    formData.append('registrationEndEn', registrationEndEnLabel);
    formData.append('isFree', form.isFree ? 'true' : 'false');
    formData.append('isActive', 'true');

    if (authStore.user?.id) formData.append('instructorId', authStore.user.id);
    if (authStore.user?.email) formData.append('instructorEmail', authStore.user.email);

    console.log('Current User in Store:', authStore.user);
    if (authStore.user?.username) {
      formData.append('instructorUsername', authStore.user.username);
    } else if (authStore.user?.firstNameTh) {
      formData.append('instructorUsername', authStore.user.firstNameTh);
    }

    if (form.image) {
      formData.append('file', form.image);
    }

    const { data: courseData } = await api.post<{ id: number; data?: { moodleId?: number } }>(
      '/api/moodle/courses',
      formData,
    );

    const dbCourseId = String(courseData.id);
    const moodleCourseId = courseData.data?.moodleId ?? courseData.id;

    // 2. Create Activities for each week
    if (moodleCourseId) {
      for (let i = 0; i < form.syllabus.length; i++) {
        const week = form.syllabus[i];
        if (week && week.activities) {
          for (const act of week.activities) {
            await api
              .post('/api/moodle/modules', {
                courseid: moodleCourseId,
                type: act.type,
                name: act.name,
                sectionindex: i + 1,
              })
              .catch((err: unknown) => console.error('Failed to create activity:', err));
          }
        }
      }
    }

    // 3. Update Local Store using DB-assigned ID
    const newCourseDetail: CourseDetail = {
      id: dbCourseId,
      code: form.code,
      ...(moodleCourseId ? { moodleId: Number(moodleCourseId) } : {}),
      title: form.title,
      titleEn: form.titleEn,
      ...(authStore.user?.id ? { instructorId: authStore.user.id } : {}),
      ...(authStore.user?.email ? { instructorEmail: authStore.user.email } : {}),
      imageUrl,
      cover: { icon: 'school', accentColor: '#f5a623', backgroundColor: '#1e3a5f' },
      registrationStart: registrationStartLabel,
      registrationStartEn: registrationStartEnLabel,
      registrationEnd: registrationEndLabel,
      registrationEndEn: registrationEndEnLabel,
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
      descriptionFull: form.description,
      objectives: [...form.objectives],
      targetAudience: form.targetGroup,
      prerequisites: form.prerequisites,
      creditHours: 0,
      totalHours: form.totalHours,
      department: form.faculty,
      certificateType: form.certificateType,
      contactEmail: form.contactEmail,
      contactPhone: form.contactPhone,
      instructor: {
        name: authStore.user?.firstNameTh
          ? `${authStore.user.firstNameTh} ${authStore.user.lastNameTh}`
          : 'ผู้สอนใหม่',
        title: 'อาจารย์',
        avatarUrl: authStore.user?.avatar || 'https://i.pravatar.cc/200?img=11',
        department: form.faculty,
      },
      schedules: form.schedules.map((s) => ({
        day: s.day,
        time: `${s.startTime} - ${s.endTime}`,
        room: s.room,
      })),
      syllabus: form.syllabus.map((s, idx) => ({
        week: idx + 1,
        topic: s.topic,
        description: `มีกิจกรรม: ${s.activities.map((a) => a.name).join(', ') || 'ไม่มี'}`,
      })),
    };

    courseStore.addCourse(newCourseDetail);
    courseStore.addCourseDetail(newCourseDetail);

    $q.notify({
      type: 'positive',
      message: 'สร้างรายวิชาและกิจกรรมใน Moodle สำเร็จ!',
      position: 'top',
    });

    void router.push({
      path: '/instructor/courses',
      query: { courseId: newCourseDetail.id },
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'ไม่สามารถเชื่อมต่อ Moodle ได้';
    $q.notify({
      type: 'negative',
      message: 'เกิดข้อผิดพลาด: ' + errorMessage,
      position: 'top',
    });
  } finally {
    loading.value = false;
  }
}
</script>

<style lang="scss" scoped>
.course-creation-card {
  width: 100%;
}
.course-stepper {
  min-height: 520px;
}
.border-dashed {
  border: 2px dashed #e0e0e0;
}
.border-grey {
  border: 1px solid #e0e0e0;
}
:deep(.q-stepper__step-content) {
  padding: 20px 24px;
}
</style>
