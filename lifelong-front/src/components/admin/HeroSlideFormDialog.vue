<template>
  <AppDialog
    :model-value="modelValue"
    persistent
    :title="mode === 'create' ? 'เพิ่มสไลด์รูปภาพใหม่' : 'แก้ไขข้อมูลสไลด์'"
    icon="image"
    icon-color="var(--admin-gold, #f5a623)"
    icon-background="rgba(245, 166, 35, 0.14)"
    width="520px"
    card-class="hero-slide-form-dialog"
    body-class="hero-slide-form-dialog__body"
    actions-class="hero-slide-form-dialog__actions"
    @update:model-value="emitUpdate"
    @close="onCancel"
  >
    <q-form id="hero-slide-form" ref="formRef" greedy @submit.prevent="onSubmit">
      <div v-if="previewUrl" class="hero-slide-form-dialog__preview">
        <img :src="previewUrl" alt="" />
      </div>

      <BaseInput
        v-model="form.name"
        label="ชื่อสไลด์"
        required
        autofocus
        hide-bottom-space
        :rules="[requiredNameRule]"
      />

      <div>
        <BaseDateRangeFilter
          v-model="form.schedule"
          label="ช่วงวันแสดงผล"
          required
          from-hint="วันเริ่มแสดง"
          to-hint="วันสิ้นสุด"
        />
        <p v-if="showScheduleError" class="hero-slide-form-dialog__error">
          <q-icon name="error_outline" size="14px" />
          {{ scheduleMessage }}
        </p>
      </div>
    </q-form>

    <template #actions>
      <AppActionButton variant="secondary" label="ยกเลิก" type="button" @click="onCancel" />
      <AppActionButton
        variant="primary"
        icon="check"
        :label="mode === 'create' ? 'เพิ่มสไลด์' : 'บันทึก'"
        type="submit"
        form="hero-slide-form"
      />
    </template>
  </AppDialog>
</template>

<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue';
import type { QForm } from 'quasar';
import AppDialog from 'components/common/AppDialog.vue';
import AppActionButton from 'components/common/AppActionButton.vue';
import BaseDateRangeFilter, { type DateRangeValue } from 'components/base/BaseDateRangeFilter.vue';
import BaseInput from 'components/base/BaseInput.vue';

export interface HeroSlideFormPayload {
  name: string;
  startDate: string | null;
  endDate: string | null;
}

interface Props {
  modelValue: boolean;
  mode?: 'create' | 'edit';
  initialName?: string;
  initialStartDate?: string | null;
  initialEndDate?: string | null;
  previewUrl?: string;
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'create',
  initialName: '',
  initialStartDate: null,
  initialEndDate: null,
  previewUrl: '',
});

const emit = defineEmits<{
  (event: 'update:modelValue', value: boolean): void;
  (event: 'submit', payload: HeroSlideFormPayload): void;
  (event: 'cancel'): void;
}>();

const formRef = ref<QForm | null>(null);
const showScheduleError = ref(false);

const form = reactive<{ name: string; schedule: DateRangeValue }>({
  name: '',
  schedule: { start: null, end: null },
});

watch(
  () => props.modelValue,
  (open) => {
    if (open) {
      form.name = props.initialName;
      form.schedule = {
        start: props.initialStartDate,
        end: props.initialEndDate,
      };
      showScheduleError.value = false;
    }
  },
  { immediate: true },
);

watch(
  () => form.schedule,
  () => {
    if (showScheduleError.value && !scheduleMessage.value) {
      showScheduleError.value = false;
    }
  },
  { deep: true },
);

function parseDate(value: string | null): Date | null {
  if (!value) return null;
  const parts = value.split('/');
  if (parts.length !== 3) return null;
  const [day, month, year] = parts.map(Number);
  if (!day || !month || !year) return null;
  return new Date(year, month - 1, day);
}

const scheduleMessage = computed(() => {
  if (!form.schedule.start || !form.schedule.end) {
    return 'กรุณาระบุวันเริ่มแสดงและวันสิ้นสุด';
  }
  const start = parseDate(form.schedule.start);
  const end = parseDate(form.schedule.end);
  if (start && end && end < start) {
    return 'วันสิ้นสุดต้องไม่อยู่ก่อนวันเริ่มแสดง';
  }
  return '';
});

function requiredNameRule(value: string): true | string {
  return Boolean(value && value.trim()) || 'กรุณาระบุชื่อสไลด์';
}

function emitUpdate(value: boolean): void {
  emit('update:modelValue', value);
}

function onCancel(): void {
  emit('cancel');
  emit('update:modelValue', false);
}

async function onSubmit(): Promise<void> {
  const isFormValid = (await formRef.value?.validate()) ?? true;
  const isScheduleValid = !scheduleMessage.value;
  showScheduleError.value = !isScheduleValid;

  if (!isFormValid || !isScheduleValid) {
    return;
  }

  emit('submit', {
    name: form.name.trim(),
    startDate: form.schedule.start,
    endDate: form.schedule.end,
  });
  emit('update:modelValue', false);
}
</script>

<style lang="scss" scoped>
.hero-slide-form-dialog__body {
  display: grid;
  gap: 16px;
}

.hero-slide-form-dialog__preview {
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(16, 35, 63, 0.08);
  background: #f8fafc;
}

.hero-slide-form-dialog__preview img {
  display: block;
  width: 100%;
  max-height: 180px;
  object-fit: cover;
}

.hero-slide-form-dialog__error {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin: 0;
  color: #b91c1c;
  font-size: 0.78rem;
  font-weight: 600;
}

.hero-slide-form-dialog__actions {
  justify-content: flex-end;
}
</style>
