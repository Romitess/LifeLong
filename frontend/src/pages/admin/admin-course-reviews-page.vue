<template>
  <q-page class="admin-page admin-course-reviews-page">
    <AppPageHero
      eyebrow="Review Moderation"
      eyebrow-icon="rate_review"
      :title="$t('adminReviews.title')"
      :description="$t('adminReviews.description')"
    />

    <section class="admin-shell admin-content">
      <AppSurfaceCard
        :eyebrow="$t('adminReviews.eyebrow')"
        :title="$t('adminReviews.cardTitle')"
        :subtitle="$t('adminReviews.cardSubtitle')"
        body-padding="none"
      >
        <!-- Filters -->
        <template #header-actions>
          <BaseSelect
            v-model="statusFilter"
            :options="statusOptions"
            emit-value
            map-options
            option-label="label"
            option-value="value"
            :label="$t('adminReviews.statusFilter')"
            class="admin-reviews__status-filter"
            @update:model-value="onStatusChange"
          />
        </template>

        <div class="admin-reviews__table-wrapper">
          <q-banner v-if="error" rounded dense class="bg-negative text-white q-ma-md">
            {{ error }}
          </q-banner>

          <BaseTable
            :columns="columns"
            :rows="items"
            :loading="isLoading"
            :page="currentPage"
            :total-pages="totalPages"
            :rows-per-page="limit"
            row-key="id"
            show-index
            :index-offset="(currentPage - 1) * limit"
            min-width="900px"
            :on-page-change="onPageChange"
          >
            <!-- Reviewer cell -->
            <template #cell-reviewer="{ row }">
              {{ (row as ModerationReview).reviewer?.name || '—' }}
            </template>

            <!-- Rating cell -->
            <template #cell-rating="{ row }">
              <BaseRatingStars
                :model-value="(row as ModerationReview).rating"
                readonly
                size="16px"
              />
            </template>

            <!-- Comment cell -->
            <template #cell-comment="{ row }">
              <span class="admin-reviews__comment">
                {{ (row as ModerationReview).comment || '—' }}
              </span>
            </template>

            <!-- Status cell -->
            <template #cell-status="{ row }">
              <BaseStatusBadge
                :label="getStatusLabel((row as ModerationReview).status)"
                :color="getStatusColor((row as ModerationReview).status)"
              />
            </template>

            <!-- Date cell -->
            <template #cell-createDate="{ row }">
              {{ formatDate((row as ModerationReview).createDate) }}
            </template>

            <!-- Actions cell -->
            <template #cell-actions="{ row }">
              <div class="admin-reviews__actions">
                <BaseButton
                  v-if="(row as ModerationReview).status !== 'A'"
                  flat
                  dense
                  no-caps
                  size="sm"
                  color="positive"
                  icon="check_circle"
                  :label="$t('adminReviews.approve')"
                  :loading="isUpdating"
                  @click="onUpdateStatus(row as ModerationReview, 'A')"
                />
                <BaseButton
                  v-if="(row as ModerationReview).status !== 'H'"
                  flat
                  dense
                  no-caps
                  size="sm"
                  color="negative"
                  icon="visibility_off"
                  :label="$t('adminReviews.hide')"
                  :loading="isUpdating"
                  @click="onUpdateStatus(row as ModerationReview, 'H')"
                />
              </div>
            </template>
          </BaseTable>
        </div>
      </AppSurfaceCard>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import AppPageHero from 'components/common/AppPageHero.vue';
import AppSurfaceCard from 'components/common/AppSurfaceCard.vue';
import BaseTable from 'components/base/BaseTable.vue';
import type { BaseTableColumn } from 'components/base/BaseTable.vue';
import BaseSelect from 'components/base/BaseSelect.vue';
import BaseStatusBadge from 'components/base/BaseStatusBadge.vue';
import BaseButton from 'components/base/BaseButton.vue';
import BaseRatingStars from 'components/base/BaseRatingStars.vue';
import { useAdminReviews } from 'src/composables/use-course-reviews';
import type { ModerationReview, ReviewModerationStatus } from 'src/types/course-review';

const $q = useQuasar();
const { t, locale } = useI18n({ useScope: 'global' });

const { items, total, page, limit, isLoading, error, fetchReviews, updateStatus, isUpdating } =
  useAdminReviews();

const statusFilter = ref<ReviewModerationStatus | null>(null);
const currentPage = computed(() => page.value);
const totalPages = computed(() => (total.value > 0 ? Math.ceil(total.value / limit.value) : 1));

const statusOptions = computed(() => [
  { label: t('adminReviews.statusAll'), value: null },
  { label: t('adminReviews.statusApproved'), value: 'A' },
  { label: t('adminReviews.statusPending'), value: 'P' },
  { label: t('adminReviews.statusHidden'), value: 'H' },
]);

const columns = computed<BaseTableColumn[]>(() => [
  { key: 'reviewer', label: t('adminReviews.cols.reviewer'), align: 'left', width: '160px' },
  { key: 'courseId', label: t('adminReviews.cols.courseId'), align: 'center', width: '80px' },
  { key: 'rating', label: t('adminReviews.cols.rating'), align: 'left', width: '120px' },
  { key: 'comment', label: t('adminReviews.cols.comment'), align: 'left' },
  { key: 'status', label: t('adminReviews.cols.status'), align: 'center', width: '100px' },
  { key: 'createDate', label: t('adminReviews.cols.date'), align: 'center', width: '130px' },
  { key: 'actions', label: t('adminReviews.cols.actions'), align: 'center', width: '180px' },
]);

function getStatusLabel(status: ReviewModerationStatus): string {
  const map: Record<ReviewModerationStatus, string> = {
    A: t('adminReviews.statusApproved'),
    P: t('adminReviews.statusPending'),
    H: t('adminReviews.statusHidden'),
  };
  return map[status] ?? status;
}

function getStatusColor(status: ReviewModerationStatus): string {
  const map: Record<ReviewModerationStatus, string> = {
    A: 'positive',
    P: 'warning',
    H: 'grey-5',
  };
  return map[status] ?? 'grey-5';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString(locale.value === 'th' ? 'th-TH' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

async function loadReviews(p = 1): Promise<void> {
  await fetchReviews({
    page: p,
    limit: 10,
    ...(statusFilter.value ? { status: statusFilter.value } : {}),
  });
}

function onStatusChange(): void {
  void loadReviews(1);
}

function onPageChange(p: number): void {
  void loadReviews(p);
}

async function onUpdateStatus(
  review: ModerationReview,
  status: ReviewModerationStatus,
): Promise<void> {
  const ok = await updateStatus(review.id, status);
  $q.notify({
    type: ok ? 'positive' : 'negative',
    message: ok ? t('adminReviews.updateSuccess') : t('adminReviews.updateError'),
    position: 'top',
  });
}

onMounted(() => {
  void loadReviews();
});
</script>

<style lang="scss" scoped>
.admin-course-reviews-page {
  .admin-reviews__status-filter {
    width: 160px;
  }

  .admin-reviews__table-wrapper {
    overflow: hidden;
  }

  .admin-reviews__comment {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    max-width: 300px;
    font-size: 0.88rem;
    color: var(--admin-navy, var(--color-text-2));
    line-height: 1.4;
  }

  .admin-reviews__actions {
    display: flex;
    gap: 4px;
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
