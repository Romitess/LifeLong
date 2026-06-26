<template>
  <q-dialog v-model="isVisible" maximized transition-show="scale" transition-hide="scale">
    <q-card class="certificate-dialog bg-grey-3">
      <q-card-section class="flex flex-center q-pa-md scroll cert-container-section">
        <div id="certificate-print-area" class="certificate-wrapper shadow-10">
          <template v-if="props.template?.url">
            <!-- Background image -->
            <img
              :src="props.template.url"
              alt="certificate background"
              class="cert-bg-img"
              crossorigin="anonymous"
              draggable="false"
            />

            <!-- Text overlays positioned by layout -->
            <div class="cert-field cert-field--recipient" :style="fieldStyle('recipient')">
              {{ userName }}
            </div>

            <div class="cert-field cert-field--course" :style="fieldStyle('course')">
              {{ course?.title || '' }}
            </div>

            <div class="cert-field cert-field--date" :style="fieldStyle('date')">
              {{ formattedShortDate }}
            </div>
          </template>

          <!-- No template selected -->
          <div v-else class="cert-no-template">
            <q-icon name="workspace_premium" size="48px" color="grey-4" />
            <p>ไม่มีรูปแบบ Certificate</p>
          </div>
        </div>
      </q-card-section>

      <q-card-actions align="center" class="bg-white q-py-md sticky-actions hide-on-print">
        <div v-if="props.template" class="cert-modal-template-badge">
          <q-icon name="workspace_premium" size="14px" color="amber-8" />
          {{ props.template.name }}
        </div>
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
import type { ActiveCertTemplate, CertLayout } from 'src/types/admin-cert-templates';
import { DEFAULT_LAYOUT } from 'src/types/admin-cert-templates';
import { api } from 'src/boot/axios';

type CertificateCourse = Pick<Course, 'title' | 'faculty'>;

const props = defineProps<{
  modelValue: boolean;
  course: CertificateCourse | null;
  userName: string;
  template?: ActiveCertTemplate | null;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  downloaded: [];
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

const layout = computed<CertLayout>(() => props.template?.layout ?? DEFAULT_LAYOUT);

function fieldStyle(key: keyof CertLayout): Record<string, string> {
  const f = layout.value[key];
  return {
    top: `${f.top}%`,
    left: `${f.left}%`,
    fontSize: `clamp(${Math.max(8, f.fontSize * 0.5)}px, ${f.fontSize * 0.12}vw, ${f.fontSize}px)`,
    color: f.color,
    fontWeight: f.bold ? '700' : '400',
    textAlign: f.align,
    transform:
      f.align === 'center'
        ? 'translate(-50%, -50%)'
        : f.align === 'right'
          ? 'translate(-100%, -50%)'
          : 'translate(0%, -50%)',
  };
}

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

    void api.post('/api/lltcertificatelog', { cldevice: navigator.userAgent }).catch(() => {});
    emit('downloaded');
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
}

.cert-bg-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  display: block;
  user-select: none;
}

.cert-field {
  position: absolute;
  white-space: pre-wrap;
  word-break: break-word;
  max-width: 80%;
  line-height: 1.35;
  font-family: 'Sarabun', 'TH Sarabun New', sans-serif;
  pointer-events: none;
}

.cert-no-template {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #94a3b8;
  font-size: 1rem;
  background: #f8fafc;
}

.cert-modal-template-badge {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 12px;
  border-radius: 999px;
  background: rgba(245, 166, 35, 0.12);
  color: #92400e;
  font-size: 0.78rem;
  font-weight: 700;
  margin-right: 8px;
}

.sticky-actions {
  position: sticky;
  bottom: 0;
  z-index: 20;
  box-shadow: 0 -2px 12px rgba(0, 0, 0, 0.08);
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
