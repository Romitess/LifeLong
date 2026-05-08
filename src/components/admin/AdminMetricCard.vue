<template>
  <AdminSurfaceCard :accent="accent" body-class="admin-metric-card__body">
    <div class="admin-metric-card__icon" :style="{ background: iconTint, color: iconColor }">
      <q-icon :name="icon" size="24px" />
    </div>
    <div class="admin-metric-card__copy">
      <strong>{{ value }}</strong>
      <span>{{ label }}</span>
    </div>
    <div v-if="$slots.footer" class="admin-metric-card__footer">
      <slot name="footer" />
    </div>
  </AdminSurfaceCard>
</template>

<script setup lang="ts">
import AdminSurfaceCard from './AdminSurfaceCard.vue';

interface Props {
  icon: string;
  value: string;
  label: string;
  iconColor?: string;
  iconTint?: string;
  accent?: boolean;
}

withDefaults(defineProps<Props>(), {
  iconColor: '#0f766e',
  iconTint: 'rgba(15, 118, 110, 0.14)',
  accent: false,
});
</script>

<style scoped lang="scss">
.admin-metric-card__body {
  display: grid;
  gap: 12px;
}

.admin-metric-card__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 18px;
}

.admin-metric-card__copy {
  display: grid;
  gap: 6px;
}

.admin-metric-card__copy strong {
  color: var(--admin-navy);
  font-size: 1.9rem;
  line-height: 1;
}

.admin-metric-card__copy span {
  color: var(--admin-muted);
  font-weight: 800;
}

.admin-metric-card__footer {
  display: grid;
  gap: 8px;
}
</style>
