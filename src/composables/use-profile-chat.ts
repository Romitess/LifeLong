import {
  ref,
  computed,
  nextTick,
  watch,
  onMounted,
  onUnmounted,
  type Ref,
  type ComputedRef,
} from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { io, type Socket } from 'socket.io-client';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth-store';
import type { CourseRegistration } from 'src/stores/course-registration-store';
import type { RegisteredCourseEntry } from 'src/composables/use-my-registered-courses';

export type ChatMessageSender = 'learner' | 'system' | 'instructor';
export type ChatMessageStatus = 'sent' | 'read';

export interface ChatMessage {
  id: string;
  courseId: string;
  sender: ChatMessageSender;
  body: string;
  sentAt: Date;
  status: ChatMessageStatus;
}

interface ApiChatMessage {
  id: number;
  typeSender: string | null;
  message: string | null;
  chatTime: string | null;
  status: string | null;
}

export function useProfileChat(
  myRegistrations: Ref<CourseRegistration[]> | ComputedRef<CourseRegistration[]>,
  myRegisteredCourseEntries: Ref<RegisteredCourseEntry[]> | ComputedRef<RegisteredCourseEntry[]>,
) {
  const { t, locale } = useI18n();
  const $q = useQuasar();
  const authStore = useAuthStore();

  const selectedChatCourseId = ref<string | null>(null);
  const chatDraft = ref('');
  const chatMessages = ref<ChatMessage[]>([]);
  const chatMessagesRef = ref<HTMLElement | null>(null);
  let socket: Socket | null = null;

  const selectedChatEntry = computed<RegisteredCourseEntry | null>(() => {
    if (myRegisteredCourseEntries.value.length === 0) {
      return null;
    }

    return (
      myRegisteredCourseEntries.value.find(
        (entry) => entry.course.id === selectedChatCourseId.value,
      ) ??
      myRegisteredCourseEntries.value[0] ??
      null
    );
  });

  const chatThreadMessages = computed<ChatMessage[]>(() => {
    if (!selectedChatEntry.value) {
      return [];
    }

    return chatMessages.value.filter(
      (message) => message.courseId === selectedChatEntry.value?.course.id,
    );
  });

  const canSendChatMessage = computed<boolean>(
    () => Boolean(selectedChatEntry.value) && chatDraft.value.trim().length > 0,
  );

  async function fetchChatMessages(): Promise<void> {
    const enrollId = selectedChatEntry.value?.registration?.enrollId;
    if (!enrollId) {
      chatMessages.value = [];
      return;
    }

    try {
      const { data } = await api.get<ApiChatMessage[]>(`/api/lltchat/enroll/${enrollId}`);
      chatMessages.value = data.map((chat: ApiChatMessage) => ({
        id: String(chat.id),
        courseId: selectedChatEntry.value?.course.id || '',
        sender:
          chat.typeSender === 'T' ? 'instructor' : chat.typeSender === 'U' ? 'learner' : 'system',
        body: chat.message || '',
        sentAt: chat.chatTime ? new Date(chat.chatTime) : new Date(),
        status: chat.status === 'R' ? 'read' : 'sent',
      }));
    } catch (error) {
      console.error('Failed to fetch chat messages', error);
    }
  }

  function connectChatSocket() {
    if (socket?.connected) return;
    if (socket) {
      socket.disconnect();
      socket = null;
    }

    const baseUrl =
      (import.meta.env.VITE_API_URL as string) ||
      (import.meta.env.VITE_BACKEND_URL as string) ||
      '';
    const origin = baseUrl.startsWith('http') ? new URL(baseUrl).origin : window.location.origin;

    socket = io(`${origin}/chat`, {
      transports: ['polling', 'websocket'],
      auth: { token: authStore.token ? `Bearer ${authStore.token}` : '' },
    });

    socket.on('connect', () => {
      const enrollId = selectedChatEntry.value?.registration?.enrollId;
      if (enrollId) {
        socket?.emit('joinRoom', { enrollId });
      }
    });

    socket.on('newMessage', (msg: Record<string, unknown>) => {
      const enrollId = selectedChatEntry.value?.registration?.enrollId;
      if (!enrollId || Number(msg.enrollId) !== Number(enrollId)) return;

      const msgId = String(msg.id);
      const exists = chatMessages.value.some((m) => m.id === msgId);
      if (exists) return;

      // Support both transformed (sender/body) and raw DB (typeSender/message) formats
      const typeSender = (msg.typeSender as string) ?? '';
      const rawSender = msg.sender as ChatMessageSender | undefined;
      const sender: ChatMessageSender =
        rawSender ??
        (typeSender === 'T' ? 'instructor' : typeSender === 'U' ? 'learner' : 'system');

      chatMessages.value.push({
        id: msgId,
        courseId: selectedChatEntry.value?.course.id || '',
        sender,
        body: (msg.body as string) || (msg.message as string) || '',
        sentAt: new Date((msg.sentAt as string) || (msg.chatTime as string) || Date.now()),
        status: msg.status === 'read' || msg.status === 'R' ? 'read' : 'sent',
      });
      void nextTick(scrollChatToLatestMessage);
    });

    socket.on(
      'messagesRead',
      (data: { enrollId: number | string; senderType: 'learner' | 'instructor' }) => {
        const enrollId = selectedChatEntry.value?.registration?.enrollId;
        if (!enrollId || Number(data.enrollId) !== Number(enrollId)) return;

        chatMessages.value.forEach((m) => {
          if (m.sender === data.senderType) {
            m.status = 'read';
          }
        });
      },
    );
  }

  function disconnectChatSocket() {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }

  function joinChatRoom(enrollId: number) {
    if (socket) {
      socket.emit('joinRoom', { enrollId });
    }
  }

  function scrollChatToLatestMessage(): void {
    const messagePanel = chatMessagesRef.value;
    if (!messagePanel) {
      return;
    }
    messagePanel.scrollTop = messagePanel.scrollHeight;
  }

  async function sendChatMessage(): Promise<void> {
    if (!canSendChatMessage.value || !selectedChatEntry.value) {
      return;
    }

    const enrollId = selectedChatEntry.value.registration.enrollId;
    if (!enrollId) {
      $q.notify({
        type: 'negative',
        message: 'ไม่พบรหัสการลงทะเบียนเรียน กรุณาลองใหม่อีกครั้ง',
        position: 'top',
      });
      return;
    }

    const draftText = chatDraft.value.trim();
    chatDraft.value = '';

    try {
      const response = await api.post('/api/lltchat', {
        enrollId,
        sender: authStore.user?.id ? Number(authStore.user.id) : null,
        userId: authStore.user?.username || null,
        message: draftText,
        chatTime: new Date().toISOString(),
        typeSender: 'U',
        status: 'S',
        createUser: authStore.user?.username || 'system',
        updateUser: authStore.user?.username || 'system',
        updateProgram: 'student_chat',
      });

      const savedChat = response.data;
      if (savedChat && savedChat.id) {
        const exists = chatMessages.value.some((m) => String(m.id) === String(savedChat.id));
        if (!exists) {
          chatMessages.value.push({
            id: String(savedChat.id),
            courseId: selectedChatEntry.value?.course.id || '',
            sender: 'learner',
            body: savedChat.message || '',
            sentAt: savedChat.chatTime ? new Date(savedChat.chatTime) : new Date(),
            status: savedChat.status === 'R' ? 'read' : 'sent',
          });
        }
      } else {
        await fetchChatMessages();
      }
      await nextTick();
      scrollChatToLatestMessage();
    } catch (error) {
      console.error('Failed to send chat message', error);
      $q.notify({
        type: 'negative',
        message: 'ส่งข้อความล้มเหลว กรุณาลองใหม่อีกครั้ง',
        position: 'top',
      });
    }
  }

  function selectChatCourse(courseId: string): void {
    selectedChatCourseId.value = courseId;
  }

  function formatChatMessageTime(date: Date): string {
    return date.toLocaleTimeString(locale.value === 'th' ? 'th-TH' : 'en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  }

  function getChatStatusLabel(status: ChatMessageStatus): string {
    return status === 'read' ? t('profile.chat.statusRead') : t('profile.chat.statusSent');
  }

  function getChatStatusIcon(status: ChatMessageStatus): string {
    return status === 'read' ? 'done_all' : 'done';
  }

  function isLatestLearnerMessage(message: ChatMessage): boolean {
    const latestLearnerMessage = [...chatThreadMessages.value]
      .reverse()
      .find((chatMessage) => chatMessage.sender === 'learner');

    return latestLearnerMessage?.id === message.id;
  }

  onMounted(async () => {
    connectChatSocket();
    void fetchChatMessages();
    await nextTick();
    scrollChatToLatestMessage();
  });

  // Watch for selected course changes in chat tab
  watch(selectedChatCourseId, async () => {
    void fetchChatMessages();
    const enrollId = selectedChatEntry.value?.registration?.enrollId;
    if (enrollId) {
      joinChatRoom(enrollId);
    }
    await nextTick();
    scrollChatToLatestMessage();
  });

  // Watch myRegistrations to default selectedChatCourseId
  watch(
    myRegistrations,
    (registrations) => {
      if (registrations.length === 0) {
        selectedChatCourseId.value = null;
        return;
      }

      const hasSelectedCourse = registrations.some(
        (registration) => registration.courseId === selectedChatCourseId.value,
      );
      if (!hasSelectedCourse) {
        selectedChatCourseId.value = registrations[0]?.courseId ?? null;
      }
    },
    { immediate: true },
  );

  onUnmounted(() => {
    disconnectChatSocket();
  });

  return {
    selectedChatCourseId,
    chatDraft,
    chatMessages,
    chatMessagesRef,
    selectedChatEntry,
    chatThreadMessages,
    canSendChatMessage,
    fetchChatMessages,
    connectChatSocket,
    disconnectChatSocket,
    joinChatRoom,
    scrollChatToLatestMessage,
    sendChatMessage,
    selectChatCourse,
    formatChatMessageTime,
    getChatStatusLabel,
    getChatStatusIcon,
    isLatestLearnerMessage,
  };
}
