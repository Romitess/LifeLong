<template>
  <q-page class="bg-grey-1 course-home-page">
    <q-layout
      view="lHh Lpr lFf"
      container
      style="height: calc(100vh - 68px)"
      class="learning-layout"
    >
      <!-- Course Toolbar (Header) -->
      <q-header elevated class="nav-bar text-white">
        <div class="section-container">
          <div class="row items-center no-wrap">
            <!-- Left: Menu toggle + Tabs -->
            <div class="row items-center no-wrap col">
              <div
                class="menu-toggle-btn cursor-pointer row items-center justify-center"
                @click="leftDrawerOpen = !leftDrawerOpen"
              >
                <q-icon name="menu" size="20px" />
              </div>

              <q-tabs
                v-model="activeNav"
                align="left"
                active-color="white"
                indicator-color="white"
                dense
                no-caps
                class="nav-tabs"
              >
                <q-tab
                  name="home"
                  icon="home"
                  :label="$t('learning.home')"
                  class="nav-tab"
                  @click="$router.push('/course-home')"
                />

                <q-tab
                  name="my-courses"
                  icon="auto_stories"
                  :label="$t('learning.myCourses')"
                  class="nav-tab"
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
                      <div class="text-overline q-px-md q-pb-sm text-grey-6 letter-spacing-1">
                        {{ $t('profile.courses.registeredTitle') }}
                      </div>
                      <q-item
                        v-for="course in registeredCourses"
                        :key="course.id"
                        clickable
                        v-ripple
                        @click="$router.push(`/course/${course.id}/learn`)"
                        class="course-menu-item q-mx-sm border-radius-10"
                        :active="course.id === courseId"
                        active-class="bg-blue-1 text-primary"
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
                          <q-item-label lines="1" class="text-weight-bold">{{
                            course.title
                          }}</q-item-label>
                          <q-item-label caption>{{ course.code }}</q-item-label>
                        </q-item-section>
                        <q-item-section side v-if="course.id === courseId">
                          <q-icon name="check_circle" color="primary" size="20px" />
                        </q-item-section>
                      </q-item>
                      <q-item
                        v-if="registeredCourses.length === 0"
                        class="text-grey-6 text-center q-pa-md"
                      >
                        {{ $t('profile.courses.empty') }}
                      </q-item>
                    </q-list>
                  </q-menu>
                </q-tab>

                <q-tab
                  name="lll-system"
                  icon="stars"
                  :label="$t('learning.systemTitle')"
                  class="nav-tab"
                  @click="$router.push('/profile')"
                />
              </q-tabs>
            </div>

            <!-- Right: View Mode Toggle -->
            <div class="view-toggle-group row items-center q-gutter-xs q-pr-sm">
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
                  >มุมมองมาตรฐาน</q-tooltip
                >
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
                  >มุมมองเต็มหน้าจอ</q-tooltip
                >
              </q-btn>
            </div>
          </div>
        </div>
      </q-header>

      <!-- Sidebar -->
      <q-drawer v-model="leftDrawerOpen" bordered :width="300" :breakpoint="1024" class="bg-white">
        <SidebarNavigation />
      </q-drawer>

      <!-- Main Content -->
      <q-page-container>
        <div
          class="content-area"
          :class="isFullscreen ? 'content-fullscreen' : 'section-container content-standard'"
          style="padding-top: 50px; padding-bottom: 100px"
        >
          <div class="row justify-center">
            <div :class="isFullscreen ? 'col-12' : 'col-12 col-lg-10 col-xl-9'">
              <div class="section-header row items-center justify-between q-mb-xl">
                <div class="row items-center">
                  <div class="title-accent bg-primary q-mr-md"></div>
                  <div>
                    <h2 class="text-h5 text-weight-bolder text-dark q-my-none">
                      {{ t('homepage.mycourse') }}
                    </h2>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      {{ t('homepage.manageCourses') }}
                    </div>
                  </div>
                </div>
                <div class="row items-center q-gutter-md">
                  <q-input
                    v-model="searchQuery"
                    dense
                    outlined
                    :placeholder="t('homepage.searchPlaceholder')"
                    class="search-input bg-white border-radius-12"
                    style="width: 300px"
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" color="grey-6" />
                    </template>
                  </q-input>
                </div>
              </div>

              <div v-if="filteredCourses.length > 0" class="row q-col-gutter-lg">
                <div
                  v-for="entry in filteredCourses"
                  :key="entry.registration.id"
                  class="col-12 col-sm-6 col-lg-4"
                >
                  <ProfileCourseCard
                    :course="entry.course"
                    :course-code="entry.course.code"
                    :title="getTranslatedCourseTitle(entry.course)"
                    :status="entry.course.status"
                    :delivery-modes="entry.course.deliveryModes"
                    :max-seats="entry.course.maxSeats"
                    :enrolled-count="entry.course.enrolledCount"
                    :registered-at-label="formatDate(entry.registration.registeredAt)"
                    :progress-percent="entry.progress.progressPercent"
                    :progress-detail-label="entry.progress.detailLabel"
                    :progress-status-label="entry.progress.statusLabel"
                    :progress-color="entry.progress.color"
                    layout="compact"
                  >
                    <template #actions>
                      <BaseButton
                        color="primary"
                        :label="$t('profile.courses.enterClass')"
                        icon-right="chevron_right"
                        no-caps
                        full-width
                        class="course-home-btn"
                        @click.stop="goToCourse(entry.course.id)"
                      />
                      <CourseCompletionDocumentActions
                        v-if="entry.progress.isCompleted"
                        :entry="entry"
                        layout="stacked"
                      />
                    </template>
                  </ProfileCourseCard>
                </div>
              </div>

              <div
                v-else
                class="empty-state text-center q-py-xl bg-white border-radius-24 shadow-1"
              >
                <q-icon name="school" size="120px" color="grey-3" />
                <h3 class="text-h4 text-weight-bold text-grey-8 q-mt-md">
                  {{ t('homepage.emptyTitle') }}
                </h3>
                <p class="text-h6 text-grey-6 q-mb-xl">{{ t('homepage.emptySub') }}</p>
                <q-btn
                  unelevated
                  color="primary"
                  :label="t('homepage.exploreCourses')"
                  size="lg"
                  class="q-px-xl border-radius-16 shadow-2"
                  @click="$router.push('/main')"
                />
              </div>
            </div>
          </div>
        </div>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import BaseButton from 'components/base/BaseButton.vue';
