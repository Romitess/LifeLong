<template>
  <q-dialog
    v-model="dialogModel"
    transition-show="scale"
    transition-hide="scale"
    @hide="emit('hide')"
  >
    <q-card
      class="receipt-card column no-wrap bg-white"
      style="width: 900px; max-width: 98vw; max-height: 98vh"
    >
      <q-card-section class="q-pa-none col scroll text-black font-sarabun" id="printable-area">
        <div class="receipt-page">
          <!-- HEADER ROW -->
          <div class="receipt-header">
            <div class="header-left">
              <img :src="buuLogoSvg" class="receipt-logo" alt="BUU logo" />
              <div class="uni-info">
                <div class="uni-name">มหาวิทยาลัยบูรพา BURAPHA UNIVERSITY</div>
                <div class="uni-addr">
                  169 ถนนลงหาดบางแสน ตำบลแสนสุข อำเภอเมือง จังหวัดชลบุรี 20131
                </div>
                <div class="uni-addr">
                  169 Longhard Bangsaen Road, Saensuk, Mueang, Chonburi 20131
                </div>
                <div class="uni-addr">เลขที่ประจำตัวผู้เสียภาษีอากร (Tax ID) 0994000249357</div>
              </div>
            </div>
            <div class="header-right">
              <div class="receipt-title">สำเนาใบเสร็จรับเงิน</div>
              <div class="receipt-title">RECEIPT COPY</div>
              <div class="receipt-date">วันที่ (Date) {{ thaiPrintDate }}</div>
            </div>
          </div>

          <!-- CUSTOMER INFO -->
          <div class="customer-section">
            <div class="info-row">
              <div class="info-label">เลขที่ใบเสร็จรับเงิน (Receipt No.)</div>
              <div class="info-value">{{ receiptId }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">ได้รับเงินจาก (Received from)</div>
              <div class="info-value">{{ customerName || '-' }}</div>
            </div>
            <div class="info-row-spacer"></div>
            <div class="info-row">
              <div class="info-label">เลขประจำตัวผู้เสียภาษีอากร (Tax ID)</div>
              <div class="info-value">{{ customerTaxId || '-' }}</div>
            </div>
            <div class="info-row">
              <div class="info-label">ที่อยู่ (Address)</div>
              <div class="info-value">{{ customerAddress || '-' }}</div>
            </div>
          </div>

          <!-- TABLE -->
          <table class="receipt-table">
            <thead>
              <tr>
                <th class="col-no">ลำดับที่<br />(No.)</th>
                <th class="col-desc">รายการ<br />(Description)</th>
                <th class="col-amount">จำนวนเงิน/บาท<br />(Amount/Baht)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td class="body-no">1</td>
                <td class="body-desc">
                  <!-- Watermark inside cell -->
                  <div class="cell-watermark-wrap">
                    <img :src="buuLogoSvg" class="cell-watermark-img" alt="" />
                  </div>
                  <span class="desc-text">
                    ค่าธรรมเนียมในการอบรมรายวิชา {{ courseCode ? courseCode + ' : ' : ''
                    }}{{ courseTitle }}
                  </span>
                </td>
                <td class="body-amount">{{ amountLabel }}</td>
              </tr>
            </tbody>
            <tfoot>
              <tr>
                <td colspan="2" class="tfoot-total">รวมเงิน (Total) {{ bahtTextValue }}</td>
                <td class="tfoot-amount">{{ amountLabel }}</td>
              </tr>
            </tfoot>
          </table>

          <!-- FOOTER -->
          <div class="receipt-footer">
            <!-- Left: Notes -->
            <div class="footer-left">
              <div class="notes-url-label">
                URL ตรวจสอบใบเสร็จอิเล็กทรอนิกส์/E-receipt verification URL
              </div>
              <div class="notes-url">https://e-sign.buu.ac.th/verify</div>
              <div class="notes-head">หมายเหตุ :</div>
              <div class="notes-body">
                <p>
                  1.ใบเสร็จรับเงินนี้ได้ดำเนินการด้วยวิธีการทางอิเล็กทรอนิกส์
                  และผู้ชำระเงินสามารถสแกน QR Code นี้เพื่อตรวจสอบความถูกต้อง/
                </p>
                <p class="notes-en">
                  This receipt was processed electronically, and the person making the payment can
                  scan this QR Code to check its correctness.
                </p>
                <p>
                  2. ใบเสร็จรับเงินฉบับนี้จะสมบูรณ์เมื่อได้รับชำระเงินเรียบร้อยแล้ว
                  และมีลายมือชื่อของผู้รับเงินครบถ้วน/
                </p>
                <p class="notes-en">
                  This receipt will be considered finalized once we have received full payment and
                  the payee's signature is complete.
                </p>
              </div>
              <div class="digitally">
                <div>Digitally signed by BUU</div>
                <div>Date: {{ shortThaiDate }}</div>
              </div>
            </div>

            <!-- Right: Signature + QR -->
            <div class="footer-right">
              <div class="sig-block">
                <div class="sig-italic">test</div>
                <div class="sig-line"></div>
                <div class="sig-name">( นางสาวณัฐพงศ์ ไม่อยู่ )</div>
                <div class="sig-title">ผู้รับเงิน (Collector)</div>
              </div>
              <img :src="receiptQrCode" class="qr-img" alt="QR Code" />
            </div>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pa-md bg-grey-1" style="border-top: 1px solid #eee">
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

const amountLabel = computed<string>(
  () =>
    `${(props.amount ?? 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
);

const bahtTextValue = computed<string>(() => getBahtText(props.amount ?? 0));

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
        if (pos === 0 && digit === 1 && len > 1 && nStr !== '01') result += 'เอ็ด';
        else if (pos === 1 && digit === 2) result += 'ยี่สิบ';
        else if (pos === 1 && digit === 1) result += 'สิบ';
        else result += (numbers[digit] ?? '') + (positions[pos] ?? '');
      }
    }
    return result;
  }

  let text = '';
  if (parseInt(baht) > 0) text += readNumber(baht) + 'บาท';
  if (parseInt(satang) > 0) text += readNumber(satang) + 'สตางค์';
  else text += 'ถ้วน';
  return text;
}

function normalizeDate(input: Date | string | number | null | undefined): Date | null {
  if (!input) return null;
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
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} พ.ศ. ${date.getFullYear() + 543}`;
});

