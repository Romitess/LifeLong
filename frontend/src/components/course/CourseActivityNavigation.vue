<template>
  <nav v-if="currentIndex >= 0" class="activity-nav" aria-label="การนำทางกิจกรรมในคอร์ส">
    <BaseButton
      unelevated
      no-caps
      color="white"
      text-color="grey-8"
      icon="chevron_left"
      :disable="!prevLesson || loading"
      aria-label="ไปกิจกรรมก่อนหน้า"
      class="activity-nav__button activity-nav__button--side"
      @click="goTo(prevLesson)"
    >
      <span class="activity-nav__side-content activity-nav__side-content--prev">
        <span class="activity-nav__label">ก่อนหน้า</span>
        <span class="activity-nav__title">{{ prevLesson?.title || 'เริ่มต้นคอร์ส' }}</span>
      </span>
    </BaseButton>

    <BaseButton
      unelevated
      no-caps
      color="primary"
      class="activity-nav__button activity-nav__button--jump"
      :disable="loading || activityItems.length === 0"
      aria-label="เลือกกิจกรรม"
    >
      <span class="activity-nav__jump-text">{{ currentLesson?.title || 'เลือกกิจกรรม' }}</span>
      <q-icon name="expand_more" size="20px" class="activity-nav__jump-caret" />

      <q-menu
        fit
        anchor="top middle"
        self="bottom middle"
        class="activity-nav__menu"
        max-height="360px"
      >
        <q-list dense class="activity-nav__list">
          <q-item
            v-for="item in activityItems"
            :key="`${item.index}-${item.lesson.moodleModuleId ?? item.lesson.title}`"
            v-close-popup
            clickable
            :active="item.current"
            active-class="activity-nav__item--active"
            @click="goTo(item.lesson)"
          >
            <q-item-section avatar class="activity-nav__item-icon">
              <q-icon :name="item.current ? 'check' : lessonIcon(item.lesson)" size="18px" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="activity-nav__item-title">{{ item.lesson.title }}</q-item-label>
            </q-item-section>
          </q-item>
        </q-list>
      </q-menu>
    </BaseButton>

    <BaseButton
      unelevated
      no-caps
      color="white"
      text-color="grey-8"
      icon-right="chevron_right"
      :disable="!nextLesson || loading"
      aria-label="ไปกิจกรรมถัดไป"
      class="activity-nav__button activity-nav__button--side"
      @click="goTo(nextLesson)"
    >
      <span class="activity-nav__side-content activity-nav__side-content--next">
        <span class="activity-nav__label">ถัดไป</span>
        <span class="activity-nav__title">{{ nextLesson?.title || 'จบคอร์สแล้ว' }}</span>
      </span>
    </BaseButton>
  </nav>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import BaseButton from 'components/base/BaseButton.vue';
import { useAuthStore } from 'src/stores/auth-store';
import { getCourseStructure, type Lesson } from 'src/data/course-structure';
import { useMoodleCourseContents } from 'src/composables/use-moodle-course-contents';
import { useMoodleSso } from 'src/composables/use-moodle-sso';

const CONTENT_MODNAMES = new Set(['page', 'resource', 'label', 'url', 'folder', 'book', 'forum']);

interface Props {
  courseId: string;
  moodleCourseId?: number | string | null;
  currentModuleId?: number | string | null;
  currentTitle?: string;
}

const props = withDefaults(defineProps<Props>(), {
  moodleCourseId: null,
  currentModuleId: null,
  currentTitle: '',
});

const router = useRouter();
const authStore = useAuthStore();
const { getMoodleActivityUrl } = useMoodleSso();
const { sections, loading, fetchSections } = useMoodleCourseContents();

const lessons = computed<Lesson[]>(() => {
  // When moodleCourseId is provided, never fall back to mock data —
  // empty sections means loading or fetch failed, both should hide the nav.
  const source =
    sections.value.length > 0
      ? sections.value
      : props.moodleCourseId
        ? []
        : getCourseStructure(props.courseId);
  return source.flatMap((module) => [
    ...(module.subsections ?? []).flatMap((sub) => sub.lessons),
    ...module.lessons,
  ]);
});

const currentIndex = computed<number>(() => {
  const moduleId = props.currentModuleId == null ? '' : String(props.currentModuleId);
  if (moduleId) {
    const byModule = lessons.value.findIndex(
      (lesson) => String(lesson.moodleModuleId ?? '') === moduleId,
    );
    if (byModule >= 0) return byModule;
  }
  return props.currentTitle
    ? lessons.value.findIndex((lesson) => lesson.title === props.currentTitle)
    : -1;
});

const prevLesson = computed<Lesson | null>(() =>
  currentIndex.value > 0 ? (lessons.value[currentIndex.value - 1] ?? null) : null,
);
const currentLesson = computed<Lesson | null>(() =>
  currentIndex.value >= 0 ? (lessons.value[currentIndex.value] ?? null) : null,
);
const nextLesson = computed<Lesson | null>(() =>
  currentIndex.value >= 0 && currentIndex.value < lessons.value.length - 1
    ? (lessons.value[currentIndex.value + 1] ?? null)
    : null,
);
const activityItems = computed(() =>
  lessons.value.map((lesson, index) => ({
    lesson,
    index,
    current: index === currentIndex.value,
  })),
);

function lessonIcon(lesson: Lesson): string {
  if (lesson.icon) return lesson.icon;
  if (lesson.moodleModname === 'quiz') return 'help_outline';
  if (lesson.moodleModname === 'assign') return 'upload_file';
  if (lesson.type === 'video') return 'play_circle';
  if (lesson.type === 'quiz') return 'help_outline';
  return 'article';
}

