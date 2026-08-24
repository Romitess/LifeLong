export function formatDateInput(date: Date, separator: '/' | '-' = '/'): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  if (separator === '-') {
    return `${year}-${month}-${day}`;
  }
  return `${day}/${month}/${year}`;
}

export function formatUnixTimestamp(unixSeconds: number | null | undefined): string {
  if (!unixSeconds) return '-';
  const d = new Date(unixSeconds * 1000);
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
