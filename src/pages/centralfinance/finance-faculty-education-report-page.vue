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
      <!-- ── Filter Bar ─────────────────────────────────────── -->
      <div ref="sentinelRef" class="faculty-filter-sentinel" />
      <div class="faculty-filter-bar" :class="{ 'faculty-filter-bar--stuck': stuck }">
        <span class="faculty-filter-bar__label">
          <q-icon name="filter_alt" size="14px" class="q-mr-xs" />
          {{ $t('centralFinance.receiptSummary.filters.faculty') }}
        </span>

        <q-select
          v-model="selectedFacultyValue"
          :options="facultyOptions"
          :loading="isFacultyLoading"
          emit-value
          map-options
          outlined
          dense
          bg-color="white"
          class="faculty-filter-bar__select"
          @update:model-value="applyFaculty"
        />

        <q-btn
          flat
          dense
          round
          icon="filter_alt_off"
          color="negative"
          class="q-ml-sm"
          @click="clearFilters"
        >
          <q-tooltip>{{ $t('centralFinance.facultyRevenue.filters.clearBtn') }}</q-tooltip>
        </q-btn>
      </div>

      <!-- ── Report ──────────────────────────────────────────── -->
      <RegistrationStatisticsReportManager
        :key="`faculty-${appliedFacultyId}`"
        :initial-faculty-id="appliedFacultyId"
        :show-faculty-filter="false"
      />
    </section>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useFacultyList } from 'src/composables/use-faculty-list';
import type { ApiFaculty } from 'src/types/faculty';
import CentralFinancePageHero from 'components/centralfinance/CentralFinancePageHero.vue';
import RegistrationStatisticsReportManager from 'components/reports/RegistrationStatisticsReportManager.vue';

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

function applyFaculty(): void {
  appliedFacultyId.value = selectedFacultyValue.value === '' ? null : selectedFacultyValue.value;
}

function clearFilters(): void {
  selectedFacultyValue.value = '';
  appliedFacultyId.value = null;
}

// ── Sticky stuck detection ───────────────────────────────────
const sentinelRef = ref<HTMLElement | null>(null);
const stuck = ref(false);
let stickyObserver: IntersectionObserver | null = null;

onMounted(async () => {
  faculties.value = await fetchFaculties();

  if (sentinelRef.value) {
    stickyObserver = new IntersectionObserver(
      ([entry]) => {
        stuck.value = !(entry?.isIntersecting ?? true);
      },
      { threshold: 0, rootMargin: '-73px 0px 0px 0px' },
    );
    stickyObserver.observe(sentinelRef.value);
  }
});

onUnmounted(() => {
  stickyObserver?.disconnect();
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

  @media (max-width: 599px) {
    min-width: 0;
    width: 100%;
    padding: 12px 14px;
  }
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

// ── Sticky filter bar ────────────────────────────────────────
.faculty-filter-sentinel {
  height: 1px;
}

.faculty-filter-bar {
  position: sticky;
  top: 80px;
  z-index: 9;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  min-height: 52px;
  border-radius: var(--finance-radius-lg, 16px);
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(16px) saturate(1.8);
  -webkit-backdrop-filter: blur(16px) saturate(1.8);
  border: 1px solid rgba(17, 24, 39, 0.08);
  transition: box-shadow 0.2s ease;
  overflow: hidden;

  &--stuck {
    box-shadow:
      0 6px 28px rgba(17, 24, 39, 0.1),
      0 1px 4px rgba(17, 24, 39, 0.05);
  }
}

.faculty-filter-bar__label {
  display: inline-flex;
  align-items: center;
  font-size: 0.8rem;
  font-weight: 800;
  color: var(--finance-navy, #10233f);
  white-space: nowrap;
  flex-shrink: 0;
}

.faculty-filter-bar__select {
  min-width: 220px;
  flex-shrink: 0;
}
</style>
