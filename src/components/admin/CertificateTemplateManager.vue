<template>
  <div class="cert-manager">
    <AppSurfaceCard
      eyebrow="Certificate Templates"
      title="รูปแบบ Certificate"
      subtitle="จัดการเทมเพลตวุฒิบัตรสำหรับใช้งานในระบบ"
      body-padding="none"
    >
      <template #header-actions>
        <AppActionButton
          variant="primary"
          icon="add"
          label="เพิ่มรูปแบบ Certificate"
          class="cert-manager__add-btn"
          @click="openAddDialog"
        />
      </template>

      <div class="cert-manager__toolbar">
        <AppSearchInput
          v-model="globalSearch"
          placeholder="ค้นหาชื่อรูปแบบ..."
          class="cert-manager__search"
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
        min-width="600px"
        show-index
        :index-offset="(pagination.page - 1) * pagination.pageSize"
        :page="pagination.page"
        :total-pages="pagination.totalPages"
        :on-page-change="load"
        :empty-text="
          globalSearch ? 'ไม่พบรูปแบบที่ตรงกับการค้นหา' : 'ยังไม่มีรูปแบบ Certificate ในระบบ'
        "
      >
        <template #cell-name="{ row }">
          <span class="cert-cell__name">{{ row.name }}</span>
        </template>

        <template #cell-status="{ row }">
          <BaseStatusBadge :active="row.status === 'Y'" />
        </template>
        <template #skeleton-status>
          <q-skeleton type="QChip" width="60px" class="q-mx-auto" />
        </template>

        <template #cell-preview="{ row }">
          <div v-if="itemBlobUrls[row.id]" class="cert-cell__thumb-wrap">
            <img
              :src="itemBlobUrls[row.id]"
              :alt="row.name"
              class="cert-cell__thumb"
              width="100"
              height="60"
              decoding="async"
              @click="openPreview(row)"
            />
          </div>
          <span v-else class="cert-cell__no-file">-</span>
        </template>
        <template #skeleton-preview>
          <q-skeleton type="rect" width="100px" height="60px" class="q-mx-auto cert-cell__thumb" />
        </template>

        <template #cell-actions="{ row }">
          <div class="cert-cell__actions">
            <AppIconButton
              icon="edit"
              size="sm"
              tone="edit"
              class="cert-action-btn cert-action-btn--edit"
              aria-label="แก้ไข"
              @click="openEditDialog(row)"
            >
              <q-tooltip>แก้ไข</q-tooltip>
            </AppIconButton>
            <AppIconButton
              icon="delete"
              size="sm"
              tone="delete"
              class="cert-action-btn cert-action-btn--delete"
              aria-label="ลบ"
              @click="askDelete(row)"
            >
              <q-tooltip>ลบ</q-tooltip>
            </AppIconButton>
          </div>
        </template>
        <template #skeleton-actions>
          <div class="cert-cell__actions">
            <q-skeleton type="QBtn" width="34px" height="34px" />
            <q-skeleton type="QBtn" width="34px" height="34px" />
          </div>
        </template>
      </BaseTable>
    </AppSurfaceCard>

    <!-- Add / Edit Dialog -->
    <AppDialog
      v-model="dialogOpen"
      icon="workspace_premium"
      :title="dialogMode === 'add' ? 'เพิ่มรูปแบบ Certificate' : 'แก้ไขรูปแบบ Certificate'"
      card-class="cert-manager-dialog__card"
      body-class="cert-manager-dialog__body"
      actions-class="cert-manager-dialog__actions"
      @hide="handleDialogHide"
    >
      <!-- Name -->
      <div class="cert-manager-dialog__field">
        <div class="cert-manager-dialog__label">
          ชื่อรูปแบบ Certificate <span class="text-negative">*</span>
        </div>
        <BaseInput
          v-model="form.name"
          outlined
          dense
          placeholder="ระบุชื่อรูปแบบ"
          :error="nameError"
          :error-message="nameError ? 'กรุณากรอกชื่อรูปแบบ' : ''"
          @update:model-value="nameError = false"
        />
      </div>

      <!-- File upload -->
      <div class="cert-manager-dialog__field">
        <div class="cert-manager-dialog__label">รูปพื้นหลัง Certificate (PNG)</div>

        <div
          v-if="dialogMode === 'edit' && existingFile && !pendingDeleteFile"
          class="cert-manager-dialog__existing-file"
        >
          <div class="cert-manager-dialog__existing-thumb">
            <img
              v-if="existingFileBlobUrl"
              :src="existingFileBlobUrl"
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
              ><q-icon name="download" size="14px" />{{
                existingFile.filename ?? 'ดาวน์โหลดไฟล์'
              }}</a
            >
            <span v-if="existingFile.imgSize" class="cert-manager-dialog__file-size">{{
              existingFile.imgSize
            }}</span>
          </div>
          <AppIconButton
            icon="close"
            size="sm"
            tone="delete"
            class="cert-manager-dialog__delete-file-btn"
            @click="pendingDeleteFile = true"
          >
            <q-tooltip>ลบไฟล์</q-tooltip>
          </AppIconButton>
        </div>

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
              <img :src="filePreviewUrl" alt="preview" class="cert-manager-dialog__preview-img" />
              <div class="cert-manager-dialog__preview-info">
                <span class="cert-manager-dialog__preview-name">{{ form.file.name }}</span>
                <span class="cert-manager-dialog__preview-size">{{
                  formatFileSize(form.file.size)
                }}</span>
              </div>
              <AppIconButton
                icon="close"
                size="sm"
                class="cert-manager-dialog__clear-file"
                @click="clearFile"
              />
            </template>
            <template v-else>
              <q-icon name="cloud_upload" size="36px" color="grey-4" />
              <p class="cert-manager-dialog__drop-hint">ลากไฟล์มาวางที่นี่ หรือ</p>
              <label class="cert-manager-dialog__browse-label"
                >เลือกไฟล์<input
                  ref="fileInputRef"
                  type="file"
                  accept=".jpg,.jpeg,.png,image/jpeg,image/png"
                  class="cert-manager-dialog__file-input"
                  @change="onFileSelect"
              /></label>
              <p class="cert-manager-dialog__file-hint">PNG, JPG · ขนาดไม่เกิน 2 MB</p>
            </template>
          </div>
          <p v-if="fileError" class="cert-manager-dialog__file-error">{{ fileError }}</p>
        </div>
      </div>

      <!-- Position Editor -->
      <div v-if="hasImage" class="cert-manager-dialog__field">
        <div class="cert-manager-dialog__label">
          กำหนดตำแหน่งข้อความ
          <AppActionButton
            variant="ghost"
            size="xs"
            icon="restart_alt"
            label="รีเซ็ต"
            class="q-ml-sm"
            @click="resetLayout"
          />
        </div>
        <div class="position-editor">
          <div
            ref="editorRef"
            class="position-editor__canvas"
            @mousemove="onEditorMouseMove"
            @mouseup="onEditorMouseUp"
            @mouseleave="onEditorMouseUp"
          >
            <img
              :src="editorImageSrc"
              alt="template preview"
              class="position-editor__img"
              draggable="false"
            />
            <div
              v-for="field in layoutFields"
              :key="field.key"
              class="position-editor__handle"
              :class="`position-editor__handle--${field.key}`"
              :style="{
                top: `${form.layout[field.key].top}%`,
                left: `${form.layout[field.key].left}%`,
              }"
              @mousedown.prevent="startDrag(field.key, $event)"
            >
              <span class="position-editor__handle-label">{{ field.label }}</span>
              <span class="position-editor__handle-sample" :style="getSampleStyle(field.key)">{{
                field.sample
              }}</span>
            </div>
          </div>
          <p class="position-editor__hint">
            <q-icon name="drag_indicator" size="14px" /> ลากข้อความเพื่อจัดตำแหน่ง
          </p>

          <!-- Field settings -->
          <div class="position-editor__fields">
            <div v-for="field in layoutFields" :key="field.key" class="position-editor__field-row">
              <span class="position-editor__field-name" :class="`text-${field.color}`">{{
                field.label
              }}</span>
              <div class="position-editor__field-controls">
                <BaseInput
                  v-model.number="form.layout[field.key].fontSize"
                  type="number"
                  outlined
                  dense
                  label="ขนาด"
                  suffix="px"
                  style="width: 80px"
                  :min="8"
                  :max="72"
                />
                <input
                  v-model="form.layout[field.key].color"
                  type="color"
                  class="position-editor__color-input"
                  :title="`สีของ ${field.label}`"
                />
                <AppSegmentedControl
                  v-model="form.layout[field.key].align"
                  :options="[
                    { value: 'left', icon: 'format_align_left' },
                    { value: 'center', icon: 'format_align_center' },
                    { value: 'right', icon: 'format_align_right' },
                  ]"
                  class="position-editor__align-toggle"
                />
                <BaseToggle v-model="form.layout[field.key].bold" dense size="sm" label="B" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Status -->
      <div class="cert-manager-dialog__field cert-manager-dialog__field--status">
        <div class="cert-manager-dialog__label">สถานะ</div>
        <div class="cert-manager-dialog__status-row">
          <BaseToggle v-model="form.statusOn" color="positive" keep-color />
          <span
            :class="form.statusOn ? 'text-positive' : 'text-grey-6'"
            class="cert-manager-dialog__status-label"
            >{{ form.statusOn ? 'เปิด' : 'ปิด' }}</span
          >
        </div>
      </div>

      <template #actions>
        <AppActionButton
          variant="secondary"
          label="ยกเลิก"
          class="cert-manager-dialog__cancel-btn"
          @click="closeDialog"
        />
        <AppActionButton
          variant="primary"
          icon="save"
          label="บันทึก"
          :loading="isSaving"
          class="cert-manager-dialog__save-btn"
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
      card-class="cert-manager-preview-card"
    >
      <img
        v-if="previewItem && itemBlobUrls[previewItem.id]"
        :src="itemBlobUrls[previewItem.id]"
        :alt="previewItem.name"
        class="cert-manager-preview-card__img"
      />
    </AppDialog>

    <AppConfirmDialog
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
import { computed, onMounted, onUnmounted, ref } from 'vue';
import { useQuasar } from 'quasar';
import AppIconButton from 'components/common/AppIconButton.vue';
import AppDialog from 'components/common/AppDialog.vue';
import AppSegmentedControl from 'components/common/AppSegmentedControl.vue';
import AppActionButton from 'components/common/AppActionButton.vue';
import AppConfirmDialog from 'components/common/AppConfirmDialog.vue';
import AppSearchInput from 'components/common/AppSearchInput.vue';
import AppSurfaceCard from 'components/common/AppSurfaceCard.vue';
import BaseInput from 'components/base/BaseInput.vue';
import BaseTable, { type BaseTableColumn } from 'components/base/BaseTable.vue';
import BaseStatusBadge from 'components/base/BaseStatusBadge.vue';
import BaseToggle from 'components/base/BaseToggle.vue';
import { useAdminCertTemplates } from 'src/composables/use-admin-cert-templates';
import { api } from 'src/boot/axios';
import type {
  AdminCertTemplateItem,
  CertLayout,
  CertLayoutField,
} from 'src/types/admin-cert-templates';
import { DEFAULT_LAYOUT } from 'src/types/admin-cert-templates';

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
const itemBlobUrls = ref<Record<number, string>>({});

