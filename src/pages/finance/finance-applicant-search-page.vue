<template>
  <q-page class="admin-page finance-applicant-search-page">
    <AppPageHero
      eyebrow="Financial Operations"
      eyebrow-icon="person_search"
      :title="$t('finance.applicantSearch.title')"
      :description="$t('finance.applicantSearch.description')"
    >
      <template #aside>
        <div class="faculty-scope-card">
          <div class="faculty-scope-card__label">
            {{ $t('finance.educationReport.scopeLabel') }}
          </div>
          <div class="faculty-scope-card__faculty">
            {{ userFacName || $t('finance.educationReport.unknownFaculty') }}
          </div>
        </div>
      </template>
    </AppPageHero>

    <section class="admin-shell admin-content">
      <AppSurfaceCard class="q-mt-md" card-class="q-pa-none">
        <div class="applicant-list-head row items-center justify-between q-mb-md q-px-md">
          <div class="applicant-list-head__title text-weight-bold text-body1">
            {{ $t('finance.applicantSearch.resultsTitle') }}
          </div>
          <div class="applicant-table-toolbar">
            <AppSearchInput
              v-model="searchForm.keyword"
              :placeholder="$t('finance.applicantSearch.fields.learnerNamePlaceholder')"
              class="applicant-search"
              @update:model-value="handleSearch"
            />
          </div>
        </div>

        <BaseTable
          :columns="columns"
          :rows="paginatedRows"
          :page="pagination.page"
          :total-pages="Math.max(1, Math.ceil(results.length / pagination.rowsPerPage))"
          :rows-per-page="pagination.rowsPerPage"
          :loading="loading"
          show-index
          show-rows-per-page
          height-mode="auto"
          @page-change="pagination.page = $event"
          @rows-per-page-change="
            pagination.rowsPerPage = $event;
            pagination.page = 1;
          "
        >
          <template #cell-amount="{ row }"> &#3647;{{ row.amount.toLocaleString() }} </template>

          <template #cell-courseInfo="{ row }">
            <div style="white-space: pre-wrap; word-break: break-word">{{ row.courseInfo }}</div>
          </template>

          <template #cell-status="{ row }">
            <q-badge
              rounded
              class="applicant-status-badge"
              :color="row.status === 'Paid' ? 'positive' : 'grey-6'"
              :label="
                row.status === 'Paid'
                  ? $t('finance.applicantSearch.status.paid')
                  : $t('finance.applicantSearch.status.pending')
              "
            />
          </template>

          <template #cell-contact="{ row }">
            <div
              v-if="row.contact"
              class="row items-center justify-center text-primary cursor-pointer"
            >
              <q-icon name="phone" size="14px" class="q-mr-xs" />
              {{ row.contact }}
            </div>
            <span v-else class="text-grey-5">-</span>
          </template>
        </BaseTable>
      </AppSurfaceCard>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import AppPageHero from 'components/common/AppPageHero.vue';
import AppSurfaceCard from 'components/common/AppSurfaceCard.vue';
import AppSearchInput from 'components/common/AppSearchInput.vue';
import { api } from 'src/boot/axios';
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import BaseTable from 'components/base/BaseTable.vue';
import type { BaseTableColumn } from 'components/base/BaseTable.vue';
import { useAuthStore } from 'stores/auth-store';

const { t } = useI18n();
const authStore = useAuthStore();
const userFacName = computed(() => authStore.user?.facName || authStore.user?.faculty || '');

interface ApplicantSearchResult {
  id: number;
  learnerRef: string;
  appRef: string;
  learnerName: string;
  amount: number;
  courseInfo: string;
  status: 'Paid' | 'Pending';
  contact: string;
}

interface ApplicantSearchApiItem {
  id: number;
  enrollId: number;
  userId: number | null;
  courseId: number | null;
  learnerRef: string;
  appRef: string;
  learnerName: string;
  amount: number;
  courseInfo: string;
  status: 'Paid' | 'Pending';
  contact: string | null;
  enrollDate: string | null;
  payDate: string | null;
}

