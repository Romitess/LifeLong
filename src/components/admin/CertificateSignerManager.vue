<template>
  <div class="signer-manager">
    <AppSurfaceCard
      eyebrow="Certificate Signer"
      title="ผู้เซ็น Certificate"
      subtitle="จัดการรายชื่อผู้ลงนามบนวุฒิบัตร พร้อมตำแหน่งและลายเซ็น"
      body-padding="none"
    >
      <template #header-actions>
        <AppActionButton
          variant="primary"
          icon="add"
          label="เพิ่มผู้เซ็น Certificate"
          class="signer-manager__add-btn"
          @click="openAddDialog"
        />
      </template>

      <div class="signer-manager__toolbar">
        <AppSearchInput
          v-model="globalSearch"
          placeholder="ค้นหาชื่อหรือตำแหน่ง..."
          class="signer-manager__search"
          @update:model-value="onSearchChange"
          @clear="clearSearch"
        />
      </div>

      <q-banner v-if="error" rounded dense class="bg-negative text-white q-ma-md">
        {{ error }}
      </q-banner>

      <BaseTable
        :columns="tableColumns"
        :rows="items"
        row-key="id"
        :loading="isLoading"
        :rows-per-page="rowsPerPage"
        :row-height="96"
        :header-height="57"
        min-width="780px"
        show-index
        :index-offset="(pagination.page - 1) * pagination.pageSize"
        :page="pagination.page"
        :total-pages="pagination.totalPages"
        :on-page-change="load"
        show-rows-per-page
        :on-rows-per-page-change="onRowsPerPageChange"
        :empty-text="
          globalSearch ? 'ไม่พบผู้เซ็นที่ตรงกับการค้นหา' : 'ยังไม่มีผู้เซ็น Certificate ในระบบ'
        "
      >
        <template #cell-name="{ row }">
          <span class="signer-cell__name">{{ row.name }}</span>
        </template>

        <template #cell-position="{ row }">
          <span class="signer-cell__position">{{ row.position }}</span>
        </template>

        <template #cell-status="{ row }">
          <BaseStatusBadge :active="row.status === 'Y'" />
        </template>

        <template #skeleton-status>
          <q-skeleton type="QChip" width="60px" class="q-mx-auto" />
        </template>

        <template #cell-preview="{ row }">
          <div v-if="row.url || row.path" class="signer-cell__thumb-wrap" @click="openPreview(row)">
            <ImageDisplay
              :image-path="row.url || row.path"
              :alt="row.name"
              width="100px"
              height="60px"
              object-fit="contain"
              border-radius="6px"
            />
          </div>
          <span v-else class="signer-cell__no-file">-</span>
        </template>

        <template #skeleton-preview>
          <q-skeleton
            type="rect"
            width="100px"
            height="60px"
            class="q-mx-auto signer-cell__thumb"
          />
        </template>

        <template #cell-actions="{ row }">
          <div class="signer-cell__actions">
            <AppIconButton
              icon="edit"
              size="sm"
              tone="edit"
              class="signer-action-btn signer-action-btn--edit"
              aria-label="แก้ไข"
              @click="openEditDialog(row)"
            >
              <q-tooltip>แก้ไข</q-tooltip>
            </AppIconButton>
            <AppIconButton
              icon="delete"
              size="sm"
              tone="delete"
              class="signer-action-btn signer-action-btn--delete"
              aria-label="ลบ"
              @click="askDelete(row)"
            >
              <q-tooltip>ลบ</q-tooltip>
            </AppIconButton>
          </div>
        </template>

        <template #skeleton-actions>
          <div class="signer-cell__actions">
            <q-skeleton type="QBtn" width="34px" height="34px" />
            <q-skeleton type="QBtn" width="34px" height="34px" />
          </div>
        </template>
      </BaseTable>
    </AppSurfaceCard>

    <!-- Add / Edit Dialog -->
    <AppDialog
      v-model="dialogOpen"
      icon="draw"
      :title="dialogMode === 'add' ? 'เพิ่มผู้เซ็น Certificate' : 'แก้ไขผู้เซ็น Certificate'"
      card-class="signer-manager-dialog__card"
      body-class="signer-manager-dialog__body"
      actions-class="signer-manager-dialog__actions"
      @hide="handleDialogHide"
    >
      <div class="signer-manager-dialog__field">
        <div class="signer-manager-dialog__label">
          ชื่อผู้เซ็น <span class="text-negative">*</span>
        </div>
        <BaseInput
          v-model="form.name"
          outlined
          dense
          placeholder="ระบุชื่อ-นามสกุลผู้เซ็น"
          :error="nameError"
          :error-message="nameError ? 'กรุณากรอกชื่อผู้เซ็น' : ''"
          @update:model-value="nameError = false"
        />
      </div>

      <div class="signer-manager-dialog__field">
        <div class="signer-manager-dialog__label">ตำแหน่ง <span class="text-negative">*</span></div>
        <BaseInput
          v-model="form.position"
          outlined
          dense
          placeholder="ระบุตำแหน่ง"
          :error="positionError"
          :error-message="positionError ? 'กรุณากรอกตำแหน่ง' : ''"
          @update:model-value="positionError = false"
        />
      </div>

      <div class="signer-manager-dialog__field">
        <div class="signer-manager-dialog__label">ลายเซ็น</div>

        <!-- Existing file section (edit mode only) -->
        <div
          v-if="dialogMode === 'edit' && existingFile && !pendingDeleteFile"
          class="signer-manager-dialog__existing-file"
        >
          <div class="signer-manager-dialog__existing-thumb">
            <ImageDisplay
              :image-path="existingFile.imagePath"
              :alt="existingFile.filename ?? ''"
              width="72px"
              height="48px"
              object-fit="contain"
              border-radius="0"
            />
          </div>
          <div class="signer-manager-dialog__existing-info">
            <a
              :href="existingFile.url"
              class="signer-manager-dialog__filename-link"
              @click.prevent="downloadExistingFile"
            >
              <q-icon name="download" size="14px" />
              {{ existingFile.filename ?? 'ดาวน์โหลดไฟล์' }}
            </a>
            <span v-if="existingFile.imgSize" class="signer-manager-dialog__file-size">
              {{ existingFile.imgSize }}
            </span>
          </div>
          <AppIconButton
            icon="close"
            size="sm"
            tone="delete"
            class="signer-manager-dialog__delete-file-btn"
            @click="pendingDeleteFile = true"
          >
            <q-tooltip>ลบไฟล์</q-tooltip>
          </AppIconButton>
        </div>

        <!-- New file upload input -->
        <div
          v-if="!existingFile || pendingDeleteFile || dialogMode === 'add'"
          class="signer-manager-dialog__upload-area"
        >
          <div
            class="signer-manager-dialog__drop-zone"
            :class="{ 'signer-manager-dialog__drop-zone--has-file': form.file }"
            @dragover.prevent
            @drop.prevent="onFileDrop"
          >
            <template v-if="form.file">
              <img :src="filePreviewUrl" alt="preview" class="signer-manager-dialog__preview-img" />
              <div class="signer-manager-dialog__preview-info">
                <span class="signer-manager-dialog__preview-name">{{ form.file.name }}</span>
                <span class="signer-manager-dialog__preview-size">{{
                  formatFileSize(form.file.size)
                }}</span>
              </div>
              <AppIconButton
                icon="close"
                size="sm"
                class="signer-manager-dialog__clear-file"
                @click="clearFile"
              />
            </template>
            <template v-else>
              <q-icon name="cloud_upload" size="36px" color="grey-4" />
              <p class="signer-manager-dialog__drop-hint">ลากไฟล์มาวางที่นี่ หรือ</p>
              <label class="signer-manager-dialog__browse-label">
                เลือกไฟล์
                <input
                  ref="fileInputRef"
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  class="signer-manager-dialog__file-input"
                  @change="onFileSelect"
                />
              </label>
              <p class="signer-manager-dialog__file-hint">JPG, JPEG, PNG · ขนาดไม่เกิน 2 MB</p>
            </template>
          </div>
          <p v-if="fileError" class="signer-manager-dialog__file-error">{{ fileError }}</p>
        </div>
      </div>

      <div class="signer-manager-dialog__field signer-manager-dialog__field--status">
        <div class="signer-manager-dialog__label">สถานะ</div>
        <div class="signer-manager-dialog__status-row">
          <BaseToggle v-model="form.statusOn" color="positive" keep-color />
          <span
            :class="form.statusOn ? 'text-positive' : 'text-grey-6'"
            class="signer-manager-dialog__status-label"
          >
            {{ form.statusOn ? 'เปิด' : 'ปิด' }}
          </span>
        </div>
      </div>

      <template #actions>
        <AppActionButton
          variant="secondary"
          label="ยกเลิก"
          class="signer-manager-dialog__cancel-btn"
          @click="closeDialog"
        />
        <AppActionButton
          variant="primary"
          icon="save"
          label="บันทึก"
          :loading="isSaving"
          class="signer-manager-dialog__save-btn"
          @click="saveDialog"
        />
      </template>
    </AppDialog>

    <!-- Image Preview Dialog -->
    <AppDialog
      v-model="previewOpen"
      transition-show="fade"
      transition-hide="fade"
      :title="previewItem?.name ?? ''"
      :subtitle="previewItem?.position ?? ''"
      card-class="signer-manager-preview-card"
    >
      <ImageDisplay
        v-if="previewItem?.url || previewItem?.path"
        :image-path="previewItem.url || previewItem.path"
        :alt="previewItem.name"
        width="100%"
        height="auto"
        object-fit="contain"
        class="signer-manager-preview-card__img"
      />
    </AppDialog>

    <AppConfirmDialog
      v-model="confirmDeleteOpen"
      title="ลบผู้เซ็น Certificate"
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
import { onMounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import AppIconButton from 'components/common/AppIconButton.vue';
import AppDialog from 'components/common/AppDialog.vue';
import AppActionButton from 'components/common/AppActionButton.vue';
import AppConfirmDialog from 'components/common/AppConfirmDialog.vue';
import AppSearchInput from 'components/common/AppSearchInput.vue';
import AppSurfaceCard from 'components/common/AppSurfaceCard.vue';
import BaseInput from 'components/base/BaseInput.vue';
import BaseTable, { type BaseTableColumn } from 'components/base/BaseTable.vue';
import BaseStatusBadge from 'components/base/BaseStatusBadge.vue';
import BaseToggle from 'components/base/BaseToggle.vue';
import ImageDisplay from 'components/base/image-display.vue';
import { api } from 'src/boot/axios';
import { useAdminCertSigners } from 'src/composables/use-admin-cert-signers';
import { getImageUrl } from 'src/services/image.service';
import type { AdminCertSignerItem } from 'src/types/admin-cert-signers';

const $q = useQuasar();
const { items, pagination, isLoading, error, fetchData, createSigner, updateSigner, removeSigner } =
  useAdminCertSigners();

const globalSearch = ref('');

const rowsPerPage = ref(10);

const tableColumns: BaseTableColumn[] = [
  { key: 'name', label: 'ชื่อผู้เซ็น', width: 'auto', sortable: true },
  { key: 'position', label: 'ตำแหน่ง', width: '200px', sortable: true },
  { key: 'status', label: 'สถานะ', align: 'center', width: '90px', sortable: true },
  { key: 'preview', label: 'ลายเซ็น', align: 'center', width: '160px' },
  { key: 'actions', label: 'ดำเนินการ', align: 'center', width: '110px' },
];

// ——— Dialog state ———
const dialogOpen = ref(false);
const dialogMode = ref<'add' | 'edit'>('add');
const editingId = ref<number | null>(null);
const isSaving = ref(false);

interface ExistingFile {
  url: string;
  imagePath: string;
  filename?: string;
  imgSize?: string;
}

const existingFile = ref<ExistingFile | null>(null);
const pendingDeleteFile = ref(false);

const form = ref({
  name: '',
  position: '',
  statusOn: true,
  file: null as File | null,
});

const nameError = ref(false);
const positionError = ref(false);
const fileError = ref('');
const fileInputRef = ref<HTMLInputElement | null>(null);
const filePreviewUrl = ref('');

// ——— Preview dialog ———
const previewOpen = ref(false);
const previewItem = ref<AdminCertSignerItem | null>(null);

// ——— Delete dialog ———
const confirmDeleteOpen = ref(false);
const pendingDeleteId = ref<number | null>(null);
const pendingDeleteName = ref('');

onMounted(() => {
  void load();
});

async function load(page = 1): Promise<void> {
  try {
    await fetchData({ page, pageSize: rowsPerPage.value, search: globalSearch.value || null });
  } catch {
    $q.notify({ type: 'negative', message: 'ไม่สามารถโหลดข้อมูลได้', position: 'top' });
  }
}

async function onRowsPerPageChange(newSize: number): Promise<void> {
  rowsPerPage.value = newSize;
  await load(1);
}

async function onSearchChange(): Promise<void> {
  await load(1);
}

function clearSearch(): void {
  globalSearch.value = '';
  void load(1);
}

function openAddDialog(): void {
  dialogMode.value = 'add';
  editingId.value = null;
  existingFile.value = null;
  pendingDeleteFile.value = false;
  form.value = { name: '', position: '', statusOn: true, file: null };
  nameError.value = false;
  positionError.value = false;
  fileError.value = '';
  filePreviewUrl.value = '';
  dialogOpen.value = true;
}

function openEditDialog(item: AdminCertSignerItem): void {
  dialogMode.value = 'edit';
  editingId.value = item.id;
  pendingDeleteFile.value = false;
  existingFile.value =
    item.url || item.path
      ? {
          url: getImageUrl(item.url || item.path),
          imagePath: item.url || item.path || '',
          ...(item.filename ? { filename: item.filename } : {}),
          ...(item.imgSize ? { imgSize: item.imgSize } : {}),
        }
      : null;
  form.value = {
    name: item.name,
    position: item.position,
    statusOn: item.status === 'Y',
    file: null,
  };
  nameError.value = false;
  positionError.value = false;
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
    const response = await api.get<Blob>(existingFile.value.url, { responseType: 'blob' });
    const objectUrl = URL.createObjectURL(response.data);
    const link = document.createElement('a');
    link.href = objectUrl;
    link.download = existingFile.value.filename ?? 'signer-signature';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  } catch {
    // no fallback: protected URLs require auth headers.
  }
}

