<template>
  <q-page class="admin-page admin-course-copy-page">
    <AppPageHero
      eyebrow="Course Registry"
      eyebrow-icon="content_copy"
      :title="course?.nameTh ?? 'คัดลอกทะเบียนรายวิชา'"
      :description="course?.nameEn ?? ''"
    />

    <section class="admin-shell admin-content">
      <div class="admin-course-copy-page__back">
        <AppActionButton
          variant="primary"
          icon="arrow_back"
          label="กลับไปรายการ"
          no-caps
          dense
          tag="a"
          :href="resolveFullUrl('/admin/courses')"
          @click="onBackClick"
        />
      </div>

      <div v-if="loading" class="admin-course-copy-page__loading">
        <q-spinner size="40px" color="primary" />
      </div>

      <template v-else>
        <AdminCourseForm v-model:active-tab="activeTab" :readonly="true" :initial-data="course" />

        <div class="admin-course-copy-page__remark">
          <div class="admin-course-copy-page__remark-title">
            <q-icon name="info" size="18px" />
            หมายเหตุ
          </div>
          <p class="admin-course-copy-page__remark-body">
            หลังจากคลิกปุ่ม "คัดลอกทะเบียนรายวิชา" ระบบจะคัดลอกข้อมูลทั้งหมด ยกเว้น ไฟล์แนบ และ
            Skill Mapping โดยสร้างรหัสวิชาใหม่ และแสดงหน้าจอ "แก้ไขทะเบียนรายวิชา"
            เพื่อให้ผู้ใช้บันทึกข้อมูลให้กับรายวิชาใหม่ ดังต่อไปนี้
          </p>
          <ol class="admin-course-copy-page__remark-list">
            <li>
              <strong>ไฟล์แนบ (ถ้ามี)</strong> : ให้แนบไฟล์ใหม่หลังจากคัดลอกรายวิชาเรียบร้อยแล้ว
            </li>
            <li>
              <strong>Skill Mapping</strong> : ระบบดึงชุด Skill ปัจจุบันที่เปิดใช้งาน
              ให้กรอกคะแนนแต่ละ Skill ใหม่หลังจากคัดลอกรายวิชาเรียบร้อยแล้ว
            </li>
          </ol>
        </div>

        <div class="admin-course-copy-page__actions">
          <AppActionButton
            variant="secondary"
            label="ยกเลิก"
            no-caps
            @click="void router.push('/admin/courses')"
          />
          <AppActionButton
            variant="primary"
            icon="content_copy"
            label="คัดลอกทะเบียนรายวิชา"
            no-caps
            :loading="isCopying"
            @click="confirmCopyOpen = true"
          />
        </div>
      </template>
    </section>

    <AppConfirmDialog
      v-model="confirmCopyOpen"
      title="คัดลอกทะเบียนรายวิชา"
      :message="`ยืนยันการคัดลอกรายวิชา &quot;${course?.nameTh ?? ''}&quot; ระบบจะสร้างรายวิชาใหม่พร้อม generate รหัสวิชาใหม่อัตโนมัติ`"
      confirm-label="คัดลอก"
      cancel-label="ยกเลิก"
      confirm-icon="content_copy"
      :persistent="isCopying"
      @confirm="handleCopy"
      @cancel="confirmCopyOpen = false"
    />
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import { isNewTabClick, resolveFullUrl } from 'src/composables/use-nav-link';
import type { AdminCourseDetail } from 'src/types/admin-courses';
import { useAdminCourses } from 'src/composables/use-admin-courses';
import AppPageHero from 'components/common/AppPageHero.vue';
import AdminCourseForm from 'components/admin/AdminCourseForm.vue';
import AppActionButton from 'components/common/AppActionButton.vue';
import AppConfirmDialog from 'components/common/AppConfirmDialog.vue';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();

type CourseFormTab = 'info' | 'chapters';

const activeTab = ref<CourseFormTab>('info');

const TAB_TO_SLUG: Record<CourseFormTab, string> = {
  info: 'info',
  chapters: 'chapters',
};

const SLUG_TO_TAB: Record<string, CourseFormTab> = {
  info: 'info',
  chapters: 'chapters',
};

function getRouteSlug(): string {
  const raw = route.params.tab;
  return Array.isArray(raw) ? (raw[0] ?? '') : (raw ?? '');
}

watch(
  () => route.params.tab,
  () => {
    const tab = SLUG_TO_TAB[getRouteSlug()] ?? 'info';
    if (tab !== activeTab.value) {
      activeTab.value = tab;
    }
  },
  { immediate: true },
);

watch(activeTab, (tab) => {
  const slug = TAB_TO_SLUG[tab];
  if (slug && slug !== getRouteSlug()) {
    void router.replace({ path: `/admin/courses/${route.params.id as string}/copy/${slug}` });
  }
});

function onBackClick(event: Event) {
  if (isNewTabClick(event)) {
    return;
  }
  event.preventDefault();
  void router.push('/admin/courses');
}

const { fetchCourseDetail, fetchFormOptions, copyCourse } = useAdminCourses();

const course = ref<AdminCourseDetail | null>(null);
const loading = ref(true);
const confirmCopyOpen = ref(false);
const isCopying = ref(false);

onMounted(async () => {
  const id = Number(route.params.id);
  [course.value] = await Promise.all([fetchCourseDetail(id), fetchFormOptions()]);
  loading.value = false;
});

async function handleCopy(): Promise<void> {
  if (!course.value) return;
  isCopying.value = true;
  try {
    const { courseId } = await copyCourse(course.value.courseId);
    confirmCopyOpen.value = false;
    $q.notify({ type: 'positive', message: 'คัดลอกทะเบียนรายวิชาเรียบร้อยแล้ว', position: 'top' });
    void router.push(`/admin/courses/${courseId}/edit`);
  } catch {
    $q.notify({ type: 'negative', message: 'คัดลอกรายวิชาไม่สำเร็จ', position: 'top' });
  } finally {
    isCopying.value = false;
  }
}
</script>

<style scoped lang="scss">
.admin-course-copy-page__back {
  margin-bottom: 16px;
}

.admin-course-copy-page__loading {
  display: flex;
  justify-content: center;
  padding: 60px;
}

.admin-course-copy-page__remark {
  margin-top: 28px;
  padding: 20px 24px;
  border-radius: var(--admin-radius-md);
  background: var(--admin-warning-soft);
  border: 1px solid rgba(245, 166, 35, 0.25);
}

.admin-course-copy-page__remark-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
  font-size: 0.95rem;
  color: var(--admin-accent-ink);
  margin-bottom: 10px;
}

.admin-course-copy-page__remark-body {
  margin: 0 0 10px;
  font-size: 0.9rem;
  line-height: 1.6;
  color: var(--admin-ink);
}

.admin-course-copy-page__remark-list {
  margin: 0;
  padding-left: 20px;
  font-size: 0.9rem;
  line-height: 1.7;
  color: var(--admin-ink);

  li + li {
    margin-top: 4px;
  }
}

.admin-course-copy-page__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  margin-top: 28px;
}
</style>
