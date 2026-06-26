<template>
  <!-- Course Toolbar -->
  <q-toolbar class="top-toolbar">
    <!-- Logo -->
    <a
      :href="resolveFullUrl('/main')"
      class="logo row items-center cursor-pointer"
      style="text-decoration: none"
      @click.prevent="onLogoClick"
    >
      <img
        src="~assets/brand/buu-lll-logo.png"
        class="logo__image"
        alt="BUU LLL"
        loading="eager"
        decoding="sync"
      />
    </a>

    <div class="vertical-divider q-mx-lg"></div>

    <!-- Course-specific navigation tabs -->
    <q-tabs
      :model-value="activeNav"
      align="left"
      active-color="primary"
      indicator-color="primary"
      dense
      no-caps
      inline-label
      narrow-indicator
      class="nav-tabs"
    >
      <q-tab
        name="menu"
        icon="menu"
        :label="$t('learning.menu')"
        class="nav-tab nav-tab--home"
        @click="emit('toggleDrawer')"
      ></q-tab>
      <q-tab
        name="home"
        icon="home"
        :label="$t('learning.home')"
        class="nav-tab nav-tab--home"
        @click="onTabClick('/course-home', $event)"
      />

      <q-tab
        name="my-courses"
        icon="auto_stories"
        :label="$t('learning.myCourses')"
        class="nav-tab nav-tab--my-courses"
        @mouseenter="openMenu"
        @mouseleave="closeMenu"
      >
        <q-menu
          v-model="myCoursesMenu"
          @mouseenter="openMenu"
          @mouseleave="closeMenu"
          transition-show="jump-down"
          transition-hide="jump-up"
          fit
          class="my-courses-dropdown shadow-10"
          :offset="[0, 8]"
        >
          <q-list style="min-width: 320px" class="q-py-sm">
            <div class="text-overline q-px-md q-pb-sm text-grey-6" style="letter-spacing: 1px">
              {{ $t('profile.courses.registeredTitle') }}
            </div>
            <q-item
              v-for="course in registeredCourses"
              :key="course.id"
              clickable
              v-ripple
              @click="goToCourse(course)"
              class="course-menu-item q-mx-sm"
              style="border-radius: 10px"
              :active="course.id === courseId"
              active-class="bg-orange-1 text-primary"
            >
              <q-item-section avatar>
                <q-avatar
                  :icon="course.cover.icon"
                  :color="course.id === courseId ? 'primary' : 'grey-2'"
                  :text-color="course.id === courseId ? 'white' : 'grey-7'"
                  size="32px"
                />
              </q-item-section>
              <q-item-section>
                <q-item-label lines="1" class="text-weight-bold">{{ course.title }}</q-item-label>
                <q-item-label caption>{{ course.code }}</q-item-label>
              </q-item-section>
              <q-item-section side v-if="course.id === courseId">
                <q-icon name="check_circle" color="primary" size="20px" />
              </q-item-section>
            </q-item>
            <q-item v-if="registeredCourses.length === 0" class="text-grey-6 text-center q-pa-md">
              {{ $t('profile.courses.empty') }}
            </q-item>
          </q-list>
        </q-menu>
      </q-tab>

      <q-tab
        v-if="route.path !== '/course-home'"
        name="this-course"
        icon="school"
        :label="$t('learning.thisCourse')"
        class="nav-tab nav-tab--this-course"
        @mouseenter="openThisCourseMenu"
        @mouseleave="closeThisCourseMenu"
      >
        <q-menu
          v-model="thisCourseMenu"
          @mouseenter="openThisCourseMenu"
          @mouseleave="closeThisCourseMenu"
          transition-show="jump-down"
          transition-hide="jump-up"
          class="this-course-dropdown shadow-12"
          :offset="[0, 0]"
          square
        >
          <q-list style="min-width: 220px" class="q-py-sm">
            <q-item clickable v-ripple class="this-course-menu-item">
              <q-item-section avatar class="this-course-icon-section">
                <q-icon name="format_list_numbered" size="20px" color="grey-7" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{
                  $t('thisCourse.sections')
                }}</q-item-label>
              </q-item-section>
              <q-item-section side
                ><q-icon name="chevron_right" size="18px" color="grey-5"
              /></q-item-section>
            </q-item>
            <q-item clickable v-ripple class="this-course-menu-item">
              <q-item-section avatar class="this-course-icon-section">
                <q-icon name="groups" size="20px" color="deep-purple-5" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{
                  $t('thisCourse.participants')
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              clickable
              v-ripple
              class="this-course-menu-item"
              @click="onTabClick(`/course/${courseId}/grades`, $event)"
              @auxclick.prevent="onTabClick(`/course/${courseId}/grades`, $event)"
            >
              <q-item-section avatar class="this-course-icon-section">
                <q-icon name="grid_on" size="20px" color="teal-6" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{
                  $t('thisCourse.grades')
                }}</q-item-label>
              </q-item-section>
            </q-item>
            <q-item
              clickable
              v-ripple
              class="this-course-menu-item"
              @click="onTabClick(`/course/${courseId}/learn`, $event)"
              @auxclick.prevent="onTabClick(`/course/${courseId}/learn`, $event)"
            >
              <q-item-section avatar class="this-course-icon-section">
                <q-icon name="description" size="20px" color="orange-7" />
              </q-item-section>
              <q-item-section>
                <q-item-label class="text-weight-medium">{{
                  $t('thisCourse.content')
                }}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-tab>

      <q-tab
        name="lll-system"
        icon="stars"
        :label="$t('learning.systemTitle')"
        class="nav-tab nav-tab--lll-system"
        @click="onTabClick('/profile', $event)"
      />
    </q-tabs>

    <q-space />

    <!-- Right: View Mode + User Actions -->
    <div class="gt-sm nav-actions row items-center no-wrap">
      <LanguageToggle class="nav-actions__language" />

      <div class="nav-user-group">
        <div class="nav-profile-summary column items-start justify-center gt-xs">
          <span class="nav-profile-name">
            {{ authStore.user?.firstNameTh }} {{ authStore.user?.lastNameTh }}
          </span>
          <span class="nav-profile-role">
            {{ userRoleLabel }}
          </span>
        </div>
        <q-avatar size="36px" class="nav-profile-avatar cursor-pointer" role="button" tabindex="0">
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
                  @click="onTabClick('/profile', $event)"
                  @auxclick.prevent="onTabClick('/profile', $event)"
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
                    <div class="notification-preview__item-title">
                      {{ notification.title }}
                    </div>
                    <div class="notification-preview__item-message">
                      {{ notification.message }}
                    </div>
                    <div class="notification-preview__item-time">
                      {{ notification.time }}
                    </div>
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
    </div>

    <div class="lt-md row items-center">
      <q-btn flat round icon="account_circle" color="grey-7" size="sm">
        <q-menu>
          <q-list style="min-width: 150px">
            <q-item
              clickable
              v-ripple
              @click="onTabClick('/profile', $event)"
              @auxclick.prevent="onTabClick('/profile', $event)"
            >
              <q-item-section>{{ $t('myProfile') }}</q-item-section>
            </q-item>
            <q-item
              v-if="isTeachingRole || isFinanceRole"
              clickable
              v-ripple
              @click="goToNotifications"
            >
              <q-item-section>{{ $t('notifications') }}</q-item-section>
            </q-item>
            <q-item clickable v-ripple @click="onLogout">
              <q-item-section class="text-negative">{{ $t('logout') }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
  </q-toolbar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import { useMyRegisteredCourses } from 'src/composables/use-my-registered-courses';
import { useI18n } from 'vue-i18n';
import LanguageToggle from 'components/navigation/language-toggle.vue';
import { pushMoodleLearningRoute } from 'src/utils/moodle-navigation';
import { isNewTabClick, openInNewTab, resolveFullUrl } from 'src/composables/use-nav-link';
import type { Course } from 'src/types/course';

const emit = defineEmits<{
  (e: 'toggleDrawer'): void;
}>();

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const authStore = useAuthStore();
const { t } = useI18n({ useScope: 'global' });
const { myRegisteredCourseEntries } = useMyRegisteredCourses();

const myCoursesMenu = ref(false);
const thisCourseMenu = ref(false);
let menuTimer: ReturnType<typeof setTimeout> | null = null;
let thisCourseMenuTimer: ReturnType<typeof setTimeout> | null = null;

const courseId = computed<string>(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  return id || '';
});

