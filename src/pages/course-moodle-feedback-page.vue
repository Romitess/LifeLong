<template>
  <q-page class="feedback-page">
    <CoursePageHeader
      :course-id="courseId"
      :course-title="courseTitle"
      :current="feedbackTitle"
      with-back
    />

    <div class="content-area section-container">
      <BaseSpinner v-if="loading && !feedback" message="กำลังโหลดแบบสอบถาม..." />

      <div
        v-else-if="error && !feedback"
        class="feedback-card column items-center text-center q-py-xl"
      >
        <q-icon name="error_outline" size="48px" color="negative" />
        <div class="text-subtitle1 text-weight-medium q-mt-md">โหลดแบบสอบถามไม่สำเร็จ</div>
        <div class="text-body2 text-grey-7 q-mt-xs">{{ error }}</div>
        <BaseButton
          color="primary"
          no-caps
          icon="refresh"
          label="ลองใหม่"
          class="q-mt-lg"
          @click="load"
        />
      </div>

      <template v-else-if="feedback && page">
        <div class="feedback-card q-mb-md">
          <header class="feedback-card__header">
            <q-icon name="rate_review" size="26px" color="primary" />
            <h1 class="feedback-card__title">{{ feedback.name }}</h1>
          </header>

          <!-- eslint-disable-next-line vue/no-v-html -- sanitized via DOMPurify -->
          <div v-if="introHtml" class="feedback-html q-mt-md" v-html="introHtml" />

          <q-banner v-if="feedback.completed" rounded class="bg-green-1 text-green-9 q-mt-md">
            <template v-slot:avatar><q-icon name="check_circle" /></template>
            ส่งแบบสอบถามนี้แล้ว
          </q-banner>
        </div>

        <q-form v-if="!feedback.completed && feedback.canSubmit" @submit.prevent="submit">
          <div class="feedback-card">
            <div v-for="item in page.items" :key="item.id" class="feedback-item">
              <template v-if="isStaticItem(item)">
                <!-- eslint-disable-next-line vue/no-v-html -- sanitized via DOMPurify -->
                <div class="feedback-html" v-html="sanitize(item.label || item.name)" />
              </template>

              <template v-else-if="isTextArea(item)">
                <q-input
                  v-model="answers[item.id]"
                  type="textarea"
                  outlined
                  autogrow
                  :label="plainLabel(item)"
                  :rules="item.required ? [requiredRule] : []"
                />
              </template>

              <template v-else-if="isTextInput(item)">
                <q-input
                  v-model="answers[item.id]"
                  :type="item.typ === 'numeric' ? 'number' : 'text'"
                  outlined
                  :label="plainLabel(item)"
                  :rules="item.required ? [requiredRule] : []"
                />
              </template>

              <template v-else-if="isMultiChoice(item)">
                <fieldset class="feedback-choice">
                  <legend>
                    {{ plainLabel(item) }} <span v-if="item.required" class="text-negative">*</span>
                  </legend>
                  <q-option-group
                    v-model="answers[item.id]"
                    :options="item.options"
                    :type="isCheckboxChoice(item) ? 'checkbox' : 'radio'"
                    color="primary"
                  />
                </fieldset>
              </template>

              <q-banner v-else rounded class="bg-orange-1 text-orange-10">
                <template v-slot:avatar><q-icon name="extension_off" /></template>
                ยังไม่รองรับคำถามชนิด {{ item.typ }} ในแอป
              </q-banner>
            </div>

            <div class="row justify-end q-mt-lg">
              <BaseButton
                color="primary"
                no-caps
                unelevated
                icon="send"
                :label="page.hasNextPage ? 'ถัดไป' : 'ส่งแบบสอบถาม'"
                :loading="loading"
                type="submit"
              />
            </div>
          </div>
        </q-form>

        <div v-else-if="!feedback.completed" class="feedback-card text-grey-7">
          <q-icon name="lock" class="q-mr-xs" />ไม่สามารถส่งแบบสอบถามนี้ได้ในขณะนี้
        </div>

        <CourseActivityNavigation
          :course-id="courseId"
          :moodle-course-id="moodleCourseId"
          :current-module-id="moduleId"
          :current-title="feedbackTitle"
        />
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import DOMPurify from 'dompurify';
import BaseButton from 'components/base/BaseButton.vue';
import BaseSpinner from 'components/base/BaseSpinner.vue';
import CourseActivityNavigation from 'components/course/CourseActivityNavigation.vue';
import CoursePageHeader from 'components/course/CoursePageHeader.vue';
import { useCourseStore } from 'src/stores/course-store';
import {
  useMoodleFeedback,
  type FeedbackInfo,
  type FeedbackItem,
  type FeedbackPage,
  type FeedbackResponseField,
} from 'src/composables/use-moodle-feedback';

