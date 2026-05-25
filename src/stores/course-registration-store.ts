import { acceptHMRUpdate, defineStore } from 'pinia';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth-store';
import type { CourseDetail } from 'src/types/course-detail';

export type LearnerEligibility = 'student';

export interface RegistrantInfo {
  fullName: string;
  email: string;
  phone: string;
  taxId?: string;
  billingAddress?: string;
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
  enrollId?: number | null | undefined;
}

interface CourseRegistrationState {
  registrations: CourseRegistration[];
}

const STORAGE_KEY = 'lll-course-registrations';

function getAuthenticatedUserId(): string | null {
  const authStore = useAuthStore();

  if (!authStore.isLoggedIn || !authStore.user) {
    return null;
  }

  return authStore.user.id;
}

function readStoredRegistrations(): CourseRegistration[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as CourseRegistration[];
    if (!Array.isArray(parsedValue)) {
      return [];
    }
    // Filter out any stale mock registrations (mock course IDs were plain numbers or "course-xxx")
    return parsedValue.filter(
      (r) => r.courseId.startsWith('db-') || r.courseId.startsWith('registered-'),
    );
  } catch {
    return [];
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
    async registerCourse(
      course: CourseDetail,
      eligibility: LearnerEligibility,
      paymentStatus: 'pending' | 'paid' | 'free' = 'paid',
      registrantInfo?: RegistrantInfo,
    ): Promise<void> {
      const authStore = useAuthStore();
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

      // Sync enrollment to backend (LLL DB + Moodle)
      const username = authStore.user?.username;
      if (username && course.code) {
        try {
          await api.post('/api/moodle/enroll', { courseCode: course.code, username });
          // Fetch from API to sync enrollId
          await this.syncEnrollmentFromApi(course.code, course.id, course.title, course.imageUrl);
        } catch (err) {
          console.warn('Backend enrollment failed (saving locally only):', err);
        }
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

    async syncEnrollmentFromApi(
      courseCode: string,
      courseId: string,
      courseTitle?: string,
      courseImageUrl?: string,
    ): Promise<void> {
      const authStore = useAuthStore();
      const username = authStore.user?.username;
      if (!username || !courseCode) return;

      const userId = getAuthenticatedUserId();
      if (!userId) return;

      try {
        const { data } = await api.get<{
          enrolled: boolean;
          enrollId: number | null;
          moodleId: number | null;
        }>('/api/moodle/enroll/check', { params: { courseCode, username } });

        const existingIndex = this.registrations.findIndex(
          (r) => r.courseId === courseId && r.userId === userId,
        );

        if (data.enrolled) {
          if (existingIndex !== -1) {
            // Update existing registration with the correct enrollId
            const updated = { ...this.registrations[existingIndex], enrollId: data.enrollId };
            const nextRegistrations = [...this.registrations];
            nextRegistrations[existingIndex] = updated as CourseRegistration;
            this.registrations = nextRegistrations;
            writeStoredRegistrations(nextRegistrations);
          } else {
            // Add new registration
            const nextRegistrations: CourseRegistration[] = [
              ...this.registrations,
              {
                id: `${userId}-${courseId}`,
                courseId,
                courseCode,
                courseTitle: courseTitle ?? courseId,
                courseImageUrl: courseImageUrl ?? '',
                courseCover: { icon: 'school', accentColor: '#f5a623', backgroundColor: '#1e3a5f' },
                eligibility: 'student',
                paymentStatus: 'free',
                registeredAt: new Date().toISOString(),
                userId,
                enrollId: data.enrollId,
              },
            ];
            this.registrations = nextRegistrations;
            writeStoredRegistrations(nextRegistrations);
          }
        } else if (!data.enrolled && existingIndex !== -1) {
          const nextRegistrations = this.registrations.filter(
            (r) => !(r.courseId === courseId && r.userId === userId),
          );
          this.registrations = nextRegistrations;
          writeStoredRegistrations(nextRegistrations);
        }
      } catch {
        // Silently fail — localStorage state is kept as fallback
      }
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
