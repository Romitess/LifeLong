<template>
  <section class="profile-hero">
    <GoldenUnderline />
    <div class="section-container profile-hero__content">
      <div class="profile-hero__layout" :class="`profile-hero__layout--${statCardVariant}`">
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
            </div>
            <input
              ref="avatarInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="onAvatarSelected"
            />
            <input
              ref="viewerPhotoInput"
              type="file"
              accept="image/*"
              style="display: none"
              @change="onViewerPhotoSelected"
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
        <div
          v-if="profileStats.length > 0"
          class="profile-hero__stats"
          :class="`profile-hero__stats--${statCardVariant}`"
        >
          <div
            v-for="stat in profileStats"
            :key="stat.label"
            class="profile-stat-card"
            :class="`profile-stat-card--${statCardVariant}`"
            :style="stat.tone"
          >
            <div class="profile-stat-card__icon-wrap">
              <q-icon :name="stat.icon" size="24px" color="white" />
            </div>
            <div class="profile-stat-card__info">
              <div class="profile-stat-card__value">{{ formatStatValue(stat.value) }}</div>
              <div class="profile-stat-card__label">{{ formatStatLabel(stat) }}</div>
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
  <q-dialog
    v-model="showFullAvatar"
    transition-show="fade"
    transition-hide="fade"
    maximized
    class="profile-avatar-viewer-dialog"
    @show="resetSelectedAvatar"
  >
    <q-card class="profile-avatar-viewer">
      <q-btn
        flat
        round
        dense
        icon="close"
        color="white"
        class="profile-avatar-viewer__close"
        v-close-popup
      />

      <img
        v-if="selectedAvatarPreviewUrl"
        :src="selectedAvatarPreviewUrl"
        class="profile-avatar-viewer__backdrop-image"
        alt=""
        aria-hidden="true"
      />
      <div v-else class="profile-avatar-viewer__fallback-backdrop" aria-hidden="true" />

      <div class="profile-avatar-viewer__shade" aria-hidden="true" />

      <div class="profile-avatar-viewer__stage">
        <button
          type="button"
          class="profile-avatar-viewer__add"
          aria-label="Add profile photo"
          @click.stop.prevent="showAddChoice = !showAddChoice"
          @mousedown.stop.prevent
        >
          <q-icon name="add" size="32px" color="white" />
        </button>

        <div v-if="showAddChoice" class="profile-avatar-viewer__add-menu">
          <button
            type="button"
            class="profile-avatar-viewer__add-option"
            @click.stop.prevent="addAccountAvatarOption"
            @mousedown.stop.prevent
          >
            เพิ่มอวตาร
          </button>
          <button
            type="button"
            class="profile-avatar-viewer__add-option"
            @click.stop.prevent="chooseViewerPhotoUpload"
            @mousedown.stop.prevent
          >
            เพิ่มรูปภาพ
          </button>
        </div>

        <TransitionGroup
          v-if="viewerPhotoOptions.length > 0"
          name="profile-avatar-option"
          tag="div"
          class="profile-avatar-viewer__photo-row"
          :class="{ 'profile-avatar-viewer__photo-row--swapping': isAvatarSwapping }"
        >
          <button
            v-for="(photoUrl, index) in viewerPhotoOptions"
            :key="`${photoUrl}-${index}`"
            type="button"
            class="profile-avatar-viewer__photo-option"
            :class="{ 'profile-avatar-viewer__photo-option--active': photoUrl === selectedAvatarUrl }"
            aria-label="Preview added profile photo"
            @click.stop.prevent="selectViewerPhoto(photoUrl)"
            @mousedown.stop.prevent
          >
            <img :src="photoUrl" alt="" />
            <span
              class="profile-avatar-viewer__photo-delete"
              role="button"
              tabindex="0"
              :aria-label="$t('profile.avatar.delete')"
              @click.stop.prevent="promptDeleteViewerAvatar(photoUrl)"
              @keydown.enter.stop.prevent="promptDeleteViewerAvatar(photoUrl)"
              @keydown.space.stop.prevent="promptDeleteViewerAvatar(photoUrl)"
            >
              <q-icon name="delete" size="15px" color="white" />
            </span>
          </button>
        </TransitionGroup>

        <div class="profile-avatar-viewer__main-wrap">
          <Transition name="profile-avatar-main" mode="out-in">
            <div
              :key="selectedAvatarPreviewUrl || 'empty-profile-avatar'"
              class="profile-avatar-viewer__main"
              :class="{ 'profile-avatar-viewer__main--swapping': isAvatarSwapping }"
            >
              <img
                v-if="selectedAvatarPreviewUrl"
                :src="selectedAvatarPreviewUrl"
                class="profile-avatar-viewer__image"
                alt="Profile image"
              />
              <q-icon v-else name="person" size="132px" color="white" />
            </div>
          </Transition>
          <button
            type="button"
            class="profile-avatar-viewer__edit"
            aria-label="Change profile photo"
            @click.stop.prevent="triggerAvatarUpload"
            @mousedown.stop.prevent
          >
            <q-icon name="edit" size="18px" color="white" />
          </button>
          <button
            v-if="canDeleteSelectedAvatar"
            type="button"
            class="profile-avatar-viewer__delete"
            :aria-label="$t('profile.avatar.delete')"
            @click.stop.prevent="promptDeleteViewerAvatar(selectedAvatarPreviewUrl)"
            @mousedown.stop.prevent
          >
            <q-icon name="delete" size="18px" color="white" />
          </button>
        </div>

        <button
          type="button"
          class="profile-avatar-viewer__confirm"
          :disabled="!selectedAvatarPreviewUrl || selectedAvatarPreviewUrl === currentAvatarUrl"
          @click.stop.prevent="applySelectedAvatar"
          @mousedown.stop.prevent
        >
          แสดงเป็นโปรไฟล์หลัก
        </button>
      </div>
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
import {
  getProfileAvatarOptions,
  saveProfileAvatarOptions,
  saveProfileAvatarUrl,
  uploadProfileAvatarOption,
  uploadProfileAvatarDataUrl,
} from 'src/services/profile-avatar.service';

