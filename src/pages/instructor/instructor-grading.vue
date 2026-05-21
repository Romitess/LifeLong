<template>
  <q-page class="grading-page bg-grey-1">
    <div class="section-container q-py-lg">
      <!-- ─── HEADER ─── -->
      <div class="row items-center q-mb-lg">
        <q-btn
          flat
          round
          icon="arrow_back"
          color="primary"
          @click="router.back()"
          class="q-mr-md"
        />
        <div>
          <div class="text-overline text-primary">การตรวจงานและให้คะแนน</div>
          <h1 class="text-h4 text-weight-bold q-my-none">{{ assignmentTitle }}</h1>
          <div class="text-subtitle2 text-grey-7">
            รหัสวิชา: {{ courseCode }} • ส่งแล้ว {{ submittedCount }}/{{ totalStudents }} คน
          </div>
        </div>
        <q-space />
        <div class="q-gutter-sm">
          <q-btn outline color="primary" icon="download" label="ส่งออกคะแนน (CSV)" no-caps />
          <q-btn unelevated color="primary" icon="publish" label="ประกาศคะแนนทั้งหมด" no-caps />
        </div>
      </div>

      <!-- ─── STATS CARDS ─── -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div v-for="stat in stats" :key="stat.label" class="col-12 col-sm-6 col-md-3">
          <q-card flat class="stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="stat-icon" :style="{ background: stat.bg, color: stat.color }">
                <q-icon :name="stat.icon" size="24px" />
              </div>
              <div class="q-ml-md">
                <div class="text-h5 text-weight-bold">{{ stat.value }}</div>
                <div class="text-caption text-grey-7">{{ stat.label }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- ─── SUBMISSIONS TABLE ─── -->
      <q-card flat class="table-card overflow-hidden">
        <q-table
          :rows="submissions"
          :columns="columns"
          row-key="id"
          flat
          :filter="filter"
          :loading="loading"
          class="grading-table"
        >
          <template v-slot:top-right>
            <q-input
              borderless
              dense
              debounce="300"
              v-model="filter"
              placeholder="ค้นหาชื่อนิสิต..."
              outlined
              class="bg-white"
            >
              <template v-slot:append>
                <q-icon name="search" />
              </template>
            </q-input>
          </template>

          <template v-slot:body-cell-student="props">
            <q-td :props="props">
              <div class="row items-center no-wrap">
                <q-avatar size="32px" class="q-mr-sm">
                  <img :src="`https://i.pravatar.cc/150?u=${props.row.id}`" />
                </q-avatar>
                <div>
                  <div class="text-weight-bold">{{ props.row.name }}</div>
                  <div class="text-caption text-grey-7">{{ props.row.id }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-submission="props">
            <q-td :props="props">
              <div v-if="props.row.submittedAt">
                <div class="text-weight-medium">{{ props.row.submittedAt }}</div>
                <q-btn
                  flat
                  dense
                  color="primary"
                  icon="attach_file"
                  :label="props.row.fileName"
                  size="sm"
                  class="q-px-none"
                  no-caps
                />
              </div>
              <q-badge v-else color="grey-4" text-color="grey-7" label="ยังไม่ได้ส่ง" />
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-badge :color="getStatusColor(props.row.status)" rounded class="q-px-sm">
                {{ props.row.status }}
              </q-badge>
            </q-td>
          </template>

          <template v-slot:body-cell-score="props">
            <q-td :props="props">
              <div class="row items-center no-wrap" style="width: 120px">
                <q-input
                  v-model.number="props.row.score"
                  type="number"
                  outlined
                  dense
                  class="bg-white col"
                  input-class="text-center text-weight-bold"
                  suffix="/100"
                  @change="onScoreChange(props.row)"
                />
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn
                flat
                round
                dense
                icon="rate_review"
                color="primary"
                @click="openFeedback(props.row)"
              >
                <q-tooltip>ให้คำแนะนำ</q-tooltip>
              </q-btn>
              <q-btn flat round dense icon="history" color="grey-7">
                <q-tooltip>ดูประวัติการส่ง</q-tooltip>
              </q-btn>
            </q-td>
          </template>
        </q-table>
      </q-card>
    </div>

    <!-- ─── FEEDBACK DIALOG ─── -->
    <q-dialog v-model="feedbackDialog.show" persistent>
      <q-card style="min-width: 450px">
        <q-card-section class="row items-center">
          <div class="text-h6">ข้อเสนอแนะ: {{ feedbackDialog.studentName }}</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-none">
          <q-input
            v-model="feedbackDialog.text"
            type="textarea"
            outlined
            label="คำแนะนำสำหรับนิสิต..."
            rows="5"
          />
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md">
          <q-btn flat label="ยกเลิก" v-close-popup />
          <q-btn unelevated color="primary" label="บันทึก" @click="saveFeedback" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';
import { useInstructorBackend } from 'src/composables/use-instructor-backend';

interface Submission {
  id: string;
  name: string;
  submittedAt: string | null;
  fileName: string | null;
  status: string;
  score: number | null;
  feedback: string;
}

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const courseStore = useCourseStore();
const instructorBackend = useInstructorBackend();

const filter = ref('');
const loading = ref(false);

onMounted(() => {
  courseStore.init();
  const email = authStore.user?.email;
  if (email) {
    void courseStore.fetchInstructorCourses(email);
  }
});

const instructorCourses = computed(() => courseStore.getInstructorCourses(authStore.user));
const selectedCourse = computed(() => instructorCourses.value[0]);
const assignmentTitle = computed(() => selectedCourse.value?.title ?? 'รายการคะแนน');
const courseCode = computed(() => selectedCourse.value?.code ?? '-');

watch(
  selectedCourse,
  async (course) => {
    const email = authStore.user?.email;
    if (!course || !email) return;
    loading.value = true;
    try {
      await Promise.all([
        instructorBackend.fetchLearners(email, course.id),
        instructorBackend.fetchGrades(email, course.id),
      ]);
    } finally {
      loading.value = false;
    }
  },
  { immediate: true },
);

const submissions = computed<Submission[]>(() => {
  const course = selectedCourse.value;
  if (!course) return [];
  const learners = instructorBackend.learnersByCourseId.value[course.id] ?? [];
  const grades = instructorBackend.gradesByCourseId.value[course.id] ?? [];

  return learners.map((learner) => {
    const grade = grades.find(
      (candidate) =>
        candidate.learnerUserId === learner.userId || candidate.studentId === learner.studentId,
    );
    return {
      id: learner.studentId,
      name: learner.fullName,
      submittedAt: grade?.updatedAt ? formatDateTime(grade.updatedAt) : null,
      fileName: grade?.grade ?? null,
      status: getGradeStatus(grade?.status),
      score: grade?.score ?? null,
      feedback: '',
    };
  });
});

const totalStudents = computed(() => submissions.value.length);
const submittedCount = computed(() => submissions.value.filter((row) => row.score !== null).length);
const reviewedCount = computed(
  () => submissions.value.filter((row) => row.status === 'ตรวจแล้ว').length,
);
const pendingCount = computed(
  () => submissions.value.filter((row) => row.status !== 'ตรวจแล้ว').length,
);
const averageScore = computed(() => {
  const scores = submissions.value
    .map((row) => row.score)
    .filter((score): score is number => typeof score === 'number');
  if (!scores.length) return '-';
  return (scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(2);
});

const stats = computed(() => [
  {
    label: 'มีคะแนนแล้ว',
    value: submittedCount.value.toLocaleString('th-TH'),
    icon: 'send',
    color: '#1976d2',
    bg: '#e3f2fd',
  },
  {
    label: 'ตรวจแล้ว',
    value: reviewedCount.value.toLocaleString('th-TH'),
    icon: 'fact_check',
    color: '#2e7d32',
    bg: '#e8f5e9',
  },
  {
    label: 'รอคะแนน',
    value: pendingCount.value.toLocaleString('th-TH'),
    icon: 'pending_actions',
    color: '#f57c00',
    bg: '#fff3e0',
  },
  {
    label: 'คะแนนเฉลี่ย',
    value: averageScore.value,
    icon: 'analytics',
    color: '#673ab7',
    bg: '#f3e5f5',
  },
]);

const columns: QTableColumn<Submission>[] = [
  {
    name: 'student',
    label: 'ชื่อ-นามสกุล / รหัสประจำตัว',
    align: 'left',
    field: 'name',
    sortable: true,
  },
  {
    name: 'submission',
    label: 'ข้อมูลคะแนนจากระบบ',
    align: 'left',
    field: (row) => row.submittedAt || '',
    sortable: true,
  },
  { name: 'status', label: 'สถานะ', align: 'center', field: 'status', sortable: true },
  {
    name: 'score',
    label: 'คะแนน',
    align: 'center',
    field: (row) => row.score || 0,
    sortable: true,
  },
  { name: 'actions', label: '', align: 'right', field: 'id' },
];

const feedbackDialog = reactive({
  show: false,
  studentName: '',
  text: '',
  currentIndex: -1,
});

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getGradeStatus(status: 'passed' | 'failed' | 'pending' | undefined): string {
  if (status === 'passed' || status === 'failed') return 'ตรวจแล้ว';
  return 'รอคะแนน';
}

function getStatusColor(status: string) {
  if (status === 'ตรวจแล้ว') return 'positive';
  if (status === 'รอคะแนน') return 'warning';
  return 'grey-6';
}

function onScoreChange(row: Submission) {
  $q.notify({
    type: 'info',
    message: `คะแนนของ ${row.name} มาจาก backend/Moodle โดยตรง`,
    position: 'bottom-right',
    timeout: 1000,
  });
}

function openFeedback(row: Submission) {
  feedbackDialog.studentName = row.name;
  feedbackDialog.text = row.feedback;
  feedbackDialog.show = true;
  feedbackDialog.currentIndex = submissions.value.indexOf(row);
}

function saveFeedback() {
  $q.notify({
    type: 'info',
    message: 'การบันทึก feedback จะเชื่อม backend ในขั้นถัดไป',
    position: 'top',
  });
  feedbackDialog.show = false;
}
</script>

<style lang="scss" scoped>
.grading-page {
  min-height: 100vh;
}

.stat-card {
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.table-card {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.08);
}

.grading-table {
  background: white;

  :deep(.q-table__middle) {
    max-height: 600px;
  }

  :deep(thead tr th) {
    font-weight: 800;
    color: #455a64;
    background: #f8fafc;
  }
}
</style>
