import { ref } from 'vue';
import { api } from 'src/boot/axios';
import type { CourseModule, Lesson } from 'src/data/course-structure';

interface MoodleModule {
  id: number;
  name: string;
  modname: string;
  url?: string;
}

interface MoodleSection {
  id: number;
  name: string;
  modules: MoodleModule[];
}

const MODULE_CONFIG: Record<string, { icon: string; type: Lesson['type'] }> = {
  forum: { icon: 'forum', type: 'article' },
  quiz: { icon: 'help_outline', type: 'quiz' },
  assign: { icon: 'assignment', type: 'quiz' },
  resource: { icon: 'insert_drive_file', type: 'article' },
  page: { icon: 'article', type: 'article' },
  url: { icon: 'link', type: 'article' },
  scorm: { icon: 'slideshow', type: 'video' },
  h5pactivity: { icon: 'play_circle', type: 'video' },
  lesson: { icon: 'menu_book', type: 'article' },
  folder: { icon: 'folder', type: 'article' },
  chat: { icon: 'chat', type: 'article' },
  choice: { icon: 'poll', type: 'quiz' },
  feedback: { icon: 'rate_review', type: 'article' },
  survey: { icon: 'bar_chart', type: 'article' },
  workshop: { icon: 'group_work', type: 'quiz' },
};

const DEFAULT_MODULE_CONFIG = { icon: 'open_in_new', type: 'article' as const };

const SECTION_COLORS = [
  'info',
  'secondary',
  'warning',
  'primary',
  'teal',
  'deep-orange',
  'pink',
  'purple',
  'blue',
  'cyan',
  'red',
  'positive',
];

const SECTION_ICONS = [
  'info',
  'campaign',
  'assignment',
  'auto_awesome',
  'edit_note',
  'construction',
  'palette',
  'image',
  'description',
  'code',
  'movie',
  'task_alt',
];

function mapSections(sections: MoodleSection[]): CourseModule[] {
  return sections
    .filter((s) => s.name || (s.modules ?? []).filter((m) => m.modname !== 'label').length > 0)
    .map(
      (section, idx): CourseModule => ({
        title: section.name || `ส่วนที่ ${idx + 1}`,
        icon: SECTION_ICONS[idx % SECTION_ICONS.length]!,
        color: SECTION_COLORS[idx % SECTION_COLORS.length]!,
        lessons: (section.modules ?? [])
          .filter((m) => m.modname !== 'label')
          .map((mod): Lesson => {
            const cfg = MODULE_CONFIG[mod.modname] ?? DEFAULT_MODULE_CONFIG;
            return {
              title: mod.name,
              type: cfg.type,
              duration: '',
              ...(mod.url !== undefined ? { moodleUrl: mod.url } : {}),
              moodleModuleId: mod.id,
              moodleModname: mod.modname,
            };
          }),
      }),
    )
    .filter((m) => m.lessons.length > 0 || m.title);
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
