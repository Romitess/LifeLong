<template>
  <q-page
    class="admin-page finance-applicant-search-page finance-applicant-search-page--static-cards"
  >
    <AppPageHero
      eyebrow="Financial Operations"
      eyebrow-icon="person_search"
      :title="$t('finance.applicantSearch.title')"
      :description="$t('finance.applicantSearch.description')"
    >
      <template #aside>
        <div class="faculty-scope-card">
          <div class="faculty-scope-card__label">ข้อมูลที่แสดง</div>
          <div class="faculty-scope-card__faculty">{{ userFacName || 'ไม่ระบุคณะ' }}</div>
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
            <q-input
              v-model="searchForm.keyword"
              outlined
              clearable
              debounce="200"
              :placeholder="$t('finance.applicantSearch.fields.learnerNamePlaceholder')"
              bg-color="white"
              class="applicant-search-input-main"
              @update:model-value="handleSearch"
            >
              <template #prepend>
                <q-icon name="search" color="grey-5" />
              </template>
            </q-input>
          </div>
        </div>

        <q-table
          v-model:pagination="pagination"
          :rows="results"
          :columns="columns"
          row-key="id"
          flat
          class="applicant-table"
          :loading="loading"
          :rows-per-page-options="[10, 25, 50, 100]"
        >
          <template #body-cell-index="props">
            <q-td :props="props">
              {{ props.rowIndex + 1 + (pagination.page - 1) * pagination.rowsPerPage }}
            </q-td>
          </template>

          <template #body-cell-amount="props">
            <q-td :props="props"> &#3647;{{ props.value.toLocaleString() }} </q-td>
          </template>

          <template #body-cell-courseInfo="props">
            <q-td :props="props">
              <div style="white-space: pre-wrap; word-break: break-word">{{ props.value }}</div>
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props" class="text-center">
              <q-badge
                rounded
                class="applicant-status-badge"
                :color="props.value === 'Paid' ? 'positive' : 'grey-6'"
                :label="
                  props.value === 'Paid'
                    ? $t('finance.applicantSearch.status.paid')
                    : $t('finance.applicantSearch.status.pending')
                "
              />
            </q-td>
          </template>

          <template #body-cell-contact="props">
            <q-td :props="props" class="text-center">
              <div
                v-if="props.value"
                class="row items-center justify-center text-primary cursor-pointer"
              >
                <q-icon name="phone" size="14px" class="q-mr-xs" />
                {{ props.value }}
              </div>
              <span v-else class="text-grey-5">-</span>
            </q-td>
          </template>

          <template #no-data>
            <div class="full-width column flex-center q-pa-xl text-grey-7">
              <q-icon name="search_off" size="48px" class="q-mb-md opacity-20" />
              <span>{{ $t('finance.applicantSearch.noData') }}</span>
            </div>
          </template>

          <template #bottom="scope">
            <div class="row full-width justify-between items-center q-py-sm">
              <div class="row items-center q-gutter-sm">
                <span class="text-subtitle2 text-grey-8">{{
                  $t('finance.receiptSummary.showEntries')
                }}</span>
                <q-select
                  v-model="pagination.rowsPerPage"
                  :options="[10, 25, 50, 100]"
                  outlined
                  dense
                  options-dense
                  style="width: 80px"
                  class="bg-white applicant-rows-select"
                />
                <span class="text-subtitle2 text-grey-8">{{
                  $t('finance.receiptSummary.entries')
                }}</span>
              </div>
              <div class="row items-center q-gutter-sm">
                <span class="text-caption text-grey-8 q-mr-sm">
                  {{ pageStart(scope.pagination) }}-{{ pageEnd(scope.pagination) }} of
                  {{ results.length }}
                </span>
                <q-btn
                  icon="first_page"
                  color="grey-8"
                  round
                  dense
                  flat
                  :disable="scope.isFirstPage"
                  @click="scope.firstPage"
                />
                <q-btn
                  icon="chevron_left"
                  color="grey-8"
                  round
                  dense
                  flat
                  :disable="scope.isFirstPage"
                  @click="scope.prevPage"
                />
                <q-btn
                  icon="chevron_right"
                  color="grey-8"
                  round
                  dense
                  flat
                  :disable="scope.isLastPage"
                  @click="scope.nextPage"
                />
                <q-btn
                  icon="last_page"
                  color="grey-8"
                  round
                  dense
                  flat
                  :disable="scope.isLastPage"
                  @click="scope.lastPage"
                />
              </div>
            </div>
          </template>
        </q-table>
      </AppSurfaceCard>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import AppPageHero from 'components/common/AppPageHero.vue';
