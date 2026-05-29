import { useEnrollmentProgressStore } from 'src/stores/enrollment-progress-store';
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
  const { t } = useI18n({ useScope: 'global' });

  const getCourseProgressSummary = (enrollId: number | null | undefined): CourseProgressSummary => {
    const completion = enrollId != null ? enrollmentProgressStore.getCompletion(enrollId) : null;
    const totalLessons = completion?.total ?? 0;
    const completedLessons = completion?.done ?? 0;
    const progressPercent = completion?.percent ?? 0;
    const isCompleted = completion?.completed ?? false;

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
