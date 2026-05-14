<template>
  <q-page class="admin-page fund-sources-page">
    <!-- ── Hero ─────────────────────────────────────────────── -->
    <AdminPageHero
      eyebrow="Central Finance · กองคลัง"
      eyebrow-icon="account_balance"
      title="รายการคำขอเพิ่มแหล่งเงิน"
      description="จัดการและตรวจสอบเอกสารคำขอเพิ่มแหล่งเงินงบประมาณจากคณะและหน่วยงานต่างๆ"
    >
      <template #actions>
        <AdminActionButton
          icon="add_circle_outline"
          label="ออกเลขแหล่งเงินใหม่"
          no-caps
          @click="onCreateNew"
        />
        <AdminActionButton
          variant="outline"
          icon="history"
          label="ประวัติการแจ้งเตือน"
          no-caps
          @click="showHistory = true"
        />
        <AdminActionButton
          variant="outline"
          icon="file_download"
          label="ส่งออกรายงานรวม"
          no-caps
          @click="onExport"
        />
      </template>
    </AdminPageHero>

    <!-- ── Content Section ───────────────────────────────────── -->
    <section class="admin-shell admin-content">
      <!-- ── Filter Section ────────────────────────────────────── -->
      <div class="filter-section">
        <AdminSurfaceCard tone="glass" :accent="false" class="filter-card">
          <div class="filter-grid">
            <q-input
              v-model="filters.search"
              outlined
              dense
              bg-color="white"
              placeholder="ค้นหาเลขที่คำขอ หรือชื่อโครงการ..."
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
              label="คณะ/ส่วนงาน"
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
              label="วันที่ส่งคำขอ"
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
              label="สถานะ"
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
        </AdminSurfaceCard>
      </div>

      <!-- ── Table Section ────────────────────────────────────── -->
      <div class="table-section">
        <AdminSurfaceCard :accent="true" class="table-card">
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
                  <q-tooltip>ดูรายละเอียด</q-tooltip>
                </q-btn>
                <q-btn flat round dense color="secondary" icon="edit" @click="onEdit(props.row)">
                  <q-tooltip>แก้ไข/อัปเดต</q-tooltip>
                </q-btn>
              </q-td>
            </template>
          </q-table>
        </AdminSurfaceCard>
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
              <div class="text-h5 text-weight-black text-navy q-mt-xs">รายละเอียดคำขอแหล่งเงิน</div>
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
              ยื่นคำขอเมื่อ: {{ selectedRequest.date }}
            </div>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="q-pa-lg">
          <div class="row q-col-gutter-lg">
            <!-- Left Side: Basic Info -->
            <div class="col-12 col-md-7">
              <div class="detail-group">
                <label>คณะ / ส่วนงานที่ยื่นคำขอ</label>
                <div class="text-subtitle1 text-weight-bold text-navy">
                  {{ selectedRequest.faculty }}
                </div>
              </div>

              <div class="detail-group q-mt-lg">
                <label>ชื่อโครงการ / เหตุผลความจำเป็น</label>
                <div class="text-subtitle1 text-weight-bold text-primary">
                  {{ selectedRequest.project }}
                </div>
                <div class="text-body2 text-grey-8 q-mt-sm line-height-relaxed">
                  {{ selectedRequest.description || 'ไม่มีรายละเอียดเพิ่มเติม' }}
                </div>
              </div>

              <div class="detail-group q-mt-xl">
                <label>เอกสารแนบประกอบการพิจารณา</label>
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
                <div v-else class="text-caption text-grey-6 italic q-mt-sm">ไม่มีเอกสารแนบ</div>
              </div>
            </div>

            <!-- Right Side: Budget & Contact -->
            <div class="col-12 col-md-5">
              <AdminSurfaceCard tone="default" body-padding="md" class="info-sidebar">
                <div class="budget-section text-center q-pa-md">
                  <div class="text-overline text-grey-7">งบประมาณที่เสนอขอ</div>
                  <div class="text-h4 text-weight-black text-primary">
                    {{ formatCurrency(selectedRequest.amount) }}
                  </div>
                </div>

                <q-separator spaced />

                <div class="contact-section q-pa-md">
                  <div class="text-subtitle2 text-weight-bold text-navy q-mb-md">
                    ข้อมูลผู้ประสานงาน
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
              </AdminSurfaceCard>

              <div class="action-summary q-mt-lg">
                <div class="text-caption text-grey-7 q-mb-sm">การดำเนินการเบื้องต้น</div>
                <div class="column q-gutter-sm">
                  <q-btn
                    v-if="selectedRequest.status === 'new'"
                    color="primary"
                    unelevated
                    label="เริ่มการตรวจสอบเอกสาร"
                    icon="play_arrow"
                    no-caps
                    class="full-width q-py-sm"
                  />
                  <q-btn
                    v-if="selectedRequest.status === 'processing'"
                    color="positive"
                    unelevated
                    label="ออกรหัสแหล่งเงิน (Approve)"
                    icon="check_circle"
                    no-caps
                    class="full-width q-py-sm"
                  />
                  <q-btn
                    outline
                    color="negative"
                    label="ตีกลับเพื่อแก้ไข"
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
import type { QTableColumn } from 'quasar';
import { useCentralFinanceStore } from 'src/stores/central-finance-store';
import type { FundSourceRequest } from 'src/stores/central-finance-store';
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import AdminActionButton from 'components/admin/AdminActionButton.vue';

