<template>
  <div>
    <div class="row items-center justify-between q-mb-lg">
      <div>
        <div class="text-h5 text-weight-bolder text-primary">
          {{ $t('profile.personal.title') }}
        </div>
        <div class="text-caption text-grey-6 q-mt-xs">
          {{ $t('profile.personal.subtitle') }}
        </div>
      </div>
    </div>

    <q-card flat class="profile-form bg-transparent">
      <h3>{{ $t('profile.personal.title') }}</h3>

      <p class="student-id">
        {{ $t('profile.hero.studentId') }} :: {{ authStore.user?.studentId }}
      </p>

      <div class="form-grid">
        <div>
          <label>{{ $t('profile.personal.firstNameTh') }}</label>
          <q-input v-model="form.firstNameTh" outlined dense />
        </div>
        <div>
          <label>{{ $t('profile.personal.lastNameTh') }}</label>
          <q-input v-model="form.lastNameTh" outlined dense />
        </div>
        <div>
          <label>{{ $t('profile.personal.firstNameEn') }}</label>
          <q-input v-model="form.firstNameEn" outlined dense />
        </div>
        <div>
          <label>{{ $t('profile.personal.lastNameEn') }}</label>
          <q-input v-model="form.lastNameEn" outlined dense />
        </div>
        <div>
          <label>{{ $t('profile.personal.phone') }}</label>
          <q-input
            v-model="form.phone"
            outlined
            dense
            :placeholder="$t('profile.personal.phone')"
          />
        </div>
      </div>

      <BaseButton
        color="primary"
        :label="$t('profile.personal.save')"
        no-caps
        hover-lift
        class="save-btn"
        :loading="isSavingProfile"
        :disable="isSavingProfile"
        @click="confirmSavePersonalInfo"
      />
    </q-card>

    <q-separator class="q-my-xl" />

    <!-- Avatar section -->
    <section class="avatar-section">
      <div class="avatar-preview shadow-1">
        <div class="avatar-preview__header">
          <div>
            <p class="avatar-preview__eyebrow">LLL Character Lab</p>
            <h3 class="avatar-preview__title">Live Avatar Preview</h3>
          </div>
          <div class="avatar-preview__stamp">PROFILE</div>
        </div>

        <div class="avatar-preview__stage">
          <img :src="avatarPreviewUrl" alt="Avatar preview" class="avatar-preview__image" />
        </div>

        <div class="avatar-preview__footer">
          <span class="avatar-preview__chip">{{ selectedSkinLabel }}</span>
          <span class="avatar-preview__chip">{{ selectedEyesLabel }}</span>
          <span class="avatar-preview__chip">{{ selectedTopLabel }}</span>
          <span class="avatar-preview__chip">{{ selectedAccessoryLabel }}</span>
        </div>
      </div>

      <q-card flat bordered class="avatar-editor">
        <h3 class="text-dark text-h6 text-weight-bold">
          {{ $t('profile.personal.editAvatar') }}
        </h3>

        <div class="avatar-editor__tabs q-mt-md">
          <q-tabs
            v-model="activeAvatarTab"
            dense
            inline-label
            indicator-color="primary"
            active-color="primary"
            class="avatar-editor__tab-bar"
          >
            <q-tab name="skin" icon="face_3" />
            <q-tab name="face" icon="visibility" />
            <q-tab name="hair" icon="content_cut" />
            <q-tab name="accessory" icon="styler" />
            <q-tab name="top" icon="checkroom" />
            <q-tab name="background" icon="crop_landscape" />
          </q-tabs>

          <q-tab-panels
            v-model="activeAvatarTab"
            animated
            class="avatar-editor__panels bg-transparent"
          >
            <q-tab-panel name="skin" class="avatar-editor__panel">
              <section class="avatar-control-card">
                <div class="avatar-control-card__header">
                  <h4>{{ $t('profile.avatar.body') }}</h4>
                  <span>{{ selectedSkinLabel }}</span>
                </div>
                <div class="avatar-swatch-grid">
                  <button
                    v-for="option in skinToneOptions"
                    :key="option.value"
                    type="button"
                    class="avatar-swatch"
                    :class="{ 'avatar-swatch--active': cartoonAvatar.body === option.value }"
                    :style="{ '--avatar-swatch-color': option.swatch || '#e5e7eb' }"
                    :aria-label="option.label"
                    @click="cartoonAvatar.body = option.value"
                  />
                </div>
              </section>

              <section class="avatar-control-card">
                <div class="avatar-control-card__header">
                  <h4>{{ $t('profile.avatar.pants') }}</h4>
                  <span>{{ selectedBodyLabel }}</span>
                </div>
                <div class="avatar-tile-grid avatar-tile-grid--quad">
                  <button
                    v-for="option in bodyStyleOptions"
                    :key="option.value"
                    type="button"
                    class="avatar-tile avatar-tile--body"
                    :class="{ 'avatar-tile--active': cartoonAvatar.pants === option.value }"
                    @click="cartoonAvatar.pants = option.value"
                  >
                    <img
                      :src="createAvatarOptionPreview({ pants: option.value })"
                      :alt="option.label"
                      class="avatar-tile__preview"
                    />
                    <strong>{{ option.label }}</strong>
                  </button>
                </div>
              </section>
            </q-tab-panel>

            <q-tab-panel name="face" class="avatar-editor__panel">
              <section class="avatar-control-card">
                <div class="avatar-control-card__header">
                  <h4>Eye color</h4>
                  <span>{{ selectedEyeColorLabel }}</span>
                </div>
                <div class="avatar-swatch-grid">
                  <button
                    v-for="option in eyeColorOptions"
                    :key="option.value"
                    type="button"
                    class="avatar-swatch"
                    :class="{ 'avatar-swatch--active': cartoonAvatar.eyeColor === option.value }"
                    :style="{ '--avatar-swatch-color': option.swatch || '#e5e7eb' }"
                    :aria-label="option.label"
                    @click="cartoonAvatar.eyeColor = option.value"
                  />
                </div>
              </section>

              <section class="avatar-control-card">
                <div class="avatar-control-card__header">
                  <h4>Expression</h4>
                  <span>{{ selectedEyesLabel }}</span>
                </div>
                <div class="avatar-tile-grid avatar-tile-grid--quad">
                  <button
                    v-for="option in eyeOptions"
                    :key="option.value"
                    type="button"
                    class="avatar-tile"
                    :class="{ 'avatar-tile--active': cartoonAvatar.face === option.value }"
                    @click="cartoonAvatar.face = option.value"
                  >
                    <img
                      :src="createAvatarOptionPreview({ face: option.value })"
                      :alt="option.label"
                      class="avatar-tile__preview avatar-tile__preview--face"
                    />
                    <strong>{{ option.label }}</strong>
                  </button>
                </div>
              </section>
            </q-tab-panel>

            <q-tab-panel name="hair" class="avatar-editor__panel">
              <section class="avatar-control-card">
                <div class="avatar-control-card__header">
                  <h4>{{ $t('profile.avatar.hair') }}</h4>
                  <span>{{ selectedHairLabel }}</span>
                </div>
                <div class="avatar-tile-grid avatar-tile-grid--quad">
                  <button
                    v-for="option in hairStyleOptions"
                    :key="option.value"
                    type="button"
                    class="avatar-tile"
                    :class="{ 'avatar-tile--active': cartoonAvatar.hair === option.value }"
                    @click="cartoonAvatar.hair = option.value"
                  >
                    <img
                      :src="createAvatarOptionPreview({ hair: option.value })"
                      :alt="option.label"
                      class="avatar-tile__preview avatar-tile__preview--face"
                    />
                    <strong>{{ option.label }}</strong>
                  </button>
                </div>
              </section>

              <section class="avatar-control-card">
                <div class="avatar-control-card__header">
                  <h4>{{ $t('profile.avatar.hairColor') }}</h4>
                  <span>{{ selectedHairColorLabel }}</span>
                </div>
                <div class="avatar-swatch-grid">
                  <button
                    v-for="option in hairColorOptions"
                    :key="option.value"
                    type="button"
                    class="avatar-swatch"
                    :class="{ 'avatar-swatch--active': cartoonAvatar.hairColor === option.value }"
                    :style="{ '--avatar-swatch-color': option.swatch || '#e5e7eb' }"
                    :aria-label="option.label"
                    @click="cartoonAvatar.hairColor = option.value"
                  />
                </div>
              </section>
            </q-tab-panel>

            <q-tab-panel name="accessory" class="avatar-editor__panel">
              <section class="avatar-control-card">
                <div class="avatar-control-card__header">
                  <h4>Accessory color</h4>
                  <span>{{ selectedAccessoryColorLabel }}</span>
                </div>
                <div class="avatar-swatch-grid">
                  <button
                    v-for="option in accessoryColorOptions"
                    :key="option.value"
                    type="button"
                    class="avatar-swatch"
                    :class="{
                      'avatar-swatch--active': cartoonAvatar.accessoryColor === option.value,
                    }"
                    :style="{ '--avatar-swatch-color': option.swatch || '#e5e7eb' }"
                    :aria-label="option.label"
                    @click="cartoonAvatar.accessoryColor = option.value"
                  />
                </div>
              </section>

              <section class="avatar-control-card">
                <div class="avatar-control-card__header">
                  <h4>{{ $t('profile.avatar.shoes') }}</h4>
                  <span>{{ selectedAccessoryLabel }}</span>
                </div>
                <div class="avatar-tile-grid avatar-tile-grid--quad">
                  <button
                    v-for="option in accessoryOptions"
                    :key="option.value"
                    type="button"
                    class="avatar-tile"
                    :class="{ 'avatar-tile--active': cartoonAvatar.shoes === option.value }"
                    @click="cartoonAvatar.shoes = option.value"
                  >
                    <img
                      :src="createAvatarOptionPreview({ shoes: option.value })"
                      :alt="option.label"
                      class="avatar-tile__preview avatar-tile__preview--face"
                    />
                    <strong>{{ option.label }}</strong>
                  </button>
                </div>
              </section>
            </q-tab-panel>

            <q-tab-panel name="top" class="avatar-editor__panel">
              <section class="avatar-control-card">
                <div class="avatar-control-card__header">
                  <h4>{{ $t('profile.avatar.shirt') }}</h4>
                  <span>{{ selectedTopLabel }}</span>
                </div>
                <div class="avatar-tile-grid avatar-tile-grid--quad">
                  <button
                    v-for="option in topStyleOptions"
                    :key="option.value"
                    type="button"
                    class="avatar-tile avatar-tile--body"
                    :class="{ 'avatar-tile--active': cartoonAvatar.shirt === option.value }"
                    @click="cartoonAvatar.shirt = option.value"
                  >
                    <img
                      :src="createAvatarOptionPreview({ shirt: option.value })"
                      :alt="option.label"
                      class="avatar-tile__preview"
                    />
                    <strong>{{ option.label }}</strong>
                  </button>
                </div>
              </section>

              <section class="avatar-control-card">
                <div class="avatar-control-card__header">
                  <h4>{{ $t('profile.avatar.shirtColor') }}</h4>
                  <span>{{ selectedTopColorLabel }}</span>
                </div>
                <div class="avatar-swatch-grid">
                  <button
                    v-for="option in topColorOptions"
                    :key="option.value"
                    type="button"
                    class="avatar-swatch"
                    :class="{ 'avatar-swatch--active': cartoonAvatar.shirtColor === option.value }"
                    :style="{ '--avatar-swatch-color': option.swatch || '#e5e7eb' }"
                    :aria-label="option.label"
                    @click="cartoonAvatar.shirtColor = option.value"
                  />
                </div>
              </section>
            </q-tab-panel>

            <q-tab-panel name="background" class="avatar-editor__panel">
              <section class="avatar-control-card">
                <div class="avatar-control-card__header">
                  <h4>{{ $t('profile.avatar.pantsColor') }}</h4>
                  <span>{{ selectedBackdropLabel }}</span>
                </div>
                <div class="avatar-swatch-grid">
                  <button
                    v-for="option in backdropOptions"
                    :key="option.value"
                    type="button"
                    class="avatar-swatch avatar-swatch--large"
                    :class="{ 'avatar-swatch--active': cartoonAvatar.pantsColor === option.value }"
                    :style="{ '--avatar-swatch-color': option.swatch || '#e5e7eb' }"
                    :aria-label="option.label"
                    @click="cartoonAvatar.pantsColor = option.value"
                  />
                </div>
              </section>
            </q-tab-panel>
          </q-tab-panels>
        </div>
        <div class="avatar-editor__hint">{{ $t('profile.avatar.hint') }}</div>

        <q-btn
          outline
          :label="$t('profile.avatar.random')"
          class="full-width q-mt-md"
          color="grey-7"
          @click="randomizeCartoonAvatar"
        />
        <BaseButton
          color="primary"
          :label="$t('profile.personal.save')"
          no-caps
          hover-lift
          class="full-width q-mt-sm"
          @click="confirmSaveCartoonAvatar"
        />
      </q-card>
    </section>

    <q-separator class="q-my-xl" />

    <!-- Skill Mapping -->
    <section class="skill-section">
      <p class="orange-text text-weight-bold">{{ $t('profile.personal.skillMapping') }}</p>
      <h2 class="text-dark">{{ $t('profile.personal.skillMappingTitle') }}</h2>
      <p class="text-grey-7">{{ $t('profile.personal.skillMappingSub') }}</p>

      <div class="skill-radar-card shadow-1">
        <div class="skill-radar-card__meta">
          <div>
            <p class="skill-radar-card__eyebrow">Skill Spider</p>
            <div class="skill-radar-card__average">
              {{ formatSkillScore(overallSkillAverage) }}
              <span>/{{ RADAR_MAX_SCORE }}</span>
            </div>
          </div>
        </div>

        <div class="skill-radar-layout">
          <div class="skill-radar-figure">
            <svg
              class="skill-radar-svg"
              viewBox="0 0 420 420"
              role="img"
              aria-label="Skill spider chart"
            >
              <defs>
                <linearGradient id="skill-radar-fill" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#f5a623" stop-opacity="0.34" />
                  <stop offset="100%" stop-color="#3aa6b9" stop-opacity="0.16" />
                </linearGradient>
              </defs>

              <path
                v-for="grid in radarGridPaths"
                :key="`grid-${grid.level}`"
                :d="grid.path"
                class="skill-radar-svg__grid"
              />
              <line
                v-for="axis in radarAxisItems"
                :key="`axis-${axis.id}`"
                :x1="RADAR_CENTER_X"
                :y1="RADAR_CENTER_Y"
                :x2="axis.axisPoint.x"
                :y2="axis.axisPoint.y"
                class="skill-radar-svg__axis"
              />
              <path :d="radarDataPath" class="skill-radar-svg__area" />
              <path :d="radarDataPath" class="skill-radar-svg__outline" />

              <text
                v-for="scale in radarScaleLabels"
                :key="`scale-${scale.level}`"
                :x="scale.x"
                :y="scale.y"
                class="skill-radar-svg__scale"
              >
                {{ scale.level }}
              </text>

              <g v-for="axis in radarAxisItems" :key="axis.id">
                <circle
                  :cx="axis.valuePoint.x"
                  :cy="axis.valuePoint.y"
                  r="5.5"
                  class="skill-radar-svg__point"
                />
                <g :transform="`translate(${axis.badgePoint.x} ${axis.badgePoint.y})`">
                  <text
                    :style="{ fill: axis.accent }"
                    font-size="14px"
                    font-weight="800"
                    text-anchor="middle"
                    dominant-baseline="central"
                  >
                    {{ axis.shortLabel }}
                  </text>
                </g>
              </g>
            </svg>
          </div>

          <div
            class="skill-list-card"
            style="
              width: 100%;
              padding: 32px 24px;
              background: #ffffff;
              border-radius: 24px;
              border: 1px solid rgba(17, 24, 39, 0.08);
              display: flex;
              flex-direction: column;
            "
          >
            <div
              style="
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 32px;
                flex-shrink: 0;
              "
            >
              <h3
                style="
                  font-size: 16px;
                  font-weight: 700;
                  color: #1e293b;
                  margin: 0;
                  line-height: 1.4;
                "
              >
                {{ $t('profile.personal.oecdSkillsTitle', 'OECD Learning Compass 2030 Skills') }}
              </h3>
              <div
                style="
                  background: #f1f5f9;
                  color: #475569;
                  padding: 4px 10px;
                  border-radius: 99px;
                  font-size: 13px;
                  font-weight: 700;
                  flex-shrink: 0;
                  margin-left: 12px;
                "
              >
                {{ formatSkillScore(overallSkillAverage) }}/{{ RADAR_MAX_SCORE }}
              </div>
            </div>

            <div
              class="skill-list-items"
              style="flex: 1; display: flex; flex-direction: column; justify-content: space-between"
            >
              <div v-for="item in oecdSkills" :key="item.id" style="margin-bottom: 0">
                <strong
                  style="color: #334155; font-size: 14px; display: block; margin-bottom: 8px"
                  >{{ item.label }}</strong
                >
                <div style="display: flex; align-items: center; gap: 12px">
                  <div
                    style="
                      flex: 1;
                      height: 8px;
                      background: #f1f5f9;
                      border-radius: 99px;
                      overflow: hidden;
                    "
                  >
                    <div
                      style="
                        height: 100%;
                        background: #f5a623;
                        border-radius: 99px;
                        transition: width 1s ease-out;
                      "
                      :style="{ width: `${(item.score / RADAR_MAX_SCORE) * 100}%` }"
                    />
                  </div>
                  <span
                    style="
                      color: #64748b;
                      font-size: 13px;
                      font-weight: 700;
                      min-width: 44px;
                      text-align: right;
                    "
                  >
                    {{ formatSkillScore(item.score) }}/{{ RADAR_MAX_SCORE }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>

  <BaseSystemDialog
    v-model="showSaveConfirmDialog"
    variant="confirm"
    icon="save"
    confirm-icon="save"
    :title="saveConfirmTitle"
    :message="saveConfirmMessage"
    :confirm-label="$t('profile.personal.save')"
    :cancel-label="$t('profile.dialogs.notNow')"
    :loading="isSavingProfile"
    @cancel="cancelSaveConfirmation"
    @confirm="confirmSaveConfirmation"
  />
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useI18n } from 'vue-i18n';
import BaseButton from 'components/base/BaseButton.vue';
import BaseSystemDialog from 'components/base/BaseSystemDialog.vue';
import { useAuthStore, type User, type UserProfileUpdate } from 'src/stores/auth-store';
import { useProfileAvatar } from 'src/composables/use-profile-avatar';
import {
  useProfileSkills,
  RADAR_MAX_SCORE,
  RADAR_CENTER_X,
  RADAR_CENTER_Y,
} from 'src/composables/use-profile-skills';