const rowsPerPage = 10;

const tableColumns: BaseTableColumn[] = [
  { key: 'name', label: 'ชื่อรูปแบบ', width: 'auto' },
  { key: 'status', label: 'สถานะ', align: 'center', width: '90px' },
  { key: 'preview', label: 'ตัวอย่าง', align: 'center', width: '160px' },
  { key: 'actions', label: 'ดำเนินการ', align: 'center', width: '110px' },
];

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

function cloneLayout(src: CertLayout): CertLayout {
  return JSON.parse(JSON.stringify(src)) as CertLayout;
}

interface CertForm {
  name: string;
  statusOn: boolean;
  file: File | null;
  layout: CertLayout;
}

const form = ref<CertForm>({
  name: '',
  statusOn: true,
  file: null,
  layout: cloneLayout(DEFAULT_LAYOUT),
});

const nameError = ref(false);
const fileError = ref('');
const fileInputRef = ref<HTMLInputElement | null>(null);
const filePreviewUrl = ref('');

const existingFileBlobUrl = computed<string | null>(() =>
  editingId.value !== null ? (itemBlobUrls.value[editingId.value] ?? null) : null,
);

// computed — does the editor have an image to work with?
const hasImage = computed(
  () => !!(form.value.file ? filePreviewUrl.value : existingFileBlobUrl.value),
);
const editorImageSrc = computed(() =>
  form.value.file ? filePreviewUrl.value : (existingFileBlobUrl.value ?? ''),
);

