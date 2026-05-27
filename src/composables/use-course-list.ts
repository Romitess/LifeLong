import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { useCourseStore, mapDeliveryModes } from 'src/stores/course-store';
import { useCategoryStore } from 'src/stores/category-store';
import type { Course } from 'src/types/course';
import { api } from 'src/boot/axios';
import fallbackCourseImageUrl from 'src/assets/homepicture1.png';

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
  objective: string | null;
  status: string | null;
  hours: number | null;
  imageUrl: string | null;
  moodleId: number | null;
  maxSeats: number | null;
  amount: number | null;
  regStartDate: string | null;
  regEndDate: string | null;
  enrolledCount: number;
  categoryId?: number | null;
  typestudyDetail?: { id: number; name: string | null } | null;
}

function mapApiCourse(raw: ApiLltcourse): Course {
  const today = new Date().toISOString().substring(0, 10);
  const regStart = raw.regStartDate ?? today;
  const regEnd = raw.regEndDate ?? '2099-12-31';
  const amount = raw.amount ?? 0;

  let categoryName = `Category ${raw.categoryId ?? 1}`;
  try {
    const categoryStore = useCategoryStore();
    if (categoryStore.isApiLoaded && raw.categoryId) {
      const matched = categoryStore.apiCategories.find((c) => c.id === raw.categoryId);
      if (matched) {
        categoryName = matched.name;
      }
    }
  } catch {
    // Pinia not initialized yet
  }

  return {
    id: `db-${raw.id}`,
    ...(raw.moodleId ? { moodleId: raw.moodleId } : {}),
    code: raw.code ?? '',
    title: raw.titleTh ?? '',
    ...(raw.titleEn ? { titleEn: raw.titleEn } : {}),
    imageUrl: raw.imageUrl?.trim() ? raw.imageUrl : fallbackCourseImageUrl,
    cover: { icon: 'school', accentColor: '#f5a623', backgroundColor: '#1e3a5f' },
    registrationStart: regStart,
    registrationEnd: regEnd,
    registrationStartDate: regStart,
    registrationEndDate: regEnd,
    price: amount,
    isFree: amount === 0,
    views: 0,
    status: 'เปิดรับสมัคร',
    deliveryModes: mapDeliveryModes(raw.typestudyDetail?.name),
    isActive: raw.status === 'Y' || raw.status === null,
    faculty: '',
    category: categoryName,
    categoryEn: categoryName,
    categoryId: raw.categoryId ?? undefined,
    maxSeats: raw.maxSeats ?? 9999,
    enrolledCount: raw.enrolledCount ?? 0,
  };
}

export function useCourseList(): UseCourseListReturn {
  const courseStore = useCourseStore();
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const courses = computed<Course[]>(() => courseStore.courses);
  // Backend already filters published courses — activeCourses = all returned courses
  const activeCourses = computed<Course[]>(() => courses.value);

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
