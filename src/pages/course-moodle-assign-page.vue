<template>
  <q-page class="assign-page">
    <CoursePageHeader
      :course-id="courseId"
      :course-title="courseTitle"
      :current="assignTitle"
      with-back
    />

    <div class="content-area section-container">
      <BaseSpinner v-if="loading && !assign" message="กำลังโหลดงาน..." />

      <div v-else-if="error && !assign" class="assign-card column items-center text-center q-py-xl">
        <q-icon name="error_outline" size="48px" color="negative" />
        <div class="text-subtitle1 text-weight-medium q-mt-md">โหลดงานไม่สำเร็จ</div>
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

      <template v-else-if="assign && submission">
        <!-- Assignment brief -->
        <div class="assign-card q-mb-md">
          <header class="assign-card__header">
            <q-icon name="assignment" size="26px" color="primary" />
            <h1 class="assign-card__title">{{ assign.name }}</h1>
          </header>

          <div class="row q-gutter-sm q-mb-md">
            <q-chip v-if="assign.duedate" dense icon="event" color="grey-2" text-color="grey-8">
              กำหนดส่ง: {{ formatDate(assign.duedate) }}
            </q-chip>
            <q-chip v-if="assign.grade" dense icon="grade" color="grey-2" text-color="grey-8">
              คะแนนเต็ม: {{ assign.grade }}
            </q-chip>
            <q-chip dense :icon="statusIcon" :color="statusColor" text-color="white">
              {{ statusLabel }}
            </q-chip>
          </div>

          <!-- eslint-disable-next-line vue/no-v-html -- sanitized via DOMPurify -->
          <div v-if="introHtml" class="assign-html" v-html="introHtml" />

          <div v-if="assign.introAttachments.length" class="q-mt-md">
            <div class="text-weight-bold q-mb-xs">ไฟล์ประกอบ</div>
            <q-list dense>
              <q-item
                v-for="(f, i) in assign.introAttachments"
                :key="i"
                clickable
                @click="openFile(f)"
              >
                <q-item-section avatar
                  ><q-icon name="attach_file" color="primary"
                /></q-item-section>
                <q-item-section>{{ f.filename }}</q-item-section>
                <q-item-section side
                  ><q-icon name="open_in_new" size="16px" color="grey-6"
                /></q-item-section>
              </q-item>
            </q-list>
          </div>
        </div>

        <!-- Graded feedback -->
        <div
          v-if="submission.grade != null || submission.feedback"
          class="assign-card assign-card--graded q-mb-md"
        >
          <div class="text-h6 text-weight-bold q-mb-sm">
            <q-icon name="emoji_events" color="positive" class="q-mr-xs" />ผลการตรวจ
          </div>
          <div v-if="submission.grade != null" class="text-h5 text-primary text-weight-bold">
            {{ submission.grade
            }}<span v-if="assign.grade" class="text-subtitle1 text-grey-6">
              / {{ assign.grade }}</span
            >
          </div>
          <!-- eslint-disable-next-line vue/no-v-html -- sanitized via DOMPurify -->
          <div v-if="feedbackHtml" class="assign-html q-mt-sm" v-html="feedbackHtml" />
        </div>

        <!-- Current submission (read) -->
        <div v-if="hasSubmittedContent" class="assign-card q-mb-md">
          <div class="text-subtitle1 text-weight-bold q-mb-sm">งานที่ส่งแล้ว</div>
          <!-- eslint-disable-next-line vue/no-v-html -- sanitized via DOMPurify -->
          <div v-if="submittedTextHtml" class="assign-html" v-html="submittedTextHtml" />
          <q-list v-if="submission.files.length" dense class="q-mt-sm">
            <q-item v-for="(f, i) in submission.files" :key="i" clickable @click="openFile(f)">
              <q-item-section avatar
                ><q-icon name="insert_drive_file" color="primary"
              /></q-item-section>
              <q-item-section>{{ f.filename }}</q-item-section>
              <q-item-section side
                ><q-icon name="open_in_new" size="16px" color="grey-6"
              /></q-item-section>
            </q-item>
          </q-list>
        </div>

        <!-- Submission form -->
        <div v-if="assign.noSubmissions" class="assign-card text-grey-7">
          งานนี้ไม่รับการส่งผ่านระบบออนไลน์ (ส่งตามที่อาจารย์กำหนด)
        </div>
        <div v-else-if="submission.canEdit" class="assign-card">
          <div class="text-subtitle1 text-weight-bold q-mb-md">
            {{ hasSubmittedContent ? 'แก้ไขงานที่ส่ง' : 'ส่งงาน' }}
          </div>

          <q-input
            v-if="assign.textSubmission"
            v-model="onlineText"
            type="textarea"
            outlined
            autogrow
            label="คำตอบ (ข้อความ)"
            class="q-mb-md"
            :input-style="{ minHeight: '120px' }"
          />

          <q-file
            v-if="assign.fileSubmission"
            v-model="file"
            outlined
            label="แนบไฟล์"
            class="q-mb-md"
            clearable
            max-files="1"
          >
            <template v-slot:prepend><q-icon name="attach_file" /></template>
          </q-file>

          <BaseButton
            color="positive"
            no-caps
            unelevated
            icon="send"
            :label="assign.submissionDrafts ? 'บันทึกและส่ง' : 'ส่งงาน'"
            :loading="loading"
            :disable="!canSubmitNow"
            @click="confirmSubmit = true"
          />
        </div>
        <div v-else class="assign-card text-grey-7">
          <q-icon name="lock" class="q-mr-xs" />ไม่สามารถส่ง/แก้ไขงานได้ในขณะนี้
        </div>

        <CourseActivityNavigation
          :course-id="courseId"
          :moodle-course-id="moodleCourseId"
          :current-module-id="moduleId"
          :current-title="assignTitle"
        />
      </template>
    </div>

    <q-dialog v-model="confirmSubmit">
      <q-card style="min-width: 320px; border-radius: 16px">
        <q-card-section class="text-h6">ยืนยันส่งงาน</q-card-section>
        <q-card-section class="text-body2 text-grey-7 q-pt-none"
          >ต้องการส่งงานนี้หรือไม่?</q-card-section
        >
        <q-card-actions align="right">
          <BaseButton flat no-caps color="grey-8" label="ยกเลิก" v-close-popup />
          <BaseButton
            unelevated
            no-caps
            color="positive"
            label="ส่งงาน"
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
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import DOMPurify from 'dompurify';
import BaseButton from 'components/base/BaseButton.vue';
import BaseSpinner from 'components/base/BaseSpinner.vue';
import CourseActivityNavigation from 'components/course/CourseActivityNavigation.vue';
import CoursePageHeader from 'components/course/CoursePageHeader.vue';
import { useCourseStore } from 'src/stores/course-store';
import {
  useMoodleAssign,
  type AssignInfo,
  type AssignSubmission,
  type AssignFile,
} from 'src/composables/use-moodle-assign';

