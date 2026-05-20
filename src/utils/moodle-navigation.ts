import type { Router } from 'vue-router';

const MOODLE_URL_STORAGE_PREFIX = 'lll:moodle-url:';

function getQueryValue(value: unknown): string {
  if (Array.isArray(value)) return String(value[0] ?? '');
  return typeof value === 'string' ? value : '';
}

export function pushMoodleLearningRoute(router: Router, courseId: string, moodleUrl: string): void {
  const key = `${courseId}:${Date.now()}:${Math.random().toString(36).slice(2)}`;

  sessionStorage.setItem(`${MOODLE_URL_STORAGE_PREFIX}${key}`, moodleUrl);
  sessionStorage.setItem(`${MOODLE_URL_STORAGE_PREFIX}latest:${courseId}`, moodleUrl);

  void router.push({
    path: `/course/${courseId}/learn`,
    query: { moodleKey: key },
  });
}

export function getStoredMoodleUrl(
  courseId: string,
  moodleKeyQuery: unknown,
  legacyMoodleUrlQuery: unknown,
): string {
  const moodleKey = getQueryValue(moodleKeyQuery);
  if (moodleKey) {
    const storedUrl = sessionStorage.getItem(`${MOODLE_URL_STORAGE_PREFIX}${moodleKey}`);
    if (storedUrl) return storedUrl;
  }

  if (courseId) {
    const latestUrl = sessionStorage.getItem(`${MOODLE_URL_STORAGE_PREFIX}latest:${courseId}`);
    if (latestUrl) return latestUrl;
  }

  return getQueryValue(legacyMoodleUrlQuery);
}
