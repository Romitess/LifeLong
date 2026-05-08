<template>
  <div
    class="hero-slider-field-container admin-editor-slider"
    :class="{ 'hero-slider-field-container--disabled': disable }"
  >
    <label class="hero-slider-floating-label">{{ label }}</label>
    <div class="hero-slider-row">
      <q-slider
        :model-value="displayValue"
        @update:model-value="updateFromDisplay($event)"
        :min="displayMin"
        :max="displayMax"
        :step="displayStep"
        color="primary"
        track-size="3px"
        thumb-size="14px"
        :disable="disable"
        class="col"
      />
      <div class="hero-slider-numeric-area">
        <div class="hero-numeric-box">
          <input
            :value="displayValue"
            @input="onInputEvent"
            type="number"
            class="hero-numeric-native"
            :min="displayMin"
            :max="displayMax"
            :step="displayStep"
            :disabled="disable"
          />
        </div>
        <span v-if="unit" class="hero-unit-suffix">{{ unit }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  modelValue: number;
  label: string;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  isPercentage?: boolean;
  disable?: boolean;
}>();

const emit = defineEmits(['update:modelValue']);

const displayMin = computed(() => (props.isPercentage ? props.min * 100 : props.min));
const displayMax = computed(() => (props.isPercentage ? props.max * 100 : props.max));
const displayStep = computed(() => {
  if (props.step === undefined) return 1;
  return props.isPercentage ? props.step * 100 : props.step;
});

const displayValue = computed(() => {
  const val = props.isPercentage ? props.modelValue * 100 : props.modelValue;
  return Math.round(val * 100) / 100;
});

function updateFromDisplay(val: number | null) {
  if (val === null) return;
  const clamped = Math.min(Math.max(val || 0, displayMin.value), displayMax.value);
  const finalVal = props.isPercentage ? clamped / 100 : clamped;
  emit('update:modelValue', finalVal);
}

function onInputEvent(e: Event) {
  const val = (e.target as HTMLInputElement).valueAsNumber;
  updateFromDisplay(val);
}
</script>

<style scoped>
.hero-slider-field-container {
  position: relative;
  min-height: 72px;
  padding: 18px 14px 10px;
  border: 1px solid rgba(16, 35, 63, 0.14);
  border-radius: 14px;
  background: white;
  display: flex;
  align-items: flex-end;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.hero-slider-field-container:hover {
  border-color: rgba(16, 35, 63, 0.22);
  box-shadow: 0 8px 18px rgba(17, 24, 39, 0.05);
}

.hero-slider-field-container:focus-within {
  border-color: var(--q-primary);
  box-shadow: 0 0 0 4px rgba(245, 166, 35, 0.12);
}

.hero-slider-field-container--disabled {
  opacity: 0.64;
  box-shadow: none;
}

.hero-slider-floating-label {
  position: absolute;
  top: 10px;
  left: 12px;
  background: white;
  padding: 0 2px;
  font-size: 12px;
  font-weight: 700;
  color: #64748b;
  pointer-events: none;
  white-space: nowrap;
  transition: color 0.2s ease;
}

.hero-slider-field-container:focus-within .hero-slider-floating-label {
  color: var(--q-primary);
}

.hero-slider-row {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 12px;
}

.hero-slider-numeric-area {
  display: flex;
  align-items: center;
  gap: 6px;
}

.hero-numeric-box {
  min-width: 70px;
  height: 34px;
  padding: 0 10px;
  border: 1px solid rgba(16, 35, 63, 0.08);
  border-radius: 10px;
  background: #f8fafc;
  display: flex;
  align-items: center;
  justify-content: center;
}

.hero-numeric-native {
  width: 100%;
  border: none;
  background: transparent;
  outline: none;
  text-align: center;
  font-family: inherit;
  font-size: 0.92rem;
  font-weight: 800;
  color: var(--q-primary);
  padding: 0;
}

.hero-unit-suffix {
  font-size: 0.8rem;
  font-weight: 800;
  color: #64748b;
  min-width: 22px;
}

/* Hide spin buttons */
.hero-numeric-native::-webkit-outer-spin-button,
.hero-numeric-native::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.hero-numeric-native[type='number'] {
  -moz-appearance: textfield;
}
</style>
