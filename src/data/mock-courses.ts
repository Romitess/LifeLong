import type { Course } from 'src/types/course';
import type { CourseDetail } from 'src/types/course-detail';

type CourseDetailContent = Omit<CourseDetail, keyof Course>;

export const DEMO_INSTRUCTOR_ID = '1';
export const DEMO_INSTRUCTOR_EMAIL = 'instructor@example.com';
export const DEMO_INSTRUCTOR_1_ID = 'mock-instructor-teach1-user';
export const DEMO_INSTRUCTOR_1_EMAIL = 'teach1@go.buu.ac.th';

type MockCourseInstructorOwner = Pick<Course, 'instructorId' | 'instructorEmail'>;

const MOCK_COURSE_INSTRUCTOR_OWNERS: Record<string, MockCourseInstructorOwner> = {
  '1': { instructorId: DEMO_INSTRUCTOR_ID, instructorEmail: DEMO_INSTRUCTOR_EMAIL },
  '2': { instructorId: DEMO_INSTRUCTOR_ID, instructorEmail: DEMO_INSTRUCTOR_EMAIL },
  '3': { instructorId: DEMO_INSTRUCTOR_ID, instructorEmail: DEMO_INSTRUCTOR_EMAIL },
  '5': { instructorId: DEMO_INSTRUCTOR_ID, instructorEmail: DEMO_INSTRUCTOR_EMAIL },
  '6': { instructorId: DEMO_INSTRUCTOR_ID, instructorEmail: DEMO_INSTRUCTOR_EMAIL },
  '7': { instructorId: DEMO_INSTRUCTOR_ID, instructorEmail: DEMO_INSTRUCTOR_EMAIL },
  '9': { instructorId: DEMO_INSTRUCTOR_ID, instructorEmail: DEMO_INSTRUCTOR_EMAIL },
  '11': { instructorId: DEMO_INSTRUCTOR_ID, instructorEmail: DEMO_INSTRUCTOR_EMAIL },
  '4': { instructorId: DEMO_INSTRUCTOR_1_ID, instructorEmail: DEMO_INSTRUCTOR_1_EMAIL },
  '8': { instructorId: DEMO_INSTRUCTOR_1_ID, instructorEmail: DEMO_INSTRUCTOR_1_EMAIL },
  '10': { instructorId: DEMO_INSTRUCTOR_1_ID, instructorEmail: DEMO_INSTRUCTOR_1_EMAIL },
  '12': { instructorId: DEMO_INSTRUCTOR_1_ID, instructorEmail: DEMO_INSTRUCTOR_1_EMAIL },
  '13': { instructorId: DEMO_INSTRUCTOR_ID, instructorEmail: DEMO_INSTRUCTOR_EMAIL },
  '14': { instructorId: DEMO_INSTRUCTOR_ID, instructorEmail: DEMO_INSTRUCTOR_EMAIL },
  '15': { instructorId: DEMO_INSTRUCTOR_ID, instructorEmail: DEMO_INSTRUCTOR_EMAIL },
  '16': { instructorId: DEMO_INSTRUCTOR_ID, instructorEmail: DEMO_INSTRUCTOR_EMAIL },
};

export function getMockCourseInstructorOwner(courseId: string): MockCourseInstructorOwner | null {
  return MOCK_COURSE_INSTRUCTOR_OWNERS[courseId] ?? null;
}

function applyMockCourseInstructorOwner(course: Course): Course {
  const owner = getMockCourseInstructorOwner(course.id);
  return owner ? { ...course, ...owner } : course;
}

