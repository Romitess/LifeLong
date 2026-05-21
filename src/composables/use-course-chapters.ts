import { ref, type Ref } from 'vue';
import { api } from 'src/boot/axios';

export interface CourseChapter {
  id: number;
  courseId: number;
  name: string | null;
  hour: number | null;
  seq: number | null;
}

export interface UseCourseChapers {
  chapters: Ref<CourseChapter[]>;
  isLoadingChapters: Ref<boolean>;
  fetchChapters: (moodleCourseId: number) => Promise<void>;
}

export function useCourseChapers(): UseCourseChapers {
  // State
  const chapters = ref<CourseChapter[]>([]);
  const isLoadingChapters = ref(false);

  // Methods
  async function fetchChapters(moodleCourseId: number): Promise<void> {
    chapters.value = [];
    isLoadingChapters.value = true;
    try {
      const { data } = await api.get<CourseChapter[]>(
        `/api/lltcoursechapter/course/${moodleCourseId}`,
      );
      chapters.value = data ?? [];
    } finally {
      isLoadingChapters.value = false;
    }
  }

  return { chapters, isLoadingChapters, fetchChapters };
}
