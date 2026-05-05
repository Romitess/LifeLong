import { getCourseStructure, getFlatLessons } from 'src/data/course-structure';
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
  const progressStore = useCourseProgressStore();
  const { t } = useI18n({ useScope: 'global' });

  const getCourseProgressSummary = (courseId: string): CourseProgressSummary => {
    const structure = getCourseStructure(courseId);
    const totalLessons = getFlatLessons(structure).length;
    const completedLessons = progressStore.getCompletedLessonCount(courseId);
    const progressPercent = progressStore.getCourseProgress(courseId, totalLessons);
    const isCompleted = totalLessons > 0 && progressPercent >= 100;

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
