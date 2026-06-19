<template>
  <q-page class="admin-page finance-sof-page finance-sof-page--static-cards">
    <AppPageHero
      eyebrow="Financial Operations"
      eyebrow-icon="schema"
      :title="$t('finance.sourceOfFunds.title')"
      :description="$t('finance.sourceOfFunds.description')"
    >
      <template #aside>
        <div class="faculty-scope-card">
          <div class="faculty-scope-card__label">ข้อมูลที่แสดง</div>
          <div class="faculty-scope-card__faculty">{{ userFacName || 'ไม่ระบุคณะ' }}</div>
        </div>
      </template>
    </AppPageHero>

    <section class="admin-shell admin-content">
      <AppSurfaceCard
        :title="$t('finance.sourceOfFunds.title')"
        :subtitle="
          editingId ? $t('finance.sourceOfFunds.editHint') : $t('finance.sourceOfFunds.createHint')
        "
        body-padding="lg"
      >
        <div class="sof-form">
          <div class="sof-form__grid">
            <div class="sof-field">
              <label class="sof-label">
                {{ $t('finance.sourceOfFunds.faculty') }} <span class="text-negative">*</span>
              </label>
              <q-input
                :model-value="userFacName"
                outlined
                dense
                readonly
                class="admin-editor-field bg-grey-2"
              />
            </div>

            <div class="sof-field">
              <label class="sof-label">
                {{ $t('finance.sourceOfFunds.code') }} <span class="text-negative">*</span>
              </label>
              <q-input
                ref="codeInputRef"
                v-model="form.code"
                outlined
                dense
                :placeholder="$t('finance.sourceOfFunds.codePlaceholder')"
                inputmode="numeric"
                autocomplete="off"
                class="admin-editor-field"
                :rules="codeFieldRules"
                lazy-rules
                @keypress="
                  (e: KeyboardEvent) => {
                    if (!/^\d$/.test(e.key)) e.preventDefault();
                  }
                "
              />
            </div>

            <div class="sof-field sof-field--span">
              <label class="sof-label">
                {{ $t('finance.sourceOfFunds.name') }} <span class="text-negative">*</span>
              </label>
              <q-input
                ref="nameInputRef"
                v-model.trim="form.name"
                outlined
                dense
                :placeholder="$t('finance.sourceOfFunds.namePlaceholder')"
                class="admin-editor-field"
                :rules="[(v) => !!v || $t('finance.sourceOfFunds.validation.nameRequired')]"
                lazy-rules
              />
            </div>

            <div class="sof-field sof-field--span">
              <label class="sof-label">{{ $t('finance.sourceOfFunds.status') }}</label>
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
                    :label="$t('finance.sourceOfFunds.cancelEdit')"
                    @click="resetForm"
                  />
                  <q-btn
                    unelevated
                    no-caps
                    color="primary"
                    icon="save"
                    :label="$t('finance.sourceOfFunds.save')"
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
          <div class="sof-list-head__title text-weight-bold text-body1">
            {{ $t('finance.sourceOfFunds.allItems') }}
          </div>
          <div class="sof-table-toolbar">
            <q-input
              v-model="tableSearch"
              outlined
              clearable
              debounce="200"
              :placeholder="$t('finance.sourceOfFunds.searchPlaceholder')"
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
                      <div class="text-subtitle1 text-weight-bold q-mb-md">
                        {{ $t('finance.sourceOfFunds.additionalFilters') }}
                      </div>

                      <div class="filter-group q-mb-md">
                        <q-select
                          v-model="listFilter.faculty"
                          :options="facultyFilterMenuOptions"
                          outlined
                          dense
                          emit-value
                          map-options
                          options-dense
                          :label="$t('finance.sourceOfFunds.faculty')"
                          class="full-width sof-filter-menu-field"
                        />
                      </div>

                      <div class="filter-group q-mb-md">
                        <div class="text-caption text-grey-7 q-mb-xs">
                          {{ $t('finance.sourceOfFunds.activeStatus') }}
                        </div>
                        <div class="row q-gutter-xs">
                          <q-btn
                            unelevated
                            dense
                            no-caps
                            :color="listFilter.status === 'open' ? 'primary' : 'grey-2'"
                            :text-color="listFilter.status === 'open' ? 'white' : 'dark'"
                            :label="$t('finance.sourceOfFunds.active')"
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
                            :label="$t('finance.sourceOfFunds.inactive')"
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
                          :label="$t('finance.sourceOfFunds.clear')"
                          color="grey-2"
                          text-color="dark"
                          dense
                          no-caps
                          class="col q-px-md rounded-borders"
                          @click="resetTableFilters"
                        />
                        <q-btn
                          unelevated
                          :label="$t('finance.sourceOfFunds.ok')"
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
          :rows-per-page-options="[10, 25, 50, 100]"
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
                :label="
                  props.row.active
                    ? $t('finance.sourceOfFunds.active')
                    : $t('finance.sourceOfFunds.inactive')
                "
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
                    {{ $t('finance.sourceOfFunds.cannotEdit') }}
                  </q-tooltip>
                  <q-tooltip v-else>{{ $t('finance.sourceOfFunds.edit') }}</q-tooltip>
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
                    {{ $t('finance.sourceOfFunds.cannotDelete') }}
                  </q-tooltip>
                  <q-tooltip v-else>{{ $t('finance.sourceOfFunds.delete') }}</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>

          <template #no-data>
            <div class="full-width column flex-center q-pa-xl text-grey-7">
              <q-icon name="inventory_2" size="48px" class="q-mb-md" />
              <span>{{ $t('finance.sourceOfFunds.noData') }}</span>
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
                  class="bg-white sof-rows-select"
                />
                <span class="text-subtitle2 text-grey-8">{{
                  $t('finance.receiptSummary.entries')
                }}</span>
              </div>
              <div class="row items-center q-gutter-sm">
                <span class="text-caption text-grey-8 q-mr-sm">
                  {{ pageStart(scope.pagination) }}-{{ pageEnd(scope.pagination) }} of
                  {{ filteredRows.length }}
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

        <div class="sof-footnote q-mt-md">
          <q-icon name="info" size="18px" class="q-mr-sm" />
          {{ $t('finance.sourceOfFunds.note') }}
        </div>
      </AppSurfaceCard>
    </section>

    <AppConfirmDialog
      v-model="confirmDeleteOpen"
      title="ลบผังแหล่งเงิน"
      :message="
        pendingDeleteRow
          ? `ต้องการลบผังแหล่งเงิน '${pendingDeleteRow.code} - ${pendingDeleteRow.name}' ใช่หรือไม่? การดำเนินการนี้ไม่สามารถย้อนกลับได้`
          : 'ต้องการลบรายการนี้ใช่หรือไม่?'
      "
      confirm-label="ลบ"
      cancel-label="ยกเลิก"
      confirm-color="negative"
      icon-color="negative"
      @confirm="confirmDelete"
      @cancel="pendingDeleteRow = null"
    />
  </q-page>
