<template>
  <q-page class="finance-page finance-faculty-report-page">
    <!-- ── Hero ─────────────────────────────────────────────── -->
    <CentralFinancePageHero
      :eyebrow="$t('centralFinance.dashboard.hero.eyebrow')"
      eyebrow-icon="analytics"
      :title="$t('centralFinance.facultyRevenue.hero.title')"
      :description="$t('centralFinance.facultyRevenue.hero.desc')"
    >
      <template #aside>
        <div class="faculty-scope-card">
          <div class="faculty-scope-card__label">
            {{ $t('centralFinance.receiptSummary.scopeLabel') }}
          </div>
          <div class="faculty-scope-card__faculty">
            {{ activeFacultyLabel }}
          </div>
        </div>
      </template>
    </CentralFinancePageHero>

    <section class="finance-shell finance-content">
      <!-- ── KPI Metric Cards ─────────────────────────────────── -->
      <div class="fac-stat-grid">
        <CentralFinanceMetricCard
          icon="account_balance_wallet"
          icon-color="#047857"
          icon-tint="rgba(4,120,87,0.12)"
          :value="formatCurrency(totalRevenue)"
          :label="$t('centralFinance.facultyRevenue.summary.totalRevenue')"
        />
        <CentralFinanceMetricCard
          icon="emoji_events"
          icon-color="#b45309"
          icon-tint="rgba(180,83,9,0.12)"
          :value="topFaculty"
          :label="$t('centralFinance.facultyRevenue.summary.topFaculty')"
        />
        <CentralFinanceMetricCard
          icon="domain"
          icon-color="#7c3aed"
          icon-tint="rgba(124,58,237,0.12)"
          :value="String(activeFacultyCount)"
          :label="$t('centralFinance.facultyRevenue.summary.facultyCount')"
        />
      </div>

      <!-- ── Filter Card ─────────────────────────────────────── -->
      <CentralFinanceSurfaceCard>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-8 offset-md-2">
            <!-- รอบการรายงาน -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
                {{ $t('centralFinance.facultyRevenue.filters.period') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-btn-toggle
                  v-model="filters.period"
                  toggle-color="primary"
                  flat
                  unelevated
                  :options="[
                    { label: $t('centralFinance.facultyRevenue.filters.month'), value: 'month' },
                    {
                      label: $t('centralFinance.facultyRevenue.filters.quarter'),
                      value: 'quarter',
                    },
                    { label: $t('centralFinance.facultyRevenue.filters.year'), value: 'year' },
                  ]"
                  class="period-toggle"
                />
              </div>
            </div>

            <!-- ปีงบประมาณ -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
                {{ $t('centralFinance.facultyRevenue.filters.fiscalYear') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-select
                  v-model="filters.fiscalYear"
                  :options="fiscalYearOptions"
                  emit-value
                  map-options
                  outlined
                  dense
                  class="bg-white"
                  style="max-width: 200px"
                />
              </div>
            </div>

            <!-- ปุ่มค้นหา / ล้างค่า -->
            <div class="row items-center">
              <div class="col-12 col-sm-4 text-right q-pr-md" />
              <div class="col-12 col-sm-8 q-gutter-sm">
                <q-btn
                  color="warning"
                  text-color="black"
                  :label="$t('centralFinance.facultyRevenue.filters.searchBtn')"
                  unelevated
                  class="q-px-xl"
                  @click="onSearch"
                />
                <q-btn
                  outline
                  color="grey-7"
                  :label="$t('centralFinance.facultyRevenue.filters.clearBtn')"
                  class="q-px-lg bg-white"
                  @click="clearFilters"
                />
              </div>
            </div>
          </div>
        </div>
      </CentralFinanceSurfaceCard>

      <!-- ── Analysis Grid (Chart + Table) ──────────────────── -->
      <div v-if="hasSearched" class="fac-analysis-grid q-mt-md">
        <!-- Donut Chart -->
        <CentralFinanceSurfaceCard
          :accent="false"
          :title="$t('centralFinance.facultyRevenue.chart.title')"
          class="h-full"
        >
          <div class="column items-center justify-center q-pa-md">
            <RevenueDonutChart :data="chartData" />
            <div class="q-mt-lg text-center">
              <div class="text-caption text-grey-6 q-mb-xs">
                {{ $t('centralFinance.facultyRevenue.chart.totalRevenue') }}
                {{ filters.fiscalYear }}
              </div>
              <div class="text-h4 text-weight-bolder text-navy">
                {{ formatCurrency(totalRevenue) }}
              </div>
            </div>
          </div>
        </CentralFinanceSurfaceCard>

        <!-- Faculty Table -->
        <CentralFinanceSurfaceCard
          :accent="false"
          :title="$t('centralFinance.facultyRevenue.table.title')"
          body-padding="none"
          class="h-full"
        >
          <template #header-actions>
            <q-btn
              outline
              color="negative"
              icon="picture_as_pdf"
              :label="$t('centralFinance.facultyRevenue.table.pdfBtn')"
              class="q-mr-sm"
              @click="exportToPdf"
            />
            <q-btn
              outline
              color="positive"
              icon="table_chart"
              :label="$t('centralFinance.facultyRevenue.table.excelBtn')"
              @click="exportToExcel"
            />
          </template>

          <!-- Report title -->
          <div class="text-center q-pt-lg q-pb-sm">
            <div class="text-weight-bold text-subtitle1">
              {{ $t('centralFinance.facultyRevenue.table.reportTitle') }}
            </div>
            <div class="text-weight-medium text-caption text-grey-8 q-mt-xs">
              {{ $t('centralFinance.facultyRevenue.filters.fiscalYear') }}:
              {{ filters.fiscalYear }}
            </div>
          </div>

          <!-- Search bar -->
          <div class="row justify-end items-center q-px-md q-pb-md">
            <q-input
              v-model="search"
              dense
              outlined
              :placeholder="$t('centralFinance.facultyRevenue.table.searchLabel')"
              class="fac-report-search"
            >
              <template v-slot:prepend>
                <q-icon name="search" />
              </template>
            </q-input>
          </div>

          <q-table
            :rows="facultyStats"
            :columns="columns"
            row-key="name"
            flat
            dense
            :filter="search"
            class="fac-report-table"
            v-model:pagination="pagination"
            :rows-per-page-options="[10, 25, 50]"
            :header-style="{ fontSize: '0.75rem', whiteSpace: 'pre-wrap', lineHeight: '1.3' }"
          >
            <!-- Rank -->
            <template #body-cell-rank="props">
              <q-td :props="props" class="text-center">
                <q-badge
                  :color="
                    props.row.rank === 1
                      ? 'warning'
                      : props.row.rank === 2
                        ? 'blue-6'
                        : props.row.rank === 3
                          ? 'teal'
                          : 'grey-5'
                  "
                  :label="String(props.row.rank)"
                  rounded
                  class="text-weight-bold"
                />
              </q-td>
            </template>

            <!-- Color dot + name -->
            <template #body-cell-name="props">
              <q-td :props="props">
                <div class="row items-center no-wrap q-gutter-xs">
                  <div class="fac-color-dot" :style="{ background: props.row.color }" />
                  <span>{{ props.row.name }}</span>
                </div>
              </q-td>
            </template>

            <!-- Proportion bar -->
            <template #body-cell-percent="props">
              <q-td :props="props">
                <div class="row items-center no-wrap q-gutter-sm">
                  <q-linear-progress
                    :value="props.row.percent / 100"
                    :color="props.row.barColor"
                    rounded
                    size="8px"
                    style="width: 70px"
                  />
                  <span class="text-weight-bold">{{ props.row.percent }}%</span>
                </div>
              </q-td>
            </template>

            <!-- Revenue -->
            <template #body-cell-revenue="props">
              <q-td :props="props" class="text-right text-weight-bolder text-navy">
                {{ formatCurrency(props.row.revenue) }}
              </q-td>
            </template>

            <!-- Custom pagination -->
            <template v-slot:bottom="scope">
              <div class="row full-width justify-between items-center q-py-sm">
                <div class="row items-center q-gutter-sm">
                  <span class="text-subtitle2 text-grey-8">
                    {{ $t('centralFinance.facultyRevenue.table.showLabel') }}
                  </span>
                  <q-select
                    v-model="pagination.rowsPerPage"
                    :options="[10, 25, 50]"
                    outlined
                    dense
                    options-dense
                    style="width: 80px"
                    class="bg-white"
                  />
                  <span class="text-subtitle2 text-grey-8">
                    {{ $t('centralFinance.facultyRevenue.table.entriesLabel') }}
                  </span>
                </div>
                <div class="row items-center q-gutter-sm">
                  <span class="text-caption text-grey-8 q-mr-sm">
                    {{
                      facultyStats.length > 0
                        ? (scope.pagination.page - 1) * scope.pagination.rowsPerPage + 1
                        : 0
                    }}-{{
                      Math.min(
                        scope.pagination.page * scope.pagination.rowsPerPage,
                        facultyStats.length,
                      )
                    }}
                    of {{ facultyStats.length }}
                  </span>
                  <q-btn
                    icon="first_page"
                    color="grey-8"
                    round
                    dense
                    flat
                    :disable="scope.isFirstPage"
                    @click="scope.firstPage"
                  />
                  <q-btn
                    icon="chevron_left"
                    color="grey-8"
                    round
                    dense
                    flat
                    :disable="scope.isFirstPage"
                    @click="scope.prevPage"
                  />
                  <q-btn
                    icon="chevron_right"
                    color="grey-8"
                    round
                    dense
                    flat
                    :disable="scope.isLastPage"
                    @click="scope.nextPage"
                  />
                  <q-btn
                    icon="last_page"
                    color="grey-8"
                    round
                    dense
                    flat
                    :disable="scope.isLastPage"
                    @click="scope.lastPage"
                  />
                </div>
              </div>
            </template>
          </q-table>
        </CentralFinanceSurfaceCard>
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import type { QTableColumn } from 'quasar';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import CentralFinanceMetricCard from 'components/centralfinance/CentralFinanceMetricCard.vue';
import RevenueDonutChart from 'components/finance/RevenueDonutChart.vue';
import { useCentralFinanceStore } from 'src/stores/central-finance-store';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import SarabunFontUrl from 'src/assets/fonts/THSarabunPSK.ttf';
import * as XLSX from 'xlsx';

const { t } = useI18n();
const financeStore = useCentralFinanceStore();

// ── State ───────────────────────────────────────────────────
const search = ref('');
const hasSearched = ref(false);

const filters = ref<{
  period: 'month' | 'quarter' | 'year';
  fiscalYear: string;
}>({
  period: 'month',
  fiscalYear: '2569',
});

const pagination = ref({
  sortBy: 'rank',
  descending: false,
  page: 1,
  rowsPerPage: 10,
});

const currentThaiYear = new Date().getFullYear() + 543;
const fiscalYearOptions = computed(() =>
  Array.from({ length: 5 }, (_, i) => {
    const y = currentThaiYear - i;
    return { label: String(y), value: String(y) };
  }),
);

// ── Faculty Data ─────────────────────────────────────────────
interface FacultyStat {
  rank: number;
  name: string;
  revenue: number;
  percent: number;
  color: string;
  barColor: string;
}

interface ChartDataItem {
  name: string;
  amount: number;
  percent: number;
  color: string;
}

const FACULTY_CONFIG = [
  { name: 'คณะวิทยาการสารสนเทศ', color: '#10233F', barColor: 'primary' },
  { name: 'คณะวิศวกรรมศาสตร์', color: '#F5A623', barColor: 'warning' },
  { name: 'คณะวิทยาศาสตร์', color: '#0EA5E9', barColor: 'blue-5' },
  { name: 'คณะพยาบาลศาสตร์', color: '#EC4899', barColor: 'pink-5' },
  { name: 'คณะบริหารธุรกิจ', color: '#8B5CF6', barColor: 'purple-5' },
  { name: 'สำนักคอมพิวเตอร์', color: '#10B981', barColor: 'teal-5' },
];

const facultyStats = computed<FacultyStat[]>(() => {
  const statsMap = new Map<string, number>();
  FACULTY_CONFIG.forEach((f) => statsMap.set(f.name, 0));

  financeStore.transactions.forEach((tx) => {
    if (tx.status === 'valid') {
      const current = statsMap.get(tx.faculty) || 0;
      statsMap.set(tx.faculty, current + tx.amount);
    }
  });

  const total = Array.from(statsMap.values()).reduce((a, b) => a + b, 0) || 1;

  return FACULTY_CONFIG.map((f) => {
    const revenue = statsMap.get(f.name) || 0;
    return {
      name: f.name,
      revenue,
      percent: Math.round((revenue / total) * 100),
      color: f.color,
      barColor: f.barColor,
      rank: 0,
    };
  })
    .sort((a, b) => b.revenue - a.revenue)
    .map((f, i) => ({ ...f, rank: i + 1 }));
});

const totalRevenue = computed<number>(() =>
  facultyStats.value.reduce((sum, f) => sum + f.revenue, 0),
);

const topFaculty = computed<string>(() => facultyStats.value[0]?.name ?? '-');

const activeFacultyCount = computed<number>(
  () => facultyStats.value.filter((f) => f.revenue > 0).length,
);

const activeFacultyLabel = computed<string>(
  () => `${activeFacultyCount.value} ${t('centralFinance.facultyRevenue.summary.facultyCount')}`,
);

const chartData = computed<ChartDataItem[]>(() =>
  facultyStats.value.map((f) => ({
    name: f.name,
    amount: f.revenue,
    percent: f.percent,
    color: f.color,
  })),
);

// ── Table Columns ────────────────────────────────────────────
const columns = computed<QTableColumn[]>(() => [
  {
    name: 'rank',
    label: t('centralFinance.facultyRevenue.table.rank'),
    field: 'rank',
    align: 'center',
    sortable: true,
  },
  {
    name: 'name',
    label: t('centralFinance.facultyRevenue.table.faculty'),
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'percent',
    label: t('centralFinance.facultyRevenue.table.proportion'),
    field: 'percent',
    align: 'left',
    sortable: true,
  },
  {
    name: 'revenue',
    label: t('centralFinance.facultyRevenue.table.revenue'),
    field: 'revenue',
    align: 'right',
    sortable: true,
  },
]);

// ── Actions ──────────────────────────────────────────────────
function onSearch(): void {
  hasSearched.value = true;
  pagination.value.page = 1;
}

function clearFilters(): void {
  filters.value.period = 'month';
  filters.value.fiscalYear = String(currentThaiYear);
  hasSearched.value = false;
}

function formatCurrency(val: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 0,
  }).format(val);
}

// ── Export helpers ───────────────────────────────────────────
async function loadSarabunFont(): Promise<string> {
  const response = await fetch(SarabunFontUrl);
  const blob = await response.blob();
  return new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(',')[1] ?? '');
    };
    reader.readAsDataURL(blob);
  });
}

