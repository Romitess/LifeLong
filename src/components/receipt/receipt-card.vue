<template>
  <q-dialog
    v-model="dialogModel"
    transition-show="scale"
    transition-hide="scale"
    @hide="emit('hide')"
  >
    <q-card class="receipt-dialog-card column no-wrap bg-white">
      <q-card-section class="receipt-scroll col" id="printable-area">
        <div class="receipt-page" aria-label="Receipt copy">
          <img :src="buuLogoUrl" class="receipt-logo" alt="BUU logo" />
          <img :src="buuLogoUrl" class="receipt-watermark" alt="" />

          <div class="pdf-text pdf-bold org-title">มหาวิทยาลัยบูรพา BURAPHA UNIVERSITY</div>
          <div class="pdf-text org-address-1">
            169 ถนนลงหาดบางแสน ตําบลแสนสุข อําเภอเมือง จังหวัดชลบุรี 20131
          </div>
          <div class="pdf-text org-address-2">
            169 Longhard Bangsaen Road, Saensuk, Mueang, Chonburi 20131
          </div>
          <div class="pdf-text org-tax">เลขที่ประจําตัวผูเสียภาษีอากร (Tax ID) 0994000249357</div>

          <div class="pdf-text pdf-bold copy-title-th">
            {{ isCopy ? 'สําเนาใบเสร็จรับเงิน' : 'ใบเสร็จรับเงิน' }}
          </div>
          <div class="pdf-text pdf-bold copy-title-en">
            {{ isCopy ? 'RECEIPT COPY' : 'RECEIPT' }}
          </div>
          <div class="pdf-text receipt-date">วันที่ (Date) {{ receiptView.longDate }}</div>

          <div class="pdf-text customer-receipt-label">เลขที่ใบเสร็จรับเงิน (Receipt No.)</div>
          <div class="pdf-text customer-receipt-value">{{ receiptView.receiptNo }}</div>
          <div class="pdf-text customer-name-label">ไดรับเงินจาก (Received from)</div>
          <div class="pdf-text customer-name-value">{{ receiptView.customerName }}</div>
          <div class="pdf-text customer-tax-label">เลขประจําตัวผูเสียภาษีอากร (Tax ID)</div>
          <div class="pdf-text customer-tax-value">{{ receiptView.customerTaxId }}</div>
          <div class="pdf-text customer-address-label">ที่อยู (Address)</div>
          <div class="pdf-text customer-address-value">{{ receiptView.customerAddress }}</div>

          <div class="table-line table-h table-y0"></div>
          <div class="table-line table-h table-y1"></div>
          <div class="table-line table-h table-y2"></div>
          <div class="table-line table-h table-y3"></div>
          <div class="table-line table-v table-x0"></div>
          <div class="table-line table-v table-x1"></div>
          <div class="table-line table-v table-x2"></div>
          <div class="table-line table-v table-x3"></div>

          <div class="pdf-text table-no-th">ลําดับที่</div>
          <div class="pdf-text table-no-en">(No.)</div>
          <div class="pdf-text table-desc-th">รายการ</div>
          <div class="pdf-text table-desc-en">(Description)</div>
          <div class="pdf-text table-amount-th">จํานวนเงิน/บาท</div>
          <div class="pdf-text table-amount-en">(Amount/Baht)</div>
          <div class="pdf-text item-no">1</div>
          <div class="pdf-text item-description">{{ receiptView.description }}</div>
          <div class="pdf-text item-amount">{{ receiptView.amountLabel }}</div>
          <div class="pdf-text pdf-bold total-label">
            รวมเงิน (Total) {{ receiptView.amountThaiText }}
          </div>
          <div class="pdf-text pdf-bold total-amount">{{ receiptView.amountLabel }}</div>

          <img :src="receiptSignatureUrl" class="receipt-signature" alt="" />
          <div class="pdf-text collector-name">( {{ receiptView.collectorName }} )</div>
          <div class="pdf-text collector-title">ผูรับเงิน (Collector)</div>
          <img v-if="receiptView.showQr" :src="receiptQrCodeUrl" class="receipt-qr" alt="QR Code" />

          <div class="pdf-text footer-url-label">
            URL ตรวจสอบใบเสร็จอิเล็กทรอนิกส์/E-receipt verification URL
          </div>
          <div class="pdf-text footer-url">https://e-sign.buu.ac.th/verify</div>
          <div class="pdf-text footer-note-head">หมายเหตุ :</div>
          <div class="pdf-text footer-note-1">
            1.ใบเสร็จรับเงินนี้ได้ดำเนินการด้วยวิธีการทางอิเล็กทรอนิกส์ และผู้ชำระเงินสามารถสแกน QR
            Code นี้เพื่อตรวจสอบความถูกต้อง/
          </div>
          <div class="pdf-text footer-note-2">
            This receipt was processed electronically, and the person making the payment can scan
            this QR Code to check its correctness.
          </div>
          <div class="pdf-text footer-note-3">
            2. ใบเสร็จรับเงินฉบับนี้จะสมบูรณ์เมื่อได้รับชำระเงินเรียบร้อยแล้ว
            และมีลายมือชื่อของผู้รับเงินครบถ้วน/
          </div>
          <div class="pdf-text footer-note-4">
            This receipt will be considered finalized once we have received full payment and the
            payee's signature is complete.
          </div>
          <div class="pdf-text footer-digital">Digitally signed by BUU</div>
          <div class="pdf-text footer-digital-date">Date: {{ receiptView.shortDate }}</div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="receipt-actions">
        <q-btn flat label="ปิด" color="grey-7" padding="8px 24px" no-caps @click="closeReceipt" />
        <q-btn
          unelevated
          icon="print"
          label="พิมพ์"
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
import buuLogoUrl from 'src/assets/buu-logo-receipt.png';
import receiptQrCodeUrl from 'src/assets/receipt-reference-qrcode.png';
import receiptSignatureUrl from 'src/assets/receipt-signature.png';
import thSarabunFontUrl from 'src/assets/fonts/THSarabunPSK.ttf';
import thSarabunBoldFontUrl from 'src/assets/fonts/THSarabunPSK-Bold.ttf';
import {
  RECEIPT_COLLECTOR_NAME,
  createReceiptPdf,
  safeReceiptFilename,
} from './receipt-pdf-renderer.js';

