<template>
  <q-layout view="hHh lpR fFf">
    <q-header v-if="showNavBar" style="background: transparent">
      <!-- Top Bar -->
      <q-toolbar class="top-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          class="lt-md text-dark q-mr-sm"
          @click="drawerOpen = !drawerOpen"
        />

        <div class="logo row items-center cursor-pointer" @click="onLogoClick">
          <img
            src="~assets/brand/buu-lll-logo.png"
            class="logo__image"
            alt="BUU LLL"
            loading="eager"
            decoding="sync"
          />
        </div>

        <div v-if="showNavBar" class="gt-sm vertical-divider q-mx-lg"></div>

        <q-tabs
          v-if="showNavBar"
          v-model="activeNav"
          align="left"
          active-color="primary"
          indicator-color="primary"
          dense
          no-caps
          inline-label
          narrow-indicator
          class="nav-tabs gt-sm q-ml-lg"
        >
          <template v-for="nav in navItems" :key="nav.name">
            <!-- Special case for Category with Menu -->
            <q-tab
              v-if="nav.name === 'category'"
              :name="nav.name"
              :icon="nav.icon"
              :label="nav.label"
              :class="['nav-tab', `nav-tab--${nav.name}`]"
            >
              <q-menu
                fit
                anchor="bottom left"
                self="top left"
                class="category-mega-menu"
                transition-show="jump-down"
                transition-hide="jump-up"
              >
                <div class="category-menu-content">
                  <div class="category-menu-grid">
                    <q-item
                      v-for="cat in categories"
                      :key="cat.id"
                      clickable
                      v-ripple
                      class="category-item"
                      @click="onCategoryClick(cat.name)"
                      v-close-popup
                    >
                      <q-item-section>
                        <div class="row items-center justify-between no-wrap full-width">
                          <span
                            class="text-subtitle1 text-weight-medium text-blue-grey-9 text-no-wrap q-mr-lg"
                          >
                            {{ cat.displayLabel }}
                          </span>
                          <q-badge rounded color="teal" class="category-badge">{{
                            cat.count
                          }}</q-badge>
                        </div>
                      </q-item-section>
                    </q-item>
                  </div>
                </div>
              </q-menu>
            </q-tab>

            <!-- Standard Tabs -->
            <q-tab
              v-else
              :name="nav.name"
              :icon="nav.icon"
              :label="nav.label"
              :class="['nav-tab', `nav-tab--${nav.name}`]"
              @click="onNavClick(nav)"
            />
          </template>
        </q-tabs>

        <q-space />

        <div class="gt-sm nav-actions">
          <LanguageToggle class="nav-actions__language" />

          <template v-if="!authStore.isLoggedIn">
            <div class="nav-auth-actions">
              <HeaderAuthButton
                variant="login"
                :label="$t('login')"
                @click="goToAuthPage('/login')"
              />
              <HeaderAuthButton
                variant="register"
                :label="$t('register')"
                @click="goToAuthPage('/register')"
              />
            </div>
          </template>
          <template v-else>
            <div class="nav-user-group">
              <div class="nav-profile-summary column items-start justify-center gt-xs">
                <span class="nav-profile-name"
                  >{{ authStore.user?.firstNameTh }} {{ authStore.user?.lastNameTh }}</span
                >
                <span class="nav-profile-role">
                  {{ userRoleLabel }}
                </span>
              </div>
              <q-avatar
                size="36px"
                class="nav-profile-avatar cursor-pointer"
                role="button"
                tabindex="0"
              >
                <img
                  v-if="authStore.user?.avatar"
                  :src="authStore.user.avatar"
                  class="profile-menu-avatar__image"
                  alt="Profile avatar"
                  loading="eager"
                  decoding="sync"
                />
                <q-icon v-else name="person" size="20px" color="white" />
                <q-tooltip>{{ $t('myProfile') }}</q-tooltip>
                <q-menu
                  anchor="bottom right"
                  self="top right"
                  class="profile-action-menu"
                  transition-show="jump-down"
                  transition-hide="jump-up"
                >
                  <q-card flat class="profile-action-card">
                    <div class="profile-action-card__header">
                      <q-avatar size="42px" class="profile-action-card__avatar">
                        <img
                          v-if="authStore.user?.avatar"
                          :src="authStore.user.avatar"
                          alt="Profile avatar"
                          loading="eager"
                          decoding="sync"
                        />
                        <q-icon v-else name="person" size="22px" color="white" />
                      </q-avatar>
                      <div class="profile-action-card__identity">
                        <div class="profile-action-card__name">
                          {{ authStore.user?.firstNameTh }} {{ authStore.user?.lastNameTh }}
                        </div>
                        <div class="profile-action-card__role">
                          {{ userRoleLabel }}
                        </div>
                      </div>
                    </div>

                    <q-separator />

                    <q-list dense class="profile-action-card__list">
                      <q-item
                        clickable
                        v-ripple
                        v-close-popup
                        class="profile-action-card__item"
                        @click="goToProfile"
                      >
                        <q-item-section avatar class="profile-action-card__item-icon">
                          <q-icon name="person" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('myProfile') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                      <q-item
                        clickable
                        v-ripple
                        v-close-popup
                        class="profile-action-card__item profile-action-card__item--danger"
                        @click="onLogout"
                      >
                        <q-item-section avatar class="profile-action-card__item-icon">
                          <q-icon name="logout" />
                        </q-item-section>
                        <q-item-section>
                          <q-item-label>{{ $t('logout') }}</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-card>
                </q-menu>
              </q-avatar>
              <q-btn
                round
                unelevated
                class="nav-notification-btn"
                icon="notifications"
                :aria-label="$t('notifications')"
              >
                <q-badge floating rounded color="negative" class="nav-notification-badge">
                  {{ notificationUnreadCount }}
                </q-badge>
                <q-tooltip>{{ $t('notifications') }}</q-tooltip>
                <q-menu
                  anchor="bottom right"
                  self="top right"
                  class="notification-preview-menu"
                  transition-show="jump-down"
                  transition-hide="jump-up"
                >
                  <div class="notification-preview">
                    <div class="notification-preview__header">
                      <div>
                        <div class="notification-preview__title">แจ้งเตือน</div>
                        <div class="notification-preview__subtitle">
                          {{ notificationPreviewSubtitle }}
                        </div>
                      </div>
                      <q-badge rounded color="negative" class="notification-preview__count"
                        >{{ notificationUnreadCount }} ใหม่</q-badge
                      >
                    </div>

                    <q-separator />

                    <q-list separator class="notification-preview__list">
                      <q-item
                        v-for="notification in notificationPreviewItems"
                        :key="notification.id"
                        clickable
                        v-ripple
                        class="notification-preview__item"
                        @click="openNotificationPreview(notification)"
                        v-close-popup
                      >
                        <q-item-section avatar top>
                          <div
                            class="notification-preview__icon"
                            :style="{
                              background: notification.iconBg,
                              color: notification.iconColor,
                            }"
                          >
                            <q-icon :name="notification.icon" size="19px" />
                          </div>
                        </q-item-section>
                        <q-item-section>
                          <q-item-label class="notification-preview__item-title">
                            {{ notification.title }}
                          </q-item-label>
                          <q-item-label caption class="notification-preview__item-message">
                            {{ notification.message }}
                          </q-item-label>
                          <q-item-label caption class="notification-preview__item-time">
                            {{ notification.time }}
                          </q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>

                    <div class="notification-preview__footer">
                      <q-btn
                        unelevated
                        color="primary"
                        icon="notifications"
                        label="แสดงทั้งหมด"
                        class="notification-preview__all-btn"
                        no-caps
                        @click="goToNotifications"
                        v-close-popup
                      />
                    </div>
                  </div>
                </q-menu>
              </q-btn>
            </div>
          </template>
        </div>

        <div class="lt-md row items-center">
          <q-btn flat round icon="search" color="grey-7" size="sm" />
          <q-btn flat round icon="account_circle" color="grey-7" size="sm">
            <q-menu>
              <q-list style="min-width: 150px">
                <template v-if="!authStore.isLoggedIn">
                  <q-item clickable v-ripple @click="goToAuthPage('/login')">
                    <q-item-section>{{ $t('login') }}</q-item-section>
                  </q-item>
                  <q-item clickable v-ripple @click="goToAuthPage('/register')">
                    <q-item-section>{{ $t('register') }}</q-item-section>
                  </q-item>
                </template>
                <template v-else>
                  <q-item clickable v-ripple @click="goToProfile">
                    <q-item-section>{{ $t('myProfile') }}</q-item-section>
                  </q-item>
                  <q-item v-if="isPrivilegedRole" clickable v-ripple @click="goToNotifications">
                    <q-item-section>{{ $t('notifications') }}</q-item-section>
                  </q-item>
                  <q-item clickable v-ripple @click="onLogout">
                    <q-item-section class="text-negative">{{ $t('logout') }}</q-item-section>
                  </q-item>
                </template>
              </q-list>
            </q-menu>
          </q-btn>
        </div>
      </q-toolbar>
    </q-header>

    <!-- Mobile Drawer -->
    <q-drawer v-model="drawerOpen" bordered overlay behavior="mobile" v-if="showNavBar">
      <q-list padding>
        <q-item-label header class="mobile-drawer-logo">
          <img
            src="~assets/brand/buu-lll-logo.png"
            class="mobile-drawer-logo__image"
            alt="BUU LLL"
          />
        </q-item-label>
        <q-separator class="q-mb-sm" />
        <div class="mobile-language-wrapper">
          <LanguageToggle wide />
        </div>
        <q-separator class="q-my-sm" />
        <q-item v-for="nav in navItems" :key="nav.name" clickable v-ripple @click="onNavClick(nav)">
          <q-item-section avatar>
            <q-icon :name="nav.icon" color="primary" />
          </q-item-section>
          <q-item-section>
            <q-item-label>{{ nav.label }}</q-item-label>
          </q-item-section>
        </q-item>
        <q-separator class="q-my-sm" />

        <template v-if="!authStore.isLoggedIn">
          <q-item clickable v-ripple @click="goToAuthPage('/login')">
            <q-item-section avatar>
              <q-icon name="login" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('login') }}</q-item-label>
            </q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="goToAuthPage('/register')">
            <q-item-section avatar>
              <q-icon name="person_add" color="primary" />
            </q-item-section>
            <q-item-section>
              <q-item-label>{{ $t('register') }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
        <template v-else>
          <q-item clickable v-ripple @click="onLogout">
            <q-item-section avatar>
              <q-icon name="logout" color="negative" />
            </q-item-section>
            <q-item-section>
              <q-item-label class="text-negative">{{ $t('logout') }}</q-item-label>
            </q-item-section>
          </q-item>
        </template>
      </q-list>
    </q-drawer>

    <q-page-container>
      <BaseSpinner v-if="isPageSwitchLoading" class="route-page-loading" />
      <router-view v-else />

      <!-- Footer -->
      <AppFooter v-if="showNavBar" />

      <!-- Scroll to top button -->
      <q-page-scroller position="bottom-right" :scroll-offset="200" :offset="[24, 24]">
        <q-btn round icon="keyboard_arrow_up" class="scroll-top-btn" size="md" />
      </q-page-scroller>
    </q-page-container>

    <BaseSystemDialog
      v-model="logoutDialogOpen"
      variant="danger"
      title="ยืนยันการออกจากระบบ"
      message="คุณต้องการออกจากระบบใช่หรือไม่?"
      icon="logout"
      confirm-label="ออกจากระบบ"
      confirm-icon="logout"
      cancel-label="ยกเลิก"
      @confirm="confirmLogout"
    />
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRoute, useRouter } from 'vue-router';
import { useCourseStore } from 'src/stores/course-store';
import { useCategoryStore } from 'src/stores/category-store';
import { useAuthStore } from 'src/stores/auth-store';
import BaseSpinner from 'components/base/BaseSpinner.vue';
import BaseSystemDialog from 'components/base/BaseSystemDialog.vue';
import AppFooter from 'components/AppFooter.vue';
import LanguageToggle from 'components/navigation/language-toggle.vue';
import HeaderAuthButton from 'components/navigation/header-auth-button.vue';
import { useI18n } from 'vue-i18n';

