<template>
  <q-form ref="qFormRef" class="course-form" scroll-to-first-error @submit.prevent>
    <q-banner v-if="error" rounded dense class="bg-negative text-white q-mb-md">
      {{ error }}
    </q-banner>

    <p class="text-caption text-grey-7 q-mb-lg">
      ช่องที่มีเครื่องหมาย <span class="text-negative text-weight-bold">*</span>
      คือข้อมูลที่จำเป็นต้องกรอก
    </p>

    <!-- ─── ข้อมูลทั่วไป ─── -->
    <AdminSurfaceCard title="ข้อมูลทั่วไป" body-padding="lg" class="q-mb-md">
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
            placeholder="เช่น การพัฒนาแอปพลิเคชันมือถือเบื้องต้น"
            :rules="[requiredRule]"
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
            placeholder="e.g. Introduction to Mobile Application Development"
            :rules="[requiredRule]"
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
            class="course-form__select"
            @update:model-value="form.subcategoryId = undefined"
          />
        </div>

        <!-- หมู่วิชา -->
        <div class="course-form__field">
          <div class="course-form__label">
            หมู่วิชา <span class="course-form__optional">(ไม่บังคับ)</span>
          </div>
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

        <!-- ผู้รับผิดชอบรายวิชา -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            ผู้รับผิดชอบรายวิชา
            <span class="course-form__optional">(ไม่บังคับ — สามารถเพิ่มภายหลังได้)</span>
          </div>
          <!-- Chips แสดงผู้สอนที่เลือกแล้ว -->
          <div v-if="selectedInstructors.length" class="course-form__instructor-chips">
            <q-chip
              v-for="inst in selectedInstructors"
              :key="inst.email || inst.username"
              removable
              dense
              color="primary"
              text-color="white"
              class="course-form__instructor-chip"
              @remove="removeInstructor(inst)"
            >
              {{ inst.fullName || inst.username }}
            </q-chip>
          </div>
          <!-- Search dropdown เพื่อเพิ่มผู้สอน -->
          <q-select
            v-model="instructorSearchModel"
            outlined
            dense
            use-input
            input-debounce="400"
            :options="instructorOptions"
            :loading="instructorSearching"
            option-label="fullName"
            hide-bottom-space
            placeholder="ค้นหาชื่อหรืออีเมลเพื่อเพิ่มผู้สอน..."
            class="course-form__select"
            @filter="filterInstructors"
            @update:model-value="addInstructor"
          >
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section>
                  <q-item-label>{{ scope.opt.fullName || scope.opt.username }}</q-item-label>
                  <q-item-label caption>{{ scope.opt.email }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template #no-option="{ inputValue }">
              <q-item>
                <q-item-section class="text-grey">
                  {{
                    inputValue.length < 2 ? 'พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา' : 'ไม่พบผู้สอน'
                  }}
                </q-item-section>
              </q-item>
            </template>
            <template #selected-item />
          </q-select>
        </div>

        <!-- ประเภทของรายวิชา -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            ประเภทของรายวิชา <span class="course-form__required">*</span>
          </div>
          <q-field
            :model-value="form.typeCourseId"
            :rules="[(v) => !!v || 'กรุณาเลือกประเภทรายวิชา']"
            borderless
            no-error-icon
            class="course-form__radio-group"
          >
            <template #control>
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
            </template>
          </q-field>
        </div>

        <!-- หน่วยกิตสะสม -->
        <div v-if="form.typeCourseId === 2" ref="creditBankFieldRef" class="course-form__field">
          <div class="course-form__label">
            หน่วยกิตสะสม <span class="course-form__required">*</span>
          </div>
          <div class="course-form__fee-input-wrap">
            <q-input
              ref="creditBankInputRef"
              v-model="form.creditBank"
              outlined
              dense
              type="number"
              min="0"
              step="0.5"
              placeholder="3.0"
              class="course-form__fee-input"
              :rules="[(v: unknown) => !!v || v === '0' || 'กรุณากรอกหน่วยกิต']"
              hide-bottom-space
              @keypress="onNumberKeypress"
            />
            <span class="course-form__fee-unit">หน่วยกิต</span>
          </div>
        </div>

        <!-- รูปแบบการเรียนการสอน -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            รูปแบบการเรียนการสอน <span class="course-form__required">*</span>
          </div>
          <q-field
            :model-value="form.studyTypeId"
            :rules="[(v) => !!v || 'กรุณาเลือกรูปแบบการเรียนการสอน']"
            borderless
            no-error-icon
            class="course-form__radio-group"
          >
            <template #control>
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
            </template>
          </q-field>
        </div>

        <!-- ทักษะที่ผู้เรียนจะได้รับ -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            ทักษะที่ผู้เรียนจะได้รับ <span class="course-form__optional">(ไม่บังคับ)</span>
          </div>
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

        <!-- ระยะเวลาในการเรียนการสอน -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            ระยะเวลาในการเรียนการสอน <span class="course-form__optional">(ไม่บังคับ)</span>
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

        <!-- รายละเอียด/วัตถุประสงค์ -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            รายละเอียดและวัตถุประสงค์รายวิชา <span class="course-form__optional">(ไม่บังคับ)</span>
          </div>
          <q-input
            v-model="form.summary"
            outlined
            dense
            type="textarea"
            rows="3"
            placeholder="อธิบายเนื้อหาหลักสูตรและสิ่งที่ผู้เรียนจะได้รับ..."
            class="course-form__input"
          />
        </div>

        <!-- คุณสมบัติเบื้องต้น -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            คุณสมบัติเบื้องต้นของผู้เรียน <span class="course-form__optional">(ไม่บังคับ)</span>
          </div>
          <q-input
            v-model="form.precondition"
            outlined
            dense
            type="textarea"
            rows="2"
            placeholder="เช่น ไม่มีข้อกำหนด / ต้องผ่านรายวิชา..."
            class="course-form__input"
          />
        </div>

        <!-- วุฒิบัตร -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            วุฒิบัตร/ประกาศนียบัตร <span class="course-form__optional">(ไม่บังคับ)</span>
          </div>
          <div class="row items-center q-gutter-md">
            <q-checkbox
              v-model="form.hasCertificate"
              label="มีวุฒิบัตร/ประกาศนียบัตร"
              dense
              color="primary"
            />
            <q-input
              v-if="form.hasCertificate"
              v-model="form.certificateName"
              outlined
              dense
              placeholder="ระบุชื่อวุฒิบัตร เช่น ประกาศนียบัตรวิชาชีพ..."
              style="min-width: 300px"
              class="course-form__input"
            />
          </div>
        </div>

        <!-- รูปปก -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            รูปหน้าปกรายวิชา <span class="course-form__optional">(ไม่บังคับ)</span>
          </div>
          <q-file
            v-model="form.image"
            outlined
            dense
            accept=".jpg,.jpeg,.png,.webp"
            label="เลือกรูปภาพ"
            hide-bottom-space
            class="course-form__input"
            @rejected="onImageRejected"
          >
            <template #prepend>
              <q-icon name="image" />
            </template>
          </q-file>
          <div class="text-caption text-grey-6 q-mt-xs">
            แนะนำขนาด 1280×720px (สัดส่วน 16:9) · ไฟล์ jpg / png / webp · ขนาดไม่เกิน 2MB
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

        <!-- ช่วงเปิดรับสมัคร -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            ช่วงเวลาเปิดรับสมัคร
            <span class="course-form__optional"
              >(ไม่บังคับ — ถ้าไม่ระบุ ระบบจะไม่จำกัดช่วงเวลา)</span
            >
          </div>
          <div class="course-form__date-range">
            <BaseDateInput v-model="form.registrationStart" class="course-form__date-input" />
            <span class="course-form__date-sep">ถึง</span>
            <BaseDateInput
              ref="regEndDateInputRef"
              v-model="form.registrationEnd"
              :rules="[regEndDateRule]"
              :options="(d: string) => !regStartDateForCalendar || d >= regStartDateForCalendar"
              class="course-form__date-input"
            />
          </div>
        </div>

        <!-- จำนวนที่นั่ง -->
        <div class="course-form__field">
          <div class="course-form__label">
            จำนวนที่นั่งสูงสุด <span class="course-form__optional">(ไม่บังคับ)</span>
          </div>
          <q-input
            v-model.number="form.maxSeats"
            outlined
            dense
            type="number"
            min="1"
            placeholder="เช่น 30"
            class="course-form__hours-input"
            @keypress="onNumberKeypress"
          />
          <div class="text-caption text-grey-6">เว้นว่างไว้ถ้าไม่จำกัดจำนวน</div>
        </div>

        <!-- แนบไฟล์ CBS -->
        <div class="course-form__field course-form__field--full">
          <div class="course-form__label">
            แนบไฟล์ CBS 001 หรือ CBS 002 <span class="course-form__optional">(ไม่บังคับ)</span>
          </div>
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
              <p class="course-form__upload-note">เฉพาะไฟล์ .pdf ขนาดไม่เกิน 2MB</p>
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
          <div class="course-form__label">
            กลุ่มเป้าหมายที่เข้ารับการศึกษา <span class="course-form__optional">(ไม่บังคับ)</span>
          </div>
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
          <q-field
            :model-value="form.classTypeId"
            :rules="[(v) => !!v || 'กรุณาเลือกรูปแบบการจัดการเรียนการสอน']"
            borderless
            no-error-icon
            class="course-form__radio-group"
          >
            <template #control>
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
                  <div v-if="form.classTypeId === classType.id" class="course-form__inline-grid">
                    <div class="course-form__inline-field">
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
                          class="course-form__input course-form__input--compact"
                          @keypress="onNumberKeypress"
                        />
                        <span class="course-form__fee-unit">บาท</span>
                      </div>
                      <div class="text-caption text-grey-6 q-mt-xs">
                        ถ้าไม่มีค่าธรรมเนียมให้ใส่ 0
                      </div>
                    </div>
                    <div class="course-form__inline-field">
                      <div class="course-form__label-sm">
                        หมายเหตุค่าธรรมเนียม
                        <span class="course-form__optional">(ไม่บังคับ)</span>
                      </div>
                      <q-input
                        v-model="form.classFeeRemark"
                        outlined
                        dense
                        placeholder="เช่น ราคาพิเศษสำหรับนิสิตปัจจุบัน"
                        class="course-form__input course-form__input--wide"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </q-field>
        </div>
      </div>
    </AdminSurfaceCard>

    <!-- ─── ข้อมูลในการติดต่อสอบถาม ─── -->
    <AdminSurfaceCard title="ข้อมูลในการติดต่อสอบถาม" body-padding="lg" class="q-mb-lg">
      <div class="course-form__grid">
        <div class="course-form__field">
          <div class="course-form__label">
            ชื่อ-สกุลผู้ติดต่อ <span class="course-form__required">*</span>
          </div>
          <q-input
            v-model="form.contactName"
            outlined
            dense
            placeholder="ชื่อ-นามสกุล ผู้ประสานงาน"
            :rules="[requiredRule]"
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
            placeholder="038-123-456"
            :rules="[requiredRule, phoneRule]"
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
            class="course-form__input"
          />
        </div>

        <div class="course-form__field">
          <div class="course-form__label">
            เว็บไซต์ <span class="course-form__optional">(ไม่บังคับ)</span>
          </div>
          <q-input
            v-model="form.contactUrl"
            outlined
            dense
            placeholder="https://www.example.com"
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
  </q-form>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import { AxiosError } from 'axios';
import { QForm, QInput } from 'quasar';
import { api } from 'src/boot/axios';
import { useAdminCourseForm } from 'src/composables/use-admin-course-form';
import { useAuthStore } from 'src/stores/auth-store';
import type { CourseTargetPayload, CreateCoursePayload } from 'src/types/admin-courses';
import BaseDateInput from 'components/base/BaseDateInput.vue';
import AdminSurfaceCard from './AdminSurfaceCard.vue';
import AdminActionButton from './AdminActionButton.vue';

const props = defineProps<{
  submitOverride?: (payload: CreateCoursePayload) => Promise<{ courseId: number }>;
}>();

const emit = defineEmits<{
  cancel: [];
  saved: [courseId: number];
}>();

const authStore = useAuthStore();
const { formOptions, isSaving, error, fetchFormOptions, createCourse } = useAdminCourseForm();
const qFormRef = ref<InstanceType<typeof QForm> | null>(null);

function extractMsg(e: unknown): string {
  if (e instanceof AxiosError) {
    const msg = e.response?.data?.message;
    if (Array.isArray(msg)) return (msg as string[]).join(', ');
    if (typeof msg === 'string') return msg;
  }
  return e instanceof Error ? e.message : 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ';
}
void fetchFormOptions();

const form = reactive({
  nameTh: '',
  nameEn: '',
  summary: '',
  facultyId: undefined as number | undefined,
  typeCourseId: undefined as number | undefined,
  creditBank: '',
  theoryHours: undefined as number | undefined,
  practiceHours: undefined as number | undefined,
  studyTypeId: undefined as number | undefined,
  skillIds: [] as number[],
  startDate: '',
  endDate: '',
  categoryId: undefined as number | undefined,
  subcategoryId: undefined as number | undefined,
  classTypeId: undefined as number | undefined,
  classFee: 0,
  classFeeRemark: '',
  precondition: '',
  hasCertificate: false,
  certificateName: '',
  registrationStart: '',
  registrationEnd: '',
  maxSeats: undefined as number | undefined,
  contactName: '',
  contactTel: '',
  contactEmail: '',
  contactUrl: '',
  image: undefined as File | undefined,
  file: undefined as File | undefined,
});

const selectedTargetIds = ref<number[]>([]);
const selectedSubtargetIds = ref<number[]>([]);
const subtargetOtherText = ref<Record<number, string>>({});
const targetOtherText = ref<Record<number, string>>({});

interface InstructorOption {
  username: string;
  email: string;
  fullName: string;
}

const selectedInstructors = ref<InstructorOption[]>([]);
const instructorSearchModel = ref<InstructorOption | null>(null);
const instructorOptions = ref<InstructorOption[]>([]);
const instructorSearching = ref(false);

function addInstructor(inst: InstructorOption | null) {
  if (!inst) return;
  const key = inst.email || inst.username;
  if (!selectedInstructors.value.some((i) => (i.email || i.username) === key)) {
    selectedInstructors.value.push(inst);
  }
  instructorSearchModel.value = null;
}

function removeInstructor(inst: InstructorOption) {
  const key = inst.email || inst.username;
  selectedInstructors.value = selectedInstructors.value.filter(
    (i) => (i.email || i.username) !== key,
  );
}

async function filterInstructors(val: string, update: (fn: () => void) => void, abort: () => void) {
  if (val.length < 2) {
    abort();
    return;
  }
  instructorSearching.value = true;
  try {
    const { data } = await api.get<InstructorOption[]>('/api/admin/courses/instructors/search', {
      params: { q: val },
    });
    update(() => {
      const selectedKeys = new Set(selectedInstructors.value.map((i) => i.email || i.username));
      instructorOptions.value = data.filter((d) => !selectedKeys.has(d.email || d.username));
    });
  } catch {
    abort();
  } finally {
    instructorSearching.value = false;
  }
}

const fileInputRef = ref<HTMLInputElement | null>(null);
const fileError = ref<string | null>(null);
const creditBankFieldRef = ref<HTMLElement | null>(null);
const creditBankInputRef = ref<InstanceType<typeof QInput> | null>(null);
const endDateInputRef = ref<InstanceType<typeof BaseDateInput> | null>(null);
const regEndDateInputRef = ref<InstanceType<typeof BaseDateInput> | null>(null);

interface OrderedConditionalValidation {
  when: () => boolean;
  validate: () => Promise<boolean>;
}

watch(
  () => form.typeCourseId,
  (v) => {
    if (v !== 2) form.creditBank = '';
  },
);

// Re-validate end date whenever start date changes
watch(
  () => form.startDate,
  () => {
    if (form.endDate) void nextTick(() => endDateInputRef.value?.validate());
  },
);

// Re-validate registration end whenever registration start changes
watch(
  () => form.registrationStart,
  () => {
    if (form.registrationEnd) void nextTick(() => regEndDateInputRef.value?.validate());
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
  /^[\d\s\-()+]{4,30}$/.test(v) || 'รูปแบบเบอร์โทรไม่ถูกต้อง (ตัวอย่าง 038-123-456)';
const feeRule = (v: unknown) =>
  (v !== undefined && v !== null && v !== '' && Number(v) >= 0) ||
  'กรุณากรอกค่าธรรมเนียม (ถ้าฟรีใส่ 0)';

// Convert DD/MM/YYYY → YYYY-MM-DD for backend submission
function toDatabaseDate(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split('/');
  return `${y ?? ''}-${m ?? ''}-${d ?? ''}`;
}

// Convert DD/MM/YYYY → YYYY/MM/DD for q-date options callback comparison
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

const regStartDateForCalendar = computed(() => {
  if (!form.registrationStart || form.registrationStart.length < 10) return '';
  const [d, m, y] = form.registrationStart.split('/');
  return `${y}/${m}/${d}`;
});

const regEndDateRule = (v: string) => {
  if (!form.registrationStart || form.registrationStart.length < 10 || v.length < 10) return true;
  return (
    toDatabaseDate(v) >= toDatabaseDate(form.registrationStart) ||
    'วันสิ้นสุดต้องไม่น้อยกว่าวันเริ่มรับสมัคร'
  );
};

function onPhoneKeypress(e: KeyboardEvent) {
  if (!/[\d\s\-()+]/.test(e.key)) e.preventDefault();
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

function onImageRejected() {
  fileError.value = null;
  error.value = 'ไฟล์รูปต้องเป็น jpg, png หรือ webp และไม่เกิน 2MB';
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

async function validateCreditBankField(): Promise<boolean> {
  if (!form.typeCourseId || form.typeCourseId !== 2) return true;
  if (form.creditBank) return true;

  await nextTick();
  await creditBankInputRef.value?.validate();
  creditBankFieldRef.value?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const input = creditBankFieldRef.value?.querySelector('input');
  if (input instanceof HTMLInputElement) input.focus();
  return false;
}

const orderedConditionalValidations: OrderedConditionalValidation[] = [
  {
    when: () => form.typeCourseId === 2,
    validate: validateCreditBankField,
  },
];

async function validateOrderedConditionalFields(): Promise<boolean> {
  for (const rule of orderedConditionalValidations) {
    if (!rule.when()) continue;
    const valid = await rule.validate();
    if (!valid) return false;
  }
  return true;
}

async function submit() {
  error.value = null;

  const conditionalFieldsValid = await validateOrderedConditionalFields();
  if (!conditionalFieldsValid) {
    return;
  }

  const valid = await qFormRef.value?.validate();
  if (!valid) {
    await nextTick();
    await nextTick();
    const formEl = qFormRef.value?.$el as HTMLElement | null;
    (formEl ?? document)
      .querySelector('.q-field--error')
      ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return;
  }

  const payload: CreateCoursePayload = {
    nameTh: form.nameTh,
    nameEn: form.nameEn,
    summary: form.summary || undefined,
    facultyId: form.facultyId!,
    typeCourseId: form.typeCourseId!,
    creditBank: form.typeCourseId === 2 && form.creditBank ? form.creditBank : undefined,
    theoryHours: form.theoryHours,
    practiceHours: form.practiceHours,
    studyTypeId: form.studyTypeId!,
    skillIds: form.skillIds,
    startDate: toDatabaseDate(form.startDate),
    endDate: toDatabaseDate(form.endDate),
    categoryId: form.categoryId!,
    subcategoryId: form.subcategoryId,
    targets: buildTargets(),
    classTypeId: form.classTypeId,
    classFee: form.classFee,
    classFeeRemark: form.classFeeRemark,
    precondition: form.precondition || undefined,
    certificate: form.hasCertificate ? 'Y' : 'N',
    certificateName: form.hasCertificate ? form.certificateName || undefined : undefined,
    registrationStart:
      form.registrationStart.length === 10 ? toDatabaseDate(form.registrationStart) : undefined,
    registrationEnd:
      form.registrationEnd.length === 10 ? toDatabaseDate(form.registrationEnd) : undefined,
    maxSeats: form.maxSeats,
    contactName: form.contactName,
    contactTel: form.contactTel,
    contactEmail: form.contactEmail,
    contactUrl: form.contactUrl || undefined,
    image: form.image,
    file: form.file,
    createUser: authStore.user?.username ?? undefined,
    instructors: selectedInstructors.value.length
      ? selectedInstructors.value.map((i) => ({ username: i.username, email: i.email }))
      : undefined,
  };

  if (props.submitOverride) {
    isSaving.value = true;
    error.value = null;
    try {
      const result = await props.submitOverride(payload);
      emit('saved', result.courseId);
    } catch (e) {
      error.value = extractMsg(e);
    } finally {
      isSaving.value = false;
    }
  } else {
    try {
      const result = await createCourse(payload);
      emit('saved', result.courseId);
    } catch {
      // error is set in composable
    }
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
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding-bottom: 22px;

  :deep(.q-field__bottom) {
    position: absolute;
    bottom: 2px;
    left: 0;
    right: 0;
  }
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

.course-form__optional {
  font-size: 0.75rem;
  font-weight: 400;
  color: #a0aec0;
  margin-left: 4px;
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
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  flex-wrap: wrap;
  padding-bottom: 22px;

  :deep(.q-field__bottom) {
    position: absolute;
    bottom: 2px;
    left: 0;
  }
}

.course-form__date-input {
  width: 200px;
}

.course-form__date-sep {
  font-size: 0.85rem;
  color: #718096;
  padding-top: 9px;
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

.course-form__inline-grid {
  display: grid;
  grid-template-columns: minmax(220px, 280px) minmax(360px, 1fr);
  gap: 12px 24px;
  padding-left: 32px;
  padding-bottom: 4px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
}

.course-form__inline-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.course-form__inline-field :deep(.q-field--dense .q-field__control) {
  min-height: 44px;
  height: 44px;
}

.course-form__inline-field :deep(.q-field--dense .q-field__native),
.course-form__inline-field :deep(.q-field--dense .q-field__input) {
  min-height: 44px;
  padding-top: 0;
  padding-bottom: 0;
  align-items: center;
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

.course-form__input--compact {
  width: 120px;
}

.course-form__fee-unit {
  font-size: 0.8rem;
  color: #718096;
  white-space: nowrap;
}

.course-form__input--wide {
  min-width: 360px;
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

.course-form__radio-group {
  padding: 0;

  > :deep(.q-field__control) {
    min-height: unset;
    height: auto;
    padding: 0;
  }

  > :deep(.q-field__bottom) {
    padding-top: 4px;
  }
}

.course-form__instructor-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 8px;
}

.course-form__instructor-chip {
  font-size: 0.8rem;
}

.hidden {
  display: none;
}
</style>