const { t } = useI18n();
const $q = useQuasar();
const authStore = useAuthStore();

const {
  activeAvatarTab,
  cartoonAvatar,
  skinToneOptions,
  eyeColorOptions,
  eyeOptions,
  hairStyleOptions,
  hairColorOptions,
  topStyleOptions,
  topColorOptions,
  bodyStyleOptions,
  backdropOptions,
  accessoryColorOptions,
  accessoryOptions,
  selectedSkinLabel,
  selectedEyeColorLabel,
  selectedEyesLabel,
  selectedHairLabel,
  selectedHairColorLabel,
  selectedTopLabel,
  selectedTopColorLabel,
  selectedBodyLabel,
  selectedBackdropLabel,
  selectedAccessoryColorLabel,
  selectedAccessoryLabel,
  avatarPreviewUrl,
  createAvatarOptionPreview,
  randomizeCartoonAvatar,
  saveCartoonAvatar,
} = useProfileAvatar();

const {
  fetchUserSkills,
  oecdSkills,
  overallSkillAverage,
  radarGridPaths,
  radarAxisItems,
  radarDataPath,
  radarScaleLabels,
  formatSkillScore,
} = useProfileSkills();

const isSavingProfile = ref(false);
const showSaveConfirmDialog = ref(false);
const saveConfirmTitle = ref('');
const saveConfirmMessage = ref('');
const pendingSaveAction = ref<(() => void | Promise<void>) | null>(null);

