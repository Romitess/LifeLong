<template>
  <div class="cert-placeholder">
    <AdminSurfaceCard
      eyebrow="Certificate Template"
      title="รูปแบบ Certificate"
      subtitle="ออกแบบและจัดการเทมเพลตวุฒิบัตรสำหรับใช้งานในระบบ"
      body-padding="lg"
    >
      <div class="cert-placeholder__body">
        <q-icon name="workspace_premium" size="56px" class="cert-placeholder__icon" />
        <h3 class="cert-placeholder__title">เร็ว ๆ นี้</h3>
        <p class="cert-placeholder__description">
          ส่วนจัดการเทมเพลตใบประกาศนียบัตร อยู่ระหว่างการพัฒนา จะเปิดให้ใช้งานในเฟสถัดไป
        </p>
      </div>
    </AdminSurfaceCard>
  </div>
</template>

<script setup lang="ts">
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
</script>

<style lang="scss" scoped>
.cert-placeholder__body {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
  color: #4b5563;
}

.cert-placeholder__icon {
  color: #b7791f;
  margin-bottom: 16px;
}

.cert-placeholder__title {
  margin: 0 0 8px;
  color: var(--admin-navy);
  font-size: 1.4rem;
  font-weight: 900;
}

.cert-placeholder__description {
  max-width: 380px;
  margin: 0;
  color: var(--admin-muted);
  font-size: 0.92rem;
  line-height: 1.55;
}
</style>
