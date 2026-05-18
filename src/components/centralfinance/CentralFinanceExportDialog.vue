<template>
  <q-dialog v-model="isOpen" persistent transition-show="jump-up" transition-hide="jump-down">
    <div class="export-dialog">
      <!-- ── Pinned Header ──────────────────────────────────────── -->
      <div class="export-dialog__header">
        <div class="export-dialog__header-icon">
          <q-icon name="file_download" size="26px" color="white" />
        </div>
        <div class="export-dialog__header-text">
          <p class="export-dialog__eyebrow">Export Center</p>
          <h2 class="export-dialog__title">{{ $t('centralFinance.export.title') }}</h2>
        </div>
        <q-btn
          v-close-popup
          flat
          round
          dense
          icon="close"
          color="white"
          class="export-dialog__close"
        />
      </div>

      <!-- ── Scrollable Body ───────────────────────────────────── -->
      <div class="export-dialog__body">
        <!-- Format Selection -->
        <div class="export-section">
          <p class="export-section__label">{{ $t('centralFinance.export.formatLabel') }}</p>
          <div class="format-grid">
            <button
              v-for="fmt in formats"
              :key="fmt.value"
              :class="['format-card', { 'format-card--active': selectedFormat === fmt.value }]"
              @click="selectedFormat = fmt.value"
            >
              <div v-if="selectedFormat === fmt.value" class="format-card__check">
                <q-icon name="check_circle" size="16px" />
              </div>
              <div :class="['format-card__icon', `format-card__icon--${fmt.value}`]">
                <q-icon :name="fmt.icon" size="22px" />
              </div>
              <span class="format-card__name">{{ fmt.label }}</span>
              <span class="format-card__desc">{{ fmt.desc }}</span>
            </button>
          </div>
        </div>

        <!-- Scope Selection -->
        <div class="export-section">
          <p class="export-section__label">{{ $t('centralFinance.export.scopeLabel') }}</p>
          <div class="scope-list">
            <button
              v-for="sc in scopes"
              :key="sc.value"
              :class="['scope-row', { 'scope-row--active': selectedScope === sc.value }]"
              @click="selectedScope = sc.value"
            >
              <div class="scope-row__leading">
                <q-icon :name="sc.icon" size="18px" />
              </div>
              <div class="scope-row__body">
                <span class="scope-row__name">{{ sc.label }}</span>
                <span class="scope-row__desc">{{ sc.desc }}</span>
              </div>
              <div class="scope-row__radio">
                <div :class="['radio-dot', { 'radio-dot--active': selectedScope === sc.value }]" />
              </div>
            </button>
          </div>
        </div>

        <!-- Date Range (animated reveal) -->
        <transition name="expand">
          <div v-if="selectedScope === 'dateRange'" class="export-section">
            <p class="export-section__label">{{ $t('centralFinance.export.dateRangeLabel') }}</p>
            <div class="date-row">
              <q-input
                v-model="dateFrom"
                outlined
                dense
                :label="$t('centralFinance.export.dateFrom')"
                class="finance-editor-field"
                mask="####-##-##"
                hint="YYYY-MM-DD"
              >
                <template #prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="dateFrom" mask="YYYY-MM-DD">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="OK" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
              <span class="date-row__sep">—</span>
              <q-input
                v-model="dateTo"
                outlined
                dense
                :label="$t('centralFinance.export.dateTo')"
                class="finance-editor-field"
                mask="####-##-##"
                hint="YYYY-MM-DD"
              >
                <template #prepend>
                  <q-icon name="event" class="cursor-pointer">
                    <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                      <q-date v-model="dateTo" mask="YYYY-MM-DD">
                        <div class="row items-center justify-end">
                          <q-btn v-close-popup label="OK" color="primary" flat />
                        </div>
                      </q-date>
                    </q-popup-proxy>
                  </q-icon>
                </template>
              </q-input>
            </div>
          </div>
        </transition>

        <!-- PDF Options (animated reveal) -->
        <transition name="expand">
          <div v-if="selectedFormat === 'pdf'" class="export-section">
            <p class="export-section__label">{{ $t('centralFinance.export.pdfOptions') }}</p>
            <div class="pdf-options">
              <label class="pdf-option-row">
                <q-checkbox v-model="pdfWithHeader" color="primary" dense />
                <span class="pdf-option-row__label">{{
                  $t('centralFinance.export.pdfWithHeader')
                }}</span>
              </label>
              <label class="pdf-option-row">
                <q-checkbox v-model="pdfWithSummary" color="primary" dense />
                <span class="pdf-option-row__label">{{
                  $t('centralFinance.export.pdfWithSummary')
                }}</span>
              </label>
            </div>
          </div>
        </transition>

        <!-- Preview bar -->
        <div class="preview-bar">
          <q-icon name="info_outline" size="15px" class="preview-bar__icon" />
          <span class="preview-bar__text">{{ previewText }}</span>
        </div>
      </div>

      <!-- ── Pinned Footer ──────────────────────────────────────── -->
      <div class="export-dialog__footer">
        <button class="footer-btn footer-btn--cancel" @click="isOpen = false">
          {{ $t('centralFinance.export.cancel') }}
        </button>
        <button
          class="footer-btn footer-btn--confirm"
          color="primary"
          :disabled="isExporting"
          @click="onConfirmExport"
        >
          <q-spinner v-if="isExporting" size="16px" color="white" class="q-mr-xs" />
          <q-icon v-else name="file_download" size="16px" class="q-mr-xs" />
          {{ $t('centralFinance.export.confirm') }}
        </button>
      </div>
    </div>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useQuasar } from 'quasar';

