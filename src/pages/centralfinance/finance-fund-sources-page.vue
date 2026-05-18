<template>
  <q-page class="finance-page fund-sources-page">
    <!-- ── Hero ─────────────────────────────────────────────── -->
    <CentralFinancePageHero
      :eyebrow="$t('centralFinance.dashboard.hero.eyebrow')"
      eyebrow-icon="account_balance"
      :title="$t('centralFinance.fundSources.hero.title')"
      :description="$t('centralFinance.fundSources.hero.desc')"
    >
      <template #actions>
        <CentralFinanceActionButton
          icon="add_circle_outline"
          :label="$t('centralFinance.dashboard.quickLinks.addFundSource')"
          no-caps
          @click="onCreateNew"
        />
        <CentralFinanceActionButton
          variant="outline"
          icon="history"
          :label="$t('centralFinance.fundSources.actions.history')"
          no-caps
          @click="showHistory = true"
        />
        <CentralFinanceActionButton
          variant="outline"
          icon="file_download"
          :label="$t('centralFinance.fundSources.actions.exportAll')"
          no-caps
          @click="onExport"
        />
      </template>
    </CentralFinancePageHero>

    <!-- ── Content Section ───────────────────────────────────── -->
    <section class="finance-shell finance-content">
      <!-- ── Filter Section ────────────────────────────────────── -->
      <div class="filter-section">
        <CentralFinanceSurfaceCard :accent="false" class="filter-card">
          <div class="filter-grid">
            <q-input
              v-model="filters.search"
              outlined
              dense
              bg-color="white"
              :placeholder="$t('centralFinance.fundSources.filters.search')"
              class="filter-item search-input"
            >
              <template #prepend>
                <q-icon name="search" />
              </template>
            </q-input>

            <q-select
              v-model="filters.faculty"
              :options="facultyOptions"
              outlined
              dense
              bg-color="white"
              :label="$t('centralFinance.fundSources.filters.faculty')"
              class="filter-item"
              clearable
            >
              <template #prepend>
                <q-icon name="business" />
              </template>
            </q-select>

            <q-input
              v-model="filters.date"
              outlined
              dense
              bg-color="white"
              :label="$t('centralFinance.fundSources.filters.date')"
              class="filter-item"
              mask="####-##-##"
            >
              <template #prepend>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                    <q-date v-model="filters.date" mask="YYYY-MM-DD">
                      <div class="row items-center justify-end">
                        <q-btn v-close-popup label="Close" color="primary" flat />
                      </div>
                    </q-date>
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>

            <q-select
              v-model="filters.status"
              :options="statusOptions"
              outlined
              dense
              bg-color="white"
              :label="$t('centralFinance.fundSources.filters.status')"
              class="filter-item"
              emit-value
              map-options
              clearable
            >
              <template #prepend>
                <q-icon name="flag" />
              </template>
            </q-select>
          </div>
        </CentralFinanceSurfaceCard>
      </div>

      <!-- ── Table Section ────────────────────────────────────── -->
      <div class="table-section">
        <CentralFinanceSurfaceCard :accent="false" class="table-card" body-padding="none">
          <q-table
            :rows="filteredRows"
            :columns="columns"
            row-key="id"
            flat
            :pagination="pagination"
            class="fund-source-table"
          >
            <!-- Status Column Custom Rendering -->
            <template #body-cell-status="props">
              <q-td :props="props">
                <q-badge
                  :color="getStatusColor(props.value)"
                  :label="getStatusLabel(props.value)"
                  class="status-badge"
                />
              </q-td>
            </template>

            <!-- Actions Column -->
            <template #body-cell-actions="props">
              <q-td :props="props" class="text-right">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="visibility"
                  @click="onViewDetail(props.row)"
                >
                  <q-tooltip v-if="!$q.platform.is.mobile">ดูรายละเอียด</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="secondary"
                  icon="edit"
                  :disabled="props.row.status === 'completed'"
                  @click="onEdit(props.row)"
                >
                  <q-tooltip v-if="!$q.platform.is.mobile">
                    {{
                      props.row.status === 'completed'
                        ? 'ไม่สามารถแก้ไขคำขอที่ออกเลขแล้วได้'
                        : 'แก้ไข/อัปเดต'
                    }}
                  </q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </CentralFinanceSurfaceCard>
      </div>
    </section>

    <!-- ── Detail Dialog ────────────────────────────────────── -->
    <q-dialog v-model="showDetail">
      <q-card v-if="selectedRequest" style="width: 800px; max-width: 95vw; border-radius: 20px">
        <q-card-section class="detail-dialog-header q-pa-lg">
          <div class="row items-center justify-between no-wrap">
            <div class="column">
              <div class="text-overline text-gold-deep text-weight-bolder">
                Ref: {{ selectedRequest.requestId }}
              </div>
              <div class="text-h5 text-weight-black text-navy q-mt-xs">
                {{ $t('centralFinance.fundSources.detail.title') }}
              </div>
            </div>
            <q-btn icon="close" flat round dense v-close-popup color="grey-7" />
          </div>

          <div class="row items-center q-mt-md q-gutter-sm">
            <q-badge
              :color="getStatusColor(selectedRequest.status)"
              class="q-px-md q-py-sm text-weight-bold"
              style="border-radius: 8px"
            >
              {{ getStatusLabel(selectedRequest.status) }}
            </q-badge>
            <div class="text-caption text-grey-7">
              <q-icon name="event" class="q-mr-xs" />
              {{
                $t('centralFinance.fundSources.detail.submittedAt', { date: selectedRequest.date })
              }}
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-lg">
            <!-- Left Side: Basic Info -->
            <div class="col-12 col-md-7">
              <div class="detail-group">
                <label>{{ $t('centralFinance.fundSources.detail.faculty') }}</label>
                <div class="text-subtitle1 text-weight-bold text-navy">
                  {{ selectedRequest.faculty }}
                </div>
              </div>

              <div class="detail-group q-mt-lg">
                <label>{{ $t('centralFinance.fundSources.detail.project') }}</label>
                <div class="text-subtitle1 text-weight-bold text-primary">
                  {{ selectedRequest.project }}
                </div>
                <div class="text-body2 text-grey-8 q-mt-sm line-height-relaxed">
                  {{
                    selectedRequest.description || $t('centralFinance.fundSources.detail.noDesc')
                  }}
                </div>
              </div>

              <div class="detail-group q-mt-xl">
                <label>{{ $t('centralFinance.fundSources.detail.attachments') }}</label>
                <div
                  v-if="selectedRequest.documents && selectedRequest.documents.length > 0"
                  class="row q-gutter-sm q-mt-sm"
                >
                  <q-btn
                    v-for="(doc, idx) in selectedRequest.documents"
                    :key="idx"
                    outline
                    no-caps
                    color="blue-grey-8"
                    class="doc-btn"
                  >
                    <q-icon
                      :name="doc.type === 'pdf' ? 'picture_as_pdf' : 'description'"
                      size="xs"
                      class="q-mr-sm"
                    />
                    <div class="doc-name">{{ doc.name }}</div>
                  </q-btn>
                </div>
                <div v-else class="text-caption text-grey-6 italic q-mt-sm">
                  {{ $t('centralFinance.fundSources.detail.noAttachments') }}
                </div>
              </div>
            </div>

            <!-- Right Side: Budget & Contact -->
            <div class="col-12 col-md-5">
              <CentralFinanceSurfaceCard tone="default" body-padding="md" class="info-sidebar">
                <div class="budget-section text-center q-pa-md">
                  <div class="text-overline text-grey-7">
                    {{ $t('centralFinance.fundSources.detail.budgetRequested') }}
                  </div>
                  <div class="text-h4 text-weight-black text-primary">
                    {{ formatCurrency(selectedRequest.amount) }}
                  </div>
                </div>

                <q-separator spaced />

                <div class="contact-section q-pa-md">
                  <div class="text-subtitle2 text-weight-bold text-navy q-mb-md">
                    {{ $t('centralFinance.fundSources.detail.contactTitle') }}
                  </div>
                  <div class="row items-center q-mb-sm">
                    <q-icon name="person" color="grey-6" size="xs" class="q-mr-sm" />
                    <div class="text-body2">{{ selectedRequest.contactName || '-' }}</div>
                  </div>
                  <div class="row items-center">
                    <q-icon name="phone" color="grey-6" size="xs" class="q-mr-sm" />
                    <div class="text-body2">{{ selectedRequest.contactPhone || '-' }}</div>
                  </div>
                </div>
              </CentralFinanceSurfaceCard>

              <div class="action-summary q-mt-lg">
                <div class="text-caption text-grey-7 q-mb-sm">
                  {{ $t('centralFinance.fundSources.detail.actionsTitle') }}
                </div>
                <div class="column q-gutter-sm">
                  <q-btn
                    v-if="selectedRequest.status === 'new'"
                    color="primary"
                    unelevated
                    :label="$t('centralFinance.fundSources.detail.startReview')"
                    icon="play_arrow"
                    no-caps
                    class="full-width q-py-sm"
                  />
                  <q-btn
                    v-if="selectedRequest.status === 'processing'"
                    color="positive"
                    unelevated
                    :label="$t('centralFinance.fundSources.detail.approve')"
                    icon="check_circle"
                    no-caps
                    class="full-width q-py-sm"
                  />
                  <q-btn
                    outline
                    color="negative"
                    :label="$t('centralFinance.fundSources.detail.reject')"
                    icon="reply"
                    no-caps
                    class="full-width q-py-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </q-card-section>
      </q-card>
    </q-dialog>

    <!-- ── Compact Edit Dialog ────────────────────────────────── -->
    <q-dialog v-model="showEdit">
      <q-card class="compact-edit-card">
        <q-card-section class="bg-grey-1 q-py-md q-px-md row items-center">
          <div class="text-h6 text-weight-bold">
            {{ $t('centralFinance.fundSources.edit.title') }}
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup size="sm" color="grey-7" />
        </q-card-section>

        <q-card-section class="q-pa-md">
          <div class="column q-gutter-sm">
            <!-- Request Brief -->
            <div class="request-brief-box q-pa-md bg-blue-1 rounded-borders">
              <div class="row justify-between items-center">
                <div class="text-subtitle2 text-blue-9 text-weight-bolder">{{ editForm.id }}</div>
                <q-badge
                  :color="getStatusColor(selectedRequest?.status || '')"
                  class="q-px-sm q-py-xs"
                  style="font-size: 12px"
                >
                  {{ getStatusLabel(selectedRequest?.status || '') }}
                </q-badge>
              </div>
              <div class="text-body2 text-grey-8 q-mt-xs">{{ selectedRequest?.faculty }}</div>
            </div>

            <!-- Inputs -->
            <div class="compact-form q-mt-sm q-gutter-y-sm">
              <div>
                <label class="compact-label">{{
                  $t('centralFinance.fundSources.edit.newStatus')
                }}</label>
                <q-select
                  v-model="editForm.status"
                  :options="statusOptions"
                  outlined
                  emit-value
                  map-options
                  class="q-mt-xs large-text-input"
                />
              </div>

              <div>
                <label class="compact-label">{{
                  $t('centralFinance.fundSources.edit.note')
                }}</label>
                <q-input
                  v-model="editForm.note"
                  type="textarea"
                  outlined
                  :placeholder="$t('centralFinance.fundSources.edit.notePlaceholder')"
                  rows="3"
                  class="q-mt-xs large-text-input"
                />
              </div>
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-actions align="right" class="q-pa-sm q-gutter-x-sm">
          <q-btn
            flat
            no-caps
            :label="$t('centralFinance.fundSources.edit.cancelBtn')"
            color="grey-7"
            v-close-popup
            dense
          />
          <q-btn
            unelevated
            no-caps
            :label="$t('centralFinance.fundSources.edit.saveBtn')"
            color="primary"
            class="q-px-md"
            @click="onSaveEdit"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- ── History Dialog ────────────────────────────────────── -->
    <q-dialog v-model="showHistory">
      <q-card style="min-width: 700px; border-radius: 16px">
        <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 text-weight-bold">
            <q-icon name="history" size="md" color="primary" class="q-mr-sm" />
            ประวัติการส่งแจ้งเตือนกลับคณะ
          </div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section>
          <q-table
            :rows="financeStore.notificationLogs"
            :columns="historyColumns"
            row-key="id"
            flat
            bordered
            :pagination="{ rowsPerPage: 5 }"
          >
            <template #body-cell-note="props">
              <q-td :props="props">
                <div class="text-caption text-grey-8" style="max-width: 200px; white-space: normal">
                  {{ props.row.note || '-' }}
                </div>
              </q-td>
            </template>
            <template #body-cell-sentAt="props">
              <q-td :props="props">
                {{ new Date(props.row.sentAt).toLocaleString('th-TH') }}
              </q-td>
            </template>
            <template #no-data>
              <div class="full-width row flex-center text-grey-6 q-pa-md">
                <q-icon size="2em" name="info" class="q-mr-sm" />
                <span>ยังไม่มีประวัติการแจ้งเตือน</span>
              </div>
            </template>
          </q-table>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';
