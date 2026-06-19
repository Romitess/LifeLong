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
            <AppSearchInput
              v-model="tableSearch"
              :placeholder="$t('finance.sourceOfFunds.searchPlaceholder')"
              class="sof-search"
            />
          </div>
        </div>

        <BaseTable
          :columns="columns"
          :rows="paginatedRows"
          :page="pagination.page"
          :total-pages="Math.max(1, Math.ceil(filteredRows.length / pagination.rowsPerPage))"
          :rows-per-page="pagination.rowsPerPage"
          show-index
          show-rows-per-page
          height-mode="auto"
          @page-change="pagination.page = $event"
          @rows-per-page-change="
            pagination.rowsPerPage = $event;
            pagination.page = 1;
          "
        >
          <template #cell-active="{ row }">
            <q-badge
              rounded
              class="sof-status-badge"
              :color="row.active ? 'positive' : 'grey-6'"
              :label="
                row.active
                  ? $t('finance.sourceOfFunds.active')
                  : $t('finance.sourceOfFunds.inactive')
              "
            />
          </template>

          <template #cell-actions="{ row }">
            <div class="row no-wrap items-center q-gutter-xs justify-center">
              <q-btn
                flat
                round
                dense
                color="primary"
                icon="edit"
                :disable="row.referencedInCourse"
                @click="onEdit(row)"
              >
                <q-tooltip v-if="row.referencedInCourse">
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
                :disable="row.referencedInCourse"
                @click="onDelete(row)"
              >
                <q-tooltip v-if="row.referencedInCourse">
                  {{ $t('finance.sourceOfFunds.cannotDelete') }}
                </q-tooltip>
                <q-tooltip v-else>{{ $t('finance.sourceOfFunds.delete') }}</q-tooltip>
              </q-btn>
            </div>
          </template>
        </BaseTable>

        <div class="sof-footnote q-mt-md">
          <q-icon name="info" size="18px" class="q-mr-sm" />
          {{ $t('finance.sourceOfFunds.note') }}
        </div>
      </AppSurfaceCard>
    </section>

    <AppConfirmDialog
      v-model="confirmDeleteOpen"
      :title="$t('finance.sourceOfFunds.deleteConfirmTitle', 'ลบผังแหล่งเงิน')"
      :message="
        pendingDeleteRow
          ? $t('finance.sourceOfFunds.deleteConfirmMessage', {
              code: pendingDeleteRow.code,
              name: pendingDeleteRow.name,
            })
          : $t('finance.sourceOfFunds.deleteConfirmDefaultMessage', 'ต้องการลบรายการนี้ใช่หรือไม่?')
      "
      :confirm-label="$t('finance.sourceOfFunds.delete')"
      :cancel-label="$t('finance.sourceOfFunds.cancelEdit', 'ยกเลิก')"
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
import BaseTable from 'components/base/BaseTable.vue';
import type { BaseTableColumn } from 'components/base/BaseTable.vue';
import AppSearchInput from 'components/common/AppSearchInput.vue';
import { useQuasar, type QInput } from 'quasar';
import { computed, onMounted, ref, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { api } from 'boot/axios';
import { useAuthStore } from 'stores/auth-store';

const $q = useQuasar();
const { t } = useI18n();

const authStore = useAuthStore();
const currentUser = computed(() => authStore.user);
const userFacName = computed(() => currentUser.value?.facName || currentUser.value?.faculty || '');

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

const statusOptions = computed(() => [
  { label: t('finance.sourceOfFunds.active', 'เปิด'), value: true },
  { label: t('finance.sourceOfFunds.inactive', 'ปิด'), value: false },
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
  await fetchRows();
});

const tableSearch = ref('');

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

  // Implicitly filter by user's faculty if they belong to a specific faculty
  if (userFacName.value !== 'ไม่ระบุ' && userFacId.value) {
    list = list.filter((r) => r.facId === userFacId.value);
  }

  const q = tableSearch.value.trim().toLowerCase();
  if (q) {
    list = list.filter((r) => {
      const codeMatch = r.code.toLowerCase().includes(q);
      const nameMatch = r.name.toLowerCase().includes(q);
      const statusText = r.active
        ? t('finance.sourceOfFunds.active', 'เปิด').toLowerCase()
        : t('finance.sourceOfFunds.inactive', 'ปิด').toLowerCase();
      const statusMatch = statusText.includes(q);
      return codeMatch || nameMatch || statusMatch;
    });
  }

  return [...list].sort((a, b) => {
    const idA = a.backendId ?? 0;
    const idB = b.backendId ?? 0;
    return idB - idA;
  });
});

const paginatedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
  const end = start + pagination.value.rowsPerPage;
  return filteredRows.value.slice(start, end);
});

watch(tableSearch, () => {
  pagination.value.page = 1;
});

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

const columns = computed<BaseTableColumn[]>(() => [
  {
    key: 'division',
    label: t('finance.sourceOfFunds.faculty'),
    align: 'left',
    sortable: true,
  },
  {
    key: 'code',
    label: t('finance.sourceOfFunds.code'),
    align: 'left',
    sortable: true,
  },
  {
    key: 'name',
    label: t('finance.sourceOfFunds.name'),
    align: 'left',
    sortable: true,
  },
  {
    key: 'active',
    label: t('finance.sourceOfFunds.activeStatus'),
    align: 'center',
    sortable: true,
  },
  {
    key: 'actions',
    label: t('finance.sourceOfFunds.columnActions'),
    align: 'center',
    sortable: false,
    width: '120px',
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

    .sof-search {
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
