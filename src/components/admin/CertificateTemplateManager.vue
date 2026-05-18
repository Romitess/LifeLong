<template>
  <div class="cert-manager">
    <AdminSurfaceCard
      eyebrow="Certificate Templates"
      title="รูปแบบ Certificate"
      subtitle="จัดการเทมเพลตวุฒิบัตรสำหรับใช้งานในระบบ"
      body-padding="none"
    >
      <template #header-actions>
        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="add"
          label="เพิ่มรูปแบบ Certificate"
          class="cert-manager__add-btn"
          @click="openAddDialog"
        />
      </template>

      <div class="cert-manager__toolbar">
        <q-input
          v-model="globalSearch"
          outlined
          dense
          debounce="300"
          placeholder="ค้นหาชื่อรูปแบบ..."
          class="cert-manager__search"
          @update:model-value="onSearchChange"
        >
          <template #prepend><q-icon name="search" /></template>
          <template v-if="globalSearch" #append>
            <q-icon name="close" class="cursor-pointer" @click="clearSearch" />
          </template>
        </q-input>
      </div>

      <q-banner v-if="error" rounded dense class="bg-negative text-white q-ma-md">
        {{ error }}
      </q-banner>

      <div
        :class="[
          'cert-manager__table-wrap',
          { 'cert-manager__table-wrap--loading': isLoading && items.length > 0 },
        ]"
      >
        <table class="cert-manager-table">
          <colgroup>
            <col class="cert-manager-table__col-index" />
            <col class="cert-manager-table__col-name" />
            <col class="cert-manager-table__col-status" />
            <col class="cert-manager-table__col-preview" />
            <col class="cert-manager-table__col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th class="cert-manager-table__index">ลำดับ</th>
              <th>ชื่อรูปแบบ</th>
              <th class="text-center">สถานะ</th>
              <th class="text-center">ตัวอย่าง</th>
              <th class="text-center">ดำเนินการ</th>
            </tr>
          </thead>
          <tbody>
            <template v-if="isLoading && items.length === 0">
              <tr
                v-for="n in rowsPerPage"
                :key="`sk-${n}`"
                class="cert-manager-table__skeleton-row"
              >
                <td class="cert-manager-table__index">
                  <q-skeleton type="text" width="24px" class="q-mx-auto" />
                </td>
                <td><q-skeleton type="text" width="70%" /></td>
                <td class="text-center">
                  <q-skeleton type="QChip" width="60px" class="q-mx-auto" />
                </td>
                <td class="text-center">
                  <q-skeleton
                    type="rect"
                    width="100px"
                    height="60px"
                    class="q-mx-auto cert-manager-table__thumb-skeleton"
                  />
                </td>
                <td class="text-center">
                  <div class="cert-manager-table__actions-cell">
                    <q-skeleton type="QBtn" width="34px" height="34px" />
                    <q-skeleton type="QBtn" width="34px" height="34px" />
                  </div>
                </td>
              </tr>
            </template>

            <template v-else-if="items.length > 0 || isLoading">
              <tr v-for="(item, index) in items" :key="item.id" class="cert-manager-table__row">
                <td class="cert-manager-table__index">
                  {{ (pagination.page - 1) * pagination.pageSize + index + 1 }}
                </td>
                <td>
                  <span class="cert-manager-table__name">{{ item.name }}</span>
                </td>
                <td class="text-center">
                  <q-badge
                    rounded
                    :color="item.status === 'Y' ? 'positive' : 'grey-5'"
                    :label="item.status === 'Y' ? 'เปิด' : 'ปิด'"
                    class="cert-manager-table__status-badge"
                  />
                </td>
                <td class="text-center">
                  <div v-if="item.url" class="cert-manager-table__thumb-wrap">
                    <img
                      :src="item.url"
                      :alt="item.name"
                      class="cert-manager-table__thumb"
                      width="100"
                      height="60"
                      loading="lazy"
                      decoding="async"
                      @click="openPreview(item)"
                    />
                  </div>
                  <span v-else class="cert-manager-table__no-file">-</span>
                </td>
                <td class="text-center">
                  <div class="cert-manager-table__actions-cell">
                    <q-btn
                      dense
                      round
                      unelevated
                      icon="edit"
                      size="sm"
                      class="cert-manager-action-btn cert-manager-action-btn--edit"
                      aria-label="แก้ไข"
                      @click="openEditDialog(item)"
                    >
                      <q-tooltip>แก้ไข</q-tooltip>
                    </q-btn>
                    <q-btn
                      dense
                      round
                      unelevated
                      icon="delete"
                      size="sm"
                      class="cert-manager-action-btn cert-manager-action-btn--delete"
                      aria-label="ลบ"
                      @click="askDelete(item)"
                    >
                      <q-tooltip>ลบ</q-tooltip>
                    </q-btn>
                  </div>
                </td>
              </tr>

              <tr v-if="fillerRowHeight > 0" class="cert-manager-table__filler-row">
                <td colspan="5" :style="{ height: `${fillerRowHeight}px` }" />
              </tr>
            </template>

            <tr v-else>
              <td colspan="5" class="cert-manager-table__empty">
                {{
                  globalSearch
                    ? 'ไม่พบรูปแบบที่ตรงกับการค้นหา'
                    : 'ยังไม่มีรูปแบบ Certificate ในระบบ'
                }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="pagination.totalPages > 1" ref="paginationRef" class="cert-manager__pagination">
        <BasePagination
          :model-value="currentPage"
          :max="pagination.totalPages"
          :max-pages="7"
          :disable="isLoading"
          gutter="md"
          @update:model-value="handlePageChange"
        />
      </div>
    </AdminSurfaceCard>

    <!-- Add / Edit Dialog -->
    <q-dialog
      v-model="dialogOpen"
      class="cert-manager-dialog"
      transition-show="scale"
      transition-hide="scale"
      @hide="handleDialogHide"
    >
      <q-card class="cert-manager-dialog__card">
        <q-card-section class="cert-manager-dialog__header">
          <div class="cert-manager-dialog__title-row">
            <div class="cert-manager-dialog__icon-wrap">
              <q-icon name="workspace_premium" size="24px" color="amber-8" />
            </div>
            <h2 class="cert-manager-dialog__title">
              {{ dialogMode === 'add' ? 'เพิ่มรูปแบบ Certificate' : 'แก้ไขรูปแบบ Certificate' }}
            </h2>
          </div>
        </q-card-section>

        <q-separator />

        <q-card-section class="cert-manager-dialog__body">
          <div class="cert-manager-dialog__field">
            <div class="cert-manager-dialog__label">
              ชื่อรูปแบบ Certificate <span class="text-negative">*</span>
            </div>
            <q-input
              v-model="form.name"
              outlined
              dense
              placeholder="ระบุชื่อรูปแบบ"
              :error="nameError"
              :error-message="nameError ? 'กรุณากรอกชื่อรูปแบบ' : ''"
              @update:model-value="nameError = false"
            />
          </div>

          <div class="cert-manager-dialog__field">
            <div class="cert-manager-dialog__label">รูปแบบ Certificate</div>

            <!-- Existing file section (edit mode only) -->
            <div
              v-if="dialogMode === 'edit' && existingFile && !pendingDeleteFile"
              class="cert-manager-dialog__existing-file"
            >
              <div class="cert-manager-dialog__existing-thumb">
                <img
                  :src="existingFile.url"
                  :alt="existingFile.filename ?? ''"
                  class="cert-manager-dialog__thumb-img"
                  width="72"
                  height="48"
                  decoding="async"
                />
              </div>
              <div class="cert-manager-dialog__existing-info">
                <a
                  :href="existingFile.url"
                  class="cert-manager-dialog__filename-link"
                  @click.prevent="downloadExistingFile"
                >
                  <q-icon name="download" size="14px" />
                  {{ existingFile.filename ?? 'ดาวน์โหลดไฟล์' }}
                </a>
                <span v-if="existingFile.imgSize" class="cert-manager-dialog__file-size">
                  {{ existingFile.imgSize }}
                </span>
              </div>
              <q-btn
                flat
                round
                dense
                icon="close"
                color="negative"
                size="sm"
                class="cert-manager-dialog__delete-file-btn"
                @click="pendingDeleteFile = true"
              >
                <q-tooltip>ลบไฟล์</q-tooltip>
              </q-btn>
            </div>

            <!-- New file upload input -->
            <div
              v-if="!existingFile || pendingDeleteFile || dialogMode === 'add'"
              class="cert-manager-dialog__upload-area"
            >
              <div
                class="cert-manager-dialog__drop-zone"
                :class="{ 'cert-manager-dialog__drop-zone--has-file': form.file }"
                @dragover.prevent
                @drop.prevent="onFileDrop"
              >
                <template v-if="form.file">
                  <img
                    :src="filePreviewUrl"
                    alt="preview"
                    class="cert-manager-dialog__preview-img"
                  />
                  <div class="cert-manager-dialog__preview-info">
                    <span class="cert-manager-dialog__preview-name">{{ form.file.name }}</span>
                    <span class="cert-manager-dialog__preview-size">{{
                      formatFileSize(form.file.size)
                    }}</span>
                  </div>
                  <q-btn
                    flat
                    round
                    dense
                    icon="close"
                    size="sm"
                    color="grey-7"
                    class="cert-manager-dialog__clear-file"
                    @click="clearFile"
                  />
                </template>
                <template v-else>
                  <q-icon name="cloud_upload" size="36px" color="grey-4" />
                  <p class="cert-manager-dialog__drop-hint">ลากไฟล์มาวางที่นี่ หรือ</p>
                  <label class="cert-manager-dialog__browse-label">
                    เลือกไฟล์
                    <input
                      ref="fileInputRef"
                      type="file"
                      accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                      class="cert-manager-dialog__file-input"
                      @change="onFileSelect"
                    />
                  </label>
                  <p class="cert-manager-dialog__file-hint">JPG, JPEG, PNG · ขนาดไม่เกิน 2 MB</p>
                </template>
              </div>
              <p v-if="fileError" class="cert-manager-dialog__file-error">{{ fileError }}</p>
            </div>
          </div>

          <div class="cert-manager-dialog__field cert-manager-dialog__field--status">
            <div class="cert-manager-dialog__label">สถานะ</div>
            <div class="cert-manager-dialog__status-row">
              <q-toggle v-model="form.statusOn" color="positive" keep-color />
              <span
                :class="form.statusOn ? 'text-positive' : 'text-grey-6'"
                class="cert-manager-dialog__status-label"
              >
                {{ form.statusOn ? 'เปิด' : 'ปิด' }}
              </span>
            </div>
          </div>
        </q-card-section>

        <q-card-actions class="cert-manager-dialog__actions">
          <q-btn
            flat
            no-caps
            label="ยกเลิก"
            color="grey-7"
            class="cert-manager-dialog__cancel-btn"
            @click="closeDialog"
          />
          <q-btn
            unelevated
            no-caps
            color="primary"
            icon="save"
            label="บันทึก"
            :loading="isSaving"
            class="cert-manager-dialog__save-btn"
            @click="saveDialog"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Image Preview Dialog -->
    <q-dialog v-model="previewOpen" transition-show="fade" transition-hide="fade">
      <q-card class="cert-manager-preview-card">
        <q-card-section class="cert-manager-preview-card__header row items-center q-pb-none">
          <div class="text-h6 text-weight-bold" style="color: var(--admin-navy)">
            {{ previewItem?.name }}
          </div>
          <q-space />
          <q-btn flat round dense icon="close" @click="previewOpen = false" />
        </q-card-section>
        <q-card-section>
          <img
            v-if="previewItem?.url"
            :src="previewItem.url"
            :alt="previewItem.name"
            class="cert-manager-preview-card__img"
          />
        </q-card-section>
      </q-card>
    </q-dialog>

    <AdminConfirmDialog
      v-model="confirmDeleteOpen"
      title="ลบรูปแบบ Certificate"
      :message="`ต้องการลบ &quot;${pendingDeleteName}&quot; ใช่หรือไม่ การดำเนินการนี้ไม่สามารถย้อนกลับได้`"
      confirm-label="ลบ"
      cancel-label="ยกเลิก"
      confirm-color="negative"
      icon-color="negative"
      @confirm="confirmDelete"
      @cancel="pendingDeleteId = null"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import AdminConfirmDialog from 'components/admin/AdminConfirmDialog.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import BasePagination from 'components/base/BasePagination.vue';
import { useAdminCertTemplates } from 'src/composables/use-admin-cert-templates';
import type { AdminCertTemplateItem } from 'src/types/admin-cert-templates';

const $q = useQuasar();
const {
  items,
  pagination,
  isLoading,
  error,
  fetchData,
  createTemplate,
  updateTemplate,
  removeTemplate,
} = useAdminCertTemplates();

const globalSearch = ref('');
const currentPage = ref(1);
const paginationRef = ref<HTMLElement | null>(null);

const rowsPerPage = 10;
const tableRowHeight = 96;
const tableHeaderHeight = 57;
const tableViewportHeight = `${rowsPerPage * tableRowHeight + tableHeaderHeight}px`;

const fillerRowHeight = computed(() =>
  Math.max(0, (rowsPerPage - items.value.length) * tableRowHeight),
);

// ——— Dialog state ———
const dialogOpen = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const editingId = ref<number | null>(null);
const isSaving = ref(false);

interface ExistingFile {
  url: string;
  filename?: string;
  imgSize?: string;
}

const existingFile = ref<ExistingFile | null>(null);
const pendingDeleteFile = ref(false);

const form = ref({
  name: '',
  statusOn: true,
  file: null as File | null,
});

const nameError = ref(false);
const fileError = ref('');
const fileInputRef = ref<HTMLInputElement | null>(null);
const filePreviewUrl = ref('');

// ——— Preview dialog ———
const previewOpen = ref(false);
const previewItem = ref<AdminCertTemplateItem | null>(null);

// ——— Delete dialog ———
const confirmDeleteOpen = ref(false);
const pendingDeleteId = ref<number | null>(null);
const pendingDeleteName = ref('');

async function preservePaginationPosition(update: () => Promise<void> | void): Promise<void> {
  const anchorTop =
    typeof window !== 'undefined' ? paginationRef.value?.getBoundingClientRect().top : undefined;
  await update();
  await nextTick();
  if (typeof window === 'undefined' || anchorTop === undefined || !paginationRef.value) return;
  const nextTop = paginationRef.value.getBoundingClientRect().top;
  if (Math.abs(nextTop - anchorTop) < 1) return;
  window.scrollBy({ top: nextTop - anchorTop, behavior: 'auto' });
}

onMounted(() => {
  void load();
});

async function load(page = 1): Promise<void> {
  try {
    await fetchData({ page, pageSize: rowsPerPage, search: globalSearch.value || null });
    currentPage.value = pagination.value.page;
  } catch {
    $q.notify({ type: 'negative', message: 'ไม่สามารถโหลดข้อมูลได้', position: 'top' });
  }
}

async function onSearchChange(): Promise<void> {
  await load(1);
}

function clearSearch(): void {
  globalSearch.value = '';
  void load(1);
}

async function handlePageChange(page: number): Promise<void> {
  if (page === currentPage.value && page === pagination.value.page) return;
  await preservePaginationPosition(async () => {
    currentPage.value = page;
    await load(page);
  });
}

function openAddDialog(): void {
  dialogMode.value = 'add';
  editingId.value = null;
  existingFile.value = null;
  pendingDeleteFile.value = false;
  form.value = { name: '', statusOn: true, file: null };
  nameError.value = false;
  fileError.value = '';
  filePreviewUrl.value = '';
  dialogOpen.value = true;
}

function openEditDialog(item: AdminCertTemplateItem): void {
  dialogMode.value = 'edit';
  editingId.value = item.id;
  pendingDeleteFile.value = false;
  existingFile.value = item.url
    ? {
        url: item.url,
        ...(item.filename ? { filename: item.filename } : {}),
        ...(item.imgSize ? { imgSize: item.imgSize } : {}),
      }
    : null;
  form.value = { name: item.name, statusOn: item.status === 'Y', file: null };
  nameError.value = false;
  fileError.value = '';
  filePreviewUrl.value = '';
  dialogOpen.value = true;
}

function closeDialog(): void {
  dialogOpen.value = false;
  revokePreview();
}

function handleDialogHide(): void {
  revokePreview();
}

function revokePreview(): void {
  if (filePreviewUrl.value) {
    URL.revokeObjectURL(filePreviewUrl.value);
    filePreviewUrl.value = '';
  }
}

function onFileSelect(e: Event): void {
  const input = e.target as HTMLInputElement;
  const file = input.files?.[0];
  if (!file) return;
  validateAndSetFile(file);
  input.value = '';
}

function onFileDrop(e: DragEvent): void {
  const file = e.dataTransfer?.files?.[0];
  if (!file) return;
  validateAndSetFile(file);
}

function validateAndSetFile(file: File): void {
  fileError.value = '';
  if (!['image/jpeg', 'image/png'].includes(file.type)) {
    fileError.value = 'รองรับเฉพาะไฟล์ JPG, JPEG, PNG เท่านั้น';
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    fileError.value = 'ขนาดไฟล์ต้องไม่เกิน 2 MB';
    return;
  }
  revokePreview();
  form.value.file = file;
  if (dialogMode.value === 'add' && !form.value.name.trim()) {
    form.value.name = file.name.replace(/\.[^.]+$/, '');
  }
  pendingDeleteFile.value = false;
  filePreviewUrl.value = URL.createObjectURL(file);
}

function clearFile(): void {
  revokePreview();
  form.value.file = null;
  fileError.value = '';
}

async function downloadExistingFile(): Promise<void> {
  if (!existingFile.value) return;

  try {
    const response = await fetch(existingFile.value.url);
    if (!response.ok) {
      throw new Error(`Download failed with status ${response.status}`);
    }

    const blob = await response.blob();
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = existingFile.value.filename ?? 'certificate-template';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  } catch {
    window.open(existingFile.value.url, '_blank', 'noopener,noreferrer');
  }
}

async function saveDialog(): Promise<void> {
  nameError.value = !form.value.name.trim();
  if (nameError.value) return;

  isSaving.value = true;
  try {
    const fd = new FormData();
    fd.append('name', form.value.name.trim());
    fd.append('status', form.value.statusOn ? 'Y' : 'N');
    if (form.value.file) {
      fd.append('file', form.value.file);
    }

    if (dialogMode.value === 'add') {
      const created = await createTemplate(fd);
      items.value = [created, ...items.value];
      pagination.value = { ...pagination.value, total: pagination.value.total + 1 };
      $q.notify({
        type: 'positive',
        message: 'เพิ่มรูปแบบ Certificate เรียบร้อย',
        position: 'top',
      });
    } else {
      if (pendingDeleteFile.value && !form.value.file) {
        fd.append('deleteFile', 'true');
      }
      const updated = await updateTemplate(editingId.value!, fd);
      const idx = items.value.findIndex((i) => i.id === editingId.value);
      if (idx !== -1) items.value[idx] = updated;
      $q.notify({ type: 'positive', message: 'บันทึกการแก้ไขเรียบร้อย', position: 'top' });
    }

    closeDialog();
    await load(currentPage.value);
  } catch {
    $q.notify({ type: 'negative', message: 'บันทึกไม่สำเร็จ กรุณาลองใหม่', position: 'top' });
  } finally {
    isSaving.value = false;
  }
}

function openPreview(item: AdminCertTemplateItem): void {
  previewItem.value = item;
  previewOpen.value = true;
}

function askDelete(item: AdminCertTemplateItem): void {
  pendingDeleteId.value = item.id;
  pendingDeleteName.value = item.name;
  confirmDeleteOpen.value = true;
}

async function confirmDelete(): Promise<void> {
  if (pendingDeleteId.value === null) return;
  const id = pendingDeleteId.value;
  pendingDeleteId.value = null;
  try {
    await removeTemplate(id);
    $q.notify({ type: 'positive', message: 'ลบรูปแบบ Certificate เรียบร้อย', position: 'top' });
    if (items.value.length === 0 && pagination.value.page > 1) {
      await load(pagination.value.page - 1);
    }
  } catch {
    $q.notify({ type: 'negative', message: 'ลบไม่สำเร็จ กรุณาลองใหม่', position: 'top' });
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
</script>

<style lang="scss" scoped>
.cert-manager {
  --cert-manager-row-height: v-bind('`${tableRowHeight}px`');
  --cert-manager-table-height: v-bind('tableViewportHeight');
}

.cert-manager__add-btn {
  min-width: 210px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.84rem;
}

.cert-manager__toolbar {
  padding: 16px 24px 12px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.cert-manager__search {
  width: min(380px, 100%);
}

.cert-manager__table-wrap {
  overflow-x: auto;
  min-height: var(--cert-manager-table-height);
}

.cert-manager__table-wrap--loading tbody {
  opacity: 0.45;
  pointer-events: none;
  transition: opacity 0.15s ease;
}

.cert-manager-table {
  width: 100%;
  min-width: 680px;
  border-collapse: collapse;

  th,
  td {
    padding: 14px 16px;
    border-bottom: 1px solid rgba(15, 23, 42, 0.08);
    vertical-align: middle;
  }

  thead th {
    background: #f8fafc;
    color: #475467;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    white-space: nowrap;
  }

  tbody tr.cert-manager-table__skeleton-row:hover,
  tbody tr.cert-manager-table__filler-row:hover {
    background: transparent;
  }

  tbody td {
    height: var(--cert-manager-row-height);
  }
}

.cert-manager-table__col-index {
  width: 64px;
}
.cert-manager-table__col-name {
  width: auto;
}
.cert-manager-table__col-status {
  width: 90px;
}
.cert-manager-table__col-preview {
  width: 160px;
}
.cert-manager-table__col-actions {
  width: 110px;
}

.cert-manager-table__index {
  color: #1d4ed8;
  font-weight: 800;
  text-align: center;
}

.cert-manager-table__row {
  background: #ffffff;
  &:hover {
    background: rgba(37, 99, 235, 0.03);
  }
}

.cert-manager-table__skeleton-row td {
  background: #ffffff;
}

.cert-manager-table__filler-row td {
  padding: 0 !important;
  border-bottom: 0 !important;
  background: transparent !important;
}

.cert-manager-table__empty {
  height: calc(var(--cert-manager-table-height) - 1px) !important;
  padding: 38px 18px !important;
  color: #64748b;
  text-align: center;
  vertical-align: middle !important;
}

.cert-manager-table__name {
  display: -webkit-box;
  overflow: hidden;
  color: var(--admin-navy);
  font-size: 0.8rem;
  font-weight: 800;
  line-height: 1.4;
  min-height: calc(1.4em * 2);
  word-break: break-word;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  line-clamp: 2;
}

.cert-manager-table__status-badge {
  font-size: 0.75rem;
  font-weight: 700;
  padding: 4px 10px;
}

.cert-manager-table__thumb-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 60px;
  margin: 0 auto;
}

.cert-manager-table__thumb {
  width: 100%;
  height: 100%;
  border-radius: 6px;
  object-fit: contain;
  border: 1px solid rgba(15, 23, 42, 0.1);
  cursor: pointer;
  transition: box-shadow 0.18s ease;

  &:hover {
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.18);
  }
}

.cert-manager-table__thumb-skeleton {
  border-radius: 6px;
}

.cert-manager-table__no-file {
  color: #94a3b8;
  font-size: 0.88rem;
}

.cert-manager-table__actions-cell {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.cert-manager__pagination {
  display: flex;
  justify-content: center;
  min-height: 72px;
  padding: 22px 24px 24px;
}

.cert-manager-action-btn {
  --action-color: var(--admin-info-ink);
  --action-border: rgba(16, 35, 63, 0.12);
  --action-ring: rgba(16, 35, 63, 0.08);
  width: 34px;
  height: 34px;
  min-height: 34px;
  background: #ffffff !important;
  color: var(--action-color) !important;
  border: 1px solid var(--action-border) !important;
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06) !important;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;

  :deep(.q-icon) {
    font-size: 17px;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow:
      0 8px 18px rgba(15, 23, 42, 0.12),
      0 0 0 1px var(--action-ring) !important;
  }
}

.cert-manager-action-btn--edit {
  --action-color: var(--admin-gold);
  --action-border: rgba(245, 166, 35, 0.28);
  --action-ring: rgba(245, 166, 35, 0.1);
}

.cert-manager-action-btn--delete {
  --action-color: var(--admin-danger-ink);
  --action-border: rgba(225, 29, 72, 0.18);
  --action-ring: rgba(225, 29, 72, 0.08);
}

// ——— Dialog ———
.cert-manager-dialog__card {
  width: min(520px, calc(100vw - 32px));
  border-radius: 20px;
  overflow: hidden;
}

.cert-manager-dialog__header {
  padding: 20px 24px 16px;
}

.cert-manager-dialog__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.cert-manager-dialog__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(245, 166, 35, 0.14);
  flex-shrink: 0;
}

.cert-manager-dialog__title {
  margin: 0;
  color: var(--admin-navy);
  font-size: 1.05rem;
  font-weight: 850;
}

.cert-manager-dialog__body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.cert-manager-dialog__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.cert-manager-dialog__label {
  color: #475467;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.cert-manager-dialog__field--status {
  flex-direction: column;
}

.cert-manager-dialog__status-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cert-manager-dialog__status-label {
  font-weight: 700;
  font-size: 0.92rem;
}

// Existing file
.cert-manager-dialog__existing-file {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
  background: #f8fafc;
}

.cert-manager-dialog__existing-thumb {
  flex-shrink: 0;
  width: 72px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.1);
}

