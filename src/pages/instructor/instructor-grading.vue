<template>
  <q-page class="grading-page">
    <!-- ─── HERO ─── -->
    <AdminPageHero
      eyebrow="Grading"
      eyebrow-icon="grading"
      :title="assignmentTitle"
      :description="`รหัสวิชา: ${courseCode} · ผู้เรียน ${totalStudents} คน`"
    >
      <template #aside>
        <div class="grading-hero-actions">
          <q-btn
            class="grading-hero-btn grading-hero-btn--outline"
            icon="open_in_new"
            label="เปิดใน Moodle"
            unelevated
            no-caps
            :disable="!selectedCourse?.moodleId"
            :loading="moodleOpening"
            @click="openInMoodle"
          />
          <q-btn
            class="grading-hero-btn grading-hero-btn--gold"
            icon="sync"
            label="Sync คะแนน"
            unelevated
            no-caps
            :loading="syncing"
            @click="onSyncScores"
          />
        </div>
      </template>
    </AdminPageHero>

    <div class="grading-content">
      <!-- ─── BACK ─── -->
      <q-btn
        unelevated
        color="primary"
        icon="arrow_back"
        label="กลับ"
        no-caps
        class="grading-back-btn q-mb-lg"
        @click="router.back()"
      />

      <!-- ─── STATS ─── -->
      <div class="row q-col-gutter-md q-mb-lg">
        <div v-for="stat in stats" :key="stat.label" class="col-12 col-sm-6 col-md-3">
          <BaseInfoCard
            variant="stat"
            :tone="stat.tone"
            :icon="stat.icon"
            :value="stat.value"
            :title="stat.label"
            description=""
          />
        </div>
      </div>

      <!-- ─── TABLE CARD ─── -->
      <BaseSurfaceCard
        eyebrow="Score Report"
        title="รายการคะแนน"
        subtitle="ดึงข้อมูลจาก LLTENROLL · คะแนน Moodle จาก LMS_FINALSCORE"
        body-padding="none"
      >
        <template #header-actions>
          <span class="grading-surface__count">
            {{ filteredSubmissions.length.toLocaleString('th-TH') }} รายการ
          </span>
        </template>

        <div class="grading-surface__toolbar">
          <q-input
            v-model="search"
            dense
            outlined
            placeholder="ค้นหาชื่อหรือรหัสนิสิต..."
            class="grading-surface__search"
          >
            <template #prepend><q-icon name="search" /></template>
            <template v-if="search" #append>
              <q-icon name="close" class="cursor-pointer" @click="search = ''" />
            </template>
          </q-input>
        </div>

        <div class="grading-table-wrap" :class="{ 'grading-table-wrap--loading': loading }">
          <table class="grading-table">
            <colgroup>
              <col class="grading-table__col-index" />
              <col class="grading-table__col-student" />
              <col class="grading-table__col-score" />
              <col class="grading-table__col-status" />
              <col class="grading-table__col-actions" />
            </colgroup>
            <thead>
              <tr>
                <th class="text-center">ลำดับ</th>
                <th>ชื่อ-นามสกุล / รหัสประจำตัว</th>
                <th class="text-center">คะแนนรวม</th>
                <th class="text-center">สถานะ</th>
                <th class="text-center">รายละเอียด</th>
              </tr>
            </thead>
            <tbody>
              <template v-if="loading && paginatedSubmissions.length === 0">
                <tr v-for="n in rowsPerPage" :key="`sk-${n}`" class="grading-table__skeleton-row">
                  <td class="text-center">
                    <q-skeleton type="text" width="20px" class="q-mx-auto" />
                  </td>
                  <td>
                    <q-skeleton type="text" width="70%" />
                    <q-skeleton type="text" width="40%" class="q-mt-xs" />
                  </td>
                  <td class="text-center">
                    <q-skeleton type="text" width="48px" class="q-mx-auto" />
                  </td>
                  <td class="text-center">
                    <q-skeleton type="QChip" width="72px" class="q-mx-auto" />
                  </td>
                  <td class="text-center">
                    <q-skeleton type="QBtn" width="100px" class="q-mx-auto" />
                  </td>
                </tr>
              </template>

              <template v-else-if="paginatedSubmissions.length > 0">
                <tr
                  v-for="(row, index) in paginatedSubmissions"
                  :key="row.id"
                  class="grading-table__row"
                >
                  <td class="grading-table__index">{{ firstRowIndex + index + 1 }}</td>
                  <td>
                    <div class="grading-table__name-cell">
                      <span class="grading-table__name">{{ row.name }}</span>
                      <span class="grading-table__id">{{ row.id }}</span>
                    </div>
                  </td>
                  <td class="text-center">
                    <div v-if="row.lmsFinalscore !== null" class="grading-table__score-cell">
                      <span class="grading-table__score">{{ row.lmsFinalscore }}</span>
                      <span class="grading-table__score-label">/ 100</span>
                    </div>
                    <span v-else class="grading-table__no-score">—</span>
                  </td>
                  <td class="text-center">
                    <q-badge
                      rounded
                      :color="getStatusColor(row.status)"
                      :label="row.status"
                      class="grading-table__badge"
                    />
                  </td>
                  <td class="text-center">
                    <button class="grading-detail-btn" @click="openPanel(row)">
                      <q-icon name="assignment" size="14px" />
                      ดูรายละเอียด
                    </button>
                  </td>
                </tr>

                <tr v-if="fillerRowHeight > 0" class="grading-table__filler-row">
                  <td colspan="5" :style="{ height: `${fillerRowHeight}px` }" />
                </tr>
              </template>

              <tr v-else>
                <td colspan="5" class="grading-table__empty">
                  {{ search ? 'ไม่พบนิสิตที่ตรงกับคำค้นหา' : 'ยังไม่มีข้อมูลผู้เรียน' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="totalPages > 1" class="grading-surface__pagination">
          <BasePagination
            :model-value="currentPage"
            :max="totalPages"
            @update:model-value="currentPage = $event"
          />
        </div>
      </BaseSurfaceCard>
    </div>

    <!-- ─── GRADE DETAIL PANEL ─── -->
    <Teleport to="body">
      <!-- Overlay -->
      <div v-if="panelOpen" class="grading-panel-overlay" @click="closePanel" />

      <!-- Panel -->
      <transition name="panel-slide">
        <div v-if="panelOpen" class="grading-panel">
          <!-- Panel header -->
          <div class="grading-panel__header">
            <div class="grading-panel__title-group">
              <p class="grading-panel__eyebrow">Grade Breakdown</p>
              <h3 class="grading-panel__title">{{ panelRow?.name }}</h3>
              <span class="grading-panel__sub">{{ panelRow?.id }}</span>
            </div>
            <button class="grading-panel__close" aria-label="ปิด" @click="closePanel">
              <q-icon name="close" size="20px" />
            </button>
          </div>

          <!-- Total score pill -->
          <div class="grading-panel__total">
            <span class="grading-panel__total-label">คะแนนรวม</span>
            <span class="grading-panel__total-value">
              {{ panelRow?.lmsFinalscore ?? '—' }}
              <span v-if="panelRow?.lmsFinalscore !== null" class="grading-panel__total-max"
                >/ 100</span
              >
            </span>
            <q-badge
              rounded
              :color="getStatusColor(panelRow?.status ?? '')"
              :label="panelRow?.status"
              class="grading-table__badge"
            />
          </div>

          <!-- Grade items -->
          <div class="grading-panel__body">
            <div v-if="!panelRow?.gradeItems.length" class="grading-panel__empty">
              ยังไม่มีข้อมูลคะแนนรายงาน
            </div>
            <div
              v-for="item in panelRow?.gradeItems"
              :key="`${item.itemmodule}:${item.itemname}`"
              class="grading-panel__item"
            >
              <div class="grading-panel__item-left">
                <span
                  class="grading-panel__module-badge"
                  :class="`grading-panel__module-badge--${item.itemmodule ?? 'mod'}`"
                >
                  {{
                    item.itemmodule === 'assign'
                      ? 'งาน'
                      : item.itemmodule === 'quiz'
                        ? 'แบบทดสอบ'
                        : (item.itemmodule ?? 'งาน')
                  }}
                </span>
                <span class="grading-panel__item-name">{{ item.itemname ?? '—' }}</span>
              </div>
              <div class="grading-panel__item-right">
                <div class="grading-panel__item-score">
                  <span v-if="item.score !== null" class="grading-panel__score">{{
                    item.score
                  }}</span>
                  <span v-if="item.score !== null" class="grading-panel__score-max"
                    >/ {{ item.maxScore ?? 100 }}</span
                  >
                  <span v-else class="grading-panel__no-score">—</span>
                </div>
                <a
                  v-if="
                    item.itemmodule === 'assign' &&
                    moodleGraderUrl(item.cmid, panelRow?.moodleUserId ?? null)
                  "
                  :href="moodleGraderUrl(item.cmid, panelRow?.moodleUserId ?? null)!"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="grading-panel__grade-btn"
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
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';
import { useInstructorBackend } from 'src/composables/use-instructor-backend';
import type { GradeItemBreakdown } from 'src/composables/use-instructor-backend';
import BaseInfoCard from 'src/components/base/BaseInfoCard.vue';
import BasePagination from 'src/components/base/BasePagination.vue';
import AdminPageHero from 'src/components/admin/AdminPageHero.vue';
import BaseSurfaceCard from 'src/components/base/BaseSurfaceCard.vue';
import { api } from 'src/boot/axios';

const MOODLE_BASE_URL =
  (import.meta.env.VITE_MOODLE_URL as string | undefined) ?? 'http://localhost:8080';

interface Submission {
  id: string;
  name: string;
  moodleUserId: number | null;
  submittedAt: string | null;
  fileName: string | null;
  status: string;
  score: number | null;
  lmsFinalscore: number | null;
  lmsSyncedAt: string | null;
  feedback: string;
  gradeItems: GradeItemBreakdown[];
}

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const courseStore = useCourseStore();
const instructorBackend = useInstructorBackend();

const search = ref('');
const currentPage = ref(1);
const loading = ref(false);
const syncing = ref(false);
const moodleOpening = ref(false);
const panelOpen = ref(false);
const panelRow = ref<Submission | null>(null);

const rowsPerPage = 10;
const tableRowHeight = 68;
const tableHeaderHeight = 48;

function openPanel(row: Submission) {
  panelRow.value = row;
  panelOpen.value = true;
}

function closePanel() {
  panelOpen.value = false;
}

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
      moodleUserId: grade?.moodleUserId ?? null,
      submittedAt: grade?.updatedAt ? formatDateTime(grade.updatedAt) : null,
      fileName: grade?.grade ?? null,
      status: getGradeStatus(grade?.status),
      score: grade?.score ?? null,
      lmsFinalscore: grade?.lmsFinalscore ?? null,
      lmsSyncedAt: grade?.lmsSyncedAt ? formatDateTime(grade.lmsSyncedAt) : null,
      feedback: '',
      gradeItems: grade?.gradeItems ?? [],
    };
  });
});