type ExportFormat = 'xlsx' | 'pdf' | 'csv';
type ExportScope = 'currentFilter' | 'dateRange' | 'all';

interface FormatItem {
  value: ExportFormat;
  label: string;
  desc: string;
  icon: string;
}

interface ScopeItem {
  value: ExportScope;
  label: string;
  desc: string;
  icon: string;
}

export interface ExportPayload {
  format: ExportFormat;
  scope: ExportScope;
  dateFrom: string;
  dateTo: string;
  pdfWithHeader: boolean;
  pdfWithSummary: boolean;
}

interface Props {
  modelValue: boolean;
  filteredCount?: number;
  totalCount?: number;
}

const props = withDefaults(defineProps<Props>(), {
  filteredCount: 0,
  totalCount: 0,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  export: [payload: ExportPayload];
}>();

const { t } = useI18n();
const $q = useQuasar();

const isOpen = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

const selectedFormat = ref<ExportFormat>('xlsx');
const selectedScope = ref<ExportScope>('currentFilter');
const dateFrom = ref('');
const dateTo = ref('');
const pdfWithHeader = ref(true);
const pdfWithSummary = ref(true);
const isExporting = ref(false);

const formats = computed<FormatItem[]>(() => [
  {
    value: 'xlsx',
    label: 'Excel (.xlsx)',
    desc: t('centralFinance.export.xlsxDesc'),
    icon: 'table_chart',
  },
  { value: 'pdf', label: 'PDF', desc: t('centralFinance.export.pdfDesc'), icon: 'picture_as_pdf' },
  { value: 'csv', label: 'CSV', desc: t('centralFinance.export.csvDesc'), icon: 'data_object' },
]);

const scopes = computed<ScopeItem[]>(() => [
  {
    value: 'currentFilter',
    label: t('centralFinance.export.scopeCurrentFilter'),
    desc: t('centralFinance.export.scopeCurrentFilterDesc', { count: props.filteredCount }),
    icon: 'filter_list',
  },
  {
    value: 'dateRange',
    label: t('centralFinance.export.scopeDateRange'),
    desc: t('centralFinance.export.scopeDateRangeDesc'),
    icon: 'date_range',
  },
  {
    value: 'all',
    label: t('centralFinance.export.scopeAll'),
    desc: t('centralFinance.export.scopeAllDesc', { count: props.totalCount }),
    icon: 'select_all',
  },
]);

const previewText = computed<string>(() => {
  const fmtLabel = formats.value.find((f) => f.value === selectedFormat.value)?.label ?? '';
  if (selectedScope.value === 'currentFilter') {
    return t('centralFinance.export.previewFiltered', {
      count: props.filteredCount,
      format: fmtLabel,
    });
  }
  if (selectedScope.value === 'dateRange') {
    if (!dateFrom.value || !dateTo.value) return t('centralFinance.export.previewDateRangeEmpty');
    return t('centralFinance.export.previewDateRange', {
      from: dateFrom.value,
      to: dateTo.value,
      format: fmtLabel,
    });
  }
  return t('centralFinance.export.previewAll', { count: props.totalCount, format: fmtLabel });
});

function onConfirmExport(): void {
  if (selectedScope.value === 'dateRange' && (!dateFrom.value || !dateTo.value)) {
    $q.notify({
      type: 'warning',
      icon: 'event',
      message: t('centralFinance.export.errorDateRequired'),
    });
    return;
  }
  isExporting.value = true;
  setTimeout(() => {
    isExporting.value = false;
    const fmtLabel = formats.value.find((f) => f.value === selectedFormat.value)?.label ?? '';
    emit('export', {
      format: selectedFormat.value,
      scope: selectedScope.value,
      dateFrom: dateFrom.value,
      dateTo: dateTo.value,
      pdfWithHeader: pdfWithHeader.value,
      pdfWithSummary: pdfWithSummary.value,
    });
    $q.notify({
      type: 'positive',
      icon: 'check_circle',
      message: t('centralFinance.export.success', { format: fmtLabel }),
    });
    isOpen.value = false;
  }, 900);
}
</script>

<style lang="scss" scoped>
.export-dialog {
  --finance-navy: #10233f;
  --finance-muted: #65758a;
  --finance-ink: #182333;

  display: flex;
  flex-direction: column;
  width: 480px;
  max-width: min(480px, 96vw);
  max-height: min(88vh, 720px);
  border-radius: 20px;
  overflow: hidden;
  background: #fff;
  box-shadow: 0 24px 64px rgba(0, 0, 0, 0.18);
}

// ── Header (pinned) ───────────────────────────────────────────
.export-dialog__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 20px 18px;
  background-color: var(--q-primary);
}

