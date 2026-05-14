<template>
  <q-page class="admin-page finance-payment-import-page finance-payment-import-page--static-cards">
    <AdminPageHero
      eyebrow="Financial Operations"
      eyebrow-icon="upload_file"
      title="นำเข้าไฟล์การชำระเงิน"
      description="อัปโหลดไฟล์รายการชำระเงิน ตรวจสอบความถูกต้อง และเตรียมข้อมูลสำหรับออกใบเสร็จรับเงินในขั้นตอนเดียว"
    />

    <section class="admin-shell admin-content">
      <div class="payment-import-main-container">
        <AdminSurfaceCard title="อัปโหลดไฟล์ชำระเงิน" body-padding="lg">
          <div class="import-station-container">
            <!-- Left Side: Contextual Information -->
            <div class="import-station-context">
              <div class="context-group">
                <div class="context-label">ส่วนงานที่ดำเนินการ</div>
                <div class="context-value text-primary">
                  <q-icon name="apartment" class="q-mr-sm" />
                  {{ defaultDivision }}
                </div>
              </div>

              <div class="context-group">
                <div class="context-label">สถานะการเลือกไฟล์</div>
                <div class="context-status" :class="{ 'is-selected': selectedFile }">
                  <q-icon
                    :name="selectedFile ? 'check_circle' : 'pending'"
                    size="18px"
                    class="q-mr-sm"
                  />
                  {{ selectedFile ? 'เตรียมพร้อมสำหรับการนำเข้า' : 'ยังไม่ได้เลือกไฟล์' }}
                </div>
              </div>

              <div class="import-station-hint">
                <q-icon name="info" size="18px" class="q-mr-xs text-amber-9" />
                <span class="text-weight-bold">หมายเหตุ:</span>
                กรณีนำเข้าข้อมูลไม่สำเร็จ ให้ตรวจสอบไฟล์ที่นำเข้า โดยต้องเป็นไปตามที่ระบบกำหนด
                ได้แก่ รูปแบบ .csv และมี comp code ตรงกับคณะของผู้ใช้
              </div>
            </div>

            <!-- Right Side: Interactive Upload Area -->
            <div class="import-station-action">
              <div
                class="fancy-upload-zone"
                :class="{ 'has-file': selectedFile }"
                @click="fileInput?.pickFiles()"
              >
                <!-- State: Empty -->
                <div v-if="!selectedFile" class="fancy-upload-zone__content">
                  <div class="fancy-upload-zone__icon">
                    <q-icon name="cloud_upload" />
                  </div>
                  <div class="fancy-upload-zone__text">
                    <div class="main-text">คลิกเพื่อเลือกไฟล์จ่ายเงิน</div>
                    <div class="sub-text">ลากไฟล์มาวางที่นี่ หรือคลิกเพื่อเลือกจากเครื่อง</div>
                  </div>
                </div>

                <!-- State: File Selected -->
                <div v-else class="selected-file-display">
                  <div class="selected-file-icon">
                    <q-icon name="description" size="48px" />
                  </div>
                  <div class="selected-file-details">
                    <div class="file-name">{{ selectedFile.name }}</div>
                    <div class="file-meta">{{ formatFileSize(selectedFile.size) }}</div>
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    color="primary"
                    icon="cancel"
                    class="btn-clear-file"
                    @click.stop="selectedFile = null"
                  />
                </div>

                <!-- Hidden actual file input -->
                <q-file
                  ref="fileInput"
                  v-model="selectedFile"
                  class="hidden"
                  accept=".csv,.xlsx,.xls"
                  @update:model-value="onFileSelected"
                />
              </div>

              <q-btn
                unelevated
                color="amber-8"
                label="บันทึกข้อมูลไฟล์จ่ายเงิน"
                no-caps
                class="full-width q-mt-lg btn-save-import"
                :disable="!selectedFile"
                @click="saveImportedFile"
              >
                <template #loading>
                  <q-spinner-facebook />
                </template>
              </q-btn>
            </div>
          </div>
        </AdminSurfaceCard>

        <AdminSurfaceCard
          title="รายการชำระเงินที่นำเข้า"
          :subtitle="`แสดงข้อมูล ${filteredRows.length} จาก ${importedRows.length} รายการ`"
          card-class="payment-import-table-card"
          body-padding="none"
        >
          <template #header-actions>
            <div class="payment-table-toolbar q-mb-lg">
              <q-input
                v-model="tableSearch"
                outlined
                clearable
                debounce="200"
                placeholder="ค้นหา..."
                class="payment-search"
              >
                <template #prepend>
                  <q-icon name="search" />
                </template>
              </q-input>

              <q-btn
                unelevated
                color="negative"
                icon="delete_sweep"
                label="ลบข้อมูลทั้งหมด"
                no-caps
                class="payment-delete-btn"
                :disable="!importedRows.length"
                @click="confirmClearAll"
              />
            </div>
          </template>

          <q-table
            v-model:pagination="pagination"
            flat
            :rows="filteredRows"
            :columns="columns"
            row-key="id"
            :rows-per-page-options="[10, 25, 50]"
            class="payment-import-table"
          >
            <template #body-cell-index="props">
              <q-td :props="props">
                {{ props.rowIndex + 1 + (pagination.page - 1) * pagination.rowsPerPage }}
              </q-td>
            </template>

            <template #body-cell-amount="props">
              <q-td :props="props" class="text-weight-bold">
                {{ formatCurrency(props.row.amount) }}
              </q-td>
            </template>

            <template #no-data>
              <div class="full-width column flex-center q-pa-xl text-grey-7">
                <q-icon name="upload_file" size="52px" class="q-mb-md" />
                <span>ยังไม่มีข้อมูลไฟล์จ่ายเงิน</span>
              </div>
            </template>
          </q-table>

          <div class="payment-table-footer" v-if="!isVerifying">
            <div>
              <q-icon name="rule" size="18px" />
              ตรวจสอบเลขอ้างอิงและยอดชำระก่อนส่งต่อขั้นตอนออกใบเสร็จ
            </div>
            <q-btn
              unelevated
              color="primary"
              icon="fact_check"
              label="ตรวจสอบข้อมูล"
              no-caps
              :disable="!importedRows.length"
              @click="verifyImportedRows"
            />
          </div>

          <!-- Verification View (Comparison Table) -->
          <div v-if="isVerifying" class="verification-view q-pa-md">
            <div class="row items-center justify-between q-mb-lg">
              <div class="row items-center q-gutter-sm">
                <q-btn flat round icon="arrow_back" @click="isVerifying = false" />
                <div class="text-h6 text-weight-bolder">
                  ตรวจสอบความถูกต้อง (เปรียบเทียบข้อมูลผู้สมัคร)
                </div>
              </div>
              <q-btn
                unelevated
                color="cyan-7"
                label="ค้นหาข้อมูลผู้สมัคร"
                no-caps
                class="rounded-borders"
              />
            </div>

            <q-table
              flat
              bordered
              :rows="comparisonRows"
              :columns="comparisonColumns"
              row-key="id"
              :pagination="{ rowsPerPage: 0 }"
              hide-pagination
              class="comparison-table"
              dense
            >
              <template #header="props">
                <q-tr :props="props" class="comparison-header-main">
                  <q-th colspan="3" class="text-center bg-grey-2 border-r">ทั่วไป</q-th>
                  <q-th colspan="4" class="text-center bg-blue-1 text-blue-9 border-r"
                    >ไฟล์จ่ายเงิน</q-th
                  >
                  <q-th colspan="4" class="text-center bg-green-1 text-green-9 border-r"
                    >ข้อมูลผู้สมัคร</q-th
                  >
                  <q-th rowspan="2" class="text-center">แก้ไข</q-th>
                </q-tr>
                <q-tr :props="props" class="comparison-header-sub">
                  <q-th
                    v-for="col in props.cols.slice(0, 11)"
                    :key="col.name"
                    :props="props"
                    :class="{ 'border-r': [2, 6, 10].includes(props.cols.indexOf(col)) }"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template #body="props">
                <q-tr :props="props">
                  <q-td key="index" :props="props">{{ props.rowIndex + 1 }}</q-td>
                  <q-td key="paymentDate" :props="props">{{ props.row.paymentDate }}</q-td>
                  <q-td key="paymentTime" :props="props" class="border-r">{{
                    props.row.paymentTime
                  }}</q-td>

                  <!-- Import Side -->
                  <q-td key="importLearnerRef" :props="props">{{ props.row.learnerRef }}</q-td>
                  <q-td key="importAppRef" :props="props">{{ props.row.applicationRef }}</q-td>
                  <q-td key="importPayerName" :props="props">{{ props.row.payerName }}</q-td>
                  <q-td key="importAmount" :props="props" class="text-weight-bold border-r">{{
                    props.row.amount
                  }}</q-td>

                  <!-- DB Side -->
                  <q-td key="dbLearnerRef" :props="props">{{ props.row.dbLearnerRef }}</q-td>
                  <q-td key="dbAppRef" :props="props">{{ props.row.dbAppRef }}</q-td>
                  <q-td key="dbLearnerName" :props="props">{{ props.row.dbLearnerName }}</q-td>
                  <q-td key="dbAmount" :props="props" class="text-weight-bold border-r">{{
                    props.row.dbAmount
                  }}</q-td>

                  <q-td key="actions" :props="props">
                    <q-btn flat round dense icon="edit" size="sm" color="grey-6" />
                  </q-td>
                </q-tr>
              </template>

              <template #bottom-row>
                <q-tr class="comparison-footer-row text-weight-bold bg-grey-1">
                  <q-td colspan="6" class="text-right border-r">รวม</q-td>
                  <q-td class="text-center border-r text-primary">{{ totalAmount }}</q-td>
                  <q-td colspan="3" class="text-center bg-grey-2 border-r">รวม</q-td>
                  <q-td class="text-center border-r text-primary">{{ totalAmount }}</q-td>
                  <q-td></q-td>
                </q-tr>
              </template>
            </q-table>

            <div class="column items-center q-mt-xl">
              <div class="text-negative text-weight-bold q-mb-md">
                กรุณาตรวจสอบความถูกต้องก่อนกดปุ่ม "บันทึกข้อมูลการชำระเงินค่าลงทะเบียน"
                เพื่อสร้างใบเสร็จรับเงิน
              </div>
              <q-btn
                unelevated
                color="amber-8"
                label="บันทึกข้อมูลการชำระเงินค่าลงทะเบียน"
                no-caps
                class="q-px-xl q-py-md text-weight-bolder shadow-3"
                style="font-size: 1.1rem; border-radius: 12px"
                @click="finalizeImport"
              />
            </div>
          </div>
        </AdminSurfaceCard>
      </div>
    </section>

    <!-- Unified Confirm Dialog -->
    <AdminConfirmDialog
      v-model="showSaveConfirm"
      title="ยืนยันการบันทึกข้อมูล"
      message="คุณต้องการบันทึกข้อมูลการชำระเงินค่าลงทะเบียนและดำเนินการออกใบเสร็จรับเงินใช่หรือไม่?"
      confirm-label="บันทึกและออกใบเสร็จ"
      cancel-label="ยกเลิก"
      icon="fact_check"
      @confirm="executeFinalizeImport"
    />
  </q-page>