interface NavItem {
  name: string;
  label: string;
  icon: string;
  to?: string;
  link?: string;
}

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const courseStore = useCourseStore();
const categoryStore = useCategoryStore();
const authStore = useAuthStore();
const { t, locale } = useI18n({ useScope: 'global' });
categoryStore.init();

/**
 * Notification Helper Functions
 */
function isTeachingNotificationRole(role: string | undefined): boolean {
  return ['teach', 'instructor'].includes(role ?? '');
}

function isAdminNotificationRole(role: string | undefined): boolean {
  return role === 'admin';
}

function getNotificationItemsForRole(role: string | undefined) {
  if (isAdminNotificationRole(role)) {
    return [
      {
        id: 901,
        title: 'รอตรวจหมวดหมู่ใหม่ 3 รายการ',
        message: 'มีคำขอเพิ่มหมวดหมู่รายวิชาจากทีมวิชาการ',
        time: 'วันนี้ 10:15',
        icon: 'category',
        iconBg: '#e0f2fe',
        iconColor: '#0369a1',
        action: '/admin/basics',
        read: false,
      },
      {
        id: 902,
        title: 'ภาพ Hero ใกล้หมดอายุ',
        message: 'แบนเนอร์แคมเปญ Summer Credit Bank สิ้นสุดวันที่ 31 พ.ค.',
        time: 'วันนี้ 08:40',
        icon: 'image',
        iconBg: '#fff7ed',
        iconColor: '#c2410c',
        action: '/admin/basics',
        read: false,
      },
      {
        id: 903,
        title: 'ข้อมูลระบบถูกอัปเดต',
        message: 'ทีมทะเบียนแก้ไขปีการศึกษาเริ่มต้นล่าสุด',
        time: 'เมื่อวานนี้',
        icon: 'settings',
        iconBg: '#ecfdf5',
        iconColor: '#047857',
        action: '/admin/basics',
        read: true,
      },
    ];
  }

  if (isTeachingNotificationRole(role)) {
    return [
      {
        id: 1,
        title: 'เหลือเวลาอีก 2 วัน',
        message: 'ครบกำหนดให้คะแนนใบงานวิเคราะห์กรณีศึกษา',
        time: 'วันนี้ 09:00',
        icon: 'alarm',
        iconBg: '#ffebee',
        iconColor: '#c62828',
        action: '/instructor/grading',
        read: false,
      },
      {
        id: 2,
        title: 'รอตรวจ 18 รายการ',
        message: 'แบบทดสอบปลายบทที่ 3 ปิดรับคำตอบแล้ว',
        time: '1 ชั่วโมงที่แล้ว',
        icon: 'rate_review',
        iconBg: '#fff3e0',
        iconColor: '#ef6c00',
        action: '/instructor/grading',
        read: false,
      },
      {
        id: 3,
        title: 'นิสิตส่งงานใหม่ 6 รายการ',
        message: 'มีไฟล์รายงานใหม่จากรายวิชาที่กำลังเปิดสอน',
        time: '3 ชั่วโมงที่แล้ว',
        icon: 'upload_file',
        iconBg: '#e3f2fd',
        iconColor: '#1565c0',
        action: '/instructor/notifications',
        read: false,
      },
    ];
  }

  // Student Notifications
  return [
    {
      id: 101,
      title: 'ยินดีต้อนรับสู่ BUU LLL',
      message: 'เริ่มเรียนรู้วันนี้เพื่อสะสมหน่วยกิตและวุฒิบัตร',
      time: 'เมื่อวานนี้',
      icon: 'celebration',
      iconBg: '#e8f5e9',
      iconColor: '#2e7d32',
      action: '/short-courses',
      read: false,
    },
    {
      id: 102,
      title: 'คอร์สใหม่แนะนำ',
      message: 'มีคอร์สใหม่ในหมวดหมู่ที่คุณสนใจ ลองเข้าไปดูกันเลย!',
      time: '2 วันที่แล้ว',
      icon: 'auto_awesome',
      iconBg: '#f3e5f5',
      iconColor: '#7b1fa2',
      action: '/short-courses',
      read: true,
    },
  ];
}

