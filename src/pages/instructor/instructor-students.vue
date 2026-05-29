<template>
  <q-page class="instructor-students-page">
    <div class="section-container instructor-students">
      <section class="students-hero">
        <div>
          <div class="students-hero__eyebrow">Student Report Card</div>
          <h1>บันทึกผลการเรียน</h1>
          <p v-if="selectedCourse">
            {{ selectedCourse.code }} {{ selectedCourse.titleEn || selectedCourse.title }}
          </p>
          <p v-else>เลือกคอร์สเพื่อบันทึกผลการเรียน</p>
        </div>
        <BaseButton
          v-if="selectedCourse"
          outline
          color="primary"
          icon="arrow_back"
          label="กลับไปเลือกคอร์ส"
          no-caps
          @click="clearSelectedCourse"
        />
      </section>

      <section v-if="!selectedCourse" class="student-course-list-panel">
        <div class="student-course-list-panel__header">
          <div>
            <h2>
              {{
                activeStudentTab === 'results'
                  ? 'เลือกคอร์สเพื่อบันทึกผลการเรียน'
                  : 'เลือกคอร์สเพื่อตรวจสอบรายชื่อผู้เรียน'
              }}
            </h2>
            <span>{{ instructorCourses.length.toLocaleString() }} รายวิชา</span>
          </div>
        </div>

        <div v-if="activeStudentTab === 'results'" class="learning-result-table-scroll">
          <table class="learning-result-course-table">
            <colgroup>
              <col class="learning-result-col-index" />
              <col class="learning-result-col-title" />
              <col class="learning-result-col-fee" />
              <col class="learning-result-col-schedule" />
              <col class="learning-result-col-seat" />
              <col class="learning-result-col-enrolled" />
              <col class="learning-result-col-pass" />
              <col class="learning-result-col-fail" />
              <col class="learning-result-col-actions" />
              <col class="learning-result-col-download" />
            </colgroup>
            <thead>
              <tr>
                <th>ลำดับ</th>
                <th>ชื่อรายวิชา</th>
                <th>ค่าเรียน</th>
                <th>กำหนดการ</th>
                <th>รับ</th>
                <th>ลง</th>
                <th>ผ่าน</th>
                <th>ไม่ผ่าน</th>
                <th>ดำเนินการ</th>
                <th>ดาวน์โหลด</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(course, index) in instructorCourses" :key="course.id">
                <td class="text-center">{{ index + 1 }}</td>
                <td class="learning-result-title-cell">
                  <button type="button" @click="selectCourse(course.id)">
                    {{ course.code }} : {{ course.title }}
                  </button>
                  <span v-if="course.titleEn">{{ course.titleEn }}</span>
                </td>
                <td class="text-center">
                  {{ course.isFree ? 'ไม่มีค่าใช้จ่าย' : formatCurrency(course.price) }}
                </td>
                <td class="learning-result-schedule-cell">
                  <span>ลงทะเบียน</span>
                  <strong>{{ formatCourseDateRange(course) }}</strong>
                </td>
                <td class="text-center">{{ course.maxSeats?.toLocaleString() ?? '-' }}</td>
                <td class="text-center">{{ course.enrolledCount.toLocaleString() }}</td>
                <td class="text-center text-positive">
                  {{ getCoursePassedCount(course).toLocaleString() }}
                </td>
                <td class="text-center text-negative">
                  {{ getCourseFailedCount(course).toLocaleString() }}
                </td>
                <td class="text-center">
                  <q-btn
                    dense
                    round
                    flat
                    color="primary"
                    icon="edit"
                    class="learning-result-icon-btn"
                    @click="selectCourse(course.id)"
                  >
                    <q-tooltip>บันทึกผลการเรียน</q-tooltip>
                  </q-btn>
                </td>
                <td class="text-center">
                  <button
                    type="button"
                    class="learning-result-download-link"
                    @click.stop="printCbs003(course)"
                  >
                    {{ getLearningResultDownloadCode() }}
                  </button>
                </td>
              </tr>
              <tr v-if="instructorCourses.length === 0">
                <td colspan="10" class="learning-result-empty-cell">ไม่พบรายวิชา</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="student-course-list">
          <button
            v-for="course in instructorCourses"
            :key="course.id"
            type="button"
            class="student-course-row"
            @click="selectCourse(course.id)"
          >
            <img :src="course.imageUrl" :alt="course.titleEn || course.title" />
            <div class="student-course-row__body">
              <div class="student-course-row__code">{{ course.code }}</div>
              <h3>{{ course.titleEn || course.title }}</h3>
              <p v-if="course.titleEn && course.titleEn !== course.title">{{ course.title }}</p>
            </div>
            <div class="student-course-row__metric">
              <span>ผู้เรียน</span>
              <strong>{{ course.enrolledCount.toLocaleString() }}</strong>
            </div>
            <div class="student-course-row__metric">
              <span>รับ</span>
              <strong>{{ course.maxSeats?.toLocaleString() ?? 'ไม่จำกัด' }}</strong>
            </div>
            <BaseButton
              unelevated
              color="primary"
              icon="fact_check"
              label="ตรวจสอบรายชื่อ"
              no-caps
              class="student-course-row__action"
              @click.stop="selectCourse(course.id)"
            />
          </button>
        </div>
      </section>

      <section v-else class="student-roster-panel">
        <div class="student-roster-panel__summary">
          <div>
            <span>ลงทะเบียนแล้ว</span>
            <strong>{{ displayedEnrolledCount.toLocaleString() }}</strong>
          </div>
          <div>
            <span>จำนวนที่นั่ง</span>
            <strong>{{ selectedCourse.maxSeats?.toLocaleString() ?? 'ไม่จำกัด' }}</strong>
          </div>
          <div>
            <span>ความคืบหน้าเฉลี่ย</span>
            <strong>{{ averageProgress }}%</strong>
          </div>
        </div>

        <template v-if="activeStudentTab === 'results'">
          <div class="learning-result-import-page">
            <div class="learning-result-course-info">
              <div>
                <span>รายวิชา</span>
                <strong>{{ selectedCourse.code }} : {{ selectedCourse.title }}</strong>
              </div>
              <div>
                <span>ค่าธรรมเนียม</span>
                <strong>{{
                  selectedCourse.isFree ? 'ไม่มีค่าใช้จ่าย' : formatCurrency(selectedCourse.price)
                }}</strong>
              </div>
              <div>
                <span>จำนวนรับ</span>
                <strong>{{ selectedCourse.maxSeats?.toLocaleString() ?? 'ไม่จำกัด' }} คน</strong>
              </div>
              <div>
                <span>จำนวนผู้ลงทะเบียน</span>
                <strong>{{ selectedCourse.enrolledCount.toLocaleString() }} คน</strong>
              </div>
              <p>
                <span class="text-positive"
                  >ผ่าน {{ getCoursePassedCount(selectedCourse) }} คน</span
                >
                <span class="text-negative"
                  >ไม่ผ่าน {{ getCourseFailedCount(selectedCourse) }} คน</span
                >
              </p>
            </div>

            <div v-if="!approvalStatus" class="learning-result-import-grid">
              <label class="learning-result-import-label" for="learning-result-import"
                >import</label
              >
              <div class="learning-result-import-workspace">
                <div class="learning-result-import-toolbar">
                  <div class="learning-result-import-toolbar__row">
                    <BaseButton
                      outline
                      color="primary"
                      icon="download"
                      label="ดาวน์โหลด Template"
                      no-caps
                      class="learning-result-import-tool-btn"
                      @click="downloadGradeImportTemplate"
                    />
                    <BaseButton
                      outline
                      color="primary"
                      icon="upload_file"
                      label="อัปโหลด CSV/TXT"
                      no-caps
                      class="learning-result-import-tool-btn"
                      @click="triggerGradeImportFile"
                    />
                    <input
                      ref="gradeImportFileInput"
                      type="file"
                      accept=".csv,.txt,text/csv,text/plain"
                      class="hidden"
                      @change="onGradeImportFileSelected"
                    />
                  </div>
                  <div class="learning-result-import-toolbar__row">
                    <BaseButton
                      outline
                      color="primary"
                      icon="groups"
                      label="ดึงรายชื่อทั้งหมด"
                      no-caps
                      :disable="learners.length === 0"
                      class="learning-result-import-tool-btn"
                      @click="fillAllStudents"
                    />
                    <BaseButton
                      outline
                      color="primary"
                      icon="pending_actions"
                      label="ดึงรายชื่อที่ยังไม่มีผลการเรียน"
                      no-caps
                      :disable="learners.length === 0"
                      class="learning-result-import-tool-btn"
                      @click="fillStudentsWithoutGrade"
                    />
                    <BaseButton
                      flat
                      color="grey-7"
                      icon="close"
                      label="ล้าง"
                      no-caps
                      :disable="!resultImportText"
                      class="learning-result-import-tool-btn"
                      @click="resultImportText = ''"
                    />
                  </div>
                </div>

                <q-input
                  id="learning-result-import"
                  v-model="resultImportText"
                  type="textarea"
                  outlined
                  placeholder="วางข้อมูลรูปแบบ: รหัสผู้เรียน เกรด เช่น C6901355 A"
                  class="learning-result-import-input"
                />

                <BaseButton
                  outline
                  color="primary"
                  icon="preview"
                  label="ดูตัวอย่าง"
                  no-caps
                  :disable="!resultImportText.trim()"
                  class="learning-result-import-action-btn"
                  @click="buildDetailPreview"
                />
              </div>
              <div class="learning-result-import-help">
                <strong>ตัวอย่าง</strong>
                <p>พิมพ์หรือวางข้อมูล รหัสผู้เรียน และ เกรด คั่นด้วย Tab หรือ Space</p>
                <p>C6600001 A</p>
                <p>C6600002 B</p>
                <p>C6600003 B+</p>
                <ol>
                  <li>วางข้อมูลในช่อง import หรืออัปโหลด CSV/TXT</li>
                  <li>กดปุ่ม <strong>ดูตัวอย่าง</strong> เพื่อตรวจสอบข้อมูล</li>
                  <li>เลือกหรือแก้ไข <strong>ผลการเรียน</strong> ในตารางตัวอย่าง</li>
                  <li>กดปุ่ม <strong>import</strong> เพื่อบันทึกลงระบบ</li>
                </ol>
              </div>
            </div>

            <div
              v-if="!approvalStatus && detailPreviewRows.length > 0"
              class="learning-result-detail-preview"
            >
              <div class="learning-result-detail-preview__header">
                <span class="text-positive">
                  พร้อม Import
                  {{ detailPreviewRows.filter((r) => r.matched && r.gradeItemId).length }} รายการ
                </span>
                <span
                  v-if="detailPreviewRows.filter((r) => !r.matched).length > 0"
                  class="text-negative"
                >
                  ไม่พบในระบบ {{ detailPreviewRows.filter((r) => !r.matched).length }} รายการ
                </span>
                <BaseButton
                  flat
                  no-caps
                  icon="close"
                  label="ยกเลิก"
                  color="grey-7"
                  style="margin-left: auto"
                  @click="detailPreviewRows = []"
                />
              </div>
              <div class="preview-bulk-bar">
                <div class="preview-bulk-bar__section">
                  <span class="preview-bulk-bar__label">ให้เกรดทั้งหมด</span>
                  <q-select
                    v-model="bulkGradeId"
                    :options="gradeItemOptions"
                    option-value="id"
                    option-label="name"
                    emit-value
                    map-options
                    dense
                    outlined
                    placeholder="เลือกเกรด"
                    class="preview-bulk-bar__select"
                  />
                  <BaseButton
                    unelevated
                    color="primary"
                    label="ใส่ทั้งหมด"
                    no-caps
                    :disable="!bulkGradeId"
                    class="preview-bulk-bar__btn"
                    @click="applyBulkGrade"
                  />
                </div>

                <div class="preview-bulk-bar__divider">หรือกำหนดเกณฑ์คะแนน</div>

                <div class="preview-bulk-bar__section preview-bulk-bar__section--rules">
                  <span class="preview-bulk-bar__hint"
                    >เกณฑ์ถูกตรวจจากบนลงล่าง เจอที่ตรงก่อนชนะ</span
                  >
                  <div v-for="(rule, i) in scoreRules" :key="i" class="preview-bulk-bar__rule">
                    <span class="preview-bulk-bar__label">คะแนน</span>
                    <q-select
                      v-model="rule.operator"
                      :options="operatorOptions"
                      option-value="value"
                      option-label="label"
                      emit-value
                      map-options
                      dense
                      outlined
                      class="preview-bulk-bar__operator"
                    />
                    <q-input
                      v-model.number="rule.minScore"
                      type="number"
                      dense
                      outlined
                      min="0"
                      max="100"
                      class="preview-bulk-bar__score-input"
                    />
                    <span class="preview-bulk-bar__label">→</span>
                    <q-select
                      v-model="rule.gradeItemId"
                      :options="gradeItemOptions"
                      option-value="id"
                      option-label="name"
                      emit-value
                      map-options
                      dense
                      outlined
                      placeholder="เกรด"
                      class="preview-bulk-bar__select"
                    />
                    <q-btn
                      flat
                      round
                      dense
                      icon="close"
                      color="grey-5"
                      @click="scoreRules.splice(i, 1)"
                    />
                  </div>
                  <div class="preview-bulk-bar__rule-actions">
                    <BaseButton
                      flat
                      color="primary"
                      icon="add"
                      label="เพิ่มเกณฑ์"
                      no-caps
                      class="preview-bulk-bar__btn"
                      @click="
                        scoreRules.push({ minScore: null, operator: '>=', gradeItemId: null })
                      "
                    />
                    <BaseButton
                      unelevated
                      color="primary"
                      icon="calculate"
                      label="คำนวณอัตโนมัติ"
                      no-caps
                      :disable="!scoreRules.some((r) => r.minScore !== null && r.gradeItemId)"
                      class="preview-bulk-bar__btn"
                      @click="applyScoreRules"
                    />
                    <BaseButton
                      flat
                      color="grey-7"
                      icon="clear_all"
                      label="ล้างทั้งหมด"
                      no-caps
                      class="preview-bulk-bar__btn"
                      style="margin-left: auto"
                      @click="clearAllGrades"
                    />
                  </div>
                </div>
              </div>

              <div class="learning-result-table-scroll">
                <table class="learning-result-entry-table">
                  <thead>
                    <tr>
                      <th style="width: 52px">ลำดับ</th>
                      <th style="width: 120px">รหัสผู้เรียน</th>
                      <th>ชื่อ-สกุล</th>
                      <th style="width: 110px">คะแนน LMS</th>
                      <th style="width: 100px">ค่าเดิม</th>
                      <th style="width: 200px">ผลการเรียน</th>
                      <th style="width: 80px">สถานะ</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(row, index) in detailPreviewRows"
                      :key="row.studentId + index"
                      :class="{ 'detail-row--unmatched': !row.matched }"
                    >
                      <td class="text-center">{{ index + 1 }}</td>
                      <td class="text-center">{{ row.studentId }}</td>
                      <td>{{ row.learnerName ?? '-' }}</td>
                      <td class="text-center">
                        {{ row.lmsFinalscore !== null ? row.lmsFinalscore.toFixed(2) : '—' }}
                      </td>
                      <td class="text-center">
                        <span v-if="row.currentGradeName" class="detail-grade-badge">
                          {{ row.currentGradeName }}
                        </span>
                        <span v-else class="detail-grade-dash">—</span>
                      </td>
                      <td>
                        <q-select
                          v-if="row.matched"
                          v-model="row.gradeItemId"
                          :options="gradeItemOptions"
                          option-value="id"
                          option-label="name"
                          emit-value
                          map-options
                          dense
                          outlined
                          placeholder="เลือกผลการเรียน"
                          class="detail-grade-select"
                        />
                        <span v-else class="detail-unmatched-label">ไม่พบในระบบ</span>
                      </td>
                      <td class="text-center">
                        <span
                          v-if="row.matched && row.gradeItemId"
                          class="detail-status detail-status--ready"
                          >พร้อม</span
                        >
                        <span v-else-if="row.matched" class="detail-status detail-status--pending"
                          >รอเกรด</span
                        >
                        <span v-else class="detail-status detail-status--error">ไม่พบ</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <BaseButton
                unelevated
                color="primary"
                icon="upload"
                label="import"
                no-caps
                class="learning-result-import-action-btn"
                :disable="!detailPreviewRows.some((r) => r.matched && r.gradeItemId)"
                @click="importLearningResults"
              />
            </div>

            <!-- Approval status banner -->
            <div v-if="approvalStatus" class="learning-result-approved-banner">
              <q-icon name="lock" color="positive" size="20px" />
              <div>
                <div class="text-weight-bold">
                  รายวิชานี้ได้บันทึกการอนุมัติเกรดแล้ว ไม่สามารถแก้ไขผลการเรียนได้
                </div>
                <div class="learning-result-approved-meta">
                  ผู้อนุมัติเกรด: {{ approvalStatus.approvedBy }} &nbsp;&nbsp; วันที่อนุมัติเกรด:
                  {{ formatBackendDateTime(approvalStatus.approvedAt) }}
                </div>
              </div>
            </div>

            <div class="learning-result-table-actions">
              <div class="learning-result-links">
                <button type="button" @click="exportLearnerListCsv(selectedCourse)">
                  ดาวน์โหลดรายชื่อผู้เรียน
                </button>
                <button type="button" @click="printGradeForm(selectedCourse)">
                  ดาวน์โหลดแบบฟอร์มใบส่งเกรด สำหรับเจ้าประชุมกรรมการประจำ
                </button>
                <button type="button" @click="printCbs003(selectedCourse)">
                  ดาวน์โหลด BUU-CBS 003 รายงานสรุปผลการจัดรายวิชา
                </button>
              </div>
              <div class="learning-result-sync-actions">
                <BaseButton
                  outline
                  color="primary"
                  icon="cloud_download"
                  label="ดึงคะแนนจาก LMS"
                  no-caps
                  :loading="syncingScores"
                  @click="pullScoresFromLms"
                />
                <BaseButton
                  outline
                  color="primary"
                  icon="refresh"
                  label="ดึงผลการเรียน"
                  no-caps
                  :loading="syncingResults"
                  @click="saveLearningResults"
                />
                <BaseButton
                  v-if="!approvalStatus"
                  unelevated
                  color="positive"
                  icon="how_to_reg"
                  label="บันทึกอนุมัติผลการเรียน"
                  no-caps
                  :loading="approvingGrades"
                  @click="openApproveDialog"
                />
              </div>
            </div>

            <div class="learning-result-table-scroll">
              <table class="learning-result-entry-table">
                <thead>
                  <tr>
                    <th>ลำดับ</th>
                    <th>รหัสผู้เรียน</th>
                    <th>ชื่อ-สกุล</th>
                    <th>คะแนนจาก LMS</th>
                    <th>ผลการเรียน</th>
                    <th>วันที่อัปเดต</th>
                    <th>รายละเอียด</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(learner, index) in learners" :key="learner.id">
                    <td class="text-center">{{ index + 1 }}</td>
                    <td class="text-center">{{ learner.studentId }}</td>
                    <td>{{ learner.name }}</td>
                    <td class="text-center">{{ getLearnerLmsScore(learner) }}</td>
                    <td class="text-center">{{ learner.importedGradeName ?? '' }}</td>
                    <td class="text-center">{{ getLearnerLmsUpdatedAt(learner) }}</td>
                    <td class="text-center">
                      <button
                        type="button"
                        class="learning-result-breakdown-btn"
                        @click="openGradePanel(learner)"
                      >
                        <q-icon name="assignment" size="13px" />
                        ดูรายละเอียด
                      </button>
                    </td>
                  </tr>
                  <tr v-if="learners.length === 0">
                    <td colspan="7" class="learning-result-empty-cell">
                      {{ emptyLearnerStateMessage }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>

        <template v-else>
          <q-tabs
            :model-value="activeStudentTab"
            dense
            align="left"
            active-color="primary"
            indicator-color="primary"
            class="student-roster-tabs"
            @update:model-value="switchTab"
          >
            <q-tab name="roster" icon="groups" label="รายชื่อผู้เรียน" no-caps />
            <q-tab name="results" icon="fact_check" label="บันทึกผลการเรียน" no-caps />
          </q-tabs>

          <div class="student-roster-filters row items-center q-gutter-md q-mb-md">
            <q-input
              v-model="searchQuery"
              placeholder="ค้นหาชื่อ หรือ รหัสนิสิต..."
              outlined
              dense
              bg-color="white"
              class="col-grow custom-filter-input"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
              <template v-slot:append v-if="searchQuery">
                <q-icon name="close" @click="searchQuery = ''" class="cursor-pointer" />
              </template>
            </q-input>

            <q-select
              v-model="statusFilter"
              :options="statusOptions"
              label="สถานะ"
              outlined
              dense
              bg-color="white"
              style="min-width: 160px"
              class="custom-filter-input"
              emit-value
              map-options
            />

            <q-space />

            <template v-if="activeStudentTab === 'roster'">
              <BaseButton
                outline
                color="primary"
                icon="table_view"
                label="CSV"
                no-caps
                class="student-export-btn"
                :disable="filteredLearners.length === 0"
                @click="exportLearnersCsv"
              />
              <BaseButton
                unelevated
                color="primary"
                icon="picture_as_pdf"
                label="PDF"
                no-caps
                class="student-export-btn student-export-btn--primary"
                :disable="filteredLearners.length === 0"
                @click="exportLearnersPdf"
              />
            </template>
            <BaseButton
              v-else
              unelevated
              color="primary"
              icon="save"
              label="บันทึกผลการเรียน"
              no-caps
              class="student-export-btn student-export-btn--primary"
              :disable="filteredLearners.length === 0"
              @click="saveLearningResults"
            />
          </div>

          <template v-if="activeStudentTab === 'roster'">
            <q-table
              v-if="filteredLearners.length > 0"
              flat
              :rows="filteredLearners"
              :columns="learnerColumns"
              row-key="id"
              :pagination="{ rowsPerPage: 10 }"
              class="student-roster-table"
              @row-click="openLearnerDetail"
            >
              <template #body-cell-name="props">
                <q-td :props="props">
                  <div class="student-name-cell">
                    <q-avatar size="36px">
                      <img :src="props.row.avatarUrl" :alt="props.row.name" />
                    </q-avatar>
                    <div>
                      <strong>{{ props.row.name }}</strong>
                      <span>{{ props.row.studentId }}</span>
                    </div>
                  </div>
                </q-td>
              </template>
              <template #body-cell-progress="props">
                <q-td :props="props">
                  <div class="student-progress-cell">
                    <q-linear-progress
                      rounded
                      size="8px"
                      :value="props.row.progress / 100"
                      color="primary"
                    />
                    <span>{{ props.row.progress }}%</span>
                  </div>
                </q-td>
              </template>
              <template #body-cell-status="props">
                <q-td :props="props">
                  <q-badge rounded :color="props.row.statusColor" :label="props.row.status" />
                </q-td>
              </template>
              <template #body-cell-actions="props">
                <q-td :props="props" class="text-right">
                  <q-btn
                    flat
                    round
                    dense
                    icon="visibility"
                    color="primary"
                    @click.stop="openLearnerDetail(null, props.row)"
                  />
                </q-td>
              </template>
            </q-table>
          </template>

          <q-table
            v-else-if="filteredLearners.length > 0"
            flat
            :rows="filteredLearners"
            :columns="learningResultColumns"
            row-key="id"
            :pagination="{ rowsPerPage: 10 }"
            class="student-roster-table"
          >
            <template #body-cell-name="props">
              <q-td :props="props">
                <div class="student-name-cell">
                  <q-avatar size="36px">
                    <img :src="props.row.avatarUrl" :alt="props.row.name" />
                  </q-avatar>
                  <div>
                    <strong>{{ props.row.name }}</strong>
                    <span>{{ props.row.studentId }}</span>
                  </div>
                </div>
              </q-td>
            </template>
            <template #body-cell-finalScore="props">
              <q-td :props="props">
                <q-input
                  v-model.number="props.row.finalScore"
                  type="number"
                  dense
                  outlined
                  min="0"
                  max="100"
                  suffix="/100"
                  class="student-result-score"
                />
              </q-td>
            </template>
            <template #body-cell-resultStatus="props">
              <q-td :props="props">
                <q-select
                  v-model="props.row.resultStatus"
                  :options="gradeItemOptions"
                  option-value="name"
                  option-label="name"
                  dense
                  outlined
                  emit-value
                  map-options
                  class="student-result-status"
                />
              </q-td>
            </template>
            <template #body-cell-note="props">
              <q-td :props="props">
                <q-input v-model="props.row.resultNote" dense outlined placeholder="หมายเหตุ" />
              </q-td>
            </template>
          </q-table>

          <div
            v-if="filteredLearners.length === 0"
            class="column items-center q-py-xl text-grey-5 border-dashed"
            style="border: 2px dashed rgba(0, 0, 0, 0.05); border-radius: 12px"
          >
            <q-icon name="search_off" size="3rem" class="q-mb-md" />
            <div class="text-body1">{{ emptyLearnerStateMessage }}</div>
            <BaseButton
              v-if="searchQuery || statusFilter !== 'ทั้งหมด'"
              flat
              no-caps
              label="ล้างการค้นหา"
              color="primary"
              class="q-mt-md"
              @click="clearFilters"
            />
          </div>
        </template>
      </section>
    </div>

    <q-dialog v-model="learnerDetailDialogOpen">
      <q-card class="student-detail-dialog" v-if="selectedLearner">
        <q-card-section class="student-detail-header">
          <q-avatar size="64px">
            <img :src="selectedLearner.avatarUrl" :alt="selectedLearner.name" />
          </q-avatar>
          <div>
            <div class="text-h6 text-weight-bold">{{ selectedLearner.name }}</div>
            <div class="text-body2 text-grey-7">
              {{ selectedLearner.studentId }} ยท {{ selectedLearner.email }}
            </div>
            <q-badge
              rounded
              class="q-mt-sm"
              :color="selectedLearner.statusColor"
              :label="selectedLearner.status"
            />
          </div>
          <q-space />
          <q-btn flat round dense icon="close" v-close-popup />
        </q-card-section>

        <q-separator />

        <q-card-section class="student-detail-stats">
          <div>
            <span>ความก้าวหน้า</span>
            <strong>{{ selectedLearner.progress }}%</strong>
            <q-linear-progress
              rounded
              size="8px"
              :value="selectedLearner.progress / 100"
              color="primary"
            />
          </div>
          <div>
            <span>คะแนนรวม</span>
            <strong>{{ selectedLearner.score }}</strong>
          </div>
          <div>
            <span>บทเรียนที่จบ</span>
            <strong
              >{{ selectedLearner.completedLessons }}/{{ selectedLearner.totalLessons }}</strong
            >
          </div>
          <div>
            <span>เข้าเรียนล่าสุด</span>
            <strong>{{ selectedLearner.lastActive }}</strong>
          </div>
        </q-card-section>

        <q-card-section class="student-detail-info">
          <div>
            <span>คณะ/หน่วยงาน</span><strong>{{ selectedLearner.faculty }}</strong>
          </div>
          <div>
            <span>สาขา</span><strong>{{ selectedLearner.department }}</strong>
          </div>
          <div>
            <span>เบอร์โทร</span><strong>{{ selectedLearner.phone }}</strong>
          </div>
          <div>
            <span>วันที่ลงทะเบียน</span><strong>{{ selectedLearner.enrolledAt }}</strong>
          </div>
          <div>
            <span>สถานะชำระเงิน</span><strong>{{ selectedLearner.paymentStatus }}</strong>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>
    <!-- ─── GRADE BREAKDOWN PANEL ─── -->
    <Teleport to="body">
      <div v-if="panelOpen" class="student-grade-panel-overlay" @click="closeGradePanel" />
      <transition name="student-panel-slide">
        <div v-if="panelOpen" class="student-grade-panel">
          <div class="student-grade-panel__header">
            <div>
              <p class="student-grade-panel__eyebrow">Grade Breakdown</p>
              <h3 class="student-grade-panel__title">{{ panelRow?.name }}</h3>
              <span class="student-grade-panel__sub">{{ panelRow?.studentId }}</span>
            </div>
            <button class="student-grade-panel__close" aria-label="ปิด" @click="closeGradePanel">
              <q-icon name="close" size="20px" />
            </button>
          </div>

          <div class="student-grade-panel__total">
            <span class="student-grade-panel__total-label">คะแนนรวม</span>
            <span class="student-grade-panel__total-value">
              {{ panelRow?.lmsFinalscore ?? '—' }}
              <span v-if="panelRow?.lmsFinalscore !== null"> / 100</span>
            </span>
            <span v-if="panelRow?.importedGradeName" class="student-grade-panel__grade-badge">
              {{ panelRow.importedGradeName }}
            </span>
          </div>

          <div class="student-grade-panel__body">
            <div v-if="!panelRow?.gradeItems.length" class="student-grade-panel__empty">
              ยังไม่มีข้อมูลคะแนนรายงาน
            </div>
            <div
              v-for="item in panelRow?.gradeItems"
              :key="`${item.itemmodule}:${item.itemname}`"
              class="student-grade-panel__item"
            >
              <div class="student-grade-panel__item-left">
                <span
                  class="student-grade-panel__module-badge"
                  :class="`student-grade-panel__module-badge--${item.itemmodule ?? 'mod'}`"
                >
                  {{
                    item.itemmodule === 'assign'
                      ? 'งาน'
                      : item.itemmodule === 'quiz'
                        ? 'แบบทดสอบ'
                        : (item.itemmodule ?? 'งาน')
                  }}
                </span>
                <span class="student-grade-panel__item-name">{{ item.itemname ?? '—' }}</span>
              </div>
              <div class="student-grade-panel__item-right">
                <span v-if="item.score !== null" class="student-grade-panel__score">
                  {{ item.score }}
                  <span class="student-grade-panel__score-max">/ {{ item.maxScore ?? 100 }}</span>
                </span>
                <span v-else class="student-grade-panel__no-score">—</span>
                <a
                  v-if="
                    item.itemmodule === 'assign' &&
                    moodleGraderUrl(item.cmid, panelRow?.moodleUserId ?? null)
                  "
                  :href="moodleGraderUrl(item.cmid, panelRow?.moodleUserId ?? null)!"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="student-grade-panel__grade-link"
                >
                  <q-icon name="rate_review" size="13px" />
                  ตรวจงาน
                </a>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Approve Grades Dialog -->
    <q-dialog v-model="approveDialogOpen" transition-show="scale" transition-hide="scale">
      <q-card style="min-width: 420px; border-radius: 12px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-subtitle1 text-weight-bold">บันทึกอนุมัติผลการเรียน</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>
        <q-card-section class="q-gutter-y-sm">
          <div>
            <div class="text-caption text-grey-7 q-mb-xs">อนุมัติการเรียน</div>
            <q-option-group
              v-model="approveForm.mode"
              :options="[
                { label: 'อนุมัติ', value: 'specify' },
                { label: 'ไม่อนุมัติ', value: 'none' },
              ]"
              color="primary"
              inline
              dense
            />
          </div>
          <q-input
            v-model="approveForm.detail"
            type="textarea"
            outlined
            dense
            rows="3"
            label="รายละเอียดการประชุมอนุมัติผลการเรียน"
            :disable="approveForm.mode === 'none'"
          />
          <BaseDateInput
            v-model="approveForm.date"
            value-format="YYYY-MM-DD"
            label="วันที่อนุมัติ"
          />
        </q-card-section>
        <q-card-actions align="right" class="q-px-md q-pb-md">
          <BaseButton flat label="ยกเลิก" no-caps color="grey-7" v-close-popup />
          <BaseButton
            unelevated
            color="primary"
            label="บันทึก"
            no-caps
            :loading="approvingGrades"
            @click="confirmApproveGrades"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';
