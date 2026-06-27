// src/stores/course-store.ts
import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import type { Course, DeliveryMode } from 'src/types/course';
import type { CourseDetail } from 'src/types/course-detail';
import { getMockCourseInstructorOwner } from 'src/data/mock-courses';
import { useCategoryStore } from './category-store';
import { getImageUrl } from 'src/services/image.service';

const STORAGE_KEY = 'lll-courses';
const DETAIL_STORAGE_KEY = 'lll-course-details';
let backendCoursesLoadPromise: Promise<void> | null = null;

type CourseInstructorOwner = {
  id?: string;
  email?: string;
  role?: string;
} | null;

interface BackendCourseResponse {
  value?: BackendCourse[];
  Count?: number;
}

interface WrappedListResponse<T> {
  value?: T[];
  Count?: number;
}

interface BackendCourse {
  id?: number;
  code?: string | null;
  titleTh?: string | null;
  titleEn?: string | null;
  hours?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  regStartDate?: string | null;
  regEndDate?: string | null;
  categoryId?: number | null;
  objective?: string | null;
  status?: string | null;
  createUser?: string | null;
  imageUrl?: string | null;
  moodleId?: number | null;
  instructorEmail?: string | null;
  evaluationText?: string | null;
  typestudyDetail?: { id: number; name: string | null } | null;
  maxSeats?: number | null;
  enrolledCount?: number | null;
  reviewAverage?: number | null;
  reviewCount?: number | null;
  topEnrollmentRank?: number | null;
  amount?: number | null;
  clickCount?: number | null;
  openclassId?: number | null;
  facultyName?: string | null;
  updatedAt?: string | null;
}

interface BackendInstructorCourse {
  id: number;
  code?: string | null;
  titleTh?: string | null;
  titleEn?: string | null;
  imageUrl?: string | null;
  status?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  regStartDate?: string | null;
  regEndDate?: string | null;
  moodleId?: number | null;
  maxSeats?: number | null;
  enrolledCount?: number | null;
  reviewAverage?: number | null;
  reviewCount?: number | null;
  amount?: number | null;
  categoryId?: number | null;
  updatedAt?: string | null;
  typestudyId?: number | null;
  typestudyName?: string | null;
}

function normalizeInstructorEmail(email?: string): string {
  return email?.trim().toLowerCase() ?? '';
}

function formatDisplayDate(value?: string | null): string {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

export function mapDeliveryModes(typestudyName?: string | null): DeliveryMode[] {
  if (!typestudyName) {
    return ['Online'];
  }
  if (typestudyName === 'Online') {
    return ['Online'];
  }
  if (typestudyName === 'Onsite') {
    return ['Onsite'];
  }
  if (typestudyName === 'Online & Onsite') {
    return ['Online', 'Onsite'];
  }
  if (typestudyName === 'Self-Paced Learning') {
    return ['Self-Paced Learning'];
  }
  return ['Online'];
}

function extractArrayPayload<T>(payload: T[] | WrappedListResponse<T> | null | undefined): T[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && Array.isArray(payload.value)) {
    return payload.value;
  }

  return [];
}

function extractCountPayload<T>(payload: T[] | WrappedListResponse<T> | null | undefined): number {
  if (payload && !Array.isArray(payload) && typeof payload.Count === 'number') {
    return payload.Count;
  }

  return extractArrayPayload(payload).length;
}