const isTeachingRole = computed(() => isTeachingNotificationRole(authStore.user?.role));
const isAdminRole = computed(() => isAdminNotificationRole(authStore.user?.role));
const isFinanceRole = computed(() => authStore.user?.role === 'finance');
const isCentralFinanceRole = computed(() => authStore.user?.role === 'central_finance');
const isPrivilegedRole = computed(
  () =>
    isTeachingRole.value || isAdminRole.value || isFinanceRole.value || isCentralFinanceRole.value,
);
const userRoleLabel = computed(() => {
  if (isAdminRole.value) {
    return t('profile.roles.admin');
  }

  if (isTeachingRole.value) {
    return t('profile.roles.instructor');
  }

  if (isFinanceRole.value) {
    return t('profile.roles.finance');
  }

  if (isCentralFinanceRole.value) {
    return t('profile.roles.central_finance');
  }

  if (authStore.user?.role === 'staff') {
    return authStore.user.department || 'Staff';
  }

  return authStore.user?.studentId ?? '';
});

const showNavBar = computed(() => {
  const excludedPaths = ['/learn', '/grades', '/video', '/quiz', '/course-home'];
  return !excludedPaths.some((path) => route.path.includes(path));
});

const homeNav = computed<NavItem>(() => ({
  name: 'home',
  label: t('home'),
  icon: 'home',
  to: '/main',
}));