</template>

<script setup lang="ts">
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import AdminConfirmDialog from 'components/admin/AdminConfirmDialog.vue';
import { useQuasar, type QTableProps } from 'quasar';
import { computed, ref, watch } from 'vue';

const $q = useQuasar();

type ImportedPaymentRow = {
  id: string;
  learnerRef: string;
  applicationRef: string;
  payerName: string;
  paymentDate: string;
  paymentTime: string;
  amount: number;
  importedAt: string;
  importedBy: string;
};

const defaultDivision = 'สำนักคอมพิวเตอร์ (82994)';

const selectedFile = ref<File | null>(null);
const fileInput = ref<{ pickFiles: () => void } | null>(null);
const tableSearch = ref('');
const isVerifying = ref(false);
const showSaveConfirm = ref(false);

const comparisonColumns: QTableProps['columns'] = [
  { name: 'index', label: 'ลำดับ', align: 'center', field: 'index', style: 'width: 40px' },
  {
    name: 'paymentDate',
    label: 'วันที่ชำระ',
    align: 'center',
    field: 'paymentDate',
    style: 'width: 85px',
  },
  {
    name: 'paymentTime',
    label: 'เวลา',
    align: 'center',
    field: 'paymentTime',
    style: 'width: 65px',
  },
  // Import Group
  {
    name: 'importLearnerRef',
    label: 'รหัสผู้เรียน (Ref1)',
    align: 'center',
    field: 'learnerRef',
    style: 'width: 100px',
  },
  {
    name: 'importAppRef',
    label: 'เลขสมัคร (Ref2)',
    align: 'center',
    field: 'applicationRef',
    style: 'width: 115px',
  },
  { name: 'importPayerName', label: 'ผู้ชำระเงิน', align: 'center', field: 'payerName' },
  {
    name: 'importAmount',
    label: 'จำนวนเงิน',
    align: 'center',
    field: 'amount',
    style: 'width: 80px',
  },
  // DB Group
  {
    name: 'dbLearnerRef',
    label: 'รหัสผู้เรียน (Ref1)',
    align: 'center',
    field: 'dbLearnerRef',
    style: 'width: 100px',
  },
  {
    name: 'dbAppRef',
    label: 'เลขสมัคร (Ref2)',
    align: 'center',
    field: 'dbAppRef',
    style: 'width: 115px',
  },
  { name: 'dbLearnerName', label: 'ชื่อผู้เรียน', align: 'center', field: 'dbLearnerName' },
  {
    name: 'dbAmount',
    label: 'จำนวนเงิน',
    align: 'center',
    field: 'dbAmount',
    style: 'width: 80px',
  },
  // Actions
  { name: 'actions', label: 'แก้ไข', align: 'center', field: 'actions', style: 'width: 50px' },
];

