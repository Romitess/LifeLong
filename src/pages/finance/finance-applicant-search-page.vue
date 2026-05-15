<template>
  <q-page
    class="admin-page finance-applicant-search-page finance-applicant-search-page--static-cards"
  >
    <AdminPageHero
      eyebrow="Financial Operations"
      eyebrow-icon="person_search"
      :title="$t('finance.applicantSearch.title')"
      :description="$t('finance.applicantSearch.description')"
    />

    <section class="admin-shell admin-content">
      <!-- Results Panel -->
      <AdminSurfaceCard
        :title="$t('finance.applicantSearch.resultsTitle')"
        :subtitle="
          $t('finance.applicantSearch.resultsSubtitle', {
            faculty: $t('common.faculties.computerCenter'),
            code: '82994',
          })
        "
        icon="list_alt"
        body-padding="none"
      >
        <template #header-actions>
          <q-input
            v-model="searchForm.keyword"
            dense
            outlined
            rounded
            :placeholder="$t('finance.applicantSearch.fields.learnerNamePlaceholder')"
            class="receipt-search"
            debounce="500"
            @update:model-value="handleSearch"
            style="min-width: 300px"
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
                      ตัวกรองเพิ่มเติม
                    </div>

                    <div class="filter-field-group q-mb-lg">
                      <label class="filter-label">สถานะการชำระเงิน</label>
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
                            handleSearch();
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
                            handleSearch();
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
        </template>
        <q-table
          :rows="results"
          :columns="columns"
          row-key="id"
          flat
          class="applicant-results-table"
          :pagination="{ rowsPerPage: 10 }"
        >
          <template #body-cell-index="props">
            <q-td :props="props" class="text-grey-7 font-weight-bold">
              {{ props.rowIndex + 1 }}
            </q-td>
          </template>

          <template #body-cell-status="props">
            <q-td :props="props">
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

          <template #body-cell-amount="props">
            <q-td :props="props" class="text-weight-bolder">
              ฿{{ props.value.toLocaleString() }}
            </q-td>
          </template>

          <template #body-cell-contact="props">
            <q-td :props="props">
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
        </q-table>
      </AdminSurfaceCard>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import type { QTableProps } from 'quasar';

const { t } = useI18n();

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

const loading = ref(false);
const hasSearched = ref(false);

const searchForm = ref({
  keyword: '',
  status: null as 'Paid' | 'Pending' | null,
});

function resetSearch() {
  searchForm.value.status = null;
  handleSearch();
}

const columns = computed<QTableProps['columns']>(() => [
  {
    name: 'index',
    label: t('finance.applicantSearch.columns.no'),
    align: 'center',
    field: 'index',
    style: 'width: 50px',
  },
  {
    name: 'learnerRef',
    label: t('finance.applicantSearch.columns.learnerRef'),
    align: 'left',
    field: 'learnerRef',
  },
  {
    name: 'appRef',
    label: t('finance.applicantSearch.columns.appRef'),
    align: 'left',
    field: 'appRef',
  },
  {
    name: 'learnerName',
    label: t('finance.applicantSearch.columns.learnerName'),
    align: 'left',
    field: 'learnerName',
  },
  {
    name: 'amount',
    label: t('finance.applicantSearch.columns.amount'),
    align: 'right',
    field: 'amount',
  },
  {
    name: 'courseInfo',
    label: t('finance.applicantSearch.columns.courseInfo'),
    align: 'left',
    field: 'courseInfo',
  },
  {
    name: 'status',
    label: t('finance.applicantSearch.columns.status'),
    align: 'center',
    field: 'status',
  },
  {
    name: 'contact',
    label: t('finance.applicantSearch.columns.contact'),
    align: 'center',
    field: 'contact',
  },
]);

const results = ref<ApplicantSearchResult[]>([]);

const mockData = computed<ApplicantSearchResult[]>(() => [
  {
    id: 1,
    learnerRef: '6700017',
    appRef: '6751300100003',
    learnerName: 'สา ทดสอบ',
    amount: 1,
    courseInfo: `C67513001 : ทดสอบ direct link (${t('common.faculties.computerCenter')} 82994)`,
    status: 'Paid',
    contact: '',
  },
  {
    id: 2,
    learnerRef: '6600001',
    appRef: '6751300100004',
    learnerName: 'นัฐพร ยะโสวงษ์',
    amount: 1,
    courseInfo: `C67513001 : ทดสอบ direct link (${t('common.faculties.computerCenter')} 82994)`,
    status: 'Pending',
    contact: '2788',
  },
  {
    id: 3,
    learnerRef: '6600001',
    appRef: '6851300100002',
    learnerName: 'นัฐพร ยะโสวงษ์',
    amount: 1,
    courseInfo: 'C68513001 : ทดสอบเพิ่มวิชา แล้วเพิ่ม skill จาก trigger',
    status: 'Pending',
    contact: '2788',
  },
  {
    id: 4,
    learnerRef: '6600003',
    appRef: '6851300100001',
    learnerName: 'ชื่อตัว ชื่อสกุล',
    amount: 1,
    courseInfo: 'C68513001 : ทดสอบเพิ่มวิชา แล้วเพิ่ม skill จาก trigger',
    status: 'Pending',
    contact: '',
  },
]);

function handleSearch() {
  loading.value = true;
  hasSearched.value = false;

  // Simulate API delay
  setTimeout(() => {
    let filtered = [...mockData.value];

    if (searchForm.value.keyword) {
      const kw = searchForm.value.keyword.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.learnerName.toLowerCase().includes(kw) ||
          item.learnerRef.includes(kw) ||
          item.appRef.includes(kw) ||
          item.courseInfo.toLowerCase().includes(kw),
      );
    }

    if (searchForm.value.status) {
      filtered = filtered.filter((item) => item.status === searchForm.value.status);
    }

    results.value = filtered;
    loading.value = false;
    hasSearched.value = true;
  }, 600);
}

onMounted(() => {
  handleSearch();
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

.search-form-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

.search-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 700;
  color: #475569;
  margin-bottom: 8px;
}

.search-submit-btn {
  min-width: 180px;
  height: 48px;
  border-radius: 12px;
  font-weight: 800;
  letter-spacing: 0.02em;
  box-shadow: 0 4px 15px rgba(var(--admin-primary-rgb), 0.25);
}

.applicant-results-table {
  :deep(.q-table__top) {
    padding: 0;
  }

  :deep(thead tr th) {
    background: #f8fafc;
    font-weight: 800;
    color: #475569;
    font-size: 0.8rem;
    padding: 16px 8px;
  }

  :deep(tbody td) {
    font-size: 0.88rem;
    padding: 12px 8px;
    white-space: normal;
    word-break: break-word;
    line-height: 1.4;
  }

  :deep(tbody tr:nth-child(even)) {
    background: rgba(241, 245, 249, 0.3);
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
</style>
