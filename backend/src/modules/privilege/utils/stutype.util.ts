export function mapStutypeNameToSource(
  name: string | null | undefined,
): 'student' | 'alumni' | 'staff' | null {
  const n = (name ?? '').toLowerCase();
  if (n.includes('ศิษย์เก่า') || n.includes('alumni')) return 'alumni';
  if (n.includes('บุคลากร') || n.includes('staff')) return 'staff';
  if (n.includes('นิสิต') || n.includes('student')) return 'student';
  return null;
}