const navItems = computed<NavItem[]>(() => {
  if (isAdminRole.value) {
    return [
      {
        name: 'admin-dashboard',
        label: 'แดชบอร์ด',
        icon: 'dashboard_customize',
        to: '/admin/dashboard',
      },
      {
        name: 'admin-basics',
        label: 'จัดการข้อมูลพื้นฐาน',
        icon: 'tune',
        to: '/admin/basics',
      },
      {
        name: 'admin-reports',
        label: 'รายงาน',
        icon: 'analytics',
        to: '/admin/reports',
      },
    ];
  }

  if (isFinanceRole.value) {
    return [
      {
        name: 'finance-dashboard',
        label: 'แดชบอร์ดการเงิน',
        icon: 'payments',
        to: '/finance/dashboard',
      },
      {
        name: 'finance-source-of-funds-chart',
        label: 'ผังแหล่งเงิน',
        icon: 'schema',
        to: '/finance/source-of-funds-chart',
      },
      {
        name: 'finance-payment-import',
        label: 'นำเข้าชำระเงิน',
        icon: 'upload_file',
        to: '/finance/payment-import',
      },
      {
        name: 'finance-receipts',
        label: 'จัดการใบเสร็จ',
        icon: 'receipt_long',
        to: '/finance/receipts',
      },
    ];
  }

  if (isCentralFinanceRole.value) {
    return [
      {
        name: 'central-finance-dashboard',
        label: 'แดชบอร์ดกองคลัง',
        icon: 'analytics',
        to: '/central-finance/dashboard',
      },
      {
        name: 'central-finance-fund-sources',
        label: 'รายการคำขอแหล่งเงิน',
        icon: 'description',
        to: '/central-finance/fund-sources',
      },
      {
        name: 'central-finance-transactions',
        label: 'รายละเอียดรายการรับเงิน',
        icon: 'gavel',
        to: '/central-finance/transactions',
      },
      {
        name: 'central-finance-daily-report',
        label: 'รายงานการรับเงินประจำวัน',
        icon: 'account_balance_wallet',
        to: '/central-finance/daily-report',
      },
    ];
  }

  if (isTeachingRole.value) {
    return [
      {
        name: 'dashboard',
        label: 'หน้าหลักผู้สอน',
        icon: 'dashboard',
        to: '/instructor/dashboard',
      },
      {
        name: 'my-courses-mgmt',
        label: 'จัดการรายวิชา',
        icon: 'library_books',
        to: '/instructor/courses',
      },
      {
        name: 'students-mgmt',
        label: 'รายชื่อนิสิต',
        icon: 'group',
        to: '/instructor/students',
      },
      {
        name: 'learner-chat',
        label: 'สนทนากับผู้เรียน',
        icon: 'forum',
        to: '/instructor/chat',
      },
      {
        name: 'reports',
        label: 'รายงานผล',
        icon: 'bar_chart',
        to: '/instructor/reports',
      },
    ];
  }

  // Student / Default Menu
  return [
    homeNav.value,
    { name: 'category', label: t('category'), icon: 'school' },
    {
      name: 'short-courses',
      label: t('shortCourses'),
      icon: 'menu_book',
      to: '/short-courses',
    },
    {
      name: 'about',
      label: t('about'),
      icon: 'info',
      link: 'https://buulifelong.buu.ac.th',
    },
  ];
});

const categoryMap: Record<string, string> = {
  ภาษาและการสื่อสาร: 'langComm',
  สุขภาพและการแพทย์: 'healthMed',
  การศึกษาและการฝึกอบรม: 'eduTrain',
  อาหารและโภชนาการ: 'foodNutri',
  วิศวกรรมและสถาปัตยกรรม: 'engArch',
  'สังคม การเมืองการปกครอง': 'socPol',
  คณิตศาสตร์และวิทยาศาสตร์: 'mathSci',
  คอมพิวเตอร์และเทคโนโลยี: 'compTech',
  ทักษะชีวิตและการพัฒนาตนเอง: 'lifeSkills',
  ธุรกิจและการบริหารจัดการ: 'busMgmt',
  ศิลปวัฒนธรรมและศาสนา: 'artCult',
  เกษตรและสิ่งแวดล้อม: 'agriEnv',
};

function getCategoryDisplayName(name: string, nameEn?: string): string {
  const labelKey = categoryMap[name];
  if (labelKey) {
    return t(labelKey);
  }

  if (locale.value !== 'th' && nameEn?.trim()) {
    return nameEn;
  }

  return name;
}

