<template>
  <q-page class="finance-page finance-faculty-report-page">
    <!-- ── Hero ─────────────────────────────────────────────── -->
    <CentralFinancePageHero
      :eyebrow="$t('centralFinance.dashboard.hero.eyebrow')"
      eyebrow-icon="analytics"
      :title="$t('centralFinance.facultyRevenue.hero.title')"
      :description="$t('centralFinance.facultyRevenue.hero.desc')"
    >
      <template #aside>
        <div class="faculty-scope-card">
          <div class="faculty-scope-card__label">
            {{ $t('centralFinance.receiptSummary.scopeLabel') }}
          </div>
          <div class="faculty-scope-card__faculty">
            {{ activeFacultyLabel }}
          </div>
        </div>
      </template>
    </CentralFinancePageHero>

    <section class="finance-shell finance-content">
      <!-- ── Filter Card ─────────────────────────────────────── -->
      <CentralFinanceSurfaceCard>
        <div class="row q-col-gutter-md q-mb-md">
          <div class="col-12 col-md-8 offset-md-2">
            <!-- คณะ/ส่วนงาน -->
            <div class="row items-center q-mb-sm">
              <div class="col-12 col-sm-4 text-right q-pr-md text-weight-medium">
                {{ $t('centralFinance.receiptSummary.filters.faculty') }}
              </div>
              <div class="col-12 col-sm-8">
                <q-select
                  v-model="selectedFacultyValue"
                  :options="facultyOptions"
                  :loading="isFacultyLoading"
                  emit-value
                  map-options
                  outlined
                  dense
                  class="bg-white"
                />
              </div>
            </div>

            <!-- ปุ่มค้นหา / ล้างค่า -->
            <div class="row items-center">
              <div class="col-12 col-sm-4 text-right q-pr-md" />
              <div class="col-12 col-sm-8 q-gutter-sm">
                <q-btn
                  color="warning"
                  text-color="black"
                  :label="$t('centralFinance.facultyRevenue.filters.searchBtn')"
                  unelevated
                  class="q-px-xl"
                  @click="onSearch"
                />
                <q-btn
                  outline
                  color="grey-7"
                  :label="$t('centralFinance.facultyRevenue.filters.clearBtn')"
                  class="q-px-lg bg-white"
                  @click="clearFilters"
                />
              </div>
            </div>
          </div>
        </div>
      </CentralFinanceSurfaceCard>

      <!-- ── Report ──────────────────────────────────────────── -->
      <div class="q-mt-md">
        <CentralFinanceFacultyReportManager
          :key="`faculty-${appliedFacultyId}`"
          :initial-faculty-id="appliedFacultyId"
          :override-faculty-label="
            appliedFacultyId === null ? t('centralFinance.receiptSummary.allFaculties') : undefined
          "
        />
      </div>
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFacultyList } from 'src/composables/use-faculty-list';
import type { ApiFaculty } from 'src/types/faculty';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import CentralFinanceSurfaceCard from 'components/centralfinance/CentralFinanceSurfaceCard.vue';
import CentralFinanceFacultyReportManager from 'components/centralfinance/CentralFinanceFacultyReportManager.vue';

const { t } = useI18n();
const { isLoading: isFacultyLoading, fetchFaculties } = useFacultyList();

const faculties = ref<ApiFaculty[]>([]);
const selectedFacultyValue = ref<number | ''>('');
const appliedFacultyId = ref<number | null>(null);

const facultyOptions = computed(() => [
  { label: t('centralFinance.receiptSummary.allFaculties'), value: '' as const },
  ...faculties.value.map((f) => ({ label: f.name ?? '', value: f.id })),
]);

const activeFacultyLabel = computed<string>(() => {
  if (appliedFacultyId.value === null) return t('centralFinance.receiptSummary.allFaculties');
  const option = facultyOptions.value.find((o) => o.value === appliedFacultyId.value);
  return option?.label ?? t('centralFinance.receiptSummary.allFaculties');
});

function onSearch(): void {
  appliedFacultyId.value = selectedFacultyValue.value === '' ? null : selectedFacultyValue.value;
}

function clearFilters(): void {
  selectedFacultyValue.value = '';
  appliedFacultyId.value = null;
}

onMounted(async () => {
  faculties.value = await fetchFaculties();
});
</script>

<style lang="scss" scoped>
.faculty-scope-card {
  min-width: 220px;
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
  font-size: 1rem;
  font-weight: 900;
}

:deep(.q-field__label) {
  font-weight: 400 !important;
}
</style>
