<template>
  <q-page class="admin-page finance-sof-page finance-sof-page--static-cards">
    <AdminPageHero
      eyebrow="ข้อมูลอ้างอิงการเงิน"
      eyebrow-icon="schema"
      title="ผังแหล่งเงิน"
      description="จัดการรหัสและชื่อผังแหล่งเงินตามส่วนงาน เพื่อใช้ประกอบการบันทึกและอ้างอิงในระบบ"
    />

    <section class="admin-shell admin-content">
      <AdminSurfaceCard
        title="ผังแหล่งเงิน"
        :subtitle="
          editingId
            ? 'แก้ไขรายการด้านล่าง แล้วกดบันทึก — รหัสเป็นตัวเลขเท่านั้น'
            : 'กรอกข้อมูลด้านบน แล้วดูรายการด้านล่างในหน้าเดียวกัน'
        "
        body-padding="lg"
      >
        <div class="sof-form">
          <div class="sof-form__grid">
            <div class="sof-field">
              <label class="sof-label"> ส่วนงาน <span class="text-negative">*</span> </label>
              <q-select
                v-model="form.division"
                :options="divisionOptions"
                outlined
                dense
                emit-value
                map-options
                placeholder="เลือกส่วนงาน"
                class="admin-editor-field"
                :rules="[(v) => !!v || 'กรุณาเลือกส่วนงาน']"
                lazy-rules
              />
            </div>

            <div class="sof-field">
              <label class="sof-label">
                รหัสผังแหล่งเงิน <span class="text-negative">*</span>
              </label>
              <q-input
                :model-value="form.code"
                outlined
                dense
                placeholder="เช่น 42245"
                inputmode="numeric"
                autocomplete="off"
                class="admin-editor-field"
                :rules="codeFieldRules"
                lazy-rules
                @update:model-value="onCodeInput"
              />
            </div>

            <div class="sof-field sof-field--span">
              <label class="sof-label">
                ชื่อผังแหล่งเงิน <span class="text-negative">*</span>
              </label>
              <q-input
                v-model.trim="form.name"
                outlined
                dense
                placeholder="ชื่อเต็มของผังแหล่งเงิน"
                class="admin-editor-field"
                :rules="[(v) => !!v || 'กรุณากรอกชื่อ']"
                lazy-rules
              />
            </div>

            <div class="sof-field sof-field--span">
              <label class="sof-label">สถานะ</label>
              <div class="sof-status-row">
                <q-option-group
                  v-model="form.active"
                  :options="statusOptions"
                  type="radio"
                  color="primary"
                  inline
                  class="sof-radio-group"
                />
                <div class="row items-center justify-end q-gutter-sm no-wrap">
                  <q-btn
                    v-if="editingId"
                    flat
                    no-caps
                    color="grey-8"
                    label="ยกเลิกการแก้ไข"
                    @click="resetForm"
                  />
                  <q-btn
                    unelevated
                    no-caps
                    color="primary"
                    icon="save"
                    label="บันทึก"
                    class="sof-save-btn"
                    @click="onSave"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <q-separator class="q-my-xl" />

        <div class="sof-list-head row items-center justify-between q-mb-md">
          <div class="sof-list-head__title text-weight-bold text-body1">รายการทั้งหมด</div>
          <div class="sof-table-toolbar">
            <q-input
              v-model="tableSearch"
              outlined
              clearable
              debounce="200"
              placeholder="ค้นหา ส่วนงาน รหัส หรือชื่อ..."
              bg-color="white"
              class="sof-search-input-main"
            >
              <template #prepend>
                <q-icon name="search" color="grey-5" />
              </template>
              <template #append>
                <q-separator vertical class="q-mx-sm" />
                <q-btn flat round color="grey-7" icon="filter_list">
                  <q-menu padding class="sof-filter-menu shadow-10" style="border-radius: 16px">
                    <div class="q-pa-md" style="min-width: 260px">
                      <div class="text-subtitle1 text-weight-bold q-mb-md">ตัวกรองเพิ่มเติม</div>

                      <div class="filter-group q-mb-md">
                        <q-select
                          v-model="listFilter.faculty"
                          :options="facultyFilterMenuOptions"
                          outlined
                          dense
                          emit-value
                          map-options
                          options-dense
                          label="คณะ / ส่วนงาน"
                          class="full-width sof-filter-menu-field"
                        />
                      </div>

                      <div class="filter-group q-mb-md">
                        <div class="text-caption text-grey-7 q-mb-xs">สถานะการใช้งาน</div>
                        <div class="row q-gutter-xs">
                          <q-btn
                            unelevated
                            dense
                            no-caps
                            :color="listFilter.status === 'open' ? 'primary' : 'grey-2'"
                            :text-color="listFilter.status === 'open' ? 'white' : 'dark'"
                            label="เปิด"
                            class="q-px-md text-caption"
                            @click="
                              listFilter.status = listFilter.status === 'open' ? null : 'open'
                            "
                          />
                          <q-btn
                            unelevated
                            dense
                            no-caps
                            :color="listFilter.status === 'closed' ? 'primary' : 'grey-2'"
                            :text-color="listFilter.status === 'closed' ? 'white' : 'dark'"
                            label="ปิด"
                            class="q-px-md text-caption"
                            @click="
                              listFilter.status = listFilter.status === 'closed' ? null : 'closed'
                            "
                          />
                        </div>
                      </div>

                      <q-separator class="q-my-sm" />
                      <div class="row q-gutter-sm">
                        <q-btn
                          unelevated
                          label="ล้าง"
                          color="grey-2"
                          text-color="dark"
                          dense
                          no-caps
                          class="col q-px-md rounded-borders"
                          @click="resetTableFilters"
                        />
                        <q-btn
                          unelevated
                          label="ตกลง"
                          color="primary"
                          dense
                          no-caps
                          class="col q-px-md rounded-borders"
                          v-close-popup
                        />
                      </div>
                    </div>
                  </q-menu>
                </q-btn>
              </template>
            </q-input>
          </div>
        </div>

        <q-table
          v-model:pagination="pagination"
          flat
          :rows="filteredRows"
          :columns="columns"
          row-key="id"
          :rows-per-page-options="[10]"
          class="sof-table"
        >
          <template #body-cell-index="props">
            <q-td :props="props">
              {{ props.rowIndex + 1 + (pagination.page - 1) * pagination.rowsPerPage }}
            </q-td>
          </template>

          <template #body-cell-active="props">
            <q-td :props="props">
              <q-badge
                rounded
                class="sof-status-badge"
                :color="props.row.active ? 'positive' : 'grey-6'"
                :label="props.row.active ? 'เปิด' : 'ปิด'"
              />
            </q-td>
          </template>

          <template #body-cell-actions="props">
            <q-td :props="props">
              <div class="row no-wrap items-center q-gutter-xs justify-center">
                <q-btn
                  flat
                  round
                  dense
                  color="primary"
                  icon="edit"
                  :disable="props.row.referencedInCourse"
                  @click="onEdit(props.row)"
                >
                  <q-tooltip v-if="props.row.referencedInCourse">
                    ไม่สามารถแก้ไขได้เมื่อมีการอ้างอิงในการเปิดรายวิชา
                  </q-tooltip>
                  <q-tooltip v-else>แก้ไข</q-tooltip>
                </q-btn>
                <q-btn
                  flat
                  round
                  dense
                  color="negative"
                  icon="delete"
                  :disable="props.row.referencedInCourse"
                  @click="onDelete(props.row)"
                >
                  <q-tooltip v-if="props.row.referencedInCourse">
                    ไม่สามารถลบได้เมื่อมีการอ้างอิงในการเปิดรายวิชา
                  </q-tooltip>
                  <q-tooltip v-else>ลบ</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template #no-data>
            <div class="full-width column flex-center q-pa-xl text-grey-7">
              <q-icon name="inventory_2" size="48px" class="q-mb-md" />
              <span>ยังไม่มีข้อมูลผังแหล่งเงิน</span>
            </div>
          </template>
        </q-table>

        <div class="sof-footnote q-mt-md">
          <q-icon name="info" size="18px" class="q-mr-sm" />
          หมายเหตุ ไม่สามารถแก้ไขและลบข้อมูลได้ ถ้ามีการอ้างอิงในการเปิดรายวิชาแล้ว
        </div>
      </AdminSurfaceCard>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import { useQuasar, type QTableProps } from 'quasar';
