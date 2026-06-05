<template>
  <q-page class="profile-page">
    <!-- PROFILE HERO  -->
    <ProfileHeroSection
      :hero-role-label="heroRoleLabel"
      :profile-stats="isTeachingRole ? [] : profileStats"
      :id-label="profileHeroIdLabel"
    />

    <!-- CONTENT -->
    <section ref="profileContentRef" class="profile-content q-py-xl">
      <div class="section-container">
        <div class="row q-col-gutter-xl">
          <!-- Sidebar Menu -->
          <div v-if="!isTeachingRole" class="col-12 col-md-3">
            <ProfileSidebarMenu
              v-model="activeMenu"
              :menu-items="menuItems"
              :my-registrations-count="myRegistrations.length"
              :my-bookmarks-count="courseBookmarkStore.myBookmarks.length"
              :student-id="authStore.user?.studentId ?? ''"
              @show-student-card="showStudentCardDialog = true"
            />
          </div>

          <!-- Main Content -->
          <div :class="isTeachingRole ? 'col-12' : 'col-12 col-md-9'">
            <div class="profile-tab-panel">
              <ProfileInstructorPanel v-if="isTeachingRole" />

              <ProfileMyCoursesTab
                v-else-if="activeMenu === 'my-courses'"
                :filtered-registrations="filteredRegistrations"
                :course-search="courseSearch"
                :my-registrations-count="myRegistrations.length"
                @update:course-search="courseSearch = $event"
                @toggle-bookmark="toggleRegisteredCourseBookmark"
                @prompt-unregister="promptUnregister"
                @open-pending-payment="openPendingPayment"
                @go-to-course="goToCourse"
                @download-receipt="downloadReceiptByCourseId"
              />

              <ProfileSavedCoursesTab
                v-else-if="activeMenu === 'saved-courses'"
                :filtered-saved-courses="filteredSavedCourses"
                :saved-course-search="savedCourseSearch"
                @update:saved-course-search="savedCourseSearch = $event"
                @prompt-unregister="promptUnregisterFromSaved"
                @open-pending-payment="openPendingPayment"
                @go-to-course="goToCourse"
                @on-enroll="onSavedCourseEnroll"
              />

              <ProfilePersonalInfoTab v-else-if="activeMenu === 'personal-info'" />

              <ProfileBenefitsTab
                v-else-if="activeMenu === 'benefits'"
                :benefits-data="benefitsData"
                :is-refreshing-benefits="isRefreshingBenefits"
                :active-benefit-label="activeBenefitLabel"
                :benefits-checked-at-label="benefitsCheckedAtLabel"
                :locale="locale"
                :student-full-name-th="studentFullNameTh"
                :student-full-name-en="studentFullNameEn"
                @refresh-benefits="refreshBenefits"
                @navigate-to-personal-info="activeMenu = 'personal-info'"
              />

              <ProfileChatTab
                v-else-if="activeMenu === 'chat'"
                :current-avatar-url="currentAvatarUrl"
              />

              <!-- Enrollment Dialog for Saved Courses -->
              <CourseEnrollmentDialog
                :course="savedEnrollmentDialogCourse"
                :open-key="savedEnrollmentDialogOpenKey"
                @enrolled="onSavedCourseEnrolled"
                @go-to-learning="(id) => goToCourse(id, savedEnrollmentDialogCourse?.code)"
              />
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- CONFIRM UNREGISTER DIALOG -->
    <q-dialog v-model="showUnregisterDialog" transition-show="scale" transition-hide="scale">
      <q-card class="modern-card unregister-dialog-card">
        <q-card-section class="q-pa-xl text-center">
          <div class="unregister-icon-wrap q-mx-auto q-mb-lg">
            <q-icon name="warning_amber" size="40px" color="negative" />
          </div>
          <div class="text-h6 text-weight-bolder text-dark">
            {{ $t('profile.dialogs.unregisterTitle') }}
          </div>
          <div class="text-grey-7 q-mt-sm">{{ $t('profile.dialogs.unregisterSub') }}</div>
          <div v-if="courseToUnregister" class="q-mt-md q-pa-sm bg-grey-1 rounded-borders">
            <div class="text-weight-bold text-dark">
              {{
                getTranslatedCourseTitleByInfo(
                  courseToUnregister.courseCode,
                  courseToUnregister.courseTitle,
                )
              }}
            </div>
            <div class="text-caption text-grey-6">{{ courseToUnregister.courseCode }}</div>
          </div>
          <div
            class="text-caption text-negative q-mt-md row items-center justify-center q-gutter-xs"
          >
            <q-icon name="info" size="14px" />
            <span>{{ $t('profile.dialogs.irreversible') }}</span>
          </div>
        </q-card-section>

        <q-card-actions class="unregister-dialog-card__actions q-px-lg q-pb-lg">
          <BaseButton
            outline
            :label="$t('profile.dialogs.notNow')"
            color="grey-7"
            no-caps
            class="unregister-dialog-card__button"
            @click="cancelUnregister"
          />
          <BaseButton
            :label="$t('profile.dialogs.confirmUnregister')"
            color="negative"
            no-caps
            class="unregister-dialog-card__button"
            @click="confirmUnregister"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- STUDENT CARD DIALOG -->
    <q-dialog v-model="showStudentCardDialog" transition-show="scale" transition-hide="scale">
      <q-card class="student-card-dialog">
        <q-card-section class="student-card-dialog__content">
          <q-btn
            flat
            round
            dense
            icon="close"
            color="grey-7"
            class="student-card-dialog__close"
            v-close-popup
          />

          <div class="student-card-dialog__brand-row">
            <img
              src="~assets/brand/buu-lll-logo.png"
              class="student-card-dialog__logo"
              alt="BUU LLL logo"
              loading="eager"
              decoding="sync"
            />
            <q-badge rounded color="positive" class="student-card-dialog__status">
              Active Learner
            </q-badge>
          </div>

          <div class="student-card-dialog__header text-center">
            <div class="text-h5 text-weight-bolder text-dark">
              {{ $t('profile.menu.studentCard') }}
            </div>
            <div class="student-card-dialog__title-en">Lifelong Learning Burapha University</div>
            <div class="student-card-dialog__student-code">
              {{ $t('profile.hero.studentId') }} {{ authStore.user?.studentId }}
            </div>
          </div>

          <div class="student-card-dialog__body">
            <div class="student-card-dialog__avatar-shell">
              <q-avatar size="150px" class="student-card-dialog__avatar">
                <img
                  v-if="currentAvatarUrl"
                  :src="currentAvatarUrl"
                  class="student-card-dialog__avatar-image"
                  alt="Profile avatar"
                  loading="eager"
                  decoding="sync"
                />
                <q-icon v-else name="person" size="84px" color="white" />
              </q-avatar>
            </div>

            <div class="student-card-dialog__details">
              <div class="student-card-dialog__detail-row">
                <span>{{ $t('profile.personal.firstNameTh') }}</span>
                <strong>{{ studentFullNameTh }}</strong>
              </div>
              <div class="student-card-dialog__detail-row">
                <span>Name</span>
                <strong>{{ studentFullNameEn }}</strong>
              </div>
              <div class="student-card-dialog__detail-row">
                <span>USERNAME</span>
                <strong>{{ authStore.user?.email }}</strong>
              </div>
              <div class="student-card-dialog__detail-row">
                <span>Faculty</span>
                <strong>{{ authStore.user?.faculty }}</strong>
              </div>
            </div>
          </div>

          <div class="student-card-dialog__footer">
            <span>{{ $t('registrationDate') }} {{ learnerRegisteredDate }}</span>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <ReceiptCard
      ref="receiptDialogRef"
      v-model="showReceiptDialog"
      :receipt-id="receiptId"
      :issued-at="selectedPayment?.paymentDate ?? null"
      :customer-name="receiptCustomerName"
      :customer-tax-id="selectedPayment?.taxId ?? ''"
      :customer-address="selectedPayment?.customerAddress ?? ''"
      :show-customer="true"
      :course-title="
        getTranslatedCourseTitleByInfo(selectedPayment?.courseCode, selectedPayment?.courseTitle)
      "
      :course-code="selectedPayment?.courseCode || ''"
      :amount="selectedPayment?.amount ?? 0"
      :is-copy="false"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import {
  useCourseRegistrationStore,
  type CourseRegistration,
} from 'src/stores/course-registration-store';
import { useCoursePaymentStore, type CoursePaymentRecord } from 'src/stores/course-payment-store';
import { useCourseBookmarkStore, type CourseBookmark } from 'src/stores/course-bookmark-store';
import { useAuthStore } from 'src/stores/auth-store';
import { useEnrollmentProgressStore } from 'src/stores/enrollment-progress-store';
import { useCourseStore } from 'src/stores/course-store';
import BaseButton from 'components/base/BaseButton.vue';
import CourseEnrollmentDialog from 'components/course/CourseEnrollmentDialog.vue';
import ReceiptCard from 'components/receipt/receipt-card.vue';
import ProfileHeroSection from 'components/profile/ProfileHeroSection.vue';
import ProfileSidebarMenu from 'components/profile/ProfileSidebarMenu.vue';
import ProfileInstructorPanel from 'components/profile/ProfileInstructorPanel.vue';
import ProfileMyCoursesTab from 'components/profile/ProfileMyCoursesTab.vue';
import ProfileSavedCoursesTab from 'components/profile/ProfileSavedCoursesTab.vue';
import ProfilePersonalInfoTab from 'components/profile/ProfilePersonalInfoTab.vue';
import ProfileBenefitsTab from 'components/profile/ProfileBenefitsTab.vue';
import ProfileChatTab from 'components/profile/ProfileChatTab.vue';
import {
  useMyRegisteredCourses,
  type RegisteredCourseEntry,
} from 'src/composables/use-my-registered-courses';
import { useProfileNavigation } from 'src/composables/use-profile-navigation';
import type { Course } from 'src/types/course';
import type { CourseDetail } from 'src/types/course-detail';
import { api } from 'src/boot/axios';

