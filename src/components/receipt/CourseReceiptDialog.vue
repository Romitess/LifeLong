<template>
  <q-dialog
    v-model="dialogModel"
    transition-show="scale"
    transition-hide="scale"
    @hide="emit('hide')"
  >
    <q-card
      class="receipt-card column no-wrap bg-white"
      style="width: 850px; max-width: 95vw; max-height: 90vh"
    >
      <q-card-section
        class="q-pa-lg col scroll text-black font-sarabun relative-position"
        id="printable-area"
      >
        <!-- Background Watermark -->
        <div class="watermark-bg" :style="{ backgroundImage: `url(${buuLogoSvg})` }"></div>

        <!-- Header -->
        <div class="row justify-between items-start relative-position" style="margin-bottom: 10px">
          <div class="row items-start" style="gap: 10px">
            <img :src="buuLogoSvg" class="receipt-logo" alt="BUU logo" />
            <div class="column" style="margin-top: 0">
              <div style="font-size: 16px; font-weight: 700; line-height: 1.3">
                มหาวิทยาลัยบูรพา BURAPHA UNIVERSITY
              </div>
              <div style="font-size: 13px; line-height: 1.3">
                169 ถนนลงหาดบางแสน ตำบลแสนสุข อำเภอเมือง จังหวัดชลบุรี 20131
              </div>
              <div style="font-size: 13px; line-height: 1.3">
                169 Longhard Bangsaen Road, Saensuk, Mueang, Chonburi 20131
              </div>
              <div style="font-size: 13px; line-height: 1.3">
                เลขประจำตัวผู้เสียภาษีอากร (Tax ID) 0994000249357
              </div>
            </div>
          </div>
          <div class="column items-end" style="margin-top: 0">
            <div style="font-size: 16px; font-weight: 700; line-height: 1.3">
              สำเนาใบเสร็จรับเงิน
            </div>
            <div style="font-size: 16px; font-weight: 700; line-height: 1.3">RECEIPT COPY</div>
            <div style="font-size: 13px; margin-top: 10px">วันที่ (Date) {{ thaiPrintDate }}</div>
          </div>
        </div>

        <!-- Customer Info -->
        <div class="relative-position" style="font-size: 14px; margin-bottom: 6px">
          <div class="row" style="margin-bottom: 2px">
            <div style="width: 280px; flex-shrink: 0">เลขที่ใบเสร็จรับเงิน (Receipt No.)</div>
            <div>{{ receiptId }}</div>
          </div>
          <div class="row" style="margin-bottom: 2px">
            <div style="width: 280px; flex-shrink: 0">ได้รับเงินจาก (Received from)</div>
            <div>{{ customerName || '-' }}</div>
          </div>
          <div class="row" style="margin-bottom: 2px">
            <div style="width: 280px; flex-shrink: 0">เลขประจำตัวผู้เสียภาษีอากร (Tax ID)</div>
            <div>{{ customerTaxId || '-' }}</div>
          </div>
          <div class="row" style="margin-bottom: 2px">
            <div style="width: 280px; flex-shrink: 0">
              ที่อยู่สำหรับออกใบเสร็จรับเงิน (Billing Address)
            </div>
            <div>{{ customerAddress || '-' }}</div>
          </div>
        </div>

        <!-- Table -->
        <div
          class="receipt-table-wrapper relative-position overflow-hidden"
          style="margin-bottom: 8px"
        >
          <table class="receipt-table w-full relative-position" style="z-index: 1; font-size: 14px">
            <thead>
              <tr>
                <th style="width: 12%" class="text-center">ลำดับที่<br />(No.)</th>
                <th style="width: 63%" class="text-center">รายการ<br />(Description)</th>
                <th style="width: 25%" class="text-center">จำนวนเงิน/บาท<br />(Amount/Baht)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td
                  class="text-center"
                  style="height: 150px; vertical-align: top; padding-top: 8px"
                >
                  1
                </td>
                <td style="vertical-align: top; padding-top: 8px; padding-left: 12px">
                  ค่าธรรมเนียมในการอบรมรายวิชา {{ courseCode ? courseCode + ' : ' : ''
                  }}{{ courseTitle }}
                </td>
                <td class="text-right" style="vertical-align: top; padding-top: 8px">
                  {{ amountLabel }}
                </td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" class="text-left text-weight-medium" style="padding-left: 12px">
                  รวมเงิน (Total) {{ bahtTextValue }}
                </td>
                <td class="text-right text-weight-medium">{{ amountLabel }}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        <!-- Bottom Layout -->
        <div class="row justify-between items-stretch relative-position">
          <!-- Left Column -->
          <div class="col-12 col-md-7 column justify-between">
            <div style="font-size: 11px; line-height: 1.5">
              <div>URL ตรวจสอบใบเสร็จอิเล็กทรอนิกส์/E-receipt verification URL</div>
              <div style="margin-bottom: 2px">
                <a
                  href="https://e-sign.buu.ac.th/verify"
                  target="_blank"
                  class="text-black"
                  style="text-decoration: none"
                  >https://e-sign.buu.ac.th/verify</a
                >
              </div>
              <div style="font-weight: 600">หมายเหตุ :</div>
              <div style="padding-left: 14px">
                <div>
                  1.ใบเสร็จรับเงินนี้ได้ดำเนินการด้วยวิธีการทางอิเล็กทรอนิกส์
                  และผู้ชำระเงินสามารถสแกน QR Code นี้เพื่อตรวจสอบความถูกต้อง/
                </div>
                <div style="padding-left: 8px; margin-bottom: 1px">
                  This receipt was processed electronically, and the person making the payment can
                  scan this QR Code to check its correctness.
                </div>
                <div>
                  2. ใบเสร็จรับเงินฉบับนี้จะสมบูรณ์เมื่อได้รับชำระเงินเรียบร้อยแล้ว
                  และมีลายมือชื่อของผู้รับเงินครบถ้วน/
                </div>
                <div style="padding-left: 8px">
                  This receipt will be considered finalized once we have received full payment and
                  the payee's signature is complete.
                </div>
              </div>
            </div>
            <div style="font-size: 11px; color: #444; margin-top: 6px">
              <div>Digitally signed by BUU</div>
              <div>Date: {{ shortThaiDate }}</div>
            </div>
          </div>

          <!-- Right Column -->
          <div class="col-12 col-md-5 column items-end">
            <div class="column items-center" style="margin-top: 2px">
              <div style="font-size: 14px; margin-bottom: 2px; min-height: 22px"></div>
              <div style="width: 160px; border-bottom: 1px solid #666; margin-bottom: 4px"></div>
              <div style="font-size: 13px; font-weight: 500">( นางสาวณัฐพงศ์ ไม่อยู่ )</div>
              <div style="font-size: 12px; color: #444">ผู้รับเงิน (Collector)</div>
            </div>
            <img
              :src="receiptQrCode"
              style="width: 80px; height: 80px; margin-top: 8px"
              alt="QR Code"
            />
          </div>
        </div>
      </q-card-section>

      <q-card-actions
        align="center"
        class="q-pa-md bg-grey-1 border-top"
        style="border-top: 1px solid #eee"
      >
        <q-btn
          flat
          :label="t('receipt.close')"
          color="grey-7"
          padding="8px 24px"
          no-caps
          @click="closeReceipt"
        />
        <q-btn
          unelevated
          icon="print"
          :label="t('receipt.print')"
          color="primary"
          padding="8px 24px"
          no-caps
          @click="printReceipt"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import buuLogoSvg from 'src/assets/logo-1.svg';
