import { ref } from 'vue';
import { api } from 'src/boot/axios';
import type { CourseModule, CourseSubsection, Lesson } from 'src/data/course-structure';
import { getMoodleModuleTypeConfig } from 'src/utils/moodle-module-registry';

interface MoodleModule {
  id: number;
  name: string;
  modname: string;
  url?: string;
  /** For modname='subsection': JSON like {"sectionid":226} linking to the delegate section. */
  customdata?: string;
}

interface MoodleSection {
  id: number;
  section?: number;
  name: string;
  summary?: string;
  /** 'mod_subsection' for subsection delegate sections. */
  component?: string | null;
  modules: MoodleModule[];
}

const DEFAULT_MODULE_CONFIG = { icon: 'open_in_new', type: 'article' as const };

function getSectionColor(modules: MoodleModule[]): string {
  const countable = modules.filter((m) => m.modname !== 'label');
  if (!countable.length) return 'grey';

  const modnames = countable.map((m) => m.modname);
  if (modnames.some((n) => n === 'assign')) return 'deep-orange';
  if (modnames.some((n) => n === 'quiz' || n === 'choice' || n === 'workshop')) return 'teal';
  if (modnames.some((n) => n === 'forum' || n === 'chat')) return 'info';
  if (modnames.some((n) => n === 'scorm' || n === 'h5pactivity')) return 'purple';
  return 'blue';
}

function getSectionIcon(modules: MoodleModule[]): string {
  const countable = modules.filter((m) => m.modname !== 'label');
  if (!countable.length) return 'folder_open';

  const modnames = countable.map((m) => m.modname);
  if (modnames.some((n) => n === 'assign')) return 'upload_file';
  if (modnames.some((n) => n === 'quiz' || n === 'choice' || n === 'workshop'))
    return getMoodleModuleTypeConfig('quiz').icon;
  return getMoodleModuleTypeConfig(modnames[0]).icon || DEFAULT_MODULE_CONFIG.icon;
}

function mapLesson(mod: MoodleModule): Lesson {
  const cfg = getMoodleModuleTypeConfig(mod.modname);
  return {
    title: mod.name,
    type: cfg.type || DEFAULT_MODULE_CONFIG.type,
    icon: cfg.icon || DEFAULT_MODULE_CONFIG.icon,
    duration: '',
    ...(mod.url !== undefined ? { moodleUrl: mod.url } : {}),
    moodleModuleId: mod.id,
    moodleModname: mod.modname,
  };
}

function subsectionId(mod: MoodleModule): number {
  try {
    return Number((JSON.parse(mod.customdata ?? '{}') as { sectionid?: number }).sectionid) || 0;
  } catch {
    return 0;
  }
}

function mapSections(sections: MoodleSection[]): CourseModule[] {
  // Subsection delegate sections (component='mod_subsection') are nested under their
  // parent chapter, not shown as top-level sections. Index them by section id.
  const subsectionById = new Map<number, MoodleSection>();
  sections.forEach((s) => {
    if (s.component === 'mod_subsection') subsectionById.set(s.id, s);
  });

  return sections
    .filter((s) => s.component !== 'mod_subsection')
    .map((section, idx): CourseModule => {
      const directLessons: Lesson[] = [];
      const subsections: CourseSubsection[] = [];

      (section.modules ?? []).forEach((mod) => {
        const modConfig = getMoodleModuleTypeConfig(mod.modname);
        if (modConfig.decision === 'skip') return;
        if (mod.modname === 'subsection') {
          const sub = subsectionById.get(subsectionId(mod));
          if (sub) {
            subsections.push({
              title: sub.name || 'หัวข้อย่อย',
              lessons: (sub.modules ?? [])
                .filter((m) => getMoodleModuleTypeConfig(m.modname).decision !== 'skip')
                .map(mapLesson),
            });
          }
          return;
        }
        directLessons.push(mapLesson(mod));
      });

      return {
        title: section.name || `ส่วนที่ ${idx + 1}`,
        icon: getSectionIcon(section.modules ?? []),
        color: getSectionColor(section.modules ?? []),
        ...(section.summary ? { summary: section.summary } : {}),
        lessons: directLessons,
        ...(subsections.length ? { subsections } : {}),
      };
    })
    .filter((m) => m.lessons.length > 0 || (m.subsections?.length ?? 0) > 0 || m.title);
}

export function useMoodleCourseContents() {
  const sections = ref<CourseModule[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchSections(moodleCourseId: number | string): Promise<void> {
    loading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<MoodleSection[]>(
        `/api/moodle/moodle-contents/${moodleCourseId}`,
      );
      sections.value = mapSections(data);
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e);
      sections.value = [];
    } finally {
      loading.value = false;
    }
  }

  return { sections, loading, error, fetchSections };
}