const route = useRoute();
const $q = useQuasar();
const courseStore = useCourseStore();
const { loading, error, getAssignment, uploadFile, saveSubmission } = useMoodleAssign();

const assign = ref<AssignInfo | null>(null);
const submission = ref<AssignSubmission | null>(null);
const onlineText = ref('');
const file = ref<File | null>(null);
const confirmSubmit = ref(false);

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
const assignTitle = computed<string>(
  () => assign.value?.name || queryStr(route.query.title) || 'งาน',
);

const introHtml = computed(() => (assign.value?.intro ? sanitize(assign.value.intro) : ''));
const submittedTextHtml = computed(() =>
  submission.value?.onlineText ? sanitize(submission.value.onlineText) : '',
);
const feedbackHtml = computed(() =>
  submission.value?.feedback ? sanitize(submission.value.feedback) : '',
);
const hasSubmittedContent = computed(
  () => !!submission.value && (!!submission.value.onlineText || submission.value.files.length > 0),
);
const canSubmitNow = computed(() => {
  if (!assign.value) return false;
  if (assign.value.textSubmission && onlineText.value.trim()) return true;
  if (assign.value.fileSubmission && file.value) return true;
  // allow re-submit if there is already content (e.g. editing online text cleared)
  return false;
});

const statusLabel = computed(() => {
  switch (submission.value?.status) {
    case 'submitted':
      return 'ส่งแล้ว';
    case 'draft':
      return 'ฉบับร่าง';
    case 'reopened':
      return 'เปิดให้แก้ไข';
    default:
      return 'ยังไม่ส่ง';
  }
});
const statusColor = computed(() =>
  submission.value?.status === 'submitted'
    ? 'positive'
    : submission.value?.status === 'draft'
      ? 'orange'
      : 'grey',
);
const statusIcon = computed(() =>
  submission.value?.status === 'submitted' ? 'check_circle' : 'pending',
);

