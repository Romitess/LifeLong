<template>
  <q-page class="admin-page finance-faculty-report">
    <AdminPageHero
      :eyebrow="$t('centralFinance.dashboard.hero.eyebrow')"
      eyebrow-icon="analytics"
      :title="'รายงานแยกตามคณะ/ส่วนงาน'"
      :description="'วิเคราะห์สัดส่วนรายได้และการจัดเก็บเงินของแต่ละคณะในมหาวิทยาลัย'"
    >
      <template #actions>
        <AdminActionButton icon="file_download" label="Export Report" no-caps @click="onExport" />
      </template>
    </AdminPageHero>

    <section class="admin-shell admin-content">
      <!-- Period Selector -->
      <div class="row q-col-gutter-lg q-mb-lg">
        <div class="col-12">
          <AdminSurfaceCard :accent="false">
            <div class="row items-center q-gutter-md">
              <div class="text-subtitle1 text-weight-bold text-navy">รอบการรายงาน:</div>
              <q-btn-toggle
                v-model="period"
                toggle-color="primary"
                flat
                unelevated
                :options="[
                  { label: 'รายเดือน', value: 'month' },
                  { label: 'รายไตรมาส', value: 'quarter' },
                  { label: 'รายปี', value: 'year' },
                ]"
                class="period-toggle"
              />
              <q-space />
              <q-select
                v-model="selectedYear"
                :options="['2569', '2568', '2567']"
                outlined
                dense
                bg-color="white"
                label="ปีงบประมาณ"
                style="width: 150px"
              />
            </div>
          </AdminSurfaceCard>
        </div>
      </div>

      <!-- Analysis Grid -->
      <div class="row q-col-gutter-lg">
        <!-- Pie Chart -->
        <div class="col-12 col-lg-5">
          <AdminSurfaceCard :accent="false" title="สัดส่วนรายได้แยกตามคณะ" class="h-full">
            <div class="column items-center justify-center q-pa-md">
              <RevenueDonutChart :data="chartData" />
              <div class="q-mt-lg text-center">
                <div class="text-caption text-grey-6 q-mb-xs">รายรับรวมทั้งหมดประจำปี 2569</div>
                <div class="text-h4 text-weight-bolder text-navy">
                  {{ formatCurrency(totalRevenue) }}
                </div>
              </div>
            </div>
          </AdminSurfaceCard>
        </div>

        <!-- Comparison Table -->
        <div class="col-12 col-lg-7">
          <AdminSurfaceCard
            :accent="false"
            title="ตารางเปรียบเทียบรายคณะ"
            body-padding="none"
            class="h-full"
          >
            <q-table
              flat
              :rows="facultyStats"
              :columns="columns"
              row-key="name"
              class="faculty-report-table"
              :pagination="{ rowsPerPage: 10 }"
            >
              <template #body-cell-percent="props">
                <q-td :props="props">
                  <div class="row items-center no-wrap">
                    <q-linear-progress
                      :value="props.row.percent / 100"
                      :color="props.row.color"
                      rounded
                      size="8px"
                      class="q-mr-sm"
                      style="width: 60px"
                    />
                    <span class="text-weight-bold">{{ props.row.percent }}%</span>
                  </div>
                </q-td>
              </template>

              <template #body-cell-revenue="props">
                <q-td :props="props" class="text-weight-bolder text-navy">
                  {{ formatCurrency(props.row.revenue) }}
                </q-td>
              </template>
            </q-table>
          </AdminSurfaceCard>
        </div>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';
import type { QTableColumn } from 'quasar';
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import AdminActionButton from 'components/admin/AdminActionButton.vue';
import RevenueDonutChart from 'components/finance/RevenueDonutChart.vue';
import { useCentralFinanceStore } from 'src/stores/central-finance-store';

const $q = useQuasar();
const financeStore = useCentralFinanceStore();

const period = ref('month');
const selectedYear = ref('2569');

const facultyStats = computed(() => {
  // Aggregate revenue from transactions
  const statsMap = new Map<string, number>();

  // Faculty list for consistent order and colors
  const faculties = [
    { name: 'คณะวิทยาการสารสนเทศ', color: '#10233F' },
    { name: 'คณะวิศวกรรมศาสตร์', color: '#F5A623' },
    { name: 'คณะวิทยาศาสตร์', color: '#0EA5E9' },
    { name: 'คณะพยาบาลศาสตร์', color: '#EC4899' },
    { name: 'คณะบริหารธุรกิจ', color: '#8B5CF6' },
    { name: 'สำนักคอมพิวเตอร์', color: '#10B981' },
  ];

  // Initialize map
  faculties.forEach((f) => statsMap.set(f.name, 0));

  // Sum up valid transactions
  financeStore.transactions.forEach((tx) => {
    if (tx.status === 'valid') {
      const current = statsMap.get(tx.faculty) || 0;
      statsMap.set(tx.faculty, current + tx.amount);
    }
  });

  const total = Array.from(statsMap.values()).reduce((a, b) => a + b, 0) || 1;

  return faculties
    .map((f) => {
      const revenue = statsMap.get(f.name) || 0;
      return {
        name: f.name,
        revenue,
        percent: Math.round((revenue / total) * 100),
        color: f.color,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
});

const totalRevenue = computed(() => {
  return facultyStats.value.reduce((sum, f) => sum + f.revenue, 0);
});

const chartData = computed(() => {
  return facultyStats.value.map((f) => ({
    name: f.name,
    amount: f.revenue,
    percent: f.percent,
    color: f.color,
  }));
});

const columns: QTableColumn[] = [
  { name: 'name', label: 'คณะ / ส่วนงาน', field: 'name', align: 'left', sortable: true },
  { name: 'percent', label: 'สัดส่วน', field: 'percent', align: 'left', sortable: true },
  { name: 'revenue', label: 'รายได้รวม', field: 'revenue', align: 'right', sortable: true },
];

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(val);
}

function onExport() {
  $q.notify({
    type: 'positive',
    message: 'Report exported successfully',
    icon: 'file_download',
  });
}
</script>

<style lang="scss" scoped>
.finance-faculty-report {
  .period-toggle {
    border: 1px solid rgba(0, 0, 0, 0.05);
    border-radius: 12px;
    background: #f8fafc;
    padding: 2px;
  }

  .faculty-report-table {
    background: transparent;

    :deep(thead tr th) {
      font-weight: 800;
      color: var(--admin-navy);
      background: #f8fafc;
      font-size: 0.88rem;
      padding: 16px;
    }

    :deep(tbody tr td) {
      padding: 16px;
      font-size: 0.94rem;
    }

    :deep(tbody tr:hover) {
      background: rgba(16, 35, 63, 0.02);
    }
  }

  .text-navy {
    color: var(--admin-navy);
  }
}

.h-full {
  height: 100%;
}
</style>
