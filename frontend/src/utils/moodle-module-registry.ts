import type { Lesson } from 'src/data/course-structure';

export type MoodleModuleDecision = 'native' | 'unsupported' | 'structural' | 'skip';

export interface MoodleModuleTypeConfig {
  modname: string;
  label: string;
  icon: string;
  type: Lesson['type'];
  decision: MoodleModuleDecision;
  reason?: string;
}

const unsupportedNativePhaseReason =
  'กิจกรรมชนิดนี้มีข้อมูลใน Moodle แต่ยังไม่ได้เปิด viewer native ในแอป';
const unsupportedPlayerReason = 'กิจกรรมชนิดนี้ต้องใช้ player หรือระบบภายนอกของ Moodle';

export const MOODLE_MODULE_REGISTRY: Record<string, MoodleModuleTypeConfig> = {
  page: { modname: 'page', label: 'Page', icon: 'article', type: 'article', decision: 'native' },
  resource: {
    modname: 'resource',
    label: 'File',
    icon: 'insert_drive_file',
    type: 'article',
    decision: 'native',
  },
  url: { modname: 'url', label: 'URL', icon: 'link', type: 'article', decision: 'native' },
  folder: {
    modname: 'folder',
    label: 'Folder',
    icon: 'folder',
    type: 'article',
    decision: 'native',
  },
  label: { modname: 'label', label: 'Label', icon: 'notes', type: 'article', decision: 'skip' },
  book: { modname: 'book', label: 'Book', icon: 'menu_book', type: 'article', decision: 'native' },
  subsection: {
    modname: 'subsection',
    label: 'Subsection',
    icon: 'subdirectory_arrow_right',
    type: 'article',
    decision: 'structural',
  },
  assign: {
    modname: 'assign',
    label: 'Assignment',
    icon: 'upload_file',
    type: 'quiz',
    decision: 'native',
  },
  quiz: {
    modname: 'quiz',
    label: 'Quiz',
    icon: 'help_outline',
    type: 'quiz',
    decision: 'native',
  },
  forum: {
    modname: 'forum',
    label: 'Forum',
    icon: 'forum',
    type: 'article',
    decision: 'native',
  },
  feedback: {
    modname: 'feedback',
    label: 'Feedback',
    icon: 'rate_review',
    type: 'article',
    decision: 'native',
  },
  choice: {
    modname: 'choice',
    label: 'Choice',
    icon: 'poll',
    type: 'quiz',
    decision: 'unsupported',
    reason: unsupportedNativePhaseReason,
  },
  chat: {
    modname: 'chat',
    label: 'Chat',
    icon: 'chat',
    type: 'article',
    decision: 'unsupported',
    reason: 'กิจกรรมชนิดนี้เป็นห้องแชทสดและต้องใช้ runtime ของ Moodle',
  },
  survey: {
    modname: 'survey',
    label: 'Survey',
    icon: 'bar_chart',
    type: 'article',
    decision: 'unsupported',
    reason: unsupportedNativePhaseReason,
  },
  glossary: {
    modname: 'glossary',
    label: 'Glossary',
    icon: 'subject',
    type: 'article',
    decision: 'unsupported',
    reason: unsupportedNativePhaseReason,
  },
  wiki: {
    modname: 'wiki',
    label: 'Wiki',
    icon: 'edit_note',
    type: 'article',
    decision: 'unsupported',
    reason: unsupportedNativePhaseReason,
  },
  data: {
    modname: 'data',
    label: 'Database',
    icon: 'dataset',
    type: 'article',
    decision: 'unsupported',
    reason: unsupportedNativePhaseReason,
  },
  lesson: {
    modname: 'lesson',
    label: 'Lesson',
    icon: 'route',
    type: 'article',
    decision: 'unsupported',
    reason: unsupportedNativePhaseReason,
  },
  workshop: {
    modname: 'workshop',
    label: 'Workshop',
    icon: 'group_work',
    type: 'quiz',
    decision: 'unsupported',
    reason: unsupportedNativePhaseReason,
  },
  scorm: {
    modname: 'scorm',
    label: 'SCORM package',
    icon: 'slideshow',
    type: 'video',
    decision: 'unsupported',
    reason: unsupportedPlayerReason,
  },
  h5pactivity: {
    modname: 'h5pactivity',
    label: 'H5P activity',
    icon: 'play_circle',
    type: 'video',
    decision: 'unsupported',
    reason: unsupportedPlayerReason,
  },
  imscp: {
    modname: 'imscp',
    label: 'IMS content package',
    icon: 'inventory_2',
    type: 'article',
    decision: 'unsupported',
    reason: unsupportedPlayerReason,
  },
  lti: {
    modname: 'lti',
    label: 'External tool',
    icon: 'open_in_new',
    type: 'article',
    decision: 'unsupported',
    reason: unsupportedPlayerReason,
  },
  bigbluebuttonbn: {
    modname: 'bigbluebuttonbn',
    label: 'BigBlueButton',
    icon: 'videocam',
    type: 'video',
    decision: 'unsupported',
    reason: unsupportedPlayerReason,
  },
  qbank: {
    modname: 'qbank',
    label: 'Question bank',
    icon: 'quiz',
    type: 'article',
    decision: 'skip',
  },
};

export const DEFAULT_UNSUPPORTED_MODULE: MoodleModuleTypeConfig = {
  modname: 'unknown',
  label: 'Moodle activity',
  icon: 'extension',
  type: 'article',
  decision: 'unsupported',
  reason: 'กิจกรรมชนิดนี้ยังไม่ได้อยู่ใน registry ของแอป',
};

export function getMoodleModuleTypeConfig(modname?: string): MoodleModuleTypeConfig {
  if (!modname) return DEFAULT_UNSUPPORTED_MODULE;
  return MOODLE_MODULE_REGISTRY[modname] ?? { ...DEFAULT_UNSUPPORTED_MODULE, modname };
}