const form = reactive<UserProfileUpdate>({
  firstNameTh: '',
  lastNameTh: '',
  firstNameEn: '',
  lastNameEn: '',
  phone: '',
});

watch(
  () => authStore.user,
  (user) => syncFormWithUser(user),
  { immediate: true },
);

function syncFormWithUser(user: User | null): void {
  form.firstNameTh = user?.firstNameTh ?? '';
  form.lastNameTh = user?.lastNameTh ?? '';
  form.firstNameEn = user?.firstNameEn ?? '';
  form.lastNameEn = user?.lastNameEn ?? '';
  form.phone = user?.phone ?? '';
}

onMounted(() => {
  void authStore.fetchProfile().catch((error: unknown) => {
    console.error('Failed to fetch profile', error);
  });
  void fetchUserSkills();
});

function openSaveConfirmationDialog(
  title: string,
  message: string,
  onConfirm: () => void | Promise<void>,
): void {
  saveConfirmTitle.value = title;
  saveConfirmMessage.value = message;
  pendingSaveAction.value = onConfirm;
  showSaveConfirmDialog.value = true;
}

function cancelSaveConfirmation(): void {
  showSaveConfirmDialog.value = false;
  pendingSaveAction.value = null;
}

function confirmSaveConfirmation(): void {
  const action = pendingSaveAction.value;
  showSaveConfirmDialog.value = false;
  pendingSaveAction.value = null;
  void action?.();
}

