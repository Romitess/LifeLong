<template>
  <div
    ref="marqueeEl"
    class="marquee"
    :class="{ 'marquee--dragging': isDragging }"
    @mouseenter="isHovered = true"
    @mouseleave="onMouseLeave"
    @mousedown.prevent="onDragStart"
    @touchstart.passive="onTouchStart"
  >
    <div ref="trackEl" class="marquee__track">
      <button
        v-for="(item, i) in quad"
        :key="i"
        class="marquee__item"
        :style="{ '--cat-color': item.color }"
        @click="select(item.name)"
      >
        <span class="marquee__icon-bubble">
          <q-icon :name="item.icon" size="13px" />
        </span>
        {{ item.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useCategoryStore } from 'src/stores/category-store';

const router = useRouter();
const categoryStore = useCategoryStore();

const items = computed(() => categoryStore.activeCategories);

const allItem = {
  name: 'ทั้งหมด',
  icon: 'apps',
  color: '#1a237e',
  id: '__all__',
  nameEn: 'All',
  slug: '',
  description: '',
  descriptionEn: '',
  isActive: true,
  displayOrder: 0,
  createdAt: '',
  updatedAt: '',
};

const itemsWithAll = computed(() => [allItem, ...items.value]);
const quad = computed(() => [
  ...itemsWithAll.value,
  ...itemsWithAll.value,
  ...itemsWithAll.value,
  ...itemsWithAll.value,
]);

// ── Transform-based animation + drag (no scrollLeft = no layout reflow) ──
const marqueeEl = ref<HTMLElement | null>(null);
const trackEl = ref<HTMLElement | null>(null);
const isHovered = ref(false);
const isDragging = ref(false);

let rafId: number | null = null;
let lastTimestamp = 0;
let translateX = 0;
let loopWidth = 0;
let dragStartX = 0;
let dragStartTranslateX = 0;
let hasDragged = false;

const SPEED_PX_PER_S = 40;

function applyTransform(x: number) {
  translateX = x;
  if (trackEl.value) trackEl.value.style.transform = `translateX(${x}px)`;
}

function wrapX(x: number): number {
  if (loopWidth <= 0) return x;
  if (x <= -loopWidth) return x + loopWidth;
  if (x > 0) return x - loopWidth;
  return x;
}

function measureLoopWidth() {
  if (trackEl.value && trackEl.value.scrollWidth > 0) {
    loopWidth = trackEl.value.scrollWidth / 4;
  }
}

function tick(timestamp: number) {
  // Lazy re-measure until categories have loaded
  if (loopWidth <= 0) measureLoopWidth();

  if (!isDragging.value && !isHovered.value && trackEl.value) {
    const delta = lastTimestamp ? (timestamp - lastTimestamp) / 1000 : 0;
    lastTimestamp = timestamp;
    applyTransform(wrapX(translateX - SPEED_PX_PER_S * delta));
  } else {
    lastTimestamp = timestamp;
  }
  rafId = requestAnimationFrame(tick);
}

onMounted(() => {
  void nextTick(() => {
    measureLoopWidth();
    rafId = requestAnimationFrame(tick);
  });
});

// Re-measure when categories finish loading
watch(quad, async () => {
  await nextTick();
  measureLoopWidth();
});

onBeforeUnmount(() => {
  if (rafId !== null) cancelAnimationFrame(rafId);
});

function onMouseLeave() {
  isHovered.value = false;
  if (isDragging.value) endDrag();
}

function onDragStart(e: MouseEvent) {
  isDragging.value = true;
  hasDragged = false;
  dragStartX = e.clientX;
  dragStartTranslateX = translateX;

  const onMove = (ev: MouseEvent) => {
    const dx = ev.clientX - dragStartX;
    if (Math.abs(dx) > 4) hasDragged = true;
    applyTransform(wrapX(dragStartTranslateX + dx));
  };
  const onUp = () => {
    endDrag();
    window.removeEventListener('mousemove', onMove);
    window.removeEventListener('mouseup', onUp);
  };
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
}

function onTouchStart(e: TouchEvent) {
  if (!e.touches[0]) return;
  isDragging.value = true;
  hasDragged = false;
  dragStartX = e.touches[0].clientX;
  dragStartTranslateX = translateX;

  const onMove = (ev: TouchEvent) => {
    if (!ev.touches[0]) return;
    const dx = ev.touches[0].clientX - dragStartX;
    if (Math.abs(dx) > 4) hasDragged = true;
    applyTransform(wrapX(dragStartTranslateX + dx));
  };
  const onEnd = () => {
    endDrag();
    window.removeEventListener('touchmove', onMove);
    window.removeEventListener('touchend', onEnd);
  };
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onEnd);
}

function endDrag() {
  isDragging.value = false;
  lastTimestamp = 0;
}

function select(name: string) {
  if (hasDragged) {
    hasDragged = false;
    return;
  }
  if (name === 'ทั้งหมด') {
    void router.push({ path: '/short-courses' });
  } else {
    void router.push({ path: '/short-courses', query: { category: name } });
  }
}
</script>

<style lang="scss" scoped>
.marquee {
  overflow: hidden;
  padding: 6px 0;
  border-top: 1px solid var(--color-border-faint);
  border-bottom: 1px solid var(--color-border-faint);
  background: rgba(255, 255, 255, 0.5);
  mask-image: linear-gradient(
    to right,
    transparent,
    black 60px,
    black calc(100% - 60px),
    transparent
  );
  cursor: grab;

  &--dragging {
    cursor: grabbing;
    user-select: none;
  }

  &__track {
    display: flex;
    align-items: center;
    width: max-content;
    will-change: transform; // GPU compositing layer — no reflow on every frame
  }

  &__item {
    --cat-color: #{$primary};

    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 14px 4px 10px;
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-3);
    white-space: nowrap;
    background: transparent;
    border: none;
    border-radius: var(--radius-full);
    cursor: inherit;
    transition:
      background 0.2s ease,
      color 0.2s ease;

    @media (hover: hover) {
      &:hover {
        background: color-mix(in srgb, var(--cat-color) 12%, transparent);
        color: var(--cat-color);

        .marquee__icon-bubble {
          opacity: 1;
        }
      }
    }

    &:active {
      opacity: 0.7;
    }

    &::after {
      content: '';
      display: inline-block;
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: var(--color-border-default);
      margin-left: 14px;
      flex-shrink: 0;
    }
  }

  &__icon-bubble {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--cat-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
    opacity: 0.8;
    transition: opacity 0.2s ease;
  }
}
</style>