// ——— Layout fields config ———
const layoutFields: { key: keyof CertLayout; label: string; sample: string; color: string }[] = [
  { key: 'recipient', label: 'ชื่อผู้รับ', sample: 'ชื่อ-นามสกุล', color: 'blue-8' },
  { key: 'course', label: 'ชื่อวิชา', sample: 'ชื่อหลักสูตร', color: 'green-8' },
  { key: 'date', label: 'วันที่', sample: '01/01/2568', color: 'orange-8' },
];

function getSampleStyle(key: keyof CertLayout): Record<string, string> {
  const f: CertLayoutField = form.value.layout[key];
  return {
    fontSize: `${Math.max(9, Math.min(f.fontSize * 0.4, 14))}px`,
    color: f.color,
    fontWeight: f.bold ? '700' : '400',
    textAlign: f.align,
  };
}

// ——— Drag logic ———
const editorRef = ref<HTMLElement | null>(null);
const dragging = ref<keyof CertLayout | null>(null);

function startDrag(key: keyof CertLayout, e: MouseEvent): void {
  dragging.value = key;
  updateDragPosition(e);
}

function onEditorMouseMove(e: MouseEvent): void {
  if (!dragging.value) return;
  updateDragPosition(e);
}

function onEditorMouseUp(): void {
  dragging.value = null;
}

