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
          icon="file_download"
          label="ส่งออกรายงานรวม"
          no-caps
          @click="onExport"
        />
      </template>
    </AdminPageHero>

    <!-- ── Filter Section ────────────────────────────────────── -->
    <section class="admin-shell filter-section">
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
    </section>

    <!-- ── Table Section ────────────────────────────────────── -->
    <section class="admin-shell table-section">
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
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import type { QTableColumn } from 'quasar';
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import AdminActionButton from 'components/admin/AdminActionButton.vue';

interface RequestRow {
  id: string;
  requestId: string;
  date: string;
  faculty: string;
  project: string;
  status: 'new' | 'processing' | 'completed' | 'rejected';
}

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

const rows = ref<RequestRow[]>([
  {
    id: '1',
    requestId: 'REQ-2569-001',
    date: '2026-05-01',
    faculty: 'คณะวิทยาการสารสนเทศ',
    project: 'โครงการพัฒนาทักษะ AI สำหรับบุคคลทั่วไป',
    status: 'completed',
  },
  {
    id: '2',
    requestId: 'REQ-2569-002',
    date: '2026-05-02',
    faculty: 'คณะวิทยาศาสตร์',
    project: 'ขอเพิ่มแหล่งเงินทุนวิจัยนวัตกรรมสีเขียว',
    status: 'processing',
  },
  {
    id: '3',
    requestId: 'REQ-2569-003',
    date: '2026-05-05',
    faculty: 'คณะพยาบาลศาสตร์',
    project: 'โครงการฝึกอบรมการดูแลผู้สูงอายุระยะยาว',
    status: 'new',
  },
  {
    id: '4',
    requestId: 'REQ-2569-004',
    date: '2026-05-06',
    faculty: 'คณะบริหารธุรกิจ',
    project: 'จัดซื้อครุภัณฑ์คอมพิวเตอร์เพื่อการเรียนการสอน',
    status: 'rejected',
  },
  {
    id: '5',
    requestId: 'REQ-2569-005',
    date: '2026-05-07',
    faculty: 'สำนักคอมพิวเตอร์',
    project: 'พัฒนาระบบเครือข่ายความเร็วสูงภายในมหาวิทยาลัย',
    status: 'new',
  },
  {
    id: '6',
    requestId: 'REQ-2569-006',
    date: '2026-05-08',
    faculty: 'คณะวิศวกรรมศาสตร์',
    project: 'โครงการอบรมเทคโนโลยีหุ่นยนต์อุตสาหกรรม',
    status: 'new',
  },
]);

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

function onCreateNew() {
  console.log('Create new fund source');
}

function onExport() {
  console.log('Exporting report');
}

function onViewDetail(row: RequestRow) {
  console.log('View detail', row);
}

function onEdit(row: RequestRow) {
  console.log('Edit row', row);
}
</script>

<style lang="scss" scoped>
.fund-sources-page {
  padding-bottom: 60px;
}

.filter-section {
  margin-top: -30px;
  position: relative;
  z-index: 10;
  margin-bottom: 24px;
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
