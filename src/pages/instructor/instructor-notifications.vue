<template>
  <q-page class="instructor-notifications-page">
    <div class="section-container notifications-container">
      <div class="notifications-header">
        <div>
          <div class="text-overline text-primary text-weight-bold">Instructor Notifications</div>
          <h1 class="notifications-title">แจ้งเตือนสำหรับผู้สอน</h1>
          <p class="notifications-subtitle">
            รวมเรื่องที่ต้องติดตาม เช่น งานที่ใกล้ครบกำหนดให้คะแนน งานที่รอตรวจ และประกาศจากระบบ
          </p>
        </div>

        <q-btn
          unelevated
          color="primary"
          icon="done_all"
          label="ทำเครื่องหมายว่าอ่านแล้ว"
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
            <q-tab name="all" label="ทั้งหมด" />
            <q-tab name="urgent" label="เร่งด่วน" />
            <q-tab name="grading" label="ให้คะแนน" />
            <q-tab name="system" label="ระบบ" />
          </q-tabs>

          <q-input
            v-model="searchText"
            outlined
            dense
            debounce="200"
            placeholder="ค้นหาแจ้งเตือน"
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
            class="notification-item"
            :class="{
              'notification-item--unread': !notification.read,
              'notification-item--urgent': notification.priority === 'urgent',
            }"
            @click="openNotification(notification)"
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
              <div class="text-subtitle1 text-weight-bold q-mt-sm">ไม่พบแจ้งเตือน</div>
              <div class="text-body2 text-grey-7">ลองเปลี่ยนตัวกรองหรือคำค้นหา</div>
            </q-item-section>
          </q-item>
        </q-list>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';

type NotificationFilter = 'all' | 'urgent' | 'grading' | 'system';
type NotificationType = 'deadline' | 'grading' | 'activity' | 'system';
type NotificationPriority = 'urgent' | 'normal';

interface InstructorNotification {
  id: number;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  course: string;
  time: string;
  dueDate?: string;
  badge: string;
  badgeColor: string;
  icon: string;
  iconBg: string;
  iconColor: string;
  read: boolean;
  action?: string;
}

const $q = useQuasar();
const router = useRouter();
const activeFilter = ref<NotificationFilter>('all');
const searchText = ref('');

const notifications = ref<InstructorNotification[]>([
  {
    id: 1,
    type: 'deadline',
    priority: 'urgent',
    title: 'เหลือเวลาอีก 2 วันก่อนครบกำหนดให้คะแนน',
    message: 'ใบงานวิเคราะห์กรณีศึกษา มีงานที่ส่งแล้ว 9 รายการที่ยังไม่ได้ให้คะแนน',
    course: 'GEM201 การคิดเชิงวิเคราะห์',
    time: 'แจ้งเตือนวันนี้ 09:00',
    dueDate: 'ครบกำหนด 8 พ.ค. 2569',
    badge: 'เร่งด่วน',
    badgeColor: 'negative',
    icon: 'alarm',
    iconBg: '#ffebee',
    iconColor: '#c62828',
    read: false,
    action: '/instructor/grading',
  },
  {
    id: 2,
    type: 'grading',
    priority: 'urgent',
    title: 'มีคำตอบแบบทดสอบรอตรวจ 18 รายการ',
    message: 'แบบทดสอบปลายบทที่ 3 ปิดรับคำตอบแล้ว ผู้สอนสามารถเริ่มตรวจและประกาศคะแนนได้',
    course: 'LLL102 Digital Learning',
    time: '1 ชั่วโมงที่แล้ว',
    dueDate: 'ควรตรวจภายใน 10 พ.ค. 2569',
    badge: 'ให้คะแนน',
    badgeColor: 'warning',
    icon: 'rate_review',
    iconBg: '#fff3e0',
    iconColor: '#ef6c00',
    read: false,
    action: '/instructor/grading',
  },
  {
    id: 3,
    type: 'activity',
    priority: 'normal',
    title: 'นิสิตส่งงานใหม่ 6 รายการ',
    message: 'มีไฟล์รายงานใหม่จากนิสิตในรายวิชาที่กำลังเปิดสอน',
    course: 'SCI305 Research Skills',
    time: '3 ชั่วโมงที่แล้ว',
    badge: 'งานใหม่',
    badgeColor: 'primary',
    icon: 'upload_file',
    iconBg: '#e3f2fd',
    iconColor: '#1565c0',
    read: false,
  },
  {
    id: 4,
    type: 'deadline',
    priority: 'normal',
    title: 'ใกล้ถึงวันปิดรับงานโครงงานย่อย',
    message: 'เหลือเวลา 5 วันก่อนปิดรับงาน นิสิต 12 คนยังไม่ได้ส่งงาน',
    course: 'BUS210 Business Model',
    time: 'เมื่อวานนี้',
    dueDate: 'ปิดรับ 11 พ.ค. 2569',
    badge: 'ติดตาม',
    badgeColor: 'info',
    icon: 'event',
    iconBg: '#e8f5e9',
    iconColor: '#2e7d32',
    read: true,
  },
  {
    id: 5,
    type: 'system',
    priority: 'normal',
    title: 'ระบบจะปิดปรับปรุงชั่วคราว',
    message: 'ระบบจัดการรายวิชาจะปิดปรับปรุงเพื่ออัปเดตบริการส่งคะแนน',
    course: 'ประกาศจากระบบ',
    time: '2 วันที่แล้ว',
    dueDate: '7 พ.ค. 2569 เวลา 22:00 - 23:30 น.',
    badge: 'ระบบ',
    badgeColor: 'blue-grey',
    icon: 'info',
    iconBg: '#eceff1',
    iconColor: '#455a64',
    read: true,
  },
]);

const summaries = computed(() => [
  {
    label: 'แจ้งเตือนยังไม่อ่าน',
    value: notifications.value.filter((item) => !item.read).length,
    icon: 'notifications_active',
    color: '#1565c0',
    bg: '#e3f2fd',
  },
  {
    label: 'งานเร่งด่วน',
    value: notifications.value.filter((item) => item.priority === 'urgent').length,
    icon: 'priority_high',
    color: '#c62828',
    bg: '#ffebee',
  },
  {
    label: 'รายการรอให้คะแนน',
    value: 27,
    icon: 'fact_check',
    color: '#ef6c00',
    bg: '#fff3e0',
  },
  {
    label: 'กำหนดส่งใกล้มาถึง',
    value: 3,
    icon: 'event_available',
    color: '#2e7d32',
    bg: '#e8f5e9',
  },
]);

const filteredNotifications = computed(() => {
  const query = searchText.value.trim().toLowerCase();

  return notifications.value.filter((notification) => {
    const matchesFilter =
      activeFilter.value === 'all' ||
      (activeFilter.value === 'urgent' && notification.priority === 'urgent') ||
      (activeFilter.value === 'grading' &&
        (notification.type === 'grading' || notification.type === 'deadline')) ||
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

function markAllAsRead() {
  notifications.value = notifications.value.map((notification) => ({
    ...notification,
    read: true,
  }));

  $q.notify({
    type: 'positive',
    message: 'ทำเครื่องหมายว่าอ่านแจ้งเตือนทั้งหมดแล้ว',
    position: 'bottom-right',
    timeout: 1200,
  });
}

function openNotification(notification: InstructorNotification) {
  notification.read = true;

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