function updateDragPosition(e: MouseEvent): void {
  if (!dragging.value || !editorRef.value) return;
  const rect = editorRef.value.getBoundingClientRect();
  const top = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100));
  const left = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
  form.value.layout[dragging.value].top = Math.round(top * 10) / 10;
  form.value.layout[dragging.value].left = Math.round(left * 10) / 10;
}

function resetLayout(): void {
  form.value.layout = cloneLayout(DEFAULT_LAYOUT);
}

// ——— Preview dialog ———
const previewOpen = ref(false);
const previewItem = ref<AdminCertTemplateItem | null>(null);

// ——— Delete dialog ———
const confirmDeleteOpen = ref(false);
const pendingDeleteId = ref<number | null>(null);
const pendingDeleteName = ref('');

async function replaceItemBlobUrls(templateItems: AdminCertTemplateItem[]): Promise<void> {
  const newUrls: Record<number, string> = {};
  await Promise.all(
    templateItems
      .filter((item) => item.url)
      .map(async (item) => {
        try {
          const response = await api.get<Blob>(item.url!, { responseType: 'blob' });
          newUrls[item.id] = URL.createObjectURL(response.data);
        } catch (err) {
          console.error('[CertTemplate] failed to load image', item.url, err);
        }
      }),
  );
  Object.values(itemBlobUrls.value).forEach((u) => URL.revokeObjectURL(u));
  itemBlobUrls.value = newUrls;
}

onMounted(() => {
  void load();
});

onUnmounted(() => {
  Object.values(itemBlobUrls.value).forEach((u) => URL.revokeObjectURL(u));
});

