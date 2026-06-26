export class AdminCertSignerItemDto {
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

export class AdminCertSignersPaginationDto {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export class AdminCertSignersResponseDto {
  items: AdminCertSignerItemDto[];
  pagination: AdminCertSignersPaginationDto;
}
