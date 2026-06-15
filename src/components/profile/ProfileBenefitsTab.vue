<template>
  <div>
    <div class="row items-center justify-between q-mb-lg benefits-section-header">
      <div>
        <div class="text-h5 text-weight-bolder text-primary">
          {{ $t('profile.benefits.title') }}
        </div>
        <div class="text-caption text-grey-6 q-mt-xs">
          {{ $t('profile.benefits.subtitle') }}
        </div>
      </div>
    </div>

    <!-- Status: has privilege -->
    <q-card v-if="benefitsData?.hasPrivilege" flat bordered class="benefits-check-card">
      <div class="benefits-check-card__stripe" />
      <q-card-section class="q-pa-lg">
        <div class="benefits-check-card__eyebrow">{{ $t('profile.benefits.status') }}</div>
        <div class="text-h6 text-weight-bolder text-dark q-mt-sm">
          {{ $t('profile.benefits.verified') }}
        </div>
        <div class="text-body1 text-grey-8 q-mt-md">
          {{ $t('profile.benefits.accountFor') }}
          <span class="text-weight-bold">{{
            locale === 'th' ? studentFullNameTh : studentFullNameEn
          }}</span>
        </div>

        <div class="benefits-check-card__verified row items-center q-gutter-sm q-mt-lg">
          <q-icon name="check_circle" color="primary" size="24px" />
          <div class="text-weight-bold text-dark">{{ activeBenefitLabel }}</div>
        </div>
      </q-card-section>

      <q-separator />

      <q-card-section class="benefits-check-card__footer q-pa-md">
        <div class="row items-center q-col-gutter-md">
          <div class="col-12 col-md">
            <div class="row items-center q-gutter-sm text-deep-orange-8 text-weight-bold">
              <q-icon name="schedule" size="20px" />
              <span>{{ $t('profile.benefits.checkedAt') }} {{ benefitsCheckedAtLabel }}</span>
            </div>
          </div>
          <div class="col-12 col-md-auto">
            <q-btn
              flat
              dense
              no-caps
              color="grey-6"
              icon="refresh"
              :label="$t('profile.benefits.refresh')"
              size="sm"
              :loading="isRefreshingBenefits"
              @click="$emit('refresh-benefits')"
            />
          </div>
        </div>
      </q-card-section>
    </q-card>

    <!-- Status: checked — no privilege (general public) -->
    <q-card
      v-else-if="benefitsData && !benefitsData.hasPrivilege"
      flat
      bordered
      class="benefits-empty-card"
    >
      <q-card-section class="text-center q-pa-xl">
        <q-icon name="person_outline" size="48px" color="grey-4" class="q-mb-md" />
        <div class="text-subtitle1 text-weight-bold text-grey-8">
          {{ $t('profile.benefits.noPrivilege') }}
        </div>
        <div class="text-caption text-grey-6 q-mt-sm">
          {{ $t('profile.benefits.noPrivilegeSub') }}
        </div>
        <div class="row items-center q-gutter-xs text-deep-orange-8 q-mt-md justify-center">
          <q-icon name="schedule" size="14px" />
          <span class="text-caption text-weight-bold">
            {{ $t('profile.benefits.checkedAt') }} {{ benefitsCheckedAtLabel }}
          </span>
        </div>
        <q-btn
          flat
          dense
          no-caps
          color="grey-6"
          icon="refresh"
          :label="$t('profile.benefits.refresh')"
          size="sm"
          class="q-mt-sm"
          :loading="isRefreshingBenefits"
          @click="$emit('refresh-benefits')"
        />
      </q-card-section>
    </q-card>

    <!-- No citizen ID stored → redirect to personal info -->
    <q-card v-else flat bordered class="benefits-empty-card">
      <q-card-section class="text-center q-pa-xl">
        <q-icon name="badge" size="48px" color="grey-4" class="q-mb-md" />
        <div class="text-subtitle1 text-weight-bold text-grey-8">
          {{ $t('profile.benefits.noCitizenId') }}
        </div>
        <div class="text-caption text-grey-6 q-mt-sm" style="max-width: 320px; margin: 0 auto">
          {{ $t('profile.benefits.noCitizenIdSub') }}
        </div>
        <BaseButton
          color="primary"
          :label="$t('profile.benefits.goToPersonalInfo')"
          icon="person"
          no-caps
          hover-lift
          class="q-mt-lg"
          @click="$emit('navigate-to-personal-info')"
        />
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import BaseButton from 'components/base/BaseButton.vue';

defineProps<{
  benefitsData: {
    hasPrivilege: boolean;
    stutypeId: number | null;
    stutypeName: string | null;
    source: 'student' | 'alumni' | 'staff' | null;
  } | null;
  isRefreshingBenefits: boolean;
  activeBenefitLabel: string;
  benefitsCheckedAtLabel: string;
  locale: string;
  studentFullNameTh: string;
  studentFullNameEn: string;
}>();

defineEmits<{
  'refresh-benefits': [];
  'navigate-to-personal-info': [];
}>();
</script>

<style lang="scss" scoped>
.benefits-section-header {
  gap: 16px;
}

.benefits-check-card {
  position: relative;
  border-radius: 14px !important;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;
  overflow: hidden;
  transition:
    box-shadow 0.3s ease,
    transform 0.3s ease,
    border-color 0.3s ease;

  &:hover {
    box-shadow: 0 10px 25px rgba(245, 166, 35, 0.2) !important;
    transform: translateY(-3px);
    border-color: rgba($primary, 0.55) !important;
  }

  &__stripe {
    position: absolute;
    top: 0;
    bottom: 0;
    left: 0;
    width: 4px;
    background: linear-gradient(180deg, $primary, #c4850e);
  }

  &__eyebrow {
    color: $primary;
    font-size: 0.9rem;
    font-weight: 800;
  }

  &__verified {
    padding: 12px 14px;
    border-radius: 12px;
    background: rgba(33, 186, 69, 0.08);
    border: 1px solid rgba(33, 186, 69, 0.14);
  }

  &__footer {
    background: #fbfcfd;
  }
}

.benefits-empty-card {
  border-radius: 14px !important;
  border: 1px dashed rgba(17, 24, 39, 0.15) !important;
  background: #fafafa !important;
}

@media (max-width: 767px) {
  .benefits-section-header {
    align-items: stretch;
    flex-direction: column;

    .base-button {
      width: 100%;
    }
  }
}
</style>
