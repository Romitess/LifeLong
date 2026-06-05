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
        <div class="text-center q-pt-lg q-pb-xs text-weight-bold text-subtitle1">
          {{ $t('finance.applicantSearch.resultsTitle') }}
        </div>
        <div class="text-center q-pb-md text-caption text-grey-7">
          {{ userFacName }}
        </div>

        <div class="row justify-end items-center q-px-md q-pb-md">
          <q-input
            v-model="searchForm.keyword"
            dense
            outlined
            :placeholder="$t('finance.applicantSearch.fields.learnerNamePlaceholder')"
            class="receipt-search"
            debounce="500"
            @update:model-value="handleSearch"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append>
              <q-separator vertical class="q-mx-xs" inset />
              <q-btn flat round dense icon="filter_list" color="primary" class="q-ml-xs">
                <q-tooltip>{{ $t('additionalFilters') }}</q-tooltip>
                <q-menu padding class="filter-menu-premium shadow-15">
                  <div class="q-pa-lg" style="min-width: 320px">
                    <div class="text-h6 text-weight-bold q-mb-lg row items-center">
                      <q-icon name="filter_alt" color="primary" class="q-mr-sm" />
                      {{ $t('additionalFilters') }}
                    </div>

                    <div class="filter-field-group q-mb-lg">
                      <label class="filter-label">{{
                        $t('finance.applicantSearch.columns.status')
                      }}</label>
                      <div class="row q-gutter-xs">
                        <q-btn
                          unelevated
                          dense
                          :color="searchForm.status === 'Paid' ? 'positive' : 'grey-2'"
                          :text-color="searchForm.status === 'Paid' ? 'white' : 'dark'"
                          :label="$t('finance.applicantSearch.status.paid')"
                          class="q-px-md text-caption"
                          no-caps
                          @click="
                            searchForm.status = searchForm.status === 'Paid' ? null : 'Paid';
                            void handleSearch();
                          "
                        />
                        <q-btn
                          unelevated
                          dense
                          :color="searchForm.status === 'Pending' ? 'warning' : 'grey-2'"
                          :text-color="searchForm.status === 'Pending' ? 'white' : 'dark'"
                          :label="$t('finance.applicantSearch.status.pending')"
                          class="q-px-md text-caption"
                          no-caps
                          @click="
                            searchForm.status = searchForm.status === 'Pending' ? null : 'Pending';
                            void handleSearch();
                          "
                        />
                      </div>
                    </div>

                    <div class="row q-gutter-sm">
                      <q-btn
                        unelevated
                        :label="$t('clear')"
                        color="grey-2"
                        text-color="dark"
                        class="col rounded-borders"
                        no-caps
                        @click="resetSearch"
                      />
                      <q-btn
                        unelevated
                        :label="$t('ok')"
                        color="primary"
                        class="col rounded-borders"
                        no-caps
                        v-close-popup
                      />
                    </div>
                  </div>
                </q-menu>
              </q-btn>
            </template>
          </q-input>
        </div>

        <q-table
          v-model:pagination="pagination"
          :rows="results"
          :columns="columns"
          row-key="id"
          flat
          dense
          class="receipt-table applicant-results-table"
          :loading="loading"
          :rows-per-page-options="[10, 25, 50, 100]"
          :header-style="{ fontSize: '0.75rem', whiteSpace: 'pre-wrap', lineHeight: '1.3' }"
        >
          <template #body-cell-index="props">
            <q-td :props="props" class="text-center">
              {{ props.rowIndex + 1 }}
            </q-td>
          </template>

          <template #body-cell-amount="props">
            <q-td :props="props" class="text-center text-weight-medium">
              &#3647;{{ props.value.toLocaleString() }}
            </q-td>
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
                class="status-badge"
                :class="props.value === 'Paid' ? 'status-badge--paid' : 'status-badge--pending'"
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
                  class="bg-white receipt-rows-select"
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
import AppPageHero from 'components/admin/AppPageHero.vue';
import AppSurfaceCard from 'components/admin/AppSurfaceCard.vue';
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
  status: null as 'Paid' | 'Pending' | null,
});

function resetSearch() {
  searchForm.value.status = null;
  pagination.value.page = 1;
  void handleSearch();
}

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
    };
    const keyword = searchForm.value.keyword.trim();

    if (keyword) {
      params.keyword = keyword;
    }

    if (searchForm.value.status) {
      params.status = searchForm.value.status;
    }

    const { data } = await api.get<ApplicantSearchApiResponse>('/api/lltenroll', { params });

    if (searchId === latestSearchId) {
      results.value = data.items.map(normalizeResult);
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

.receipt-search {
  width: 250px;
}

.receipt-table {
  :deep(.q-table__card) {
    box-shadow: none;
  }

  :deep(thead tr) {
    background: #e2e8f0;
  }

  :deep(th) {
    font-weight: 600;
    color: #334155;
    font-size: 0.75rem;
    white-space: pre-wrap;
    text-align: center !important;
    vertical-align: middle;
    line-height: 1.3;
    padding: 8px 6px;
  }

  :deep(tbody td) {
    vertical-align: middle;
    padding-top: 12px;
    padding-bottom: 12px;
    white-space: pre-wrap;
  }
}

.status-badge {
  padding: 6px 12px;
  font-weight: 700;
  font-size: 0.75rem;

  &--paid {
    background: rgba(34, 197, 94, 0.1) !important;
    color: #16a34a !important;
  }

  &--pending {
    background: rgba(239, 68, 68, 0.1) !important;
    color: #dc2626 !important;
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
