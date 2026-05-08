<template>
  <q-page class="admin-page admin-dashboard-page">
    <AdminPageHero
      eyebrow="BUU Lifelong Admin Console"
      eyebrow-icon="admin_panel_settings"
      title="แดชบอร์ดผู้ดูแลระบบ"
      description="ภาพรวมการเปิดรายวิชา การใช้งานระบบ และทางลัดไปยังเครื่องมือจัดการหลัก"
    >
      <template #actions>
        <AdminActionButton
          icon="category"
          label="จัดการหมวดหมู่"
          no-caps
          @click="router.push('/admin/categories')"
        />
        <AdminActionButton
          variant="outline"
          icon="collections"
          label="จัดการรูปภาพ"
          no-caps
          @click="router.push('/admin/images')"
        />
      </template>

      <template #aside>
        <AdminSurfaceCard
          tone="glass"
          :accent="false"
          title="System Pulse"
          body-class="admin-pulse-card-shell"
        >
          <template #header-actions>
            <q-badge rounded color="positive" label="Stable" />
          </template>

          <div class="admin-pulse-grid">
            <div v-for="item in systemPulse" :key="item.label" class="admin-pulse-card">
              <q-icon :name="item.icon" size="22px" />
              <strong>{{ item.value }}</strong>
              <span>{{ item.label }}</span>
            </div>
          </div>
        </AdminSurfaceCard>
      </template>
    </AdminPageHero>

    <section class="admin-shell admin-content">
      <div class="admin-stat-grid">
        <AdminMetricCard
          v-for="stat in dashboardStats"
          :key="stat.label"
          :icon="stat.icon"
          :value="stat.value"
          :label="stat.label"
          :icon-color="stat.color"
          :icon-tint="stat.tint"
        >
          <template #footer>
            <q-linear-progress
              rounded
              size="8px"
              :value="stat.progress"
              :color="stat.progressColor"
            />
          </template>
        </AdminMetricCard>
      </div>

      <div class="admin-dashboard-grid">
        <AdminSurfaceCard
          eyebrow="Course Intelligence"
          title="หมวดหมู่รายวิชายอดนิยม"
          card-class="admin-panel admin-panel--wide"
        >
          <div class="admin-category-chart">
            <div v-for="item in topCategoryBars" :key="item.name" class="admin-category-bar">
              <div class="admin-category-bar__meta">
                <span>{{ item.name }}</span>
                <strong>{{ item.count }} วิชา</strong>
              </div>
              <div class="admin-category-bar__track">
                <div class="admin-category-bar__fill" :style="{ width: `${item.percent}%` }" />
              </div>
            </div>
          </div>
        </AdminSurfaceCard>

        <AdminSurfaceCard
          eyebrow="Operations"
          title="สถานะระบบ"
          card-class="admin-panel admin-panel--health"
        >
          <div class="admin-health-list">
            <div v-for="item in healthChecks" :key="item.name" class="admin-health-item">
              <span :class="['admin-health-dot', `admin-health-dot--${item.status}`]" />
              <div>
                <strong>{{ item.name }}</strong>
                <p>{{ item.detail }}</p>
              </div>
              <q-badge rounded :color="item.color" :label="item.label" />
            </div>
          </div>
        </AdminSurfaceCard>

        <AdminSurfaceCard
          eyebrow="Audit Trail"
          title="กิจกรรมล่าสุด"
          card-class="admin-panel admin-panel--activity"
        >
          <q-timeline color="primary" layout="dense" class="admin-timeline">
            <q-timeline-entry
              v-for="activity in recentActivities"
              :key="activity.title"
              :icon="activity.icon"
              :color="activity.color"
            >
              <template #title>{{ activity.title }}</template>
              <template #subtitle>{{ activity.time }}</template>
              <div>{{ activity.detail }}</div>
            </q-timeline-entry>
          </q-timeline>
        </AdminSurfaceCard>
      </div>

      <div class="admin-shortcut-grid">
        <AdminSurfaceCard
          v-for="item in shortcuts"
          :key="item.title"
          eyebrow="Quick Access"
          :title="item.title"
          card-class="admin-shortcut-card"
        >
          <q-icon :name="item.icon" size="34px" />
          <p>{{ item.detail }}</p>
          <AdminActionButton
            variant="secondary"
            label="เปิดหน้านี้"
            icon-right="arrow_forward"
            no-caps
            @click="router.push(item.to)"
          />
        </AdminSurfaceCard>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import AdminActionButton from 'components/admin/AdminActionButton.vue';
