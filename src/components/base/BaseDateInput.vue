<template>
  <q-input
    ref="inputRef"
    :model-value="displayValue"
    outlined
    dense
    mask="##/##/####"
    :rules="computedRules"
    hide-bottom-space
    v-bind="$attrs"
    @update:model-value="onInput"
  >
    <template #append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy ref="proxyRef" cover transition-show="scale" transition-hide="scale">
          <q-date
            :model-value="displayValue"
            mask="DD/MM/YYYY"
            color="primary"
            :locale="dateLocale"
            :options="options"
            @update:model-value="onPicked"
          />
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { QInput, QPopupProxy } from 'quasar';
import { useDateLocale } from 'src/composables/use-date-locale';

defineOptions({ inheritAttrs: false });

interface Props {
  modelValue: string;
  /**
   * 'DD/MM/YYYY' (default) — model value is stored as DD/MM/YYYY
   * 'YYYY-MM-DD'            — model value is stored as YYYY-MM-DD (backend-friendly)
   */
  valueFormat?: 'DD/MM/YYYY' | 'YYYY-MM-DD';
  rules?: ((v: string) => boolean | string)[];
  /** q-date options callback — receives YYYY/MM/DD strings (q-date internal format) */
  options?: (date: string) => boolean;
}

const props = withDefaults(defineProps<Props>(), {
  valueFormat: 'DD/MM/YYYY',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const dateLocale = useDateLocale();
const inputRef = ref<QInput | null>(null);
const proxyRef = ref<QPopupProxy | null>(null);

// Display always DD/MM/YYYY; model stored in valueFormat
const displayValue = computed(() => {
  const v = props.modelValue;
  if (!v) return '';
  if (props.valueFormat === 'YYYY-MM-DD' && v.length === 10 && v.includes('-')) {
    const [y, m, d] = v.split('-');
    return `${d}/${m}/${y}`;
  }
  return v;
});

function toModelValue(ddmmyyyy: string): string {
  if (props.valueFormat === 'YYYY-MM-DD' && ddmmyyyy.length === 10) {
    const [d, m, y] = ddmmyyyy.split('/');
    return `${y}-${m}-${d}`;
  }
  return ddmmyyyy;
}

// Wrap parent rules to validate display value, not model value
const computedRules = computed(() => {
  if (!props.rules) return undefined;
  return props.rules.map((rule) => (v: string) => rule(toModelValue(v)));
});

function onInput(val: string | number | null) {
  emit('update:modelValue', toModelValue(String(val ?? '')));
}

function onPicked(val: string | null) {
  if (val) emit('update:modelValue', toModelValue(val));
  proxyRef.value?.hide();
}

function validate(): boolean | Promise<boolean> {
  return inputRef.value?.validate() ?? true;
}

defineExpose({ validate });
</script>