const registeredCourses = computed<Course[]>(() => {
  return myRegisteredCourseEntries.value.map((entry) => entry.course);
});

const activeNav = computed<string>({
  get: () => {
    const path = route.path;
    if (path === '/course-home') return 'home';
    if (
      path.includes('/learn') ||
      path.includes('/video') ||
      path.includes('/quiz') ||
      path.includes('/grades')
    ) {
      return 'this-course';
    }
    if (path === '/main' || path === '/') return 'lll-system';
    return 'home';
  },
  set: () => {},
});

const isTeachingRole = computed<boolean>(() => isTeachingNotificationRole(authStore.user?.role));
const isFinanceRole = computed<boolean>(() => authStore.user?.role === 'finance');

const userRoleLabel = computed<string>(() => {
  if (authStore.user?.role === 'admin') {
    return 'Admin';
  }

  if (isTeachingRole.value) {
    return t('profile.roles.instructor');
  }

  if (isFinanceRole.value) {
    return t('profile.roles.finance');
  }

  if (authStore.user?.role === 'staff') {
    return authStore.user.department || 'Staff';
  }
  return authStore.user?.studentId ?? '';
});

const notificationPreviewItems = computed(() =>
  getNotificationItemsForRole(authStore.user?.role).slice(0, 3),
);
const notificationUnreadCount = computed<number>(
  () => getNotificationItemsForRole(authStore.user?.role).filter((item) => !item.read).length,
);
const notificationPreviewSubtitle = computed<string>(() =>
  isTeachingRole.value ? 'รายการสำคัญสำหรับผู้สอน' : 'ข่าวสารและกิจกรรมการเรียนของคุณ',
);