import AppSurfaceCard from 'components/common/AppSurfaceCard.vue';
import { api } from 'src/boot/axios';
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { QTableProps } from 'quasar';
import { useAuthStore } from 'stores/auth-store';

const { t } = useI18n();
const authStore = useAuthStore();
const userFacName = computed(() => authStore.user?.facName || authStore.user?.faculty || 'ไม่ระบุ');

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

const columns = computed<QTableProps['columns']>(() => [
  {
    name: 'index',
    label: t('finance.applicantSearch.columns.no'),
    align: 'center',
    field: 'index',
    sortable: true,
    style: 'width: 50px',
  },
  {
    name: 'learnerRef',
    label: t('finance.applicantSearch.columns.learnerRef'),
    align: 'center',
    field: 'learnerRef',
    sortable: true,
  },
  {
    name: 'appRef',
    label: t('finance.applicantSearch.columns.appRef'),
    align: 'center',
    field: 'appRef',
    sortable: true,
  },
  {
    name: 'learnerName',
    label: t('finance.applicantSearch.columns.learnerName'),
    align: 'center',
    field: 'learnerName',
    sortable: true,
    style: 'white-space: nowrap;',
  },
  {
    name: 'amount',
    label: t('finance.applicantSearch.columns.amount'),
    align: 'center',
    field: 'amount',
    sortable: true,
  },
  {
    name: 'courseInfo',
    label: t('finance.applicantSearch.columns.courseInfo'),
    align: 'center',
    field: 'courseInfo',
    sortable: true,
    style: 'width: 320px',
    headerStyle: 'white-space: pre-wrap; width: 320px',
  },
  {
    name: 'status',
    label: t('finance.applicantSearch.columns.status'),
    align: 'center',
    field: 'status',
    sortable: true,
  },
  {
    name: 'contact',
    label: t('finance.applicantSearch.columns.contact'),
    align: 'center',
    field: 'contact',
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

function pageStart(tablePagination: { page: number; rowsPerPage: number }): number {
  if (results.value.length === 0) {
    return 0;
  }

  return (tablePagination.page - 1) * tablePagination.rowsPerPage + 1;
}

function pageEnd(tablePagination: { page: number; rowsPerPage: number }): number {
  return Math.min(tablePagination.page * tablePagination.rowsPerPage, results.value.length);
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
.finance-applicant-search-page--static-cards
  :deep(.admin-surface-card:not(.admin-surface-card--glass)) {
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease !important;
}

.finance-applicant-search-page--static-cards
  :deep(.admin-surface-card:not(.admin-surface-card--glass):hover) {
  transform: none !important;
  border-color: var(--admin-line) !important;
  box-shadow: var(--admin-shadow-sm) !important;
}

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

    .applicant-search-input-main {
      max-width: none;
      flex: 1 1 100%;
    }
  }
}

.applicant-search-input-main {
  flex: 1 1 280px;
  min-width: 200px;
  max-width: 520px;

  :deep(.q-field__control) {
    height: 52px;
    padding: 0 16px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
    border: 2px solid #edf2f7;
    border-radius: 26px !important;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease;
    background: #fff !important;

    &:hover {
      border-color: rgba(245, 166, 35, 0.35);
    }

    &.q-field__control--focused {
      border-color: #f5a623;
      box-shadow: 0 12px 28px rgba(245, 166, 35, 0.12);
    }

    &::before,
    &::after {
      display: none;
    }
  }

  :deep(.q-field__native) {
    font-size: 1rem;
    font-weight: 500;
    color: #1e293b;
  }

  :deep(.q-field__native::placeholder) {
    color: #9e9e9e;
    opacity: 1;
  }

  :deep(.q-field__marginal) {
    height: 52px;
  }
}

.applicant-table {
  :deep(.q-table__top) {
    padding: 0;
  }

  :deep(.q-table thead tr th) {
    background: linear-gradient(180deg, #f1f5f9 0%, #e8eef5 100%);
    font-weight: 800;
    font-size: 0.8125rem;
    color: #475569;
    letter-spacing: 0.02em;
  }

  :deep(.q-table tbody tr:nth-child(even)) {
    background: rgba(248, 246, 241, 0.55);
  }

  :deep(.q-table tbody td) {
    font-size: 0.9rem;
  }

  :deep(.q-table__bottom) {
    border-top: 1px solid var(--admin-line, #e2e8f0);
  }
}

.applicant-status-badge {
  font-weight: 700;
  padding: 6px 12px;
  text-transform: none;
}

.applicant-rows-select {
  :deep(.q-field__control) {
    min-height: 40px;
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
