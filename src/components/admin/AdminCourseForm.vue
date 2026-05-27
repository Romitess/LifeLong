<template>
  <q-form
    ref="qFormRef"
    :class="['course-form', { 'course-form--readonly': props.readonly }]"
    @submit.prevent
  >
    <q-banner v-if="error" rounded dense class="bg-negative text-white q-mb-md">
      {{ error }}
    </q-banner>

    <AdminSectionNav v-model="activeTab" :items="sectionNavItems" />

    <div class="course-form__panels">
      <section v-show="activeTab === 'info'" ref="infoSectionRef" data-course-form-section="info">
        <p class="text-caption text-grey-7 q-mb-lg">
          ช่องที่มีเครื่องหมาย <span class="text-negative text-weight-bold">*</span>
          คือข้อมูลที่จำเป็นต้องกรอก
        </p>

        <!-- ─── ข้อมูลทั่วไป ─── -->
        <AdminSurfaceCard
          eyebrow="Course Info"
          title="ข้อมูลทั่วไป"
          subtitle="ข้อมูลพื้นฐานของรายวิชาหรือหลักสูตรระยะสั้น"
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
                maxlength="255"
                placeholder="เช่น การพัฒนาแอปพลิเคชันมือถือเบื้องต้น"
                :rules="[requiredRule]"
                :readonly="props.readonly"
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
                maxlength="255"
                placeholder="e.g. Introduction to Mobile Application Development"
                :rules="[requiredRule]"
                :readonly="props.readonly"
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
                :disable="props.readonly"
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
                :disable="props.readonly"
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
                :disable="props.readonly || !form.categoryId"
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
                  :removable="!props.readonly"
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
                v-if="!props.readonly"
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
                        inputValue.length < 2
                          ? 'พิมพ์อย่างน้อย 2 ตัวอักษรเพื่อค้นหา'
                          : 'ไม่พบผู้สอน'
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
                      :disable="props.readonly"
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
                  :readonly="props.readonly"
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
                      :disable="props.readonly"
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
                  :disable="props.readonly"
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
                    :readonly="props.readonly"
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
                    :readonly="props.readonly"
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

            <!-- เกี่ยวกับรายวิชา -->
            <div class="course-form__field course-form__field--full">
              <div class="course-form__label">
                เกี่ยวกับรายวิชา
                <span class="course-form__optional">(ไม่บังคับ)</span>
              </div>
              <q-input
                v-model="form.description"
                outlined
                dense
                type="textarea"
                rows="2"
                placeholder="อธิบายภาพรวมของรายวิชา เนื้อหา และสิ่งที่ผู้เรียนจะได้รับ..."
                class="course-form__input"
                :readonly="props.readonly"
              />
            </div>

            <!-- วัตถุประสงค์ -->
            <div class="course-form__field course-form__field--full">
              <div class="course-form__label-row">
                <span class="course-form__label">
                  วัตถุประสงค์รายวิชา
                  <span class="course-form__optional">(ไม่บังคับ)</span>
                </span>
                <q-btn
                  v-if="!props.readonly"
                  flat
                  dense
                  no-caps
                  color="primary"
                  icon="add"
                  label="เพิ่มวัตถุประสงค์"
                  class="course-form__add-btn"
                  @click="form.summaryItems.push('')"
                />
              </div>
              <div
                v-if="form.summaryItems.length === 0 && !props.readonly"
                class="course-form__summary-empty"
              >
                กดเพิ่มวัตถุประสงค์เพื่อระบุสิ่งที่ผู้เรียนจะได้รับ
              </div>
              <div
                v-for="(_, idx) in form.summaryItems"
                :key="idx"
                class="course-form__summary-row"
              >
                <span class="course-form__summary-seq">{{ idx + 1 }}.</span>
                <q-input
                  v-model="form.summaryItems[idx]"
                  outlined
                  dense
                  placeholder="ผู้เรียนสามารถ..."
                  class="course-form__input course-form__summary-input"
                  :readonly="props.readonly"
                />
                <q-btn
                  v-if="!props.readonly"
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="form.summaryItems.splice(idx, 1)"
                />
              </div>
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
                :readonly="props.readonly"
              />
            </div>

            <!-- คุณสมบัติผู้สมัคร -->
            <div class="course-form__field course-form__field--full">
              <div class="course-form__label">
                คุณสมบัติผู้สมัคร <span class="course-form__optional">(ไม่บังคับ)</span>
              </div>
              <q-input
                v-model="form.property"
                outlined
                dense
                type="textarea"
                rows="2"
                placeholder="เช่น นักศึกษาปริญญาตรีเท่านั้น / อายุ 18 ปีขึ้นไป..."
                class="course-form__input"
                :readonly="props.readonly"
              />
            </div>

            <!-- เกณฑ์การวัดและประเมินผล -->
            <div class="course-form__field course-form__field--full">
              <div class="course-form__label">
                เกณฑ์การวัดและประเมินผล <span class="course-form__optional">(ไม่บังคับ)</span>
              </div>
              <q-input
                v-model="form.evaluation"
                outlined
                dense
                type="textarea"
                rows="2"
                placeholder="เช่น ตัดเกรดอิงเกณฑ์ / ผ่านเมื่อทำแบบทดสอบได้ 70% ขึ้นไป..."
                class="course-form__input"
                :readonly="props.readonly"
              />
            </div>

            <!-- สมรรถนะเด่น -->
            <div class="course-form__field course-form__field--full">
              <div class="course-form__label">
                สมรรถนะเด่น <span class="course-form__optional">(ไม่บังคับ)</span>
              </div>
              <q-input
                v-model="form.competency"
                outlined
                dense
                type="textarea"
                rows="2"
                placeholder="เช่น ทักษะการคิดเชิงวิเคราะห์ / ความสามารถในการสื่อสาร..."
                class="course-form__input"
                :readonly="props.readonly"
              />
            </div>

            <!-- ผลลัพธ์การเรียนรู้ -->
            <div class="course-form__field course-form__field--full">
              <div class="course-form__label-row">
                <span class="course-form__label">
                  ผลลัพธ์การเรียนรู้ (LO) <span class="course-form__optional">(ไม่บังคับ)</span>
                </span>
                <q-btn
                  v-if="!props.readonly"
                  flat
                  dense
                  no-caps
                  color="primary"
                  icon="add"
                  label="เพิ่ม LO"
                  class="course-form__add-btn"
                  @click="form.loItems.push('')"
                />
              </div>
              <div
                v-if="form.loItems.length === 0 && !props.readonly"
                class="course-form__summary-empty"
              >
                กดเพิ่ม LO เพื่อระบุผลลัพธ์การเรียนรู้ที่คาดหวัง
              </div>
              <div v-for="(_, idx) in form.loItems" :key="idx" class="course-form__summary-row">
                <span class="course-form__summary-seq">{{ idx + 1 }}.</span>
                <q-input
                  v-model="form.loItems[idx]"
                  outlined
                  dense
                  placeholder="ผู้เรียนสามารถ..."
                  class="course-form__input course-form__summary-input"
                  :readonly="props.readonly"
                />
                <q-btn
                  v-if="!props.readonly"
                  flat
                  round
                  dense
                  icon="delete"
                  color="negative"
                  size="sm"
                  @click="form.loItems.splice(idx, 1)"
                />
              </div>
            </div>

            <!-- สิทธิประโยชน์ผู้สำเร็จหลักสูตร -->
            <div class="course-form__field course-form__field--full">
              <div class="course-form__label">
                สิทธิประโยชน์ผู้สำเร็จหลักสูตร
                <span class="course-form__optional">(ไม่บังคับ)</span>
              </div>
              <q-input
                v-model="form.privilege"
                outlined
                dense
                type="textarea"
                rows="2"
                placeholder="เช่น รับวุฒิบัตร / ใช้เทียบโอนหน่วยกิต / สะสมหน่วยกิตได้..."
                class="course-form__input"
                :readonly="props.readonly"
              />
            </div>

            <!-- คำค้นหา -->
            <div class="course-form__field course-form__field--full">
              <div class="course-form__label">
                คำค้นหา (Keyword) <span class="course-form__optional">(ไม่บังคับ)</span>
              </div>
              <q-input
                v-model="form.keyword"
                outlined
                dense
                maxlength="400"
                placeholder="เช่น programming, data science, AI, machine learning"
                class="course-form__input"
                :readonly="props.readonly"
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
                  :disable="props.readonly"
                />
                <q-input
                  v-if="form.hasCertificate"
                  v-model="form.certificateName"
                  outlined
                  dense
                  maxlength="255"
                  placeholder="ระบุชื่อวุฒิบัตร เช่น ประกาศนียบัตรวิชาชีพ..."
                  style="min-width: 300px"
                  class="course-form__input"
                  :readonly="props.readonly"
                />
              </div>
            </div>

            <!-- รูปปก -->
            <div class="course-form__field course-form__field--full">
              <div class="course-form__label">
                รูปหน้าปกรายวิชา <span class="course-form__optional">(ไม่บังคับ)</span>
              </div>
              <!-- มีรูปเดิมจากเซิร์ฟเวอร์ ยังไม่ได้อัปโหลดใหม่ -->
              <div
                v-if="props.initialData?.imageUrl && !form.image && !existingImageCleared"
                class="course-form__existing-field"
              >
                <q-icon name="image" size="18px" color="grey-7" />
                <span class="course-form__existing-filename">{{ existingImageFilename }}</span>
                <q-icon
                  v-if="!props.readonly"
                  name="close"
                  class="cursor-pointer"
                  color="negative"
                  size="18px"
                  @click.stop.prevent="existingImageCleared = true"
                />
              </div>
              <!-- ไม่มีรูปเดิม หรือถูกลบแล้ว หรืออัปโหลดใหม่แล้ว -->
              <q-file
                v-else
                v-model="form.image"
                outlined
                dense
                accept=".jpg,.jpeg,.png,.webp"
                :max-file-size="2097152"
                label="เลือกรูปภาพ"
                hide-bottom-space
                class="course-form__input"
                :disable="props.readonly"
                @update:model-value="imageError = null"
                @rejected="onImageRejected"
              >
                <template #prepend>
                  <q-icon name="image" />
                </template>
                <template v-if="form.image" #append>
                  <q-icon
                    name="close"
                    class="cursor-pointer"
                    color="negative"
                    @click.stop.prevent="form.image = undefined"
                  />
                </template>
              </q-file>
              <div v-if="!props.readonly || form.image" class="text-caption text-grey-6 q-mt-xs">
                แนะนำขนาด 1280×720px (สัดส่วน 16:9) · ไฟล์ jpg / png / webp · ขนาดไม่เกิน 2MB
              </div>
              <div v-if="imageError" class="course-form__file-error">{{ imageError }}</div>
              <div
                v-if="imagePreviewUrl"
                class="course-form__image-preview"
                style="pointer-events: auto"
              >
                <img
                  :src="imagePreviewUrl"
                  class="course-form__image-thumb"
                  alt="รูปหน้าปก"
                  @click="imageZoomOpen = true"
                />
                <q-dialog v-model="imageZoomOpen" transition-show="scale" transition-hide="scale">
                  <div class="course-form__zoom-wrap">
                    <div class="course-form__zoom-toolbar">
                      <q-btn
                        flat
                        round
                        dense
                        icon="close"
                        color="white"
                        class="course-form__zoom-close"
                        v-close-popup
                      />
                    </div>
                    <img :src="imagePreviewUrl" class="course-form__zoom-img" alt="รูปหน้าปก" />
                  </div>
                </q-dialog>
              </div>
            </div>

            <!-- ระยะเวลาที่อนุมัติ -->
            <div class="course-form__field course-form__field--full">
              <div class="course-form__label">
                ระยะเวลาที่อนุมัติให้หลักสูตรดำเนินการได้
                <span class="course-form__required">*</span>
              </div>
              <div class="course-form__date-range">
                <BaseDateInput
                  v-model="form.startDate"
                  :rules="[requiredRule]"
                  :disable="props.readonly"
                  class="course-form__date-input"
                />
                <span class="course-form__date-sep">ถึง</span>
                <BaseDateInput
                  ref="endDateInputRef"
                  v-model="form.endDate"
                  :rules="[requiredRule, endDateRule]"
                  :options="(d: string) => !startDateForCalendar || d >= startDateForCalendar"
                  :disable="props.readonly"
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
                <BaseDateInput
                  v-model="form.registrationStart"
                  :disable="props.readonly"
                  class="course-form__date-input"
                />
                <span class="course-form__date-sep">ถึง</span>
                <BaseDateInput
                  ref="regEndDateInputRef"
                  v-model="form.registrationEnd"
                  :rules="[regEndDateRule]"
                  :options="(d: string) => !regStartDateForCalendar || d >= regStartDateForCalendar"
                  :disable="props.readonly"
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
                :readonly="props.readonly"
                @keypress="onNumberKeypress"
              />
              <div class="text-caption text-grey-6">เว้นว่างไว้ถ้าไม่จำกัดจำนวน</div>
            </div>

            <!-- แนบไฟล์ CBS -->
            <div class="course-form__field course-form__field--full">
              <div class="course-form__label">
                แนบเอกสารต้นทางหลักสูตร <span class="course-form__optional">(ไม่บังคับ)</span>
              </div>
              <div class="text-caption text-grey-6 q-mb-xs">
                เอกสาร CBS 001, CBS 002 หรือแบบฟอร์มหลักสูตรระยะสั้น เก็บเป็นหลักฐานอ้างอิง
                ไม่ใช่ไฟล์บทเรียนสำหรับผู้เรียน
              </div>

              <!-- ไฟล์เดิมที่บันทึกในระบบ -->
              <div
                v-for="f in props.initialData?.files ?? []"
                v-show="!removedFileIds.includes(f.fileId)"
                :key="f.fileId"
                class="course-form__existing-field"
                style="pointer-events: auto"
              >
                <q-icon name="picture_as_pdf" size="18px" color="negative" />
                <a
                  :href="f.fileUrl"
                  target="_blank"
                  rel="noopener"
                  class="course-form__existing-filename course-form__file-link"
                  >{{ f.fileName }}</a
                >
                <q-icon
                  v-if="!props.readonly"
                  name="close"
                  class="cursor-pointer"
                  color="negative"
                  size="18px"
                  @click.stop.prevent="removedFileIds.push(f.fileId)"
                />
              </div>

              <!-- ไฟล์ใหม่ที่รอบันทึก -->
              <div
                v-for="(nf, idx) in form.newFiles"
                :key="idx"
                class="course-form__existing-field"
                style="pointer-events: auto"
              >
                <q-icon name="upload_file" size="18px" color="primary" />
                <span class="course-form__existing-filename">{{ nf.name }}</span>
                <q-icon
                  name="close"
                  class="cursor-pointer"
                  color="negative"
                  size="18px"
                  @click.stop.prevent="form.newFiles.splice(idx, 1)"
                />
              </div>

              <!-- ปุ่มเพิ่มไฟล์ -->
              <q-file
                v-if="!props.readonly"
                v-model="cbsPickerModel"
                outlined
                dense
                multiple
                accept=".pdf,application/pdf"
                :max-file-size="2097152"
                label="เพิ่มไฟล์เอกสาร"
                hide-bottom-space
                class="course-form__input q-mt-xs"
                @update:model-value="onCbsPicked"
                @rejected="onCbsRejected"
              >
                <template #prepend>
                  <q-icon name="upload_file" />
                </template>
              </q-file>

              <div v-if="!props.readonly" class="text-caption text-grey-6 q-mt-xs">
                เฉพาะไฟล์ .pdf ขนาดไม่เกิน 2MB ต่อไฟล์ (สูงสุด 5 ไฟล์)
              </div>
              <div v-if="fileError" class="course-form__file-error">{{ fileError }}</div>
            </div>

            <!-- กลุ่มเป้าหมาย -->
            <div class="course-form__field course-form__field--full">
              <div class="course-form__label">
                กลุ่มเป้าหมายที่เข้ารับการศึกษา
                <span class="course-form__optional">(ไม่บังคับ)</span>
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
                    :disable="props.readonly"
                    class="course-form__target-checkbox"
                  />
                  <template
                    v-if="target.subtargets.length && selectedTargetIds.includes(target.id)"
                  >
                    <div class="course-form__subtargets">
                      <template v-for="sub in target.subtargets" :key="sub.id">
                        <q-checkbox
                          v-model="selectedSubtargetIds"
                          :val="sub.id"
                          :label="sub.label"
                          color="primary"
                          dense
                          :disable="props.readonly"
                          class="course-form__subtarget-checkbox"
                        />
                        <q-input
                          v-if="sub.isOther && selectedSubtargetIds.includes(sub.id)"
                          v-model="subtargetOtherText[sub.id]"
                          outlined
                          dense
                          placeholder="ระบุ"
                          class="course-form__subtarget-other"
                          :readonly="props.readonly"
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
                      :readonly="props.readonly"
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
                        :disable="props.readonly"
                        class="course-form__radio"
                      />
                      <div
                        v-if="form.classTypeId === classType.id"
                        class="course-form__inline-grid"
                      >
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
                              :readonly="props.readonly"
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
                            type="text"
                            placeholder="เช่น ราคาพิเศษสำหรับนิสิตปัจจุบัน"
                            class="course-form__input course-form__input--wide"
                            :readonly="props.readonly"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </template>
              </q-field>
            </div>

            <!-- ราคาต่อประเภทผู้เรียน -->
            <div
              v-if="formOptions.studentTypes.length > 0"
              class="course-form__field course-form__field--full"
            >
              <div class="course-form__label">
                ราคาต่อประเภทผู้เรียน
                <span class="course-form__optional">(ไม่บังคับ)</span>
              </div>
              <div class="course-form__stutype-fee-list">
                <div
                  v-for="st in formOptions.studentTypes"
                  :key="st.id"
                  class="course-form__stutype-fee-row"
                >
                  <span class="course-form__stutype-name">{{ st.label }}</span>
                  <div class="course-form__fee-input-wrap">
                    <q-input
                      v-model.number="form.stutypeFeeAmounts[st.id]"
                      outlined
                      dense
                      type="number"
                      min="0"
                      placeholder="ราคา"
                      class="course-form__input course-form__input--compact"
                      :readonly="props.readonly"
                      @keypress="onNumberKeypress"
                    />
                    <span class="course-form__fee-unit">บาท</span>
                  </div>
                </div>
              </div>
              <div class="text-caption text-grey-6 q-mt-xs">
                เว้นว่างไว้หากประเภทนั้นไม่มีการกำหนดราคาเฉพาะ
              </div>
            </div>
          </div>
        </AdminSurfaceCard>

        <!-- ─── ข้อมูลในการติดต่อสอบถาม ─── -->
        <AdminSurfaceCard
          eyebrow="Contact Info"
          title="ข้อมูลในการติดต่อสอบถาม"
          subtitle="ช่องทางการติดต่อของผู้รับผิดชอบรายวิชา"
          body-padding="lg"
          class="q-mb-lg"
        >
          <div class="course-form__grid">
            <div class="course-form__field">
              <div class="course-form__label">
                ชื่อ-สกุลผู้ติดต่อ <span class="course-form__required">*</span>
              </div>
              <q-input
                v-model="form.contactName"
                outlined
                dense
                maxlength="100"
                placeholder="ชื่อ-นามสกุล ผู้ประสานงาน"
                :rules="[requiredRule]"
                :readonly="props.readonly"
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
                maxlength="30"
                placeholder="038-123-456"
                :rules="[requiredRule, phoneRule]"
                :readonly="props.readonly"
                class="course-form__input"
                @keypress="onPhoneKeypress"
              />
            </div>

            <div class="course-form__field">
              <div class="course-form__label">
                อีเมล <span class="course-form__required">*</span>
              </div>
              <q-input
                v-model="form.contactEmail"
                outlined
                dense
                maxlength="100"
                type="email"
                placeholder="example@buu.ac.th"
                :rules="[requiredRule, emailRule]"
                :readonly="props.readonly"
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
                maxlength="255"
                placeholder="https://www.example.com"
                hide-bottom-space
                :readonly="props.readonly"
                class="course-form__input"
              />
            </div>
          </div>
        </AdminSurfaceCard>
      </section>

      <section
        v-show="activeTab === 'chapters'"
        ref="chaptersSectionRef"
        data-course-form-section="chapters"
      >
        <div class="text-caption text-grey-6 q-mb-md">
          โครงสร้างนี้ใช้สร้าง Section ตั้งต้นใน Moodle
          เพื่อให้ผู้สอนเริ่มเพิ่มเนื้อหาและกิจกรรมได้ทันที — ผู้สอนเป็นผู้จัดการ
          resource/quiz/assignment จริงใน Moodle
        </div>
        <AdminCourseChapterTab
          v-model="chapters"
          :chapter-types="formOptions.chapterTypes"
          :readonly="props.readonly"
        />

        <!-- หมายเหตุบทเรียน -->
        <div class="course-form__field course-form__field--full q-mt-md">
          <div class="course-form__label">
            หมายเหตุเพิ่มเติมเกี่ยวกับบทเรียน <span class="course-form__optional">(ไม่บังคับ)</span>
          </div>
          <q-input
            v-model="form.remarkChapter"
            outlined
            dense
            type="textarea"
            rows="3"
            placeholder="เช่น ผู้เรียนควรเตรียมอุปกรณ์เพิ่มเติม / หมายเหตุสำหรับอาจารย์ผู้สอน..."
            class="course-form__input"
            :readonly="props.readonly"
          />
        </div>
      </section>
    </div>

    <!-- Status badges -->
    <div v-if="props.initialData" class="course-form__status">
      <q-chip
        :icon="publishedFlag === 'Y' ? 'public' : 'lock'"
        :color="publishedFlag === 'Y' ? 'positive' : 'grey-6'"
        text-color="white"
        size="md"
        :label="publishedFlag === 'Y' ? 'เผยแพร่แล้ว' : 'ยังไม่เผยแพร่ (Draft)'"
      />
      <q-chip
        :icon="moodleSyncIcon"
        :color="moodleSyncColor"
        text-color="white"
        size="md"
        :label="moodleSyncLabel"
      />
      <AdminActionButton
        v-if="!props.readonly && moodleSyncFlag !== 'Y'"
        variant="secondary"
        icon="refresh"
        label="ลอง sync Moodle อีกครั้ง"
        :loading="isRetrying"
        class="course-form__retry-btn"
        @click="$emit('retry-sync')"
      />
    </div>

    <!-- Actions -->
    <div v-if="!props.readonly" class="course-form__actions">
      <AdminActionButton
        variant="secondary"
        label="ยกเลิก"
        class="course-form__btn"
        @click="$emit('cancel')"
      />
      <AdminActionButton
        v-if="props.initialData && publishedFlag === 'Y'"
        variant="secondary"
        icon="lock"
        label="ยกเลิกการเผยแพร่"
        :loading="isPublishing"
        class="course-form__btn"
        @click="$emit('unpublish')"
      />
      <AdminActionButton
        v-else-if="props.initialData"
        variant="secondary"
        icon="public"
        label="เผยแพร่"
        :loading="isPublishing"
        class="course-form__btn"
        @click="submitAndPublish"
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
import type {
  AdminCourseDetail,
  CourseChapterPayload,
  CourseTargetPayload,
  CreateCoursePayload,
} from 'src/types/admin-courses';
import BaseDateInput from 'components/base/BaseDateInput.vue';
import AdminSurfaceCard from './AdminSurfaceCard.vue';
import AdminActionButton from './AdminActionButton.vue';
import AdminCourseChapterTab from './AdminCourseChapterTab.vue';
import AdminSectionNav, { type AdminSectionNavItem } from './AdminSectionNav.vue';

