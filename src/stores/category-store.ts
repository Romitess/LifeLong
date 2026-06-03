import { defineStore } from 'pinia';
import type { ApiCategory, Category } from 'src/types/category';
import { useCourseStore } from 'src/stores/course-store';

export const useCategoryStore = defineStore('category', {
  state: (): {
    apiCategories: ApiCategory[];
    isApiLoaded: boolean;
  } => ({
    apiCategories: [],
    isApiLoaded: false,
  }),

  getters: {
    activeCategories(state): Category[] {
      return state.apiCategories.map((cat, index) => ({
        id: String(cat.id),
        name: cat.name,
        slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
        icon: cat.icon ?? 'school',
        color: cat.color ?? '#1565C0',
        isActive: true,
        displayOrder: index,
        createdAt: '',
        updatedAt: '',
      }));
    },
  },

  actions: {
    // no-op — kept for backward compat with call sites; data loads via loadFromApi()
    init(): void {},

    loadFromApi(apiCategories: ApiCategory[]): void {
      this.apiCategories = apiCategories;
      this.isApiLoaded = true;

      const courseStore = useCourseStore();
      if (courseStore.courses.length > 0) {
        courseStore.courses = courseStore.courses.map((course) => {
          if (course.categoryId) {
            const matched = apiCategories.find((cat) => cat.id === course.categoryId);
            if (matched) {
              return { ...course, category: matched.name, categoryEn: matched.name };
            }
          }
          return course;
        });
      }
    },

    findById(id: string): Category | undefined {
      return this.activeCategories.find((cat) => cat.id === id);
    },

    findByName(name: string): Category | undefined {
      const normalized = name.trim().toLowerCase();
      return this.activeCategories.find((cat) => cat.name.trim().toLowerCase() === normalized);
    },

    isNameTaken(name: string, excludeId?: string): boolean {
      const normalized = name.trim().toLowerCase();
      return this.activeCategories.some(
        (cat) => cat.id !== excludeId && cat.name.trim().toLowerCase() === normalized,
      );
    },

    countCourses(name: string): number {
      const courseStore = useCourseStore();
      return courseStore.courses.filter((course) => course.category === name).length;
    },
  },
});
