<template>
  <q-input
    :model-value="modelValue"
    @update:model-value="handleUpdate(String($event || ''))"
    outlined
    dense
    stack-label
    :label="label"
    :hide-bottom-space="hideBottomSpace"
    :disable="disable"
    class="hero-editor-color-input admin-editor-field"
  >
    <template #append>
      <div class="color-picker-btn cursor-pointer" :style="{ backgroundColor: modelValue }">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <div class="custom-color-picker">
            <div class="palette-grid">
              <div
                v-for="color in standardPalette"
                :key="color"
                class="palette-swatch"
                :style="{ backgroundColor: color }"
                @click="selectColor(color)"
                :class="{ 'palette-swatch--active': modelValue === color }"
              ></div>
            </div>
            <q-separator class="q-my-sm" />
            <q-color
              :model-value="modelValue"
              @update:model-value="handleUpdate(String($event || ''))"
              format-model="hexa"
              no-header
              no-footer
            />
          </div>
        </q-popup-proxy>
      </div>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { onMounted, watch } from 'vue';

const props = defineProps<{
  modelValue: string;
  label?: string;
  hideBottomSpace?: boolean;
  disable?: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
}>();

function formatColor(val: string): string {
  if (!val) return '';
  const trimmed = val.trim();

  if (trimmed.startsWith('#')) {
    return trimmed.toUpperCase();
  }

  if (trimmed.startsWith('rgba') || trimmed.startsWith('rgb')) {
    const match = trimmed.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)/);
    if (match) {
      const r = parseInt(match[1] || '0')
        .toString(16)
        .padStart(2, '0');
      const g = parseInt(match[2] || '0')
        .toString(16)
        .padStart(2, '0');
      const b = parseInt(match[3] || '0')
        .toString(16)
        .padStart(2, '0');
      let a = '';
      if (match[4] !== undefined) {
        const alpha = parseFloat(match[4]);
        if (!isNaN(alpha)) {
          a = Math.round(alpha * 255)
            .toString(16)
            .padStart(2, '0');
        }
      }
      return `#${r}${g}${b}${a}`.toUpperCase();
    }
  }
  return trimmed.toUpperCase();
}

function handleUpdate(val: string) {
  const formatted = formatColor(val);
  if (formatted !== props.modelValue) {
    emit('update:modelValue', formatted);
  }
}

watch(
  () => props.modelValue,
  (newVal) => {
    const formatted = formatColor(newVal);
    if (formatted !== newVal) {
      emit('update:modelValue', formatted);
    }
  },
  { immediate: true },
);

onMounted(() => {
  const formatted = formatColor(props.modelValue);
  if (formatted !== props.modelValue) {
    emit('update:modelValue', formatted);
  }
});

const standardPalette = [
  '#000000',
  '#333333',
  '#666666',
  '#999999',
  '#CCCCCC',
  '#FFFFFF',
  '#FF0000',
  '#FF9900',
  '#FFFF00',
  '#00FF00',
  '#00FFFF',
  '#0000FF',
  '#9900FF',
  '#FF00FF',
  '#F44336',
  '#E91E63',
  '#9C27B0',
  '#673AB7',
  '#3F51B5',
  '#2196F3',
  '#03A9F4',
  '#00BCD4',
  '#009688',
  '#4CAF50',
  '#8BC34A',
  '#CDDC39',
  '#FFEB3B',
  '#FFC107',
  '#FF9800',
  '#FF5722',
  '#795548',
  '#607D8B',
  '#F7D046',
  '#1A237E',
  '#0F766E',
];

function selectColor(color: string) {
  handleUpdate(color);
}
</script>

<style scoped lang="scss">
.color-picker-btn {
  width: 24px;
  height: 24px;
  border-radius: 8px;
  border: 1px solid rgba(16, 35, 63, 0.12);
  box-shadow:
    inset 0 0 0 1px rgba(255, 255, 255, 0.18),
    0 6px 16px rgba(16, 35, 63, 0.08);
}

.custom-color-picker {
  padding: 12px;
  background: white;
  width: 250px;
  border: 1px solid rgba(16, 35, 63, 0.1);
  border-radius: 16px;
  box-shadow: 0 20px 42px rgba(16, 35, 63, 0.12);
}

.palette-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 6px;
}

.palette-swatch {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  cursor: pointer;
  border: 1px solid rgba(16, 35, 63, 0.1);
  transition:
    transform 0.12s ease,
    box-shadow 0.12s ease;
}

.palette-swatch:hover {
  transform: translateY(-1px);
  box-shadow: 0 10px 18px rgba(16, 35, 63, 0.12);
}

.palette-swatch--active {
  outline: 2px solid #f5a623;
  outline-offset: 1px;
}
</style>
