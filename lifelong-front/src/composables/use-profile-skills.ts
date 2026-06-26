import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth-store';

export interface SkillMetric {
  id: string | number;
  shortLabel: string;
  label: string;
  score: number;
}

export interface SkillCategory {
  title: string;
  shortTitle: string;
  accent: string;
  items: SkillMetric[];
}

export interface SkillRadarMetric extends SkillMetric {
  accent: string;
  categoryShortTitle: string;
}

export interface RadarPoint {
  x: number;
  y: number;
}

export const RADAR_MAX_SCORE = 5;
export const RADAR_CENTER_X = 210;
export const RADAR_CENTER_Y = 200;
export const RADAR_RADIUS = 136;

export function useProfileSkills() {
  const { locale } = useI18n();
  const authStore = useAuthStore();
  const isLoadingSkills = ref(false);

  // We'll store the loaded scores here
  const rawScores = ref<{ skillId: number; skillName: string; score: number }[]>([]);

  const fetchUserSkills = async () => {
    if (!authStore.user?.id) return;
    isLoadingSkills.value = true;
    try {
      const ts = new Date().getTime();
      const res = await api.get(`/api/skills/user/${authStore.user.id}?_t=${ts}`);
      console.log('Fetched raw skills from API:', res.data);
      if (res.data?.skills) {
        rawScores.value = res.data.skills;
        console.log('Set rawScores to:', rawScores.value);
      }
    } catch (e) {
      console.error('Failed to load user skills:', e);
    } finally {
      isLoadingSkills.value = false;
    }
  };

  // Helper to map DB name to English/Thai label based on the 5 OECD Skills
  const getLocalizedSkillLabel = (skillName: string, isShort = false): string => {
    const map: Record<string, { en: string; th: string; short: string }> = {
      'Critical Thinking': { en: 'Critical Thinking', th: 'การคิดเชิงวิพากษ์', short: 'Critical' },
      Creativity: { en: 'Creativity', th: 'ความคิดสร้างสรรค์', short: 'Creativity' },
      'Practical Skill': { en: 'Practical Skill', th: 'ทักษะเชิงปฏิบัติ', short: 'Practical' },
      Collaboration: { en: 'Collaboration', th: 'การทำงานร่วมกัน', short: 'Collab' },
      'Self Learning': { en: 'Self Learning', th: 'การเรียนรู้ด้วยตนเอง', short: 'Self-Learn' },
    };
    const mapped = map[skillName];
    if (!mapped) return skillName;
    if (isShort) return locale.value === 'th' ? mapped.th : mapped.short;
    return locale.value === 'th' ? mapped.th : mapped.en;
  };

  // Fallback to 0 if not yet earned
  const getScore = (skillName: string) => {
    return rawScores.value.find((s) => s.skillName === skillName)?.score || 0;
  };

  // Map the 5 skills into one or more categories for the UI
  // The OECD Learning Compass can be represented as a single cohesive set of skills.
  const oecdSkills = computed<SkillMetric[]>(() => [
    {
      id: 1,
      shortLabel: getLocalizedSkillLabel('Critical Thinking', true),
      label: getLocalizedSkillLabel('Critical Thinking'),
      score: getScore('Critical Thinking'),
    },
    {
      id: 2,
      shortLabel: getLocalizedSkillLabel('Creativity', true),
      label: getLocalizedSkillLabel('Creativity'),
      score: getScore('Creativity'),
    },
    {
      id: 3,
      shortLabel: getLocalizedSkillLabel('Practical Skill', true),
      label: getLocalizedSkillLabel('Practical Skill'),
      score: getScore('Practical Skill'),
    },
    {
      id: 4,
      shortLabel: getLocalizedSkillLabel('Collaboration', true),
      label: getLocalizedSkillLabel('Collaboration'),
      score: getScore('Collaboration'),
    },
    {
      id: 5,
      shortLabel: getLocalizedSkillLabel('Self Learning', true),
      label: getLocalizedSkillLabel('Self Learning'),
      score: getScore('Self Learning'),
    },
  ]);

  const skillCategories = computed<SkillCategory[]>(() => [
    {
      title: locale.value === 'th' ? 'ทักษะตามกรอบ OECD 2030' : 'OECD Learning Compass 2030 Skills',
      shortTitle: 'OECD',
      accent: '#f5a623',
      items: oecdSkills.value,
    },
  ]);

  const allSkillMetrics = computed<SkillRadarMetric[]>(() =>
    skillCategories.value.flatMap((category) =>
      category.items.map((item) => ({
        ...item,
        accent: category.accent,
        categoryShortTitle: category.shortTitle,
      })),
    ),
  );

  const overallSkillAverage = computed<number>(() => getAverageSkillScore(allSkillMetrics.value));

  const skillCategoryAverages = computed(() =>
    skillCategories.value.map((category) => ({
      ...category,
      average: getAverageSkillScore(category.items),
    })),
  );

  const radarGridPaths = computed(() =>
    Array.from({ length: RADAR_MAX_SCORE }, (_, index) => RADAR_MAX_SCORE - index).map((level) => {
      const points = allSkillMetrics.value.map((_, axisIndex, items) =>
        createRadarPoint(axisIndex, items.length, level),
      );
      return {
        level,
        path: createRadarPath(points),
      };
    }),
  );

  const radarAxisItems = computed(() =>
    allSkillMetrics.value.map((metric, index, items) => ({
      ...metric,
      index,
      axisPoint: createRadarPoint(index, items.length, RADAR_MAX_SCORE),
      valuePoint: createRadarPoint(index, items.length, metric.score),
      badgePoint: createRadarPoint(index, items.length, RADAR_MAX_SCORE + 0.55),
    })),
  );

  const radarDataPath = computed(() =>
    createRadarPath(radarAxisItems.value.map((axis) => axis.valuePoint)),
  );

  const radarScaleLabels = computed(() =>
    Array.from({ length: RADAR_MAX_SCORE }, (_, index) => {
      const level = index + 1;
      return {
        level,
        x: RADAR_CENTER_X + 14,
        y: RADAR_CENTER_Y - (RADAR_RADIUS * level) / RADAR_MAX_SCORE,
      };
    }),
  );

  function getAverageSkillScore(items: Array<{ score: number }>): number {
    if (items.length === 0) return 0;
    const total = items.reduce((sum, item) => sum + item.score, 0);
    return Number((total / items.length).toFixed(2));
  }

  function createRadarPoint(index: number, total: number, score: number): RadarPoint {
    if (total === 0) {
      return { x: RADAR_CENTER_X, y: RADAR_CENTER_Y };
    }
    const angle = -Math.PI / 2 + (index / total) * Math.PI * 2;
    const distance = (score / RADAR_MAX_SCORE) * RADAR_RADIUS;
    return {
      x: RADAR_CENTER_X + Math.cos(angle) * distance,
      y: RADAR_CENTER_Y + Math.sin(angle) * distance,
    };
  }

  function createRadarPath(points: RadarPoint[]): string {
    if (points.length === 0) return '';
    return `${points
      .map(
        (point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
      )
      .join(' ')} Z`;
  }

  function formatSkillScore(score: number): string {
    return score.toFixed(2);
  }

  return {
    fetchUserSkills,
    isLoadingSkills,
    oecdSkills,
    skillCategories,
    allSkillMetrics,
    overallSkillAverage,
    skillCategoryAverages,
    radarGridPaths,
    radarAxisItems,
    radarDataPath,
    radarScaleLabels,
    getAverageSkillScore,
    createRadarPoint,
    createRadarPath,
    formatSkillScore,
  };
}