.export-dialog__header-icon {
  flex-shrink: 0;
  width: 46px;
  height: 46px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.15);
  display: grid;
  place-items: center;
}

.export-dialog__header-text {
  flex: 1;
  min-width: 0;
}

.export-dialog__eyebrow {
  margin: 0 0 1px;
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(255, 255, 255, 0.6);
}

.export-dialog__title {
  margin: 0;
  font-size: 1rem;
  font-weight: 900;
  color: #fff;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.export-dialog__close {
  flex-shrink: 0;
}

// ── Body (scrollable) ─────────────────────────────────────────
.export-dialog__body {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
  // Smooth inertia scrolling on iOS
  -webkit-overflow-scrolling: touch;

  // Subtle scrollbar
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.12);
    border-radius: 4px;
  }
}

// ── Sections ──────────────────────────────────────────────────
.export-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.export-section__label {
  margin: 0;
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--finance-muted);
}

// ── Format Grid ───────────────────────────────────────────────
.format-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.format-card {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 12px 8px 10px;
  border: 2px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  background: #fafafa;
  cursor: pointer;
  text-align: center;
  transition:
    border-color 0.15s,
    background 0.15s,
    box-shadow 0.15s;

  &:hover {
    border-color: rgba($primary, 0.3);
    background: #fff;
  }

  &--active {
    border-color: $primary !important;
    background: rgba($primary, 0.05) !important;
    box-shadow: 0 0 0 3px rgba($primary, 0.1);
  }
}

.format-card__check {
  position: absolute;
  top: 6px;
  right: 6px;
  color: $primary;
  line-height: 1;
}

