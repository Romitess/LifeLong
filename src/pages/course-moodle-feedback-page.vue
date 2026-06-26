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

      <BaseContentCard
        v-else-if="error && !feedback"
        class="column items-center text-center q-py-xl"
      >
        <q-icon name="error_outline" size="48px" color="negative" />
        <div class="text-subtitle1 text-weight-medium text-grey-9 q-mt-md">
          โหลดแบบสอบถามไม่สำเร็จ
        </div>
        <div class="text-body2 text-grey-7 q-mt-xs">{{ error }}</div>
        <BaseButton
          color="primary"
          no-caps
          icon="refresh"
          label="ลองใหม่"
          class="q-mt-lg"
          @click="load"
        />
      </BaseContentCard>

      <template v-else-if="feedback && page">
        <BaseContentCard class="q-mb-md">
          <div class="row items-center q-gutter-sm">
            <q-icon name="rate_review" size="26px" color="primary" />
            <span class="text-h6 text-weight-bold text-grey-9">{{ feedback.name }}</span>
          </div>

          <!-- eslint-disable-next-line vue/no-v-html -- sanitized via DOMPurify -->
          <div
            v-if="introHtml"
            class="feedback-html text-body2 text-grey-8 q-mt-md"
            v-html="introHtml"
          />

          <q-banner v-if="feedback.completed" rounded class="bg-green-1 text-green-9 q-mt-md">
            <template v-slot:avatar><q-icon name="check_circle" /></template>
            ส่งแบบสอบถามนี้แล้ว
          </q-banner>
        </BaseContentCard>

        <q-form v-if="!feedback.completed && feedback.canSubmit" @submit.prevent="submit">
          <BaseContentCard>
            <div v-for="item in page.items" :key="item.id" class="feedback-item">
              <template v-if="isStaticItem(item)">
                <!-- eslint-disable-next-line vue/no-v-html -- sanitized via DOMPurify -->
                <div
                  class="feedback-html text-body1 text-grey-9"
                  v-html="sanitize(item.label || item.name)"
                />
              </template>

              <template v-else-if="isTextArea(item)">
                <q-input
                  :model-value="textValue(item.id)"
                  type="textarea"
                  outlined
                  autogrow
                  :label="plainLabel(item)"
                  :rules="item.required ? [requiredRule] : []"
                  @update:model-value="(val) => setTextValue(item.id, val)"
                />
              </template>

              <template v-else-if="isTextInput(item)">
                <q-input
                  :model-value="textValue(item.id)"
                  :type="item.typ === 'numeric' ? 'number' : 'text'"
                  outlined
                  :label="plainLabel(item)"
                  :rules="item.required ? [requiredRule] : []"
                  @update:model-value="(val) => setTextValue(item.id, val)"
                />
              </template>

              <template v-else-if="isMultiChoice(item)">
                <fieldset class="feedback-choice">
                  <legend class="text-grey-9 text-weight-medium q-mb-sm">
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
          </BaseContentCard>
        </q-form>

        <BaseContentCard v-else-if="!feedback.completed" class="text-grey-7">
          <q-icon name="lock" class="q-mr-xs" />ไม่สามารถส่งแบบสอบถามนี้ได้ในขณะนี้
        </BaseContentCard>

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
import BaseContentCard from 'components/base/BaseContentCard.vue';
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

function textValue(id: number): string {
  const value = answers[id];
  return typeof value === 'string' ? value : '';
}

function setTextValue(id: number, value: string | number | null): void {
  answers[id] = value == null ? '' : String(value);
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

// Match the shared width/spacing of the other Moodle learner pages.
.section-container {
  max-width: 920px;
}

.content-area {
  padding-top: 40px;
  padding-bottom: 64px;
}

.feedback-html {
  line-height: 1.7;

  :deep(p) {
    margin: 0 0 8px;
  }

  // Normalize Moodle-sourced headings so they don't render huge in our cards.
  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    margin: 14px 0 6px;
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1.35;
  }

  :deep(img) {
    max-width: 100%;
    height: auto;
  }
}

.feedback-item {
  padding: 18px 0;
}

.feedback-choice {
  margin: 0;
  padding: 0;
  border: 0;
}
</style>
