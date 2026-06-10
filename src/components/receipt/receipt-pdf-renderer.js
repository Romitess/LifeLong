import { GState, jsPDF } from 'jspdf';

export const RECEIPT_PAGE = {
  width: 595.28,
  height: 841.89,
};

export const RECEIPT_COLLECTOR_NAME = 'นางสาวนัฐพร ยะโสวงษ์';

const FONT_FAMILY = 'THSarabunPSK';
const MAIN_TEXT = [62, 53, 51];
const BLACK = [0, 0, 0];

const pt = (value) => Number(value.toFixed(3));

function legacyAm(value) {
  return String(value ?? '').replaceAll('ำ', 'ํา');
}

function addReceiptFonts(doc, assets) {
  doc.addFileToVFS('THSarabunPSK.ttf', assets.fontRegularBase64);
  doc.addFont('THSarabunPSK.ttf', FONT_FAMILY, 'normal');
  doc.addFileToVFS('THSarabunPSK-Bold.ttf', assets.fontBoldBase64);
  doc.addFont('THSarabunPSK-Bold.ttf', FONT_FAMILY, 'bold');
}

function setRgb(doc, color, target = 'text') {
  if (target === 'draw') {
    doc.setDrawColor(color[0], color[1], color[2]);
    return;
  }

  doc.setTextColor(color[0], color[1], color[2]);
}

function writeText(doc, text, x, y, size, options = {}) {
  doc.setFont(FONT_FAMILY, options.bold ? 'bold' : 'normal');
  doc.setFontSize(size);
  setRgb(doc, options.color ?? MAIN_TEXT);
  doc.text(String(text ?? ''), pt(x), pt(y), options.align ? { align: options.align } : undefined);
}

function drawTable(doc) {
  const x0 = 42.877;
  const x1 = 91.357;
  const x2 = 454.958;
  const x3 = 551.918;
  const y0 = 266.878;
  const y1 = 301.562;
  const y2 = 587.024;
  const y3 = 606.864;

  setRgb(doc, BLACK, 'draw');
  doc.setLineWidth(0.714);
  doc.line(x0, y0, x3, y0);
  doc.line(x0, y1, x3, y1);
  doc.line(x0, y2, x3, y2);
  doc.line(x0, y3, x3, y3);
  doc.line(x0, y0, x0, y3);
  doc.line(x1, y0, x1, y2);
  doc.line(x2, y0, x2, y3);
  doc.line(x3, y0, x3, y3);
}

function drawImages(doc, receipt, assets) {
  doc.addImage(assets.logoDataUrl, 'PNG', 44.628, 44.627, 56.211, 56.211);

  doc.saveGraphicsState();
  doc.setGState(new GState({ opacity: 0.16 }));
  doc.addImage(assets.logoDataUrl, 'PNG', 189.8, 309.6, 216.5, 216.5);
  doc.restoreGraphicsState();

  if (assets.signatureDataUrl) {
    doc.addImage(assets.signatureDataUrl, 'PNG', 457.64, 615.974, 80, 28.052);
  }

  if (receipt.showQr !== false && assets.qrDataUrl) {
    doc.addImage(assets.qrDataUrl, 'PNG', 477.55, 689.16, 45.46, 45.46);
  }
}

function drawHeader(doc, receipt) {
  writeText(doc, 'มหาวิทยาลัยบูรพา BURAPHA UNIVERSITY', 105.05, 56.47, 13.12, {
    bold: true,
  });
  writeText(
    doc,
    '169 ถนนลงหาดบางแสน ตําบลแสนสุข อําเภอเมือง จังหวัดชลบุรี 20131',
    105.05,
    70.56,
    11.24,
  );
  writeText(
    doc,
    '169 Longhard Bangsaen Road, Saensuk, Mueang, Chonburi 20131',
    105.05,
    84.05,
    11.24,
  );
  writeText(doc, 'เลขที่ประจําตัวผู้เสียภาษีอากร (Tax ID) 0994000249357', 105.05, 97.54, 11.24);

  const thaiTitle = receipt.isCopy ? 'สําเนาใบเสร็จรับเงิน' : 'ใบเสร็จรับเงิน';
  const enTitle = receipt.isCopy ? 'RECEIPT COPY' : 'RECEIPT';
  writeText(doc, thaiTitle, 461.34, 56.47, 13.12, { bold: true });
  writeText(doc, enTitle, 467.94, 72.21, 13.12, { bold: true });
  writeText(doc, `วันที่ (Date) ${legacyAm(receipt.longDate)}`, 386.69, 121.02, 12.18);
}

function drawCustomer(doc, receipt) {
  writeText(doc, 'เลขที่ใบเสร็จรับเงิน (Receipt No.)', 44.77, 160.55, 13);
  writeText(doc, receipt.receiptNo, 172.33, 160.55, 13);

  writeText(doc, 'ได้รับเงินจาก (Received from)', 44.77, 180.65, 13);
  writeText(doc, legacyAm(receipt.customerName), 172.33, 180.65, 13);

  writeText(doc, 'เลขประจําตัวผู้เสียภาษีอากร (Tax ID)', 44.77, 220.55, 13);
  writeText(doc, receipt.customerTaxId, 187.64, 220.55, 13);

  writeText(doc, 'ที่อยู่ (Address)', 44.77, 240.65, 13);
  writeText(doc, legacyAm(receipt.customerAddress), 121.31, 240.65, 13);
}

