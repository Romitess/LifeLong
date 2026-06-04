import { computed, ref, watch } from 'vue';

export interface CropBox {
  x: number; // normalized 0-1, left edge in image space
  y: number; // normalized 0-1, top edge in image space
  w: number; // normalized 0-1, width in image space
  h: number; // normalized 0-1, height in image space
  mode?: 'cover' | 'contain'; // contain = full image visible with letterboxing
}

export interface UseImageCropperOptions {
  viewportW: number;
  viewportH: number;
}

export function useImageCropper(options: UseImageCropperOptions) {
  const { viewportW, viewportH } = options;

  const cropZoom = ref(1);
  const cropOffsetX = ref(0);
  const cropOffsetY = ref(0);
  const isDragging = ref(false);
  const dragStartX = ref(0);
  const dragStartY = ref(0);
  const dragStartOffsetX = ref(0);
  const dragStartOffsetY = ref(0);
  // pinch state
  let pinchStartDist = 0;
  let pinchStartZoom = 1;
  const cropImageRef = ref<HTMLImageElement | null>(null);
  const naturalWidth = ref(0);
  const naturalHeight = ref(0);

  // Cover-fit: image sized so it fills the viewport (no letterbox at zoom=1)
  const displayW = computed<number>(() => {
    const nw = naturalWidth.value;
    const nh = naturalHeight.value;
    if (!nw || !nh) return viewportW;
    return nw / nh > viewportW / viewportH ? viewportH * (nw / nh) : viewportW;
  });
  const displayH = computed<number>(() => {
    const nw = naturalWidth.value;
    const nh = naturalHeight.value;
    if (!nw || !nh) return viewportH;
    return nw / nh > viewportW / viewportH ? viewportH : viewportW * (nh / nw);
  });

  // Image is absolutely centered in viewport; CSS: top:50% left:50%
  // Transform: translate(-50%+offsetX, -50%+offsetY) scale(zoom)
  const cropImageStyle = computed(() => {
    const w = displayW.value;
    const h = displayH.value;
    return {
      width: `${w}px`,
      height: `${h}px`,
      transform: `translate(calc(-50% + ${cropOffsetX.value}px), calc(-50% + ${cropOffsetY.value}px)) scale(${cropZoom.value})`,
      transformOrigin: 'center center',
    };
  });

  // Minimum zoom = cover-fit: image fills the entire crop frame (no gaps)
  const minZoom = computed<number>(() => {
    const nw = naturalWidth.value;
    const nh = naturalHeight.value;
    if (!nw || !nh) return 1;
    return Math.max(viewportW / displayW.value, viewportH / displayH.value);
  });

  // Contain-fit zoom: entire image visible inside the frame (may have dark bars)
  const containZoom = computed<number>(() => {
    const nw = naturalWidth.value;
    const nh = naturalHeight.value;
    if (!nw || !nh) return 1;
    return Math.min(viewportW / displayW.value, viewportH / displayH.value);
  });

  function clampOffsets(): void {
    const maxX = (displayW.value * cropZoom.value - viewportW) / 2;
    const maxY = (displayH.value * cropZoom.value - viewportH) / 2;
    cropOffsetX.value = Math.max(
      -Math.max(0, maxX),
      Math.min(Math.max(0, maxX), cropOffsetX.value),
    );
    cropOffsetY.value = Math.max(
      -Math.max(0, maxY),
      Math.min(Math.max(0, maxY), cropOffsetY.value),
    );
  }

  // Re-clamp offsets whenever zoom changes (e.g. via slider or number input)
  watch(cropZoom, clampOffsets);
  // When image loads and minZoom resolves, enforce the floor
  watch(minZoom, (newMin) => {
    if (cropZoom.value < newMin) cropZoom.value = newMin;
  });

  function resetView(): void {
    cropZoom.value = minZoom.value;
    cropOffsetX.value = 0;
    cropOffsetY.value = 0;
  }

  // Scale the whole image to fit inside the frame (contain, may show dark bars)
  function fitToFrame(): void {
    cropZoom.value = containZoom.value;
    cropOffsetX.value = 0;
    cropOffsetY.value = 0;
  }

  function reset(): void {
    cropZoom.value = 1;
    cropOffsetX.value = 0;
    cropOffsetY.value = 0;
    naturalWidth.value = 0;
    naturalHeight.value = 0;
  }

  function onImageLoad(): void {
    if (cropImageRef.value) {
      naturalWidth.value = cropImageRef.value.naturalWidth;
      naturalHeight.value = cropImageRef.value.naturalHeight;
      clampOffsets();
    }
  }

  function onMouseDown(e: MouseEvent): void {
    isDragging.value = true;
    dragStartX.value = e.clientX;
    dragStartY.value = e.clientY;
    dragStartOffsetX.value = cropOffsetX.value;
    dragStartOffsetY.value = cropOffsetY.value;
  }

  function onMouseMove(e: MouseEvent): void {
    if (!isDragging.value) return;
    cropOffsetX.value = dragStartOffsetX.value + (e.clientX - dragStartX.value);
    cropOffsetY.value = dragStartOffsetY.value + (e.clientY - dragStartY.value);
    clampOffsets();
  }

  function onMouseUp(): void {
    isDragging.value = false;
  }

  function onTouchStart(e: TouchEvent): void {
    if (e.touches.length === 2) {
      // pinch start
      isDragging.value = false;
      const t0 = e.touches[0]!;
      const t1 = e.touches[1]!;
      pinchStartDist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      pinchStartZoom = cropZoom.value;
      return;
    }
    const touch = e.touches[0];
    if (!touch) return;
    isDragging.value = true;
    dragStartX.value = touch.clientX;
    dragStartY.value = touch.clientY;
    dragStartOffsetX.value = cropOffsetX.value;
    dragStartOffsetY.value = cropOffsetY.value;
  }

  function onTouchMove(e: TouchEvent): void {
    if (e.touches.length === 2) {
      // pinch zoom
      const t0 = e.touches[0]!;
      const t1 = e.touches[1]!;
      const dist = Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
      if (pinchStartDist > 0) {
        cropZoom.value = Math.max(
          minZoom.value,
          Math.min(4, pinchStartZoom * (dist / pinchStartDist)),
        );
        clampOffsets();
      }
      return;
    }
    if (!isDragging.value) return;
    const touch = e.touches[0];
    if (!touch) return;
    cropOffsetX.value = dragStartOffsetX.value + (touch.clientX - dragStartX.value);
    cropOffsetY.value = dragStartOffsetY.value + (touch.clientY - dragStartY.value);
    clampOffsets();
  }

  function onTouchEnd(): void {
    isDragging.value = false;
    pinchStartDist = 0;
  }

  function onWheel(e: WheelEvent): void {
    const delta = e.deltaY > 0 ? -0.08 : 0.08;
    cropZoom.value = Math.max(minZoom.value, Math.min(4, cropZoom.value + delta));
    clampOffsets();
  }

  function toCropBox(): CropBox | null {
    const nw = naturalWidth.value;
    const nh = naturalHeight.value;
    if (!nw || !nh) return null;

    // Contain mode: image is smaller than the viewport (zoom < cover threshold)
    if (cropZoom.value < minZoom.value) {
      return { x: 0, y: 0, w: 1, h: 1, mode: 'contain' };
    }

    const dw = displayW.value;
    const dh = displayH.value;
    const scaledW = dw * cropZoom.value;
    const scaledH = dh * cropZoom.value;

    // Image top-left in viewport coords (image is centered + offset)
    const imgLeft = (viewportW - scaledW) / 2 + cropOffsetX.value;
    const imgTop = (viewportH - scaledH) / 2 + cropOffsetY.value;

    const cropXPx = Math.max(0, -imgLeft) * (nw / scaledW);
    const cropYPx = Math.max(0, -imgTop) * (nh / scaledH);
    const cropWPx = viewportW * (nw / scaledW);
    const cropHPx = viewportH * (nh / scaledH);

    return {
      x: Math.max(0, Math.min(1, cropXPx / nw)),
      y: Math.max(0, Math.min(1, cropYPx / nh)),
      w: Math.max(0, Math.min(1, cropWPx / nw)),
      h: Math.max(0, Math.min(1, cropHPx / nh)),
    };
  }

  function fromCropBox(box: CropBox): void {
    const nw = naturalWidth.value;
    const nh = naturalHeight.value;
    if (!nw || !nh) return;

    if (box.mode === 'contain') {
      fitToFrame();
      return;
    }

    const dw = displayW.value;
    // zoom so cropW fills viewport width
    const zoom = viewportW / (box.w * (nw / dw) * dw);
    cropZoom.value = Math.max(minZoom.value, zoom);

    const scaledW = dw * cropZoom.value;
    const scaledH = displayH.value * cropZoom.value;

    const imgLeft = -(box.x * nw) * (scaledW / nw);
    const imgTop = -(box.y * nh) * (scaledH / nh);

    cropOffsetX.value = imgLeft - (viewportW - scaledW) / 2;
    cropOffsetY.value = imgTop - (viewportH - scaledH) / 2;
    clampOffsets();
  }

  function bake(src: string, outputW: number, outputH: number): Promise<File> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const nw = img.naturalWidth;
        const nh = img.naturalHeight;
        const imgAspect = nw / nh;
        const vpAspect = viewportW / viewportH;
        const dw = imgAspect > vpAspect ? viewportH * imgAspect : viewportW;
        const dh = imgAspect > vpAspect ? viewportH : viewportW / imgAspect;

        const scaledW = dw * cropZoom.value;
        const scaledH = dh * cropZoom.value;
        const imgX = (viewportW - scaledW) / 2 + cropOffsetX.value;
        const imgY = (viewportH - scaledH) / 2 + cropOffsetY.value;

        const canvas = document.createElement('canvas');
        canvas.width = outputW;
        canvas.height = outputH;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('no canvas ctx'));

        const ratio = outputW / viewportW;
        ctx.drawImage(img, imgX * ratio, imgY * ratio, scaledW * ratio, scaledH * ratio);
        canvas.toBlob((blob) => {
          if (!blob) return reject(new Error('toBlob failed'));
          resolve(new File([blob], 'crop.png', { type: 'image/png' }));
        }, 'image/png');
      };
      img.onerror = reject;
      img.src = src;
    });
  }

  return {
    cropZoom,
    minZoom,
    cropOffsetX,
    cropOffsetY,
    isDragging,
    cropImageRef,
    naturalWidth,
    naturalHeight,
    cropImageStyle,
    reset,
    resetView,
    fitToFrame,
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
  };
}