const props = defineProps<{
  submitOverride?: (payload: CreateCoursePayload) => Promise<{ courseId: number }>;
  readonly?: boolean;
  initialData?: AdminCourseDetail | null;
  isPublishing?: boolean;
  isRetrying?: boolean;
}>();

const emit = defineEmits<{
  cancel: [];
  saved: [courseId: number];
  publish: [];
  unpublish: [];
  'retry-sync': [];
}>();

const publishedFlag = computed<'Y' | 'N'>(() => props.initialData?.published ?? 'N');
const moodleSyncFlag = computed<'Y' | 'N'>(() => props.initialData?.moodleSyncStatus ?? 'N');
const moodleSyncIcon = computed(() => {
  if (moodleSyncFlag.value === 'Y') return 'cloud_done';
  return props.initialData?.moodleCourseId ? 'cloud_off' : 'cloud_queue';
});
const moodleSyncColor = computed(() => {
  if (moodleSyncFlag.value === 'Y') return 'primary';
  return props.initialData?.moodleCourseId ? 'negative' : 'warning';
});
const moodleSyncLabel = computed(() => {
  if (moodleSyncFlag.value === 'Y') return 'Moodle: synced';
  return props.initialData?.moodleCourseId ? 'Moodle: sync ล้มเหลว' : 'Moodle: ยังไม่ sync';
});

