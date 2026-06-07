<template>
  <q-page class="quiz-page">
    <CoursePageHeader
      :course-id="courseId"
      :course-title="courseTitle"
      :current="quizTitle"
      with-back
    />

    <div class="content-area section-container">
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
      <div v-else-if="screen === 'attempt' && attemptData" class="quiz-card">
        <div class="row items-center justify-between q-mb-md">
          <div class="text-subtitle1 text-weight-bold">{{ quizTitle }}</div>
          <div class="text-caption text-grey-6">หน้า {{ currentPage + 1 }}</div>
        </div>
        <q-separator class="q-mb-md" />

        <form ref="formEl" @submit.prevent>
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
              icon="check"
              label="ส่งคำตอบ"
              :loading="loading"
              @click="confirmSubmit = true"
            />
          </div>
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
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import DOMPurify from 'dompurify';
import BaseButton from 'components/base/BaseButton.vue';
import BaseSpinner from 'components/base/BaseSpinner.vue';
import CoursePageHeader from 'components/course/CoursePageHeader.vue';
import { useCourseStore } from 'src/stores/course-store';
import {
  useMoodleQuiz,
  type QuizInfo,
  type QuizAttempt,
  type QuizAttemptData,
  type QuizReview,
  type QuizAnswerField,
} from 'src/composables/use-moodle-quiz';

type Screen = 'loading' | 'intro' | 'attempt' | 'review';

const route = useRoute();
const router = useRouter();
const courseStore = useCourseStore();
const { loading, error, getQuiz, startAttempt, getAttemptData, processAttempt, getReview } =
  useMoodleQuiz();

const screen = ref<Screen>('loading');
const quiz = ref<QuizInfo | null>(null);
const attempts = ref<QuizAttempt[]>([]);
const attemptData = ref<QuizAttemptData | null>(null);
const review = ref<QuizReview | null>(null);
const currentAttemptId = ref<number | null>(null);
const currentPage = ref(0);
const confirmSubmit = ref(false);
const formEl = ref<HTMLFormElement | null>(null);

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
  await loadPage(att.currentpage ?? 0);
}

async function resume(att: QuizAttempt): Promise<void> {
  currentAttemptId.value = att.id;
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
  if (currentAttemptId.value == null) return;
  const res = await processAttempt(currentAttemptId.value, true, serializeForm());
  if (!res) return;
  confirmSubmit.value = false;
  await openReview(currentAttemptId.value);
}

async function openReview(attemptId: number): Promise<void> {
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
  }
  :deep(.answer > div:hover) {
    background: rgba(247, 208, 70, 0.08);
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
