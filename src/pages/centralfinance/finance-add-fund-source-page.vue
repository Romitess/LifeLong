<template>
  <q-page class="admin-page finance-add-fund-page">
    <AdminPageHero
      :eyebrow="$t('centralFinance.addFundSource.hero.eyebrow')"
      eyebrow-icon="account_balance"
      :title="$t('centralFinance.addFundSource.hero.title')"
      :description="$t('centralFinance.addFundSource.hero.desc')"
    >
      <template #actions>
        <AdminActionButton
          variant="outline"
          icon="arrow_back"
          :label="$t('centralFinance.addFundSource.actions.back')"
          no-caps
          @click="onBack"
        />
      </template>
    </AdminPageHero>

    <section class="admin-shell admin-content">
      <div class="row q-col-gutter-lg">
        <!-- Form Section -->
        <div class="col-12 col-md-8">
          <AdminSurfaceCard :title="$t('centralFinance.addFundSource.form.title')" :accent="true">
            <div class="row q-col-gutter-md">
              <!-- Fund Type -->
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.fundType"
                  outlined
                  dense
                  :label="$t('centralFinance.addFundSource.form.fundType')"
                  :options="fundTypeOptions"
                  emit-value
                  map-options
                  class="admin-editor-field"
                  @update:model-value="generateFundCode"
                />
              </div>

              <!-- Fiscal Year -->
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.fiscalYear"
                  outlined
                  dense
                  :label="$t('centralFinance.addFundSource.form.fiscalYear')"
                  :options="yearOptions"
                  class="admin-editor-field"
                  @update:model-value="generateFundCode"
                />
              </div>

              <!-- Name TH -->
              <div class="col-12">
                <q-input
                  v-model="form.nameTh"
                  outlined
                  dense
                  :label="$t('centralFinance.addFundSource.form.nameTh')"
                  :placeholder="$t('centralFinance.addFundSource.form.nameThPlaceholder')"
                  class="admin-editor-field"
                />
              </div>

              <!-- Name EN -->
              <div class="col-12">
                <q-input
                  v-model="form.nameEn"
                  outlined
                  dense
                  :label="$t('centralFinance.addFundSource.form.nameEn')"
                  :placeholder="$t('centralFinance.addFundSource.form.nameEnPlaceholder')"
                  class="admin-editor-field"
                />
              </div>

              <!-- Description -->
              <div class="col-12">
                <q-input
                  v-model="form.description"
                  outlined
                  dense
                  type="textarea"
                  :label="$t('centralFinance.addFundSource.form.note')"
                  rows="3"
                  class="admin-editor-field"
                />
              </div>

              <!-- Notification toggle -->
              <div class="col-12 q-mt-md">
                <q-toggle
                  v-model="form.isNotifyFaculty"
                  :label="$t('centralFinance.addFundSource.form.notifyToggle')"
                  color="primary"
                  class="text-weight-bold"
                />
              </div>

              <!-- Notification Details -->
              <template v-if="form.isNotifyFaculty">
                <div class="col-12 col-md-6">
                  <q-select
                    v-model="form.notifyFaculty"
                    outlined
                    dense
                    :label="$t('centralFinance.addFundSource.form.notifyFaculty')"
                    :options="facultyOptions"
                    class="admin-editor-field"
                  />
                </div>
                <div class="col-12 col-md-6">
                  <q-input
                    v-model="form.notifyApprover"
                    outlined
                    dense
                    :label="$t('centralFinance.addFundSource.form.notifyApprover')"
                    :placeholder="$t('centralFinance.addFundSource.form.notifyApproverPlaceholder')"
                    class="admin-editor-field"
                  />
                </div>
                <div class="col-12">
                  <q-input
                    v-model="form.notifyNote"
                    outlined
                    dense
                    type="textarea"
                    :label="$t('centralFinance.addFundSource.form.notifyNote')"
                    :placeholder="$t('centralFinance.addFundSource.form.notifyNotePlaceholder')"
                    rows="2"
                    class="admin-editor-field"
                  />
                </div>
              </template>
            </div>
          </AdminSurfaceCard>
        </div>

        <!-- Result & Auto-Generate Section -->
        <div class="col-12 col-md-4">
          <div class="sticky-side">
            <AdminSurfaceCard :title="$t('centralFinance.addFundSource.result.title')">
              <div class="fund-code-display text-center q-pa-lg">
                <div class="text-overline text-grey-7 q-mb-xs">
                  {{ $t('centralFinance.addFundSource.result.generatedCode') }}
                </div>
                <div class="fund-code-value" :class="{ 'is-duplicate': isDuplicate }">
                  {{ form.fundCode || $t('centralFinance.addFundSource.result.waitInfo') }}
                </div>
                <div v-if="isDuplicate" class="text-negative text-caption q-mt-sm">
                  <q-icon name="error" /> {{ $t('centralFinance.addFundSource.result.duplicate') }}
                </div>
                <div v-else-if="form.fundCode" class="text-positive text-caption q-mt-sm">
                  <q-icon name="check_circle" />
                  {{ $t('centralFinance.addFundSource.result.ready') }}
                </div>
              </div>

              <q-separator inset class="q-my-md" />

              <div class="q-px-md q-pb-md">
                <p class="text-caption text-grey-8">
                  {{ $t('centralFinance.addFundSource.result.structure') }}<br />
                  {{ $t('centralFinance.addFundSource.result.structureHint') }}
                </p>

                <AdminActionButton
                  :label="$t('centralFinance.addFundSource.result.saveBtn')"
                  icon="save"
                  class="full-width q-mt-md"
                  :disabled="!isValid || isDuplicate || isSaving"
                  :loading="isSaving"
                  @click="onSave"
                />

                <AdminActionButton
                  variant="secondary"
                  :label="$t('centralFinance.addFundSource.result.checkDuplicateBtn')"
                  icon="spellcheck"
                  class="full-width q-mt-sm"
                  :disabled="!form.fundCode"
                  @click="checkDuplicate"
                />
              </div>
            </AdminSurfaceCard>

            <AdminSurfaceCard class="q-mt-md info-card">
              <div class="flex items-center gap-sm">
                <q-icon name="info" color="primary" size="20px" />
                <span class="text-weight-bold">{{
                  $t('centralFinance.addFundSource.tips.title')
                }}</span>
              </div>
              <p class="text-caption q-mt-sm q-mb-none text-grey-8">
                {{ $t('centralFinance.addFundSource.tips.content') }}
              </p>
            </AdminSurfaceCard>
          </div>
        </div>
      </div>
    </section>

    <!-- Success Dialog -->
    <q-dialog v-model="showSuccess" persistent>
      <q-card
        class="success-dialog q-pa-md text-center"
        style="min-width: 350px; border-radius: 20px"
      >
        <q-card-section>
          <div class="success-icon-wrap">
            <q-icon name="check_circle" color="positive" size="80px" />
          </div>
          <div class="text-h5 text-weight-bold q-mt-md">
            {{ $t('centralFinance.addFundSource.success.title') }}
          </div>
          <div class="text-subtitle1 q-mt-sm">
            {{ $t('centralFinance.addFundSource.success.codeIs') }}
            <span class="text-primary text-weight-bold">{{ savedCode }}</span>
          </div>
          <p class="text-grey-7 q-mt-md">{{ $t('centralFinance.addFundSource.success.desc') }}</p>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn
            unelevated
            rounded
            color="primary"
            :label="$t('ok')"
            class="px-lg"
            @click="onDialogClose"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import AdminActionButton from 'components/admin/AdminActionButton.vue';
