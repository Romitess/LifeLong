import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { getCourseStructure, getFlatLessons } from 'src/data/course-structure';
import { useAuthStore } from 'src/stores/auth-store';

export interface QuizAttempt {
  score: number;
  total: number;
  date: string;
}

interface StoredCourseProgress {
  completedLessonsByUser: Record<string, Record<string, string[]>>;
  quizAttemptsByUser: Record<string, Record<string, Record<string, QuizAttempt[]>>>;
}

const STORAGE_KEY = 'lll-course-progress';
const DEFAULT_MOCK_USER_ID = 'mock-student-user';
const DOCUMENT_MOCK_SEED_KEY = 'lll-course-progress-document-seed-v1';
const DOCUMENT_MOCK_COMPLETED_COURSE_ID = '1';

const DOCUMENT_MOCK_COMPLETED_LESSONS = getFlatLessons(
  getCourseStructure(DOCUMENT_MOCK_COMPLETED_COURSE_ID),
).map((lesson) => lesson.title);

const DEFAULT_PROGRESS_STATE: StoredCourseProgress = {
  completedLessonsByUser: {
    [DEFAULT_MOCK_USER_ID]: {
      '1': DOCUMENT_MOCK_COMPLETED_LESSONS,
      '2': [
        'ประกาศจากผู้สอน',
        'กลุ่มพูดคุยแลกเปลี่ยน',
        'ภาพรวมของคอร์สเรียน',
        'วิธีการเรียนและการประเมินผล',
        'Pre-test วัดความรู้พื้นฐาน',
        'AI เข้ามาเปลี่ยนวงการออกแบบอย่างไร?',
        'Canva AI คืออะไร?',
        'โครงสร้างของ Prompt ที่ดี',
      ],
      '3': [
        'Welcome to Recraft Workflow',
        'Overview of Recraft.ai Features',
        'Understanding Vector Generation',
        'Writing Prompts for Illustration Styles',
      ],
    },
  },
  quizAttemptsByUser: {
    [DEFAULT_MOCK_USER_ID]: {
      '1': {
        แบบทดสอบเรื่องอัญมณีและราศี: [
          {
            score: 7,
            total: 10,
            date: '2026-04-30T09:40:00+07:00',
          },
        ],
      },
      '2': {
        'Pre-test วัดความรู้พื้นฐาน': [
          {
            score: 8,
            total: 10,
            date: '2026-04-29T19:10:00+07:00',
          },
        ],
      },
    },
  },
};

function getAuthenticatedUserId(): string | null {
  const authStore = useAuthStore();

  if (!authStore.isLoggedIn || !authStore.user) {
    return null;
  }

  return authStore.user.id;
}

function cloneProgressState(state: StoredCourseProgress): StoredCourseProgress {
  return {
    completedLessonsByUser: JSON.parse(JSON.stringify(state.completedLessonsByUser)) as Record<
      string,
      Record<string, string[]>
    >,
    quizAttemptsByUser: JSON.parse(JSON.stringify(state.quizAttemptsByUser)) as Record<
      string,
      Record<string, Record<string, QuizAttempt[]>>
    >,
  };
}

function writeStoredProgress(state: StoredCourseProgress): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function normalizeCompletedLessons(value: unknown): Record<string, Record<string, string[]>> {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([userId, courseMap]) => [
      userId,
      Object.fromEntries(
        Object.entries(
          courseMap && typeof courseMap === 'object' ? (courseMap as Record<string, unknown>) : {},
        )
          .filter(([, lessons]) => Array.isArray(lessons))
          .map(([courseId, lessons]) => [
            courseId,
            (lessons as unknown[]).filter((lesson): lesson is string => typeof lesson === 'string'),
          ]),
      ),
    ]),
  );
}

function normalizeQuizAttempts(
  value: unknown,
): Record<string, Record<string, Record<string, QuizAttempt[]>>> {
  if (!value || typeof value !== 'object') {
    return {};
  }

  return Object.fromEntries(
    Object.entries(value).map(([userId, courseMap]) => [
      userId,
      Object.fromEntries(
        Object.entries(
          courseMap && typeof courseMap === 'object' ? (courseMap as Record<string, unknown>) : {},
        ).map(([courseId, quizMap]) => [
          courseId,
          Object.fromEntries(
            Object.entries(
              quizMap && typeof quizMap === 'object' ? (quizMap as Record<string, unknown>) : {},
            )
              .filter(([, attempts]) => Array.isArray(attempts))
              .map(([quizTitle, attempts]) => [
                quizTitle,
                (attempts as unknown[])
                  .filter(
                    (attempt): attempt is QuizAttempt =>
                      Boolean(attempt) &&
                      typeof attempt === 'object' &&
                      typeof (attempt as QuizAttempt).score === 'number' &&
                      typeof (attempt as QuizAttempt).total === 'number' &&
                      typeof (attempt as QuizAttempt).date === 'string',
                  )
                  .map((attempt) => ({
                    score: attempt.score,
                    total: attempt.total,
                    date: attempt.date,
                  })),
              ]),
          ),
        ]),
      ),
    ]),
  );
}

