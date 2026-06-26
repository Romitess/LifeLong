import { computed } from 'vue';
import type { RegisteredCourseEntry } from 'src/composables/use-my-registered-courses';
import { useAuthStore } from 'src/stores/auth-store';

export interface LearningResultDocumentData {
  learnerNameTh: string;
  learnerNameEn: string;
  learnerStudentId: string;
  faculty: string;
  department: string;
  courseTitle: string;
  courseCode: string;
  courseHours: number;
  learningOutcomes: string[];
  progressPercent: number;
  completedLessons: number;
  totalLessons: number;
  resultLabel: string;
  issuedAt: string;
  registrarName: string;
  registrarTitle: string;
  filename: string;
}

interface LearningResultDocumentMeta {
  issuedAt: string;
  registrarName: string;
  registrarTitle: string;
}

const DEFAULT_REGISTRAR_NAME = 'นายทะเบียน';
const DEFAULT_REGISTRAR_TITLE = 'มหาวิทยาลัยบูรพา';

const LEARNING_RESULT_DOCUMENT_META: Record<string, LearningResultDocumentMeta> = {
  '1': {
    issuedAt: '2026-04-30T09:30:00+07:00',
    registrarName: DEFAULT_REGISTRAR_NAME,
    registrarTitle: DEFAULT_REGISTRAR_TITLE,
  },
};

function sanitizeFilename(value: string): string {
  return value.replace(/[\\/:*?"<>|]/g, '-').replace(/\s+/g, '-');
}

export function useCourseCompletionDocuments() {
  const authStore = useAuthStore();

  const learnerNameTh = computed<string>(() =>
    `${authStore.user?.firstNameTh ?? ''} ${authStore.user?.lastNameTh ?? ''}`.trim(),
  );

  const learnerNameEn = computed<string>(() =>
    `${authStore.user?.firstNameEn ?? ''} ${authStore.user?.lastNameEn ?? ''}`.trim(),
  );

  const buildLearningResultDocument = (
    entry: RegisteredCourseEntry,
  ): LearningResultDocumentData | null => {
    if (!authStore.user || !entry.courseDetail || !entry.progress.isCompleted) {
      return null;
    }

    const metadata = LEARNING_RESULT_DOCUMENT_META[entry.course.id] ?? {
      issuedAt: entry.registration.registeredAt,
      registrarName: DEFAULT_REGISTRAR_NAME,
      registrarTitle: DEFAULT_REGISTRAR_TITLE,
    };

    const courseHours =
      (entry.courseDetail.totalHours ?? 0) > 0
        ? entry.courseDetail.totalHours!
        : entry.courseDetail.creditHours > 0
          ? entry.courseDetail.creditHours
          : entry.progress.totalLessons;

    const learningOutcomes = entry.courseDetail.objectives.slice(0, 4);

    return {
      learnerNameTh: learnerNameTh.value,
      learnerNameEn: learnerNameEn.value,
      learnerStudentId: authStore.user.studentId,
      faculty: authStore.user.faculty,
      department: authStore.user.department,
      courseTitle: entry.course.title,
      courseCode: entry.course.code,
      courseHours,
      learningOutcomes,
      progressPercent: entry.progress.progressPercent,
      completedLessons: entry.progress.completedLessons,
      totalLessons: entry.progress.totalLessons,
      resultLabel: 'ผ่าน',
      issuedAt: metadata.issuedAt,
      registrarName: metadata.registrarName,
      registrarTitle: metadata.registrarTitle,
      filename: sanitizeFilename(
        `learning-result-${authStore.user.studentId}-${entry.course.code}.pdf`,
      ),
    };
  };

  return {
    buildLearningResultDocument,
  };
}
