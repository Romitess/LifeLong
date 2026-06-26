<template>
  <!-- 0. Price Preview Dialog -->
  <q-dialog
    v-model="showPricePreviewDialog"
    transition-show="scale"
    transition-hide="scale"
    persistent
  >
    <q-card class="modern-card price-preview-card">
      <q-card-section class="modern-header q-pa-lg">
        <div class="text-h6 text-white text-weight-bold">
          {{ t('enrollment.pricePreviewTitle') }}
        </div>
        <div class="text-caption text-white opacity-80">{{ t('enrollment.pricePreviewSub') }}</div>
      </q-card-section>

      <q-card-section class="q-pa-lg">
        <div v-if="isLoadingPrice" class="text-center q-py-lg">
          <q-spinner-dots color="primary" size="40px" />
        </div>

        <template v-else-if="enrollingCourse">
          <div class="q-mb-md q-pa-sm bg-grey-1 rounded-borders">
            <div class="text-weight-bold text-dark">{{ translatedEnrollingCourseTitle }}</div>
            <div class="text-caption text-grey-6">{{ enrollingCourse.code }}</div>
          </div>

          <div class="price-preview-row q-mb-sm">
            <span class="text-grey-7">{{ t('enrollment.pricePreviewType') }}</span>
            <span class="text-weight-medium text-dark">
              {{
                privilegeInfo?.stutypeName
                  ? privilegeInfo.stutypeName
                  : t('enrollment.pricePreviewNoType')
              }}
            </span>
          </div>

          <div class="price-preview-row q-mb-md">
            <span class="text-grey-7">{{ t('enrollment.pricePreviewYourFee') }}</span>
            <span class="text-h6 text-primary text-weight-bolder">{{ priceLabel }}</span>
          </div>

          <div
            v-if="privilegeInfo?.isPrivileged"
            class="price-preview-note q-pa-sm rounded-borders q-mb-md"
          >
            <q-icon name="local_offer" color="positive" size="16px" class="q-mr-xs" />
            <span class="text-caption text-positive">
              {{ t('enrollment.pricePreviewPrivilegeNote', { type: privilegeInfo.stutypeName }) }}
            </span>
          </div>
          <div
            v-else-if="privilegeInfo"
            class="price-preview-note price-preview-note--normal q-pa-sm rounded-borders q-mb-md"
          >
            <q-icon name="info" color="grey-6" size="16px" class="q-mr-xs" />
            <span class="text-caption text-grey-7">{{
              t('enrollment.pricePreviewNormalNote')
            }}</span>
          </div>
        </template>
      </q-card-section>

      <q-card-actions class="q-px-lg q-pb-lg" align="center">
        <BaseButton
          outline
          :label="t('enrollment.cancel')"
          color="grey-7"
          no-caps
          @click="showPricePreviewDialog = false"
        />
        <BaseButton
          :label="t('enrollment.pricePreviewConfirm')"
          color="primary"
          no-caps
          :disable="isLoadingPrice"
          @click="confirmPricePreview"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- 1. Paid Info Dialog -->
  <q-dialog
    v-model="showPaidInfoDialog"
    transition-show="scale"
    transition-hide="scale"
    @hide="onPaidInfoDialogHide"
  >
    <q-card class="modern-card paid-info-dialog-card">
      <q-card-section class="modern-header q-pa-lg">
        <div class="text-h6 text-white text-weight-bold">{{ t('enrollment.paidInfoTitle') }}</div>
        <div class="text-caption text-white opacity-80">
          {{ t('enrollment.paidInfoSubtitle') }}
        </div>
      </q-card-section>

      <q-card-section class="q-px-lg q-pt-lg q-pb-sm">
        <div class="paid-info-fee-banner">
          <div class="text-caption text-grey-6">{{ t('enrollment.fee') }}</div>
          <div class="text-h5 text-primary text-weight-bolder">{{ priceLabel }}</div>
        </div>
      </q-card-section>

      <q-card-section class="q-px-lg q-pt-sm q-pb-md">
        <q-form ref="paidInfoFormRef" @submit.prevent="submitPaidInfo" class="q-gutter-y-md">
          <q-input
            v-model="userInfo.taxId"
            :label="t('enrollment.taxId')"
            :placeholder="t('enrollment.taxIdHint')"
            outlined
            rounded
            dense
            bg-color="grey-1"
            mask="#############"
            unmasked-value
            :rules="[(val) => !!val || t('enrollment.taxIdRequired')]"
          >
            <template v-slot:prepend>
              <q-icon name="badge" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="userInfo.name"
            :label="t('enrollment.fullName')"
            :placeholder="t('enrollment.fullNameHint')"
            outlined
            rounded
            dense
            bg-color="grey-1"
            :rules="[(val) => !!val || t('enrollment.fullNameRequired')]"
          >
            <template v-slot:prepend>
              <q-icon name="person" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="userInfo.email"
            :label="t('enrollment.email')"
            :placeholder="t('enrollment.emailHint')"
            outlined
            rounded
            dense
            bg-color="grey-1"
            type="email"
            :rules="[(val) => !!val || t('enrollment.emailRequired')]"
          >
            <template v-slot:prepend>
              <q-icon name="email" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="userInfo.phone"
            :label="t('enrollment.phone')"
            :placeholder="t('enrollment.phoneHint')"
            outlined
            rounded
            dense
            bg-color="grey-1"
            type="tel"
            mask="###-###-####"
            unmasked-value
            :rules="[(val) => !!val || t('enrollment.phoneRequired')]"
          >
            <template v-slot:prepend>
              <q-icon name="phone" color="primary" />
            </template>
          </q-input>

          <q-input
            v-model="userInfo.billingAddress"
            :label="t('enrollment.billingAddress')"
            :placeholder="t('enrollment.billingAddressHint')"
            outlined
            rounded
            dense
            bg-color="grey-1"
            type="textarea"
            autogrow
            :rules="[(val) => !!val || t('enrollment.billingAddressRequired')]"
          >
            <template v-slot:prepend>
              <q-icon name="location_on" color="primary" />
            </template>
          </q-input>

          <div class="paid-info-dialog-card__actions q-mt-lg">
            <BaseButton
              outline
              :label="t('enrollment.cancel')"
              color="grey-7"
              no-caps
              class="paid-info-dialog-card__button"
              @click="cancelPaidInfo"
            />
            <BaseButton
              type="submit"
              :label="t('enrollment.next')"
              color="primary"
              no-caps
              class="paid-info-dialog-card__button"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- 2. QR Code Dialog -->
  <q-dialog v-model="showQrDialog" transition-show="scale" transition-hide="scale">
    <q-card class="modern-card" style="width: 380px; max-width: 90vw">
      <q-card-section class="modern-header q-pa-lg text-center">
        <div class="text-h6 text-white text-weight-bold">{{ t('enrollment.qrTitle') }}</div>
        <div class="text-caption text-white opacity-80">
          {{ t('enrollment.qrSubtitle', { amount: priceLabel }) }}
        </div>
      </q-card-section>

      <q-card-section class="q-pa-lg text-center">
        <div class="qr-container q-pa-sm bg-white shadow-2">
          <q-img :src="qrUrl" spinner-color="primary" style="width: 200px; height: 200px" />
        </div>
        <div class="q-mt-md text-grey-7 text-caption">
          <q-icon name="info" color="info" /> {{ t('enrollment.qrSupport') }}
        </div>

        <div class="q-mt-md q-pa-md bg-primary-faded rounded-borders border-primary-light">
          <div class="text-caption text-grey-7">{{ t('enrollment.totalAmount') }}</div>
          <div class="text-h4 text-primary text-weight-bolder">
            {{ priceLabel }}
          </div>
        </div>
      </q-card-section>

      <div class="qr-dialog-actions q-px-lg q-pb-lg q-pt-sm">
        <BaseButton
          outline
          :label="t('enrollment.cancel')"
          color="grey-7"
          no-caps
          @click="showQrDialog = false"
        />
        <BaseButton
          :label="t('enrollment.paymentDone')"
          color="positive"
          no-caps
          @click="onPaymentDone"
        />
      </div>
    </q-card>
  </q-dialog>

  <!-- 3. Free Enroll Confirmation Dialog -->
  <q-dialog v-model="showFreeConfirmDialog" transition-show="scale" transition-hide="scale">
    <q-card class="modern-card enrollment-confirm-dialog-card">
      <q-card-section class="q-pa-xl text-center">
        <div class="enrollment-icon-wrap q-mx-auto q-mb-lg">
          <q-icon name="how_to_reg" size="40px" color="primary" />
        </div>
        <div class="text-h6 text-weight-bolder text-dark">
          {{ t('enrollment.confirmEnrollTitle') }}
        </div>
        <div class="text-grey-7 q-mt-sm">
          {{ t('enrollment.confirmEnrollSub') }}
        </div>
        <div v-if="enrollingCourse" class="q-mt-md q-pa-sm bg-grey-1 rounded-borders">
          <div class="text-weight-bold text-dark">{{ translatedEnrollingCourseTitle }}</div>
          <div class="text-caption text-grey-6">{{ enrollingCourse.code }}</div>
        </div>
      </q-card-section>

      <q-card-actions class="enrollment-confirm-dialog-card__actions q-px-lg q-pb-lg">
        <BaseButton
          outline
          :label="t('enrollment.notNow')"
          color="grey-7"
          no-caps
          class="enrollment-confirm-dialog-card__button"
          @click="cancelFreeEnroll"
        />
        <BaseButton
          :label="t('enrollment.confirmEnroll')"
          color="primary"
          no-caps
          class="enrollment-confirm-dialog-card__button"
          @click="confirmFreeEnroll"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- 4. Success Dialog -->
  <q-dialog v-model="showSuccessDialog" transition-show="scale" transition-hide="scale">
    <q-card class="modern-card" style="width: 350px">
      <q-card-section class="q-pa-xl text-center">
        <q-avatar
          icon="check_circle"
          color="positive-faded"
          text-color="positive"
          size="80px"
          class="q-mb-md"
        />
        <div class="text-h6 text-weight-bold">{{ t('enrollment.successTitle') }}</div>
        <div class="text-grey-7 q-mt-sm">
          {{ t('enrollment.successSub') }}
        </div>
      </q-card-section>

      <q-card-actions align="center" class="q-pb-lg">
        <q-btn
          unelevated
          rounded
          :label="t('enrollment.startLearning')"
          color="primary"
          class="full-width q-mx-md"
          padding="md"
          no-caps
          v-close-popup
          @click="$emit('go-to-learning', enrollingCourseId)"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue';
