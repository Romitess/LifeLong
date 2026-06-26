import { ref } from 'vue';
import { api } from 'src/boot/axios';

export interface AssignFile {
  filename: string;
  fileurl: string;
  mimetype: string | null;
}

export interface AssignInfo {
  id: number;
  cmid: number;
  name: string;
  intro: string | null;
  introAttachments: AssignFile[];
  duedate: number;
  cutoffdate: number;
  grade: number | null;
  submissionDrafts: boolean;
  noSubmissions: boolean;
  textSubmission: boolean;
  fileSubmission: boolean;
}

export interface AssignSubmission {
  status: string; // new | draft | submitted | reopened
  gradingStatus: string;
  canEdit: boolean;
  canSubmit: boolean;
  onlineText: string | null;
  files: AssignFile[];
  grade: number | null;
  feedback: string | null;
}

/** Client for the native Moodle assignment endpoints (acts as the logged-in student). */
export function useMoodleAssign() {
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

  function getAssignment(
    moodleCourseId: number | string,
    moduleId: number | string,
  ): Promise<{ assign: AssignInfo; submission: AssignSubmission } | null> {
    return run(async () => {
      const { data } = await api.get<{ assign: AssignInfo; submission: AssignSubmission }>(
        `/api/moodle/assign/${moodleCourseId}/module/${moduleId}`,
      );
      return data;
    });
  }

  /** Upload a file to the user's Moodle draft area; returns the draft itemid. */
  function uploadFile(assignId: number, file: File): Promise<{ itemid: number } | null> {
    return run(async () => {
      const form = new FormData();
      form.append('file', file);
      const { data } = await api.post<{ itemid: number }>(
        `/api/moodle/assign/${assignId}/files`,
        form,
      );
      return data;
    });
  }

  function saveSubmission(
    assignId: number,
    payload: {
      onlineText?: string;
      fileItemId?: number;
      submit?: boolean;
      moodleCourseId?: number;
      cmid?: number;
      enrollId?: number;
      subChapterId?: number;
    },
  ): Promise<{ submission: AssignSubmission; autoMarked: boolean; passed: boolean } | null> {
    return run(async () => {
      const { data } = await api.post<{
        submission: AssignSubmission;
        autoMarked: boolean;
        passed: boolean;
      }>(`/api/moodle/assign/${assignId}/submit`, payload);
      return data;
    });
  }

  return { loading, error, getAssignment, uploadFile, saveSubmission };
}
