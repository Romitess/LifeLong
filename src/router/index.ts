import { defineRouter } from '#q-app/wrappers';
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory,
} from 'vue-router';
import routes from './routes';
import {
  AUTH_NAVIGATION_LOADING_DELAY_MS,
  hideAuthNavigationLoading,
  showAuthNavigationLoading,
} from 'src/composables/use-auth-navigation-loading';
import { useAuthStore } from 'src/stores/auth-store';

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter(({ store /*, ssrContext */ }) => {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : process.env.VUE_ROUTER_MODE === 'history'
      ? createWebHistory
      : createWebHashHistory;

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE),
  });

  function wait(ms: number): Promise<void> {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }

  function getErrorMessage(error: unknown): string {
    if (error instanceof Error) return error.message;

    if (typeof error === 'object' && error !== null && 'message' in error) {
      return String((error as { message?: unknown }).message);
    }

    return String(error);
  }

  function isDynamicImportError(error: unknown): boolean {
    const message = getErrorMessage(error);

    return (
      message.includes('Failed to fetch dynamically imported module') ||
      message.includes('error loading dynamically imported module') ||
      message.includes('Importing a module script failed') ||
      message.includes('Unable to preload CSS') ||
      message.includes('dynamically imported module') ||
      /Loading chunk \d+ failed/i.test(message)
    );
  }

  function reloadForUpdatedChunk(fullPath?: string): void {
    const targetFullPath =
      fullPath ?? window.location.hash.replace(/^#/, '') ?? window.location.pathname;
    const reloadKey = `chunk-reload:v2:${targetFullPath}`;

    if (sessionStorage.getItem(reloadKey) === 'true') {
      console.error('[Router Guard] Dynamic route chunk is still unavailable after reload.');
      return;
    }

    sessionStorage.setItem(reloadKey, 'true');

    if (targetFullPath) {
      window.location.hash = targetFullPath;
    }

    window.location.reload();
  }

  let isInitialLoad = true;

  Router.beforeEach(async (to, from) => {
    if (isInitialLoad) {
      isInitialLoad = false;
    }

    // Use the Pinia instance provided by Quasar
    const authStore = useAuthStore(store);

    // Get state from store
    const storeIsLoggedIn = authStore.isLoggedIn;
    const storeUserRole = authStore.user?.role;

    // Fallback/Verify with localStorage (sometimes store isn't ready in the first microtask)
    const localIsLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const userEmail = localStorage.getItem('userEmail');

    const isLoggedIn = storeIsLoggedIn || localIsLoggedIn;
    const authRequired = !to.matched.some((record) => record.meta.public);

    console.log(`[Router Guard] Navigation to: ${to.path}`, {
      isLoggedIn,
      authRequired,
      storeUserRole,
      localIsLoggedIn,
    });

    // 1. Check Authentication
    if (authRequired && !isLoggedIn) {
      console.log(`[Router Guard] Auth required. Redirecting to login. Target: ${to.path}`);
      return {
        path: '/login',
        query: { redirect: to.fullPath },
      };
    }

    // 2. Check Role Authorization
    const requiredRole = to.meta.role as string | undefined;
    if (requiredRole && isLoggedIn) {
      // Determine final user role to check
      let finalUserRole = storeUserRole;

      // If store doesn't have it, try to re-init or infer from account storage
      if (!finalUserRole && userEmail) {
        console.log('[Router Guard] Store role missing, attempting re-init for check...');
        // We can check if the store can re-hydrate
        if (!authStore.user) {
          // Triggering a read of state if needed, though useAuthStore(store) should have done it
        }
        finalUserRole = authStore.user?.role;
      }

      const isAuthorized = ((): boolean => {
        if (!finalUserRole) return false;

        const normalizedUserRole = finalUserRole.toLowerCase().replace(/-/g, '_');
        const normalizedRequiredRole = requiredRole.toLowerCase().replace(/-/g, '_');

        const match =
          normalizedUserRole === normalizedRequiredRole ||
          (normalizedRequiredRole === 'teach' &&
            (normalizedUserRole === 'teach' || normalizedUserRole === 'instructor')) ||
          (normalizedRequiredRole === 'instructor' &&
            (normalizedUserRole === 'teach' || normalizedUserRole === 'instructor'));

        return match;
      })();

      console.log(`[Router Guard] Role check for ${to.path}:`, {
        required: requiredRole,
        userRole: finalUserRole,
        isAuthorized,
      });

      if (!isAuthorized) {
        console.warn(
          `[Router Guard] Access denied. Required: ${requiredRole}, User: ${finalUserRole}`,
        );
        return '/main';
      }
    }

    const targetPath = to.path;
    const shouldShowAuthLoading =
      (targetPath === '/login' || targetPath === '/register') &&
      from.matched.length > 0 &&
      from.path !== '/login' &&
      from.path !== '/register';

    if (shouldShowAuthLoading) {
      showAuthNavigationLoading();
      await wait(AUTH_NAVIGATION_LOADING_DELAY_MS);
    }
  });

  Router.afterEach(() => {
    hideAuthNavigationLoading();
  });

  Router.onError((error, to) => {
    hideAuthNavigationLoading();

    if (process.env.CLIENT && isDynamicImportError(error)) {
      reloadForUpdatedChunk(to.fullPath);
    }
  });

  if (process.env.CLIENT) {
    window.addEventListener('unhandledrejection', (event) => {
      if (isDynamicImportError(event.reason)) {
        event.preventDefault();
        hideAuthNavigationLoading();
        reloadForUpdatedChunk();
      }
    });
  }

  return Router;
});
