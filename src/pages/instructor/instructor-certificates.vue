<template>
  <q-page class="certificate-page">
    <div class="section-container certificate-page__inner">
      <section class="certificate-hero">
        <div>
          <div class="certificate-hero__eyebrow">Certificate Builder</div>
          <h1>สร้าง Certificate</h1>
          <p>เลือกรายวิชา ตรวจสอบผู้เรียนที่ผ่านเกณฑ์ แล้วสร้างหรือพิมพ์ Certificate รายบุคคล</p>
        </div>
        <q-btn
          v-if="selectedCourse"
          outline
          color="primary"
          icon="arrow_back"
          label="กลับไปเลือกรายวิชา"
          no-caps
          @click="clearSelectedCourse"
        />
      </section>

      <section v-if="!selectedCourse" class="certificate-panel">
        <div class="certificate-panel__header">
          <div>
            <h2>เลือกรายวิชาเพื่อสร้าง Certificate</h2>
            <span>แสดงข้อมูล {{ instructorCourses.length.toLocaleString('th-TH') }} รายการ</span>
          </div>
          <q-input
            v-model="courseSearch"
            dense
            outlined
            clearable
            placeholder="ค้นหารหัสหรือชื่อรายวิชา"
            class="certificate-search"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <div class="certificate-table-scroll">
          <table class="certificate-course-table">
            <thead>
              <tr>
                <th class="text-center">ลำดับ</th>
                <th>ชื่อรายวิชา</th>
                <th class="text-center">ค่าธรรมเนียม</th>
                <th>กำหนดการ</th>
                <th class="text-center">รับ</th>
                <th class="text-center">ลง</th>
                <th class="text-center">ผ่าน</th>
                <th class="text-center">ไม่ผ่าน</th>
                <th class="text-center">ดำเนินการ</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(course, index) in filteredCourses" :key="course.id">
                <td class="text-center">{{ index + 1 }}</td>
                <td>
                  <button
                    type="button"
                    class="course-title-button"
                    @click="selectCourse(course.id)"
                  >
                    {{ course.code }} : {{ course.title }}
                  </button>
                  <span v-if="course.titleEn" class="course-title-en">{{ course.titleEn }}</span>
                </td>
                <td class="text-center">
                  {{ course.isFree ? 'ฟรี' : formatCurrency(course.price) }}
                </td>
                <td>
                  <div class="schedule-lines">
                    <span
                      >ลงทะเบียน {{ course.registrationStart }} - {{ course.registrationEnd }}</span
                    >
                    <span
                      >การเรียนการสอน {{ course.registrationStart }} -
                      {{ course.registrationEnd }}</span
                    >
                  </div>
                </td>
                <td class="text-center">{{ course.maxSeats.toLocaleString('th-TH') }}</td>
                <td class="text-center">{{ course.enrolledCount.toLocaleString('th-TH') }}</td>
                <td class="text-center text-positive">
                  {{ getPassedLearners(course).length.toLocaleString('th-TH') }}
                </td>
                <td class="text-center text-negative">
                  {{ getFailedLearners(course).length.toLocaleString('th-TH') }}
                </td>
                <td class="text-center">
                  <q-btn
                    dense
                    round
                    flat
                    color="primary"
                    icon="edit"
                    @click="selectCourse(course.id)"
                  >
                    <q-tooltip>จัดการ Certificate</q-tooltip>
                  </q-btn>
                </td>
              </tr>
              <tr v-if="filteredCourses.length === 0">
                <td colspan="9" class="empty-cell">ไม่พบรายวิชา</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section v-else class="certificate-panel">
        <div class="course-detail-summary">
          <div class="summary-label">รายวิชา</div>
          <div>
            <strong>{{ selectedCourse.code }} : {{ selectedCourse.title }}</strong>
            <span v-if="selectedCourse.titleEn">{{ selectedCourse.titleEn }}</span>
          </div>
          <div class="summary-label">ค่าธรรมเนียม</div>
          <div>{{ selectedCourse.isFree ? 'ฟรี' : formatCurrency(selectedCourse.price) }}</div>
          <div class="summary-label">จำนวนรับ</div>
          <div>{{ selectedCourse.maxSeats.toLocaleString('th-TH') }} คน</div>
          <div class="summary-label">จำนวนผู้ลงทะเบียน</div>
          <div>{{ selectedCourse.enrolledCount.toLocaleString('th-TH') }} คน</div>
          <div></div>
          <div class="text-positive">
            ( ผ่าน {{ passedLearners.length.toLocaleString('th-TH') }} คน )
          </div>
        </div>

        <div class="certificate-table-scroll">
          <table class="certificate-learner-table">
            <thead>
              <tr>
                <th class="text-center">ลำดับ</th>
                <th>ชื่อ-สกุล</th>
                <th class="text-center">คะแนนจาก LMS</th>
                <th class="text-center">ผลการเรียน</th>
                <th class="text-center">Download ประกาศนียบัตร</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(learner, index) in passedLearners" :key="learner.id">
                <td class="text-center">{{ index + 1 }}</td>
                <td>
                  <strong>{{ learner.name }}</strong>
                  <span>{{ learner.studentId }} · {{ learner.email }}</span>
                </td>
                <td class="text-center">{{ learner.score }}</td>
                <td class="text-center text-positive">{{ learner.resultStatus }}</td>
                <td class="text-center">
                  <q-btn
                    dense
                    unelevated
                    color="primary"
                    icon="workspace_premium"
                    label="สร้าง"
                    no-caps
                    @click="openCertificate(learner)"
                  />
                </td>
              </tr>
              <tr v-if="passedLearners.length === 0">
                <td colspan="5" class="empty-cell">
                  ไม่มีผู้เรียนที่ผ่านเกณฑ์สำหรับสร้าง Certificate
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>

    <CertificateModal
      v-model="certificateDialogOpen"
      :course="selectedCourse ?? null"
      :user-name="selectedLearner?.name ?? ''"
    />
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import CertificateModal from 'components/certificate/CertificateModal.vue';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';
import type { Course } from 'src/types/course';

