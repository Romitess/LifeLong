<template>
  <q-layout view="hHh lpR fFf">
    <q-header class="bg-white shadow-2">
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
              class="nav-tab"
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
                  <div class="row q-col-gutter-xl">
                    <div class="col-12 col-md-6">
                      <q-list dense padding>
                        <q-item
                          v-for="cat in categories.slice(0, 6)"
                          :key="cat.label"
                          clickable
                          v-ripple
                          class="category-item"
                          @click="onCategoryClick(cat.label)"
                        >
                          <q-item-section>
                            <div class="row items-center justify-between no-wrap full-width">
                              <span
                                class="text-subtitle1 text-weight-medium text-blue-grey-9 text-no-wrap q-mr-lg"
                              >
                                {{ $t(cat.labelKey) }}
                              </span>
                              <q-badge rounded color="teal" class="category-badge">{{
                                cat.count
                              }}</q-badge>
                            </div>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
                    <div class="col-12 col-md-6">
                      <q-list dense padding>
                        <q-item
                          v-for="cat in categories.slice(6)"
                          :key="cat.label"
                          clickable
                          v-ripple
                          class="category-item"
                          @click="onCategoryClick(cat.label)"
                        >
                          <q-item-section>
                            <div class="row items-center justify-between no-wrap full-width">
                              <span
                                class="text-subtitle1 text-weight-medium text-blue-grey-9 text-no-wrap q-mr-lg"
                              >
                                {{ $t(cat.labelKey) }}
                              </span>
                              <q-badge rounded color="teal" class="category-badge">{{
                                cat.count
                              }}</q-badge>
                            </div>
                          </q-item-section>
                        </q-item>
                      </q-list>
                    </div>
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
              class="nav-tab"
              @click="onNavClick(nav)"
            />
          </template>
        </q-tabs>

        <q-space />

        <div class="gt-sm row items-center q-gutter-sm">
          <LanguageToggle class="q-mr-md" />

          <template v-if="!authStore.isLoggedIn">
            <q-btn
              unelevated
              no-caps
              :label="$t('login')"
              icon-right="login"
              color="amber"
              text-color="white"
              class="header-auth-btn header-auth-btn--login text-weight-bold"
              style="border-radius: 8px; padding: 0 16px"
              @click="goToAuthPage('/login')"
            />
            <q-btn
              outline
              no-caps
              :label="$t('register')"
              icon-right="person_add"
              color="grey-4"
              text-color="blue-grey-8"
              class="header-auth-btn header-auth-btn--register text-weight-medium bg-white"
              style="border-radius: 8px; padding: 0 16px"
              @click="goToAuthPage('/register')"
            />
          </template>
          <template v-else>
            <div class="row items-center q-gutter-sm q-mr-md">
              <div class="column items-end justify-center q-mr-xs gt-xs">
                <span class="text-caption text-weight-bold text-dark lh-1"
                  >{{ authStore.user?.firstNameTh }} {{ authStore.user?.lastNameTh }}</span
                >
                <span class="text-caption text-grey-6 lh-1" style="font-size: 0.65rem">
                  {{ isTeachingRole ? 'Teacher' : authStore.user?.studentId }}
                </span>
              </div>
              <q-avatar size="36px" class="cursor-pointer shadow-1" @click="goToProfile">
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
              </q-avatar>
            </div>
            <q-btn
              outline
              no-caps
              :label="$t('logout')"
              color="grey-6"
              size="sm"
              class="logout-btn q-ml-sm"
              @click="onLogout"
            />
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
import { useAuthStore } from 'src/stores/auth-store';
import { MOCK_COURSES } from 'src/data/mock-courses';
import BaseSpinner from 'components/base/BaseSpinner.vue';
import BaseSystemDialog from 'components/base/BaseSystemDialog.vue';
import AppFooter from 'components/AppFooter.vue';
import LanguageToggle from 'components/navigation/language-toggle.vue';
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
const authStore = useAuthStore();
const { t } = useI18n({ useScope: 'global' });
const isTeachingRole = computed(() => ['teach', 'instructor'].includes(authStore.user?.role ?? ''));

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

