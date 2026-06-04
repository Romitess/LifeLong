<template>
  <div class="instructor-home-panel">
    <div class="instructor-home-header">
      <div>
        <div class="text-h5 text-weight-bolder text-primary">Instructor Overview</div>
        <div class="text-caption text-grey-6 q-mt-xs">
          Course summary, teaching tasks, and certificate progress
        </div>
      </div>
      <q-btn
        unelevated
        color="primary"
        icon="menu_book"
        label="ดูรายวิชาที่รับผิดชอบ"
        no-caps
        @click="goToInstructorCourses"
      />
    </div>

    <div class="instructor-overview-grid">
      <q-card
        v-for="item in instructorOverviewCards"
        :key="item.label"
        flat
        bordered
        class="instructor-overview-card"
      >
        <q-icon :name="item.icon" size="26px" :style="{ color: item.color }" />
        <div>
          <strong>{{ item.value.toLocaleString('th-TH') }}</strong>
          <span>{{ item.label }}</span>
        </div>
      </q-card>
    </div>

    <div class="instructor-work-grid">
      <q-card flat bordered class="instructor-work-card">
        <div class="instructor-work-card__head">
          <div>
            <h2>งานที่ต้องทำต่อ</h2>
            <span>รายการที่ควรจัดการจากรายวิชาที่คุณรับผิดชอบ</span>
          </div>
          <q-icon name="task_alt" size="30px" color="primary" />
        </div>

        <div class="instructor-task-list">
          <button type="button" class="instructor-task-item" @click="goToInstructorStudents">
            <q-icon name="fact_check" />
            <div>
              <strong>ตรวจสอบรายชื่อผู้เรียน</strong>
              <span>{{ totalInstructorLearners.toLocaleString('th-TH') }} คนในระบบ mockup</span>
            </div>
          </button>
          <button type="button" class="instructor-task-item" @click="goToInstructorLearningResults">
            <q-icon name="grading" />
            <div>
              <strong>บันทึกผลการเรียน</strong>
              <span>{{ pendingResultCourses.toLocaleString('th-TH') }} รายวิชายังต้องตรวจผล</span>
            </div>
          </button>
          <button type="button" class="instructor-task-item" @click="goToInstructorCertificates">
            <q-icon name="workspace_premium" />
            <div>
              <strong>สร้าง Certificate</strong>
              <span>
                {{ certificateReadyLearners.toLocaleString('th-TH') }} คนผ่านเกณฑ์พร้อมออกเอกสาร
              </span>
            </div>
          </button>
        </div>
      </q-card>

      <q-card flat bordered class="instructor-work-card">
        <div class="instructor-work-card__head">
          <div>
            <h2>สถานะ Certificate</h2>
            <span>ประเมินจากคะแนน mockup สำหรับเตรียม flow เชื่อมต่อ backend</span>
          </div>
          <q-icon name="workspace_premium" size="30px" color="amber-8" />
        </div>

        <div class="certificate-status-row">
          <div>
            <strong>{{ certificateReadyLearners.toLocaleString('th-TH') }}</strong>
            <span>พร้อมสร้าง</span>
          </div>
          <div>
            <strong>{{ generatedCertificateCount.toLocaleString('th-TH') }}</strong>
            <span>สร้างแล้ว</span>
          </div>
          <div>
            <strong>{{ pendingCertificateCount.toLocaleString('th-TH') }}</strong>
            <span>ยังไม่ได้สร้าง</span>
          </div>
        </div>
      </q-card>
    </div>

    <q-card flat bordered class="instructor-course-work-card">
      <div class="instructor-course-work-card__head">
        <div>
          <h2>รายวิชาที่รับผิดชอบ</h2>
          <span>{{ instructorCourses.length.toLocaleString('th-TH') }} รายวิชา</span>
        </div>
        <q-btn
          flat
          color="primary"
          icon-right="arrow_forward"
          label="ดูทั้งหมด"
          no-caps
          @click="goToInstructorCourses"
        />
      </div>

      <div v-if="instructorCourses.length > 0" class="instructor-course-list">
        <div
          v-for="course in instructorCoursePreview"
          :key="course.id"
          class="instructor-course-item"
        >
          <img :src="course.imageUrl" :alt="course.titleEn || course.title" />
          <div class="instructor-course-item__body">
            <span>{{ course.code }}</span>
            <strong>{{ course.titleEn || course.title }}</strong>
            <div>
              {{ course.enrolledCount.toLocaleString('th-TH')
              }}{{ course.maxSeats ? `/${course.maxSeats.toLocaleString('th-TH')}` : '' }}
              ผู้เรียน
            </div>
          </div>
          <div class="instructor-course-item__actions">
            <q-btn
              dense
              outline
              color="primary"
              icon="edit"
              label="จัดการ"
              no-caps
              @click="goToInstructorCourseWorkspace(course.id)"
            />
            <q-btn
              dense
              flat
              color="amber-8"
              icon="workspace_premium"
              label="Certificate"
              no-caps
              @click="goToInstructorCertificateCourse(course.id)"
            />
          </div>
        </div>
      </div>

      <div v-else class="instructor-empty-state">
        <q-icon name="school" size="44px" color="primary" />
        <strong>ยังไม่มีรายวิชาที่รับผิดชอบ</strong>
        <span>เข้าสู่ระบบด้วยบัญชีผู้สอนที่มีรายวิชา หรือให้ผู้ดูแลระบบสร้างรายวิชาให้</span>
      </div>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';
