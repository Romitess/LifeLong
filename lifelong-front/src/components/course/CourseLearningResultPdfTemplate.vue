<template>
  <div class="learning-result-pdf">
    <div class="learning-result-pdf__header">
      <img :src="buuLogoSvg" alt="Burapha University" class="learning-result-pdf__logo" />
      <div class="learning-result-pdf__university">มหาวิทยาลัยบูรพา</div>
      <div class="learning-result-pdf__title">หนังสือรับรอง</div>
    </div>

    <div class="learning-result-pdf__body">
      <p class="learning-result-pdf__statement">
        หนังสือฉบับนี้ให้ไว้เพื่อรับรองว่า
        <span class="learning-result-pdf__inline-value">{{ document.learnerNameTh }}</span>
        ได้ลงทะเบียน
        <span class="learning-result-pdf__inline-value">{{ document.courseTitle }}</span>
        รหัสหลักสูตร
        <span class="learning-result-pdf__inline-value">{{ document.courseCode }}</span>
        ระยะเวลาในการเรียนการสอน
        <span class="learning-result-pdf__inline-value">{{ document.courseHours }} ชั่วโมง</span>
        ได้รับผลการเรียน
        <span class="learning-result-pdf__inline-value">{{ document.resultLabel }}</span>
      </p>

      <div class="learning-result-pdf__section-title">ผลลัพธ์การเรียนรู้ (Learning Outcome)</div>

      <ol class="learning-result-pdf__outcomes">
        <li v-for="outcome in document.learningOutcomes" :key="outcome">
          {{ outcome }}
        </li>
      </ol>
    </div>

    <div class="learning-result-pdf__footer">
      <div class="learning-result-pdf__issued-at">ให้ไว้ ณ วันที่ {{ thaiIssuedDate }}</div>

      <div class="learning-result-pdf__signature-block">
        <div class="learning-result-pdf__signature-mark">ลงนามอิเล็กทรอนิกส์</div>
        <div class="learning-result-pdf__signature-line" />
        <div class="learning-result-pdf__registrar-name">{{ document.registrarName }}</div>
        <div v-if="showRegistrarTitle" class="learning-result-pdf__registrar-title">
          {{ document.registrarTitle }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import buuLogoSvg from 'src/assets/logo-1.svg';
import type { LearningResultDocumentData } from 'src/composables/use-course-completion-documents';

interface Props {
  document: LearningResultDocumentData;
}

const props = defineProps<Props>();

const thaiIssuedDate = computed<string>(() => {
  const date = new Date(props.document.issuedAt);
  const month = date.toLocaleDateString('th-TH', { month: 'long' });
  return `${date.getDate()} ${month} พ.ศ. ${date.getFullYear() + 543}`;
});

const showRegistrarTitle = computed<boolean>(
  () =>
    Boolean(props.document.registrarTitle) && props.document.registrarTitle !== 'มหาวิทยาลัยบูรพา',
);
</script>

<style lang="scss" scoped>
.learning-result-pdf {
  width: 794px;
  min-height: 1123px;
  padding: 34px 74px 62px;
  background: #ffffff;
  color: #000000;
  font-family:
    'THSarabunNew', 'TH Sarabun New', 'TH Sarabun PSK', 'Sarabun', 'Noto Sans Thai', sans-serif;
  font-size: 13px;
  line-height: 1.3;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  &__header {
    text-align: center;
  }

  &__logo {
    width: 150px;
    height: 150px;
    object-fit: contain;
    margin-bottom: 12px;
  }

  &__university {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.2;
    margin-bottom: 8px;
    color: #000000;
  }

  &__title {
    font-size: 16px;
    font-weight: 700;
    line-height: 1.2;
    color: #000000;
  }

  &__body {
    margin-top: 30px;
    flex: 1;
  }

  &__statement {
    width: 100%;
    font-size: 13px;
    line-height: 1.45;
    margin: 0;
    text-align: left;
    text-indent: 78px;
  }

  &__inline-value {
    display: inline;
    font-weight: 700;
    color: #000000;
  }

  &__section-title {
    margin-top: 34px;
    margin-bottom: 10px;
    font-size: 16px;
    font-weight: 700;
    color: #000000;
  }

  &__outcomes {
    margin: 0;
    padding-left: 22px;
    font-size: 13px;
    line-height: 1.5;
    color: #000000;
  }

  &__footer {
    margin-top: 28px;
  }

  &__issued-at {
    text-align: center;
    font-size: 13px;
    color: #000000;
    margin-bottom: 52px;
  }

  &__signature-block {
    margin-left: auto;
    width: 180px;
    text-align: center;
    color: #000000;
  }

  &__signature-mark {
    margin: 0 auto 6px;
    color: #3b82f6;
    font-size: 10px;
    font-style: italic;
    transform: rotate(-8deg);
    opacity: 0.64;
  }

  &__signature-line {
    border-bottom: 1px solid rgba(31, 41, 55, 0.4);
    margin-bottom: 10px;
  }

  &__registrar-name {
    font-size: 11px;
    font-weight: 500;
    margin-bottom: 2px;
  }

  &__registrar-title {
    font-size: 10px;
    color: #555555;
  }
}

@font-face {
  font-family: 'THSarabunNew';
  src: url('https://cdn.jsdelivr.net/gh/itds-consulting/thai-fonts/fonts/THSarabunNew.ttf')
    format('truetype');
}

@font-face {
  font-family: 'THSarabunNew';
  font-weight: 700;
  src: url('https://cdn.jsdelivr.net/gh/itds-consulting/thai-fonts/fonts/THSarabunNew%20Bold.ttf')
    format('truetype');
}
</style>
