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

export class AdminCertTemplateItemDto {
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

export class AdminCertTemplatesPaginationDto {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export class AdminCertTemplatesResponseDto {
  items: AdminCertTemplateItemDto[];
  pagination: AdminCertTemplatesPaginationDto;
}
