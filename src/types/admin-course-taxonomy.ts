export interface AdminCourseSubcategory {
  id: number;
  categoryId: number;
  name: string;
  activeFlag: string;
  url: string | null;
  courseCount: number;
  activeCourseCount: number;
}

export interface AdminCourseCategory {
  id: number;
  name: string;
  nameEn: string | null;
  activeFlag: string;
  url: string | null;
  icon: string | null;
  color: string | null;
  courseCount: number;
  activeCourseCount: number;
  subcategories: AdminCourseSubcategory[];
}

export interface AdminCategoryPayload {
  name: string;
  nameEn?: string | undefined;
  activeFlag: string;
  url?: string | undefined;
  icon?: string | undefined;
  color?: string | undefined;
}

export interface AdminSubcategoryPayload {
  categoryId: number;
  name: string;
  activeFlag: string;
  url?: string | undefined;
}