function confirmSaveCartoonAvatar(): void {
  openSaveConfirmationDialog(
    t('profile.dialogs.confirmAvatarTitle'),
    t('profile.dialogs.confirmAvatarSub'),
    () => void saveCartoonAvatar(),
  );
}

function confirmSavePersonalInfo(): void {
  if (isSavingProfile.value) return;

  if (
    !authStore.user ||
    !form.firstNameTh.trim() ||
    !form.lastNameTh.trim() ||
    !form.firstNameEn.trim() ||
    !form.lastNameEn.trim()
  ) {
    void savePersonalInfo();
    return;
  }

  openSaveConfirmationDialog(
    t('profile.dialogs.confirmProfileTitle'),
    t('profile.dialogs.confirmProfileSub'),
    () => savePersonalInfo(),
  );
}

async function savePersonalInfo(): Promise<void> {
  if (!authStore.user) {
    $q.notify({
      type: 'negative',
      message: t('profile.notifications.userNotFound'),
      position: 'top',
    });
    return;
  }

  const payload: UserProfileUpdate = {
    firstNameTh: form.firstNameTh.trim(),
    lastNameTh: form.lastNameTh.trim(),
    firstNameEn: form.firstNameEn.trim(),
    lastNameEn: form.lastNameEn.trim(),
    phone: form.phone.trim(),
  };

  if (!payload.firstNameTh || !payload.lastNameTh || !payload.firstNameEn || !payload.lastNameEn) {
    $q.notify({
      type: 'warning',
      message: t('profile.notifications.nameRequired'),
      position: 'top',
    });
    return;
  }

  isSavingProfile.value = true;

  try {
    await authStore.updateProfile(payload);
    syncFormWithUser(authStore.user);
    $q.notify({
      type: 'positive',
      message: t('profile.notifications.profileSaved'),
      position: 'top',
    });
  } catch (error) {
    console.error('Failed to save personal info', error);
    $q.notify({
      type: 'negative',
      message: t('profile.notifications.profileSaveFailed'),
      position: 'top',
    });
  } finally {
    isSavingProfile.value = false;
  }
}
</script>

