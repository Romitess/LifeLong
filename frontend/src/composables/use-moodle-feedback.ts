import { ref } from 'vue';
import { api } from 'src/boot/axios';

export interface FeedbackInfo {
  id: number;
  coursemodule: number;
  name: string;
  intro: string | null;
  anonymous: number;
  multipleSubmit: boolean;
  completed: boolean;
  canSubmit: boolean;
}

export interface FeedbackItemOption {
  value: string;
  label: string;
}

export interface FeedbackItem {
  id: number;
  typ: string;
  name: string;
  label: string | null;
  required: boolean;
  presentation: string;
  value: string | null;
  options: FeedbackItemOption[];
}

export interface FeedbackPage {
  page: number;
  hasNextPage: boolean;
  items: FeedbackItem[];
}

export interface FeedbackResponseField {
  name: string;
  value: string;
}

export function useMoodleFeedback() {
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

  function getFeedback(
    moodleCourseId: number | string,
    moduleId: number | string,
  ): Promise<{ feedback: FeedbackInfo; page: FeedbackPage } | null> {
    return run(async () => {
      const { data } = await api.get<{ feedback: FeedbackInfo; page: FeedbackPage }>(
        `/api/moodle/feedback/${moodleCourseId}/module/${moduleId}`,
      );
      return data;
    });
  }

  function processPage(
    feedbackId: number,
    page: number,
    responses: FeedbackResponseField[],
  ): Promise<{ completed: boolean; page: FeedbackPage | null } | null> {
    return run(async () => {
      const { data } = await api.post<{ completed: boolean; page: FeedbackPage | null }>(
        `/api/moodle/feedback/${feedbackId}/process`,
        { page, responses },
      );
      return data;
    });
  }

  return { loading, error, getFeedback, processPage };
}
