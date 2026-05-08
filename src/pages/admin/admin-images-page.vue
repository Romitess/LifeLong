<template>
  <q-page class="admin-page admin-images-page">
    <AdminPageHero
      eyebrow="Visual Template"
      eyebrow-icon="collections"
      title="จัดการรูปภาพของระบบ"
      description="จัดการ Hero หน้า Main ด้วย template preview แบบลากวางได้ พร้อมปรับข้อความ ฟ้อนต์ สี ตำแหน่ง และ animation ต่อบรรทัด"
      wide
    >
      <template #aside>
        <q-badge
          rounded
          color="primary"
          label="Main hero editor"
          class="admin-images-page__badge"
        />
      </template>
    </AdminPageHero>

    <section class="admin-shell admin-shell--wide admin-content">
      <SystemHeroImageEditor />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import SystemHeroImageEditor from 'components/admin/SystemHeroImageEditor.vue';
</script>

<style lang="scss" scoped>
.admin-images-page__badge {
  justify-self: end;
}

@media (max-width: 900px) {
  .admin-images-page__badge {
    justify-self: start;
  }
}
</style>