const comparisonRows = computed(() => {
  return importedRows.value.map((row) => ({
    ...row,
    dbLearnerRef: row.learnerRef,
    dbAppRef: row.applicationRef,
    dbLearnerName: row.payerName,
    dbAmount: row.amount,
  }));
});

const importedRows = ref<ImportedPaymentRow[]>([
  {
    id: 'PAY-001',
    learnerRef: '6700017',
    applicationRef: '6751300100003',
    payerName: 'น.ส. สุกัญญา ประมงค์กิจ',
    paymentDate: '10-04-2567',
    paymentTime: '14:13:19',
    amount: 1200,
    importedAt: '13/06/2568 14:14:40',
    importedBy: 'นางสาวสุกัญญา ประมงค์กิจ',
  },
  {
    id: 'PAY-002',
    learnerRef: '6600005',
    applicationRef: '6751300100002',
    payerName: 'น.ส. วันนิสา ข่ายเพชร',
    paymentDate: '10-04-2567',
    paymentTime: '14:20:19',
    amount: 900,
    importedAt: '13/06/2568 14:14:40',
    importedBy: 'นางสาวสุกัญญา ประมงค์กิจ',
  },
  {
    id: 'PAY-003',
    learnerRef: '6600005',
    applicationRef: '6751300100002',
    payerName: 'NATTAPORN YASOWONG',
    paymentDate: '10-04-2567',
    paymentTime: '14:20:38',
    amount: 900,
    importedAt: '13/06/2568 14:14:40',
    importedBy: 'นางสาวสุกัญญา ประมงค์กิจ',
  },
]);

