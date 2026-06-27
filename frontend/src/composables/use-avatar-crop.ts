import { ref, computed, watch, type Ref } from 'vue';
import { useAuthStore } from 'src/stores/auth-store';

export const VIEWPORT_SIZE = 280;

export function useAvatarCrop(
  fullAvatarUrl: Ref<string>,
  pendingFullAvatarSrc: Ref<string | null>,
) {
  const authStore = useAuthStore();

  const showCropDialog = ref(false);
  const cropImageSrc = ref<string | null>(null);
  const cropZoom = ref(1);
  const cropOffsetX = ref(0);
  const cropOffsetY = ref(0);
  const isDragging = ref(false);
  const dragStartX = ref(0);
  const dragStartY = ref(0);
  const dragStartOffsetX = ref(0);
  const dragStartOffsetY = ref(0);
  const cropImage = ref<HTMLImageElement | null>(null);
  const naturalWidth = ref(0);
  const naturalHeight = ref(0);
  const avatarInput = ref<HTMLInputElement | null>(null);

  const cropImageStyle = computed(() => {
    const scale = cropZoom.value;
    return {
      transform: `translate(${cropOffsetX.value}px, ${cropOffsetY.value}px) scale(${scale})`,
      transformOrigin: 'center center',
    };
  });

  watch(cropZoom, () => {
    const maxOffset = (VIEWPORT_SIZE / 2) * (1 - 1 / cropZoom.value);
    cropOffsetX.value = Math.max(-maxOffset, Math.min(maxOffset, cropOffsetX.value));
    cropOffsetY.value = Math.max(-maxOffset, Math.min(maxOffset, cropOffsetY.value));
  });

  function triggerAvatarUpload(): void {
    avatarInput.value?.click();
  }

  function onAvatarSelected(event: Event): void {
    const target = event.target as HTMLInputElement;
    const file = target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const selectedImage = e.target?.result as string;
      cropImageSrc.value = selectedImage;
      pendingFullAvatarSrc.value = selectedImage;
      cropZoom.value = 1;
      cropOffsetX.value = 0;
      cropOffsetY.value = 0;
      showCropDialog.value = true;
    };
    reader.readAsDataURL(file);
    target.value = '';
  }

  function onCropImageLoad(): void {
    if (cropImage.value) {
      naturalWidth.value = cropImage.value.naturalWidth;
      naturalHeight.value = cropImage.value.naturalHeight;
    }
  }

  function onCropMouseDown(e: MouseEvent): void {
    isDragging.value = true;
    dragStartX.value = e.clientX;
    dragStartY.value = e.clientY;
    dragStartOffsetX.value = cropOffsetX.value;
    dragStartOffsetY.value = cropOffsetY.value;
  }

  function onCropMouseMove(e: MouseEvent): void {
    if (!isDragging.value) return;
    const rawX = dragStartOffsetX.value + (e.clientX - dragStartX.value);
    const rawY = dragStartOffsetY.value + (e.clientY - dragStartY.value);

    const maxOffset = (VIEWPORT_SIZE / 2) * (1 - 1 / cropZoom.value);
    cropOffsetX.value = Math.max(-maxOffset, Math.min(maxOffset, rawX));
    cropOffsetY.value = Math.max(-maxOffset, Math.min(maxOffset, rawY));
  }

  function onCropMouseUp(): void {
    isDragging.value = false;
  }

  function onCropTouchStart(e: TouchEvent): void {
    const touch = e.touches[0];
    if (!touch) return;
    isDragging.value = true;
    dragStartX.value = touch.clientX;
    dragStartY.value = touch.clientY;
    dragStartOffsetX.value = cropOffsetX.value;
    dragStartOffsetY.value = cropOffsetY.value;
  }

  function onCropTouchMove(e: TouchEvent): void {
    if (!isDragging.value) return;
    const touch = e.touches[0];
    if (!touch) return;
    const rawX = dragStartOffsetX.value + (touch.clientX - dragStartX.value);
    const rawY = dragStartOffsetY.value + (touch.clientY - dragStartY.value);

    const maxOffset = (VIEWPORT_SIZE / 2) * (1 - 1 / cropZoom.value);
    cropOffsetX.value = Math.max(-maxOffset, Math.min(maxOffset, rawX));
    cropOffsetY.value = Math.max(-maxOffset, Math.min(maxOffset, rawY));
  }

  function onCropTouchEnd(): void {
    isDragging.value = false;
  }

  function onCropWheel(e: WheelEvent): void {
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    cropZoom.value = Math.max(1, Math.min(3, cropZoom.value + delta));
  }

  function cancelCrop(): void {
    showCropDialog.value = false;
    cropImageSrc.value = null;
    pendingFullAvatarSrc.value = null;
  }

  async function saveCroppedAvatar(croppedFile?: File): Promise<void> {
    if (croppedFile) {
      await authStore.uploadAvatar(croppedFile);
      fullAvatarUrl.value = authStore.user?.avatar || '';
      showCropDialog.value = false;
      cropImageSrc.value = null;
      pendingFullAvatarSrc.value = null;
      return;
    }

    if (!cropImageSrc.value) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const outputSize = 400;
      canvas.width = outputSize;
      canvas.height = outputSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Calculate how the image is displayed in the viewport
      const aspect = img.naturalWidth / img.naturalHeight;
      let drawW: number;
      let drawH: number;
      if (aspect > 1) {
        drawH = VIEWPORT_SIZE;
        drawW = VIEWPORT_SIZE * aspect;
      } else {
        drawW = VIEWPORT_SIZE;
        drawH = VIEWPORT_SIZE / aspect;
      }

      // The center of the viewport maps to the center of canvas
      const scale = cropZoom.value;
      const scaledW = drawW * scale;
      const scaledH = drawH * scale;

      // Image top-left position in viewport coordinates
      const imgX = (VIEWPORT_SIZE - scaledW) / 2 + cropOffsetX.value;
      const imgY = (VIEWPORT_SIZE - scaledH) / 2 + cropOffsetY.value;

      // Map viewport crop area to canvas
      const ratio = outputSize / VIEWPORT_SIZE;
      const canvasImgX = imgX * ratio;
      const canvasImgY = imgY * ratio;
      const canvasImgW = scaledW * ratio;
      const canvasImgH = scaledH * ratio;

      ctx.drawImage(img, canvasImgX, canvasImgY, canvasImgW, canvasImgH);

      const dataUrl = canvas.toDataURL('image/png');
      authStore.setAvatar(dataUrl);
      fullAvatarUrl.value = dataUrl;
      showCropDialog.value = false;
      cropImageSrc.value = null;
      pendingFullAvatarSrc.value = null;
    };
    img.src = cropImageSrc.value;
  }

  return {
    showCropDialog,
    cropImageSrc,
    cropZoom,
    cropOffsetX,
    cropOffsetY,
    isDragging,
    dragStartX,
    dragStartY,
    dragStartOffsetX,
    dragStartOffsetY,
    cropImage,
    naturalWidth,
    naturalHeight,
    avatarInput,
    cropImageStyle,
    triggerAvatarUpload,
    onAvatarSelected,
    onCropImageLoad,
    onCropMouseDown,
    onCropMouseMove,
    onCropMouseUp,
    onCropTouchStart,
    onCropTouchMove,
    onCropTouchEnd,
    onCropWheel,
    cancelCrop,
    saveCroppedAvatar,
  };
}
