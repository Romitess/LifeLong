<template>
  <transition
    appear
    enter-active-class="animated fadeInRight"
    leave-active-class="animated fadeOutRight"
  >
    <q-btn
      v-show="visible"
      round
      unelevated
      color="primary"
      icon="expand_less"
      class="scroll-top-btn shadow-5"
      @click="scrollToTop"
    >
      <q-tooltip anchor="center left" self="center right" :offset="[10, 10]">
        เลื่อนกลับด้านบน
      </q-tooltip>
    </q-btn>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { scroll } from 'quasar';

const { setVerticalScrollPosition } = scroll;

const visible = ref(false);

function handleScroll() {
  const scrollPosition = window.pageYOffset || document.documentElement.scrollTop;
  visible.value = scrollPosition > 400;
}

function scrollToTop() {
  setVerticalScrollPosition(window, 0, 500); // 500ms duration for smooth scroll
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll);
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleScroll);
});
</script>

<style lang="scss" scoped>
.scroll-top-btn {
  position: fixed;
  right: 32px;
  bottom: 32px;
  z-index: 2000;
  width: 48px;
  height: 48px;
  border-radius: 50% !important;
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);

  &:hover {
    transform: scale(1.1) translateY(-4px);
    background-color: mix(#000, $primary, 5%) !important;
  }

  &:active {
    transform: scale(0.95);
  }
}

// Ensure it's not hidden by the footer on mobile or small screens if needed
@media (max-width: 600px) {
  .scroll-top-btn {
    right: 20px;
    bottom: 20px;
    width: 40px;
    height: 40px;
  }
}
</style>
