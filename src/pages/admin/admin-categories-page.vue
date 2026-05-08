<template>
  <q-page class="admin-page admin-management-page">
    <AdminPageHero
      eyebrow="Course Taxonomy"
      eyebrow-icon="category"
      title="จัดการหมวดหมู่รายวิชา"
      description="เพิ่ม แก้ไข จัดลำดับ และเปิด/ปิดหมวดหมู่ที่แสดงบนหน้าเลือกคอร์ส"
    >
      <template #aside>
        <div class="admin-categories-page__hero-action">
          <AdminActionButton
            icon="add"
            label="เพิ่มหมวดหมู่"
            no-caps
            @click="showMockAction('เพิ่มหมวดหมู่')"
          />
        </div>
      </template>
    </AdminPageHero>

    <section class="admin-shell admin-content">
      <div class="admin-stat-grid">
        <AdminMetricCard
          v-for="stat in categoryStats"
          :key="stat.label"
          :icon="stat.icon"
          :value="stat.value"
          :label="stat.label"
        />
      </div>

      <AdminSurfaceCard
        eyebrow="Category Manager"
        title="รายการหมวดหมู่ทั้งหมด"
        body-padding="none"
      >
        <template #header-actions>
          <q-input
            v-model="search"
            outlined
            dense
            debounce="200"
            placeholder="ค้นหาหมวดหมู่..."
            class="admin-search-input"
          >
            <template #prepend><q-icon name="search" /></template>
          </q-input>
        </template>

        <q-table
          flat
          :rows="filteredCategoryRows"
          :columns="categoryColumns"
          row-key="name"
          :pagination="{ rowsPerPage: 10 }"
          class="admin-table"
        >
          <template #body-cell-status="props">
            <q-td :props="props">
              <q-badge rounded :color="props.row.statusColor" :label="props.row.status" />
            </q-td>
          </template>
          <template #body-cell-trend="props">
            <q-td :props="props">
              <div class="admin-mini-progress">
                <q-linear-progress rounded size="7px" :value="props.row.trend" color="primary" />
                <span>{{ Math.round(props.row.trend * 100) }}%</span>
              </div>
            </q-td>
          </template>
          <template #body-cell-actions="props">
            <q-td :props="props" class="text-right">
              <q-btn
                flat
                dense
                round
                icon="edit"
                color="primary"
                @click="showMockAction(`แก้ไข ${props.row.name}`)"
              />
              <q-btn
                flat
                dense
                round
                icon="visibility"
                color="grey-7"
                @click="showMockAction(`ดู ${props.row.name}`)"
              />
            </q-td>
          </template>
        </q-table>
      </AdminSurfaceCard>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import AdminActionButton from 'components/admin/AdminActionButton.vue';
import AdminMetricCard from 'components/admin/AdminMetricCard.vue';
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import { computed, ref } from 'vue';
import { useQuasar, type QTableColumn } from 'quasar';
import { useCourseStore } from 'src/stores/course-store';

interface CategoryRow {
  name: string;
  count: number;
  active: number;
  status: string;
  statusColor: string;
  owner: string;
  trend: number;
}

const $q = useQuasar();
const courseStore = useCourseStore();
const search = ref('');

courseStore.init();

const categoryColumns: QTableColumn<CategoryRow>[] = [
  { name: 'name', label: 'หมวดหมู่', field: 'name', align: 'left', sortable: true },
  { name: 'count', label: 'รายวิชา', field: 'count', align: 'right', sortable: true },
  { name: 'active', label: 'เปิดรับ', field: 'active', align: 'right', sortable: true },
  { name: 'status', label: 'สถานะ', field: 'status', align: 'center' },
  { name: 'owner', label: 'ผู้ดูแล', field: 'owner', align: 'left' },
  { name: 'trend', label: 'การใช้งาน', field: 'trend', align: 'left' },
  { name: 'actions', label: '', field: (row) => row.name, align: 'right' },
];

const categoryRows = computed<CategoryRow[]>(() => {
  const grouped = courseStore.courses.reduce<Record<string, CategoryRow>>((accumulator, course) => {
    const current = accumulator[course.category] ?? {
      name: course.category,
      count: 0,
      active: 0,
      status: 'เผยแพร่',
      statusColor: 'positive',
      owner: course.faculty || 'ทีมวิชาการ',
      trend: 0,
    };

    current.count += 1;
    current.active += course.isActive ? 1 : 0;
    current.owner = current.count > 1 ? 'ทีมวิชาการกลาง' : current.owner;
    accumulator[course.category] = current;
    return accumulator;
  }, {});

  const maxCount = Math.max(...Object.values(grouped).map((category) => category.count), 1);

  return Object.values(grouped)
    .map((category) => ({
      ...category,
      status: category.active > 0 ? 'เผยแพร่' : 'ซ่อนชั่วคราว',
      statusColor: category.active > 0 ? 'positive' : 'grey-6',
      trend: category.count / maxCount,
    }))
    .sort((left, right) => right.count - left.count);
});

const filteredCategoryRows = computed(() => {
  const keyword = search.value.trim().toLowerCase();
  if (!keyword) return categoryRows.value;
  return categoryRows.value.filter((row) => row.name.toLowerCase().includes(keyword));
});

const categoryStats = computed(() => [
  { icon: 'category', value: categoryRows.value.length.toString(), label: 'หมวดหมู่ทั้งหมด' },
  {
    icon: 'visibility',
    value: categoryRows.value.filter((row) => row.active > 0).length.toString(),
    label: 'กำลังเผยแพร่',
  },
  {
    icon: 'library_books',
    value: courseStore.courses.length.toString(),
    label: 'รายวิชาในระบบ',
  },
]);

function showMockAction(action: string): void {
  $q.notify({
    type: 'info',
    message: `${action} เป็น mockup สำหรับเชื่อม backend ภายหลัง`,
    position: 'top',
  });
}
</script>

<style lang="scss" scoped>
.admin-categories-page__hero-action {
  justify-self: end;
}

.admin-stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 18px;
}

.admin-search-input {
  width: min(320px, 100%);
}

.admin-mini-progress {
  display: grid;
  grid-template-columns: minmax(90px, 1fr) 42px;
  gap: 8px;
  align-items: center;
  color: var(--admin-muted);
  font-size: 0.78rem;
  font-weight: 800;
}

@media (max-width: 900px) {
  .admin-categories-page__hero-action {
    justify-self: start;
  }
}

@media (max-width: 760px) {
  .admin-stat-grid {
    grid-template-columns: 1fr;
  }
}
</style>
