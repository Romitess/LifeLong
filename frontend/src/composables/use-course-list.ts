import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { useCourseStore, mapDeliveryModes } from 'src/stores/course-store';
import { useCategoryStore } from 'src/stores/category-store';
import type { Course } from 'src/types/course';
import { api } from 'src/boot/axios';
import { getImageUrl } from 'src/services/image.service';

interface UseCourseListReturn {
  courses: ComputedRef<Course[]>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  activeCourses: ComputedRef<Course[]>;
  fetchCourses: (force?: boolean) => Promise<void>;
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
  imageCrop?: string | null;
  moodleId: number | null;
  maxSeats: number | null;
  amount: number | null;
  regStartDate: string | null;
  regEndDate: string | null;
  enrolledCount: number;
  topEnrollmentRank?: number | null;
  clickCount?: number | null;
  openclassId?: number | null;
  facultyName?: string | null;
  categoryId?: number | null;
  typestudyDetail?: { id: number; name: string | null } | null;
}

function mapApiCourse(raw: ApiLltcourse): Course {
  const today = new Date().toISOString().substring(0, 10);
  const regStart = raw.regStartDate ?? today;
  const regEnd = raw.regEndDate ?? '2099-12-31';
  const amount = raw.amount ?? 0;

  let categoryName = `Category ${raw.categoryId ?? 1}`;
  let coverIcon = 'school';

  try {
    const categoryStore = useCategoryStore();
    if (categoryStore.isApiLoaded && raw.categoryId) {
      const apiCat = categoryStore.apiCategories.find((c) => c.id === raw.categoryId);
      if (apiCat) categoryName = apiCat.name;
    }
    // ดึง icon + color จาก category store เพื่อให้ generated cover ต่างกันตาม category
    const cat = categoryStore.activeCategories.find((c) => c.name === categoryName);
    if (cat) {
      coverIcon = cat.icon;
    }
  } catch {
    // Pinia not initialized yet
  }

  let computedStatus: 'เปิดรับสมัคร' | 'ปิดรับสมัคร' | 'เร็วๆนี้' = 'เปิดรับสมัคร';
  if (raw.regStartDate && raw.regStartDate > today) {
    computedStatus = 'เร็วๆนี้';
  } else if (raw.regEndDate && raw.regEndDate < today) {
    computedStatus = 'ปิดรับสมัคร';
  }

  return {
    id: `db-${raw.id}`,
    ...(raw.moodleId ? { moodleId: raw.moodleId } : {}),
    code: raw.code ?? '',
    title: raw.titleTh ?? '',
    ...(raw.titleEn ? { titleEn: raw.titleEn } : {}),
    imageUrl: getImageUrl(raw.imageUrl?.trim() ?? ''),
    imageCrop: raw.imageCrop ?? null,
    cover: { icon: coverIcon, accentColor: '#f5a623', backgroundColor: '#1e3a5f' },
    registrationStart: regStart,
    registrationEnd: regEnd,
    registrationStartDate: regStart,
    registrationEndDate: regEnd,
    price: amount,
    isFree: amount === 0,
    views: raw.clickCount ?? 0,
    ...(raw.topEnrollmentRank ? { topEnrollmentRank: raw.topEnrollmentRank } : {}),
    openclassId: raw.openclassId ?? null,
    status: computedStatus,
    deliveryModes: mapDeliveryModes(raw.typestudyDetail?.name),
    isActive: raw.status === 'Y' || raw.status === null,
    faculty: raw.facultyName ?? 'Lifelong Learning',
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
  const activeCourses = computed<Course[]>(() => {
    const today = new Date().toISOString().substring(0, 10);
    return courses.value.filter((c) => {
      const start = c.registrationStartDate;
      const end = c.registrationEndDate;
      return (!start || start <= today) && (!end || end >= today);
    });
  });

  const fetchCourses = async (force = false): Promise<void> => {
    if (!force && courseStore.backendCoursesLoaded) {
      error.value = null;
      return;
    }

    isLoading.value = true;
    error.value = null;

    try {
      if (!force && courseStore.backendCoursesLoading) {
        await courseStore.fetchBackendCourses();
        return;
      }

      courseStore.backendCoursesLoading = true;
      const { data } = await api.get<ApiLltcourse[]>('/api/moodle/courses');
      courseStore.loadFromApi(data.map(mapApiCourse));
      courseStore.backendCoursesLoaded = true;
    } catch {
      error.value = 'ไม่สามารถโหลดข้อมูลคอร์สได้';
    } finally {
      courseStore.backendCoursesLoading = false;
      isLoading.value = false;
    }
  };

  return { courses, isLoading, error, activeCourses, fetchCourses };
}
