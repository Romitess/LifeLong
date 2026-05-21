<template>
  <q-page class="admin-page admin-basics-page">
    <AdminPageHero
      eyebrow="Base Settings"
      eyebrow-icon="tune"
      title="จัดการข้อมูลพื้นฐาน"
      description="ตั้งค่าหมวด/หมู่วิชา รูปแบบใบประกาศ ผู้ลงนาม และสไลด์รูปภาพหน้าหลักของระบบในที่เดียว"
    >
      <template #aside>
        <q-badge
          rounded
          color="primary"
          :label="activeMenuLabel"
          class="admin-basics-page__hero-badge"
        />
      </template>
    </AdminPageHero>

    <section ref="basicsContentRef" class="admin-shell admin-content admin-basics-page__shell">
      <AdminSectionNav v-model="activeMenu" :items="menuItems" />

      <div class="admin-basics-page__content">
        <CategoriesManager v-if="activeMenu === 'categories'" />
        <CertificateTemplateManager v-else-if="activeMenu === 'cert-template'" />
        <CertificateSignerManager v-else-if="activeMenu === 'cert-signer'" />
        <SystemHeroImageEditor v-else-if="activeMenu === 'slides'" />
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import CategoriesManager from 'components/admin/CategoriesManager.vue';
import CertificateSignerManager from 'components/admin/CertificateSignerManager.vue';
import CertificateTemplateManager from 'components/admin/CertificateTemplateManager.vue';
import SystemHeroImageEditor from 'components/admin/SystemHeroImageEditor.vue';
import AdminSectionNav, { type AdminSectionNavItem } from 'components/admin/AdminSectionNav.vue';

type BasicsMenu = 'categories' | 'cert-template' | 'cert-signer' | 'slides';

const menuItems: AdminSectionNavItem[] = [
  {
    value: 'categories',
    label: 'หมวด/หมู่วิชา',
    icon: 'category',
    caption: 'จัดกลุ่มรายวิชาในระบบ',
  },
  {
    value: 'cert-template',
    label: 'รูปแบบ Certificate',
    icon: 'workspace_premium',
    caption: 'เทมเพลตใบประกาศ',
  },
  {
    value: 'cert-signer',
    label: 'ผู้เซ็น Certificate',
    icon: 'draw',
    caption: 'รายชื่อผู้ลงนาม',
  },
  {
    value: 'slides',
    label: 'สไลด์รูปภาพ',
    icon: 'collections',
    caption: 'รูป Hero หน้า Main',
  },
];

const activeMenu = ref<BasicsMenu>('categories');
const basicsContentRef = ref<HTMLElement | null>(null);

const activeMenuLabel = computed(
  () => menuItems.find((item) => item.value === activeMenu.value)?.label ?? '',
);

function getHeaderHeight(): number {
  if (typeof window === 'undefined') {
    return 0;
  }
  const headerElement = document.querySelector<HTMLElement>('.q-header');
  return headerElement?.offsetHeight ?? 0;
}

function scrollToBasicsContentTop(): void {
  if (typeof window === 'undefined' || !basicsContentRef.value) {
    return;
  }

  void nextTick(() => {
    if (!basicsContentRef.value) {
      return;
    }
    const headerHeight = getHeaderHeight();
    const sectionTop = basicsContentRef.value.getBoundingClientRect().top + window.scrollY;
    const targetTop = Math.max(0, sectionTop - headerHeight - 8);
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
}

watch(activeMenu, () => {
  scrollToBasicsContentTop();
});
</script>

<style lang="scss" scoped>
.admin-basics-page__hero-badge {
  justify-self: end;
}

.admin-basics-page__shell {
  padding-top: 8px;
}

.admin-basics-page__content {
  min-width: 0;
}

@media (max-width: 900px) {
  .admin-basics-page__hero-badge {
    justify-self: start;
  }
}
</style>
