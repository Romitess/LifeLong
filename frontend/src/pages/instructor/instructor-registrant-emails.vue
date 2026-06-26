<template>
  <q-page class="admin-page registrant-email-page">
    <div class="section-container registrant-email-page__shell">
      <InstructorPageHero
        eyebrow="Instructor Workspace"
        :title="tt('instructor.registrantEmail.title', 'ส่งอีเมลถึงผู้ลงทะเบียน')"
      >
        <template #actions>
          <div v-if="!isDetailView" class="registrant-email-page__hero-actions">
            <div class="registrant-email-page__hero-summary">
              <div
                v-for="summary in listSummaries"
                :key="summary.label"
                class="registrant-hero-summary-card"
                :style="{ '--summary-accent': summary.color, '--summary-soft': summary.bg }"
              >
                <div class="registrant-hero-summary-card__icon">
                  <q-icon :name="summary.icon" />
                </div>
                <div>
                  <strong>{{ summary.value }}</strong>
                  <span>{{ summary.label }}</span>
                </div>
              </div>
            </div>
          </div>
          <q-badge
            v-if="isDetailView"
            rounded
            color="primary"
            class="registrant-email-page__hero-badge"
          >
            {{
              currentView === 'list'
                ? tt('instructor.registrantEmail.heroBadgeCourses', '{count} รายวิชา', {
                    count: filteredCourseRows.length,
                  })
                : tt('instructor.registrantEmail.heroBadgeRecipients', '{count} ผู้ลงทะเบียน', {
                    count: learnerRows.length,
                  })
            }}
          </q-badge>
        </template>
      </InstructorPageHero>
      <div v-if="isDetailView" class="registrant-email-page__breadcrumb">
        <button type="button" class="registrant-email-page__crumb-btn" @click="goToCourseList">
          {{ tt('instructor.registrantEmail.title', 'ส่งอีเมลถึงผู้ลงทะเบียน') }}
        </button>
        <q-icon name="chevron_right" size="18px" />
        <span>{{ tt('instructor.registrantEmail.rosterCrumb', 'รายชื่อ') }}</span>
      </div>
      <div v-else class="registrant-email-page__title">
        <h1>{{ tt('instructor.registrantEmail.title', 'ส่งอีเมลถึงผู้ลงทะเบียน') }}</h1>
      </div>

      <section v-if="!isDetailView" class="registrant-email-page__surface">
        <div class="registrant-email-page__table-head">
          <div class="registrant-email-page__table-title-group">
            <h2>{{ tt('instructor.registrantEmail.courseListTitle', 'รายวิชาที่ดูแล') }}</h2>
            <span class="registrant-email-page__table-meta">
              {{
                tt('instructor.registrantEmail.courseCount', 'แสดงข้อมูล {count} รายการ', {
                  count: filteredCourseRows.length,
                })
              }}
            </span>
          </div>
          <BaseSearchInput
            v-model="courseSearch"
            placeholder="ค้นหารายชื่อวิชา"
            class="registrant-email-page__search"
          />
        </div>

        <BaseTable
          :rows="paginatedCourseRows"
          :columns="courseColumns"
          row-key="id"
          show-index
          :rows-per-page="courseRowsPerPage"
          :index-offset="(coursePage - 1) * courseRowsPerPage"
          :page="coursePage"
          :total-pages="coursePageCount"
          min-width="1120px"
          :row-height="104"
          height-mode="stable"
          :empty-text="tt('instructor.registrantEmail.noCourses', 'ไม่พบข้อมูล')"
          class="registrant-email-page__table registrant-email-page__course-table"
          :on-page-change="setCoursePage"
        >
          <template #cell-course="{ row }">
            <div class="registrant-email-page__course-title-layout">
              <img
                :src="row.imageUrl"
                :alt="row.courseTitleEn || row.courseTitle"
                class="registrant-email-page__course-image"
              />
              <div class="registrant-email-page__course-copy">
                <button
                  type="button"
                  class="registrant-email-page__course-link"
                  @click="openCompose(row.id)"
                >
                  {{ row.courseTitle }}
                </button>
                <div v-if="row.courseTitleEn" class="registrant-email-page__course-subtitle">
                  {{ row.courseTitleEn }}
                </div>
              </div>
            </div>
          </template>
          <template #cell-schedule="{ row }">
            <div class="registrant-email-page__schedule-cell">
              <div>{{ tt('instructor.registrantEmail.registrationPeriod', 'ลงทะเบียน') }}</div>
              <strong>{{ row.registrationRange }}</strong>
              <div>{{ tt('instructor.registrantEmail.paymentPeriod', 'ชำระเงิน') }}</div>
              <strong>{{ row.paymentRange }}</strong>
              <div>{{ tt('instructor.registrantEmail.teachingPeriod', 'การเรียนการสอน') }}</div>
              <strong>{{ row.teachingRange }}</strong>
            </div>
          </template>
          <template #cell-paid="{ row }">
            <span class="text-positive">{{ row.paidCount }}</span>
          </template>
          <template #cell-unpaid="{ row }">
            <span class="text-negative">{{ row.unpaidCount }}</span>
          </template>
          <template #cell-emailAction="{ row }">
            <div class="registrant-email-page__actions-cell">
              <AppIconButton icon="mail" tone="edit" @click="openCompose(row.id)" />
            </div>
          </template>
          <template #cell-historyAction="{ row }">
            <div class="registrant-email-page__actions-cell">
              <AppIconButton icon="list_alt" tone="view" @click="openHistory(row.id)" />
            </div>
          </template>
        </BaseTable>
      </section>

      <section v-else-if="selectedCourse" class="registrant-email-page__surface">
        <div class="registrant-email-page__summary">
          <div class="registrant-email-page__summary-row">
            <span>{{ tt('instructor.registrantEmail.courseLabel', 'รายวิชา') }}</span>
            <div
              class="registrant-email-page__summary-value registrant-email-page__summary-value--course"
            >
              <strong>{{ selectedCourse.code }} : {{ selectedCourse.title }}</strong>
              <small v-if="selectedCourse.titleEn">{{ selectedCourse.titleEn }}</small>
            </div>
          </div>
          <div class="registrant-email-page__summary-row">
            <span>{{ tt('instructor.registrantEmail.feeLabel', 'ค่าธรรมเนียม') }}</span>
            <div class="registrant-email-page__summary-value">
              <strong>{{ formatNumber(selectedCourse.price) }}</strong>
              <small>{{ tt('instructor.registrantEmail.baht', 'บาท') }}</small>
            </div>
          </div>
          <div class="registrant-email-page__summary-row">
            <span>{{ tt('instructor.registrantEmail.seatLabel', 'จำนวนรับ') }}</span>
            <div class="registrant-email-page__summary-value">
              <strong>{{ formatNumber(selectedCourse.maxSeats ?? 0) }}</strong>
              <small>{{ tt('instructor.registrantEmail.people', 'คน') }}</small>
            </div>
          </div>
          <div class="registrant-email-page__summary-row">
            <span>{{ tt('instructor.registrantEmail.registeredLabel', 'จำนวนผู้ลงทะเบียน') }}</span>
            <div class="registrant-email-page__summary-value">
              <strong>{{ formatNumber(learnerRows.length) }}</strong>
              <small class="registrant-email-page__summary-status">
                <span class="text-positive">
                  {{
                    tt('instructor.registrantEmail.noDebt', 'ไม่มีหนี้ค้างชำระ {count} คน', {
                      count: paidCount,
                    })
                  }}
                </span>
                <span class="text-negative q-ml-xs">
                  {{
                    tt('instructor.registrantEmail.debt', 'ค้างชำระ {count} คน', {
                      count: unpaidCount,
                    })
                  }}
                </span>
              </small>
            </div>
          </div>
        </div>

        <div v-if="currentView === 'compose'" class="registrant-email-page__detail-grid">
          <div class="registrant-email-page__left-panel">
            <BaseTable
              :rows="paginatedLearners"
              :columns="learnerColumns"
              row-key="id"
              show-index
              :rows-per-page="learnerRowsPerPage"
              :index-offset="(learnerPage - 1) * learnerRowsPerPage"
              :page="learnerPage"
              :total-pages="learnerPageCount"
              min-width="700px"
              height-mode="stable"
              :loading="loadingLearners"
              :empty-text="tt('instructor.registrantEmail.noLearners', 'ไม่พบข้อมูล')"
              class="registrant-email-page__table"
              :on-page-change="setLearnerPage"
            >
              <template #cell-name="{ row }">
                <div class="registrant-email-page__recipient-cell">
                  <strong>{{ row.name }}</strong>
                </div>
              </template>
            </BaseTable>
          </div>

          <div class="registrant-email-page__right-panel">
            <BaseSelect
              :model-value="selectedRecipientIds"
              :options="recipientOptions"
              multiple
              emit-value
              map-options
              behavior="menu"
              dropdown-icon="keyboard_arrow_down"
              display-value=""
              :error="recipientTouched && selectedRecipientIds.length === 0"
              :label="tt('instructor.registrantEmail.toLabel', 'ถึง')"
              required
              :placeholder="
                tt(
                  'instructor.registrantEmail.toPlaceholder',
                  'คลิกเลือกข้อมูล สามารถเลือกได้มากกว่า 1 รายการ',
                )
              "
              popup-content-class="registrant-email-page__select-menu"
              class="registrant-email-page__recipient-select"
              @popup-hide="recipientTouched = true"
              @update:model-value="updateRecipientIds"
            >
              <template #selected>
                <span class="registrant-email-page__select-value">
                  {{
                    tt(
                      'instructor.registrantEmail.toPlaceholder',
                      'คลิกเลือกข้อมูล สามารถเลือกได้มากกว่า 1 รายการ',
                    )
                  }}
                </span>
              </template>
            </BaseSelect>

            <div
              v-if="recipientTouched && selectedRecipientIds.length === 0"
              class="registrant-email-page__field-error"
            >
              {{ tt('instructor.registrantEmail.toRequired', 'กรุณากรอก ถึง') }}
            </div>

            <div class="registrant-email-page__inline-actions">
              <BaseButton
                color="grey-7"
                icon="select_all"
                :label="tt('instructor.registrantEmail.selectAll', 'เลือกรายชื่อทั้งหมด')"
                no-caps
                :disable="learnerRows.length === 0"
                @click="selectAllRecipients"
              />
              <BaseButton
                outline
                color="grey-7"
                icon="backspace"
                :label="tt('instructor.registrantEmail.clearAll', 'ยกเลิกการเลือกรายชื่อทั้งหมด')"
                no-caps
                :disable="selectedRecipientIds.length === 0"
                @click="clearRecipients"
              />
            </div>

            <q-input
              v-model="emailForm.subject"
              outlined
              dense
              :label="tt('instructor.registrantEmail.subjectLabel', 'ชื่อเรื่อง *')"
            />

            <q-input
              v-model="emailForm.body"
              outlined
              type="textarea"
              :label="tt('instructor.registrantEmail.detailLabel', 'รายละเอียด *')"
              class="registrant-email-page__textarea"
            />

            <div class="registrant-email-page__notice">
              <div class="registrant-email-page__notice-title">
                <q-icon name="info" size="18px" />
                <span>{{
                  tt('instructor.registrantEmail.noticeTitle', 'หมายเหตุการส่งอีเมล')
                }}</span>
              </div>
              {{
                tt(
                  'instructor.registrantEmail.replyNotice',
                  'เนื่องจากเป็นการส่ง E-mail โดยระบบ ผู้เรียนจะไม่สามารถตอบกลับข้อความได้ ผู้สอนกรุณาใส่ข้อมูลสำหรับให้ผู้เรียนตอบกลับหรือรายละเอียดอื่นๆ ที่ต้องการแจ้งผู้เรียนให้ครบถ้วนในช่องรายละเอียด',
                )
              }}
            </div>

            <BaseButton
              color="warning"
              text-color="black"
              icon="send"
              :label="tt('instructor.registrantEmail.sendButton', 'ส่ง')"
              no-caps
              :loading="sending"
              :disable="!canSend"
              @click="sendEmail"
            />
          </div>
        </div>

        <div v-else class="registrant-email-page__history-panel">
          <BaseTable
            :rows="historyRows"
            :columns="historyColumns"
            row-key="id"
            show-index
            :rows-per-page="historyRowsPerPage"
            :index-offset="(historyPage - 1) * historyRowsPerPage"
            :page="historyPage"
            :total-pages="historyPageCount"
            min-width="1040px"
            height-mode="stable"
            :empty-text="tt('instructor.registrantEmail.noHistory', 'ไม่พบข้อมูล')"
            class="registrant-email-page__table"
            :on-page-change="setHistoryPage"
          >
            <template #cell-sender="{ row }">
              <span>{{ row.sender }}</span>
            </template>
            <template #cell-body="{ row }">
              <span class="registrant-email-page__history-body">{{ row.body }}</span>
            </template>
          </BaseTable>
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';
import { useInstructorBackend } from 'src/composables/use-instructor-backend';
import type { InstructorLearner } from 'src/composables/use-instructor-backend';
import type { Course } from 'src/types/course';
import BaseButton from 'src/components/base/BaseButton.vue';
import BaseSearchInput from 'src/components/base/BaseSearchInput.vue';
import BaseSelect from 'src/components/base/BaseSelect.vue';
import AppIconButton from 'src/components/common/AppIconButton.vue';
import InstructorPageHero from 'src/components/instructor/InstructorPageHero.vue';
import BaseTable, { type BaseTableColumn } from 'src/components/base/BaseTable.vue';

