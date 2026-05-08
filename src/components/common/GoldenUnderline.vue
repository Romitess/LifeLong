<template>
  <div class="golden-underline" :style="style" />
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

interface Props {
  height?: string;
  color?: string;
  absolute?: boolean;
  position?: 'top' | 'bottom';
  left?: string;
  right?: string;
  borderRadius?: string;
  zIndex?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  height: '4px',
  color: '#f7d046',
  absolute: true,
  position: 'bottom',
  left: '0',
  right: '0',
  borderRadius: '0',
  zIndex: 3,
});

const style = computed<CSSProperties>(() => ({
  height: props.height,
  backgroundColor: props.color,
  position: props.absolute ? 'absolute' : 'relative',
  left: props.left,
  right: props.right,
  borderRadius: props.borderRadius,
  [props.position]: 0,
  zIndex: props.zIndex,
}));
</script>

<style scoped>
.golden-underline {
  width: 100%;
  pointer-events: none;
}
</style>
