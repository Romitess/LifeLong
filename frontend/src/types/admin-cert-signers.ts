export interface AdminCertSignerItem {
  id: number;
  name: string;
  position: string;
  filename: string | null;
  imgSize: string | null;
  imgType: string | null;
  path: string | null;
  url: string | null;
  status: string;
}

export interface AdminCertSignersPagination {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface AdminCertSignersResponse {
  items: AdminCertSignerItem[];
  pagination: AdminCertSignersPagination;
}