import { useQuasar } from 'quasar';
import { useCentralFinanceStore } from 'src/stores/central-finance-store';

const router = useRouter();
const { t } = useI18n();
const $q = useQuasar();
const financeStore = useCentralFinanceStore();

const isSaving = ref(false);
const isDuplicate = ref(false);
const showSuccess = ref(false);
const savedCode = ref('');

const form = reactive({
  fundType: '',
  fiscalYear: '2569',
  nameTh: '',
  nameEn: '',
  description: '',
  fundCode: '',
  isNotifyFaculty: false,
  notifyFaculty: '',
  notifyApprover: 'เจ้าหน้าที่การเงินกลาง', // Mock default approver
  notifyNote: '',
});

const facultyOptions = [
  'คณะวิทยาการสารสนเทศ',
  'คณะวิทยาศาสตร์',
  'คณะพยาบาลศาสตร์',
  'คณะบริหารธุรกิจ',
  'คณะวิศวกรรมศาสตร์',
  'สำนักคอมพิวเตอร์',
];

const fundTypeOptions = computed(() => [
  { label: t('centralFinance.addFundSource.form.fundTypes.budget'), value: 'BG' },
  { label: t('centralFinance.addFundSource.form.fundTypes.revenue'), value: 'RV' },
  { label: t('centralFinance.addFundSource.form.fundTypes.donation'), value: 'DN' },
  { label: t('centralFinance.addFundSource.form.fundTypes.fund'), value: 'FD' },
  { label: t('centralFinance.addFundSource.form.fundTypes.other'), value: 'OT' },
]);

