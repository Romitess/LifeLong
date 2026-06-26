import { readonly, ref } from 'vue';

export const AUTH_NAVIGATION_LOADING_DELAY_MS = 360;

const isAuthNavigationLoading = ref(false);

export function showAuthNavigationLoading(): void {
  isAuthNavigationLoading.value = true;
}

export function hideAuthNavigationLoading(): void {
  isAuthNavigationLoading.value = false;
}

export function useAuthNavigationLoading() {
  return {
    isAuthNavigationLoading: readonly(isAuthNavigationLoading),
  };
}
