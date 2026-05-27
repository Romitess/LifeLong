import { computed, ref, type ComputedRef, type Ref } from 'vue';
import { api } from 'src/boot/axios';
import type { Course } from 'src/types/course';
import type { CourseDetail, CourseTarget, CourseTypeClass } from 'src/types/course-detail';
import { useCourseStore, mapDeliveryModes } from 'src/stores/course-store';

type CourseIdSource = string | Ref<string>;

interface BackendCourseDetailResponse {
  objective?: string | null;
  description?: string | null;
  evaluationText?: string | null;
  typestudyDetail?: { id: number; name: string | null } | null;
  targets?: CourseTarget[] | null;
  precondition?: string | null;
  property?: string | null;
  contractName?: string | null;
  contractTel?: string | null;
  contractEmail?: string | null;
  contractUrl?: string | null;
  typeClasses?: CourseTypeClass[] | null;
  privilege?: string | null;
  instructorInfo?: {
    nameTh?: string | null;
    nameEn?: string | null;
    email?: string | null;
  } | null;
}

interface UseCourseDetailReturn {
  course: Ref<CourseDetail | null>;
  recommendedCourses: ComputedRef<Course[]>;
  isLoading: Ref<boolean>;
  error: Ref<string | null>;
  fetchCourseDetail: () => Promise<void>;
}

function readCourseId(courseId: CourseIdSource): string {
  return typeof courseId === 'string' ? courseId : courseId.value;
}

export function useCourseDetail(courseId: CourseIdSource): UseCourseDetailReturn {
  const courseStore = useCourseStore();
  const course = ref<CourseDetail | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);

  const recommendedCourses = computed<Course[]>(() => {
    const currentId = readCourseId(courseId);
    const currentCourse = courseStore.getCourseById(currentId);

    return courseStore.courses
      .filter((candidate) => candidate.id !== currentId)
      .sort((first, second) => {
        if (!currentCourse) {
          return second.views - first.views;
        }

        const firstScore =
          Number(first.category === currentCourse.category) +
          Number(first.isFree === currentCourse.isFree) +
          Number(first.deliveryModes.some((mode) => currentCourse.deliveryModes.includes(mode)));
        const secondScore =
          Number(second.category === currentCourse.category) +
          Number(second.isFree === currentCourse.isFree) +
          Number(second.deliveryModes.some((mode) => currentCourse.deliveryModes.includes(mode)));

        return secondScore - firstScore || second.views - first.views;
      })
      .slice(0, 4);
  });

  const fetchCourseDetail = async (): Promise<void> => {
    isLoading.value = true;
    error.value = null;

    try {
      await courseStore.fetchBackendCourses();

      const currentId = readCourseId(courseId);
      const detail = courseStore.getCourseDetailById(currentId);
      if (!detail) {
        course.value = null;
        error.value = 'ไม่พบข้อมูลรายละเอียดคอร์สนี้';
        return;
      }

      // Set fresh base data immediately so dates/enrollment state are up-to-date
      course.value = detail;

      // Fetch dynamic details (targets, evaluation) directly from NestJS API
      const rawId = currentId.replace('db-', '');
      const numId = Number(rawId);
      if (!Number.isNaN(numId)) {
        try {
          const { data } = await api.get<BackendCourseDetailResponse>(
            `/api/moodle/courses/${numId}`,
          );
          if (data) {
            // Parse objective: support newline or semicolon as separator
            const rawObjective = data.objective ?? '';
            const objectiveLines: string[] = rawObjective
              .split(/\n|;/)
              .map((line) => line.trim())
              .filter((line) => line.length > 0);

            course.value = {
              ...detail,
              // Always override objectives from API response (even if empty, clears the placeholder)
              objectives: objectiveLines,
              objectivesEn: objectiveLines,
              ...(data.description
                ? { descriptionFull: data.description, descriptionFullEn: data.description }
                : {}),
              targets: data.targets ?? [],
              evaluationText: data.evaluationText ?? null,
              precondition: data.precondition ?? null,
              property: data.property ?? null,
              ...(data.typestudyDetail
                ? { deliveryModes: mapDeliveryModes(data.typestudyDetail.name) }
                : {}),
              contractName: data.contractName ?? null,
              contractTel: data.contractTel ?? null,
              contractEmail: data.contractEmail ?? null,
              contractUrl: data.contractUrl ?? null,
              typeClasses: data.typeClasses ?? null,
              privilege: data.privilege ?? null,
              ...(data.instructorInfo
                ? {
                    instructor: {
                      ...detail.instructor,
                      ...(data.instructorInfo.email ? { email: data.instructorInfo.email } : {}),
                      ...(data.instructorInfo.nameTh ? { name: data.instructorInfo.nameTh } : {}),
                      ...(data.instructorInfo.nameEn
                        ? { nameEn: data.instructorInfo.nameEn }
                        : data.instructorInfo.nameTh
                          ? { nameEn: data.instructorInfo.nameTh }
                          : {}),
                    },
                  }
                : {}),
            };
          }
        } catch (apiError) {
          console.warn('Failed to fetch individual course detail from backend:', apiError);
        }
      }
    } catch {
      error.value = 'ไม่สามารถโหลดข้อมูลรายละเอียดคอร์สได้ กรุณาลองใหม่อีกครั้ง';
    } finally {
      isLoading.value = false;
    }
  };

  return { course, recommendedCourses, isLoading, error, fetchCourseDetail };
}
