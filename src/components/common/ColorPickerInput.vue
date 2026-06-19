<template>
  <BaseInput
    :model-value="displayValue"
    @update:model-value="handleTextInput(String($event || ''))"
    :label="label"
    :required="required"
    :hide-bottom-space="hideBottomSpace"
    :disable="disable"
    :rules="resolvedRules"
    :maxlength="maxInputLength"
    class="hero-editor-color-input admin-editor-field"
    @blur="commitDisplayValue"
  >
    <template #append>
      <div class="color-picker-btn cursor-pointer" :style="{ backgroundColor: previewColor }">
        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
          <div class="custom-color-picker" @mousedown.stop @touchstart.stop @selectstart.prevent>
            <div class="palette-grid">
              <div
                v-for="color in standardPalette"
                :key="color"
                class="palette-swatch"
                :style="{ backgroundColor: color }"
                @click="selectColor(color)"
                :class="{ 'palette-swatch--active': previewColor === color }"
              ></div>
            </div>
            <q-separator class="q-my-sm" />
            <q-color
              :model-value="previewColor"
              @update:model-value="commitColor(String($event || ''))"
              :format-model="allowAlpha ? 'hexa' : 'hex'"
              no-header
              no-footer
            />
          </div>
        </q-popup-proxy>
      </div>
    </template>
  </BaseInput>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ValidationRule } from 'quasar';
import BaseInput from 'components/base/BaseInput.vue';

const props = withDefaults(
  defineProps<{
    modelValue: string;
    label?: string;
    required?: boolean;
    allowAlpha?: boolean;
    rules?: ValidationRule[];
    hideBottomSpace?: boolean;
    disable?: boolean;
  }>(),
  {
    label: '',
    required: false,
    allowAlpha: false,
    rules: () => [],
    hideBottomSpace: false,
    disable: false,
  },
);

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void;
}>();

const displayValue = ref(formatColor(props.modelValue));
const lastValidColor = ref(
  isCompleteHexColor(props.modelValue) ? formatColor(props.modelValue) : '',
);

const resolvedRules = computed<ValidationRule[]>(() => [colorRule, ...props.rules]);

const maxInputLength = computed(() => (props.allowAlpha ? 9 : 7));
const previewColor = computed(() =>
  isCompleteHexColor(displayValue.value) ? formatColor(displayValue.value) : lastValidColor.value,
);

function formatColor(val: string): string {
  if (!val) return '';
  const trimmed = val.trim();

  if (trimmed.startsWith('#')) {
    return trimmed.toUpperCase();
  }

  if (/^[0-9A-F]{6}([0-9A-F]{2})?$/i.test(trimmed)) {
    return `#${trimmed.toUpperCase()}`;
  }

  const rgbMatch = trimmed.match(
    /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*([\d.]+)\s*)?\)$/i,
  );
  if (rgbMatch) {
    if (!props.allowAlpha && rgbMatch[4] !== undefined && Number(rgbMatch[4]) < 1) {
      return trimmed;
    }

    const r = parseInt(rgbMatch[1] || '0')
      .toString(16)
      .padStart(2, '0');
    const g = parseInt(rgbMatch[2] || '0')
      .toString(16)
      .padStart(2, '0');
    const b = parseInt(rgbMatch[3] || '0')
      .toString(16)
      .padStart(2, '0');
    let a = '';
    if (props.allowAlpha && rgbMatch[4] !== undefined) {
      const alpha = parseFloat(rgbMatch[4]);
      if (!isNaN(alpha)) {
        a = Math.round(alpha * 255)
          .toString(16)
          .padStart(2, '0');
      }
    }
    return `#${r}${g}${b}${a}`.toUpperCase();
  }

  return trimmed.toUpperCase();
}

function hasAlpha(value: string): boolean {
  const trimmed = value.trim();
  if (/^#?[0-9A-F]{8}$/i.test(trimmed)) return true;
  const rgbaMatch = trimmed.match(/rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*([\d.]+)\s*\)/i);
  return rgbaMatch ? Number(rgbaMatch[1]) < 1 : false;
}

function colorRule(value: string | number | FileList | null | undefined): true | string {
  const rawValue = typeof value === 'string' || typeof value === 'number' ? String(value) : '';
  if (!props.allowAlpha && hasAlpha(rawValue)) {
    return 'สีหมวดหมู่ไม่รองรับความโปร่งใส กรุณาใช้ HEX 6 หลัก เช่น #6B7280';
  }

  const normalized = formatColor(rawValue);
  if (!normalized) return props.required ? 'กรุณาระบุสี' : true;

  const pattern = props.allowAlpha ? /^#[0-9A-F]{6}([0-9A-F]{2})?$/i : /^#[0-9A-F]{6}$/i;
  return pattern.test(normalized)
    ? true
    : props.allowAlpha
      ? 'กรุณาระบุสีเป็น HEX เช่น #6B7280 หรือ #6B7280CC'
      : 'กรุณาระบุสีเป็น HEX 6 หลัก เช่น #6B7280';
}

function isCompleteHexColor(value: string): boolean {
  const trimmed = value.trim();
  const pattern = props.allowAlpha ? /^#?[0-9A-F]{6}([0-9A-F]{2})?$/i : /^#?[0-9A-F]{6}$/i;
  return pattern.test(trimmed);
}

function limitColorInput(value: string): string {
  const trimmed = value.trim();
  if (!/^#?[0-9A-F]*$/i.test(trimmed)) {
    return trimmed.slice(0, maxInputLength.value);
  }

  if (trimmed.startsWith('#')) {
    return `#${trimmed.slice(1, maxInputLength.value).toUpperCase()}`;
  }

  return trimmed.slice(0, maxInputLength.value - 1).toUpperCase();
}

function handleTextInput(value: string): void {
  displayValue.value = limitColorInput(value);
  if (isCompleteHexColor(displayValue.value)) {
    const formatted = formatColor(displayValue.value);
    lastValidColor.value = formatted;
    emit('update:modelValue', formatted);
    return;
  }

  emit('update:modelValue', displayValue.value);
}

function commitColor(value: string): void {
  const formatted = formatColor(value);
  displayValue.value = formatted;
  if (isCompleteHexColor(formatted)) lastValidColor.value = formatted;
  emit('update:modelValue', formatted);
}

function commitDisplayValue(): void {
  if (!isCompleteHexColor(displayValue.value)) return;
  commitColor(displayValue.value);
}

watch(
  () => props.modelValue,
  (newVal) => {
    const formatted = formatColor(newVal);
    if (isCompleteHexColor(formatted)) lastValidColor.value = formatted;
    if (formatted !== displayValue.value) displayValue.value = formatted;
  },
  { immediate: true },
);

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
  commitColor(color);
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
  user-select: none;
  -webkit-user-select: none;
  touch-action: none;
}

.custom-color-picker :deep(*) {
  user-select: none;
  -webkit-user-select: none;
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