const BASE_MOCK_COURSES: Course[] = [
  {
    id: '1',
    code: 'C69253001',
    title: 'อัญมณีไทยกับโหราศาสตร์ (Thai Astrology and Gemstones)',
    imageUrl:
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
    cover: {
      icon: 'diamond',
      accentColor: '#f5a623',
      backgroundColor: '#46305d',
    },
    registrationStart: '10 เม.ย.',
    registrationStartEn: '10 Apr',
    registrationEnd: '3 พ.ค. 2569',
    registrationEndEn: '3 May 2026',
    registrationStartDate: '2026-04-10',
    registrationEndDate: '2026-05-03',
    price: 888,
    isFree: false,
    views: 372,
    status: 'ประกาศนียบัตร',
    deliveryModes: ['Onsite'],
    isActive: true,
    faculty: 'คณะวิทยาศาสตร์',
    facultyEn: 'Faculty of Science',
    category: 'ภาษาและการสื่อสาร',
    categoryEn: 'Language and Communication',
    maxSeats: 40,
    enrolledCount: 28,
    titleEn: 'Thai Astrology and Gemstones',
  },
  {
    id: '2',
    code: 'C69513001',
    title: 'Canva AI: สร้างสรรค์งานอย่างมืออาชีพในยุค AI (Canva AI: Smart Design, Smart Work)',
    imageUrl:
      'https://images.unsplash.com/photo-1611224923853-80b023f02d71?auto=format&fit=crop&w=1200&q=80',
    cover: {
      icon: 'palette',
      accentColor: '#00a6a6',
      backgroundColor: '#173f5f',
    },
    registrationStart: '24 มี.ค. 2569',
    registrationEnd: '24 มี.ค. 2570',
    registrationStartDate: '2026-03-24',
    registrationEndDate: '2027-03-24',
    price: 0,
    isFree: true,
    views: 573,
    status: 'ประกาศนียบัตร',
    deliveryModes: ['Self-Paced Learning'],
    isActive: true,
    faculty: 'คณะศิลปกรรมศาสตร์',
    facultyEn: 'Faculty of Fine and Applied Arts',
    category: 'คอมพิวเตอร์และเทคโนโลยี',
    categoryEn: 'Computer and Technology',
    maxSeats: 500,
    enrolledCount: 342,
    titleEn: 'Canva AI: Smart Design, Smart Work',
  },
  {
    id: '3',
    code: 'C68513004',
    title: 'สร้างภาพด้วย Recraft.ai ต่อยอดใน Adobe Illustrator',
    imageUrl:
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
    cover: {
      icon: 'auto_awesome',
      accentColor: '#f97316',
      backgroundColor: '#24445c',
    },
    registrationStart: '29 ก.ค. 2568',
    registrationEnd: '29 ก.ค. 2569',
    registrationStartDate: '2025-07-29',
    registrationEndDate: '2026-07-29',
    price: 0,
    isFree: true,
    views: 1027,
    status: 'เปิดรับสมัคร',
    deliveryModes: ['Online'],
    isActive: true,
    faculty: 'คณะวิศวกรรมศาสตร์',
    facultyEn: 'Faculty of Engineering',
    category: 'คอมพิวเตอร์และเทคโนโลยี',
    categoryEn: 'Computer and Technology',
    maxSeats: 200,
    enrolledCount: 156,
    titleEn: 'Image Generation with Recraft.ai for Adobe Illustrator',
  },
  {
    id: '4',
    code: 'C68513003',
    title: 'การประยุกต์ใช้ AI ในการทำวิจัย (Application of Artificial Intelligence)',
    imageUrl:
      'https://images.unsplash.com/photo-1507413245164-6160d8298b31?auto=format&fit=crop&w=1200&q=80',
    cover: {
      icon: 'psychology',
      accentColor: '#42a5f5',
      backgroundColor: '#2f4858',
    },
    registrationStart: '21 ก.ค. 2568',
    registrationEnd: '21 ก.ค. 2569',
    registrationStartDate: '2025-07-21',
    registrationEndDate: '2026-07-21',
    price: 0,
    isFree: true,
    views: 1183,
    status: 'สะสมหน่วยกิต',
    deliveryModes: ['Online'],
    isActive: true,
    faculty: 'คณะมนุษยศาสตร์และสังคมศาสตร์',
    facultyEn: 'Faculty of Humanities and Social Sciences',
    category: 'การศึกษาและการฝึกอบรม',
    categoryEn: 'Education and Training',
    maxSeats: 180,
    enrolledCount: 180,
    titleEn: 'Application of Artificial Intelligence in Research',
  },
  {
    id: '5',
    code: 'C69563001',
    title: '[Onsite] การสร้างรายวิชาบนระบบ moocdev (Creating Courses on the moocdev platform)',
    imageUrl:
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
    cover: {
      icon: 'menu_book',
      accentColor: '#7cb342',
      backgroundColor: '#315f4a',
    },
    registrationStart: '12 มี.ค.',
    registrationEnd: '24 เม.ย. 2569',
    registrationStartDate: '2026-03-12',
    registrationEndDate: '2026-04-24',
    price: 0,
    isFree: true,
    views: 864,
    status: 'ประกาศนียบัตร',
    deliveryModes: ['Onsite'],
    isActive: false,
    faculty: 'สำนักคอมพิวเตอร์',
    facultyEn: 'Computer Center',
    category: 'การศึกษาและการฝึกอบรม',
    categoryEn: 'Education and Training',
    maxSeats: 60,
    enrolledCount: 48,
    titleEn: '[Onsite] Creating Courses on the moocdev platform',
  },
  {
    id: '6',
    code: 'C69031009',
    title: '(รุ่น1กลุ่ม1) 30942764 การดำน้ำ (30942764 SCUBA Diving)',
    imageUrl:
      'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&q=80',
    cover: {
      icon: 'scuba_diving',
      accentColor: '#26c6da',
      backgroundColor: '#123c69',
    },
    registrationStart: '27 ม.ค.',
    registrationEnd: '28 มี.ค. 2569',
    registrationStartDate: '2026-01-27',
    registrationEndDate: '2026-03-28',
    price: 14000,
    isFree: false,
    views: 946,
    status: 'สะสมหน่วยกิต',
    deliveryModes: ['Onsite'],
    isActive: false,
    faculty: 'คณะวิทยาศาสตร์การกีฬา',
    facultyEn: 'Faculty of Sport Science',
    category: 'ทักษะชีวิตและการพัฒนาตนเอง',
    categoryEn: 'Life Skills and Personal Development',
    maxSeats: 24,
    enrolledCount: 24,
    titleEn: '(Class 1 Group 1) 30942764 SCUBA Diving',
  },
  {
    id: '7',
    code: 'C69031007',
    title: '(รุ่น1กลุ่ม1) 30322064 เคมีอินทรีย์ (30322064 Organic Chemistry)',
    titleEn: '(Class 1 Group 1) 30322064 Organic Chemistry',
    imageUrl:
      'https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=1200&q=80',
    cover: {
      icon: 'science',
      accentColor: '#ab47bc',
      backgroundColor: '#41436a',
    },
    registrationStart: '27 ม.ค.',
    registrationEnd: '23 เม.ย. 2569',
    registrationStartDate: '2026-01-27',
    registrationEndDate: '2026-04-23',
    price: 2000,
    isFree: false,
    views: 732,
    status: 'สะสมหน่วยกิต',
    deliveryModes: ['Online', 'Onsite'],
    isActive: false,
    faculty: 'คณะวิทยาศาสตร์',
    facultyEn: 'Faculty of Science',
    category: 'คณิตศาสตร์และวิทยาศาสตร์',
    categoryEn: 'Mathematics and Science',
    maxSeats: 80,
    enrolledCount: 64,
  },
  {
    id: '8',
    code: 'C69031006',
    title: '(รุ่น1กลุ่ม1) 30310164 เคมี (30310164 Chemistry)',
    titleEn: '(Class 1 Group 1) 30310164 Chemistry',
    imageUrl:
      'https://images.unsplash.com/photo-1603126857599-f6e157fa2fe6?auto=format&fit=crop&w=1200&q=80',
    cover: {
      icon: 'biotech',
      accentColor: '#ff7043',
      backgroundColor: '#5d3a3a',
    },
    registrationStart: '27 ม.ค.',
    registrationEnd: '31 มี.ค. 2569',
    registrationStartDate: '2026-01-27',
    registrationEndDate: '2026-03-31',
    price: 2500,
    isFree: false,
    views: 689,
    status: 'สะสมหน่วยกิต',
    deliveryModes: ['Onsite'],
    isActive: false,
    faculty: 'คณะวิทยาศาสตร์',
    facultyEn: 'Faculty of Science',
    category: 'คณิตศาสตร์และวิทยาศาสตร์',
    categoryEn: 'Mathematics and Science',
    maxSeats: 100,
    enrolledCount: 87,
  },
  {
    id: '9',
    code: 'C69031008',
    title: '(รุ่น1กลุ่ม1) 30520464 จุลชีววิทยาทั่วไป (30520464 General Microbiology)',
    imageUrl:
      'https://images.unsplash.com/photo-1576086213369-97a306d36557?auto=format&fit=crop&w=1200&q=80',
    cover: {
      icon: 'coronavirus',
      accentColor: '#66bb6a',
      backgroundColor: '#244f48',
    },
    registrationStart: '27 ม.ค.',
    registrationEnd: '10 เม.ย. 2569',
    registrationStartDate: '2026-01-27',
    registrationEndDate: '2026-04-10',
    price: 2500,
    isFree: false,
    views: 801,
    status: 'สะสมหน่วยกิต',
    deliveryModes: ['Online'],
    isActive: false,
    faculty: 'คณะวิทยาศาสตร์',
    facultyEn: 'Faculty of Science',
    category: 'สุขภาพและการแพทย์',
    categoryEn: 'Health and Medicine',
    maxSeats: 90,
    enrolledCount: 72,
    titleEn: '(Class 1 Group 1) 30520464 General Microbiology',
  },
  {
    id: '10',
    code: 'C69031005',
    title: '(รุ่น1-3) 31220164 สถิติเบื้องต้นสำหรับวิทยาศาสตร์ (Elementary Statistics for Science)',
    titleEn: '(Class 1-3) 31220164 Elementary Statistics for Science',
    imageUrl:
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80',
    cover: {
      icon: 'query_stats',
      accentColor: '#29b6f6',
      backgroundColor: '#2e5266',
    },
    registrationStart: '27 ม.ค.',
    registrationEnd: '10 เม.ย. 2569',
    registrationStartDate: '2026-01-27',
    registrationEndDate: '2026-04-10',
    price: 2500,
    isFree: false,
    views: 914,
    status: 'สะสมหน่วยกิต',
    deliveryModes: ['Online'],
    isActive: false,
    faculty: 'คณะวิทยาศาสตร์',
    facultyEn: 'Faculty of Science',
    category: 'คณิตศาสตร์และวิทยาศาสตร์',
    categoryEn: 'Mathematics and Science',
    maxSeats: 120,
    enrolledCount: 98,
  },
  {
    id: '11',
    code: 'C69031004',
    title: '(รุ่น1กลุ่ม1) 30211364 แคลคูลัส (30211364 Calculus)',
    titleEn: '(Class 1 Group 1) 30211364 Calculus',
    imageUrl:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80',
    cover: {
      icon: 'functions',
      accentColor: '#ec407a',
      backgroundColor: '#4d375d',
    },
    registrationStart: '27 ม.ค.',
    registrationEnd: '10 เม.ย. 2569',
    registrationStartDate: '2026-01-27',
    registrationEndDate: '2026-04-10',
    price: 2500,
    isFree: false,
    views: 766,
    status: 'สะสมหน่วยกิต',
    deliveryModes: ['Online'],
    isActive: false,
    faculty: 'คณะวิทยาศาสตร์',
    facultyEn: 'Faculty of Science',
    category: 'คณิตศาสตร์และวิทยาศาสตร์',
    categoryEn: 'Mathematics and Science',
    maxSeats: 120,
    enrolledCount: 91,
  },
  {
    id: '12',
    code: 'C69031003',
    title: '(รุ่น1กลุ่ม1) 30222164 คณิตศาสตร์วิศวกรรม 3 (Engineering Mathematics III)',
    imageUrl:
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
    cover: {
      icon: 'architecture',
      accentColor: '#ffa726',
      backgroundColor: '#3e4c59',
    },
    registrationStart: '1 มิ.ย. 2569',
    registrationEnd: '30 มิ.ย. 2569',
    registrationStartDate: '2026-06-01',
    registrationEndDate: '2026-06-30',
    price: 2500,
    isFree: false,
    views: 842,
    status: 'สะสมหน่วยกิต',
    deliveryModes: ['Online', 'Onsite'],
    isActive: false,
    faculty: 'คณะวิศวกรรมศาสตร์',
    facultyEn: 'Faculty of Engineering',
    category: 'วิศวกรรมและสถาปัตยกรรม',
    categoryEn: 'Engineering and Architecture',
    maxSeats: 100,
    enrolledCount: 83,
    titleEn: '(Class 1 Group 1) 30222164 Engineering Mathematics III',
  },
  {
    id: '13',
    code: 'C66021004',
    title: '(รุ่น1) วัฒนธรรมจีน (Chinese Culture)',
    titleEn: '(Class 1) Chinese Culture',
    imageUrl:
      'https://images.unsplash.com/photo-1528697203043-733dafdaa316?auto=format&fit=crop&w=1200&q=80',
    cover: {
      icon: 'temple_buddhist',
      accentColor: '#f44336',
      backgroundColor: '#3e2723',
    },
    registrationStart: '1 พ.ค.',
    registrationStartEn: '1 May',
    registrationEnd: '1 ธ.ค. 2569',
    registrationEndEn: '1 Dec 2026',
    registrationStartDate: '2026-05-01',
    registrationEndDate: '2026-12-01',
    price: 2400,
    isFree: false,
    views: 1404,
    status: 'สะสมหน่วยกิต',
    deliveryModes: ['Online'],
    isActive: true,
    faculty: 'คณะมนุษยศาสตร์และสังคมศาสตร์',
    facultyEn: 'Faculty of Humanities and Social Sciences',
    category: 'ศิลปวัฒนธรรมและศาสนา',
    categoryEn: 'Arts, Culture and Religion',
    maxSeats: 150,
    enrolledCount: 124,
  },
  {
    id: '14',
    code: 'C66021005',
    title: '(รุ่น1กลุ่ม1) อักษรจีนเชิงปริทัศน์ (Analytical Chinese Characters)',
    titleEn: '(Class 1 Group 1) Analytical Chinese Characters',
    imageUrl:
      'https://images.unsplash.com/photo-1505664194779-8beaceb93744?auto=format&fit=crop&w=1200&q=80',
    cover: {
      icon: 'history_edu',
      accentColor: '#4caf50',
      backgroundColor: '#1b5e20',
    },
    registrationStart: '20 ม.ค.',
    registrationEnd: '17 เม.ย. 2569',
    registrationStartDate: '2026-01-20',
    registrationEndDate: '2026-04-17',
    price: 2400,
    isFree: false,
    views: 1263,
    status: 'สะสมหน่วยกิต',
    deliveryModes: ['Online'],
    isActive: true,
    faculty: 'คณะมนุษยศาสตร์และสังคมศาสตร์',
    facultyEn: 'Faculty of Humanities and Social Sciences',
    category: 'ภาษาและการสื่อสาร',
    categoryEn: 'Language and Communication',
    maxSeats: 100,
    enrolledCount: 88,
  },
  {
    id: '15',
    code: 'C66021003',
    title: '(รุ่น1กลุ่ม1) ภาษาจีนกับวัฒนธรรมการสื่อสาร (Chinese for Communication Etiquette)',
    titleEn: '(Class 1 Group 1) Chinese for Communication Etiquette',
    imageUrl:
      'https://images.unsplash.com/photo-1541445966840-79888998188b?auto=format&fit=crop&w=1200&q=80',
    cover: {
      icon: 'chat_bubble',
      accentColor: '#2196f3',
      backgroundColor: '#0d47a1',
    },
    registrationStart: '6 ก.พ.',
    registrationEnd: '10 พ.ค. 2569',
    registrationStartDate: '2026-02-06',
    registrationEndDate: '2026-05-10',
    price: 2400,
    isFree: false,
    views: 1627,
    status: 'สะสมหน่วยกิต',
    deliveryModes: ['Online'],
    isActive: true,
    faculty: 'คณะมนุษยศาสตร์และสังคมศาสตร์',
    facultyEn: 'Faculty of Humanities and Social Sciences',
    category: 'ศิลปวัฒนธรรมและศาสนา',
    categoryEn: 'Arts, Culture and Religion',
    maxSeats: 120,
    enrolledCount: 110,
  },
  {
    id: '16',
    code: 'C66021002',
    title: '(รุ่น1กลุ่ม1) การฟัง-พูดภาษาจีน 1 (Chinese Listening - Speaking I)',
    titleEn: '(Class 1 Group 1) Chinese Listening - Speaking I',
    imageUrl:
      'https://images.unsplash.com/photo-1540317580384-e5d43616b9aa?auto=format&fit=crop&w=1200&q=80',
    cover: {
      icon: 'headset_mic',
      accentColor: '#9c27b0',
      backgroundColor: '#4a148c',
    },
    registrationStart: '8 ธ.ค. 2568',
    registrationEnd: '2 ม.ค. 2569',
    registrationStartDate: '2025-12-08',
    registrationEndDate: '2026-01-02',
    price: 2800,
    isFree: false,
    views: 1046,
    status: 'สะสมหน่วยกิต',
    deliveryModes: ['Onsite'],
    isActive: true,
    faculty: 'คณะมนุษยศาสตร์และสังคมศาสตร์',
    facultyEn: 'Faculty of Humanities and Social Sciences',
    category: 'ภาษาและการสื่อสาร',
    categoryEn: 'Language and Communication',
    maxSeats: 40,
    enrolledCount: 38,
  },
];

