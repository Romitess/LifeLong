<template>
  <div class="base-cropped-image">
    <img
      v-if="src"
      ref="imgRef"
      :src="src"
      class="base-cropped-image__img"
      :style="imgStyle"
      :alt="alt"
      :loading="loading"
      draggable="false"
      @load="onLoad"
    />
    <slot v-if="!src" />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import type { CropBox } from 'src/composables/use-image-cropper';

interface Props {
  src?: string | null;
  cropBox?: CropBox | null;
  aspect?: number;
  alt?: string;
  loading?: 'lazy' | 'eager';
}

const props = withDefaults(defineProps<Props>(), {
  src: null,
  cropBox: null,
  aspect: 16 / 9,
  alt: '',
  loading: 'lazy',
});

const imgRef = ref<HTMLImageElement | null>(null);
const naturalW = ref(0);
const naturalH = ref(0);

function readDimensions(img: HTMLImageElement): void {
  if (img.complete && img.naturalWidth > 0) {
    naturalW.value = img.naturalWidth;
    naturalH.value = img.naturalHeight;
  }
}

function onLoad(e: Event): void {
  readDimensions(e.target as HTMLImageElement);
}

// Handle cached images that never fire @load
onMounted(() => {
  if (imgRef.value) readDimensions(imgRef.value);
});

// Re-check when src changes (new image assigned to same element)
watch(
  () => props.src,
  () => {
    naturalW.value = 0;
    naturalH.value = 0;
    if (imgRef.value) readDimensions(imgRef.value);
  },
);

const imgStyle = computed<Record<string, string>>(() => {
  const box = props.cropBox;

  // No crop box or naturalW/H not yet loaded → simple cover fill
  if (!box || !naturalW.value || !naturalH.value) {
    return {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      objectFit: 'cover',
    };
  }

  // Contain mode: full image visible with letterboxing (dark bars on sides/top)
  if (box.mode === 'contain') {
    return {
      position: 'absolute',
      inset: '0',
      width: '100%',
      height: '100%',
      objectFit: 'contain',
      objectPosition: 'center',
    };
  }

  // Scale image so the crop region exactly fills the container.
  // Constrain by width; height follows from image aspect ratio.
  const imageAspect = naturalW.value / naturalH.value;
  const containerAspect = props.aspect;
  const ratio = containerAspect / imageAspect; // > 1 = image taller, < 1 = image wider

  const scaledWPct = 100 / box.w;
  const scaledHPct = (ratio / box.w) * 100;
  const leftPct = -(box.x / box.w) * 100;
  const topPct = -(box.y / box.w) * ratio * 100;

  return {
    position: 'absolute',
    width: `${scaledWPct}%`,
    height: `${scaledHPct}%`,
    left: `${leftPct}%`,
    top: `${topPct}%`,
  };
});
</script>

<style lang="scss" scoped>
// Component fills its parent completely — parent controls sizing
.base-cropped-image {
  position: relative;
  overflow: hidden;
  width: 100%;
  height: 100%;

  &__img {
    display: block;
  }
}
</style>