type CertificateResultStatus = 'ผ่าน' | 'ไม่ผ่าน';

interface CertificateLearner {
  id: string;
  studentId: string;
  name: string;
  email: string;
  score: string;
  resultStatus: CertificateResultStatus;
}

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const courseStore = useCourseStore();
courseStore.init();

const selectedCourseId = ref(typeof route.query.courseId === 'string' ? route.query.courseId : '');
const courseSearch = ref('');
const certificateDialogOpen = ref(false);
const selectedLearner = ref<CertificateLearner | null>(null);

const learnerNames = [
  'ณัฐพงศ์ ไม้อยู่',
  'สมชาย รักดี',
  'มานี มีใจ',
  'วิชัย ใจตรง',
  'ฟ้า สดใส',
  'กิตติคุณ มั่งมี',
  'นลินี มีสุข',
  'วรวุฒิ ใจดี',
  'อลิสา สดใส',
  'ธนกร ร่ำรวย',
  'ปาณิสรา แสงดาว',
  'ชัยพล ตั้งใจ',
];

const instructorCourses = computed<Course[]>(() =>
  courseStore.getInstructorCourses(authStore.user),
);

const filteredCourses = computed<Course[]>(() => {
  const query = courseSearch.value.trim().toLowerCase();
  if (!query) return instructorCourses.value;

  return instructorCourses.value.filter((course) =>
    [course.code, course.title, course.titleEn ?? ''].some((value) =>
      value.toLowerCase().includes(query),
    ),
  );
});

const selectedCourse = computed<Course | undefined>(() =>
  instructorCourses.value.find((course) => course.id === selectedCourseId.value),
);

const courseLearners = computed<CertificateLearner[]>(() =>
  selectedCourse.value ? buildCertificateLearners(selectedCourse.value) : [],
);

const passedLearners = computed<CertificateLearner[]>(() =>
  courseLearners.value.filter((learner) => learner.resultStatus === 'ผ่าน'),
);

watch(
  () => route.query.courseId,
  (courseId) => {
    selectedCourseId.value = typeof courseId === 'string' ? courseId : '';
  },
);

