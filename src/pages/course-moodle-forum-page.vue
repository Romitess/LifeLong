<template>
  <q-page class="forum-page">
    <CoursePageHeader
      :course-id="courseId"
      :course-title="courseTitle"
      :current="forumTitle"
      with-back
    />

    <div class="content-area section-container">
      <BaseSpinner v-if="loading && !forum" message="กำลังโหลดกระดานสนทนา..." />

      <div v-else-if="error && !forum" class="forum-card column items-center text-center q-py-xl">
        <q-icon name="error_outline" size="48px" color="negative" />
        <div class="text-subtitle1 text-weight-medium q-mt-md">โหลดกระดานสนทนาไม่สำเร็จ</div>
        <div class="text-body2 text-grey-7 q-mt-xs">{{ error }}</div>
        <BaseButton
          color="primary"
          no-caps
          icon="refresh"
          label="ลองใหม่"
          class="q-mt-lg"
          @click="loadForum"
        />
      </div>

      <template v-else-if="forum">
        <div class="forum-card q-mb-md">
          <header class="forum-card__header">
            <q-icon name="forum" size="26px" color="primary" />
            <h1 class="forum-card__title">{{ forum.name }}</h1>
          </header>
          <!-- eslint-disable-next-line vue/no-v-html -- sanitized via DOMPurify -->
          <div v-if="introHtml" class="forum-html q-mt-md" v-html="introHtml" />
        </div>

        <!-- Thread view -->
        <template v-if="activeThread">
          <BaseButton
            flat
            no-caps
            icon="arrow_back"
            label="กลับไปรายการกระทู้"
            class="q-mb-sm"
            @click="closeThread"
          />
          <div class="forum-card">
            <h2 class="forum-thread__subject">{{ activeThread.subject }}</h2>
            <BaseSpinner v-if="loading" message="กำลังโหลดกระทู้..." />
            <article
              v-for="post in activeThread.posts"
              :key="post.id"
              class="forum-post"
              :class="{ 'forum-post--reply': post.hasParent }"
            >
              <div class="forum-post__meta">
                <q-avatar size="32px" color="primary" text-color="white">
                  <img v-if="post.authorPictureUrl" :src="post.authorPictureUrl" alt="" />
                  <span v-else>{{ initial(post.authorName) }}</span>
                </q-avatar>
                <div class="forum-post__author">
                  <div class="text-weight-medium">{{ post.authorName || 'ผู้ใช้' }}</div>
                  <div class="text-caption text-grey-6">{{ formatDate(post.created) }}</div>
                </div>
              </div>
              <!-- eslint-disable-next-line vue/no-v-html -- sanitized via DOMPurify -->
              <div class="forum-html q-mt-sm" v-html="sanitize(post.message)" />
            </article>

            <div v-if="canReplyThread" class="forum-reply q-mt-md">
              <q-input
                v-model="replyText"
                type="textarea"
                outlined
                autogrow
                label="เขียนตอบกลับ..."
                :disable="loading"
              />
              <div class="row justify-end q-mt-sm">
                <BaseButton
                  color="primary"
                  no-caps
                  unelevated
                  icon="send"
                  label="ตอบกลับ"
                  :loading="loading"
                  :disable="!replyText.trim()"
                  @click="submitReply"
                />
              </div>
            </div>
          </div>
        </template>

        <!-- Discussion list -->
        <template v-else>
          <div v-if="canCreateTopic" class="q-mb-md">
            <BaseButton
              v-if="!showNewTopic"
              color="primary"
              no-caps
              unelevated
              icon="add"
              label="ตั้งกระทู้ใหม่"
              @click="showNewTopic = true"
            />
            <div v-else class="forum-card">
              <h2 class="forum-thread__subject">ตั้งกระทู้ใหม่</h2>
              <q-input
                v-model="newSubject"
                outlined
                label="หัวข้อ"
                maxlength="255"
                class="q-mb-sm"
                :disable="loading"
              />
              <q-input
                v-model="newMessage"
                type="textarea"
                outlined
                autogrow
                label="เนื้อหา"
                :disable="loading"
              />
              <div class="row justify-end q-gutter-sm q-mt-sm">
                <BaseButton
                  flat
                  no-caps
                  label="ยกเลิก"
                  :disable="loading"
                  @click="showNewTopic = false"
                />
                <BaseButton
                  color="primary"
                  no-caps
                  unelevated
                  icon="send"
                  label="โพสต์กระทู้"
                  :loading="loading"
                  :disable="!newSubject.trim() || !newMessage.trim()"
                  @click="submitNewTopic"
                />
              </div>
            </div>
          </div>

          <div v-if="discussions.length === 0" class="forum-card text-grey-7 text-center q-py-lg">
            <q-icon name="forum" size="40px" color="grey-5" />
            <div class="q-mt-sm">ยังไม่มีกระทู้ในกระดานนี้</div>
          </div>
          <ul v-else class="forum-list">
            <li
              v-for="d in discussions"
              :key="d.id"
              class="forum-list__item"
              @click="openThread(d)"
            >
              <q-icon
                :name="d.pinned ? 'push_pin' : 'chat_bubble_outline'"
                :color="d.pinned ? 'amber-8' : 'grey-6'"
                size="20px"
              />
              <div class="forum-list__body">
                <div class="forum-list__subject">{{ d.subject }}</div>
                <div class="text-caption text-grey-6">
                  {{ d.authorName || 'ผู้ใช้' }} · {{ formatDate(d.created) }}
                </div>
              </div>
              <div class="forum-list__replies text-caption text-grey-7">
                <q-icon name="comment" size="16px" /> {{ d.numReplies }}
              </div>
            </li>
          </ul>
        </template>

        <CourseActivityNavigation
          :course-id="courseId"
          :moodle-course-id="moodleCourseId"
          :current-module-id="moduleId"
          :current-title="forumTitle"
        />
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import DOMPurify from 'dompurify';
import BaseButton from 'components/base/BaseButton.vue';
import BaseSpinner from 'components/base/BaseSpinner.vue';
import CourseActivityNavigation from 'components/course/CourseActivityNavigation.vue';
import CoursePageHeader from 'components/course/CoursePageHeader.vue';
import { useCourseStore } from 'src/stores/course-store';
import {
  useMoodleForum,
  type ForumInfo,
  type ForumDiscussionSummary,
  type ForumDiscussionThread,
} from 'src/composables/use-moodle-forum';