type RegistrantEmailView = 'list' | 'compose' | 'history';

interface CourseListRow {
  id: string;
  courseTitle: string;
  courseTitleEn: string;
  imageUrl: string;
  fee: number;
  registrationRange: string;
  paymentRange: string;
  teachingRange: string;
  seats: number;
  paidCount: number;
  unpaidCount: number;
  remainingCount: number;
}

interface LearnerEmailRow {
  id: string;
  userId: number;
  studentId: string;
  name: string;
  email: string;
  phone: string;
  enrolledAt: string;
  paymentStatus: string;
  paymentColor: string;
}

interface HistoryRow {
  id: string;
  sender: string;
  recipients: string;
  sentAt: string;
  subject: string;
  body: string;
}

interface SummaryCardItem {
  icon: string;
  value: string;
  label: string;
  bg: string;
  color: string;
}

const $q = useQuasar();
const { t } = useI18n();
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const courseStore = useCourseStore();
const instructorBackend = useInstructorBackend();

courseStore.init();

const courseSearch = ref('');
const coursePage = ref(1);
const learnerPage = ref(1);
const historyPage = ref(1);
const courseRowsPerPage = 10;
const learnerRowsPerPage = 8;
const historyRowsPerPage = 8;
const selectedRecipientIds = ref<string[]>([]);
const recipientTouched = ref(false);
const loadingLearners = ref(false);
const sending = ref(false);
const emailForm = reactive({
  subject: '',
  body: '',
});
const sentHistory = ref<Record<string, HistoryRow[]>>({});