import { useProfileNavigation } from 'src/composables/use-profile-navigation';
import type { Course } from 'src/types/course';

const authStore = useAuthStore();
const courseStore = useCourseStore();
const {
  goToInstructorCourses,
  goToInstructorStudents,
  goToInstructorLearningResults,
  goToInstructorCertificates,
  goToInstructorCourseWorkspace,
  goToInstructorCertificateCourse,
} = useProfileNavigation();

const instructorCourses = computed<Course[]>(() =>
  courseStore.getInstructorCourses(authStore.user),
);

const activeInstructorCoursesCount = computed<number>(
  () => instructorCourses.value.filter((course) => course.isActive).length,
);

const totalInstructorLearners = computed<number>(() =>
  instructorCourses.value.reduce((sum, course) => sum + course.enrolledCount, 0),
);

const pendingResultCourses = computed<number>(
  () => instructorCourses.value.filter((course) => course.enrolledCount > 0).length,
);

function getCertificateReadyCount(course: Course): number {
  if (course.enrolledCount <= 0) return 0;
  return Array.from({ length: course.enrolledCount }, (_, index): number => {
    const score = (course.id.charCodeAt(0) * 13 + index * 11) % 101;
    return score >= 60 ? 1 : 0;
  }).reduce((sum, value) => sum + value, 0);
}

const certificateReadyLearners = computed<number>(() =>
  instructorCourses.value.reduce((sum, course) => sum + getCertificateReadyCount(course), 0),
);

const generatedCertificateCount = computed<number>(() =>
  Math.floor(certificateReadyLearners.value * 0.35),
);

const pendingCertificateCount = computed<number>(() =>
  Math.max(0, certificateReadyLearners.value - generatedCertificateCount.value),
);

const instructorCoursePreview = computed<Course[]>(() => instructorCourses.value.slice(0, 4));

const instructorOverviewCards = computed(() => [
  {
    label: 'รายวิชาทั้งหมด',
    value: instructorCourses.value.length,
    icon: 'menu_book',
    color: '#F5A623',
  },
  {
    label: 'รายวิชาที่เปิดสอน',
    value: activeInstructorCoursesCount.value,
    icon: 'campaign',
    color: '#31B7C8',
  },
  {
    label: 'ผู้เรียนรวม',
    value: totalInstructorLearners.value,
    icon: 'groups',
    color: '#49B37D',
  },
  {
    label: 'พร้อมออก Certificate',
    value: certificateReadyLearners.value,
    icon: 'workspace_premium',
    color: '#5B7CFA',
  },
]);