interface ProfileStatCardItem {
  label: string;
  value: number;
  icon: string;
  tone: Record<string, string>;
}

interface MenuItem {
  label: string;
  value: string;
  icon: string;
}

const { t, locale } = useI18n();
const $q = useQuasar();
const courseRegistrationStore = useCourseRegistrationStore();
const coursePaymentStore = useCoursePaymentStore();
const courseBookmarkStore = useCourseBookmarkStore();
const authStore = useAuthStore();
const enrollmentProgressStore = useEnrollmentProgressStore();
const courseStore = useCourseStore();
courseStore.init();
const { myRegistrations, myRegisteredCourseEntries } = useMyRegisteredCourses();
const { goToCourse } = useProfileNavigation();
const route = useRoute();
const router = useRouter();

// Page state
const isTeachingRole = computed(
  () => authStore.user?.role === 'teach' || authStore.user?.role === 'instructor',
);
const activeMenu = ref('my-courses');
const profileContentRef = ref<HTMLElement | null>(null);
const courseSearch = ref('');
const savedCourseSearch = ref('');
const showUnregisterDialog = ref(false);
const courseToUnregister = ref<CourseRegistration | null>(null);
const showStudentCardDialog = ref(false);
const isRefreshingBenefits = ref(false);
const benefitsCheckedAt = ref<Date>(new Date());
const benefitsData = ref<{
  hasPrivilege: boolean;
  stutypeId: number | null;
  stutypeName: string | null;
  source: 'student' | 'alumni' | 'staff' | null;
} | null>(null);
const savedEnrollmentDialogCourse = ref<CourseDetail | null>(null);
const savedEnrollmentDialogOpenKey = ref(0);
const selectedPayment = ref<CoursePaymentRecord | null>(null);
const showReceiptDialog = ref(false);
const receiptDialogRef = ref<InstanceType<typeof ReceiptCard> | null>(null);

