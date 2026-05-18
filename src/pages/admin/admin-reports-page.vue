<template>
  <q-page class="admin-page admin-reports-page">
    <AdminPageHero
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
    </AdminPageHero>

    <section ref="reportsContentRef" class="admin-shell admin-content admin-reports-page__shell">
      <q-card flat bordered class="admin-reports-menu-card">
        <q-list class="admin-reports-menu-list">
          <q-item
            v-for="menu in menuItems"
            :key="menu.value"
            clickable
            v-ripple
            :active="activeMenu === menu.value"
            active-class="admin-reports-menu-item--active"
            class="admin-reports-menu-item"
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
          </q-item>
        </q-list>
      </q-card>

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
import AdminPageHero from 'components/admin/AdminPageHero.vue';

type ReportsMenu = 'interested-courses' | 'registration-statistics';

interface MenuItem {
  value: ReportsMenu;
  label: string;
  icon: string;
}

const menuItems: MenuItem[] = [
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

.admin-reports-menu-card {
  margin-bottom: 18px;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;
  border-radius: 14px !important;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(17, 24, 39, 0.06) !important;
  overflow: hidden;
}

.admin-reports-menu-list {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 8px;
}

.admin-reports-menu-item {
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
}

.admin-reports-menu-item--active {
  background: rgba($primary, 0.08) !important;
  box-shadow: inset 4px 0 0 $primary;
}

.admin-reports-page__content {
  min-width: 0;
}

@media (max-width: 900px) {
  .admin-reports-page__hero-badge {
    justify-self: start;
  }

  .admin-reports-menu-list {
    padding: 6px;
  }

  .admin-reports-menu-item {
    padding: 0 12px;
  }
}
</style>
