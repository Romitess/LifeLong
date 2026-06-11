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

      <AdminCourseForm v-else :readonly="true" :initial-data="course" />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { isNewTabClick, resolveFullUrl } from 'src/composables/use-nav-link';
import type { AdminCourseDetail } from 'src/types/admin-courses';
import { useAdminCourses } from 'src/composables/use-admin-courses';
import AppPageHero from 'components/admin/AppPageHero.vue';
import AdminCourseForm from 'components/admin/AdminCourseForm.vue';
import AppActionButton from 'components/admin/AppActionButton.vue';

const router = useRouter();
const route = useRoute();

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