const pagination = ref({
  sortBy: 'paymentDate',
  descending: true,
  page: 1,
  rowsPerPage: 10,
});

const columns: QTableProps['columns'] = [
  {
    name: 'index',
    label: 'ลำดับ',
    field: 'index',
    align: 'center',
    sortable: false,
    style: 'width: 76px',
  },
  {
    name: 'learnerRef',
    label: 'รหัสประจำตัวผู้เรียน (Ref1)',
    field: 'learnerRef',
    align: 'left',
    sortable: true,
  },
  {
    name: 'applicationRef',
    label: 'เลขอ้างอิงการสมัคร (Ref2)',
    field: 'applicationRef',
    align: 'left',
    sortable: true,
  },
  {
    name: 'payerName',
    label: 'ผู้ชำระเงิน',
    field: 'payerName',
    align: 'left',
    sortable: true,
  },
  {
    name: 'paymentDate',
    label: 'Payment Date',
    field: 'paymentDate',
    align: 'left',
    sortable: true,
  },
  {
    name: 'paymentTime',
    label: 'Payment Time',
    field: 'paymentTime',
    align: 'left',
    sortable: true,
  },
  {
    name: 'amount',
    label: 'จำนวนเงิน',
    field: 'amount',
    align: 'right',
    sortable: true,
  },
  {
    name: 'importedAt',
    label: 'วันที่นำเข้าข้อมูล',
    field: 'importedAt',
    align: 'left',
    sortable: true,
  },
  {
    name: 'importedBy',
    label: 'ผู้นำเข้าข้อมูล',
    field: 'importedBy',
    align: 'left',
    sortable: true,
  },
];

