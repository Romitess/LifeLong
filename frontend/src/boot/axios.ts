import { defineBoot } from '#q-app/wrappers';
import axios, { type AxiosInstance } from 'axios';
import { useAuthStore } from 'src/stores/auth-store';

declare module 'vue' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

const api = axios.create({
  baseURL:
    (import.meta.env.BACKEND_URL as string) || (import.meta.env.VITE_BACKEND_URL as string) || '',
});

export default defineBoot(({ app, router: vueRouter }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;

  // Attach JWT token from Pinia on every request
  api.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    if (authStore.token) {
      config.headers['Authorization'] = `Bearer ${authStore.token}`;
    }
    return config;
  });

  // On 401, clear session and redirect to login
  api.interceptors.response.use(
    (response) => response,
    (error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        const authStore = useAuthStore();
        authStore.logout();
        void vueRouter.push('/login');
      }
      if (status === 403) {
        void vueRouter.push('/403');
        // Never resolve/reject so the calling component's catch block never fires
        return new Promise(() => {});
      }
      return Promise.reject(error instanceof Error ? error : new Error(String(error)));
    },
  );
});

export { api };