<style lang="scss" scoped>
.profile-form {
  padding: 32px 36px 36px;
  border-radius: var(--radius-xl) !important; // = 20px (token)
  background: linear-gradient(180deg, #ffffff 0%, #fffdf7 100%) !important;
  border: 1px solid rgba(17, 24, 39, 0.08) !important;
  box-shadow: 0 14px 32px rgba(17, 24, 39, 0.05);

  h3 {
    color: var(--color-gold); // brand #f5a623 (เดิม #ff9800 ส้ม Material หลุดแบรนด์)
    font-size: 26px;
    margin-top: 0;
    margin-bottom: 18px;
    font-weight: bold;
  }
}

.student-id {
  font-weight: 600;
  margin-bottom: 30px;
  font-size: 1rem;
  color: #52606d;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 22px 40px;

  label {
    display: block;
    margin-bottom: 10px;
    font-weight: 600;
    color: var(--color-text-2); // = #374151 (token, ค่าเท่าเดิม)
  }
}

.save-btn {
  margin-top: 30px;
  min-width: 140px;
  min-height: 46px;
  border-radius: var(--radius-md); // = 12px (token)
}

// Avatar section
.avatar-section {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 28px;
}

.avatar-preview {
  min-height: 640px;
  padding: 24px;
  border-radius: 24px;
  border: 1px solid rgba(58, 86, 122, 0.12);
  background:
    radial-gradient(circle at top right, rgba(123, 174, 224, 0.22), transparent 28%),
    radial-gradient(circle at bottom left, rgba(255, 208, 129, 0.2), transparent 34%),
    linear-gradient(180deg, #fffdf8 0%, #f5fbff 100%);
  display: flex;
  flex-direction: column;
  box-shadow: 0 22px 44px rgba(58, 86, 122, 0.08);

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
  }

  &__eyebrow {
    margin: 0;
    color: #3d80c4;
    font-size: 0.78rem;
    font-weight: 800;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }

  &__title {
    margin: 8px 0 0;
    color: #28435f;
    font-size: 1.5rem;
    line-height: 1.15;
  }

  &__stamp {
    flex-shrink: 0;
    padding: 8px 12px;
    border-radius: 999px;
    border: 1px solid rgba(61, 128, 196, 0.2);
    background: rgba(255, 255, 255, 0.74);
    color: #41688f;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.12em;
  }

  &__stage {
    flex: 1;
    min-height: 0;
    margin-top: 18px;
    padding: 18px;
    border-radius: 24px;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.92), rgba(239, 248, 255, 0.92)), #fff;
    border: 1px solid rgba(58, 86, 122, 0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
  }

  &__image {
    width: min(100%, 460px);
    aspect-ratio: 1;
    object-fit: contain;
    filter: drop-shadow(0 24px 36px rgba(58, 86, 122, 0.16));
  }

  &__footer {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
  }

  &__chip {
    padding: 10px 14px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.82);
    border: 1px solid rgba(58, 86, 122, 0.1);
    color: #45607a;
    font-size: 0.84rem;
    font-weight: 700;
  }
}

