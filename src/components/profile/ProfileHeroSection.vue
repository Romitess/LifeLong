<template>
  <section class="profile-hero">
    <div class="profile-hero__particles" />
    <div class="profile-hero__overlay" />
    <GoldenUnderline />
    <div class="section-container profile-hero__content">
      <div class="row items-center justify-between q-col-gutter-lg">
        <!-- Avatar and Name Info -->
        <div class="col-12 col-lg-auto">
          <div class="row items-center no-wrap q-gutter-lg">
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
              <div
                class="profile-hero__camera cursor-pointer"
                @click.stop.prevent="triggerAvatarUpload"
                @mousedown.stop.prevent
              >
                <q-icon name="photo_camera" size="16px" color="white" />
              </div>
              <input
                ref="avatarInput"
                type="file"
                accept="image/*"
                style="display: none"
                @change="onAvatarSelected"
              />
            </div>
            <div class="column">
              <div class="text-overline text-white" style="opacity: 0.6; letter-spacing: 0.12em">
                {{ heroRoleLabel }}
              </div>
              <div class="text-h4 text-weight-bolder text-white q-mt-xs">
                {{ authStore.user?.firstNameTh }} {{ authStore.user?.lastNameTh }}
              </div>
              <div class="row items-center q-gutter-sm q-mt-xs">
                <q-badge rounded color="positive" label="Active" class="text-weight-bold" />
                <span class="text-body2 text-white" style="opacity: 0.7">
                  {{ idLabel }} : {{ authStore.user?.studentId }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Stats Cards -->
        <div v-if="profileStats.length > 0" class="col-12 col-lg-auto">
          <div class="row q-gutter-md justify-center">
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
    </div>
  </section>

  <!-- Crop Dialog (uses central BaseImageCropperDialog, bakes to canvas for avatar) -->
  <BaseImageCropperDialog
    v-model="showCropDialog"
    :image-src="cropImageSrc"
    :aspect="1"
    mask-shape="circle"
    :title="$t('profile.dialogs.cropAvatar')"
    @save="onCropDialogSave()"
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
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import GoldenUnderline from 'src/components/common/GoldenUnderline.vue';
import BaseImageCropperDialog from 'src/components/base/BaseImageCropperDialog.vue';
import { useAuthStore } from 'src/stores/auth-store';
import { useProfileAvatar } from 'src/composables/use-profile-avatar';
import { useAvatarCrop } from 'src/composables/use-avatar-crop';

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
const { fullAvatarUrl } = useProfileAvatar();

const pendingFullAvatarSrc = ref<string | null>(null);
const showFullAvatar = ref(false);

const currentAvatarUrl = computed<string>(() => authStore.user?.avatar || '');
const displayAvatarUrl = computed<string>(() => fullAvatarUrl.value || currentAvatarUrl.value);

const {
  showCropDialog,
  cropImageSrc,
  avatarInput,
  triggerAvatarUpload,
  onAvatarSelected,
  saveCroppedAvatar,
} = useAvatarCrop(fullAvatarUrl, pendingFullAvatarSrc);

// Avatar stays as baked canvas dataURL until backend persist is ready
function onCropDialogSave(): void {
  saveCroppedAvatar();
}
</script>

<style lang="scss" scoped>
.profile-hero {
  position: relative;
  background: linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #234e70 100%);
  padding: 0;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -45%;
    bottom: -45%;
    left: -38%;
    width: 34%;
    background: linear-gradient(
      105deg,
      transparent 0%,
      rgba(255, 255, 255, 0.02) 18%,
      rgba(255, 255, 255, 0.2) 46%,
      rgba(255, 214, 102, 0.18) 52%,
      rgba(255, 255, 255, 0.08) 62%,
      transparent 100%
    );
    filter: blur(10px);
    opacity: 0;
    pointer-events: none;
    transform: skewX(-18deg) translateX(0);
    animation: profileHeroLightSweep 12s ease-in-out infinite;
    z-index: 1;
  }

  &__particles {
    position: absolute;
    inset: 0;
    background:
      radial-gradient(circle at 15% 25%, rgba($primary, 0.3), transparent 40%),
      radial-gradient(circle at 85% 75%, rgba(35, 78, 112, 0.4), transparent 40%),
      radial-gradient(circle at 50% 0%, rgba(255, 255, 255, 0.04), transparent 60%);
    z-index: 0;
  }

  &__overlay {
    position: absolute;
    inset: 0;
    background:
      repeating-linear-gradient(
        0deg,
        rgba(255, 255, 255, 0.015) 0px,
        rgba(255, 255, 255, 0.015) 1px,
        transparent 1px,
        transparent 48px
      ),
      repeating-linear-gradient(
        90deg,
        rgba(255, 255, 255, 0.015) 0px,
        rgba(255, 255, 255, 0.015) 1px,
        transparent 1px,
        transparent 48px
      );
    z-index: 0;
  }

  &__content {
    position: relative;
    z-index: 2;
    padding: 52px 24px 44px;
  }

  &__avatar-wrap {
    position: relative;
    z-index: 2;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05);

      .profile-hero__camera {
        opacity: 1;
        transform: scale(1);
      }
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

  &__camera {
    position: absolute;
    bottom: 2px;
    right: 2px;
    z-index: 3;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: $primary;
    border: 2px solid white;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.85;
    transform: scale(0.9);
    transition: all 0.2s ease;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
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
    border-radius: 12px;
    background: linear-gradient(
      135deg,
      var(--profile-stat-accent, #{$primary}) 0%,
      var(--profile-stat-accent-strong, rgba($primary, 0.88)) 100%
    );
    box-shadow: 0 12px 24px var(--profile-stat-shadow, rgba($primary, 0.22));
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
  border-radius: 24px !important;
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

@keyframes profileHeroLightSweep {
  0%,
  42% {
    opacity: 0;
    transform: skewX(-18deg) translateX(0);
  }
  50% {
    opacity: 0.86;
  }
  66% {
    opacity: 0.48;
  }
  78%,
  100% {
    opacity: 0;
    transform: skewX(-18deg) translateX(520%);
  }
}
</style>
