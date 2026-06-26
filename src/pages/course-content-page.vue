<template>
  <q-page class="content-page">
    <!-- Breadcrumb bar -->
    <CoursePageHeader
      :course-id="courseId"
      :course-title="courseTitle"
      :current="lessonTitle"
      with-back
    />

    <!-- Content area -->
    <div class="content-area section-container">
      <BaseContentCard>
        <div class="row items-center q-gutter-sm content-card__header">
          <q-icon :name="headerIcon" size="26px" color="primary" />
          <span class="text-h6 text-weight-bold text-grey-9">{{ lessonTitle }}</span>
        </div>

        <!-- Loading -->
        <BaseSpinner v-if="loading" message="กำลังโหลดเนื้อหา..." />

        <!-- Error -->
        <div v-else-if="error" class="column items-center q-pa-xl text-center">
          <q-icon name="error_outline" size="48px" color="negative" />
          <div class="text-subtitle1 text-weight-medium text-grey-9 q-mt-md">
            โหลดเนื้อหาไม่สำเร็จ
          </div>
          <div class="text-body2 text-grey-7 q-mt-xs">{{ error }}</div>
          <BaseButton
            color="primary"
            no-caps
            icon="refresh"
            label="ลองใหม่"
            class="q-mt-lg"
            @click="reload"
          />
        </div>

        <!-- Success -->
        <template v-else-if="content">
          <!-- eslint-disable-next-line vue/no-v-html -- sanitized via DOMPurify (safeHtml) -->
          <div v-if="safeHtml" class="content-card__html text-grey-8" v-html="safeHtml" />

          <q-list v-if="content.contents.length" separator class="q-mt-md">
            <q-item-label header class="text-weight-bold">ไฟล์แนบ</q-item-label>
            <q-item
              v-for="(file, idx) in content.contents"
              :key="idx"
              clickable
              v-ripple
              @click="openFile(file)"
            >
              <q-item-section avatar>
                <q-icon :name="fileIcon(file)" color="primary" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="ellipsis">{{ file.filename || 'ไฟล์แนบ' }}</q-item-label>
              </q-item-section>
              <q-item-section side>
                <q-icon name="open_in_new" size="18px" color="grey-6" />
              </q-item-section>
            </q-item>
          </q-list>

          <!-- Empty -->
          <div
            v-if="!safeHtml && !content.contents.length"
            class="column items-center q-pa-xl text-center text-grey-6"
          >
            <q-icon name="inbox" size="48px" />
            <div class="text-body2 q-mt-md">{{ emptyText }}</div>
          </div>
        </template>
      </BaseContentCard>

      <CourseActivityNavigation
        :course-id="courseId"
        :moodle-course-id="moodleCourseId"
        :current-module-id="moduleId"
        :current-title="lessonTitle"
      />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import DOMPurify from 'dompurify';
import BaseButton from 'components/base/BaseButton.vue';
import BaseContentCard from 'components/base/BaseContentCard.vue';
import BaseSpinner from 'components/base/BaseSpinner.vue';
import CourseActivityNavigation from 'components/course/CourseActivityNavigation.vue';
import CoursePageHeader from 'components/course/CoursePageHeader.vue';
import { useCourseStore } from 'src/stores/course-store';
import { useCourseProgressStore } from 'src/stores/course-progress-store';
import {
  useMoodleModuleContent,
  type MoodleModuleFile,
} from 'src/composables/use-moodle-module-content';

const MODNAME_ICON: Record<string, string> = {
  page: 'article',
  resource: 'insert_drive_file',
  url: 'link',
  folder: 'folder',
  label: 'label',
  book: 'menu_book',
  forum: 'campaign',
};

const route = useRoute();
const courseStore = useCourseStore();
const progressStore = useCourseProgressStore();
const { content, loading, error, fetchModule } = useMoodleModuleContent();

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

function queryString(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? '');
  return typeof value === 'string' ? value : '';
}

const currentCourse = computed(() =>
  courseId.value ? courseStore.getCourseDetailById(courseId.value) : null,
);

const courseTitle = computed<string>(() => currentCourse.value?.title || 'รายวิชา');

const moodleCourseId = computed<number | null>(() => {
  const fromCourse = currentCourse.value?.moodleId;
  if (fromCourse) return fromCourse;
  const fromQuery = Number(queryString(route.query.moodleCourseId));
  return fromQuery > 0 ? fromQuery : null;
});

const lessonTitle = computed<string>(
  () => queryString(route.query.title) || content.value?.name || 'เนื้อหาบทเรียน',
);

const modname = computed<string>(
  () => queryString(route.query.modname) || content.value?.modname || '',
);

const headerIcon = computed<string>(() => MODNAME_ICON[modname.value] || 'article');

const emptyText = computed<string>(() =>
  modname.value === 'forum' ? 'ยังไม่มีประกาศในขณะนี้' : 'ไม่มีเนื้อหาแสดงในบทเรียนนี้',
);

const safeHtml = computed<string>(() =>
  content.value?.description
    ? DOMPurify.sanitize(content.value.description, { ADD_ATTR: ['target'] })
    : '',
);

function fileIcon(file: MoodleModuleFile): string {
  const mime = file.mimetype ?? '';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'movie';
  if (mime.startsWith('audio/')) return 'audiotrack';
  if (mime.includes('pdf')) return 'picture_as_pdf';
  if (mime.includes('zip') || mime.includes('compressed')) return 'folder_zip';
  return 'insert_drive_file';
}

// fileurl is a signed backend proxy URL (token kept server-side) — open directly.
function openFile(file: MoodleModuleFile): void {
  if (file.fileurl) window.open(file.fileurl, '_blank');
}

async function load(): Promise<void> {
  if (moodleCourseId.value == null || !moduleId.value) return;
  await fetchModule(moodleCourseId.value, moduleId.value);
  if (content.value && !error.value && courseId.value && lessonTitle.value) {
    progressStore.markLessonComplete(courseId.value, lessonTitle.value);
  }
}

function reload(): void {
  void load();
}

watch(
  [moduleId, moodleCourseId] as const,
  () => {
    void load();
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.content-page {
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

.content-card__header {
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.07);
}

.content-card__html {
  line-height: 1.7;
  word-break: break-word;

  // Normalize Moodle-sourced headings so they don't render at the browser
  // default (huge) size inside our cards.
  :deep(h1),
  :deep(h2),
  :deep(h3),
  :deep(h4) {
    margin: 16px 0 8px;
    font-size: 1.1rem;
    font-weight: 700;
    line-height: 1.35;
  }

  :deep(img),
  :deep(video),
  :deep(iframe) {
    max-width: 100%;
    height: auto;
  }

  :deep(table) {
    max-width: 100%;
    border-collapse: collapse;
  }

  :deep(a) {
    color: var(--q-primary);
    word-break: break-all;
  }
}
</style>