async function goTo(lesson: Lesson | null): Promise<void> {
  if (!lesson || !props.courseId) return;

  if (lesson.moodleModuleId && lesson.moodleModname === 'quiz' && props.moodleCourseId) {
    await router.push({
      path: `/course/${props.courseId}/moodle-quiz/${lesson.moodleModuleId}`,
      query: { title: lesson.title, moodleCourseId: String(props.moodleCourseId) },
    });
    return;
  }

  if (lesson.moodleModuleId && lesson.moodleModname === 'assign' && props.moodleCourseId) {
    await router.push({
      path: `/course/${props.courseId}/moodle-assign/${lesson.moodleModuleId}`,
      query: { title: lesson.title, moodleCourseId: String(props.moodleCourseId) },
    });
    return;
  }

  if (lesson.moodleModuleId && lesson.moodleModname === 'feedback' && props.moodleCourseId) {
    await router.push({
      path: `/course/${props.courseId}/moodle-feedback/${lesson.moodleModuleId}`,
      query: { title: lesson.title, moodleCourseId: String(props.moodleCourseId) },
    });
    return;
  }

  if (lesson.moodleModuleId && lesson.moodleModname === 'forum' && props.moodleCourseId) {
    await router.push({
      path: `/course/${props.courseId}/moodle-forum/${lesson.moodleModuleId}`,
      query: { title: lesson.title, moodleCourseId: String(props.moodleCourseId) },
    });
    return;
  }

  if (
    lesson.moodleModuleId &&
    lesson.moodleModname &&
    CONTENT_MODNAMES.has(lesson.moodleModname) &&
    props.moodleCourseId
  ) {
    await router.push({
      path: `/course/${props.courseId}/learn/${lesson.moodleModuleId}`,
      query: {
        title: lesson.title,
        modname: lesson.moodleModname,
        moodleCourseId: String(props.moodleCourseId),
      },
    });
    return;
  }

  if (lesson.moodleUrl && props.moodleCourseId) {
    const username = authStore.user?.username || authStore.user?.email || '';
    const ssoUrl = username
      ? await getMoodleActivityUrl(props.moodleCourseId, username, lesson.moodleUrl)
      : '';
    window.open(ssoUrl || lesson.moodleUrl, '_blank');
    return;
  }

  const lessonId = encodeURIComponent(lesson.title);
  if (lesson.type === 'video') {
    await router.push(`/course/${props.courseId}/video/${lessonId}`);
  } else if (lesson.type === 'quiz') {
    await router.push(`/course/${props.courseId}/quiz/${lessonId}`);
  } else {
    await router.push(`/course/${props.courseId}/learn`);
  }
}

watch(
  () => props.moodleCourseId,
  (moodleCourseId) => {
    if (moodleCourseId) void fetchSections(moodleCourseId);
  },
  { immediate: true },
);
</script>

<style lang="scss" scoped>
.activity-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}

.activity-nav__button {
  min-height: 44px;
  box-shadow: none !important;
  font-family: inherit;

  :deep(.q-btn__content) {
    min-width: 0;
    width: 100%;
    flex-wrap: nowrap;
    gap: 8px;
  }
}

.activity-nav__button--side {
  flex: 1 1 0;
  min-width: 0;
  max-width: 320px;
  justify-content: flex-start;

  &:last-child {
    justify-content: flex-end;

    :deep(.q-btn__content) {
      justify-content: flex-end;
    }
  }
}

.activity-nav__side-content {
  min-width: 0;
  display: flex;
  flex-direction: column;
  line-height: 1.2;

  &--prev {
    text-align: left;
  }

  &--next {
    text-align: right;
  }
}

.activity-nav__label {
  font-size: 0.7rem;
  font-weight: 700;
  color: rgba(15, 23, 42, 0.5);
  text-transform: uppercase;
  letter-spacing: 0;
}

.activity-nav__title {
  max-width: 240px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(15, 23, 42, 0.85);
  font-size: 0.9rem;
  font-weight: 600;
}

.activity-nav__button--jump {
  flex: 0 0 auto;
  min-width: 260px;
  max-width: 360px;
  position: relative;

  :deep(.q-btn__content) {
    justify-content: center;
    padding: 0 30px;
  }
}

.activity-nav__jump-text {
  min-width: 0;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 700;
  text-align: center;
}

.activity-nav__jump-caret {
  position: absolute;
  right: 10px;
}

.activity-nav__menu {
  border-radius: 10px;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
}

.activity-nav__list {
  min-width: min(420px, 90vw);
  padding: 6px;
}

.activity-nav__item-icon {
  min-width: 34px;
  color: rgba(15, 23, 42, 0.6);
}

.activity-nav__item-title {
  white-space: normal;
  line-height: 1.35;
  font-weight: 600;
  font-family: inherit;
}

:deep(.activity-nav__item--active) {
  color: rgba(15, 23, 42, 0.85);
  background: rgba(247, 208, 70, 0.16);
  border-radius: 8px;
}

@media (max-width: 600px) {
  .activity-nav {
    flex-direction: column;
    align-items: stretch;
  }

  .activity-nav__button--side,
  .activity-nav__button--jump {
    max-width: none;
    width: 100%;
  }

  .activity-nav__button--side:last-child,
  .activity-nav__side-content--next {
    text-align: left;
  }

  .activity-nav__button--side:last-child :deep(.q-btn__content) {
    justify-content: flex-start;
  }

  .activity-nav__title {
    max-width: calc(100vw - 120px);
  }
}
</style>