async function saveDialog(): Promise<void> {
  nameError.value = !form.value.name.trim();
  positionError.value = !form.value.position.trim();
  if (nameError.value || positionError.value) return;

  isSaving.value = true;
  try {
    const fd = new FormData();
    fd.append('name', form.value.name.trim());
    fd.append('position', form.value.position.trim());
    fd.append('status', form.value.statusOn ? 'Y' : 'N');
    if (form.value.file) {
      fd.append('file', form.value.file);
    }

    if (dialogMode.value === 'add') {
      const created = await createSigner(fd);
      items.value = [created, ...items.value];
      pagination.value = { ...pagination.value, total: pagination.value.total + 1 };
      $q.notify({
        type: 'positive',
        message: 'เพิ่มผู้เซ็น Certificate เรียบร้อย',
        position: 'top',
      });
    } else {
      if (pendingDeleteFile.value && !form.value.file) {
        fd.append('deleteFile', 'true');
      }
      const updated = await updateSigner(editingId.value!, fd);
      const idx = items.value.findIndex((i) => i.id === editingId.value);
      if (idx !== -1) items.value[idx] = updated;
      $q.notify({ type: 'positive', message: 'บันทึกการแก้ไขเรียบร้อย', position: 'top' });
    }

    closeDialog();
    await load(pagination.value.page);
  } catch {
    $q.notify({ type: 'negative', message: 'บันทึกไม่สำเร็จ กรุณาลองใหม่', position: 'top' });
  } finally {
    isSaving.value = false;
  }
}

