<template>
  <div class="base-date-range-filter">
    <div v-if="label" class="base-date-range-filter__label">{{ label }}</div>
    <div class="base-date-range-filter__row">
      <q-input
        class="base-date-range-filter__input"
        :model-value="modelValue.start"
        :mask="inputMask"
        outlined
        dense
        clearable
        :hint="fromHint"
        @update:model-value="onStartUpdate"
      >
        <template #append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="startProxy" cover transition-show="scale" transition-hide="scale">
              <q-date
                :model-value="modelValue.start"
                :mask="dateMask"
                color="primary"
                :locale="dateLocale"
                @update:model-value="onStartPicked"
              />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
      <q-input
        ref="endInputRef"
        class="base-date-range-filter__input"
        :model-value="modelValue.end"
        :mask="inputMask"
        outlined
        dense
        clearable
        :hint="toHint"
        :rules="[endDateRule]"
        hide-bottom-space
        @update:model-value="onEndUpdate"
      >
        <template #append>
          <q-icon name="event" class="cursor-pointer">
            <q-popup-proxy ref="endProxy" cover transition-show="scale" transition-hide="scale">
              <q-date
                :model-value="modelValue.end"
                :mask="dateMask"
                color="primary"
                :locale="dateLocale"
                :options="endDateOptions"
                @update:model-value="onEndPicked"
              />
            </q-popup-proxy>
          </q-icon>
        </template>
      </q-input>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue';
import type { QInput, QPopupProxy } from 'quasar';
import { useDateLocale } from 'src/composables/use-date-locale';

export interface DateRangeValue {
  start: string | null;
  end: string | null;
}

interface Props {
  modelValue: DateRangeValue;
  label?: string;
  fromHint?: string;
  toHint?: string;
  inputMask?: string;
  dateMask?: string;
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  fromHint: '',
  toHint: '',
  inputMask: '##/##/####',
  dateMask: 'DD/MM/YYYY',
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: DateRangeValue): void;
}>();

const dateLocale = useDateLocale();
const startProxy = ref<QPopupProxy | null>(null);
const endProxy = ref<QPopupProxy | null>(null);
const endInputRef = ref<QInput | null>(null);

watch(
  () => props.modelValue.start,
  () => {
    if (props.modelValue.end) void nextTick(() => endInputRef.value?.validate());
  },
);

// DD/MM/YYYY → YYYY/MM/DD for comparison
function toComparable(ddmmyyyy: string): string {
  const [d, m, y] = ddmmyyyy.split('/');
  if (!d || !m || !y || y.length < 4) return '';
  return `${y}/${m}/${d}`;
}

function endDateOptions(dateStr: string): boolean {
  const start = props.modelValue.start;
  if (!start || start.length < 10) return true;
  return dateStr >= toComparable(start);
}

const endDateRule = (v: string | null): true | string => {
  if (!v || v.length < 10) return true;
  const start = props.modelValue.start;
  if (!start || start.length < 10) return true;
  return toComparable(v) >= toComparable(start) || 'วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น';
};

function emitUpdate(next: DateRangeValue): void {
  emit('update:modelValue', next);
}

function onStartUpdate(value: string | number | null): void {
  emitUpdate({ ...props.modelValue, start: value === null ? null : String(value) });
}

function onEndUpdate(value: string | number | null): void {
  emitUpdate({ ...props.modelValue, end: value === null ? null : String(value) });
}

function onStartPicked(value: string | null): void {
  emitUpdate({ ...props.modelValue, start: value });
  startProxy.value?.hide();
}

function onEndPicked(value: string | null): void {
  emitUpdate({ ...props.modelValue, end: value });
  endProxy.value?.hide();
}
</script>

<style lang="scss" scoped>
.base-date-range-filter__label {
  margin-bottom: 6px;
  color: #6b7280;
  font-size: 0.78rem;
  font-weight: 600;
}

.base-date-range-filter__row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  gap: 8px;
}

.base-date-range-filter__input {
  flex: 1 1 150px;
  min-width: 150px;
}
</style>
