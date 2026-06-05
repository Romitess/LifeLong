export interface CertLayoutField {
  top: number;
  left: number;
  fontSize: number;
  color: string;
  align: 'left' | 'center' | 'right';
  bold: boolean;
}

export interface CertLayout {
  recipient: CertLayoutField;
  course: CertLayoutField;
  date: CertLayoutField;
}

export const DEFAULT_LAYOUT: CertLayout = {
  recipient: { top: 42, left: 50, fontSize: 32, color: '#1a1a1a', align: 'center', bold: true },
  course: { top: 55, left: 50, fontSize: 22, color: '#333333', align: 'center', bold: false },
  date: { top: 82, left: 74, fontSize: 14, color: '#555555', align: 'right', bold: false },
};

export interface AdminCertTemplateItem {
  id: number;
  name: string;
  filename: string | null;
  imgSize: string | null;
  imgType: string | null;
  path: string | null;
  url: string | null;
  status: string;
  layout: CertLayout | null;
}

export interface ActiveCertTemplate {
  id: number;
  name: string;
  url: string | null;
  layout: CertLayout | null;
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
