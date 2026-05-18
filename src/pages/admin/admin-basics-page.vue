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
      <q-card flat bordered class="admin-basics-menu-card">
        <q-list class="admin-basics-menu-list">
          <q-item
            v-for="menu in menuItems"
            :key="menu.value"
            clickable
            v-ripple
            :active="activeMenu === menu.value"
            active-class="admin-basics-menu-item--active"
            class="admin-basics-menu-item"
            @click="activeMenu = menu.value"
          >
            <q-item-section avatar>
              <q-icon
                :name="menu.icon"
                :color="activeMenu === menu.value ? 'primary' : 'grey-6'"
                size="20px"
              />
            </q-item-section>
            <q-item-section>
              <q-item-label
                :class="activeMenu === menu.value ? 'text-primary text-weight-bold' : 'text-grey-8'"
                class="text-body2"
              >
                {{ menu.label }}
              </q-item-label>
            </q-item-section>
            <q-item-section v-if="menu.badge" side>
              <q-badge rounded color="amber-8" :label="menu.badge" />
            </q-item-section>
          </q-item>
        </q-list>
      </q-card>

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

type BasicsMenu = 'categories' | 'cert-template' | 'cert-signer' | 'slides';

interface MenuItem {
  value: BasicsMenu;
  label: string;
  icon: string;
  caption?: string;
  badge?: string;
}

const menuItems: MenuItem[] = [
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
    badge: 'เร็ว ๆ นี้',
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

.admin-basics-menu-card {
  margin-bottom: 18px;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;
  border-radius: 14px !important;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(17, 24, 39, 0.06) !important;
  overflow: hidden;
}

.admin-basics-menu-list {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 8px;
}

.admin-basics-menu-item {
  flex: 0 0 auto;
  border-radius: 10px;
  min-height: 48px;
  padding: 0 12px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba($primary, 0.04);
  }

  :deep(.q-item__section--avatar) {
    min-width: 34px;
    padding-right: 10px;
  }

  :deep(.q-item__section--main) {
    min-width: 0;
  }

  :deep(.q-item__label) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.admin-basics-menu-item--active {
  background: rgba($primary, 0.08) !important;
  box-shadow: inset 4px 0 0 $primary;
}

.admin-basics-page__content {
  min-width: 0;
}

@media (max-width: 900px) {
  .admin-basics-page__hero-badge {
    justify-self: start;
  }

  .admin-basics-menu-list {
    padding: 6px;
  }

  .admin-basics-menu-item {
    padding: 0 12px;
  }
}
</style>