const currentView = computed<RegistrantEmailView>(() => {
  const raw = route.query.view;
  if (raw === 'compose' || raw === 'history') {
    return raw;
  }
  return 'list';
});

const selectedCourseId = computed(() =>
  typeof route.query.courseId === 'string' ? route.query.courseId : '',
);

const isDetailView = computed(
  () => currentView.value !== 'list' && selectedCourseId.value.trim().length > 0,
);

const instructorCourses = computed<Course[]>(() =>
  [...courseStore.getInstructorCourses(authStore.user)].sort((left, right) =>
    left.code.localeCompare(right.code),
  ),
);

const selectedCourse = computed(() =>
  instructorCourses.value.find((course) => course.id === selectedCourseId.value),
);

const courseRows = computed<CourseListRow[]>(() =>
  instructorCourses.value.map((course) => {
    const paidCount = course.isFree
      ? course.enrolledCount
      : Math.max(0, course.enrolledCount - estimatedUnpaidCount(course));
    const unpaidCount = course.isFree ? 0 : estimatedUnpaidCount(course);
    return {
      id: course.id,
      courseTitle: `${course.code} : ${course.title}`,
      courseTitleEn: course.titleEn ?? '',
      imageUrl: course.imageUrl,
      fee: course.price,
      registrationRange: formatDateRange(course.registrationStartDate, course.registrationEndDate),
      paymentRange: formatDateRange(course.registrationStartDate, course.registrationEndDate),
      teachingRange: formatDateRange(course.registrationStartDate, course.registrationEndDate),
      seats: course.maxSeats ?? 0,
      paidCount,
      unpaidCount,
      remainingCount: Math.max(0, (course.maxSeats ?? 0) - course.enrolledCount),
    };
  }),
);