const filteredSubmissions = computed<Submission[]>(() => {
  const q = search.value.trim().toLowerCase();
  if (!q) return submissions.value;
  return submissions.value.filter(
    (row) => row.name.toLowerCase().includes(q) || row.id.toLowerCase().includes(q),
  );
});

const totalPages = computed(() =>
  Math.max(1, Math.ceil(filteredSubmissions.value.length / rowsPerPage)),
);
const firstRowIndex = computed(() => (currentPage.value - 1) * rowsPerPage);
const paginatedSubmissions = computed(() =>
  filteredSubmissions.value.slice(firstRowIndex.value, firstRowIndex.value + rowsPerPage),
);
const fillerRowHeight = computed(() =>
  Math.max(0, (rowsPerPage - paginatedSubmissions.value.length) * tableRowHeight),
);
const tableViewportHeight = `${rowsPerPage * tableRowHeight + tableHeaderHeight}px`;

watch(search, () => {
  currentPage.value = 1;
});

function moodleGraderUrl(cmid: number | null, moodleUserId: number | null): string | null {
  if (!cmid || !moodleUserId) return null;
  return `${MOODLE_BASE_URL}/mod/assign/view.php?id=${cmid}&action=grader&userid=${moodleUserId}`;
}

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
    tone: 'blue' as const,
  },
  {
    label: 'ตรวจแล้ว',
    value: reviewedCount.value.toLocaleString('th-TH'),
    icon: 'fact_check',
    tone: 'positive' as const,
  },
  {
    label: 'รอคะแนน',
    value: pendingCount.value.toLocaleString('th-TH'),
    icon: 'pending_actions',
    tone: 'amber' as const,
  },
  {
    label: 'คะแนนเฉลี่ย',
    value: averageScore.value,
    icon: 'analytics',
    tone: 'secondary' as const,
  },
]);

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

