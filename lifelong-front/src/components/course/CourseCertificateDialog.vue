<template>
  <CourseDocumentPreviewDialog v-model="dialogModel" @hide="emit('hide')">
    <template #content>
      <CourseCertificatePlaceholderTemplate :document="documentData" />
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
        color="amber-8"
        icon="workspace_premium"
        no-caps
        disable
        :label="t('profile.documents.downloadSoon')"
      />
    </template>
  </CourseDocumentPreviewDialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseButton from 'components/base/BaseButton.vue';
import CourseCertificatePlaceholderTemplate from 'components/course/CourseCertificatePlaceholderTemplate.vue';
import CourseDocumentPreviewDialog from 'components/course/CourseDocumentPreviewDialog.vue';
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

const dialogModel = computed<boolean>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>
