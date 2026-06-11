<template>
  <q-card flat bordered class="profile-menu-card">
    <q-list padding>
      <q-item-label
        header
        class="text-weight-bold text-grey-8 text-caption"
        style="letter-spacing: 0.06em"
      >
        {{ $t('profile.menu.header') }}
      </q-item-label>
      <q-item
        v-for="menu in menuItems"
        :key="menu.value"
        clickable
        v-ripple
        tag="a"
        :href="resolveFullUrl(`/profile/${menu.slug ?? menu.value}`)"
        :active="modelValue === menu.value"
        active-class="profile-menu-item--active"
        class="profile-menu-item"
        @click.prevent="onMenuClick(menu.value, $event)"
      >
        <q-item-section avatar>
          <q-icon
            :name="menu.icon"
            :color="modelValue === menu.value ? 'primary' : 'grey-6'"
            size="20px"
          />
        </q-item-section>
        <q-item-section>
          <q-item-label
            :class="modelValue === menu.value ? 'text-primary text-weight-bold' : 'text-grey-8'"
            class="text-body2"
          >
            {{ menu.label }}
          </q-item-label>
        </q-item-section>
        <q-item-section v-if="menu.value === 'my-courses' && myRegistrationsCount > 0" side>
          <q-badge rounded color="primary" :label="myRegistrationsCount" />
        </q-item-section>
        <q-item-section v-if="menu.value === 'saved-courses' && myBookmarksCount > 0" side>
          <q-badge rounded color="amber-8" :label="myBookmarksCount" />
        </q-item-section>
        <q-item-section v-if="menu.value === 'my-certificates' && myCertificatesCount > 0" side>
          <q-badge rounded color="positive" :label="myCertificatesCount" />
        </q-item-section>
      </q-item>
    </q-list>

    <q-separator />
    <div class="q-pa-md">
      <div class="text-caption text-grey-6 q-mb-xs">
        {{ $t('profile.hero.studentId') }}
      </div>
      <div class="text-weight-bolder text-dark">{{ studentId }}</div>
      <q-btn
        flat
        no-caps
        color="primary"
        :label="$t('profile.menu.studentCard')"
        icon="badge"
        class="full-width profile-sidebar-link-btn"
        align="left"
        padding="8px 12px"
        @click="$emit('show-student-card')"
      />
      <q-btn
        flat
        no-caps
        color="primary"
        :label="$t('profile.menu.changePassword')"
        icon="lock_reset"
        class="full-width profile-sidebar-link-btn"
        align="left"
        padding="8px 12px"
        href="https://myid.buu.ac.th"
        target="_blank"
        rel="noopener noreferrer"
      />
      <q-btn
        flat
        no-caps
        color="primary"
        :label="$t('profile.menu.learnerDocuments')"
        icon="description"
        class="full-width profile-sidebar-link-btn"
        align="left"
        padding="8px 12px"
        href="https://drive.google.com/drive/folders/1ZEzkuEd5tVK-9BlTEzflDDS5ibrhOdOi"
        target="_blank"
        rel="noopener noreferrer"
      />
    </div>
  </q-card>
</template>

<script setup lang="ts">
import { isNewTabClick, resolveFullUrl } from 'src/composables/use-nav-link';

interface MenuItem {
  label: string;
  value: string;
  slug?: string;
  icon: string;
}

defineProps<{
  modelValue: string;
  menuItems: MenuItem[];
  myRegistrationsCount: number;
  myBookmarksCount: number;
  myCertificatesCount: number;
  studentId: string;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'show-student-card': [];
}>();

function onMenuClick(value: string, event: Event): void {
  if (isNewTabClick(event)) {
    return;
  }
  emit('update:modelValue', value);
}
</script>

<style lang="scss" scoped>
.profile-menu-card {
  border-radius: 14px !important;
  overflow: hidden;
  position: sticky;
  top: 140px;
  min-height: 490px;
  background: #ffffff;
  border: 1px solid rgba(17, 24, 39, 0.12) !important;
  box-shadow: 0 12px 30px rgba(17, 24, 39, 0.06) !important;
}

.profile-menu-item {
  border-radius: 10px;
  margin: 4px 8px;
  min-height: 48px;
  padding: 0 12px;
  transition: all 0.2s ease;

  &--active {
    background: rgba($primary, 0.08) !important;
    box-shadow: inset 4px 0 0 $primary;
  }

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

.profile-sidebar-link-btn {
  border-radius: 10px;
  margin: 4px 8px;
  min-height: 56px;
  transition: all 0.2s ease;

  &:hover {
    background: rgba($primary, 0.04);
  }

  :deep(.q-btn__content) {
    width: 100%;
    justify-content: flex-start;
    font-size: 0.95rem;
    font-weight: 500;
  }

  :deep(.q-icon) {
    font-size: 20px;
  }

  :deep(.on-left) {
    margin-right: 10px;
  }
}
</style>