// Derived state
const currentAvatarUrl = computed<string>(() => authStore.user?.avatar || '');
const studentFullNameTh = computed<string>(() =>
  `${authStore.user?.firstNameTh ?? ''} ${authStore.user?.lastNameTh ?? ''}`.trim(),
);
const studentFullNameEn = computed<string>(() =>
  `${authStore.user?.firstNameEn ?? ''} ${authStore.user?.lastNameEn ?? ''}`.trim(),
);
const learnerRegisteredDate = computed<string>(() =>
  formatThaiBuddhistDate('2026-04-27T00:00:00+07:00'),
);
const activeBenefitLabel = computed<string>(
  () => benefitsData.value?.stutypeName ?? t('profile.benefits.activeStudent'),
);
const benefitsCheckedAtLabel = computed<string>(() => formatThaiDateTime(benefitsCheckedAt.value));

const heroRoleLabel = computed(() => {
  if (authStore.user?.role === 'admin') return t('profile.roles.admin');
  if (authStore.user?.role === 'teach' || authStore.user?.role === 'instructor')
    return t('profile.roles.instructor');
  if (authStore.user?.role === 'finance') return t('profile.roles.finance');
  if (authStore.user?.role === 'central_finance') return t('profile.roles.central_finance');
  return t('profile.hero.learner');
});

