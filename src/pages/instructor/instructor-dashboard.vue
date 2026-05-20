<template>
  <q-page class="instructor-dashboard q-pa-xl">
    <div class="section-container">
      <!-- ─── HEADER ─── -->
      <div class="row items-center justify-between q-mb-xl">
        <div>
          <h1 class="text-h3 text-weight-bold text-blue-grey-9 q-mb-sm">
            ยินดีต้อนรับ, {{ authStore.user?.firstNameTh }} 👋
          </h1>
          <p class="text-subtitle1 text-grey-7">
            จัดการรายวิชาและติดตามความก้าวหน้าของนิสิตได้ที่นี่
          </p>
        </div>
        <div class="row q-gutter-md">
          <q-btn
            outline
            color="primary"
            icon="analytics"
            label="ดูรายงานรวม"
            class="action-btn"
            @click="showDevelopmentDialog('ดูรายงานรวม')"
          />
        </div>
      </div>

      <!-- ─── STATS CARDS ─── -->
      <div class="row q-col-gutter-lg q-mb-xl">
        <div v-for="stat in stats" :key="stat.label" class="col-12 col-sm-6 col-md-3">
          <q-card flat bordered class="stat-card">
            <q-card-section class="row items-center no-wrap">
              <div class="stat-icon-wrapper q-mr-md" :style="{ backgroundColor: stat.bgColor }">
                <q-icon :name="stat.icon" :color="stat.color" size="28px" />
              </div>
              <div>
                <div class="text-h4 text-weight-bold">{{ stat.value }}</div>
                <div class="text-caption text-grey-7 text-uppercase letter-spacing-1">
                  {{ stat.label }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="row q-col-gutter-xl">
        <!-- ─── ACTIVE COURSES ─── -->
        <div class="col-12 col-lg-8">
          <div class="row items-center justify-between q-mb-lg">
            <h2 class="section-title-underline q-mb-none">รายวิชาที่กำลังเปิดสอน</h2>
            <q-btn
              flat
              color="primary"
              label="ดูทั้งหมด"
              no-caps
              @click="showDevelopmentDialog('ดูคอร์สทั้งหมด')"
            />
          </div>

          <div class="column q-gutter-y-md">
            <q-card
              v-for="course in instructorCourses"
              :key="course.id"
              flat
              bordered
              class="course-row-card"
            >
              <q-card-section horizontal>
                <q-img :src="course.imageUrl" class="col-3" style="min-width: 150px" />
                <q-card-section class="col q-pa-lg">
                  <div class="row items-center justify-between no-wrap">
                    <div>
                      <div class="text-overline text-primary">{{ course.code }}</div>
                      <div class="text-h6 text-weight-bold q-mb-xs">{{ course.title }}</div>
                    </div>
                    <q-badge
                      :color="course.status === 'เปิดรับสมัคร' ? 'positive' : 'grey-7'"
                      class="q-pa-sm"
                    >
                      {{ course.status }}
                    </q-badge>
                  </div>

                  <div class="row items-center q-gutter-x-lg q-mt-sm text-grey-7 text-caption">
                    <div class="row items-center">
                      <q-icon name="group" class="q-mr-xs" />
                      {{ course.enrolledCount }} / {{ course.maxSeats }} นิสิต
                    </div>
                    <div class="row items-center">
                      <q-icon name="star" class="q-mr-xs text-amber" />
                      4.8 (124 รีวิว)
                    </div>
                    <div class="row items-center">
                      <q-icon name="update" class="q-mr-xs" />
                      อัปเดตล่าสุด: 2 วันที่แล้ว
                    </div>
                  </div>

                  <div class="row q-gutter-sm q-mt-lg">
                    <q-btn
                      unelevated
                      color="primary"
                      label="จัดการรายวิชา"
                      size="sm"
                      class="q-px-md"
                      @click="goToCourseManagement(course.id)"
                    />
                    <q-btn
                      outline
                      color="primary"
                      label="ตรวจงาน / ให้เกรด"
                      size="sm"
                      class="q-px-md"
                      @click="showDevelopmentDialog('ตรวจงาน / ให้เกรด')"
                    />
                    <q-btn
                      flat
                      color="grey-7"
                      icon="more_horiz"
                      dense
                      @click="showDevelopmentDialog('เพิ่มเติม')"
                    />
                  </div>
                </q-card-section>
              </q-card-section>
            </q-card>
          </div>
        </div>

        <!-- ─── SIDEBAR / ACTIVITIES ─── -->
        <div class="col-12 col-lg-4">
          <h2 class="section-title-underline q-mb-lg">กิจกรรมล่าสุด</h2>
          <q-card flat bordered class="activity-card">
            <q-list separator>
              <q-item v-for="activity in activities" :key="activity.id" class="q-py-md">
                <q-item-section avatar>
                  <q-avatar size="40px">
                    <img :src="activity.avatar" />
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-weight-bold">{{ activity.userName }}</q-item-label>
                  <q-item-label caption class="text-grey-8">{{ activity.action }}</q-item-label>
                  <q-item-label caption class="text-grey-5">{{ activity.time }}</q-item-label>
                </q-item-section>
                <q-item-section side top>
                  <q-btn
                    flat
                    round
                    dense
                    icon="chevron_right"
                    color="grey-5"
                    @click="showDevelopmentDialog('รายละเอียดกิจกรรม')"
                  />
                </q-item-section>
              </q-item>
            </q-list>
            <q-card-section class="text-center">
              <q-btn
                flat
                color="primary"
                label="ดูกิจกรรมทั้งหมด"
                no-caps
                @click="showDevelopmentDialog('กิจกรรมทั้งหมด')"
              />
            </q-card-section>
          </q-card>

          <h2 class="section-title-underline q-mt-xl q-mb-lg">ประกาศจากระบบ</h2>
          <q-banner dense rounded class="bg-blue-1 text-blue-9 q-pa-md">
            <template v-slot:avatar>
              <q-icon name="info" color="blue-9" />
            </template>
            ระบบจะมีการปิดปรับปรุงในวันที่ 1 พฤษภาคม 2569 เวลา 22:00 - 02:00 น.
          </q-banner>
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';
import type { Course } from 'src/types/course';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const courseStore = useCourseStore();

onMounted(() => {
  courseStore.init();
});

const instructorCourses = computed<Course[]>(() =>
  courseStore.getInstructorCourses(authStore.user).slice(0, 6),
);

function showDevelopmentDialog(featureName: string) {
  $q.dialog({
    title: 'ฟีเจอร์นี้กำลังอยู่ระหว่างการพัฒนา',
    message: `ขออภัย ฟีเจอร์ "${featureName}" กำลังจะเปิดให้บริการในเร็วๆ นี้`,
    ok: {
      color: 'primary',
      label: 'รับทราบ',
      unelevated: true,
    },
  });
}

function goToCourseManagement(courseId: string) {
  void router.push({
    path: '/instructor/courses',
    query: { courseId },
  });
}

const stats = [
  { label: 'นิสิตทั้งหมด', value: '1,248', icon: 'people', color: '#1976D2', bgColor: '#E3F2FD' },
  { label: 'รายวิชาที่เปิด', value: '12', icon: 'menu_book', color: '#388E3C', bgColor: '#E8F5E9' },
  { label: 'คะแนนเฉลี่ย', value: '4.8', icon: 'star', color: '#FBC02D', bgColor: '#FFFDE7' },
  {
    label: 'รายได้เดือนนี้',
    value: '฿45K',
    icon: 'payments',
    color: '#D32F2F',
    bgColor: '#FFEBEE',
  },
];

const activities = [
  {
    id: 1,
    userName: 'นายสมชาย รักดี',
    action: 'ลงทะเบียนในรายวิชา อัญมณีและศาสตร์แห่งดวงดาว',
    time: '2 นาทีที่แล้ว',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Somchai',
  },
  {
    id: 2,
    userName: 'นางสาวมานี มีใจ',
    action: 'ส่งงาน "วิเคราะห์พลอยไพลิน"',
    time: '15 นาทีที่แล้ว',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Manee',
  },
  {
    id: 3,
    userName: 'นายวิชัย ใจตรง',
    action: 'ตั้งคำถามในกระดานสนทนา',
    time: '1 ชั่วโมงที่แล้ว',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Wichai',
  },
  {
    id: 4,
    userName: 'นางฟ้า สดใส',
    action: 'ลงทะเบียนในรายวิชา Canva AI',
    time: '3 ชั่วโมงที่แล้ว',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Fah',
  },
];
</script>

<style lang="scss" scoped>
.instructor-dashboard {
  background-color: #f8f6f1;
  min-height: 100vh;
}

.action-btn {
  border-radius: 8px;
  padding: 8px 20px;
  font-weight: 600;
}

.stat-card {
  border-radius: 16px;
  transition: transform 0.3s ease;
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.05);
  }
}

.stat-icon-wrapper {
  padding: 12px;
  border-radius: 12px;
}

.course-row-card {
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s ease;
  &:hover {
    border-color: $primary;
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
  }
}

.activity-card {
  border-radius: 16px;
}

.section-title-underline {
  font-size: 1.5rem;
  font-weight: 700;
  color: $blue-grey-9;
  position: relative;
  padding-bottom: 8px;
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 4px;
    background: $primary;
    border-radius: 2px;
  }
}

.letter-spacing-1 {
  letter-spacing: 1px;
}
</style>
