<template>
  <div class="base-field">
    <label v-if="label" class="base-field__label">
      <span>{{ label }}</span>
      <span v-if="required" class="base-field__required">*</span>
      <span v-else-if="optional" class="base-field__optional">{{ optionalText }}</span>
    </label>

    <q-input v-model="model" outlined dense v-bind="$attrs">
      <template v-for="(_, name) in $slots" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps ?? {}" />
      </template>
    </q-input>
  </div>
</template>

<script setup lang="ts">
// Shared text field: label + required/optional marker on top of a standard
// outlined+dense q-input. Border/radius/font/focus come from the global
// .q-field--outlined styles so every input looks identical. All extra props
// (placeholder, rules, readonly, maxlength, type, mask, …) pass through via $attrs.
defineOptions({ inheritAttrs: false });

const model = defineModel<string | number | null>();

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