interface ProfileStatCardItem {
  label: string;
  value: number;
  icon: string;
  tone: Record<string, string>;
}

withDefaults(defineProps<{
  heroRoleLabel: string;
  profileStats: ProfileStatCardItem[];
  idLabel: string;
  statCardVariant?: 'glass' | 'surface';
}>(), {
  statCardVariant: 'glass',
});

const authStore = useAuthStore();
const $q = useQuasar();
const { t } = useI18n();
const { fullAvatarUrl, avatarPortraitUrl } = useProfileAvatar();

const pendingFullAvatarSrc = ref<string | null>(null);
const showFullAvatar = ref(false);
const showDeleteAvatarDialog = ref(false);
const isSavingAvatar = ref(false);
const isDeletingAvatar = ref(false);
const pendingDeleteAvatarUrl = ref('');
const selectedAvatarUrl = ref('');
const mainAvatarBeforeSelection = ref('');
const isAvatarSwapping = ref(false);
const showAddChoice = ref(false);
const viewerPhotoInput = ref<HTMLInputElement | null>(null);
const viewerPhotoOptions = ref<string[]>([]);
let avatarSwapTimer: number | null = null;
const AVATAR_SWAP_ANIMATION_MS = 620;
const DEFAULT_PROFILE_AVATAR_FILE_NAME = 'profile-avatar.png';
const DEFAULT_PROFILE_PHOTO_FILE_NAME = 'profile-photo.png';

const currentAvatarUrl = computed<string>(() => authStore.user?.avatar || '');
const displayAvatarUrl = computed<string>(() => fullAvatarUrl.value || currentAvatarUrl.value);
const selectedAvatarPreviewUrl = computed<string>(() => selectedAvatarUrl.value || displayAvatarUrl.value);
const canDeleteSelectedAvatar = computed<boolean>(() => {
  const selectedUrl = selectedAvatarPreviewUrl.value;
  return Boolean(selectedUrl && !selectedUrl.includes('api.dicebear.com'));
});
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
    const deleteUrl = pendingDeleteAvatarUrl.value || selectedAvatarPreviewUrl.value;
    const isDeletingCurrentAvatar = deleteUrl === currentAvatarUrl.value;
    viewerPhotoOptions.value = viewerPhotoOptions.value.filter((photoUrl) => photoUrl !== deleteUrl);

    if (isDeletingCurrentAvatar) {
      await authStore.deleteAvatar();
      fullAvatarUrl.value = '';
      selectedAvatarUrl.value = authStore.user?.avatar || '';
      mainAvatarBeforeSelection.value = selectedAvatarUrl.value;
    } else if (selectedAvatarUrl.value === deleteUrl) {
      selectedAvatarUrl.value = currentAvatarUrl.value;
    }

    saveViewerPhotoOptions();
    showDeleteAvatarDialog.value = false;
    pendingDeleteAvatarUrl.value = '';
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