const authStore = useAuthStore();
const { formOptions, isSaving, error, fetchFormOptions, createCourse } = useAdminCourseForm();
const qFormRef = ref<InstanceType<typeof QForm> | null>(null);
const activeTab = ref<'info' | 'chapters'>('info');
const chapters = ref<CourseChapterPayload[]>([]);
const sectionNavItems: AdminSectionNavItem[] = [
  { value: 'info', label: 'ข้อมูลรายวิชา', icon: 'description' },
  { value: 'chapters', label: 'โครงสร้างบทเรียน', icon: 'menu_book' },
];

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
  description: '',
  summaryItems: [] as string[],
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
  loItems: [] as string[],
  keyword: '',
  privilege: '',
  remarkChapter: '',
  property: '',
  evaluation: '',
  competency: '',
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
  newFiles: [] as File[],
  stutypeFeeAmounts: {},
});

// Convert YYYY-MM-DD → DD/MM/YYYY for form display
function toFormDate(s: string | null | undefined): string {
  if (!s || s.length < 10) return '';
  const [y, m, d] = s.split('-');
  return `${d}/${m}/${y}`;
}

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

const existingImageCleared = ref(false);
const removedFileIds = ref<number[]>([]);
const cbsPickerModel = ref<File | File[] | null>(null);

