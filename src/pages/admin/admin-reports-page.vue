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
        <RegistrationStatisticsReportManager v-else-if="activeMenu === 'registration-statistics'" />
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AdminCourseInterestReportManager from 'components/admin/AdminCourseInterestReportManager.vue';
import RegistrationStatisticsReportManager from 'components/reports/RegistrationStatisticsReportManager.vue';
import AppPageHero from 'components/common/AppPageHero.vue';
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

const route = useRoute();
const router = useRouter();
const activeMenu = ref<ReportsMenu>('interested-courses');
const reportsContentRef = ref<HTMLElement | null>(null);

const activeMenuLabel = computed(
  () => menuItems.find((item) => item.value === activeMenu.value)?.label ?? '',
);

const TAB_TO_SLUG: Record<ReportsMenu, string> = {
  'interested-courses': 'interested-courses',
  'registration-statistics': 'registration-statistics',
};

const SLUG_TO_TAB: Record<string, ReportsMenu> = {
  'interested-courses': 'interested-courses',
  'registration-statistics': 'registration-statistics',
};

function getRouteSlug(): string {
  const raw = route.params.tab;
  return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
}

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

watch(
  () => route.params.tab,
  () => {
    const tab = SLUG_TO_TAB[getRouteSlug()] ?? 'interested-courses';
    if (tab !== activeMenu.value) {
      activeMenu.value = tab;
    }
  },
  { immediate: true },
);

watch(activeMenu, () => {
  const slug = TAB_TO_SLUG[activeMenu.value];
  if (slug && slug !== getRouteSlug()) {
    void router.replace({ path: `/admin/reports/${slug}` });
  }

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
