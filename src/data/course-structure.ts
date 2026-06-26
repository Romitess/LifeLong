import { useCourseStore } from 'src/stores/course-store';

export interface Lesson {
  title: string;
  type: 'video' | 'article' | 'quiz';
  duration: string;
  /** Material icon resolved from the Moodle module type (modname). Optional for mock structures. */
  icon?: string;
  completed?: boolean;
  moodleUrl?: string;
  moodleModuleId?: number;
  moodleModname?: string;
}

/** A Moodle subsection (mod_subsection) nested under a chapter, with its own lessons. */
export interface CourseSubsection {
  title: string;
  lessons: Lesson[];
}

export interface CourseModule {
  title: string;
  subtitle?: string;
  icon?: string;
  color?: string;
  expanded?: boolean;
  progress?: number;
  /** Moodle section summary HTML (chapter type/hours). */
  summary?: string;
  /** Nested subsections (หัวข้อย่อย) synced as Moodle subsections. */
  subsections?: CourseSubsection[];
  lessons: Lesson[];
}

export const CANVA_COURSE_STRUCTURE: CourseModule[] = [
  {
    title: 'General',
    icon: 'info',
    color: 'info',
    lessons: [
      { title: 'ประกาศจากผู้สอน', type: 'article', duration: '1 นาที' },
      { title: 'กลุ่มพูดคุยแลกเปลี่ยน', type: 'article', duration: '1 นาที' },
    ],
  },
  {
    title: 'แนะนำรายวิชา',
    icon: 'campaign',
    color: 'secondary',
    lessons: [
      { title: 'ภาพรวมของคอร์สเรียน', type: 'video', duration: '5:30 นาที' },
      { title: 'วิธีการเรียนและการประเมินผล', type: 'video', duration: '3 นาที' },
    ],
  },
  {
    title: 'แบบทดสอบก่อนเรียน',
    icon: 'assignment',
    color: 'warning',
    lessons: [{ title: 'Pre-test วัดความรู้พื้นฐาน', type: 'quiz', duration: '15 นาที' }],
  },
  {
    title: 'ตอนที่ 1: บทนำ',
    subtitle: 'ทำความรู้จักกับ AI ในงานออกแบบ',
    icon: 'auto_awesome',
    color: 'primary',
    lessons: [
      { title: 'AI เข้ามาเปลี่ยนวงการออกแบบอย่างไร?', type: 'video', duration: '12:45 นาที' },
      { title: 'Canva AI คืออะไร?', type: 'video', duration: '10:20 นาที' },
    ],
  },
  {
    title: 'ตอนที่ 2: พื้นฐานการเขียน Prompt',
    subtitle: 'ศิลปะการสั่งงาน AI',
    icon: 'edit_note',
    color: 'teal',
    lessons: [
      { title: 'โครงสร้างของ Prompt ที่ดี', type: 'video', duration: '15:10 นาที' },
      // { title: 'คำศัพท์และ Keyword ที่นักออกแบบควรรู้', type: 'article', duration: '8 นาที' },
      { title: 'แบบฝึกหัดการเขียน Prompt', type: 'quiz', duration: '10 นาที' },
    ],
  },
  {
    title: 'ตอนที่ 3: รู้จักเครื่องมือ Canva AI ที่สำคัญ',
    icon: 'construction',
    color: 'deep-orange',
    lessons: [
      { title: 'Magic Studio ภาพรวม', type: 'video', duration: '8:15 นาที' },
      { title: 'Magic Edit & Magic Eraser', type: 'video', duration: '14:20 นาที' },
      { title: 'Magic Expand การขยายภาพเนียนตา', type: 'video', duration: '11:05 นาที' },
    ],
  },
  {
    title: 'ตอนที่ 4: Design - สร้างงานออกแบบดีไซน์อัจฉริยะ',
    icon: 'palette',
    color: 'pink',
    lessons: [
      { title: 'Magic Design สำหรับโซเชียลมีเดีย', type: 'video', duration: '16:30 นาที' },
      { title: 'Magic Design สำหรับงานพรีเซนต์', type: 'video', duration: '18:45 นาที' },
    ],
  },
  {
    title: 'ตอนที่ 5: Image - สร้างและแก้ไขรูปภาพด้วย AI',
    icon: 'image',
    color: 'purple',
    lessons: [
      { title: 'Text to Image สร้างภาพจากจินตนาการ', type: 'video', duration: '20:15 นาที' },
    ],
  },
  {
    title: 'ตอนที่ 6: Doc - สร้างเนื้อหาด้วย Canva Doc',
    icon: 'description',
    color: 'blue',
    lessons: [{ title: 'Magic Write ผู้ช่วยเขียนคอนเทนต์', type: 'video', duration: '12:10 นาที' }],
  },
  {
    title: 'ตอนที่ 7: Code - สร้างโค้ดสื่อโต้ตอบและแบบฟอร์มอัจฉริยะ',
    icon: 'code',
    color: 'cyan',
    lessons: [{ title: 'การสร้าง Dynamic QR Code', type: 'video', duration: '9:30 นาที' }],
  },
  {
    title: 'ตอนที่ 8: Video Clip - สร้างวิดีโออัตโนมัติด้วย AI',
    icon: 'movie',
    color: 'red',
    lessons: [{ title: 'Magic Design for Video', type: 'video', duration: '22:15 นาที' }],
  },
  {
    title: 'แบบทดสอบหลังเรียน',
    icon: 'task_alt',
    color: 'positive',
    lessons: [{ title: 'Post-test วัดผลสัมฤทธิ์ทางการเรียน', type: 'quiz', duration: '20 นาที' }],
  },
  // {
  //   title: 'แบบประเมินรายวิชา',
  //   icon: 'grade',
  //   color: 'amber',
  //   lessons: [
  //     // { title: 'แบบประเมินความพึงพอใจ', type: 'article', duration: '5 นาที' },
  //   ],
  // },
];