import type { QTableColumn } from 'quasar';
import { useCentralFinanceStore } from 'src/stores/central-finance-store';
import type { FundSourceRequest } from 'src/stores/central-finance-store';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import CentralFinanceActionButton from 'components/centralfinance/CentralFinanceActionButton.vue';

const router = useRouter();
const { t } = useI18n();
const $q = useQuasar();
const financeStore = useCentralFinanceStore();

const showHistory = ref(false);
const showDetail = ref(false);
const showEdit = ref(false);
const selectedRequest = ref<FundSourceRequest | null>(null);

interface EditForm {
  id: string;
  status: FundSourceRequest['status'];
  note: string;
}

const editForm = reactive<EditForm>({
  id: '',
  status: 'new',
  note: '',
});

const filters = reactive({
  search: '',
  faculty: null,
  date: '',
  status: null,
});

const pagination = ref({
  rowsPerPage: 10,
});

const facultyOptions = [
  'คณะวิทยาการสารสนเทศ',
  'คณะวิทยาศาสตร์',
  'คณะพยาบาลศาสตร์',
  'คณะบริหารธุรกิจ',
  'คณะวิศวกรรมศาสตร์',
  'สำนักคอมพิวเตอร์',
];

const statusOptions = computed(() => [
  { label: t('centralFinance.fundSources.status.new'), value: 'new' },
  { label: t('centralFinance.fundSources.status.processing'), value: 'processing' },
  { label: t('centralFinance.fundSources.status.completed'), value: 'completed' },
  { label: t('centralFinance.fundSources.status.rejected'), value: 'rejected' },
]);