const listSummaries = computed<SummaryCardItem[]>(() => {
  const totalCourses = courseRows.value.length;
  const totalRegistrants = courseRows.value.reduce(
    (sum, row) => sum + row.paidCount + row.unpaidCount,
    0,
  );
  const totalPaid = courseRows.value.reduce((sum, row) => sum + row.paidCount, 0);
  const totalPending = courseRows.value.reduce((sum, row) => sum + row.unpaidCount, 0);

  return [
    {
      icon: 'menu_book',
      value: formatNumber(totalCourses),
      label: tt('instructor.registrantEmail.summaryCourses', 'รายวิชาที่ดูแล'),
      bg: 'rgba(59, 130, 246, 0.12)',
      color: '#2563eb',
    },
    {
      icon: 'groups',
      value: formatNumber(totalRegistrants),
      label: tt('instructor.registrantEmail.summaryRegistrants', 'ผู้ลงทะเบียนทั้งหมด'),
      bg: 'rgba(14, 165, 233, 0.12)',
      color: '#0284c7',
    },
    {
      icon: 'mark_email_read',
      value: formatNumber(totalPaid),
      label: tt('instructor.registrantEmail.summaryReady', 'พร้อมส่งอีเมล'),
      bg: 'rgba(34, 197, 94, 0.12)',
      color: '#16a34a',
    },
    {
      icon: 'pending_actions',
      value: formatNumber(totalPending),
      label: tt('instructor.registrantEmail.summaryPending', 'ค้างชำระ'),
      bg: 'rgba(245, 158, 11, 0.16)',
      color: '#d97706',
    },
  ];
});

const filteredCourseRows = computed(() => {
  const keyword = courseSearch.value.trim().toLowerCase();
  if (!keyword) return courseRows.value;
  return courseRows.value.filter((row) =>
    [row.courseTitle, row.courseTitleEn].some((value) => value.toLowerCase().includes(keyword)),
  );
});

const coursePageCount = computed(() =>
  Math.max(1, Math.ceil(filteredCourseRows.value.length / courseRowsPerPage)),
);

const paginatedCourseRows = computed(() =>
  filteredCourseRows.value.slice(
    (coursePage.value - 1) * courseRowsPerPage,
    coursePage.value * courseRowsPerPage,
  ),
);

const courseColumns = computed<BaseTableColumn[]>(() => [
  { key: 'course', label: tt('instructor.registrantEmail.colCourse', 'ชื่อรายวิชา'), width: '30%' },
  {
    key: 'fee',
    label: tt('instructor.registrantEmail.feeLabel', 'ค่าธรรมเนียม'),
    width: '96px',
    align: 'center',
  },
  {
    key: 'schedule',
    label: tt('instructor.registrantEmail.scheduleLabel', 'กำหนดการ'),
    width: '170px',
    align: 'center',
  },
  {
    key: 'seats',
    label: tt('instructor.registrantEmail.seatShortLabel', 'รับ'),
    width: '86px',
    align: 'center',
  },
  {
    key: 'paid',
    label: tt('instructor.registrantEmail.noDebtShortLabel', 'ไม่มีหนี้ค้างชำระ'),
    width: '92px',
    align: 'center',
  },
  {
    key: 'unpaid',
    label: tt('instructor.registrantEmail.debtShortLabel', 'ค้างชำระ'),
    width: '92px',
    align: 'center',
  },
  {
    key: 'remainingCount',
    label: tt('instructor.registrantEmail.remainingLabel', 'เหลือ'),
    width: '92px',
    align: 'center',
  },
  {
    key: 'emailAction',
    label: tt('instructor.registrantEmail.composeTab', 'ส่ง E-mail'),
    width: '88px',
    align: 'center',
  },
  {
    key: 'historyAction',
    label: tt('instructor.registrantEmail.historyTab', 'ประวัติการส่ง E-mail'),
    width: '88px',
    align: 'center',
  },
]);

const learnerColumns = computed<BaseTableColumn[]>(() => [
  { key: 'name', label: tt('instructor.registrantEmail.colName', 'ชื่อ-สกุล'), width: '220px' },
  { key: 'email', label: tt('instructor.registrantEmail.colEmail', 'อีเมล'), width: '220px' },
  { key: 'phone', label: tt('instructor.registrantEmail.colPhone', 'เบอร์โทร'), width: '130px' },
  {
    key: 'enrolledAt',
    label: tt('instructor.registrantEmail.colRegisteredAt', 'วันที่ลงทะเบียนเรียน'),
    width: '170px',
  },
]);

const historyColumns = computed<BaseTableColumn[]>(() => [
  {
    key: 'sender',
    label: tt('instructor.registrantEmail.colSender', 'ชื่อ-สกุล ผู้ส่ง'),
    width: '220px',
  },
  {
    key: 'recipients',
    label: tt('instructor.registrantEmail.colRecipients', 'ชื่อ-สกุล ผู้รับ'),
    width: '240px',
  },
  {
    key: 'sentAt',
    label: tt('instructor.registrantEmail.colSentAt', 'เวลาส่ง E-mail'),
    width: '160px',
  },
  {
    key: 'subject',
    label: tt('instructor.registrantEmail.subjectLabel', 'ชื่อเรื่อง'),
    width: '220px',
  },
  {
    key: 'body',
    label: tt('instructor.registrantEmail.detailLabel', 'รายละเอียด'),
    width: '320px',
  },
]);