const formatFileSize = (bytes: number) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const totalAmount = computed(() => importedRows.value.reduce((sum, row) => sum + row.amount, 0));
const filteredRows = computed(() => {
  let list = importedRows.value;

  const keyword = tableSearch.value.trim().toLowerCase();
  if (keyword) {
    list = list.filter((row) =>
      [
        row.learnerRef,
        row.applicationRef,
        row.payerName,
        row.paymentDate,
        row.paymentTime,
        row.importedAt,
        row.importedBy,
      ]
        .join(' ')
        .toLowerCase()
        .includes(keyword),
    );
  }

  return list;
});

watch([tableSearch], () => {
  pagination.value.page = 1;
});

function formatCurrency(value: number) {
  return `฿${value.toLocaleString('th-TH')}`;
}

function onFileSelected(file: File | null) {
  if (!file) {
    return;
  }
}

function saveImportedFile() {
  if (!selectedFile.value) {
    return;
  }

  $q.notify({
    type: 'positive',
    message: `บันทึกข้อมูลไฟล์ ${selectedFile.value.name} เรียบร้อย`,
  });
}

function verifyImportedRows() {
  isVerifying.value = true;
}

function finalizeImport() {
  showSaveConfirm.value = true;
}

function executeFinalizeImport() {
  isVerifying.value = false;
  $q.notify({
    type: 'positive',
    message: 'บันทึกข้อมูลและเตรียมออกใบเสร็จเรียบร้อยแล้ว',
    icon: 'verified_user',
    position: 'top',
    timeout: 2500,
  });
}