function openPreview(item: AdminCertSignerItem): void {
  previewItem.value = item;
  previewOpen.value = true;
}

function askDelete(item: AdminCertSignerItem): void {
  pendingDeleteId.value = item.id;
  pendingDeleteName.value = item.name;
  confirmDeleteOpen.value = true;
}

async function confirmDelete(): Promise<void> {
  if (pendingDeleteId.value === null) return;
  const id = pendingDeleteId.value;
  pendingDeleteId.value = null;
  try {
    await removeSigner(id);
    $q.notify({ type: 'positive', message: 'ลบผู้เซ็น Certificate เรียบร้อย', position: 'top' });
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
.signer-manager__add-btn {
  min-width: 210px;
  border-radius: 10px;
  font-weight: 700;
  font-size: 0.84rem;
}

.signer-manager__toolbar {
  padding: 16px 24px 12px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.08);
}

.signer-manager__search {
  width: min(380px, 100%);
}

.signer-cell__name {
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

.signer-cell__position {
  color: #475467;
  font-size: 0.85rem;
}

.signer-cell__thumb-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 60px;
  margin: 0 auto;
  cursor: pointer;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 6px;
  overflow: hidden;
  transition: box-shadow 0.18s ease;

  &:hover {
    box-shadow: 0 4px 14px rgba(15, 23, 42, 0.18);
  }
}

.signer-cell__thumb {
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

.signer-cell__no-file {
  color: #94a3b8;
  font-size: 0.88rem;
}

.signer-cell__actions {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.signer-action-btn {
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

.signer-action-btn--edit {
  --action-color: var(--admin-gold);
  --action-border: rgba(245, 166, 35, 0.28);
  --action-ring: rgba(245, 166, 35, 0.1);
}

.signer-action-btn--delete {
  --action-color: var(--admin-danger-ink);
  --action-border: rgba(225, 29, 72, 0.18);
  --action-ring: rgba(225, 29, 72, 0.08);
}

// ——— Dialog ———
.signer-manager-dialog__card {
  width: min(520px, calc(100vw - 32px));
  border-radius: 20px;
  overflow: hidden;
}

.signer-manager-dialog__header {
  padding: 20px 24px 16px;
}

.signer-manager-dialog__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.signer-manager-dialog__icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(67, 56, 202, 0.1);
  flex-shrink: 0;
}

.signer-manager-dialog__title {
  margin: 0;
  color: var(--admin-navy);
  font-size: 1.05rem;
  font-weight: 850;
}

.signer-manager-dialog__body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.signer-manager-dialog__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.signer-manager-dialog__label {
  color: #475467;
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.02em;
}

.signer-manager-dialog__field--status {
  flex-direction: column;
}

.signer-manager-dialog__status-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.signer-manager-dialog__status-label {
  font-weight: 700;
  font-size: 0.92rem;
}

// Existing file
.signer-manager-dialog__existing-file {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border: 1px solid rgba(15, 23, 42, 0.1);
  border-radius: 12px;
  background: #f8fafc;
}

.signer-manager-dialog__existing-thumb {
  flex-shrink: 0;
  width: 72px;
  height: 48px;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.1);
}

.signer-manager-dialog__thumb-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.signer-manager-dialog__existing-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.signer-manager-dialog__filename-link {
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

.signer-manager-dialog__file-size {
  color: #94a3b8;
  font-size: 0.75rem;
}

.signer-manager-dialog__delete-file-btn {
  flex-shrink: 0;
}

// Upload area
.signer-manager-dialog__upload-area {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.signer-manager-dialog__drop-zone {
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

  &.signer-manager-dialog__drop-zone--has-file {
    padding: 16px;
    flex-direction: row;
    align-items: center;
    gap: 12px;
    border-style: solid;
    border-color: rgba(37, 99, 235, 0.3);
    background: rgba(37, 99, 235, 0.04);
  }
}

.signer-manager-dialog__drop-hint {
  margin: 0;
  color: #64748b;
  font-size: 0.82rem;
}

.signer-manager-dialog__browse-label {
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

.signer-manager-dialog__file-input {
  display: none;
}

.signer-manager-dialog__file-hint {
  margin: 0;
  color: #94a3b8;
  font-size: 0.75rem;
}

.signer-manager-dialog__file-error {
  margin: 0;
  color: #e11d48;
  font-size: 0.78rem;
}

.signer-manager-dialog__preview-img {
  max-width: 80px;
  max-height: 60px;
  border-radius: 6px;
  object-fit: contain;
  flex-shrink: 0;
}

.signer-manager-dialog__preview-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.signer-manager-dialog__preview-name {
  color: var(--admin-navy);
  font-size: 0.82rem;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.signer-manager-dialog__preview-size {
  color: #94a3b8;
  font-size: 0.75rem;
}

.signer-manager-dialog__clear-file {
  flex-shrink: 0;
}

.signer-manager-dialog__actions {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 0 24px 24px;
}

.signer-manager-dialog__cancel-btn,
.signer-manager-dialog__save-btn {
  width: 100%;
  border-radius: 10px;
  font-weight: 700;
  min-height: 42px;
}

// Image preview dialog
.signer-manager-preview-card {
  max-width: min(600px, calc(100vw - 32px));
  border-radius: 16px;
}

.signer-manager-preview-card__img {
  display: block;
  max-width: 100%;
  max-height: 60vh;
  margin: 0 auto;
  border-radius: 8px;
  object-fit: contain;
}
</style>
