import type { Course } from './course';

export interface Instructor {
  userId?: string;
  email?: string;
  name: string;
  nameEn?: string;
  title: string;
  titleEn?: string;
  avatarUrl: string;
  department: string;
  departmentEn?: string;
}

export interface CourseSchedule {
  day: string;
  dayEn?: string;
  time: string;
  timeEn?: string;
  room: string;
  roomEn?: string;
}

export interface CourseSyllabus {
  week: number;
  topic: string;
  topicEn?: string;
  description: string;
  descriptionEn?: string;
}

export interface CourseTarget {
  id: number;
  targetId: number | null;
  subtargetId: number | null;
  targetName: string | null;
  subtargetName: string | null;
  other: string | null;
  sequence: number | null;
}

export interface EvaluationDetail {
  id: number;
  name: string | null;
  other: string | null;
}

export interface CourseTypeClass {
  typeclassId: number;
  typeclassName: string | null;
  amount: number | null;
  remark: string | null;
}

export interface CourseDetail extends Course {
  descriptionFull: string;
  descriptionFullEn?: string;
  objectives: string[];
  objectivesEn?: string[];
  targetAudience: string;
  targetAudienceEn?: string;
  prerequisites: string;
  prerequisitesEn?: string;
  creditHours: number;
  totalHours?: number;
  maxSeats: number;
  enrolledCount: number;
  department: string;
  departmentEn?: string;
  instructor: Instructor;
  schedules: CourseSchedule[];
  syllabus: CourseSyllabus[];
  certificateType: string;
  certificateTypeEn?: string;
  contactEmail: string;
  contactPhone: string;
  previewVideoUrl?: string;
  previewPosterUrl?: string;
  targets?: CourseTarget[];
  evaluationText?: string | null;
  precondition?: string | null;
  property?: string | null;
  contractName?: string | null;
  contractTel?: string | null;
  contractEmail?: string | null;
  contractUrl?: string | null;
  typeClasses?: CourseTypeClass[] | null;
  privilege?: string | null;
}

export type RegistrationWindowStatus = 'upcoming' | 'open' | 'closed';

export interface EnrollmentAction {
  label: string;
  icon: string;
  color: string;
  disabled: boolean;
}