import { computed, ref, watch } from 'vue';

const $q = useQuasar();

type FundChartRow = {
  id: string;
  division: string;
  code: string;
  name: string;
  active: boolean;
  referencedInCourse: boolean;
};

const divisionOptions = [
  { label: 'สำนักคอมพิวเตอร์', value: 'สำนักคอมพิวเตอร์' },
  { label: 'คณะวิทยาศาสตร์', value: 'คณะวิทยาศาสตร์' },
  { label: 'สำนักงานอธิการบดี', value: 'สำนักงานอธิการบดี' },
];

const statusOptions = [
  { label: 'เปิด', value: true },
  { label: 'ปิด', value: false },
];

const facultyFilterMenuOptions: { label: string; value: string | null }[] = [
  { label: 'ทุกคณะ', value: null },
  ...divisionOptions.map((o) => ({ label: o.label, value: o.value })),
];

const rows = ref<FundChartRow[]>([
  {
    id: '1',
    division: 'สำนักคอมพิวเตอร์',
    code: '42245',
    name: 'งบดำเนินการสำนักคอมพิวเตอร์',
    active: true,
    referencedInCourse: false,
  },
  {
    id: '2',
    division: 'สำนักคอมพิวเตอร์',
    code: '88302',
    name: 'เงินรายได้จากหลักสูตรระยะสั้น',
    active: true,
    referencedInCourse: true,
  },
]);