async function exportToPdf(): Promise<void> {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

  const base64Font = await loadSarabunFont();
  doc.addFileToVFS('THSarabunPSK.ttf', base64Font);
  doc.addFont('THSarabunPSK.ttf', 'Sarabun', 'normal');
  doc.setFont('Sarabun');
  doc.setFontSize(13);

  const title = t('centralFinance.facultyRevenue.table.reportTitle');
  const subtitle = `${t('centralFinance.facultyRevenue.filters.fiscalYear')}: ${filters.value.fiscalYear}`;
  const w = doc.internal.pageSize.getWidth();
  doc.text(title, w / 2, 35, { align: 'center' });
  doc.text(subtitle, w / 2, 50, { align: 'center' });

  const rows = facultyStats.value.map((row) => [
    row.rank,
    row.name,
    `${row.percent}%`,
    formatCurrency(row.revenue),
  ]);

  autoTable(doc, {
    startY: 65,
    rowPageBreak: 'avoid',
    showHead: 'everyPage',
    head: [
      [
        t('centralFinance.facultyRevenue.table.rank'),
        t('centralFinance.facultyRevenue.table.faculty'),
        t('centralFinance.facultyRevenue.table.proportion'),
        t('centralFinance.facultyRevenue.table.revenue'),
      ],
    ],
    body: rows,
    styles: {
      font: 'Sarabun',
      fontSize: 10,
      cellPadding: 6,
      valign: 'middle',
      lineColor: [180, 180, 180],
      lineWidth: 0.5,
      overflow: 'linebreak',
    },
    headStyles: {
      font: 'Sarabun',
      fillColor: [226, 232, 240],
      textColor: [51, 65, 85],
      fontStyle: 'normal',
      fontSize: 10,
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 50 },
      1: { cellWidth: 250 },
      2: { halign: 'center', cellWidth: 100 },
      3: { halign: 'right', cellWidth: 130 },
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    margin: { top: 20, left: 30, right: 30 },
  });

  doc.save(`faculty-revenue-report-${filters.value.fiscalYear}.pdf`);
}

