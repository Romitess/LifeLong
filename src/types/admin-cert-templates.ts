export interface AdminCertTemplateItem {
  id: number;
  name: string;
  filename: string | null;
  imgSize: string | null;
  imgType: string | null;
  path: string | null;
  url: string | null;
  status: string;
}

export interface AdminCertTemplatesPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AdminCertTemplatesResponse {
  items: AdminCertTemplateItem[];
  pagination: AdminCertTemplatesPagination;
}
