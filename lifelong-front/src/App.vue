<template>
  <router-view />
  <BaseSpinner
    v-if="isAuthNavigationLoading"
    class="app-auth-loading"
    full
    :message="$t('auth.login.loading')"
  />
</template>

<script setup lang="ts">
import BaseSpinner from 'components/base/BaseSpinner.vue';
import { useAuthNavigationLoading } from 'src/composables/use-auth-navigation-loading';

const { isAuthNavigationLoading } = useAuthNavigationLoading();
</script>

<style scoped>
.app-auth-loading {
  z-index: 10060;
}
</style>