const imageBlobUrl = ref<string | null>(null);
const imageZoomOpen = ref(false);
watch(
  () => form.image,
  (file, prev) => {
    if (prev && imageBlobUrl.value) URL.revokeObjectURL(imageBlobUrl.value);
    imageBlobUrl.value = file ? URL.createObjectURL(file) : null;
  },
);
const imagePreviewUrl = computed(
  () =>
    imageBlobUrl.value ??
    (existingImageCleared.value ? null : (props.initialData?.imageUrl ?? null)),
);

const existingImageFilename = computed(() => {
  const url = props.initialData?.imageUrl;
  if (!url) return '';
  try {
    return new URL(url).pathname.split('/').pop() ?? url;
  } catch {
    return url.split('/').pop() ?? url;
  }
});

watch(
  () => props.initialData,
  (data) => {
    if (!data) return;
    existingImageCleared.value = false;
    removedFileIds.value = [];
    form.newFiles = [];
    cbsPickerModel.value = null;
    form.nameTh = data.nameTh ?? '';
    form.nameEn = data.nameEn ?? '';
    form.description = data.description ?? '';
    form.summaryItems = (data.summary ?? '').split('\n').filter(Boolean);
    form.facultyId = data.facultyId ?? undefined;
    form.typeCourseId = data.typeCourseId ?? undefined;
    form.creditBank = data.creditBank ?? '';
    form.theoryHours = data.theoryHours ?? undefined;
    form.practiceHours = data.practiceHours ?? undefined;
    form.studyTypeId = data.studyTypeId ?? undefined;
    form.skillIds = data.skillIds ?? [];
    form.startDate = toFormDate(data.startDate);
    form.endDate = toFormDate(data.endDate);
    form.categoryId = data.categoryId ?? undefined;
    form.subcategoryId = data.subcategoryId ?? undefined;
    form.classTypeId = data.classTypeId ?? undefined;
    form.classFee = data.classFee ?? 0;
    form.classFeeRemark = data.classFeeRemark ?? '';
    form.loItems = (data.lo ?? '')
      .split('\n')
      .map((s: string) => s.replace(/^\d+\.\s*/, '').trim())
      .filter(Boolean);
    form.keyword = data.keyword ?? '';
    form.privilege = data.privilege ?? '';
    form.remarkChapter = data.remarkChapter ?? '';
    form.property = data.property ?? '';
    form.evaluation = data.evaluation ?? '';
    form.competency = data.competency ?? '';
    form.precondition = data.precondition ?? '';
    form.hasCertificate = data.certificate === 'Y';
    form.certificateName = data.certificateName ?? '';
    form.registrationStart = toFormDate(data.registrationStart);
    form.registrationEnd = toFormDate(data.registrationEnd);
    form.maxSeats = data.maxSeats ?? undefined;
    form.contactName = data.contactName ?? '';
    form.contactTel = data.contactTel ?? '';
    form.contactEmail = data.contactEmail ?? '';
    form.contactUrl = data.contactUrl ?? '';
    selectedInstructors.value = data.instructors
      .filter((i) => i.email)
      .map((i) => ({ username: '', email: i.email ?? '', fullName: i.email ?? '' }));
    chapters.value = data.chapters.map((ch) => {
      const entry: CourseChapterPayload = { subject: ch.subject };
      if (ch.hour != null) entry.hour = ch.hour;
      if (ch.chapterTypeId != null) entry.chapterTypeId = ch.chapterTypeId;
      if (ch.chapterTypeOther) entry.chapterTypeOther = ch.chapterTypeOther;
      if (ch.subchapters?.length) entry.subchapters = ch.subchapters;
      return entry;
    });
    selectedTargetIds.value = data.targets.map((t) => t.targetId);
    selectedSubtargetIds.value = data.targets
      .filter((t) => t.subtargetId != null)
      .map((t) => t.subtargetId as number);
    subtargetOtherText.value = Object.fromEntries(
      data.targets
        .filter((t) => t.subtargetId != null && t.other)
        .map((t) => [t.subtargetId as number, t.other as string]),
    );
    form.stutypeFeeAmounts = Object.fromEntries(
      (data.stutypeFees ?? []).map((f) => [f.stutypeId, f.amount]),
    );
  },
  { immediate: true },
);

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

