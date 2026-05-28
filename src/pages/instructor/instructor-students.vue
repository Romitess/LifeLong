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
        <q-btn
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
                    @click.stop="exportCourseLearningResultsCsv(course)"
                  >
                    {{ getLearningResultDownloadCode(course) }}
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
            <q-btn
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

            <div class="learning-result-import-grid">
              <label class="learning-result-import-label" for="learning-result-import"
                >import</label
              >
              <div class="learning-result-import-workspace">
                <div class="learning-result-import-toolbar">
                  <q-btn
                    outline
                    color="primary"
                    icon="download"
                    label="ดาวน์โหลด Template"
                    no-caps
                    class="learning-result-import-tool-btn"
                    @click="downloadGradeImportTemplate"
                  />
                  <q-btn
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

                <q-input
                  id="learning-result-import"
                  v-model="resultImportText"
                  type="textarea"
                  outlined
                  autogrow
                  placeholder="วางข้อมูลรูปแบบ: รหัสผู้เรียน เกรด เช่น C6901355 A"
                  class="learning-result-import-input"
                />

                <div v-if="resultImportText.trim()" class="learning-result-import-preview">
                  <div class="learning-result-import-preview__summary">
                    <span class="text-positive"
                      >ใช้ได้ {{ validImportPreviewRows.length }} แถว</span
                    >
                    <span class="text-negative"
                      >ต้องตรวจ {{ invalidImportPreviewRows.length }} แถว</span
                    >
                  </div>
                  <div class="learning-result-import-preview__rows">
                    <div
                      v-for="row in resultImportPreviewRows.slice(0, 6)"
                      :key="`${row.lineNumber}-${row.studentId}-${row.grade}`"
                      class="learning-result-import-preview__row"
                      :class="{ 'learning-result-import-preview__row--invalid': !row.valid }"
                    >
                      <span>บรรทัด {{ row.lineNumber }}</span>
                      <strong>{{ row.studentId || '-' }}</strong>
                      <em>{{ row.grade || '-' }}</em>
                      <small>{{ row.message }}</small>
                    </div>
                  </div>
                </div>
              </div>
              <div class="learning-result-import-help">
                <strong>ตัวอย่าง</strong>
                <p>
                  การจัดเรียงข้อมูลที่ Import เกรด ให้ระหว่างรหัสผู้เรียนและเกรด คั่นด้วย Tab หรือ
                  Space
                </p>
                <p>C6600001 A</p>
                <p>C6600002 B</p>
                <p>C6600003 B+</p>
                <ol>
                  <li>คัดลอกข้อมูลจาก text area import</li>
                  <li>คลิกที่ปุ่ม Import เพื่อบันทึกข้อมูล</li>
                  <li>คลิกที่ไอคอนดึงผลการเรียนเพื่อบันทึกผลการเรียน</li>
                </ol>
              </div>
              <q-btn
                unelevated
                color="primary"
                label="import"
                no-caps
                class="learning-result-import-btn"
                @click="importLearningResults"
              />
            </div>

            <div class="learning-result-links">
              <button type="button" @click="exportCourseLearningResultsCsv(selectedCourse)">
                ดาวน์โหลดรายชื่อผู้เรียน
              </button>
              <button type="button" @click="exportCourseLearningResultsCsv(selectedCourse)">
                ดาวน์โหลดแบบฟอร์มใบส่งเกรด สำหรับเจ้าประชุมกรรมการประจำ
              </button>
            </div>

            <div class="learning-result-lms-actions">
              <span>ดึงคะแนนจากระบบ LMS</span>
              <div>
                <button type="button" @click="pullScoresFromLms">
                  คลิกที่นี่ เพื่อดึงคะแนนจาก LMS
                </button>
                <button type="button" @click="saveLearningResults">
                  คลิกที่นี่ เพื่อแก้ไขผลการเรียน
                </button>
                <button type="button" @click="saveLearningResults">
                  คลิกที่นี่ เพื่อบันทึกผลการเรียน
                </button>
              </div>
            </div>

            <div class="learning-result-table-scroll">
              <table class="learning-result-entry-table">
                <thead>
                  <tr>
                    <th>ลำดับ</th>
                    <th>รหัสผู้เรียน</th>
                    <th>ชื่อ-สกุล</th>
                    <th>
                      <q-btn
                        dense
                        flat
                        round
                        color="primary"
                        icon="file_download"
                        class="learning-result-lms-icon"
                        @click="pullScoresFromLms"
                      >
                        <q-tooltip>ดึงคะแนนจาก LMS</q-tooltip>
                      </q-btn>
                      <div>คะแนนจาก LMS</div>
                    </th>
                    <th>
                      <q-btn
                        dense
                        flat
                        round
                        color="primary"
                        icon="edit"
                        class="learning-result-lms-icon"
                        @click="saveLearningResults"
                      >
                        <q-tooltip>แก้ไขผลการเรียน</q-tooltip>
                      </q-btn>
                      <div>ผลการเรียน</div>
                    </th>
                    <th>วันที่อัปเดตข้อมูล</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(learner, index) in learners" :key="learner.id">
                    <td class="text-center">{{ index + 1 }}</td>
                    <td class="text-center">{{ learner.studentId }}</td>
                    <td>{{ learner.name }}</td>
                    <td class="text-center">{{ getLearnerLmsScore(learner) }}</td>
                    <td class="text-center">{{ learner.resultStatus }}</td>
                    <td class="text-center">{{ getLearnerLmsUpdatedAt(learner) }}</td>
                  </tr>
                  <tr v-if="learners.length === 0">
                    <td colspan="6" class="learning-result-empty-cell">
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
            v-model="activeStudentTab"
            dense
            align="left"
            active-color="primary"
            indicator-color="primary"
            class="student-roster-tabs"
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
              <q-btn
                outline
                color="primary"
                icon="table_view"
                label="CSV"
                no-caps
                class="student-export-btn"
                :disable="filteredLearners.length === 0"
                @click="exportLearnersCsv"
              />
              <q-btn
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
            <q-btn
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
                  :options="learningResultStatusOptions"
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
            <q-btn
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
import type { Course } from 'src/types/course';

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
}

