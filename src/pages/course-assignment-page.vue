<template>
  <q-page class="bg-grey-1 assignment-page">
    <q-layout
      view="lHh Lpr lFf"
      container
      style="height: calc(100vh - 64px)"
      class="assignment-layout"
    >
      <q-drawer v-model="leftDrawerOpen" bordered :width="300" :breakpoint="1024" class="bg-white">
        <SidebarNavigation />
      </q-drawer>

      <q-page-container>
        <!-- Loading -->
        <div v-if="isLoading" class="assignment-center-state">
          <q-spinner color="primary" size="48px" />
          <div class="text-grey-6 q-mt-md">กำลังโหลดงาน...</div>
        </div>

        <!-- Error -->
        <div v-else-if="!ssoUrl" class="assignment-center-state">
          <q-icon name="error_outline" size="48px" color="negative" />
          <div class="text-h6 q-mt-md">ไม่สามารถโหลดงานได้</div>
          <div class="text-grey-6 q-mt-xs q-mb-lg">กรุณาตรวจสอบการเชื่อมต่อและลองใหม่อีกครั้ง</div>
          <q-btn unelevated color="primary" no-caps label="กลับไปหน้ารายวิชา" @click="goBack" />
        </div>

        <!-- Assignment iframe -->
        <div v-else class="assignment-shell">
          <div class="assignment-topbar">
            <div class="assignment-topbar-inner">
              <q-btn flat dense round icon="arrow_back" color="grey-7" @click="goBack" />
              <nav class="assignment-breadcrumb">
                <RouterLink to="/course-home" class="breadcrumb-el">
                  <q-icon name="home" size="16px" />
                </RouterLink>
                <q-icon name="chevron_right" size="14px" color="grey-4" />
                <span class="breadcrumb-el cursor-pointer" @click="goBack">{{ courseTitle }}</span>
                <q-icon name="chevron_right" size="14px" color="grey-4" />
                <span class="breadcrumb-el breadcrumb-el--current">{{ assignmentTitle }}</span>
              </nav>
            </div>
          </div>

          <iframe
            :src="ssoUrl"
            class="assignment-frame"
            title="Assignment"
            allow="fullscreen; clipboard-write"
          />
        </div>
      </q-page-container>
    </q-layout>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { RouterLink, useRoute, useRouter } from 'vue-router';
import SidebarNavigation from 'components/navigation/sidebar-navigation.vue';
import { useCourseStore } from 'src/stores/course-store';
import { useAuthStore } from 'src/stores/auth-store';
import { useMoodleSso } from 'src/composables/use-moodle-sso';

const route = useRoute();
const router = useRouter();
const courseStore = useCourseStore();
const authStore = useAuthStore();
const { getMoodleActivityUrl } = useMoodleSso();

const leftDrawerOpen = ref(false);
const isLoading = ref(true);
const ssoUrl = ref('');

const courseId = computed<string>(() => {
  const id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
  return id || '';
});

const moduleId = computed<string>(() => {
  const id = Array.isArray(route.params.moduleId)
    ? route.params.moduleId[0]
    : route.params.moduleId;
  return id || '';
});

const moodleUrl = computed<string>(() => {
  const val = route.query.moodleUrl;
  return Array.isArray(val) ? (val[0] ?? '') : (val ?? '');
});

const moodleCourseIdFromQuery = computed<string>(() => {
  const val = route.query.moodleCourseId;
  return Array.isArray(val) ? (val[0] ?? '') : (val ?? '');
});

const modname = computed<string>(() => {
  const val = route.query.modname;
  return Array.isArray(val) ? (val[0] ?? 'assign') : (val ?? 'assign');
});

const assignmentTitle = computed<string>(() => {
  const val = route.query.title;
  const raw = Array.isArray(val) ? (val[0] ?? '') : (val ?? '');
  return raw ? decodeURIComponent(raw) : 'งาน';
});

const currentCourse = computed(() => courseStore.getCourseDetailById(courseId.value));
const courseTitle = computed<string>(() => currentCourse.value?.title || 'รายวิชา');

function goBack(): void {
  void router.push(`/course/${courseId.value}/learn`);
}

onMounted(async () => {
  const moodleCourseId =
    currentCourse.value?.moodleId ||
    (moodleCourseIdFromQuery.value ? Number(moodleCourseIdFromQuery.value) : null);
  const username = authStore.user?.username || authStore.user?.email || '';

  if (!moodleCourseId || !username) {
    ssoUrl.value = moodleUrl.value;
    isLoading.value = false;
    return;
  }

  if (moodleUrl.value) {
    // Have a direct activity URL — get an SSO URL pointing to it
    const url = await getMoodleActivityUrl(moodleCourseId, username, moodleUrl.value);
    ssoUrl.value = url ?? moodleUrl.value;
  } else {
    // No URL — construct path from module ID and let backend build the full SSO URL
    const url = await getMoodleActivityUrl(
      moodleCourseId,
      username,
      `/mod/${modname.value}/view.php?id=${moduleId.value}`,
    );
    ssoUrl.value = url ?? '';
  }

  isLoading.value = false;
});
</script>

<style lang="scss" scoped>
.assignment-page {
  height: calc(100vh - 64px);
  overflow: hidden;
}

.assignment-layout {
  height: calc(100vh - 64px);
}

.assignment-center-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: calc(100vh - 64px);
  gap: 4px;
  text-align: center;
  padding: 24px;
}

.assignment-shell {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 64px);
}

.assignment-topbar {
  background: #fff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  padding: 8px 16px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.assignment-topbar-inner {
  display: flex;
  align-items: center;
  gap: 8px;
  max-width: 1280px;
  margin: 0 auto;
}

.assignment-breadcrumb {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 0.875rem;
  font-weight: 500;
  flex: 1;
  overflow: hidden;
}

.breadcrumb-el {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #6b7280;
  text-decoration: none;
  padding: 2px 4px;
  border-radius: 4px;
  white-space: nowrap;
  transition: color 0.2s;

  &:hover {
    color: var(--q-primary);
  }

  &--current {
    color: #1a1a1a;
    font-weight: 700;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

.assignment-frame {
  flex: 1;
  width: 100%;
  border: 0;
  background: #fff;
}
</style>