import AdminMetricCard from 'components/admin/AdminMetricCard.vue';
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCourseStore } from 'src/stores/course-store';

interface DashboardStat {
  label: string;
  value: string;
  icon: string;
  color: string;
  tint: string;
  progress: number;
  progressColor: string;
}

interface CategoryRow {
  name: string;
  count: number;
  active: number;
  trend: number;
}

const router = useRouter();
const courseStore = useCourseStore();

courseStore.init();

const systemPulse = computed(() => [
  { icon: 'menu_book', value: courseStore.courses.length.toString(), label: 'รายวิชาในระบบ' },
  { icon: 'groups', value: '2.8k', label: 'ผู้เรียนเดือนนี้' },
  { icon: 'verified', value: '96%', label: 'เอกสารสำเร็จ' },
  { icon: 'speed', value: '184ms', label: 'API mock avg.' },
]);

const dashboardStats = computed<DashboardStat[]>(() => {
  const courses = courseStore.courses;
  const totalCourses = courses.length;
  const activeCourses = courses.filter((course) => course.isActive).length;
  const freeCourses = courses.filter((course) => course.isFree).length;
  const totalSeats = courses.reduce((sum, course) => sum + course.maxSeats, 0);
  const enrolledSeats = courses.reduce((sum, course) => sum + course.enrolledCount, 0);
  const categories = new Set(courses.map((course) => course.category));

  return [
    {
      label: 'รายวิชาทั้งหมด',
      value: formatNumber(totalCourses),
      icon: 'library_books',
      color: '#0f766e',
      tint: 'rgba(15, 118, 110, 0.14)',
      progress: totalCourses ? activeCourses / totalCourses : 0,
      progressColor: 'teal',
    },
    {
      label: 'หมวดหมู่ที่ใช้งาน',
      value: formatNumber(categories.size),
      icon: 'category',
      color: '#b45309',
      tint: 'rgba(180, 83, 9, 0.15)',
      progress: Math.min(categories.size / 12, 1),
      progressColor: 'amber-8',
    },
    {
      label: 'คอร์สฟรี',
      value: formatNumber(freeCourses),
      icon: 'volunteer_activism',
      color: '#047857',
      tint: 'rgba(4, 120, 87, 0.14)',
      progress: totalCourses ? freeCourses / totalCourses : 0,
      progressColor: 'positive',
    },
    {
      label: 'อัตราที่นั่งถูกจอง',
      value: `${Math.round((enrolledSeats / Math.max(totalSeats, 1)) * 100)}%`,
      icon: 'event_seat',
      color: '#1d4ed8',
      tint: 'rgba(29, 78, 216, 0.13)',
      progress: enrolledSeats / Math.max(totalSeats, 1),
      progressColor: 'blue-7',
    },
  ];
});

const categoryRows = computed<CategoryRow[]>(() => {
  const grouped = courseStore.courses.reduce<Record<string, CategoryRow>>((accumulator, course) => {
    const current = accumulator[course.category] ?? {
      name: course.category,
      count: 0,
      active: 0,
      trend: 0,
    };

    current.count += 1;
    current.active += course.isActive ? 1 : 0;
    accumulator[course.category] = current;
    return accumulator;
  }, {});

  const maxCount = Math.max(...Object.values(grouped).map((category) => category.count), 1);

  return Object.values(grouped)
    .map((category) => ({ ...category, trend: category.count / maxCount }))
    .sort((left, right) => right.count - left.count);
});

const topCategoryBars = computed(() =>
  categoryRows.value.slice(0, 6).map((category) => ({
    name: category.name,
    count: category.count,
    percent: Math.max(12, Math.round(category.trend * 100)),
  })),
);

const healthChecks = [
  {
    name: 'Course Catalog API',
    detail: 'ข้อมูลรายวิชา mock พร้อมใช้งาน',
    status: 'good',
    color: 'positive',
    label: 'Online',
  },
  {
    name: 'Image Library',
    detail: 'Hero template editor พร้อมใช้งาน',
    status: 'good',
    color: 'positive',
    label: 'Ready',
  },
  {
    name: 'Credit Bank Documents',
    detail: 'เอกสารตัวอย่างพร้อม preview',
    status: 'good',
    color: 'positive',
    label: 'Ready',
  },
];

