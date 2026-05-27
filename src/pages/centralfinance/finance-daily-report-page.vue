<template>
  <q-page class="finance-page finance-daily-report-page">
    <CentralFinancePageHero
      eyebrow="Financial Operations"
      eyebrow-icon="receipt_long"
      :title="$t('centralFinance.dailyReport.hero.title')"
      :description="$t('centralFinance.dailyReport.hero.desc')"
    />

    <section class="finance-shell finance-content">
      <CentralFinanceSurfaceCard>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-8 offset-md-2">
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
                วันที่ใบเสร็จรับเงิน <span class="text-negative">*</span>
              </div>
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="filters.receiptDateStart"
                  outlined
                  dense
                  placeholder="วว/ดด/ปปปป"
                  mask="##/##/####"
                  class="bg-white"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" color="grey-7">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="filters.receiptDateStart"
                          mask="DD/MM/YYYY"
                          color="warning"
                          text-color="black"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
                ถึงวันที่ <span class="text-negative">*</span>
              </div>
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="filters.receiptDateEnd"
                  outlined
                  dense
                  placeholder="วว/ดด/ปปปป"
                  mask="##/##/####"
                  class="bg-white"
                >
                  <template v-slot:append>
                    <q-icon name="event" class="cursor-pointer" color="grey-7">
                      <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                        <q-date
                          v-model="filters.receiptDateEnd"
                          mask="DD/MM/YYYY"
                          color="warning"
                          text-color="black"
                        />
                      </q-popup-proxy>
                    </q-icon>
                  </template>
                </q-input>
              </div>
            </div>

            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">ส่วนงาน</div>
              <div class="col-12 col-sm-8">
                <q-select
                  v-model="filters.department"
                  :options="departmentOptions"
                  outlined
                  dense
                  class="bg-white"
                />
              </div>
            </div>

            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
                ชื่อโครงการ/อบรม/หลักสูตร
              </div>
              <div class="col-12 col-sm-8">
                <q-input
                  v-model="filters.courseName"
                  outlined
                  dense
                  class="bg-white"
                  placeholder="ค้นหาชื่อโครงการ/อบรม/หลักสูตร"
                />
              </div>
            </div>

            <div class="row items-center">
              <div class="col-12 col-sm-4 text-right q-pr-md"></div>
              <div class="col-12 col-sm-8 q-gutter-sm">
                <q-btn
                  color="warning"
                  text-color="black"
                  label="ค้นหา"
                  unelevated
                  class="q-px-xl"
                  @click="onSearch"
                />
                <q-btn
                  outline
                  color="grey-7"
                  label="ล้างค่า"
                  class="q-px-lg bg-white"
                  @click="clearFilters"
                />
              </div>
            </div>
          </div>
        </div>
      </CentralFinanceSurfaceCard>

      <CentralFinanceSurfaceCard v-if="hasSearched" class="q-mt-md" card-class="q-pa-none">
        <template #header-actions>
          <q-btn
            outline
            color="negative"
            icon="picture_as_pdf"
            label="ส่งออกเป็น Pdf"
            class="q-mr-sm"
            @click="exportToPdf"
          />
          <q-btn
            outline
            color="positive"
            icon="table_chart"
            label="ส่งออกเป็น Excel"
            @click="exportToExcel"
          />
        </template>

        <div class="text-center q-pt-lg q-pb-sm">
          <div class="text-weight-bold text-subtitle1">
            รายงานสรุปการรับเงินประจำวัน LifeLong Learning มหาวิทยาลัยบูรพา
          </div>
          <div class="text-weight-bold text-subtitle2">
            ส่วนงาน {{ activeFilters.department || '-' }}
          </div>
          <div class="text-weight-medium text-caption text-grey-8">
            วันที่ใบเสร็จรับเงิน {{ activeFilters.receiptDateStart || '-' }} ถึงวันที่
            {{ activeFilters.receiptDateEnd || '-' }}
          </div>
        </div>

        <div class="row justify-end items-center q-px-md q-pb-md">
          <q-input v-model="search" dense outlined placeholder="ค้นหา:" class="report-search">
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <q-table
          :rows="tableRows"
          :columns="columns"
          row-key="id"
          flat
          dense
          :filter="search"
          class="report-table"
          v-model:pagination="pagination"
          :rows-per-page-options="[10, 25, 50, 100]"
          :header-style="{ fontSize: '0.75rem', whiteSpace: 'pre-wrap', lineHeight: '1.3' }"
        >
          <template v-slot:body-cell-amount="props">
            <q-td :props="props" class="text-right">
              {{ formatCurrency(props.value) }}
            </q-td>
          </template>

          <template v-slot:bottom="scope">
            <div class="row full-width justify-between items-center q-py-sm">
              <div class="row items-center q-gutter-sm">
                <span class="text-subtitle2 text-grey-8">แสดง</span>
                <q-select
                  v-model="pagination.rowsPerPage"
                  :options="[10, 25, 50, 100]"
                  outlined
                  dense
                  options-dense
                  style="width: 80px"
                  class="bg-white report-rows-select"
                />
                <span class="text-subtitle2 text-grey-8">รายการ</span>
              </div>
              <div class="row items-center q-gutter-sm">
                <span class="text-caption text-grey-8 q-mr-sm">
                  {{
                    tableRows.length > 0
                      ? (scope.pagination.page - 1) * scope.pagination.rowsPerPage + 1
                      : 0
                  }}-{{
                    Math.min(scope.pagination.page * scope.pagination.rowsPerPage, tableRows.length)
                  }}
                  of {{ tableRows.length }}
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
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar'; // 1. Import useQuasar เข้ามา
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import { useCentralFinanceStore } from 'src/stores/central-finance-store';
import type { Transaction } from 'src/stores/central-finance-store';
import type { QTableColumn } from 'quasar';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import SarabunFontUrl from 'src/assets/fonts/THSarabunPSK.ttf';
import * as XLSX from 'xlsx';

