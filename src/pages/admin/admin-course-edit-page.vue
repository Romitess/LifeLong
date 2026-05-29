<template>
  <q-page class="admin-page admin-course-edit-page">
    <AdminPageHero
      eyebrow="Course Registry"
      eyebrow-icon="edit"
      :title="course ? `แก้ไข: ${course.nameTh}` : 'แก้ไขรายวิชา'"
      description="แก้ไขข้อมูลรายวิชาหรือหลักสูตรระยะสั้น"
    />

    <section class="admin-shell admin-content">
      <div class="admin-course-edit-page__back">
        <AdminActionButton
          variant="primary"
          icon="arrow_back"
          label="กลับไปรายการ"
          no-caps
          dense
          @click="void router.push('/admin/courses')"
        />
      </div>

      <div v-if="loading" class="admin-course-edit-page__loading">
        <q-spinner size="40px" color="primary" />
      </div>

      <AdminCourseForm
        v-else
        :initial-data="course"
        :submit-override="submitOverride"
        :is-publishing="isPublishing"
        :is-retrying="isRetrying"
        @cancel="void router.push('/admin/courses')"
        @saved="onSaved"
        @publish="onPublish"
        @unpublish="onUnpublish"
        @retry-sync="onRetrySync"
      />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useQuasar } from 'quasar';
import type { AdminCourseDetail, CreateCoursePayload } from 'src/types/admin-courses';
import { useAdminCourses } from 'src/composables/use-admin-courses';
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminCourseForm from 'components/admin/AdminCourseForm.vue';
import AdminActionButton from 'components/admin/AdminActionButton.vue';

const router = useRouter();
const route = useRoute();
const $q = useQuasar();
const {
  fetchCourseDetail,
  fetchFormOptions,
  updateCourse,
  publishCourse,
  unpublishCourse,
  retryMoodleSync,
} = useAdminCourses();

const course = ref<AdminCourseDetail | null>(null);
const loading = ref(true);
const isPublishing = ref(false);
const isRetrying = ref(false);
const courseId = Number(route.params.id);

function extractErr(e: unknown): string {
  if (e && typeof e === 'object' && 'response' in e) {
    const resp = (e as { response?: { data?: { message?: unknown; missing?: string[] } } })
      .response;
    const data = resp?.data;
    if (data?.missing?.length) return `ข้อมูลยังไม่ครบ: ${data.missing.join(', ')}`;
    if (typeof data?.message === 'string') return data.message;
  }
  return e instanceof Error ? e.message : 'เกิดข้อผิดพลาด';
}

async function reload(): Promise<void> {
  const fresh = await fetchCourseDetail(courseId);
  course.value = fresh;
}

async function onPublish(): Promise<void> {
  isPublishing.value = true;
  try {
    const { warnings } = await publishCourse(courseId);
    $q.notify({
      type: warnings.length ? 'warning' : 'positive',
      message: warnings.length
        ? `เผยแพร่สำเร็จ (คำเตือน: ${warnings.join(', ')})`
        : 'เผยแพร่รายวิชาสำเร็จ',
      position: 'top',
      timeout: 4000,
    });
    await reload();
  } catch (e) {
    $q.notify({ type: 'negative', message: extractErr(e), position: 'top', timeout: 5000 });
  } finally {
    isPublishing.value = false;
  }
}

async function onUnpublish(): Promise<void> {
  isPublishing.value = true;
  try {
    await unpublishCourse(courseId);
    $q.notify({
      type: 'positive',
      message: 'ยกเลิกการเผยแพร่แล้ว',
      position: 'top',
      timeout: 3000,
    });
    await reload();
  } catch (e) {
    $q.notify({ type: 'negative', message: extractErr(e), position: 'top', timeout: 5000 });
  } finally {
    isPublishing.value = false;
  }
}

async function onRetrySync(): Promise<void> {
  isRetrying.value = true;
  try {
    await retryMoodleSync(courseId);
    $q.notify({
      type: 'positive',
      message: 'sync Moodle ใหม่แล้ว',
      position: 'top',
      timeout: 3000,
    });
    await reload();
  } catch (e) {
    $q.notify({ type: 'negative', message: extractErr(e), position: 'top', timeout: 5000 });
  } finally {
    isRetrying.value = false;
  }
}