</template>

<script setup lang="ts">
import AppPageHero from 'components/common/AppPageHero.vue';
import AppSurfaceCard from 'components/common/AppSurfaceCard.vue';
import AppConfirmDialog from 'components/common/AppConfirmDialog.vue';
import { useQuasar, type QTableProps, type QInput } from 'quasar';
import { computed, onMounted, ref, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from 'boot/axios';
import { useAuthStore } from 'stores/auth-store';

const $q = useQuasar();
const { t } = useI18n();

const authStore = useAuthStore();
const currentUser = computed(() => authStore.user);
const userFacName = computed(
  () => currentUser.value?.facName || currentUser.value?.faculty || 'ไม่ระบุ',
);

const codeInputRef = ref<InstanceType<typeof QInput> | null>(null);
const nameInputRef = ref<InstanceType<typeof QInput> | null>(null);

const confirmDeleteOpen = ref(false);
const pendingDeleteRow = ref<FundChartRow | null>(null);

// -- Backend response type --
interface CostplanApiRow {
  id: number;
  facId: number | null;
  costplanCode: string | null;
  costplanName: string | null;
  costplanStatus: string | null;
}

type FundChartRow = {
  id: string;
  backendId: number | null;
  division: string;
  facId: number | null;
  code: string;
  name: string;
  active: boolean;
  referencedInCourse: boolean;
};

interface FacultyApiRow {
  id: number;
  name: string | null;
}

const faculties = ref<FacultyApiRow[]>([]);

async function fetchFaculties() {
  try {
    const { data } = await api.get<FacultyApiRow[]>('/api/lltfaculty');
    faculties.value = data;
  } catch (err) {
    console.error('Error fetching faculties:', err);
  }
}

const userFacId = computed(() => {
  if (userFacName.value && userFacName.value !== 'ไม่ระบุ') {
    const match = faculties.value.find((f) => f.name === userFacName.value);
    if (match) return match.id;
  }
  const directId = (currentUser.value as { facId?: number | null })?.facId;
  if (directId != null && directId >= 1) return directId;
  return 1;
});

function facIdToLabel(facId: number | null): string {
  if (facId === null) return 'ไม่ระบุ';
  const match = faculties.value.find((f) => f.id === facId);
  return match?.name ?? 'ไม่ระบุ';
}

const statusOptions = [
  { label: 'เปิด', value: true },
  { label: 'ปิด', value: false },
];

const facultyFilterMenuOptions = computed(() => [
  { label: 'ทุกคณะ', value: null },
  ...faculties.value.map((f) => ({ label: f.name || 'ไม่ระบุ', value: f.id })),
]);

const rows = ref<FundChartRow[]>([]);

// -- Map backend row to frontend row --
function mapApiRow(r: CostplanApiRow): FundChartRow {
  return {
    id: String(r.id),
    backendId: r.id,
    division: facIdToLabel(r.facId),
    facId: r.facId,
    code: r.costplanCode ?? '',
    name: r.costplanName ?? '',
    active: r.costplanStatus === 'Y',
    referencedInCourse: false,
  };
}

// -- Fetch all from backend --
async function fetchRows() {
  try {
    const { data } = await api.get<CostplanApiRow[]>('/api/lltcostplan');
    rows.value = data.map(mapApiRow);
  } catch (err) {
    console.error('Error fetching costplans:', err);
    $q.notify({ type: 'negative', message: 'ไม่สามารถโหลดข้อมูลได้' });
  }
}

onMounted(async () => {
  await fetchFaculties();
  if (userFacName.value !== 'ไม่ระบุ' && userFacId.value) {
    listFilter.value.faculty = userFacId.value;
  }
  await fetchRows();
});

const tableSearch = ref('');

/** ตัวกรองในเมนู (รูปแบบเดียวกับหน้า short-courses) */
const listFilter = ref<{
  faculty: number | null;
  status: 'open' | 'closed' | null;
}>({
  faculty: null,
  status: null,
});

const editingId = ref<string | null>(null);

const form = ref({
  division: userFacId.value,
  code: '',
  name: '',
  active: true,
});

const pagination = ref({
  sortBy: '',
  descending: false,
  page: 1,
  rowsPerPage: 10,
});

const filteredRows = computed(() => {
  let list = rows.value;

  const faculty = listFilter.value.faculty;
  if (faculty !== null) {
    list = list.filter((r) => r.facId === faculty);
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
        facIdToLabel(r.facId).toLowerCase().includes(q) ||
        r.code.includes(q) ||
        r.name.toLowerCase().includes(q),
    );
  }

  return [...list].sort((a, b) => {
    const idA = a.backendId ?? 0;
    const idB = b.backendId ?? 0;
    return idB - idA;
  });
});