import { getCourseStructure } from 'src/data/course-structure';
import { useInstructorBackend } from 'src/composables/use-instructor-backend';
import type { GradeItemBreakdown } from 'src/composables/use-instructor-backend';
import { api } from 'src/boot/axios';
import type { Course } from 'src/types/course';
import buuLogoUrl from 'src/assets/buu-logo-receipt.png';
import BaseDateInput from 'src/components/base/BaseDateInput.vue';
import BaseButton from 'src/components/base/BaseButton.vue';

interface LearnerRow {
  id: string;
  studentId: string;
  name: string;
  email: string;
  avatarUrl: string;
  faculty: string;
  department: string;
  phone: string;
  progress: number;
  lastActive: string;
  score: string;
  status: string;
  statusColor: string;
  enrolledAt: string;
  paymentStatus: string;
  completedLessons: number;
  totalLessons: number;
  finalScore: number;
  resultStatus: string;
  resultNote: string;
  importedGradeName: string | null;
  lmsFinalscore: number | null;
  lmsSyncedAt: string | null;
  moodleUserId: number | null;
  gradeItems: GradeItemBreakdown[];
}

interface ImportedLearningResult {
  grade: string;
  score: number;
  status: string;
}

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const courseStore = useCourseStore();
const instructorBackend = useInstructorBackend();
courseStore.init();

