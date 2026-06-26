export type MoodleModuleDecision = 'native' | 'unsupported' | 'structural' | 'skip';
export type MoodleLessonType = 'video' | 'article' | 'quiz';

export interface MoodleModuleTypeInfo {
  modname: string;
  label: string;
  icon: string;
  type: MoodleLessonType;
  decision: MoodleModuleDecision;
  reason: string | null;
}

export interface MoodleModuleSsoInfo {
  courseId: number;
  cmid: number;
  url: string | null;
}

export interface MoodleModuleWithDecision {
  id: number;
  name: string;
  modname: string;
  url?: string;
  moduleType: MoodleModuleTypeInfo;
  sso: MoodleModuleSsoInfo | null;
}

export interface MoodleSectionWithDecision {
  id: number;
  name: string;
  summary?: string;
  component?: string | null;
  modules: MoodleModuleWithDecision[];
}

interface RawMoodleModule {
  id: number;
  name?: string;
  modname?: string;
  url?: string;
}

interface RawMoodleSection {
  id: number;
  name?: string;
  summary?: string;
  component?: string | null;
  modules?: RawMoodleModule[];
}

const unsupportedNativePhaseReason =
  'กิจกรรมชนิดนี้มีข้อมูลใน Moodle แต่ยังไม่ได้เปิด viewer native ในแอป';
const unsupportedPlayerReason = 'กิจกรรมชนิดนี้ต้องใช้ player หรือระบบภายนอกของ Moodle';

const MOODLE_MODULE_REGISTRY: Record<string, MoodleModuleTypeInfo> = {
  page: moduleType('page', 'Page', 'article', 'article', 'native'),
  resource: moduleType('resource', 'File', 'insert_drive_file', 'article', 'native'),
  url: moduleType('url', 'URL', 'link', 'article', 'native'),
  folder: moduleType('folder', 'Folder', 'folder', 'article', 'native'),
  label: moduleType('label', 'Label', 'notes', 'article', 'skip'),
  book: moduleType('book', 'Book', 'menu_book', 'article', 'native'),
  subsection: moduleType(
    'subsection',
    'Subsection',
    'subdirectory_arrow_right',
    'article',
    'structural',
  ),
  assign: moduleType('assign', 'Assignment', 'upload_file', 'quiz', 'native'),
  quiz: moduleType('quiz', 'Quiz', 'help_outline', 'quiz', 'native'),
  forum: moduleType('forum', 'Forum', 'forum', 'article', 'native'),
  feedback: moduleType('feedback', 'Feedback', 'rate_review', 'article', 'native'),
  chat: moduleType(
    'chat',
    'Chat',
    'chat',
    'article',
    'unsupported',
    'กิจกรรมชนิดนี้เป็นห้องแชทสดและต้องใช้ runtime ของ Moodle',
  ),
  survey: moduleType(
    'survey',
    'Survey',
    'bar_chart',
    'article',
    'unsupported',
    unsupportedNativePhaseReason,
  ),
  choice: moduleType(
    'choice',
    'Choice',
    'poll',
    'quiz',
    'unsupported',
    unsupportedNativePhaseReason,
  ),
  glossary: moduleType(
    'glossary',
    'Glossary',
    'subject',
    'article',
    'unsupported',
    unsupportedNativePhaseReason,
  ),
  wiki: moduleType(
    'wiki',
    'Wiki',
    'edit_note',
    'article',
    'unsupported',
    unsupportedNativePhaseReason,
  ),
  data: moduleType(
    'data',
    'Database',
    'dataset',
    'article',
    'unsupported',
    unsupportedNativePhaseReason,
  ),
  lesson: moduleType(
    'lesson',
    'Lesson',
    'route',
    'article',
    'unsupported',
    unsupportedNativePhaseReason,
  ),
  workshop: moduleType(
    'workshop',
    'Workshop',
    'group_work',
    'quiz',
    'unsupported',
    unsupportedNativePhaseReason,
  ),
  scorm: moduleType(
    'scorm',
    'SCORM package',
    'slideshow',
    'video',
    'unsupported',
    unsupportedPlayerReason,
  ),
  h5pactivity: moduleType(
    'h5pactivity',
    'H5P activity',
    'play_circle',
    'video',
    'unsupported',
    unsupportedPlayerReason,
  ),
  imscp: moduleType(
    'imscp',
    'IMS content package',
    'inventory_2',
    'article',
    'unsupported',
    unsupportedPlayerReason,
  ),
  lti: moduleType(
    'lti',
    'External tool',
    'open_in_new',
    'article',
    'unsupported',
    unsupportedPlayerReason,
  ),
  bigbluebuttonbn: moduleType(
    'bigbluebuttonbn',
    'BigBlueButton',
    'videocam',
    'video',
    'unsupported',
    unsupportedPlayerReason,
  ),
  qbank: moduleType('qbank', 'Question bank', 'quiz', 'article', 'skip'),
};

function moduleType(
  modname: string,
  label: string,
  icon: string,
  type: MoodleLessonType,
  decision: MoodleModuleDecision,
  reason: string | null = null,
): MoodleModuleTypeInfo {
  return { modname, label, icon, type, decision, reason };
}

export function getMoodleModuleTypeInfo(modname?: string): MoodleModuleTypeInfo {
  if (!modname) {
    return moduleType(
      'unknown',
      'Moodle activity',
      'extension',
      'article',
      'unsupported',
      'กิจกรรมชนิดนี้ยังไม่ได้อยู่ใน registry ของแอป',
    );
  }
  return (
    MOODLE_MODULE_REGISTRY[modname] ??
    moduleType(
      modname,
      'Moodle activity',
      'extension',
      'article',
      'unsupported',
      'กิจกรรมชนิดนี้ยังไม่ได้อยู่ใน registry ของแอป',
    )
  );
}

export function annotateMoodleSections(
  sections: RawMoodleSection[],
  courseId: number,
): MoodleSectionWithDecision[] {
  return sections.map((section) => ({
    ...section,
    name: sanitizePlainText(section.name ?? ''),
    modules: (section.modules ?? []).map((module) => annotateModule(module, courseId)),
  }));
}

function annotateModule(module: RawMoodleModule, courseId: number): MoodleModuleWithDecision {
  const moduleType = getMoodleModuleTypeInfo(module.modname);
  const base = {
    ...module,
    name: sanitizePlainText(module.name ?? ''),
    modname: module.modname ?? '',
    moduleType,
  };

  if (moduleType.decision !== 'unsupported') {
    return { ...base, sso: null };
  }

  return {
    ...base,
    sso: {
      courseId,
      cmid: module.id,
      url: typeof module.url === 'string' ? module.url : null,
    },
  };
}

function sanitizePlainText(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim();
}