function sanitize(html: string): string {
  return DOMPurify.sanitize(html, { ADD_ATTR: ['target'] });
}
function formatDate(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
function openFile(f: AssignFile): void {
  if (f.fileurl) window.open(f.fileurl, '_blank');
}

async function load(): Promise<void> {
  if (moodleCourseId.value == null || !moduleId.value) {
    error.value = 'ไม่พบข้อมูลรายวิชา';
    return;
  }
  const res = await getAssignment(moodleCourseId.value, moduleId.value);
  if (!res) return;
  assign.value = res.assign;
  submission.value = res.submission;
  if (res.submission.onlineText) onlineText.value = stripTags(res.submission.onlineText);
}

function stripTags(html: string): string {
  const tmp = document.createElement('div');
  tmp.innerHTML = sanitize(html);
  return tmp.textContent ?? '';
}

async function submit(): Promise<void> {
  if (!assign.value) return;
  let fileItemId: number | undefined;
  if (assign.value.fileSubmission && file.value) {
    const up = await uploadFile(assign.value.id, file.value);
    if (!up) {
      notifyError('อัปโหลดไฟล์ไม่สำเร็จ');
      return;
    }
    fileItemId = up.itemid;
  }

  const payload: { onlineText?: string; fileItemId?: number; submit: boolean } = { submit: true };
  if (assign.value.textSubmission) payload.onlineText = `<p>${escapeHtml(onlineText.value)}</p>`;
  if (fileItemId != null) payload.fileItemId = fileItemId;

  const res = await saveSubmission(assign.value.id, payload);
  confirmSubmit.value = false;
  if (!res) {
    notifyError(error.value || 'ส่งงานไม่สำเร็จ');
    return;
  }
  submission.value = res.submission;
  file.value = null;
  $q.notify({ type: 'positive', message: 'ส่งงานสำเร็จ', position: 'top' });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/\n/g, '<br>');
}
function notifyError(msg: string): void {
  $q.notify({ type: 'negative', message: msg, position: 'top' });
}

onMounted(() => {
  void load();
});
</script>

<style lang="scss" scoped>
.assign-page {
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
.assign-card {
  background: #ffffff;
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  padding: 28px;

  &--graded {
    background: rgba(33, 186, 69, 0.04);
    border-color: rgba(33, 186, 69, 0.2);
  }

  &__header {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 16px;
  }
  &__title {
    font-size: 1.4rem;
    font-weight: 700;
    line-height: 1.3;
    margin: 0;
    color: #1a1a1a;
  }
}
.assign-html {
  line-height: 1.7;
  word-break: break-word;

  :deep(img),
  :deep(video) {
    max-width: 100%;
    height: auto;
  }
  :deep(a) {
    color: var(--q-primary);
    word-break: break-all;
  }
}
@media (max-width: 600px) {
  .assign-card {
    padding: 20px;
  }
}
</style>