const fileError = ref<string | null>(null);
const imageError = ref<string | null>(null);
const creditBankFieldRef = ref<HTMLElement | null>(null);
const creditBankInputRef = ref<InstanceType<typeof QInput> | null>(null);
const endDateInputRef = ref<InstanceType<typeof BaseDateInput> | null>(null);
const regEndDateInputRef = ref<InstanceType<typeof BaseDateInput> | null>(null);
const infoSectionRef = ref<HTMLElement | null>(null);
const chaptersSectionRef = ref<HTMLElement | null>(null);

interface OrderedConditionalValidation {
  when: () => boolean;
  validate: () => Promise<boolean>;
}

function setActiveTabForElement(element: Element | null): void {
  if (!element) return;
  if (infoSectionRef.value?.contains(element)) {
    activeTab.value = 'info';
    return;
  }
  if (chaptersSectionRef.value?.contains(element)) {
    activeTab.value = 'chapters';
  }
}

async function revealAndFocusFirstError(): Promise<void> {
  await nextTick();
  const formEl = qFormRef.value?.$el as HTMLElement | null;
  const firstErrorField = (formEl ?? document).querySelector('.q-field--error');
  setActiveTabForElement(firstErrorField);
  await nextTick();
  await nextTick();
  const scrollTarget =
    firstErrorField?.closest<HTMLElement>('.course-form__field') ??
    (firstErrorField as HTMLElement | null);
  scrollTarget?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  const input = firstErrorField?.querySelector('input, textarea, [tabindex]') as HTMLElement | null;
  input?.focus();
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
const emailRule = (v: string) =>
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) || 'รูปแบบอีเมลไม่ถูกต้อง';
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

