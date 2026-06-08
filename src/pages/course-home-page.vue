<template>
  <q-page class="bg-grey-1 course-home-page">
    <!-- Course Toolbar -->
    <CourseLayout @toggleDrawer="leftDrawerOpen = !leftDrawerOpen" />

    <q-layout
      view="lHh Lpr lFf"
      container
      style="height: calc(100vh - 72px)"
      class="learning-layout"
    >
      <!-- Sidebar -->
      <q-drawer v-model="leftDrawerOpen" bordered :width="300" :breakpoint="1024" class="bg-white">
        <SidebarNavigation />
      </q-drawer>

      <!-- Main Content -->
      <q-page-container>
        <div
          class="content-area"
          :class="isFullscreen ? 'content-fullscreen' : 'section-container content-standard'"
          style="padding-top: 50px; padding-bottom: 50px"
        >
          <div class="row">
            <div class="col-12">
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
                  <BaseSearchInput
                    v-model="searchQuery"
                    :placeholder="t('homepage.searchPlaceholder')"
                    class="search-input"
                    style="width: 300px"
                  />
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
                        @click.stop="
                          goToCourse(entry.course.id, entry.course.code, entry.course.moodleId)
                        "
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
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth-store';
import { pushMoodleLearningRoute } from 'src/utils/moodle-navigation';
import BaseButton from 'components/base/BaseButton.vue';
import BaseSearchInput from 'components/base/BaseSearchInput.vue';
import CourseCompletionDocumentActions from 'components/course/CourseCompletionDocumentActions.vue';
import ProfileCourseCard from 'components/profile/ProfileCourseCard.vue';
import SidebarNavigation from 'components/navigation/sidebar-navigation.vue';
import CourseLayout from 'layouts/course-layout.vue';
import {
  useMyRegisteredCourses,
  type RegisteredCourseEntry,
} from 'src/composables/use-my-registered-courses';
import { useCourseRegistrationStore } from 'src/stores/course-registration-store';
import { useEnrollmentProgressStore } from 'src/stores/enrollment-progress-store';

const router = useRouter();
const $q = useQuasar();
const { locale } = useI18n({ useScope: 'global' });
const { myRegisteredCourseEntries } = useMyRegisteredCourses();
const { t } = useI18n({ useScope: 'global' });
const authStore = useAuthStore();
const courseRegistrationStore = useCourseRegistrationStore();
const enrollmentProgressStore = useEnrollmentProgressStore();

onMounted(async () => {
  const username = authStore.user?.username;
  if (username) {
    await courseRegistrationStore.fetchMyEnrollments(username);
    const enrollIds = courseRegistrationStore.myRegistrations
      .map((r) => r.enrollId)
      .filter((id): id is number => id != null);
    void enrollmentProgressStore.fetchAllCompletions(enrollIds);
  }
});

const leftDrawerOpen = ref(false);
const searchQuery = ref('');
import { useUiStore } from 'src/stores/ui-store';
const uiStore = useUiStore();
const isFullscreen = computed({
  get: () => uiStore.isCourseFullscreen,
  set: (val) => uiStore.setCourseFullscreen(val),
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

const goToCourse = (id: string, courseCode?: string, moodleCourseId?: number): void => {
  if (authStore.user?.username) {
    $q.notify({
      type: 'info',
      message: 'กำลังพาเข้าสู่ Moodle',
      position: 'top',
      timeout: 1800,
    });
    pushMoodleLearningRoute(router, id, undefined, {
      moodleCourseId: moodleCourseId ?? id,
      courseCode,
    });
    return;
  }

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
  height: calc(100vh - 72px);
  overflow: hidden;
  background-color: #f8f6f1;
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

.search-input {
  max-width: 100%;
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

.empty-state {
  padding: 100px 40px;
}

.course-home-btn {
  border-radius: 12px;
}
</style>