const route = useRoute();
const $q = useQuasar();
const courseStore = useCourseStore();
const { loading, error, getFeedback, processPage } = useMoodleFeedback();

const feedback = ref<FeedbackInfo | null>(null);
const page = ref<FeedbackPage | null>(null);
const answers = reactive<Record<number, string | string[]>>({});

function queryStr(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? '');
  return typeof value === 'string' ? value : '';
}

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
const currentCourse = computed(() =>
  courseId.value ? courseStore.getCourseDetailById(courseId.value) : null,
);
const courseTitle = computed<string>(() => currentCourse.value?.title || 'รายวิชา');
const moodleCourseId = computed<number | null>(() => {
  const fromCourse = currentCourse.value?.moodleId;
  if (fromCourse) return fromCourse;
  const fromQuery = Number(queryStr(route.query.moodleCourseId));
  return fromQuery > 0 ? fromQuery : null;
});
const feedbackTitle = computed<string>(
  () => feedback.value?.name || queryStr(route.query.title) || 'แบบสอบถาม',
);
const introHtml = computed(() => (feedback.value?.intro ? sanitize(feedback.value.intro) : ''));

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}

function plainLabel(item: FeedbackItem): string {
  const html = item.label || item.name || 'คำถาม';
  const doc = new DOMParser().parseFromString(sanitize(html), 'text/html');
  return doc.body.textContent?.trim() || 'คำถาม';
}

function isStaticItem(item: FeedbackItem): boolean {
  return item.typ === 'label' || item.typ === 'info';
}

function isTextArea(item: FeedbackItem): boolean {
  return item.typ === 'textarea';
}

function isTextInput(item: FeedbackItem): boolean {
  return item.typ === 'textfield' || item.typ === 'numeric';
}

function isMultiChoice(item: FeedbackItem): boolean {
  return item.typ === 'multichoice' || item.typ === 'multichoicerated';
}

function isCheckboxChoice(item: FeedbackItem): boolean {
  return item.presentation.toLowerCase().startsWith('c');
}

function requiredRule(value: string | string[] | null): true | string {
  if (Array.isArray(value)) return value.length > 0 || 'กรุณาตอบคำถามนี้';
  return !!String(value ?? '').trim() || 'กรุณาตอบคำถามนี้';
}

function responseName(item: FeedbackItem): string {
  return item.name || `item_${item.id}`;
}

function buildResponses(): FeedbackResponseField[] {
  return (page.value?.items ?? [])
    .filter((item) => !isStaticItem(item))
    .flatMap((item) => {
      const value = answers[item.id];
      if (Array.isArray(value)) {
        return value.map((selected) => ({ name: responseName(item), value: selected }));
      }
      return [{ name: responseName(item), value: String(value ?? '') }];
    });
}

async function load(): Promise<void> {
  if (moodleCourseId.value == null || !moduleId.value) {
    error.value = 'ไม่พบข้อมูลรายวิชา';
    return;
  }
  const result = await getFeedback(moodleCourseId.value, moduleId.value);
  if (!result) return;
  feedback.value = result.feedback;
  page.value = result.page;
}

async function submit(): Promise<void> {
  if (!feedback.value || !page.value) return;
  const result = await processPage(feedback.value.id, page.value.page, buildResponses());
  if (!result) return;
  if (result.completed) {
    feedback.value = { ...feedback.value, completed: true, canSubmit: false };
    $q.notify({ type: 'positive', message: 'ส่งแบบสอบถามเรียบร้อยแล้ว' });
    return;
  }
  if (result.page) {
    page.value = result.page;
  }
}

onMounted(() => {
  courseStore.init();
  void load();
});
</script>

<style lang="scss" scoped>
.feedback-page {
  min-height: calc(100vh - 64px);
}

.feedback-card {
  padding: 24px;
  border: 1px solid #e8edf3;
  border-radius: 8px;
  background: #fff;
}

.feedback-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.feedback-card__title {
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.3;
  font-weight: 700;
  color: #1f2937;
}

.feedback-html {
  color: #344054;
  line-height: 1.7;

  :deep(p) {
    margin: 0 0 8px;
  }
}

.feedback-item {
  padding: 18px 0;
  border-bottom: 1px solid #eef2f6;

  &:last-child {
    border-bottom: 0;
  }
}

.feedback-choice {
  margin: 0;
  padding: 0;
  border: 0;

  legend {
    margin-bottom: 10px;
    font-weight: 600;
    color: #1f2937;
  }
}
</style>
