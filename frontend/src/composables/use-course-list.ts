import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { useCourseStore } from 'src/stores/course-store';
import type { Course } from 'src/types/course';

interface UseCourseListReturn {
  courses: ComputedRef<Course[]>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  activeCourses: ComputedRef<Course[]>;
  fetchCourses: (force?: boolean) => Promise<void>;
}

export function useCourseList(): UseCourseListReturn {
  const courseStore = useCourseStore();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const courses = computed<Course[]>(() => courseStore.courses);
  const activeCourses = computed<Course[]>(() => {
    const today = new Date().toISOString().substring(0, 10);
    return courses.value.filter((c) => {
      const start = c.registrationStartDate;
      const end = c.registrationEndDate;
      return (!start || start <= today) && (!end || end >= today);
    });
  });

  const fetchCourses = async (force = false): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      await courseStore.fetchBackendCourses(force);
    } catch {
      error.value = 'ไม่สามารถโหลดข้อมูลคอร์สได้';
    } finally {
      isLoading.value = false;
    }
  };

  return { courses, isLoading, error, activeCourses, fetchCourses };
}