function mapBackendCourse(course: BackendCourse): Course | null {
  if (course.id === undefined || !course.code || !course.titleTh) {
    return null;
  }

  const isActive = course.status === 'Y';
  const today = new Date().toISOString().substring(0, 10);
  const startDate = course.regStartDate ?? course.startDate ?? today;
  const endDate = course.regEndDate ?? course.endDate ?? '2099-12-31';

  let categoryName = `Category ${course.categoryId ?? 1}`;
  try {
    const categoryStore = useCategoryStore();
    if (categoryStore.isApiLoaded && course.categoryId) {
      const matched = categoryStore.apiCategories.find((c) => c.id === course.categoryId);
      if (matched) {
        categoryName = matched.name;
      }
    }
  } catch {
    // Pinia not initialized yet
  }

  let computedStatus: 'เปิดรับสมัคร' | 'ปิดรับสมัคร' | 'เร็วๆนี้' = 'เปิดรับสมัคร';
  if (course.regStartDate && course.regStartDate > today) {
    computedStatus = 'เร็วๆนี้';
  } else if (course.regEndDate && course.regEndDate < today) {
    computedStatus = 'ปิดรับสมัคร';
  }

  return {
    id: `db-${course.id}`,
    code: course.code,
    ...(course.moodleId ? { moodleId: course.moodleId } : {}),
    title: course.titleTh,
    titleEn: course.titleEn ?? course.titleTh,
    instructorId: '',
    instructorEmail: course.instructorEmail ?? '',
    imageUrl: getImageUrl(course.imageUrl ?? ''),
    cover: {
      icon: 'school',
      accentColor: '#f5a623',
      backgroundColor: '#26364d',
    },
    registrationStart: formatDisplayDate(startDate),
    registrationStartEn: startDate,
    registrationEnd: formatDisplayDate(endDate),
    registrationEndEn: endDate,
    registrationStartDate: startDate,
    registrationEndDate: endDate,
    price: course.amount ?? 0,
    isFree: !course.amount,
    views: course.clickCount ?? 0,
    ...(course.topEnrollmentRank ? { topEnrollmentRank: course.topEnrollmentRank } : {}),
    openclassId: course.openclassId ?? null,
    status: computedStatus,
    deliveryModes: mapDeliveryModes(course.typestudyDetail?.name),
    isActive,
    faculty: course.facultyName ?? 'Lifelong Learning',
    facultyEn: course.facultyName ?? 'Lifelong Learning',
    category: categoryName,
    categoryEn: categoryName,
    categoryId: course.categoryId ?? undefined,
    maxSeats: course.maxSeats ?? null,
    enrolledCount: course.enrolledCount ?? 0,
    reviewAverage: course.reviewAverage ?? 0,
    reviewCount: course.reviewCount ?? 0,
    totalHours: course.hours ?? 0,
    evaluationText: course.evaluationText ?? null,
    ...(course.updatedAt ? { updatedAt: course.updatedAt } : {}),
  };
}

function ensureCourseInstructorOwner(course: Course): Course {
  // real DB data takes priority — only fall back to mock for legacy localStorage courses
  if (course.instructorEmail || course.instructorId) {
    return course;
  }
  const mockOwner = getMockCourseInstructorOwner(course.id);
  if (mockOwner) {
    return { ...course, ...mockOwner };
  }
  return course;
}

function ensureCourseDetailInstructorOwner(detail: CourseDetail): CourseDetail {
  const mockOwner = getMockCourseInstructorOwner(detail.id);
  const instructorId = detail.instructorId ?? mockOwner?.instructorId ?? '';
  const instructorEmail = detail.instructorEmail ?? mockOwner?.instructorEmail ?? '';

  return {
    ...detail,
    instructorId,
    instructorEmail,
    instructor: {
      ...detail.instructor,
      userId: instructorId,
      email: instructorEmail,
    },
  };
}

function readStoredCourses(): Course[] | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Course[];
    return Array.isArray(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

function writeStoredCourses(courses: Course[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(courses));
}

function readStoredCourseDetails(): Record<string, CourseDetail> | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(DETAIL_STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Record<string, CourseDetail>;
    return parsedValue && typeof parsedValue === 'object' && !Array.isArray(parsedValue)
      ? parsedValue
      : null;
  } catch {
    return null;
  }
}

function writeStoredCourseDetails(courseDetails: Record<string, CourseDetail>): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(DETAIL_STORAGE_KEY, JSON.stringify(courseDetails));
}

function createFallbackCourseDetail(course: Course): CourseDetail {
  const ownedCourse = ensureCourseInstructorOwner(course);

  return {
    ...ownedCourse,
    descriptionFull: course.title,
    descriptionFullEn: course.titleEn ?? course.title,
    objectives: ['รายละเอียดวัตถุประสงค์จะประกาศเพิ่มเติม'],
    objectivesEn: ['Learning objectives will be announced.'],
    targetAudience: 'ผู้เรียนที่สนใจรายวิชานี้',
    targetAudienceEn: 'Learners interested in this course',
    prerequisites: 'ไม่มี',
    prerequisitesEn: 'None',
    creditHours: 0,
    totalHours: course.totalHours ?? 0,
    department: course.faculty,
    departmentEn: course.facultyEn ?? course.faculty,
    instructor: {
      ...(ownedCourse.instructorId ? { userId: ownedCourse.instructorId } : {}),
      ...(ownedCourse.instructorEmail ? { email: ownedCourse.instructorEmail } : {}),
      name: 'ผู้สอน',
      nameEn: 'Instructor',
      title: '',
      titleEn: '',
      avatarUrl: 'https://i.pravatar.cc/200?img=12',
      department: course.faculty,
      departmentEn: course.facultyEn ?? course.faculty,
    },
    schedules: [],
    syllabus: [],
    certificateType: course.status,
    certificateTypeEn: course.status,
    contactEmail: '',
    contactPhone: '',
    previewPosterUrl: course.imageUrl,
  };
}