type ReceiptDate = Date | string | number | null | undefined;

interface ReceiptCardReceipt {
  receiptNo: string;
  fullName: string;
  nationalId: string;
  address: string;
  examName: string;
  amount: number;
  transactionDate?: ReceiptDate;
  collectorName?: string;
}

interface ReceiptView {
  receiptNo: string;
  customerName: string;
  customerTaxId: string;
  customerAddress: string;
  description: string;
  amount: number;
  amountLabel: string;
  amountThaiText: string;
  longDate: string;
  shortDate: string;
  collectorName: string;
  showQr: boolean;
  isCopy: boolean;
}

interface ReceiptPdfAssets {
  fontRegularBase64: string;
  fontBoldBase64: string;
  logoDataUrl: string;
  qrDataUrl: string;
  signatureDataUrl: string;
}

interface Props {
  modelValue?: boolean;
  receipt?: Partial<ReceiptCardReceipt>;
  receiptId?: string;
  issuedAt?: ReceiptDate;
  customerName?: string;
  customerTaxId?: string;
  customerAddress?: string;
  showCustomer?: boolean;
  courseTitle?: string;
  courseCode?: string;
  amount?: number;
  showQr?: boolean;
  logoSize?: string;
  logoSpacingClass?: string;
  collectorName?: string;
  isCopy?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  receipt: () => ({}),
  issuedAt: null,
  customerName: '',
  customerTaxId: '',
  customerAddress: '',
  showCustomer: true,
  courseTitle: '',
  courseCode: '',
  amount: 0,
  showQr: true,
  logoSize: '56.211pt',
  logoSpacingClass: '',
  collectorName: RECEIPT_COLLECTOR_NAME,
  isCopy: true,
});

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void;
  (e: 'hide'): void;
}>();

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

let receiptPdfAssetsPromise: Promise<ReceiptPdfAssets> | null = null;

const dialogModel = computed<boolean>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