const $q = useQuasar(); // 2. เรียกใช้งาน useQuasar
const financeStore = useCentralFinanceStore();
const search = ref('');

// ตัวแปรควบคุมการแสดงผลของตาราง (เริ่มต้นเป็น false เพื่อไม่ให้แสดงตาราง)
const hasSearched = ref(false);

const pagination = ref({
  sortBy: 'no',
  descending: false,
  page: 1,
  rowsPerPage: 25,
});

// ตัวกรองข้อมูล
const filters = ref({
  receiptDateStart: '27/05/2569',
  receiptDateEnd: '30/05/2569',
  department: 'สำนักคอมพิวเตอร์',
  courseName: '',
});

// เก็บสถานะฟิลเตอร์หลังจากกดค้นหาเพื่อให้แสดงใน Title ของตารางได้อย่างถูกต้อง
const activeFilters = ref({
  receiptDateStart: '27/05/2569',
  receiptDateEnd: '30/05/2569',
  department: 'สำนักคอมพิวเตอร์',
  courseName: '',
});

// รายการส่วนงานทั้งหมด
const departmentOptions = [
  'สำนักคอมพิวเตอร์',
  'คณะวิทยาการสารสนเทศ',
  'คณะวิทยาศาสตร์',
  'คณะพยาบาลศาสตร์',
  'คณะบริหารธุรกิจ',
  'คณะวิศวกรรมศาสตร์',
];

// ฟังก์ชันสำหรับฟิลเตอร์และการแปลงข้อมูล (คงเดิม)
// function thaiDateToGregorianStr(dateStr: string): string | null {
//   if (!dateStr || dateStr.length !== 10) return null;
//   const parts = dateStr.split('/');
//   if (parts.length !== 3) return null;
//   const day = parts[0];
//   const month = parts[1];
//   const yearBE = parseInt(parts[2] || '0');
//   if (isNaN(yearBE)) return null;
//   const yearCE = yearBE - 543;
//   return `${yearCE}-${month}-${day}`;
// }

function getCourseNameForTx(tx: Transaction): string {
  if (tx.faculty === 'สำนักคอมพิวเตอร์')
    return 'C67052002: การพัฒนาเว็บแอปพลิเคชัน สำนักคอมพิวเตอร์';
  else if (tx.faculty === 'คณะวิทยาการสารสนเทศ')
    return 'C66061004: การถ่ายภาพโฆษณา คณะศิลปกรรมศาสตร์';
  else if (tx.faculty === 'คณะวิทยาศาสตร์')
    return 'C65091001: วิทยาศาสตร์ข้อมูลเบื้องต้น คณะวิทยาศาสตร์';
  else if (tx.faculty === 'คณะพยาบาลศาสตร์')
    return 'C65082001: การดูแลผู้สูงอายุเบื้องต้น คณะพยาบาลศาสตร์';
  else if (tx.faculty === 'คณะบริหารธุรกิจ')
    return 'C66021005: การตลาดดิจิทัลยุคใหม่ คณะบริหารธุรกิจ';
  else if (tx.faculty === 'คณะวิศวกรรมศาสตร์')
    return 'C66031002: ปัญญาประดิษฐ์ในอุตสาหกรรม คณะวิศวกรรมศาสตร์';
  return 'C66099999: หลักสูตรระยะสั้นเพื่อการเรียนรู้ตลอดชีวิต';
}