export const GEMSTONE_COURSE_STRUCTURE: CourseModule[] = [
  {
    title: 'ข้อมูลทั่วไป',
    icon: 'info',
    color: 'info',
    lessons: [{ title: 'ประกาศรายวิชา', type: 'article', duration: '1 นาที' }],
  },
  {
    title: 'บทที่ 1: โหราศาสตร์ไทยเบื้องต้น',
    icon: 'star',
    color: 'primary',
    lessons: [
      { title: 'ความสำคัญของดวงดาวและธาตุ', type: 'video', duration: '10:00 นาที' },
      { title: 'ดาวนพเคราะห์และกำลังวัน', type: 'video', duration: '15:00 นาที' },
    ],
  },
  {
    title: 'บทที่ 2: อัญมณีไทยและคุณสมบัติ',
    icon: 'diamond',
    color: 'purple',
    lessons: [
      { title: 'ความรู้พื้นฐานเรื่องอัญมณี', type: 'video', duration: '12:30 นาที' },
      { title: 'นพเก้า: อัญมณีมงคลของไทย', type: 'video', duration: '18:45 นาที' },
      { title: 'คลังความรู้อัญมณี', type: 'article', duration: '10 นาที' },
    ],
  },
  {
    title: 'บทที่ 3: การเลือกอัญมณีตามราศี',
    icon: 'auto_awesome',
    color: 'orange',
    lessons: [
      { title: 'อัญมณีเสริมดวงตามราศีเกิด', type: 'video', duration: '20:15 นาที' },
      { title: 'การเลือกอัญมณีให้เหมาะกับวันเกิด', type: 'video', duration: '15:20 นาที' },
      { title: 'แบบทดสอบเรื่องอัญมณีและราศี', type: 'quiz', duration: '15 นาที' },
    ],
  },
  {
    title: 'การประเมินผล',
    icon: 'assignment',
    color: 'positive',
    lessons: [
      { title: 'แบบทดสอบวัดผลสัมฤทธิ์', type: 'quiz', duration: '30 นาที' },
      { title: 'แบบประเมินความพึงพอใจ', type: 'article', duration: '5 นาที' },
    ],
  },
];