onMounted(async () => {
  [course.value] = await Promise.all([fetchCourseDetail(courseId), fetchFormOptions()]);
  loading.value = false;
});

async function submitOverride(payload: CreateCoursePayload): Promise<{ courseId: number }> {
  const form = new FormData();
  form.append('nameTh', payload.nameTh);
  form.append('nameEn', payload.nameEn);
  if (payload.summary) form.append('summary', payload.summary);
  if (payload.description) form.append('description', payload.description);
  form.append('facultyId', String(payload.facultyId));
  form.append('typeCourseId', String(payload.typeCourseId));
  if (payload.creditBank) form.append('creditBank', payload.creditBank);
  if (payload.theoryHours != null) form.append('theoryHours', String(payload.theoryHours));
  if (payload.practiceHours != null) form.append('practiceHours', String(payload.practiceHours));
  form.append('studyTypeId', String(payload.studyTypeId));
  if (payload.skillIds?.length) form.append('skillIds', payload.skillIds.join(','));
  form.append('startDate', payload.startDate);
  form.append('endDate', payload.endDate);
  form.append('categoryId', String(payload.categoryId));
  if (payload.subcategoryId != null) form.append('subcategoryId', String(payload.subcategoryId));
  if (payload.targets?.length) form.append('targets', JSON.stringify(payload.targets));
  if (payload.classTypeId != null) form.append('classTypeId', String(payload.classTypeId));
  if (payload.classFee != null) form.append('classFee', String(payload.classFee));
  if (payload.classFeeRemark) form.append('classFeeRemark', payload.classFeeRemark);
  if (payload.costplanId != null) form.append('costplanId', String(payload.costplanId));
  if (payload.lo) form.append('lo', payload.lo);
  if (payload.keyword) form.append('keyword', payload.keyword);
  if (payload.privilege) form.append('privilege', payload.privilege);
  if (payload.remarkChapter) form.append('remarkChapter', payload.remarkChapter);
  if (payload.property) form.append('property', payload.property);
  if (payload.evaluation) form.append('evaluation', payload.evaluation);
  if (payload.competency) form.append('competency', payload.competency);
  if (payload.precondition) form.append('precondition', payload.precondition);
  if (payload.certificate) form.append('certificate', payload.certificate);
  if (payload.certificateName) form.append('certificateName', payload.certificateName);
  if (payload.registrationStart) form.append('registrationStart', payload.registrationStart);
  if (payload.registrationEnd) form.append('registrationEnd', payload.registrationEnd);
  if (payload.maxSeats != null) form.append('maxSeats', String(payload.maxSeats));
  form.append('contactName', payload.contactName);
  form.append('contactTel', payload.contactTel);
  form.append('contactEmail', payload.contactEmail);
  if (payload.contactUrl) form.append('contactUrl', payload.contactUrl);
  if (payload.vdo) form.append('vdo', payload.vdo);
  if (payload.image) form.append('image', payload.image);
  if (payload.removeImage) form.append('removeImage', 'true');
  for (const f of payload.files ?? []) form.append('files', f);
  if (payload.removeFileIds?.length) form.append('removeFileIds', payload.removeFileIds.join(','));
  if (payload.instructors?.length)
    form.append('instructorsJson', JSON.stringify(payload.instructors));
  if (payload.chapters?.length) form.append('chaptersJson', JSON.stringify(payload.chapters));
  if (payload.stutypeFees?.length)
    form.append('stutypeFeesJson', JSON.stringify(payload.stutypeFees));
  form.append('createUser', 'ADMIN');

  return updateCourse(courseId, form);
}

function onSaved() {
  $q.notify({ type: 'positive', message: 'บันทึกการแก้ไขสำเร็จ', position: 'top', timeout: 3000 });
  void router.push('/admin/courses');
}
</script>

<style scoped lang="scss">
.admin-course-edit-page__back {
  margin-bottom: 16px;
}
.admin-course-edit-page__loading {
  display: flex;
  justify-content: center;
  padding: 60px;
}
</style>