function exportToExcel(): void {
  const header = [
    t('centralFinance.facultyRevenue.table.rank'),
    t('centralFinance.facultyRevenue.table.faculty'),
    t('centralFinance.facultyRevenue.table.proportion'),
    t('centralFinance.facultyRevenue.table.revenue'),
  ];

  const rows = facultyStats.value.map((row) => [
    row.rank,
    row.name,
    `${row.percent}%`,
    row.revenue,
  ]);

  const title = t('centralFinance.facultyRevenue.table.reportTitle');
  const subtitle = `${t('centralFinance.facultyRevenue.filters.fiscalYear')}: ${filters.value.fiscalYear}`;
  const wsData = [[title], [subtitle], [], header, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
  ];
  ws['!cols'] = [{ wch: 8 }, { wch: 40 }, { wch: 14 }, { wch: 20 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'รายงานแยกคณะ');
  XLSX.writeFile(wb, `faculty-revenue-report-${filters.value.fiscalYear}.xlsx`);
}
</script>

<style lang="scss" scoped>
// ── KPI grid (3 cols) ─────────────────────────────────────────
.fac-stat-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 20px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
}

// ── Analysis grid (chart left, table right) ───────────────────
.fac-analysis-grid {
  display: grid;
  grid-template-columns: minmax(0, 0.85fr) minmax(0, 1.15fr);
  gap: 18px;
  align-items: start;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
  }
}