.avatar-editor {
  background:
    radial-gradient(circle at top right, rgba(123, 174, 224, 0.12), transparent 30%),
    radial-gradient(circle at bottom left, rgba(255, 210, 126, 0.12), transparent 28%),
    linear-gradient(180deg, #ffffff 0%, #fffdf8 100%);
  padding: 28px;
  border-radius: 24px;
  border: 1px solid rgba(17, 24, 39, 0.06);
  box-shadow: 0 16px 34px rgba(17, 24, 39, 0.05);

  h3 {
    margin: 0 0 12px;
  }

  &__tabs {
    border-radius: 20px;
    border: 1px solid rgba(58, 86, 122, 0.12);
    background: rgba(255, 255, 255, 0.9);
    overflow: hidden;
  }

  &__tab-bar {
    border-bottom: 1px solid rgba(58, 86, 122, 0.12);
    padding: 6px 8px 0;

    :deep(.q-tab) {
      min-height: 68px;
      padding: 0 10px;
      color: #a0a8b3;
    }

    :deep(.q-tab__icon) {
      font-size: 1.7rem;
    }

    :deep(.q-tab--active) {
      color: #2ea7ff;
    }
  }

  &__panels {
    min-height: 280px;
    max-height: 640px;
  }

  &__panel {
    padding: 18px;
    display: grid;
    gap: 14px;
    max-height: 640px;
    overflow-y: auto;
  }

  &__hint {
    margin-top: 18px;
    padding: 14px 16px;
    border-radius: 16px;
    background: linear-gradient(135deg, rgba(123, 174, 224, 0.18), rgba(255, 248, 226, 0.92));
    color: #536d87;
    font-size: 0.92rem;
    line-height: 1.5;
  }
}

.avatar-control-card {
  padding: 16px;
  border-radius: 18px;
  border: 1px solid rgba(58, 86, 122, 0.1);
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 10px 24px rgba(35, 63, 96, 0.05);

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 12px;

    h4 {
      margin: 0;
      color: #28435f;
      font-size: 0.95rem;
      font-weight: 800;
    }

    span {
      color: #6a7f93;
      font-size: 0.82rem;
      font-weight: 700;
    }
  }
}