const selectedCourseId = ref(typeof route.query.courseId === 'string' ? route.query.courseId : '');
const activeStudentTab = computed<'roster' | 'results'>(() =>
  route.path.includes('/instructor/results') ? 'results' : 'roster',
);
const learnerDetailDialogOpen = ref(false);
const selectedLearner = ref<LearnerRow | null>(null);
const searchQuery = ref('');
const statusFilter = ref('ทั้งหมด');
const resultImportText = ref('');
const gradeImportFileInput = ref<HTMLInputElement | null>(null);
const importedLearningResults = ref<Record<string, ImportedLearningResult>>({});
const pendingLearningResults = ref<Record<string, ImportedLearningResult>>({});
const gradeItemOptions = ref<Array<{ id: number; name: string }>>([]);
const savingGrades = ref(false);
const syncingScores = ref(false);
const syncingResults = ref(false);
const approvingGrades = ref(false);
const approveDialogOpen = ref(false);
const approveForm = ref({
  mode: 'specify',
  detail: '',
  date: new Date().toISOString().slice(0, 10),
});
const approvalStatus = ref<{ approvedBy: string; approvedAt: string } | null>(null);
const panelOpen = ref(false);
const panelRow = ref<LearnerRow | null>(null);

const MOODLE_BASE_URL =
  (import.meta.env.VITE_MOODLE_URL as string | undefined) ?? 'http://localhost:8080';

