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
import { ref, reactive } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { useRouter } from 'vue-router';

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

const assignmentTitle = ref('ใบงานวิเคราะห์กรณีศึกษา');
const courseCode = ref('GEM201');
const totalStudents = 40;
const submittedCount = 31;
const filter = ref('');
const loading = ref(false);

const stats = [
  { label: 'ส่งแล้ว', value: '31', icon: 'send', color: '#1976d2', bg: '#e3f2fd' },
  { label: 'ตรวจแล้ว', value: '22', icon: 'fact_check', color: '#2e7d32', bg: '#e8f5e9' },
  { label: 'รอการตรวจ', value: '9', icon: 'pending_actions', color: '#f57c00', bg: '#fff3e0' },
  { label: 'คะแนนเฉลี่ย', value: '84.5', icon: 'analytics', color: '#673ab7', bg: '#f3e5f5' },
];

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
    label: 'ไฟล์ที่ส่ง / วันเวลา',
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

const submissions = ref<Submission[]>([
  {
    id: '6501001',
    name: 'นายกิตติคุณ มั่งมี',
    submittedAt: '30 เม.ย. 14:22',
    fileName: 'case_study_v1.pdf',
    status: 'ตรวจแล้ว',
    score: 85,
    feedback: '',
  },
  {
    id: '6501002',
    name: 'นางสาวนลินี มีสุข',
    submittedAt: '30 เม.ย. 15:10',
    fileName: 'analysis_final.pdf',
    status: 'รอตรวจ',
    score: null,
    feedback: '',
  },
  {
    id: '6501003',
    name: 'นายวรวุฒิ ใจดี',
    submittedAt: '29 เม.ย. 09:45',
    fileName: 'homework2.pdf',
    status: 'ตรวจแล้ว',
    score: 78,
    feedback: '',
  },
  {
    id: '6501004',
    name: 'นางสาวอลิสา สดใส',
    submittedAt: '29 เม.ย. 11:30',
    fileName: 'final_report.pdf',
    status: 'รอตรวจ',
    score: null,
    feedback: '',
  },
  {
    id: '6501005',
    name: 'นายธนกร ร่ำรวย',
    submittedAt: null,
    fileName: null,
    status: 'ยังไม่ส่ง',
    score: 0,
    feedback: '',
  },
]);

const feedbackDialog = reactive({
  show: false,
  studentName: '',
  text: '',
  currentIndex: -1,
});

function getStatusColor(status: string) {
  if (status === 'ตรวจแล้ว') return 'positive';
  if (status === 'รอตรวจ') return 'warning';
  return 'grey-6';
}

function onScoreChange(row: Submission) {
  if (row.score !== null) {
    row.status = 'ตรวจแล้ว';
    $q.notify({
      type: 'info',
      message: `บันทึกคะแนนให้ ${row.name} แล้ว`,
      position: 'bottom-right',
      timeout: 1000,
    });
  }
}

function openFeedback(row: Submission) {
  feedbackDialog.studentName = row.name;
  feedbackDialog.text = row.feedback;
  feedbackDialog.show = true;
  feedbackDialog.currentIndex = submissions.value.indexOf(row);
}

function saveFeedback() {
  const index = feedbackDialog.currentIndex;
  if (index > -1 && submissions.value[index]) {
    submissions.value[index].feedback = feedbackDialog.text;
    $q.notify({
      type: 'positive',
      message: 'บันทึกข้อเสนอแนะแล้ว',
      position: 'top',
    });
  }
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