const profileHeroIdLabel = computed(() =>
  isTeachingRole.value ? 'รหัสประจำตัวผู้สอน' : t('profile.hero.studentId'),
);

const receiptId = computed(() => selectedPayment.value?.receiptId || '');
const receiptCustomerName = computed(() => {
  if (selectedPayment.value?.customerName) return selectedPayment.value.customerName;
  const thaiName =
    `${authStore.user?.firstNameTh ?? ''} ${authStore.user?.lastNameTh ?? ''}`.trim();
  const englishName =
    `${authStore.user?.firstNameEn ?? ''} ${authStore.user?.lastNameEn ?? ''}`.trim();
  return locale.value === 'th' ? thaiName || englishName : englishName || thaiName;
});

// Instructor computed (for profileStats only)
const instructorCourses = computed<Course[]>(() =>
  courseStore.getInstructorCourses(authStore.user),
);
const activeInstructorCoursesCount = computed<number>(
  () => instructorCourses.value.filter((c) => c.isActive).length,
);
const totalInstructorLearners = computed<number>(() =>
  instructorCourses.value.reduce((sum, c) => sum + c.enrolledCount, 0),
);
function getCertificateReadyCount(course: Course): number {
  if (course.enrolledCount <= 0) return 0;
  return Array.from({ length: course.enrolledCount }, (_, i): number => {
    const score = (course.id.charCodeAt(0) * 13 + i * 11) % 101;
    return score >= 60 ? 1 : 0;
  }).reduce((sum, v) => sum + v, 0);
}
const certificateReadyLearners = computed<number>(() =>
  instructorCourses.value.reduce((sum, c) => sum + getCertificateReadyCount(c), 0),
);
const pendingCertificateCount = computed<number>(() =>
  Math.max(0, certificateReadyLearners.value - Math.floor(certificateReadyLearners.value * 0.35)),
);

// Learner computed (for profileStats)
const inProgressCoursesCount = computed<number>(
  () =>
    myRegisteredCourseEntries.value.filter(
      (e) => e.progress.progressPercent > 0 && !e.progress.isCompleted,
    ).length,
);
const completedCoursesCount = computed<number>(
  () => myRegisteredCourseEntries.value.filter((e) => e.progress.isCompleted).length,
);