function readStoredProgress(): StoredCourseProgress {
  if (typeof window === 'undefined') {
    return cloneProgressState(DEFAULT_PROGRESS_STATE);
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    const defaultState = cloneProgressState(DEFAULT_PROGRESS_STATE);
    window.localStorage.setItem(DOCUMENT_MOCK_SEED_KEY, 'true');
    writeStoredProgress(defaultState);
    return defaultState;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Partial<StoredCourseProgress>;
    const normalizedState = {
      completedLessonsByUser: normalizeCompletedLessons(parsedValue.completedLessonsByUser),
      quizAttemptsByUser: normalizeQuizAttempts(parsedValue.quizAttemptsByUser),
    };

    if (window.localStorage.getItem(DOCUMENT_MOCK_SEED_KEY) !== 'true') {
      if (!normalizedState.completedLessonsByUser[DEFAULT_MOCK_USER_ID]) {
        normalizedState.completedLessonsByUser[DEFAULT_MOCK_USER_ID] = {};
      }

      normalizedState.completedLessonsByUser[DEFAULT_MOCK_USER_ID][
        DOCUMENT_MOCK_COMPLETED_COURSE_ID
      ] = [...DOCUMENT_MOCK_COMPLETED_LESSONS];

      window.localStorage.setItem(DOCUMENT_MOCK_SEED_KEY, 'true');
      writeStoredProgress(normalizedState);
    }

    return normalizedState;
  } catch {
    const defaultState = cloneProgressState(DEFAULT_PROGRESS_STATE);
    window.localStorage.setItem(DOCUMENT_MOCK_SEED_KEY, 'true');
    writeStoredProgress(defaultState);
    return defaultState;
  }
}

export const useCourseProgressStore = defineStore('course-progress', () => {
  const initialState = readStoredProgress();
  const completedLessonsByUser = ref(initialState.completedLessonsByUser);
  const quizAttemptsByUser = ref(initialState.quizAttemptsByUser);

  const persist = () => {
    writeStoredProgress({
      completedLessonsByUser: completedLessonsByUser.value,
      quizAttemptsByUser: quizAttemptsByUser.value,
    });
  };

  const completedLessons = computed<Record<string, string[]>>(() => {
    const userId = getAuthenticatedUserId();
    return userId ? (completedLessonsByUser.value[userId] ?? {}) : {};
  });

  const quizAttempts = computed<Record<string, Record<string, QuizAttempt[]>>>(() => {
    const userId = getAuthenticatedUserId();
    return userId ? (quizAttemptsByUser.value[userId] ?? {}) : {};
  });

  const ensureCompletedLessons = (userId: string): Record<string, string[]> => {
    if (!completedLessonsByUser.value[userId]) {
      completedLessonsByUser.value[userId] = {};
    }

    return completedLessonsByUser.value[userId];
  };

  const ensureQuizAttempts = (userId: string): Record<string, Record<string, QuizAttempt[]>> => {
    if (!quizAttemptsByUser.value[userId]) {
      quizAttemptsByUser.value[userId] = {};
    }

    return quizAttemptsByUser.value[userId];
  };

  const toggleLessonCompletion = (courseId: string, lessonTitle: string) => {
    const userId = getAuthenticatedUserId();

    if (!userId) {
      return;
    }

    const userCompletedLessons = ensureCompletedLessons(userId);

    if (!userCompletedLessons[courseId]) {
      userCompletedLessons[courseId] = [];
    }

    const index = userCompletedLessons[courseId].indexOf(lessonTitle);
    if (index === -1) {
      userCompletedLessons[courseId].push(lessonTitle);
    } else {
      userCompletedLessons[courseId].splice(index, 1);
    }

    persist();
  };

  const isLessonCompleted = (courseId: string, lessonTitle: string) => {
    const userId = getAuthenticatedUserId();

    if (!userId) {
      return false;
    }

    return completedLessonsByUser.value[userId]?.[courseId]?.includes(lessonTitle) || false;
  };

  const getCompletedLessonCount = (courseId: string) => {
    const userId = getAuthenticatedUserId();

    if (!userId) {
      return 0;
    }

    return completedLessonsByUser.value[userId]?.[courseId]?.length || 0;
  };

  const getCourseProgress = (courseId: string, totalLessons: number) => {
    const completedCount = getCompletedLessonCount(courseId);
    if (totalLessons === 0) return 0;
    return Math.round((completedCount / totalLessons) * 100);
  };

  const addQuizAttempt = (courseId: string, quizTitle: string, attempt: QuizAttempt) => {
    const userId = getAuthenticatedUserId();

    if (!userId) {
      return;
    }

    const userQuizAttempts = ensureQuizAttempts(userId);

    if (!userQuizAttempts[courseId]) {
      userQuizAttempts[courseId] = {};
    }
    if (!userQuizAttempts[courseId][quizTitle]) {
      userQuizAttempts[courseId][quizTitle] = [];
    }
    userQuizAttempts[courseId][quizTitle].push(attempt);

    if (!isLessonCompleted(courseId, quizTitle)) {
      toggleLessonCompletion(courseId, quizTitle);
      return;
    }

    persist();
  };

  const getAttempts = (courseId: string, quizTitle: string) => {
    const userId = getAuthenticatedUserId();

    if (!userId) {
      return [];
    }

    return quizAttemptsByUser.value[userId]?.[courseId]?.[quizTitle] || [];
  };

  const getBestScore = (courseId: string, quizTitle: string) => {
    const attempts = getAttempts(courseId, quizTitle);
    if (attempts.length === 0) return null;
    return Math.max(...attempts.map((attempt) => attempt.score));
  };

  return {
    completedLessons,
    quizAttempts,
    toggleLessonCompletion,
    isLessonCompleted,
    getCompletedLessonCount,
    getCourseProgress,
    addQuizAttempt,
    getAttempts,
    getBestScore,
  };
});
