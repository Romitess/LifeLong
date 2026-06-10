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

      <BaseContentCard v-else-if="error && !forum" class="column items-center text-center q-py-xl">
        <q-icon name="error_outline" size="48px" color="negative" />
        <div class="text-subtitle1 text-weight-medium text-grey-9 q-mt-md">
          โหลดกระดานสนทนาไม่สำเร็จ
        </div>
        <div class="text-body2 text-grey-7 q-mt-xs">{{ error }}</div>
        <BaseButton
          color="primary"
          no-caps
          icon="refresh"
          label="ลองใหม่"
          class="q-mt-lg"
          @click="loadForum"
        />
      </BaseContentCard>

      <template v-else-if="forum">
        <BaseContentCard class="q-mb-md">
          <div class="row items-center q-gutter-sm">
            <q-icon name="forum" size="26px" color="primary" />
            <span class="text-h6 text-weight-bold text-grey-9">{{ forum.name }}</span>
          </div>
          <!-- eslint-disable-next-line vue/no-v-html -- sanitized via DOMPurify -->
          <div
            v-if="introHtml"
            class="forum-html text-body2 text-grey-8 q-mt-md"
            v-html="introHtml"
          />
        </BaseContentCard>

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
          <BaseContentCard>
            <div class="text-h6 text-weight-bold text-grey-9 q-mb-md">
              {{ activeThread.subject }}
            </div>
            <BaseSpinner v-if="loading" message="กำลังโหลดกระทู้..." />
            <template v-for="(post, idx) in activeThread.posts" :key="post.id">
              <q-separator v-if="idx > 0" class="q-my-md" />
              <article
                class="forum-post"
                :class="{ 'forum-post--reply bg-grey-1 rounded-borders q-pa-md': post.hasParent }"
              >
                <div class="row items-center q-gutter-sm">
                  <q-avatar size="32px" color="primary" text-color="white">
                    <img v-if="post.authorPictureUrl" :src="post.authorPictureUrl" alt="" />
                    <span v-else>{{ initial(post.authorName) }}</span>
                  </q-avatar>
                  <div>
                    <div class="text-body2 text-weight-medium text-grey-9">
                      {{ post.authorName || 'ผู้ใช้' }}
                    </div>
                    <div class="text-caption text-grey-6">{{ formatDate(post.created) }}</div>
                  </div>
                </div>
                <!-- eslint-disable-next-line vue/no-v-html -- sanitized via DOMPurify -->
                <div
                  class="forum-html text-body1 text-grey-8 q-mt-sm"
                  v-html="sanitize(post.message)"
                />
              </article>
            </template>

            <div v-if="canReplyThread" class="q-mt-md">
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
          </BaseContentCard>
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
            <BaseContentCard v-else>
              <div class="text-h6 text-weight-bold text-grey-9 q-mb-md">ตั้งกระทู้ใหม่</div>
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
            </BaseContentCard>
          </div>

          <BaseContentCard v-if="discussions.length === 0" class="text-grey-7 text-center q-py-lg">
            <q-icon name="forum" size="40px" color="grey-5" />
            <div class="text-body2 q-mt-sm">ยังไม่มีกระทู้ในกระดานนี้</div>
          </BaseContentCard>
          <BaseContentCard v-else padding="none">
            <q-list separator>
              <q-item
                v-for="d in discussions"
                :key="d.id"
                clickable
                v-ripple
                @click="openThread(d)"
              >
                <q-item-section avatar>
                  <q-icon
                    :name="d.pinned ? 'push_pin' : 'chat_bubble_outline'"
                    :color="d.pinned ? 'amber-8' : 'grey-6'"
                    size="20px"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-medium text-grey-9">{{
                    d.subject
                  }}</q-item-label>
                  <q-item-label caption>
                    {{ d.authorName || 'ผู้ใช้' }} · {{ formatDate(d.created) }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <div class="text-caption text-grey-7 row items-center no-wrap">
                    <q-icon name="comment" size="16px" class="q-mr-xs" /> {{ d.numReplies }}
                  </div>
                </q-item-section>
              </q-item>
            </q-list>
          </BaseContentCard>
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
import BaseContentCard from 'components/base/BaseContentCard.vue';
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

.forum-html {
  line-height: 1.7;

  :deep(p) {
    margin: 0 0 8px;
  }
}

.forum-post--reply {
  margin-left: 24px;
}
</style>
