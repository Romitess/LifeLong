<template>
  <div class="row q-col-gutter-lg">
    <div v-for="n in count" :key="n" :class="gridClass">
      <q-card flat bordered class="skeleton-card">
        <!-- Cover Skeleton -->
        <div class="skeleton-cover">
          <q-skeleton height="100%" square />
        </div>

        <q-card-section class="q-pa-md">
          <!-- Code Skeleton -->
          <q-skeleton type="text" width="30%" class="q-mb-xs" />

          <!-- Title Skeleton -->
          <q-skeleton type="text" class="q-mb-sm" />
          <q-skeleton type="text" width="80%" class="q-mb-md" />

          <!-- Details Skeleton -->
          <div class="row items-center q-gutter-x-sm q-mb-sm">
            <q-skeleton type="circle" size="14px" />
            <q-skeleton type="text" width="60%" />
          </div>

          <div class="row items-center justify-between q-mt-sm">
            <q-skeleton type="text" width="40%" />
            <q-skeleton type="text" width="20%" />
          </div>

          <!-- Badges Skeleton -->
          <div class="row q-gutter-xs q-mt-md">
            <q-skeleton type="QBadge" width="60px" height="20px" style="border-radius: 999px" />
            <q-skeleton type="QBadge" width="80px" height="20px" style="border-radius: 999px" />
          </div>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  count?: number;
  gridClass?: string;
}

withDefaults(defineProps<Props>(), {
  count: 8,
  gridClass: 'col-xs-12 col-sm-6 col-md-3',
});
</script>

<style lang="scss" scoped>
.skeleton-card {
  border-radius: 12px !important;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;
  background: #ffffff;
  overflow: hidden;
  height: 100%;
}

.skeleton-cover {
  aspect-ratio: 16 / 9;
  width: 100%;
}
</style>
