<template>
  <div class="certificate-placeholder">
    <div class="certificate-placeholder__frame">
      <img :src="buuLogoSvg" alt="Burapha University" class="certificate-placeholder__logo" />
      <div class="certificate-placeholder__eyebrow">Certificate Preview</div>
      <div class="certificate-placeholder__title">เกียรติบัตรกำลังอยู่ระหว่างจัดทำ</div>
      <div class="certificate-placeholder__subtitle">
        ทีมกำลังจัดทำรูปแบบเกียรติบัตรอย่างเป็นทางการสำหรับรายวิชานี้
      </div>

      <div class="certificate-placeholder__course">
        {{ document.courseTitle }}
      </div>
      <div class="certificate-placeholder__course-code">{{ document.courseCode }}</div>

      <div class="certificate-placeholder__learner">สำหรับ {{ document.learnerNameTh }}</div>

      <div class="certificate-placeholder__notice">
        เมื่อระบบเกียรติบัตรพร้อมใช้งาน คุณจะสามารถดาวน์โหลดเอกสารฉบับจริงได้จากหน้านี้
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import buuLogoSvg from 'src/assets/logo-1.svg';
import type { LearningResultDocumentData } from 'src/composables/use-course-completion-documents';

interface Props {
  document: LearningResultDocumentData;
}

defineProps<Props>();
</script>

<style lang="scss" scoped>
.certificate-placeholder {
  display: flex;
  justify-content: center;

  &__frame {
    width: 794px;
    min-height: 1123px;
    padding: 72px 64px;
    background:
      radial-gradient(circle at top, rgba(255, 244, 222, 0.9), rgba(255, 255, 255, 0) 42%),
      linear-gradient(180deg, #fffef8 0%, #ffffff 100%);
    border: 10px solid #d9b25f;
    box-shadow:
      inset 0 0 0 2px rgba(122, 94, 32, 0.18),
      0 24px 60px rgba(36, 50, 74, 0.1);
    color: #2e2b25;
    font-family: 'Noto Sans Thai', 'Sarabun', sans-serif;
    text-align: center;
    box-sizing: border-box;
  }

  &__logo {
    width: 120px;
    height: 120px;
    object-fit: contain;
    margin-bottom: 18px;
  }

  &__eyebrow {
    font-size: 16px;
    letter-spacing: 0.18em;
    text-transform: uppercase;
    color: #8f6f31;
    margin-bottom: 18px;
  }

  &__title {
    font-size: 38px;
    font-weight: 800;
    color: #3e3121;
    margin-bottom: 14px;
  }

  &__subtitle {
    max-width: 520px;
    margin: 0 auto 36px;
    font-size: 19px;
    line-height: 1.8;
    color: #5a4b36;
  }

  &__course {
    font-size: 28px;
    font-weight: 700;
    color: #2f405c;
    line-height: 1.6;
  }

  &__course-code {
    font-size: 18px;
    letter-spacing: 0.06em;
    color: #8f6f31;
    margin-top: 6px;
    margin-bottom: 32px;
  }

  &__learner {
    display: inline-block;
    padding: 12px 28px;
    border-radius: 999px;
    background: rgba(217, 178, 95, 0.12);
    font-size: 24px;
    font-weight: 700;
    color: #3e3121;
    margin-bottom: 36px;
  }

  &__notice {
    max-width: 560px;
    margin: 0 auto;
    padding: 22px 26px;
    border-radius: 24px;
    border: 1px dashed rgba(143, 111, 49, 0.45);
    background: rgba(255, 255, 255, 0.72);
    font-size: 18px;
    line-height: 1.75;
    color: #6b5a43;
  }
}
</style>