function withOpacity(hexColor: string, opacity: number): string {
  const hex = hexColor.replace('#', '');
  const normalized =
    hex.length === 3
      ? hex
          .split('')
          .map((c) => c + c)
          .join('')
      : hex;
  const r = Number.parseInt(normalized.slice(0, 2), 16);
  const g = Number.parseInt(normalized.slice(2, 4), 16);
  const b = Number.parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function buildProfileStatTone(accent: string): Record<string, string> {
  return {
    '--profile-stat-accent': accent,
    '--profile-stat-accent-strong': withOpacity(accent, 0.88),
    '--profile-stat-border': withOpacity(accent, 0.34),
    '--profile-stat-surface': withOpacity(accent, 0.18),
    '--profile-stat-surface-hover': withOpacity(accent, 0.26),
    '--profile-stat-shadow': withOpacity(accent, 0.22),
  };
}

const profileStats = computed<ProfileStatCardItem[]>(() => {
  if (isTeachingRole.value) {
    return [
      {
        label: 'รายวิชาทั้งหมด',
        value: instructorCourses.value.length,
        icon: 'app_registration',
        tone: buildProfileStatTone('#F5A623'),
      },
      {
        label: 'กำลังเปิดสอน',
        value: activeInstructorCoursesCount.value,
        icon: 'auto_stories',
        tone: buildProfileStatTone('#31B7C8'),
      },
      {
        label: 'ผู้เรียนรวม',
        value: totalInstructorLearners.value,
        icon: 'groups',
        tone: buildProfileStatTone('#49B37D'),
      },
      {
        label: 'รอออก Certificate',
        value: pendingCertificateCount.value,
        icon: 'workspace_premium',
        tone: buildProfileStatTone('#5B7CFA'),
      },
    ];
  }
  return [
    {
      label: t('profile.menu.myCourses'),
      value: myRegistrations.value.length,
      icon: 'app_registration',
      tone: buildProfileStatTone('#F5A623'),
    },
    {
      label: t('profile.courses.inProgress'),
      value: inProgressCoursesCount.value,
      icon: 'auto_stories',
      tone: buildProfileStatTone('#31B7C8'),
    },
    {
      label: t('learning.completed'),
      value: completedCoursesCount.value,
      icon: 'workspace_premium',
      tone: buildProfileStatTone('#49B37D'),
    },
    { label: t('creditBank'), value: 0, icon: 'stars', tone: buildProfileStatTone('#5B7CFA') },
  ];
});

const menuItems = computed<MenuItem[]>(() => [
  { label: t('profile.menu.myCourses'), value: 'my-courses', icon: 'menu_book' },
  { label: t('profile.menu.savedCourses'), value: 'saved-courses', icon: 'bookmark' },
  { label: t('profile.menu.personalInfo'), value: 'personal-info', icon: 'person' },
  { label: t('profile.menu.benefits'), value: 'benefits', icon: 'card_giftcard' },
  { label: t('profile.menu.chat'), value: 'chat', icon: 'chat' },
]);

// Nested routing for profile tabs: /profile/<slug> ↔ activeMenu (no query params).
// URL slug ('courses') differs from the internal tab value ('my-courses').
const TAB_TO_SLUG: Record<string, string> = {
  'my-courses': 'courses',
  'saved-courses': 'saved',
  'personal-info': 'personal-info',
  benefits: 'benefits',
  chat: 'chat',
};
const SLUG_TO_TAB: Record<string, string> = Object.fromEntries(
  Object.entries(TAB_TO_SLUG).map(([tab, slug]) => [slug, tab]),
);

function getRouteSlug(): string {
  const raw = route.params.tab;
  return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
}

// Route → tab: render the correct tab component for /profile/<slug>.
// Falls back to the existing default ('my-courses') when the slug is absent or invalid.
watch(
  () => route.params.tab,
  () => {
    const tab = SLUG_TO_TAB[getRouteSlug()];
    if (tab && tab !== activeMenu.value) {
      activeMenu.value = tab;
    }
  },
  { immediate: true },
);

// Tab → route: keep the URL in sync when the user switches tabs via the sidebar.
watch(activeMenu, (tab) => {
  const slug = TAB_TO_SLUG[tab];
  if (slug && slug !== getRouteSlug()) {
    void router.replace({ path: `/profile/${slug}` });
  }
});

const filteredRegistrations = computed<RegisteredCourseEntry[]>(() => {
  if (!courseSearch.value.trim()) return myRegisteredCourseEntries.value;
  const keyword = courseSearch.value.toLowerCase();
  return myRegisteredCourseEntries.value.filter(
    (e) =>
      e.course.title.toLowerCase().includes(keyword) ||
      e.course.code.toLowerCase().includes(keyword),
  );
});

const filteredSavedCourses = computed(() => {
  const query = savedCourseSearch.value.toLowerCase().trim();
  if (!query) return courseBookmarkStore.myBookmarks;
  return courseBookmarkStore.myBookmarks.filter(
    (b) =>
      b.courseTitle.toLowerCase().includes(query) || b.courseCode.toLowerCase().includes(query),
  );
});

// Scroll on menu change
watch(activeMenu, () => scrollToProfileContentTop());

function scrollToProfileContentTop(): void {
  if (typeof window === 'undefined' || !profileContentRef.value) return;
  void nextTick(() => {
    if (!profileContentRef.value) return;
    const headerEl = document.querySelector<HTMLElement>('.q-header');
    const headerHeight = headerEl?.offsetHeight ?? 0;
    const sectionTop = profileContentRef.value.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, sectionTop - headerHeight - 8), behavior: 'smooth' });
  });
}

// Course bookmark toggle
function toggleRegisteredCourseBookmark(registration: CourseRegistration): void {
  const courseDetail = getCourseDetailById(registration.courseId);
  if (courseDetail) courseBookmarkStore.toggleBookmark(courseDetail);
}

// Unregister flow
function promptUnregister(registration: CourseRegistration): void {
  courseToUnregister.value = registration;
  showUnregisterDialog.value = true;
}

function cancelUnregister(): void {
  showUnregisterDialog.value = false;
  courseToUnregister.value = null;
}

