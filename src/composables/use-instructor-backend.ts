import { computed, ref } from 'vue';
import { api } from 'src/boot/axios';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';

interface WrappedListResponse<T> {
  value?: T[];
  Count?: number;
}

export interface InstructorSummary {
  totalStudents: number;
  activeCourses: number;
  averageScore: number | null;
  conversations: number;
  recentActivities: InstructorActivity[];
}

export interface InstructorActivity {
  id: string;
  learnerName: string;
  action: string;
  createdAt: string | null;
  courseCode: string | null;
}

export interface InstructorLearner {
  enrollmentId: number;
  courseId: number;
  openclassId: number | null;
  userId: number;
  username: string | null;
  studentId: string;
  fullName: string;
  email: string | null;
  phone: string | null;
  moodleUserId: number | null;
  enrolledAt: string | null;
  paymentStatus: string | null;
  enrollmentStatus: string | null;
}

export interface GradeItemBreakdown {
  itemtype: string;
  itemmodule: string | null;
  itemname: string | null;
  score: number | null;
  maxScore: number | null;
  cmid: number | null;
}

export interface InstructorGrade {
  learnerUserId: number;
  moodleUserId: number | null;
  studentId: string;
  learnerName: string;
  courseId: number;
  moodleCourseId: number | null;
  score: number | null;
  maxScore: number | null;
  grade: string | null;
  status: 'passed' | 'failed' | 'pending';
  updatedAt: string | null;
  lmsFinalscore: number | null;
  lmsSyncedAt: string | null;
  gradeItems: GradeItemBreakdown[];
}

export interface InstructorConversationMessage {
  id: string;
  sender: 'learner' | 'instructor';
  body: string;
  sentAt: string;
  status: 'sent' | 'read';
}

export interface InstructorConversation {
  id: string;
  courseId: number;
  moodleCourseId: number | null;
  learnerUserId: number;
  learnerMoodleUserId: number | null;
  learnerName: string;
  learnerEmail: string | null;
  latestMessagePreview: string;
  messageCount: number;
  enrollId: number;
  messages: InstructorConversationMessage[];
}

export interface CourseAnnouncement {
  id: number;
  subject: string;
  body: string;
  createdAt: number;
  author: string;
  pinned: boolean;
}

const summary = ref<InstructorSummary | null>(null);
const learnersByCourseId = ref<Record<string, InstructorLearner[]>>({});
const gradesByCourseId = ref<Record<string, InstructorGrade[]>>({});
const conversations = ref<InstructorConversation[]>([]);
const courseAnnouncements = ref<CourseAnnouncement[]>([]);
const loading = ref(false);

let socket: Socket | null = null;

function getBackendCourseId(courseId: string | number): number | null {
  if (typeof courseId === 'number') return courseId;
  const match = courseId.match(/\d+$/);
  return match ? Number(match[0]) : null;
}

function getCourseKey(courseId: string | number): string {
  return typeof courseId === 'string' ? courseId : `db-${courseId}`;
}

function extractArrayPayload<T>(payload: T[] | WrappedListResponse<T> | null | undefined): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.value)) {
    return payload.value;
  }

  return [];
}

