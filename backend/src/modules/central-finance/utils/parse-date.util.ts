export function parseDdMmYyyy(value: string | undefined, endOfDay: boolean): Date | null {
  if (!value) return null;
  const [dd, mm, yyyy] = value.split('/');
  const day = Number(dd);
  const month = Number(mm);
  const year = Number(yyyy);
  if (!day || !month || !year) return null;

  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  if (endOfDay) date.setHours(23, 59, 59, 999);
  else date.setHours(0, 0, 0, 0);
  return date;
}