function getFundName(fundCode: string): string {
  // ... (ฟังก์ชันเดิม) ...
  const source = financeStore.fundSources.find((s) => s.fundCode === fundCode);
  if (source) return `${fundCode}: ${source.nameTh}`;
  if (fundCode.startsWith('BG')) return `${fundCode}: เงินงบประมาณแผ่นดิน`;
  else if (fundCode.startsWith('RV')) return `${fundCode}: เงินรายได้มหาวิทยาลัย`;
  else if (fundCode.startsWith('DN')) return `${fundCode}: เงินบริจาคเพื่อการศึกษา`;
  else if (fundCode.startsWith('OT')) return `${fundCode}: เงินกองทุนพัฒนาวิชาการ`;
  return fundCode;
}

const filteredTransactions = computed(() => {
  return financeStore.transactions.filter((tx) => {
    // 1. กรองตามส่วนงาน
    if (activeFilters.value.department) {
      if (tx.faculty !== activeFilters.value.department) {
        return false;
      }
    }

    // 2. กรองตามชื่อหลักสูตร/อบรม
    if (activeFilters.value.courseName) {
      const course = getCourseNameForTx(tx);
      if (!course.toLowerCase().includes(activeFilters.value.courseName.toLowerCase())) {
        return false;
      }
    }

    // 3. กรองตามช่วงวันที่เริ่มต้นและสิ้นสุด
    // 🚧 คอมเมนต์โค้ดส่วนเช็ควันที่ไว้ชั่วคราว เพื่อให้ข้อมูล Mock up แสดงผลขึ้นมาได้เสมอ 🚧
    /*
    const startStr = thaiDateToGregorianStr(activeFilters.value.receiptDateStart);
    const endStr = thaiDateToGregorianStr(activeFilters.value.receiptDateEnd);
    const txDate = tx.timestamp ? tx.timestamp.split(' ')[0] : null; 

    if (startStr && txDate && txDate < startStr) return false;
    if (endStr && txDate && txDate > endStr) return false;
    */

    // ถ้าผ่านเงื่อนไขด้านบนมาได้ ให้แสดงข้อมูลทั้งหมด
    return true;
  });
});

const tableRows = computed(() => {
  return filteredTransactions.value.map((tx, index) => ({
    id: tx.id,
    no: index + 1,
    courseName: getCourseNameForTx(tx),
    fundCode: getFundName(tx.fundCode),
    amount: tx.amount,
  }));
});

const columns = computed<QTableColumn[]>(() => [
  { name: 'no', label: 'ลำดับ', field: 'no', align: 'center', sortable: true },
  {
    name: 'courseName',
    label: 'ชื่อโครงการ/อบรม/หลักสูตร',
    field: 'courseName',
    align: 'left',
    sortable: true,
    style: 'white-space: pre-wrap; word-break: break-word;',
  },
  {
    name: 'fundCode',
    label: 'รหัสแหล่งเงิน/ชื่อผังบัญชี',
    field: 'fundCode',
    align: 'left',
    sortable: true,
    style: 'white-space: pre-wrap; word-break: break-word;',
  },
  { name: 'amount', label: 'จำนวนเงิน', field: 'amount', align: 'right', sortable: true },
]);

// 3. ปรับปรุงฟังก์ชัน onSearch เพื่อเช็ควันที่
function onSearch(): void {
  // เช็คว่ามีค่าในวันที่เริ่มต้นและถึงวันที่หรือไม่
  if (!filters.value.receiptDateStart || !filters.value.receiptDateEnd) {
    $q.notify({
      type: 'warning', // ใช้สีเหลืองเพื่อเตือน
      message: 'กรุณาระบุวันที่เริ่มต้นและสิ้นสุดให้ครบถ้วน',
      position: 'top',
      icon: 'warning',
    });
    return; // หยุดการทำงาน ไม่เซ็ต activeFilters และไม่เปิดตาราง
  }

  activeFilters.value = {
    receiptDateStart: filters.value.receiptDateStart,
    receiptDateEnd: filters.value.receiptDateEnd,
    department: filters.value.department,
    courseName: filters.value.courseName,
  };

  // เปิดการแสดงผลตารางหลังจากกดยืนยันการค้นหา
  hasSearched.value = true;
}

// ฟังก์ชันล้างค่าฟิลเตอร์
function clearFilters(): void {
  filters.value.receiptDateStart = '';
  filters.value.receiptDateEnd = '';
  filters.value.department = 'สำนักคอมพิวเตอร์';
  filters.value.courseName = '';

  activeFilters.value = {
    receiptDateStart: '',
    receiptDateEnd: '',
    department: '',
    courseName: '',
  };

  // ปิดการแสดงผลตารางเมื่อมีการล้างค่าฟิลเตอร์
  hasSearched.value = false;
}

