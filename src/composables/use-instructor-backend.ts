import { computed, ref } from 'vue';
import { api } from 'src/boot/axios';

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
  messages: InstructorConversationMessage[];
}

const summary = ref<InstructorSummary | null>(null);
const learnersByCourseId = ref<Record<string, InstructorLearner[]>>({});
const gradesByCourseId = ref<Record<string, InstructorGrade[]>>({});
const conversations = ref<InstructorConversation[]>([]);
const loading = ref(false);

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

  async function fetchConversations(email?: string): Promise<void> {
    if (!email?.trim()) return;
    const { data } = await api.get<
      InstructorConversation[] | WrappedListResponse<InstructorConversation>
    >(`/api/instructor/conversations?email=${encodeURIComponent(email.trim())}`);
    conversations.value = extractArrayPayload(data);
  }

  async function sendMessage(email: string | undefined, learnerUserId: number, body: string) {
    if (!email?.trim() || !body.trim()) return;
    await api.post(
      `/api/instructor/conversations/${learnerUserId}/messages?email=${encodeURIComponent(email.trim())}`,
      { body: body.trim() },
    );
    await fetchConversations(email);
  }

  return {
    summary,
    hasSummary,
    learnersByCourseId,
    gradesByCourseId,
    conversations,
    loading,
    fetchSummary,
    fetchLearners,
    fetchGrades,
    fetchConversations,
    sendMessage,
  };
}