async function load(page = 1): Promise<void> {
  try {
    await fetchData({ page, pageSize: rowsPerPage, search: globalSearch.value || null });
    await replaceItemBlobUrls(items.value);
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

function openAddDialog(): void {
  dialogMode.value = 'add';
  editingId.value = null;
  existingFile.value = null;
  pendingDeleteFile.value = false;
  form.value = { name: '', statusOn: true, file: null, layout: cloneLayout(DEFAULT_LAYOUT) };
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
  form.value = {
    name: item.name,
    statusOn: item.status === 'Y',
    file: null,
    layout: item.layout ? cloneLayout(item.layout) : cloneLayout(DEFAULT_LAYOUT),
  };
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
    fileError.value = 'รองรับเฉพาะไฟล์ PNG, JPG เท่านั้น';
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    fileError.value = 'ขนาดไฟล์ต้องไม่เกิน 2 MB';
    return;
  }
  revokePreview();
  form.value.file = file;
  if (dialogMode.value === 'add' && !form.value.name.trim())
    form.value.name = file.name.replace(/\.[^.]+$/, '');
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
    link.download = existingFile.value.filename ?? 'certificate-template';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
  } catch {
    // no fallback — URL requires auth so opening in tab would fail too
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
    fd.append('layout', JSON.stringify(form.value.layout));
    if (form.value.file) fd.append('file', form.value.file);

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
      if (pendingDeleteFile.value && !form.value.file) fd.append('deleteFile', 'true');
      const updated = await updateTemplate(editingId.value!, fd);
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
    if (items.value.length === 0 && pagination.value.page > 1)
      await load(pagination.value.page - 1);
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

.cert-cell__name {
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

.cert-cell__thumb-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100px;
  height: 60px;
  margin: 0 auto;
}

.cert-cell__thumb {
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

.cert-cell__no-file {
  color: #94a3b8;
  font-size: 0.88rem;
}

.cert-cell__actions {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
}

.cert-action-btn {
  --action-color: var(--admin-info-ink);
  --action-border: rgba(16, 35, 63, 0.12);
  --action-ring: rgba(16, 35, 63, 0.08);
  width: 34px;
  height: 34px;
  min-height: 34px;
  background: #fff !important;
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

.cert-action-btn--edit {
  --action-color: var(--admin-gold);
  --action-border: rgba(245, 166, 35, 0.28);
  --action-ring: rgba(245, 166, 35, 0.1);
}

.cert-action-btn--delete {
  --action-color: var(--admin-danger-ink);
  --action-border: rgba(225, 29, 72, 0.18);
  --action-ring: rgba(225, 29, 72, 0.08);
}

// ——— Dialog ———
.cert-manager-dialog__card {
  width: min(600px, calc(100vw - 32px));
  max-height: calc(100dvh - 48px);
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.cert-manager-dialog__body {
  overflow-y: auto;
  flex: 1;
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
  color: #fff;
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
  border-radius: 10px !important;
  font-weight: 700;
  min-height: 42px;
}

.cert-manager-dialog__save-btn {
  background: var(--admin-gold, #f5a623) !important;
  color: #ffffff !important;
  border-color: rgba(245, 166, 35, 0.7) !important;

  :deep(.q-btn__content) {
    color: #ffffff !important;
  }
}

// ——— Position Editor ———
.position-editor {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.position-editor__canvas {
  position: relative;
  width: 100%;
  aspect-ratio: 1.414;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.12);
  cursor: crosshair;
  user-select: none;
}

.position-editor__img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: fill;
  display: block;
}

.position-editor__handle {
  position: absolute;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  cursor: grab;
  z-index: 10;

  &:active {
    cursor: grabbing;
  }

  &--recipient .position-editor__handle-label {
    background: rgba(29, 78, 216, 0.85);
  }
  &--course .position-editor__handle-label {
    background: rgba(22, 101, 52, 0.85);
  }
  &--date .position-editor__handle-label {
    background: rgba(146, 64, 14, 0.85);
  }
}

.position-editor__handle-label {
  padding: 1px 6px;
  border-radius: 4px;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  white-space: nowrap;
  pointer-events: none;
}

.position-editor__handle-sample {
  pointer-events: none;
  white-space: nowrap;
  display: block;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.position-editor__hint {
  margin: 0;
  color: #94a3b8;
  font-size: 0.75rem;
  display: flex;
  align-items: center;
  gap: 4px;
}

.position-editor__fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 10px;
  background: #fafbfc;
}

.position-editor__field-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.position-editor__field-name {
  font-size: 0.8rem;
  font-weight: 700;
  min-width: 72px;
}

.position-editor__field-controls {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.position-editor__color-input {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 1px solid rgba(15, 23, 42, 0.15);
  padding: 2px;
  cursor: pointer;
  background: none;
}

.position-editor__align-toggle {
  :deep(.q-btn) {
    min-height: 28px;
    min-width: 28px;
    padding: 0;
  }
}

// ——— Image preview dialog ———
.cert-manager-preview-card {
  max-width: min(800px, calc(100vw - 32px));
  border-radius: 16px;
}
.cert-manager-preview-card__header {
  padding: 16px 20px 0;
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
