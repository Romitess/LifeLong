<template>
  <div
    v-if="learningResultDocument"
    class="course-document-actions"
    :class="{
      'course-document-actions--stacked': layout === 'stacked',
      'course-document-actions--inline': layout === 'inline',
    }"
  >
    <BaseButton
      outline
      color="primary"
      icon="description"
      no-caps
      :class="buttonClass"
      :label="
        layout === 'stacked'
          ? t('profile.documents.learningResultButtonCompact')
          : t('profile.documents.learningResultButton')
      "
      @click="showLearningResultDialog = true"
    />

    <BaseButton
      outline
      color="amber-8"
      icon="workspace_premium"
      no-caps
      :class="buttonClass"
      :label="
        layout === 'stacked'
          ? t('profile.documents.certificateButtonCompact')
          : t('profile.documents.certificateButton')
      "
      @click="showCertificateDialog = true"
    />

    <CourseLearningResultDialog
      v-model="showLearningResultDialog"
      :document-data="learningResultDocument"
    />

    <CertificateModal
      v-model="showCertificateDialog"
      :course="entry.courseDetail"
      :userName="userName"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth-store';
import BaseButton from 'components/base/BaseButton.vue';
import CertificateModal from 'components/certificate/CertificateModal.vue';
import CourseLearningResultDialog from 'components/course/CourseLearningResultDialog.vue';
import {
  useCourseCompletionDocuments,
  type LearningResultDocumentData,
} from 'src/composables/use-course-completion-documents';
import type { RegisteredCourseEntry } from 'src/composables/use-my-registered-courses';

interface Props {
  entry: RegisteredCourseEntry;
  layout?: 'inline' | 'stacked';
}

const props = withDefaults(defineProps<Props>(), {
  layout: 'inline',
});

const { t, locale } = useI18n({ useScope: 'global' });
const authStore = useAuthStore();
const { buildLearningResultDocument } = useCourseCompletionDocuments();

const showLearningResultDialog = ref(false);
const showCertificateDialog = ref(false);

const learningResultDocument = computed<LearningResultDocumentData | null>(() =>
  buildLearningResultDocument(props.entry),
);

const userName = computed(() => {
  if (!authStore.user) return '';
  return locale.value === 'th'
    ? `${authStore.user.firstNameTh} ${authStore.user.lastNameTh}`
    : `${authStore.user.firstNameEn} ${authStore.user.lastNameEn}`;
});

const buttonClass = computed<string>(() =>
  props.layout === 'stacked'
    ? 'course-document-actions__button course-document-actions__button--stacked'
    : 'course-document-actions__button',
);
</script>

<style lang="scss" scoped>
.course-document-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  &--stacked {
    width: 100%;
    flex-direction: column;
    align-items: stretch;
  }

  &__button {
    min-height: 40px;

    &--stacked {
      width: 100%;
    }
  }
}
</style>
