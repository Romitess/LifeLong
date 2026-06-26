<template>
  <q-checkbox v-model="model" class="base-choice-control" v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </q-checkbox>
</template>

<script setup lang="ts">
// Shared checkbox wrapper for admin/forms. Extra q-checkbox props and listeners
// pass through via $attrs so existing field behavior remains unchanged.
defineOptions({ inheritAttrs: false });

const model = defineModel<boolean | unknown[] | null | undefined>();
</script>

<style scoped lang="scss">
:global(.base-choice-control .q-focus-helper),
:global(body.desktop .base-choice-control:not(.disabled) .q-checkbox__inner::before) {
  background: transparent !important;
  opacity: 0 !important;
  transform: scale3d(0, 0, 1) !important;
}
</style>
