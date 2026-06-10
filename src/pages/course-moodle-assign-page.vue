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

      <BaseContentCard v-else-if="error && !assign" class="column items-center text-center q-py-xl">
        <q-icon name="error_outline" size="48px" color="negative" />
        <div class="text-subtitle1 text-weight-medium text-grey-9 q-mt-md">โหลดงานไม่สำเร็จ</div>
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

      <template v-else-if="assign && submission">
        <!-- Assignment brief -->
        <BaseContentCard class="q-mb-md">
          <div class="row items-center q-gutter-sm q-mb-md">
            <q-icon name="assignment" size="26px" color="primary" />
            <span class="text-h6 text-weight-bold text-grey-9">{{ assign.name }}</span>
          </div>

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
        </BaseContentCard>

        <!-- Graded feedback -->
        <BaseContentCard
          v-if="submission.grade != null || submission.feedback"
          class="bg-green-1 q-mb-md"
        >
          <div class="text-h6 text-weight-bold text-grey-9 q-mb-sm">
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
        </BaseContentCard>

        <!-- Waiting for grade banner -->
        <q-banner
          v-if="isWaitingGrade"
          rounded
          class="assign-banner assign-banner--waiting q-mb-md"
        >
          <template #avatar>
            <q-spinner-dots color="amber-8" size="28px" />
          </template>
          <span class="text-weight-medium">รอผลการตรวจจากอาจารย์</span>
          <br />
          <span class="text-caption text-grey-7"
            >ระบบจะแจ้งเตือนเมื่อมีผล (ตรวจสอบอัตโนมัติทุก 30 วินาที)</span
          >
          <template #action>
            <BaseButton
              flat
              no-caps
              color="amber-9"
              label="ตรวจสอบเดี๋ยวนี้"
              icon="refresh"
              :loading="loading"
              @click="() => void pollGrade()"
            />
          </template>
        </q-banner>

        <!-- Auto-mark result banner -->
        <q-banner v-if="assignPassed === true" rounded class="bg-green-1 text-grey-9 q-mb-md">
          <template #avatar><q-icon name="check_circle" color="positive" /></template>
          <span class="text-weight-medium">ระบบบันทึกความคืบหน้าเรียบร้อยแล้ว</span>
        </q-banner>
        <q-banner v-else-if="assignPassed === false" rounded class="bg-red-1 text-grey-9 q-mb-md">
          <template #avatar><q-icon name="cancel" color="negative" /></template>
          <span class="text-weight-medium">ยังไม่ผ่านเกณฑ์การส่งงาน</span>
          <br />ระบบยังไม่บันทึกความคืบหน้า กรุณาตรวจสอบเงื่อนไขและลองใหม่อีกครั้ง
        </q-banner>

        <!-- Current submission (read) -->
        <BaseContentCard v-if="hasSubmittedContent" class="q-mb-md">
          <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-sm">งานที่ส่งแล้ว</div>
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
        </BaseContentCard>

        <!-- Submission form -->
        <BaseContentCard v-if="assign.noSubmissions" class="text-grey-7">
          งานนี้ไม่รับการส่งผ่านระบบออนไลน์ (ส่งตามที่อาจารย์กำหนด)
        </BaseContentCard>
        <BaseContentCard v-else-if="submission.canEdit">
          <div class="text-subtitle1 text-weight-bold text-grey-9 q-mb-md">
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
            color="primary"
            no-caps
            unelevated
            icon="send"
            :label="assign.submissionDrafts ? 'บันทึกและส่ง' : 'ส่งงาน'"
            :loading="loading"
            :disable="!canSubmitNow"
            @click="confirmSubmit = true"
          />
        </BaseContentCard>
        <BaseContentCard v-else class="text-grey-7">
          <q-icon name="lock" class="q-mr-xs" />ไม่สามารถส่ง/แก้ไขงานได้ในขณะนี้
        </BaseContentCard>

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
            color="primary"
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import DOMPurify from 'dompurify';
import BaseButton from 'components/base/BaseButton.vue';
import BaseContentCard from 'components/base/BaseContentCard.vue';
import BaseSpinner from 'components/base/BaseSpinner.vue';
import CourseActivityNavigation from 'components/course/CourseActivityNavigation.vue';
import CoursePageHeader from 'components/course/CoursePageHeader.vue';
import { useCourseStore } from 'src/stores/course-store';
import { useCourseProgressStore } from 'src/stores/course-progress-store';
import { useEnrollmentProgressStore } from 'src/stores/enrollment-progress-store';
import { useCourseRegistrationStore } from 'src/stores/course-registration-store';
import { useAuthStore } from 'src/stores/auth-store';
import {
  useMoodleAssign,
  type AssignInfo,
  type AssignSubmission,
  type AssignFile,
} from 'src/composables/use-moodle-assign';