.cert-manager-dialog__thumb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.cert-manager-dialog__existing-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.cert-manager-dialog__filename-link {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  color: #1d4ed8;
  font-size: 0.82rem;
  font-weight: 700;
  text-decoration: none;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  &:hover {
    text-decoration: underline;
  }
}

.cert-manager-dialog__file-size {
  color: #94a3b8;
  font-size: 0.75rem;
}

.cert-manager-dialog__delete-file-btn {
  flex-shrink: 0;
}

// Upload area
.cert-manager-dialog__upload-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.cert-manager-dialog__drop-zone {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 24px 16px;
  border: 2px dashed rgba(15, 23, 42, 0.16);
  border-radius: 12px;
  background: #fafbfc;
  min-height: 120px;
  transition: border-color 0.2s ease;

  &:hover {
    border-color: rgba(37, 99, 235, 0.4);
  }

  &.cert-manager-dialog__drop-zone--has-file {
    padding: 16px;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    border-style: solid;
    border-color: rgba(37, 99, 235, 0.3);
    background: rgba(37, 99, 235, 0.04);
  }
}

.cert-manager-dialog__drop-hint {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
}

.cert-manager-dialog__browse-label {
  display: inline-flex;
  align-items: center;
  padding: 6px 16px;
  border-radius: 8px;
  background: #1d4ed8;
  color: #ffffff;
  font-size: 0.82rem;
  font-weight: 700;
  cursor: pointer;
}

