import type { Course } from 'src/types/course';

type SupportedLocale = 'th' | 'en';

const CURRENCY_FORMATTER = new Intl.NumberFormat('th-TH', {
  style: 'currency',
  currency: 'THB',
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return CURRENCY_FORMATTER.format(Math.round(value));
}

export function formatPrice(price: number, locale: SupportedLocale = 'th'): string {
  return price.toLocaleString(locale === 'th' ? 'th-TH' : 'en-US');
}

export function formatViews(views: number, locale: SupportedLocale = 'th'): string {
  return views.toLocaleString(locale === 'th' ? 'th-TH' : 'en-US');
}

export function formatCount(value: number, locale: SupportedLocale = 'th'): string {
  return value.toLocaleString(locale === 'th' ? 'th-TH' : 'en-US');
}

export function formatCompactCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `฿${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  }
  if (value >= 1_000) {
    return `฿${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}K`;
  }
  return formatCurrency(value);
}

export function calculateCourseRevenue(course: Course): number {
  if (course.isFree) return 0;
  return course.price * course.enrolledCount;
}

export function calculateFillRate(course: Course): number {
  if (!course.maxSeats) return 0;
  return course.enrolledCount / course.maxSeats;
}

export function formatPriceLabel(course: Course, locale: SupportedLocale = 'th'): string {
  if (course.isFree) return locale === 'th' ? 'ฟรี' : 'Free';
  return formatCurrency(course.price);
}