const route = useRoute();
const courseStore = useCourseStore();
const { loading, error, getForum, getDiscussion, replyToPost, createDiscussion } = useMoodleForum();

const forum = ref<ForumInfo | null>(null);
const discussions = ref<ForumDiscussionSummary[]>([]);
const activeThread = ref<ForumDiscussionThread | null>(null);

const replyText = ref('');
const showNewTopic = ref(false);
const newSubject = ref('');
const newMessage = ref('');

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
const forumTitle = computed<string>(
  () => forum.value?.name || queryStr(route.query.title) || 'กระดานสนทนา',
);
const introHtml = computed(() => (forum.value?.intro ? sanitize(forum.value.intro) : ''));

// News forums are announcement-only — students can't start discussions there.
const canCreateTopic = computed<boolean>(() => !!forum.value && forum.value.type !== 'news');
const rootPost = computed(
  () => activeThread.value?.posts.find((p) => !p.hasParent) ?? activeThread.value?.posts[0] ?? null,
);
const canReplyThread = computed<boolean>(() => rootPost.value?.canReply === true);

function sanitize(html: string | null): string {
  return html ? DOMPurify.sanitize(html, { ADD_ATTR: ['target'] }) : '';
}

function initial(name: string): string {
  return name?.trim()?.charAt(0)?.toUpperCase() || '?';
}

function formatDate(unixSeconds: number): string {
  if (!unixSeconds) return '';
  return new Date(unixSeconds * 1000).toLocaleString('th-TH', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

async function loadForum(): Promise<void> {
  if (moodleCourseId.value == null || !moduleId.value) {
    error.value = 'ไม่พบข้อมูลรายวิชา';
    return;
  }
  const result = await getForum(moodleCourseId.value, moduleId.value);
  if (!result) return;
  forum.value = result.forum;
  discussions.value = result.discussions;
}

async function openThread(discussion: ForumDiscussionSummary): Promise<void> {
  const thread = await getDiscussion(discussion.id);
  if (thread) {
    activeThread.value = thread;
    replyText.value = '';
  }
}

function closeThread(): void {
  activeThread.value = null;
  replyText.value = '';
}

async function submitReply(): Promise<void> {
  const thread = activeThread.value;
  const parent = rootPost.value;
  if (!thread || !parent || !replyText.value.trim()) return;
  const result = await replyToPost(thread.discussionId, parent.id, replyText.value.trim());
  if (!result) return;
  replyText.value = '';
  const refreshed = await getDiscussion(thread.discussionId);
  if (refreshed) activeThread.value = refreshed;
}

async function submitNewTopic(): Promise<void> {
  if (moodleCourseId.value == null || !moduleId.value) return;
  if (!newSubject.value.trim() || !newMessage.value.trim()) return;
  const result = await createDiscussion(
    moodleCourseId.value,
    moduleId.value,
    newSubject.value.trim(),
    newMessage.value.trim(),
  );
  if (!result) return;
  showNewTopic.value = false;
  newSubject.value = '';
  newMessage.value = '';
  await loadForum();
  await openThread({ id: result.discussionId } as ForumDiscussionSummary);
}

onMounted(() => {
  courseStore.init();
  void loadForum();
});
</script>

<style lang="scss" scoped>
.forum-page {
  min-height: calc(100vh - 64px);
}

.forum-card {
  padding: 24px;
  border: 1px solid #e8edf3;
  border-radius: 8px;
  background: #fff;
}

.forum-card__header {
  display: flex;
  align-items: center;
  gap: 10px;
}

.forum-card__title {
  margin: 0;
  font-size: 1.35rem;
  line-height: 1.3;
  font-weight: 700;
  color: #1f2937;
}

.forum-html {
  color: #344054;
  line-height: 1.7;

  :deep(p) {
    margin: 0 0 8px;
  }
}

.forum-list {
  list-style: none;
  margin: 0;
  padding: 0;
  border: 1px solid #e8edf3;
  border-radius: 8px;
  overflow: hidden;
  background: #fff;
}

.forum-list__item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 18px;
  cursor: pointer;
  border-bottom: 1px solid #eef2f6;
  transition: background 0.15s;

  &:last-child {
    border-bottom: 0;
  }

  &:hover {
    background: #f5f8fc;
  }
}

.forum-list__body {
  flex: 1;
  min-width: 0;
}

.forum-list__subject {
  font-weight: 600;
  color: #1f2937;
}

.forum-list__replies {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap;
}

.forum-thread__subject {
  margin: 0 0 16px;
  font-size: 1.2rem;
  font-weight: 700;
  color: #1f2937;
}

.forum-post {
  padding: 16px 0;
  border-bottom: 1px solid #eef2f6;

  &:last-child {
    border-bottom: 0;
  }

  &--reply {
    margin-left: 24px;
    padding-left: 16px;
    border-left: 2px solid #e3e9f2;
  }
}

.forum-post__meta {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