.h-full {
  height: 100%;
}

// ── Period toggle ─────────────────────────────────────────────
.period-toggle {
  border: 1px solid rgba(0, 0, 0, 0.07);
  border-radius: 12px;
  background: #f8fafc;
  padding: 2px;
}

// ── Faculty scope card (hero aside) ──────────────────────────
.faculty-scope-card {
  min-width: 220px;
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: grid;
  gap: 6px;
}

.faculty-scope-card__label {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.faculty-scope-card__faculty {
  color: #fff;
  font-size: 1rem;
  font-weight: 900;
}

// ── Color dot ─────────────────────────────────────────────────
.fac-color-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

// ── Search bar ────────────────────────────────────────────────
.fac-report-search {
  width: 250px;
}

// ── Table ─────────────────────────────────────────────────────
.fac-report-table {
  background: transparent;

  :deep(.q-table__card) {
    box-shadow: none;
  }

  :deep(thead tr) {
    background: #e2e8f0;
  }

  :deep(th) {
    font-weight: 600;
    color: #334155;
    font-size: 0.75rem;
    white-space: pre-wrap;
    text-align: center !important;
    vertical-align: middle;
    line-height: 1.3;
    padding: 8px 12px;
  }

  :deep(tbody td) {
    vertical-align: middle;
    padding-top: 12px;
    padding-bottom: 12px;
  }

  :deep(tbody tr:hover) {
    background: rgba(16, 35, 63, 0.025);
  }
}

.text-navy {
  color: var(--finance-navy);
}

// ── Field label ───────────────────────────────────────────────
:deep(.q-field__label) {
  font-weight: 400 !important;
}
</style>