function confirmUnregister(): void {
  if (courseToUnregister.value) {
    courseRegistrationStore.unregisterCourse(courseToUnregister.value.courseId);
  }
  showUnregisterDialog.value = false;
  courseToUnregister.value = null;
}

function promptUnregisterFromSaved(bookmark: CourseBookmark): void {
  const reg = myRegistrations.value.find((r) => r.courseId === bookmark.courseId);
  if (reg) promptUnregister(reg);
}

// Enrollment flow for saved courses
function openPendingPayment(courseId: string): void {
  const course = getCourseDetailById(courseId);
  if (course) {
    savedEnrollmentDialogCourse.value = course;
    savedEnrollmentDialogOpenKey.value += 1;
  }
}

function onSavedCourseEnroll(bookmark: CourseBookmark): void {
  const courseDetail = getCourseDetailById(bookmark.courseId);
  if (!courseDetail) return;
  savedEnrollmentDialogCourse.value = courseDetail;
  savedEnrollmentDialogOpenKey.value += 1;
}

function onSavedCourseEnrolled(): void {
  // Reactive update via store
}

// Receipt
async function downloadReceiptByCourseId(courseId: string): Promise<void> {
  const payment = coursePaymentStore.myPayments.find((p) => p.courseId === courseId);
  if (!payment) return;
  selectedPayment.value = payment;
  await nextTick();
  receiptDialogRef.value?.downloadReceiptPdf();
}

// Benefits
async function fetchBenefits(): Promise<void> {
  try {
    const { data: current } = await api.get<{
      hasPrivilege: boolean;
      stutypeId: number | null;
      stutypeName: string | null;
      source: 'student' | 'alumni' | 'staff' | null;
      checkedAt: string;
    }>('/api/privilege/me');

    if (current.hasPrivilege) {
      benefitsData.value = current;
      benefitsCheckedAt.value = new Date(current.checkedAt);
      return;
    }

    const { data: checked } = await api.post<{
      hasPrivilege: boolean;
      stutypeId: number | null;
      stutypeName: string | null;
      source: 'student' | 'alumni' | 'staff' | null;
      checkedAt: string;
    }>('/api/privilege/check', {});
    benefitsData.value = checked;
    benefitsCheckedAt.value = new Date(checked.checkedAt);
  } catch {
    // non-critical
  }
}

async function refreshBenefits(): Promise<void> {
  if (isRefreshingBenefits.value) return;
  isRefreshingBenefits.value = true;
  try {
    await fetchBenefits();
    $q.notify({
      type: 'positive',
      message: t('profile.notifications.benefitsRefreshed'),
      position: 'top',
    });
  } finally {
    isRefreshingBenefits.value = false;
  }
}

// Helpers
function getCourseDetailById(courseId: string): CourseDetail | null {
  return courseStore.getCourseDetailById(courseId) ?? null;
}

function getTranslatedCourseTitleByInfo(code?: string, title?: string): string {
  if (!code || !title) return title || '';
  if (locale.value === 'th') return title;
  const course = courseStore.courses.find((c: Course) => c.code === code);
  return course?.titleEn || title;
}

