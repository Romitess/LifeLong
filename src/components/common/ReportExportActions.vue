<template>
  <div class="report-export-actions">
    <q-btn
      outline
      color="negative"
      icon="picture_as_pdf"
      :label="pdfLabel"
      @click="$emit('export-pdf')"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  pdfLabel?: string;
}

withDefaults(defineProps<Props>(), {
  pdfLabel: 'PDF',
});

defineEmits<{
  'export-pdf': [];
}>();
</script>

<style scoped lang="scss">
.report-export-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