const categories = computed(() => {
  return categoryStore.activeCategories.map((category) => ({
    id: category.id,
    name: category.name,
    displayLabel: getCategoryDisplayName(category.name, category.nameEn),
    count: courseStore.courses.filter((course) => course.category === category.name).length,
  }));
});

const drawerOpen = ref(false);
const activeNav = ref('');
const isPageSwitchLoading = ref(false);
const logoutDialogOpen = ref(false);
let pageSwitchLoadingTimer: ReturnType<typeof setTimeout> | null = null;

const PAGE_SWITCH_LOADING_MS = 450;
const pageSwitchLoadingPaths = new Set(['/main', '/profile']);

const notificationPreviewItems = computed(() =>
  getNotificationItemsForRole(authStore.user?.role).slice(0, 3),
);
const notificationUnreadCount = computed(
  () => getNotificationItemsForRole(authStore.user?.role).filter((item) => !item.read).length,
);
const notificationPreviewSubtitle = computed(() =>
  isAdminRole.value
    ? 'รายการสำคัญสำหรับผู้ดูแลระบบ'
    : isTeachingRole.value
      ? 'รายการสำคัญสำหรับผู้สอน'
      : 'ข่าวสารและกิจกรรมการเรียนของคุณ',
);

type AuthPath = '/login' | '/register';

function shouldShowPageSwitchLoading(path: string): boolean {
  return pageSwitchLoadingPaths.has(path) || path.startsWith('/admin');
}

function showPageSwitchLoading(): void {
  if (pageSwitchLoadingTimer) {
    clearTimeout(pageSwitchLoadingTimer);
  }

  isPageSwitchLoading.value = true;
  pageSwitchLoadingTimer = setTimeout(() => {
    isPageSwitchLoading.value = false;
    pageSwitchLoadingTimer = null;
  }, PAGE_SWITCH_LOADING_MS);
}

async function navigateWithPageLoading(path: string): Promise<void> {
  if (router.currentRoute.value.path !== path && shouldShowPageSwitchLoading(path)) {
    showPageSwitchLoading();
  }

  await router.push(path);
}

async function goToAuthPage(path: AuthPath): Promise<void> {
  drawerOpen.value = false;

  if (router.currentRoute.value.path === path) {
    return;
  }

  await router.push(path);
}

function syncActiveNavWithRoute(path: string) {
  if (path === '/main' || path === '/') {
    activeNav.value = courseStore.selectedCategory ? 'category' : 'home';
  } else if (path.includes('/admin/categories')) {
    activeNav.value = 'admin-categories';
  } else if (path.includes('/admin/images')) {
    activeNav.value = 'admin-images';
  } else if (path.includes('/admin/reports')) {
    activeNav.value = 'admin-reports';
  } else if (path.includes('/admin/basics')) {
    activeNav.value = 'admin-basics';
  } else if (path.includes('/admin')) {
    activeNav.value = 'admin-dashboard';
  } else if (path.includes('/short-courses')) {
    // If there's a category in query, highlight 'category' tab, otherwise 'short-courses'
    activeNav.value = route.query.category ? 'category' : 'short-courses';
  } else if (path.includes('/instructor/dashboard')) {
    activeNav.value = 'dashboard';
  } else if (path.includes('/instructor/courses')) {
    activeNav.value = route.query.view === 'table' ? '' : 'my-courses-mgmt';
  } else if (path.includes('/instructor/students')) {
    activeNav.value = 'students-mgmt';
  } else if (path.includes('/instructor/chat')) {
    activeNav.value = 'learner-chat';
  } else if (path.includes('/instructor/certificates')) {
    activeNav.value = 'certificates';
  } else if (path.includes('/notifications')) {
    activeNav.value = '';
  } else if (path.includes('/central-finance/dashboard')) {
    activeNav.value = 'central-finance-dashboard';
  } else if (path.includes('/central-finance/fund-sources')) {
    activeNav.value = 'central-finance-fund-sources';
  } else if (path.includes('/finance/source-of-funds-chart')) {
    activeNav.value = 'finance-source-of-funds-chart';
  } else if (path.includes('/finance/payment-import')) {
    activeNav.value = 'finance-payment-import';
  } else if (path.includes('/finance/receipts')) {
    activeNav.value = 'finance-receipts';
  } else if (path.includes('/finance/dashboard')) {
    activeNav.value = 'finance-dashboard';
  } else if (path.includes('/instructor/reports')) {
    activeNav.value = 'reports';
  } else {
    activeNav.value = '';
  }
}

watch(
  () => route.fullPath,
  (fullPath, previousFullPath) => {
    const path = route.path;
    syncActiveNavWithRoute(path);

    if (!previousFullPath || fullPath === previousFullPath || !shouldShowPageSwitchLoading(path)) {
      return;
    }

    showPageSwitchLoading();
  },
  { immediate: true },
);

onBeforeUnmount(() => {
  if (pageSwitchLoadingTimer) {
    clearTimeout(pageSwitchLoadingTimer);
  }
});

function onLogout() {
  drawerOpen.value = false;
  logoutDialogOpen.value = true;
}

function confirmLogout() {
  authStore.logout();
  logoutDialogOpen.value = false;
  drawerOpen.value = false;
  void router.push('/main');
}