function getStatusColor(status: string): string {
  if (status === 'ตรวจแล้ว') return 'positive';
  if (status === 'รอคะแนน') return 'warning';
  return 'grey-6';
}

async function openInMoodle() {
  const course = selectedCourse.value;
  const username = authStore.user?.username || authStore.user?.email;
  if (!course?.moodleId || !username) return;
  moodleOpening.value = true;
  try {
    const { data } = await api.get<{ url: string }>(
      `/api/moodle/instructor-course-url/${course.moodleId}?username=${encodeURIComponent(username)}`,
    );
    window.open(data.url, '_blank', 'noopener,noreferrer');
  } catch {
    $q.notify({
      type: 'negative',
      message: 'ไม่สามารถเชื่อมต่อ Moodle ได้ในขณะนี้',
      position: 'top',
    });
  } finally {
    moodleOpening.value = false;
  }
}

async function onSyncScores() {
  const course = selectedCourse.value;
  const email = authStore.user?.email;
  if (!course || !email) return;

  syncing.value = true;
  try {
    const result = await instructorBackend.syncScores(email, course.id);
    if (result) {
      $q.notify({
        type: 'positive',
        message: `Sync สำเร็จ: ${result.synced} คน (ข้าม ${result.skipped}, ผิดพลาด ${result.errors})`,
        position: 'top',
      });
      await instructorBackend.fetchGrades(email, course.id);
    }
  } finally {
    syncing.value = false;
  }
}
</script>

