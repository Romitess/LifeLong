import { computed } from 'vue';
import { useAuthStore, type User } from 'src/stores/auth-store';

const LEARNER_PROGRESS_STORAGE_PREFIX = 'lll:learner-progress:';

export interface LearnerProgressSnapshot {
  streakDays: number;
  level: number;
  xp: number;
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

export function isLearnerRole(role: User['role'] | undefined): boolean {
  return role === 'student' || role === 'external' || role === 'staff';
}

function buildMockProgress(user: User): LearnerProgressSnapshot {
  const seed = hashString(`${user.id}:${user.studentId}:${user.email}`);

  return {
    streakDays: 3 + (seed % 9),
    level: 2 + (Math.floor(seed / 13) % 8),
    xp: 900 + (Math.floor(seed / 29) % 26) * 50,
  };
}

function getStoredProgress(user: User): LearnerProgressSnapshot | null {
  if (!canUseStorage()) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(`${LEARNER_PROGRESS_STORAGE_PREFIX}${user.id}`);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<LearnerProgressSnapshot>;
    if (
      typeof parsed.streakDays !== 'number' ||
      typeof parsed.level !== 'number' ||
      typeof parsed.xp !== 'number'
    ) {
      return null;
    }

    return {
      streakDays: Math.max(0, Math.round(parsed.streakDays)),
      level: Math.max(1, Math.round(parsed.level)),
      xp: Math.max(0, Math.round(parsed.xp)),
    };
  } catch (error) {
    console.warn('Failed to parse learner progress from localStorage', error);
    return null;
  }
}

export function readLearnerProgress(user: User): LearnerProgressSnapshot {
  return getStoredProgress(user) ?? buildMockProgress(user);
}

export function writeLearnerProgress(user: User, snapshot: LearnerProgressSnapshot): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(
    `${LEARNER_PROGRESS_STORAGE_PREFIX}${user.id}`,
    JSON.stringify({
      streakDays: Math.max(0, Math.round(snapshot.streakDays)),
      level: Math.max(1, Math.round(snapshot.level)),
      xp: Math.max(0, Math.round(snapshot.xp)),
    }),
  );
}

export function useLearnerProgress() {
  const authStore = useAuthStore();

  const showLearnerProgress = computed<boolean>(
    () => authStore.isLoggedIn && isLearnerRole(authStore.user?.role),
  );

  const learnerProgress = computed<LearnerProgressSnapshot | null>(() => {
    const user = authStore.user;
    if (!user || !isLearnerRole(user.role)) {
      return null;
    }

    return readLearnerProgress(user);
  });

  return {
    learnerProgress,
    showLearnerProgress,
  };
}