async function onLogoClick() {
  courseStore.setSelectedCategory(null);

  if (isAdminRole.value) {
    activeNav.value = 'admin-dashboard';
    await navigateWithPageLoading('/admin/dashboard');
  } else if (isCentralFinanceRole.value) {
    activeNav.value = 'central-finance-dashboard';
    await navigateWithPageLoading('/central-finance/dashboard');
  } else if (isFinanceRole.value) {
    activeNav.value = 'finance-dashboard';
    await navigateWithPageLoading('/finance/dashboard');
  } else if (isTeachingRole.value) {
    activeNav.value = 'dashboard';
    await navigateWithPageLoading('/instructor/dashboard');
  } else {
    activeNav.value = 'home';
    await navigateWithPageLoading('/main');
  }
}

async function goToProfile() {
  drawerOpen.value = false;
  await navigateWithPageLoading('/profile');
}

async function goToNotifications() {
  drawerOpen.value = false;
  await router.push('/notifications');
}

async function openNotificationPreview(notification: { action?: string }) {
  if (isPrivilegedRole.value && notification.action) {
    await router.push(notification.action);
    return;
  }

  await router.push('/notifications');
}

async function onNavClick(nav: NavItem) {
  drawerOpen.value = false;

  // Clear category when clicking other nav items
  if (nav.name !== 'category') {
    courseStore.setSelectedCategory(null);
  }

  if (nav.link) {
    window.open(nav.link, '_blank');
    // Reset activeNav back to current route since we didn't actually navigate
    setTimeout(() => {
      syncActiveNavWithRoute(route.path);
    }, 50);
  } else if (nav.to) {
    // Show dialog for unimplemented instructor routes
    if (
      isTeachingRole.value &&
      nav.to.startsWith('/instructor/') &&
      ![
        '/instructor/dashboard',
        '/instructor/courses',
        '/instructor/students',
        '/instructor/certificates',
        '/instructor/chat',
      ].includes(nav.to)
    ) {
      $q.dialog({
        title: 'อยู่ระหว่างการพัฒนา',
        message: `หน้า "${nav.label}" กำลังจะเปิดให้บริการในเร็วๆ นี้`,
        ok: { color: 'primary', label: 'ตกลง', unelevated: true },
      });
      return;
    }
    await router.push(nav.to);
  }
}

async function onCategoryClick(category: string) {
  activeNav.value = 'category';
  await router.push({
    path: '/short-courses',
    query: { category },
  });
}
</script>

<style lang="scss" scoped>
.top-toolbar {
  padding: 8px 24px;
  min-height: 72px;
  background: rgb(247, 208, 70);
  border-bottom: none;
  gap: 0;
}

.vertical-divider {
  width: 1px;
  height: 28px;
  background: rgba(255, 255, 255, 0.5);
  align-self: center;
}

.logo {
  user-select: none;
  background: rgba(255, 255, 255, 0.85);
  padding: 6px 16px;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.24s ease;

  &:hover {
    background: #ffffff;
    box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  }

  &__image {
    display: block;
    width: 148px;
    height: auto;
    max-height: 43px;
    object-fit: contain;
  }
}

.mobile-drawer-logo {
  padding: 14px 16px 12px;
}

.mobile-drawer-logo__image {
  display: block;
  width: 142px;
  height: auto;
  object-fit: contain;
}

.profile-menu-avatar__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.nav-profile-avatar {
  outline: 2.5px solid #ffffff;
  outline-offset: 1px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden !important;
  border-radius: 50% !important;
  border: none !important;
  flex-shrink: 0;
}

.nav-notification-btn {
  flex: 0 0 36px;
  width: 36px;
  height: 36px;
  min-height: 36px;
  color: #5c3d00 !important;
  background: rgba(255, 255, 255, 0.72) !important;
  transition:
    transform 0.22s ease,
    background-color 0.22s ease,
    box-shadow 0.22s ease;

  &:hover {
    transform: translateY(-2px);
    background: #ffffff !important;
    box-shadow: 0 6px 16px rgba(17, 24, 39, 0.1);
  }
}

.nav-notification-badge {
  min-width: 17px;
  height: 17px;
  padding: 0 5px;
  font-size: 0.62rem;
  font-weight: 800;
  line-height: 17px;
}

.notification-preview-menu {
  border-radius: 8px;
  box-shadow: 0 18px 42px rgba(17, 24, 39, 0.18);
}

.notification-preview {
  width: min(380px, calc(100vw - 32px));
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 8px;
  background: #ffffff;
}

.notification-preview__header {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  justify-content: space-between;
  padding: 14px 16px;
}

.notification-preview__title {
  color: #263238;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.25;
}

.notification-preview__subtitle {
  margin-top: 2px;
  color: #78909c;
  font-size: 0.78rem;
  font-weight: 700;
}

.notification-preview__count {
  flex: 0 0 auto;
  font-weight: 800;
}

.notification-preview__list {
  max-height: 318px;
  background: #ffffff;
}

.notification-preview__item {
  min-height: 86px;
  padding: 12px 14px;
}

.notification-preview__icon {
  display: grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 8px;
}

.notification-preview__item-title {
  color: #263238;
  font-size: 0.88rem;
  font-weight: 800;
  line-height: 1.35;
}

.notification-preview__item-message {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 3px;
  color: #546e7a;
  font-size: 0.78rem;
  line-height: 1.45;
  -webkit-box-orient: vertical;
  line-clamp: 2;
}

.notification-preview__item-time {
  margin-top: 5px;
  color: #90a4ae;
  font-size: 0.72rem;
  font-weight: 700;
}

.notification-preview__footer {
  padding: 12px 14px;
  background: #fafafa;
}

.notification-preview__all-btn {
  width: 100%;
  min-height: 38px;
  border-radius: 8px;
  font-weight: 800;
}

.nav-actions {
  display: flex;
  align-items: center;
  flex: 0 1 460px;
  flex-wrap: nowrap;
  gap: 8px;
  justify-content: flex-end;
  width: min(460px, 38vw);
  min-width: 0;
}