function promptDeleteViewerAvatar(photoUrl: string): void {
  if (!photoUrl || photoUrl.includes('api.dicebear.com')) return;
  pendingDeleteAvatarUrl.value = photoUrl;
  showDeleteAvatarDialog.value = true;
}

function getUniqueViewerPhotoOptions(photoUrls: string[]): string[] {
  return Array.from(new Set(photoUrls.filter(Boolean)));
}

async function loadStoredViewerPhotoOptions(): Promise<void> {
  try {
    const storedOptions = await getProfileAvatarOptions();
    viewerPhotoOptions.value = getUniqueViewerPhotoOptions(storedOptions).filter(
      (photoUrl) => photoUrl !== currentAvatarUrl.value,
    );
  } catch (error) {
    console.warn('Failed to load profile viewer photo options from backend', error);
  }
}

function saveViewerPhotoOptions(): void {
  const nextStoredOptions = getUniqueViewerPhotoOptions([
    ...viewerPhotoOptions.value,
    selectedAvatarUrl.value,
  ]).filter((photoUrl) => photoUrl !== currentAvatarUrl.value);

  void saveProfileAvatarOptions(nextStoredOptions).catch((error: unknown) => {
    console.warn('Failed to save profile viewer photo options to backend', error);
  });
}

function resetSelectedAvatar(): void {
  selectedAvatarUrl.value = currentAvatarUrl.value;
  mainAvatarBeforeSelection.value = currentAvatarUrl.value;
  void loadStoredViewerPhotoOptions();
  isAvatarSwapping.value = false;
  if (avatarSwapTimer) {
    window.clearTimeout(avatarSwapTimer);
    avatarSwapTimer = null;
  }
}

async function applySelectedAvatar(): Promise<void> {
  if (!selectedAvatarPreviewUrl.value || selectedAvatarPreviewUrl.value === currentAvatarUrl.value) {
    return;
  }

  try {
    $q.loading.show({ message: t('profile.notifications.processing') || 'Uploading avatar...' });
    const previousAvatarUrl = mainAvatarBeforeSelection.value || currentAvatarUrl.value;
    const savedAvatar = /^data:image\//i.test(selectedAvatarPreviewUrl.value)
      ? await uploadProfileAvatarDataUrl(
          selectedAvatarPreviewUrl.value,
          DEFAULT_PROFILE_AVATAR_FILE_NAME,
        )
      : await saveProfileAvatarUrl(selectedAvatarPreviewUrl.value);
    const nextAvatarUrl = savedAvatar.avatarUrl;

    authStore.setAvatar(nextAvatarUrl);
    fullAvatarUrl.value = nextAvatarUrl;
    isAvatarSwapping.value = true;
    selectedAvatarUrl.value = nextAvatarUrl;
    mainAvatarBeforeSelection.value = nextAvatarUrl;
    viewerPhotoOptions.value = [
      ...(previousAvatarUrl ? [previousAvatarUrl] : []),
      ...viewerPhotoOptions.value.filter(
        (photoUrl) => photoUrl !== nextAvatarUrl && photoUrl !== previousAvatarUrl,
      ),
    ];
    saveViewerPhotoOptions();
    if (avatarSwapTimer) {
      window.clearTimeout(avatarSwapTimer);
    }
    avatarSwapTimer = window.setTimeout(() => {
      isAvatarSwapping.value = false;
      avatarSwapTimer = null;
    }, AVATAR_SWAP_ANIMATION_MS);

    $q.notify({
      type: 'positive',
      message: t('profile.notifications.avatarSaved'),
      position: 'top',
    });
  } catch (error) {
    console.error('Failed to apply selected profile avatar', error);
    $q.notify({
      type: 'negative',
      message: t('profile.notifications.profileSaveFailed'),
      position: 'top',
    });
  } finally {
    $q.loading.hide();
  }
}

