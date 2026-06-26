<template>
  <q-card flat bordered class="admin-section-nav">
    <q-list class="admin-section-nav__list">
      <q-item
        v-for="item in items"
        :key="item.value"
        clickable
        v-ripple
        :active="modelValue === item.value"
        active-class="admin-section-nav__item--active"
        class="admin-section-nav__item"
        @click="$emit('update:modelValue', item.value)"
      >
        <q-item-section v-if="item.icon" avatar>
          <q-icon
            :name="item.icon"
            :color="modelValue === item.value ? 'primary' : 'grey-6'"
            size="20px"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label
            :class="modelValue === item.value ? 'text-primary text-weight-bold' : 'text-grey-8'"
            class="text-body2"
          >
            {{ item.label }}
          </q-item-label>
        </q-item-section>
        <q-item-section v-if="item.badge" side>
          <q-badge rounded color="amber-8" :label="item.badge" />
        </q-item-section>
      </q-item>
    </q-list>
  </q-card>
</template>

<script setup lang="ts">
export interface AdminSectionNavItem {
  value: string;
  label: string;
  icon?: string;
  badge?: string;
  caption?: string;
}

defineProps<{
  modelValue: string;
  items: AdminSectionNavItem[];
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<style scoped lang="scss">
.admin-section-nav {
  margin-bottom: 18px;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;
  border-radius: 14px !important;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(17, 24, 39, 0.06) !important;
  overflow: hidden;
}

.admin-section-nav__list {
  display: flex;
  gap: 4px;
  overflow-x: auto;
  padding: 8px;
}

.admin-section-nav__item {
  flex: 0 0 auto;
  border-radius: 10px;
  min-height: 48px;
  padding: 0 12px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba($primary, 0.04);
  }

  :deep(.q-item__section--avatar) {
    min-width: 34px;
    padding-right: 10px;
  }

  :deep(.q-item__section--main) {
    min-width: 0;
  }

  :deep(.q-item__label) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

.admin-section-nav__item--active {
  background: rgba($primary, 0.08) !important;
  box-shadow: inset 4px 0 0 $primary;
}

@media (max-width: 900px) {
  .admin-section-nav__list {
    padding: 6px;
  }

  .admin-section-nav__item {
    padding: 0 12px;
  }
}
</style>