const receiptView = computed<ReceiptView>(() => {
  const source = props.receipt ?? {};
  const courseDescription = [props.courseCode, props.courseTitle].filter(Boolean).join(' : ');
  const description =
    source.examName ||
    (courseDescription ? `ค่าธรรมเนียมในการอบรมรายวิชา ${courseDescription}` : '-');
  const amount = normalizeAmount(source.amount ?? props.amount);
  const transactionDate = source.transactionDate ?? props.issuedAt ?? null;

  return {
    receiptNo: source.receiptNo || props.receiptId || '-',
    customerName: legacyAm(source.fullName || props.customerName || '-'),
    customerTaxId: source.nationalId || props.customerTaxId || '-',
    customerAddress: legacyAm(source.address || props.customerAddress || '-'),
    description: legacyAm(description),
    amount,
    amountLabel: formatCurrency(amount),
    amountThaiText: legacyAm(numberToThaiText(amount)),
    longDate: legacyAm(formatThaiLongDate(transactionDate)),
    shortDate: formatThaiShortDate(transactionDate),
    collectorName: legacyAm(source.collectorName || props.collectorName || RECEIPT_COLLECTOR_NAME),
    showQr: props.showQr,
    isCopy: props.isCopy,
  };
});

function legacyAm(value: string): string {
  return value.replaceAll('ำ', 'ํา');
}

function normalizeAmount(amount: number | undefined): number {
  const nextAmount = Number(amount ?? 0);
  return Number.isFinite(nextAmount) ? nextAmount : 0;
}

function normalizeDate(input: ReceiptDate): Date | null {
  if (!input) return null;
  const date = input instanceof Date ? input : new Date(input);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatThaiLongDate(input: ReceiptDate): string {
  const date = normalizeDate(input);
  if (!date) return 'xx xxxxx พ.ศ. xxxx';
  return `${date.getDate()} ${thaiMonths[date.getMonth()]} พ.ศ. ${date.getFullYear() + 543}`;
}

function formatThaiShortDate(input: ReceiptDate): string {
  const date = normalizeDate(input);
  if (!date) return 'xx/xx/xxxx';
  return `${String(date.getDate()).padStart(2, '0')}/${String(date.getMonth() + 1).padStart(
    2,
    '0',
  )}/${date.getFullYear() + 543}`;
}

function formatCurrency(amount: number): string {
  return amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function numberToThaiText(amount: number): string {
  const number = normalizeAmount(amount);
  if (number === 0) return 'ศูนย์บาทถ้วน';

  const digits = ['ศูนย์', 'หนึ่ง', 'สอง', 'สาม', 'สี่', 'ห้า', 'หก', 'เจ็ด', 'แปด', 'เก้า'];
  const positions = ['', 'สิบ', 'ร้อย', 'พัน', 'หมื่น', 'แสน', 'ล้าน'];
  const [baht = '0', satang = '00'] = number.toFixed(2).split('.');

  function readNumber(value: string): string {
    let result = '';
    const length = value.length;

    for (let index = 0; index < length; index += 1) {
      const digit = Number(value.charAt(index));
      const position = length - index - 1;

      if (digit === 0) continue;

      if (position === 0 && digit === 1 && length > 1) {
        result += 'เอ็ด';
      } else if (position === 1 && digit === 2) {
        result += 'ยี่สิบ';
      } else if (position === 1 && digit === 1) {
        result += 'สิบ';
      } else {
        result += `${digits[digit] ?? ''}${positions[position] ?? ''}`;
      }
    }

    return result;
  }

  const bahtValue = Number(baht);
  const satangValue = Number(satang);
  const bahtText = bahtValue > 0 ? `${readNumber(baht)}บาท` : '';
  const satangText = satangValue > 0 ? `${readNumber(satang)}สตางค์` : 'ถ้วน';

  return `${bahtText}${satangText}`;
}

function closeReceipt(): void {
  dialogModel.value = false;
}

function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 0x8000;

  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }

  return btoa(binary);
}

async function fetchAsBase64(url: string): Promise<string> {
  const response = await fetch(url);
  const buffer = await response.arrayBuffer();
  return arrayBufferToBase64(buffer);
}

async function fetchAsDataUrl(url: string, fallbackMime = 'image/png'): Promise<string> {
  const response = await fetch(url);
  const mime = response.headers.get('content-type') || fallbackMime;
  const buffer = await response.arrayBuffer();
  return `data:${mime};base64,${arrayBufferToBase64(buffer)}`;
}

