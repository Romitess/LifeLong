<template>
  <q-dialog
    v-model="dialogModel"
    class="admin-dialog"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card class="registration-export-dialog">
      <q-card-section class="registration-export-dialog__header">
        <div class="registration-export-dialog__icon-wrap">
          <q-icon name="download" size="32px" color="primary" />
        </div>
        <div class="registration-export-dialog__heading">
          <p class="registration-export-dialog__eyebrow">Export Report</p>
          <h2>ส่งออกสถิติการลงทะเบียน</h2>
          <p class="registration-export-dialog__subtitle">เลือกตัวกรองและรูปแบบไฟล์ที่ต้องการ</p>
        </div>
      </q-card-section>

      <q-card-section class="registration-export-dialog__body">
        <div
          class="registration-export-dialog__section-label registration-export-dialog__section-label--top"
        >
          รูปแบบไฟล์
        </div>

        <div class="registration-export-dialog__format-row">
          <label
            v-for="fmt in formatOptions"
            :key="fmt.value"
            :class="[
              'registration-export-dialog__format-card',
              { 'registration-export-dialog__format-card--active': localFormat === fmt.value },
            ]"
            @click="localFormat = fmt.value"
          >
            <q-radio
              v-model="localFormat"
              :val="fmt.value"
              color="primary"
              class="registration-export-dialog__format-radio"
            />
            <div class="registration-export-dialog__format-info">
              <span class="registration-export-dialog__format-name">{{ fmt.label }}</span>
              <span class="registration-export-dialog__format-desc">{{ fmt.description }}</span>
            </div>
            <q-icon :name="fmt.icon" size="22px" class="registration-export-dialog__format-icon" />
          </label>
        </div>
      </q-card-section>

      <q-card-actions class="registration-export-dialog__actions">
        <AppActionButton
          variant="secondary"
          label="ยกเลิก"
          no-caps
          :disable="isExporting"
          @click="onCancel"
        />
        <AppActionButton
          variant="primary"
          :label="isExporting ? 'กำลังส่งออก...' : 'ส่งออกไฟล์'"
          icon="download"
          no-caps
          :loading="isExporting"
          @click="onExport"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import ExcelJS from 'exceljs';
import { api } from 'src/boot/axios';
import AppActionButton from 'components/admin/AppActionButton.vue';
import type { DateRangeValue } from 'components/base/BaseDateRangeFilter.vue';
import type { AdminRegistrationStatisticsReportFilterOption } from 'src/types/admin-registration-statistics-report';

type ExportFormat = 'xlsx' | 'csv';

interface ExportGroup {
  facultyId: number;
  facultyName: string;
  totalCourses: number;
  totalLearners: number;
  totalRegistrationFees: number;
  items: ExportItem[];
}

interface ExportItem {
  rowNumber: number;
  courseId: number;
  courseCode: string | null;
  courseName: string;
  responsibleName: string | null;
  startDate: string | null;
  endDate: string | null;
  learnerCount: number;
  unitPrice: number;
  registrationFee: number;
}

interface ExportResponse {
  generatedAt: string;
  summary: {
    totalCourses: number;
    totalLearners: number;
    totalRegistrationFees: number;
  };
  totalRows: number;
  groups: ExportGroup[];
}

interface Props {
  modelValue: boolean;
  dateRange: DateRangeValue;
  facultyId: number | null;
  typeCourseId: number | null;
  facultyOptions: AdminRegistrationStatisticsReportFilterOption[];
  courseTypeOptions: AdminRegistrationStatisticsReportFilterOption[];
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
}>();

const dialogModel = computed<boolean>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const localDateRange = ref<DateRangeValue>({ start: null, end: null });
const localFacultyId = ref<number | null>(null);
const localTypeCourseId = ref<number | null>(null);
const localFormat = ref<ExportFormat>('xlsx');
const isExporting = ref(false);