function addAccountAvatarOption(): void {
  const accountAvatarUrl = avatarPortraitUrl.value || currentAvatarUrl.value;
  if (!accountAvatarUrl) return;

  viewerPhotoOptions.value = [
    accountAvatarUrl,
    ...viewerPhotoOptions.value.filter(
      (photoUrl) => photoUrl !== accountAvatarUrl && photoUrl !== selectedAvatarPreviewUrl.value,
    ),
  ];
  saveViewerPhotoOptions();
  showAddChoice.value = false;
}

function chooseViewerPhotoUpload(): void {
  showAddChoice.value = false;
  viewerPhotoInput.value?.click();
}

async function onViewerPhotoSelected(event: Event): Promise<void> {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  target.value = '';
  if (!file) return;

  try {
    $q.loading.show({ message: t('profile.notifications.processing') || 'Uploading avatar...' });
    const uploadedPhoto = await uploadProfileAvatarOption(
      file,
      file.name || DEFAULT_PROFILE_PHOTO_FILE_NAME,
    );
    viewerPhotoOptions.value = [
      uploadedPhoto.avatarUrl,
      ...viewerPhotoOptions.value.filter(
        (photoUrl) =>
          photoUrl !== uploadedPhoto.avatarUrl && photoUrl !== selectedAvatarPreviewUrl.value,
      ),
    ];
    saveViewerPhotoOptions();
  } catch (error) {
    console.error('Failed to upload profile photo option', error);
    $q.notify({
      type: 'negative',
      message: t('profile.notifications.profileSaveFailed'),
      position: 'top',
    });
  } finally {
    $q.loading.hide();
  }
}

function selectViewerPhoto(photoUrl: string): void {
  const previousPreviewUrl = selectedAvatarPreviewUrl.value;
  selectedAvatarUrl.value = photoUrl;
  viewerPhotoOptions.value = [
    ...(previousPreviewUrl ? [previousPreviewUrl] : []),
    ...viewerPhotoOptions.value.filter(
      (optionUrl) => optionUrl !== photoUrl && optionUrl !== previousPreviewUrl,
    ),
  ];
  saveViewerPhotoOptions();
}

function formatStatValue(value: number): string {
  return value.toLocaleString('th-TH');
}