function buildCertificateLearners(course: Course): CertificateLearner[] {
  return Array.from({ length: course.enrolledCount }, (_, index) => {
    const score = (course.id.charCodeAt(0) * 13 + index * 11) % 101;
    const studentId = `C69${String(index + 1355).padStart(5, '0')}`;
    const name = learnerNames[index % learnerNames.length] ?? `ผู้เรียน ${index + 1}`;

    return {
      id: `${course.id}-${studentId}`,
      studentId,
      name,
      email: `student${course.id}${String(index + 1).padStart(3, '0')}@go.buu.ac.th`,
      score: `${score}/100`,
      resultStatus: score >= 60 ? 'ผ่าน' : 'ไม่ผ่าน',
    };
  });
}

function getPassedLearners(course: Course): CertificateLearner[] {
  return buildCertificateLearners(course).filter((learner) => learner.resultStatus === 'ผ่าน');
}

function getFailedLearners(course: Course): CertificateLearner[] {
  return buildCertificateLearners(course).filter((learner) => learner.resultStatus === 'ไม่ผ่าน');
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(value);
}

function selectCourse(courseId: string): void {
  void router.push({
    path: '/instructor/certificates',
    query: { courseId },
  });
}

function clearSelectedCourse(): void {
  selectedLearner.value = null;
  certificateDialogOpen.value = false;
  void router.push('/instructor/certificates');
}

function openCertificate(learner: CertificateLearner): void {
  selectedLearner.value = learner;
  certificateDialogOpen.value = true;
}
</script>

<style lang="scss" scoped>
.certificate-page {
  background: #f4f7fb;
  min-height: 100vh;
}

.certificate-page__inner {
  padding: 40px 24px 56px;
}

.certificate-hero,
.certificate-panel {
  border: 1px solid rgba(17, 24, 39, 0.08);
  background: #ffffff;
  box-shadow: 0 18px 42px rgba(15, 23, 42, 0.08);
}

.certificate-hero {
  display: flex;
  justify-content: space-between;
  gap: 20px;
  align-items: flex-start;
  padding: 28px;
  border-radius: 18px;
  margin-bottom: 22px;

  h1 {
    margin: 4px 0 8px;
    color: #101828;
    font-size: 2rem;
    font-weight: 800;
  }

  p {
    margin: 0;
    color: #667085;
  }
}

.certificate-hero__eyebrow {
  color: #c47a00;
  font-size: 0.82rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.certificate-panel {
  padding: 28px;
  border-radius: 16px;
}

.certificate-panel__header {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: center;
  margin-bottom: 18px;

  h2 {
    margin: 0 0 4px;
    color: #101828;
    font-size: 1.2rem;
    font-weight: 800;
  }

  span {
    color: #667085;
  }
}

.certificate-search {
  width: min(320px, 100%);
}

.certificate-table-scroll {
  overflow-x: auto;
}

.certificate-course-table,
.certificate-learner-table {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
  color: #1f2937;

  th,
  td {
    padding: 14px 12px;
    border: 1px solid #dfe7ef;
    vertical-align: top;
  }

  th {
    background: #e7e7e7;
    color: #344054;
    font-weight: 800;
  }

  tbody tr:nth-child(even) {
    background: #fbfdff;
  }
}

.course-title-button {
  display: block;
  padding: 0;
  border: 0;
  color: #d97706;
  background: transparent;
  font: inherit;
  font-weight: 700;
  text-align: left;
  cursor: pointer;
}

.course-title-en,
.certificate-learner-table td span {
  display: block;
  margin-top: 4px;
  color: #667085;
}

.schedule-lines {
  display: grid;
  gap: 4px;
}

.empty-cell {
  padding: 28px !important;
  color: #667085;
  text-align: center;
}

.course-detail-summary {
  display: grid;
  grid-template-columns: 180px 1fr;
  gap: 14px 20px;
  max-width: 900px;
  margin: 12px auto 28px;
  color: #1f2937;

  strong,
  span {
    display: block;
  }

  span {
    margin-top: 4px;
    color: #2563eb;
  }
}

.summary-label {
  color: #344054;
  font-weight: 800;
  text-align: right;
}

@media (max-width: 700px) {
  .certificate-page__inner {
    padding: 24px 14px 40px;
  }

  .certificate-hero,
  .certificate-panel__header {
    flex-direction: column;
  }

  .certificate-panel {
    padding: 18px;
  }

  .course-detail-summary {
    grid-template-columns: 1fr;
  }

  .summary-label {
    text-align: left;
  }
}
</style>
