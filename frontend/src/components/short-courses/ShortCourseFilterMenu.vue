<template>
  <q-btn
    round
    flat
    icon="filter_list"
    color="grey-7"
    class="short-course-filter__button"
    :aria-label="$t('additionalFilters')"
  >
    <q-menu padding class="filter-menu shadow-10" style="border-radius: 16px">
      <div class="q-pa-md" style="min-width: 250px">
        <div class="text-subtitle1 text-weight-bold q-mb-md">
          {{ $t('additionalFilters') }}
        </div>

        <div class="filter-group q-mb-md">
          <div class="text-caption text-grey-7 q-mb-xs">{{ $t('courseType') }}</div>
          <div class="row q-gutter-xs">
            <q-btn
              v-for="opt in typeOptions"
              :key="opt.label"
              unelevated
              dense
              :color="filter.type === opt.value ? 'primary' : 'grey-2'"
              :text-color="filter.type === opt.value ? 'white' : 'dark'"
              :label="opt.label"
              class="q-px-md text-caption"
              no-caps
              @click="filter.type = filter.type === opt.value ? null : opt.value"
            />
          </div>
        </div>

        <div class="filter-group q-mb-md">
          <div class="text-caption text-grey-7 q-mb-xs">{{ $t('price') }}</div>
          <div class="row q-gutter-xs">
            <q-btn
              unelevated
              dense
              :color="filter.price === 'free' ? 'primary' : 'grey-2'"
              :text-color="filter.price === 'free' ? 'white' : 'dark'"
              :label="$t('free')"
              class="q-px-md text-caption"
              no-caps
              @click="filter.price = filter.price === 'free' ? null : 'free'"
            />
            <q-btn
              unelevated
              dense
              :color="filter.price === 'paid' ? 'primary' : 'grey-2'"
              :text-color="filter.price === 'paid' ? 'white' : 'dark'"
              :label="$t('paid')"
              class="q-px-md text-caption"
              no-caps
              @click="filter.price = filter.price === 'paid' ? null : 'paid'"
            />
          </div>
        </div>

        <div class="filter-group q-mb-md">
          <div class="text-caption text-grey-7 q-mb-xs">{{ $t('learningMode') }}</div>
          <div class="row q-gutter-xs">
            <q-btn
              v-for="mode in ['Online', 'Onsite', 'Self-Paced Learning']"
              :key="mode"
              unelevated
              dense
              :color="filter.deliveryMode === mode ? 'primary' : 'grey-2'"
              :text-color="filter.deliveryMode === mode ? 'white' : 'dark'"
              :label="mode"
              class="q-px-md text-caption"
              no-caps
              @click="filter.deliveryMode = filter.deliveryMode === mode ? null : mode"
            />
          </div>
        </div>

        <div class="filter-group q-mb-md">
          <div class="text-caption text-grey-7 q-mb-xs">
            {{ $t('registerableCourses') }}
          </div>
          <div class="row q-gutter-xs">
            <q-btn
              unelevated
              dense
              :color="filter.availability === 'open' ? 'primary' : 'grey-2'"
              :text-color="filter.availability === 'open' ? 'white' : 'dark'"
              :label="$t('openRegistration')"
              class="q-px-md text-caption"
              no-caps
              @click="filter.availability = filter.availability === 'open' ? null : 'open'"
            />
            <q-btn
              unelevated
              dense
              :color="filter.availability === 'closed' ? 'primary' : 'grey-2'"
              :text-color="filter.availability === 'closed' ? 'white' : 'dark'"
              :label="$t('closedRegistration')"
              class="q-px-md text-caption"
              no-caps
              @click="filter.availability = filter.availability === 'closed' ? null : 'closed'"
            />
          </div>
        </div>

        <div class="filter-group q-mb-md">
          <div class="text-caption text-grey-7 q-mb-xs">{{ $t('dateRange') }}</div>
          <div class="row q-gutter-sm">
            <q-input
              class="col"
              v-model="filter.startDate"
              mask="##/##/####"
              outlined
              dense
              clearable
              :hint="$t('fromDate')"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="startDateProxy"
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="filter.startDate"
                      mask="DD/MM/YYYY"
                      color="primary"
                      :locale="dateLocale"
                      @update:model-value="() => startDateProxy?.hide()"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
            <q-input
              class="col"
              v-model="filter.endDate"
              mask="##/##/####"
              outlined
              dense
              clearable
              :hint="$t('toDate')"
            >
              <template v-slot:append>
                <q-icon name="event" class="cursor-pointer">
                  <q-popup-proxy
                    ref="endDateProxy"
                    cover
                    transition-show="scale"
                    transition-hide="scale"
                  >
                    <q-date
                      v-model="filter.endDate"
                      mask="DD/MM/YYYY"
                      color="primary"
                      :locale="dateLocale"
                      @update:model-value="() => endDateProxy?.hide()"
                    />
                  </q-popup-proxy>
                </q-icon>
              </template>
            </q-input>
          </div>
        </div>

        <q-separator class="q-my-sm" />
        <div class="row q-gutter-sm">
          <q-btn
            unelevated
            :label="$t('clear')"
            color="grey-2"
            text-color="dark"
            dense
            no-caps
            class="col q-px-md rounded-borders"
            @click="emit('reset')"
          />
          <q-btn
            unelevated
            :label="$t('ok')"
            color="primary"
            dense
            no-caps
            class="col q-px-md rounded-borders"
            v-close-popup
          />
        </div>
      </div>
    </q-menu>
  </q-btn>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { QPopupProxy } from 'quasar';

export interface ShortCourseFilter {
  type: string | null;
  faculty: string | null;
  category: string | null;
  search: string;
  price: 'free' | 'paid' | null;
  deliveryMode: string | null;
  availability: 'open' | 'closed' | null;
  startDate: string | null;
  endDate: string | null;
  onlyActive: boolean;
}

export interface ShortCourseTypeOption {
  label: string;
  value: string | null;
}

interface DateLocale {
  days: string[];
  daysShort: string[];
  months: string[];
  monthsShort: string[];
  firstDayOfWeek: number;
  format24h: boolean;
  pluralDay: string;
}

const filter = defineModel<ShortCourseFilter>({ required: true });

defineProps<{
  typeOptions: ShortCourseTypeOption[];
  dateLocale: DateLocale | undefined;
}>();

const emit = defineEmits<{
  reset: [];
}>();

const startDateProxy = ref<QPopupProxy | null>(null);
const endDateProxy = ref<QPopupProxy | null>(null);
</script>

<style scoped lang="scss">
.short-course-filter__button {
  width: 44px;
  height: 44px;
  min-width: 44px;
  min-height: 44px;
  /* Keep the round shape (beats the global 12px), but let the border weight/color
     come from the global `body .q-btn` (1px) so it matches every other button. */
  border-radius: 50% !important;
  background: #ffffff;

  :deep(.q-btn__content) {
    border-radius: inherit;
  }
}
</style>
