<template>
  <q-file v-model="model" outlined dense v-bind="$attrs">
    <template v-for="(_, name) in $slots" #[name]="slotProps">
      <slot :name="name" v-bind="slotProps ?? {}" />
    </template>
  </q-file>
</template>

<script setup lang="ts">
// Shared q-file wrapper. All upload constraints, labels, slots and rejected
// handlers pass through so existing admin uploads stay drop-in compatible.
defineOptions({ inheritAttrs: false });

const model = defineModel<File | File[] | FileList | null | undefined>();
</script>