const yearOptions = ['2566', '2567', '2568', '2569'];

const isValid = computed(() => {
  const baseValid = form.fundType && form.fiscalYear && form.nameTh;
  if (form.isNotifyFaculty) {
    return baseValid && form.notifyFaculty && form.notifyApprover;
  }
  return baseValid;
});

// ── Logic: Auto-Generate Fund Code ───────────────────────────
function generateFundCode() {
  if (!form.fundType || !form.fiscalYear) {
    form.fundCode = '';
    return;
  }

  // Simulated logic: [Type]-[Year]-[Seq]
  // In real app, this would call backend to get next sequence
  const seq = Math.floor(Math.random() * 900) + 100; // Mock sequence
  form.fundCode = `${form.fundType}-${form.fiscalYear}-${seq}`;
  isDuplicate.value = false; // Reset duplicate status on new code
}

// ── Logic: Check Duplicate ───────────────────────────────────
function checkDuplicate() {
  if (!form.fundCode) return;

  $q.loading.show({ message: t('centralFinance.addFundSource.notif.checking') });

  // Simulate API delay
  setTimeout(() => {
    $q.loading.hide();

    // Also check against local store
    const localExists = financeStore.fundSources.some((s) => s.fundCode === form.fundCode);

    // 5% chance of being duplicate for simulation + check store
    isDuplicate.value = Math.random() < 0.05 || localExists;

    if (isDuplicate.value) {
      $q.notify({
        type: 'negative',
        message: t('centralFinance.addFundSource.notif.duplicateError'),
        caption: t('centralFinance.addFundSource.notif.duplicateDesc'),
      });
    } else {
      $q.notify({
        type: 'positive',
        message: t('centralFinance.addFundSource.notif.available'),
        icon: 'check',
      });
    }
  }, 800);
}

// ── Logic: Save ─────────────────────────────────────────────
async function onSave() {
  if (!isValid.value || isDuplicate.value) return;

  isSaving.value = true;

  // Simulate API Save delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // Save to Pinia Store
  financeStore.addFundSource({
    fundCode: form.fundCode,
    fundType: form.fundType,
    fiscalYear: form.fiscalYear,
    nameTh: form.nameTh,
    nameEn: form.nameEn,
    description: form.description,
  });

  // Save Notification Log
  if (form.isNotifyFaculty) {
    financeStore.addNotificationLog({
      fundCode: form.fundCode,
      sentTo: form.notifyFaculty,
      note: form.notifyNote,
      approvedBy: form.notifyApprover,
    });
  }

  savedCode.value = form.fundCode;
  isSaving.value = false;
  showSuccess.value = true;
}

async function onBack() {
  await router.push('/central-finance/fund-sources');
}

async function onDialogClose() {
  showSuccess.value = false;
  await router.push('/central-finance/fund-sources');
}
</script>

<style lang="scss" scoped>
.finance-add-fund-page {
  padding-bottom: 80px;
}

.fund-code-display {
  background: #f8fafc;
  border-radius: 16px;
  border: 2px dashed rgba(16, 35, 63, 0.1);
}

.fund-code-value {
  font-size: 2.2rem;
  font-weight: 950;
  color: var(--admin-navy);
  letter-spacing: 0.05em;
  font-family: 'IBM Plex Mono', monospace;

  &.is-duplicate {
    color: var(--q-negative);
    text-decoration: line-through;
  }
}

.sticky-side {
  position: sticky;
  top: 100px;
}

.success-icon-wrap {
  display: grid;
  place-items: center;
  margin-bottom: 10px;
}

.info-card {
  border-left: 4px solid var(--q-primary);
}

@media (max-width: 1024px) {
  .sticky-side {
    position: static;
  }
}
</style>
