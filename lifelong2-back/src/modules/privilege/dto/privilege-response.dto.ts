export class PrivilegeResponseDto {
  hasPrivilege: boolean;
  stutypeId: number | null;
  stutypeName: string | null;
  source: 'student' | 'alumni' | 'staff' | null;
  checkedAt: string;
}
