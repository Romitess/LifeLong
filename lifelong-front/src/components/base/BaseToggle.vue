<template>
  <q-toggle v-model="model" class="base-choice-control" v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </q-toggle>
</template>

<script setup lang="ts">
// Shared toggle wrapper for admin/forms. Color, labels, sizing and listeners
// pass through so each migrated toggle keeps its existing behavior.
defineOptions({ inheritAttrs: false });

const model = defineModel<boolean | null | undefined>();
</script>

<style scoped lang="scss">
:global(.base-choice-control .q-focus-helper),
:global(body.desktop .base-choice-control:not(.disabled) .q-toggle__thumb::before) {
  background: transparent !important;
  opacity: 0 !important;
  transform: scale3d(0, 0, 1) !important;
}
</style>