const tableSearch = ref('');

/** ตัวกรองในเมนู (รูปแบบเดียวกับหน้า short-courses) */
const listFilter = ref<{
  faculty: string | null;
  status: 'open' | 'closed' | null;
}>({
  faculty: null,
  status: null,
});

const editingId = ref<string | null>(null);

const form = ref({
  division: 'สำนักคอมพิวเตอร์',
  code: '',
  name: '',
  active: true,
});

const pagination = ref({
  sortBy: 'code',
  descending: false,
  page: 1,
  rowsPerPage: 10,
});

const filteredRows = computed(() => {
  let list = rows.value;

  const faculty = listFilter.value.faculty;
  if (faculty) {
    list = list.filter((r) => r.division === faculty);
  }

  const st = listFilter.value.status;
  if (st === 'open') {
    list = list.filter((r) => r.active);
  } else if (st === 'closed') {
    list = list.filter((r) => !r.active);
  }

  const q = tableSearch.value.trim().toLowerCase();
  if (q) {
    list = list.filter(
      (r) =>
        r.division.toLowerCase().includes(q) ||
        r.code.includes(q) ||
        r.name.toLowerCase().includes(q),
    );
  }

  return list;
});

function resetTableFilters() {
  listFilter.value = { faculty: null, status: null };
  tableSearch.value = '';
  pagination.value.page = 1;
}

watch(
  () => [listFilter.value.faculty, listFilter.value.status, tableSearch.value] as const,
  () => {
    pagination.value.page = 1;
  },
);

const codeFieldRules = [
  (v: string) => !!String(v ?? '').trim() || 'กรุณากรอกรหัส',
  (v: string) => /^\d+$/.test(String(v ?? '')) || 'กรุณาใช้เฉพาะตัวเลข',
];

function onCodeInput(v: string | number | null | undefined) {
  form.value.code = String(v ?? '').replace(/\D/g, '');
}

const columns: QTableProps['columns'] = [
  {
    name: 'index',
    label: 'ลำดับ',
    field: 'index',
    align: 'center',
    sortable: false,
    style: 'width: 72px',
  },
  {
    name: 'division',
    label: 'ส่วนงาน',
    field: 'division',
    align: 'left',
    sortable: true,
  },
  {
    name: 'code',
    label: 'รหัสผังแหล่งเงิน',
    field: 'code',
    align: 'left',
    sortable: true,
    sort: (a: string, b: string) => Number(a) - Number(b),
  },
  {
    name: 'name',
    label: 'ชื่อผังแหล่งเงิน',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'active',
    label: 'สถานะการใช้งาน',
    field: 'active',
    align: 'center',
    sortable: true,
  },
  {
    name: 'actions',
    label: 'จัดการ',
    field: 'actions',
    align: 'center',
    sortable: false,
    style: 'width: 120px',
  },
];

function resetForm() {
  editingId.value = null;
  form.value = {
    division: 'สำนักคอมพิวเตอร์',
    code: '',
    name: '',
    active: true,
  };
}

function onSave() {
  if (!form.value.division || !form.value.code || !form.value.name) {
    $q.notify({ type: 'negative', message: 'กรุณากรอกข้อมูลที่จำเป็นให้ครบ' });
    return;
  }

  if (!/^\d+$/.test(form.value.code)) {
    $q.notify({ type: 'negative', message: 'รหัสผังแหล่งเงินต้องเป็นตัวเลขเท่านั้น' });
    return;
  }

  const dup = rows.value.some(
    (r) => r.code === form.value.code && (!editingId.value || r.id !== editingId.value),
  );
  if (dup) {
    $q.notify({ type: 'warning', message: 'รหัสผังแหล่งเงินนี้มีในระบบแล้ว' });
    return;
  }

  if (editingId.value) {
    const row = rows.value.find((r) => r.id === editingId.value);
    if (row) {
      if (row.referencedInCourse) {
        $q.notify({ type: 'warning', message: 'รายการนี้ถูกอ้างอิงในการเปิดรายวิชาแล้ว' });
        return;
      }
      row.division = form.value.division;
      row.code = form.value.code;
      row.name = form.value.name;
      row.active = form.value.active;
    }
    $q.notify({ type: 'positive', message: 'บันทึกการแก้ไขเรียบร้อย' });
  } else {
    rows.value.unshift({
      id: crypto.randomUUID(),
      division: form.value.division,
      code: form.value.code,
      name: form.value.name,
      active: form.value.active,
      referencedInCourse: false,
    });
    $q.notify({ type: 'positive', message: 'บันทึกข้อมูลใหม่เรียบร้อย' });
  }

  resetForm();
}

