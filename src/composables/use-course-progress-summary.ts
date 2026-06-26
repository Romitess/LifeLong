import { useEnrollmentProgressStore } from 'src/stores/enrollment-progress-store';
import { useCourseProgressStore } from 'src/stores/course-progress-store';
import { useI18n } from 'vue-i18n';

export interface CourseProgressSummary {
  completedLessons: number;
  totalLessons: number;
  progressPercent: number;
  isCompleted: boolean;
  statusLabel: string;
  detailLabel: string;
  color: 'positive' | 'primary';
}

export function useCourseProgressSummary() {
  const enrollmentProgressStore = useEnrollmentProgressStore();
  const progressStore = useCourseProgressStore();
  const { t } = useI18n({ useScope: 'global' });

  const getCourseProgressSummary = (
    enrollId: number | null | undefined,
    courseId?: string,
  ): CourseProgressSummary => {
    const completion = enrollId != null ? enrollmentProgressStore.getCompletion(enrollId) : null;
    const moodleDone = completion?.done ?? 0;
    const totalLessons = completion?.total ?? 0;

    // Local progress tracks lessons opened in-app (resource view, graded assignment, quiz pass,
    // feedback submit). Use whichever is higher to compensate for Moodle not auto-marking
    // completion for view-based / noSubmissions activities when the grade was given before
    // completion tracking was enabled, or when the backend doesn't push view events to Moodle.
    const localDone = courseId ? progressStore.getCompletedLessonCount(courseId) : 0;
    const completedLessons =
      totalLessons > 0 ? Math.min(Math.max(moodleDone, localDone), totalLessons) : moodleDone;

    const progressPercent =
      totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;
    const isCompleted = (completion?.completed ?? false) || progressPercent >= 100;

    return {
      completedLessons,
      totalLessons,
      progressPercent,
      isCompleted,
      statusLabel: isCompleted ? t('learning.completed') : t('profile.courses.inProgress'),
      detailLabel: t('profile.courses.progressSummary', {
        completed: completedLessons,
        total: totalLessons,
      }),
      color: isCompleted ? 'positive' : 'primary',
    };
  };

  return {
    getCourseProgressSummary,
  };
}
