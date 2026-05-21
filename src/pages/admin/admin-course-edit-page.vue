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
        @cancel="void router.push('/admin/courses')"
        @saved="onSaved"
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
const { fetchCourseDetail, fetchFormOptions, updateCourse } = useAdminCourses();

const course = ref<AdminCourseDetail | null>(null);
const loading = ref(true);
const courseId = Number(route.params.id);

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
  if (payload.image) form.append('image', payload.image);
  if (payload.removeImage) form.append('removeImage', 'true');
  if (payload.file) form.append('file', payload.file);
  if (payload.removeFile) form.append('removeFile', 'true');
  if (payload.instructors?.length)
    form.append('instructorsJson', JSON.stringify(payload.instructors));
  if (payload.chapters?.length) form.append('chaptersJson', JSON.stringify(payload.chapters));
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
