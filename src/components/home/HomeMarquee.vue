<template>
  <div class="marquee">
    <div class="marquee__track">
      <button
        v-for="(item, i) in quad"
        :key="i"
        class="marquee__item"
        :style="{ '--cat-color': item.color }"
        @click="select(item.name)"
      >
        <span class="marquee__icon-bubble">
          <q-icon :name="item.icon" size="13px" />
        </span>
        {{ item.name }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useCategoryStore } from 'src/stores/category-store';

const router = useRouter();
const categoryStore = useCategoryStore();

const items = computed(() =>
  categoryStore.categories
    .filter((c) => c.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder),
);

const allItem = {
  name: 'ทั้งหมด',
  icon: 'apps',
  color: '#1a237e',
  id: '__all__',
  nameEn: 'All',
  slug: '',
  description: '',
  descriptionEn: '',
  isActive: true,
  displayOrder: 0,
  createdAt: '',
  updatedAt: '',
};

const itemsWithAll = computed(() => [allItem, ...items.value]);

const quad = computed(() => [
  ...itemsWithAll.value,
  ...itemsWithAll.value,
  ...itemsWithAll.value,
  ...itemsWithAll.value,
]);

function select(name: string) {
  if (name === 'ทั้งหมด') {
    void router.push({ path: '/short-courses' });
  } else {
    void router.push({ path: '/short-courses', query: { category: name } });
  }
}
</script>

<style lang="scss" scoped>
.marquee {
  overflow: hidden;
  padding: 6px 0;
  border-top: 1px solid var(--color-border-faint);
  border-bottom: 1px solid var(--color-border-faint);
  background: rgba(255, 255, 255, 0.5);
  mask-image: linear-gradient(
    to right,
    transparent,
    black 60px,
    black calc(100% - 60px),
    transparent
  );

  &:hover &__track {
    animation-play-state: paused;
  }

  &__track {
    display: flex;
    align-items: center;
    width: max-content;
    animation: marquee-scroll 70s linear infinite;

    @media (prefers-reduced-motion: reduce) {
      animation: none;
    }
  }

  &__item {
    --cat-color: #{$primary};

    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 4px 14px 4px 10px;
    font-size: var(--text-xs);
    font-weight: 600;
    color: var(--color-text-3);
    white-space: nowrap;
    background: transparent;
    border: none;
    border-radius: var(--radius-full);
    cursor: pointer;
    transition:
      background 0.2s ease,
      color 0.2s ease;

    @media (hover: hover) {
      &:hover {
        background: color-mix(in srgb, var(--cat-color) 12%, transparent);
        color: var(--cat-color);

        .marquee__icon-bubble {
          opacity: 1;
        }
      }
    }

    &:active {
      opacity: 0.7;
    }

    // dot separator
    &::after {
      content: '';
      display: inline-block;
      width: 3px;
      height: 3px;
      border-radius: 50%;
      background: var(--color-border-default);
      margin-left: 14px;
      flex-shrink: 0;
    }
  }

  &__icon-bubble {
    width: 18px;
    height: 18px;
    border-radius: 50%;
    background: var(--cat-color);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    flex-shrink: 0;
    opacity: 0.8;
    transition: opacity 0.2s ease;
  }
}

@keyframes marquee-scroll {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-25%);
  }
}
</style>
