<template>
  <q-page class="bg-grey-1 grades-page">
    <!-- Course Toolbar -->
    <CourseLayout @toggleDrawer="leftDrawerOpen = !leftDrawerOpen" />

    <q-layout
      view="lHh Lpr lFf"
      container
      style="height: calc(100vh - 72px)"
      class="learning-layout"
    >
      <!-- Sidebar Drawer -->
      <q-drawer v-model="leftDrawerOpen" bordered :width="300" :breakpoint="1024" class="bg-white">
        <SidebarNavigation />
      </q-drawer>

      <q-page-container>
        <div
          class="content-area"
          :class="isFullscreen ? 'content-fullscreen' : 'section-container content-standard'"
          style="padding-top: 64px; padding-bottom: 64px"
        >
          <div class="row">
            <div class="col-12">
              <!-- Breadcrumbs -->
              <q-breadcrumbs class="text-grey-8 q-mb-xl modern-breadcrumbs" active-color="primary">
                <template v-slot:separator>
                  <q-icon size="1.4em" name="chevron_right" color="grey-4" />
                </template>
                <q-breadcrumbs-el
                  :label="$t('learning.home')"
                  icon="home"
                  to="/course-home"
                  class="breadcrumb-link"
                />
                <q-breadcrumbs-el
                  :label="courseTitle"
                  class="breadcrumb-link cursor-pointer"
                  @click="$router.push(`/course/${courseId}/learn`)"
                />
                <q-breadcrumbs-el
                  :label="$t('sidebar.grades')"
                  class="text-weight-bold text-dark q-px-sm"
                />
              </q-breadcrumbs>

              <!-- Page Header -->
              <div class="row items-center justify-between q-mb-xl">
                <div class="row items-center">
                  <div class="title-accent bg-primary q-mr-md"></div>
                  <div>
                    <h2 class="text-h5 text-weight-bolder text-dark q-my-none">
                      {{ $t('sidebar.grades') }}
                    </h2>
                    <div class="text-caption text-grey-6 q-mt-xs">
                      {{ $t('grades.manageGrades') || 'ตรวจสอบคะแนนสะสมและผลการเรียนของคุณ' }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- User Profile Summary -->
              <div
                class="row items-center q-mb-xl profile-summary-card bg-white border-radius-16 shadow-1 q-pa-lg"
              >
                <q-avatar
                  size="64px"
                  color="blue-grey-1"
                  text-color="blue-grey-9"
                  class="text-weight-bold shadow-1"
                >
                  {{ userInitials }}
                </q-avatar>
                <div class="q-ml-lg">
                  <div class="text-h5 text-weight-bolder text-blue-grey-10">
                    {{ authStore.user?.firstNameEn }} {{ authStore.user?.lastNameEn }}
                  </div>
                  <div class="text-caption text-grey-6 uppercase letter-spacing-1">
                    {{ $t('grades.studentDashboard') }}
                  </div>
                </div>
              </div>

              <!-- Grades Card -->
              <q-card flat bordered class="grades-card shadow-1">
                <q-card-section class="q-pa-none">
                  <q-markup-table flat class="grades-table">
                    <thead>
                      <tr>
                        <th class="text-left">{{ $t('grades.item') }}</th>
                        <th class="text-center">{{ $t('grades.weight') }}</th>
                        <th class="text-center">{{ $t('grades.grade') }}</th>
                        <th class="text-center">{{ $t('grades.range') }}</th>
                        <th class="text-center">{{ $t('grades.percentage') }}</th>
                        <th class="text-center">{{ $t('grades.contribution') }}</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- Course Header Row -->
                      <tr class="course-header-row">
                        <td colspan="6">
                          <div class="row items-center">
                            <q-icon name="expand_more" size="20px" class="q-mr-sm" />
                            <span class="text-weight-bold"
                              >{{ currentCourse?.code }} {{ courseTitle }}</span
                            >
                          </div>
                        </td>
                      </tr>

                      <!-- Grade Rows -->
                      <tr v-for="(item, index) in gradeItems" :key="index">
                        <td class="text-left">
                          <div class="row no-wrap items-center">
                            <div class="item-icon-container q-mr-md">
                              <q-icon name="assignment" size="20px" color="blue-grey-4" />
                            </div>
                            <div>
                              <div class="text-caption text-grey-5">{{ $t('grades.quiz') }}</div>
                              <div class="text-weight-bold text-blue-grey-9">{{ item.title }}</div>
                            </div>
                          </div>
                        </td>
                        <td class="text-center text-grey-7">{{ item.weight }} %</td>
                        <td class="text-center text-weight-bold text-primary">
                          {{ item.grade || '-' }}
                        </td>
                        <td class="text-center text-grey-7">{{ item.range }}</td>
                        <td class="text-center">
                          <div class="column items-center">
                            <span class="text-weight-medium">{{ item.percentage }} %</span>
                            <q-linear-progress
                              :value="Number(item.percentage) / 100"
                              color="primary"
                              class="q-mt-xs"
                              style="width: 60px"
                              rounded
                            />
                          </div>
                        </td>
                        <td class="text-center text-grey-7">{{ item.contribution }} %</td>
                      </tr>

                      <!-- Aggregation Row -->
                      <tr class="aggregation-row">
                        <td class="text-left">
                          <div class="row items-center">
                            <div class="aggregation-icon q-mr-md">
                              <q-icon name="functions" size="20px" color="primary" />
                            </div>
                            <div>
                              <div class="text-caption text-primary text-weight-bold">
                                {{ $t('grades.aggregation') }}
                              </div>
                              <div class="text-h6 text-weight-bolder text-dark">
                                {{ $t('grades.courseTotal') }}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td class="text-center">-</td>
                        <td class="text-center text-h6 text-weight-bolder text-primary">
                          {{ totalScore.toFixed(2) }}
                        </td>
                        <td class="text-center text-grey-7">0-{{ totalWeight }}</td>
                        <td class="text-center">
                          <div class="column items-center">
                            <span class="text-h6 text-weight-bolder"
                              >{{ totalPercentage.toFixed(2) }} %</span
                            >
                            <q-linear-progress
                              :value="totalPercentage / 100"
                              color="positive"
                              class="q-mt-xs"
                              style="width: 100px; height: 6px"
                              rounded
                            />
                          </div>
                        </td>
                        <td class="text-center">-</td>
                      </tr>
                    </tbody>
                  </q-markup-table>
                </q-card-section>
              </q-card>
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
import SidebarNavigation from 'components/navigation/SidebarNavigation.vue';
import { getCourseDetailById } from 'src/data/mock-courses';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseProgressStore } from 'src/stores/course-progress-store';
import { getFlatLessons, getCourseStructure } from 'src/data/course-structure';
import CourseLayout from 'layouts/course-layout.vue';

