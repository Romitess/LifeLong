import { useRouter } from 'vue-router';

/**
 * Resolves a route path to a full URL that can be opened in a new tab.
 * Works with both hash and history router modes.
 */
export function resolveFullUrl(path: string): string {
  // If it's already an absolute URL, return as-is
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const base = window.location.origin + window.location.pathname;
  // Hash mode: append #/path
  if (window.location.hash !== '' || window.location.href.includes('#')) {
    return `${base}#${path.startsWith('/') ? path : '/' + path}`;
  }
  // History mode: construct from origin + base + path
  const routerBase = import.meta.env.BASE_URL || '/';
  const cleanBase = routerBase.endsWith('/') ? routerBase.slice(0, -1) : routerBase;
  return `${window.location.origin}${cleanBase}${path.startsWith('/') ? path : '/' + path}`;
}

/**
 * Checks whether an event indicates intent to open in a new tab:
 * - Middle mouse button (button === 1)
 * - Ctrl+Click (Windows/Linux)
 * - Meta+Click (macOS Cmd+Click)
 *
 * Accepts both MouseEvent and base Event (for Quasar component compatibility).
 */
export function isNewTabClick(event: Event): boolean {
  if (!(event instanceof MouseEvent)) return false;
  return event.button === 1 || event.ctrlKey || event.metaKey;
}

/**
 * Opens the given route path in a new browser tab.
 */
export function openInNewTab(path: string): void {
  const url = resolveFullUrl(path);
  window.open(url, '_blank');
}

/**
 * Handles a click event on a navigation element:
 * - If it's a new-tab intent (middle click / Ctrl+click / Cmd+click), opens in a new tab
 * - Otherwise, performs standard in-app navigation using the provided callback
 *
 * @returns `true` if the event was handled as a new-tab open (caller should skip normal nav)
 */
export function handleNavClick(
  event: Event,
  path: string | undefined,
  fallbackNavigate?: () => void | Promise<void>,
): boolean {
  if (!path) {
    void fallbackNavigate?.();
    return false;
  }

  if (isNewTabClick(event)) {
    event.preventDefault();
    event.stopPropagation();
    openInNewTab(path);
    return true;
  }

  void fallbackNavigate?.();
  return false;
}

/**
 * Composable providing navigation helpers for use in Vue components.
 * Extends standard router.push with middle-click / Ctrl+click new-tab support.
 */
export function useNavLink() {
  const router = useRouter();

  /**
   * Navigate to a path, respecting new-tab modifiers.
   * Use this as the @click handler for navigation elements.
   */
  async function navigateOrOpenTab(
    event: Event,
    path: string,
    options?: { onBeforeNavigate?: () => void },
  ): Promise<void> {
    if (isNewTabClick(event)) {
      event.preventDefault();
      event.stopPropagation();
      openInNewTab(path);
      return;
    }

    options?.onBeforeNavigate?.();
    await router.push(path);
  }

  return {
    resolveFullUrl,
    isNewTabClick,
    openInNewTab,
    handleNavClick,
    navigateOrOpenTab,
  };
}
