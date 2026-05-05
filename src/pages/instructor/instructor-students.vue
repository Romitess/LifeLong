<template>
  <q-page class="instructor-students-page">
    <div class="section-container instructor-students">
      <section class="students-hero">
        <div>
          <div class="students-hero__eyebrow">Student Roster</div>
          <h1>รายชื่อนิสิต</h1>
          <p v-if="selectedCourse">
            {{ selectedCourse.code }} · {{ selectedCourse.titleEn || selectedCourse.title }}
          </p>
          <p v-else>เลือกคอร์สเพื่อดูรายชื่อนิสิตและรายละเอียดรายบุคคล</p>
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

      <section v-if="!selectedCourse" class="student-course-grid">
        <button
          v-for="course in instructorCourses"
          :key="course.id"
          type="button"
          class="student-course-card"
          @click="selectCourse(course.id)"
        >
          <img :src="course.imageUrl" :alt="course.titleEn || course.title" />
          <div class="student-course-card__body">
            <div class="student-course-card__code">{{ course.code }}</div>
            <h2>{{ course.titleEn || course.title }}</h2>
            <div class="student-course-card__meta">
              <span
                ><q-icon name="groups" /> {{ course.enrolledCount.toLocaleString() }} นิสิต</span
              >
              <span
                ><q-icon name="event_seat" /> {{ course.maxSeats.toLocaleString() }} ที่นั่ง</span
              >
            </div>
          </div>
          <q-icon name="chevron_right" color="primary" size="26px" />
        </button>
      </section>

      <section v-else class="student-roster-panel">
        <div class="student-roster-panel__summary">
          <div>
            <span>ลงทะเบียนแล้ว</span>
            <strong>{{ selectedCourse.enrolledCount.toLocaleString() }}</strong>
          </div>
          <div>
            <span>จำนวนที่นั่ง</span>
            <strong>{{ selectedCourse.maxSeats.toLocaleString() }}</strong>
          </div>
          <div>
            <span>ความคืบหน้าเฉลี่ย</span>
            <strong>{{ averageProgress }}%</strong>
          </div>
        </div>

        <q-table
          v-if="learners.length > 0"
          flat
          :rows="learners"
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
              {{ selectedLearner.studentId }} · {{ selectedLearner.email }}
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
import { computed, ref } from 'vue';
import { type QTableColumn } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';
import { getCourseStructure } from 'src/data/course-structure';
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
}

const authStore = useAuthStore();
const courseStore = useCourseStore();
courseStore.init();

const selectedCourseId = ref('');
const learnerDetailDialogOpen = ref(false);
const selectedLearner = ref<LearnerRow | null>(null);

const instructorCourses = computed<Course[]>(() =>
  courseStore.getInstructorCourses(authStore.user),
);
const selectedCourse = computed<Course | undefined>(() =>
  instructorCourses.value.find((course) => course.id === selectedCourseId.value),
);

const learnerNamePool = [
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
  'ชยพล ตั้งใจ',
  'สุภาวดี เรียนดี',
  'ภานุวัฒน์ กล้าคิด',
  'ณิชา พัฒนา',
  'พีรพล ศึกษา',
];

const facultyPool = [
  { faculty: 'คณะวิทยาการสารสนเทศ', department: 'สาขาวิทยาการคอมพิวเตอร์' },
  { faculty: 'คณะวิทยาศาสตร์', department: 'ภาควิชาเคมี' },
  { faculty: 'คณะวิศวกรรมศาสตร์', department: 'สาขาวิศวกรรมคอมพิวเตอร์' },
  { faculty: 'คณะมนุษยศาสตร์และสังคมศาสตร์', department: 'สาขานิเทศศาสตร์' },
];
const defaultLearnerUnit = facultyPool[0] ?? {
  faculty: 'มหาวิทยาลัยบูรพา',
  department: 'Lifelong Learning',
};

function getLearnerStatus(progress: number): Pick<LearnerRow, 'status' | 'statusColor'> {
  if (progress >= 85) return { status: 'เรียนต่อเนื่อง', statusColor: 'positive' };
  if (progress >= 60) return { status: 'ปกติ', statusColor: 'primary' };
  if (progress >= 35) return { status: 'ควรติดตาม', statusColor: 'warning' };
  return { status: 'เสี่ยงหลุด', statusColor: 'negative' };
}