function drawTableText(doc, receipt) {
  writeText(doc, 'ลําดับที่', 55.08, 280.59, 12.37);
  writeText(doc, '(No.)', 58.58, 295.43, 12.37);
  writeText(doc, 'รายการ', 260.56, 280.59, 12.37);
  writeText(doc, '(Description)', 250.1, 295.43, 12.37);
  writeText(doc, 'จํานวนเงิน/บาท', 477.34, 280.59, 12.37);
  writeText(doc, '(Amount/Baht)', 476.12, 295.43, 12.37);

  writeText(doc, '1', 64.88, 315.27, 12.37);

  // ── description: split + wrap ──────────────────────────────
  doc.setFont(FONT_FAMILY, 'normal');
  doc.setFontSize(12.37);
  setRgb(doc, MAIN_TEXT);

  const descMaxWidth = 354; // x2(454.958) - x1(91.357) - padding ~6
  const lineHeight = 12.37 * 1.4; // font-size × line-height
  const descLines = doc.splitTextToSize(legacyAm(receipt.description), descMaxWidth);
  descLines.forEach((line, i) => {
    doc.text(line, pt(93.85), pt(315.27 + i * lineHeight));
  });

  const descBlockHeight = descLines.length * lineHeight;
  // ── amount อยู่กึ่งกลางแนวตั้งของ description block ──────
  const amountY = 315.27 + (descBlockHeight - lineHeight) / 2;
  // ── หรือถ้าต้องการให้ชิดบนเหมือนเดิม ให้ใช้ 315.27 แทน ──

  writeText(doc, receipt.amountLabel, 549.42, amountY, 12.37, { align: 'right' });

  writeText(doc, `รวมเงิน (Total) ${legacyAm(receipt.amountThaiText)}`, 45.37, 600.69, 12.37, {
    bold: true,
  });
  writeText(doc, receipt.amountLabel, 549.42, 600.69, 12.37, {
    align: 'right',
    bold: true,
  });
}

function drawFooter(doc, receipt) {
  writeText(doc, `( ${legacyAm(receipt.collectorName)} )`, 496.5, 658.88, 13, { align: 'center' });
  writeText(doc, '     ผู้รับเงิน (Collector)', 450.71, 674.97, 13);

  writeText(doc, 'URL ตรวจสอบใบเสร็จอิเล็กทรอนิกส์/E-receipt verification URL ', 45, 634.55, 10, {
    color: BLACK,
  });
  writeText(doc, 'https://e-sign.buu.ac.th/verify', 45, 647.12, 10, { color: BLACK });
  writeText(doc, 'หมายเหตุ :', 45, 659.69, 10, { color: BLACK });
  writeText(
    doc,
    '          1.ใบเสร็จรับเงินนี้ได้ดำเนินการด้วยวิธีการทางอิเล็กทรอนิกส์ และผู้ชำระเงินสามารถสแกน QR Code นี้เพื่อตรวจสอบความถูกต้อง/',
    45,
    672.26,
    10,
    { color: BLACK },
  );
  writeText(
    doc,
    '          This receipt was processed electronically, and the person making the payment can scan this QR Code to check its correctness.',
    45,
    684.83,
    10,
    { color: BLACK },
  );
  writeText(
    doc,
    '          2. ใบเสร็จรับเงินฉบับนี้จะสมบูรณ์เมื่อได้รับชำระเงินเรียบร้อยแล้ว และมีลายมือชื่อของผู้รับเงินครบถ้วน/',
    45,
    697.4,
    10,
    { color: BLACK },
  );
  writeText(
    doc,
    "          This receipt will be considered finalized once we have received full payment and the payee's signature is complete.",
    45,
    709.97,
    10,
    { color: BLACK },
  );
  writeText(doc, 'Digitally signed by BUU', 45, 735.11, 10, { color: BLACK });
  writeText(doc, `Date: ${receipt.shortDate}`, 45, 747.68, 10, { color: BLACK });
}

export function createReceiptPdf(receipt, assets) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [RECEIPT_PAGE.width, RECEIPT_PAGE.height],
    precision: 3,
    compress: true,
    putOnlyUsedFonts: true,
  });

  addReceiptFonts(doc, assets);
  const pdfSubject = receipt.isCopy
    ? 'Burapha University receipt copy'
    : 'Burapha University receipt';
  doc.setProperties({
    title: safeReceiptFilename(receipt.receiptFilename, receipt.receiptType),
    subject: pdfSubject,
    creator: 'Burapha University Lifelong Learning',
  });

  drawImages(doc, receipt, assets);
  drawHeader(doc, receipt);
  drawCustomer(doc, receipt);
  drawTable(doc);
  drawTableText(doc, receipt);
  drawFooter(doc, receipt);

  return doc;
}

export function safeReceiptFilename(filenameOrReceiptNo, receiptType = 'R') {
  const baseName = String(filenameOrReceiptNo || 'download').replace(/\.pdf$/i, '');
  const safeBaseName = baseName.replace(/[\\/:*?"<>|]/g, '-');
  const finalName =
    receiptType === 'D' && !safeBaseName.toLowerCase().endsWith('_copy')
      ? `${safeBaseName}_copy`
      : safeBaseName;
  return `${finalName}.pdf`;
}