const columns = computed<QTableColumn[]>(() => [
  {
    name: 'requestId',
    label: t('centralFinance.fundSources.table.requestId'),
    field: 'requestId',
    align: 'left',
    sortable: true,
  },
  {
    name: 'date',
    label: t('centralFinance.fundSources.table.date'),
    field: 'date',
    align: 'left',
    sortable: true,
  },
  {
    name: 'faculty',
    label: t('centralFinance.fundSources.table.faculty'),
    field: 'faculty',
    align: 'left',
    sortable: true,
  },
  {
    name: 'project',
    label: t('centralFinance.fundSources.table.project'),
    field: 'project',
    align: 'left',
    sortable: true,
    style: 'max-width: 300px; white-space: normal;',
  },
  {
    name: 'status',
    label: t('centralFinance.fundSources.table.status'),
    field: 'status',
    align: 'center',
    sortable: true,
  },
  {
    name: 'actions',
    label: '',
    field: 'actions',
    align: 'right',
  },
]);

const historyColumns = computed<QTableColumn[]>(() => [
  {
    name: 'fundCode',
    label: t('centralFinance.fundSources.history.fundCode'),
    field: 'fundCode',
    align: 'left',
    sortable: true,
  },
  {
    name: 'sentTo',
    label: t('centralFinance.fundSources.history.sentTo'),
    field: 'sentTo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'approvedBy',
    label: t('centralFinance.fundSources.history.approver'),
    field: 'approvedBy',
    align: 'left',
  },
  {
    name: 'note',
    label: t('centralFinance.fundSources.history.note'),
    field: 'note',
    align: 'left',
  },
  {
    name: 'sentAt',
    label: t('centralFinance.fundSources.history.sentAt'),
    field: 'sentAt',
    align: 'right',
    sortable: true,
  },
]);