.cert-manager-dialog__file-input {
  display: none;
}

.cert-manager-dialog__file-hint {
  margin: 0;
  color: #94a3b8;
  font-size: 0.75rem;
}

.cert-manager-dialog__file-error {
  margin: 0;
  color: #e11d48;
  font-size: 0.78rem;
}

.cert-manager-dialog__preview-img {
  max-width: 80px;
  max-height: 60px;
  border-radius: 6px;
  object-fit: contain;
  flex-shrink: 0;
}

.cert-manager-dialog__preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.cert-manager-dialog__preview-name {
  color: var(--admin-navy);
  font-size: 0.82rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.cert-manager-dialog__preview-size {
  color: #94a3b8;
  font-size: 0.75rem;
}

.cert-manager-dialog__clear-file {
  flex-shrink: 0;
}

.cert-manager-dialog__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 24px 24px;
}

.cert-manager-dialog__cancel-btn,
.cert-manager-dialog__save-btn {
  width: 100%;
  border-radius: 10px;
  font-weight: 700;
  min-height: 42px;
}

// Image preview dialog
.cert-manager-preview-card {
  max-width: min(800px, calc(100vw - 32px));
  border-radius: 16px;
}

.cert-manager-preview-card__img {
  display: block;
  max-width: 100%;
  max-height: 70vh;
  margin: 0 auto;
  border-radius: 8px;
  object-fit: contain;
}
</style>