onMounted(() => {
  const email = authStore.user?.email;
  if (email) {
    void courseStore.fetchInstructorCourses(email);
  }
});

watch(filteredCourseRows, () => {
  coursePage.value = 1;
});

watch(coursePageCount, (count) => {
  coursePage.value = Math.min(coursePage.value, count);
});

watch(
  () => [selectedCourseId.value, currentView.value] as const,
  async ([courseId, view]) => {
    selectedRecipientIds.value = [];
    learnerPage.value = 1;
    historyPage.value = 1;

    if (!courseId || view === 'list' || !selectedCourse.value) return;

    loadingLearners.value = true;
    try {
      await instructorBackend.fetchLearners(
        authStore.user?.email,
        courseId,
        selectedCourse.value.moodleId ?? null,
      );
      const numericId = getNumericCourseId(courseId);
      if (numericId) {
        await instructorBackend.fetchDbAnnouncements(numericId);
      }
    } finally {
      loadingLearners.value = false;
    }
  },
  { immediate: true },
);

const backendLearners = computed<InstructorLearner[]>(
  () => instructorBackend.learnersByCourseId.value[selectedCourseId.value] ?? [],
);

const learnerRows = computed<LearnerEmailRow[]>(() =>
  backendLearners.value.map((learner) => ({
    id: String(learner.userId),
    userId: learner.userId,
    studentId: learner.studentId || learner.username || '-',
    name: learner.fullName || learner.email || '-',
    email: learner.email ?? '',
    phone: learner.phone ?? '-',
    enrolledAt: formatDate(learner.enrolledAt),
    paymentStatus: formatPaymentStatus(learner.paymentStatus, selectedCourse.value?.isFree).label,
    paymentColor: formatPaymentStatus(learner.paymentStatus, selectedCourse.value?.isFree).color,
  })),
);

const paidCount = computed(
  () => learnerRows.value.filter((learner) => learner.paymentColor === 'positive').length,
);

const unpaidCount = computed(
  () => learnerRows.value.filter((learner) => learner.paymentColor === 'negative').length,
);

const learnerPageCount = computed(() =>
  Math.max(1, Math.ceil(learnerRows.value.length / learnerRowsPerPage)),
);

const paginatedLearners = computed(() =>
  learnerRows.value.slice(
    (learnerPage.value - 1) * learnerRowsPerPage,
    learnerPage.value * learnerRowsPerPage,
  ),
);

const recipientOptions = computed(() =>
  learnerRows.value
    .filter((learner) => learner.email)
    .map((learner) => ({
      label: `${learner.name} <${learner.email}>`,
      value: learner.id,
    })),
);

const selectedRecipients = computed(() =>
  learnerRows.value.filter((learner) => selectedRecipientIds.value.includes(learner.id)),
);

const historyRows = computed(() => {
  const localRows = sentHistory.value[selectedCourseId.value] ?? [];
  const numericId = getNumericCourseId(selectedCourseId.value);
  const persistedRows = (
    numericId ? (instructorBackend.dbAnnouncementsByCourseId.value[numericId] ?? []) : []
  ).map((item) => ({
    id: `history-${item.id}`,
    sender: item.createUser || authStore.user?.email || '-',
    recipients: tt('instructor.registrantEmail.allRegistrants', 'ผู้ลงทะเบียนทั้งหมด'),
    sentAt: formatDate(item.createDate),
    subject: item.title,
    body: stripHtml(item.content),
  }));
  return [...localRows, ...persistedRows];
});

const historyPageCount = computed(() =>
  Math.max(1, Math.ceil(historyRows.value.length / historyRowsPerPage)),
);

const canSend = computed(
  () =>
    selectedRecipients.value.length > 0 &&
    emailForm.subject.trim().length > 0 &&
    emailForm.body.trim().length > 0,
);

function tt(key: string, fallback: string, params?: Record<string, string | number>): string {
  const translated = t(key, params ?? {});
  if (translated === key) {
    return Object.entries(params ?? {}).reduce(
      (text, [paramKey, value]) => text.replace(`{${paramKey}}`, String(value)),
      fallback,
    );
  }
  return translated;
}

function setCoursePage(page: number): void {
  coursePage.value = page;
}

function setLearnerPage(page: number): void {
  learnerPage.value = page;
}

function setHistoryPage(page: number): void {
  historyPage.value = page;
}

function openCompose(courseId: string): void {
  void router.push({
    path: '/instructor/registrant-emails',
    query: { courseId, view: 'compose' },
  });
}

function openHistory(courseId: string): void {
  void router.push({
    path: '/instructor/registrant-emails',
    query: { courseId, view: 'history' },
  });
}

function goToCourseList(): void {
  void router.push({ path: '/instructor/registrant-emails' });
}

function normalizeRecipientIds(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String) : [];
}

function updateRecipientIds(value: unknown): void {
  selectedRecipientIds.value = normalizeRecipientIds(value);
  recipientTouched.value = true;
}

function selectAllRecipients(): void {
  selectedRecipientIds.value = learnerRows.value
    .filter((learner) => learner.email)
    .map((learner) => learner.id);
  recipientTouched.value = true;
}

function clearRecipients(): void {
  selectedRecipientIds.value = [];
  recipientTouched.value = true;
}