defineExpose({
  instructorCourses,
  activeInstructorCoursesCount,
  totalInstructorLearners,
  pendingCertificateCount,
  certificateReadyLearners,
});
</script>

<style lang="scss" scoped>
.instructor-home-panel {
  display: grid;
  gap: 18px;
}

.instructor-home-header,
.instructor-work-card,
.instructor-course-work-card,
.instructor-overview-card {
  border-radius: 16px !important;
  background: #ffffff;
}

.instructor-home-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.instructor-overview-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 14px;
}

.instructor-overview-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-color: rgba(17, 24, 39, 0.08) !important;

  strong,
  span {
    display: block;
  }

  strong {
    color: #101828;
    font-size: 1.45rem;
    line-height: 1;
  }

  span {
    margin-top: 4px;
    color: #667085;
    font-size: 0.82rem;
    font-weight: 700;
  }
}

.instructor-work-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.1fr) minmax(320px, 0.9fr);
  gap: 18px;
}

.instructor-work-card,
.instructor-course-work-card {
  padding: 18px;
  border-color: rgba(17, 24, 39, 0.08) !important;
}

.instructor-work-card__head,
.instructor-course-work-card__head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;

  h2 {
    margin: 0 0 4px;
    color: #101828;
    font-size: 1.1rem;
    font-weight: 800;
  }

  span {
    color: #667085;
    font-size: 0.85rem;
  }
}

.instructor-task-list {
  display: grid;
  gap: 10px;
}

.instructor-task-item {
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 12px;
  align-items: center;
  width: 100%;
  padding: 12px;
  border: 1px solid rgba(245, 166, 35, 0.2);
  border-radius: 12px;
  color: #344054;
  background: #fffaf2;
  text-align: left;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    transform 0.2s ease;

  &:hover {
    border-color: rgba(245, 166, 35, 0.48);
    transform: translateY(-1px);
  }

  .q-icon {
    color: $primary;
    font-size: 22px;
  }

  strong,
  span {
    display: block;
  }

  strong {
    color: #101828;
    font-size: 0.95rem;
  }

  span {
    margin-top: 2px;
    color: #667085;
    font-size: 0.82rem;
  }
}

.certificate-status-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;

  div {
    padding: 14px 10px;
    border-radius: 12px;
    background: #f8fafc;
    text-align: center;
  }

  strong,
  span {
    display: block;
  }

  strong {
    color: #101828;
    font-size: 1.35rem;
  }

  span {
    color: #667085;
    font-size: 0.8rem;
    font-weight: 700;
  }
}

.instructor-course-list {
  display: grid;
  gap: 12px;
}

.instructor-course-item {
  display: grid;
  grid-template-columns: 88px 1fr auto;
  gap: 14px;
  align-items: center;
  padding: 12px;
  border: 1px solid #e4e9f2;
  border-radius: 14px;
  background: #fbfdff;

  img {
    width: 88px;
    height: 62px;
    border-radius: 10px;
    object-fit: cover;
  }
}

.instructor-course-item__body {
  min-width: 0;

  span,
  strong,
  div {
    display: block;
  }

  span {
    color: $primary;
    font-size: 0.8rem;
    font-weight: 800;
  }

  strong {
    margin-top: 2px;
    color: #101828;
    font-size: 0.95rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  div {
    margin-top: 4px;
    color: #667085;
    font-size: 0.82rem;
  }
}

.instructor-course-item__actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.instructor-empty-state {
  display: grid;
  place-items: center;
  gap: 8px;
  min-height: 220px;
  color: #667085;
  text-align: center;

  strong {
    color: #101828;
    font-size: 1.1rem;
  }
}
</style>