const rows = computed(() => financeStore.requests);

const filteredRows = computed(() => {
  return rows.value.filter((row) => {
    const matchesSearch =
      !filters.search ||
      row.requestId.toLowerCase().includes(filters.search.toLowerCase()) ||
      row.project.toLowerCase().includes(filters.search.toLowerCase());

    const matchesFaculty = !filters.faculty || row.faculty === filters.faculty;
    const matchesDate = !filters.date || row.date === filters.date;
    const matchesStatus = !filters.status || row.status === filters.status;

    return matchesSearch && matchesFaculty && matchesDate && matchesStatus;
  });
});

function formatCurrency(value: number | undefined) {
  if (value === undefined) return '-';
  return new Intl.NumberFormat('th-TH', { style: 'currency', currency: 'THB' }).format(value);
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'new':
      return t('centralFinance.fundSources.status.new');
    case 'processing':
      return t('centralFinance.fundSources.status.processing');
    case 'completed':
      return t('centralFinance.fundSources.status.completed');
    case 'rejected':
      return t('centralFinance.fundSources.status.rejected');
    default:
      return status;
  }
}

function getStatusColor(status: string) {
  switch (status) {
    case 'new':
      return 'blue';
    case 'processing':
      return 'orange';
    case 'completed':
      return 'positive';
    case 'rejected':
      return 'negative';
    default:
      return 'grey';
  }
}