const shortThaiDate = computed<string>(() => {
  const date = normalizeDate(props.issuedAt) || new Date();
  const d = date.getDate().toString().padStart(2, '0');
  const m = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${d}/${m}/${date.getFullYear() + 543}`;
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

// ─── Shared print CSS ────────────────────────────────────────────────────────
function getPrintStyles(): string {
  return `
    @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;600;700&display=swap');
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    body { font-family: 'Sarabun', 'TH Sarabun New', sans-serif; font-size: 13px; color: #3a3a3a; background: #fff; }
    .receipt-page {
      width: 210mm; min-height: 297mm;
      margin: 0 auto;
      padding: 16mm 20mm 14mm;
      display: flex; flex-direction: column;
    }
    /* HEADER */
    .receipt-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; }
    .header-left { display: flex; gap: 12px; align-items: flex-start; }
    .receipt-logo { width: 60px; height: 60px; object-fit: contain; }
    .uni-info { display: flex; flex-direction: column; gap: 1px; }
    .uni-name { font-size: 15px; font-weight: 700; line-height: 1.35; color: #2a2a2a; }
    .uni-addr { font-size: 11px; line-height: 1.5; color: #444; }
    .header-right { text-align: right; }
    .receipt-title { font-size: 18px; font-weight: 700; line-height: 1.3; color: #2a2a2a; }
    .receipt-date { font-size: 12px; margin-top: 14px; color: #3a3a3a; }
    /* CUSTOMER */
    .customer-section { margin: 10px 0 12px; padding-bottom: 8px; }
    .info-row { display: flex; margin-bottom: 5px; font-size: 13px; color: #3a3a3a; }
    .info-label { width: 260px; flex-shrink: 0; color: #555; }
    .info-value { flex: 1; color: #2a2a2a; }
    /* TABLE */
    .receipt-table { width: 100%; border-collapse: collapse; flex: 1; }
    .receipt-table th, .receipt-table td { border: 1px solid #bbb; padding: 6px 10px; font-size: 13px; color: #3a3a3a; }
    .receipt-table th { text-align: center; font-weight: 400; background: #fafafa; color: #444; }
    .col-no { width: 11%; text-align: center; }
    .col-desc { width: 64%; }
    .col-amount { width: 25%; text-align: right; }
    .body-no { text-align: center; vertical-align: top; padding-top: 10px; height: 320px; }
    .body-desc { vertical-align: top; padding-top: 10px; padding-left: 10px; position: relative; }
    .body-amount { text-align: right; vertical-align: top; padding-top: 10px; }
    .tfoot-total { font-weight: 700; padding-left: 10px; color: #2a2a2a; }
    .tfoot-amount { text-align: right; font-weight: 700; color: #2a2a2a; }
    /* Cell watermark */
    .cell-watermark-wrap {
      position: absolute; top: 0; left: 0; right: 0; bottom: 0;
      display: flex; align-items: center; justify-content: center;
      pointer-events: none;
    }
    .cell-watermark-img { width: 230px; height: 230px; object-fit: contain; opacity: 0.08; }
    .desc-text { position: relative; z-index: 2; display: block; }
    /* FOOTER */
    .receipt-footer { display: flex; justify-content: space-between; align-items: flex-start; margin-top: 14px; gap: 16px; }
    .footer-left { flex: 1; }
    .notes-url-label { font-size: 10px; margin-bottom: 1px; color: #444; }
    .notes-url { font-size: 10px; margin-bottom: 5px; color: #444; }
    .notes-head { font-size: 10.5px; font-weight: 700; margin-bottom: 3px; color: #2a2a2a; }
    .notes-body { font-size: 10px; padding-left: 12px; line-height: 1.55; color: #444; }
    .notes-body p { margin-bottom: 2px; }
    .notes-en { color: #666; padding-left: 8px; font-size: 9.5px; }
    .digitally { font-size: 9px; color: #777; margin-top: 12px; }
    .footer-right { width: 175px; display: flex; flex-direction: column; align-items: center; }
    .sig-block { display: flex; flex-direction: column; align-items: center; width: 100%; margin-bottom: 10px; }
    .sig-italic { font-style: italic; font-size: 18px; font-family: Georgia, 'Times New Roman', serif; color: #2a2a2a; }
    .sig-line { width: 160px; border-bottom: 1px solid #888; margin-bottom: 5px; }
    .sig-name { font-size: 12px; font-weight: 600; text-align: center; color: #2a2a2a; }
    .sig-title { font-size: 11px; color: #555; text-align: center; }
    .qr-img { width: 86px; height: 86px; margin-top: 4px; }
    @page { size: A4; margin: 0; }
    @media print { body { padding: 0; } }
  `;
}

function buildReceiptHtml(isPixelVersion = false): string {
  const w = isPixelVersion ? '794px' : '210mm';
  const h = isPixelVersion ? '1123px' : '297mm';
  const pad = isPixelVersion ? '60px 76px 53px' : '16mm 20mm 14mm';

  const printableReceiptId = escapeHtml(props.receiptId);
  const printableTitle = escapeHtml(props.courseTitle);
  const printableCode = escapeHtml(props.courseCode || '');
  const printablePrice = escapeHtml(amountLabel.value);
  const printableCustomerName = escapeHtml(props.customerName || '-');
  const printableCustomerTaxId = escapeHtml(props.customerTaxId || '-');
  const printableCustomerAddress = escapeHtml(props.customerAddress || '-');
  const printableBahtText = escapeHtml(bahtTextValue.value);
  const logoUrl = buuLogoSvg;
  const qrUrl = receiptQrCode;

  return `<!doctype html>
<html lang="th">
<head>
  <meta charset="utf-8" />
  <style>
    ${getPrintStyles()}
    .receipt-page { width: ${w}; ${isPixelVersion ? `height: ${h};` : `min-height: ${h};`} padding: ${pad}; }
  </style>
</head>
<body>
<div class="receipt-page">

  <div class="receipt-header">
    <div class="header-left">
      <img src="${logoUrl}" class="receipt-logo" alt="BUU logo" onerror="this.style.display='none'">
      <div class="uni-info">
        <div class="uni-name">มหาวิทยาลัยบูรพา BURAPHA UNIVERSITY</div>
        <div class="uni-addr">169 ถนนลงหาดบางแสน ตำบลแสนสุข อำเภอเมือง จังหวัดชลบุรี 20131</div>
        <div class="uni-addr">169 Longhard Bangsaen Road, Saensuk, Mueang, Chonburi 20131</div>
        <div class="uni-addr">เลขที่ประจำตัวผู้เสียภาษีอากร (Tax ID) 0994000249357</div>
      </div>
    </div>
    <div class="header-right">
      <div class="receipt-title">สำเนาใบเสร็จรับเงิน</div>
      <div class="receipt-title">RECEIPT COPY</div>
      <div class="receipt-date">วันที่ (Date) ${thaiPrintDate.value}</div>
    </div>
  </div>

  <div class="customer-section">
    <div class="info-row"><div class="info-label">เลขที่ใบเสร็จรับเงิน (Receipt No.)</div><div class="info-value">${printableReceiptId}</div></div>
    <div class="info-row"><div class="info-label">ได้รับเงินจาก (Received from)</div><div class="info-value">${printableCustomerName}</div></div>
    <div class="info-row-spacer" style="height:10px;"></div>
    <div class="info-row"><div class="info-label">เลขประจำตัวผู้เสียภาษีอากร (Tax ID)</div><div class="info-value">${printableCustomerTaxId}</div></div>
    <div class="info-row"><div class="info-label">ที่อยู่ (Address)</div><div class="info-value">${printableCustomerAddress}</div></div>
  </div>

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
        <td class="body-desc">
          <div class="cell-watermark-wrap">
            <img src="${logoUrl}" class="cell-watermark-img" alt="">
          </div>
          <span class="desc-text">ค่าธรรมเนียมในการอบรมรายวิชา ${printableCode ? printableCode + ' : ' : ''}${printableTitle}</span>
        </td>
        <td class="body-amount">${printablePrice}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr>
        <td colspan="2" class="tfoot-total">รวมเงิน (Total) ${printableBahtText}</td>
        <td class="tfoot-amount">${printablePrice}</td>
      </tr>
    </tfoot>
  </table>

  <div class="receipt-footer">
    <div class="footer-left">
      <div class="notes-url-label">URL ตรวจสอบใบเสร็จอิเล็กทรอนิกส์/E-receipt verification URL</div>
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
      <div class="sig-block">
        <div class="sig-italic">test</div>
        <div class="sig-line"></div>
        <div class="sig-name">( นางสาวณัฐพงศ์ ไม่อยู่ )</div>
        <div class="sig-title">ผู้รับเงิน (Collector)</div>
      </div>
      <img src="${qrUrl}" class="qr-img" alt="QR Code">
    </div>
  </div>

</div>
</body>
</html>`;
}

function printReceipt(): void {
  if (typeof window === 'undefined') return;
  const printWindow = window.open('', '_blank', 'width=900,height=1200');
  if (!printWindow) return;
  printWindow.document.write(buildReceiptHtml(false));
  printWindow.document.close();
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 1000);
}

function downloadReceiptPdf(): void {
  if (typeof window === 'undefined') return;

  const iframe = document.createElement('iframe');
  iframe.style.cssText = 'position:fixed;left:-9999px;width:794px;height:1123px;border:none;';
  document.body.appendChild(iframe);

  const iframeDoc = iframe.contentWindow?.document;
  if (!iframeDoc) {
    document.body.removeChild(iframe);
    return;
  }

  iframeDoc.open();
  iframeDoc.write(buildReceiptHtml(true));
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

defineExpose({ printReceipt, downloadReceiptPdf });
</script>

<style lang="scss" scoped>
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
}

.receipt-card {
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
  border-radius: 8px !important;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

/* Page wrapper inside dialog — fills full card */
.receipt-page {
  padding: 32px 40px 28px;
  display: flex;
  flex-direction: column;
  min-height: 1060px; /* approximate A4 proportion inside dialog */
  color: #3a3a3a; /* match original: dark-grey, not pure black */
}

/* HEADER */
.receipt-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}
.header-left {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}
.receipt-logo {
  width: 62px;
  height: 62px;
  object-fit: contain;
  flex-shrink: 0;
}
.uni-info {
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.uni-name {
  font-size: 15px;
  font-weight: 700;
  line-height: 1.35;
  color: #2a2a2a;
}
.uni-addr {
  font-size: 11.5px;
  line-height: 1.5;
  color: #444;
}
.header-right {
  text-align: right;
  flex-shrink: 0;
}
.receipt-title {
  font-size: 18px;
  font-weight: 700;
  line-height: 1.3;
  color: #2a2a2a;
}
.receipt-date {
  font-size: 12px;
  margin-top: 14px;
  color: #3a3a3a;
}

/* CUSTOMER */
.customer-section {
  margin-bottom: 14px;
}
.info-row {
  display: flex;
  margin-bottom: 5px;
  font-size: 13px;
  line-height: 1.45;
  color: #3a3a3a;
}
.info-label {
  width: 270px;
  flex-shrink: 0;
  color: #555;
}
.info-value {
  flex: 1;
  color: #2a2a2a;
}
.info-row-spacer {
  height: 10px;
}

/* TABLE */
.receipt-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 14px;
  flex: 1;
}
.receipt-table th,
.receipt-table td {
  border: 1px solid #bbb;
  padding: 6px 10px;
  font-size: 13px;
  color: #3a3a3a;
}
.receipt-table th {
  font-weight: 400;
  text-align: center;
  color: #444;
  background: #fafafa;
}
.col-no {
  width: 11%;
  text-align: center;
}
.col-desc {
  width: 64%;
}
.col-amount {
  width: 25%;
  text-align: right;
}

.body-no {
  text-align: center;
  vertical-align: top;
  padding-top: 10px;
  height: 320px; /* tall cell like original */
}
.body-desc {
  vertical-align: top;
  padding-top: 10px;
  padding-left: 10px;
  position: relative;
}
.body-amount {
  text-align: right;
  vertical-align: top;
  padding-top: 10px;
}
.tfoot-total {
  font-weight: 700;
  padding-left: 10px;
  color: #2a2a2a;
}
.tfoot-amount {
  text-align: right;
  font-weight: 700;
  color: #2a2a2a;
}

/* Cell watermark */
.cell-watermark-wrap {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 0;
}
.cell-watermark-img {
  width: 230px;
  height: 230px;
  object-fit: contain;
  opacity: 0.08;
}
.desc-text {
  position: relative;
  z-index: 2;
  display: block;
}

/* FOOTER */
.receipt-footer {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
}
.footer-left {
  flex: 1;
  min-width: 0;
}
.notes-url-label {
  font-size: 10px;
  margin-bottom: 1px;
  color: #444;
}
.notes-url {
  font-size: 10px;
  margin-bottom: 5px;
  color: #444;
}
.notes-head {
  font-size: 10.5px;
  font-weight: 700;
  margin-bottom: 3px;
  color: #2a2a2a;
}
.notes-body {
  font-size: 10px;
  padding-left: 12px;
  line-height: 1.55;
  color: #444;
}
.notes-body p {
  margin-bottom: 2px;
}
.notes-en {
  color: #666;
  padding-left: 8px;
  font-size: 9.5px;
}
.digitally {
  font-size: 9px;
  color: #777;
  margin-top: 12px;
}

.footer-right {
  width: 175px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.sig-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 10px;
}
.sig-italic {
  font-style: italic;
  font-size: 18px;
  font-family: Georgia, 'Times New Roman', serif;
  margin-bottom: 0px;
  color: #2a2a2a;
}
.sig-line {
  width: 160px;
  border-bottom: 1px solid #888;
  margin-bottom: 5px;
}
.sig-name {
  font-size: 12px;
  font-weight: 600;
  text-align: center;
  color: #2a2a2a;
}
.sig-title {
  font-size: 11px;
  color: #555;
  text-align: center;
}
.qr-img {
  width: 86px;
  height: 86px;
}
</style>