function getReceiptPdfAssets(): Promise<ReceiptPdfAssets> {
  receiptPdfAssetsPromise ??= Promise.all([
    fetchAsBase64(thSarabunFontUrl),
    fetchAsBase64(thSarabunBoldFontUrl),
    fetchAsDataUrl(buuLogoUrl),
    fetchAsDataUrl(receiptQrCodeUrl),
    fetchAsDataUrl(receiptSignatureUrl),
  ]).then(([fontRegularBase64, fontBoldBase64, logoDataUrl, qrDataUrl, signatureDataUrl]) => ({
    fontRegularBase64,
    fontBoldBase64,
    logoDataUrl,
    qrDataUrl,
    signatureDataUrl,
  }));

  return receiptPdfAssetsPromise;
}

async function buildReceiptPdf() {
  const assets = await getReceiptPdfAssets();
  return createReceiptPdf(receiptView.value, assets);
}

async function printReceipt(): Promise<void> {
  if (typeof window === 'undefined') return;

  const pdf = await buildReceiptPdf();
  const blob = pdf.output('blob');
  const url = URL.createObjectURL(blob);
  const printWindow = window.open(url, '_blank');

  if (!printWindow) {
    URL.revokeObjectURL(url);
    return;
  }

  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
    URL.revokeObjectURL(url);
  }, 1000);
}

async function downloadReceiptPdf(): Promise<void> {
  if (typeof window === 'undefined') return;

  const pdf = await buildReceiptPdf();
  pdf.save(safeReceiptFilename(receiptView.value.receiptNo));
}

defineExpose({ printReceipt, downloadReceiptPdf });
</script>

<style scoped>
@font-face {
  font-family: 'THSarabunPSKReceipt';
  src: url('../../assets/fonts/THSarabunPSK.ttf') format('truetype');
  font-weight: 400;
  font-style: normal;
}

@font-face {
  font-family: 'THSarabunPSKReceipt';
  src: url('../../assets/fonts/THSarabunPSK-Bold.ttf') format('truetype');
  font-weight: 700;
  font-style: normal;
}

.receipt-dialog-card {
  width: 820px;
  max-width: 98vw;
  max-height: 98vh;
  border-radius: 0 !important;
  box-shadow: none !important;
}

.receipt-scroll {
  overflow: auto;
  padding: 0;
  background: #fff;
}

.receipt-actions {
  padding: 12px;
  border-top: 1px solid #d9d9d9;
  background: #fff;
}

.receipt-page {
  position: relative;
  width: 595.28pt;
  height: 841.89pt;
  margin: 0 auto;
  overflow: hidden;
  background: #fff;
  color: #3e3533;
  font-family: 'THSarabunPSKReceipt', 'TH SarabunPSK', 'TH Sarabun New', serif;
  letter-spacing: 0;
  -webkit-font-smoothing: antialiased;
  print-color-adjust: exact;
  -webkit-print-color-adjust: exact;
}

.pdf-text {
  position: absolute;
  z-index: 2;
  margin: 0;
  padding: 0;
  color: #3e3533;
  font-size: 13pt;
  font-weight: 400;
  line-height: 1;
  white-space: nowrap;
}

.pdf-bold {
  font-weight: 700;
}

.receipt-logo {
  position: absolute;
  left: 44.628pt;
  top: 44.627pt;
  width: 56.211pt;
  height: 56.211pt;
  object-fit: contain;
}

.receipt-watermark {
  position: absolute;
  left: 189.8pt;
  top: 309.6pt;
  width: 216.5pt;
  height: 216.5pt;
  object-fit: contain;
  opacity: 0.16;
  filter: grayscale(100%);
}

.org-title {
  left: 105.05pt;
  top: 45.32pt;
  font-size: 13.12pt;
}

.org-address-1 {
  left: 105.05pt;
  top: 61.01pt;
  font-size: 11.24pt;
}

.org-address-2 {
  left: 105.05pt;
  top: 74.5pt;
  font-size: 11.24pt;
}

.org-tax {
  left: 105.05pt;
  top: 87.99pt;
  font-size: 11.24pt;
}

.copy-title-th {
  left: 461.34pt;
  top: 45.32pt;
  font-size: 13.12pt;
}

.copy-title-en {
  left: 467.94pt;
  top: 61.06pt;
  font-size: 13.12pt;
}

.receipt-date {
  left: 386.69pt;
  top: 110.67pt;
  font-size: 12.18pt;
}

.customer-receipt-label {
  left: 44.77pt;
  top: 149.5pt;
}

