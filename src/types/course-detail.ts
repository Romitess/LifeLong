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
}
