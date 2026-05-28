<template>
  <q-page class="instructor-dashboard">
    <div
      v-if="showGreetingBanner"
      class="instructor-greeting-banner"
      :class="{ 'instructor-greeting-banner--leaving': isGreetingBannerLeaving }"
    >
      <div class="instructor-greeting-banner__icon">{{ timeGreeting.icon }}</div>
      <div class="instructor-greeting-banner__copy">
        <div class="instructor-greeting-banner__title">
          {{ timeGreeting.label }} {{ instructorDisplayName }}
        </div>
        <div class="instructor-greeting-banner__subtitle">พร้อมลุยงานสอนและติดตามผู้เรียน</div>
      </div>
    </div>

    <section class="instructor-hero">
      <q-carousel
        v-model="heroSlide"
        animated
        infinite
        :autoplay="5000"
        transition-prev="fade"
        transition-next="fade"
        transition-duration="1000"
        class="instructor-hero__carousel"
      >
        <q-carousel-slide
          v-for="slide in heroSlides"
          :key="slide.name"
          :name="slide.name"
          :img-src="slide.imageUrl"
          class="instructor-hero__slide"
        >
          <div class="instructor-hero__overlay"></div>
          <div class="section-container instructor-hero__inner">
            <div v-if="slide.name === 'courses'" class="instructor-hero__content">
              <div class="instructor-hero__brand">
                <div class="instructor-hero__brand-top">
                  <span class="instructor-hero__brand-buu">
                    <span class="instructor-hero__type-line" :class="getTypeLineClass('buu')">
                      {{ typedHeroText.buu }}
                    </span>
                  </span>
                  <span class="instructor-hero__brand-lll">
                    <span class="instructor-hero__type-line" :class="getTypeLineClass('lll')">
                      {{ typedHeroText.lll }}
                    </span>
                  </span>
                </div>
                <div class="instructor-hero__brand-title">
                  <span class="instructor-hero__type-line" :class="getTypeLineClass('short')">
                    {{ typedHeroText.short }}
                  </span>
                  <br />
                  <span class="instructor-hero__type-line" :class="getTypeLineClass('course')">
                    {{ typedHeroText.course }}
                  </span>
                </div>
                <div class="instructor-hero__brand-subtitle">
                  <span class="instructor-hero__type-line" :class="getTypeLineClass('subtitle')">
                    {{ typedHeroText.subtitle }}
                  </span>
                </div>
              </div>
            </div>
            <div v-else-if="slide.name === 'instructor-entry'" class="instructor-hero__content">
              <div class="instructor-hero__welcome">
                <div class="instructor-hero__welcome-logo">
                  <span class="instructor-hero__welcome-logo-buu">
                    <span class="instructor-hero__type-line" :class="getTypeLineClass('entryBuu')">
                      {{ typedHeroText.entryBuu }}
                    </span>
                  </span>
                  <span class="instructor-hero__welcome-logo-lll">
                    <span class="instructor-hero__type-line" :class="getTypeLineClass('entryLll')">
                      {{ typedHeroText.entryLll }}
                    </span>
                  </span>
                </div>
                <div class="instructor-hero__welcome-title">
                  <span class="instructor-hero__type-line" :class="getTypeLineClass('entryTitle')">
                    {{ typedHeroText.entryTitle }}
                  </span>
                  <br />
                  <span
                    class="instructor-hero__type-line instructor-hero__welcome-title-accent"
                    :class="getTypeLineClass('entryAccent')"
                  >
                    {{ typedHeroText.entryAccent }}
                  </span>
                </div>
                <div class="instructor-hero__welcome-system">
                  <span class="instructor-hero__type-line" :class="getTypeLineClass('entrySystem')">
                    {{ typedHeroText.entrySystem }}
                  </span>
                </div>
                <div class="instructor-hero__welcome-description">
                  <span
                    class="instructor-hero__type-line"
                    :class="getTypeLineClass('entryDescription')"
                  >
                    {{ typedHeroText.entryDescription }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </q-carousel-slide>
      </q-carousel>
    </section>

    <div class="section-container instructor-dashboard__content">
      <!-- ─── STATS CARDS ─── -->
      <div class="instructor-dashboard__stats row q-col-gutter-lg q-mb-xl">
        <div v-for="stat in stats" :key="stat.label" class="col-12 col-sm-6 col-md-3">
          <StatCard
            :icon="stat.icon"
            :value="stat.value"
            :label="stat.label"
            :icon-color="stat.color"
            :icon-tint="stat.bgColor"
          />
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
                      {{ course.enrolledCount
                      }}{{ course.maxSeats ? ` / ${course.maxSeats}` : '' }} นิสิต
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
                      @click="
                        router.push({
                          path: '/instructor/students',
                          query: { courseId: course.id, tab: 'results' },
                        })
                      "
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
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth-store';
import { useCourseStore } from 'src/stores/course-store';
import { useInstructorBackend } from 'src/composables/use-instructor-backend';
import StatCard from 'src/components/base/StatCard.vue';
import type { Course } from 'src/types/course';
import heroOverviewImageUrl from 'src/assets/we1.png';
import heroCourseImageUrl from 'src/assets/homepicture1.png';
import heroClassroomImageUrl from 'src/assets/homepicture2.png';
import heroInstructorImageUrl from 'src/assets/in.png';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const courseStore = useCourseStore();
const instructorBackend = useInstructorBackend();
const heroSlide = ref('overview');
const showGreetingBanner = ref(false);
const isGreetingBannerLeaving = ref(false);
const typedHeroText = ref({
  buu: '',
  lll: '',
  short: '',
  course: '',
  subtitle: '',
  entryBuu: '',
  entryLll: '',
  entryTitle: '',
  entryAccent: '',
  entrySystem: '',
  entryDescription: '',
});
const activeTypingKey = ref('');
const heroTypingTimers: ReturnType<typeof setTimeout>[] = [];
const greetingBannerTimers: ReturnType<typeof setTimeout>[] = [];

onMounted(() => {
  courseStore.init();
  const email = authStore.user?.email;
  if (email) {
    void courseStore.fetchInstructorCourses(email);
    void instructorBackend.fetchSummary(email);
  }

  const showTimer = setTimeout(() => {
    showGreetingBanner.value = true;
    isGreetingBannerLeaving.value = false;
  }, 260);
  const leaveTimer = setTimeout(() => {
    isGreetingBannerLeaving.value = true;
  }, 5200);
  const hideTimer = setTimeout(() => {
    showGreetingBanner.value = false;
    isGreetingBannerLeaving.value = false;
  }, 5800);

  greetingBannerTimers.push(showTimer, leaveTimer, hideTimer);
});

const instructorCourses = computed<Course[]>(() =>
  courseStore.getInstructorCourses(authStore.user).slice(0, 6),
);

const instructorDisplayName = computed(() => {
  const user = authStore.user;
  return (
    user?.firstNameTh ||
    user?.firstNameEn ||
    user?.username ||
    user?.email?.split('@')[0] ||
    'อาจารย์'
  );
});

const timeGreeting = computed(() => {
  const now = new Date();
  const minutesSinceMidnight = now.getHours() * 60 + now.getMinutes();

  if (minutesSinceMidnight >= 6 * 60 && minutesSinceMidnight <= 12 * 60) {
    return { label: 'อรุณสวัสดิ์', icon: '🌅' };
  }
  if (minutesSinceMidnight >= 12 * 60 + 1 && minutesSinceMidnight <= 15 * 60 + 59) {
    return { label: 'สวัสดียามบ่าย', icon: '🌞' };
  }
  if (minutesSinceMidnight >= 16 * 60 && minutesSinceMidnight <= 19 * 60 + 59) {
    return { label: 'สวัสดียามเย็น', icon: '🌇' };
  }
  return { label: 'ราตรีสวัสดิ์', icon: '🌙' };
});

const stats = computed(() => [
  {
    label: 'นิสิตทั้งหมด',
    value: (instructorBackend.summary.value?.totalStudents ?? 0).toLocaleString('th-TH'),
    icon: 'people',
    color: '#5B2A00',
    bgColor: '#FFE600',
  },
  {
    label: 'รายวิชาที่เปิด',
    value: (
      instructorBackend.summary.value?.activeCourses ?? instructorCourses.value.length
    ).toLocaleString('th-TH'),
    icon: 'menu_book',
    color: '#081A8C',
    bgColor: '#5B8CFF',
  },
  {
    label: 'คะแนนเฉลี่ย',
    value: instructorBackend.summary.value?.averageScore?.toFixed(2) ?? '-',
    icon: 'star',
    color: '#005A20',
    bgColor: '#5DFF8B',
  },
  {
    label: 'ห้องสนทนา',
    value: (instructorBackend.summary.value?.conversations ?? 0).toLocaleString('th-TH'),
    icon: 'forum',
    color: '#6E1B00',
    bgColor: '#FF7A1A',
  },
]);

const activities = computed(() =>
  (instructorBackend.summary.value?.recentActivities ?? []).map((activity) => ({
    id: activity.id,
    userName: activity.learnerName,
    action: activity.action,
    time: formatActivityDate(activity.createdAt),
    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(activity.learnerName)}`,
  })),
);

const heroSlides = [
  {
    name: 'overview',
    imageUrl: heroOverviewImageUrl,
  },
  {
    name: 'instructor-entry',
    imageUrl: heroInstructorImageUrl,
  },
  {
    name: 'courses',
    imageUrl: heroCourseImageUrl,
  },
  {
    name: 'learners',
    imageUrl: heroClassroomImageUrl,
  },
];

type HeroTypingEntry = {
  key:
    | 'buu'
    | 'lll'
    | 'short'
    | 'course'
    | 'subtitle'
    | 'entryBuu'
    | 'entryLll'
    | 'entryTitle'
    | 'entryAccent'
    | 'entrySystem'
    | 'entryDescription';
  text: string;
  speed: number;
  delayBefore?: number;
};

const emptyTypedHeroText = {
  buu: '',
  lll: '',
  short: '',
  course: '',
  subtitle: '',
  entryBuu: '',
  entryLll: '',
  entryTitle: '',
  entryAccent: '',
  entrySystem: '',
  entryDescription: '',
};

const heroTypingSequences: Record<string, HeroTypingEntry[]> = {
  courses: [
    { key: 'buu', text: 'BUU', speed: 85 },
    { key: 'lll', text: 'LLL', speed: 85, delayBefore: 120 },
    { key: 'short', text: 'SHORT', speed: 70, delayBefore: 140 },
    { key: 'course', text: 'COURSE', speed: 70, delayBefore: 70 },
    {
      key: 'subtitle',
      text: 'หลักสูตรระยะสั้นที่ออกแบบมาเพื่อเพิ่มพูนทักษะ และสมรรถนะ',
      speed: 32,
      delayBefore: 220,
    },
  ],
  'instructor-entry': [
    { key: 'entryBuu', text: 'BUU', speed: 85 },
    { key: 'entryLll', text: 'LLL', speed: 85, delayBefore: 90 },
    { key: 'entryTitle', text: 'ยินดีต้อนรับ', speed: 70, delayBefore: 140 },
    { key: 'entryAccent', text: 'อาจารย์', speed: 70, delayBefore: 70 },
    {
      key: 'entrySystem',
      text: 'ระบบตรวจงานและให้คะแนน BUU LLL',
      speed: 32,
      delayBefore: 220,
    },
  ],
};

onBeforeUnmount(() => {
  clearHeroTypingTimers();
  greetingBannerTimers.forEach((timer) => clearTimeout(timer));
  greetingBannerTimers.length = 0;
});

watch(
  heroSlide,
  (currentSlide) => {
    if (currentSlide in heroTypingSequences) {
      startHeroTypewriter(currentSlide);
      return;
    }

    clearHeroTypingTimers();
    activeTypingKey.value = '';
    typedHeroText.value = { ...emptyTypedHeroText };
  },
  { immediate: true },
);

function clearHeroTypingTimers() {
  heroTypingTimers.forEach((timer) => clearTimeout(timer));
  heroTypingTimers.length = 0;
}

function startHeroTypewriter(slideName: string) {
  clearHeroTypingTimers();
  typedHeroText.value = { ...emptyTypedHeroText };

  let accumulatedDelay = 0;
  const typingSequence = heroTypingSequences[slideName] ?? [];

  typingSequence.forEach((entry, entryIndex) => {
    accumulatedDelay += entry.delayBefore ?? 0;

    for (let characterIndex = 1; characterIndex <= entry.text.length; characterIndex += 1) {
      const timer = setTimeout(() => {
        activeTypingKey.value = entry.key;
        typedHeroText.value = {
          ...typedHeroText.value,
          [entry.key]: entry.text.slice(0, characterIndex),
        };
      }, accumulatedDelay);

      heroTypingTimers.push(timer);
      accumulatedDelay += entry.speed;
    }

    const settleTimer = setTimeout(() => {
      const nextEntry = typingSequence[entryIndex + 1];
      activeTypingKey.value = nextEntry?.key ?? '';
    }, accumulatedDelay + 120);

    heroTypingTimers.push(settleTimer);
  });

  const endTimer = setTimeout(() => {
    activeTypingKey.value = '';
  }, accumulatedDelay + 280);

  heroTypingTimers.push(endTimer);
}

function getTypeLineClass(key: string) {
  return {
    'instructor-hero__type-line--active': activeTypingKey.value === key,
  };
}

function formatActivityDate(value: string | null): string {
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
</script>

<style lang="scss" scoped>
.instructor-dashboard {
  background-color: #f8f6f1;
  min-height: 100vh;
}

.instructor-greeting-banner {
  position: fixed;
  top: 84px;
  right: 124px;
  z-index: 30;
  display: flex;
  align-items: center;
  gap: 14px;
  min-width: 320px;
  max-width: min(420px, calc(100vw - 32px));
  padding: 14px 18px;
  border: 1px solid rgba(255, 199, 44, 0.45);
  border-radius: 18px;
  background: rgba(255, 252, 243, 0.96);
  box-shadow:
    0 20px 40px rgba(15, 23, 42, 0.14),
    0 6px 20px rgba(255, 199, 44, 0.16);
  backdrop-filter: blur(12px);
  animation: instructorGreetingBannerIn 0.72s cubic-bezier(0.22, 1, 0.36, 1);
}

.instructor-greeting-banner--leaving {
  animation: instructorGreetingBannerOut 0.45s ease forwards;
}

.instructor-greeting-banner__icon {
  display: grid;
  place-items: center;
  flex: 0 0 48px;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: linear-gradient(135deg, rgba(255, 199, 44, 0.18), rgba(255, 255, 255, 0.95));
  font-size: 1.5rem;
}

.instructor-greeting-banner__copy {
  min-width: 0;
}

.instructor-greeting-banner__title {
  color: #163b73;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.25;
}

.instructor-greeting-banner__subtitle {
  margin-top: 4px;
  color: #64748b;
  font-size: 0.84rem;
  font-weight: 600;
  line-height: 1.35;
}

.instructor-hero {
  position: relative;
  width: 100%;
}

.instructor-hero__carousel {
  width: 100%;
  height: auto;
  aspect-ratio: 1920 / 600;
  overflow: hidden;
  background: #f6efe3;
}

.instructor-hero__inner {
  position: relative;
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  height: 100%;
}

.instructor-hero__carousel :deep(.q-carousel__slide) {
  padding: 0;
  background-position: center 50%;
}

.instructor-hero__slide {
  position: relative;
}

.instructor-hero__overlay {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 18% 24%, rgba(255, 255, 255, 0.14) 0%, rgba(255, 255, 255, 0) 28%),
    radial-gradient(circle at 74% 18%, rgba(255, 215, 120, 0.12) 0%, rgba(255, 215, 120, 0) 22%),
    radial-gradient(circle at 64% 82%, rgba(255, 248, 230, 0.08) 0%, rgba(255, 248, 230, 0) 20%),
    linear-gradient(
      90deg,
      rgba(255, 255, 255, 0.08) 0%,
      rgba(255, 250, 240, 0.03) 42%,
      rgba(255, 255, 255, 0) 100%
    ),
    linear-gradient(180deg, rgba(255, 212, 102, 0.08) 0%, rgba(255, 212, 102, 0) 42%);
}

.instructor-hero__content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 100%;
  max-width: 680px;
  padding: 40px 48px 56px;
  color: #1f2937;
}

.instructor-hero__brand {
  max-width: 620px;
}

.instructor-hero__brand-top {
  display: flex;
  align-items: baseline;
  gap: 12px;
  line-height: 0.9;
}

.instructor-hero__brand-buu {
  color: #ffc72c;
  font-size: clamp(4rem, 7vw, 6.5rem);
  font-weight: 800;
}

.instructor-hero__brand-lll {
  color: #6b7280;
  font-size: clamp(4rem, 7vw, 6.5rem);
  font-weight: 800;
}

.instructor-hero__brand-title {
  margin-top: 16px;
  color: #1f2f97;
  font-size: clamp(3rem, 5.5vw, 5.4rem);
  font-weight: 800;
  line-height: 0.95;
}

.instructor-hero__brand-subtitle {
  margin-top: 20px;
  max-width: 520px;
  color: #64748b;
  font-size: clamp(1rem, 1.8vw, 1.7rem);
  font-weight: 600;
  line-height: 1.45;
}

.instructor-hero__welcome {
  max-width: 720px;
}

.instructor-hero__welcome-logo {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 28px;
  line-height: 1;
}

.instructor-hero__welcome-logo-buu {
  color: #ffc72c;
  font-size: clamp(1.8rem, 3vw, 3rem);
  font-weight: 800;
}

.instructor-hero__welcome-logo-lll {
  color: #153a78;
  font-size: clamp(1.8rem, 3vw, 3rem);
  font-weight: 800;
}

.instructor-hero__welcome-title {
  color: #0b376e;
  font-size: clamp(3rem, 5.4vw, 5.6rem);
  font-weight: 800;
  line-height: 1.05;
}

.instructor-hero__welcome-title-accent {
  color: #ffc20e;
}

.instructor-hero__welcome-system {
  margin-top: 42px;
  color: #64748b;
  font-size: clamp(1.2rem, 2vw, 1.9rem);
  font-weight: 800;
}

.instructor-hero__welcome-description {
  margin-top: 16px;
  max-width: 680px;
  color: #64748b;
  font-size: clamp(0.95rem, 1.2vw, 1.2rem);
  font-weight: 500;
  line-height: 1.6;
}

.instructor-hero__type-line {
  display: inline-block;
  min-height: 1em;
}

.instructor-hero__type-line--active::after {
  content: '';
  display: inline-block;
  width: 2px;
  height: 0.82em;
  margin-left: 0.06em;
  background: currentColor;
  vertical-align: -0.06em;
  animation: instructorHeroCaretBlink 0.75s step-end infinite;
}

.instructor-dashboard__content {
  position: relative;
  margin-top: -32px;
  padding: 0 24px 48px;
  z-index: 3;
}

.instructor-dashboard__stats {
  position: relative;
}

.action-btn {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 8px 20px;
  font-weight: 600;
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
  display: inline-block;
  padding-bottom: 8px;
  border-bottom: 4px solid $primary;
  border-radius: 0 0 2px 2px;
  font-size: 1.5rem;
  font-weight: 700;
  color: $blue-grey-9;
}

.letter-spacing-1 {
  letter-spacing: 1px;
}

@keyframes instructorHeroCaretBlink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

@keyframes instructorGreetingBannerIn {
  0% {
    opacity: 0;
    transform: translate3d(0, -18px, 0) scale(0.94);
  }
  62% {
    opacity: 1;
    transform: translate3d(0, 4px, 0) scale(1.02);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
}

@keyframes instructorGreetingBannerOut {
  0% {
    opacity: 1;
    transform: translate3d(0, 0, 0) scale(1);
  }
  100% {
    opacity: 0;
    transform: translate3d(0, -10px, 0) scale(0.96);
  }
}

@media (max-width: 1023px) {
  .instructor-greeting-banner {
    top: 76px;
    right: 88px;
    min-width: 280px;
  }

  .instructor-dashboard__content {
    margin-top: -20px;
    padding: 0 20px 40px;
  }

  .instructor-hero__content {
    max-width: 100%;
    padding: 88px 28px 28px;
  }
}

@media (max-width: 599px) {
  .instructor-greeting-banner {
    top: 74px;
    right: 16px;
    left: 16px;
    min-width: 0;
    max-width: none;
    padding: 12px 14px;
  }

  .instructor-hero__carousel {
    aspect-ratio: 16 / 10;
  }

  .instructor-hero__inner {
    display: block;
  }

  .instructor-hero__title {
    font-size: 2rem;
  }

  .instructor-dashboard__content {
    margin-top: -8px;
    padding: 0 16px 32px;
  }

  .instructor-hero__content {
    padding: 32px 20px 24px;
  }

  .instructor-hero__brand-title {
    margin-top: 12px;
  }

  .instructor-hero__brand-subtitle {
    margin-top: 14px;
    max-width: 320px;
    font-size: 0.95rem;
  }

  .instructor-hero__welcome-logo {
    margin-bottom: 16px;
  }

  .instructor-hero__welcome-title {
    font-size: 2.2rem;
  }

  .instructor-hero__welcome-system {
    margin-top: 16px;
    font-size: 1rem;
  }

  .instructor-hero__welcome-description {
    display: none;
  }
}
</style>
