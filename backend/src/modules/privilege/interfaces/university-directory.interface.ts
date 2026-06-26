export const UNIVERSITY_DIRECTORY = 'UNIVERSITY_DIRECTORY';

export interface ResolveContext {
  citizenId: string | null;
  email: string;
}

export interface UniversityDirectory {
  resolveStudentType(context: ResolveContext): Promise<{
    stutypeId: number;
    stutypeName: string | null;
    source: 'student' | 'alumni' | 'staff';
  } | null>;
}
