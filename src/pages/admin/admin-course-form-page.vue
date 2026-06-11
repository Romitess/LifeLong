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

      <AdminCourseForm @cancel="void router.push('/admin/courses')" @saved="onSaved" />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { isNewTabClick, resolveFullUrl } from 'src/composables/use-nav-link';
import AppPageHero from 'components/admin/AppPageHero.vue';
import AdminCourseForm from 'components/admin/AdminCourseForm.vue';
import AppActionButton from 'components/admin/AppActionButton.vue';

const router = useRouter();
const $q = useQuasar();

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
