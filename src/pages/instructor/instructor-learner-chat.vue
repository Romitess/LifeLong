<template>
  <q-page class="instructor-chat-page">
    <div v-if="isTeachingRole" class="section-container instructor-chat-page__inner">
      <InstructorPageHero
        eyebrow="Instructor Workspace"
        :title="t('instructor.chatPage.pageTitle')"
      >
        <template #actions>
          <q-badge rounded color="primary" class="chat-hero__badge">
            {{ t('instructor.chatPage.chatRoomsBadge', { count: conversationEntries.length }) }}
          </q-badge>
        </template>
      </InstructorPageHero>

      <div v-if="conversationEntriesUnsorted.length > 0" class="row q-col-gutter-lg">
        <div class="col-12 col-lg-4">
          <q-card flat bordered class="chat-panel">
            <q-card-section class="chat-panel__header">
              <div class="text-subtitle1 text-weight-bolder">
                {{ t('instructor.chatPage.conversationList') }}
              </div>
              <div class="text-caption text-grey-6">
                {{ t('instructor.chatPage.conversationListSub') }}
              </div>
              <q-select
                v-model="selectedCourseFilter"
                :options="courseFilterOptions"
                outlined
                dense
                emit-value
                map-options
                class="q-mt-sm"
                :label="t('instructor.chatPage.filterByCourse')"
              >
                <template #prepend>
                  <q-icon name="filter_alt" size="xs" color="primary" />
                </template>
              </q-select>
            </q-card-section>

            <q-separator />

            <q-list class="conversation-list">
              <div v-if="conversationEntries.length === 0" class="q-pa-lg text-center text-grey-6">
                <q-icon name="info" size="md" color="grey-4" class="q-mb-sm" />
                <div>{{ t('instructor.chatPage.noConversations') }}</div>
              </div>
              <q-item
                v-for="entry in conversationEntries"
                :key="entry.id"
                clickable
                v-ripple
                class="conversation-item"
                :active="selectedConversationId === entry.id"
                active-class="conversation-item--active"
                @click="selectedConversationId = entry.id"
              >
                <q-item-section avatar>
                  <div class="conversation-avatar-wrap">
                    <q-avatar size="42px" color="primary" text-color="white">
                      {{ entry.learnerInitials }}
                    </q-avatar>
                    <q-badge
                      v-if="entry.messageCount > 0"
                      rounded
                      color="primary"
                      :label="entry.messageCount"
                      class="conversation-avatar-badge"
                    />
                  </div>
                </q-item-section>

                <q-item-section>
                  <q-item-label class="text-weight-bolder">{{ entry.learnerName }}</q-item-label>
                  <q-item-label caption lines="1">
                    {{ entry.course.code }} : {{ getCourseTitle(entry.course) }}
                  </q-item-label>
                  <q-item-label
                    caption
                    lines="1"
                    class="q-mt-xs"
                    :class="entry.messageCount > 0 ? 'text-weight-bold text-dark' : ''"
                  >
                    {{ entry.latestMessagePreview }}
                  </q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-card>
        </div>

        <div class="col-12 col-lg-8">
          <q-card v-if="selectedConversation" flat bordered class="thread-panel column no-wrap">
            <q-card-section class="thread-panel__header">
              <div class="row items-center no-wrap q-gutter-md">
                <div class="thread-panel__course-cover">
                  <CourseCoverImage :course="selectedConversation.course" fill instant />
                </div>
                <div class="col">
                  <div class="text-caption text-grey-6">
                    {{ selectedConversation.course.code }}
                  </div>
                  <div class="text-subtitle1 text-weight-bolder text-dark">
                    {{ getCourseTitle(selectedConversation.course) }}
                  </div>
                  <div class="text-caption text-grey-6 q-mt-xs">
                    {{ t('instructor.chatPage.learnerPrefix') }}
                    {{ selectedConversation.learnerName }}
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <div ref="messageListRef" class="thread-panel__messages col">
              <div v-if="selectedMessages.length === 0" class="thread-empty">
                <q-icon name="forum" size="46px" color="primary" />
                <div class="text-subtitle1 text-weight-bolder q-mt-md">
                  {{ t('instructor.chatPage.emptyMessages') }}
                </div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  {{ t('instructor.chatPage.emptyMessagesSub') }}
                </div>
              </div>

              <div
                v-for="message in selectedMessages"
                :key="message.id"
                class="chat-message"
                :class="`chat-message--${message.sender}`"
              >
                <q-avatar
                  v-if="message.sender === 'learner'"
                  size="34px"
                  class="chat-message__avatar--learner"
                >
                  <img
                    v-if="selectedConversation.learnerEmail"
                    :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedConversation.learnerEmail)}`"
                    alt="learner avatar"
                    loading="eager"
                    decoding="sync"
                  />
                  <span v-else>{{ selectedConversation.learnerInitials }}</span>
                </q-avatar>

                <div class="chat-message__bubble">
                  <div class="chat-message__body">{{ message.body }}</div>
                  <div class="chat-message__time">{{ formatMessageTime(message.sentAt) }}</div>
                  <div
                    v-if="
                      message.sender === 'system' &&
                      (message.status === 'read' || message.id === latestSystemMessageId)
                    "
                    class="chat-message__status"
                    :class="`chat-message__status--${message.status}`"
                  >
                    <q-icon :name="message.status === 'read' ? 'done_all' : 'done'" size="13px" />
                    <span>{{
                      message.status === 'read'
                        ? t('instructor.chatPage.statusRead')
                        : t('instructor.chatPage.statusSent')
                    }}</span>
                  </div>
                </div>

                <q-avatar
                  v-if="message.sender === 'system'"
                  size="34px"
                  class="chat-message__avatar--self"
                >
                  <img
                    :src="`https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(authStore.user?.email ?? '')}`"
                    alt="instructor avatar"
                    loading="eager"
                    decoding="sync"
                  />
                </q-avatar>
              </div>
            </div>

            <q-separator />

            <q-card-section class="thread-panel__composer">
              <div class="row items-stretch no-wrap q-gutter-sm">
                <q-input
                  v-model="replyDraft"
                  outlined
                  dense
                  class="col"
                  :placeholder="t('instructor.chatPage.replyPlaceholder')"
                  @keydown.enter.exact.prevent="sendReply"
                >
                  <template #prepend>
                    <q-icon name="chat_bubble_outline" color="grey-5" />
                  </template>
                </q-input>
                <q-btn
                  unelevated
                  no-caps
                  color="primary"
                  icon="send"
                  :label="t('instructor.chatPage.sendBtn')"
                  :disable="!canSendReply"
                  class="self-stretch"
                  @click="sendReply"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card v-else flat bordered class="chat-empty-card">
        <q-icon name="forum" size="52px" color="primary" />
        <div class="text-h6 text-weight-bolder q-mt-md">{{ t('instructor.chatPage.noRooms') }}</div>
        <div class="text-body2 text-grey-7 q-mt-xs">
          {{ t('instructor.chatPage.noRoomsSub') }}
        </div>
      </q-card>
    </div>

    <div v-else class="section-container q-pa-xl">
      <q-card flat bordered class="chat-empty-card">
        <q-icon name="lock" size="48px" color="grey-6" />
        <div class="text-h6 text-weight-bolder q-mt-md">
          {{ t('instructor.chatPage.teacherOnly') }}
        </div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import CourseCoverImage from 'components/course/CourseCoverImage.vue';
import InstructorPageHero from 'components/instructor/InstructorPageHero.vue';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';
import { useInstructorBackend } from 'src/composables/use-instructor-backend';
import type { Course } from 'src/types/course';

type ChatMessageSender = 'learner' | 'system';
type ChatMessageStatus = 'sent' | 'read';

interface ChatMessage {
  id: string;
  courseId: string;
  sender: ChatMessageSender;
  body: string;
  sentAt: Date;
  status: ChatMessageStatus;
}

interface ConversationEntry {
  id: string;
  course: Course;
  learnerUserId: number;
  learnerName: string;
  learnerInitials: string;
  learnerEmail: string | null;
  messageCount: number;
  latestMessagePreview: string;
  latestMessageTime: number;
  enrollId: number;
}

const { t } = useI18n();
const authStore = useAuthStore();
const courseStore = useCourseStore();
const instructorBackend = useInstructorBackend();

courseStore.init();

const selectedConversationId = ref('');
const replyDraft = ref('');
const messageListRef = ref<HTMLElement | null>(null);

const isTeachingRole = computed(
  () => authStore.user?.role === 'teach' || authStore.user?.role === 'instructor',
);

onMounted(() => {
  const email = authStore.user?.email;
  if (email) {
    void courseStore.fetchInstructorCourses(email);
    void instructorBackend.fetchConversations(email).then(() => {
      instructorBackend.connectSocket(email);
    });
  }
  scrollToLatestMessage();
});

onUnmounted(() => {
  instructorBackend.disconnectSocket();
});

const instructorCourses = computed<Course[]>(() =>
  courseStore.getInstructorCourses(authStore.user),
);

const selectedCourseFilter = ref<string>('all');

const conversationEntriesUnsorted = computed<ConversationEntry[]>(() =>
  instructorBackend.conversations.value.map((conversation) => {
    const course =
      instructorCourses.value.find((candidate) => candidate.id === `db-${conversation.courseId}`) ??
      createFallbackCourse(conversation.courseId);

    const latestMessage =
      conversation.messages && conversation.messages.length > 0
        ? conversation.messages[conversation.messages.length - 1]
        : null;
    const latestMessageTime = latestMessage ? new Date(latestMessage.sentAt).getTime() : 0;

    // Count unread messages from learner
    const unreadCount = (conversation.messages ?? []).filter(
      (m) => m.sender === 'learner' && m.status === 'sent',
    ).length;

    return {
      id: conversation.id,
      course,
      learnerUserId: conversation.learnerUserId,
      learnerName: conversation.learnerName,
      learnerInitials: getLearnerInitials(conversation.learnerName),
      learnerEmail: conversation.learnerEmail ?? null,
      messageCount: unreadCount,
      latestMessagePreview:
        conversation.latestMessagePreview || t('instructor.chatPage.emptyMessages'),
      latestMessageTime,
      enrollId: conversation.enrollId,
    };
  }),
);

const conversationEntries = computed<ConversationEntry[]>(() => {
  let filtered = conversationEntriesUnsorted.value;

  if (selectedCourseFilter.value !== 'all') {
    filtered = filtered.filter((entry) => entry.course.id === selectedCourseFilter.value);
  }

  // Sort: most recent messages first, otherwise alphabetical/fallback
  return [...filtered].sort((a, b) => {
    if (a.latestMessageTime > 0 && b.latestMessageTime > 0) {
      return b.latestMessageTime - a.latestMessageTime;
    }
    if (a.latestMessageTime > 0) return -1;
    if (b.latestMessageTime > 0) return 1;
    return a.course.code.localeCompare(b.course.code) || a.learnerName.localeCompare(b.learnerName);
  });
});

const courseFilterOptions = computed(() => {
  const options = [{ label: 'แสดงทุกวิชา (All Courses)', value: 'all' }];

  const activeCourseIds = new Set<string>();
  conversationEntriesUnsorted.value.forEach((entry) => {
    activeCourseIds.add(entry.course.id);
  });

  activeCourseIds.forEach((courseId) => {
    const course =
      instructorCourses.value.find((c) => c.id === courseId) ||
      conversationEntriesUnsorted.value.find((e) => e.course.id === courseId)?.course;
    if (course) {
      options.push({
        label: `${course.code} : ${getCourseTitle(course)}`,
        value: course.id,
      });
    }
  });

  return options;
});

const selectedConversation = computed<ConversationEntry | null>(
  () =>
    conversationEntries.value.find((entry) => entry.id === selectedConversationId.value) ??
    conversationEntries.value[0] ??
    null,
);

const selectedMessages = computed<ChatMessage[]>(() => {
  const current = selectedConversation.value;
  if (!current) return [];
  const backendConversation = instructorBackend.conversations.value.find(
    (conversation) => conversation.id === current.id,
  );
  return (backendConversation?.messages ?? []).map((message) => ({
    id: message.id,
    courseId: current.course.id,
    sender: message.sender === 'instructor' ? 'system' : 'learner',
    body: message.body,
    sentAt: new Date(message.sentAt),
    status: message.status,
  }));
});

const canSendReply = computed(
  () => replyDraft.value.trim().length > 0 && !!selectedConversation.value,
);

const latestSystemMessageId = computed<string>(() => {
  const msgs = [...selectedMessages.value].reverse();
  return msgs.find((m) => m.sender === 'system')?.id ?? '';
});

watch(
  conversationEntries,
  (entries) => {
    if (!entries.length) {
      selectedConversationId.value = '';
      return;
    }

    if (!entries.some((entry) => entry.id === selectedConversationId.value)) {
      selectedConversationId.value = entries[0]?.id ?? '';
    }
  },
  { immediate: true },
);

watch(
  () => selectedConversation.value,
  (conversation) => {
    if (conversation) {
      const courseId = Number(conversation.course.id.replace('db-', ''));
      void instructorBackend.markAsRead(
        authStore.user?.email,
        courseId,
        conversation.learnerUserId,
      );
      instructorBackend.joinConversationRoom(conversation.enrollId);
    }
  },
  { immediate: true },
);

watch(selectedMessages, (messages) => {
  const hasUnread = messages.some((m) => m.sender === 'learner' && m.status === 'sent');
  if (hasUnread && selectedConversation.value) {
    const courseId = Number(selectedConversation.value.course.id.replace('db-', ''));
    void instructorBackend.markAsRead(
      authStore.user?.email,
      courseId,
      selectedConversation.value.learnerUserId,
    );
  }
  void nextTick(scrollToLatestMessage);
});

function createFallbackCourse(courseId: number): Course {
  return {
    id: `db-${courseId}`,
    code: String(courseId),
    title: `Course ${courseId}`,
    titleEn: `Course ${courseId}`,
    instructorId: '',
    instructorEmail: authStore.user?.email ?? '',
    imageUrl: '',
    cover: { icon: 'school', accentColor: '#f5a623', backgroundColor: '#26364d' },
    registrationStart: '-',
    registrationStartEn: '-',
    registrationEnd: '-',
    registrationEndEn: '-',
    registrationStartDate: '-',
    registrationEndDate: '-',
    price: 0,
    isFree: true,
    views: 0,
    status: 'เปิดรับสมัคร',
    deliveryModes: [],
    isActive: true,
    faculty: '-',
    facultyEn: '-',
    category: '-',
    categoryEn: '-',
    maxSeats: 0,
    enrolledCount: 0,
    totalHours: 0,
  };
}

function getCourseTitle(course: Course): string {
  return course.titleEn || course.title;
}

function getLearnerInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts
    .map((part) => part[0])
    .join('')
    .slice(0, 2);
  return initials || 'ผร';
}

function formatMessageTime(date: Date): string {
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

async function sendReply(): Promise<void> {
  if (!canSendReply.value || !selectedConversation.value) {
    return;
  }

  const body = replyDraft.value.trim();
  replyDraft.value = '';
  const courseId = Number(selectedConversation.value.course.id.replace('db-', ''));
  await instructorBackend.sendMessage(
    authStore.user?.email,
    courseId,
    selectedConversation.value.learnerUserId,
    body,
  );
  await nextTick();
  scrollToLatestMessage();
}

function scrollToLatestMessage(): void {
  if (!messageListRef.value) {
    return;
  }

  messageListRef.value.scrollTop = messageListRef.value.scrollHeight;
}
</script>

<style scoped lang="scss">
.instructor-chat-page {
  min-height: 100vh;
  background: #f6f8f8;
}

.instructor-chat-page__inner {
  padding: 0 0 64px;
}

.chat-hero {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 24px;
  margin-bottom: 24px;
}

.chat-hero__title {
  margin: 0;
  color: #263238;
  font-size: 2rem;
  font-weight: 900;
  line-height: 1.2;
}

.chat-hero__subtitle {
  max-width: 680px;
  margin: 8px 0 0;
  color: #607d8b;
  font-size: 0.96rem;
  line-height: 1.7;
}

.chat-hero__badge {
  flex: 0 0 auto;
  padding: 8px 12px;
  font-weight: 800;
}

.chat-panel,
.thread-panel,
.chat-empty-card {
  border-radius: 14px !important;
  background: #ffffff;
}

.chat-panel {
  overflow: hidden;
}

.chat-panel__header {
  padding: 18px;
}

.conversation-list {
  max-height: 646px;
  overflow-y: auto;
  padding: 8px;
}

.conversation-item {
  min-height: 86px;
  border-radius: 8px;
  margin-bottom: 6px;
}

.conversation-avatar-wrap {
  position: relative;
  display: inline-block;
}

.conversation-avatar-badge {
  position: absolute;
  top: -4px;
  right: -310px;
  min-width: 18px;
  height: 18px;
  font-size: 0.65rem;
  font-weight: 700;
  padding: 0 5px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
}

.conversation-item--active {
  color: #3d2600;
  background: rgba(247, 208, 70, 0.16);
}

.thread-panel {
  height: 720px;
  overflow: hidden;
}

.thread-panel__header {
  flex: 0 0 auto;
  padding: 18px;
}

.thread-panel__course-cover {
  width: 72px;
  height: 54px;
  overflow: hidden;
  border-radius: 8px;
  background: #eceff1;
}

.thread-panel__messages {
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
  background:
    radial-gradient(circle at 90% 8%, rgba($primary, 0.08), transparent 30%),
    linear-gradient(180deg, #fbfcfd 0%, #f6f8f8 100%);
}

.thread-panel__composer {
  flex: 0 0 auto;
  padding: 16px;
}

.thread-empty,
.chat-empty-card {
  display: grid;
  place-items: center;
  min-height: 280px;
  padding: 44px 24px;
  text-align: center;
}

.chat-message {
  display: flex;
  align-items: flex-end;
  gap: 10px;
  margin-bottom: 16px;
}

.chat-message--system {
  justify-content: flex-end;
}

.chat-message__bubble {
  max-width: min(520px, 78%);
  padding: 10px 14px;
  border-radius: 16px;
  background: #ffffff;
  color: #1f2937;
  border: 1px solid rgba(17, 24, 39, 0.08);
  box-shadow: 0 8px 20px rgba(17, 24, 39, 0.08);
}

.chat-message--system .chat-message__bubble {
  background: linear-gradient(135deg, $primary, #f8c94a);
  border-color: transparent;
  border-bottom-right-radius: 4px;
}

.chat-message--learner .chat-message__bubble {
  border-bottom-left-radius: 4px;
}

.chat-message__body {
  color: inherit;
  font-size: 0.875rem;
  line-height: 1.5;
  white-space: pre-wrap;
  word-break: break-word;
}

.chat-message__time {
  margin-top: 4px;
  color: rgba(31, 41, 55, 0.48);
  font-size: 0.62rem;
  font-weight: 400;
  text-align: right;
}

.chat-message__status {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 4px;
  margin-top: 2px;
  color: rgba(31, 41, 55, 0.45);
  font-size: 0.62rem;
  font-weight: 400;
  line-height: 1.2;

  &--read {
    color: rgba(25, 118, 210, 0.68);
  }
}

.chat-message__avatar--learner {
  flex-shrink: 0;
  overflow: hidden;
  background: linear-gradient(135deg, rgba($primary, 0.15), rgba($secondary, 0.15));

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.chat-message__avatar--self {
  flex-shrink: 0;
  overflow: hidden;
  background: linear-gradient(135deg, rgba($primary, 0.15), rgba($secondary, 0.15));

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

@media (max-width: 1023px) {
  .instructor-chat-page__inner {
    padding: 0 16px 48px;
  }

  .chat-hero {
    display: block;
  }

  .chat-hero__badge {
    margin-top: 16px;
  }

  .thread-panel {
    height: 640px;
  }
}
</style>