function confirmClearAll() {
  $q.dialog({
    title: 'ลบข้อมูลไฟล์จ่ายเงินทั้งหมด?',
    message: 'รายการที่นำเข้าจะแสดงเป็นค่าว่างในหน้านี้ ต้องการดำเนินการต่อหรือไม่',
    cancel: { flat: true, label: 'ยกเลิก', color: 'grey-8' },
    ok: { unelevated: true, label: 'ลบข้อมูล', color: 'negative' },
    persistent: true,
  }).onOk(() => {
    importedRows.value = [];
    selectedFile.value = null;
    $q.notify({ type: 'positive', message: 'ลบข้อมูลไฟล์จ่ายเงินทั้งหมดแล้ว' });
  });
}
</script>

<style scoped lang="scss">
.finance-payment-import-page {
  padding-bottom: 48px;
}

.finance-payment-import-page--static-cards
  :deep(.admin-surface-card:not(.admin-surface-card--glass)) {
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease !important;
}

.finance-payment-import-page--static-cards
  :deep(.admin-surface-card:not(.admin-surface-card--glass):hover) {
  transform: none !important;
  border-color: var(--admin-line) !important;
  box-shadow: var(--admin-shadow-sm) !important;
}

.import-station-container {
  display: grid;
  grid-template-columns: 380px 1fr;
  min-height: 280px;
}

.import-station-context {
  padding: 40px;
  background: rgba(var(--admin-primary-rgb), 0.02);
  border-right: 1px solid var(--admin-line);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.context-group {
  margin-bottom: 24px;
}

.context-label {
  font-size: 0.72rem;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--admin-grey-7);
  letter-spacing: 0.1em;
  margin-bottom: 8px;
}

.context-value {
  font-size: 1.25rem;
  font-weight: 900;
  line-height: 1.2;
}

.context-status {
  display: inline-flex;
  align-items: center;
  padding: 8px 16px;
  background: var(--admin-grey-2);
  border-radius: 100px;
  font-weight: 700;
  font-size: 0.85rem;
  color: var(--admin-grey-7);
  transition: all 0.3s ease;
}

.context-status.is-selected {
  background: rgba(33, 186, 69, 0.1);
  color: #21ba45;
}

.import-station-hint {
  margin-top: auto;
  font-size: 0.75rem;
  color: var(--admin-grey-6);
  line-height: 1.5;
  background: white;
  padding: 12px;
  border-radius: 12px;
  border: 1px dashed var(--admin-line);
}

.import-station-action {
  padding: 40px;
  display: flex;
  flex-direction: column;
}

.fancy-upload-zone {
  flex: 1;
  border: 2px dashed var(--admin-line);
  border-radius: 20px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
  position: relative;
  overflow: hidden;
}

.fancy-upload-zone:hover {
  border-color: var(--admin-primary);
  background: rgba(var(--admin-primary-rgb), 0.02);
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
}

.fancy-upload-zone.has-file {
  border-style: solid;
  border-color: var(--admin-primary);
  background: #ffffff;
  justify-content: flex-start;
}

.selected-file-display {
  display: flex;
  align-items: center;
  padding: 30px;
  width: 100%;
  gap: 24px;
  animation: slideUp 0.4s ease;
}

.selected-file-icon {
  width: 72px;
  height: 72px;
  background: rgba(var(--admin-primary-rgb), 0.08);
  color: var(--admin-primary);
  border-radius: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  flex-shrink: 0;
  border: 1px solid rgba(var(--admin-primary-rgb), 0.1);
}

.selected-file-icon::after {
  content: '✓';
  position: absolute;
  top: -6px;
  right: -6px;
  width: 22px;
  height: 22px;
  background: #21ba45;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: bold;
  border: 2px solid white;
}

.selected-file-details {
  flex: 1;
  min-width: 0;
}

.selected-file-details .file-name {
  font-size: 1.25rem;
  font-weight: 900;
  color: var(--admin-navy);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-bottom: 2px;
}

.selected-file-details .file-meta {
  font-size: 0.9rem;
  color: var(--admin-grey-6);
  font-weight: 700;
}

.btn-clear-file {
  background: var(--admin-grey-2);
  width: 40px;
  height: 40px;
}

