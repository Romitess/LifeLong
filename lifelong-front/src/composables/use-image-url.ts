import { computed, type MaybeRefOrGetter, toValue } from 'vue';
import { getImageUrl } from 'src/services/image.service';

export function useImageUrl(imagePath: MaybeRefOrGetter<string | null | undefined>) {
  const displayUrl = computed(() => getImageUrl(toValue(imagePath)));
  const hasImage = computed(() => displayUrl.value.length > 0);

  return {
    displayUrl,
    hasImage,
  };
}