export function useInstructorBackend() {
  const hasSummary = computed(() => summary.value !== null);

  async function fetchSummary(email?: string): Promise<void> {
    if (!email?.trim()) return;
    loading.value = true;
    try {
      const { data } = await api.get<InstructorSummary>(
        `/api/instructor/summary?email=${encodeURIComponent(email.trim())}`,
      );
      summary.value = data;
    } finally {
      loading.value = false;
    }
  }

  async function fetchLearners(
    email: string | undefined,
    courseId: string | number,
    moodleCourseId?: number | null,
  ): Promise<void> {
    if (!email?.trim()) return;
    const backendCourseId = getBackendCourseId(courseId);
    let data: InstructorLearner[] = [];

    if (backendCourseId) {
      try {
        const response = await api.get<
          InstructorLearner[] | WrappedListResponse<InstructorLearner>
        >(
          `/api/instructor/courses/${backendCourseId}/learners?email=${encodeURIComponent(email.trim())}`,
        );
        data = extractArrayPayload(response.data);
      } catch (error) {
        console.warn('Failed to fetch backend learners', error);
      }
    }

    if (data.length === 0 && moodleCourseId) {
      try {
        const response = await api.get<
          InstructorLearner[] | WrappedListResponse<InstructorLearner>
        >(`/api/instructor/moodle-courses/${moodleCourseId}/learners`);
        data = extractArrayPayload(response.data);
      } catch (error) {
        console.warn('Failed to fetch Moodle learners', error);
      }
    }

    learnersByCourseId.value = {
      ...learnersByCourseId.value,
      [getCourseKey(courseId)]: data,
    };
  }

  async function fetchGrades(email: string | undefined, courseId: string | number): Promise<void> {
    if (!email?.trim()) return;
    const backendCourseId = getBackendCourseId(courseId);
    if (!backendCourseId) return;

    let data: InstructorGrade[] = [];
    try {
      const response = await api.get<InstructorGrade[] | WrappedListResponse<InstructorGrade>>(
        `/api/instructor/courses/${backendCourseId}/grades?email=${encodeURIComponent(email.trim())}`,
      );
      data = extractArrayPayload(response.data);
    } catch (error) {
      console.warn('Failed to fetch instructor grades', error);
    }

    gradesByCourseId.value = {
      ...gradesByCourseId.value,
      [getCourseKey(courseId)]: data,
    };
  }

  async function syncScores(
    email: string | undefined,
    courseId: string | number,
  ): Promise<{ synced: number; skipped: number; errors: number } | null> {
    if (!email?.trim()) return null;
    const backendCourseId = getBackendCourseId(courseId);
    if (!backendCourseId) return null;

    try {
      const { data } = await api.post<{ synced: number; skipped: number; errors: number }>(
        `/api/instructor/courses/${backendCourseId}/sync-scores?email=${encodeURIComponent(email.trim())}`,
      );
      return data;
    } catch (error) {
      console.warn('Failed to sync scores', error);
      return null;
    }
  }

  async function fetchConversations(email?: string): Promise<void> {
    if (!email?.trim()) return;
    const { data } = await api.get<
      InstructorConversation[] | WrappedListResponse<InstructorConversation>
    >(`/api/instructor/conversations?email=${encodeURIComponent(email.trim())}`);
    conversations.value = extractArrayPayload(data);

    // If socket is connected, auto join all conversation rooms
    if (socket) {
      conversations.value.forEach((conv) => {
        socket?.emit('joinRoom', { enrollId: conv.enrollId });
      });
    }
  }

  async function sendMessage(
    email: string | undefined,
    courseId: number,
    learnerUserId: number,
    body: string,
  ): Promise<void> {
    if (!email?.trim() || !body.trim()) return;
    await api.post(
      `/api/instructor/conversations/${courseId}/${learnerUserId}/messages?email=${encodeURIComponent(email.trim())}`,
      { body: body.trim() },
    );
  }

  async function markAsRead(
    email: string | undefined,
    courseId: number,
    learnerUserId: number,
  ): Promise<void> {
    if (!email?.trim()) return;
    try {
      await api.post(
        `/api/instructor/conversations/${courseId}/${learnerUserId}/read?email=${encodeURIComponent(email.trim())}`,
      );
    } catch (error) {
      console.warn('Failed to mark messages as read', error);
    }
  }

  function connectSocket(email?: string): void {
    if (socket || !email) return;

    const baseUrl =
      (import.meta.env.VITE_API_URL as string) ||
      (import.meta.env.VITE_BACKEND_URL as string) ||
      '';
    const origin = baseUrl.startsWith('http') ? new URL(baseUrl).origin : window.location.origin;

    socket = io(`${origin}/chat`);

    socket.on('connect', () => {
      // Join rooms for all current conversations
      conversations.value.forEach((conv) => {
        socket?.emit('joinRoom', { enrollId: conv.enrollId });
      });
    });

    socket.on(
      'newMessage',
      (msg: {
        enrollId: number;
        id: number;
        sender: 'learner' | 'instructor';
        body: string;
        sentAt: string;
        status: 'sent' | 'read';
      }) => {
        const conv = conversations.value.find((c) => c.enrollId === msg.enrollId);
        if (conv) {
          const exists = conv.messages.some((m) => String(m.id) === String(msg.id));
          if (!exists) {
            conv.messages.push({
              id: String(msg.id),
              sender: msg.sender,
              body: msg.body,
              sentAt: msg.sentAt,
              status: msg.status,
            });
            conv.latestMessagePreview = msg.body;
            conv.messageCount = conv.messages.length;
          }
        } else {
          // Conversation entry does not exist in local state (first message), refetch
          void fetchConversations(email);
        }
      },
    );

    socket.on(
      'messagesRead',
      (data: { enrollId: number; senderType: 'learner' | 'instructor' }) => {
        const conv = conversations.value.find((c) => c.enrollId === data.enrollId);
        if (conv) {
          conv.messages.forEach((m) => {
            if (m.sender === data.senderType) {
              m.status = 'read';
            }
          });
        }
      },
    );
  }

  function disconnectSocket(): void {
    if (socket) {
      socket.disconnect();
      socket = null;
    }
  }

  async function fetchCourseAnnouncements(moodleId: number | null | undefined): Promise<void> {
    if (!moodleId) {
      courseAnnouncements.value = [];
      return;
    }
    try {
      const { data } = await api.get<CourseAnnouncement[]>(
        `/api/moodle/moodle-announcements/${moodleId}`,
      );
      courseAnnouncements.value = Array.isArray(data) ? data : [];
    } catch {
      courseAnnouncements.value = [];
    }
  }

  function joinConversationRoom(enrollId: number): void {
    if (socket) {
      socket.emit('joinRoom', { enrollId });
    }
  }

  return {
    summary,
    hasSummary,
    learnersByCourseId,
    gradesByCourseId,
    conversations,
    courseAnnouncements,
    loading,
    fetchSummary,
    fetchLearners,
    fetchGrades,
    syncScores,
    fetchConversations,
    fetchCourseAnnouncements,
    sendMessage,
    markAsRead,
    connectSocket,
    disconnectSocket,
    joinConversationRoom,
  };
}