<style lang="scss" scoped>
.grading-page {
  --grading-table-height: v-bind('tableViewportHeight');
  --admin-radius-lg: 16px;
  --admin-radius-md: 12px;
  --admin-gold: #f5a623;
  --admin-navy: #10233f;
  min-height: 100vh;
  background: #f8f6f1;
}

.grading-content {
  width: min(1320px, calc(100% - 32px));
  margin: 0 auto;
  padding: 40px 0 72px;
}

// ── Hero buttons ─────────────────────────────────────────
.grading-hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.grading-hero-btn {
  min-height: 44px;
  border-radius: 12px !important;
  font-weight: 700;
  padding: 0 20px;

  &--gold {
    background: #f5a623 !important;
    color: #ffffff !important;
    border: 1px solid rgba(245, 166, 35, 0.7) !important;
  }

  &--outline {
    background: rgba(255, 255, 255, 0.08) !important;
    color: #ffffff !important;
    border: 1px solid rgba(255, 255, 255, 0.32) !important;
  }
}

// ── Back button ──────────────────────────────────────────
.grading-back-btn {
  border-radius: 10px !important;
  font-weight: 700;
}

// ── Surface toolbar ──────────────────────────────────────
.grading-surface__toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  padding: 16px 20px 12px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
}

.grading-surface__count {
  color: #475467;
  font-size: 0.82rem;
  font-weight: 700;
}

.grading-surface__search {
  width: min(320px, 100%);

  :deep(.q-field__control) {
    border-radius: 10px;
  }
}

.grading-surface__pagination {
  display: flex;
  justify-content: center;
  padding: 20px 24px 22px;
}

// ── Table ────────────────────────────────────────────────
.grading-table-wrap {
  overflow-x: auto;
  min-height: var(--grading-table-height);
  position: relative;

  &--loading tbody {
    opacity: 0.4;
    pointer-events: none;
    transition: opacity 0.15s ease;
  }
}

.grading-table {
  width: 100%;
  min-width: 680px;
  border-collapse: collapse;

  th,
  td {
    padding: 14px 16px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.07);
    vertical-align: middle;
  }

  thead th {
    background: #f8fafc;
    color: #475467;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  tbody tr.grading-table__skeleton-row:hover,
  tbody tr.grading-table__filler-row:hover {
    background: transparent;
  }

  tbody td {
    height: v-bind('`${tableRowHeight}px`');
  }
}

.grading-table__col-index {
  width: 60px;
}
.grading-table__col-student {
  width: auto;
}
.grading-table__col-score {
  width: 130px;
}
.grading-table__col-status {
  width: 110px;
}
.grading-table__col-actions {
  width: 140px;
}

.grading-table__index {
  color: #1d4ed8;
  font-weight: 800;
  text-align: center;
}

.grading-table__row {
  background: #ffffff;

  &:hover {
    background: rgba(245, 166, 35, 0.05);
  }
}

.grading-table__skeleton-row td {
  background: #ffffff;
}

.grading-table__filler-row td {
  padding: 0 !important;
  border-bottom: 0 !important;
  background: transparent !important;
}

.grading-table__empty {
  height: calc(var(--grading-table-height) - 1px) !important;
  padding: 38px 18px !important;
  color: #64748b;
  text-align: center;
  vertical-align: middle !important;
}

.grading-table__name-cell {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.grading-table__name {
  color: #101828;
  font-size: 0.92rem;
  font-weight: 700;
}

.grading-table__id {
  color: #667085;
  font-size: 0.76rem;
  font-weight: 600;
}

.grading-table__score-cell {
  display: inline-flex;
  align-items: baseline;
  gap: 3px;
}

.grading-table__score {
  color: #101828;
  font-size: 1rem;
  font-weight: 800;
}

.grading-table__score-label {
  color: #94a3b8;
  font-size: 0.75rem;
}

.grading-table__no-score {
  color: #94a3b8;
  font-weight: 700;
}

.grading-table__badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
}