import BaseButton from 'components/base/BaseButton.vue';
import type { CourseDetail } from 'src/types/course-detail';
import { useCoursePaymentStore } from 'src/stores/course-payment-store';
import { useCourseRegistrationStore } from 'src/stores/course-registration-store';
import { useAuthStore } from 'src/stores/auth-store';
import { useI18n } from 'vue-i18n';
import { api } from 'src/boot/axios';

interface Props {
  course?: CourseDetail | null;
  openKey?: number;
}

interface FormValidator {
  validate: () => boolean | Promise<boolean>;
  resetValidation: () => void;
}

const props = withDefaults(defineProps<Props>(), {
  course: null,
  openKey: 0,
});

const emit = defineEmits<{
  (e: 'enrolled', courseId: string): void;
  (e: 'go-to-learning', courseId: string): void;
}>();

const courseRegistrationStore = useCourseRegistrationStore();
const coursePaymentStore = useCoursePaymentStore();
const authStore = useAuthStore();
const { t, locale } = useI18n();

const showPricePreviewDialog = ref(false);
const isLoadingPrice = ref(false);
const privilegeInfo = ref<{
  effectivePrice: number;
  stutypeName: string | null;
  isPrivileged: boolean;
} | null>(null);

const showPaidInfoDialog = ref(false);
const showQrDialog = ref(false);
const showFreeConfirmDialog = ref(false);
const showSuccessDialog = ref(false);
const pendingQrOpen = ref(false);

