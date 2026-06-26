<template>
  <q-page class="instructor-notifications-page">
    <div class="section-container notifications-container">
      <div class="notifications-header">
        <div>
          <div class="text-overline text-primary text-weight-bold">Instructor Notifications</div>
          <h1 class="notifications-title">{{ notificationPageTitle }}</h1>
          <p class="notifications-subtitle">{{ notificationPageSubtitle }}</p>
        </div>

        <q-btn
          unelevated
          color="primary"
          icon="done_all"
          :label="t('instructor.notifPage.markAllRead')"
          class="notifications-action"
          no-caps
          @click="markAllAsRead"
        />
      </div>

      <div class="row q-col-gutter-md q-mb-lg">
        <div v-for="summary in summaries" :key="summary.label" class="col-12 col-sm-6 col-lg-3">
          <q-card flat bordered class="summary-card">
            <q-card-section class="summary-card__content">
              <div
                class="summary-card__icon"
                :style="{ background: summary.bg, color: summary.color }"
              >
                <q-icon :name="summary.icon" size="24px" />
              </div>
              <div>
                <div class="summary-card__value">{{ summary.value }}</div>
                <div class="summary-card__label">{{ summary.label }}</div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <div class="notifications-shell">
        <div class="notifications-toolbar">
          <q-tabs
            v-model="activeFilter"
            dense
            no-caps
            active-color="primary"
            indicator-color="primary"
            class="notification-tabs"
          >
            <q-tab name="all" :label="t('instructor.notifPage.tabAll')" />
            <q-tab name="urgent" :label="t('instructor.notifPage.tabUrgent')" />
            <q-tab name="grading" :label="primaryWorkFilterLabel" />
            <q-tab name="system" :label="t('instructor.notifPage.tabSystem')" />
          </q-tabs>

          <q-input
            v-model="searchText"
            outlined
            dense
            debounce="200"
            :placeholder="t('instructor.notifPage.searchPlaceholder')"
            class="notification-search"
          >
            <template #prepend>
              <q-icon name="search" />
            </template>
          </q-input>
        </div>

        <q-separator />

        <q-list separator class="notification-list">
          <q-item
            v-for="notification in filteredNotifications"
            :key="notification.id"
            clickable
            v-ripple
            tag="a"
            :href="resolveFullUrl(notification.action || '')"
            class="notification-item"
            :class="{
              'notification-item--unread': !notification.read,
              'notification-item--urgent': notification.priority === 'urgent',
            }"
            @click.prevent="openNotification(notification, $event)"
          >
            <q-item-section avatar top>
              <div
                class="notification-icon"
                :style="{ background: notification.iconBg, color: notification.iconColor }"
              >
                <q-icon :name="notification.icon" size="22px" />
              </div>
            </q-item-section>

            <q-item-section>
              <div class="notification-item__topline">
                <div class="notification-title">{{ notification.title }}</div>
                <q-badge
                  rounded
                  :color="notification.priority === 'urgent' ? 'negative' : notification.badgeColor"
                  class="notification-badge"
                >
                  {{ notification.badge }}
                </q-badge>
              </div>
              <q-item-label class="notification-message">
                {{ notification.message }}
              </q-item-label>
              <div class="notification-meta">
                <span>{{ notification.course }}</span>
                <span>{{ notification.time }}</span>
                <span v-if="notification.dueDate">{{ notification.dueDate }}</span>
              </div>
            </q-item-section>

            <q-item-section side top>
              <q-btn
                flat
                round
                dense
                icon="chevron_right"
                color="grey-6"
                :aria-label="`เปิด ${notification.title}`"
              />
            </q-item-section>
          </q-item>

          <q-item v-if="filteredNotifications.length === 0" class="empty-state">
            <q-item-section class="text-center">
              <q-icon name="notifications_off" size="48px" color="grey-5" />
              <div class="text-subtitle1 text-weight-bold q-mt-sm">
                {{ t('instructor.notifPage.emptyTitle') }}
              </div>
              <div class="text-body2 text-grey-7">{{ t('instructor.notifPage.emptyHint') }}</div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useAuthStore } from 'src/stores/auth-store';
import {
  TEACHER_NOTIFICATION_ITEMS,
  isTeachingRole as isTeachingNotificationRole,
  type AppNotification,
} from 'src/data/mock-notifications';
import { useNotifications } from 'src/composables/use-notifications';
import { isNewTabClick, resolveFullUrl } from 'src/composables/use-nav-link';