interface DetailPreviewRow {
  studentId: string;
  gradeText: string;
  gradeItemId: number | null;
  currentGradeName: string | null;
  learnerName: string | null;
  lmsFinalscore: number | null;
  matched: boolean;
}

type ScoreOperator = '>=' | '>' | '<=' | '<' | '=';

interface ScoreRule {
  minScore: number | null;
  operator: ScoreOperator;
  gradeItemId: number | null;
}

const operatorOptions: { label: string; value: ScoreOperator }[] = [
  { label: '≥', value: '>=' },
  { label: '>', value: '>' },
  { label: '≤', value: '<=' },
  { label: '<', value: '<' },
  { label: '=', value: '=' },
];

const detailPreviewRows = ref<DetailPreviewRow[]>([]);
const bulkGradeId = ref<number | null>(null);
const scoreRules = ref<ScoreRule[]>([{ minScore: null, operator: '>=', gradeItemId: null }]);

const statusOptions = ['ทั้งหมด', 'เรียนต่อเนื่อง', 'ปกติ', 'ควรติดตาม', 'เสี่ยงหลุด'];

watch(
  () => route.query.courseId,
  (courseId) => {
    selectedCourseId.value = typeof courseId === 'string' ? courseId : '';
  },
);

const instructorCourses = computed<Course[]>(() =>
  [...courseStore.getInstructorCourses(authStore.user)].sort((left, right) => {
    if (right.enrolledCount !== left.enrolledCount) {
      return right.enrolledCount - left.enrolledCount;
    }
    return left.code.localeCompare(right.code);
  }),
);
const selectedCourse = computed<Course | undefined>(() =>
  instructorCourses.value.find((course) => course.id === selectedCourseId.value),
);

function clearAllGrades(): void {
  for (const row of detailPreviewRows.value) {
    row.gradeItemId = null;
  }
}

function applyBulkGrade(): void {
  if (!bulkGradeId.value) return;
  for (const row of detailPreviewRows.value) {
    if (row.matched) row.gradeItemId = bulkGradeId.value;
  }
}

function applyScoreRules(): void {
  const valid = scoreRules.value.filter((r) => r.minScore !== null && r.gradeItemId !== null);
  if (valid.length === 0) return;
  for (const row of detailPreviewRows.value) {
    if (!row.matched || row.lmsFinalscore === null) continue;
    const score = row.lmsFinalscore;
    const matched = valid.find((r) => {
      const t = r.minScore!;
      switch (r.operator) {
        case '>=':
          return score >= t;
        case '>':
          return score > t;
        case '<=':
          return score <= t;
        case '<':
          return score < t;
        case '=':
          return score === t;
      }
    });
    if (matched) row.gradeItemId = matched.gradeItemId;
  }
}

function buildDetailPreview(): void {
  if (!resultImportText.value.trim() || !selectedCourse.value) {
    detailPreviewRows.value = [];
    return;
  }
  const course = selectedCourse.value;
  const courseKey = String(course.id).startsWith('db-') ? course.id : `db-${course.id}`;
  const grades = instructorBackend.gradesByCourseId.value[courseKey] ?? [];
  const lines = resultImportText.value
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  detailPreviewRows.value = lines.map((line) => {
    const parts = line.split(/[,\t ]+/).filter(Boolean);
    const studentId = parts[0] ?? '';
    const gradeText = parts.slice(1).join(' ').trim();
    const learner = learners.value.find((l) => l.studentId === studentId);
    const gradeData = grades.find((g) => g.studentId === studentId);
    const matchedItem = gradeItemOptions.value.find(
      (opt) => opt.name.toLowerCase() === gradeText.toLowerCase(),
    );
    return {
      studentId,
      gradeText,
      gradeItemId: matchedItem?.id ?? null,
      currentGradeName: gradeData?.importedGradeName ?? null,
      learnerName: learner?.name ?? null,
      lmsFinalscore: gradeData?.lmsFinalscore != null ? Number(gradeData.lmsFinalscore) : null,
      matched: !!learner,
    };
  });
}

onMounted(async () => {
  const email = authStore.user?.email;
  if (email) {
    void courseStore.fetchInstructorCourses(email);
  }
  try {
    const { data } = await api.get<Array<{ id: number; name: string }>>(
      '/api/instructor/grade-items',
    );
    gradeItemOptions.value = data;
  } catch {
    // grade items not critical
  }
});

watch(
  selectedCourse,
  async (course) => {
    const email = authStore.user?.email;
    approvalStatus.value = null;
    if (!course || !email) return;
    void instructorBackend.fetchLearners(email, course.id, course.moodleId ?? null);
    void instructorBackend.fetchGrades(email, course.id);
    const numericId = String(course.id).replace(/^db-/, '');
    try {
      const { data } = await api.get<{
        approved: boolean;
        approvedBy: string | null;
        approvedAt: string | null;
        detail: string | null;
      }>(`/api/instructor/courses/${numericId}/approval-status?email=${encodeURIComponent(email)}`);
      if (data.approved) {
        approvalStatus.value = {
          approvedBy: data.approvedBy ?? '',
          approvedAt: data.approvedAt ?? '',
        };
      }
    } catch {
      // non-critical
    }
  },
  { immediate: true },
);

function getLearnerStatus(progress: number): Pick<LearnerRow, 'status' | 'statusColor'> {
  if (progress >= 85) return { status: 'เรียนต่อเนื่อง', statusColor: 'positive' };
  if (progress >= 60) return { status: 'ปกติ', statusColor: 'primary' };
  if (progress >= 35) return { status: 'ควรติดตาม', statusColor: 'warning' };
  return { status: 'รอข้อมูลความคืบหน้า', statusColor: 'grey-7' };
}