const router = useRouter();
const financeStore = useCentralFinanceStore();

const showHistory = ref(false);
const showDetail = ref(false);
const selectedRequest = ref<FundSourceRequest | null>(null);

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

const statusOptions = [
  { label: 'มาใหม่', value: 'new' },
  { label: 'กำลังตรวจสอบ', value: 'processing' },
  { label: 'ออกเลขแล้ว', value: 'completed' },
  { label: 'ถูกตีกลับ', value: 'rejected' },
];

const columns: QTableColumn[] = [
  {
    name: 'requestId',
    label: 'เลขที่อ้างอิงคำขอ',
    field: 'requestId',
    align: 'left',
    sortable: true,
  },
  {
    name: 'date',
    label: 'วันที่ส่งคำขอ',
    field: 'date',
    align: 'left',
    sortable: true,
  },
  {
    name: 'faculty',
    label: 'คณะ/ส่วนงาน',
    field: 'faculty',
    align: 'left',
    sortable: true,
  },
  {
    name: 'project',
    label: 'ชื่อโครงการ/เหตุผล',
    field: 'project',
    align: 'left',
    sortable: true,
    style: 'max-width: 300px; white-space: normal;',
  },
  {
    name: 'status',
    label: 'สถานะ',
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
];

const historyColumns: QTableColumn[] = [
  { name: 'fundCode', label: 'รหัสแหล่งเงิน', field: 'fundCode', align: 'left', sortable: true },
  { name: 'sentTo', label: 'ส่งไปยังส่วนงาน', field: 'sentTo', align: 'left', sortable: true },
  { name: 'approvedBy', label: 'ผู้อนุมัติ', field: 'approvedBy', align: 'left' },
  { name: 'note', label: 'หมายเหตุ', field: 'note', align: 'left' },
  { name: 'sentAt', label: 'เวลาที่ส่ง', field: 'sentAt', align: 'right', sortable: true },
];

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
      return 'มาใหม่';
    case 'processing':
      return 'กำลังตรวจสอบ';
    case 'completed':
      return 'ออกเลขแล้ว';
    case 'rejected':
      return 'ถูกตีกลับ';
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
  console.log('Exporting report');
}

function onViewDetail(row: FundSourceRequest) {
  selectedRequest.value = row;
  showDetail.value = true;
}

function onEdit(row: FundSourceRequest) {
  console.log('Edit row', row);
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
    color: var(--admin-navy);
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
    color: var(--admin-muted);
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
</style>
