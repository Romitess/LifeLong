// src/stores/course-store.ts
import { defineStore } from 'pinia';
import type { Course } from 'src/types/course';
import type { CourseDetail } from 'src/types/course-detail';
import {
  DEMO_INSTRUCTOR_EMAIL,
  DEMO_INSTRUCTOR_ID,
  MOCK_COURSES,
  MOCK_COURSE_DETAILS,
  getMockCourseInstructorOwner,
} from 'src/data/mock-courses';

const STORAGE_KEY = 'lll-courses';
const DETAIL_STORAGE_KEY = 'lll-course-details';
const LEGACY_DEMO_PREVIEW_VIDEO_URL =
  'https://videos.pexels.com/video-files/855734/855734-hd_1920_1080_25fps.mp4';

type CourseInstructorOwner = {
  id?: string;
  email?: string;
  role?: string;
} | null;

function normalizeInstructorEmail(email?: string): string {
  return email?.trim().toLowerCase() ?? '';
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

function mergeStoredCourseDetails(
  mockDetails: Record<string, CourseDetail>,
  storedDetails: Record<string, CourseDetail>,
): Record<string, CourseDetail> {
  const detailIds = new Set([...Object.keys(mockDetails), ...Object.keys(storedDetails)]);

  return Object.fromEntries(
    [...detailIds].map((courseId) => {
      const mockDetail = mockDetails[courseId];
      const storedDetail = storedDetails[courseId];

      if (!mockDetail) {
        return [courseId, storedDetail];
      }

      if (!storedDetail) {
        return [courseId, mockDetail];
      }

      return [
        courseId,
        {
          ...storedDetail,
          ...mockDetail,
          previewVideoUrl:
            storedDetail.previewVideoUrl === LEGACY_DEMO_PREVIEW_VIDEO_URL
              ? mockDetail.previewVideoUrl
              : (storedDetail.previewVideoUrl ?? mockDetail.previewVideoUrl),
          previewPosterUrl: storedDetail.previewPosterUrl ?? mockDetail.previewPosterUrl,
        },
      ];
    }),
  );
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
    totalHours: 0,
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

export const useCourseStore = defineStore('course', {
  state: (): {
    courses: Course[];
    courseDetails: Record<string, CourseDetail>;
    selectedCategory: string | null;
  } => ({
    courses: [],
    courseDetails: {},
    selectedCategory: null,
  }),
  actions: {
    setSelectedCategory(category: string | null) {
      this.selectedCategory = category;
    },
    /** Initialize courses from mock data. */
    init() {
      if (this.courses.length > 0) return;

      const storedCourses = readStoredCourses() ?? [];
      const mockIds = new Set(MOCK_COURSES.map((c) => c.id));

      // Prioritize MOCK_COURSES and keep user-created courses from storage
      const mergedCourses = [...MOCK_COURSES, ...storedCourses.filter((c) => !mockIds.has(c.id))];

      this.courses = mergedCourses.map(ensureCourseInstructorOwner);

      const storedDetails = readStoredCourseDetails() ?? {};
      // Prioritize MOCK_COURSE_DETAILS over stored details
      this.courseDetails = Object.fromEntries(
        Object.entries(mergeStoredCourseDetails(MOCK_COURSE_DETAILS, storedDetails)).map(
          ([courseId, detail]) => [courseId, ensureCourseDetailInstructorOwner(detail)],
        ),
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
        this.courseDetails[id] = {
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
    /** Add a course detail */
    addCourseDetail(detail: CourseDetail) {
      this.courseDetails[detail.id] = ensureCourseDetailInstructorOwner(detail);
      writeStoredCourseDetails(this.courseDetails);
    },
    /** Return a course detail by its ID or undefined */
    getCourseDetailById(id: string): CourseDetail | undefined {
      this.init();
      const detail = this.courseDetails[id];
      if (detail) {
        return detail;
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