export const RECRAFT_COURSE_STRUCTURE: CourseModule[] = [
  {
    title: 'Introduction',
    icon: 'info',
    color: 'info',
    lessons: [{ title: 'Welcome to Recraft Workflow', type: 'video', duration: '2 นาที' }],
  },
  {
    title: 'Module 1: Getting Started with Recraft.ai',
    icon: 'rocket_launch',
    color: 'blue',
    lessons: [
      { title: 'Overview of Recraft.ai Features', type: 'video', duration: '10:45 นาที' },
      { title: 'Understanding Vector Generation', type: 'video', duration: '12:30 นาที' },
    ],
  },
  {
    title: 'Module 2: Mastering Vector Prompts',
    icon: 'edit_note',
    color: 'teal',
    lessons: [
      { title: 'Writing Prompts for Illustration Styles', type: 'video', duration: '15:20 นาที' },
      { title: 'Controlling Color and Detail with AI', type: 'video', duration: '18:10 นาที' },
      { title: 'Recraft AI Style Presets', type: 'video', duration: '5 นาที' },
    ],
  },
  {
    title: 'Module 3: Integration with Adobe Illustrator',
    icon: 'brush',
    color: 'orange',
    lessons: [
      { title: 'Exporting from Recraft to Illustrator', type: 'video', duration: '8:45 นาที' },
      { title: 'Optimizing Paths and Layers', type: 'video', duration: '20:30 นาที' },
      { title: 'Quiz: Workflow Proficiency', type: 'quiz', duration: '15 นาที' },
    ],
  },
  {
    title: 'Final Project',
    icon: 'workspace_premium',
    color: 'gold',
    lessons: [
      { title: 'Project: Brand Identity Design', type: 'video', duration: '60 นาที' },
      { title: 'Course Feedback', type: 'video', duration: '5 นาที' },
    ],
  },
];

export const COURSE_STRUCTURES: Record<string, CourseModule[]> = {
  '1': GEMSTONE_COURSE_STRUCTURE,
  '2': CANVA_COURSE_STRUCTURE,
  '3': RECRAFT_COURSE_STRUCTURE,
};

export function getCourseStructure(courseId: string): CourseModule[] {
  // Use pre-built structure for known courses
  if (COURSE_STRUCTURES[courseId]) {
    return COURSE_STRUCTURES[courseId];
  }

  // For dynamically created courses, build structure from syllabus in the store
  const store = useCourseStore();
  const detail = store.getCourseDetailById(courseId);

  if (detail && detail.syllabus && detail.syllabus.length > 0) {
    return detail.syllabus.map((s) => ({
      title: s.topic,
      subtitle: `สัปดาห์ที่ ${s.week}`,
      icon: 'menu_book',
      color: 'primary',
      lessons: [
        { title: s.description || 'เนื้อหาบทเรียน', type: 'article' as const, duration: '10 นาที' },
      ],
    }));
  }

  // No known structure and no syllabus → return empty so the UI shows a proper
  // empty state instead of a misleading mock course (real content comes from Moodle).
  return [];
}

export function getFlatLessons(structure: CourseModule[]): Lesson[] {
  return structure.reduce<Lesson[]>((acc, module) => [...acc, ...module.lessons], []);
}

export function getNavigation(currentTitle: string, courseId: string) {
  const structure = getCourseStructure(courseId);
  const flat = getFlatLessons(structure);
  const currentIndex = flat.findIndex((l) => l.title === currentTitle);

  return {
    prev: currentIndex > 0 ? flat[currentIndex - 1] : null,
    next: currentIndex < flat.length - 1 ? flat[currentIndex + 1] : null,
  };
}