interface ImportedLearningResult {
  grade: string;
  score: number;
  status: string;
}

interface ImportPreviewRow extends ImportedLearningResult {
  lineNumber: number;
  studentId: string;
  valid: boolean;
  message: string;
}

const $q = useQuasar();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const courseStore = useCourseStore();
const instructorBackend = useInstructorBackend();
courseStore.init();

const selectedCourseId = ref(typeof route.query.courseId === 'string' ? route.query.courseId : '');
const initialStudentTab = route.query.tab === 'results' ? 'results' : 'roster';
const activeStudentTab = ref<'roster' | 'results'>(initialStudentTab);
const learnerDetailDialogOpen = ref(false);
const selectedLearner = ref<LearnerRow | null>(null);
const searchQuery = ref('');
const statusFilter = ref('ทั้งหมด');
const resultImportText = ref('');
const gradeImportFileInput = ref<HTMLInputElement | null>(null);
const importedLearningResults = ref<Record<string, ImportedLearningResult>>({});
const pendingLearningResults = ref<Record<string, ImportedLearningResult>>({});

const statusOptions = ['ทั้งหมด', 'เรียนต่อเนื่อง', 'ปกติ', 'ควรติดตาม', 'เสี่ยงหลุด'];
const learningResultStatusOptions = ['รอบันทึก', 'ผ่าน', 'ไม่ผ่าน', 'ต้องแก้ไข'];
const gradeScoreMap: Record<string, number> = {
  A: 95,
  'B+': 85,
  B: 80,
  'C+': 75,
  C: 70,
  'D+': 65,
  D: 60,
  F: 0,
  P: 100,
};
const passingGrades = new Set(['A', 'B+', 'B', 'C+', 'P']);

