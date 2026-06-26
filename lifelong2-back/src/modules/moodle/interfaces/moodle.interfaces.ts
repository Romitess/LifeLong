export interface MoodleModule {
  id: number;
  name: string;
  modname: string;
  url?: string;
  moduleType?: {
    modname: string;
    label: string;
    icon: string;
    type: 'video' | 'article' | 'quiz';
    decision: 'native' | 'unsupported' | 'structural' | 'skip';
    reason: string | null;
  };
  sso?: {
    courseId: number;
    cmid: number;
    url: string | null;
  } | null;
}

export interface MoodleSection {
  id: number;
  name: string;
  modules: MoodleModule[];
  summary?: string;
  component?: string | null;
}

/**
 * Safe response shape for a single Moodle module's content (Task 3a).
 * Only whitelisted fields are mapped — never expose the raw Moodle payload
 * or the Moodle webservice token.
 */
export interface MoodleModuleFile {
  type: string;
  filename: string;
  fileurl: string;
  mimetype: string | null;
}

export interface MoodleModuleContent {
  id: number;
  name: string;
  modname: string;
  description: string | null;
  contents: MoodleModuleFile[];
  url: string | null;
}

export interface MoodleCourse {
  id: number;
  shortname: string;
  fullname: string;
}

export interface MoodleCourseSearchResult {
  courses: MoodleCourse[];
}

export interface MoodleCreateCourseResult {
  id: number;
  shortname: string;
}

export interface MoodleUser {
  id: number;
  username: string;
  firstname: string;
  lastname: string;
  email: string;
}

export interface MoodleUserSearchResult {
  users: MoodleUser[];
}

export interface MoodleAnnouncement {
  id: number;
  subject: string;
  message: string;
  created: number;
  author: string;
  pinned: boolean;
}

export interface SectionOwnershipInfo {
  sectionId: number;
  sectionNum: number;
  name: string;
  summary: string;
  moduleCount: number;
  hasTeacherContent: boolean;
  /** Moodle section delegate component, e.g. 'mod_subsection' for subsections. */
  component: string | null;
}