.btn-clear-file:hover {
  background: #ffebee;
  color: #f44336 !important;
}

.fancy-upload-zone__content {
  text-align: center;
  z-index: 1;
}

.fancy-upload-zone__icon {
  font-size: 48px;
  margin-bottom: 16px;
  opacity: 0.8;
  transition: transform 0.3s ease;
}

.fancy-upload-zone:hover .fancy-upload-zone__icon {
  transform: scale(1.1);
}

.fancy-upload-zone__text .main-text {
  font-size: 1.1rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.fancy-upload-zone__text .sub-text {
  font-size: 0.8rem;
  opacity: 0.7;
}

.fancy-upload-zone__actions {
  position: absolute;
  top: 16px;
  right: 16px;
}

.btn-save-import {
  height: 52px;
  border-radius: 14px;
  font-size: 1.05rem;
  font-weight: 900;
  box-shadow: 0 8px 25px rgba(242, 193, 7, 0.3);
}

.btn-save-import:disabled {
  box-shadow: none;
}

.payment-import-hero-card {
  display: none;
}

.payment-import-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.payment-import-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(320px, 0.55fr);
  gap: 16px;
  align-items: stretch;
}

.upload-panel {
  display: grid;
  gap: 18px;
}

.upload-panel__drop {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr) minmax(240px, 0.9fr);
  gap: 18px;
  align-items: center;
  padding: 18px;
  border: 1px dashed rgba(16, 35, 63, 0.22);
  border-radius: 16px;
  background: linear-gradient(135deg, rgba(245, 166, 35, 0.1), rgba(255, 255, 255, 0.8)), #ffffff;
}

.upload-panel__icon {
  display: grid;
  width: 64px;
  height: 64px;
  place-items: center;
  border-radius: 16px;
  color: var(--admin-accent-ink);
  background: rgba(245, 166, 35, 0.16);
}

.upload-panel__copy {
  min-width: 0;
}

