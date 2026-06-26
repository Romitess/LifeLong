<template>
  <div class="cf-scope-card">
    <div class="cf-scope-card__label">
      {{ $t('centralFinance.receiptSummary.scopeLabel') }}
    </div>
    <div class="cf-scope-card__value">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
defineProps<{ label: string }>();
</script>

<style lang="scss" scoped>
.cf-scope-card {
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

.cf-scope-card__label {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.68rem;
  font-weight: 900;
  text-transform: uppercase;
  letter-spacing: 0.18em;
}

.cf-scope-card__value {
  color: #fff;
  font-size: 1rem;
  font-weight: 900;
}
</style>
