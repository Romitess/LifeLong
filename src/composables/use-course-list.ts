import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { useCourseStore } from 'src/stores/course-store';
import type { Course } from 'src/types/course';
import { api } from 'src/boot/axios';

interface UseCourseListReturn {
  courses: ComputedRef<Course[]>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  activeCourses: ComputedRef<Course[]>;
  fetchCourses: () => Promise<void>;
}

interface ApiLltcourse {
  id: number;
  code: string | null;
  titleTh: string | null;
  titleEn: string | null;
  startDate: string | null;
  endDate: string | null;
  categoryId: number | null;
  objective: string | null;
  status: string | null;
  hours: number | null;
  imageUrl: string | null;
  moodleId: number | null;
}

function mapApiCourse(raw: ApiLltcourse): Course {
  const today = new Date().toISOString().substring(0, 10);
  return {
    id: `db-${raw.id}`,
    ...(raw.moodleId ? { moodleId: raw.moodleId } : {}),
    code: raw.code ?? '',
    title: raw.titleTh ?? '',
    ...(raw.titleEn ? { titleEn: raw.titleEn } : {}),
    imageUrl: raw.imageUrl ?? '',
    cover: { icon: 'school', accentColor: '#f5a623', backgroundColor: '#1e3a5f' },
    registrationStart: raw.startDate ?? today,
    registrationEnd: raw.endDate ?? '2099-12-31',
    registrationStartDate: raw.startDate ?? today,
    registrationEndDate: raw.endDate ?? '2099-12-31',
    price: 0,
    isFree: true,
    views: 0,
    status: 'เปิดรับสมัคร',
    deliveryModes: ['Online'],
    isActive: raw.status === 'Y' || raw.status === null,
    faculty: '',
    category: '',
    maxSeats: 9999,
    enrolledCount: 0,
  };
}

export function useCourseList(): UseCourseListReturn {
  const courseStore = useCourseStore();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const courses = computed<Course[]>(() => courseStore.courses);
  const activeCourses = computed<Course[]>(() => {
    const today = new Date().toISOString().substring(0, 10);
    return courses.value.filter(
      (course) =>
        course.isActive &&
        course.registrationStartDate <= today &&
        today <= course.registrationEndDate &&
        course.enrolledCount < course.maxSeats,
    );
  });

  const fetchCourses = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      const { data } = await api.get<ApiLltcourse[]>('/api/moodle/courses');
      courseStore.loadFromApi(data.map(mapApiCourse));
    } catch {
      error.value = 'ไม่สามารถโหลดข้อมูลคอร์สได้';
    } finally {
      isLoading.value = false;
    }
  };

  return { courses, isLoading, error, activeCourses, fetchCourses };
}
