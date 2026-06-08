<template>
  <q-page class="quiz-page">
    <CoursePageHeader
      :course-id="courseId"
      :course-title="courseTitle"
      :current="quizTitle"
      with-back
    />

    <div
      class="content-area section-container"
      :class="{ 'section-container--wide': screen === 'attempt' }"
    >
      <BaseSpinner v-if="loading && screen === 'loading'" message="กำลังโหลดแบบทดสอบ..." />

      <div
        v-else-if="error && screen === 'loading'"
        class="quiz-card column items-center text-center q-py-xl"
      >
        <q-icon name="error_outline" size="48px" color="negative" />
        <div class="text-subtitle1 text-weight-medium q-mt-md">โหลดแบบทดสอบไม่สำเร็จ</div>
        <div class="text-body2 text-grey-7 q-mt-xs">{{ error }}</div>
        <BaseButton
          color="primary"
          no-caps
          icon="refresh"
          label="ลองใหม่"
          class="q-mt-lg"
          @click="init"
        />
      </div>

      <!-- INTRO -->
      <div v-else-if="screen === 'intro' && quiz" class="quiz-card">
        <header class="quiz-card__header">
          <q-icon name="quiz" size="26px" color="primary" />
          <h1 class="quiz-card__title">{{ quiz.name }}</h1>
        </header>

        <!-- eslint-disable-next-line vue/no-v-html -- sanitized via DOMPurify -->
        <div v-if="introHtml" class="quiz-html q-mb-lg" v-html="introHtml" />

        <div class="text-body2 text-grey-7 q-mb-md">
          <div v-if="quiz.grade">คะแนนเต็ม: {{ quiz.grade }}</div>
          <div>วิธีคิดคะแนน: {{ gradeMethodLabel }}</div>
          <div>จำนวนครั้งที่ทำได้: {{ quiz.attempts === 0 ? 'ไม่จำกัด' : quiz.attempts }}</div>
        </div>

        <!-- Previous attempts -->
        <q-list v-if="attempts.length" bordered separator class="rounded-borders q-mb-lg">
          <q-item-label header class="text-weight-bold">ประวัติการทำ</q-item-label>
          <q-item v-for="a in attempts" :key="a.id">
            <q-item-section>
              <q-item-label>ครั้งที่ {{ a.attempt }}</q-item-label>
              <q-item-label caption>{{ stateLabel(a.state) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <BaseButton
                v-if="a.state === 'finished'"
                flat
                dense
                no-caps
                color="primary"
                icon="visibility"
                label="ดูผล"
                @click="openReview(a.id)"
              />
              <BaseButton
                v-else
                flat
                dense
                no-caps
                color="deep-orange"
                icon="play_arrow"
                label="ทำต่อ"
                @click="resume(a)"
              />
            </q-item-section>
          </q-item>
        </q-list>

        <BaseButton
          :disable="!canStartNew"
          color="primary"
          no-caps
          unelevated
          size="lg"
          icon="play_arrow"
          :label="inProgressAttempt ? 'ทำแบบทดสอบต่อ' : 'เริ่มทำแบบทดสอบ'"
          @click="startOrResume"
        />
        <div v-if="!canStartNew" class="text-caption text-grey-6 q-mt-sm">
          ทำครบจำนวนครั้งที่กำหนดแล้ว
        </div>
      </div>

      <!-- ATTEMPT -->
      <div v-else-if="screen === 'attempt' && attemptData" class="attempt-layout">
        <div class="quiz-card attempt-main">
          <div class="row items-center justify-between q-mb-md">
            <div class="text-subtitle1 text-weight-bold">{{ quizTitle }}</div>
            <div class="row items-center q-gutter-sm">
              <div
                v-if="remainingSec != null"
                class="quiz-timer"
                :class="{ 'quiz-timer--low': timerLow }"
              >
                <q-icon name="schedule" size="15px" />
                {{ formatTime(remainingSec) }}
              </div>
              <div class="text-caption text-grey-6">หน้า {{ currentPage + 1 }}</div>
            </div>
          </div>
          <q-separator class="q-mb-md" />

          <form
            ref="formEl"
            @submit.prevent
            @click.capture="handleFormClick"
            @change="handleFormChange"
          >
            <div
              v-for="q in attemptData.questions"
              :key="q.slot"
              class="quiz-question quiz-html q-mb-lg"
              v-html="sanitize(q.html)"
            />
            <!-- eslint-disable-line vue/no-v-html -->
          </form>

          <q-separator class="q-my-md" />
          <div class="row items-center justify-between">
            <BaseButton
              v-if="currentPage > 0"
              flat
              no-caps
              color="grey-8"
              icon="chevron_left"
              label="ก่อนหน้า"
              :disable="loading"
              @click="goPage(currentPage - 1)"
            />
            <div v-else />
            <div class="row q-gutter-sm">
              <BaseButton
                v-if="attemptData.nextpage >= 0"
                color="primary"
                no-caps
                unelevated
                icon-right="chevron_right"
                label="ถัดไป"
                :loading="loading"
                @click="goPage(attemptData.nextpage)"
              />
              <BaseButton
                v-else
                color="positive"
                no-caps
                unelevated
                icon="flag"
                label="จบการทำแบบทดสอบ"
                :loading="loading"
                @click="goToSummary"
              />
            </div>
          </div>
        </div>

        <QuizNavigationPanel
          v-if="summaryQuestions.length"
          class="attempt-nav"
          :questions="summaryQuestions"
          :current-page="currentPage"
          :loading="loading"
          @jump="goPage"
          @finish="goToSummary"
        />
      </div>

      <!-- SUMMARY (review answers before final submit) -->
      <div v-else-if="screen === 'summary'" class="quiz-card">
        <header class="quiz-card__header">
          <q-icon name="fact_check" size="26px" color="primary" />
          <h1 class="quiz-card__title">สรุปการทำแบบทดสอบ</h1>
        </header>

        <div
          v-if="remainingSec != null"
          class="quiz-timer q-mb-md"
          :class="{ 'quiz-timer--low': timerLow }"
        >
          <q-icon name="schedule" size="15px" />
          เวลาที่เหลือ {{ formatTime(remainingSec) }}
        </div>

        <q-banner
          v-if="unansweredCount > 0"
          rounded
          class="summary-banner summary-banner--warn q-mb-lg"
        >
          <template #avatar><q-icon name="warning" color="warning" /></template>
          ยังมี <b>{{ unansweredCount }}</b> ข้อที่ยังไม่ได้ตอบ — ตรวจสอบก่อนส่งคำตอบ
        </q-banner>
        <q-banner v-else rounded class="summary-banner summary-banner--ok q-mb-lg">
          <template #avatar><q-icon name="check_circle" color="positive" /></template>
          ตอบครบทุกข้อแล้ว
        </q-banner>

        <q-list bordered separator class="rounded-borders q-mb-lg">
          <q-item
            v-for="q in summaryQuestions"
            :key="q.slot"
            clickable
            @click="jumpFromSummary(q.page)"
          >
            <q-item-section avatar>
              <div
                class="summary-num"
                :class="{ 'summary-num--answered': q.state !== 'notyetanswered' && q.state !== '' }"
              >
                {{ q.number }}
              </div>
            </q-item-section>
            <q-item-section>
              <q-item-label>ข้อ {{ q.number }}</q-item-label>
              <q-item-label caption>{{ summaryStatusLabel(q) }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-icon v-if="q.flagged" name="flag" color="negative" size="18px" />
            </q-item-section>
          </q-item>
        </q-list>

        <div class="row justify-between items-center q-gutter-sm">
          <BaseButton
            flat
            no-caps
            color="grey-8"
            icon="arrow_back"
            label="กลับไปทำต่อ"
            @click="returnToAttempt"
          />
          <BaseButton
            unelevated
            no-caps
            color="positive"
            icon="check"
            label="ส่งคำตอบทั้งหมด"
            :loading="loading"
            @click="confirmSubmit = true"
          />
        </div>
      </div>

      <!-- REVIEW -->
      <div v-else-if="screen === 'review' && review" class="quiz-card">
        <header class="quiz-card__header">
          <q-icon name="emoji_events" size="26px" color="positive" />
          <h1 class="quiz-card__title">ผลการทำแบบทดสอบ</h1>
        </header>
        <div class="quiz-score q-mb-lg">
          <div class="text-h4 text-weight-bold text-primary">
            {{ review.grade ?? 0
            }}<span v-if="quiz?.grade" class="text-h6 text-grey-6"> / {{ quiz.grade }}</span>
          </div>
          <div class="text-caption text-grey-6">คะแนนที่ได้</div>
        </div>

        <div
          v-for="q in review.questions"
          :key="q.slot"
          class="quiz-question quiz-html q-mb-lg"
          v-html="sanitize(q.html)"
        />
        <!-- eslint-disable-line vue/no-v-html -->

        <BaseButton
          color="primary"
          no-caps
          unelevated
          icon="arrow_back"
          label="กลับสู่บทเรียน"
          @click="backToCourse"
        />
      </div>

      <CourseActivityNavigation
        v-if="screen === 'intro' || screen === 'review'"
        :course-id="courseId"
        :moodle-course-id="moodleCourseId"
        :current-module-id="moduleId"
        :current-title="quizTitle"
      />
    </div>

    <q-dialog v-model="confirmSubmit">
      <q-card style="min-width: 320px; border-radius: 16px">
        <q-card-section class="text-h6">ยืนยันส่งคำตอบ</q-card-section>
        <q-card-section class="text-body2 text-grey-7 q-pt-none">
          ส่งคำตอบแล้วจะไม่สามารถแก้ไขได้ ต้องการส่งหรือไม่?
        </q-card-section>
        <q-card-actions align="right">
          <BaseButton flat no-caps color="grey-8" label="ยกเลิก" v-close-popup />
          <BaseButton
            unelevated
            no-caps
            color="positive"
            label="ส่งคำตอบ"
            :loading="loading"
            @click="submit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DOMPurify from 'dompurify';
import BaseButton from 'components/base/BaseButton.vue';
import BaseSpinner from 'components/base/BaseSpinner.vue';
import CourseActivityNavigation from 'components/course/CourseActivityNavigation.vue';
import CoursePageHeader from 'components/course/CoursePageHeader.vue';
import QuizNavigationPanel from 'components/course/QuizNavigationPanel.vue';
import { useCourseStore } from 'src/stores/course-store';
import {
  useMoodleQuiz,
  type QuizInfo,
  type QuizAttempt,
  type QuizAttemptData,
  type QuizReview,
  type QuizAnswerField,
  type QuizSummaryQuestion,
} from 'src/composables/use-moodle-quiz';

type Screen = 'loading' | 'intro' | 'attempt' | 'summary' | 'review';

const route = useRoute();
const router = useRouter();
const courseStore = useCourseStore();
const {
  loading,
  error,
  getQuiz,
  startAttempt,
  getAttemptData,
  processAttempt,
  getReview,
  getSummary,
} = useMoodleQuiz();

const screen = ref<Screen>('loading');
const quiz = ref<QuizInfo | null>(null);
const attempts = ref<QuizAttempt[]>([]);
const attemptData = ref<QuizAttemptData | null>(null);
const summaryQuestions = ref<QuizSummaryQuestion[]>([]);
const review = ref<QuizReview | null>(null);
const currentAttemptId = ref<number | null>(null);
const currentPage = ref(0);
const confirmSubmit = ref(false);
const formEl = ref<HTMLFormElement | null>(null);

// Timer (only for time-limited quizzes)
const attemptDeadline = ref<number | null>(null); // unix seconds
const remainingSec = ref<number | null>(null);
let timerHandle: ReturnType<typeof setInterval> | null = null;
let finishing = false;

const unansweredCount = computed(
  () => summaryQuestions.value.filter((q) => q.state === 'notyetanswered' || q.state === '').length,
);
const timerLow = computed(() => remainingSec.value != null && remainingSec.value <= 60);

const courseId = computed<string>(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  return id || '';
});
const moduleId = computed<string>(() => {
  const id = Array.isArray(route.params.moduleId)
    ? route.params.moduleId[0]
    : route.params.moduleId;
  return id || '';
});
function queryStr(v: unknown): string {
  if (Array.isArray(v)) return String(v[0] ?? '');
  return typeof v === 'string' ? v : '';
}
const currentCourse = computed(() =>
  courseId.value ? courseStore.getCourseDetailById(courseId.value) : null,
);
const courseTitle = computed<string>(() => currentCourse.value?.title || 'รายวิชา');
const moodleCourseId = computed<number | null>(() => {
  const c = currentCourse.value?.moodleId;
  if (c) return c;
  const q = Number(queryStr(route.query.moodleCourseId));
  return q > 0 ? q : null;
});
const quizTitle = computed<string>(
  () => quiz.value?.name || queryStr(route.query.title) || 'แบบทดสอบ',
);

const introHtml = computed<string>(() => (quiz.value?.intro ? sanitize(quiz.value.intro) : ''));
const inProgressAttempt = computed(() =>
  attempts.value.find((a) => a.state === 'inprogress' || a.state === 'overdue'),
);
const finishedCount = computed(() => attempts.value.filter((a) => a.state === 'finished').length);
const canStartNew = computed(
  () =>
    !!inProgressAttempt.value ||
    quiz.value?.attempts === 0 ||
    finishedCount.value < (quiz.value?.attempts ?? 0),
);
const gradeMethodLabel = computed(() => {
  switch (quiz.value?.grademethod) {
    case 1:
      return 'คะแนนสูงสุด';
    case 2:
      return 'คะแนนเฉลี่ย';
    case 3:
      return 'ครั้งแรก';
    case 4:
      return 'ครั้งล่าสุด';
    default:
      return '-';
  }
});

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}

function stateLabel(state: string): string {
  const map: Record<string, string> = {
    inprogress: 'กำลังทำ',
    overdue: 'เกินกำหนด',
    finished: 'ส่งแล้ว',
    abandoned: 'ยกเลิก',
  };
  return map[state] ?? state;
}

async function init(): Promise<void> {
  screen.value = 'loading';
  if (moodleCourseId.value == null || !moduleId.value) {
    error.value = 'ไม่พบข้อมูลรายวิชา';
    return;
  }
  const res = await getQuiz(moodleCourseId.value, moduleId.value);
  if (!res) return; // error shown
  quiz.value = res.quiz;
  attempts.value = res.attempts;
  screen.value = 'intro';
}

async function loadPage(page: number): Promise<void> {
  if (currentAttemptId.value == null) return;
  const data = await getAttemptData(currentAttemptId.value, page);
  if (!data) return;
  attemptData.value = data;
  currentPage.value = page;
  screen.value = 'attempt';
  // Refresh the navigation grid (question states/flags) after the page is shown.
  void refreshSummary();
}

async function refreshSummary(): Promise<void> {
  if (currentAttemptId.value == null) return;
  const sum = await getSummary(currentAttemptId.value);
  if (sum) summaryQuestions.value = sum.questions;
}

// ---- Timer (time-limited quizzes) ----
function formatTime(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  const pad = (n: number): string => String(n).padStart(2, '0');
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`;
}

function tick(): void {
  if (attemptDeadline.value == null) return;
  const left = Math.round(attemptDeadline.value - Date.now() / 1000);
  remainingSec.value = Math.max(0, left);
  if (left <= 0) {
    stopTimer();
    void autoSubmit();
  }
}

function startTimer(): void {
  stopTimer();
  if (attemptDeadline.value == null) return;
  tick();
  timerHandle = setInterval(tick, 1000);
}

function stopTimer(): void {
  if (timerHandle) {
    clearInterval(timerHandle);
    timerHandle = null;
  }
}

function setupTimer(att: QuizAttempt): void {
  if (quiz.value && quiz.value.timelimit > 0 && att.timestart > 0) {
    attemptDeadline.value = att.timestart + quiz.value.timelimit;
    startTimer();
  } else {
    attemptDeadline.value = null;
    remainingSec.value = null;
  }
}

// ---- Finish flow: attempt -> summary -> submit ----
async function goToSummary(): Promise<void> {
  if (currentAttemptId.value == null) return;
  // Persist the current page so the summary reflects the latest answers.
  const saved = await processAttempt(currentAttemptId.value, false, serializeForm());
  if (!saved) return;
  await refreshSummary();
  screen.value = 'summary';
}

function returnToAttempt(): void {
  // Reload the current page so saved answers are re-selected.
  void loadPage(currentPage.value);
}

function jumpFromSummary(page: number): void {
  void loadPage(page);
}

function summaryStatusLabel(q: QuizSummaryQuestion): string {
  if (q.state === 'notyetanswered' || q.state === '') return 'ยังไม่ตอบ';
  if (q.state === 'invalid') return 'คำตอบไม่สมบูรณ์';
  return 'ตอบแล้ว';
}

function handleFormClick(e: MouseEvent): void {
  const target = e.target as HTMLElement;

  // Intercept all <a> links inside the Moodle HTML to prevent page navigation.
  // "Clear my choice" is rendered as an anchor by Moodle; clicking it should
  // uncheck the radios in that question block instead of navigating away.
  const link = target.closest('a');
  if (link) {
    e.preventDefault();
    const que = link.closest('.que');
    que?.querySelectorAll<HTMLInputElement>('.answer input[type="radio"]').forEach((r) => {
      r.checked = false;
    });
    // Reflect "not answered" instantly in the question label + navigation grid.
    const slot = slotFromQuestion(que);
    if (slot != null) setSummaryAnswered(slot, false);
    setQuestionStateLabel(que, false);
    return;
  }

  // Make the entire answer-row div clickable, not just the radio circle.
  // Skip if the click already landed on a native interactive element so we
  // don't double-fire (label clicks already trigger the associated radio).
  const row = target.closest<HTMLElement>('.answer > div');
  if (row && !target.closest('input, label')) {
    row.querySelector<HTMLInputElement>('input[type="radio"], input[type="checkbox"]')?.click();
  }
}

/** Slot number is encoded in every question input name: `q{qubaid}:{slot}_...`. */
function slotFromName(name: string): number | null {
  const m = /^q\d+:(\d+)_/.exec(name);
  return m ? Number(m[1]) : null;
}
function slotFromQuestion(que: Element | null): number | null {
  const input = que?.querySelector<HTMLInputElement>('input[name^="q"]');
  return input ? slotFromName(input.name) : null;
}

function setSummaryAnswered(slot: number, answered: boolean): void {
  const q = summaryQuestions.value.find((x) => x.slot === slot);
  if (q) q.state = answered ? 'answered' : 'notyetanswered';
}
function setSummaryFlag(slot: number, flagged: boolean): void {
  const q = summaryQuestions.value.find((x) => x.slot === slot);
  if (q) q.flagged = flagged;
}

/** Update the Moodle-rendered ".state" label inside a question (optimistic). */
function setQuestionStateLabel(que: Element | null, answered: boolean): void {
  const stateEl = que?.querySelector('.state');
  if (stateEl) stateEl.textContent = answered ? 'Answer saved' : 'Not yet answered';
}

/**
 * Optimistically reflect answer/flag changes in the nav grid + question label
 * the moment the user interacts — without waiting for the next page save.
 */
function handleFormChange(e: Event): void {
  const target = e.target as HTMLInputElement | null;
  if (!target?.name) return;
  const slot = slotFromName(target.name);
  if (slot == null) return;

  if (target.name.includes(':flagged')) {
    setSummaryFlag(slot, target.checked);
    return;
  }
  setSummaryAnswered(slot, true);
  setQuestionStateLabel(target.closest('.que'), true);
}

function serializeForm(): QuizAnswerField[] {
  if (!formEl.value) return [];
  const fd = new FormData(formEl.value);
  return Array.from(fd.entries())
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    .map(([name, value]) => ({ name, value }));
}

async function startOrResume(): Promise<void> {
  if (inProgressAttempt.value) {
    return resume(inProgressAttempt.value);
  }
  if (!quiz.value) return;
  const att = await startAttempt(quiz.value.id);
  if (!att) return;
  currentAttemptId.value = att.id;
  setupTimer(att);
  await loadPage(att.currentpage ?? 0);
}

async function resume(att: QuizAttempt): Promise<void> {
  currentAttemptId.value = att.id;
  setupTimer(att);
  await loadPage(att.currentpage ?? 0);
}

async function goPage(page: number): Promise<void> {
  if (currentAttemptId.value == null) return;
  // Save current page answers before navigating.
  const saved = await processAttempt(currentAttemptId.value, false, serializeForm());
  if (!saved) return;
  await loadPage(page);
}

async function submit(): Promise<void> {
  if (currentAttemptId.value == null || finishing) return;
  finishing = true;
  stopTimer();
  // On the summary screen there is no form; saved answers already persisted.
  const res = await processAttempt(currentAttemptId.value, true, serializeForm());
  finishing = false;
  if (!res) return;
  confirmSubmit.value = false;
  await openReview(currentAttemptId.value);
}

// Auto-submit when the quiz time limit expires (Moodle overdue handling).
async function autoSubmit(): Promise<void> {
  if (currentAttemptId.value == null || finishing) return;
  finishing = true;
  const res = await processAttempt(currentAttemptId.value, true, serializeForm(), true);
  finishing = false;
  if (!res) return;
  confirmSubmit.value = false;
  await openReview(currentAttemptId.value);
}

async function openReview(attemptId: number): Promise<void> {
  stopTimer();
  currentAttemptId.value = attemptId;
  const rev = await getReview(attemptId);
  if (!rev) return;
  review.value = rev;
  screen.value = 'review';
}

function backToCourse(): void {
  void router.push(`/course/${courseId.value}/learn`);
}

onMounted(() => {
  void init();
});

onUnmounted(() => {
  stopTimer();
});
</script>

<style lang="scss" scoped>
.quiz-page {
  min-height: calc(100vh - 64px);
  background-color: transparent;
}

.section-container {
  max-width: 920px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;

  &--wide {
    max-width: 1180px;
  }
}

// Attempt screen: question card + navigation panel
.attempt-layout {
  display: flex;
  align-items: flex-start;
  gap: 24px;
}
.attempt-main {
  flex: 1 1 auto;
  min-width: 0;
}
.attempt-nav {
  flex: 0 0 250px;
  position: sticky;
  top: 132px;
  max-height: calc(100vh - 156px);
  overflow-y: auto;
}

@media (max-width: 1023px) {
  .attempt-layout {
    flex-direction: column;
  }
  .attempt-nav {
    flex: none;
    width: 100%;
    position: static;
    order: -1; // panel on top on mobile/tablet
  }
}

.content-area {
  padding-top: 40px;
  padding-bottom: 64px;
}

.quiz-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  padding: 32px;

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 20px;
    padding-bottom: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__title {
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 1.3;
    margin: 0;
    color: #1a1a1a;
  }
}

.quiz-score {
  text-align: center;
  padding: 20px;
  background: rgba(247, 208, 70, 0.08);
  border-radius: 14px;
}

// Countdown timer chip
.quiz-timer {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  font-size: 0.85rem;
  color: #5a4a00;
  background: rgba(247, 208, 70, 0.18);
  border-radius: 20px;
  padding: 3px 12px;

  &--low {
    color: var(--q-negative);
    background: rgba(193, 0, 21, 0.08);
    animation: quiz-timer-pulse 1s ease-in-out infinite;
  }
}
@keyframes quiz-timer-pulse {
  50% {
    opacity: 0.55;
  }
}

// Summary screen
.summary-banner {
  border: 1px solid rgba(0, 0, 0, 0.06);
  &--warn {
    background: rgba(247, 170, 30, 0.08);
  }
  &--ok {
    background: rgba(33, 186, 69, 0.06);
  }
}
.summary-num {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  border: 1.5px solid rgba(0, 0, 0, 0.18);
  font-weight: 600;
  font-size: 0.85rem;
  color: #555;

  &--answered {
    background: var(--q-primary);
    border-color: var(--q-primary);
    color: #1a1a1a;
  }
}

// Moodle question markup
.quiz-html {
  line-height: 1.7;
  word-break: break-word;

  :deep(img),
  :deep(video) {
    max-width: 100%;
    height: auto;
  }
  :deep(.qtext) {
    margin: 8px 0 12px;
    font-size: 1.05rem;
  }
  // Moodle question info bar (Question N / state / flag).
  // Render it as a clean header row and CONSTRAIN the flag image — the raw
  // Moodle flag icon renders full-screen otherwise (no width on the svg/img).
  :deep(.info) {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 12px;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px dashed rgba(0, 0, 0, 0.08);

    h2,
    h3,
    .no {
      font-size: 0.72rem;
      font-weight: 700;
      color: #888;
      margin: 0;
      text-transform: uppercase;
      letter-spacing: 0.04em;
    }
    .state {
      font-size: 0.72rem;
      color: #888;
      background: rgba(0, 0, 0, 0.04);
      border-radius: 20px;
      padding: 2px 10px;
    }
    .grade {
      font-size: 0.72rem;
      color: #aaa;
    }
    // Flag control: checkbox(hidden) + label. Clicking the label toggles the
    // checkbox natively, which is serialized to Moodle on the next save. Moodle's
    // own flag <img> never swaps without its JS, so we hide it and drive a CSS
    // flag icon off the checkbox's :checked state for instant visual feedback.
    .questionflag {
      display: inline-flex;
      align-items: center;
    }
    .questionflagimage {
      display: none;
    }
    label {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      font-size: 0.78rem;
      color: #999;
      cursor: pointer;
      margin: 0;
      user-select: none;

      &::before {
        content: '⚐';
        font-size: 1.05rem;
        line-height: 1;
      }
    }
    input[type='checkbox'] {
      position: absolute;
      width: 1px;
      height: 1px;
      opacity: 0;
    }
    input[type='checkbox']:checked + label {
      color: var(--q-negative);
      font-weight: 600;

      &::before {
        content: '⚑';
      }
    }
    // any other inline icon in the info bar stays small
    img,
    svg {
      width: 16px !important;
      height: 16px !important;
      vertical-align: middle;
    }
  }
  :deep(.answer) {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  :deep(.answer > div) {
    padding: 8px 12px;
    border: 1px solid rgba(0, 0, 0, 0.08);
    border-radius: 10px;
    transition: background 0.2s ease;
    cursor: pointer;
    user-select: none;
  }
  :deep(.answer > div:hover) {
    background: rgba(247, 208, 70, 0.08);
  }
  :deep(.qtype_multichoice_clearchoice) {
    margin-top: 8px;

    input[type='radio'] {
      display: none;
    }

    label {
      color: var(--q-primary);
      cursor: pointer;
      font-size: 0.85rem;
      text-decoration: underline;
      user-select: none;

      &:hover {
        opacity: 0.75;
      }
    }
  }
  :deep(input[type='radio']),
  :deep(input[type='checkbox']) {
    margin-right: 8px;
  }
  :deep(.correct) {
    border-color: var(--q-positive) !important;
    background: rgba(33, 186, 69, 0.06);
  }
  :deep(.incorrect) {
    border-color: var(--q-negative) !important;
    background: rgba(193, 0, 21, 0.05);
  }
}

@media (max-width: 600px) {
  .quiz-card {
    padding: 20px;
  }
}
</style>
