<template>
  <div class="my-certificates-panel">
    <!-- Header -->
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bolder text-primary">
          {{ $t('profile.certificates.title') }}
        </div>
        <div class="text-caption text-grey-6 q-mt-xs">
          {{ $t('profile.certificates.totalCount', { count: totalCount }) }}
        </div>
      </div>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="row justify-center q-py-xl">
      <q-spinner color="primary" size="40px" />
    </div>

    <template v-else>
      <!-- Still-enrolled completed courses (uses full CourseCompletionDocumentActions) -->
      <div v-if="completedEntries.length > 0" class="certificates-grid q-mb-xl">
        <q-card
          v-for="entry in completedEntries"
          :key="entry.registration.id"
          flat
          bordered
          class="cert-card"
        >
          <div class="cert-card__cover-wrap">
            <img
              v-if="entry.course.imageUrl"
              :src="entry.course.imageUrl"
              :alt="entry.course.title"
              class="cert-card__cover"
            />
            <div v-else class="cert-card__cover-placeholder">
              <q-icon name="workspace_premium" size="48px" color="primary" />
            </div>
            <div class="cert-card__badge">
              <q-icon name="verified" size="14px" />
              {{ $t('profile.certificates.completed') }}
            </div>
          </div>

          <q-card-section class="cert-card__body">
            <div class="text-caption text-grey-6 q-mb-xs">{{ entry.course.code }}</div>
            <div class="cert-card__title">{{ getTranslatedTitle(entry.course) }}</div>
          </q-card-section>

          <q-card-actions class="cert-card__actions">
            <CourseCompletionDocumentActions :entry="entry" layout="stacked" />
          </q-card-actions>
        </q-card>
      </div>

      <!-- DB-stored certs for auto-unenrolled courses -->
      <div v-if="apiOnlyCerts.length > 0" class="certificates-grid">
        <q-card v-for="cert in apiOnlyCerts" :key="cert.certId" flat bordered class="cert-card">
          <div class="cert-card__cover-wrap">
            <div class="cert-card__cover-placeholder">
              <q-icon name="workspace_premium" size="48px" color="primary" />
            </div>
            <div class="cert-card__badge">
              <q-icon name="verified" size="14px" />
              {{ $t('profile.certificates.completed') }}
            </div>
          </div>

          <q-card-section class="cert-card__body">
            <div class="text-caption text-grey-6 q-mb-xs">{{ cert.courseCode }}</div>
            <div class="cert-card__title">{{ cert.courseName }}</div>
            <div v-if="cert.issueDate" class="cert-card__meta">
              <q-icon name="workspace_premium" size="14px" color="primary" />
              <span
                >{{ $t('profile.certificates.issuedAt') }} {{ formatDate(cert.issueDate) }}</span
              >
            </div>
          </q-card-section>

          <q-card-actions class="cert-card__actions">
            <q-btn
              v-if="cert.certUrl"
              unelevated
              color="primary"
              icon="download"
              :label="$t('profile.certificates.downloadPdf')"
              no-caps
              class="cert-action-btn cert-action-btn--primary"
              :href="cert.certUrl"
              target="_blank"
              rel="noopener noreferrer"
            />
            <q-btn
              outline
              color="grey-6"
              icon="verified"
              :label="$t('profile.certificates.verify')"
              no-caps
              class="cert-action-btn"
              :href="`/certificates/verify/${cert.certCode}`"
              target="_blank"
              rel="noopener noreferrer"
            />
          </q-card-actions>
        </q-card>
      </div>

      <!-- Empty state -->
      <q-card v-if="totalCount === 0" flat class="text-center empty-state-card q-pa-xl">
        <div class="empty-icon-wrap q-mx-auto q-mb-lg">
          <q-icon name="workspace_premium" size="48px" color="primary" />
        </div>
        <div class="text-h6 text-weight-bolder text-dark">
          {{ $t('profile.certificates.empty') }}
        </div>
        <div class="text-body2 text-grey-6 q-mt-sm" style="max-width: 340px; margin: 0 auto">
          {{ $t('profile.certificates.emptySub') }}
        </div>
        <q-btn
          unelevated
          rounded
          color="primary"
          :label="$t('profile.courses.explore')"
          icon="explore"
          no-caps
          class="q-mt-xl"
          padding="sm xl"
          @click="router.push('/short-courses')"
        />
      </q-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import CourseCompletionDocumentActions from 'components/course/CourseCompletionDocumentActions.vue';
