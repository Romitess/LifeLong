export interface Category {
  id: string;
  name: string;
  nameEn?: string;
  slug: string;
  description?: string;
  descriptionEn?: string;
  icon: string;
  color: string;
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type CategoryFormPayload = Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'displayOrder'>;

export interface CategoryWithUsage extends Category {
  courseCount: number;
  activeCourseCount: number;
}

export interface ApiCategory {
  id: number;
  name: string;
}
