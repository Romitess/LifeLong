import type { User } from 'src/stores/auth-store';
import {
  isLearnerRole,
  readLearnerProgress,
  writeLearnerProgress,
  type LearnerProgressSnapshot,
} from 'src/composables/use-learner-progress';

const LOGIN_CHECK_IN_STORAGE_PREFIX = 'lll:login-check-in:';

export interface LoginCheckInDay {
  checked: boolean;
  isToday: boolean;
  key: string;
  label: string;
}

interface StoredLoginCheckIn {
  checkInDates: string[];
  lastCheckInDate: string | null;
  streakDays: number;
}

export interface LoginCheckInSnapshot {
  days: LoginCheckInDay[];
  isNewCheckIn: boolean;
  streakDays: number;
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

function formatLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseDateParts(value: string): Date | null {
  const [year, month, day] = value.split('-').map((part) => Number(part));
  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

function getDayDifference(left: string, right: string): number {
  const leftDate = parseDateParts(left);
  const rightDate = parseDateParts(right);

  if (!leftDate || !rightDate) {
    return Number.NaN;
  }

  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const diff = leftDate.getTime() - rightDate.getTime();
  return Math.round(diff / millisecondsPerDay);
}

function buildStorageKey(user: User): string {
  return `${LOGIN_CHECK_IN_STORAGE_PREFIX}${user.id}`;
}

function getWeekStart(date: Date): Date {
  const next = new Date(date);
  const day = next.getDay();
  const distance = day === 0 ? -6 : 1 - day;
  next.setDate(next.getDate() + distance);
  next.setHours(0, 0, 0, 0);
  return next;
}

function createEmptyStoredSnapshot(): StoredLoginCheckIn {
  return {
    checkInDates: [],
    lastCheckInDate: null,
    streakDays: 0,
  };
}

function readStoredLoginCheckIn(user: User): StoredLoginCheckIn {
  if (!canUseStorage()) {
    return createEmptyStoredSnapshot();
  }

  try {
    const raw = window.localStorage.getItem(buildStorageKey(user));
    if (!raw) {
      return createEmptyStoredSnapshot();
    }

    const parsed = JSON.parse(raw) as Partial<StoredLoginCheckIn>;
    const dates = Array.isArray(parsed.checkInDates)
      ? parsed.checkInDates.filter((value): value is string => typeof value === 'string')
      : [];

    return {
      checkInDates: dates,
      lastCheckInDate: typeof parsed.lastCheckInDate === 'string' ? parsed.lastCheckInDate : null,
      streakDays:
        typeof parsed.streakDays === 'number' ? Math.max(0, Math.round(parsed.streakDays)) : 0,
    };
  } catch (error) {
    console.warn('Failed to parse login check-in snapshot', error);
    return createEmptyStoredSnapshot();
  }
}

function writeStoredLoginCheckIn(user: User, snapshot: StoredLoginCheckIn): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(buildStorageKey(user), JSON.stringify(snapshot));
}

function syncLearnerProgressStreak(user: User, streakDays: number): void {
  if (!isLearnerRole(user.role)) {
    return;
  }

  const currentProgress: LearnerProgressSnapshot = readLearnerProgress(user);
  writeLearnerProgress(user, {
    ...currentProgress,
    streakDays,
  });
}

function buildWeekDays(checkInDates: string[], todayKey: string): LoginCheckInDay[] {
  const weekLabels = ['M', 'Tu', 'W', 'Th', 'F', 'Sa', 'Su'];
  const checkedSet = new Set(checkInDates);
  const start = getWeekStart(new Date());

  return weekLabels.map((label, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const key = formatLocalDate(date);

    return {
      checked: checkedSet.has(key),
      isToday: key === todayKey,
      key,
      label,
    };
  });
}

export function recordLoginCheckIn(user: User): LoginCheckInSnapshot {
  const todayKey = formatLocalDate(new Date());
  const stored = readStoredLoginCheckIn(user);
  const wasCheckedToday = stored.lastCheckInDate === todayKey;

  let nextStreakDays = stored.streakDays;
  if (!wasCheckedToday) {
    if (stored.lastCheckInDate) {
      const dayDifference = getDayDifference(todayKey, stored.lastCheckInDate);
      nextStreakDays = dayDifference === 1 ? stored.streakDays + 1 : 1;
    } else {
      nextStreakDays = 1;
    }
  }

  const nextDates = Array.from(new Set([...stored.checkInDates, todayKey]))
    .sort()
    .slice(-21);
  const nextStoredSnapshot: StoredLoginCheckIn = {
    checkInDates: nextDates,
    lastCheckInDate: todayKey,
    streakDays: nextStreakDays,
  };

  writeStoredLoginCheckIn(user, nextStoredSnapshot);
  syncLearnerProgressStreak(user, nextStreakDays);

  return {
    days: buildWeekDays(nextDates, todayKey),
    isNewCheckIn: !wasCheckedToday,
    streakDays: nextStreakDays,
  };
}
