import { computed } from 'vue';
import { useCourseStore } from 'src/stores/course-store';
import {
  useCourseRegistrationStore,
  type CourseRegistration,
} from 'src/stores/course-registration-store';
import type { Course } from 'src/types/course';
import type { CourseDetail } from 'src/types/course-detail';
import {
  useCourseProgressSummary,
  type CourseProgressSummary,
} from 'src/composables/use-course-progress-summary';

export interface RegisteredCourseEntry {
  registration: CourseRegistration;
  course: Course;
  courseDetail: CourseDetail | null;
  progress: CourseProgressSummary;
}

const DEFAULT_REGISTERED_COURSE: Course = {
  id: '',
  code: '',
  title: '',
  titleEn: '',
  imageUrl: '',
  cover: {
    icon: 'auto_stories',
    accentColor: '#f5a623',
    backgroundColor: '#1e3a5f',
  },
  registrationStart: '',
  registrationStartEn: '',
  registrationEnd: '',
  registrationEndEn: '',
  registrationStartDate: '',
  registrationEndDate: '',
  price: 0,
  isFree: true,
  views: 0,
  status: 'เปิดรับสมัคร',
  deliveryModes: [],
  isActive: true,
  faculty: '',
  facultyEn: '',
  category: '',
  categoryEn: '',
  maxSeats: 0,
  enrolledCount: 0,
};

export function useMyRegisteredCourses() {
  const courseRegistrationStore = useCourseRegistrationStore();
  const { getCourseProgressSummary } = useCourseProgressSummary();

  const courseStore = useCourseStore();

  const hydrateRegisteredCourse = (registration: CourseRegistration): Course => {
    const matchedCourse =
      courseStore.getCourseDetailById(registration.courseId) ??
      courseStore.getCourseById(registration.courseId);

    if (!matchedCourse) {
      return {
        ...DEFAULT_REGISTERED_COURSE,
        id: registration.courseId,
        code: registration.courseCode,
        title: registration.courseTitle,
        titleEn: registration.courseTitle,
        imageUrl: registration.courseImageUrl,
        cover: registration.courseCover,
      };
    }

    return {
      ...matchedCourse,
      id: registration.courseId,
      code: registration.courseCode,
      title: matchedCourse.title,
      titleEn: matchedCourse.titleEn || registration.courseTitle,
      imageUrl: matchedCourse.imageUrl || registration.courseImageUrl,
      cover: matchedCourse.cover || registration.courseCover,
    };
  };

  const myRegistrations = computed<CourseRegistration[]>(
    () => courseRegistrationStore.myRegistrations,
  );

  const myRegisteredCourseEntries = computed<RegisteredCourseEntry[]>(() =>
    myRegistrations.value.map((registration) => ({
      registration,
      course: hydrateRegisteredCourse(registration),
      courseDetail: courseStore.getCourseDetailById(registration.courseId) ?? null,
      progress: getCourseProgressSummary(registration.enrollId, registration.courseId),
    })),
  );

  const getRegistrationByCourseId = (courseId: string): CourseRegistration | undefined =>
    myRegistrations.value.find((registration) => registration.courseId === courseId);

  const getRegisteredCourseEntry = (courseId: string): RegisteredCourseEntry | undefined =>
    myRegisteredCourseEntries.value.find((entry) => entry.registration.courseId === courseId);

  return {
    myRegistrations,
    myRegisteredCourseEntries,
    hydrateRegisteredCourse,
    getRegistrationByCourseId,
    getRegisteredCourseEntry,
  };
}