.format-card__icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: grid;
  place-items: center;
  flex-shrink: 0;

  &--xlsx {
    background: rgba(#217346, 0.1);
    color: #217346;
  }
  &--pdf {
    background: rgba(#e74c3c, 0.1);
    color: #e74c3c;
  }
  &--csv {
    background: rgba($primary, 0.1);
    color: $primary;
  }
}

.format-card__name {
  font-size: 0.78rem;
  font-weight: 800;
  color: var(--finance-navy);
  line-height: 1.2;
}

.format-card__desc {
  font-size: 0.65rem;
  color: var(--finance-muted);
  line-height: 1.4;
  // Prevent desc from ever overflowing the card
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

// ── Scope List ────────────────────────────────────────────────
.scope-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.scope-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border: 2px solid rgba(0, 0, 0, 0.07);
  border-radius: 10px;
  background: #fafafa;
  cursor: pointer;
  text-align: left;
  transition:
    border-color 0.15s,
    background 0.15s;

  &:hover {
    border-color: rgba($primary, 0.22);
    background: #fff;
  }

  &--active {
    border-color: $primary !important;
    background: rgba($primary, 0.04) !important;
  }
}

.scope-row__leading {
  flex-shrink: 0;
  color: var(--finance-muted);

  .scope-row--active & {
    color: $primary;
  }
}

.scope-row__body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.scope-row__name {
  font-size: 0.84rem;
  font-weight: 700;
  color: var(--finance-navy);
  line-height: 1.2;
}

.scope-row__desc {
  font-size: 0.72rem;
  color: var(--finance-muted);
  line-height: 1.3;
  // Handle long text gracefully
  white-space: normal;
  word-break: break-word;
}

.scope-row__radio {
  flex-shrink: 0;
}

.radio-dot {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  border: 2px solid rgba(0, 0, 0, 0.2);
  transition:
    border-color 0.15s,
    background 0.15s;

  &--active {
    border-color: $primary;
    background: radial-gradient(circle, $primary 40%, transparent 40%);
  }
}

// ── Date Row ──────────────────────────────────────────────────
.date-row {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: start;
  gap: 8px;
}

.date-row__sep {
  padding-top: 10px;
  font-size: 1rem;
  color: var(--finance-muted);
  text-align: center;
}

// ── PDF Options ───────────────────────────────────────────────
.pdf-options {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 12px;
  background: #f8fafc;
  border-radius: 10px;
  border: 1px solid rgba(0, 0, 0, 0.06);
}

.pdf-option-row {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
}

.pdf-option-row__label {
  font-size: 0.84rem;
  color: var(--finance-navy);
  line-height: 1.3;
  // Wrap gracefully
  white-space: normal;
}

// ── Preview Bar ───────────────────────────────────────────────
.preview-bar {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 10px 12px;
  background: rgba($primary, 0.05);
  border: 1px solid rgba($primary, 0.12);
  border-radius: 8px;
  // Keep at bottom of scrollable body
  margin-top: auto;
}

.preview-bar__icon {
  flex-shrink: 0;
  margin-top: 1px;
  color: $primary;
}

.preview-bar__text {
  font-size: 0.78rem;
  color: var(--finance-navy);
  line-height: 1.55;
  word-break: break-word;
}

// ── Footer (pinned) ───────────────────────────────────────────
.export-dialog__footer {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
  padding: 14px 20px;
  border-top: 1px solid rgba(0, 0, 0, 0.07);
  background: #fff;
}

.footer-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 20px;
  border-radius: 10px;
  font-size: 0.84rem;
  font-weight: 700;
  cursor: pointer;
  border: none;
  transition:
    background 0.15s,
    opacity 0.15s;

  &--cancel {
    background: transparent;
    color: var(--finance-muted);

    &:hover {
      background: rgba(0, 0, 0, 0.04);
    }
  }

  &--confirm {
    background: var(--q-primary);
    color: #fff;
    &:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }
  }
}

// ── Expand Transition ─────────────────────────────────────────
.expand-enter-active,
.expand-leave-active {
  transition: all 0.22s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0 !important;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
}

.expand-enter-to,
.expand-leave-from {
  max-height: 300px;
}

// ── Mobile Adjustments ────────────────────────────────────────
@media (max-width: 520px) {
  .export-dialog {
    width: 100%;
    max-width: 100%;
    max-height: 100dvh;
    border-radius: 20px 20px 0 0;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
  }

  .format-grid {
    // Stack vertically on very small screens
    grid-template-columns: 1fr 1fr;
  }

  .date-row {
    grid-template-columns: 1fr;

    .date-row__sep {
      display: none;
    }
  }
}
</style>
