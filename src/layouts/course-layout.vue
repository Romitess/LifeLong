<template>
  <!-- Course Toolbar -->
  <q-toolbar class="top-toolbar">
    <!-- Logo -->
    <div class="logo row items-center cursor-pointer" @click="$router.push('/main')">
      <img
        src="~assets/brand/buu-lll-logo.png"
        class="logo__image"
        alt="BUU LLL"
        loading="eager"
        decoding="sync"
      />
    </div>

    <div class="vertical-divider q-mx-lg"></div>

    <!-- Course-specific navigation tabs -->
    <q-tabs
      v-model="activeNav"
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
        @click="$router.push('/course-home')"
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
              @click="$router.push(`/course/${course.id}/learn`)"
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
              @click="$router.push(`/course/${courseId}/grades`)"
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
              @click="$router.push(`/course/${courseId}/learn`)"
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
        @click="$router.push('/profile')"
      />
    </q-tabs>

    <q-space />

    <!-- Right: View Mode + User Actions -->
    <div class="nav-actions row items-center no-wrap">
      <div class="view-toggle-group row items-center q-mr-sm">
        <q-btn
          :flat="isFullscreen"
          :unelevated="!isFullscreen"
          round
          dense
          icon="view_agenda"
          size="sm"
          :class="!isFullscreen ? 'view-btn-active' : 'view-btn-inactive'"
          @click="isFullscreen = false"
        >
          <q-tooltip
            anchor="bottom middle"
            self="top middle"
            :offset="[0, 8]"
            class="bg-dark text-white text-caption"
          >
            มุมมองมาตรฐาน
          </q-tooltip>
        </q-btn>
        <q-btn
          :flat="!isFullscreen"
          :unelevated="isFullscreen"
          round
          dense
          icon="fullscreen"
          size="sm"
          :class="isFullscreen ? 'view-btn-active' : 'view-btn-inactive'"
          @click="isFullscreen = true"
        >
          <q-tooltip
            anchor="bottom middle"
            self="top middle"
            :offset="[0, 8]"
            class="bg-dark text-white text-caption"
          >
            มุมมองเต็มหน้าจอ
          </q-tooltip>
        </q-btn>
      </div>

      <LanguageToggle class="nav-actions__language" />

      <div class="nav-user-group">
        <div class="nav-profile-summary column items-start justify-center gt-xs">
          <span class="nav-profile-name"
            >{{ authStore.user?.firstNameTh }} {{ authStore.user?.lastNameTh }}</span
          >
          <span class="nav-profile-role">{{ authStore.user?.studentId }}</span>
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
                  <img v-if="authStore.user?.avatar" :src="authStore.user.avatar" />
                  <q-icon v-else name="person" size="22px" color="white" />
                </q-avatar>
                <div class="profile-action-card__identity">
                  <div class="profile-action-card__name">
                    {{ authStore.user?.firstNameTh }} {{ authStore.user?.lastNameTh }}
                  </div>
                  <div class="profile-action-card__role">{{ authStore.user?.studentId }}</div>
                </div>
              </div>
              <q-separator />
              <q-list dense class="profile-action-card__list">
                <q-item
                  clickable
                  v-ripple
                  v-close-popup
                  class="profile-action-card__item"
                  @click="$router.push('/profile')"
                >
                  <q-item-section avatar class="profile-action-card__item-icon"
                    ><q-icon name="person"
                  /></q-item-section>
                  <q-item-section
                    ><q-item-label>{{ $t('myProfile') }}</q-item-label></q-item-section
                  >
                </q-item>
                <q-item
                  clickable
                  v-ripple
                  v-close-popup
                  class="profile-action-card__item profile-action-card__item--danger"
                  @click="onLogout"
                >
                  <q-item-section avatar class="profile-action-card__item-icon"
                    ><q-icon name="logout"
                  /></q-item-section>
                  <q-item-section
                    ><q-item-label>{{ $t('logout') }}</q-item-label></q-item-section
                  >
                </q-item>
              </q-list>
            </q-card>
          </q-menu>
        </q-avatar>
        <q-btn round unelevated class="nav-notification-btn q-ml-xs" icon="notifications">
          <q-badge floating rounded color="negative" class="nav-notification-badge">2</q-badge>
        </q-btn>
      </div>
    </div>
  </q-toolbar>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useUiStore } from 'src/stores/ui-store';
import { useMyRegisteredCourses } from 'src/composables/use-my-registered-courses';
import LanguageToggle from 'components/navigation/language-toggle.vue';

const emit = defineEmits<{
  (e: 'toggleDrawer'): void;
}>();

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();
const uiStore = useUiStore();
const { myRegisteredCourseEntries } = useMyRegisteredCourses();

const courseId = computed(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  return id || '';
});

const registeredCourses = computed(() => {
  return myRegisteredCourseEntries.value.map((entry) => entry.course);
});

const activeNav = ref('this-course');
const myCoursesMenu = ref(false);
const thisCourseMenu = ref(false);

const isFullscreen = computed({
  get: () => uiStore.isCourseFullscreen,
  set: (val) => uiStore.setCourseFullscreen(val),
});

let menuTimer: ReturnType<typeof setTimeout> | null = null;
const openMenu = () => {
  if (menuTimer) clearTimeout(menuTimer);
  myCoursesMenu.value = true;
};
const closeMenu = () => {
  menuTimer = setTimeout(() => {
    myCoursesMenu.value = false;
  }, 150);
};

let thisCourseMenuTimer: ReturnType<typeof setTimeout> | null = null;
const openThisCourseMenu = () => {
  if (thisCourseMenuTimer) clearTimeout(thisCourseMenuTimer);
  thisCourseMenu.value = true;
};
const closeThisCourseMenu = () => {
  thisCourseMenuTimer = setTimeout(() => {
    thisCourseMenu.value = false;
  }, 150);
};

function onLogout() {
  authStore.logout();
  void router.push('/main');
}
</script>

<style lang="scss" scoped>
// ── Top Toolbar — identical to main-layout.vue ───────────────
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
    flex-basis: 148px;
    width: 148px;
    max-width: 148px;
    min-width: 148px;
  }
  :deep(.nav-tab--my-courses) {
    --nav-tab-label-width: 108px;
    flex-basis: 176px;
    width: 176px;
    max-width: 176px;
    min-width: 176px;
  }
  :deep(.nav-tab--this-course) {
    --nav-tab-label-width: 94px;
    flex-basis: 162px;
    width: 162px;
    max-width: 162px;
    min-width: 162px;
  }
  :deep(.nav-tab--lll-system) {
    --nav-tab-label-width: 112px;
    flex-basis: 180px;
    width: 180px;
    max-width: 180px;
    min-width: 180px;
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
  flex-wrap: nowrap;
  gap: 8px;
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
  width: auto;
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
  text-align: left;
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

.profile-action-menu {
  border-radius: 14px;
  box-shadow: 0 16px 38px rgba(17, 24, 39, 0.16);
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
