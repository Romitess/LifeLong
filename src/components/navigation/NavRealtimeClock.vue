<template>
  <div class="clock-pill">
    <q-icon name="schedule" size="15px" class="clock-pill__icon" />
    <span class="clock-pill__time">{{ timeStr }}</span>
  </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';

const timeStr = ref('');

function update() {
  timeStr.value = new Date().toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

let timer: ReturnType<typeof setInterval>;

onMounted(() => {
  update();
  timer = setInterval(update, 1000);
});

onBeforeUnmount(() => clearInterval(timer));
</script>

<style scoped lang="scss">
.clock-pill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 40px;
  padding: 0 14px;
  border: 1px solid rgba(92, 61, 0, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.76);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
  white-space: nowrap;
  flex: 0 0 auto;

  &__icon {
    color: rgba(92, 61, 0, 0.55);
  }

  &__time {
    font-size: 0.82rem;
    font-weight: 800;
    letter-spacing: 0.04em;
    color: #5c3d00;
    font-variant-numeric: tabular-nums;
  }
}
</style>
