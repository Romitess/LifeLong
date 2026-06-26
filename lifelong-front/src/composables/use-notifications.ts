import { ref, computed } from 'vue';
import { api } from 'src/boot/axios';

export interface AppNotificationItem {
  id: number;
  type: string;
  title: string;
  message: string;
  refId: number | null;
  refType: string | null;
  isRead: boolean;
  createDate: string;
}

const notifications = ref<AppNotificationItem[]>([]);
const isLoading = ref(false);
const error = ref<string | null>(null);
const loaded = ref(false);

export function useNotifications() {
  async function fetchNotifications(): Promise<void> {
    isLoading.value = true;
    error.value = null;
    try {
      const { data } = await api.get<AppNotificationItem[]>('/api/notifications');
      notifications.value = data;
      loaded.value = true;
    } catch (e) {
      error.value = e instanceof Error ? e.message : 'โหลดการแจ้งเตือนไม่สำเร็จ';
    } finally {
      isLoading.value = false;
    }
  }

  async function markRead(id: number): Promise<void> {
    await api.patch(`/api/notifications/${id}/read`);
    const item = notifications.value.find((n) => n.id === id);
    if (item) item.isRead = true;
  }

  async function markAllRead(): Promise<void> {
    await api.patch('/api/notifications/read-all');
    notifications.value.forEach((n) => {
      n.isRead = true;
    });
  }

  const unreadCount = computed(() => notifications.value.filter((n) => !n.isRead).length);

  return {
    notifications,
    isLoading,
    error,
    unreadCount,
    loaded,
    fetchNotifications,
    markRead,
    markAllRead,
  };
}