type NotificationFilter = 'all' | 'urgent' | 'grading' | 'system';

const { t } = useI18n();
const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();
const activeFilter = ref<NotificationFilter>('all');
const searchText = ref('');
const notificationsApi = useNotifications();

const teacherNotifications = ref<AppNotification[]>(
  TEACHER_NOTIFICATION_ITEMS.map((item) => ({ ...item })),
);
const isTeachingRole = computed(() => isTeachingNotificationRole(authStore.user?.role));

const apiStudentNotifications = computed<AppNotification[]>(() =>
  notificationsApi.notifications.value.map((n) => ({
    id: n.id,
    type: 'course' as const,
    priority: 'normal' as const,
    title: n.title,
    message: n.message,
    course: '',
    time: new Date(n.createDate).toLocaleDateString('th-TH', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }),
    badge: 'ประกาศ',
    badgeColor: 'teal',
    icon: 'campaign',
    iconBg: 'rgba(245, 166, 35, 0.15)',
    iconColor: '#f5a623',
    read: n.isRead,
  })),
);

const notifications = computed(() =>
  isTeachingRole.value ? teacherNotifications.value : apiStudentNotifications.value,
);

onMounted(async () => {
  if (!isTeachingRole.value && !notificationsApi.loaded.value) {
    await notificationsApi.fetchNotifications();
  }
});
const notificationPageTitle = computed(() =>
  isTeachingRole.value
    ? t('instructor.notifPage.teacherTitle')
    : t('instructor.notifPage.studentTitle'),
);
const notificationPageSubtitle = computed(() =>
  isTeachingRole.value
    ? t('instructor.notifPage.teacherSubtitle')
    : t('instructor.notifPage.studentSubtitle'),
);
const primaryWorkFilterLabel = computed(() =>
  isTeachingRole.value
    ? t('instructor.notifPage.tabGrading')
    : t('instructor.notifPage.tabLearning'),
);

const summaries = computed(() => {
  const unreadCount = notifications.value.filter((item) => !item.read).length;
  const urgentCount = notifications.value.filter((item) => item.priority === 'urgent').length;

  if (!isTeachingRole.value) {
    return [
      {
        label: t('instructor.notifPage.summary.unread'),
        value: unreadCount,
        icon: 'notifications_active',
        color: '#1565c0',
        bg: '#e3f2fd',
      },
      {
        label: t('instructor.notifPage.summary.nearDeadline'),
        value: urgentCount,
        icon: 'event_available',
        color: '#c62828',
        bg: '#ffebee',
      },
      {
        label: t('instructor.notifPage.summary.courseNews'),
        value: notifications.value.filter((item) => item.type === 'course').length,
        icon: 'menu_book',
        color: '#2e7d32',
        bg: '#e8f5e9',
      },
      {
        label: t('instructor.notifPage.summary.myDocuments'),
        value: notifications.value.filter((item) => item.type === 'payment').length,
        icon: 'receipt_long',
        color: '#ef6c00',
        bg: '#fff3e0',
      },
    ];
  }

  return [
    {
      label: t('instructor.notifPage.summary.teacherUnread'),
      value: unreadCount,
      icon: 'notifications_active',
      color: '#1565c0',
      bg: '#e3f2fd',
    },
    {
      label: t('instructor.notifPage.summary.urgentWork'),
      value: urgentCount,
      icon: 'priority_high',
      color: '#c62828',
      bg: '#ffebee',
    },
    {
      label: t('instructor.notifPage.summary.pendingGrading'),
      value: notifications.value.filter((item) => item.type === 'grading').length,
      icon: 'fact_check',
      color: '#ef6c00',
      bg: '#fff3e0',
    },
    {
      label: t('instructor.notifPage.summary.nearDeadlineTeacher'),
      value: notifications.value.filter((item) => item.type === 'deadline').length,
      icon: 'event_available',
      color: '#2e7d32',
      bg: '#e8f5e9',
    },
  ];
});

const filteredNotifications = computed(() => {
  const query = searchText.value.trim().toLowerCase();

  return notifications.value.filter((notification) => {
    const matchesFilter =
      activeFilter.value === 'all' ||
      (activeFilter.value === 'urgent' && notification.priority === 'urgent') ||
      (activeFilter.value === 'grading' &&
        (isTeachingRole.value
          ? notification.type === 'grading' || notification.type === 'deadline'
          : notification.type === 'course' ||
            notification.type === 'deadline' ||
            notification.type === 'payment')) ||
      (activeFilter.value === 'system' && notification.type === 'system');

    if (!matchesFilter) {
      return false;
    }

    if (!query) {
      return true;
    }

    return [notification.title, notification.message, notification.course]
      .join(' ')
      .toLowerCase()
      .includes(query);
  });
});