function mergeCourseIntoDetail(detail: CourseDetail, course: Course): CourseDetail {
  const instructorDepartmentEn = course.facultyEn ?? detail.instructor.departmentEn;
  const departmentEn = course.facultyEn ?? detail.departmentEn;
  const previewPosterUrl = course.imageUrl || detail.previewPosterUrl;

  return ensureCourseDetailInstructorOwner({
    ...detail,
    ...course,
    instructor: {
      ...detail.instructor,
      ...(course.instructorId ? { userId: course.instructorId } : {}),
      ...(course.instructorEmail ? { email: course.instructorEmail } : {}),
      department: course.faculty || detail.instructor.department,
      ...(instructorDepartmentEn ? { departmentEn: instructorDepartmentEn } : {}),
    },
    department: course.faculty || detail.department,
    ...(departmentEn ? { departmentEn } : {}),
    maxSeats: course.maxSeats ?? null,
    enrolledCount: course.enrolledCount,
    reviewAverage: course.reviewAverage ?? detail.reviewAverage ?? 0,
    reviewCount: course.reviewCount ?? detail.reviewCount ?? 0,
    certificateType: course.status,
    certificateTypeEn: course.status,
    ...(previewPosterUrl ? { previewPosterUrl } : {}),
  });
}

function mergeCourseOwnerData(baseCourse: Course, ownerCourse?: Partial<Course> | null): Course {
  if (!ownerCourse) {
    return ensureCourseInstructorOwner(baseCourse);
  }

  return ensureCourseInstructorOwner({
    ...baseCourse,
    ...(ownerCourse.instructorId ? { instructorId: ownerCourse.instructorId } : {}),
    ...(ownerCourse.instructorEmail ? { instructorEmail: ownerCourse.instructorEmail } : {}),
    reviewAverage: baseCourse.reviewAverage ?? ownerCourse.reviewAverage ?? 0,
    reviewCount: baseCourse.reviewCount ?? ownerCourse.reviewCount ?? 0,
  });
}