const goToCourse = (course: Course): void => {
  if (authStore.user?.username) {
    $q.notify({
      type: 'info',
      message: 'กำลังพาเข้าสู่ Moodle',
      position: 'top',
      timeout: 1800,
    });
    pushMoodleLearningRoute(router, course.id, undefined, {
      moodleCourseId: course.moodleId ?? course.id,
      courseCode: course.code,
    });
    return;
  }

  void router.push(`/course/${course.id}/learn`);
};

const openMenu = (): void => {
  if (menuTimer) clearTimeout(menuTimer);
  myCoursesMenu.value = true;
};

const closeMenu = (): void => {
  menuTimer = setTimeout(() => {
    myCoursesMenu.value = false;
  }, 150);
};

const openThisCourseMenu = (): void => {
  if (thisCourseMenuTimer) clearTimeout(thisCourseMenuTimer);
  thisCourseMenu.value = true;
};

const closeThisCourseMenu = (): void => {
  thisCourseMenuTimer = setTimeout(() => {
    thisCourseMenu.value = false;
  }, 150);
};

function onLogout(): void {
  authStore.logout();
  void router.push('/main');
}

function onLogoClick(event: Event): void {
  if (isNewTabClick(event)) return;
  void router.push('/main');
}

function onTabClick(path: string, event: Event): void {
  if (isNewTabClick(event)) {
    event.preventDefault();
    event.stopPropagation();
    openInNewTab(path);
    return;
  }
  void router.push(path);
}

function isTeachingNotificationRole(role: string | undefined): boolean {
  return ['teach', 'instructor'].includes(role ?? '');
}

interface NotificationItem {
  id: number;
  title: string;
  message: string;
  time: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  action: string;
  read: boolean;
}

