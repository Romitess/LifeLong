<template>
  <nav class="breadcrumb-nav" aria-label="breadcrumb">
    <RouterLink to="/main" class="breadcrumb-el">
      <q-icon name="home" size="18px" />
      <span>หน้าหลัก</span>
    </RouterLink>
    <q-icon name="chevron_right" size="16px" color="grey-4" />
    <RouterLink to="/profile/courses" class="breadcrumb-el">
      <q-icon name="menu_book" size="18px" />
      <span>วิชาของฉัน</span>
    </RouterLink>
    <q-icon name="chevron_right" size="16px" color="grey-4" />

    <template v-if="current">
      <RouterLink :to="`/course/${courseId}/learn`" class="breadcrumb-el">
        <span>{{ courseTitle }}</span>
      </RouterLink>
      <q-icon name="chevron_right" size="16px" color="grey-4" />
      <span class="breadcrumb-el breadcrumb-el--current">{{ current }}</span>
    </template>
    <span v-else class="breadcrumb-el breadcrumb-el--current">{{ courseTitle }}</span>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router';

interface Props {
  courseId: string;
  courseTitle: string;
  /** Leaf node. If omitted, the course title becomes the (non-linked) current node. */
  current?: string;
}

withDefaults(defineProps<Props>(), { current: '' });
</script>

<style lang="scss" scoped>
.breadcrumb-nav {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.breadcrumb-el {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: rgba(15, 23, 42, 0.55);
  text-decoration: none;
  padding: 4px 6px;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    color: var(--q-primary);
    background: rgba(247, 208, 70, 0.12);
  }

  &--current {
    color: rgba(15, 23, 42, 0.85);
    font-weight: 700;
    cursor: default;

    &:hover {
      background: transparent;
      color: rgba(15, 23, 42, 0.85);
    }
  }
}
</style>
