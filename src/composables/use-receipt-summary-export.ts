import jsPDF from 'jspdf';
import { autoTable, type CellHookData } from 'jspdf-autotable';
import SarabunFontUrl from 'src/assets/fonts/THSarabunPSK.ttf';
import * as XLSX from 'xlsx';
import type { ReceiptSummaryItem } from 'src/types/receipt-summary-report';

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

export function useReceiptSummaryExport() {
  async function exportToPdf(
    rows: ReceiptSummaryItem[],
    reportTitle: string,
    facultyLabel: string,
    scopeLabel: string,
  ): Promise<void> {
    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });

    const base64Font = await loadSarabunFont();
    doc.addFileToVFS('THSarabunPSK.ttf', base64Font);
    doc.addFont('THSarabunPSK.ttf', 'Sarabun', 'normal');
    doc.setFont('Sarabun');
    doc.setFontSize(13);

    const pageWidth = doc.internal.pageSize.getWidth();
    doc.text(reportTitle, pageWidth / 2, 35, { align: 'center' });
    doc.text(`${facultyLabel}: ${scopeLabel}`, pageWidth / 2, 50, { align: 'center' });

    const tableRows = rows.map((row) => [
      row.no,
      row.faculty,
      row.receiptNo,
      row.customerName,
      row.amount,
      row.effectiveDate,
      row.learnerName,
      row.courseName,
      row.collector,
      row.status === 'ยกเลิก' ? `ยกเลิก\n${row.cancelBy ?? ''}\n${row.cancelDate ?? ''}` : 'ใช้งาน',
    ]);

    autoTable(doc, {
      startY: 65,
      rowPageBreak: 'avoid',
      showHead: 'everyPage',
      head: [
        [
          'ลำดับ',
          'ส่วนงาน',
          'เลขที่ใบเสร็จรับเงิน',
          'ชื่อ-สกุล ผู้ชำระเงิน\n(Customer Name)',
          'จำนวนเงิน',
          'วันที่ชำระเงิน\n(effective date)',
          'ชื่อ-สกุล ผู้เรียน',
          'ชื่อโครงการ/อบรม/\nหลักสูตร',
          'ผู้รับเงิน (Collector)\nวันที่ใบเสร็จรับเงิน',
          'สถานะ',
        ],
      ],
      body: tableRows,
      styles: {
        font: 'Sarabun',
        fontSize: 7,
        cellPadding: 3,
        valign: 'top',
        lineColor: [180, 180, 180],
        lineWidth: 0.5,
        overflow: 'linebreak',
      },
      headStyles: {
        font: 'Sarabun',
        fillColor: [226, 232, 240],
        textColor: [51, 65, 85],
        fontStyle: 'normal',
        fontSize: 7,
        halign: 'center',
        valign: 'middle',
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 24 },
        1: { cellWidth: 80 },
        2: { halign: 'center', cellWidth: 75 },
        3: { cellWidth: 90 },
        4: { halign: 'center', cellWidth: 48 },
        5: { halign: 'center', cellWidth: 68 },
        6: { cellWidth: 90 },
        7: { cellWidth: 130 },
        8: { halign: 'center', cellWidth: 100 },
        9: { halign: 'center', cellWidth: 75 },
      },
      alternateRowStyles: { fillColor: [255, 255, 255] },
      didParseCell(data: CellHookData) {
        if (data.section === 'body' && data.column.index === 9) {
          const val = typeof data.cell.raw === 'string' ? data.cell.raw : '';
          if (val.startsWith('ยกเลิก')) {
            data.cell.styles.textColor = [220, 38, 38];
          }
        }
      },
      margin: { top: 20, left: 15, right: 15 },
      tableWidth: 'auto',
    });

    doc.save('central-finance-receipt-summary.pdf');
  }

  function exportToExcel(rows: ReceiptSummaryItem[], reportTitle: string): void {
    const header = [
      'ลำดับ',
      'ส่วนงาน',
      'เลขที่ใบเสร็จรับเงิน',
      'ชื่อ-สกุล ผู้ชำระเงิน (Customer Name)',
      'จำนวนเงิน',
      'วันที่ชำระเงิน (effective date)',
      'ชื่อ-สกุล ผู้เรียน',
      'ชื่อโครงการ/อบรม/หลักสูตร',
      'ผู้รับเงิน (Collector) วันที่ใบเสร็จรับเงิน',
      'สถานะ',
    ];

    const excelRows = rows.map((row) => [
      row.no,
      row.faculty,
      row.receiptNo,
      row.customerName,
      row.amount,
      row.effectiveDate.replace('\n', ' '),
      row.learnerName,
      row.courseName.replace(/\n/g, ' '),
      row.collector.replace('\n', ' '),
      row.status === 'ยกเลิก'
        ? `ยกเลิก ${row.cancelBy ?? ''} ${(row.cancelDate ?? '').replace('\n', ' ')}`
        : 'ใช้งาน',
    ]);

    const wsData = [[reportTitle], [], header, ...excelRows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 9 } }];
    ws['!cols'] = [
      { wch: 7 },
      { wch: 22 },
      { wch: 18 },
      { wch: 25 },
      { wch: 12 },
      { wch: 22 },
      { wch: 25 },
      { wch: 40 },
      { wch: 30 },
      { wch: 30 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'รายงาน');
    XLSX.writeFile(wb, 'central-finance-receipt-summary.xlsx');
  }

  return { exportToPdf, exportToExcel };
}
