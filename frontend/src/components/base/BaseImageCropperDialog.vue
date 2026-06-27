<template>
  <q-dialog v-model="isOpen" transition-show="scale" transition-hide="scale" @hide="reset">
    <q-card class="base-cropper-dialog">
      <q-card-section class="base-cropper-dialog__header row items-center q-pa-md">
        <q-icon name="crop" size="20px" color="primary" class="q-mr-sm" />
        <div class="text-subtitle1 text-weight-bold">{{ title }}</div>
        <q-space />
        <q-btn flat round dense icon="close" color="grey-7" @click="cancel" />
      </q-card-section>

      <q-card-section class="base-cropper-dialog__body q-pa-none">
        <!-- Viewport: image crops to this area -->
        <div
          class="base-cropper-dialog__viewport"
          :style="viewportStyle"
          @mousedown="onMouseDown"
          @mousemove="onMouseMove"
          @mouseup="onMouseUp"
          @mouseleave="onMouseUp"
          @touchstart.prevent="onTouchStart"
          @touchmove.prevent="onTouchMove"
          @touchend="onTouchEnd"
          @wheel.prevent="onWheel"
        >
          <img
            v-if="imageSrc"
            ref="cropImageRef"
            :src="imageSrc"
            class="base-cropper-dialog__img"
            :style="cropImageStyle"
            draggable="false"
            @load="onImageLoad"
          />

          <!-- Dark overlay outside crop area (box-shadow punches hole inside cutout) -->
          <div
            class="base-cropper-dialog__cutout"
            :class="`base-cropper-dialog__cutout--${maskShape}`"
            :style="cutoutStyle"
          />
        </div>

        <div class="base-cropper-dialog__hint text-caption text-grey-5 q-px-md q-pt-sm">
          ลากเพื่อเลื่อน · เลื่อน scroll เพื่อซูม
        </div>
      </q-card-section>

      <q-card-section class="q-px-lg q-py-sm">
        <div class="row items-center q-gutter-sm">
          <q-icon name="photo_size_select_small" color="grey-5" size="16px" />
          <q-slider
            v-model="cropZoom"
            :min="minZoom"
            :max="4"
            :step="0.01"
            color="primary"
            class="col"
          />
          <q-icon name="photo_size_select_large" color="grey-5" size="16px" />
          <q-input
            :model-value="zoomPct"
            dense
            outlined
            type="text"
            inputmode="numeric"
            class="base-cropper-dialog__zoom-input"
            @update:model-value="onZoomInput"
          />
          <span class="base-cropper-dialog__zoom-pct">%</span>
        </div>
      </q-card-section>

      <q-card-actions align="right" class="q-px-lg q-pb-lg">
        <q-btn
          flat
          label="รีเซ็ต"
          icon="refresh"
          color="grey-7"
          no-caps
          padding="sm md"
          @click="resetCrop"
        />
        <q-btn
          unelevated
          rounded
          label="ยืนยัน"
          color="primary"
          icon="check"
          no-caps
          padding="sm lg"
          :loading="isSaving"
          :disable="isSaving"
          @click="save"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useImageCropper, type CropBox } from 'src/composables/use-image-cropper';

interface Props {
  modelValue: boolean;
  imageSrc: string | null;
  aspect?: number;
  maskShape?: 'circle' | 'rect';
  title?: string;
  initialCropBox?: CropBox | null;
  outputWidth?: number | null;
  outputHeight?: number | null;
}

