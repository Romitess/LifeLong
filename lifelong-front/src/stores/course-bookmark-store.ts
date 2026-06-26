import { acceptHMRUpdate, defineStore } from 'pinia';
import { useAuthStore } from 'src/stores/auth-store';
import type { CourseDetail } from 'src/types/course-detail';

export interface CourseBookmark {
  courseId: string;
  courseCode: string;
  courseTitle: string;
  courseImageUrl: string;
  courseCover: {
    icon: string;
    accentColor: string;
    backgroundColor: string;
  };
  savedAt: string;
  userId: string;
}

interface CourseBookmarkState {
  bookmarks: CourseBookmark[];
}

const STORAGE_KEY = 'lll-course-bookmarks';

function getAuthenticatedUserId(): string | null {
  const authStore = useAuthStore();

  if (!authStore.isLoggedIn || !authStore.user) {
    return null;
  }

  return authStore.user.id;
}

function readStoredBookmarks(): CourseBookmark[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as CourseBookmark[];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function writeStoredBookmarks(bookmarks: CourseBookmark[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
}

export const useCourseBookmarkStore = defineStore('course-bookmark', {
  state: (): CourseBookmarkState => ({
    bookmarks: readStoredBookmarks(),
  }),

  getters: {
    isBookmarked:
      (state) =>
      (courseId: string): boolean => {
        const userId = getAuthenticatedUserId();

        if (!userId) {
          return false;
        }

        return state.bookmarks.some(
          (bookmark) => bookmark.courseId === courseId && bookmark.userId === userId,
        );
      },

    myBookmarks: (state): CourseBookmark[] => {
      const userId = getAuthenticatedUserId();

      if (!userId) {
        return [];
      }

      return state.bookmarks.filter((bookmark) => bookmark.userId === userId);
    },
  },

  actions: {
    bookmarkCourse(course: CourseDetail): void {
      const userId = getAuthenticatedUserId();

      if (!userId) {
        return;
      }

      if (this.isBookmarked(course.id)) {
        return;
      }

      const nextBookmarks: CourseBookmark[] = [
        ...this.bookmarks,
        {
          courseId: course.id,
          courseCode: course.code,
          courseTitle: course.title,
          courseImageUrl: course.imageUrl,
          courseCover: {
            icon: course.cover.icon,
            accentColor: course.cover.accentColor,
            backgroundColor: course.cover.backgroundColor,
          },
          savedAt: new Date().toISOString(),
          userId,
        },
      ];

      this.bookmarks = nextBookmarks;
      writeStoredBookmarks(nextBookmarks);
    },

    removeBookmark(courseId: string): void {
      const userId = getAuthenticatedUserId();

      if (!userId) {
        return;
      }

      const nextBookmarks = this.bookmarks.filter(
        (bookmark) => !(bookmark.courseId === courseId && bookmark.userId === userId),
      );

      this.bookmarks = nextBookmarks;
      writeStoredBookmarks(nextBookmarks);
    },

    toggleBookmark(course: CourseDetail): void {
      if (this.isBookmarked(course.id)) {
        this.removeBookmark(course.id);
      } else {
        this.bookmarkCourse(course);
      }
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCourseBookmarkStore, import.meta.hot));
}