interface ApplicantSearchApiResponse {
  generatedAt: string;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
  items: ApplicantSearchApiItem[];
}

interface TablePagination {
  sortBy: string;
  descending: boolean;
  page: number;
  rowsPerPage: number;
}

const loading = ref(false);

const pagination = ref<TablePagination>({
  sortBy: 'index',
  descending: false,
  page: 1,
  rowsPerPage: 10,
});

const searchForm = ref({
  keyword: '',
});

const paginatedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
  const end = start + pagination.value.rowsPerPage;
  return results.value.slice(start, end);
});

const columns = computed<BaseTableColumn[]>(() => [
  {
    key: 'learnerRef',
    label: t('finance.applicantSearch.columns.learnerRef'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'appRef',
    label: t('finance.applicantSearch.columns.appRef'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'learnerName',
    label: t('finance.applicantSearch.columns.learnerName'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'amount',
    label: t('finance.applicantSearch.columns.amount'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'courseInfo',
    label: t('finance.applicantSearch.columns.courseInfo'),
    align: 'center',
    sortable: true,
    width: '320px',
  },
  {
    key: 'status',
    label: t('finance.applicantSearch.columns.status'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'contact',
    label: t('finance.applicantSearch.columns.contact'),
    align: 'center',
  },
]);

const results = ref<ApplicantSearchResult[]>([]);
let latestSearchId = 0;

function normalizeResult(item: ApplicantSearchApiItem): ApplicantSearchResult {
  return {
    id: item.id,
    learnerRef: item.learnerRef,
    appRef: item.appRef,
    learnerName: item.learnerName,
    amount: Number(item.amount) || 0,
    courseInfo: item.courseInfo,
    status: item.status,
    contact: item.contact ?? '',
  };
}

async function handleSearch() {
  const searchId = ++latestSearchId;
  loading.value = true;
  pagination.value.page = 1;

  try {
    const params: Record<string, string | number> = {
      page: 1,
      pageSize: 500,
      status: 'Paid',
    };
    const keyword = searchForm.value.keyword.trim();

    if (keyword) {
      params.keyword = keyword;
    }

    const { data } = await api.get<ApplicantSearchApiResponse>('/api/lltenroll', { params });

    if (searchId === latestSearchId) {
      results.value = data.items.map(normalizeResult).filter((item) => item.amount > 0);
    }
  } catch (error) {
    console.error('Failed to load applicant enrollment data', error);
    if (searchId === latestSearchId) {
      results.value = [];
    }
  } finally {
    if (searchId === latestSearchId) {
      loading.value = false;
    }
  }
}

onMounted(() => {
  void handleSearch();
});
</script>

<style scoped lang="scss">
.applicant-list-head {
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch !important;
  }
}

.applicant-list-head__title {
  color: var(--admin-navy, #10233f);
}

.applicant-table-toolbar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  min-width: 0;
  flex: 1 1 320px;

  @media (max-width: 600px) {
    flex: 1 1 100%;
    justify-content: stretch;

    .applicant-search {
      max-width: none;
      flex: 1 1 100%;
    }
  }
}

.applicant-search {
  flex: 1 1 280px;
  min-width: 200px;
  max-width: 520px;

  :deep(.q-field__control),
  :deep(.q-field__marginal) {
    height: 52px;
  }

  :deep(.q-field__native) {
    font-size: 1rem;
  }
}

:deep(.q-field__label) {
  font-weight: 400 !important;
}

.faculty-scope-card {
  min-width: 260px;
  padding: 16px 18px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.12);
  border: 1px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  display: grid;
  gap: 6px;
}

.faculty-scope-card__label {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.faculty-scope-card__faculty {
  color: #fff;
  font-size: 1.05rem;
  font-weight: 900;
}
</style>