async function sendEmail(): Promise<void> {
  recipientTouched.value = true;
  if (!selectedCourse.value || !canSend.value) return;

  const numericId = getNumericCourseId(selectedCourse.value.id);
  if (!numericId) {
    $q.notify({
      type: 'negative',
      message: tt('instructor.notify.courseIdNotFound', 'ไม่พบรหัสรายวิชา'),
    });
    return;
  }

  sending.value = true;
  try {
    const recipientLine = selectedRecipients.value
      .map((learner) => `${learner.name} <${learner.email}>`)
      .join(', ');
    const content = `<p><strong>${tt('instructor.registrantEmail.selectedRecipients', 'รายชื่อผู้รับที่เลือก:')}</strong> ${escapeHtml(recipientLine)}</p><p>${escapeHtml(emailForm.body).replace(/\n/g, '<br>')}</p>`;

    const result = await instructorBackend.createAnnouncement({
      courseId: numericId,
      title: emailForm.subject.trim(),
      content,
      recipientUserIds: selectedRecipients.value.map((learner) => learner.userId),
    });

    await instructorBackend.fetchDbAnnouncements(numericId);

    const total = result.emailsSent + result.emailsFailed + result.emailsSkipped;
    sentHistory.value = {
      ...sentHistory.value,
      [selectedCourse.value.id]: [
        {
          id: `local-${Date.now()}`,
          sender: authStore.user?.email || '-',
          recipients:
            recipientLine || tt('instructor.registrantEmail.allRegistrants', 'ผู้ลงทะเบียนทั้งหมด'),
          sentAt: formatDate(new Date().toISOString()),
          subject: emailForm.subject.trim(),
          body: emailForm.body.trim(),
        },
        ...(sentHistory.value[selectedCourse.value.id] ?? []),
      ],
    };

    emailForm.subject = '';
    emailForm.body = '';
    selectedRecipientIds.value = [];
    recipientTouched.value = false;

    $q.notify({
      type: 'positive',
      icon: 'mail',
      message: tt(
        'instructor.registrantEmail.sentNotify',
        'ส่ง E-mail แล้ว {sent}/{total} รายการ',
        {
          sent: result.emailsSent,
          total,
        },
      ),
      position: 'top',
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: tt('instructor.registrantEmail.sendFailed', 'ไม่สามารถส่ง E-mail ได้'),
      position: 'top',
    });
  } finally {
    sending.value = false;
  }
}

function getNumericCourseId(courseId: string): number | null {
  const match = courseId.match(/\d+$/);
  return match ? Number(match[0]) : null;
}

function estimatedUnpaidCount(course: Course): number {
  if (course.isFree) return 0;
  return Math.min(course.enrolledCount, Math.max(0, Math.round(course.enrolledCount * 0.12)));
}

function formatPaymentStatus(
  value: string | null,
  isFree = false,
): { label: string; color: string } {
  if (isFree) {
    return { label: tt('instructor.course.freeLabel', 'ไม่มีค่าใช้จ่าย'), color: 'positive' };
  }
  if (value === 'Y' || value === 'paid') {
    return { label: tt('instructor.status.paid', 'ชำระแล้ว'), color: 'positive' };
  }
  if (value === 'N' || value === 'unpaid') {
    return { label: tt('instructor.status.unpaid', 'ยังไม่ชำระ'), color: 'negative' };
  }
  return { label: tt('instructor.status.noPaymentInfo', 'ไม่มีข้อมูล'), color: 'grey-6' };
}

function formatDate(value: string | null | undefined): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatDateRange(start: string | null | undefined, end: string | null | undefined): string {
  const startLabel = formatDate(start).replace(/ \d{2}:\d{2}$/, '');
  const endLabel = formatDate(end).replace(/ \d{2}:\d{2}$/, '');
  return `${startLabel} - ${endLabel}`;
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('th-TH').format(value);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function stripHtml(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
</script>

<style lang="scss" scoped>
.registrant-email-page {
  padding: 0 0 72px;
  background: #eef2f5;
}

.registrant-email-page__shell {
  display: grid;
  gap: 18px;
  width: 100%;
  max-width: none;
  padding-top: 0;
  padding-bottom: 0;
}

.registrant-email-page :deep(.instructor-page-hero) {
  width: calc(100% + 48px);
  margin-left: -24px;
  margin-bottom: 10px;
  transform: none;
}

.registrant-email-page :deep(.instructor-page-hero__content) {
  min-height: 190px;
  padding: 30px 24px;
}

.registrant-email-page :deep(.instructor-page-hero__identity) {
  gap: 22px;
  flex: 1 1 auto;
  min-width: 0;
}

.registrant-email-page :deep(.instructor-page-hero h1) {
  font-size: clamp(1.9rem, 2.7vw, 2.45rem);
}

.registrant-email-page :deep(.instructor-page-hero__copy) {
  display: grid;
  align-content: center;
  gap: 2px;
}

.registrant-email-page :deep(.instructor-page-hero__actions) {
  flex: 0 0 auto;
  margin-left: auto;
}

.registrant-email-page__title {
  display: none;
}

.registrant-email-page__title h1 {
  margin: 0;
  color: var(--admin-navy);
  font-size: 1.45rem;
  font-weight: 900;
}

.registrant-email-page__hero-badge {
  min-height: 40px;
  padding: 0 14px;
  border-radius: 999px;
  font-size: 0.92rem;
  font-weight: 800;
}

.registrant-email-page__hero-actions {
  display: grid;
  gap: 14px;
  width: min(720px, 100%);
}

.registrant-email-page__hero-summary {
  display: grid;
  grid-template-columns: repeat(4, minmax(132px, 1fr));
  gap: 14px;
  width: min(720px, 100%);
}

.registrant-hero-summary-card {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
  min-height: 78px;
  padding: 14px;
  border: 1px solid rgba(255, 255, 255, 0.16);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.09);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.04);
  backdrop-filter: blur(4px);
}

