<template>
  <q-dialog v-model="isVisible" maximized transition-show="scale" transition-hide="scale">
    <q-card class="certificate-dialog bg-grey-2">
      <q-card-section class="flex flex-center q-pa-md scroll cert-container-section">
        <div id="certificate-print-area" class="certificate-wrapper shadow-10 bg-white">
          <svg class="bg-graphics" viewBox="0 0 1000 707" preserveAspectRatio="none">
            <path d="M0,707 L280,707 Q120,600 0,580 Z" fill="#ffe600" />
            <path d="M1000,400 Q780,480 480,707 L540,707 Q800,500 1000,430 Z" fill="#d3d4d4" />
            <path d="M1000,430 Q800,500 540,707 L1000,707 Z" fill="#ffe600" />
            <path d="M0,55 Q500,160 1000,40 L1000,70 Q500,190 0,85 Z" fill="#d3d4d4" />
            <path d="M0,0 L1000,0 L1000,40 Q500,160 0,55 Z" fill="#ffe600" />
          </svg>

          <div class="watermark-buu">BUU</div>

          <div class="cert-content relative-position">
            <img src="~assets/logo-1.svg" alt="BUU Seal" class="uni-seal" />

            <div class="uni-title">มหาวิทยาลัยบูรพา</div>
            <div class="cert-subtitle">ขอมอบประกาศนียบัตรฉบับนี้เพื่อแสดงว่า</div>

            <div class="recipient-name">{{ userName }}</div>

            <div class="cert-status">ผ่านการประเมิน จากการเข้าร่วมในหลักสูตร</div>

            <div class="course-name">{{ course?.title || 'หลักสูตรทดสอบ' }}</div>

            <div class="organizer">จัดโดย {{ course?.faculty || 'สำนักคอมพิวเตอร์' }}</div>
          </div>

          <div class="cert-footer">
            <div class="footer-left text-grey-7">
              เอกสารนี้ลงนามด้วยลายเซ็นอิเล็กทรอนิกส์ ตรวจสอบได้ที่
              (https://e-sign.buu.ac.th/verify)
            </div>

            <div class="footer-center flex column items-center">
              <div class="signature-box"></div>
              <div class="sign-line"></div>
              <div class="sign-position">อธิการบดีมหาวิทยาลัยบูรพา</div>
            </div>

            <div class="footer-right text-grey-8">ให้ไว้ ณ วันที่ {{ formattedShortDate }}</div>
          </div>

          <div class="footer-bottom-en text-grey-6">BURAPHA UNIVERSITY</div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="bg-white q-py-md sticky-actions hide-on-print">
        <q-btn flat color="grey-8" label="ปิด" v-close-popup class="q-px-lg" />
        <q-btn
          unelevated
          color="primary"
          icon="print"
          label="พิมพ์ใบประกาศนียบัตร"
          class="q-px-xl text-weight-bold"
          @click="printCertificate"
        />
        <q-btn
          unelevated
          color="positive"
          icon="download"
          label="ดาวน์โหลด PDF"
          class="q-px-xl text-weight-bold"
          :loading="downloading"
          @click="downloadCertificate"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import type { Course } from 'src/types/course';

type CertificateCourse = Pick<Course, 'title' | 'faculty'>;

const props = defineProps<{
  modelValue: boolean;
  course: CertificateCourse | null;
  userName: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
}>();

const isVisible = computed({
  get: () => props.modelValue,
  set: (value: boolean) => emit('update:modelValue', value),
});

const formattedShortDate = computed(() => {
  const d = new Date();
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear() + 543;
  return `${day}/${month}/${year}`;
});

const downloading = ref(false);

function printCertificate(): void {
  window.print();
}

async function downloadCertificate(): Promise<void> {
  const el = document.getElementById('certificate-print-area');
  if (!el) return;
  downloading.value = true;
  try {
    const canvas = await html2canvas(el, { scale: 2, useCORS: true, backgroundColor: '#ffffff' });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    pdf.addImage(imgData, 'PNG', 0, 0, pageW, pageH);
    const filename = `certificate-${(props.course?.title ?? 'course').replace(/\s+/g, '_')}.pdf`;
    pdf.save(filename);
  } finally {
    downloading.value = false;
  }
}
</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@300;400;600;700&display=swap');

.certificate-dialog {
  min-width: 100vw;
  font-family: 'Sarabun', sans-serif;
}

.certificate-wrapper {
  width: 100%;
  max-width: 1050px;
  aspect-ratio: 1.414;
  background: #fff;
  position: relative;
  margin: 0 auto;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.bg-graphics {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  pointer-events: none;
}

.watermark-buu {
  position: absolute;
  left: -2%;
  top: 50%;
  transform: translateY(-50%) rotate(-90deg);
  font-size: clamp(80px, 20vw, 280px);
  font-family: Arial, Helvetica, sans-serif;
  font-weight: 900;
  color: transparent;
  -webkit-text-stroke: clamp(1px, 0.2vw, 3px) rgba(0, 0, 0, 0.04);
  z-index: 2;
  user-select: none;
}

.cert-content {
  z-index: 10;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 10%;
  margin-top: 2%;
  padding-bottom: clamp(60px, 10vw, 100px);
}

.uni-seal {
  width: clamp(60px, 10vw, 110px);
  margin-bottom: clamp(10px, 2vw, 20px);
}

.uni-title {
  font-size: clamp(16px, 3vw, 34px);
  font-weight: 700;
  color: #333;
  margin-bottom: clamp(4px, 1vw, 10px);
}

.cert-subtitle {
  font-size: clamp(10px, 1.6vw, 18px);
  color: #555;
  margin-bottom: clamp(10px, 2vw, 25px);
}

.recipient-name {
  font-size: clamp(18px, 3.5vw, 40px);
  font-weight: 700;
  color: #333;
  margin-bottom: clamp(10px, 2vw, 25px);
}

.cert-status {
  font-size: clamp(10px, 1.6vw, 18px);
  color: #555;
  margin-bottom: clamp(8px, 1.6vw, 20px);
}

.course-name {
  font-size: clamp(14px, 2.6vw, 30px);
  font-weight: 700;
  color: #333;
  margin-bottom: clamp(6px, 1.2vw, 15px);
}

.organizer {
  font-size: clamp(10px, 1.5vw, 16px);
  color: #666;
}

.cert-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 10;
  padding: 0 clamp(20px, 4vw, 40px) clamp(15px, 3vw, 35px);
  width: 100%;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: end;
}

.footer-left {
  font-size: clamp(6px, 1vw, 11px);
}

.footer-center {
  margin-bottom: 5px;
  justify-self: center;
}

.footer-right {
  font-size: clamp(8px, 1.3vw, 14px);
  text-align: right;
  margin-bottom: 5px;
}

.signature-box {
  height: clamp(30px, 5vw, 60px);
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.sign-img {
  max-height: 120%;
  mix-blend-mode: multiply;
  margin-bottom: -10px;
}

.sign-line {
  width: clamp(120px, 20vw, 220px);
  height: 1px;
  background: #999;
  margin: 5px 0;
}

.sign-position {
  font-size: clamp(9px, 1.4vw, 15px);
  color: #555;
}

.footer-bottom-en {
  position: absolute;
  bottom: clamp(5px, 1vw, 15px);
  left: 0;
  width: 100%;
  text-align: center;
  font-size: clamp(10px, 1.8vw, 20px);
  letter-spacing: 1px;
  z-index: 10;
}

@media print {
  @page {
    size: A4 landscape;
    margin: 0;
  }

  body * {
    visibility: hidden !important;
  }

  #certificate-print-area,
  #certificate-print-area * {
    visibility: visible !important;
  }

  #certificate-print-area {
    position: fixed !important;
    left: 0 !important;
    top: 0 !important;
    width: 297mm !important;
    height: 210mm !important;
    max-width: none !important;
    margin: 0 !important;
    padding: 0 !important;
    transform: none !important;
    box-shadow: none !important;
    border-radius: 0 !important;
    background-color: white !important;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
    z-index: 999999 !important;
  }
}
</style>
