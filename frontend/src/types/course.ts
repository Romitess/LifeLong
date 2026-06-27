export type DeliveryMode = 'Online' | 'Onsite' | 'Self-Paced Learning';
export type CourseStatus =
  | 'ประกาศนียบัตร'
  | 'สะสมหน่วยกิต'
  | 'เปิดรับสมัคร'
  | 'ปิดรับสมัคร'
  | 'เร็วๆนี้';

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
  imageCrop?: string | null;
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
  topEnrollmentRank?: number;
  status: CourseStatus;
  deliveryModes: DeliveryMode[];
  isActive: boolean;
  faculty: string;
  facultyEn?: string;
  category: string;
  categoryEn?: string;
  categoryId?: number | undefined;
  maxSeats: number | null;
  enrolledCount: number;
  reviewAverage?: number;
  reviewCount?: number;
  openclassId?: number | null;
  totalHours?: number;
  evaluationText?: string | null;
  updatedAt?: string;
}