const route = useRoute();
const authStore = useAuthStore();
const progressStore = useCourseProgressStore();
const leftDrawerOpen = ref(false);
import { useUiStore } from 'src/stores/ui-store';
const uiStore = useUiStore();
const isFullscreen = computed({
  get: () => uiStore.isCourseFullscreen,
  set: (val) => uiStore.setCourseFullscreen(val),
});

const courseId = computed(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  return id || '';
});

const currentCourse = computed(() => {
  if (!courseId.value) return null;
  return getCourseDetailById(courseId.value);
});

const courseTitle = computed(() => currentCourse.value?.title || 'Course');

const userInitials = computed(() => {
  if (!authStore.user) return '??';
  const f = authStore.user.firstNameEn?.[0] || '';
  const l = authStore.user.lastNameEn?.[0] || '';
  return (f + l).toUpperCase() || '??';
});

const quizLessons = computed(() => {
  const structure = getCourseStructure(courseId.value);
  return getFlatLessons(structure).filter((l) => l.type === 'quiz');
});

const gradeItems = computed(() => {
  const quizzes = quizLessons.value;
  if (quizzes.length === 0) return [];

  // Distribute 100% weight across all quizzes
  const weightPerQuiz = 100 / quizzes.length;

  return quizzes.map((quiz) => {
    const bestScore = progressStore.getBestScore(courseId.value || '', quiz.title);
    // Note: In a real app, total questions would come from a database.
    // For our mock, we'll assume 5 for pre-test and 2 for others as defined in course-quiz-page.
    const totalQ = quiz.title.includes('Pre-test') ? 4 : quiz.title.includes('แบบฝึกหัด') ? 2 : 1;

    const percentageNum = bestScore !== null ? (bestScore / totalQ) * 100 : 0;
    const weightNum = weightPerQuiz;
    const contributionNum = (percentageNum * weightNum) / 100;

    return {
      title: quiz.title,
      weight: weightNum.toFixed(2),
      grade: bestScore !== null ? bestScore.toFixed(2) : null,
      range: `0-${totalQ}`,
      percentage: percentageNum.toFixed(2),
      contribution: contributionNum.toFixed(2),
    };
  });
});

