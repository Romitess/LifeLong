<template>
  <q-page class="instructor-chat-page">
    <div v-if="isTeachingRole" class="section-container instructor-chat-page__inner">
      <InstructorPageHero
        eyebrow="Instructor Workspace"
        title="สนทนากับผู้เรียน"
        description="ติดตามข้อความจากผู้เรียนในรายวิชาที่คุณรับผิดชอบ และตอบกลับจากหน้าผู้สอนได้ทันที"
      >
        <template #actions>
          <q-badge rounded color="primary" class="chat-hero__badge">
            {{ conversationEntries.length }} ห้องสนทนา
          </q-badge>
        </template>
      </InstructorPageHero>

      <div v-if="conversationEntriesUnsorted.length > 0" class="row q-col-gutter-lg">
        <div class="col-12 col-lg-4">
          <q-card flat bordered class="chat-panel">
            <q-card-section class="chat-panel__header">
              <div class="text-subtitle1 text-weight-bolder">รายการสนทนา</div>
              <div class="text-caption text-grey-6">แยกตามรายวิชาและผู้เรียน</div>
              <q-select
                v-model="selectedCourseFilter"
                :options="courseFilterOptions"
                outlined
                dense
                emit-value
                map-options
                class="q-mt-sm"
                label="กรองข้อมูลตามรายวิชา"
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
                <div>ไม่พบรายการสนทนาในรายวิชานี้</div>
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
                  <q-avatar size="42px" color="primary" text-color="white">
                    {{ entry.learnerInitials }}
                  </q-avatar>
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

                <q-item-section side top>
                  <q-badge v-if="entry.messageCount > 0" rounded color="amber-8">
                    {{ entry.messageCount }}
                  </q-badge>
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
                    ผู้เรียน: {{ selectedConversation.learnerName }}
                  </div>
                </div>
              </div>
            </q-card-section>

            <q-separator />

            <div ref="messageListRef" class="thread-panel__messages col">
              <div v-if="selectedMessages.length === 0" class="thread-empty">
                <q-icon name="forum" size="46px" color="primary" />
                <div class="text-subtitle1 text-weight-bolder q-mt-md">ยังไม่มีข้อความ</div>
                <div class="text-caption text-grey-6 q-mt-xs">
                  เมื่อผู้เรียนส่งข้อความจากหน้าโปรไฟล์ ข้อความจะแสดงที่นี่
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
                  color="primary"
                  text-color="white"
                >
                  {{ selectedConversation.learnerInitials }}
                </q-avatar>

                <div class="chat-message__bubble">
                  <div class="chat-message__body">{{ message.body }}</div>
                  <div class="chat-message__time">{{ formatMessageTime(message.sentAt) }}</div>
                </div>

                <q-avatar
                  v-if="message.sender === 'system'"
                  size="34px"
                  color="amber-8"
                  text-color="white"
                >
                  <q-icon name="support_agent" size="19px" />
                </q-avatar>
              </div>
            </div>

            <q-separator />

            <q-card-section class="thread-panel__composer">
              <div class="row items-start no-wrap q-gutter-sm">
                <q-input
                  v-model="replyDraft"
                  outlined
                  dense
                  class="col"
                  placeholder="พิมพ์ข้อความตอบกลับผู้เรียน..."
                  @keydown.enter.exact.prevent="sendReply"
                >
                  <template #prepend>
                    <q-icon name="chat_bubble_outline" color="grey-5" />
                  </template>
                </q-input>
                <q-btn
                  unelevated
                  color="primary"
                  icon="send"
                  label="ส่ง"
                  :disable="!canSendReply"
                  @click="sendReply"
                />
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <q-card v-else flat bordered class="chat-empty-card">
        <q-icon name="forum" size="52px" color="primary" />
        <div class="text-h6 text-weight-bolder q-mt-md">ยังไม่มีห้องสนทนา</div>
        <div class="text-body2 text-grey-7 q-mt-xs">
          เมื่อมีผู้เรียนลงทะเบียนในรายวิชาของคุณ ระบบจะแสดงห้องสนทนาที่นี่
        </div>
      </q-card>
    </div>

    <div v-else class="section-container q-pa-xl">
      <q-card flat bordered class="chat-empty-card">
        <q-icon name="lock" size="48px" color="grey-6" />
        <div class="text-h6 text-weight-bolder q-mt-md">หน้านี้สำหรับผู้สอนเท่านั้น</div>
      </q-card>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue';
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
  messageCount: number;
  latestMessagePreview: string;
  latestMessageTime: number;
  enrollId: number;
}

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
      messageCount: unreadCount,
      latestMessagePreview: conversation.latestMessagePreview || 'ยังไม่มีข้อความ',
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
  padding: 48px 0 64px;
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
  border-radius: 8px;
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
  padding: 22px;
  background: #fbfcfc;
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
  margin-bottom: 14px;
}

.chat-message--system {
  justify-content: flex-end;
}

.chat-message__bubble {
  max-width: min(520px, 78%);
  padding: 10px 12px;
  border-radius: 8px;
  background: #ffffff;
  border: 1px solid rgba(38, 50, 56, 0.08);
  box-shadow: 0 6px 18px rgba(17, 24, 39, 0.06);
}

.chat-message--system .chat-message__bubble {
  color: #3d2600;
  background: rgba(247, 208, 70, 0.18);
  border-color: rgba(245, 166, 35, 0.22);
}

.chat-message__body {
  color: inherit;
  font-size: 0.92rem;
  line-height: 1.55;
  white-space: pre-wrap;
}

.chat-message__time {
  margin-top: 4px;
  color: #90a4ae;
  font-size: 0.7rem;
  font-weight: 700;
  text-align: right;
}

@media (max-width: 1023px) {
  .instructor-chat-page__inner {
    padding: 28px 16px 48px;
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