function onEdit(row: FundChartRow) {
  if (row.referencedInCourse) {
    return;
  }
  editingId.value = row.id;
  form.value = {
    division: row.division,
    code: row.code,
    name: row.name,
    active: row.active,
  };
}

function onDelete(row: FundChartRow) {
  if (row.referencedInCourse) {
    return;
  }

  $q.dialog({
    title: 'ยืนยันการลบ',
    message: `ต้องการลบ "${row.name}" (${row.code}) หรือไม่`,
    cancel: { flat: true, color: 'grey-8', label: 'ยกเลิก' },
    ok: { color: 'negative', label: 'ลบ', unelevated: true },
    persistent: true,
  }).onOk(() => {
    rows.value = rows.value.filter((r) => r.id !== row.id);
    if (editingId.value === row.id) {
      resetForm();
    }
    $q.notify({ type: 'positive', message: 'ลบรายการแล้ว' });
  });
}
</script>

<style scoped lang="scss">
.finance-sof-page {
  padding-bottom: 48px;
}

/* Hero บนหน้านี้ — กะทัดรัดขึ้นให้สมดุลกับแถบเมนูด้านบน */
.finance-sof-page :deep(.admin-page-hero) {
  padding: 28px 0 20px;
}

.finance-sof-page :deep(.admin-page-hero__content) {
  min-height: 0;
}

.finance-sof-page :deep(.admin-eyebrow) {
  padding: 6px 11px;
  font-size: 0.68rem;
}

.finance-sof-page :deep(.admin-page-hero h1) {
  font-size: clamp(1.35rem, 1.85vw, 1.75rem);
  margin: 8px 0 6px;
}

.finance-sof-page :deep(.admin-page-hero p) {
  font-size: 0.88rem;
  line-height: 1.5;
  max-width: min(52ch, 100%);
}

@media (max-width: 900px) {
  .finance-sof-page :deep(.admin-page-hero) {
    padding: 22px 0 16px;
  }
}

/* ปิดเอฟเฟกต์การ์ดเด้งขึ้นตอน hover จากธีม admin (ใช้เฉพาะหน้านี้) */
.finance-sof-page--static-cards :deep(.admin-surface-card:not(.admin-surface-card--glass)) {
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease !important;
}

.finance-sof-page--static-cards :deep(.admin-surface-card:not(.admin-surface-card--glass):hover) {
  transform: none !important;
  border-color: var(--admin-line) !important;
  box-shadow: var(--admin-shadow-sm) !important;
}

.sof-list-head {
  flex-wrap: wrap;
  gap: 12px;

  @media (max-width: 600px) {
    flex-direction: column;
    align-items: stretch !important;
  }
}

.sof-list-head__title {
  color: var(--admin-navy, #10233f);
}

.sof-form__grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 24px;

  @media (max-width: 700px) {
    grid-template-columns: 1fr;
  }
}

.sof-field--span {
  grid-column: 1 / -1;

  @media (max-width: 700px) {
    grid-column: auto;
  }
}

.sof-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 700;
  color: #334155;
  margin-bottom: 8px;
}

.sof-radio-group {
  padding-top: 0;
}

.sof-status-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px 20px;
}

.sof-status-row .sof-radio-group {
  flex: 1 1 auto;
  min-width: 0;
}

.sof-save-btn {
  min-width: 120px;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.sof-table-toolbar {
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

    .sof-search-input-main {
      max-width: none;
      flex: 1 1 100%;
    }
  }
}

.sof-filter-menu-field {
  :deep(.q-field__control) {
    min-height: 40px;
  }
}

/* ช่องค้นหา + ปุ่มตัวกรอง แบบหน้า short-courses */
.sof-search-input-main {
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

.sof-table {
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

.sof-status-badge {
  font-weight: 700;
  padding: 6px 12px;
  text-transform: none;
}

.sof-footnote {
  display: flex;
  align-items: flex-start;
  padding: 16px 20px 20px;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #b45309;
  background: linear-gradient(90deg, rgba(254, 243, 199, 0.65), transparent);
  border-top: 1px solid rgba(251, 191, 36, 0.35);
}

.sof-search {
  min-width: 220px;
}

.sof-table {
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

.sof-status-badge {
  font-weight: 700;
  padding: 6px 12px;
  text-transform: none;
}

.sof-footnote {
  display: flex;
  align-items: flex-start;
  padding: 16px 20px 20px;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #b45309;
  background: linear-gradient(90deg, rgba(254, 243, 199, 0.65), transparent);
  border-top: 1px solid rgba(251, 191, 36, 0.35);
}
</style>
