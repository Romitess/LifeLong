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

interface MoodleCompletionBatchResponse {
  items: Record<string, MoodleCompletion>;
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
    async fetchCompletion(enrollId: number, force = false): Promise<void> {
      if (!force && this.completionByEnrollId[enrollId]) return;
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

    async fetchAllCompletions(enrollIds: number[], force = false): Promise<void> {
      const pendingIds = [...new Set(enrollIds)].filter(
        (id) =>
          Number.isInteger(id) &&
          id > 0 &&
          !this.loadingByEnrollId[id] &&
          (force || !this.completionByEnrollId[id]),
      );
      if (pendingIds.length === 0) return;

      pendingIds.forEach((id) => {
        this.loadingByEnrollId[id] = true;
      });
      try {
        for (let index = 0; index < pendingIds.length; index += 100) {
          const chunk = pendingIds.slice(index, index + 100);
          const { data } = await api.post<MoodleCompletionBatchResponse>(
            '/api/progress/completions',
            { enrollIds: chunk },
          );
          chunk.forEach((id) => {
            const completion = data.items[String(id)];
            if (completion) this.completionByEnrollId[id] = completion;
          });
        }
      } catch {
        // Keep existing values when Moodle is temporarily unavailable.
      } finally {
        pendingIds.forEach((id) => {
          this.loadingByEnrollId[id] = false;
        });
      }
    },
  },
});