function onCbsPicked(picked: File | File[] | null) {
  if (!picked) return;
  fileError.value = null;
  const arr = Array.isArray(picked) ? picked : [picked];
  form.newFiles.push(...arr);
  void nextTick(() => {
    cbsPickerModel.value = null;
  });
}

function onCbsRejected(entries: { failedPropValidation: string }[]) {
  const entry = entries[0];
  if (!entry) return;
  fileError.value =
    entry.failedPropValidation === 'max-file-size'
      ? 'ขนาดไฟล์ต้องไม่เกิน 2MB'
      : 'รองรับเฉพาะไฟล์ PDF เท่านั้น';
}

function onImageRejected(entries: { failedPropValidation: string }[]) {
  const entry = entries[0];
  imageError.value =
    entry?.failedPropValidation === 'max-file-size'
      ? 'ขนาดรูปต้องไม่เกิน 2MB'
      : 'ไฟล์รูปต้องเป็น jpg, png หรือ webp และไม่เกิน 2MB';
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

  activeTab.value = 'info';
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
    await revealAndFocusFirstError();
    return;
  }

  const payload: CreateCoursePayload = {
    nameTh: form.nameTh,
    nameEn: form.nameEn,
    summary: form.summaryItems.filter((s) => s.trim()).join('\n') || undefined,
    description: form.description.trim() || undefined,
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
    lo: form.loItems.filter((s) => s.trim()).join('\n') || undefined,
    keyword: form.keyword.trim() || undefined,
    privilege: form.privilege.trim() || undefined,
    remarkChapter: form.remarkChapter || undefined,
    property: form.property || undefined,
    evaluation: form.evaluation || undefined,
    competency: form.competency || undefined,
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
    removeImage: existingImageCleared.value || undefined,
    files: form.newFiles.length ? form.newFiles : undefined,
    removeFileIds: removedFileIds.value.length ? removedFileIds.value : undefined,
    createUser: authStore.user?.username ?? undefined,
    instructors: selectedInstructors.value.length
      ? selectedInstructors.value.map((i) => ({ username: i.username, email: i.email }))
      : undefined,
    chapters: chapters.value.length > 0 ? chapters.value : undefined,
    stutypeFees: formOptions.value.studentTypes
      .filter((st) => form.stutypeFeeAmounts[st.id] != null)
      .map((st) => ({ stutypeId: st.id, amount: form.stutypeFeeAmounts[st.id] as number })),
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

async function submitAndPublish() {
  error.value = null;
  const conditionalFieldsValid = await validateOrderedConditionalFields();
  if (!conditionalFieldsValid) return;
  const valid = await qFormRef.value?.validate();
  if (!valid) {
    await revealAndFocusFirstError();
    return;
  }
  emit('publish');
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

.course-form__existing-field {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 40px;
  padding: 0 12px;
  border: 1px solid rgba(0, 0, 0, 0.24);
  border-radius: 4px;
  background: transparent;
}

.course-form__existing-filename {
  flex: 1;
  font-size: 0.875rem;
  color: rgba(0, 0, 0, 0.87);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
  align-items: start;

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

.course-form__stutype-fee-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.course-form__stutype-fee-row {
  display: flex;
  align-items: center;
  gap: 16px;
}

.course-form__stutype-name {
  width: 120px;
  font-size: 0.875rem;
  color: #2d3748;
  flex-shrink: 0;
}

.course-form__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  padding-bottom: 32px;
}

.course-form__status {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 0 0 16px;
}

.course-form__retry-btn {
  margin-left: 4px;
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

.course-form__panels {
  background: transparent;
}

.course-form__label-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 6px;
}

.course-form__add-btn {
  padding: 0 4px !important;
  min-height: 32px;
  font-size: 0.82rem;
  font-weight: 700;
}

.course-form__summary-empty {
  font-size: 0.82rem;
  color: #a0aec0;
  padding: 8px 4px;
}

.course-form__summary-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
}

.course-form__summary-seq {
  font-size: 0.82rem;
  color: #a0aec0;
  min-width: 20px;
  text-align: right;
}

.course-form__summary-input {
  flex: 1;
}

.course-form--readonly .course-form__panels {
  pointer-events: none;
  user-select: text;
}

.course-form__image-preview {
  margin-top: 8px;
}

.course-form__image-thumb {
  display: block;
  width: 320px;
  height: 180px;
  border-radius: 8px;
  cursor: zoom-in;
  border: 1px solid rgba(0, 0, 0, 0.08);
  object-fit: cover;
}

.course-form__zoom-wrap {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  background: transparent;
  box-shadow: none;
  max-width: min(720px, 86vw);
}

.course-form__zoom-toolbar {
  display: flex;
  justify-content: flex-end;
  padding: 6px 0 4px;
}

.course-form__zoom-close {
  background: rgba(0, 0, 0, 0.5);
}

.course-form__zoom-img {
  display: block;
  width: 100%;
  max-height: 86vh;
  border-radius: 8px;
  object-fit: contain;
}

.course-form__file-link {
  color: $primary;
  text-decoration: none;
  font-size: 0.875rem;
  font-weight: 500;
  &:hover {
    text-decoration: underline;
  }
}
</style>
