import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export interface MoodleCompletion {
  completed: boolean;
  total: number;
  done: number;
  percent: number;
}

interface EnrollmentProgressState {
  completionByEnrollId: Record<number, MoodleCompletion>;
  loadingByEnrollId: Record<number, boolean>;
}

export const useEnrollmentProgressStore = defineStore('enrollment-progress', {
  state: (): EnrollmentProgressState => ({
    completionByEnrollId: {},
    loadingByEnrollId: {},
  }),

  getters: {
    getCompletion:
      (state) =>
      (enrollId: number): MoodleCompletion | null =>
        state.completionByEnrollId[enrollId] ?? null,
  },

  actions: {
    async fetchCompletion(enrollId: number): Promise<void> {
      if (this.loadingByEnrollId[enrollId]) return;
      this.loadingByEnrollId[enrollId] = true;
      try {
        const { data } = await api.get<MoodleCompletion>(`/api/progress/completion/${enrollId}`);
        this.completionByEnrollId[enrollId] = data;
      } catch {
        // silently ignore
      } finally {
        this.loadingByEnrollId[enrollId] = false;
      }
    },

    async fetchAllCompletions(enrollIds: number[]): Promise<void> {
      await Promise.all(enrollIds.map((id) => this.fetchCompletion(id)));
    },
  },
});
