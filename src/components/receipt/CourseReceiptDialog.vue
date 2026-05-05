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
            <div style="width: 280px; flex-shrink: 0">ที่อยู่ (Address)</div>
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

  // Use the imported SVG logo
  const logoUrl = buuLogoSvg;

  printWindow.document.write(`<!doctype html>
<html lang="th">
  <head>
    <meta charset="utf-8" />
    <title>Receipt ${printableReceiptId}</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap');
      
      @font-face {
        font-family: 'THSarabunNew';
        src: url('https://cdn.jsdelivr.net/gh/itds-consulting/thai-fonts/fonts/THSarabunNew.ttf') format('truetype');
      }
      @font-face {
        font-family: 'THSarabunNew';
        font-weight: bold;
        src: url('https://cdn.jsdelivr.net/gh/itds-consulting/thai-fonts/fonts/THSarabunNew%20Bold.ttf') format('truetype');
      }
      
      :root {
        color-scheme: light;
      }
      * { 
        box-sizing: border-box; 
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      body {
        margin: 0;
        font-family: 'THSarabunNew', 'TH Sarabun New', 'TH Sarabun PSK', "Sarabun", "Noto Sans Thai", sans-serif;
        color: #000;
        padding: 0;
        font-size: 14px;
        line-height: 1.3;
        background: #fff;
      }
      .receipt-container {
        width: 210mm;
        height: 297mm;
        margin: 0 auto;
        padding: 15mm 20mm;
        display: flex;
        flex-direction: column;
        position: relative;
        box-sizing: border-box;
      }
      .watermark {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 45%;
        height: auto;
        opacity: 0.06;
        z-index: 0;
        pointer-events: none;
        object-fit: contain;
      }
      .content-wrap {
        position: relative;
        z-index: 1;
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      .header-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 18px;
      }
      .header-left {
        display: flex;
        gap: 14px;
      }
      .header-text {
        display: flex;
        flex-direction: column;
        margin-top: 3px;
      }
      .uni-name {
        font-size: 16px;
        font-weight: 700;
        line-height: 1.2;
        margin-bottom: 1px;
      }
      .uni-address {
        font-size: 12px;
        line-height: 1.3;
      }
      .header-right {
        text-align: right;
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        margin-top: 3px;
      }
      .receipt-copy-title {
        font-size: 16px;
        font-weight: 700;
        line-height: 1.2;
      }
      .date-text {
        margin-top: 10px;
        font-size: 13px;
      }
      .info-row {
        display: flex;
        margin-bottom: 3px;
        font-size: 13px;
      }
      .info-label {
        width: 260px;
        color: #000;
      }
      .receipt-table-section {
        flex: 1;
        display: flex;
        flex-direction: column;
      }
      .receipt-table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 15px;
        margin-bottom: 15px;
        font-size: 13px;
        flex: 1;
      }
      .receipt-table th, .receipt-table td {
        border: 1px solid #000;
        padding: 6px 10px;
      }
      .receipt-table th {
        text-align: center;
        font-weight: normal;
      }
      .notes-section {
        font-size: 9px;
        margin-bottom: 0;
        line-height: 1.3;
      }
      .footer-row {
        display: flex;
        justify-content: space-between;
        align-items: flex-end;
      }
      .signature-box {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .sig-line {
        width: 150px;
        border-bottom: 1px solid #999;
        margin-bottom: 5px;
        height: 30px;
      }
      .sig-name {
        font-size: 11px;
        font-weight: 500;
      }
      .sig-title {
        font-size: 9px;
        color: #555;
      }
      .qr-code {
        width: 80px;
        height: 80px;
      }
      @page {
        size: A4;
        margin: 0;
      }
      @media print {
        body {
          padding: 0;
        }
      }
    </style>
  </head>
  <body>
    <div class="receipt-container">
      <img src="${logoUrl}" class="watermark" alt="watermark">
      <div class="content-wrap">
        <div class="header-row">
          <div class="header-left">
            <img src="${logoUrl}" style="width: 65px; height: 65px; object-fit: contain;" onerror="this.style.display='none'">
            <div class="header-text">
              <div class="uni-name">มหาวิทยาลัยบูรพา BURAPHA UNIVERSITY</div>
              <div class="uni-address">169 ถนนลงหาดบางแสน ตำบลแสนสุข อำเภอเมือง จังหวัดชลบุรี 20131</div>
              
              <div class="uni-address">169 Longhard Bangsaen Road, Saensuk, Mueang, Chonburi 20131</div>
              <div class="uni-address">เลขประจำตัวผู้เสียภาษีอากร (Tax ID) 0994000249357</div>
            </div>
          </div>
          <div class="header-right">
            <div class="receipt-copy-title">สำเนาใบเสร็จรับเงิน</div>
            <div class="receipt-copy-title">RECEIPT COPY</div>
            <div class="date-text">วันที่ (Date) ${thaiPrintDate.value}</div>
          </div>
        </div>

        <div style="margin-bottom: 15px;">
          <div class="info-row">
            <div class="info-label">เลขที่ใบเสร็จรับเงิน (Receipt No.)</div>
            <div>${printableReceiptId}</div>
          </div>
          <div class="info-row">
            <div class="info-label">ได้รับเงินจาก (Received from)</div>
            <div>${printableCustomerName}</div>
          </div>
          <div class="info-row">
            <div class="info-label">เลขประจำตัวผู้เสียภาษีอากร (Tax ID)</div>
            <div>${printableCustomerTaxId}</div>
          </div>
          <div class="info-row">
            <div class="info-label">ที่อยู่ (Address)</div>
            <div>${printableCustomerAddress}</div>
          </div>
        </div>

        <div class="receipt-table-section" style="position: relative;">
          <table class="receipt-table" style="position: relative; z-index: 1;">
            <thead>
              <tr>
                <th style="width: 12%;">ลำดับที่<br>(No.)</th>
                <th style="width: 63%;">รายการ<br>(Description)</th>
                <th style="width: 25%;">จำนวนเงิน/บาท<br>(Amount/Baht)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style="text-align: center; vertical-align: top; height: 480px; padding-top: 15px;">1</td>
                <td style="vertical-align: top; padding-top: 15px;">ค่าธรรมเนียมในการอบรมรายวิชา ${printableCode ? printableCode + ' : ' : ''}${printableTitle}</td>
                <td style="text-align: right; vertical-align: top; padding-top: 15px;">${printablePrice}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="font-weight: 500;">รวมเงิน (Total) ${printableBahtText}</td>
                <td style="text-align: right; font-weight: 500;">${printablePrice}</td>
              </tr>
            </tfoot>
          </table>

        <div style="display: flex; justify-content: space-between; align-items: stretch; margin-top: 10px;">
          <!-- Left Column -->
          <div style="display: flex; flex-direction: column; justify-content: space-between; width: 68%; padding-right: 15px;">
            <div class="notes-section">
              <div>URL ตรวจสอบใบเสร็จอิเล็กทรอนิกส์/E-receipt verification URL</div>
              <div style="margin-bottom: 3px;"><a href="https://e-sign.buu.ac.th/verify" style="color: #000; text-decoration: none;">https://e-sign.buu.ac.th/verify</a></div>
              <div style="font-weight: 500;">หมายเหตุ :</div>
              <div style="padding-left: 12px;">
                <div>1.ใบเสร็จรับเงินนี้ได้ดำเนินการด้วยวิธีการทางอิเล็กทรอนิกส์ และผู้ชำระเงินสามารถสแกน QR Code นี้เพื่อตรวจสอบความถูกต้อง/</div>
                <div style="color: #555; padding-left: 8px; margin-bottom: 2px;">This receipt was processed electronically, and the person making the payment can scan this QR Code to check its correctness.</div>
                <div>2. ใบเสร็จรับเงินฉบับนี้จะสมบูรณ์เมื่อได้รับชำระเงินเรียบร้อยแล้ว และมีลายมือชื่อของผู้รับเงินครบถ้วน/</div>
                <div style="color: #555; padding-left: 8px;">This receipt will be considered finalized once we have received full payment and the payee's signature is complete.</div>
              </div>
            </div>

            <div style="font-size: 9px; color: #555; margin-top: 10px;">
              <div>Digitally signed by BUU</div>
              <div>Date: ${shortThaiDate.value}</div>
            </div>
          </div>

          <!-- Right Column -->
          <div style="display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; width: 32%;">
            <div class="signature-box">
              <div class="sig-line"></div>
              <div class="sig-name">( นางสาวณัฐพงศ์ ไม่อยู่ )</div>
              <div class="sig-title">ผู้รับเงิน (Collector)</div>
            </div>
            <img src="${receiptQrCode}" class="qr-code" style="margin-top: 10px;" alt="QR Code" />
          </div>
          </div>
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
  }, 500);
}
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
