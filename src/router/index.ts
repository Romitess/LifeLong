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

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default defineRouter((/* { store, ssrContext } */) => {
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

  let isInitialLoad = true;

  Router.beforeEach(async (to, from) => {
    if (isInitialLoad) {
      isInitialLoad = false;

      // Only force home and logout if it's a new tab/window session
      const isNewSession = !sessionStorage.getItem('lll-app-initialized');

      if (isNewSession) {
        sessionStorage.setItem('lll-app-initialized', 'true');
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userEmail');

        if (to.path !== '/main' && to.path !== '/') {
          return { path: '/main' };
        }
      }
    }

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const authRequired = !to.matched.some((record) => record.meta.public);
    const loginRedirect =
      authRequired && !isLoggedIn
        ? {
            path: '/login',
            query: { redirect: to.fullPath },
          }
        : null;
    const targetPath = loginRedirect?.path ?? to.path;
    const shouldShowAuthLoading =
      (targetPath === '/login' || targetPath === '/register') &&
      from.matched.length > 0 &&
      from.path !== '/login' &&
      from.path !== '/register';

    if (shouldShowAuthLoading) {
      showAuthNavigationLoading();
      await wait(AUTH_NAVIGATION_LOADING_DELAY_MS);
    }

    if (loginRedirect) {
      return loginRedirect;
    }
  });

  Router.afterEach(() => {
    hideAuthNavigationLoading();
  });

  Router.onError(() => {
    hideAuthNavigationLoading();
  });

  return Router;
});