import type { RegisteredCourseEntry } from 'src/composables/use-my-registered-courses';

interface ApiCertItem {
  certId: number;
  certCode: string;
  certUrl: string | null;
  issueDate: string | null;
  courseName: string | null;
  courseCode: string | null;
}

const props = defineProps<{
  registeredCourseEntries: RegisteredCourseEntry[];
}>();

const { locale } = useI18n();
const router = useRouter();

const apiCerts = ref<ApiCertItem[]>([]);
const loading = ref(false);

// Still-enrolled courses that are 100% complete
const completedEntries = computed<RegisteredCourseEntry[]>(() =>
  props.registeredCourseEntries.filter((e) => e.progress.isCompleted),
);

// Codes of ALL registered courses (completed or not). A cert for a registered
// course belongs only in the top "completed" section above. If the course is
// registered but not yet completed, its certificate was auto-generated early —
// we must NOT surface it as a stray card (no card for unfinished courses).
const registeredCourseCodes = computed<Set<string>>(
  () => new Set(props.registeredCourseEntries.map((e) => e.course.code)),
);

// API certs only for courses the user is no longer registered in (legit old certs).
const apiOnlyCerts = computed<ApiCertItem[]>(() =>
  apiCerts.value.filter((c) => !registeredCourseCodes.value.has(c.courseCode ?? '')),
);

const totalCount = computed(() => completedEntries.value.length + apiOnlyCerts.value.length);

async function fetchApiCerts(): Promise<void> {
  loading.value = true;
  try {
    const { data } = await api.get<{ userId: number | null; items: ApiCertItem[] }>(
      '/api/certificates/my',
    );
    apiCerts.value = data.items;
  } catch {
    apiCerts.value = [];
  } finally {
    loading.value = false;
  }
}

function getTranslatedTitle(course: { title: string; titleEn?: string }): string {
  if (locale.value === 'th') return course.title;
  return course.titleEn || course.title;
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString(locale.value === 'th' ? 'th-TH' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

onMounted(fetchApiCerts);
</script>

<style lang="scss" scoped>
.my-certificates-panel {
  max-width: 1004px;
}

.certificates-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 20px;
}

.cert-card {
  border-radius: 16px !important;
  border: 1px solid rgba(17, 24, 39, 0.1) !important;
  overflow: hidden;
  transition:
    box-shadow 0.2s ease,
    transform 0.2s ease;

  &:hover {
    box-shadow: 0 12px 32px rgba(17, 24, 39, 0.1) !important;
    transform: translateY(-2px);
  }

  &__cover-wrap {
    position: relative;
    height: 140px;
    overflow: hidden;
  }

  &__cover {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__cover-placeholder {
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, rgba($primary, 0.06), rgba(245, 166, 35, 0.12));
  }

  &__badge {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px;
    border-radius: 999px;
    background: rgba(73, 179, 125, 0.92);
    color: white;
    font-size: 0.72rem;
    font-weight: 700;
    letter-spacing: 0.03em;
  }

  &__body {
    padding: 14px 16px 8px;
  }

  &__title {
    font-size: 0.95rem;
    font-weight: 700;
    color: #111827;
    line-height: 1.35;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__meta {
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 6px;
    color: #6b7280;
    font-size: 0.78rem;
  }

  &__actions {
    padding: 8px 16px 16px;
  }
}

.cert-action-btn {
  width: 100%;
  min-height: 40px;
  border-radius: 10px !important;
  font-weight: 700;
  font-size: 0.82rem;
  margin-bottom: 6px;

  &--primary {
    box-shadow: 0 7px 18px rgba($primary, 0.24) !important;
  }
}

.empty-state-card {
  border-radius: 20px !important;
  background:
    radial-gradient(circle at 50% 0%, rgba($primary, 0.04), transparent 60%), white !important;
  border: 2px dashed rgba($primary, 0.15) !important;
  padding: 48px 24px !important;
}

.empty-icon-wrap {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: rgba($primary, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 767px) {
  .certificates-grid {
    grid-template-columns: 1fr;
  }
}
</style>