const recentActivities = [
  {
    title: 'สร้างหมวดหมู่ Computer and Technology',
    time: 'วันนี้ 11:12',
    detail: 'จัดลำดับให้แสดงในหน้าเมนูหมวดหมู่หลัก',
    icon: 'category',
    color: 'teal',
  },
  {
    title: 'เปลี่ยนภาพ Login Background',
    time: 'วันนี้ 09:34',
    detail: 'อัปเดตภาพสำหรับ campaign ภาคเรียน 1/2569',
    icon: 'image',
    color: 'orange',
  },
  {
    title: 'แก้ไขข้อมูลติดต่อกลาง',
    time: 'เมื่อวานนี้ 15:20',
    detail: 'ปรับอีเมล support และเวลาทำการของระบบ',
    icon: 'settings',
    color: 'blue',
  },
];

const shortcuts = [
  {
    icon: 'category',
    title: 'จัดการหมวดหมู่รายวิชา',
    detail: 'เพิ่ม แก้ไข จัดลำดับ และเปิด/ปิดหมวดหมู่ที่แสดงบนหน้าเลือกคอร์ส',
    to: '/admin/categories',
  },
  {
    icon: 'collections',
    title: 'จัดการรูปภาพของระบบ',
    detail: 'แก้ไข hero หน้า main ด้วย template preview แบบลากวางได้',
    to: '/admin/images',
  },
  {
    icon: 'tune',
    title: 'จัดการข้อมูลพื้นฐาน',
    detail: 'ตั้งค่าชื่อระบบ ช่องทางติดต่อ รอบปีการศึกษา และ feature toggles',
    to: '/admin/basics',
  },
];

function formatNumber(value: number): string {
  return value.toLocaleString('th-TH');
}
</script>

<style lang="scss" scoped>
.admin-pulse-card-shell {
  padding-top: 18px;
}

.admin-pulse-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.admin-pulse-card {
  min-height: 118px;
  padding: 16px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
  display: grid;
  align-content: space-between;
}

.admin-pulse-card strong {
  font-size: 1.8rem;
  line-height: 1;
}

.admin-pulse-card span {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.86rem;
  font-weight: 700;
}

.admin-stat-grid,
.admin-shortcut-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.admin-dashboard-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 0.8fr);
  gap: 18px;
  margin-bottom: 20px;
}

.admin-panel--wide {
  grid-column: span 2;
}

.admin-category-chart,
.admin-health-list {
  display: grid;
  gap: 14px;
}

.admin-category-bar {
  display: grid;
  gap: 8px;
}

.admin-category-bar__meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: var(--admin-ink);
  font-weight: 800;
}

.admin-category-bar__meta span {
  color: var(--admin-muted);
  font-weight: 700;
}

.admin-category-bar__track {
  overflow: hidden;
  height: 12px;
  border-radius: 999px;
  background: #edf2f7;
}

.admin-category-bar__fill {
  height: 100%;
  border-radius: inherit;
  background: linear-gradient(90deg, #f5a623, #0f766e);
}

.admin-health-item {
  display: grid;
  grid-template-columns: 12px minmax(0, 1fr) auto;
  gap: 12px;
  align-items: start;
  padding: 12px 0;
  border-bottom: 1px solid rgba(16, 35, 63, 0.08);
}

.admin-health-item:last-child {
  padding-bottom: 0;
  border-bottom: none;
}

.admin-health-item strong {
  display: block;
  color: var(--admin-navy);
  font-size: 0.98rem;
  font-weight: 850;
}

.admin-health-item p {
  margin: 4px 0 0;
  color: var(--admin-muted);
  font-size: 0.88rem;
  line-height: 1.55;
}

.admin-health-dot {
  width: 12px;
  height: 12px;
  margin-top: 6px;
  border-radius: 999px;
  background: #cbd5e1;
}

.admin-health-dot--good {
  background: #22c55e;
  box-shadow: 0 0 0 6px rgba(34, 197, 94, 0.14);
}

.admin-timeline {
  margin-top: 8px;
}

.admin-shortcut-card {
  height: 100%;
}

.admin-shortcut-card :deep(.admin-surface-card__body) {
  display: grid;
  gap: 14px;
  align-content: start;
  height: 100%;
}

.admin-shortcut-card p {
  margin: 0;
  color: var(--admin-muted);
  line-height: 1.65;
}

@media (max-width: 1100px) {
  .admin-stat-grid,
  .admin-shortcut-grid,
  .admin-dashboard-grid {
    grid-template-columns: 1fr;
  }

  .admin-panel--wide {
    grid-column: auto;
  }
}

@media (max-width: 760px) {
  .admin-pulse-grid {
    grid-template-columns: 1fr;
  }
}
</style>