const route = useRoute();
const $q = useQuasar();
const courseStore = useCourseStore();
const progressStore = useCourseProgressStore();
const enrollmentProgressStore = useEnrollmentProgressStore();
const registrationStore = useCourseRegistrationStore();
const authStore = useAuthStore();
const { loading, error, getAssignment, uploadFile, saveSubmission } = useMoodleAssign();

const assign = ref<AssignInfo | null>(null);
const submission = ref<AssignSubmission | null>(null);
const onlineText = ref('');
const file = ref<File | null>(null);
const confirmSubmit = ref(false);
const assignPassed = ref<boolean | null>(null);
const isWaitingGrade = ref(false);
let pollHandle: ReturnType<typeof setInterval> | null = null;

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
const enrollId = computed<number | null>(() => {
  const reg = registrationStore.myRegistrations.find((r) => r.courseId === courseId.value);
  if (reg?.enrollId != null) return reg.enrollId;
  const fromQuery = Number(queryStr(route.query.enrollId));
  return fromQuery > 0 ? fromQuery : null;
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

function stopGradePolling(): void {
  if (pollHandle) {
    clearInterval(pollHandle);
    pollHandle = null;
  }
  isWaitingGrade.value = false;
}

async function pollGrade(): Promise<void> {
  if (moodleCourseId.value == null || !moduleId.value) return;
  const res = await getAssignment(moodleCourseId.value, moduleId.value);
  if (!res) return;
  if (res.submission.grade != null) {
    submission.value = res.submission;
    stopGradePolling();
    $q.notify({
      type: 'positive',
      message: 'มีผลการตรวจงานแล้ว',
      icon: 'emoji_events',
      timeout: 4000,
    });
  }
}

function startGradePolling(): void {
  stopGradePolling();
  isWaitingGrade.value = true;
  pollHandle = setInterval(() => void pollGrade(), 30_000);
}

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
  const username = authStore.user?.username;
  const [res] = await Promise.all([
    getAssignment(moodleCourseId.value, moduleId.value),
    username ? registrationStore.fetchMyEnrollments(username) : Promise.resolve(),
  ]);
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

  const payload: {
    onlineText?: string;
    fileItemId?: number;
    submit: boolean;
    moodleCourseId?: number;
    cmid?: number;
    enrollId?: number;
  } = { submit: true };
  if (assign.value.textSubmission) payload.onlineText = `<p>${escapeHtml(onlineText.value)}</p>`;
  if (fileItemId != null) payload.fileItemId = fileItemId;
  if (moodleCourseId.value != null) payload.moodleCourseId = moodleCourseId.value;
  payload.cmid = assign.value.cmid;
  if (enrollId.value != null) payload.enrollId = enrollId.value;

  const res = await saveSubmission(assign.value.id, payload);
  confirmSubmit.value = false;
  if (!res) {
    notifyError(error.value || 'ส่งงานไม่สำเร็จ');
    return;
  }
  submission.value = res.submission;
  assignPassed.value = res.passed;
  if (res.passed) {
    progressStore.markLessonComplete(courseId.value, assignTitle.value);
    if (enrollId.value != null) void enrollmentProgressStore.fetchCompletion(enrollId.value);
  }
  if (res.submission.grade == null && res.submission.status === 'submitted') {
    startGradePolling();
  }
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

onUnmounted(() => {
  stopGradePolling();
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
.assign-banner--waiting {
  background: rgba(251, 192, 45, 0.08);
  border-color: rgba(251, 192, 45, 0.3);
}
.assign-html {
  line-height: 1.7;
  word-break: break-word;

  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    margin: 14px 0 6px;
    font-size: 1.05rem;
    font-weight: 700;
    line-height: 1.35;
  }
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
</style>