.nav-actions__language {
  flex: 0 0 auto;
}

.nav-auth-actions {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  flex-wrap: nowrap;
  gap: 8px;
  justify-content: flex-end;
  width: 326px;
}

.nav-user-group {
  display: grid;
  grid-template-columns: minmax(0, 172px) 36px 36px;
  align-items: center;
  flex: 0 1 326px;
  column-gap: 10px;
  justify-content: end;
  height: 46px;
  min-height: 46px;
  width: min(326px, 100%);
  padding: 4px 10px 4px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.58);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.profile-action-menu {
  border-radius: 14px;
  box-shadow: 0 16px 38px rgba(17, 24, 39, 0.16);
}

.nav-profile-summary {
  justify-self: start;
  width: 100%;
  min-width: 0;
}

.profile-action-card {
  width: 238px;
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  background: #ffffff;
}

.profile-action-card__header {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  padding: 12px;
  background: linear-gradient(180deg, rgba(247, 208, 70, 0.16), rgba(255, 255, 255, 0));
}

.profile-action-card__avatar {
  outline: 2px solid #ffffff;
  box-shadow: 0 2px 8px rgba(17, 24, 39, 0.1);
  background: $primary;
}

.profile-action-card__identity {
  min-width: 0;
}

.profile-action-card__name {
  overflow: hidden;
  color: #3d2600;
  font-size: 0.86rem;
  font-weight: 800;
  line-height: 1.25;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-action-card__role {
  overflow: hidden;
  margin-top: 2px;
  color: rgba(61, 38, 0, 0.58);
  font-size: 0.68rem;
  font-weight: 700;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.profile-action-card__list {
  padding: 6px;
}

.profile-action-card__item {
  min-height: 38px;
  border-radius: 10px;
  color: #374151;
  font-size: 0.82rem;
  font-weight: 700;

  &:hover {
    color: #3d2600;
    background: rgba(247, 208, 70, 0.14);
  }
}

.profile-action-card__item-icon {
  min-width: 34px;
  padding-right: 8px;
  color: $primary;
}

.profile-action-card__item--danger {
  color: #b91c1c;

  .profile-action-card__item-icon {
    color: #dc2626;
  }

  &:hover {
    color: #991b1b;
    background: rgba(220, 38, 38, 0.08);
  }
}

.nav-profile-name {
  display: block;
  width: 100%;
  font-size: 0.8rem;
  font-weight: 700;
  color: #3d2600;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-align: left;
}

.nav-profile-role {
  display: block;
  width: 100%;
  font-size: 0.65rem;
  font-weight: 600;
  color: rgba(61, 38, 0, 0.55);
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.route-page-loading {
  min-height: calc(100vh - 112px);
  background: #f6f8f8;
}

.mobile-language-wrapper {
  padding: 4px 12px 10px;
}

.nav-tabs {
  height: 100%;
  flex: 0 0 auto;
  background: rgba(255, 255, 255, 0.55);
  border-radius: 14px;
  padding: 4px;

  :deep(.q-tab) {
    color: #5c3d00;
    font-weight: 600;
    padding: 0 8px;
    flex: 0 0 156px;
    width: 156px;
    max-width: 156px;
    min-width: 156px;
    min-height: 44px;
    font-size: 0.95rem;
    transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      background-color 0.18s ease;
    border-radius: 10px;
    margin: 0 2px;
    letter-spacing: -0.01em;

    &.q-tab--active {
      color: #3d2600;
      background: rgba(255, 255, 255, 0.85);
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.06);
      .q-tab__label {
        font-weight: 700;
      }
      .q-tab__icon {
        color: $primary;
      }
      .q-tab__indicator {
        opacity: 1;
        height: 3px;
        background: $primary;
        border-radius: 4px 4px 0 0;
      }
    }

    &:hover:not(.q-tab--active) {
      background: rgba(255, 255, 255, 0.4);
      color: $primary;
      .q-tab__icon {
        color: $primary;
      }
    }

    .q-tab__content {
      display: inline-grid;
      grid-template-columns: 20px var(--nav-tab-label-width, 84px);
      column-gap: 8px;
      width: max-content;
      max-width: 100%;
      justify-content: center;
      align-items: center;
      min-height: 44px;
      margin: 0 auto;
      padding: 0;
    }

    .q-tab__icon {
      grid-column: 1;
      justify-self: center;
      flex: 0 0 20px;
      width: 20px;
      font-size: 1.2rem;
      margin-right: 0;
      transition: transform 0.3s ease;
      color: #4b5563;
      text-align: center;
    }

    &:hover .q-tab__icon {
      transform: scale(1.1);
      color: $primary;
    }

    .q-tab__label {
      grid-column: 2;
      justify-self: start;
      min-width: 0;
      flex: 0 1 auto;
      font-size: 0.95rem;
      text-align: left;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 100%;
    }

    .q-tab__indicator {
      height: 3px;
      border-radius: 3px 3px 0 0;
      bottom: 4px;
    }

    .q-focus-helper {
      color: $primary;
    }

    .q-focus-helper::before,
    .q-focus-helper::after {
      background: rgba($primary, 0.1);
    }
  }

  :deep(.nav-tab--home),
  :deep(.nav-tab--about) {
    --nav-tab-label-width: 78px;
  }

  :deep(.nav-tab--category) {
    --nav-tab-label-width: 82px;
  }

  :deep(.nav-tab--home),
  :deep(.nav-tab--category),
  :deep(.nav-tab--about) {
    flex-basis: 148px;
    width: 148px;
    max-width: 148px;
    min-width: 148px;
  }

  :deep(.nav-tab--short-courses) {
    --nav-tab-label-width: 112px;
    flex-basis: 182px;
    width: 182px;
    max-width: 182px;
    min-width: 182px;
  }

  :deep(.nav-tab--dashboard) {
    --nav-tab-label-width: 112px;
    flex-basis: 172px;
    width: 172px;
    max-width: 172px;
    min-width: 172px;
  }

  :deep(.nav-tab--my-courses-mgmt),
  :deep(.nav-tab--students-mgmt),
  :deep(.nav-tab--learner-chat) {
    --nav-tab-label-width: 132px;
    flex-basis: 194px;
    width: 194px;
    max-width: 194px;
    min-width: 194px;
  }

  :deep(.nav-tab--reports) {
    --nav-tab-label-width: 96px;
    flex-basis: 160px;
    width: 160px;
    max-width: 160px;
    min-width: 160px;
  }

  :deep(.nav-tab--admin-dashboard) {
    --nav-tab-label-width: 80px;
    flex-basis: 144px;
    width: 144px;
    max-width: 144px;
    min-width: 144px;
  }

  :deep(.nav-tab--admin-basics) {
    --nav-tab-label-width: 142px;
    flex-basis: 188px;
    width: 188px;
    max-width: 188px;
    min-width: 188px;
  }

  :deep(.nav-tab--admin-reports) {
    --nav-tab-label-width: 72px;
    flex-basis: 136px;
    width: 136px;
    max-width: 136px;
    min-width: 136px;
  }

  :deep(.nav-tab--finance-receipts) {
    --nav-tab-label-width: 116px;
    flex-basis: 166px;
    width: 166px;
    max-width: 166px;
    min-width: 166px;
  }

  :deep(.nav-tab--finance-dashboard) {
    --nav-tab-label-width: 136px;
    flex-basis: 188px;
    width: 188px;
    max-width: 188px;
    min-width: 188px;
  }

  :deep(.nav-tab--finance-source-of-funds-chart) {
    --nav-tab-label-width: 144px;
    flex-basis: 196px;
    width: 196px;
    max-width: 196px;
    min-width: 196px;
  }

  :deep(.nav-tab--finance-payment-import) {
    --nav-tab-label-width: 122px;
    flex-basis: 174px;
    width: 174px;
    max-width: 174px;
    min-width: 174px;
  }
}

// ── Category Menu ───────────────────────────────────────────
@media (max-width: 1320px) {
  .top-toolbar {
    padding-inline: 14px;
  }

  .logo {
    padding-inline: 12px;
  }

  .logo__image {
    width: 128px;
  }

  .vertical-divider {
    margin-left: 12px;
    margin-right: 12px;
  }

  .nav-tabs {
    margin-left: 8px;

    :deep(.q-tab) {
      padding-inline: 6px;
      margin-inline: 1px;
    }

    :deep(.nav-tab--finance-receipts) {
      --nav-tab-label-width: 104px;
      flex-basis: 152px;
      width: 152px;
      max-width: 152px;
      min-width: 152px;
    }

    :deep(.nav-tab--finance-dashboard) {
      --nav-tab-label-width: 126px;
      flex-basis: 174px;
      width: 174px;
      max-width: 174px;
      min-width: 174px;
    }

    :deep(.nav-tab--finance-source-of-funds-chart) {
      --nav-tab-label-width: 126px;
      flex-basis: 174px;
      width: 174px;
      max-width: 174px;
      min-width: 174px;
    }

    :deep(.nav-tab--finance-payment-import) {
      --nav-tab-label-width: 112px;
      flex-basis: 158px;
      width: 158px;
      max-width: 158px;
      min-width: 158px;
    }
  }

  .nav-actions {
    flex-basis: 252px;
    width: 252px;
  }

  .nav-user-group {
    grid-template-columns: 36px 36px;
    width: 104px;
    flex-basis: 104px;
    padding: 4px 8px;
  }

  .nav-profile-summary {
    display: none;
  }
}

.category-mega-menu {
  min-width: 960px;
  max-width: 95vw;
  border-top: 4px solid #f5a623;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.15);
}

.category-menu-content {
  background: white;
  padding: 32px;
}

.category-menu-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 32px;
}

.category-item {
  border-radius: 8px;
  padding: 12px 20px;
  transition: all 0.2s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    background: rgba($primary, 0.08);
    transform: translateX(4px);
    .text-subtitle1 {
      color: $primary !important;
    }
  }
}

.category-badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  font-weight: 700;
  min-width: 28px;
  text-align: center;
}

@media (max-width: 1023px) {
  .category-menu-grid {
    grid-template-columns: 1fr;
    gap: 4px;
  }
}

// ── Search Bar ───────────────────────────────────────────────
.search-container {
  flex: 1;
  max-width: 600px;
}

.search-input {
  :deep(.q-field__control) {
    background: #f1f3f4;
    border-color: transparent;
    transition: all 0.3s ease;

    &:hover {
      background: #e8eaed;
    }

    &::before {
      border: none !important;
    }
  }

  &.q-field--focused {
    :deep(.q-field__control) {
      background: white;
      box-shadow: 0 1px 6px rgba(32, 33, 36, 0.28);
    }
  }
}

.scroll-top-btn {
  background-color: $primary !important;
  color: white !important;
  border: 2px solid white;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  width: 46px;
  height: 46px;
  border-radius: 50% !important;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);

  &:hover {
    background-color: mix(#000, $primary, 8%) !important;
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0, 0, 0, 0.25);
  }
}
</style>
