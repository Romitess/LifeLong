import { defineStore } from 'pinia';
import type {
  ApiCategory,
  Category,
  CategoryFormPayload,
  CategoryWithUsage,
} from 'src/types/category';
import { MOCK_CATEGORIES } from 'src/data/mock-categories';
import { useCourseStore } from 'src/stores/course-store';

const STORAGE_KEY = 'lll-categories';

function readStoredCategories(): Category[] | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return null;
  }

  try {
    const parsedValue = JSON.parse(rawValue) as Category[];
    return Array.isArray(parsedValue) ? parsedValue : null;
  } catch {
    return null;
  }
}

function writeStoredCategories(categories: Category[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

function generateCategoryId(): string {
  const timePart = Date.now().toString(36);
  const randomPart = Math.random().toString(36).slice(2, 8);
  return `cat-${timePart}-${randomPart}`;
}

function nowIsoString(): string {
  return new Date().toISOString();
}

function mergeCategoriesWithStored(
  mockCategories: Category[],
  storedCategories: Category[],
): Category[] {
  const mockIds = new Set(mockCategories.map((category) => category.id));
  const storedById = new Map(storedCategories.map((category) => [category.id, category]));

  const merged = mockCategories.map((mockCategory) => {
    const storedCategory = storedById.get(mockCategory.id);
    if (!storedCategory) {
      return mockCategory;
    }

    return {
      ...mockCategory,
      ...storedCategory,
    };
  });

  const userCreated = storedCategories.filter((category) => !mockIds.has(category.id));
  return [...merged, ...userCreated].sort((left, right) => left.displayOrder - right.displayOrder);
}

export const useCategoryStore = defineStore('category', {
  state: (): {
    categories: Category[];
    apiCategories: ApiCategory[];
    isInitialized: boolean;
    isApiLoaded: boolean;
  } => ({
    categories: [],
    apiCategories: [],
    isInitialized: false,
    isApiLoaded: false,
  }),
  getters: {
    sortedCategories(state): Category[] {
      return [...state.categories].sort((left, right) => left.displayOrder - right.displayOrder);
    },
    activeCategories(state): Category[] {
      // หากโหลดจาก API แล้ว ให้ใช้ apiCategories แปลงเป็น Category shape
      if (state.isApiLoaded && state.apiCategories.length > 0) {
        return state.apiCategories.map((cat, index) => ({
          id: String(cat.id),
          name: cat.name,
          slug: cat.name.toLowerCase().replace(/\s+/g, '-'),
          icon: 'school',
          color: '#1565C0',
          isActive: true,
          displayOrder: index,
          createdAt: '',
          updatedAt: '',
        }));
      }
      // Fallback: ใช้ mock data (กรณี backend ไม่พร้อม)
      return state.categories
        .filter((category) => category.isActive)
        .sort((left, right) => left.displayOrder - right.displayOrder);
    },
    categoriesWithUsage(): CategoryWithUsage[] {
      const courseStore = useCourseStore();

      return this.sortedCategories.map((category) => {
        const matchedCourses = courseStore.courses.filter(
          (course) => course.category === category.name,
        );

        return {
          ...category,
          courseCount: matchedCourses.length,
          activeCourseCount: matchedCourses.filter((course) => course.isActive).length,
        };
      });
    },
  },
  actions: {
    init(): void {
      if (this.isInitialized) return;

      const storedCategories = readStoredCategories() ?? [];
      this.categories = mergeCategoriesWithStored(MOCK_CATEGORIES, storedCategories);
      this.isInitialized = true;

      writeStoredCategories(this.categories);
    },
    loadFromApi(apiCategories: ApiCategory[]): void {
      this.apiCategories = apiCategories;
      this.isApiLoaded = true;

      const courseStore = useCourseStore();
      if (courseStore.courses.length > 0) {
        courseStore.courses = courseStore.courses.map((course) => {
          if (course.categoryId) {
            const matched = apiCategories.find((cat) => cat.id === course.categoryId);
            if (matched) {
              return {
                ...course,
                category: matched.name,
                categoryEn: matched.name,
              };
            }
          }
          return course;
        });
      }
    },
    persist(): void {
      writeStoredCategories(this.categories);
    },
    findById(id: string): Category | undefined {
      this.init();
      return this.categories.find((category) => category.id === id);
    },
    findByName(name: string): Category | undefined {
      this.init();
      const normalized = name.trim().toLowerCase();
      return this.categories.find((category) => category.name.trim().toLowerCase() === normalized);
    },
    isNameTaken(name: string, excludeId?: string): boolean {
      this.init();
      const normalized = name.trim().toLowerCase();
      return this.categories.some(
        (category) =>
          category.id !== excludeId && category.name.trim().toLowerCase() === normalized,
      );
    },
    countCourses(name: string): number {
      const courseStore = useCourseStore();
      return courseStore.courses.filter((course) => course.category === name).length;
    },
    create(payload: CategoryFormPayload): Category {
      this.init();

      const timestamp = nowIsoString();
      const nextDisplayOrder =
        this.categories.reduce((max, category) => Math.max(max, category.displayOrder), 0) + 1;

      const category: Category = {
        ...payload,
        id: generateCategoryId(),
        displayOrder: nextDisplayOrder,
        createdAt: timestamp,
        updatedAt: timestamp,
      };

      this.categories = [...this.categories, category];
      this.persist();
      return category;
    },
    update(id: string, payload: CategoryFormPayload): Category | null {
      this.init();

      const target = this.categories.find((category) => category.id === id);
      if (!target) return null;

      const previousName = target.name;
      const updated: Category = {
        ...target,
        ...payload,
        id: target.id,
        displayOrder: target.displayOrder,
        createdAt: target.createdAt,
        updatedAt: nowIsoString(),
      };

      this.categories = this.categories.map((category) =>
        category.id === id ? updated : category,
      );
      this.persist();

      if (previousName !== updated.name) {
        this.syncCoursesAfterRename(previousName, updated.name);
      }

      return updated;
    },
    remove(id: string): boolean {
      this.init();

      const target = this.categories.find((category) => category.id === id);
      if (!target) return false;

      if (this.countCourses(target.name) > 0) {
        return false;
      }

      this.categories = this.categories.filter((category) => category.id !== id);
      this.persist();
      return true;
    },
    toggleActive(id: string): void {
      this.init();
      this.categories = this.categories.map((category) =>
        category.id === id
          ? { ...category, isActive: !category.isActive, updatedAt: nowIsoString() }
          : category,
      );
      this.persist();
    },
    syncCoursesAfterRename(previousName: string, nextName: string): void {
      const courseStore = useCourseStore();

      const affectedCourses = courseStore.courses.filter(
        (course) => course.category === previousName,
      );
      affectedCourses.forEach((course) => {
        courseStore.updateCourse(course.id, { category: nextName });
      });
    },
  },
});
