<template>
  <section class="profile-hero">
    <GoldenUnderline />
    <div class="section-container profile-hero__content">
      <div class="profile-hero__layout">
        <!-- Avatar and Name Info -->
        <div class="profile-hero__identity-row">
          <div class="profile-hero__avatar-wrap">
            <q-avatar
              size="100px"
              class="profile-hero__avatar cursor-pointer"
              @click.stop.prevent="showFullAvatar = true"
              @mousedown.stop.prevent
            >
              <img
                v-if="currentAvatarUrl"
                :src="currentAvatarUrl"
                class="profile-hero__avatar-image"
                alt="Profile avatar"
                loading="eager"
                decoding="sync"
                @click.stop.prevent="showFullAvatar = true"
                @mousedown.stop.prevent
              />
              <q-icon v-else name="person" size="56px" color="white" />
            </q-avatar>
            <div class="profile-hero__avatar-actions">
              <q-btn
                round
                dense
                unelevated
                icon="photo_camera"
                color="primary"
                class="profile-hero__avatar-action profile-hero__avatar-action--edit"
                :loading="isSavingAvatar"
                :disable="isSavingAvatar || isDeletingAvatar"
                :aria-label="$t('profile.avatar.change')"
                @click.stop.prevent="triggerAvatarUpload"
                @mousedown.stop.prevent
              >
                <q-tooltip anchor="center right" self="center left" :offset="[10, 0]">
                  {{ $t('profile.avatar.change') }}
                </q-tooltip>
              </q-btn>
              <q-btn
                v-if="canRemoveAvatar"
                round
                dense
                unelevated
                icon="delete"
                text-color="negative"
                class="profile-hero__avatar-action profile-hero__avatar-action--delete"
                :loading="isDeletingAvatar"
                :disable="isDeletingAvatar || isSavingAvatar"
                :aria-label="$t('profile.avatar.delete')"
                @click.stop.prevent="showDeleteAvatarDialog = true"
                @mousedown.stop.prevent
              >
                <q-tooltip anchor="center right" self="center left" :offset="[10, 0]">
                  {{ $t('profile.avatar.delete') }}
                </q-tooltip>
              </q-btn>
            </div>
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="onAvatarSelected"
            />
          </div>
          <div class="profile-hero__identity-copy">
            <div class="text-overline text-white" style="opacity: 0.7; letter-spacing: 0.12em">
              {{ heroRoleLabel }}
            </div>
            <div class="text-h4 text-weight-bolder text-white q-mt-xs">
              {{ displayName }}
            </div>
            <div class="row items-center q-gutter-sm q-mt-xs">
              <q-badge rounded color="primary" label="Active" class="text-weight-bold" />
              <span class="text-body2 text-white" style="opacity: 0.75">
                {{ idLabel }} : {{ displayIdentifier }}
              </span>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div v-if="profileStats.length > 0" class="profile-hero__stats">
          <div
            v-for="stat in profileStats"
            :key="stat.label"
            class="profile-stat-card"
            :style="stat.tone"
          >
            <div class="profile-stat-card__icon-wrap">
              <q-icon :name="stat.icon" size="24px" color="white" />
            </div>
            <div class="profile-stat-card__info">
              <div class="profile-stat-card__value">{{ stat.value }}</div>
              <div class="profile-stat-card__label">{{ stat.label }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- Crop Dialog (uses central BaseImageCropperDialog, bakes to canvas for avatar) -->
  <BaseImageCropperDialog
    v-model="showCropDialog"
    :image-src="cropImageSrc"
    :aspect="1"
    mask-shape="circle"
    :output-width="400"
    :output-height="400"
    :title="$t('profile.dialogs.cropAvatar')"
    @save="onCropDialogSave"
  />

  <!-- Full Avatar Dialog -->
  <q-dialog v-model="showFullAvatar" transition-show="scale" transition-hide="scale">
    <q-card class="full-avatar-dialog">
      <q-btn
        flat
        round
        dense
        icon="close"
        color="white"
        class="full-avatar-dialog__close"
        v-close-popup
      />
      <img
        v-if="displayAvatarUrl"
        :src="displayAvatarUrl"
        class="full-avatar-dialog__image"
        alt="Profile image"
      />
      <q-icon v-else name="person" size="160px" color="white" class="q-pa-xl" />
    </q-card>
  </q-dialog>

  <BaseSystemDialog
    v-model="showDeleteAvatarDialog"
    variant="danger"
    icon="delete"
    confirm-icon="delete"
    :title="$t('profile.dialogs.deleteAvatarTitle')"
    :message="$t('profile.dialogs.deleteAvatarSub')"
    :confirm-label="$t('profile.avatar.delete')"
    :cancel-label="$t('profile.dialogs.notNow')"
    :loading="isDeletingAvatar"
    @confirm="deleteAvatar"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import GoldenUnderline from 'src/components/common/GoldenUnderline.vue';
import BaseImageCropperDialog from 'src/components/base/BaseImageCropperDialog.vue';
import BaseSystemDialog from 'src/components/base/BaseSystemDialog.vue';
import { useAuthStore } from 'src/stores/auth-store';
import { useProfileAvatar } from 'src/composables/use-profile-avatar';
import { useAvatarCrop } from 'src/composables/use-avatar-crop';
import type { CropBox } from 'src/composables/use-image-cropper';

interface ProfileStatCardItem {
  label: string;
  value: number;
  icon: string;
  tone: Record<string, string>;
}

defineProps<{
  heroRoleLabel: string;
  profileStats: ProfileStatCardItem[];
  idLabel: string;
}>();

const authStore = useAuthStore();
const $q = useQuasar();
const { t } = useI18n();
const { fullAvatarUrl } = useProfileAvatar();

const pendingFullAvatarSrc = ref<string | null>(null);
const showFullAvatar = ref(false);
const showDeleteAvatarDialog = ref(false);
const isSavingAvatar = ref(false);
const isDeletingAvatar = ref(false);

const currentAvatarUrl = computed<string>(() => authStore.user?.avatar || '');
const displayAvatarUrl = computed<string>(() => fullAvatarUrl.value || currentAvatarUrl.value);
const displayName = computed(() => {
  const nameTh = [authStore.user?.firstNameTh, authStore.user?.lastNameTh]
    .filter(Boolean)
    .join(' ')
    .trim();
  const nameEn = [authStore.user?.firstNameEn, authStore.user?.lastNameEn]
    .filter(Boolean)
    .join(' ')
    .trim();
  return nameTh || nameEn || authStore.user?.username || '-';
});
const displayIdentifier = computed(
  () => authStore.user?.studentId || authStore.user?.username || authStore.user?.email || '-',
);

onMounted(() => {
  void authStore.fetchProfile().catch((error: unknown) => {
    console.error('Failed to refresh profile identity', error);
  });
});

const canRemoveAvatar = computed<boolean>(() => {
  const avatar = authStore.user?.avatar || '';
  return Boolean(avatar && !avatar.includes('api.dicebear.com'));
});

const {
  showCropDialog,
  cropImageSrc,
  avatarInput,
  triggerAvatarUpload,
  onAvatarSelected,
  saveCroppedAvatar,
} = useAvatarCrop(fullAvatarUrl, pendingFullAvatarSrc);

async function onCropDialogSave(_cropBox: CropBox, file?: File): Promise<void> {
  if (isSavingAvatar.value) return;
  isSavingAvatar.value = true;
  try {
    await saveCroppedAvatar(file);
    $q.notify({
      type: 'positive',
      message: t('profile.notifications.avatarSaved'),
      position: 'top',
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: t('profile.notifications.avatarSaveError'),
      position: 'top',
    });
  } finally {
    isSavingAvatar.value = false;
  }
}

async function deleteAvatar(): Promise<void> {
  if (isDeletingAvatar.value) return;
  isDeletingAvatar.value = true;
  try {
    await authStore.deleteAvatar();
    fullAvatarUrl.value = '';
    showDeleteAvatarDialog.value = false;
    $q.notify({
      type: 'positive',
      message: t('profile.notifications.avatarDeleted'),
      position: 'top',
    });
  } catch {
    $q.notify({
      type: 'negative',
      message: t('profile.notifications.avatarDeleteError'),
      position: 'top',
    });
  } finally {
    isDeletingAvatar.value = false;
  }
}
</script>

<style lang="scss" scoped>
.profile-hero {
  position: relative;
  // พื้นเข้ม navy-teal + ความสูงให้ตรงกับ admin hero (AppPageHero): gradient ล้วน, ไม่มี overlay
  background:
    linear-gradient(135deg, rgba(16, 35, 63, 0.98), rgba(20, 84, 106, 0.92)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent);
  padding: 56px 0 36px;
  overflow: hidden;

  &__content {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-height: 168px;
  }

  &__layout {
    display: grid;
    grid-template-columns: minmax(0, auto) minmax(0, 1fr);
    gap: 28px;
    align-items: center;
  }

  &__identity-row {
    display: flex;
    align-items: center;
    min-width: 0;
    gap: 28px;
  }

  &__identity-copy {
    min-width: 0;
  }

  &__stats {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    align-items: center;
    justify-content: flex-end;
    min-width: 0;
  }

  @media (max-width: 900px) {
    padding: 44px 0 28px;

    .profile-hero__content {
      min-height: auto;
    }

    .profile-hero__layout {
      grid-template-columns: 1fr;
      gap: 24px;
    }

    .profile-hero__identity-row {
      align-items: flex-start;
      gap: 18px;
    }

    .profile-hero__stats {
      justify-content: flex-start;
    }
  }

  @media (max-width: 560px) {
    .profile-hero__identity-row {
      flex-wrap: wrap;
    }
  }

  &__avatar-wrap {
    position: relative;
    z-index: 2;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  &__avatar {
    background: linear-gradient(135deg, rgba($primary, 0.5), rgba(35, 78, 112, 0.6));
    border: 3px solid rgba(255, 255, 255, 0.25);
    overflow: hidden;
    position: relative;
    z-index: 2;
  }

  &__avatar-image {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__avatar-actions {
    position: absolute;
    right: -12px;
    bottom: 6px;
    z-index: 3;
    display: grid;
    gap: 8px;
    align-items: center;
  }

  &__avatar-action {
    width: 34px;
    height: 34px;
    border: 2px solid rgba(255, 255, 255, 0.96);
    box-shadow: 0 10px 22px rgba(15, 23, 42, 0.28);
    transition:
      transform 0.18s ease,
      box-shadow 0.18s ease,
      background-color 0.18s ease;

    &:hover,
    &:focus-visible {
      transform: translateY(-1px);
      box-shadow: 0 14px 28px rgba(15, 23, 42, 0.34);
    }

    &--edit {
      background: var(--color-gold) !important;
      color: white;
    }

    &--delete {
      background: white !important;
    }
  }
}

.profile-stat-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 20px;
  background: linear-gradient(
    135deg,
    var(--profile-stat-surface, rgba(255, 255, 255, 0.1)) 0%,
    rgba(255, 255, 255, 0.06) 100%
  );
  border: 1px solid var(--profile-stat-border, rgba(255, 255, 255, 0.14));
  border-radius: 14px;
  backdrop-filter: blur(12px);
  min-width: 140px;
  transition: all 0.3s ease;

  &:hover {
    background: linear-gradient(
      135deg,
      var(--profile-stat-surface-hover, rgba(255, 255, 255, 0.16)) 0%,
      rgba(255, 255, 255, 0.1) 100%
    );
    transform: translateY(-2px);
  }

  &:hover &__icon-wrap {
    transform: scale(1.08);
  }

  &__icon-wrap {
    width: 44px;
    height: 44px;
    border-radius: var(--radius-md);
    background: linear-gradient(
      135deg,
      var(--profile-stat-accent, #{$primary}) 0%,
      var(--profile-stat-accent-strong, rgba($primary, 0.88)) 100%
    );
    // ไม่มี glow (colored shadow) — flat ตามที่เจ้าของงานต้องการ
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    transition: transform 0.24s ease;
  }

  &__info {
    display: flex;
    flex-direction: column;
  }

  &__value {
    font-size: 1.6rem;
    font-weight: 800;
    line-height: 1;
    color: white;
  }

  &__label {
    font-size: 0.72rem;
    color: rgba(255, 255, 255, 0.72);
    font-weight: 600;
    margin-top: 4px;
  }
}

// Full Avatar Dialog
.full-avatar-dialog {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  max-width: 92vw;
  max-height: 92vh;
  padding: 16px;
  border-radius: var(--radius-2xl) !important; // token = 24px
  background: rgba(15, 23, 42, 0.88) !important;
  box-shadow: 0 24px 60px rgba(0, 0, 0, 0.35) !important;
  overflow: visible;

  &__close {
    position: absolute;
    top: -12px;
    right: -12px;
    z-index: 2;
    background: rgba(17, 24, 39, 0.82);
  }

  &__image {
    display: block;
    max-width: min(720px, 86vw);
    max-height: 86vh;
    border-radius: 0;
    object-fit: contain;
  }
}

// Crop Dialog
.crop-dialog {
  width: 400px;
  max-width: 95vw;
  border-radius: 18px !important;
  overflow: hidden;

  &__header {
    border-bottom: 1px solid rgba(0, 0, 0, 0.06);
  }

  &__viewport {
    position: relative;
    width: 100%;
    height: 320px;
    background: #1a1a2e;
    overflow: hidden;
    cursor: grab;
    user-select: none;

    &:active {
      cursor: grabbing;
    }
  }

  &__image-container {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  &__image {
    width: 280px;
    height: 280px;
    object-fit: cover;
    pointer-events: none;
    will-change: transform;
  }

  &__circle-mask {
    position: absolute;
    inset: 0;
    pointer-events: none;
    background: radial-gradient(
      circle 140px at center,
      transparent 139px,
      rgba(0, 0, 0, 0.65) 140px
    );

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 280px;
      height: 280px;
      transform: translate(-50%, -50%);
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.5);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.1);
    }
  }
}
</style>