import receiptQrCode from 'src/assets/reciept-qrcode.png';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface Props {
  modelValue: boolean;
  receiptId: string;
  issuedAt?: Date | string | number | null;
  customerName?: string;
  customerTaxId?: string;
  customerAddress?: string;
  showCustomer?: boolean;
  courseTitle: string;
  courseCode?: string;
  amount?: number;
  logoSize?: string;
  logoSpacingClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  issuedAt: null,
  customerName: '',
  customerTaxId: '-',
  customerAddress: '-',
  showCustomer: true,
  courseCode: '',
  amount: 0,
  logoSize: '60px',
  logoSpacingClass: 'q-mr-md',
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'hide'): void;
}>();

const { t } = useI18n();

const dialogModel = computed<boolean>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const amountLabel = computed<string>(() => {
  return `${(props.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
});

const bahtTextValue = computed<string>(() => {
  return getBahtText(props.amount ?? 0);
});

function getBahtText(number: number): string {
  if (number === 0) return 'ศูนย์บาทถ้วน';
  const numbers = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const positions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];

  const numStr = number.toFixed(2);
  const [baht, satang] = numStr.split('.');
  if (!baht || !satang) return '';

  function readNumber(nStr: string): string {
    let result = '';
    const len = nStr.length;
    for (let i = 0; i < len; i++) {
      const digit = parseInt(nStr.charAt(i));
      const pos = len - i - 1;
      if (digit !== 0) {
        if (pos === 0 && digit === 1 && len > 1 && nStr !== '01') {
          result += 'เอ็ด';
        } else if (pos === 1 && digit === 2) {
          result += 'ยี่สิบ';
        } else if (pos === 1 && digit === 1) {
          result += 'สิบ';
        } else {
          result += (numbers[digit] ?? '') + (positions[pos] ?? '');
        }
      }
    }
    return result;
  }

  let text = '';
  if (parseInt(baht) > 0) {
    text += readNumber(baht) + 'บาท';
  }
  if (parseInt(satang) > 0) {
    text += readNumber(satang) + 'สตางค์';
  } else {
    text += 'ถ้วน';
  }

  return text;
}

function normalizeDate(input: Date | string | number | null | undefined): Date | null {
  if (!input) {
    return null;
  }
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

const thaiPrintDate = computed<string>(() => {
  const date = normalizeDate(props.issuedAt) || new Date();
  const thaiMonths = [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ];
  const d = date.getDate();
  const m = thaiMonths[date.getMonth()];
  const y = date.getFullYear() + 543;
  return `${d} ${m} พ.ศ. ${y}`;
});

const shortThaiDate = computed<string>(() => {
  const date = normalizeDate(props.issuedAt) || new Date();
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  const y = (date.getFullYear() + 543).toString();
  return `${d}/${m}/${y}`;
});

function closeReceipt(): void {
  dialogModel.value = false;
}

function escapeHtml(value: string): string {
  if (!value) return '';
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function printReceipt(): void {
  if (typeof window === 'undefined') {
    return;
  }

  const printWindow = window.open('', '_blank', 'width=900,height=1200');
  if (!printWindow) {
    return;
  }

  const printableReceiptId = escapeHtml(props.receiptId);
  const printableTitle = escapeHtml(props.courseTitle);
  const printableCode = escapeHtml(props.courseCode || '');
  const printablePrice = escapeHtml(amountLabel.value);
  const printableCustomerName = escapeHtml(props.customerName || '-');
  const printableCustomerTaxId = escapeHtml(props.customerTaxId || '-');
  const printableCustomerAddress = escapeHtml(props.customerAddress || '-');
  const printableBahtText = escapeHtml(bahtTextValue.value);
  const logoUrl = buuLogoSvg;

  printWindow.document.write(`<!doctype html>
<html lang="th">
  <head>
    <meta charset="utf-8" />
    <title>Receipt ${printableReceiptId}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      body {
        font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
        font-size: 13px;
        color: #000;
        background: #fff;
      }
      .page {
        width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        padding: 14mm 18mm 12mm;
        display: flex;
        flex-direction: column;
      }
      /* Header */
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
      .header-left { display: flex; gap: 10px; align-items: flex-start; }
      .logo { width: 52px; height: 52px; object-fit: contain; }
      .uni-info { display: flex; flex-direction: column; gap: 1px; }
      .uni-name { font-size: 14px; font-weight: 700; line-height: 1.3; }
      .uni-addr { font-size: 10.5px; line-height: 1.4; color: #222; }
      .header-right { text-align: right; }
      .receipt-title { font-size: 15px; font-weight: 700; line-height: 1.3; }
      .receipt-date { font-size: 11.5px; margin-top: 10px; }
      /* Customer Info */
      .customer-section { margin: 8px 0 10px; }
      .info-row { display: flex; margin-bottom: 4px; font-size: 12px; }
      .info-label { width: 250px; flex-shrink: 0; }
      /* Table */
      .receipt-table { width: 100%; border-collapse: collapse; flex: 1; }
      .receipt-table th, .receipt-table td { border: 1px solid #000; padding: 5px 8px; font-size: 12px; }
      .receipt-table th { text-align: center; font-weight: 400; background: #fff; }
      .receipt-table .col-no { width: 12%; text-align: center; }
      .receipt-table .col-desc { width: 63%; }
      .receipt-table .col-amount { width: 25%; text-align: right; }
      .receipt-table .body-no { text-align: center; vertical-align: top; padding-top: 10px; height: 340px; }
      .receipt-table .body-desc { vertical-align: top; padding-top: 10px; position: relative; }
      .receipt-table .body-amount { text-align: right; vertical-align: top; padding-top: 10px; }
      .receipt-table tfoot td { font-weight: 600; font-size: 12px; }
      /* Watermark inside table cell */
      .watermark-wrap { position: relative; }
      .watermark-img {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 220px; height: 220px;
        object-fit: contain;
        opacity: 0.09;
        pointer-events: none;
      }
      /* Footer */
      .footer { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 10px; gap: 12px; }
      .footer-left { flex: 1; }
      .notes-title { font-size: 10px; margin-bottom: 1px; }
      .notes-url { font-size: 10px; margin-bottom: 3px; }
      .notes-head { font-size: 10px; font-weight: 700; margin-bottom: 2px; }
      .notes-body { font-size: 9.5px; padding-left: 10px; line-height: 1.45; color: #222; }
      .notes-body p { margin-bottom: 2px; }
      .notes-en { color: #555; padding-left: 8px; font-size: 9px; }
      .digitally { font-size: 9px; color: #555; margin-top: 8px; }
      .footer-right { width: 180px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
      .sig-italic { font-style: italic; font-size: 13px; font-family: Georgia, serif; margin-bottom: 1px; }
      .sig-line { width: 160px; border-bottom: 1px solid #555; margin-bottom: 3px; }
      .sig-name { font-size: 11px; font-weight: 600; text-align: center; }
      .sig-title { font-size: 10px; color: #444; text-align: center; }
      .qr-img { width: 76px; height: 76px; margin-top: 4px; }
      @page { size: A4; margin: 0; }
      @media print { body { padding: 0; } }
    </style>
  </head>
  <body>
    <div class="page">
      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <img src="${logoUrl}" class="logo" alt="BUU logo" onerror="this.style.display='none'">
          <div class="uni-info">
            <div class="uni-name">มหาวิทยาลัยบูรพา BURAPHA UNIVERSITY</div>
            <div class="uni-addr">169 ถนนลงหาดบางแสน ตำบลแสนสุข อำเภอเมือง จังหวัดชลบุรี 20131</div>
            <div class="uni-addr">169 Longhard Bangsaen Road, Saensuk, Mueang, Chonburi 20131</div>
            <div class="uni-addr">เลขประจำตัวผู้เสียภาษีอากร (Tax ID) 0994000249357</div>
          </div>
        </div>
        <div class="header-right">
          <div class="receipt-title">สำเนาใบเสร็จรับเงิน</div>
          <div class="receipt-title">RECEIPT COPY</div>
          <div class="receipt-date">วันที่ (Date) ${thaiPrintDate.value}</div>
        </div>
      </div>

      <!-- Customer Info -->
      <div class="customer-section">
        <div class="info-row"><div class="info-label">เลขที่ใบเสร็จรับเงิน (Receipt No.)</div><div>${printableReceiptId}</div></div>
        <div class="info-row"><div class="info-label">ได้รับเงินจาก (Received from)</div><div>${printableCustomerName}</div></div>
        <div class="info-row"><div class="info-label">เลขประจำตัวผู้เสียภาษีอากร (Tax ID)</div><div>${printableCustomerTaxId}</div></div>
        <div class="info-row"><div class="info-label">ที่อยู่ (Address)</div><div>${printableCustomerAddress}</div></div>
      </div>

      <!-- Table -->
      <table class="receipt-table">
        <thead>
          <tr>
            <th class="col-no">ลำดับที่<br>(No.)</th>
            <th class="col-desc">รายการ<br>(Description)</th>
            <th class="col-amount">จำนวนเงิน/บาท<br>(Amount/Baht)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="body-no">1</td>
            <td class="body-desc watermark-wrap">
              <img src="${logoUrl}" class="watermark-img" alt="">
              ค่าธรรมเนียมในการอบรมรายวิชา ${printableCode ? printableCode + ' : ' : ''}${printableTitle}
            </td>
            <td class="body-amount">${printablePrice}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2">รวมเงิน (Total) ${printableBahtText}</td>
            <td class="col-amount">${printablePrice}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-left">
          <div class="notes-title">URL ตรวจสอบใบเสร็จอิเล็กทรอนิกส์/E-receipt verification URL</div>
          <div class="notes-url">https://e-sign.buu.ac.th/verify</div>
          <div class="notes-head">หมายเหตุ :</div>
          <div class="notes-body">
            <p>1.ใบเสร็จรับเงินนี้ได้ดำเนินการด้วยวิธีการทางอิเล็กทรอนิกส์ และผู้ชำระเงินสามารถสแกน QR Code นี้เพื่อตรวจสอบความถูกต้อง/</p>
            <p class="notes-en">This receipt was processed electronically, and the person making the payment can scan this QR Code to check its correctness.</p>
            <p>2. ใบเสร็จรับเงินฉบับนี้จะสมบูรณ์เมื่อได้รับชำระเงินเรียบร้อยแล้ว และมีลายมือชื่อของผู้รับเงินครบถ้วน/</p>
            <p class="notes-en">This receipt will be considered finalized once we have received full payment and the payee's signature is complete.</p>
          </div>
          <div class="digitally">
            <div>Digitally signed by BUU</div>
            <div>Date: ${shortThaiDate.value}</div>
          </div>
        </div>
        <div class="footer-right">
          <div class="sig-italic">Natrue</div>
          <div class="sig-line"></div>
          <div class="sig-name">( นางสาวณัฐพงศ์ ไม่อยู่ )</div>
          <div class="sig-title">ผู้รับเงิน (Collector)</div>
          <img src="${receiptQrCode}" class="qr-img" alt="QR Code">
        </div>
      </div>
    </div>
  </body>
</html>`);
  printWindow.document.close();

  // Wait for resources (font, images) to load before printing
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 1000);
}

function downloadReceiptPdf(): void {
  if (typeof window === 'undefined') return;

  const printableReceiptId = escapeHtml(props.receiptId);
  const printableTitle = escapeHtml(props.courseTitle);
  const printableCode = escapeHtml(props.courseCode || '');
  const printablePrice = escapeHtml(amountLabel.value);
  const printableCustomerName = escapeHtml(props.customerName || '-');
  const printableCustomerTaxId = escapeHtml(props.customerTaxId || '-');
  const printableCustomerAddress = escapeHtml(props.customerAddress || '-');
  const printableBahtText = escapeHtml(bahtTextValue.value);
  const logoUrl = buuLogoSvg;

  const htmlContent = `<!doctype html>
<html lang="th">
  <head>
    <meta charset="utf-8" />
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
        font-size: 13px;
        color: #000;
        background: #fff;
      }
      .page {
        width: 794px;
        height: 1123px;
        margin: 0 auto;
        padding: 53px 68px 45px;
        display: flex;
        flex-direction: column;
        box-sizing: border-box;
      }
      /* Header */
      .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
      .header-left { display: flex; gap: 10px; align-items: flex-start; }
      .logo { width: 52px; height: 52px; object-fit: contain; }
      .uni-info { display: flex; flex-direction: column; gap: 1px; }
      .uni-name { font-size: 14px; font-weight: 700; line-height: 1.3; }
      .uni-addr { font-size: 10.5px; line-height: 1.4; color: #222; }
      .header-right { text-align: right; }
      .receipt-title { font-size: 15px; font-weight: 700; line-height: 1.3; }
      .receipt-date { font-size: 11.5px; margin-top: 10px; }
      /* Customer Info */
      .customer-section { margin: 8px 0 10px; }
      .info-row { display: flex; margin-bottom: 4px; font-size: 12px; }
      .info-label { width: 250px; flex-shrink: 0; }
      /* Table */
      .receipt-table { width: 100%; border-collapse: collapse; flex: 1; }
      .receipt-table th, .receipt-table td { border: 1px solid #000; padding: 5px 8px; font-size: 12px; }
      .receipt-table th { text-align: center; font-weight: 400; background: #fff; }
      .receipt-table .col-no { width: 12%; text-align: center; }
      .receipt-table .col-desc { width: 63%; }
      .receipt-table .col-amount { width: 25%; text-align: right; }
      .receipt-table .body-no { text-align: center; vertical-align: top; padding-top: 10px; height: 340px; }
      .receipt-table .body-desc { vertical-align: top; padding-top: 10px; position: relative; }
      .receipt-table .body-amount { text-align: right; vertical-align: top; padding-top: 10px; }
      .receipt-table tfoot td { font-weight: 600; font-size: 12px; }
      /* Watermark inside table cell */
      .watermark-wrap { position: relative; }
      .watermark-img {
        position: absolute;
        top: 50%; left: 50%;
        transform: translate(-50%, -50%);
        width: 220px; height: 220px;
        object-fit: contain;
        opacity: 0.09;
        pointer-events: none;
      }
      /* Footer */
      .footer { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 10px; gap: 12px; }
      .footer-left { flex: 1; }
      .notes-title { font-size: 10px; margin-bottom: 1px; }
      .notes-url { font-size: 10px; margin-bottom: 3px; }
      .notes-head { font-size: 10px; font-weight: 700; margin-bottom: 2px; }
      .notes-body { font-size: 9.5px; padding-left: 10px; line-height: 1.45; color: #222; }
      .notes-body p { margin-bottom: 2px; }
      .notes-en { color: #555; padding-left: 8px; font-size: 9px; }
      .digitally { font-size: 9px; color: #555; margin-top: 8px; }
      .footer-right { width: 180px; display: flex; flex-direction: column; align-items: center; gap: 6px; }
      .sig-italic { font-style: italic; font-size: 13px; font-family: Georgia, serif; margin-bottom: 1px; }
      .sig-line { width: 160px; border-bottom: 1px solid #555; margin-bottom: 3px; }
      .sig-name { font-size: 11px; font-weight: 600; text-align: center; }
      .sig-title { font-size: 10px; color: #444; text-align: center; }
      .qr-img { width: 76px; height: 76px; margin-top: 4px; }
    </style>
  </head>
  <body>
    <div class="page">
      <!-- Header -->
      <div class="header">
        <div class="header-left">
          <img src="${logoUrl}" class="logo" alt="BUU logo" onerror="this.style.display='none'">
          <div class="uni-info">
            <div class="uni-name">มหาวิทยาลัยบูรพา BURAPHA UNIVERSITY</div>
            <div class="uni-addr">169 ถนนลงหาดบางแสน ตำบลแสนสุข อำเภอเมือง จังหวัดชลบุรี 20131</div>
            <div class="uni-addr">169 Longhard Bangsaen Road, Saensuk, Mueang, Chonburi 20131</div>
            <div class="uni-addr">เลขประจำตัวผู้เสียภาษีอากร (Tax ID) 0994000249357</div>
          </div>
        </div>
        <div class="header-right">
          <div class="receipt-title">สำเนาใบเสร็จรับเงิน</div>
          <div class="receipt-title">RECEIPT COPY</div>
          <div class="receipt-date">วันที่ (Date) ${thaiPrintDate.value}</div>
        </div>
      </div>

      <!-- Customer Info -->
      <div class="customer-section">
        <div class="info-row"><div class="info-label">เลขที่ใบเสร็จรับเงิน (Receipt No.)</div><div>${printableReceiptId}</div></div>
        <div class="info-row"><div class="info-label">ได้รับเงินจาก (Received from)</div><div>${printableCustomerName}</div></div>
        <div class="info-row"><div class="info-label">เลขประจำตัวผู้เสียภาษีอากร (Tax ID)</div><div>${printableCustomerTaxId}</div></div>
        <div class="info-row"><div class="info-label">ที่อยู่ (Address)</div><div>${printableCustomerAddress}</div></div>
      </div>

      <!-- Table -->
      <table class="receipt-table">
        <thead>
          <tr>
            <th class="col-no">ลำดับที่<br>(No.)</th>
            <th class="col-desc">รายการ<br>(Description)</th>
            <th class="col-amount">จำนวนเงิน/บาท<br>(Amount/Baht)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="body-no">1</td>
            <td class="body-desc watermark-wrap">
              <img src="${logoUrl}" class="watermark-img" alt="">
              ค่าธรรมเนียมในการอบรมรายวิชา ${printableCode ? printableCode + ' : ' : ''}${printableTitle}
            </td>
            <td class="body-amount">${printablePrice}</td>
          </tr>
        </tbody>
        <tfoot>
          <tr>
            <td colspan="2">รวมเงิน (Total) ${printableBahtText}</td>
            <td class="col-amount">${printablePrice}</td>
          </tr>
        </tfoot>
      </table>

      <!-- Footer -->
      <div class="footer">
        <div class="footer-left">
          <div class="notes-title">URL ตรวจสอบใบเสร็จอิเล็กทรอนิกส์/E-receipt verification URL</div>
          <div class="notes-url">https://e-sign.buu.ac.th/verify</div>
          <div class="notes-head">หมายเหตุ :</div>
          <div class="notes-body">
            <p>1.ใบเสร็จรับเงินนี้ได้ดำเนินการด้วยวิธีการทางอิเล็กทรอนิกส์ และผู้ชำระเงินสามารถสแกน QR Code นี้เพื่อตรวจสอบความถูกต้อง/</p>
            <p class="notes-en">This receipt was processed electronically, and the person making the payment can scan this QR Code to check its correctness.</p>
            <p>2. ใบเสร็จรับเงินฉบับนี้จะสมบูรณ์เมื่อได้รับชำระเงินเรียบร้อยแล้ว และมีลายมือชื่อของผู้รับเงินครบถ้วน/</p>
            <p class="notes-en">This receipt will be considered finalized once we have received full payment and the payee's signature is complete.</p>
          </div>
          <div class="digitally">
            <div>Digitally signed by BUU</div>
            <div>Date: ${shortThaiDate.value}</div>
          </div>
        </div>
        <div class="footer-right">
          <div class="sig-italic">Natrue</div>
          <div class="sig-line"></div>
          <div class="sig-name">( นางสาวณัฐพงศ์ ไม่อยู่ )</div>
          <div class="sig-title">ผู้รับเงิน (Collector)</div>
          <img src="${receiptQrCode}" class="qr-img" alt="QR Code">
        </div>
      </div>
    </div>
  </body>
</html>`;

  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.left = '-9999px';
  iframe.style.width = '794px';
  iframe.style.height = '1123px';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return;
  }
  iframeDoc.open();
  iframeDoc.write(htmlContent);
  iframeDoc.close();

  setTimeout(() => {
    const body = iframe.contentWindow?.document.body;
    if (!body) {
      document.body.removeChild(iframe);
      return;
    }
    html2canvas(body, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      width: 794,
      height: 1123,
    })
      .then((canvas) => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF('p', 'mm', 'a4');
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);
        pdf.save(`receipt-${props.receiptId || 'download'}.pdf`);
        document.body.removeChild(iframe);
      })
      .catch(() => {
        document.body.removeChild(iframe);
      });
  }, 1500);
}

defineExpose({
  printReceipt,
  downloadReceiptPdf,
});
</script>

<style lang="scss" scoped>
.receipt-card {
  position: relative;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  border-radius: 8px !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

@font-face {
  font-family: 'THSarabunNew';
  src: url('https://cdn.jsdelivr.net/gh/itds-consulting/thai-fonts/fonts/THSarabunNew.ttf')
    format('truetype');
}
@font-face {
  font-family: 'THSarabunNew';
  font-weight: bold;
  src: url('https://cdn.jsdelivr.net/gh/itds-consulting/thai-fonts/fonts/THSarabunNew%20Bold.ttf')
    format('truetype');
}

.font-sarabun {
  font-family:
    'THSarabunNew', 'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', 'Noto Sans Thai', sans-serif;
  font-size: 13px;
}

.receipt-logo {
  width: 60px;
  height: 60px;
  object-fit: contain;
}

.receipt-table-wrapper {
  z-index: 1;
  overflow: hidden;
}

.receipt-table {
  border-collapse: collapse;
}

.receipt-table th,
.receipt-table td {
  border: 1px solid #000;
  padding: 6px 10px;
}

.receipt-table th {
  font-weight: normal;
}

.watermark-bg {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 100%;
  max-width: 350px;
  max-height: 350px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  opacity: 0.04;
  pointer-events: none;
  z-index: 0;
}

.w-full {
  width: 100%;
}
</style>
