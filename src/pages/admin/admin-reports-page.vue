<template>
  <q-page class="admin-page admin-reports-page">
    <AppPageHero
      eyebrow="Admin Reports"
      eyebrow-icon="analytics"
      title="รายงาน"
      description="ติดตามรายวิชาที่ได้รับความสนใจจากจำนวนการเข้าชมและจำนวนผู้ลงทะเบียน"
    >
      <template #aside>
        <q-badge
          rounded
          color="primary"
          :label="activeMenuLabel"
          class="admin-reports-page__hero-badge"
        />
      </template>
    </AppPageHero>

    <section ref="reportsContentRef" class="admin-shell admin-content admin-reports-page__shell">
      <AdminSectionNav v-model="activeMenu" :items="menuItems" />

      <div class="admin-reports-page__content">
        <AdminCourseInterestReportManager v-if="activeMenu === 'interested-courses'" />
        <AdminRegistrationStatisticsReportManager
          v-else-if="activeMenu === 'registration-statistics'"
        />
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import AdminCourseInterestReportManager from 'components/admin/AdminCourseInterestReportManager.vue';
import AdminRegistrationStatisticsReportManager from 'components/admin/AdminRegistrationStatisticsReportManager.vue';
import AppPageHero from 'components/admin/AppPageHero.vue';
import AdminSectionNav, { type AdminSectionNavItem } from 'components/admin/AdminSectionNav.vue';

type ReportsMenu = 'interested-courses' | 'registration-statistics';

const menuItems: AdminSectionNavItem[] = [
  {
    value: 'interested-courses',
    label: 'รายวิชาที่ได้รับความสนใจ',
    icon: 'bar_chart',
  },
  {
    value: 'registration-statistics',
    label: 'สถิติการลงทะเบียน',
    icon: 'table_chart',
  },
];

const activeMenu = ref<ReportsMenu>('interested-courses');
const reportsContentRef = ref<HTMLElement | null>(null);

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

function scrollToReportsContentTop(): void {
  if (typeof window === 'undefined' || !reportsContentRef.value) {
    return;
  }

  void nextTick(() => {
    if (!reportsContentRef.value) {
      return;
    }

    const headerHeight = getHeaderHeight();
    const sectionTop = reportsContentRef.value.getBoundingClientRect().top + window.scrollY;
    const targetTop = Math.max(0, sectionTop - headerHeight - 8);
    window.scrollTo({ top: targetTop, behavior: 'smooth' });
  });
}

watch(activeMenu, () => {
  scrollToReportsContentTop();
});
</script>

<style lang="scss" scoped>
.admin-reports-page__hero-badge {
  justify-self: end;
}

.admin-reports-page__shell {
  padding-top: 8px;
}

.admin-reports-page__content {
  min-width: 0;
}

@media (max-width: 900px) {
  .admin-reports-page__hero-badge {
    justify-self: start;
  }
}
</style>
