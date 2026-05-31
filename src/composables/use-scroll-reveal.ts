import { onMounted, onUnmounted, ref, type Ref } from 'vue';
import { useMediaQuery } from '@vueuse/core';

interface ScrollRevealOptions {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
  delay?: number;
}

/**
 * Reveals an element when it enters the viewport.
 * Respects prefers-reduced-motion — skips animation entirely if user prefers reduced motion.
 *
 * @returns { el, isRevealed } — bind `ref="el"` to your element
 */
export function useScrollReveal(options: ScrollRevealOptions = {}) {
  const { threshold = 0.15, rootMargin = '0px 0px -10% 0px', once = true, delay = 0 } = options;

  const el = ref<HTMLElement | null>(null);
  const isRevealed = ref(false);
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  let observer: IntersectionObserver | null = null;

  onMounted(() => {
    if (!el.value) return;

    // Skip animation entirely — show content immediately
    if (prefersReducedMotion.value) {
      isRevealed.value = true;
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry) return;

        if (entry.isIntersecting) {
          if (delay > 0) {
            setTimeout(() => {
              isRevealed.value = true;
            }, delay);
          } else {
            isRevealed.value = true;
          }
          if (once && observer) {
            observer.disconnect();
            observer = null;
          }
        } else if (!once) {
          isRevealed.value = false;
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el.value);
  });

  onUnmounted(() => {
    observer?.disconnect();
    observer = null;
  });

  return { el, isRevealed };
}

/**
 * Convenience: returns stagger delay (ms) for a given item index.
 * Caps at motionStaggerMax to prevent overly-long delays.
 */
export function useStaggerDelay(index: number, staggerMs = 90, maxItems = 6): number {
  return Math.min(index, maxItems - 1) * staggerMs;
}

/**
 * Returns v-motion initial/enter variants for a reveal animation.
 * Pass delay (ms) for stagger support.
 */
export function revealVariant(delayMs = 0) {
  return {
    initial: { opacity: 0, y: 24 },
    visibleOnce: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 550,
        ease: [0.22, 1, 0.36, 1],
        delay: delayMs,
      },
    },
  };
}

/**
 * v-motion variant for section headings — slightly larger y offset.
 */
export function headingRevealVariant(delayMs = 0) {
  return {
    initial: { opacity: 0, y: 32 },
    visibleOnce: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 600,
        ease: [0.22, 1, 0.36, 1],
        delay: delayMs,
      },
    },
  };
}

export type { Ref };
