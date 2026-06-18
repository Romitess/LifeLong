<template>
  <div class="base-field" :class="attrs.class">
    <label v-if="label" class="base-field__label">
      <span>{{ label }}</span>
      <span v-if="required" class="base-field__required">*</span>
      <span v-else-if="optional" class="base-field__optional">{{ optionalText }}</span>
    </label>

    <q-select v-model="model" outlined dense v-bind="fieldAttrs">
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </q-select>
  </div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';

// Shared dropdown: same label + outlined+dense look as BaseInput. All q-select
// props (options, emit-value, map-options, option-label/value, rules, clearable,
// multiple, disable, …) pass through via $attrs so it stays a drop-in.
defineOptions({ inheritAttrs: false });

const model = defineModel<unknown>();
const attrs = useAttrs();
const fieldAttrs = computed(() => {
  const rest = { ...attrs };
  delete rest.class;
  return rest;
});

withDefaults(
  defineProps<{
    label?: string;
    required?: boolean;
    optional?: boolean;
    optionalText?: string;
  }>(),
  {
    label: '',
    required: false,
    optional: false,
    optionalText: '(ไม่บังคับ)',
  },
);
</script>

<style scoped lang="scss">
.base-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.base-field :deep(.q-field) {
  width: 100%;
}

.base-field__label {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--admin-navy, #10233f);
}

.base-field__required {
  color: var(--q-negative, #c10015);
}

.base-field__optional {
  font-weight: 600;
  color: var(--admin-muted, #94a3b8);
}
</style>
