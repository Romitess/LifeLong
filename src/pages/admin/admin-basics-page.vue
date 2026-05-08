<template>
  <q-page class="admin-page admin-basics-page">
    <AdminPageHero
      eyebrow="Base Settings"
      eyebrow-icon="tune"
      title="จัดการข้อมูลพื้นฐานของระบบ"
      description="ตั้งค่าข้อมูลที่ใช้ร่วมกันทั้งระบบ เช่น ชื่อระบบ รอบปีการศึกษา ติดต่อ และสถานะบริการ"
    >
      <template #aside>
        <div class="admin-basics-page__hero-action">
          <AdminActionButton
            icon="save"
            label="บันทึกข้อมูล"
            no-caps
            @click="showMockAction('บันทึกข้อมูลพื้นฐาน')"
          />
        </div>
      </template>
    </AdminPageHero>

    <section class="admin-shell admin-content">
      <div class="admin-settings-grid">
        <AdminSurfaceCard eyebrow="System Profile" title="ข้อมูลระบบ">
          <div class="admin-form-grid">
            <q-input v-model="basicSettings.systemName" outlined dense label="ชื่อระบบ" />
            <q-input v-model="basicSettings.shortName" outlined dense label="ชื่อย่อ" />
            <q-input
              v-model="basicSettings.academicYear"
              outlined
              dense
              label="ปีการศึกษาเริ่มต้น"
            />
            <q-input v-model="basicSettings.defaultLanguage" outlined dense label="ภาษาเริ่มต้น" />
          </div>
        </AdminSurfaceCard>

        <AdminSurfaceCard eyebrow="Contact Channel" title="ช่องทางติดต่อ">
          <div class="admin-form-grid">
            <q-input v-model="basicSettings.contactEmail" outlined dense label="อีเมลกลาง" />
            <q-input v-model="basicSettings.contactPhone" outlined dense label="เบอร์โทรศัพท์" />
            <q-input v-model="basicSettings.officeHours" outlined dense label="เวลาทำการ" />
            <q-input
              v-model="basicSettings.creditPolicy"
              outlined
              dense
              label="นโยบาย Credit Bank"
            />
          </div>
        </AdminSurfaceCard>

        <AdminSurfaceCard
          eyebrow="Feature Toggles"
          title="การเปิดบริการ"
          card-class="admin-settings-card--switches"
        >
          <q-toggle
            v-model="basicSettings.registrationOpen"
            color="positive"
            label="เปิดระบบลงทะเบียนรายวิชา"
          />
          <q-toggle
            v-model="basicSettings.maintenanceMode"
            color="warning"
            label="โหมดปรับปรุงระบบ"
          />
          <q-toggle
            v-model="basicSettings.showCertificates"
            color="primary"
            label="แสดงเมนูวุฒิบัตร"
          />
        </AdminSurfaceCard>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import AdminActionButton from 'components/admin/AdminActionButton.vue';
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import { reactive } from 'vue';
import { useQuasar } from 'quasar';

const $q = useQuasar();

const basicSettings = reactive({
  systemName: 'BUU Lifelong Learning',
  shortName: 'BUU LLL',
  academicYear: '2569',
  defaultLanguage: 'ภาษาไทย',
  contactEmail: 'support_lifelong@buu.ac.th',
  contactPhone: '038-102-222',
  officeHours: 'จันทร์-ศุกร์ 08:30-16:30',
  creditPolicy: 'สะสมหน่วยกิตตามประกาศมหาวิทยาลัย',
  registrationOpen: true,
  maintenanceMode: false,
  showCertificates: true,
});

function showMockAction(action: string): void {
  $q.notify({
    type: 'info',
    message: `${action} เป็น mockup สำหรับเชื่อม backend ภายหลัง`,
    position: 'top',
  });
}
</script>

<style lang="scss" scoped>
.admin-basics-page__hero-action {
  justify-self: end;
}

.admin-settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.admin-settings-card--switches {
  grid-column: span 2;
}

.admin-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

@media (max-width: 900px) {
  .admin-basics-page__hero-action {
    justify-self: start;
  }
}

@media (max-width: 760px) {
  .admin-settings-grid,
  .admin-form-grid {
    grid-template-columns: 1fr;
  }

  .admin-settings-card--switches {
    grid-column: auto;
  }
}
</style>