function resetTableFilters() {
  listFilter.value = { faculty: null, status: null };
  tableSearch.value = '';
  pagination.value.page = 1;
}

function pageStart(tablePagination: { page: number; rowsPerPage: number }): number {
  if (filteredRows.value.length === 0) {
    return 0;
  }
  return (tablePagination.page - 1) * tablePagination.rowsPerPage + 1;
}

function pageEnd(tablePagination: { page: number; rowsPerPage: number }): number {
  return Math.min(tablePagination.page * tablePagination.rowsPerPage, filteredRows.value.length);
}

watch(
  () => [listFilter.value.faculty, listFilter.value.status, tableSearch.value] as const,
  () => {
    pagination.value.page = 1;
  },
);

const codeFieldRules = computed(() => [
  (v: string) => !!String(v ?? '').trim() || t('finance.sourceOfFunds.validation.codeRequired'),
  (v: string) => /^\d+$/.test(String(v ?? '')) || t('finance.sourceOfFunds.validation.codeNumeric'),
]);

watch(
  () => form.value.code,
  (val) => {
    const cleaned = String(val ?? '').replace(/\D/g, '');
    if (cleaned !== val) form.value.code = cleaned;
  },
);

const columns = computed<QTableProps['columns']>(() => [
  {
    name: 'index',
    label: t('finance.sourceOfFunds.columnNo'),
    field: 'index',
    align: 'center',
    sortable: false,
    style: 'width: 72px',
  },
  {
    name: 'division',
    label: t('finance.sourceOfFunds.faculty'),
    field: (row: FundChartRow) => facIdToLabel(row.facId),
    align: 'left',
    sortable: true,
  },
  {
    name: 'code',
    label: t('finance.sourceOfFunds.code'),
    field: 'code',
    align: 'left',
    sortable: true,
    sort: (a: string, b: string) => Number(a) - Number(b),
  },
  {
    name: 'name',
    label: t('finance.sourceOfFunds.name'),
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'active',
    label: t('finance.sourceOfFunds.activeStatus'),
    field: 'active',
    align: 'center',
    sortable: true,
  },
  {
    name: 'actions',
    label: t('finance.sourceOfFunds.columnActions'),
    field: 'actions',
    align: 'center',
    sortable: false,
    style: 'width: 120px',
  },
]);