.upload-panel__copy strong {
  display: block;
  overflow: hidden;
  color: var(--admin-navy);
  font-size: 1.05rem;
  font-weight: 950;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.upload-panel__copy span,
.upload-hint {
  color: var(--admin-muted);
  font-size: 0.88rem;
  font-weight: 700;
  line-height: 1.5;
}

.upload-panel__file {
  min-width: 0;
}

.upload-form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.payment-import-label {
  display: block;
  margin-bottom: 8px;
  color: #334155;
  font-size: 0.86rem;
  font-weight: 800;
}

.upload-actions {
  flex-wrap: wrap;
}

.upload-hint {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-width: 240px;
  flex: 1 1 auto;
}

.import-step-list {
  display: grid;
  gap: 12px;
}

.import-step {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 14px;
  border: 1px solid rgba(16, 35, 63, 0.1);
  border-radius: 14px;
  background: #ffffff;
}

.import-step__icon {
  display: grid;
  width: 42px;
  height: 42px;
  place-items: center;
  border-radius: 12px;
  color: #64748b;
  background: #f1f5f9;
}

.import-step strong {
  display: block;
  color: var(--admin-navy);
  font-weight: 900;
}

.import-step span {
  display: block;
  margin-top: 3px;
  color: var(--admin-muted);
  font-size: 0.82rem;
  font-weight: 700;
  line-height: 1.45;
}

.import-step--done .import-step__icon {
  color: #047857;
  background: rgba(16, 185, 129, 0.13);
}

.import-step--active .import-step__icon {
  color: #b7791f;
  background: rgba(245, 166, 35, 0.16);
}

.payment-table-toolbar {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.payment-search {
  width: min(380px, 42vw);
  min-width: 240px;

  :deep(.q-field__control) {
    height: 52px;
    border-radius: 12px;
  }
}

.payment-delete-btn {
  height: 52px;
  border-radius: 12px;
  font-weight: 700;
  padding: 0 20px;
}

.bg-primary-transparent {
  background: rgba(var(--admin-primary-rgb, 15, 35, 63), 0.08);
}

.text-navy {
  color: var(--admin-navy, #0f233f);
}

.payment-import-table {
  :deep(.q-table__top) {
    padding: 0;
  }

  :deep(.q-table thead tr th) {
    background: linear-gradient(180deg, #f1f5f9 0%, #e8eef5 100%);
    color: #475569;
    font-size: 0.8rem;
    font-weight: 900;
    letter-spacing: 0.01em;
    white-space: normal;
  }

  :deep(.q-table tbody tr:nth-child(even)) {
    background: rgba(248, 246, 241, 0.55);
  }

  :deep(.q-table tbody td) {
    color: #334155;
    font-size: 0.88rem;
    vertical-align: top;
  }

  :deep(.q-table__bottom) {
    border-top: 1px solid var(--admin-line);
  }
}

.payment-import-notice {
  display: flex;
  align-items: flex-start;
  padding: 14px 18px;
  background: linear-gradient(90deg, rgba(254, 243, 199, 0.6), transparent);
  border-left: 4px solid #f5a623;
  border-radius: 4px 12px 12px 4px;
  color: #b45309;
  font-size: 0.88rem;
  line-height: 1.55;

  .q-icon {
    margin-top: 2px;
    flex-shrink: 0;
    color: #f5a623;
  }

  .notice-text {
    flex: 1;
  }
}

.payment-status-badge {
  padding: 6px 11px;
  font-weight: 800;
}

.payment-import-main-container {
  display: grid;
  gap: 0;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid var(--admin-line);
  box-shadow: var(--admin-shadow-sm);

  :deep(.admin-surface-card) {
    border: none !important;
    border-radius: 0 !important;
    box-shadow: none !important;
  }

  :deep(.admin-surface-card:not(:last-child)) {
    border-bottom: 1px solid var(--admin-line) !important;
  }
}

.payment-table-footer {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  color: #b45309;
  font-size: 0.88rem;
  font-weight: 800;
  line-height: 1.45;
  background: linear-gradient(90deg, rgba(254, 243, 199, 0.72), rgba(255, 255, 255, 0.45));
  border-top: 1px solid rgba(251, 191, 36, 0.34);
}

.payment-table-footer > div {
  display: inline-flex;
  gap: 8px;
  align-items: center;
}

/* Verification View Styles */
.comparison-table {
  background: white;
  border-radius: 12px;

  :deep(.q-table th) {
    font-weight: 900;
    font-size: 0.74rem;
    padding: 10px 4px;
    white-space: normal;
    line-height: 1.2;
    text-align: center !important;
    vertical-align: middle;
  }

  :deep(.q-table td) {
    padding: 10px 4px;
    font-size: 0.78rem;
    white-space: normal;
    word-break: break-word;
    line-height: 1.3;
    text-align: center !important;
    vertical-align: middle;
  }

  .border-r {
    border-right: 1px solid rgba(0, 0, 0, 0.08);
  }

  .comparison-header-main th {
    font-size: 0.88rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    padding: 10px 4px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  }

  .comparison-header-sub th {
    background: #f8fafc;
    color: #64748b;
  }

  .comparison-footer-row td {
    border-top: 2px solid #e2e8f0;
    font-size: 0.88rem;
  }
}

.verification-view {
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (max-width: 1100px) {
  .payment-import-metrics,
  .payment-import-layout {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .payment-import-layout {
    align-items: start;
  }
}

@media (max-width: 820px) {
  .payment-import-metrics,
  .payment-import-layout,
  .upload-form-grid,
  .upload-panel__drop {
    grid-template-columns: 1fr;
  }

  .payment-import-hero-card {
    width: 100%;
  }

  .payment-table-toolbar,
  .payment-search,
  .payment-status-filter {
    width: 100%;
  }
}
</style>