const CATEGORY_LIST = [
  'ภาษาและการสื่อสาร',
  'สุขภาพและการแพทย์',
  'การศึกษาและการฝึกอบรม',
  'อาหารและโภชนาการ',
  'วิศวกรรมและสถาปัตยกรรม',
  'สังคม การเมืองการปกครอง',
  'คณิตศาสตร์และวิทยาศาสตร์',
  'คอมพิวเตอร์และเทคโนโลยี',
  'ทักษะชีวิตและการพัฒนาตนเอง',
  'ธุรกิจและการบริหารจัดการ',
  'ศิลปวัฒนธรรมและศาสนา',
  'เกษตรและสิ่งแวดล้อม',
];

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

const categories = computed(() => {
  return CATEGORY_LIST.map((label) => ({
    label,
    labelKey: categoryMap[label] || '',
    count: MOCK_COURSES.filter((course) => course.category === label).length,
  }));
});

const drawerOpen = ref(false);
const activeNav = ref('');
const isPageSwitchLoading = ref(false);
const logoutDialogOpen = ref(false);
let pageSwitchLoadingTimer: ReturnType<typeof setTimeout> | null = null;

const PAGE_SWITCH_LOADING_MS = 450;
const pageSwitchLoadingPaths = new Set(['/main', '/profile']);

type AuthPath = '/login' | '/register';

function shouldShowPageSwitchLoading(path: string): boolean {
  return pageSwitchLoadingPaths.has(path);
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
    activeNav.value = 'home';
  } else if (path.includes('/short-courses')) {
    activeNav.value = 'short-courses';
  } else if (path.includes('/instructor/dashboard')) {
    activeNav.value = 'dashboard';
  } else if (path.includes('/instructor/courses')) {
    activeNav.value = 'my-courses-mgmt';
  } else if (path.includes('/instructor/students')) {
    activeNav.value = 'students-mgmt';
  } else if (path.includes('/instructor/reports')) {
    activeNav.value = 'reports';
  } else {
    activeNav.value = '';
  }
}

watch(
  () => route.path,
  (path, previousPath) => {
    syncActiveNavWithRoute(path);

    if (!previousPath || path === previousPath || !shouldShowPageSwitchLoading(path)) {
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
  activeNav.value = 'home';
  await navigateWithPageLoading('/main');
}

async function goToProfile() {
  drawerOpen.value = false;
  await navigateWithPageLoading('/profile');
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
      !['/instructor/dashboard', '/instructor/courses', '/instructor/students'].includes(nav.to)
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
  courseStore.setSelectedCategory(category);
  if (router.currentRoute.value.path !== '/main') {
    await router.push('/main');
  }
}
</script>

<style lang="scss" scoped>
.top-toolbar {
  padding: 8px 32px;
  min-height: 72px;
  background: white;
}

.vertical-divider {
  width: 1px;
  height: 28px;
  background: rgba(17, 24, 39, 0.1);
  align-self: center;
}

.logo {
  user-select: none;

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

.logout-btn {
  border-radius: 20px;
  padding: 4px 20px;
  font-weight: 600;
  min-width: 112px;
}

.header-auth-btn {
  justify-content: center;
  white-space: nowrap;
}

.header-auth-btn--login {
  min-width: 104px;
}

.header-auth-btn--register {
  min-width: 144px;
}

.profile-menu-avatar__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  :deep(.q-tab) {
    color: #4b5563; // text-grey-700
    font-weight: 600;
    padding: 0 20px;
    min-width: auto;
    min-height: 48px;
    font-size: 0.95rem;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    border-radius: 12px;
    margin: 0 4px;
    letter-spacing: -0.01em;

    &.q-tab--active {
      color: $primary;
      background: transparent;
      .q-tab__label {
        font-weight: 700;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
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

    &:hover {
      color: $primary;
      background: transparent;
      transform: translateY(-2px);
      .q-tab__label {
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }
      .q-tab__icon {
        color: $primary;
      }
    }

    .q-tab__content {
      min-height: 48px;
      padding: 0 8px;
    }

    .q-tab__icon {
      font-size: 1.2rem;
      margin-right: 6px;
      transition: all 0.3s ease;
      color: #4b5563;
    }

    &:hover .q-tab__icon {
      transform: scale(1.1);
      color: $primary;
    }

    .q-tab__label {
      font-size: 0.95rem;
    }

    .q-tab__indicator {
      height: 3px;
      border-radius: 3px 3px 0 0;
      bottom: 4px;
    }
  }
}

// ── Category Menu ───────────────────────────────────────────
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

.category-item {
  border-radius: 8px;
  padding: 12px 20px;
  margin-bottom: 4px;
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