function resetForm() {
  editingId.value = null;
  form.value = {
    division: userFacId.value,
    code: '',
    name: '',
    active: true,
  };
  void nextTick(() => {
    codeInputRef.value?.resetValidation();
    nameInputRef.value?.resetValidation();
  });
}

async function onSave() {
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

  try {
    if (editingId.value) {
      const row = rows.value.find((r) => r.id === editingId.value);
      if (row) {
        if (row.referencedInCourse) {
          $q.notify({ type: 'warning', message: 'รายการนี้ถูกอ้างอิงในการเปิดรายวิชาแล้ว' });
          return;
        }
        await api.patch(`/api/lltcostplan/${row.backendId}`, {
          facId: userFacId.value,
          costplanCode: form.value.code,
          costplanName: form.value.name,
          costplanStatus: form.value.active ? 'Y' : 'N',
        });
        $q.notify({ type: 'positive', message: 'บันทึกการแก้ไขเรียบร้อย' });
      }
    } else {
      await api.post('/api/lltcostplan', {
        facId: userFacId.value,
        costplanCode: form.value.code,
        costplanName: form.value.name,
        costplanStatus: form.value.active ? 'Y' : 'N',
      });
      $q.notify({ type: 'positive', message: 'บันทึกข้อมูลใหม่เรียบร้อย' });
    }

    resetForm();
    await fetchRows();
  } catch (err) {
    console.error('Error saving costplan:', err);
    $q.notify({ type: 'negative', message: 'เกิดข้อผิดพลาดในการบันทึกข้อมูล' });
  }
}

function onEdit(row: FundChartRow) {
  if (row.referencedInCourse) {
    return;
  }
  editingId.value = row.id;
  form.value = {
    division: userFacId.value,
    code: row.code,
    name: row.name,
    active: row.active,
  };
  void nextTick(() => {
    codeInputRef.value?.resetValidation();
    nameInputRef.value?.resetValidation();
  });
}

function onDelete(row: FundChartRow) {
  if (row.referencedInCourse) {
    return;
  }
  pendingDeleteRow.value = row;
  confirmDeleteOpen.value = true;
}

async function confirmDelete() {
  if (!pendingDeleteRow.value) return;
  const row = pendingDeleteRow.value;
  pendingDeleteRow.value = null;

  try {
    await api.delete(`/api/lltcostplan/${row.backendId}`);
    if (editingId.value === row.id) {
      resetForm();
    }
    $q.notify({ type: 'positive', message: 'ลบรายการแล้ว' });
    await fetchRows();
  } catch (err) {
    console.error('Error deleting costplan:', err);
    $q.notify({ type: 'negative', message: 'เกิดข้อผิดพลาดในการลบข้อมูล' });
  }
}
</script>

<style scoped lang="scss">
.finance-sof-page {
  padding-bottom: 48px;
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

.sof-rows-select {
  :deep(.q-field__control) {
    min-height: 40px;
  }
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
</style>
