<template>
  <img v-if="displayUrl" :src="displayUrl" :alt="alt" class="image-display" :style="imageStyle" />
  <div v-else class="image-display image-display--empty" :style="imageStyle">
    <q-icon name="image" size="32px" />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useImageUrl } from 'src/composables/use-image-url';

interface Props {
  imagePath?: string | null;
  alt?: string;
  width?: string;
  height?: string;
  objectFit?: 'contain' | 'cover' | 'fill' | 'none' | 'scale-down';
  borderRadius?: string;
}

const props = withDefaults(defineProps<Props>(), {
  imagePath: null,
  alt: 'Image',
  width: '100%',
  height: 'auto',
  objectFit: 'cover',
  borderRadius: '8px',
});

const { displayUrl } = useImageUrl(() => props.imagePath);

const imageStyle = computed(() => ({
  width: props.width,
  height: props.height,
  objectFit: props.objectFit,
  borderRadius: props.borderRadius,
}));
</script>

<style scoped>
.image-display {
  display: block;
  max-width: 100%;
}

.image-display--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 96px;
  color: #8a93a3;
  background: #f3f5f8;
  border: 1px dashed #c8d0dc;
}
</style>