.registrant-hero-summary-card__icon {
  display: grid;
  place-items: center;
  flex: 0 0 44px;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.9);
  color: var(--summary-accent);
  font-size: 23px;
}

.registrant-hero-summary-card div:last-child {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.registrant-hero-summary-card span {
  margin-top: 4px;
  color: rgba(255, 255, 255, 0.76);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.25;
}

.registrant-hero-summary-card strong {
  color: #ffffff;
  font-size: 1.48rem;
  font-weight: 800;
  line-height: 1.1;
}

.registrant-email-page__breadcrumb {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--admin-muted);
  font-size: 0.95rem;
  font-weight: 700;
}

.registrant-email-page__crumb-btn {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--admin-gold-deep);
  font: inherit;
  cursor: pointer;
}

.registrant-email-page__surface {
  overflow: hidden;
  border: 1px solid var(--admin-line);
  border-radius: var(--admin-radius-lg);
  background: var(--admin-surface);
  box-shadow: var(--admin-shadow-sm);
}

.registrant-email-page__table-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  padding: 20px 22px;
  border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  min-width: 0;
}

.registrant-email-page__table-title-group {
  min-width: 0;
}

.registrant-email-page__table-title-group h2 {
  margin: 0;
  color: #09213f;
  font-size: 1.18rem;
  font-weight: 900;
}

.registrant-email-page__table-meta {
  display: block;
  margin-top: 3px;
  color: #64748b;
  font-size: 0.84rem;
  font-weight: 800;
}

.registrant-email-page__search {
  flex: 0 1 352px;
  width: min(352px, 100%);
  min-width: 0;
}

.registrant-email-page__table {
  --base-table-row-hover: rgba(37, 99, 235, 0.03);
  border: 0;
  border-radius: 0;
  box-shadow: none;
}

.registrant-email-page__search.base-search-input :deep(.q-field__control) {
  min-height: 44px !important;
  height: 44px !important;
  border-radius: var(--radius-md) !important;
  background: #ffffff !important;
  box-shadow: none !important;
  transition: none !important;
}

.registrant-email-page__search.base-search-input :deep(.q-field__marginal) {
  height: 44px !important;
}

.registrant-email-page__search.base-search-input :deep(.q-field__control::before) {
  border-color: rgba(17, 24, 39, 0.14) !important;
  border-radius: var(--radius-md) !important;
}

.registrant-email-page__search.base-search-input:hover :deep(.q-field__control::before) {
  border-color: rgba(17, 24, 39, 0.22) !important;
}

.registrant-email-page__search.base-search-input:hover :deep(.q-field__control),
.registrant-email-page__search.base-search-input.q-field--focused :deep(.q-field__control),
.registrant-email-page__search.base-search-input.q-field--highlighted :deep(.q-field__control) {
  box-shadow: none !important;
}

.registrant-email-page__search.base-search-input.q-field--focused :deep(.q-field__control::after),
.registrant-email-page__search.base-search-input.q-field--highlighted
  :deep(.q-field__control::after) {
  border-color: var(--q-primary) !important;
  border-width: 1px !important;
  border-radius: var(--radius-md) !important;
}

.registrant-email-page__search.base-search-input :deep(.q-field__native),
.registrant-email-page__search.base-search-input :deep(.q-field__input) {
  color: #1f2937 !important;
  font-size: 0.95rem !important;
  font-weight: 500 !important;
}

.registrant-email-page__search.base-search-input :deep(.q-field__native::placeholder),
.registrant-email-page__search.base-search-input :deep(.q-field__input::placeholder) {
  color: #8a94a6 !important;
  opacity: 1 !important;
}

.registrant-email-page__schedule-cell,
.registrant-email-page__recipient-cell {
  display: grid;
  gap: 4px;
}

.registrant-email-page__course-title-layout {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  min-width: 320px;
}

.registrant-email-page__course-image {
  display: block;
  width: 108px;
  max-width: 108px;
  height: 76px;
  border-radius: 8px;
  object-fit: cover;
  box-shadow: 0 7px 18px rgba(15, 23, 42, 0.09);
}

.registrant-email-page__course-copy {
  min-width: 0;
}

.registrant-email-page__course-link {
  display: block;
  padding: 0;
  border: 0;
  background: transparent;
  color: #172033;
  font: inherit;
  font-size: 0.88rem;
  font-weight: 900;
  line-height: 1.45;
  text-align: left;
  cursor: pointer;
  transition: color 0.18s ease;

  &:hover {
    color: #d97706;
  }
}

.registrant-email-page__course-subtitle {
  display: block;
  margin-top: 5px;
  color: #64748b;
  font-size: 0.74rem;
  font-weight: 700;
  line-height: 1.45;
}

.registrant-email-page__schedule-cell {
  grid-template-columns: max-content minmax(0, 1fr);
  gap: 4px 10px;
  color: #26364d;
  font-size: 0.76rem;
  font-weight: 600;
  line-height: 1.42;

  > div {
    color: #64748b;
    font-size: 0.72rem;
    font-weight: 800;
  }

  > strong {
    color: #172033;
    font-size: 0.78rem;
    font-weight: 900;
  }
}

.registrant-email-page__actions-cell {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.registrant-email-page__course-table {
  :deep(.base-table__row) {
    cursor: default;
  }
}

.registrant-email-page__summary {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
  padding: 20px 22px;
  border: 1px solid rgba(148, 163, 184, 0.2);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%);
  box-shadow: 0 16px 36px rgba(15, 23, 42, 0.05);
}

