<template>
  <q-card flat bordered class="stat-card">
    <q-card-section class="stat-card__body">
      <div class="stat-card__icon" :style="{ backgroundColor: iconTint }">
        <q-icon :name="icon" :color="iconColor" size="28px" />
      </div>
      <div class="stat-card__copy">
        <div class="stat-card__value">{{ value }}</div>
        <div class="stat-card__label">{{ label }}</div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
interface Props {
  icon: string;
  value: string;
  label: string;
  iconColor: string;
  iconTint: string;
}

defineProps<Props>();
</script>

<style scoped lang="scss">
.stat-card {
  border-radius: 16px;
  background: #ffffff;
  border: 1px solid rgba($primary, 0.12) !important;
  box-shadow:
    0 1px 3px rgba($primary, 0.06),
    0 8px 24px rgba(17, 24, 39, 0.04);
  transition:
    transform 0.28s ease,
    border-color 0.28s ease,
    box-shadow 0.28s ease;

  &:hover {
    transform: translateY(-4px) !important;
    border-color: rgba($primary, 0.6) !important;
    box-shadow: 0 16px 32px rgba(17, 24, 39, 0.12) !important;
  }
}

.stat-card__body {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 96px;
}

.stat-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 58px;
  width: 58px;
  height: 58px;
  border-radius: 14px;
  transition: transform 0.24s ease;
}

.stat-card:hover .stat-card__icon {
  transform: scale(1.07);
}

.stat-card__copy {
  min-width: 0;
}

.stat-card__value {
  color: #020617;
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1;
}

.stat-card__label {
  margin-top: 8px;
  color: #667085;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0;
}
</style>
