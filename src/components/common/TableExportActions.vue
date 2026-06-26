<template>
  <div class="row q-gutter-sm">
    <ReportExportActions v-if="pdfConfig" :pdf-label="pdfLabel" @export-pdf="exportPdf" />
    <q-btn
      v-if="csvConfig"
      outline
      color="positive"
      icon="table_chart"
      :label="csvLabel"
      @click="exportCsv"
      :loading="isExportingCsv"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import jsPDF from 'jspdf';
import { autoTable } from 'jspdf-autotable';
import SarabunFontUrl from 'src/assets/fonts/THSarabunPSK.ttf';
import { Notify } from 'quasar';
import ReportExportActions from 'components/common/ReportExportActions.vue';
import type { PdfExportConfig, CsvExportConfig } from 'src/types/export-types';

const props = withDefaults(
  defineProps<{
    pdfConfig?: PdfExportConfig | null;
    csvConfig?: CsvExportConfig | null;
    pdfLabel?: string;
    csvLabel?: string;
  }>(),
  {
    pdfLabel: 'Export PDF',
    csvLabel: 'Export CSV',
  },
);

const emit = defineEmits<{
  (e: 'exported', type: 'pdf' | 'csv'): void;
}>();

const isExportingPdf = ref(false);
const isExportingCsv = ref(false);

async function exportPdf() {
  if (!props.pdfConfig) return;
  isExportingPdf.value = true;
  try {
    const config = props.pdfConfig;
    const doc = new jsPDF({
      orientation: config.orientation || 'landscape',
      unit: 'pt',
      format: 'a4',
    });

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

    let currentY = config.titleStartY || 35;
    const lineHeight = config.titleLineHeight || 15;

    if (config.titles && config.titles.length > 0) {
      config.titles.forEach((title) => {
        doc.text(title, doc.internal.pageSize.getWidth() / 2, currentY, { align: 'center' });
        currentY += lineHeight;
      });
    }

    const startY = config.startY || (config.titles && config.titles.length > 0 ? currentY + 5 : 40);

    /* eslint-disable @typescript-eslint/no-explicit-any */
    const autoTableConfig: any = {
      startY,
      rowPageBreak: 'avoid',
      showHead: 'everyPage',
      head: config.head,
      body: config.body,
      styles: {
        font: 'Sarabun',
        fontSize: 9,
        cellPadding: 5,
        valign: 'middle',
        lineColor: [180, 180, 180],
        lineWidth: 0.5,
        overflow: 'linebreak',
        ...config.styles,
      },
      headStyles: {
        font: 'Sarabun',
        fillColor: [226, 232, 240],
        textColor: [51, 65, 85],
        fontStyle: 'normal',
        fontSize: 9,
        halign: 'center',
        valign: 'middle',
        ...config.headStyles,
      },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      margin: { top: 20, left: 20, right: 20 },
      tableWidth: 'auto',
    };

    if (config.columnStyles) autoTableConfig.columnStyles = config.columnStyles;
    if (config.didParseCell) autoTableConfig.didParseCell = config.didParseCell;

    autoTable(doc, autoTableConfig);
    /* eslint-enable @typescript-eslint/no-explicit-any */

    doc.save(config.filename.endsWith('.pdf') ? config.filename : `${config.filename}.pdf`);
    emit('exported', 'pdf');
  } catch (error) {
    console.error('Failed to export PDF:', error);
    Notify.create({
      type: 'negative',
      message: 'เกิดข้อผิดพลาดในการส่งออก PDF',
      position: 'top',
    });
  } finally {
    isExportingPdf.value = false;
  }
}

function escapeCsvValue(value: string | number | null): string {
  const text = String(value ?? '');
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function exportCsv() {
  if (!props.csvConfig) return;
  isExportingCsv.value = true;
  try {
    const config = props.csvConfig;
    const csvContent =
      '\uFEFF' +
      [
        config.headers.map(escapeCsvValue).join(','),
        ...config.data.map((row) => row.map(escapeCsvValue).join(',')),
      ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute(
      'download',
      config.filename.endsWith('.csv') ? config.filename : `${config.filename}.csv`,
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    emit('exported', 'csv');
  } catch (error) {
    console.error('Failed to export CSV:', error);
    Notify.create({
      type: 'negative',
      message: 'เกิดข้อผิดพลาดในการส่งออก CSV',
      position: 'top',
    });
  } finally {
    isExportingCsv.value = false;
  }
}
</script>