export const useCourseStore = defineStore('course', {
  state: (): {
    courses: Course[];
    courseDetails: Record<string, CourseDetail>;
    selectedCategory: string | null;
    backendCoursesLoaded: boolean;
    backendCoursesLoading: boolean;
    topEnrolledCourses: Course[];
    topEnrolledCoursesLoaded: boolean;
    topEnrolledCoursesLoading: boolean;
  } => ({
    courses: [],
    courseDetails: {},
    selectedCategory: null,
    backendCoursesLoaded: false,
    backendCoursesLoading: false,
    topEnrolledCourses: [],
    topEnrolledCoursesLoaded: false,
    topEnrolledCoursesLoading: false,
  }),
  actions: {
    setSelectedCategory(category: string | null) {
      this.selectedCategory = category;
    },
    /** Initialize courses from backend. */
    init() {
      if (this.courses.length > 0) {
        void this.fetchBackendCourses();
        return;
      }

      // Clear any stale mock data from localStorage (mock courses had ids like "1","2",... or "course-xxx")
      const storedCourses = (readStoredCourses() ?? []).filter(
        (c) => c.id.startsWith('db-') || c.id.startsWith('registered-'),
      );
      this.courses = storedCourses.map(ensureCourseInstructorOwner);

      const storedDetails = readStoredCourseDetails() ?? {};
      const cleanedDetails = Object.fromEntries(
        Object.entries(storedDetails).filter(
          ([id]) => id.startsWith('db-') || id.startsWith('registered-'),
        ),
      );
      this.courseDetails = Object.fromEntries(
        Object.entries(cleanedDetails).map(([courseId, detail]) => {
          const latestCourse = this.courses.find((course) => course.id === courseId);
          return [
            courseId,
            latestCourse
              ? mergeCourseIntoDetail(detail, latestCourse)
              : ensureCourseDetailInstructorOwner(detail),
          ];
        }),
      );

      writeStoredCourses(this.courses);
      writeStoredCourseDetails(this.courseDetails);
      void this.fetchBackendCourses();
    },
    async fetchBackendCourses(force = false) {
      if (force) {
        this.backendCoursesLoaded = false;
      }

      if (this.backendCoursesLoaded && !force) {
        return;
      }

      if (backendCoursesLoadPromise) {
        return backendCoursesLoadPromise;
      }

      this.backendCoursesLoading = true;
      backendCoursesLoadPromise = (async () => {
        try {
          const { data } = await api.get<BackendCourseResponse | BackendCourse[]>(
            '/api/moodle/courses',
          );
          const rawCourses = extractArrayPayload(data);
          const backendCourses = rawCourses
            .map(mapBackendCourse)
            .filter((course): course is Course => Boolean(course));

          if (backendCourses.length === 0) {
            return;
          }

          this.loadFromApi(backendCourses);
        } catch (error) {
          console.warn('Failed to fetch backend courses', error);
        } finally {
          this.backendCoursesLoaded = true;
          this.backendCoursesLoading = false;
          backendCoursesLoadPromise = null;
        }
      })();

      return backendCoursesLoadPromise;
    },
    async fetchTopEnrolledCourses() {
      if (this.topEnrolledCoursesLoaded) {
        return;
      }

      this.topEnrolledCoursesLoading = true;
      let succeeded = false;
      try {
        const { data } = await api.get<BackendCourseResponse | BackendCourse[]>(
          '/api/moodle/courses/top-enrolled',
        );
        this.topEnrolledCourses = extractArrayPayload(data)
          .map(mapBackendCourse)
          .filter((course): course is Course => Boolean(course))
          .slice(0, 10);
        succeeded = true;
      } catch (error) {
        console.warn('Failed to fetch top enrolled courses', error);
        this.topEnrolledCoursesLoaded = false;
        throw error;
      } finally {
        if (succeeded) {
          this.topEnrolledCoursesLoaded = true;
        }
        this.topEnrolledCoursesLoading = false;
      }
    },
    async fetchInstructorCourses(email: string) {
      if (!email?.trim()) return;
      try {
        const { data } = await api.get<
          BackendInstructorCourse[] | WrappedListResponse<BackendInstructorCourse>
        >(`/api/instructor/courses?email=${encodeURIComponent(email.trim())}`);
        const instructorCourses = extractArrayPayload(data)
          .map((course) =>
            mapBackendCourse({
              id: course.id,
              code: course.code ?? null,
              titleTh: course.titleTh ?? null,
              titleEn: course.titleEn ?? null,
              startDate: course.startDate ?? null,
              endDate: course.endDate ?? null,
              regStartDate: course.regStartDate ?? null,
              regEndDate: course.regEndDate ?? null,
              status: course.status ?? null,
              imageUrl: course.imageUrl ?? null,
              moodleId: course.moodleId ?? null,
              instructorEmail: email,
              maxSeats: course.maxSeats ?? null,
              enrolledCount: course.enrolledCount ?? null,
              reviewAverage: course.reviewAverage ?? null,
              reviewCount: course.reviewCount ?? null,
              amount: course.amount ?? null,
              categoryId: course.categoryId ?? null,
              updatedAt: course.updatedAt ?? null,
              typestudyDetail:
                course.typestudyId != null
                  ? {
                      id: course.typestudyId,
                      name: course.typestudyName ?? null,
                    }
                  : null,
            }),
          )
          .filter((c): c is Course => Boolean(c));

        await Promise.all(
          instructorCourses.map(async (course) => {
            if (!course.moodleId) return;

            try {
              const response = await api.get<WrappedListResponse<unknown> | unknown[]>(
                `/api/instructor/moodle-courses/${course.moodleId}/learners`,
              );
              const count = extractCountPayload(response.data);
              if (count > 0) {
                course.enrolledCount = count;
              }
            } catch (error) {
              console.warn(`Failed to refresh Moodle learner count for ${course.code}`, error);
            }
          }),
        );

        for (const course of instructorCourses) {
          const exists = this.courses.findIndex((c) => c.id === course.id);
          if (exists >= 0) {
            this.courses[exists] = mergeCourseOwnerData(course, this.courses[exists]);
          } else {
            this.courses.push(ensureCourseInstructorOwner(course));
          }

          const latestCourse =
            this.courses.find((candidate) => candidate.id === course.id) ?? course;
          const existingDetail = this.courseDetails[course.id];
          if (existingDetail) {
            this.courseDetails[course.id] = mergeCourseIntoDetail(existingDetail, latestCourse);
          } else {
            this.courseDetails[course.id] = createFallbackCourseDetail(latestCourse);
          }
        }

        writeStoredCourses(this.courses);
        writeStoredCourseDetails(this.courseDetails);
      } catch (error) {
        console.warn('Failed to fetch instructor courses', error);
      }
    },
    /** Load courses from API — replaces all courses with backend data */
    loadFromApi(apiCourses: Course[]) {
      const existingCourseMap = new Map(this.courses.map((course) => [course.id, course]));
      this.courses = apiCourses.map((course) =>
        mergeCourseOwnerData(course, existingCourseMap.get(course.id)),
      );

      const storedDetails = readStoredCourseDetails() ?? {};
      const apiDetails: Record<string, CourseDetail> = {};
      for (const course of this.courses) {
        const stored = storedDetails[course.id];
        const isValidStored = stored && stored.code === course.code;
        apiDetails[course.id] = isValidStored
          ? mergeCourseIntoDetail(stored, course)
          : createFallbackCourseDetail(course);
      }

      this.courseDetails = Object.fromEntries(
        Object.entries(apiDetails).map(([id, detail]) => [
          id,
          ensureCourseDetailInstructorOwner(detail),
        ]),
      );

      writeStoredCourses(this.courses);
      writeStoredCourseDetails(this.courseDetails);
    },
    /** Add a new course to the list */
    addCourse(course: Course) {
      this.courses.unshift(ensureCourseInstructorOwner(course));
      writeStoredCourses(this.courses);
    },
    /** Update an existing course and its detail record when available. */
    updateCourse(id: string, changes: Partial<Course>) {
      this.courses = this.courses.map((course) =>
        course.id === id
          ? {
              ...course,
              ...changes,
            }
          : course,
      );

      if (this.courseDetails[id]) {
        const updatedCourse = this.courses.find((course) => course.id === id);
        this.courseDetails[id] = updatedCourse
          ? mergeCourseIntoDetail(this.courseDetails[id], updatedCourse)
          : {
              ...this.courseDetails[id],
              ...changes,
            };
      }

      writeStoredCourses(this.courses);
      writeStoredCourseDetails(this.courseDetails);
    },
    getInstructorCourses(owner: CourseInstructorOwner): Course[] {
      if (!owner) {
        return [];
      }

      const ownerEmail = normalizeInstructorEmail(owner.email);
      const ownerId = owner.id ?? '';

      return this.courses.filter((course) => {
        const courseEmail = normalizeInstructorEmail(course.instructorEmail);
        return Boolean(
          (ownerEmail && courseEmail === ownerEmail) ||
          (ownerId && course.instructorId === ownerId),
        );
      });
    },
    /** Remove a course by its ID */
    deleteCourse(id: string) {
      this.courses = this.courses.filter((course) => course.id !== id);
      delete this.courseDetails[id];
      writeStoredCourses(this.courses);
      writeStoredCourseDetails(this.courseDetails);
    },
    getCourseById(id: string): Course | undefined {
      return this.courses.find((c) => c.id === id);
    },
    /** Return a course detail by its ID or undefined.
     *  NOTE: This must NOT mutate store state synchronously because it is
     *  called from computed properties and template render functions (e.g.
     *  via getCourseStructure → buildLearnersForCourse). Synchronous state
     *  mutations here cause Vue's "Maximum recursive updates exceeded" error.
     */
    getCourseDetailById(id: string): CourseDetail | undefined {
      const detail = this.courseDetails[id];
      if (detail) {
        const latestCourse = this.courses.find((candidate) => candidate.id === id);
        if (!latestCourse) {
          return detail;
        }

        return mergeCourseIntoDetail(detail, latestCourse);
      }

      const course = this.courses.find((candidate) => candidate.id === id);
      if (!course) {
        return undefined;
      }

      return createFallbackCourseDetail(course);
    },
  },
});
