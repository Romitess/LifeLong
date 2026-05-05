import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { useCourseStore } from 'src/stores/course-store';
import type { Course } from 'src/types/course';

interface UseCourseListReturn {
  courses: ComputedRef<Course[]>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  activeCourses: ComputedRef<Course[]>;
  fetchCourses: () => Promise<void>;
}

export function useCourseList(): UseCourseListReturn {
  const courseStore = useCourseStore();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const courses = computed<Course[]>(() => courseStore.courses);
  const activeCourses = computed<Course[]>(() => courses.value.filter((course) => course.isActive));

  const fetchCourses = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 600));
      courseStore.init();
    } catch {
      error.value = 'ไม่สามารถโหลดข้อมูลคอร์สได้ กรุณาลองใหม่อีกครั้ง';
    } finally {
      isLoading.value = false;
    }
  };

  return { courses, isLoading, error, activeCourses, fetchCourses };
}
