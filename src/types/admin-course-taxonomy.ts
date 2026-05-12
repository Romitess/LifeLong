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
  activeFlag: string;
  url: string | null;
  courseCount: number;
  activeCourseCount: number;
  subcategories: AdminCourseSubcategory[];
}

export interface AdminCategoryPayload {
  name: string;
  activeFlag: string;
  url?: string | undefined;
}

export interface AdminSubcategoryPayload {
  categoryId: number;
  name: string;
  activeFlag: string;
  url?: string | undefined;
}
