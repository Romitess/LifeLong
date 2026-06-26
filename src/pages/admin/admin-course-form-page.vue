<template>
  <q-page class="admin-page admin-course-form-page">
    <AppPageHero
      eyebrow="Course Registry"
      eyebrow-icon="menu_book"
      :title="'เพิ่มทะเบียนรายวิชา/หลักสูตรระยะสั้น'"
      description="กรอกข้อมูลรายวิชาหรือหลักสูตรระยะสั้นที่ได้รับอนุมัติให้ดำเนินการในระบบ"
    />

    <section class="admin-shell admin-content">
      <div class="admin-course-form-page__back">
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

      <AdminCourseForm
        v-model:active-tab="activeTab"
        @cancel="void router.push('/admin/courses')"
        @saved="onSaved"
      />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { isNewTabClick, resolveFullUrl } from 'src/composables/use-nav-link';
import AdminCourseForm from 'components/admin/AdminCourseForm.vue';
import AppActionButton from 'components/common/AppActionButton.vue';
import AppPageHero from 'components/common/AppPageHero.vue';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();

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
    void router.replace({ path: `/admin/courses/new/${slug}` });
  }
});

function onBackClick(event: Event) {
  if (isNewTabClick(event)) {
    return;
  }
  event.preventDefault();
  void router.push('/admin/courses');
}

function onSaved(courseId: number) {
  $q.notify({
    type: 'positive',
    message: `บันทึกรายวิชาสำเร็จ (ID: ${courseId})`,
    position: 'top',
    timeout: 3000,
  });
  void router.push('/admin/courses');
}
</script>

<style scoped lang="scss">
.admin-course-form-page__back {
  margin-bottom: 16px;
}
</style>
