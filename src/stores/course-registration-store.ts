import { acceptHMRUpdate, defineStore } from 'pinia';
import { MOCK_COURSES } from 'src/data/mock-courses';
import { useAuthStore } from 'src/stores/auth-store';
import type { CourseDetail } from 'src/types/course-detail';

export type LearnerEligibility = 'student';

export interface RegistrantInfo {
  fullName: string;
  email: string;
  phone: string;
  taxId?: string;
}

export interface CourseRegistration {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  courseImageUrl: string;
  courseCover: {
    icon: string;
    accentColor: string;
    backgroundColor: string;
  };
  eligibility: LearnerEligibility;
  paymentStatus: 'pending' | 'paid' | 'free';
  registrantInfo?: RegistrantInfo;
  registeredAt: string;
  userId: string;
}

interface CourseRegistrationState {
  registrations: CourseRegistration[];
}

const STORAGE_KEY = 'lll-course-registrations';
const DEFAULT_MOCK_USER_ID = 'mock-student-user';

function createMockRegistration(
  courseId: string,
  registeredAt: string,
  userId = DEFAULT_MOCK_USER_ID,
): CourseRegistration | null {
  const course = MOCK_COURSES.find((candidate) => candidate.id === courseId);

  if (!course) {
    return null;
  }

  return {
    id: `${userId}-${course.id}`,
    courseId: course.id,
    courseCode: course.code,
    courseTitle: course.title,
    courseImageUrl: course.imageUrl,
    courseCover: {
      icon: course.cover.icon,
      accentColor: course.cover.accentColor,
      backgroundColor: course.cover.backgroundColor,
    },
    eligibility: 'student',
    paymentStatus: course.isFree ? 'free' : 'paid',
    registeredAt,
    userId,
  };
}

const DEFAULT_REGISTRATIONS: CourseRegistration[] = [
  createMockRegistration('2', '2026-04-27T09:00:00+07:00'),
  createMockRegistration('3', '2026-04-28T14:30:00+07:00'),
  createMockRegistration('1', '2026-04-29T08:15:00+07:00'),
  createMockRegistration('4', '2026-04-30T10:45:00+07:00'),
].filter((registration): registration is CourseRegistration => registration !== null);

function getAuthenticatedUserId(): string | null {
  const authStore = useAuthStore();

  if (!authStore.isLoggedIn || !authStore.user) {
    return null;
  }

  return authStore.user.id;
}

function readStoredRegistrations(): CourseRegistration[] {
  if (typeof window === 'undefined') {
    return DEFAULT_REGISTRATIONS;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    writeStoredRegistrations(DEFAULT_REGISTRATIONS);
    return DEFAULT_REGISTRATIONS;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as CourseRegistration[];
    if (!Array.isArray(parsedValue)) {
      return [];
    }

    const registrationMap = new Map(
      [...parsedValue, ...DEFAULT_REGISTRATIONS].map((registration) => {
        const withPaymentStatus = {
          ...registration,
          paymentStatus: registration.paymentStatus || 'paid',
        };
        return [withPaymentStatus.id, withPaymentStatus];
      }),
    );
    const mergedRegistrations = Array.from(registrationMap.values());
    writeStoredRegistrations(mergedRegistrations);

    return mergedRegistrations;
  } catch {
    writeStoredRegistrations(DEFAULT_REGISTRATIONS);
    return DEFAULT_REGISTRATIONS;
  }
}

function writeStoredRegistrations(registrations: CourseRegistration[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(registrations));
}

export const useCourseRegistrationStore = defineStore('course-registration', {
  state: (): CourseRegistrationState => ({
    registrations: readStoredRegistrations(),
  }),

  getters: {
    isRegistered:
      (state) =>
      (courseId: string): boolean => {
        const userId = getAuthenticatedUserId();

        if (!userId) {
          return false;
        }

        return state.registrations.some(
          (registration) => registration.courseId === courseId && registration.userId === userId,
        );
      },

    myRegistrations: (state): CourseRegistration[] => {
      const userId = getAuthenticatedUserId();

      if (!userId) {
        return [];
      }

      return state.registrations.filter((registration) => registration.userId === userId);
    },
  },

  actions: {
    registerCourse(
      course: CourseDetail,
      eligibility: LearnerEligibility,
      paymentStatus: 'pending' | 'paid' | 'free' = 'paid',
      registrantInfo?: RegistrantInfo,
    ): void {
      const userId = getAuthenticatedUserId();

      if (!userId) {
        return;
      }

      const existingIndex = this.registrations.findIndex(
        (reg) => reg.courseId === course.id && reg.userId === userId,
      );

      if (existingIndex !== -1) {
        const existing = this.registrations[existingIndex];
        if (existing) {
          const updated = { ...existing };
          let changed = false;

          if (existing.paymentStatus !== paymentStatus) {
            updated.paymentStatus = paymentStatus;
            changed = true;
          }

          if (registrantInfo) {
            updated.registrantInfo = registrantInfo;
            changed = true;
          }

          if (changed) {
            const nextRegistrations = [...this.registrations];
            nextRegistrations[existingIndex] = updated;
            this.registrations = nextRegistrations;
            writeStoredRegistrations(nextRegistrations);
          }
        }
        return;
      }

      const nextRegistrations: CourseRegistration[] = [
        ...this.registrations,
        {
          id: `${userId}-${course.id}`,
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          courseImageUrl: course.imageUrl,
          courseCover: {
            icon: course.cover.icon,
            accentColor: course.cover.accentColor,
            backgroundColor: course.cover.backgroundColor,
          },
          eligibility,
          paymentStatus: course.isFree ? 'free' : paymentStatus,
          ...(registrantInfo ? { registrantInfo } : {}),
          registeredAt: new Date().toISOString(),
          userId,
        },
      ];

      this.registrations = nextRegistrations;
      writeStoredRegistrations(nextRegistrations);
    },

    unregisterCourse(courseId: string): void {
      const userId = getAuthenticatedUserId();

      if (!userId) {
        return;
      }

      const nextRegistrations = this.registrations.filter(
        (registration) => !(registration.courseId === courseId && registration.userId === userId),
      );

      this.registrations = nextRegistrations;
      writeStoredRegistrations(nextRegistrations);
    },

    updateRegistrationPaymentStatus(courseId: string, status: 'pending' | 'paid' | 'free'): void {
      const userId = getAuthenticatedUserId();

      if (!userId) {
        return;
      }

      const existingIndex = this.registrations.findIndex(
        (reg) => reg.courseId === courseId && reg.userId === userId,
      );

      if (existingIndex === -1) {
        return;
      }

      const existing = this.registrations[existingIndex];
      if (!existing) {
        return;
      }

      const nextRegistrations = [...this.registrations];
      nextRegistrations[existingIndex] = {
        ...existing,
        paymentStatus: status,
      };

      this.registrations = nextRegistrations;
      writeStoredRegistrations(nextRegistrations);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCourseRegistrationStore, import.meta.hot));
}