function formatCurrency(val: number): string {
  if (val === undefined || val === null) return '-';
  return new Intl.NumberFormat('th-TH', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(val);
}

// ฟังก์ชันส่งออกเป็น PDF พร้อมตราสารประยุกต์ใช้ฟอนต์สากลวิชาการไทย Sarabun
async function exportToPdf(): Promise<void> {
  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'pt',
    format: 'a4',
  });

  // โหลดฟอนต์ภาษาไทยสารบัญ
  const response = await fetch(SarabunFontUrl);
  const blob = await response.blob();
  const base64Font = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const dataUrl = reader.result as string;
      resolve(dataUrl.split(',')[1] || '');
    };
    reader.readAsDataURL(blob);
  });

  doc.addFileToVFS('THSarabunPSK.ttf', base64Font);
  doc.addFont('THSarabunPSK.ttf', 'Sarabun', 'normal');
  doc.setFont('Sarabun');

  doc.setFontSize(13);
  const title1 = 'รายงานสรุปการรับเงินประจำวัน LifeLong Learning มหาวิทยาลัยบูรพา';
  const title2 = `ส่วนงาน: ${activeFilters.value.department}`;
  const title3 = `วันที่ใบเสร็จรับเงิน ${activeFilters.value.receiptDateStart} ถึงวันที่ ${activeFilters.value.receiptDateEnd}`;

  doc.text(title1, doc.internal.pageSize.getWidth() / 2, 35, { align: 'center' });
  doc.text(title2, doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' });
  doc.text(title3, doc.internal.pageSize.getWidth() / 2, 65, { align: 'center' });

  const rows = tableRows.value.map((row) => [
    row.no,
    row.courseName,
    row.fundCode,
    formatCurrency(row.amount),
  ]);

  autoTable(doc, {
    startY: 80,
    rowPageBreak: 'avoid',
    showHead: 'everyPage',
    head: [['ลำดับ', 'ชื่อโครงการ/อบรม/หลักสูตร', 'รหัสแหล่งเงิน/ชื่อผังบัญชี', 'จำนวนเงิน']],
    body: rows,
    styles: {
      font: 'Sarabun',
      fontSize: 9,
      cellPadding: 5,
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
      fontSize: 9,
      halign: 'center',
      valign: 'middle',
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 40 },
      1: { cellWidth: 350 },
      2: { cellWidth: 250 },
      3: { halign: 'right', cellWidth: 100 },
    },
    alternateRowStyles: { fillColor: [255, 255, 255] },
    margin: { top: 20, left: 20, right: 20 },
    tableWidth: 'auto',
  });

  doc.save('daily-report.pdf');
}

// ฟังก์ชันส่งออกเป็น Excel
function exportToExcel(): void {
  const header = ['ลำดับ', 'ชื่อโครงการ/อบรม/หลักสูตร', 'รหัสแหล่งเงิน/ชื่อผังบัญชี', 'จำนวนเงิน'];

  const rows = tableRows.value.map((row) => [
    row.no,
    row.courseName.replace(/\n/g, ' '),
    row.fundCode.replace(/\n/g, ' '),
    row.amount,
  ]);

  const title1 = 'รายงานสรุปการรับเงินประจำวัน LifeLong Learning มหาวิทยาลัยบูรพา';
  const title2 = `ส่วนงาน ${activeFilters.value.department}`;
  const title3 = `วันที่ใบเสร็จรับเงิน ${activeFilters.value.receiptDateStart} ถึงวันที่ ${activeFilters.value.receiptDateEnd}`;

  const wsData = [[title1], [title2], [title3], [], header, ...rows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  ws['!merges'] = [
    { s: { r: 0, c: 0 }, e: { r: 0, c: 3 } },
    { s: { r: 1, c: 0 }, e: { r: 1, c: 3 } },
    { s: { r: 2, c: 0 }, e: { r: 2, c: 3 } },
  ];

  ws['!cols'] = [{ wch: 8 }, { wch: 60 }, { wch: 45 }, { wch: 15 }];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'รายงาน');
  XLSX.writeFile(wb, 'daily-report.xlsx');
}
</script>

<style lang="scss" scoped>
.report-search {
  width: 250px;
}

.report-table {
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
    padding: 8px 6px;
  }
  :deep(tbody td) {
    vertical-align: middle;
    padding-top: 12px;
    padding-bottom: 12px;
    white-space: pre-wrap;
  }
}

:deep(.q-field__label) {
  font-weight: 400 !important;
}
</style>