async function markAllAsRead(): Promise<void> {
  if (isTeachingRole.value) {
    teacherNotifications.value = teacherNotifications.value.map((n) => ({ ...n, read: true }));
  } else {
    await notificationsApi.markAllRead();
  }

  $q.notify({
    type: 'positive',
    message: t('instructor.notifPage.markedAllRead'),
    position: 'bottom-right',
    timeout: 1200,
  });
}

async function openNotification(notification: AppNotification, event?: Event): Promise<void> {
  if (event && isNewTabClick(event)) {
    if (!isTeachingRole.value) {
      void notificationsApi.markRead(notification.id);
    } else {
      notification.read = true;
    }
    return;
  }

  if (!isTeachingRole.value) {
    await notificationsApi.markRead(notification.id);
  } else {
    notification.read = true;
  }

  if (notification.action) {
    void router.push(notification.action);
    return;
  }

  $q.notify({
    type: 'info',
    message: notification.title,
    position: 'bottom-right',
    timeout: 1200,
  });
}
</script>

<style lang="scss" scoped>
.instructor-notifications-page {
  min-height: 100vh;
  background: #f8f6f1;
}

.notifications-container {
  padding-top: 48px;
  padding-bottom: 72px;
}

.notifications-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 20px;
  align-items: end;
  margin-bottom: 24px;
}

.notifications-title {
  margin: 0;
  color: #263238;
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1.2;
}

.notifications-subtitle {
  max-width: 760px;
  margin: 8px 0 0;
  color: #607d8b;
  font-size: 1rem;
  line-height: 1.7;
}

.notifications-action {
  min-height: 40px;
  border-radius: 8px;
  font-weight: 700;
}

.summary-card {
  border-radius: 8px;
  background: #ffffff;
}

.summary-card__content {
  display: flex;
  gap: 14px;
  align-items: center;
}

.summary-card__icon {
  display: grid;
  width: 48px;
  height: 48px;
  flex: 0 0 48px;
  place-items: center;
  border-radius: 8px;
}

.summary-card__value {
  color: #263238;
  font-size: 1.75rem;
  font-weight: 800;
  line-height: 1;
}

.summary-card__label {
  margin-top: 5px;
  color: #607d8b;
  font-size: 0.86rem;
  font-weight: 700;
}

.notifications-shell {
  overflow: hidden;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 8px;
  background: #ffffff;
}

.notifications-toolbar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 320px);
  gap: 16px;
  align-items: center;
  padding: 14px 16px;
}

.notification-tabs {
  justify-self: start;
}

.notification-search {
  width: 100%;
}

.notification-list {
  background: #ffffff;
}

.notification-item {
  min-height: 112px;
  padding: 18px 16px;
  border-left: 4px solid transparent;
  transition:
    background-color 0.18s ease,
    border-color 0.18s ease;

  &:hover {
    background: #fafafa;
  }
}

.notification-item--unread {
  background: #fffdf5;
  border-left-color: $primary;
}

.notification-item--urgent {
  border-left-color: #c62828;
}

.notification-icon {
  display: grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 8px;
}

.notification-item__topline {
  display: flex;
  gap: 10px;
  align-items: center;
  min-width: 0;
}

.notification-title {
  min-width: 0;
  color: #263238;
  font-size: 1rem;
  font-weight: 800;
  line-height: 1.35;
}

.notification-badge {
  flex: 0 0 auto;
  font-weight: 800;
}

.notification-message {
  margin-top: 6px;
  color: #455a64;
  line-height: 1.55;
}

.notification-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  margin-top: 10px;
  color: #78909c;
  font-size: 0.82rem;
  font-weight: 700;
}

.empty-state {
  min-height: 220px;
}

@media (max-width: 900px) {
  .notifications-header,
  .notifications-toolbar {
    grid-template-columns: 1fr;
  }

  .notifications-action {
    justify-self: start;
  }
}

@media (max-width: 600px) {
  .notifications-container {
    padding-top: 32px;
    padding-bottom: 56px;
  }

  .notifications-title {
    font-size: 1.65rem;
  }

  .notification-item {
    padding: 16px 12px;
  }

  .notification-item__topline {
    align-items: flex-start;
    flex-direction: column;
  }

  .notification-search {
    min-width: 0;
  }
}
</style>
