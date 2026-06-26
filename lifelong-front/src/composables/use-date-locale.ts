import { computed, type ComputedRef } from 'vue';
import { useI18n } from 'vue-i18n';

export interface ThaiDateLocale {
  days: string[];
  daysShort: string[];
  months: string[];
  monthsShort: string[];
  firstDayOfWeek: number;
  format24h: boolean;
  pluralDay: string;
}

const THAI_DATE_LOCALE: ThaiDateLocale = {
  days: ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'],
  daysShort: ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'],
  months: [
    'มกราคม',
    'กุมภาพันธ์',
    'มีนาคม',
    'เมษายน',
    'พฤษภาคม',
    'มิถุนายน',
    'กรกฎาคม',
    'สิงหาคม',
    'กันยายน',
    'ตุลาคม',
    'พฤศจิกายน',
    'ธันวาคม',
  ],
  monthsShort: [
    'ม.ค.',
    'ก.พ.',
    'มี.ค.',
    'เม.ย.',
    'พ.ค.',
    'มิ.ย.',
    'ก.ค.',
    'ส.ค.',
    'ก.ย.',
    'ต.ค.',
    'พ.ย.',
    'ธ.ค.',
  ],
  firstDayOfWeek: 0,
  format24h: true,
  pluralDay: 'วัน',
};

export function useDateLocale(): ComputedRef<ThaiDateLocale | undefined> {
  const { locale } = useI18n({ useScope: 'global' });
  return computed(() => (locale.value === 'th' ? THAI_DATE_LOCALE : undefined));
}