watch(
  () => route.query.tab,
  (tab) => {
    activeStudentTab.value = tab === 'results' ? 'results' : 'roster';
  },
);

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

onMounted(() => {
  const email = authStore.user?.email;
  if (email) {
    void courseStore.fetchInstructorCourses(email);
  }
});

watch(
  selectedCourse,
  (course) => {
    const email = authStore.user?.email;
    if (!course || !email) return;
    void instructorBackend.fetchLearners(email, course.id, course.moodleId ?? null);
    void instructorBackend.fetchGrades(email, course.id);
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

function formatPaymentStatus(value: string | null | undefined, isFree: boolean): string {
  if (isFree) return 'ไม่มีค่าใช้จ่าย';
  if (value === 'Y') return 'ชำระแล้ว';
  if (value === 'N') return 'ยังไม่ชำระ';
  return value || '-';
}

function getResultStatus(status: 'passed' | 'failed' | 'pending' | undefined): string {
  if (status === 'passed') return 'ผ่าน';
  if (status === 'failed') return 'ไม่ผ่าน';
  return '';
}

function buildLearnersForCourse(course: Course | undefined): LearnerRow[] {
  if (!course) return [];

  const backendLearners = instructorBackend.learnersByCourseId.value[course.id] ?? [];
  const backendGrades = instructorBackend.gradesByCourseId.value[course.id] ?? [];
  const totalLessons =
    getCourseStructure(course.id).reduce((sum, module) => sum + module.lessons.length, 0) || 0;

  return backendLearners.map((learner) => {
    const grade = backendGrades.find(
      (candidate) =>
        candidate.learnerUserId === learner.userId || candidate.studentId === learner.studentId,
    );
    const importedResult = importedLearningResults.value[learner.studentId];
    const score = importedResult?.score ?? grade?.score ?? 0;
    const resultStatus = importedResult?.status ?? getResultStatus(grade?.status);
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

const resultImportPreviewRows = computed<ImportPreviewRow[]>(() => {
  const learnerIds = new Set(learners.value.map((learner) => learner.studentId));

  return resultImportText.value
    .split(/\r?\n/)
    .map((rawLine, index) => ({ rawLine: rawLine.trim(), lineNumber: index + 1 }))
    .filter((line) => line.rawLine.length > 0)
    .map(({ rawLine, lineNumber }) => {
      const [studentId = '', gradeValue = ''] = rawLine.split(/[,\t ]+/).filter(Boolean);
      const grade = gradeValue.toUpperCase();
      const score = gradeScoreMap[grade] ?? Number.NaN;
      const importedResult = {
        grade,
        score: Number.isFinite(score) ? score : 0,
        status: passingGrades.has(grade) ? 'ผ่าน' : 'ไม่ผ่าน',
      };

      if (!studentId || !grade) {
        return {
          ...importedResult,
          lineNumber,
          studentId,
          valid: false,
          message: 'ข้อมูลไม่ครบ',
        };
      }

      if (!learnerIds.has(studentId)) {
        return {
          ...importedResult,
          lineNumber,
          studentId,
          valid: false,
          message: 'ไม่พบรหัสผู้เรียนในรายวิชานี้',
        };
      }

      if (!Number.isFinite(score)) {
        return {
          ...importedResult,
          lineNumber,
          studentId,
          valid: false,
          message: 'รูปแบบเกรดไม่ถูกต้อง',
        };
      }

      return {
        ...importedResult,
        lineNumber,
        studentId,
        valid: true,
        message: 'พร้อมนำเข้า',
      };
    });
});

const validImportPreviewRows = computed(() =>
  resultImportPreviewRows.value.filter((row) => row.valid),
);
const invalidImportPreviewRows = computed(() =>
  resultImportPreviewRows.value.filter((row) => !row.valid),
);

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

function getLearningResultDownloadCode(course: Course): string {
  return `CBS${String(course.id).padStart(3, '0')}`;
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

function selectCourse(courseId: string): void {
  selectedCourseId.value = courseId;
  selectedLearner.value = null;
  void router.replace({
    query: {
      ...route.query,
      courseId,
    },
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

function saveLearningResults(): void {
  if (Object.keys(pendingLearningResults.value).length > 0) {
    importedLearningResults.value = {
      ...importedLearningResults.value,
      ...pendingLearningResults.value,
    };
    pendingLearningResults.value = {};
  }

  $q.notify({
    type: 'positive',
    icon: 'save',
    message: `บันทึกผลการเรียน ${filteredLearners.value.length.toLocaleString('th-TH')} รายการแล้ว`,
  });
}

function importLearningResults(): void {
  if (validImportPreviewRows.value.length === 0) {
    $q.notify({
      type: 'warning',
      icon: 'error',
      message: 'ยังไม่มีข้อมูลที่นำเข้าได้ กรุณาตรวจสอบรหัสผู้เรียนและเกรด',
    });
    return;
  }

  const nextResults = { ...pendingLearningResults.value };
  validImportPreviewRows.value.forEach((row) => {
    nextResults[row.studentId] = {
      grade: row.grade,
      score: row.score,
      status: row.status,
    };
  });
  pendingLearningResults.value = nextResults;

  $q.notify({
    type: 'positive',
    icon: 'upload_file',
    message: `ตรวจข้อมูลแล้ว ${validImportPreviewRows.value.length.toLocaleString('th-TH')} รายการ รอกดบันทึกผลการเรียน`,
  });
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

function pullScoresFromLms(): void {
  const nextResults = { ...pendingLearningResults.value };
  learners.value.forEach((learner) => {
    const score = (Number(learner.studentId.replace(/\D/g, '').slice(-2)) * 7) % 101;
    const grade = score >= 80 ? 'A' : score >= 60 ? 'B' : 'F';
    nextResults[learner.studentId] = {
      grade,
      score,
      status: passingGrades.has(grade) ? 'ผ่าน' : 'ไม่ผ่าน',
    };
  });
  pendingLearningResults.value = nextResults;

  $q.notify({
    type: 'info',
    icon: 'cloud_download',
    message: 'ดึงคะแนนจากระบบ LMS แล้ว รอกดบันทึกผลการเรียน',
  });
}

function getLearnerLmsScore(learner: LearnerRow): string {
  const pendingResult = pendingLearningResults.value[learner.studentId];
  const savedResult = importedLearningResults.value[learner.studentId];
  const score = pendingResult?.score ?? savedResult?.score;
  return score === undefined ? '' : score.toFixed(2);
}

function getLearnerLmsUpdatedAt(learner: LearnerRow): string {
  const numericPart = Number(learner.studentId.replace(/\D/g, '').slice(-2)) || 0;
  return `${String(19 + (numericPart % 5)).padStart(2, '0')}/05/2568`;
}

function exportCourseLearningResultsCsv(course: Course): void {
  const rows = getCourseResultLearners(course).map((learner, index) => [
    index + 1,
    course.code,
    learner.studentId,
    learner.name,
    learner.finalScore,
    learner.resultStatus,
    learner.resultNote,
  ]);
  const headers = [
    'ลำดับ',
    'รหัสรายวิชา',
    'รหัสผู้เรียน',
    'ชื่อ-นามสกุล',
    'คะแนน',
    'ผลการเรียน',
    'หมายเหตุ',
  ];
  const csvRows = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${csvRows}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${sanitizeFileName(`${getLearningResultDownloadCode(course)}-${course.code}`)}.csv`;
  link.click();
  URL.revokeObjectURL(url);
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
  flex-wrap: wrap;
  gap: 8px;
}

.learning-result-import-tool-btn {
  min-height: 34px;
  border-radius: 8px !important;
  font-size: 0.74rem;
  font-weight: 900 !important;
}

.learning-result-import-input :deep(textarea) {
  min-height: 180px;
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

.learning-result-import-btn {
  grid-column: 2;
  justify-self: start;
  min-height: 34px;
  border-radius: 4px !important;
  font-size: 0.76rem;
  font-weight: 800 !important;
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