function getNotificationItemsForRole(role: string | undefined): NotificationItem[] {
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

async function goToNotifications(): Promise<void> {
  await router.push('/notifications');
}

async function openNotificationPreview(notification: { action?: string }): Promise<void> {
  if (isTeachingRole.value && notification.action) {
    await router.push(notification.action);
    return;
  }

  await router.push('/notifications');
}
</script>

<style lang="scss" scoped>
.top-toolbar {
  padding: 8px 24px;
  min-height: 72px;
  background: rgb(247, 208, 70);
  border-bottom: none;
  flex-shrink: 0;
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
      grid-template-columns: 20px var(--nav-tab-label-width, 92px);
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
    }

    .q-tab__indicator {
      height: 3px;
      border-radius: 3px 3px 0 0;
      bottom: 4px;
    }
  }

  :deep(.nav-tab--home) {
    --nav-tab-label-width: 78px;
    flex-basis: 156px;
    width: 156px;
    max-width: 156px;
    min-width: 156px;
  }
  :deep(.nav-tab--my-courses) {
    --nav-tab-label-width: 108px;
    flex-basis: 176px;
    width: 176px;
    max-width: 176px;
    min-width: 176px;
  }
  :deep(.nav-tab--this-course) {
    --nav-tab-label-width: 108px;
    flex-basis: 176px;
    width: 176px;
    max-width: 176px;
    min-width: 176px;
  }
  :deep(.nav-tab--lll-system) {
    --nav-tab-label-width: 156px;
    flex-basis: 226px;
    width: 226px;
    max-width: 226px;
    min-width: 226px;
  }
}

// ── View toggle in toolbar ───────────────────────────────────
.view-toggle-group {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.45);
  border-radius: 12px;
  padding: 4px;
}

.view-btn-active {
  background: rgba(255, 255, 255, 0.25) !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  border-radius: 8px !important;
}

.view-btn-inactive {
  color: rgba(255, 255, 255, 0.65) !important;
  border-radius: 8px !important;
  transition: all 0.2s ease;

  &:hover {
    color: white !important;
    background: rgba(255, 255, 255, 0.12) !important;
  }
}

// ── Right-side user group ────────────────────────────────────
.nav-actions {
  display: flex;
  align-items: center;
  flex: 0 1 620px;
  flex-wrap: nowrap;
  gap: 8px;
  width: min(620px, 42vw);
  min-width: 0;
}

.nav-actions__language {
  flex: 0 0 auto;
}

.nav-user-group {
  display: grid;
  grid-template-columns: minmax(0, 172px) 36px 36px;
  align-items: center;
  flex: 0 0 auto;
  column-gap: 10px;
  justify-content: end;
  height: 46px;
  min-height: 46px;
  width: 326px;
  padding: 4px 10px 4px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.58);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.nav-profile-summary {
  justify-self: start;
  width: 100%;
  min-width: 0;
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

.nav-profile-avatar {
  outline: 2.5px solid #ffffff;
  outline-offset: 1px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden !important;
  border-radius: 50% !important;
  flex-shrink: 0;
}

.profile-menu-avatar__image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
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

:global(.profile-action-menu) {
  overflow: hidden !important;
  border-radius: 18px !important;
  background: transparent !important;
  clip-path: inset(0 round 18px);
  box-shadow: none !important;
  filter: drop-shadow(0 16px 38px rgba(17, 24, 39, 0.16));
}

.profile-action-card {
  width: 238px;
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 18px;
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

// ── This Course Dropdown ────────────────────────────────────
.this-course-dropdown {
  border-top: 3px solid var(--q-primary);
  border-radius: 0 0 12px 12px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.18) !important;
  overflow: hidden;
}

.this-course-menu-item {
  min-height: 48px;
  padding: 6px 16px;
  transition: background 0.18s ease;

  &:hover {
    background: rgba(var(--q-primary-rgb, 26, 115, 232), 0.07);
    .q-item__label {
      color: var(--q-primary);
    }
  }
}

.this-course-icon-section {
  min-width: 36px !important;
  padding-right: 4px;
}

.course-menu-item {
  transition: all 0.3s ease;
  &:hover {
    background-color: #e3f2fd;
    color: var(--q-primary);
  }
}
</style>
