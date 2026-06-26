import { ref } from 'vue';
import { api } from 'src/boot/axios';

export interface QuizInfo {
  id: number;
  coursemodule: number;
  name: string;
  intro: string | null;
  grade: number | null;
  gradepass: number | null;
  sumgrades: number | null;
  attempts: number; // allowed attempts, 0 = unlimited
  grademethod: number;
  timelimit: number;
}

export interface QuizAttempt {
  id: number;
  attempt: number;
  state: string; // inprogress | overdue | finished | abandoned
  sumgrades: number | null;
  timestart: number;
  timefinish: number;
  currentpage: number;
}

export interface QuizQuestionView {
  slot: number;
  number: number | string;
  type: string;
  page: number;
  html: string;
  state?: string;
}

export interface QuizAttemptData {
  attempt: QuizAttempt;
  questions: QuizQuestionView[];
  nextpage: number;
}

export interface QuizReview {
  grade: number | null;
  attempt: QuizAttempt;
  questions: QuizQuestionView[];
}

export interface QuizSummaryQuestion {
  slot: number;
  number: number | string;
  page: number;
  state: string; // 'todo' | 'complete' | 'invalid' | ...
  status: string; // human label from Moodle
  flagged: boolean;
}

export interface QuizAttemptSummary {
  questions: QuizSummaryQuestion[];
  totalUnanswered: number;
}

export interface QuizAnswerField {
  name: string;
  value: string;
}

/** Thin client for the native Moodle quiz endpoints (acts as the logged-in student). */
export function useMoodleQuiz() {
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function run<T>(fn: () => Promise<T>): Promise<T | null> {
    loading.value = true;
    error.value = null;
    try {
      return await fn();
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
      return null;
    } finally {
      loading.value = false;
    }
  }

  function getQuiz(
    moodleCourseId: number | string,
    moduleId: number | string,
  ): Promise<{ quiz: QuizInfo; attempts: QuizAttempt[] } | null> {
    return run(async () => {
      const { data } = await api.get<{ quiz: QuizInfo; attempts: QuizAttempt[] }>(
        `/api/moodle/quiz/${moodleCourseId}/module/${moduleId}`,
      );
      return data;
    });
  }

  function startAttempt(quizId: number): Promise<QuizAttempt | null> {
    return run(async () => {
      const { data } = await api.post<QuizAttempt>(`/api/moodle/quiz/${quizId}/start`);
      return data;
    });
  }

  function getAttemptData(attemptId: number, page: number): Promise<QuizAttemptData | null> {
    return run(async () => {
      const { data } = await api.get<QuizAttemptData>(
        `/api/moodle/quiz/attempts/${attemptId}?page=${page}`,
      );
      return data;
    });
  }

  function processAttempt(
    attemptId: number,
    finish: boolean,
    data: QuizAnswerField[],
    timeUp = false,
    completion?: { moodleCourseId: number; cmid: number; enrollId?: number; subChapterId?: number },
  ): Promise<{ state: string; autoMarked: boolean; passed: boolean } | null> {
    return run(async () => {
      const { data: res } = await api.post<{ state: string; autoMarked: boolean; passed: boolean }>(
        `/api/moodle/quiz/attempts/${attemptId}/process`,
        { finish, data, timeUp, ...completion },
      );
      return res;
    });
  }

  function getReview(attemptId: number): Promise<QuizReview | null> {
    return run(async () => {
      const { data } = await api.get<QuizReview>(`/api/moodle/quiz/attempts/${attemptId}/review`);
      return data;
    });
  }

  function getSummary(attemptId: number): Promise<QuizAttemptSummary | null> {
    return run(async () => {
      const { data } = await api.get<QuizAttemptSummary>(
        `/api/moodle/quiz/attempts/${attemptId}/summary`,
      );
      return data;
    });
  }

  return {
    loading,
    error,
    getQuiz,
    startAttempt,
    getAttemptData,
    processAttempt,
    getReview,
    getSummary,
  };
}