const totalScore = computed(() => {
  return gradeItems.value.reduce((acc, item) => acc + (item.grade ? parseFloat(item.grade) : 0), 0);
});

const totalWeight = computed(() => {
  // Sum of all max scores
  return quizLessons.value.reduce((acc, quiz) => {
    // In a real app, this would come from a quiz definition.
    // Mocking logic to stay consistent with other pages
    const totalQ = quiz.title.includes('Pre-test') ? 4 : quiz.title.includes('แบบฝึกหัด') ? 2 : 1;
    return acc + totalQ;
  }, 0);
});

const totalPercentage = computed(() => {
  if (gradeItems.value.length === 0) return 0;
  return gradeItems.value.reduce((acc, item) => acc + parseFloat(item.contribution), 0);
});
</script>

<style lang="scss" scoped>
.grades-page {
  height: calc(100vh - 72px);
  overflow: hidden;
}

.section-container {
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 24px;
  padding-right: 24px;
}

.title-accent {
  width: 8px;
  height: 40px;
  border-radius: 4px;
}

// Breadcrumbs
.modern-breadcrumbs {
  font-size: 0.95rem;
  font-weight: 500;
  letter-spacing: 0.01em;

  .breadcrumb-link {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    padding: 6px 12px;
    border-radius: 10px;
    text-decoration: none;
    color: inherit;

    &:hover {
      color: var(--q-primary) !important;
      background: rgba(var(--q-primary), 0.08);
    }
  }

  .q-breadcrumbs__el-icon {
    margin-right: 8px;
    font-size: 1.2rem;
  }
}

.profile-summary-card {
  padding: 12px;
  border-radius: 20px;
  transition: all 0.3s ease;

  .q-avatar {
    border: 3px solid white;
  }
}

.grades-card {
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid rgba(0, 0, 0, 0.05);
  background: white;
}

.grades-table {
  thead th {
    background-color: #fafbfc;
    color: #64748b;
    font-weight: 700;
    text-transform: uppercase;
    font-size: 0.75rem;
    letter-spacing: 0.5px;
    padding: 16px;
  }

  tbody tr {
    transition: background-color 0.2s ease;
    &:hover {
      background-color: #f8fafc;
    }
  }

  td {
    padding: 20px 16px;
    border-bottom: 1px solid #f1f5f9;
  }
}

.course-header-row {
  background-color: #f1f5f9;
  td {
    padding: 12px 16px;
    color: #334155;
    font-size: 0.95rem;
  }
}

.item-icon-container {
  width: 40px;
  height: 40px;
  background-color: #f1f5f9;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.aggregation-row {
  background-color: #f8fafc;
  td {
    padding: 24px 16px;
    border-top: 2px solid #e2e8f0;
  }
}

.aggregation-icon {
  width: 48px;
  height: 48px;
  background-color: rgba($primary, 0.1);
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

.course-menu-item {
  transition: all 0.3s ease;
  &:hover {
    background-color: #fff8ed;
    color: #f5a623;
  }
}

.border-radius-10 {
  border-radius: 10px;
}
</style>
