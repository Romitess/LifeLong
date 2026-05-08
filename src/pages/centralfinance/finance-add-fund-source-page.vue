<template>
  <q-page class="admin-page finance-add-fund-page">
    <AdminPageHero
      eyebrow="Central Finance · การจัดการรหัสบัญชี"
      eyebrow-icon="account_balance"
      title="ออกเลขแหล่งเงินใหม่"
      description="กำหนดรหัสแหล่งเงินในระบบบัญชีกลาง พร้อมระบบรันเลขและตรวจสอบความซ้ำซ้อนอัตโนมัติ"
    >
      <template #actions>
        <AdminActionButton
          variant="outline"
          icon="arrow_back"
          label="ย้อนกลับ"
          no-caps
          @click="onBack"
        />
      </template>
    </AdminPageHero>

    <section class="admin-shell admin-content">
      <div class="row q-col-gutter-lg">
        <!-- Form Section -->
        <div class="col-12 col-md-8">
          <AdminSurfaceCard title="ข้อมูลแหล่งเงิน" :accent="true">
            <div class="row q-col-gutter-md">
              <!-- Fund Type -->
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.fundType"
                  outlined
                  dense
                  label="ประเภทเงิน *"
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
                  label="ปีงบประมาณ *"
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
                  label="ชื่อแหล่งเงิน (ภาษาไทย) *"
                  placeholder="เช่น เงินงบประมาณแผ่นดินเพื่อการวิจัย..."
                  class="admin-editor-field"
                />
              </div>

              <!-- Name EN -->
              <div class="col-12">
                <q-input
                  v-model="form.nameEn"
                  outlined
                  dense
                  label="ชื่อแหล่งเงิน (ภาษาอังกฤษ)"
                  placeholder="e.g. Government Budget for Research..."
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
                  label="หมายเหตุ / รายละเอียดเพิ่มเติม"
                  rows="3"
                  class="admin-editor-field"
                />
              </div>
            </div>
          </AdminSurfaceCard>
        </div>

        <!-- Result & Auto-Generate Section -->
        <div class="col-12 col-md-4">
          <div class="sticky-side">
            <AdminSurfaceCard title="รหัสแหล่งเงินระบบ" tone="glass">
              <div class="fund-code-display text-center q-pa-lg">
                <div class="text-overline text-grey-7 q-mb-xs">
                  รหัสที่ระบบเสนอ (Auto-Generated)
                </div>
                <div class="fund-code-value" :class="{ 'is-duplicate': isDuplicate }">
                  {{ form.fundCode || 'รอระบุข้อมูล' }}
                </div>
                <div v-if="isDuplicate" class="text-negative text-caption q-mt-sm">
                  <q-icon name="error" /> รหัสนี้มีอยู่ในระบบแล้ว กรุณาตรวจสอบ
                </div>
                <div v-else-if="form.fundCode" class="text-positive text-caption q-mt-sm">
                  <q-icon name="check_circle" /> รหัสพร้อมใช้งาน
                </div>
              </div>

              <q-separator inset class="q-my-md" />

              <div class="q-px-md q-pb-md">
                <p class="text-caption text-grey-8">
                  โครงสร้างรหัส: <code>[ประเภท]-[ปี]-[ลำดับ]</code><br />
                  ระบบจะตรวจสอบเลขล่าสุดอัตโนมัติเมื่อเลือกประเภทเงินและปีงบประมาณ
                </p>

                <AdminActionButton
                  label="บันทึกและออกเลข"
                  icon="save"
                  class="full-width q-mt-md"
                  :disabled="!isValid || isDuplicate || isSaving"
                  :loading="isSaving"
                  @click="onSave"
                />

                <AdminActionButton
                  variant="outline"
                  label="ตรวจสอบความซ้ำซ้อน"
                  icon="spellcheck"
                  class="full-width q-mt-sm"
                  :disabled="!form.fundCode"
                  @click="checkDuplicate"
                />
              </div>
            </AdminSurfaceCard>

            <AdminSurfaceCard class="q-mt-md info-card" tone="glass">
              <div class="flex items-center gap-sm">
                <q-icon name="info" color="primary" size="20px" />
                <span class="text-weight-bold">คำแนะนำ</span>
              </div>
              <p class="text-caption q-mt-sm q-mb-none text-grey-8">
                การออกเลขแหล่งเงินใหม่จะมีผลต่อการทำบัญชีรายรับ-รายจ่ายของคณะต่างๆ
                กรุณาตรวจสอบความถูกต้องของชื่อและประเภทเงินก่อนบันทึก
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
          <div class="text-h5 text-weight-bold q-mt-md">ออกเลขแหล่งเงินสำเร็จ</div>
          <div class="text-subtitle1 q-mt-sm">
            รหัสแหล่งเงินคือ: <span class="text-primary text-weight-bold">{{ savedCode }}</span>
          </div>
          <p class="text-grey-7 q-mt-md">ระบบได้บันทึกข้อมูลแหล่งเงินใหม่เรียบร้อยแล้ว</p>
        </q-card-section>

        <q-card-actions align="center">
          <q-btn
            unelevated
            rounded
            color="primary"
            label="ตกลง"
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
import AdminPageHero from 'components/admin/AdminPageHero.vue';
import AdminSurfaceCard from 'components/admin/AdminSurfaceCard.vue';
import AdminActionButton from 'components/admin/AdminActionButton.vue';
import { useQuasar } from 'quasar';
import { useCentralFinanceStore } from 'src/stores/central-finance-store';

const router = useRouter();
const $q = useQuasar();
const financeStore = useCentralFinanceStore();

const isSaving = ref(false);
const isDuplicate = ref(false);
const showSuccess = ref(false);
const savedCode = ref('');

const form = reactive({
  fundType: '',
  fiscalYear: '2568',
  nameTh: '',
  nameEn: '',
  description: '',
  fundCode: '',
});

const fundTypeOptions = [
  { label: 'เงินงบประมาณ (Budget)', value: 'BG' },
  { label: 'เงินรายได้ (Revenue)', value: 'RV' },
  { label: 'เงินบริจาค (Donation)', value: 'DN' },
  { label: 'เงินกองทุน (Fund)', value: 'FD' },
  { label: 'อื่นๆ (Other)', value: 'OT' },
];

const yearOptions = ['2566', '2567', '2568', '2569'];

const isValid = computed(() => {
  return form.fundType && form.fiscalYear && form.nameTh;
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

  $q.loading.show({ message: 'กำลังตรวจสอบความซ้ำซ้อน...' });

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
        message: 'พบรหัสซ้ำในระบบ!',
        caption: 'รหัสนี้ถูกใช้งานไปแล้วโดยโครงการอื่น',
      });
    } else {
      $q.notify({
        type: 'positive',
        message: 'รหัสนี้สามารถใช้งานได้',
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