const props = withDefaults(defineProps<Props>(), {
  aspect: 1,
  maskShape: 'circle',
  title: 'ปรับรูปภาพ',
  initialCropBox: null,
  outputWidth: null,
  outputHeight: null,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  save: [cropBox: CropBox, file?: File];
}>();

// Viewport size: wider for rect (16:9), square for circle
const CIRCLE_SIZE = 300;
const RECT_W = 420;

const viewportW = computed<number>(() => (props.maskShape === 'circle' ? CIRCLE_SIZE : RECT_W));
const viewportH = computed<number>(() =>
  props.maskShape === 'circle' ? CIRCLE_SIZE : Math.round(RECT_W / props.aspect),
);

const viewportStyle = computed(() => ({
  width: `${viewportW.value}px`,
  height: `${viewportH.value}px`,
}));

// Cutout is the crop-safe area (circle or rect centered in viewport)
const cutoutSize = computed<{ w: number; h: number }>(() => ({
  w: viewportW.value,
  h: viewportH.value,
}));
const cutoutStyle = computed(() => ({
  width: `${cutoutSize.value.w}px`,
  height: `${cutoutSize.value.h}px`,
  left: `${(viewportW.value - cutoutSize.value.w) / 2}px`,
  top: `${(viewportH.value - cutoutSize.value.h) / 2}px`,
}));

const isOpen = computed({
  get: () => props.modelValue,
  set: (v) => emit('update:modelValue', v),
});
const isSaving = ref(false);

const {
  cropZoom,
  cropImageRef,
  cropImageStyle,
  naturalWidth,
  naturalHeight,
  minZoom,
  reset,
  resetView,
  onImageLoad,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  onTouchEnd,
  onWheel,
  toCropBox,
  fromCropBox,
  bake,
} = useImageCropper({ viewportW: viewportW.value, viewportH: viewportH.value });

watch(
  () => props.imageSrc,
  (src) => {
    if (src) reset();
  },
);

watch([naturalWidth, naturalHeight], ([nw, nh]) => {
  if (nw && nh && props.initialCropBox) fromCropBox(props.initialCropBox);
});

// Zoom display as integer %
const zoomPct = computed(() => Math.round(cropZoom.value * 100));

function onZoomInput(val: string | number | null): void {
  const n = Number(val);
  const minPct = Math.round(minZoom.value * 100);
  if (!isNaN(n) && n >= minPct && n <= 400) cropZoom.value = n / 100;
}

// Restore initial crop box (or fit-to-frame if none)
function resetCrop(): void {
  if (props.initialCropBox && naturalWidth.value && naturalHeight.value) {
    fromCropBox(props.initialCropBox);
  } else {
    resetView();
  }
}

function cancel(): void {
  emit('update:modelValue', false);
}

async function save(): Promise<void> {
  const box = toCropBox();
  if (!box) return;
  isSaving.value = true;
  try {
    const file =
      props.imageSrc && props.outputWidth && props.outputHeight
        ? await bake(props.imageSrc, props.outputWidth, props.outputHeight)
        : undefined;
    emit('save', box, file);
    emit('update:modelValue', false);
  } finally {
    isSaving.value = false;
  }
}
</script>

<style lang="scss" scoped>
.base-cropper-dialog {
  border-radius: 16px;
  overflow: hidden;
  width: auto;
  max-width: 95vw;

  &__header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__body {
    background: #0f172a;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 24px 24px 8px;
  }

  &__hint {
    width: 100%;
    text-align: center;
    padding-bottom: 8px;
    color: rgba(255, 255, 255, 0.4) !important;
    font-size: 0.72rem;
  }

  &__zoom-input {
    width: 64px;
    flex-shrink: 0;

    :deep(.q-field__native) {
      text-align: right;
    }
    :deep(.q-field__control) {
      border-radius: 12px;
    }
    :deep(.q-field__control::before),
    :deep(.q-field__control::after) {
      border-radius: 12px;
    }
  }

  &__zoom-pct {
    font-size: 0.875rem;
    color: #718096;
    user-select: none;
    white-space: nowrap;
  }

  &__viewport {
    position: relative;
    overflow: hidden;
    cursor: grab;
    user-select: none;
    touch-action: none;
    border-radius: 8px;

    &:active {
      cursor: grabbing;
    }
  }

  // Image: centered in viewport, sized to cover
  &__img {
    position: absolute;
    top: 50%;
    left: 50%;
    pointer-events: none;
    will-change: transform;
    // Visible border when zoomed out (image smaller than viewport)
    outline: 1px dashed rgba(255, 255, 255, 0.35);
    outline-offset: -1px;
  }

  // Cutout: transparent center, box-shadow darkens everything outside
  &__cutout {
    position: absolute;
    pointer-events: none;
    // Transparent background — the shade is behind, box-shadow extends outward
    background: transparent;
    box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);

    &--circle {
      border-radius: 50%;
    }

    &--rect {
      border-radius: 6px;
    }
  }
}
</style>
