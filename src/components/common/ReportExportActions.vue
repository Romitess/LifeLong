<template>
  <div class="report-export-actions">
    <q-btn
      outline
      color="negative"
      icon="picture_as_pdf"
      :label="pdfLabel"
      @click="$emit('export-pdf')"
    />
    <q-btn
      outline
      color="positive"
      icon="table_chart"
      :label="excelLabel"
      @click="$emit('export-excel')"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  pdfLabel?: string;
  excelLabel?: string;
}

withDefaults(defineProps<Props>(), {
  pdfLabel: 'PDF',
  excelLabel: 'Excel',
});

defineEmits<{
  'export-pdf': [];
  'export-excel': [];
}>();
</script>

<style scoped lang="scss">
.report-export-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
</style>
