// src/stores/course-store.ts
import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import type { Course } from 'src/types/course';
import type { CourseDetail } from 'src/types/course-detail';
import {
  DEMO_INSTRUCTOR_EMAIL,
  DEMO_INSTRUCTOR_ID,
  getMockCourseInstructorOwner,
} from 'src/data/mock-courses';

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
}

interface BackendCourse {
  id?: number;
  code?: string | null;
  titleTh?: string | null;
  titleEn?: string | null;
  hours?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  categoryId?: number | null;
  objective?: string | null;
  status?: string | null;
  createUser?: string | null;
  imageUrl?: string | null;
  moodleId?: number | null;
  evaluationDetail?: { id: number; name: string | null; other: string | null } | null;
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

function mapBackendCourse(course: BackendCourse): Course | null {
  if (course.id === undefined || !course.code || !course.titleTh) {
    return null;
  }

  const isActive = course.status === 'Y';
  const startDate = course.startDate ?? '2026-06-01';
  const endDate = course.endDate ?? '2026-09-30';
  const activeStatus = 'เปิดรับสมัคร';
  const inactiveStatus = 'เปิดรับสมัคร';

  return {
    id: `db-${course.id}`,
    code: course.code,
    ...(course.moodleId ? { moodleId: course.moodleId } : {}),
    title: course.titleTh,
    titleEn: course.titleEn ?? course.titleTh,
    instructorId: DEMO_INSTRUCTOR_ID,
    instructorEmail: DEMO_INSTRUCTOR_EMAIL,
    imageUrl: course.imageUrl ?? '',
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
    price: 0,
    isFree: true,
    views: 0,
    status: isActive ? activeStatus : inactiveStatus,
    deliveryModes: ['Online'],
    isActive,
    faculty: 'Lifelong Learning',
    facultyEn: 'Lifelong Learning',
    category: `Category ${course.categoryId ?? 1}`,
    categoryEn: `Category ${course.categoryId ?? 1}`,
    maxSeats: 40,
    enrolledCount: 0,
    totalHours: course.hours ?? 0,
    evaluation: course.evaluationDetail ?? null,
  };
}

function ensureCourseInstructorOwner(course: Course): Course {
  const mockOwner = getMockCourseInstructorOwner(course.id);
  if (mockOwner) {
    return {
      ...course,
      ...mockOwner,
    };
  }

  if (course.instructorEmail || course.instructorId) {
    return course;
  }

  return {
    ...course,
    instructorId: DEMO_INSTRUCTOR_ID,
    instructorEmail: DEMO_INSTRUCTOR_EMAIL,
  };
}

function ensureCourseDetailInstructorOwner(detail: CourseDetail): CourseDetail {
  const mockOwner = getMockCourseInstructorOwner(detail.id);
  const instructorId = mockOwner?.instructorId ?? detail.instructorId ?? DEMO_INSTRUCTOR_ID;
  const instructorEmail =
    mockOwner?.instructorEmail ?? detail.instructorEmail ?? DEMO_INSTRUCTOR_EMAIL;

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
      title: 'อาจารย์',
      titleEn: 'Instructor',
      avatarUrl: 'https://i.pravatar.cc/200?img=12',
      department: course.faculty,
      departmentEn: course.facultyEn ?? course.faculty,
    },
    schedules: [],
    syllabus: [],
    certificateType: course.status,
    certificateTypeEn: course.status,
    contactEmail: 'gem@buu.ac.th',
    contactPhone: '038-102-222',
    previewVideoUrl: 'https://www.youtube.com/watch?v=AGYgXbt-cq0',
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
    maxSeats: course.maxSeats,
    enrolledCount: course.enrolledCount,
    certificateType: course.status,
    certificateTypeEn: course.status,
    ...(previewPosterUrl ? { previewPosterUrl } : {}),
  });
}

export const useCourseStore = defineStore('course', {
  state: (): {
    courses: Course[];
    courseDetails: Record<string, CourseDetail>;
    selectedCategory: string | null;
    backendCoursesLoaded: boolean;
    backendCoursesLoading: boolean;
  } => ({
    courses: [],
    courseDetails: {},
    selectedCategory: null,
    backendCoursesLoaded: false,
    backendCoursesLoading: false,
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
    async fetchBackendCourses() {
      if (this.backendCoursesLoaded) {
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
          const rawCourses = Array.isArray(data) ? data : (data.value ?? []);
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
    /** Load courses from API — replaces all courses with backend data */
    loadFromApi(apiCourses: Course[]) {
      this.courses = apiCourses.map(ensureCourseInstructorOwner);

      const storedDetails = readStoredCourseDetails() ?? {};
      const apiDetails: Record<string, CourseDetail> = {};
      for (const course of apiCourses) {
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
      this.init();
      this.courses.unshift(ensureCourseInstructorOwner(course));
      writeStoredCourses(this.courses);
    },
    /** Update an existing course and its detail record when available. */
    updateCourse(id: string, changes: Partial<Course>) {
      this.init();

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
      this.init();

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
      this.init();
      this.courses = this.courses.filter((course) => course.id !== id);
      delete this.courseDetails[id];
      writeStoredCourses(this.courses);
      writeStoredCourseDetails(this.courseDetails);
    },
    getCourseById(id: string): Course | undefined {
      this.init();
      return this.courses.find((c) => c.id === id);
    },
    /** Return a course detail by its ID or undefined */
    getCourseDetailById(id: string): CourseDetail | undefined {
      this.init();
      const detail = this.courseDetails[id];
      if (detail) {
        const latestCourse = this.courses.find((candidate) => candidate.id === id);
        if (!latestCourse) {
          return detail;
        }

        const mergedDetail = mergeCourseIntoDetail(detail, latestCourse);
        this.courseDetails[id] = mergedDetail;
        writeStoredCourseDetails(this.courseDetails);
        return mergedDetail;
      }

      const course = this.courses.find((candidate) => candidate.id === id);
      if (!course) {
        return undefined;
      }

      const fallbackDetail = createFallbackCourseDetail(course);
      this.courseDetails[id] = fallbackDetail;
      writeStoredCourseDetails(this.courseDetails);
      return fallbackDetail;
    },
  },
});