function buildLearnersForCourse(course: Course | undefined): LearnerRow[] {
  if (!course || course.enrolledCount <= 0) return [];

  const totalLessons =
    getCourseStructure(course.id).reduce((sum, module) => sum + module.lessons.length, 0) || 8;

  return Array.from({ length: course.enrolledCount }, (_, index) => {
    const name = learnerNamePool[index % learnerNamePool.length] ?? `ผู้เรียน ${index + 1}`;
    const unit = facultyPool[index % facultyPool.length] ?? defaultLearnerUnit;
    const progress = (course.id.charCodeAt(0) * 9 + index * 17) % 101;
    const completedLessons = Math.min(totalLessons, Math.round((progress / 100) * totalLessons));
    const status = getLearnerStatus(progress);
    const studentNumber = `C69${String(index + 1355).padStart(5, '0')}`;
    const emailPrefix =
      index === 0 && course.id === '4'
        ? 'student'
        : `student${course.id}${String(index + 1).padStart(3, '0')}`;

    return {
      id: `${course.id}-${studentNumber}`,
      studentId: index === 0 && course.id === '4' ? 'C6901355' : studentNumber,
      name,
      email: `${emailPrefix}@go.buu.ac.th`,
      avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(`${course.id}-${name}-${index}`)}`,
      faculty: unit.faculty,
      department: unit.department,
      phone: `08${String((course.id.charCodeAt(0) + index * 37) % 100000000).padStart(8, '0')}`,
      progress,
      lastActive:
        index % 5 === 0 ? 'วันนี้ 10:24' : index % 5 === 1 ? 'เมื่อวาน' : `${index + 1} วันที่แล้ว`,
      score: progress < 30 ? 'ยังไม่ประเมิน' : `${Math.min(100, Math.max(55, progress + 6))}/100`,
      ...status,
      enrolledAt: `2569-04-${String((index % 20) + 1).padStart(2, '0')}`,
      paymentStatus: course.isFree ? 'ไม่มีค่าใช้จ่าย' : index % 4 === 0 ? 'รอตรวจสอบ' : 'ชำระแล้ว',
      completedLessons,
      totalLessons,
    };
  });
}

const learners = computed<LearnerRow[]>(() => buildLearnersForCourse(selectedCourse.value));
const averageProgress = computed(() => {
  if (learners.value.length === 0) return 0;
  const total = learners.value.reduce((sum, learner) => sum + learner.progress, 0);
  return Math.round(total / learners.value.length);
});

const learnerColumns: QTableColumn<LearnerRow>[] = [
  { name: 'name', label: 'นิสิต', field: 'name', align: 'left', sortable: true },
  { name: 'email', label: 'อีเมล', field: 'email', align: 'left' },
  { name: 'progress', label: 'ความก้าวหน้า', field: 'progress', align: 'left', sortable: true },
  { name: 'score', label: 'คะแนน', field: 'score', align: 'left' },
  { name: 'lastActive', label: 'เข้าเรียนล่าสุด', field: 'lastActive', align: 'left' },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'left' },
  { name: 'actions', label: '', field: 'id', align: 'right' },
];

function selectCourse(courseId: string): void {
  selectedCourseId.value = courseId;
  selectedLearner.value = null;
}

function clearSelectedCourse(): void {
  selectedCourseId.value = '';
  selectedLearner.value = null;
}

function openLearnerDetail(_event: Event | null, learner: LearnerRow): void {
  selectedLearner.value = learner;
  learnerDetailDialogOpen.value = true;
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
.student-course-card__code {
  color: $primary;
  font-size: 0.78rem;
  font-weight: 900;
  text-transform: uppercase;
}

.student-course-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.student-course-card {
  display: grid;
  grid-template-columns: 156px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  width: 100%;
  padding: 14px;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease,
    box-shadow 0.2s ease;

  &:hover {
    border-color: rgba(25, 118, 210, 0.38);
    box-shadow: 0 16px 34px rgba(15, 23, 42, 0.1);
    transform: translateY(-1px);
  }

  img {
    width: 156px;
    height: 98px;
    border-radius: 10px;
    object-fit: cover;
  }

  h2 {
    display: -webkit-box;
    overflow: hidden;
    margin: 4px 0 12px;
    color: #09213f;
    font-size: 1.05rem;
    font-weight: 900;
    line-height: 1.35;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }
}

.student-course-card__body {
  min-width: 0;
}

.student-course-card__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  color: #64748b;
  font-size: 0.84rem;
  font-weight: 800;

  span {
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
}

.student-roster-panel {
  padding: 18px;
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

@media (max-width: 980px) {
  .student-course-grid,
  .student-roster-panel__summary,
  .student-detail-stats {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 680px) {
  .students-hero {
    align-items: stretch;
    flex-direction: column;
  }

  .student-course-card {
    grid-template-columns: 96px minmax(0, 1fr) auto;

    img {
      width: 96px;
      height: 76px;
    }
  }

  .student-detail-info {
    grid-template-columns: 1fr;
  }
}
</style>
