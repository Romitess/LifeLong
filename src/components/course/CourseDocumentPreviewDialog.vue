<template>
  <q-dialog
    v-model="dialogModel"
    transition-show="scale"
    transition-hide="scale"
    @hide="emit('hide')"
  >
    <q-card class="course-document-dialog column no-wrap bg-white">
      <q-card-section class="course-document-dialog__body q-pa-lg col scroll bg-grey-1">
        <slot name="content" />
      </q-card-section>

      <q-card-actions align="center" class="course-document-dialog__actions q-pa-md bg-grey-1">
        <slot name="actions" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'hide'): void;
}>();

const dialogModel = computed<boolean>({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
});
</script>

<style lang="scss" scoped>
.course-document-dialog {
  width: 850px;
  max-width: 95vw;
  max-height: 90vh;
  border-radius: 24px !important;
  overflow: hidden;

  &__body {
    border-bottom: 1px solid rgba(17, 24, 39, 0.08);
  }

  &__actions {
    border-top: 1px solid rgba(17, 24, 39, 0.08);
    gap: 12px;
  }
}
</style>
