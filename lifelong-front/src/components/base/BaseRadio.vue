<template>
  <q-radio
    v-model="model"
    :val="val"
    :class="['base-choice-control', 'base-radio-control', attrs.class]"
    v-bind="radioAttrs"
  >
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </q-radio>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';

// Shared radio wrapper for admin/forms. Keeps q-radio val/color/disable/listener
// behavior intact while centralizing field usage.
defineOptions({ inheritAttrs: false });

defineProps<{
  val: string | number | boolean | null | undefined;
}>();

const model = defineModel<string | number | boolean | null | undefined>();
const attrs = useAttrs();
const radioAttrs = computed(() => {
  const rest = { ...attrs };
  delete rest.class;
  return rest;
});
</script>

<style lang="scss">
.base-radio-control .q-focus-helper,
body.desktop .q-radio.base-radio-control:not(.disabled) .q-radio__inner::before,
body.desktop .q-radio.base-radio-control:not(.disabled):focus .q-radio__inner::before,
body.desktop .q-radio.base-radio-control:not(.disabled):hover .q-radio__inner::before {
  background: transparent !important;
  content: none !important;
  display: none !important;
  opacity: 0 !important;
  transform: none !important;
}
</style>
