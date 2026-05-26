import { computed } from 'vue';
import { useI18n } from 'vue-i18n';

export interface SkillMetric {
  id: string;
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

  const cognitiveSkills = computed<SkillMetric[]>(() => [
    {
      id: 'critical-thinking',
      shortLabel: 'Critical Thinking',
      label: locale.value === 'th' ? '1.1 Critical Thinking' : '1.1 Critical Thinking',
      score: 4.4,
    },
    {
      id: 'creative-thinking',
      shortLabel: 'Creative Thinking',
      label: locale.value === 'th' ? '1.2 Creative Thinking' : '1.2 Creative Thinking',
      score: 4.1,
    },
    {
      id: 'learning-to-learn',
      shortLabel: 'Learning to Learn',
      label:
        locale.value === 'th' ? '1.3 Learning to Learn' : '1.3 Learning to Learn / Self-Regulation',
      score: 3.8,
    },
  ]);

  const socialSkills = computed<SkillMetric[]>(() => [
    {
      id: 'collaboration',
      shortLabel: 'Collaboration',
      label: locale.value === 'th' ? '2.1 Collaboration' : '2.1 Collaboration',
      score: 4.2,
    },
    {
      id: 'empathy',
      shortLabel: 'Empathy',
      label: locale.value === 'th' ? '2.2 Empathy' : '2.2 Empathy',
      score: 3.7,
    },
    {
      id: 'responsibility',
      shortLabel: 'Responsibility',
      label: locale.value === 'th' ? '2.3 Responsibility' : '2.3 Responsibility / Self-efficacy',
      score: 4.0,
    },
  ]);

  const practicalSkills = computed<SkillMetric[]>(() => [
    {
      id: 'digital-literacy',
      shortLabel: 'Digital Literacy',
      label: locale.value === 'th' ? '3.1 Digital Literacy' : '3.1 Digital Literacy',
      score: 4.5,
    },
    {
      id: 'life-skills',
      shortLabel: 'Life Skills',
      label: locale.value === 'th' ? '3.2 Life Skills' : '3.2 Life Skills',
      score: 3.6,
    },
    {
      id: 'financial-literacy',
      shortLabel: 'Financial Literacy',
      label: locale.value === 'th' ? '3.3 Financial Literacy' : '3.3 Financial Literacy',
      score: 3.2,
    },
    {
      id: 'physical-health-literacy',
      shortLabel: 'Physical & Health',
      label:
        locale.value === 'th' ? '3.4 สุขภาวะและการดูแลร่างกาย' : '3.4 Physical & Health Literacy',
      score: 3.5,
    },
  ]);

  const skillCategories = computed<SkillCategory[]>(() => [
    {
      title:
        locale.value === 'th'
          ? 'Cognitive & Metacognitive Skills'
          : 'Cognitive & Metacognitive Skills',
      shortTitle: 'Cognitive',
      accent: '#f5a623',
      items: cognitiveSkills.value,
    },
    {
      title: locale.value === 'th' ? 'Social & Emotional Skills' : 'Social & Emotional Skills',
      shortTitle: 'Social',
      accent: '#3aa6b9',
      items: socialSkills.value,
    },
    {
      title:
        locale.value === 'th' ? 'Practical and physical skills' : 'Practical and physical skills',
      shortTitle: 'Practical',
      accent: '#49b37d',
      items: practicalSkills.value,
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
    if (items.length === 0) {
      return 0;
    }

    const total = items.reduce((sum, item) => sum + item.score, 0);
    return Number((total / items.length).toFixed(1));
  }

  function createRadarPoint(index: number, total: number, score: number): RadarPoint {
    if (total === 0) {
      return {
        x: RADAR_CENTER_X,
        y: RADAR_CENTER_Y,
      };
    }

    const angle = -Math.PI / 2 + (index / total) * Math.PI * 2;
    const distance = (score / RADAR_MAX_SCORE) * RADAR_RADIUS;

    return {
      x: RADAR_CENTER_X + Math.cos(angle) * distance,
      y: RADAR_CENTER_Y + Math.sin(angle) * distance,
    };
  }

  function createRadarPath(points: RadarPoint[]): string {
    if (points.length === 0) {
      return '';
    }

    return `${points
      .map(
        (point, index) => `${index === 0 ? 'M' : 'L'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`,
      )
      .join(' ')} Z`;
  }

  function formatSkillScore(score: number): string {
    return score.toFixed(1);
  }

  return {
    cognitiveSkills,
    socialSkills,
    practicalSkills,
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
