import type { User } from 'src/stores/auth-store';

export type NotificationType =
  | 'deadline'
  | 'grading'
  | 'activity'
  | 'system'
  | 'course'
  | 'payment';
export type NotificationPriority = 'urgent' | 'normal';

export interface AppNotification {
  id: number;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  course: string;
  time: string;
  dueDate?: string;
  badge: string;
  badgeColor: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  read: boolean;
  action?: string;
}

export const TEACHER_NOTIFICATION_ITEMS: AppNotification[] = [
  {
    id: 1,
    type: 'deadline',
    priority: 'urgent',
    title: 'เหลือเวลาอีก 2 วันก่อนครบกำหนดให้คะแนน',
    message: 'ใบงานวิเคราะห์กรณีศึกษา มีงานที่ส่งแล้ว 9 รายการที่ยังไม่ได้ให้คะแนน',
    course: 'GEM201 การคิดเชิงวิเคราะห์',
    time: 'แจ้งเตือนวันนี้ 09:00',
    dueDate: 'ครบกำหนด 8 พ.ค. 2569',
    badge: 'เร่งด่วน',
    badgeColor: 'negative',
    icon: 'alarm',
    iconBg: '#ffebee',
    iconColor: '#c62828',
    read: false,
    action: '/instructor/grading',
  },
  {
    id: 2,
    type: 'grading',
    priority: 'urgent',
    title: 'มีคำตอบแบบทดสอบรอตรวจ 18 รายการ',
    message: 'แบบทดสอบปลายบทที่ 3 ปิดรับคำตอบแล้ว ผู้สอนสามารถเริ่มตรวจและประกาศคะแนนได้',
    course: 'LLL102 Digital Learning',
    time: '1 ชั่วโมงที่แล้ว',
    dueDate: 'ควรตรวจภายใน 10 พ.ค. 2569',
    badge: 'ให้คะแนน',
    badgeColor: 'warning',
    icon: 'rate_review',
    iconBg: '#fff3e0',
    iconColor: '#ef6c00',
    read: false,
    action: '/instructor/grading',
  },
  {
    id: 3,
    type: 'activity',
    priority: 'normal',
    title: 'นิสิตส่งงานใหม่ 6 รายการ',
    message: 'มีไฟล์รายงานใหม่จากนิสิตในรายวิชาที่กำลังเปิดสอน',
    course: 'SCI305 Research Skills',
    time: '3 ชั่วโมงที่แล้ว',
    badge: 'งานใหม่',
    badgeColor: 'primary',
    icon: 'upload_file',
    iconBg: '#e3f2fd',
    iconColor: '#1565c0',
    read: false,
    action: '/instructor/notifications',
  },
  {
    id: 4,
    type: 'deadline',
    priority: 'normal',
    title: 'ใกล้ถึงวันปิดรับงานโครงงานย่อย',
    message: 'เหลือเวลา 5 วันก่อนปิดรับงาน นิสิต 12 คนยังไม่ได้ส่งงาน',
    course: 'BUS210 Business Model',
    time: 'เมื่อวานนี้',
    dueDate: 'ปิดรับ 11 พ.ค. 2569',
    badge: 'ติดตาม',
    badgeColor: 'info',
    icon: 'event',
    iconBg: '#e8f5e9',
    iconColor: '#2e7d32',
    read: true,
  },
  {
    id: 5,
    type: 'system',
    priority: 'normal',
    title: 'ระบบจะปิดปรับปรุงชั่วคราว',
    message: 'ระบบจัดการรายวิชาจะปิดปรับปรุงเพื่ออัปเดตบริการส่งคะแนน',
    course: 'ประกาศจากระบบ',
    time: '2 วันที่แล้ว',
    dueDate: '7 พ.ค. 2569 เวลา 22:00 - 23:30 น.',
    badge: 'ระบบ',
    badgeColor: 'blue-grey',
    icon: 'info',
    iconBg: '#eceff1',
    iconColor: '#455a64',
    read: true,
  },
];

export const STUDENT_NOTIFICATION_ITEMS: AppNotification[] = [
  {
    id: 101,
    type: 'course',
    priority: 'normal',
    title: 'บทเรียนใหม่เปิดให้เรียนแล้ว',
    message: 'บทที่ 4 Smart Design Workflow พร้อมให้เข้าเรียนและทำกิจกรรมท้ายบท',
    course: 'C69513001 Canva AI',
    time: 'วันนี้ 10:30',
    badge: 'บทเรียนใหม่',
    badgeColor: 'primary',
    icon: 'menu_book',
    iconBg: '#e3f2fd',
    iconColor: '#1565c0',
    read: false,
    action: '/course/2/learn',
  },
  {
    id: 102,
    type: 'deadline',
    priority: 'urgent',
    title: 'ใกล้ครบกำหนดส่งกิจกรรมท้ายบท',
    message: 'กิจกรรมสรุปแนวคิด AI Design ต้องส่งภายใน 2 วัน',
    course: 'C69513001 Canva AI',
    time: '1 ชั่วโมงที่แล้ว',
    dueDate: 'ครบกำหนด 8 พ.ค. 2569',
    badge: 'ต้องส่ง',
    badgeColor: 'negative',
    icon: 'event',
    iconBg: '#ffebee',
    iconColor: '#c62828',
    read: false,
    action: '/course/2/learn',
  },
  {
    id: 103,
    type: 'payment',
    priority: 'normal',
    title: 'ใบเสร็จพร้อมดาวน์โหลด',
    message: 'ใบเสร็จค่าลงทะเบียนรายวิชา Canva AI ออกเรียบร้อยแล้ว',
    course: 'งานทะเบียนและการเงิน',
    time: 'เมื่อวานนี้',
    badge: 'เอกสาร',
    badgeColor: 'info',
    icon: 'receipt_long',
    iconBg: '#fff3e0',
    iconColor: '#ef6c00',
    read: false,
    action: '/profile',
  },
  {
    id: 104,
    type: 'course',
    priority: 'normal',
    title: 'ประกาศจากผู้สอน',
    message: 'ผู้สอนเพิ่มไฟล์ประกอบการเรียนและตัวอย่างงานสำหรับสัปดาห์นี้',
    course: 'C69513001 Canva AI',
    time: '2 วันที่แล้ว',
    badge: 'ประกาศ',
    badgeColor: 'blue-grey',
    icon: 'campaign',
    iconBg: '#e8f5e9',
    iconColor: '#2e7d32',
    read: true,
    action: '/course/2/learn',
  },
  {
    id: 105,
    type: 'system',
    priority: 'normal',
    title: 'ระบบจะปิดปรับปรุงชั่วคราว',
    message: 'ระบบผู้เรียนจะปิดปรับปรุงเพื่อเพิ่มประสิทธิภาพการรับชมบทเรียน',
    course: 'ประกาศจากระบบ',
    time: '2 วันที่แล้ว',
    dueDate: '7 พ.ค. 2569 เวลา 22:00 - 23:30 น.',
    badge: 'ระบบ',
    badgeColor: 'blue-grey',
    icon: 'info',
    iconBg: '#eceff1',
    iconColor: '#455a64',
    read: true,
  },
];

export function isTeachingRole(role: User['role'] | undefined): boolean {
  return role === 'teach' || role === 'instructor';
}

export function getNotificationItemsForRole(role: User['role'] | undefined): AppNotification[] {
  return isTeachingRole(role) ? TEACHER_NOTIFICATION_ITEMS : STUDENT_NOTIFICATION_ITEMS;
}
