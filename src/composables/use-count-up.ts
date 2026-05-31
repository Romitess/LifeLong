import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMediaQuery } from '@vueuse/core';

interface CountUpOptions {
  target: number;
  duration?: number;
  suffix?: string;
  /** ถ้า true จะใช้ comma separator: 50000 → "50,000" */
  useCommas?: boolean;
}

/**
 * Animates a number from 0 → target when the bound element enters viewport.
 * Respects prefers-reduced-motion — shows final value immediately if set.
 *
 * Usage:
 *   const { el, displayValue } = useCountUp({ target: 500, suffix: '+' });
 *   <span ref="el">{{ displayValue }}</span>
 */
export function useCountUp({
  target,
  duration = 1500,
  suffix = '',
  useCommas = false,
}: CountUpOptions) {
  const el = ref<HTMLElement | null>(null);
  const current = ref(0);
  const hasStarted = ref(false);
  const prefersReduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  let raf: number | null = null;
  let observer: IntersectionObserver | null = null;

  const displayValue = computed<string>(() => {
    const n = Math.round(current.value);
    const formatted = useCommas ? n.toLocaleString('en-US') : String(n);
    return formatted + suffix;
  });

  function runAnimation(): void {
    if (hasStarted.value) return;
    if (prefersReduced.value) {
      current.value = target;
      return;
    }
    hasStarted.value = true;

    const startTime = performance.now();
    function tick(now: number): void {
      const progress = Math.min((now - startTime) / duration, 1);
      // ease-out-cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      current.value = target * eased;
      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        current.value = target;
      }
    }
    raf = requestAnimationFrame(tick);
  }

  onMounted(() => {
    if (!el.value) return;
    if (prefersReduced.value) {
      current.value = target;
      return;
    }
    observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          runAnimation();
          observer?.disconnect();
          observer = null;
        }
      },
      { threshold: 0.3 },
    );
    observer.observe(el.value);
  });

  onUnmounted(() => {
    if (raf !== null) cancelAnimationFrame(raf);
    observer?.disconnect();
  });

  return { el, displayValue };
}