const paidInfoFormRef = ref<FormValidator | null>(null);
const qrUrl = ref('');
const enrollingCourse = ref<CourseDetail | null>(null);
const enrollingCourseId = computed<string>(() => enrollingCourse.value?.id ?? '');

const userInfo = reactive({
  name: '',
  email: '',
  phone: '',
  taxId: '',
  billingAddress: '',
});

const PAID_INFO_STORAGE_KEY = 'enrollment_paid_info';

function savePaidInfoToStorage(courseId: string): void {
  try {
    const stored = JSON.parse(localStorage.getItem(PAID_INFO_STORAGE_KEY) || '{}') as Record<
      string,
      typeof userInfo
    >;
    stored[courseId] = { ...userInfo };
    localStorage.setItem(PAID_INFO_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    /* silently ignore storage errors */
  }
}

function loadPaidInfoFromStorage(courseId: string): boolean {
  try {
    const stored = JSON.parse(localStorage.getItem(PAID_INFO_STORAGE_KEY) || '{}') as Record<
      string,
      typeof userInfo
    >;
    const saved = stored[courseId];
    if (saved && saved.name) {
      userInfo.name = saved.name;
      userInfo.email = saved.email || '';
      userInfo.phone = saved.phone || '';
      userInfo.taxId = saved.taxId || '';
      userInfo.billingAddress = saved.billingAddress || '';
      return true;
    }
  } catch {
    /* silently ignore storage errors */
  }
  return false;
}

function clearPaidInfoFromStorage(courseId: string): void {
  try {
    const stored = JSON.parse(localStorage.getItem(PAID_INFO_STORAGE_KEY) || '{}') as Record<
      string,
      typeof userInfo
    >;
    delete stored[courseId];
    localStorage.setItem(PAID_INFO_STORAGE_KEY, JSON.stringify(stored));
  } catch {
    /* silently ignore storage errors */
  }
}

const effectivePrice = computed<number>(
  () => privilegeInfo.value?.effectivePrice ?? enrollingCourse.value?.price ?? 0,
);

const priceLabel = computed<string>(() => {
  if (effectivePrice.value === 0) return `0 ${t('thb')}`;
  return `${effectivePrice.value.toLocaleString(locale.value === 'th' ? 'th-TH' : 'en-US')} ${t('thb')}`;
});

const translatedEnrollingCourseTitle = computed<string>(() => {
  if (!enrollingCourse.value) {
    return '';
  }

  if (locale.value === 'th') {
    return enrollingCourse.value.title;
  }

  return enrollingCourse.value.titleEn || enrollingCourse.value.title;
});

/**
 * Open the enrollment flow for a given course.
 * Shows price-preview dialog first, then proceeds to paid/free flow.
 */
async function openEnrollment(course: CourseDetail): Promise<void> {
  resetEnrollmentDialogs();
  enrollingCourse.value = course;
  privilegeInfo.value = null;

  const username = authStore.user?.username;
  if (username && course.code) {
    isLoadingPrice.value = true;
    showPricePreviewDialog.value = true;
    try {
      const { data } = await api.get<{
        effectivePrice: number;
        stutypeName: string | null;
        isPrivileged: boolean;
      }>('/api/moodle/enroll/my-fee', {
        params: { username, courseCode: course.code },
      });
      privilegeInfo.value = data;
    } catch {
      privilegeInfo.value = {
        effectivePrice: course.price,
        stutypeName: null,
        isPrivileged: false,
      };
    } finally {
      isLoadingPrice.value = false;
    }
  } else {
    proceedEnrollment();
  }
}

function confirmPricePreview(): void {
  showPricePreviewDialog.value = false;
  proceedEnrollment();
}

function proceedEnrollment(): void {
  if (!enrollingCourse.value) return;
  const isFreeNow = effectivePrice.value === 0;

  if (isFreeNow) {
    showFreeConfirmDialog.value = true;
  } else {
    const courseId = enrollingCourse.value.id;
    const existingRegistration = courseRegistrationStore.myRegistrations.find(
      (r) => r.courseId === courseId && r.paymentStatus === 'pending',
    );

    if (existingRegistration && existingRegistration.registrantInfo) {
      userInfo.name = existingRegistration.registrantInfo.fullName;
      userInfo.email = existingRegistration.registrantInfo.email;
      userInfo.phone = existingRegistration.registrantInfo.phone;
      userInfo.taxId = existingRegistration.registrantInfo.taxId || '';
      userInfo.billingAddress = existingRegistration.registrantInfo.billingAddress || '';
    } else if (!loadPaidInfoFromStorage(courseId)) {
      resetPaidInfo();
    }

    showPaidInfoDialog.value = true;
    void nextTick(() => {
      paidInfoFormRef.value?.resetValidation();
    });
  }
}

function resetEnrollmentDialogs(): void {
  showPricePreviewDialog.value = false;
  showPaidInfoDialog.value = false;
  showQrDialog.value = false;
  showFreeConfirmDialog.value = false;
  showSuccessDialog.value = false;
  pendingQrOpen.value = false;
}

function onPaidInfoDialogHide(): void {
  if (pendingQrOpen.value) {
    pendingQrOpen.value = false;
    showQrDialog.value = true;
  }
}

function resetPaidInfo(): void {
  userInfo.name = '';
  userInfo.email = '';
  userInfo.phone = '';
  userInfo.taxId = '';
  userInfo.billingAddress = '';
  paidInfoFormRef.value?.resetValidation();
}

function cancelPaidInfo(): void {
  showPaidInfoDialog.value = false;
}

function cancelFreeEnroll(): void {
  showFreeConfirmDialog.value = false;
}

async function submitPaidInfo(): Promise<void> {
  if (!enrollingCourse.value) {
    return;
  }

  const isValid = await paidInfoFormRef.value?.validate();
  if (!isValid) {
    return;
  }

  // Close the info dialog first
  showPaidInfoDialog.value = false;

  savePaidInfoToStorage(enrollingCourse.value.id);

  void courseRegistrationStore.registerCourse(enrollingCourse.value, 'student', 'pending', {
    fullName: userInfo.name,
    email: userInfo.email,
    phone: userInfo.phone,
    taxId: userInfo.taxId,
    billingAddress: userInfo.billingAddress,
  });

  const paymentData = encodeURIComponent(
    `PROMPTPAY:${enrollingCourse.value.code}:THB:${effectivePrice.value}`,
  );
  qrUrl.value =
    `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${paymentData}` +
    '&bgcolor=ffffff&color=1a237e';

  pendingQrOpen.value = true;
}

function confirmFreeEnroll(): void {
  if (enrollingCourse.value) {
    void courseRegistrationStore.registerCourse(enrollingCourse.value, 'student');
    emit('enrolled', enrollingCourse.value.id);
  }
  showFreeConfirmDialog.value = false;
  showSuccessDialog.value = true;
}

function onPaymentDone(): void {
  if (!enrollingCourse.value) {
    return;
  }

  const issuedAt = new Date();
  const nextReceiptId = `R${Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0')}`;

  void courseRegistrationStore.registerCourse(enrollingCourse.value, 'student', 'paid', {
    fullName: userInfo.name,
    email: userInfo.email,
    phone: userInfo.phone,
    taxId: userInfo.taxId,
    billingAddress: userInfo.billingAddress,
  });
  coursePaymentStore.recordPaidCourse(enrollingCourse.value, {
    receiptId: nextReceiptId,
    paymentDate: issuedAt.toISOString(),
    taxId: userInfo.taxId,
    customerName: userInfo.name,
    customerAddress: userInfo.billingAddress,
  });
  clearPaidInfoFromStorage(enrollingCourse.value.id);
  emit('enrolled', enrollingCourse.value.id);

  showQrDialog.value = false;
  showSuccessDialog.value = true;
}

watch(
  () => props.openKey,
  () => {
    if (!props.course) {
      return;
    }

    void openEnrollment(props.course);
  },
);

defineExpose({
  openEnrollment,
});
</script>

<style lang="scss" scoped>
.modern-card {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}

.paid-info-fee-banner {
  background: rgba($primary, 0.07);
  border: 1px solid rgba($primary, 0.18);
  border-radius: 12px;
  padding: 12px 16px;
  text-align: center;
}

.paid-info-dialog-card {
  width: 450px;
  max-width: 90vw;

  &__actions {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
    max-width: 320px;
    margin-inline: auto;
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

.enrollment-confirm-dialog-card {
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

.enrollment-icon-wrap {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: rgba($primary, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}

.qr-dialog-actions {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  :deep(.q-btn) {
    width: 100%;
    min-height: 46px;
  }

  :deep(.q-btn__content) {
    width: 100%;
    justify-content: center;
    white-space: nowrap;
  }
}

.modern-header {
  background: linear-gradient(135deg, $primary 0%, mix(black, $primary, 10%) 100%);
}

.qr-container {
  display: inline-block;
  border-radius: 16px;
  border: 1px solid #f0f0f0;
}

.bg-primary-faded {
  background: rgba($primary, 0.12) !important;
}

.border-primary-light {
  border: 1px solid rgba($primary, 0.22);
}

.opacity-80 {
  opacity: 0.8;
}

.price-preview-card {
  width: 420px;
  max-width: 92vw;
}

.price-preview-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.price-preview-note {
  background: rgba($positive, 0.08);
  border: 1px solid rgba($positive, 0.2);
  display: flex;
  align-items: center;

  &--normal {
    background: rgba(0, 0, 0, 0.04);
    border-color: rgba(0, 0, 0, 0.1);
  }
}
</style>
