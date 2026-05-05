<template>
  <CourseDocumentPreviewDialog v-model="dialogModel" @hide="emit('hide')">
    <template #content>
      <div ref="printableAreaRef" class="course-learning-result-dialog__printable">
        <CourseLearningResultPdfTemplate :document="documentData" />
      </div>
    </template>

    <template #actions>
      <BaseButton
        flat
        color="grey-7"
        no-caps
        :label="t('profile.documents.closeDocument')"
        @click="dialogModel = false"
      />
      <BaseButton
        color="primary"
        icon="print"
        no-caps
        :label="t('profile.documents.printLearningResult')"
        @click="printLearningResult"
      />
    </template>
  </CourseDocumentPreviewDialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import BaseButton from 'components/base/BaseButton.vue';
import CourseDocumentPreviewDialog from 'components/course/CourseDocumentPreviewDialog.vue';
import CourseLearningResultPdfTemplate from 'components/course/CourseLearningResultPdfTemplate.vue';
import type { LearningResultDocumentData } from 'src/composables/use-course-completion-documents';

interface Props {
  modelValue: boolean;
  documentData: LearningResultDocumentData;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'hide'): void;
}>();

const { t } = useI18n({ useScope: 'global' });
const $q = useQuasar();
const printableAreaRef = ref<HTMLElement | null>(null);

const dialogModel = computed<boolean>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getPrintStyles(): string {
  return `
    @font-face {
      font-family: 'THSarabunNew';
      src: url('https://cdn.jsdelivr.net/gh/itds-consulting/thai-fonts/fonts/THSarabunNew.ttf') format('truetype');
    }
    @font-face {
      font-family: 'THSarabunNew';
      font-weight: 700;
      src: url('https://cdn.jsdelivr.net/gh/itds-consulting/thai-fonts/fonts/THSarabunNew%20Bold.ttf') format('truetype');
    }
    :root { color-scheme: light; }
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    html, body {
      margin: 0;
      padding: 0;
      background: #ffffff;
    }
    body {
      font-family: 'THSarabunNew', 'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', 'Noto Sans Thai', sans-serif;
      color: #000;
      font-size: 14px;
      line-height: 1.3;
    }
    .print-page {
      width: 210mm;
      min-height: 297mm;
      margin: 0 auto;
      padding: 0;
      background: #ffffff;
    }
    .learning-result-pdf {
      width: 210mm;
      min-height: 297mm;
      padding: 9mm 18mm 16mm;
      background: #ffffff;
      color: #000000;
      font-family: 'THSarabunNew', 'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', 'Noto Sans Thai', sans-serif;
      font-size: 13px;
      line-height: 1.3;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    .learning-result-pdf__header {
      text-align: center;
    }
    .learning-result-pdf__logo {
      width: 38mm;
      height: 38mm;
      object-fit: contain;
      margin-bottom: 3mm;
    }
    .learning-result-pdf__university {
      font-size: 16px;
      font-weight: 700;
      line-height: 1.2;
      margin-bottom: 2mm;
      color: #000000;
    }
    .learning-result-pdf__title {
      font-size: 16px;
      font-weight: 700;
      line-height: 1.2;
      color: #000000;
    }
    .learning-result-pdf__body {
      margin-top: 10mm;
      flex: 1;
    }
    .learning-result-pdf__statement {
      width: 100%;
      font-size: 13px;
      line-height: 1.45;
      margin: 0;
      text-align: left;
      text-indent: 78px;
    }
    .learning-result-pdf__inline-value {
      display: inline;
      font-weight: 700;
      color: #000000;
    }
    .learning-result-pdf__section-title {
      margin-top: 9mm;
      margin-bottom: 3mm;
      font-size: 16px;
      font-weight: 700;
      color: #000000;
    }
    .learning-result-pdf__outcomes {
      margin: 0;
      padding-left: 8mm;
      font-size: 13px;
      line-height: 1.5;
      color: #000000;
    }
    .learning-result-pdf__footer {
      margin-top: 8mm;
    }
    .learning-result-pdf__issued-at {
      text-align: center;
      font-size: 13px;
      color: #000000;
      margin-bottom: 14mm;
    }
    .learning-result-pdf__signature-block {
      margin-left: auto;
      width: 48mm;
      text-align: center;
      color: #000000;
    }
    .learning-result-pdf__signature-mark {
      margin: 0 auto 2mm;
      color: #3b82f6;
      font-size: 10px;
      font-style: italic;
      transform: rotate(-8deg);
      opacity: 0.64;
    }
    .learning-result-pdf__signature-line {
      border-bottom: 1px solid rgba(31, 41, 55, 0.4);
      margin-bottom: 3mm;
    }
    .learning-result-pdf__registrar-name {
      font-size: 11px;
      font-weight: 500;
      margin-bottom: 1mm;
    }
    .learning-result-pdf__registrar-title {
      font-size: 10px;
      color: #555555;
    }
    @page {
      size: A4;
      margin: 0;
    }
  `;
}

function printLearningResult(): void {
  if (typeof window === 'undefined' || !printableAreaRef.value) {
    return;
  }

  const printWindow = window.open('', '_blank', 'width=950,height=1280');

  if (!printWindow) {
    $q.notify({
      type: 'negative',
      message: t('profile.notifications.documentPreviewBlocked'),
      position: 'top',
    });
    return;
  }

  const printableTitle = escapeHtml(props.documentData.filename.replace(/\.pdf$/i, ''));
  const printableContent = printableAreaRef.value.innerHTML;

  printWindow.document.write(`<!doctype html>
<html lang="th">
  <head>
    <meta charset="utf-8" />
    <title>${printableTitle}</title>
    <style>${getPrintStyles()}</style>
  </head>
  <body>
    <div class="print-page">${printableContent}</div>
  </body>
</html>`);

  printWindow.document.close();
  printWindow.focus();

  printWindow.onload = () => {
    window.setTimeout(() => {
      printWindow.print();
    }, 300);
  };
}
</script>

<style lang="scss" scoped>
.course-learning-result-dialog__printable {
  display: flex;
  justify-content: center;
}
</style>