const formatOptions: { value: ExportFormat; label: string; description: string; icon: string }[] = [
  {
    value: 'xlsx',
    label: 'Excel (.xlsx)',
    description: 'เหมาะสำหรับเปิดใน Microsoft Excel',
    icon: 'table_chart',
  },
  {
    value: 'csv',
    label: 'CSV (.csv)',
    description: 'ไฟล์ข้อความ รองรับทุกโปรแกรม',
    icon: 'description',
  },
];

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      localDateRange.value = { ...props.dateRange };
      localFacultyId.value = props.facultyId;
      localTypeCourseId.value = props.typeCourseId;
      localFormat.value = 'xlsx';
    }
  },
);

function normalizeDateForApi(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;
  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

function formatDate(value: string | null): string {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('th-TH', { dateStyle: 'medium' }).format(date);
}

function formatDateRange(startDate: string | null, endDate: string | null): string {
  if (!startDate && !endDate) return '-';
  if (startDate && endDate) return `${formatDate(startDate)} - ${formatDate(endDate)}`;
  return startDate ? `เริ่ม ${formatDate(startDate)}` : `สิ้นสุด ${formatDate(endDate)}`;
}

async function buildXlsx(data: ExportResponse): Promise<Blob> {
  const wb = new ExcelJS.Workbook();
  const ws = wb.addWorksheet('สถิติการลงทะเบียน', {
    views: [{ showGridLines: false }],
  });

  const COLS = 6;
  const FONT = 'TH SarabunPSK';

  ws.columns = [
    { width: 8 },
    { width: 44 },
    { width: 32 },
    { width: 28 },
    { width: 14 },
    { width: 20 },
  ];

  const THIN: Partial<ExcelJS.Border> = { style: 'thin', color: { argb: 'FFD1D5DB' } };
  const MEDIUM: Partial<ExcelJS.Border> = { style: 'medium', color: { argb: 'FF374151' } };

  function font(bold = false, size = 14): Partial<ExcelJS.Font> {
    return { name: FONT, size, bold };
  }

  function setCell(
    row: ExcelJS.Row,
    col: number,
    value: ExcelJS.CellValue,
    opts: {
      bold?: boolean;
      size?: number;
      align?: ExcelJS.Alignment['horizontal'];
      wrap?: boolean;
    } = {},
  ): void {
    const cell = row.getCell(col);
    cell.value = value;
    cell.font = font(opts.bold ?? false, opts.size ?? 14);
    cell.alignment = {
      horizontal: opts.align ?? 'left',
      vertical: 'middle',
      wrapText: opts.wrap ?? false,
    };
  }

  function applyBorders(
    row: ExcelJS.Row,
    opts: {
      bottom?: Partial<ExcelJS.Border>;
      top?: Partial<ExcelJS.Border>;
      outerFrame?: boolean;
    },
  ): void {
    for (let c = 1; c <= COLS; c++) {
      const cell = row.getCell(c);
      const b: Partial<ExcelJS.Borders> = { ...cell.border };
      if (opts.bottom) b.bottom = opts.bottom;
      if (opts.top) b.top = opts.top;
      if (opts.outerFrame) {
        if (c === 1) b.left = MEDIUM;
        if (c === COLS) b.right = MEDIUM;
      }
      cell.border = b;
    }
  }

  // ── Column headers ───────────────────────────────────────────────
  const hdr = ws.addRow([
    'ลำดับ',
    'ชื่อรายวิชา',
    'ผู้รับผิดชอบรายวิชา',
    'วันที่เปิด-ปิดการเรียนการสอน',
    'จำนวนผู้เรียน',
    'ค่าลงทะเบียนรวม (บาท)',
  ]);
  hdr.height = 24;
  hdr.eachCell((cell, col) => {
    cell.font = font(true, 14);
    cell.alignment = {
      horizontal: col >= 5 ? 'right' : col === 1 ? 'center' : 'left',
      vertical: 'middle',
    };
  });
  applyBorders(hdr, { top: MEDIUM, bottom: MEDIUM, outerFrame: true });

  // ── Data rows ────────────────────────────────────────────────────
  for (const group of data.groups) {
    // Faculty row — merged, bold, medium bottom border
    const facRow = ws.addRow([]);
    ws.mergeCells(facRow.number, 1, facRow.number, COLS);
    setCell(facRow, 1, group.facultyName, { bold: true, size: 14 });
    facRow.height = 22;
    applyBorders(facRow, { bottom: MEDIUM, outerFrame: true });

    for (const item of group.items) {
      const courseLabel = item.courseCode
        ? `${item.courseCode} : ${item.courseName}`
        : item.courseName;

      const dr = ws.addRow([]);
      setCell(dr, 1, item.rowNumber, { align: 'center' });
      setCell(dr, 2, courseLabel, { wrap: true });
      setCell(dr, 3, item.responsibleName ?? '-', { wrap: true });
      setCell(dr, 4, formatDateRange(item.startDate, item.endDate));
      setCell(dr, 5, item.learnerCount, { align: 'right' });
      setCell(dr, 6, item.registrationFee, { align: 'right' });
      dr.height = 20;
      applyBorders(dr, { bottom: THIN, outerFrame: true });
    }

    // Subtotal row — "รวม" merged cols 1-4, numbers in 5-6
    const sub = ws.addRow([]);
    ws.mergeCells(sub.number, 1, sub.number, 4);
    setCell(sub, 1, 'รวม', { bold: true });
    setCell(sub, 5, group.totalLearners, { bold: true, align: 'right' });
    setCell(sub, 6, group.totalRegistrationFees, { bold: true, align: 'right' });
    sub.height = 20;
    applyBorders(sub, { bottom: MEDIUM, outerFrame: true });
  }

  // ── Grand total ──────────────────────────────────────────────────
  const grand = ws.addRow([]);
  ws.mergeCells(grand.number, 1, grand.number, 4);
  setCell(grand, 1, 'รวมทั้งหมด', { bold: true, size: 14 });
  setCell(grand, 5, data.summary.totalLearners, { bold: true, size: 14, align: 'right' });
  setCell(grand, 6, data.summary.totalRegistrationFees, { bold: true, size: 14, align: 'right' });
  grand.height = 24;
  applyBorders(grand, { bottom: MEDIUM, outerFrame: true });

  // ── Number format ────────────────────────────────────────────────
  ws.eachRow((row) => {
    [5, 6].forEach((col) => {
      const cell = row.getCell(col);
      if (typeof cell.value === 'number') cell.numFmt = '#,##0';
    });
  });

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
}

function buildCsv(data: ExportResponse): Blob {
  const rows: string[][] = [];

  rows.push([
    'ลำดับ',
    'ชื่อรายวิชา',
    'รหัสวิชา',
    'คณะ/ส่วนงาน',
    'ผู้รับผิดชอบรายวิชา',
    'วันที่เปิด-ปิดการเรียนการสอน',
    'จำนวนผู้เรียน (คน)',
    'ค่าลงทะเบียนรวม (บาท)',
  ]);

  for (const group of data.groups) {
    for (const item of group.items) {
      rows.push([
        String(item.rowNumber),
        item.courseName,
        item.courseCode ?? '',
        group.facultyName,
        item.responsibleName ?? '-',
        formatDateRange(item.startDate, item.endDate),
        String(item.learnerCount),
        String(item.registrationFee),
      ]);
    }
  }

  const csvContent = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    .join('\r\n');

  return new Blob(['﻿' + csvContent], { type: 'text/csv;charset=utf-8;' });
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

async function onExport(): Promise<void> {
  isExporting.value = true;

  try {
    const { data } = await api.get<ExportResponse>(
      '/api/admin/reports/registration-statistics/export',
      {
        params: {
          startDate: normalizeDateForApi(localDateRange.value.start) || undefined,
          endDate: normalizeDateForApi(localDateRange.value.end) || undefined,
          facultyId: localFacultyId.value ?? undefined,
          typeCourseId: localTypeCourseId.value ?? undefined,
        },
      },
    );

    const datePart = new Date().toISOString().slice(0, 10);
    const filename = `registration-statistics-${datePart}`;

    if (localFormat.value === 'xlsx') {
      downloadBlob(await buildXlsx(data), `${filename}.xlsx`);
    } else {
      downloadBlob(buildCsv(data), `${filename}.csv`);
    }

    dialogModel.value = false;
  } finally {
    isExporting.value = false;
  }
}

function onCancel(): void {
  dialogModel.value = false;
}
</script>

<style lang="scss" scoped>
.registration-export-dialog {
  width: min(560px, calc(100vw - 32px));
  overflow: hidden;
  border-radius: 20px;
  background: #ffffff;
  box-shadow: 0 28px 64px rgba(15, 23, 42, 0.24);
}

.registration-export-dialog__header {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  gap: 16px;
  padding: 24px 24px 8px;
  align-items: flex-start;
}

.registration-export-dialog__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 16px;
  background: rgba(245, 166, 35, 0.14);
}

.registration-export-dialog__eyebrow {
  margin: 0 0 4px;
  color: #b7791f;
  font-size: 0.72rem;
  font-weight: 950;
  letter-spacing: 0.13em;
  text-transform: uppercase;
}

.registration-export-dialog__heading {
  min-width: 0;

  h2 {
    margin: 0;
    color: #10223c;
    font-size: 1.2rem;
    font-weight: 900;
    line-height: 1.3;
  }
}

.registration-export-dialog__subtitle {
  margin: 4px 0 0;
  color: #64748b;
  font-size: 0.88rem;
  line-height: 1.5;
}

.registration-export-dialog__body {
  padding: 16px 24px 8px;
  display: grid;
  gap: 12px;
}

.registration-export-dialog__section-label {
  color: #475467;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.04em;
  text-transform: uppercase;

  &--top {
    margin-top: 6px;
  }
}

.registration-export-dialog__filters {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.registration-export-dialog__date-filter {
  grid-column: span 2;
}

.registration-export-dialog__field {
  display: grid;
  gap: 6px;
  align-content: start;
  min-width: 0;
}

.registration-export-dialog__field-label {
  color: #6b7280;
  font-size: 0.78rem;
  font-weight: 600;
}

.registration-export-dialog__select {
  min-width: 0;
  width: 100%;
  :deep(.q-field__bottom) {
    min-height: 22px;
    padding-top: 4px;
  }

  :deep(.q-field__control) {
    overflow: hidden;
  }

  :deep(.q-field__native) {
    flex-wrap: nowrap !important;
    overflow: hidden;

    > span {
      min-width: 0;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}

.registration-export-dialog__format-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.registration-export-dialog__format-card {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 14px 14px 10px;
  border-radius: 14px;
  border: 1.5px solid rgba(15, 23, 42, 0.1);
  background: #f8fafc;
  cursor: pointer;
  transition:
    border-color 0.18s ease,
    background 0.18s ease;

  &--active {
    border-color: $primary;
    background: rgba(245, 166, 35, 0.07);
  }

  &:hover:not(.registration-export-dialog__format-card--active) {
    border-color: rgba(245, 166, 35, 0.4);
    background: rgba(245, 166, 35, 0.04);
  }
}

.registration-export-dialog__format-info {
  display: grid;
  gap: 2px;
  flex: 1;
  min-width: 0;
}

.registration-export-dialog__format-name {
  color: #10223c;
  font-size: 0.88rem;
  font-weight: 800;
}

.registration-export-dialog__format-desc {
  color: #64748b;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1.4;
}

.registration-export-dialog__format-icon {
  color: #94a3b8;
  flex-shrink: 0;
}

.registration-export-dialog__format-card--active .registration-export-dialog__format-icon {
  color: $primary;
}

.registration-export-dialog__format-radio {
  padding: 0;
}

.registration-export-dialog__actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  padding: 16px 24px 24px;
}

.registration-export-dialog__actions > * {
  width: 100%;
}

@media (max-width: 560px) {
  .registration-export-dialog__header {
    grid-template-columns: 1fr;
  }

  .registration-export-dialog__icon-wrap {
    width: 52px;
    height: 52px;
  }

  .registration-export-dialog__filters {
    grid-template-columns: 1fr;
  }

  .registration-export-dialog__date-filter {
    grid-column: span 1;
  }

  .registration-export-dialog__format-row {
    grid-template-columns: 1fr;
  }

  .registration-export-dialog__actions {
    grid-template-columns: 1fr;
  }
}
</style>
