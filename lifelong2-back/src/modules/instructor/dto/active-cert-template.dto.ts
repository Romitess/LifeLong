export interface CertLayoutFieldDto {
  top: number;
  left: number;
  fontSize: number;
  color: string;
  align: 'left' | 'center' | 'right';
  bold: boolean;
}

export interface CertLayoutDto {
  recipient: CertLayoutFieldDto;
  course: CertLayoutFieldDto;
  date: CertLayoutFieldDto;
}

export class ActiveCertTemplateDto {
  id: number;
  name: string;
  url: string | null;
  layout: CertLayoutDto | null;
}