.customer-receipt-value {
  left: 172.33pt;
  top: 149.5pt;
}

.customer-name-label {
  left: 44.77pt;
  top: 169.6pt;
}

.customer-name-value {
  left: 172.33pt;
  top: 169.6pt;
}

.customer-tax-label {
  left: 44.77pt;
  top: 209.5pt;
}

.customer-tax-value {
  left: 187.64pt;
  top: 209.5pt;
}

.customer-address-label {
  left: 44.77pt;
  top: 229.6pt;
}

.customer-address-value {
  left: 121.31pt;
  top: 229.6pt;
}

.table-line {
  position: absolute;
  z-index: 3;
  border-color: #000;
}

.table-h {
  left: 42.877pt;
  width: 509.041pt;
  height: 0;
  border-top: 0.714pt solid #000;
}

.table-v {
  top: 266.878pt;
  width: 0;
  border-left: 0.714pt solid #000;
}

.table-y0 {
  top: 266.878pt;
}

.table-y1 {
  top: 301.562pt;
}

.table-y2 {
  top: 587.024pt;
}

.table-y3 {
  top: 606.864pt;
}

.table-x0 {
  left: 42.877pt;
  height: 339.986pt;
}

.table-x1 {
  left: 91.357pt;
  height: 320.146pt;
}

.table-x2 {
  left: 454.958pt;
  height: 339.986pt;
}

.table-x3 {
  left: 551.918pt;
  height: 339.986pt;
}

.table-no-th {
  left: 55.08pt;
  top: 270.08pt;
  font-size: 12.37pt;
}

.table-no-en {
  left: 58.58pt;
  top: 284.92pt;
  font-size: 12.37pt;
}

.table-desc-th {
  left: 260.56pt;
  top: 270.08pt;
  font-size: 12.37pt;
}

.table-desc-en {
  left: 250.1pt;
  top: 284.92pt;
  font-size: 12.37pt;
}

.table-amount-th {
  left: 477.34pt;
  top: 270.08pt;
  font-size: 12.37pt;
}

.table-amount-en {
  left: 476.12pt;
  top: 284.92pt;
  font-size: 12.37pt;
}

.item-no {
  left: 64.88pt;
  top: 304.76pt;
  font-size: 12.37pt;
}

.item-description {
  left: 93.85pt;
  top: 304.76pt;
  width: 355pt;
  overflow: visible;
  font-size: 12.37pt;
  white-space: normal;
  word-wrap: break-word;
  word-break: break-word;
  line-height: 1.4;
}

.item-amount,
.total-amount {
  left: 454.958pt;
  width: 94.462pt;
  text-align: right;
  font-size: 12.37pt;
}

.item-amount {
  top: 304.76pt;
}

.total-label {
  left: 45.37pt;
  top: 590.18pt;
  font-size: 12.37pt;
}

.total-amount {
  top: 590.18pt;
}

.receipt-signature {
  position: absolute;
  left: 457.64pt;
  top: 615.974pt;
  width: 80pt;
  height: 28.052pt;
  object-fit: fill;
}

.collector-name,
.collector-title {
  left: 430pt;
  width: 134pt;
  text-align: center;
  font-size: 13pt;
}

.collector-name {
  top: 647.83pt;
}

.collector-title {
  top: 663.92pt;
}

.receipt-qr {
  position: absolute;
  left: 477.55pt;
  top: 689.16pt;
  width: 45.46pt;
  height: 45.46pt;
  object-fit: fill;
}

.footer-url-label,
.footer-url,
.footer-note-head,
.footer-note-1,
.footer-note-2,
.footer-note-3,
.footer-note-4,
.footer-digital,
.footer-digital-date {
  left: 45pt;
  color: #000;
  font-size: 10pt;
}

.footer-url-label {
  top: 626.05pt;
}

.footer-url {
  top: 638.62pt;
}

.footer-note-head {
  top: 651.19pt;
}

.footer-note-1 {
  top: 663.76pt;
}

.footer-note-2 {
  top: 676.33pt;
}

.footer-note-3 {
  top: 688.9pt;
}

.footer-note-4 {
  top: 701.47pt;
}

.footer-digital {
  top: 726.61pt;
}

.footer-digital-date {
  top: 739.18pt;
}

@page {
  size: A4;
  margin: 0;
}
</style>
