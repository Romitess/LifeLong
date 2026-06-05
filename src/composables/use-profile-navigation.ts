import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { pushMoodleLearningRoute } from 'src/utils/moodle-navigation';
import { getCourseDetailById } from 'src/data/mock-courses';

export function useProfileNavigation() {
  const router = useRouter();
  const authStore = useAuthStore();

  function goToCourse(courseId: string, courseCode?: string, moodleCourseId?: number): void {
    if (authStore.user?.username) {
      const courseDetail = getCourseDetailById(courseId);
      pushMoodleLearningRoute(router, courseId, undefined, {
        moodleCourseId: moodleCourseId ?? courseDetail?.moodleId ?? courseId,
        courseCode,
      });
      return;
    }

    void router.push(`/course/${courseId}/learn`);
  }

  function goToInstructorCourses(): void {
    void router.push({
      path: '/instructor/courses',
      query: { view: 'table' },
    });
  }

  function goToInstructorStudents(): void {
    void router.push('/instructor/students');
  }

  function goToInstructorLearningResults(): void {
    void router.push({
      path: '/instructor/students',
      query: { tab: 'results' },
    });
  }

  function goToInstructorCertificates(): void {
    void router.push('/instructor/certificates');
  }

  function goToInstructorCourseWorkspace(courseId: string): void {
    void router.push({
      path: '/instructor/courses',
      query: { courseId },
    });
  }

  function goToInstructorCertificateCourse(courseId: string): void {
    void router.push({
      path: '/instructor/certificates',
      query: { courseId },
    });
  }

  return {
    goToCourse,
    goToInstructorCourses,
    goToInstructorStudents,
    goToInstructorLearningResults,
    goToInstructorCertificates,
    goToInstructorCourseWorkspace,
    goToInstructorCertificateCourse,
  };
}