function formatThaiBuddhistDate(isoDate: string): string {
  const date = new Date(isoDate);
  if (locale.value === 'th') {
    const day = date.toLocaleDateString('th-TH', { day: 'numeric' });
    const month = date.toLocaleDateString('th-TH', { month: 'long' });
    const year = date.getFullYear() + 543;
    return `${day} ${month} B.E. ${year}`;
  }
  return date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatThaiDateTime(date: Date): string {
  const isTh = locale.value === 'th';
  const dateLabel = date.toLocaleDateString(isTh ? 'th-TH' : 'en-US', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
  const timeLabel = date.toLocaleTimeString(isTh ? 'th-TH' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  return isTh ? `${dateLabel} at ${timeLabel}` : `${dateLabel} ${timeLabel}`;
}

onMounted(async () => {
  const username = authStore.user?.username;
  if (username && !isTeachingRole.value) {
    await courseRegistrationStore.fetchMyEnrollments(username);
    const enrollIds = courseRegistrationStore.myRegistrations
      .map((r) => r.enrollId)
      .filter((id): id is number => id != null);
    void enrollmentProgressStore.fetchAllCompletions(enrollIds);
  }
  void fetchBenefits();
});
</script>

<style lang="scss" scoped>
.profile-page {
  min-height: calc(100vh - 68px);
  display: flex;
  flex-direction: column;
}

.profile-content {
  background: #f8f6f1;
  min-height: 60vh;
  flex: 1;
}

.profile-content :deep(.row.q-col-gutter-xl) {
  margin-left: -22px;
  margin-right: -22px;
}

.profile-content :deep(.row.q-col-gutter-xl > *) {
  padding-left: 22px;
  padding-right: 22px;
}

.profile-tab-panel {
  min-height: 100%;
}

// Unregister dialog
.modern-card {
  border-radius: 18px !important;
  overflow: hidden;
}

.unregister-dialog-card {
  width: 440px;
  max-width: 92vw;

  &__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  &__button {
    width: 100%;
    min-height: 44px;
    padding-inline: 12px;
  }

  &__actions :deep(.q-btn) {
    width: 100%;
    min-height: 46px;
  }

  &__actions :deep(.q-btn__content) {
    width: 100%;
    justify-content: center;
    white-space: nowrap;
  }
}

.unregister-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(#c62828, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

// Student card dialog
.student-card-dialog {
  width: 860px;
  max-width: 95vw;
  border-radius: 22px !important;
  overflow: hidden;
  box-shadow: 0 24px 64px rgba(17, 24, 39, 0.24) !important;

  &__content {
    position: relative;
    padding: 34px 38px 28px;
    background:
      radial-gradient(circle at 88% 18%, rgba($primary, 0.18), transparent 30%),
      linear-gradient(135deg, #ffffff 0%, #fffaf0 46%, #f7fafc 100%);

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 8px;
      background: linear-gradient(180deg, $primary, #c4850e);
    }
  }

  &__close {
    position: absolute;
    top: 18px;
    right: 18px;
    z-index: 2;
  }

  &__brand-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding-right: 44px;
  }

  &__logo {
    display: block;
    width: 210px;
    height: 58px;
    object-fit: contain;
  }

  &__status {
    padding: 6px 12px;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  &__header {
    margin-top: 10px;
  }

  &__title-en {
    color: $secondary;
    font-size: 1.35rem;
    font-weight: 800;
    line-height: 1.2;
    margin-top: 2px;
  }

  &__student-code {
    color: #4b5563;
    font-size: 1.05rem;
    font-weight: 600;
    margin-top: 18px;
  }

  &__body {
    display: grid;
    grid-template-columns: 220px 1fr;
    align-items: center;
    gap: 34px;
    margin-top: 34px;
  }

  &__avatar-shell {
    display: flex;
    justify-content: center;
  }

  &__avatar {
    background: linear-gradient(135deg, rgba($secondary, 0.9), rgba($primary, 0.9));
    border: 5px solid white;
    box-shadow:
      0 0 0 1px rgba($primary, 0.2),
      0 16px 34px rgba(17, 24, 39, 0.18);
    overflow: hidden;
  }

  &__avatar-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__details {
    display: grid;
    gap: 12px;
    padding: 22px 24px;
    border-radius: 18px;
    background: rgba(255, 255, 255, 0.72);
    border: 1px solid rgba(17, 24, 39, 0.08);
  }

  &__detail-row {
    display: grid;
    grid-template-columns: 120px 1fr;
    align-items: baseline;
    gap: 16px;
    color: #111827;

    span {
      color: #6b7280;
      font-weight: 700;
    }

    strong {
      font-size: 1.05rem;
      font-weight: 800;
      word-break: break-word;
    }
  }

  &__footer {
    display: flex;
    align-items: center;
    margin-top: 32px;
    padding-top: 18px;
    border-top: 1px dashed rgba(17, 24, 39, 0.18);
    color: #374151;
    font-size: 1rem;
    font-weight: 700;
  }
}

@media (max-width: 767px) {
  .student-card-dialog {
    &__content {
      padding: 28px 20px 22px;
    }

    &__brand-row {
      align-items: flex-start;
      flex-direction: column;
      padding-right: 36px;
    }

    &__logo {
      width: 180px;
      height: 52px;
    }

    &__title-en {
      font-size: 1.05rem;
    }

    &__body {
      grid-template-columns: 1fr;
      gap: 22px;
      margin-top: 24px;
    }

    &__details {
      padding: 18px;
    }

    &__detail-row {
      grid-template-columns: 1fr;
      gap: 2px;
    }

    &__footer {
      align-items: flex-start;
      flex-direction: column;
      gap: 8px;
    }
  }
}
</style>