import CourseCompletionDocumentActions from 'components/course/CourseCompletionDocumentActions.vue';
import ProfileCourseCard from 'components/profile/ProfileCourseCard.vue';
import SidebarNavigation from 'components/navigation/SidebarNavigation.vue';
import {
  useMyRegisteredCourses,
  type RegisteredCourseEntry,
} from 'src/composables/use-my-registered-courses';

const route = useRoute();
const router = useRouter();
const { locale } = useI18n({ useScope: 'global' });
const { myRegisteredCourseEntries } = useMyRegisteredCourses();
const { t } = useI18n({ useScope: 'global' });
const courseId = computed(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  return id || '';
});

const leftDrawerOpen = ref(false);
const myCoursesMenu = ref(false);
const searchQuery = ref('');
const activeNav = ref('home');
import { useUiStore } from 'src/stores/ui-store';
const uiStore = useUiStore();
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

// Only show truly registered courses
const registeredCourses = computed(() => {
  return myRegisteredCourseEntries.value.map((entry) => entry.course);
});

const filteredCourses = computed<RegisteredCourseEntry[]>(() => {
  if (!searchQuery.value.trim()) {
    return myRegisteredCourseEntries.value;
  }
  const query = searchQuery.value.toLowerCase();
  return myRegisteredCourseEntries.value.filter(
    (entry) =>
      entry.course.title.toLowerCase().includes(query) ||
      entry.course.code.toLowerCase().includes(query),
  );
});

const getTranslatedCourseTitle = (course: { title: string; titleEn?: string }) =>
  locale.value === 'th' ? course.title : course.titleEn || course.title;

const goToCourse = (id: string) => {
  void router.push(`/course/${id}/learn`);
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString(locale.value === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
</script>

<style lang="scss" scoped>
.course-home-page {
  height: calc(100vh - 68px);
  overflow: hidden;
  background-color: #f8f9fa;
}

.section-container {
  max-width: 1400px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

// View Mode
.content-area {
  transition: padding 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}
.content-fullscreen {
  padding-left: 32px;
  padding-right: 32px;
  max-width: 100% !important;
  margin: 0 !important;
}
.view-toggle-group {
  flex-shrink: 0;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 4px;
  backdrop-filter: blur(4px);
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

.content-container {
  max-width: 1400px;
  margin: 0 auto;
}

.menu-toggle-btn {
  color: rgba(255, 255, 255, 0.8);
  min-height: 48px;
  padding: 0 16px; /* ระยะซ้ายขวาให้สมดุลกับแท็บอื่น */
  margin-right: 8px;
  transition: color 0.2s ease;

  &:hover {
    color: white; /* สว่างขึ้นตอนเมาส์ชี้ เหมือนปุ่มหน้าแรก */
  }
}

.nav-bar {
  background-color: var(--q-primary);
  min-height: 48px;
}

.nav-tabs {
  :deep(.q-tab) {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
    padding: 0 20px;
    min-width: 118px;
    min-height: 48px;
    font-size: 0.9rem;
    transition: color 0.2s ease;

    &.q-tab--active {
      color: white;
      font-weight: 700;
    }

    &:hover {
      color: white;
    }

    .q-icon {
      font-size: 1rem;
    }
  }
}

.search-input {
  :deep(.q-field__control) {
    border-radius: 12px;
    transition: all 0.3s ease;
  }
  &:hover :deep(.q-field__control) {
    border-color: $primary;
  }
}

.border-radius-12 {
  border-radius: 12px;
}
.border-radius-16 {
  border-radius: 16px;
}
.border-radius-24 {
  border-radius: 24px;
}

.my-courses-dropdown {
  border-radius: 16px;
  border: 1px solid rgba(0, 0, 0, 0.05);
}

.course-menu-item {
  transition: all 0.3s ease;
  &:hover {
    background-color: #fff8ed;
    color: $primary;
  }
}

.empty-state {
  padding: 100px 40px;
}

.course-home-btn {
  border-radius: 12px;
}
</style>