.avatar-swatch-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}

.avatar-swatch {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  border-radius: 16px;
  border: 2px solid rgba(58, 86, 122, 0.12);
  background: #fff;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease,
    border-color 0.18s ease;

  &::before {
    content: '';
    position: absolute;
    inset: 8px;
    border-radius: 12px;
    background: var(--avatar-swatch-color);
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 18px rgba(58, 86, 122, 0.12);
  }

  &--active {
    border-color: #5ab7ff;
    box-shadow: 0 0 0 4px rgba(90, 183, 255, 0.18);
  }

  &--large {
    aspect-ratio: 1.25;
  }
}

.avatar-tile-grid {
  display: grid;
  gap: 10px;

  &--triple {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }

  &--quad {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.avatar-tile {
  min-height: 92px;
  padding: 10px 8px;
  border: 2px solid rgba(58, 86, 122, 0.1);
  border-radius: 16px;
  background: linear-gradient(180deg, #ffffff 0%, #f8fbfe 100%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  cursor: pointer;
  transition:
    transform 0.18s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;

  strong {
    color: #45607a;
    font-size: 0.78rem;
    font-weight: 800;
    line-height: 1.15;
    text-align: center;
  }

  &__preview {
    width: 86px;
    height: 86px;
    object-fit: contain;
    border-radius: 14px;

    &--face {
      width: 72px;
      height: 72px;
    }
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 10px 18px rgba(58, 86, 122, 0.1);
  }

  &--active {
    border-color: #5ab7ff;
    background: linear-gradient(180deg, #ffffff 0%, #edf7ff 100%);
    box-shadow: 0 0 0 4px rgba(90, 183, 255, 0.16);
  }
}

// Skill section
.skill-section {
  margin-top: 20px;
  text-align: center;
  padding: 10px 0 20px;

  h2 {
    font-size: 30px;
    font-weight: bold;
    margin: 16px 0;
  }
}

.orange-text {
  color: var(--color-gold); // brand #f5a623 (เดิม #ff9800 ส้ม Material หลุดแบรนด์)
  text-align: left;
  margin-bottom: 8px;
}

.skill-radar-card {
  margin-top: 25px;
  padding: 28px;
  border-radius: 28px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background:
    radial-gradient(circle at top right, rgba(245, 166, 35, 0.12), transparent 24%),
    linear-gradient(180deg, #ffffff 0%, #fffdf7 100%);
  box-shadow: 0 22px 44px rgba(17, 24, 39, 0.07);

  &__meta {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 20px;
    text-align: left;
  }

  &__eyebrow {
    margin: 0 0 8px;
    color: #f5a623;
    font-size: 0.8rem;
    font-weight: 800;
    letter-spacing: 0.14em;
    text-transform: uppercase;
  }

  &__average {
    color: #10223c;
    font-size: 2.4rem;
    font-weight: 800;
    line-height: 1;

    span {
      color: #64748b;
      font-size: 1rem;
      margin-left: 6px;
    }
  }

  &__meta-copy {
    max-width: 220px;
    padding: 12px 14px;
    border-radius: 16px;
    background: rgba(245, 166, 35, 0.08);
    color: #6b7280;
    font-size: 0.92rem;
    font-weight: 600;
    line-height: 1.5;
    text-align: left;
  }

  &__chips {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    margin-top: 18px;
  }
}

.skill-radar-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  border: 1px solid rgba(17, 24, 39, 0.08);
  color: #334155;
  font-size: 0.88rem;
  font-weight: 700;

  strong {
    color: #10223c;
  }

  &__dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    flex-shrink: 0;
  }
}

.skill-radar-layout {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(260px, 1fr);
  gap: 24px;
  align-items: stretch;
  margin-top: 24px;
}

.skill-radar-figure {
  padding: 18px;
  border-radius: 24px;
  border: 1px solid rgba(17, 24, 39, 0.08);
  background:
    radial-gradient(circle at center, rgba(58, 166, 185, 0.06), transparent 48%),
    linear-gradient(180deg, #ffffff 0%, #fbfdff 100%);
}

.skill-radar-svg {
  display: block;
  width: 100%;
  height: auto;
  overflow: visible;

  &__grid {
    fill: none;
    stroke: rgba(30, 58, 95, 0.12);
    stroke-width: 1;
  }

  &__axis {
    stroke: rgba(30, 58, 95, 0.16);
    stroke-width: 1;
  }

  &__area {
    fill: url(#skill-radar-fill);
  }

  &__outline {
    fill: none;
    stroke: #1e3a5f;
    stroke-width: 3;
    stroke-linejoin: round;
  }

  &__point {
    fill: #ffffff;
    stroke: #f5a623;
    stroke-width: 3;
  }

  &__center {
    fill: rgba(255, 255, 255, 0.96);
    stroke: rgba(30, 58, 95, 0.12);
    stroke-width: 2;
  }

  &__center-label,
  &__center-value,
  &__badge-label,
  &__scale {
    text-anchor: middle;
    dominant-baseline: middle;
  }

  &__center-label {
    fill: #64748b;
    font-size: 0.72rem;
    font-weight: 800;
    letter-spacing: 0.16em;
  }

  &__center-value {
    fill: #10223c;
    font-size: 1.25rem;
    font-weight: 800;
  }

  &__badge {
    stroke: #ffffff;
    stroke-width: 3;
    filter: drop-shadow(0 8px 14px rgba(17, 24, 39, 0.12));
  }

  &__badge-label {
    fill: #ffffff;
    font-size: 0.72rem;
    font-weight: 800;
  }

  &__scale {
    fill: #94a3b8;
    font-size: 0.7rem;
    font-weight: 700;
  }
}

.skill-radar-legend {
  padding: 18px 18px 20px;
  border-radius: 20px;
  background: #fff;
  border: 1px solid rgba(17, 24, 39, 0.08);
  text-align: left;

  &__title {
    color: #10223c;
    font-size: 0.98rem;
    font-weight: 800;
  }

  &__items {
    display: grid;
    gap: 12px;
    margin-top: 14px;
  }

  &__item {
    display: grid;
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 12px;
    align-items: center;
  }

  &__index {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: #fff;
    font-size: 0.82rem;
    font-weight: 800;
    box-shadow: 0 8px 16px rgba(17, 24, 39, 0.12);
  }

  &__copy {
    display: grid;
    gap: 2px;

    strong {
      color: #10223c;
      font-size: 0.92rem;
      line-height: 1.35;
    }

    span {
      color: #64748b;
      font-size: 0.82rem;
      line-height: 1.4;
    }
  }
}

// Score section
.score-section {
  padding: 30px 0;
  text-align: center;

  h2 {
    font-size: 30px;
    font-weight: bold;
    margin: 16px 0;
  }
}

.score-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 30px;
}

.skill-card {
  background: linear-gradient(155deg, var(--skill-card-accent, #90d2b1) 0%, #1d4d59 100%);
  padding: 24px;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 18px 36px rgba(17, 24, 39, 0.08);

  &__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 16px;
    margin-bottom: 20px;
  }

  h3 {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
    color: #fff;
    line-height: 1.4;
  }

  &__badge {
    flex-shrink: 0;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.18);
    color: #fff;
    font-size: 0.82rem;
    font-weight: 800;
  }
}

.skill-inner {
  background: white;
  padding: 20px;
  text-align: left;
  border-radius: 16px;
  flex: 1;
}

.skill-item {
  margin-bottom: 24px;

  strong {
    display: block;
    line-height: 1.6;
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.score-box {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 10px;

  &__track {
    flex: 1;
    height: 12px;
    border-radius: 999px;
    background: #e8eef0;
    overflow: hidden;
  }

  &__fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--skill-card-accent, #49b37d) 0%, #1e3a5f 100%);
  }

  &__value {
    min-width: 64px;
    color: #475569;
    font-size: 0.9rem;
    font-weight: 800;
    text-align: right;
  }
}

// Save confirm dialog
.modern-card {
  border-radius: 18px !important;
  overflow: hidden;
}

.unregister-dialog-card {
  width: 440px;
  max-width: 92vw;

  &__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  &__button {
    width: 100%;
    min-height: 44px;
    padding-inline: 12px;
  }

  &__actions :deep(.q-btn) {
    width: 100%;
    min-height: 46px;
  }

  &__actions :deep(.q-btn__content) {
    width: 100%;
    justify-content: center;
    white-space: nowrap;
  }
}

.unregister-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba(#c62828, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