function formatBackendDate(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function formatBackendDateTime(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(date);
}

function formatPaymentStatus(value: string | null | undefined, isFree: boolean): string {
  if (isFree) return 'ไม่มีค่าใช้จ่าย';
  if (value === 'Y') return 'ชำระแล้ว';
  if (value === 'N') return 'ยังไม่ชำระ';
  return value || '-';
}

function getResultStatusFromGrade(importedGradeName: string | null | undefined): string {
  if (!importedGradeName) return 'ไม่ผ่าน';
  const name = importedGradeName.trim().toLowerCase();
  if (name === 'f' || name === 'ไม่ผ่าน') return 'ไม่ผ่าน';
  return 'ผ่าน';
}

function buildLearnersForCourse(course: Course | undefined): LearnerRow[] {
  if (!course) return [];

  const courseKey = String(course.id).startsWith('db-') ? course.id : `db-${course.id}`;
  const backendLearners = instructorBackend.learnersByCourseId.value[courseKey] ?? [];
  const backendGrades = instructorBackend.gradesByCourseId.value[courseKey] ?? [];
  const totalLessons =
    getCourseStructure(course.id).reduce((sum, module) => sum + module.lessons.length, 0) || 0;

  return backendLearners.map((learner) => {
    const grade = backendGrades.find(
      (candidate) =>
        candidate.learnerUserId === learner.userId || candidate.studentId === learner.studentId,
    );
    const importedResult = importedLearningResults.value[learner.studentId];
    const score = importedResult?.score ?? grade?.score ?? 0;
    const importedGradeName = grade?.importedGradeName ?? null;
    const resultStatus = getResultStatusFromGrade(importedGradeName);
    const progress = grade?.status === 'passed' ? 100 : 0;
    const status = getLearnerStatus(progress);

    return {
      id: `${course.id}-${learner.userId}`,
      studentId: learner.studentId,
      name: learner.fullName,
      email: learner.email ?? '-',
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(`${course.id}-${learner.userId}`)}`,
      faculty: '-',
      department: '-',
      phone: learner.phone ?? '-',
      progress,
      lastActive: grade?.updatedAt ? formatBackendDate(grade.updatedAt) : '-',
      score:
        grade?.score === null || grade?.score === undefined
          ? 'ยังไม่มีคะแนน'
          : `${grade.score}/${grade.maxScore ?? 100}`,
      ...status,
      enrolledAt: formatBackendDate(learner.enrolledAt),
      paymentStatus: formatPaymentStatus(learner.paymentStatus, course.isFree),
      completedLessons: progress === 100 ? totalLessons : 0,
      totalLessons,
      finalScore: score,
      resultStatus,
      resultNote: importedResult ? `นำเข้าเกรด ${importedResult.grade}` : (grade?.grade ?? ''),
      importedGradeName,
      lmsFinalscore: grade?.lmsFinalscore != null ? Number(grade.lmsFinalscore) : null,
      lmsSyncedAt: grade?.lmsSyncedAt ? formatBackendDate(grade.lmsSyncedAt) : null,
      moodleUserId: grade?.moodleUserId ?? null,
      gradeItems: grade?.gradeItems ?? [],
    };
  });
}
const learners = computed<LearnerRow[]>(() => buildLearnersForCourse(selectedCourse.value));
const displayedEnrolledCount = computed(() =>
  Math.max(selectedCourse.value?.enrolledCount ?? 0, learners.value.length),
);
const averageProgress = computed(() => {
  if (learners.value.length === 0) return 0;
  const total = learners.value.reduce((sum, learner) => sum + learner.progress, 0);
  return Math.round(total / learners.value.length);
});

const filteredLearners = computed(() => {
  let result = learners.value;

  if (statusFilter.value && statusFilter.value !== 'ทั้งหมด') {
    result = result.filter((l) => l.status === statusFilter.value);
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(
      (l) => l.name.toLowerCase().includes(query) || l.studentId.toLowerCase().includes(query),
    );
  }

  return result;
});

const emptyLearnerStateMessage = computed(() => {
  if (searchQuery.value || statusFilter.value !== 'ทั้งหมด') {
    return 'ไม่พบรายชื่อนิสิตที่ตรงกับการค้นหา';
  }

  return 'รายวิชานี้ยังไม่มีผู้ลงทะเบียนในฐานข้อมูล';
});

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatCourseDateRange(course: Course): string {
  return `${course.registrationStart} - ${course.registrationEnd}`;
}

function getCourseResultLearners(course: Course): LearnerRow[] {
  return buildLearnersForCourse(course);
}

function getCoursePassedCount(course: Course): number {
  return getCourseResultLearners(course).filter((learner) => learner.resultStatus === 'ผ่าน')
    .length;
}

function getCourseFailedCount(course: Course): number {
  return getCourseResultLearners(course).filter((learner) => learner.resultStatus === 'ไม่ผ่าน')
    .length;
}

function getLearningResultDownloadCode(): string {
  return 'CBS 003';
}

const learnerColumns: QTableColumn<LearnerRow>[] = [
  { name: 'name', label: 'นิสิต', field: 'name', align: 'left', sortable: true },
  { name: 'email', label: 'อีเมล', field: 'email', align: 'left' },
  { name: 'progress', label: 'ความก้าวหน้า', field: 'progress', align: 'left', sortable: true },
  { name: 'score', label: 'คะแนน', field: 'score', align: 'left' },
  { name: 'lastActive', label: 'เข้าเรียนล่าสุด', field: 'lastActive', align: 'left' },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'left' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
];

const learningResultColumns: QTableColumn<LearnerRow>[] = [
  { name: 'name', label: 'ผู้เรียน', field: 'name', align: 'left', sortable: true },
  {
    name: 'progress',
    label: 'ความก้าวหน้า',
    field: 'progress',
    align: 'left',
    sortable: true,
    format: (value) => `${value}%`,
  },
  { name: 'score', label: 'คะแนนปัจจุบัน', field: 'score', align: 'left' },
  {
    name: 'finalScore',
    label: 'คะแนนผลการเรียน',
    field: 'finalScore',
    align: 'left',
    sortable: true,
  },
  { name: 'resultStatus', label: 'ผลการเรียน', field: 'resultStatus', align: 'left' },
  { name: 'note', label: 'หมายเหตุ', field: 'resultNote', align: 'left' },
];

function switchTab(tab: string): void {
  const base = tab === 'results' ? '/instructor/results' : '/instructor/students';
  void router.push({
    path: base,
    query: selectedCourseId.value ? { courseId: selectedCourseId.value } : {},
  });
}

function selectCourse(courseId: string): void {
  selectedCourseId.value = courseId;
  selectedLearner.value = null;
  void router.push({
    query: { courseId },
  });
}

function clearSelectedCourse(): void {
  selectedCourseId.value = '';
  selectedLearner.value = null;
  clearFilters();
  const nextQuery = { ...route.query };
  delete nextQuery.courseId;
  void router.replace({ query: nextQuery });
}

function clearFilters(): void {
  searchQuery.value = '';
  statusFilter.value = 'ทั้งหมด';
}

function openLearnerDetail(_event: Event | null, learner: LearnerRow): void {
  selectedLearner.value = learner;
  learnerDetailDialogOpen.value = true;
}

function openGradePanel(learner: LearnerRow): void {
  panelRow.value = learner;
  panelOpen.value = true;
}

function closeGradePanel(): void {
  panelOpen.value = false;
}

function moodleGraderUrl(cmid: number | null, moodleUserId: number | null): string | null {
  if (!cmid || !moodleUserId) return null;
  return `${MOODLE_BASE_URL}/mod/assign/view.php?id=${cmid}&action=grader&userid=${moodleUserId}`;
}

async function saveLearningResults(): Promise<void> {
  const course = selectedCourse.value;
  const email = authStore.user?.email;
  if (!course || !email) return;
  syncingResults.value = true;
  try {
    await instructorBackend.fetchGrades(email, course.id);
    $q.notify({
      type: 'positive',
      icon: 'refresh',
      message: 'อัปเดตผลการเรียนแล้ว',
    });
  } finally {
    syncingResults.value = false;
  }
}

async function importLearningResults(): Promise<void> {
  const readyRows = detailPreviewRows.value.filter(
    (row) => row.matched && row.gradeItemId !== null,
  );

  if (readyRows.length === 0) {
    $q.notify({
      type: 'warning',
      icon: 'error',
      message: 'ยังไม่มีข้อมูลที่นำเข้าได้ กรุณาตรวจสอบรหัสผู้เรียนและเลือกผลการเรียน',
    });
    return;
  }

  const course = selectedCourse.value;
  const email = authStore.user?.email;
  if (!course || !email) return;

  const items = readyRows.map((row) => ({
    userCode: row.studentId,
    gradeText: row.gradeText,
    gradeItemId: row.gradeItemId as number,
  }));

  savingGrades.value = true;
  try {
    const result = await instructorBackend.importGrades(email, course.id, items);
    if (result) {
      resultImportText.value = '';
      detailPreviewRows.value = [];
      if (result.saved > 0) {
        $q.notify({
          type: 'positive',
          icon: 'upload_file',
          message: `บันทึกผลการเรียน ${result.saved.toLocaleString('th-TH')} รายการแล้ว`,
        });
      }
      if (result.failed > 0) {
        $q.notify({
          type: 'warning',
          message: `ไม่สำเร็จ ${result.failed} รายการ: ${result.errors.map((e) => e.userCode).join(', ')}`,
          timeout: 6000,
        });
      }
      await instructorBackend.fetchGrades(email, course.id);
    }
  } finally {
    savingGrades.value = false;
  }
}

function triggerGradeImportFile(): void {
  gradeImportFileInput.value?.click();
}

function onGradeImportFileSelected(event: Event): void {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    resultImportText.value = typeof reader.result === 'string' ? reader.result : '';
    input.value = '';
  };
  reader.readAsText(file, 'utf-8');
}

function downloadGradeImportTemplate(): void {
  const rows = learners.value.map((learner) => [learner.studentId, 'A']);
  const csvRows = [['รหัสผู้เรียน', 'เกรด'], ...rows]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\r\n');
  const blob = new Blob([`\uFEFF${csvRows}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFileName(`${selectedCourse.value?.code ?? 'course'}-grade-template`)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function fillAllStudents(): void {
  resultImportText.value = learners.value.map((l) => l.studentId).join('\n');
}

function fillStudentsWithoutGrade(): void {
  resultImportText.value = learners.value
    .filter((l) => !l.importedGradeName)
    .map((l) => l.studentId)
    .join('\n');
}

async function pullScoresFromLms(): Promise<void> {
  const course = selectedCourse.value;
  const email = authStore.user?.email;
  if (!course || !email) return;

  syncingScores.value = true;
  try {
    const result = await instructorBackend.syncScores(email, course.id);
    if (result) {
      $q.notify({
        type: 'info',
        icon: 'cloud_download',
        message: `ดึงคะแนนจาก LMS แล้ว ${result.synced} รายการ`,
      });
      await instructorBackend.fetchGrades(email, course.id);
    }
  } finally {
    syncingScores.value = false;
  }
}

function openApproveDialog(): void {
  approveForm.value = {
    mode: 'specify',
    detail: '',
    date: new Date().toISOString().slice(0, 10),
  };
  approveDialogOpen.value = true;
}

async function confirmApproveGrades(): Promise<void> {
  const course = selectedCourse.value;
  const email = authStore.user?.email;
  if (!course || !email) return;

  const detail = approveForm.value.mode === 'none' ? 'ไม่อนุมัติ' : approveForm.value.detail.trim();

  approvingGrades.value = true;
  try {
    const numericId = String(course.id).replace(/^db-/, '');
    const { data } = await api.patch<{
      approved: number;
      skipped: number;
      approvedBy: string;
      approvedAt: string;
    }>(`/api/instructor/courses/${numericId}/approve-grades?email=${encodeURIComponent(email)}`, {
      approveDetail: detail,
      approveDate: approveForm.value.date,
    });
    approvalStatus.value = { approvedBy: data.approvedBy, approvedAt: data.approvedAt };
    approveDialogOpen.value = false;
    $q.notify({
      type: 'positive',
      icon: 'how_to_reg',
      message: `อนุมัติผลการเรียนแล้ว ${data.approved} ราย`,
    });
    await instructorBackend.fetchGrades(email, course.id);
  } catch (err) {
    const msg =
      (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'เกิดข้อผิดพลาดในการอนุมัติ';
    console.error('approveGrades error:', err);
    $q.notify({ type: 'negative', icon: 'error', message: msg });
  } finally {
    approvingGrades.value = false;
  }
}

function getLearnerLmsScore(learner: LearnerRow): string {
  if (learner.lmsFinalscore !== null) return Number(learner.lmsFinalscore).toFixed(2);
  const pendingResult = pendingLearningResults.value[learner.studentId];
  const savedResult = importedLearningResults.value[learner.studentId];
  const score = pendingResult?.score ?? savedResult?.score;
  return score === undefined ? '' : score.toFixed(2);
}

function getLearnerLmsUpdatedAt(learner: LearnerRow): string {
  return learner.lmsSyncedAt ?? '';
}

function exportLearnerListCsv(course: Course | undefined): void {
  if (!course) return;
  const learnerList = getCourseResultLearners(course);
  const headers = [
    'ลำดับ',
    'รหัสผู้เรียน',
    'ชื่อ-นามสกุล',
    'อีเมล',
    'สถานะการชำระเงิน',
    'วันที่ลงทะเบียน',
  ];
  const rows = learnerList.map((learner, index) => [
    index + 1,
    learner.studentId,
    learner.name,
    learner.email,
    learner.paymentStatus,
    learner.enrolledAt,
  ]);
  const csvRows = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csvRows}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFileName(`รายชื่อผู้เรียน-${course.code}`)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

async function printGradeForm(course: Course | undefined): Promise<void> {
  if (!course) return;
  const email = authStore.user?.email ?? '';
  let instructorPrefix = '';
  let instructorName = '';
  try {
    const { data } = await api.get<{
      prefix: string | null;
      firstNameTh: string | null;
      lastNameTh: string | null;
    }>(`/api/instructor/profile?email=${encodeURIComponent(email)}`);
    instructorPrefix = data.prefix ?? '';
    instructorName = `${data.firstNameTh ?? ''} ${data.lastNameTh ?? ''}`.trim();
  } catch {
    instructorName = authStore.user?.email ?? '';
  }
  const learnerList = getCourseResultLearners(course);
  const printDate = new Date().toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const tableRows = learnerList
    .map(
      (learner, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${learner.studentId}</td>
      <td>${learner.name}</td>
      <td>${learner.lmsFinalscore !== null ? Number(learner.lmsFinalscore).toFixed(2) : ''}</td>
      <td>${learner.importedGradeName ?? ''}</td>
    </tr>`,
    )
    .join('');

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8"/>
<title>ใบส่งเกรด ${course.code}</title>
<style>
  body { font-family: 'Sarabun', sans-serif; font-size: 14px; margin: 40px; color: #000; }
  .header { display: flex; align-items: center; gap: 16px; margin-bottom: 20px; }
  .header img { width: 64px; height: 64px; object-fit: contain; }
  .header-title h1 { font-size: 18px; font-weight: bold; margin: 0; }
  .header-title p { margin: 0; font-size: 13px; }
  .meta { margin-bottom: 16px; line-height: 2; }
  table { width: 100%; border-collapse: collapse; margin-top: 12px; }
  th, td { border: 1px solid #000; padding: 6px 10px; text-align: left; }
  th { background: #f0f0f0; text-align: center; }
  td:first-child, td:nth-child(4), td:nth-child(5) { text-align: center; }
  .footer { margin-top: 60px; display: flex; justify-content: space-between; }
  .sig { text-align: center; }
  .sig-line { border-top: 1px solid #000; width: 200px; margin: 0 auto 4px; }
  .print-date { margin-top: 8px; font-size: 12px; text-align: right; }
  @media print { body { margin: 20px; } }
</style>
</head>
<body>
<div class="header">
  <img src="${window.location.origin}${buuLogoUrl}" alt="BUU Logo"/>
  <div class="header-title">
    <h1>มหาวิทยาลัยบูรพา</h1>
    <p>ใบส่งเกรด ระบบคลังหน่วยกิต</p>
  </div>
</div>
<div class="meta">
  <div><strong>รายวิชา</strong> ${course.code} : ${course.title}</div>
  <div><strong>ผู้สอน</strong> ${[instructorPrefix, instructorName].filter(Boolean).join(' ') || '-'}</div>
  <div><strong>การเรียนการสอน</strong> ${course.registrationStart ?? ''} - ${course.registrationEnd ?? ''}</div>
</div>
<table>
  <thead>
    <tr>
      <th>ลำดับ</th>
      <th>รหัสผู้เรียน</th>
      <th>ชื่อ-สกุล</th>
      <th>คะแนน</th>
      <th>ผลการเรียน</th>
    </tr>
  </thead>
  <tbody>${tableRows}</tbody>
</table>
<div class="footer">
  <div class="sig">
    <div class="sig-line"></div>
    <div>(${[instructorPrefix, instructorName].filter(Boolean).join(' ') || '................................'})</div>
    <div>__/__/__</div>
  </div>
  <div class="sig">
    <div class="sig-line"></div>
    <div>คณบดี</div>
    <div>__/__/__</div>
  </div>
</div>
<div class="print-date">วันที่พิมพ์ : ${printDate} Page 1/1</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

async function printCbs003(course: Course | undefined): Promise<void> {
  if (!course) return;
  const email = authStore.user?.email ?? '';
  let instructorName = '';
  let instructorPrefix = '';
  try {
    const { data } = await api.get<{
      prefix: string | null;
      firstNameTh: string | null;
      lastNameTh: string | null;
    }>(`/api/instructor/profile?email=${encodeURIComponent(email)}`);
    instructorPrefix = data.prefix ?? '';
    instructorName = `${data.firstNameTh ?? ''} ${data.lastNameTh ?? ''}`.trim();
  } catch {
    instructorName = email;
  }

  // Ensure data is loaded before printing
  const courseKey = String(course.id).startsWith('db-') ? course.id : `db-${course.id}`;
  if (!instructorBackend.learnersByCourseId.value[courseKey]) {
    await instructorBackend.fetchLearners(email, course.id, course.moodleId ?? null);
    await instructorBackend.fetchGrades(email, course.id);
  }

  const learnerList = getCourseResultLearners(course);
  const passed = learnerList.filter((l) => l.resultStatus === 'ผ่าน').length;
  const failed = learnerList.filter((l) => l.resultStatus === 'ไม่ผ่าน').length;
  const noGrade = learnerList.filter((l) => !l.importedGradeName).length;
  const printDate = new Date().toLocaleString('th-TH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  const learnerRows = learnerList
    .map(
      (learner, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${learner.studentId}</td>
      <td>${learner.name}</td>
      <td>${learner.lmsFinalscore !== null ? Number(learner.lmsFinalscore).toFixed(2) : ''}</td>
      <td>${learner.importedGradeName ?? ''}</td>
    </tr>`,
    )
    .join('');

  const instructorFullName = [instructorPrefix, instructorName].filter(Boolean).join(' ');
  const totalEnrolled = learnerList.length;
  const maxSeats = course.enrolledCount ?? totalEnrolled;

  const html = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="UTF-8"/>
<title>BUU-CBS 003 ${course.code}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Sarabun', sans-serif; font-size: 14px; margin: 0; padding: 0; color: #000; line-height: 1.8; }
  .wrap { width: 160mm; margin: 0 auto; padding: 15mm 0; }
  .header-box { border: 1px solid #000; padding: 4px 12px; float: right; font-size: 13px; font-weight: bold; }
  .title-block { text-align: center; margin: 16px 0 24px; clear: both; }
  .title-block p { margin: 2px 0; font-size: 15px; font-weight: bold; }
  .sub { margin-left: 24px; margin-bottom: 2px; }
  .sub2 { margin-left: 48px; margin-bottom: 2px; }
  table { width: 100%; border-collapse: collapse; margin: 6px 0 12px; font-size: 13px; }
  tr { page-break-inside: avoid; }
  th, td { border: 1px solid #000; padding: 5px 8px; text-align: left; }
  th { background: #f5f5f5; text-align: center; font-weight: bold; }
  td.center { text-align: center; }
  .no-data td { text-align: center; color: #666; }
  .print-date { margin-top: 24px; font-size: 11px; text-align: right; color: #666; }
  @media print {
    @page { margin: 15mm 25mm; size: A4; }
    .wrap { width: 100%; padding: 0; }
  }
</style>
</head>
<body>
<div class="wrap">
<div class="header-box">BUU-CBS 003</div>
<div style="clear:both"></div>
<div class="title-block">
  <p>แบบฟอร์ม</p>
  <p>รายงานสรุปผลการจัดรายวิชา/ ชุดวิชา เพื่อสะสมในระบบคลังหน่วยกิต</p>
  <p>มหาวิทยาลัยบูรพา</p>
</div>

<p><strong>1. ข้อมูลทั่วไป</strong></p>
<div class="sub">1.1 ชื่อรายวิชา/ ชุดวิชา:&nbsp;&nbsp; ภาษาไทย ${course.title ?? ''}</div>
<div class="sub2">ภาษาอังกฤษ ${course.titleEn ?? '-'}</div>
<div class="sub">1.2 จำนวน ${course.totalHours ?? '-'} หน่วยกิต</div>
<div class="sub">1.3 ชื่อหลักสูตรที่ส่งสะสมหน่วยกิต
  <table>
    <thead><tr><th>ลำดับ</th><th>ชื่อรายวิชา</th><th>หลักสูตร</th><th>หน่วยกิต</th><th>จำนวนหน่วยกิตที่สะสม</th></tr></thead>
    <tbody><tr class="no-data"><td colspan="5">ไม่พบข้อมูล</td></tr></tbody>
  </table>
</div>
<div class="sub">1.4 ชื่อส่วนงานที่รับผิดชอบ ${course.faculty ?? '-'}</div>
<div class="sub">1.5 ชื่อส่วนงานหรือสถานประกอบการที่ร่วมจัดการเรียนการสอน (ถ้ามี และสามารถจัดร่วม มากกว่า 1 ส่วนงานได้)
  <div class="sub">1.5.1 ชื่อส่วนงานที่ร่วมจัดการเรียนการสอน -</div>
  <div class="sub">1.5.2 ชื่อสถานประกอบการที่ร่วมจัดการเรียนการสอน -</div>
</div>
<div class="sub">1.6 อาจารย์ผู้รับผิดชอบรายวิชา/ ชุดวิชา (ชื่อ-สกุล)
  <table>
    <thead><tr><th>ลำดับ</th><th>ชื่อ -สกุล</th><th>อีเมล</th><th>เบอร์โทรศัพท์</th></tr></thead>
    <tbody><tr><td class="center">1</td><td>${instructorFullName || '-'}</td><td>${email}</td><td></td></tr></tbody>
  </table>
</div>
<div class="sub">1.7 อาจารย์ผู้สอนรายวิชา/ ชุดวิชา (ชื่อ-สกุล)
  <table>
    <thead><tr><th>ลำดับ</th><th>ชื่อ -สกุล</th><th>อีเมล</th><th>เบอร์โทรศัพท์</th></tr></thead>
    <tbody><tr><td class="center">1</td><td>${instructorFullName || '-'}</td><td>${email}</td><td></td></tr></tbody>
  </table>
</div>
<div class="sub">1.8 ระยะเวลาในการดำเนินการ ตั้งแต่วันที่ ${course.registrationStart ?? '-'} ถึงวันที่ ${course.registrationEnd ?? '-'}</div>

<br/>
<table>
  <thead>
    <tr>
      <th>ลำดับ</th><th>รหัสผู้เรียน</th><th>ชื่อ-สกุล</th><th>คะแนน</th><th>ผลการเรียน</th>
    </tr>
  </thead>
  <tbody>${learnerRows || `<tr class="no-data"><td colspan="5">ไม่มีข้อมูล</td></tr>`}</tbody>
</table>

<table style="margin-top:8px">
  <thead>
    <tr><th>รับ</th><th>ลง</th><th>ผ่าน</th><th>ไม่ผ่าน</th><th>ดำเนินการ</th></tr>
  </thead>
  <tbody>
    <tr>
      <td class="center">${maxSeats}</td>
      <td class="center">${totalEnrolled}</td>
      <td class="center">${passed}</td>
      <td class="center">${failed}</td>
      <td class="center">${noGrade}</td>
    </tr>
  </tbody>
</table>

<div class="print-date">วันที่พิมพ์ : ${printDate}</div>
</div>
</body>
</html>`;

  const win = window.open('', '_blank');
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
}

function sanitizeFileName(value: string): string {
  return value
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 80);
}

function escapeCsvCell(value: string | number): string {
  const text = String(value);
  if (!/[",\r\n]/.test(text)) {
    return text;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

function buildLearnerExportRows(): Array<Array<string | number>> {
  return filteredLearners.value.map((learner, index) => [
    index + 1,
    learner.studentId,
    learner.name,
    learner.email,
    learner.faculty,
    learner.department,
    learner.phone,
    learner.progress,
    learner.score,
    learner.status,
    learner.paymentStatus,
    learner.enrolledAt,
    learner.lastActive,
  ]);
}

function getLearnerExportFileBase(): string {
  const course = selectedCourse.value;
  const code = course?.code ?? 'course';
  return sanitizeFileName(`learner-roster-${code}`);
}

function exportLearnersCsv(): void {
  if (!selectedCourse.value || filteredLearners.value.length === 0) return;

  const headers = [
    'ลำดับ',
    'รหัสผู้เรียน',
    'ชื่อ-นามสกุล',
    'อีเมล',
    'คณะ/หน่วยงาน',
    'สาขา',
    'เบอร์โทร',
    'ความก้าวหน้า (%)',
    'คะแนน',
    'สถานะ',
    'สถานะชำระเงิน',
    'วันที่ลงทะเบียน',
    'เข้าเรียนล่าสุด',
  ];
  const csvRows = [headers, ...buildLearnerExportRows()]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\r\n');
  const blob = new Blob([`\uFEFF${csvRows}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${getLearnerExportFileBase()}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

function escapeHtml(value: string | number): string {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function exportLearnersPdf(): void {
  const course = selectedCourse.value;
  if (!course || filteredLearners.value.length === 0) return;

  const printedAt = new Date().toLocaleString('th-TH');
  const rows = buildLearnerExportRows()
    .map(
      (row) => `
        <tr>
          ${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}
        </tr>
      `,
    )
    .join('');

  const printWindow = window.open('', '_blank', 'width=1120,height=800');
  if (!printWindow) return;

  printWindow.document.write(`<!doctype html>
    <html lang="th">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(getLearnerExportFileBase())}</title>
        <style>
          @page { size: A4 landscape; margin: 12mm; }
          * { box-sizing: border-box; }
          body {
            margin: 0;
            color: #172033;
            font-family: "Noto Sans Thai", "TH Sarabun New", Arial, sans-serif;
            font-size: 11px;
          }
          h1 {
            margin: 0 0 4px;
            color: #09213f;
            font-size: 20px;
          }
          .meta {
            display: grid;
            gap: 2px;
            margin-bottom: 14px;
            color: #475569;
            font-size: 11px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
          }
          th,
          td {
            padding: 6px 7px;
            border: 1px solid #dce4ee;
            text-align: left;
            vertical-align: top;
          }
          th {
            color: #0f172a;
            background: #e7e7e7;
            font-weight: 800;
          }
          tbody tr:nth-child(even) {
            background: #fffaf1;
          }
        </style>
      </head>
      <body>
        <h1>รายชื่อผู้เรียน</h1>
        <div class="meta">
          <span>${escapeHtml(course.code)} : ${escapeHtml(course.titleEn || course.title)}</span>
          <span>จำนวน ${filteredLearners.value.length.toLocaleString('th-TH')} รายการ | พิมพ์เมื่อ ${escapeHtml(printedAt)}</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>ลำดับ</th>
              <th>รหัสผู้เรียน</th>
              <th>ชื่อ-นามสกุล</th>
              <th>อีเมล</th>
              <th>คณะ/หน่วยงาน</th>
              <th>สาขา</th>
              <th>เบอร์โทร</th>
              <th>ก้าวหน้า</th>
              <th>คะแนน</th>
              <th>สถานะ</th>
              <th>ชำระเงิน</th>
              <th>ลงทะเบียน</th>
              <th>ล่าสุด</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
        <script>
          window.onload = () => {
            window.focus();
            window.print();
          };
        <${'/'}script>
      </body>
    </html>
  `);
  printWindow.document.close();
}
</script>

<style lang="scss" scoped>
.instructor-students-page {
  min-height: 100vh;
  background: #f6f8fb;
}

.instructor-students {
  padding-block: 32px 54px;
}

.students-hero,
.student-roster-panel,
.student-course-card {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.students-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 24px;
  margin-bottom: 22px;

  h1 {
    margin: 0;
    color: #09213f;
    font-size: 1.8rem;
    font-weight: 900;
  }

  p {
    margin: 6px 0 0;
    color: #64748b;
    font-size: 0.95rem;
    font-weight: 700;
  }
}

.students-hero__eyebrow,
.student-course-card__code,
.student-course-row__code {
  color: $primary;
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
}

.student-course-list-panel {
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 30px rgba(15, 23, 42, 0.06);
}

.student-course-list-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 20px 22px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);

  h2 {
    margin: 0;
    color: #09213f;
    font-size: 1.18rem;
    font-weight: 900;
  }

  span {
    display: block;
    margin-top: 3px;
    color: #64748b;
    font-size: 0.84rem;
    font-weight: 800;
  }
}

.student-course-list {
  display: grid;
}

.learning-result-table-scroll {
  display: block;
  overflow-x: auto;
}

.learning-result-course-table {
  width: 100%;
  min-width: 1080px;
  table-layout: fixed;
  border-collapse: collapse;
  border-spacing: 0;
  color: #172033;
  font-size: 0.82rem;

  th,
  td {
    padding: 14px 10px;
    border: 1px solid #dce4ee;
    vertical-align: middle;
    overflow-wrap: break-word;
  }

  th {
    height: 54px;
    color: #0f172a;
    background: #e7e7e7;
    font-size: 0.76rem;
    font-weight: 900;
    line-height: 1.35;
    text-align: center;
    white-space: nowrap;
  }

  tbody tr {
    background: #ffffff;
    transition: background-color 0.16s ease;
  }

  tbody tr:nth-child(even) {
    background: #fffaf1;
  }

  tbody tr:hover {
    background: #fff4dd;
  }
}

.learning-result-col-index {
  width: 58px;
}

.learning-result-col-title {
  width: 34%;
}

.learning-result-col-fee {
  width: 10%;
}

.learning-result-col-schedule {
  width: 14%;
}

.learning-result-col-seat,
.learning-result-col-enrolled,
.learning-result-col-pass,
.learning-result-col-fail {
  width: 6%;
}

.learning-result-col-actions,
.learning-result-col-download {
  width: 9%;
}

.learning-result-title-cell {
  button {
    display: block;
    padding: 0;
    border: 0;
    color: #d97706;
    background: transparent;
    font: inherit;
    font-size: 0.86rem;
    font-weight: 900;
    line-height: 1.45;
    text-align: left;
    cursor: pointer;

    &:hover {
      color: #b45309;
    }
  }

  span {
    display: block;
    margin-top: 4px;
    color: #ea7a00;
    font-size: 0.74rem;
    font-weight: 700;
    line-height: 1.4;
  }
}

.learning-result-schedule-cell {
  color: #172033;
  font-size: 0.76rem;
  font-weight: 800;
  line-height: 1.42;
  vertical-align: middle !important;

  span {
    display: block;
    color: #64748b;
    font-size: 0.7rem;
    font-weight: 800;
  }

  strong {
    display: block;
    margin-top: 4px;
  }
}

.learning-result-icon-btn {
  width: 32px;
  height: 32px;
  min-height: 32px;
  background: #ffffff !important;
  border: 1px solid #dce4ee !important;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06) !important;
}

.learning-result-download-link {
  padding: 0;
  border: 0;
  color: #d97706;
  background: transparent;
  font: inherit;
  font-size: 0.78rem;
  font-weight: 900;
  cursor: pointer;

  &:hover {
    color: #b45309;
    text-decoration: underline;
  }
}

.learning-result-empty-cell {
  padding: 34px 16px !important;
  color: #94a3b8;
  font-weight: 700;
  text-align: center;
}

.student-course-row {
  display: grid;
  grid-template-columns: 112px minmax(0, 1fr) 96px 96px 164px;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 16px 18px;
  border: 0;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  background: #ffffff;
  cursor: pointer;
  text-align: left;
  transition:
    background-color 0.18s ease,
    border-color 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    background: #fffaf1;
    box-shadow: inset 4px 0 0 $primary;
  }

  &:last-child {
    border-bottom: 0;
  }

  img {
    width: 112px;
    height: 72px;
    border-radius: 10px;
    object-fit: cover;
    box-shadow: 0 7px 18px rgba(15, 23, 42, 0.08);
  }

  h3 {
    display: -webkit-box;
    overflow: hidden;
    margin: 4px 0 3px;
    color: #09213f;
    font-size: 1rem;
    font-weight: 900;
    line-height: 1.35;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
    line-clamp: 2;
  }

  p {
    display: -webkit-box;
    overflow: hidden;
    margin: 0;
    color: #64748b;
    font-size: 0.78rem;
    font-weight: 700;
    line-height: 1.4;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 1;
    line-clamp: 1;
  }
}

.student-course-row__body {
  min-width: 0;
}

.student-course-row__metric {
  display: grid;
  justify-items: center;
  gap: 2px;
  color: #64748b;
  font-size: 0.76rem;
  font-weight: 800;

  strong {
    color: #09213f;
    font-size: 1.12rem;
    font-weight: 900;
  }
}

.student-course-row__action {
  min-height: 38px;
  border-radius: 999px !important;
  font-size: 0.78rem;
  font-weight: 900 !important;
}

.student-roster-panel {
  padding: 18px;
}

.learning-result-import-page {
  display: grid;
  gap: 18px;
}

.learning-result-course-info {
  display: grid;
  grid-template-columns: 170px minmax(0, 1fr);
  gap: 9px 18px;
  max-width: 720px;
  margin: 0 auto;
  color: #172033;
  font-size: 0.84rem;
  font-weight: 800;

  div,
  p {
    display: contents;
  }

  span:first-child {
    color: #475569;
    text-align: right;
  }

  strong {
    color: $primary;
    font-weight: 900;
  }

  p {
    margin: 0;
  }

  p span {
    text-align: left;
  }
}

.learning-result-import-grid {
  display: grid;
  grid-template-columns: 70px minmax(320px, 1fr) minmax(320px, 0.95fr);
  gap: 10px 16px;
  align-items: start;
}

.learning-result-import-label {
  padding-top: 8px;
  color: #475569;
  font-size: 0.82rem;
  font-weight: 800;
  text-align: right;
}

.learning-result-import-workspace {
  display: grid;
  gap: 10px;
}

.learning-result-import-toolbar {
  display: flex;
  flex-direction: column;
  gap: 8px;

  &__row {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
}

.learning-result-import-tool-btn {
  font-size: 0.74rem;
}

.learning-result-import-action-btn {
  width: 100%;
  font-size: 0.74rem;
}

.learning-result-import-input :deep(textarea) {
  min-height: 200px;
  max-height: 480px;
  resize: vertical;
}

.learning-result-import-preview {
  display: grid;
  gap: 8px;
  padding: 10px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 10px;
  background: #f8fafc;
}

.learning-result-import-preview__summary {
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  font-size: 0.8rem;
  font-weight: 900;
}

.learning-result-import-preview__rows {
  display: grid;
  gap: 6px;
}

.learning-result-import-preview__row {
  display: grid;
  grid-template-columns: 78px minmax(92px, 1fr) 48px minmax(120px, 1.2fr);
  gap: 8px;
  align-items: center;
  color: #166534;
  font-size: 0.76rem;
  font-weight: 800;

  span,
  small {
    color: #64748b;
  }

  em {
    font-style: normal;
    color: #09213f;
    font-weight: 900;
  }
}

.learning-result-import-preview__row--invalid {
  color: #dc2626;
}

.learning-result-import-help {
  min-height: 180px;
  padding: 14px 16px;
  background: #c7f5d9;
  color: #14532d;
  font-size: 0.78rem;
  font-weight: 700;
  line-height: 1.45;

  strong {
    display: block;
    margin-bottom: 3px;
    text-decoration: underline;
  }

  p,
  ol {
    margin: 0;
  }

  ol {
    padding-left: 18px;
  }
}

.learning-result-links {
  display: grid;
  justify-items: start;
  gap: 4px;
  margin-top: 6px;

  button {
    padding: 0;
    border: 0;
    color: #d97706;
    background: transparent;
    font: inherit;
    font-size: 0.78rem;
    font-weight: 800;
    cursor: pointer;

    &:hover {
      color: #b45309;
      text-decoration: underline;
    }
  }
}

.learning-result-breakdown-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border: 1px solid #dce4ee;
  border-radius: 6px;
  color: #475569;
  background: #fff;
  font: inherit;
  font-size: 0.74rem;
  font-weight: 800;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;

  &:hover {
    background: #fffaf1;
    color: $primary;
    border-color: $primary;
  }
}

// ── Grade Breakdown Panel ──────────────────────────────────────
.student-grade-panel-overlay {
  position: fixed;
  inset: 0;
  z-index: 2999;
  background: rgba(15, 23, 42, 0.3);
}

.student-grade-panel {
  position: fixed;
  top: 0;
  right: 0;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  width: min(440px, 100vw);
  height: 100dvh;
  overflow-y: auto;
  background: #fff;
  box-shadow: -8px 0 32px rgba(15, 23, 42, 0.12);
}

.student-panel-slide-enter-active,
.student-panel-slide-leave-active {
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.student-panel-slide-enter-from,
.student-panel-slide-leave-to {
  transform: translateX(100%);
}

.student-grade-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 20px 20px 16px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
}

.student-grade-panel__eyebrow {
  margin: 0 0 4px;
  color: $primary;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.student-grade-panel__title {
  margin: 0 0 2px;
  color: #09213f;
  font-size: 1.1rem;
  font-weight: 900;
}

.student-grade-panel__sub {
  color: #64748b;
  font-size: 0.8rem;
  font-weight: 800;
}

.student-grade-panel__close {
  flex-shrink: 0;
  padding: 4px;
  border: 0;
  color: #64748b;
  background: transparent;
  cursor: pointer;

  &:hover {
    color: #09213f;
  }
}

.student-grade-panel__total {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.06);
  background: #f8fafc;
}

.student-grade-panel__total-label {
  color: #64748b;
  font-size: 0.78rem;
  font-weight: 800;
}

.student-grade-panel__total-value {
  color: #09213f;
  font-size: 1.3rem;
  font-weight: 900;

  span {
    color: #94a3b8;
    font-size: 0.85rem;
  }
}

.student-grade-panel__grade-badge {
  display: inline-block;
  padding: 3px 12px;
  border-radius: 999px;
  background: $primary;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 900;
}

.student-grade-panel__body {
  display: grid;
  align-content: start;
  gap: 0;
  padding: 8px 0;
  flex: 1;
}

.student-grade-panel__empty {
  padding: 32px 20px;
  color: #94a3b8;
  font-size: 0.84rem;
  font-weight: 700;
  text-align: center;
}

.student-grade-panel__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 20px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.05);

  &:last-child {
    border-bottom: 0;
  }
}

.student-grade-panel__item-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.student-grade-panel__module-badge {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 5px;
  background: #e2e8f0;
  color: #475569;
  font-size: 0.7rem;
  font-weight: 900;

  &--assign {
    background: #dbeafe;
    color: #1e40af;
  }

  &--quiz {
    background: #f3e8ff;
    color: #7e22ce;
  }
}

.student-grade-panel__item-name {
  overflow: hidden;
  color: #1e293b;
  font-size: 0.82rem;
  font-weight: 700;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.student-grade-panel__item-right {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 10px;
}

.student-grade-panel__score {
  color: #09213f;
  font-size: 0.9rem;
  font-weight: 900;
}

.student-grade-panel__score-max {
  color: #94a3b8;
  font-size: 0.76rem;
  font-weight: 700;
}

.student-grade-panel__no-score {
  color: #cbd5e1;
  font-size: 0.84rem;
}

.student-grade-panel__grade-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 6px;
  background: #09213f;
  color: #fff;
  font-size: 0.72rem;
  font-weight: 800;
  text-decoration: none;
  transition: background-color 0.15s ease;

  &:hover {
    background: $primary;
  }
}

.preview-bulk-bar {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px;
  border-radius: 10px;
  background: #f8fafc;
  border: 1px solid rgba(17, 24, 39, 0.07);
  margin-bottom: 12px;

  &__section {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;

    &--rules {
      flex-direction: column;
      align-items: stretch;
    }
  }

  &__rule {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__rule-actions {
    display: flex;
    gap: 8px;
    margin-top: 4px;
  }

  &__label {
    flex-shrink: 0;
    color: #64748b;
    font-size: 0.78rem;
    font-weight: 700;
  }

  &__select {
    min-width: 130px;
  }

  &__operator {
    width: 72px;
  }

  &__score-input {
    width: 80px;
  }

  &__hint {
    color: #94a3b8;
    font-size: 0.7rem;
    font-weight: 600;
  }

  &__btn {
    font-size: 0.74rem;
  }

  &__divider {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #94a3b8;
    font-size: 0.72rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;

    &::before,
    &::after {
      content: '';
      flex: 1;
      height: 1px;
      background: rgba(17, 24, 39, 0.08);
    }
  }
}

.learning-result-detail-preview {
  display: grid;
  gap: 10px;
}

.learning-result-detail-preview__header {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  font-size: 0.82rem;
  font-weight: 900;
}

.detail-grade-badge {
  display: inline-block;
  padding: 2px 10px;
  border-radius: 999px;
  background: #d97706;
  color: #fff;
  font-size: 0.74rem;
  font-weight: 900;
}

.detail-grade-dash {
  color: #94a3b8;
}

.detail-grade-select {
  min-width: 140px;
}

.detail-unmatched-label {
  color: #dc2626;
  font-size: 0.74rem;
  font-weight: 800;
}

.detail-status {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 0.72rem;
  font-weight: 900;
}

.detail-status--ready {
  background: #dcfce7;
  color: #166534;
}

.detail-status--pending {
  background: #fef9c3;
  color: #854d0e;
}

.detail-status--error {
  background: #fee2e2;
  color: #991b1b;
}

.detail-row--unmatched {
  opacity: 0.65;
}

.learning-result-approved-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 8px;
  padding: 10px 16px;
  margin-bottom: 12px;
  font-size: 14px;
  color: #166534;
}

.learning-result-approved-meta {
  margin-left: 8px;
  font-size: 13px;
  color: #4b7a62;
}

.learning-result-table-actions {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.learning-result-sync-actions {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.learning-result-lms-actions {
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  gap: 18px;
  color: #ef4444;
  font-size: 1.55rem;
  font-weight: 400;

  > div {
    display: grid;
    justify-items: end;
    gap: 4px;
    min-width: 260px;
  }

  button {
    padding: 0;
    border: 0;
    color: #475569;
    background: transparent;
    font: inherit;
    font-size: 0.78rem;
    font-weight: 800;
    cursor: pointer;

    &:hover {
      color: $primary;
      text-decoration: underline;
    }
  }
}

.learning-result-entry-table {
  width: 100%;
  min-width: 900px;
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0;
  color: #172033;
  font-size: 0.82rem;

  th,
  td {
    padding: 12px 10px;
    border-right: 1px solid #dce4ee;
    border-bottom: 1px solid #dce4ee;
    vertical-align: middle;
    overflow-wrap: break-word;
  }

  th {
    color: #0f172a;
    background: #e7e7e7;
    font-size: 0.76rem;
    font-weight: 900;
    text-align: center;
  }

  tbody tr:nth-child(even) {
    background: #fffaf1;
  }

  tbody tr:hover {
    background: #fff4dd;
  }
}

.learning-result-lms-icon {
  width: 30px;
  height: 30px;
  min-height: 30px;
  margin-bottom: 4px;
  background: #ffffff !important;
  border: 1px solid #dce4ee !important;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06) !important;
}

.student-roster-tabs {
  margin: 2px 0 16px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  color: #64748b;
  font-weight: 900;
}

.student-roster-panel__summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 16px;

  div {
    display: grid;
    gap: 4px;
    min-height: 82px;
    padding: 14px;
    border-radius: 12px;
    background: #f8fafc;
  }

  span {
    color: #64748b;
    font-size: 0.8rem;
    font-weight: 800;
  }

  strong {
    color: #09213f;
    font-size: 1.55rem;
    font-weight: 900;
  }
}

.student-roster-table {
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 12px;
  overflow: hidden;

  :deep(tbody tr) {
    cursor: pointer;
  }
}

.student-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 220px;

  div {
    display: grid;
    gap: 2px;
    min-width: 0;
  }

  strong {
    color: #09213f;
    font-size: 0.9rem;
    font-weight: 900;
  }

  span {
    color: #64748b;
    font-size: 0.78rem;
    font-weight: 700;
  }
}

.student-progress-cell {
  display: grid;
  grid-template-columns: minmax(96px, 1fr) 44px;
  gap: 10px;
  align-items: center;
  min-width: 170px;

  span {
    color: #475569;
    font-size: 0.82rem;
    font-weight: 900;
  }
}

.student-detail-dialog {
  width: min(720px, calc(100vw - 32px));
  border-radius: 14px;
}

.student-detail-header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.student-detail-stats {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  div {
    display: grid;
    gap: 8px;
    min-height: 104px;
    padding: 14px;
    border-radius: 12px;
    background: #f8fafc;
  }

  span {
    color: #64748b;
    font-size: 0.78rem;
    font-weight: 800;
  }

  strong {
    color: #09213f;
    font-size: 1.18rem;
    font-weight: 900;
  }
}

.student-detail-info {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px 18px;

  div {
    display: grid;
    gap: 4px;
  }

  span {
    color: #64748b;
    font-size: 0.78rem;
    font-weight: 800;
  }

  strong {
    color: #1f2937;
    font-size: 0.9rem;
    font-weight: 800;
  }
}

.student-roster-filters {
  .custom-filter-input :deep(.q-field__control) {
    border-radius: 12px !important;
  }
}

.student-result-score {
  width: 136px;
}

.student-result-status {
  width: 132px;
}

.student-export-btn {
  min-height: 38px;
  padding: 0 14px !important;
  border-radius: 10px !important;
  font-size: 0.78rem;
  font-weight: 900 !important;
}

.student-export-btn--primary {
  box-shadow: 0 7px 18px rgba($primary, 0.2) !important;
}

@media (max-width: 980px) {
  .student-roster-panel__summary,
  .student-detail-stats {
    grid-template-columns: 1fr;
  }

  .student-course-row {
    grid-template-columns: 96px minmax(0, 1fr);
  }

  .student-course-row__metric,
  .student-course-row__action {
    grid-column: 2;
    justify-self: start;
  }
}

@media (max-width: 680px) {
  .students-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .student-course-row {
    grid-template-columns: 84px minmax(0, 1fr);
    padding: 14px;

    img {
      width: 84px;
      height: 64px;
    }
  }

  .student-detail-info {
    grid-template-columns: 1fr;
  }
}
</style>