.registrant-email-page__summary-row {
  display: grid;
  gap: 10px;
  align-items: start;
  min-height: 132px;
  padding: 18px 20px;
  border: 1px solid rgba(226, 232, 240, 0.92);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.84);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.56);

  span {
    color: var(--admin-navy);
    font-size: 0.9rem;
    font-weight: 700;
    line-height: 1.4;
    text-align: left;
  }
}

.registrant-email-page__summary-value {
  display: grid;
  justify-items: start;
  align-content: start;
  gap: 6px;

  strong {
    display: block;
    color: #0d6efd;
    font-size: 1.18rem;
    font-weight: 800;
    line-height: 1.35;
  }

  small {
    display: block;
    color: #64748b;
    font-size: 0.92rem;
    font-weight: 700;
    line-height: 1.5;
  }
}

.registrant-email-page__summary-value--course {
  strong {
    color: #0d6efd;
    font-size: 1.28rem;
  }

  small {
    font-size: 0.98rem;
  }
}

.registrant-email-page__summary-status {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
}

.registrant-email-page__detail-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.08fr) minmax(420px, 0.92fr);
  gap: 26px;
}

.registrant-email-page__left-panel,
.registrant-email-page__right-panel,
.registrant-email-page__history-panel {
  min-width: 0;
}

.registrant-email-page__right-panel {
  display: grid;
  gap: 12px;
  align-content: start;
}

.registrant-email-page__recipient-select {
  :deep(.q-field__control) {
    min-height: 52px;
    border-radius: 12px;
    background: #fff;
    box-shadow: inset 0 0 0 1px rgba(148, 163, 184, 0.32);
    transition:
      box-shadow 0.2s ease,
      border-color 0.2s ease,
      transform 0.2s ease;
  }

  :deep(.q-field__control::before),
  :deep(.q-field__control::after) {
    border: 0;
  }

  :deep(.q-field__native),
  :deep(.q-field__input) {
    color: #10223c;
    font-size: 0.98rem;
    font-weight: 700;
  }

  :deep(.q-field__marginal) {
    color: #475569;
  }

  :deep(.q-field__append .q-icon) {
    font-size: 20px;
    transition:
      color 0.2s ease,
      transform 0.2s ease;
  }

  &:hover :deep(.q-field__control) {
    box-shadow:
      inset 0 0 0 1px rgba(245, 166, 35, 0.62),
      0 10px 22px rgba(15, 23, 42, 0.05);
  }
}

.registrant-email-page__recipient-select :deep(.q-field--focused .q-field__control) {
  box-shadow:
    inset 0 0 0 2px rgba(245, 166, 35, 0.96),
    0 0 0 4px rgba(245, 166, 35, 0.12);
}

.registrant-email-page__recipient-select :deep(.q-field--focused .q-field__append .q-icon) {
  color: var(--q-warning);
  transform: rotate(180deg);
}

.registrant-email-page__recipient-select :deep(.q-field--error .q-field__control) {
  box-shadow: inset 0 0 0 1px rgba(220, 38, 38, 0.95);
}

.registrant-email-page__recipient-select :deep(.q-field__label) {
  color: #10223c;
  font-size: 0.85rem;
  font-weight: 800;
}

.registrant-email-page__recipient-select :deep(.q-field--float .q-field__label) {
  color: #64748b;
}

.registrant-email-page__recipient-select :deep(.q-menu .q-item),
:deep(.registrant-email-page__select-menu .q-item) {
  min-height: 42px;
  color: #10223c;
  font-weight: 600;
}

:deep(.registrant-email-page__select-menu) {
  border: 1px solid rgba(148, 163, 184, 0.24);
  border-radius: 12px;
  box-shadow: 0 18px 40px rgba(15, 23, 42, 0.12);
}

.registrant-email-page__inline-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.registrant-email-page__textarea :deep(textarea) {
  min-height: 290px;
  resize: vertical;
}

.registrant-email-page__notice {
  display: grid;
  gap: 10px;
  padding: 16px 18px;
  border: 1px solid rgba(245, 166, 35, 0.42);
  border-radius: 12px;
  background: linear-gradient(180deg, rgba(255, 249, 235, 0.95), rgba(255, 255, 255, 0.96));
  color: #b45309;
  font-size: 0.95rem;
  font-weight: 600;
  line-height: 1.75;
}

.registrant-email-page__notice-title {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #9a3412;
  font-size: 0.95rem;
  font-weight: 800;
}

.registrant-email-page__select-value {
  color: #64748b;
  font-weight: 600;
}

.registrant-email-page__field-error {
  margin-top: -4px;
  padding-left: 4px;
  color: #dc2626;
  font-size: 0.82rem;
  font-weight: 700;
}

.registrant-email-page__history-body {
  display: -webkit-box;
  overflow: hidden;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}

@media (max-width: 1100px) {
  .registrant-email-page__hero-summary {
    grid-template-columns: repeat(2, minmax(180px, 1fr));
  }

  .registrant-email-page__detail-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 720px) {
  .registrant-email-page {
    padding-top: 0;
  }

  .registrant-email-page__surface {
    padding: 16px;
  }

  .registrant-email-page__hero-summary {
    grid-template-columns: 1fr;
    width: 100%;
  }

  .registrant-email-page__table-head {
    align-items: stretch;
    flex-direction: column;
  }

  .registrant-email-page__summary {
    grid-template-columns: 1fr;
  }

  .registrant-email-page__summary-row {
    min-height: auto;
    padding: 16px;
  }

  .registrant-email-page__inline-actions {
    flex-direction: column;
  }
}
</style>
