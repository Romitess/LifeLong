<template>
  <q-page class="admin-page admin-course-detail-page">
    <AppPageHero
      eyebrow="Course Registry"
      eyebrow-icon="menu_book"
      :title="course?.nameTh ?? 'รายละเอียดรายวิชา'"
      :description="course?.nameEn ?? ''"
    />

    <section class="admin-shell admin-content">
      <div class="admin-course-detail-page__back">
        <AppActionButton
          variant="primary"
          icon="arrow_back"
          label="กลับไปรายการ"
          no-caps
          dense
          tag="a"
          :href="resolveFullUrl('/admin/courses')"
          @click="onBackClick"
        />
      </div>

      <div v-if="loading" class="admin-course-detail-page__loading">
        <q-spinner size="40px" color="primary" />
      </div>

      <AdminCourseForm
        v-else
        v-model:active-tab="activeTab"
        :readonly="true"
        :initial-data="course"
      />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { isNewTabClick, resolveFullUrl } from 'src/composables/use-nav-link';
import type { AdminCourseDetail } from 'src/types/admin-courses';
import { useAdminCourses } from 'src/composables/use-admin-courses';
import AppPageHero from 'components/admin/AppPageHero.vue';
import AdminCourseForm from 'components/admin/AdminCourseForm.vue';
import AppActionButton from 'components/admin/AppActionButton.vue';

const router = useRouter();
const route = useRoute();

type CourseFormTab = 'info' | 'chapters';

const activeTab = ref<CourseFormTab>('info');

const TAB_TO_SLUG: Record<CourseFormTab, string> = {
  info: 'info',
  chapters: 'chapters',
};

const SLUG_TO_TAB: Record<string, CourseFormTab> = {
  info: 'info',
  chapters: 'chapters',
};

function getRouteSlug(): string {
  const raw = route.params.tab;
  return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
}

watch(
  () => route.params.tab,
  () => {
    const tab = SLUG_TO_TAB[getRouteSlug()] ?? 'info';
    if (tab !== activeTab.value) {
      activeTab.value = tab;
    }
  },
  { immediate: true },
);

watch(activeTab, (tab) => {
  const slug = TAB_TO_SLUG[tab];
  if (slug && slug !== getRouteSlug()) {
    void router.replace({ path: `/admin/courses/${route.params.id as string}/${slug}` });
  }
});

function onBackClick(event: Event) {
  if (isNewTabClick(event)) {
    return;
  }
  event.preventDefault();
  void router.push('/admin/courses');
}

const { fetchCourseDetail, fetchFormOptions } = useAdminCourses();

const course = ref<AdminCourseDetail | null>(null);
const loading = ref(true);

onMounted(async () => {
  const id = Number(route.params.id);
  [course.value] = await Promise.all([fetchCourseDetail(id), fetchFormOptions()]);
  loading.value = false;
});
</script>

<style scoped lang="scss">
.admin-course-detail-page__back {
  margin-bottom: 16px;
}

.admin-course-detail-page__loading {
  display: flex;
  justify-content: center;
  padding: 60px;
}
</style>