// ── Detail button ────────────────────────────────────────
.grading-detail-btn {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 6px 14px;
  border-radius: 10px;
  border: 1px solid rgba(245, 166, 35, 0.4);
  background: rgba(245, 166, 35, 0.07);
  color: #92400e;
  font-size: 0.8rem;
  font-weight: 700;
  cursor: pointer;
  transition:
    background 0.18s,
    transform 0.18s,
    box-shadow 0.18s;

  &:hover {
    background: rgba(245, 166, 35, 0.18);
    transform: translateY(-1px);
    box-shadow: 0 4px 10px rgba(245, 166, 35, 0.2);
  }
}

// ── Grade detail panel ───────────────────────────────────
.grading-panel-overlay {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.32);
  z-index: 2000;
}

.grading-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: min(440px, 94vw);
  z-index: 2001;
  background: #ffffff;
  box-shadow: -8px 0 40px rgba(15, 23, 42, 0.14);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.grading-panel__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding: 24px 20px 16px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
  flex-shrink: 0;
  background: linear-gradient(180deg, rgba(245, 166, 35, 0.06) 0%, #ffffff 100%);
}

.grading-panel__title-group {
  min-width: 0;
}

.grading-panel__eyebrow {
  margin: 0 0 4px;
  color: #94a3b8;
  font-size: 0.68rem;
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.grading-panel__title {
  margin: 0 0 2px;
  color: #101828;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.grading-panel__sub {
  color: #667085;
  font-size: 0.78rem;
  font-weight: 600;
}

.grading-panel__close {
  width: 34px;
  height: 34px;
  border-radius: 50%;
  border: 1px solid rgba(15, 23, 42, 0.1);
  background: #f8fafc;
  color: #475467;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  flex-shrink: 0;
  transition: background 0.15s;

  &:hover {
    background: #f1f5f9;
  }
}

.grading-panel__total {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 20px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  flex-shrink: 0;
}

.grading-panel__total-label {
  color: #667085;
  font-size: 0.8rem;
  font-weight: 700;
  flex-shrink: 0;
}

.grading-panel__total-value {
  color: #101828;
  font-size: 1.2rem;
  font-weight: 800;
}

.grading-panel__total-max {
  color: #94a3b8;
  font-size: 0.82rem;
  font-weight: 600;
  margin-left: 3px;
}

.grading-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: 12px 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.grading-panel__empty {
  padding: 40px 0;
  text-align: center;
  color: #94a3b8;
  font-size: 0.88rem;
}

.grading-panel__item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 12px;
  border: 1px solid rgba(15, 23, 42, 0.07);
  background: #fafafa;
  transition: border-color 0.18s;

  &:hover {
    border-color: rgba(245, 166, 35, 0.4);
  }
}

.grading-panel__item-left {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.grading-panel__module-badge {
  display: inline-block;
  padding: 1px 7px;
  border-radius: 999px;
  font-size: 0.65rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  align-self: flex-start;

  &--assign {
    background: rgba(245, 166, 35, 0.14);
    color: #b45309;
  }
  &--quiz {
    background: rgba(37, 99, 235, 0.1);
    color: #1d4ed8;
  }
  &--mod {
    background: rgba(100, 116, 139, 0.1);
    color: #475467;
  }
}

.grading-panel__item-name {
  color: #344054;
  font-size: 0.88rem;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 220px;
}

.grading-panel__item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 5px;
  flex-shrink: 0;
}

.grading-panel__item-score {
  display: flex;
  align-items: baseline;
  gap: 3px;
}

.grading-panel__score {
  color: #101828;
  font-size: 1rem;
  font-weight: 800;
}

.grading-panel__score-max {
  color: #94a3b8;
  font-size: 0.75rem;
}

.grading-panel__no-score {
  color: #94a3b8;
  font-weight: 700;
  font-size: 0.9rem;
}

.grading-panel__grade-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  background: rgba(245, 166, 35, 0.1);
  color: #b45309;
  font-size: 0.75rem;
  font-weight: 700;
  text-decoration: none;
  transition:
    background 0.18s,
    transform 0.18s;
  white-space: nowrap;

  &:hover {
    background: rgba(245, 166, 35, 0.22);
    transform: translateY(-1px);
  }
}

// ── Panel slide transition ───────────────────────────────
.panel-slide-enter-active,
.panel-slide-leave-active {
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.panel-slide-enter-from,
.panel-slide-leave-to {
  transform: translateX(100%);
}
</style>