async function onCreateNew() {
  await router.push('/central-finance/fund-sources/add');
}

function onExport() {
  $q.notify({
    type: 'positive',
    message: 'Preparing export of all fund source requests',
    icon: 'file_download',
  });
}

function onViewDetail(row: FundSourceRequest) {
  selectedRequest.value = row;
  showDetail.value = true;
}

function onEdit(row: FundSourceRequest) {
  selectedRequest.value = row;
  editForm.id = row.requestId;
  editForm.status = row.status;
  editForm.note = '';
  showEdit.value = true;
}

function onSaveEdit() {
  if (selectedRequest.value) {
    // In a real app, this would be an API call
    selectedRequest.value.status = editForm.status;
    $q.notify({
      type: 'positive',
      message: t('centralFinance.fundSources.edit.success'),
      position: 'top',
    });
    showEdit.value = false;
  }
}
</script>

<style lang="scss" scoped>
.fund-sources-page {
  padding-bottom: 60px;
}

.filter-section {
  margin-bottom: 18px;
}

.filter-grid {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 1fr;
  gap: 16px;
  align-items: center;
}

.table-card {
  overflow: hidden;
}

.fund-source-table {
  background: transparent;

  :deep(.q-table__card) {
    box-shadow: none;
  }

  :deep(thead tr th) {
    font-weight: 800;
    color: var(--finance-navy);
    background: #f8fafc;
    font-size: 0.88rem;
    padding: 16px;
  }

  :deep(tbody tr td) {
    padding: 16px;
    font-size: 0.94rem;
  }

  :deep(tbody tr:hover) {
    background: rgba(16, 35, 63, 0.02);
  }
}

.status-badge {
  padding: 6px 12px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 0.75rem;
  text-transform: uppercase;
}

/* Detail Dialog Styles */
.detail-group {
  label {
    display: block;
    font-size: 0.7rem;
    font-weight: 900;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--finance-muted);
    margin-bottom: 4px;
  }
}

.line-height-relaxed {
  line-height: 1.6;
}

.doc-btn {
  border-radius: 10px;
  padding: 4px 12px;
  background: #f1f5f9;
  border: 1px solid #e2e8f0;

  .doc-name {
    font-size: 0.8rem;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.info-sidebar {
  border-radius: 16px !important;
  background: #f8fafc !important;
  border: 1px dashed rgba(var(--q-primary), 0.2) !important;
}

.budget-section {
  .text-h4 {
    font-family: 'Inter', sans-serif;
    letter-spacing: -0.02em;
  }
}

@media (max-width: 1024px) {
  .filter-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 600px) {
  .filter-grid {
    grid-template-columns: 1fr;
  }
}
.compact-edit-card {
  width: 400px;
  max-width: 95vw;
  border-radius: 12px;
}

.request-brief-box {
  border: 1px solid rgba(25, 118, 210, 0.2);
}

.compact-label {
  font-size: 13px;
  font-weight: 700;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.02em;
}

.large-text-input {
  font-size: 15px;
}

.truncate-1-line {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