export const MOCK_COURSES: Course[] = BASE_MOCK_COURSES.map(applyMockCourseInstructorOwner);

const DEFAULT_PREVIEW_VIDEO_URL = 'https://www.youtube.com/watch?v=AGYgXbt-cq0';

const COURSE_DETAIL_CONTENT: Record<string, CourseDetailContent> = {
  '1': {
    descriptionFull:
      'เรียนรู้ความเชื่อมโยงระหว่างอัญมณีไทย โหราศาสตร์ และการเลือกใช้อัญมณีอย่างเหมาะสม ผ่านทั้งภาคทฤษฎี การดูตัวอย่างจริง และแนวทางประยุกต์ใช้ในชีวิตประจำวันจากผู้เชี่ยวชาญด้านอัญมณีศาสตร์',
    descriptionFullEn:
      'Learn the connection between Thai gemstones, astrology, and appropriate gemstone selection through theory, real samples, and practical application in daily life from gemology experts.',
    objectives: [
      'เข้าใจหลักพื้นฐานของโหราศาสตร์ไทยและอัญมณีประจำดาว',
      'จำแนกอัญมณีไทยชนิดสำคัญและคุณสมบัติเด่นได้',
      'เลือกอัญมณีให้เหมาะกับเป้าหมายการใช้งานและดวงชะตา',
      'ประยุกต์ความรู้เพื่อให้คำแนะนำเบื้องต้นอย่างมีเหตุผล',
    ],
    objectivesEn: [
      'Understand the basic principles of Thai astrology and planetary gemstones',
      'Classify important Thai gemstones and their key properties',
      'Choose gemstones suitable for usage goals and destiny',
      'Apply knowledge to provide basic reasoned advice',
    ],
    targetAudience:
      'บุคคลทั่วไปที่สนใจอัญมณีไทย โหราศาสตร์ และการเลือกเครื่องประดับอย่างมีความหมาย',
    targetAudienceEn:
      'General public interested in Thai gemstones, astrology, and meaningful jewelry selection',
    prerequisites: 'ไม่มี',
    prerequisitesEn: 'None',
    creditHours: 3,
    totalHours: 45,
    certificateType: 'ประกาศนียบัตร',
    certificateTypeEn: 'Certificate',
    contactEmail: 'gem@buu.ac.th',
    contactPhone: '038-102-222 ต่อ 4001',
    previewVideoUrl: 'https://www.youtube.com/watch?v=AGYgXbt-cq0',
    previewPosterUrl:
      'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=1200&q=80',
    department: 'ภาควิชาอัญมณีศาสตร์และเทคโนโลยี',
    departmentEn: 'Department of Gemology and Technology',
    instructor: {
      name: 'ผศ.ดร.สุนีย์ วงศ์สว่าง',
      nameEn: 'Asst. Prof. Sunee Wongsawang, PhD',
      title: 'ผู้ช่วยศาสตราจารย์',
      titleEn: 'Assistant Professor',
      avatarUrl: 'https://i.pravatar.cc/200?img=47',
      department: 'คณะอัญมณี มหาวิทยาลัยบูรพา',
      departmentEn: 'Faculty of Gemology, Burapha University',
    },
    schedules: [
      {
        day: 'วันเสาร์',
        dayEn: 'Saturday',
        time: '09:00 - 12:00',
        room: 'ห้อง GEM-301',
        roomEn: 'Room GEM-301',
      },
      {
        day: 'วันอาทิตย์',
        dayEn: 'Sunday',
        time: '13:00 - 16:00',
        room: 'ห้อง GEM-301',
        roomEn: 'Room GEM-301',
      },
    ],
    syllabus: [
      {
        week: 1,
        topic: 'โหราศาสตร์ไทยเบื้องต้น',
        topicEn: 'Introduction to Thai Astrology',
        description: 'แนวคิดเรื่องดาวนพเคราะห์และธาตุ',
        descriptionEn: 'Concepts of planetary stars and elements',
      },
      {
        week: 2,
        topic: 'อัญมณีไทยและคุณสมบัติ',
        topicEn: 'Thai Gemstones and Properties',
        description: 'การจำแนก สี ความแข็ง และคุณค่าทางการใช้',
        descriptionEn: 'Classification, color, hardness, and usage value',
      },
      {
        week: 3,
        topic: 'อัญมณีกับราศี',
        topicEn: 'Gemstones and Zodiac',
        description: 'หลักการเลือกอัญมณีตามราศีและวันเกิด',
        descriptionEn: 'Principles of selecting gemstones by zodiac and birthday',
      },
      {
        week: 4,
        topic: 'กรณีศึกษา',
        topicEn: 'Case Studies',
        description: 'วิเคราะห์ตัวอย่างจริงและแลกเปลี่ยนแนวทางการเลือกใช้',
        descriptionEn: 'Analyze real examples and exchange selection guidelines',
      },
    ],
  },
  '2': {
    descriptionFull:
      'พัฒนาทักษะการออกแบบด้วย Canva และฟีเจอร์ AI ตั้งแต่การวางเลย์เอาต์ การสร้างภาพ การเขียนข้อความ ไปจนถึงการจัดทำสื่อสำหรับงานเรียน งานประชาสัมพันธ์ และสื่อสังคมออนไลน์',
    descriptionFullEn:
      'Develop design skills with Canva and AI features, from layout design, image generation, writing text, to creating media for education, public relations, and social media.',
    objectives: [
      'ใช้งาน Canva ได้คล่องตั้งแต่พื้นฐานจนถึงเครื่องมือ AI',
      'สร้างงานนำเสนอ อินโฟกราฟิก และสื่อโซเชียลได้อย่างเป็นระบบ',
      'ปรับแต่งสี ฟอนต์ และเลย์เอาต์ให้เหมาะกับผู้ชม',
      'ประยุกต์ AI เพื่อเร่งกระบวนการออกแบบโดยไม่ลดคุณภาพงาน',
    ],
    objectivesEn: [
      'Proficiently use Canva from basics to AI tools',
      'Systematically create presentations, infographics, and social media',
      'Adjust colors, fonts, and layouts to suit the audience',
      'Apply AI to accelerate the design process without reducing quality',
    ],
    targetAudience: 'นิสิต อาจารย์ บุคลากร และบุคคลทั่วไปที่ต้องทำสื่อดิจิทัล',
    targetAudienceEn:
      'Students, faculty, staff, and general public who need to create digital media',
    prerequisites: 'มีคอมพิวเตอร์หรือแท็บเล็ต และสามารถใช้งานเว็บเบราว์เซอร์ได้',
    prerequisitesEn: 'Have a computer or tablet and can use a web browser',
    creditHours: 0,
    totalHours: 15,
    department: 'ภาควิชาเทคโนโลยีสารสนเทศ',
    departmentEn: 'Department of Information Technology',
    instructor: {
      name: 'อ.ดร.พัชรี จันทร์แจ่ม',
      nameEn: 'Dr. Patcharee Chan-chaem',
      title: 'อาจารย์',
      titleEn: 'Lecturer',
      avatarUrl: 'https://i.pravatar.cc/200?img=32',
      department: 'คณะวิทยาการสารสนเทศ มหาวิทยาลัยบูรพา',
      departmentEn: 'Faculty of Informatics, Burapha University',
    },
    schedules: [
      {
        day: 'เรียนด้วยตนเอง',
        dayEn: 'Self-paced',
        time: 'ตลอด 24 ชม.',
        timeEn: '24/7',
        room: 'ระบบ LMS',
        roomEn: 'LMS System',
      },
    ],
    syllabus: [
      {
        week: 1,
        topic: 'เริ่มต้นกับ Canva',
        topicEn: 'Getting Started with Canva',
        description: 'รู้จัก workspace และ template สำคัญ',
        descriptionEn: 'Get to know the workspace and important templates',
      },
      {
        week: 2,
        topic: 'หลักการออกแบบ',
        topicEn: 'Design Principles',
        description: 'สี ฟอนต์ ระยะห่าง และลำดับชั้นของข้อมูล',
        descriptionEn: 'Colors, fonts, spacing, and information hierarchy',
      },
      {
        week: 3,
        topic: 'Canva AI',
        topicEn: 'Canva AI',
        description: 'Magic Design, Magic Write และ Text to Image',
        descriptionEn: 'Magic Design, Magic Write, and Text to Image',
      },
      {
        week: 4,
        topic: 'สื่อสำหรับงานจริง',
        topicEn: 'Real-world Media',
        description: 'สร้างชุดงานนำเสนอและคอนเทนต์โซเชียล',
        descriptionEn: 'Create presentation sets and social content',
      },
    ],
    certificateType: 'ประกาศนียบัตร',
    certificateTypeEn: 'Certificate',
    contactEmail: 'informatics@buu.ac.th',
    contactPhone: '038-102-222 ต่อ 5001',
  },
  '3': {
    descriptionFull:
      'หลักสูตรสำหรับผู้ที่ต้องการสร้างภาพ vector และ illustration ด้วย Recraft.ai แล้วนำไฟล์ไปต่อยอดใน Adobe Illustrator ครอบคลุมการเขียน prompt การจัดการไฟล์ และการปรับแต่งชิ้นงานให้พร้อมใช้งานจริง',
    descriptionFullEn:
      'A course for those who want to create vector images and illustrations with Recraft.ai and then use the files in Adobe Illustrator. Covers prompt writing, file management, and fine-tuning pieces for real use.',
    objectives: [
      'ใช้ Recraft.ai สร้างภาพ vector และ illustration ได้อย่างมีทิศทาง',
      'เขียน prompt เพื่อควบคุมสไตล์ สี และองค์ประกอบของภาพ',
      'ส่งออกและปรับแต่งไฟล์ใน Adobe Illustrator ได้ถูกต้อง',
      'จัดทำชิ้นงานกราฟิกที่นำไปใช้ในแบรนด์หรือสื่อประชาสัมพันธ์ได้',
    ],
    objectivesEn: [
      'Use Recraft.ai to create vector images and illustrations with direction',
      'Write prompts to control style, color, and composition',
      'Export and fine-tune files in Adobe Illustrator correctly',
      'Produce graphic pieces that can be used in brands or public relations',
    ],
    targetAudience: 'นักออกแบบ นักการตลาด นิสิต และผู้สนใจงานกราฟิกด้วย AI',
    targetAudienceEn: 'Designers, marketers, students, and those interested in AI graphics',
    prerequisites: 'ควรมีพื้นฐานการใช้คอมพิวเตอร์และความเข้าใจงานกราฟิกเบื้องต้น',
    prerequisitesEn: 'Should have basic computer skills and an understanding of basic graphics',
    creditHours: 0,
    totalHours: 20,
    department: 'ภาควิชาวิทยาการคอมพิวเตอร์',
    departmentEn: 'Department of Computer Science',
    instructor: {
      name: 'อ.ดร.ณัฐพงศ์ สิทธิเดช',
      nameEn: 'Dr. Nattapong Sitthidet',
      title: 'อาจารย์',
      titleEn: 'Lecturer',
      avatarUrl: 'https://i.pravatar.cc/200?img=12',
      department: 'คณะวิทยาการสารสนเทศ มหาวิทยาลัยบูรพา',
      departmentEn: 'Faculty of Informatics, Burapha University',
    },
    schedules: [
      {
        day: 'วันเสาร์',
        dayEn: 'Saturday',
        time: '09:00 - 16:00',
        room: 'ห้อง IT-205 และ Online',
        roomEn: 'Room IT-205 and Online',
      },
    ],
    syllabus: [
      {
        week: 1,
        topic: 'AI Image Generation',
        topicEn: 'AI Image Generation',
        description: 'ภาพรวมเครื่องมือและข้อจำกัดของงานภาพ AI',
        descriptionEn: 'Overview of tools and limitations of AI imagery',
      },
      {
        week: 2,
        topic: 'Prompt สำหรับงานภาพ',
        topicEn: 'Prompts for Visuals',
        description: 'โครงสร้าง prompt และการควบคุมสไตล์',
        descriptionEn: 'Prompt structure and style control',
      },
      {
        week: 3,
        topic: 'Vector Workflow',
        topicEn: 'Vector Workflow',
        description: 'สร้าง icon, logo และ illustration ด้วย Recraft.ai',
        descriptionEn: 'Create icons, logos, and illustrations with Recraft.ai',
      },
      {
        week: 4,
        topic: 'Illustrator Workflow',
        topicEn: 'Illustrator Workflow',
        description: 'ปรับแต่ง layer, path, color และ typography',
        descriptionEn: 'Adjust layers, paths, color, and typography',
      },
    ],
    certificateType: 'ประกาศนียบัตร',
    certificateTypeEn: 'Certificate',
    contactEmail: 'cs@buu.ac.th',
    contactPhone: '038-102-222 ต่อ 5002',
  },
  '4': {
    descriptionFull:
      'เรียนรู้การเลือกใช้ AI เพื่อสนับสนุนงานวิจัย ตั้งแต่การตั้งคำถามวิจัย การค้นวรรณกรรม การจัดการข้อมูล การสรุปผล ไปจนถึงข้อควรระวังด้านจริยธรรมและความน่าเชื่อถือของข้อมูล',
    descriptionFullEn:
      'Learn to use AI to support research, from research questions, literature review, data management, summarization, to ethical considerations and data reliability.',
    objectives: [
      'เลือกเครื่องมือ AI ให้เหมาะกับขั้นตอนต่าง ๆ ของงานวิจัย',
      'ใช้ AI ช่วยค้น สรุป และจัดหมวดหมู่วรรณกรรมได้',
      'ออกแบบ prompt สำหรับวิเคราะห์ข้อมูลและสร้างกรอบแนวคิด',
      'ประเมินความเสี่ยงด้านจริยธรรม อคติ และการอ้างอิงแหล่งข้อมูล',
    ],
    objectivesEn: [
      'Choose AI tools suitable for different stages of research',
      'Use AI to search, summarize, and categorize literature',
      'Design prompts for data analysis and conceptual framework creation',
      'Evaluate ethical risks, biases, and data sourcing',
    ],
    targetAudience: 'นิสิตระดับบัณฑิตศึกษา นักวิจัย อาจารย์ และบุคลากรที่ต้องทำงานวิจัย',
    targetAudienceEn: 'Graduate students, researchers, faculty, and staff involved in research',
    prerequisites: 'ควรมีหัวข้องานวิจัยหรือประเด็นที่ต้องการศึกษา',
    prerequisitesEn: 'Should have a research topic or area of interest',
    creditHours: 0,
    totalHours: 18,
    department: 'ศูนย์พัฒนานวัตกรรมการวิจัย',
    departmentEn: 'Research Innovation Development Center',
    instructor: {
      name: 'รศ.ดร.กิตติพงษ์ นวลประเสริฐ',
      nameEn: 'Assoc. Prof. Kittipong Nualprasert, PhD',
      title: 'รองศาสตราจารย์',
      titleEn: 'Associate Professor',
      avatarUrl: 'https://i.pravatar.cc/200?img=53',
      department: 'บัณฑิตวิทยาลัย มหาวิทยาลัยบูรพา',
      departmentEn: 'Graduate School, Burapha University',
    },
    schedules: [
      {
        day: 'เรียนออนไลน์',
        dayEn: 'Online',
        time: '18:00 - 20:00',
        timeEn: '18:00 - 20:00',
        room: 'Zoom และ LMS',
        roomEn: 'Zoom and LMS',
      },
    ],
    syllabus: [
      {
        week: 1,
        topic: 'AI Literacy for Research',
        topicEn: 'AI Literacy for Research',
        description: 'บทบาทของ AI ในวงจรงานวิจัย',
        descriptionEn: 'The role of AI in the research cycle',
      },
      {
        week: 2,
        topic: 'Literature Review',
        topicEn: 'Literature Review',
        description: 'ค้นและสรุปวรรณกรรมอย่างตรวจสอบได้',
        descriptionEn: 'Search and summarize literature verifiably',
      },
      {
        week: 3,
        topic: 'Data Thinking',
        topicEn: 'Data Thinking',
        description: 'ใช้ AI ช่วยจัดโครงสร้างและตีความข้อมูล',
        descriptionEn: 'Use AI to structure and interpret data',
      },
      {
        week: 4,
        topic: 'Ethics and Integrity',
        topicEn: 'Ethics and Integrity',
        description: 'จริยธรรม การอ้างอิง และการลดอคติ',
        descriptionEn: 'Ethics, citations, and bias reduction',
      },
    ],
    certificateType: 'ประกาศนียบัตร',
    certificateTypeEn: 'Certificate',
    contactEmail: 'research@buu.ac.th',
    contactPhone: '038-102-222 ต่อ 2104',
  },
  '5': {
    descriptionFull:
      'อบรมเชิงปฏิบัติการสำหรับผู้สอนที่ต้องการสร้างรายวิชาบนระบบ moocdev ครอบคลุมการวางโครงสร้างบทเรียน การจัดทำสื่อ การตั้งค่าแบบทดสอบ และการเผยแพร่รายวิชาให้ผู้เรียนเข้าถึงได้จริง',
    descriptionFullEn:
      'Workshop for instructors who want to create courses on the moocdev platform. Covers lesson structure, media production, quiz settings, and course publishing.',
    objectives: [
      'สร้างโครงรายวิชาและหน่วยการเรียนรู้บนระบบ moocdev ได้',
      'อัปโหลดวิดีโอ เอกสาร และกิจกรรมการเรียนรู้ได้ถูกต้อง',
      'ตั้งค่าแบบทดสอบ เกณฑ์ผ่าน และการออกประกาศนียบัตรได้',
      'ตรวจสอบรายวิชาก่อนเผยแพร่และแก้ไขปัญหาเบื้องต้นได้',
    ],
    objectivesEn: [
      'Create course structures and learning units on moocdev',
      'Upload videos, documents, and learning activities correctly',
      'Set up quizzes, passing criteria, and certificate issuance',
      'Verify courses before publishing and solve basic issues',
    ],
    targetAudience: 'อาจารย์ ผู้ช่วยสอน และบุคลากรที่รับผิดชอบการผลิตรายวิชาออนไลน์',
    targetAudienceEn:
      'Instructors, teaching assistants, and staff responsible for online course production',
    prerequisites: 'มีบัญชีผู้ใช้งานระบบ moocdev และมีหัวข้อรายวิชาที่ต้องการสร้าง',
    prerequisitesEn: 'Have a moocdev user account and a course topic to create',
    creditHours: 0,
    totalHours: 12,
    department: 'ศูนย์เทคโนโลยีการศึกษา',
    departmentEn: 'Educational Technology Center',
    instructor: {
      name: 'คุณศิริพร ตั้งวัฒนา',
      nameEn: 'Ms. Siriporn Tangwattana',
      title: 'นักวิชาการคอมพิวเตอร์',
      titleEn: 'Computer Technical Officer',
      avatarUrl: 'https://i.pravatar.cc/200?img=25',
      department: 'สำนักคอมพิวเตอร์ มหาวิทยาลัยบูรพา',
      departmentEn: 'Computer Center, Burapha University',
    },
    schedules: [
      {
        day: 'วันพุธ',
        dayEn: 'Wednesday',
        time: '09:00 - 12:00',
        room: 'ห้อง Training 1',
        roomEn: 'Training Room 1',
      },
      {
        day: 'วันพฤหัสบดี',
        dayEn: 'Thursday',
        time: '09:00 - 12:00',
        room: 'ห้อง Training 1',
        roomEn: 'Training Room 1',
      },
    ],
    syllabus: [
      {
        week: 1,
        topic: 'Course Blueprint',
        topicEn: 'Course Blueprint',
        description: 'ออกแบบผลลัพธ์การเรียนรู้และโครงสร้างบทเรียน',
        descriptionEn: 'Design learning outcomes and lesson structures',
      },
      {
        week: 2,
        topic: 'Content Upload',
        topicEn: 'Content Upload',
        description: 'จัดการวิดีโอ เอกสาร และกิจกรรม',
        descriptionEn: 'Manage videos, documents, and activities',
      },
      {
        week: 3,
        topic: 'Assessment',
        topicEn: 'Assessment',
        description: 'ตั้งค่า quiz, assignment และเกณฑ์ผ่าน',
        descriptionEn: 'Set up quizzes, assignments, and passing criteria',
      },
      {
        week: 4,
        topic: 'Publish Checklist',
        topicEn: 'Publish Checklist',
        description: 'ตรวจสอบรายวิชาและเผยแพร่บนระบบ',
        descriptionEn: 'Verify and publish the course on the system',
      },
    ],
    certificateType: 'ประกาศนียบัตร',
    certificateTypeEn: 'Certificate',
    contactEmail: 'moocdev@buu.ac.th',
    contactPhone: '038-102-222 ต่อ 1808',
  },
  '6': {
    descriptionFull:
      'รายวิชาภาคปฏิบัติด้านการดำน้ำขั้นพื้นฐาน เรียนรู้ความปลอดภัย อุปกรณ์ เทคนิคการสื่อสารใต้น้ำ และการฝึกภาคสนามภายใต้การดูแลของผู้สอนที่ได้รับการรับรอง',
    descriptionFullEn:
      'Practical course on basic SCUBA diving. Learn about safety, equipment, underwater communication techniques, and field training under the supervision of certified instructors.',
    objectives: [
      'เข้าใจหลักความปลอดภัยและข้อจำกัดของการดำน้ำ',
      'ใช้อุปกรณ์ดำน้ำพื้นฐานและตรวจสอบความพร้อมก่อนลงน้ำได้',
      'ฝึกทักษะการลอยตัว การหายใจ และการสื่อสารใต้น้ำ',
      'เตรียมตัวสำหรับการฝึกภาคสนามได้อย่างถูกต้อง',
    ],
    objectivesEn: [
      'Understand safety rules and diving limitations',
      'Use basic diving equipment and perform pre-dive checks',
      'Practice buoyancy, breathing, and underwater communication skills',
      'Correctly prepare for field training sessions',
    ],
    targetAudience: 'นิสิตที่ลงทะเบียนรายวิชาสะสมหน่วยกิตและผู้สนใจทักษะดำน้ำเบื้องต้น',
    targetAudienceEn:
      'Students registered for credit bank and those interested in basic diving skills',
    prerequisites: 'ว่ายน้ำได้ สุขภาพพร้อม และไม่มีข้อจำกัดทางการแพทย์ต่อการดำน้ำ',
    prerequisitesEn: 'Can swim, good health, and no medical restrictions for diving',
    creditHours: 3,
    totalHours: 45,
    department: 'ภาควิชาวิทยาศาสตร์การออกกำลังกาย',
    departmentEn: 'Department of Exercise Science',
    instructor: {
      name: 'อ.ธนกร ภูมิทะเล',
      nameEn: 'Mr. Thanakorn Poomtalay',
      title: 'อาจารย์ผู้สอนดำน้ำ',
      titleEn: 'Diving Instructor',
      avatarUrl: 'https://i.pravatar.cc/200?img=11',
      department: 'คณะวิทยาศาสตร์การกีฬา มหาวิทยาลัยบูรพา',
      departmentEn: 'Faculty of Sport Science, Burapha University',
    },
    schedules: [
      {
        day: 'วันเสาร์',
        dayEn: 'Saturday',
        time: '08:30 - 16:30',
        timeEn: '08:30 - 16:30',
        room: 'สระฝึกดำน้ำ',
        roomEn: 'Diving Pool',
      },
      {
        day: 'ภาคสนาม',
        dayEn: 'Field Trip',
        time: 'ตามประกาศ',
        timeEn: 'TBA',
        room: 'ศูนย์ฝึกภาคทะเล',
        roomEn: 'Marine Training Center',
      },
    ],
    syllabus: [
      {
        week: 1,
        topic: 'Dive Safety',
        topicEn: 'Dive Safety',
        description: 'กฎความปลอดภัยและการวางแผนดำน้ำ',
        descriptionEn: 'Safety rules and dive planning',
      },
      {
        week: 2,
        topic: 'Equipment',
        topicEn: 'Equipment',
        description: 'การเลือก ใช้ และดูแลอุปกรณ์',
        descriptionEn: 'Selecting, using, and maintaining equipment',
      },
      {
        week: 3,
        topic: 'Pool Practice',
        topicEn: 'Pool Practice',
        description: 'ฝึกทักษะพื้นฐานในสระ',
        descriptionEn: 'Practice basic skills in the pool',
      },
      {
        week: 4,
        topic: 'Open Water Prep',
        topicEn: 'Open Water Prep',
        description: 'เตรียมการฝึกภาคสนามและการประเมิน',
        descriptionEn: 'Prepare for field training and assessment',
      },
    ],
    certificateType: 'สะสมหน่วยกิต',
    certificateTypeEn: 'Credit Bank',
    contactEmail: 'sportscience@buu.ac.th',
    contactPhone: '038-102-222 ต่อ 6206',
  },
  '7': {
    descriptionFull:
      'ศึกษาหลักการสำคัญของเคมีอินทรีย์ โครงสร้างและปฏิกิริยาของสารประกอบอินทรีย์ พร้อมฝึกวิเคราะห์กลไกปฏิกิริยาและประยุกต์กับตัวอย่างในงานวิทยาศาสตร์',
    descriptionFullEn:
      'Study key principles of organic chemistry, structures, and reactions of organic compounds, while practicing reaction mechanism analysis and applying it to scientific examples.',
    objectives: [
      'อธิบายโครงสร้างและพันธะของสารประกอบอินทรีย์ได้',
      'จำแนกหมู่ฟังก์ชันและคุณสมบัติที่เกี่ยวข้องได้',
      'วิเคราะห์กลไกปฏิกิริยาอินทรีย์พื้นฐานได้',
      'เชื่อมโยงความรู้กับตัวอย่างในชีววิทยาและวัสดุศาสตร์ได้',
    ],
    objectivesEn: [
      'Explain the structure and bonding of organic compounds',
      'Classify functional groups and their related properties',
      'Analyze basic organic reaction mechanisms',
      'Link knowledge to examples in biology and materials science',
    ],
    targetAudience: 'นิสิตสายวิทยาศาสตร์ สุขภาพ และผู้ที่ต้องการทบทวนเคมีอินทรีย์',
    targetAudienceEn: 'Science and health students and those who want to review organic chemistry',
    prerequisites: 'ผ่านรายวิชาเคมีทั่วไปหรือมีพื้นฐานเคมีระดับมัธยมปลายตอนปลาย',
    prerequisitesEn: 'Passed General Chemistry or have a high school chemistry background',
    creditHours: 3,
    totalHours: 45,
    department: 'ภาควิชาเคมี',
    departmentEn: 'Department of Chemistry',
    instructor: {
      name: 'ผศ.ดร.ปรเมศวร์ อินทร์แก้ว',
      nameEn: 'Asst. Prof. Poramet Inkaew, PhD',
      title: 'ผู้ช่วยศาสตราจารย์',
      titleEn: 'Assistant Professor',
      avatarUrl: 'https://i.pravatar.cc/200?img=15',
      department: 'คณะวิทยาศาสตร์ มหาวิทยาลัยบูรพา',
      departmentEn: 'Faculty of Science, Burapha University',
    },
    schedules: [
      {
        day: 'วันจันทร์',
        dayEn: 'Monday',
        time: '13:00 - 15:00',
        room: 'SCI-410',
        roomEn: 'SCI-410',
      },
      {
        day: 'วันพุธ',
        dayEn: 'Wednesday',
        time: '13:00 - 16:00',
        room: 'Online และ SCI-410',
        roomEn: 'Online and SCI-410',
      },
    ],
    syllabus: [
      {
        week: 1,
        topic: 'Structure and Bonding',
        topicEn: 'Structure and Bonding',
        description: 'พันธะ ไฮบริดไดเซชัน และรูปร่างโมเลกุล',
        descriptionEn: 'Bonding, hybridization, and molecular shape',
      },
      {
        week: 2,
        topic: 'Functional Groups',
        topicEn: 'Functional Groups',
        description: 'หมู่ฟังก์ชันและสมบัติทางกายภาพ',
        descriptionEn: 'Functional groups and physical properties',
      },
      {
        week: 3,
        topic: 'Reaction Mechanisms',
        topicEn: 'Reaction Mechanisms',
        description: 'พื้นฐานกลไกปฏิกิริยาอินทรีย์',
        descriptionEn: 'Basics of organic reaction mechanisms',
      },
      {
        week: 4,
        topic: 'Spectroscopy Basics',
        topicEn: 'Spectroscopy Basics',
        description: 'แนวคิดเบื้องต้นของการพิสูจน์โครงสร้าง',
        descriptionEn: 'Basic concepts of structure verification',
      },
    ],
    certificateType: 'สะสมหน่วยกิต',
    certificateTypeEn: 'Credit Bank',
    contactEmail: 'chemistry@buu.ac.th',
    contactPhone: '038-102-222 ต่อ 3307',
  },
  '8': {
    descriptionFull:
      'ปูพื้นฐานเคมีทั่วไปสำหรับผู้เรียนสายวิทยาศาสตร์ ครอบคลุมโครงสร้างอะตอม พันธะเคมี ปริมาณสารสัมพันธ์ สารละลาย และการทดลองพื้นฐานที่ช่วยให้เข้าใจแนวคิดสำคัญอย่างเป็นระบบ',
    descriptionFullEn:
      'Foundations of general chemistry for science students. Covers atomic structure, chemical bonding, stoichiometry, solutions, and basic experiments to systematically understand key concepts.',
    objectives: [
      'อธิบายโครงสร้างอะตอมและตารางธาตุได้',
      'คำนวณปริมาณสารสัมพันธ์และความเข้มข้นของสารละลายได้',
      'เข้าใจหลักพันธะเคมีและสมบัติของสาร',
      'ปฏิบัติการทดลองพื้นฐานพร้อมบันทึกผลได้ถูกต้อง',
    ],
    objectivesEn: [
      'Explain atomic structure and the periodic table',
      'Calculate stoichiometry and solution concentrations',
      'Understand chemical bonding principles and substance properties',
      'Perform basic experiments and record results correctly',
    ],
    targetAudience: 'นิสิตชั้นปีต้นสายวิทยาศาสตร์ วิศวกรรม และผู้ต้องการเตรียมพื้นฐานเคมี',
    targetAudienceEn:
      'Early-year science and engineering students and those needing chemistry foundations',
    prerequisites: 'มีพื้นฐานคณิตศาสตร์และวิทยาศาสตร์ระดับมัธยมปลาย',
    prerequisitesEn: 'High school level mathematics and science background',
    creditHours: 3,
    totalHours: 45,
    department: 'ภาควิชาเคมี',
    departmentEn: 'Department of Chemistry',
    instructor: {
      name: 'อ.ดร.วิภาวี สุขสว่าง',
      nameEn: 'Dr. Wipawee Suksawang',
      title: 'อาจารย์',
      titleEn: 'Lecturer',
      avatarUrl: 'https://i.pravatar.cc/200?img=5',
      department: 'คณะวิทยาศาสตร์ มหาวิทยาลัยบูรพา',
      departmentEn: 'Faculty of Science, Burapha University',
    },
    schedules: [
      {
        day: 'วันอังคาร',
        dayEn: 'Tuesday',
        time: '09:00 - 12:00',
        timeEn: '09:00 - 12:00',
        room: 'SCI-302',
        roomEn: 'SCI-302',
      },
      {
        day: 'วันศุกร์',
        dayEn: 'Friday',
        time: '09:00 - 12:00',
        timeEn: '09:00 - 12:00',
        room: 'ห้องปฏิบัติการเคมี 2',
        roomEn: 'Chemistry Lab 2',
      },
    ],
    syllabus: [
      {
        week: 1,
        topic: 'Atomic Structure',
        topicEn: 'Atomic Structure',
        description: 'อะตอม ไอโซโทป และตารางธาตุ',
        descriptionEn: 'Atoms, isotopes, and the periodic table',
      },
      {
        week: 2,
        topic: 'Chemical Bonding',
        topicEn: 'Chemical Bonding',
        description: 'พันธะไอออนิก โควาเลนต์ และโลหะ',
        descriptionEn: 'Ionic, covalent, and metallic bonds',
      },
      {
        week: 3,
        topic: 'Stoichiometry',
        topicEn: 'Stoichiometry',
        description: 'สมการเคมีและการคำนวณปริมาณสาร',
        descriptionEn: 'Chemical equations and quantitative calculations',
      },
      {
        week: 4,
        topic: 'Solution Chemistry',
        topicEn: 'Solution Chemistry',
        description: 'สารละลาย กรด-เบส และการไทเทรตเบื้องต้น',
        descriptionEn: 'Solutions, acid-base, and basic titration',
      },
    ],
    certificateType: 'สะสมหน่วยกิต',
    certificateTypeEn: 'Credit Bank',
    contactEmail: 'chemistry@buu.ac.th',
    contactPhone: '038-102-222 ต่อ 3308',
  },
  '9': {
    descriptionFull:
      'แนะนำโลกของจุลชีววิทยา ตั้งแต่ชนิดของจุลินทรีย์ โครงสร้างเซลล์ การเจริญเติบโต การควบคุมจุลินทรีย์ ไปจนถึงบทบาทในสุขภาพ อาหาร สิ่งแวดล้อม และอุตสาหกรรม',
    descriptionFullEn:
      'Introduction to the world of microbiology, from microbial types, cell structure, growth, and control, to their roles in health, food, the environment, and industry.',
    objectives: [
      'จำแนกกลุ่มจุลินทรีย์และลักษณะสำคัญได้',
      'อธิบายการเจริญเติบโตและปัจจัยที่มีผลต่อจุลินทรีย์ได้',
      'เข้าใจเทคนิคพื้นฐานด้านการเพาะเลี้ยงและการย้อมสี',
      'วิเคราะห์บทบาทของจุลินทรีย์ในบริบทสุขภาพและสิ่งแวดล้อมได้',
    ],
    objectivesEn: [
      'Classify microbial groups and their key characteristics',
      'Explain growth and factors affecting microbes',
      'Understand basic techniques in cultivation and staining',
      'Analyze the roles of microbes in health and environmental contexts',
    ],
    targetAudience: 'นิสิตสายวิทยาศาสตร์สุขภาพ วิทยาศาสตร์อาหาร สิ่งแวดล้อม และผู้สนใจจุลชีววิทยา',
    targetAudienceEn: 'Health science, food science, and environmental science students',
    prerequisites: 'ควรมีพื้นฐานชีววิทยาระดับมัธยมปลาย',
    prerequisitesEn: 'High school level biology background',
    creditHours: 3,
    totalHours: 45,
    department: 'ภาควิชาชีววิทยา',
    departmentEn: 'Department of Biology',
    instructor: {
      name: 'รศ.ดร.มณฑา ชีวะดี',
      nameEn: 'Assoc. Prof. Montha Cheewadee, PhD',
      title: 'รองศาสตราจารย์',
      titleEn: 'Associate Professor',
      avatarUrl: 'https://i.pravatar.cc/200?img=49',
      department: 'คณะวิทยาศาสตร์ มหาวิทยาลัยบูรพา',
      departmentEn: 'Faculty of Science, Burapha University',
    },
    schedules: [
      {
        day: 'วันพฤหัสบดี',
        dayEn: 'Thursday',
        time: '09:00 - 12:00',
        room: 'BIO-204 และ Online',
        roomEn: 'BIO-204 and Online',
      },
    ],
    syllabus: [
      {
        week: 1,
        topic: 'Microbial World',
        topicEn: 'Microbial World',
        description: 'กลุ่มจุลินทรีย์และบทบาทในธรรมชาติ',
        descriptionEn: 'Microbial groups and roles in nature',
      },
      {
        week: 2,
        topic: 'Cell Structure',
        topicEn: 'Cell Structure',
        description: 'โครงสร้างเซลล์และการทำงาน',
        descriptionEn: 'Cell structure and function',
      },
      {
        week: 3,
        topic: 'Growth and Control',
        topicEn: 'Growth and Control',
        description: 'การเจริญเติบโตและการควบคุมจุลินทรีย์',
        descriptionEn: 'Microbial growth and control',
      },
      {
        week: 4,
        topic: 'Applied Microbiology',
        topicEn: 'Applied Microbiology',
        description: 'จุลินทรีย์ในอาหาร สุขภาพ และสิ่งแวดล้อม',
        descriptionEn: 'Microbes in food, health, and environment',
      },
    ],
    certificateType: 'สะสมหน่วยกิต',
    certificateTypeEn: 'Credit Bank',
    contactEmail: 'biology@buu.ac.th',
    contactPhone: '038-102-222 ต่อ 3409',
  },
  '10': {
    descriptionFull:
      'เสริมพื้นฐานสถิติสำหรับงานวิทยาศาสตร์ ตั้งแต่การสรุปข้อมูล ความน่าจะเป็น การแจกแจง การประมาณค่า ไปจนถึงการทดสอบสมมติฐาน พร้อมตัวอย่างจากงานวิจัยและการทดลอง',
    descriptionFullEn:
      'Reinforce statistical foundations for science work, from data summarization, probability, distributions, estimation, to hypothesis testing with examples from research and experiments.',
    objectives: [
      'สรุปและนำเสนอข้อมูลด้วยค่าสถิติและกราฟได้เหมาะสม',
      'เข้าใจแนวคิดความน่าจะเป็นและการแจกแจงที่ใช้บ่อย',
      'เลือกใช้การประมาณค่าและการทดสอบสมมติฐานพื้นฐานได้',
      'ตีความผลลัพธ์ทางสถิติในงานวิทยาศาสตร์ได้อย่างระมัดระวัง',
    ],
    objectivesEn: [
      'Appropriately summarize and present data with statistics and graphs',
      'Understand probability concepts and common distributions',
      'Select and use basic estimation and hypothesis testing',
      'Carefully interpret statistical results in scientific work',
    ],
    targetAudience: 'นิสิตสายวิทยาศาสตร์และผู้ต้องใช้สถิติในงานวิจัยหรือการทดลอง',
    targetAudienceEn:
      'Science students and those needing to use statistics in research or experiments',
    prerequisites: 'มีพื้นฐานพีชคณิตและการใช้เครื่องคิดเลขหรือ spreadsheet',
    prerequisitesEn: 'Basic algebra and use of calculators or spreadsheets',
    creditHours: 3,
    totalHours: 45,
    department: 'ภาควิชาคณิตศาสตร์',
    departmentEn: 'Department of Mathematics',
    instructor: {
      name: 'ผศ.ดร.ชลธิชา กิติคุณ',
      nameEn: 'Asst. Prof. Chonthicha Kitikhun, PhD',
      title: 'ผู้ช่วยศาสตราจารย์',
      titleEn: 'Assistant Professor',
      avatarUrl: 'https://i.pravatar.cc/200?img=45',
      department: 'คณะวิทยาศาสตร์ มหาวิทยาลัยบูรพา',
      departmentEn: 'Faculty of Science, Burapha University',
    },
    schedules: [
      {
        day: 'วันพุธ',
        dayEn: 'Wednesday',
        time: '13:00 - 16:00',
        room: 'MATH-201 และ Online',
        roomEn: 'MATH-201 and Online',
      },
    ],
    syllabus: [
      {
        week: 1,
        topic: 'Descriptive Statistics',
        topicEn: 'Descriptive Statistics',
        description: 'การสรุปข้อมูลและการแสดงผลด้วยกราฟ',
        descriptionEn: 'Data summarization and graphical display',
      },
      {
        week: 2,
        topic: 'Probability',
        topicEn: 'Probability',
        description: 'ความน่าจะเป็นและการแจกแจง',
        descriptionEn: 'Probability and distributions',
      },
      {
        week: 3,
        topic: 'Estimation',
        topicEn: 'Estimation',
        description: 'ช่วงความเชื่อมั่นและการประมาณค่า',
        descriptionEn: 'Confidence intervals and estimation',
      },
      {
        week: 4,
        topic: 'Hypothesis Testing',
        topicEn: 'Hypothesis Testing',
        description: 'การทดสอบสมมติฐานและการตีความ p-value',
        descriptionEn: 'Hypothesis testing and p-value interpretation',
      },
    ],
    certificateType: 'สะสมหน่วยกิต',
    certificateTypeEn: 'Credit Bank',
    contactEmail: 'math@buu.ac.th',
    contactPhone: '038-102-222 ต่อ 3510',
  },
  '11': {
    descriptionFull:
      'ทบทวนและฝึกใช้แคลคูลัสเบื้องต้น ครอบคลุมลิมิต อนุพันธ์ อินทิกรัล และการประยุกต์ในปัญหาวิทยาศาสตร์ เพื่อสร้างฐานความเข้าใจสำหรับรายวิชาขั้นสูง',
    descriptionFullEn:
      'Review and practice basic calculus, covering limits, derivatives, integrals, and applications in scientific problems to build a foundation for advanced courses.',
    objectives: [
      'คำนวณลิมิตและอธิบายความต่อเนื่องของฟังก์ชันได้',
      'หาอนุพันธ์และใช้วิเคราะห์อัตราการเปลี่ยนแปลงได้',
      'คำนวณอินทิกรัลพื้นฐานและตีความพื้นที่ใต้กราฟได้',
      'ประยุกต์แคลคูลัสกับโจทย์วิทยาศาสตร์และวิศวกรรมเบื้องต้นได้',
    ],
    objectivesEn: [
      'Calculate limits and explain function continuity',
      'Find derivatives and use them to analyze rates of change',
      'Calculate basic integrals and interpret the area under a graph',
      'Apply calculus to basic science and engineering problems',
    ],
    targetAudience: 'นิสิตสายวิทยาศาสตร์ วิศวกรรม และผู้ต้องการทบทวนแคลคูลัส',
    targetAudienceEn: 'Science and engineering students and those needing to review calculus',
    prerequisites: 'ผ่านคณิตศาสตร์พื้นฐานระดับมัธยมปลาย โดยเฉพาะฟังก์ชันและตรีโกณมิติ',
    prerequisitesEn: 'Passed high school level mathematics, especially functions and trigonometry',
    creditHours: 3,
    totalHours: 45,
    department: 'ภาควิชาคณิตศาสตร์',
    departmentEn: 'Department of Mathematics',
    instructor: {
      name: 'อ.ดร.เอกชัย ลิมปนะ',
      nameEn: 'Dr. Ekachai Limpana',
      title: 'อาจารย์',
      titleEn: 'Lecturer',
      avatarUrl: 'https://i.pravatar.cc/200?img=60',
      department: 'คณะวิทยาศาสตร์ มหาวิทยาลัยบูรพา',
      departmentEn: 'Faculty of Science, Burapha University',
    },
    schedules: [
      {
        day: 'วันจันทร์',
        dayEn: 'Monday',
        time: '09:00 - 12:00',
        room: 'MATH-304 และ Online',
        roomEn: 'MATH-304 and Online',
      },
    ],
    syllabus: [
      {
        week: 1,
        topic: 'Limits',
        topicEn: 'Limits',
        description: 'ลิมิต ความต่อเนื่อง และแนวคิดพื้นฐาน',
        descriptionEn: 'Limits, continuity, and basic concepts',
      },
      {
        week: 2,
        topic: 'Derivatives',
        topicEn: 'Derivatives',
        description: 'อนุพันธ์ กฎการหาอนุพันธ์ และการประยุกต์',
        descriptionEn: 'Derivatives, differentiation rules, and applications',
      },
      {
        week: 3,
        topic: 'Integrals',
        topicEn: 'Integrals',
        description: 'ปริพันธ์ไม่จำกัดเขตและจำกัดเขต',
        descriptionEn: 'Indefinite and definite integrals',
      },
      {
        week: 4,
        topic: 'Applications',
        topicEn: 'Applications',
        description: 'อัตราการเปลี่ยนแปลง พื้นที่ และโจทย์ประยุกต์',
        descriptionEn: 'Rates of change, areas, and applied problems',
      },
    ],
    certificateType: 'สะสมหน่วยกิต',
    certificateTypeEn: 'Credit Bank',
    contactEmail: 'math@buu.ac.th',
    contactPhone: '038-102-222 ต่อ 3511',
  },
  '12': {
    descriptionFull:
      'รายวิชาคณิตศาสตร์วิศวกรรมขั้นต่อเนื่อง เน้นเครื่องมือทางคณิตศาสตร์ที่ใช้ในงานวิเคราะห์ระบบ วิศวกรรม และแบบจำลอง ครอบคลุมสมการเชิงอนุพันธ์ ลาปลาซ และอนุกรมฟูเรียร์',
    descriptionFullEn:
      'Advanced engineering mathematics course focusing on mathematical tools used in system analysis, engineering, and modeling. Covers differential equations, Laplace transforms, and Fourier series.',
    objectives: [
      'แก้สมการเชิงอนุพันธ์พื้นฐานและตีความผลลัพธ์ได้',
      'ใช้ลาปลาซทรานส์ฟอร์มกับปัญหาระบบเชิงเส้นได้',
      'เข้าใจแนวคิดอนุกรมฟูเรียร์และการประยุกต์กับสัญญาณได้',
      'เชื่อมโยงคณิตศาสตร์กับแบบจำลองทางวิศวกรรมได้',
    ],
    objectivesEn: [
      'Solve basic differential equations and interpret results',
      'Use Laplace transforms for linear system problems',
      'Understand Fourier series concepts and signal applications',
      'Link mathematics to engineering models',
    ],
    targetAudience: 'นิสิตวิศวกรรมศาสตร์และผู้ที่ต้องใช้คณิตศาสตร์ขั้นสูงในงานวิเคราะห์ระบบ',
    targetAudienceEn:
      'Engineering students and those needing advanced mathematics for system analysis',
    prerequisites: 'ผ่านแคลคูลัสและคณิตศาสตร์วิศวกรรมระดับพื้นฐาน',
    prerequisitesEn: 'Passed calculus and basic engineering mathematics',
    creditHours: 3,
    totalHours: 45,
    department: 'ภาควิชาวิศวกรรมไฟฟ้าและคอมพิวเตอร์',
    departmentEn: 'Department of Electrical and Computer Engineering',
    instructor: {
      name: 'รศ.ดร.วรุตม์ ภาคภูมิ',
      nameEn: 'Assoc. Prof. Warut Phakphum, PhD',
      title: 'รองศาสตราจารย์',
      titleEn: 'Associate Professor',
      avatarUrl: 'https://i.pravatar.cc/200?img=68',
      department: 'คณะวิศวกรรมศาสตร์ มหาวิทยาลัยบูรพา',
      departmentEn: 'Faculty of Engineering, Burapha University',
    },
    schedules: [
      {
        day: 'วันอังคาร',
        dayEn: 'Tuesday',
        time: '13:00 - 15:00',
        room: 'ENG-502',
        roomEn: 'ENG-502',
      },
      {
        day: 'วันศุกร์',
        dayEn: 'Friday',
        time: '13:00 - 16:00',
        room: 'ENG-502 และ Online',
        roomEn: 'ENG-502 and Online',
      },
    ],
    syllabus: [
      {
        week: 1,
        topic: 'Differential Equations',
        topicEn: 'Differential Equations',
        description: 'สมการเชิงอนุพันธ์อันดับหนึ่งและอันดับสอง',
        descriptionEn: 'First and second-order differential equations',
      },
      {
        week: 2,
        topic: 'Laplace Transform',
        topicEn: 'Laplace Transform',
        description: 'การแปลงลาปลาซและการแก้ระบบเชิงเส้น',
        descriptionEn: 'Laplace transforms and solving linear systems',
      },
      {
        week: 3,
        topic: 'Fourier Series',
        topicEn: 'Fourier Series',
        description: 'อนุกรมฟูเรียร์และการวิเคราะห์สัญญาณ',
        descriptionEn: 'Fourier series and signal analysis',
      },
      {
        week: 4,
        topic: 'Engineering Models',
        topicEn: 'Engineering Models',
        description: 'ตัวอย่างแบบจำลองจากระบบวิศวกรรม',
        descriptionEn: 'Examples of models from engineering systems',
      },
    ],
    certificateType: 'สะสมหน่วยกิต',
    certificateTypeEn: 'Credit Bank',
    contactEmail: 'engineering@buu.ac.th',
    contactPhone: '038-102-222 ต่อ 7103',
  },
  '13': {
    descriptionFull:
      'เรียนรู้ศิลปะ วัฒนธรรม และวิถีชีวิตชาวจีนดั้งเดิมและร่วมสมัย ครอบคลุมตั้งแต่วรรณคดี ปรัชญา จนถึงการเปลี่ยนแปลงของสังคมจีนในปัจจุบัน',
    descriptionFullEn:
      'Learn classical and contemporary Chinese art, culture, and lifestyle, covering literature, philosophy, and modern social changes.',
    objectives: [
      'เข้าใจประวัติศาสตร์และวัฒนธรรมจีนพื้นฐาน',
      'สามารถประยุกต์ความรู้ในด้านการทำงานร่วมกับชาวจีน',
      'วิเคราะห์แนวคิดและค่านิยมที่สะท้อนผ่านศิลปวัฒนธรรมจีนได้',
    ],
    objectivesEn: [
      'Understand basic Chinese history and culture',
      'Apply knowledge when working with Chinese people',
      'Analyze concepts and values reflected through Chinese culture',
    ],
    targetAudience: 'นักศึกษาและบุคคลทั่วไปที่สนใจด้านวัฒนธรรมตะวันออก',
    targetAudienceEn: 'Students and general public interested in Eastern culture',
    prerequisites: 'ไม่มี',
    prerequisitesEn: 'None',
    creditHours: 3,
    totalHours: 45,
    department: 'ภาควิชาภาษาตะวันออก',
    departmentEn: 'Department of Eastern Languages',
    instructor: {
      name: 'ผศ.ดร. ภูรินทร์ ภิรมย์สมบัติ',
      nameEn: 'Asst. Prof. Phurin Phiromsombat',
      title: 'อาจารย์ประจำคณะมนุยศาสตร์และสังคมศาสตร์',
      titleEn: 'Lecturer at Faculty of Humanities and Social Sciences',
      department: 'ภาควิชาภาษาตะวันออก',
      departmentEn: 'Department of Eastern Languages',
      avatarUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    },
    schedules: [],
    syllabus: [],
    certificateType: 'ประกาศนียบัตร',
    certificateTypeEn: 'Certificate',
    contactEmail: 'lll.human@go.buu.ac.th',
    contactPhone: '038-102345',
  },
  '14': {
    descriptionFull:
      'เจาะลึกโครงสร้างและวิวัฒนาการของตัวอักษรจีน ตั้งแต่ยุคโบราณจนถึงปัจจุบัน พร้อมเทคนิคการจำและการเขียนที่ถูกต้อง',
    descriptionFullEn:
      'Deep dive into the structure and evolution of Chinese characters from ancient times to the present, with memory and writing techniques.',
    objectives: [
      'จดจำและเขียนอักษรจีนพื้นฐานได้อย่างถูกต้อง',
      'เข้าใจที่มาและหลักการประกอบอักษร',
      'สามารถวิเคราะห์ลำดับขีดและโครงสร้างอักษรที่ซับซ้อนได้',
    ],
    objectivesEn: [
      'Correctly memorize and write basic Chinese characters',
      'Understand the origins and principles of character formation',
      'Analyze stroke order and complex character structures',
    ],
    targetAudience: 'ผู้เริ่มต้นเรียนภาษาจีนที่ต้องการพื้นฐานที่แข็งแรง',
    targetAudienceEn: 'Beginners in Chinese language seeking a strong foundation',
    prerequisites: 'ไม่มี',
    prerequisitesEn: 'None',
    creditHours: 3,
    totalHours: 45,
    department: 'ภาควิชาภาษาตะวันออก',
    departmentEn: 'Department of Eastern Languages',
    instructor: {
      name: 'ผศ.ดร. ภูรินทร์ ภิรมย์สมบัติ',
      nameEn: 'Asst. Prof. Phurin Phiromsombat',
      title: 'อาจารย์ประจำคณะมนุยศาสตร์และสังคมศาสตร์',
      titleEn: 'Lecturer at Faculty of Humanities and Social Sciences',
      department: 'ภาควิชาภาษาตะวันออก',
      departmentEn: 'Department of Eastern Languages',
      avatarUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    },
    schedules: [],
    syllabus: [],
    certificateType: 'ประกาศนียบัตร',
    certificateTypeEn: 'Certificate',
    contactEmail: 'lll.human@go.buu.ac.th',
    contactPhone: '038-102345',
  },
  '15': {
    descriptionFull:
      'พัฒนาทักษะภาษาจีนที่จำเป็นเพื่อการสื่อสารอย่างมีมารยาทและถูกกาลเทศะในบริบททางสังคมและธุรกิจ',
    descriptionFullEn:
      'Develop essential Chinese language skills for polite and appropriate communication in social and business contexts.',
    objectives: [
      'สื่อสารภาษาจีนในสถานการณ์ต่างๆ ได้อย่างถูกต้องตามวัฒนธรรม',
      'เข้าใจมารยาททางสังคมและธรรมเนียมปฏิบัติของชาวจีน',
      'ใช้ระดับภาษาและคำศัพท์ที่เหมาะสมกับฐานะและสถานการณ์ได้',
    ],
    objectivesEn: [
      'Communicate in Chinese appropriately in various cultural contexts',
      'Understand Chinese social etiquette and customs',
      'Use appropriate language levels and vocabulary for different status and situations',
    ],
    targetAudience: 'นักศึกษาและวัยทำงานที่ต้องติดต่อสื่อสารกับชาวจีน',
    targetAudienceEn: 'Students and professionals who communicate with Chinese people',
    prerequisites: 'พื้นฐานภาษาจีนเบื้องต้น',
    prerequisitesEn: 'Basic Chinese foundation',
    creditHours: 3,
    totalHours: 45,
    department: 'ภาควิชาภาษาตะวันออก',
    departmentEn: 'Department of Eastern Languages',
    instructor: {
      name: 'ศ. เศรษฐพร เรืองเดช',
      nameEn: 'Prof. Sethaporn Ruangdej',
      title: 'ศาสตราจารย์ประจำคณะมนุษยศาสตร์และสังคมศาสตร์',
      titleEn: 'Professor at Faculty of Humanities and Social Sciences',
      department: 'ภาควิชาภาษาตะวันออก',
      departmentEn: 'Department of Eastern Languages',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    schedules: [],
    syllabus: [],
    certificateType: 'ประกาศนียบัตร',
    certificateTypeEn: 'Certificate',
    contactEmail: 'lll.human@go.buu.ac.th',
    contactPhone: '038-102345',
  },
  '16': {
    descriptionFull:
      'ฝึกฝนทักษะการฟังและการพูดภาษาจีนเบื้องต้น เน้นการออกเสียงที่ถูกต้องและการใช้งานในชีวิตประจำวัน',
    descriptionFullEn:
      'Practice basic Chinese listening and speaking skills, focusing on correct pronunciation and daily usage.',
    objectives: [
      'สามารถโต้ตอบภาษาจีนเบื้องต้นได้อย่างมั่นใจ',
      'มีทักษะการฟังที่แม่นยำและเข้าใจบทสนทนาในชีวิตประจำวัน',
      'ออกเสียงพินอิน (Pinyin) ได้อย่างถูกต้อง',
    ],
    objectivesEn: [
      'Confidently interact in basic Chinese',
      'Have accurate listening skills and understand daily conversations',
      'Pronounce Pinyin correctly',
    ],
    targetAudience: 'ผู้ที่ไม่มีพื้นฐานและต้องการเริ่มฝึกพูดภาษาจีน',
    targetAudienceEn: 'Those with no foundation who want to start speaking Chinese',
    prerequisites: 'ไม่มี',
    prerequisitesEn: 'None',
    creditHours: 3,
    totalHours: 45,
    department: 'ภาควิชาภาษาตะวันออก',
    departmentEn: 'Department of Eastern Languages',
    instructor: {
      name: 'ผศ.ดร. ภูรินทร์ ภิรมย์สมบัติ',
      nameEn: 'Asst. Prof. Phurin Phiromsombat',
      title: 'อาจารย์ประจำคณะมนุยศาสตร์และสังคมศาสตร์',
      titleEn: 'Lecturer at Faculty of Humanities and Social Sciences',
      department: 'ภาควิชาภาษาตะวันออก',
      departmentEn: 'Department of Eastern Languages',
      avatarUrl:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80',
    },
    schedules: [],
    syllabus: [],
    certificateType: 'ประกาศนียบัตร',
    certificateTypeEn: 'Certificate',
    contactEmail: 'lll.human@go.buu.ac.th',
    contactPhone: '038-102345',
  },
};

function getCourseDetailContent(courseId: string): CourseDetailContent {
  const content = COURSE_DETAIL_CONTENT[courseId];

  if (!content) {
    throw new Error(`Missing mock course detail content for course id ${courseId}`);
  }

  return content;
}

function createCourseDetails(): Record<string, CourseDetail> {
  return MOCK_COURSES.reduce<Record<string, CourseDetail>>((details, course) => {
    const content = getCourseDetailContent(course.id);

    details[course.id] = {
      ...course,
      ...content,
      previewVideoUrl: content.previewVideoUrl ?? DEFAULT_PREVIEW_VIDEO_URL,
      previewPosterUrl: content.previewPosterUrl ?? course.imageUrl,
      ...(course.instructorId ? { instructorId: course.instructorId } : {}),
      ...(course.instructorEmail ? { instructorEmail: course.instructorEmail } : {}),
      instructor: {
        ...content.instructor,
        ...(course.instructorId ? { userId: course.instructorId } : {}),
        ...(course.instructorEmail ? { email: course.instructorEmail } : {}),
      },
    };
    return details;
  }, {});
}

function getRecommendationScore(currentCourse: CourseDetail, candidate: Course): number {
  let score = 0;

  if (candidate.deliveryModes.some((mode) => currentCourse.deliveryModes.includes(mode))) {
    score += 3;
  }

  if (candidate.status === currentCourse.status) {
    score += 2;
  }

  if (candidate.isFree === currentCourse.isFree) {
    score += 1;
  }

  if (candidate.isActive) {
    score += 1;
  }

  return score;
}

export const MOCK_COURSE_DETAILS: Record<string, CourseDetail> = createCourseDetails();

export function getCourseDetailById(courseId: string): CourseDetail | null {
  return MOCK_COURSE_DETAILS[courseId] ?? null;
}

export function getRecommendedCourses(courseId: string, limit = 4): Course[] {
  const currentCourse = getCourseDetailById(courseId);

  if (!currentCourse) {
    return MOCK_COURSES.slice(0, limit);
  }

  return [...MOCK_COURSES]
    .filter((course) => course.id !== courseId)
    .sort((first, second) => {
      const scoreDiff =
        getRecommendationScore(currentCourse, second) -
        getRecommendationScore(currentCourse, first);

      if (scoreDiff !== 0) {
        return scoreDiff;
      }

      return second.views - first.views;
    })
    .slice(0, limit);
}
