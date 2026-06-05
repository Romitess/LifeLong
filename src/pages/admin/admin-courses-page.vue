<template>
  <q-page class="admin-page admin-courses-page">
    <AppPageHero
      eyebrow="Course Registry"
      eyebrow-icon="menu_book"
      title="ทะเบียนรายวิชา/หลักสูตรระยะสั้น"
      description="บริหารจัดการรายวิชาและหลักสูตรระยะสั้นที่ได้รับอนุมัติให้ดำเนินการในระบบ"
    />

    <section class="admin-shell admin-content">
      <AdminCoursesManager />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import AdminCoursesManager from 'components/admin/AdminCoursesManager.vue';
import AppPageHero from 'components/admin/AppPageHero.vue';
</script>
