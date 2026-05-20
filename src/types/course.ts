export type DeliveryMode = 'Online' | 'Onsite' | 'Self-Paced Learning';
export type CourseStatus = 'ประกาศนียบัตร' | 'สะสมหน่วยกิต' | 'เปิดรับสมัคร';

export interface CourseCover {
  icon: string;
  accentColor: string;
  backgroundColor: string;
}

export interface Course {
  id: string;
  code: string;
  moodleId?: number;
  title: string;
  titleEn?: string;
  instructorId?: string;
  instructorEmail?: string;
  imageUrl: string;
  cover: CourseCover;
  registrationStart: string;
  registrationStartEn?: string;
  registrationEnd: string;
  registrationEndEn?: string;
  registrationStartDate: string;
  registrationEndDate: string;
  price: number;
  isFree: boolean;
  views: number;
  status: CourseStatus;
  deliveryModes: DeliveryMode[];
  isActive: boolean;
  faculty: string;
  facultyEn?: string;
  category: string;
  categoryEn?: string;
  maxSeats: number;
  enrolledCount: number;
  totalHours?: number;
  evaluation?: { id: number; name: string | null; other: string | null } | null;
}
