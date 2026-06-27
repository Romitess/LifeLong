import { computed, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';
import { api } from 'src/boot/axios';
import { useAuthStore } from 'src/stores/auth-store';

type CoursePriceSource = {
  code?: string | null;
  price?: number | null;
};

type EffectiveCoursePriceResponse = {
  effectivePrice: number;
  stutypeName: string | null;
  isPrivileged: boolean;
};

const effectivePriceCache = new Map<string, EffectiveCoursePriceResponse>();
const pendingRequests = new Map<string, Promise<EffectiveCoursePriceResponse>>();

function buildCacheKey(username: string, courseCode: string): string {
  return `${username}::${courseCode}`;
}

async function fetchEffectiveCoursePrice(
  username: string,
  courseCode: string,
  fallbackPrice: number,
): Promise<EffectiveCoursePriceResponse> {
  const cacheKey = buildCacheKey(username, courseCode);
  const cached = effectivePriceCache.get(cacheKey);
  if (cached) {
    return cached;
  }

  const pending = pendingRequests.get(cacheKey);
  if (pending) {
    return pending;
  }

  const request = api
    .get<EffectiveCoursePriceResponse>('/api/moodle/enroll/my-fee', {
      params: { courseCode },
    })
    .then(({ data }) => {
      const resolved = {
        effectivePrice: Number(data.effectivePrice ?? fallbackPrice) || 0,
        stutypeName: data.stutypeName ?? null,
        isPrivileged: Boolean(data.isPrivileged),
      };
      effectivePriceCache.set(cacheKey, resolved);
      return resolved;
    })
    .catch(() => {
      const fallback = {
        effectivePrice: fallbackPrice,
        stutypeName: null,
        isPrivileged: false,
      };
      effectivePriceCache.set(cacheKey, fallback);
      return fallback;
    })
    .finally(() => {
      pendingRequests.delete(cacheKey);
    });

  pendingRequests.set(cacheKey, request);
  return request;
}

export function useEffectiveCoursePrice(
  source: MaybeRefOrGetter<CoursePriceSource | null | undefined>,
): {
  effectivePrice: Ref<number | null>;
  hasEffectivePrice: Ref<boolean>;
  effectiveIsFree: Ref<boolean>;
} {
  const authStore = useAuthStore();
  const effectivePrice = ref<number | null>(null);

  watch(
    () => {
      const course = toValue(source);
      return {
        isLoggedIn: authStore.isLoggedIn,
        username: authStore.user?.username ?? authStore.user?.email ?? '',
        courseCode: course?.code ?? '',
        fallbackPrice: Number(course?.price ?? 0) || 0,
      };
    },
    async ({ isLoggedIn, username, courseCode, fallbackPrice }) => {
      if (!courseCode) {
        effectivePrice.value = null;
        return;
      }

      if (!isLoggedIn || !username) {
        effectivePrice.value = fallbackPrice;
        return;
      }

      const result = await fetchEffectiveCoursePrice(username, courseCode, fallbackPrice);
      effectivePrice.value = result.effectivePrice;
    },
    { immediate: true },
  );

  const hasEffectivePrice = computed(() => effectivePrice.value !== null);
  const effectiveIsFree = computed(() => (effectivePrice.value ?? 0) <= 0);

  return {
    effectivePrice,
    hasEffectivePrice,
    effectiveIsFree,
  };
}