function formatStatLabel(stat: ProfileStatCardItem): string {
  if (stat.icon === 'forum') return 'ห้องสนทนา';
  return stat.label;
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

    &--surface {
      grid-template-columns: 1fr;
      gap: 28px;
    }
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

    &--surface {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 14px;
      width: 100%;
      justify-content: stretch;
    }
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

.profile-stat-card--surface {
  position: relative;
  overflow: hidden;
  min-width: 0;
  min-height: 78px;
  padding: 14px;
  gap: 12px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  border-radius: 14px;
  background:
    radial-gradient(
      circle at 100% 100%,
      var(--profile-stat-surface, rgba(245, 166, 35, 0.14)),
      transparent 52%
    ),
    rgba(255, 255, 255, 0.96);
  backdrop-filter: none;
  box-shadow: 0 10px 22px rgba(15, 23, 42, 0.08);

  &:first-child {
    border-color: var(--profile-stat-border, rgba(245, 166, 35, 0.52));
    box-shadow:
      0 10px 22px rgba(15, 23, 42, 0.08),
      0 0 0 1px var(--profile-stat-border, rgba(245, 166, 35, 0.32));
  }

  &:hover {
    background:
      radial-gradient(
        circle at 100% 100%,
        var(--profile-stat-surface-hover, rgba(245, 166, 35, 0.22)),
        transparent 52%
      ),
      rgba(255, 255, 255, 0.98);
    transform: translateY(-2px);
  }

  .profile-stat-card__icon-wrap {
    width: 44px;
    height: 44px;
    flex: 0 0 44px;
    border-radius: 12px;
    background: var(--profile-stat-accent, #f5a623);
    box-shadow: 0 12px 22px var(--profile-stat-shadow, rgba(245, 166, 35, 0.18));
  }

  .profile-stat-card__value {
    color: #101828;
    font-size: 1.48rem;
    line-height: 1.1;
  }

  .profile-stat-card__label {
    margin-top: 4px;
    color: #667085;
    font-size: 0.82rem;
    font-weight: 700;
    line-height: 1.25;
  }
}

@media (max-width: 1100px) {
  .profile-hero__stats--surface {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 560px) {
  .profile-hero__stats--surface {
    grid-template-columns: 1fr;
  }
}

// Full Avatar Dialog
.profile-avatar-viewer {
  position: relative;
  width: 100vw;
  height: 100vh;
  min-height: 100svh;
  border-radius: 0 !important;
  background: #16191d !important;
  overflow: hidden;

  &__backdrop-image,
  &__fallback-backdrop,
  &__shade {
    position: absolute;
    inset: 0;
  }

  &__backdrop-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: blur(28px);
    transform: scale(1.14);
    opacity: 0.46;
  }

  &__fallback-backdrop {
    background:
      radial-gradient(circle at 28% 22%, rgba($primary, 0.28), transparent 32%),
      linear-gradient(145deg, #1f2937, #111827 58%, #20242b);
  }

  &__shade {
    background:
      linear-gradient(180deg, rgba(10, 13, 18, 0.34), rgba(10, 13, 18, 0.08) 42%, rgba(10, 13, 18, 0.52)),
      rgba(22, 25, 29, 0.28);
  }

  &__close {
    position: absolute;
    top: max(18px, env(safe-area-inset-top));
    right: max(18px, env(safe-area-inset-right));
    z-index: 4;
    background: rgba(11, 15, 21, 0.62);
    backdrop-filter: blur(10px);
  }

  &__stage {
    position: relative;
    z-index: 2;
    width: min(396px, 100vw);
    height: min(552px, 100vh);
    min-height: min(552px, 100svh);
    margin: 0 auto;
  }

  &__add {
    position: absolute;
    top: clamp(32px, 6.2vh, 58px);
    left: clamp(76px, 24vw, 112px);
    width: 76px;
    height: 76px;
    border-radius: 50%;
    border: 1.5px dashed rgba(255, 255, 255, 0.72);
    background: rgba(13, 17, 23, 0.14);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
  }

  &__add-menu {
    position: absolute;
    top: clamp(116px, 18vh, 140px);
    left: 50%;
    z-index: 3;
    width: 180px;
    transform: translateX(-50%);
    display: grid;
    gap: 8px;
    padding: 10px;
    border-radius: 16px;
    background: rgba(14, 18, 24, 0.86);
    border: 1px solid rgba(255, 255, 255, 0.16);
    box-shadow: 0 18px 38px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(12px);
  }

  &__add-option {
    min-height: 40px;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    color: white;
    font-size: 0.92rem;
    font-weight: 800;
    cursor: pointer;
    padding: 8px 14px;
    text-align: center;
    transition:
      background 0.18s ease,
      transform 0.18s ease;

    &:hover,
    &:focus-visible {
      background: rgba(255, 255, 255, 0.22);
      outline: none;
      transform: translateY(-1px);
    }
  }

  &__photo-row {
    position: absolute;
    top: clamp(118px, 18vh, 146px);
    left: 24px;
    right: 24px;
    display: flex;
    justify-content: center;
    gap: 14px;
  }

  &__photo-row--swapping {
    animation: profile-avatar-option-row-pop 0.62s cubic-bezier(0.2, 0.9, 0.24, 1);
  }

  &__photo-option {
    position: relative;
    width: 76px;
    height: 76px;
    padding: 0;
    border: 0;
    border-radius: 50%;
    background: rgba($primary, 0.56);
    overflow: hidden;
    cursor: pointer;
    box-shadow: 0 18px 36px rgba(0, 0, 0, 0.22);
    transition:
      box-shadow 0.18s ease,
      transform 0.18s ease;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &:hover,
    &:focus-visible {
      transform: translateY(-2px) scale(1.04);
      box-shadow:
        0 0 0 4px rgba(255, 255, 255, 0.18),
        0 20px 40px rgba(0, 0, 0, 0.28);
      outline: none;
    }
  }

  &__photo-delete {
    position: absolute;
    right: -1px;
    bottom: -1px;
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: #d92d20;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 8px 18px rgba(0, 0, 0, 0.32);
    opacity: 0;
    transform: scale(0.86);
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }

  &__photo-option:hover &__photo-delete,
  &__photo-option:focus-visible &__photo-delete,
  &__photo-delete:focus-visible {
    opacity: 1;
    transform: scale(1);
    outline: none;
  }

  &__photo-option--active {
    box-shadow:
      0 0 0 4px rgba(255, 255, 255, 0.88),
      0 18px 36px rgba(0, 0, 0, 0.24);
  }

  &__main-wrap {
    position: absolute;
    left: 52px;
    top: 204px;
    width: 292px;
    height: 292px;
  }

  &__main {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: linear-gradient(135deg, rgba($primary, 0.72), rgba(35, 78, 112, 0.76));
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 26px 54px rgba(0, 0, 0, 0.28);
  }

  &__main--swapping {
    animation: profile-avatar-main-confirm 0.62s cubic-bezier(0.2, 0.9, 0.24, 1);
  }

  &__image {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__edit {
    position: absolute;
    right: 20px;
    bottom: 20px;
    width: 46px;
    height: 46px;
    border: 0;
    border-radius: 50%;
    background: rgba(11, 15, 21, 0.94);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.26);
  }

  &__delete {
    position: absolute;
    right: 20px;
    bottom: 74px;
    width: 46px;
    height: 46px;
    border: 0;
    border-radius: 50%;
    background: #d92d20;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0;
    cursor: pointer;
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.26);
  }

  &__confirm {
    position: absolute;
    left: 52px;
    top: 516px;
    width: 292px;
    min-height: 46px;
    border: 0;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.94);
    color: #111827;
    font-size: 0.96rem;
    font-weight: 800;
    padding: 10px 18px;
    cursor: pointer;
    box-shadow: 0 16px 34px rgba(0, 0, 0, 0.24);
    transition:
      opacity 0.18s ease,
      transform 0.18s ease,
      background 0.18s ease;

    &:hover:not(:disabled),
    &:focus-visible:not(:disabled) {
      transform: translateY(-1px);
      background: white;
      outline: none;
    }

    &:disabled {
      cursor: default;
      opacity: 0.5;
      box-shadow: none;
    }
  }
}

.profile-avatar-main-enter-active,
.profile-avatar-main-leave-active {
  transition:
    opacity 0.22s ease,
    transform 0.22s ease,
    filter 0.22s ease;
}

.profile-avatar-main-enter-from {
  opacity: 0;
  transform: scale(0.88) translateY(-10px);
  filter: blur(8px);
}

.profile-avatar-main-leave-to {
  opacity: 0;
  transform: scale(1.08) translateY(10px);
  filter: blur(8px);
}

.profile-avatar-option-move,
.profile-avatar-option-enter-active,
.profile-avatar-option-leave-active {
  transition:
    opacity 0.36s ease,
    transform 0.36s cubic-bezier(0.2, 0.9, 0.24, 1);
}

.profile-avatar-option-enter-from {
  opacity: 0;
  transform: translateY(42px) scale(1.75);
}

.profile-avatar-option-leave-to {
  opacity: 0;
  transform: translateY(-28px) scale(0.72);
}

@keyframes profile-avatar-main-confirm {
  0% {
    transform: scale(1);
    box-shadow: 0 26px 54px rgba(0, 0, 0, 0.28);
  }

  42% {
    transform: scale(1.045);
    box-shadow:
      0 0 0 8px rgba(255, 255, 255, 0.16),
      0 32px 64px rgba(0, 0, 0, 0.32);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 26px 54px rgba(0, 0, 0, 0.28);
  }
}

@keyframes profile-avatar-option-row-pop {
  0% {
    transform: translateY(0);
  }

  36% {
    transform: translateY(-8px);
  }

  100% {
    transform: translateY(0);
  }
}

@media (max-width: 430px) {
  .profile-avatar-viewer {
    &__stage {
      width: 100vw;
    }

    &__main-wrap {
      left: 13.2vw;
      width: 73.6vw;
      height: 73.6vw;
    }

    &__confirm {
      left: 13.2vw;
      top: calc(204px + 73.6vw + 20px);
      width: 73.6vw;
    }
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
