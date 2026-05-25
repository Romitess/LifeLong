import { defineStore } from 'pinia';
import { api } from 'src/boot/axios';

export interface User {
  id: string;
  studentId: string;
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  email: string;
  phone: string;
  faculty: string;
  facName?: string | null;
  department: string;
  role:
    | 'student'
    | 'staff'
    | 'external'
    | 'instructor'
    | 'teach'
    | 'admin'
    | 'finance'
    | 'central_finance'
    | 'lifelong2';
  username?: string;
  avatar: string;
}

export interface RegisterLearnerPayload {
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  phone: string;
  email: string;
  password: string;
}

export interface AuthActionResult {
  success: boolean;
  reason?: 'duplicate-email' | 'invalid-input';
}

interface StoredAuthAccount extends User {
  password: string;
  createdAt: string;
  source: 'mock' | 'registered';
}

export interface AuthDemoAccount {
  identifier: string;
  email: string;
  password: string;
  role: User['role'];
}

const PROFILE_AVATAR_STORAGE_KEY = 'lll-profile-avatar';
const FULL_PROFILE_AVATAR_STORAGE_KEY = 'lll-profile-avatar-full';
const USER_PROFILE_STORAGE_KEY = 'lll-user-profile';
const AUTH_ACCOUNTS_STORAGE_KEY = 'lll-auth-accounts';
const CURRENT_USER_EMAIL_STORAGE_KEY = 'userEmail';
const LOGIN_STATE_STORAGE_KEY = 'isLoggedIn';
export type UserProfileUpdate = Pick<
  User,
  'firstNameTh' | 'lastNameTh' | 'firstNameEn' | 'lastNameEn' | 'phone'
>;

type StoredUserProfile = UserProfileUpdate;

// removed: AUTH_DEMO_ACCOUNTS — no longer used; kept export to avoid breaking imports temporarily
export const AUTH_DEMO_ACCOUNTS: AuthDemoAccount[] = [].map((account: StoredAuthAccount) => ({
  identifier: account.username ?? account.email,
  email: account.email,
  password: account.password,
  role: account.role,
}));

function readLocalStorage(key: string): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return window.localStorage.getItem(key);
  } catch (error) {
    console.warn(`Failed to read localStorage key: ${key}`, error);
    return null;
  }
}

function removeLocalStorage(key: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.removeItem(key);
  } catch (error) {
    console.warn(`Failed to remove localStorage key: ${key}`, error);
  }
}

function writeLocalStorage(key: string, value: string): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    window.localStorage.setItem(key, value);
    return true;
  } catch (error) {
    console.warn(`Failed to write localStorage key: ${key}`, error);
    return false;
  }
}

function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

function createDefaultAvatar(email: string): string {
  return `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`;
}

function isUserRole(value: unknown): value is User['role'] {
  return (
    value === 'student' ||
    value === 'staff' ||
    value === 'external' ||
    value === 'instructor' ||
    value === 'teach' ||
    value === 'admin' ||
    value === 'finance' ||
    value === 'central_finance' ||
    value === 'lifelong2'
  );
}

function isStoredAuthAccount(value: unknown): value is StoredAuthAccount {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const account = value as Partial<StoredAuthAccount>;

  return (
    typeof account.id === 'string' &&
    typeof account.studentId === 'string' &&
    typeof account.firstNameTh === 'string' &&
    typeof account.lastNameTh === 'string' &&
    typeof account.firstNameEn === 'string' &&
    typeof account.lastNameEn === 'string' &&
    typeof account.email === 'string' &&
    typeof account.phone === 'string' &&
    typeof account.faculty === 'string' &&
    typeof account.department === 'string' &&
    isUserRole(account.role) &&
    typeof account.avatar === 'string' &&
    typeof account.password === 'string' &&
    typeof account.createdAt === 'string' &&
    (account.source === 'mock' || account.source === 'registered')
  );
}

function readStoredAuthAccounts(): StoredAuthAccount[] {
  const stored = readLocalStorage(AUTH_ACCOUNTS_STORAGE_KEY);

  if (!stored) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(stored) as unknown;

    if (!Array.isArray(parsedValue)) {
      return [];
    }

    return parsedValue.filter(isStoredAuthAccount).map((account) => ({
      ...account,
      email: normalizeEmail(account.email),
    }));
  } catch (error) {
    console.warn('Failed to parse stored auth accounts', error);
    removeLocalStorage(AUTH_ACCOUNTS_STORAGE_KEY);
    return [];
  }
}

function writeStoredAuthAccounts(accounts: StoredAuthAccount[]): void {
  writeLocalStorage(AUTH_ACCOUNTS_STORAGE_KEY, JSON.stringify(accounts));
}

function getAllAuthAccounts(): StoredAuthAccount[] {
  return readStoredAuthAccounts();
}

function findAuthAccountByEmail(email: string): StoredAuthAccount | null {
  const normalizedEmail = normalizeEmail(email);
  return getAllAuthAccounts().find((account) => account.email === normalizedEmail) ?? null;
}

function getStoredAvatar(): string | null {
  return readLocalStorage(PROFILE_AVATAR_STORAGE_KEY);
}

function getProfileFields(
  user: Pick<User, 'firstNameTh' | 'lastNameTh' | 'firstNameEn' | 'lastNameEn' | 'phone'>,
): StoredUserProfile {
  return {
    firstNameTh: user.firstNameTh,
    lastNameTh: user.lastNameTh,
    firstNameEn: user.firstNameEn,
    lastNameEn: user.lastNameEn,
    phone: user.phone,
  };
}

function getStoredProfile(): StoredUserProfile | null {
  const stored = readLocalStorage(USER_PROFILE_STORAGE_KEY);

  if (!stored) {
    return null;
  }

  try {
    const parsed = JSON.parse(stored) as Partial<User> | null;

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return {
      firstNameTh: typeof parsed.firstNameTh === 'string' ? parsed.firstNameTh : '',
      lastNameTh: typeof parsed.lastNameTh === 'string' ? parsed.lastNameTh : '',
      firstNameEn: typeof parsed.firstNameEn === 'string' ? parsed.firstNameEn : '',
      lastNameEn: typeof parsed.lastNameEn === 'string' ? parsed.lastNameEn : '',
      phone: typeof parsed.phone === 'string' ? parsed.phone : '',
    };
  } catch (error) {
    console.warn('Failed to parse stored user profile', error);
    removeLocalStorage(USER_PROFILE_STORAGE_KEY);
    return null;
  }
}

function persistUserProfile(profile: StoredUserProfile): void {
  const serializedProfile = JSON.stringify(profile);

  if (writeLocalStorage(USER_PROFILE_STORAGE_KEY, serializedProfile)) {
    return;
  }

  removeLocalStorage(FULL_PROFILE_AVATAR_STORAGE_KEY);
  if (writeLocalStorage(USER_PROFILE_STORAGE_KEY, serializedProfile)) {
    return;
  }

  removeLocalStorage(USER_PROFILE_STORAGE_KEY);
  if (writeLocalStorage(USER_PROFILE_STORAGE_KEY, serializedProfile)) {
    return;
  }

  console.warn('Unable to persist user profile. In-memory state was updated only.');
}

function createUserFromAccount(account: StoredAuthAccount): User {
  const storedProfile = getStoredProfile();

  return {
    id: account.id,
    studentId: account.studentId,
    firstNameTh: storedProfile?.firstNameTh || account.firstNameTh,
    lastNameTh: storedProfile?.lastNameTh || account.lastNameTh,
    firstNameEn: storedProfile?.firstNameEn || account.firstNameEn,
    lastNameEn: storedProfile?.lastNameEn || account.lastNameEn,
    email: account.email,
    phone: storedProfile?.phone || account.phone,
    faculty: account.faculty,
    facName: account.facName ?? null,
    department: account.department,
    role: account.role,
    ...(account.username !== undefined ? { username: account.username } : {}),
    avatar: getStoredAvatar() || account.avatar || createDefaultAvatar(account.email),
  };
}

function getInitialLoginState(): boolean {
  return readLocalStorage(LOGIN_STATE_STORAGE_KEY) === 'true';
}

function getCurrentUserAccount(): StoredAuthAccount | null {
  const email = readLocalStorage(CURRENT_USER_EMAIL_STORAGE_KEY);

  if (!email) {
    return null;
  }

  return findAuthAccountByEmail(email);
}

export const useAuthStore = defineStore('auth', {
  state: () => {
    const isLoggedIn = getInitialLoginState();
    const currentAccount = isLoggedIn ? getCurrentUserAccount() : null;

    return {
      isLoggedIn: Boolean(isLoggedIn && currentAccount),
      user: currentAccount ? createUserFromAccount(currentAccount) : (null as User | null),
    };
  },

  actions: {
    setAuthenticatedUser(account: StoredAuthAccount): void {
      removeLocalStorage(USER_PROFILE_STORAGE_KEY);
      removeLocalStorage(PROFILE_AVATAR_STORAGE_KEY);
      removeLocalStorage(FULL_PROFILE_AVATAR_STORAGE_KEY);
      writeLocalStorage(LOGIN_STATE_STORAGE_KEY, 'true');
      writeLocalStorage(CURRENT_USER_EMAIL_STORAGE_KEY, account.email);

      this.isLoggedIn = true;
      this.user = createUserFromAccount(account);
      persistUserProfile(getProfileFields(this.user));
    },

    async login(username: string, password: string): Promise<boolean> {
      try {
        const response = await api.post('/api/auth/login', {
          username,
          password,
        });

        const apiUser = response.data.user;

        // Map API User to Frontend User model
        const account: StoredAuthAccount = {
          id: String(apiUser.id),
          studentId: 'EXT' + String(apiUser.id).padStart(7, '0'),
          firstNameTh: apiUser.username,
          lastNameTh: '',
          firstNameEn: apiUser.username.toUpperCase(),
          lastNameEn: apiUser.role.toUpperCase(),
          email: apiUser.email,
          phone: '',
          faculty: 'Lifelong Learning',
          facName: apiUser.facName ?? null,
          department: apiUser.role,
          role: ((): User['role'] => {
            const r = apiUser.role.toLowerCase();
            console.log('[AuthStore] Raw role from API:', apiUser.role, 'Normalized to:', r);
            if (r === 'admin') return 'admin';
            if (r === 'instructor' || r === 'teach') return 'teach';
            if (r === 'finance') return 'finance';
            if (r === 'central_finance' || r === 'central-finance' || r === 'central finance')
              return 'central_finance';
            if (r === 'lifelong2') return 'lifelong2';
            console.warn('[AuthStore] Role not recognized, defaulting to student');
            return 'student';
          })(),
          username: apiUser.username,
          avatar: createDefaultAvatar(apiUser.email),
          password: password,
          createdAt: new Date().toISOString(),
          source: 'registered',
        };

        // persist so session survives refresh
        const others = readStoredAuthAccounts().filter((a) => a.email !== account.email);
        writeStoredAuthAccounts([...others, account]);
        this.setAuthenticatedUser(account);
        return true;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    },

    async registerLearner(payload: RegisterLearnerPayload): Promise<AuthActionResult> {
      const email = normalizeEmail(payload.email);
      const password = payload.password.trim();

      if (!email || !password) {
        return { success: false, reason: 'invalid-input' };
      }

      try {
        const response = await api.post('/api/auth/register', {
          firstNameTh: payload.firstNameTh.trim(),
          lastNameTh: payload.lastNameTh.trim(),
          firstNameEn: payload.firstNameEn.trim(),
          lastNameEn: payload.lastNameEn.trim(),
          phone: payload.phone.trim(),
          email,
          password,
        });

        const apiUser = response.data.user;
        const createdAt = new Date().toISOString();
        const nextAccount: StoredAuthAccount = {
          id: String(apiUser.id),
          studentId: `EXT${String(apiUser.id).padStart(7, '0')}`,
          firstNameTh: payload.firstNameTh.trim(),
          lastNameTh: payload.lastNameTh.trim(),
          firstNameEn: payload.firstNameEn.trim().toUpperCase(),
          lastNameEn: payload.lastNameEn.trim().toUpperCase(),
          email,
          phone: payload.phone.trim(),
          faculty: 'บุคคลทั่วไป',
          department: 'Lifelong Learning',
          role: 'external',
          username: apiUser.username,
          avatar: createDefaultAvatar(email),
          password,
          createdAt,
          source: 'registered',
        };

        writeStoredAuthAccounts([...readStoredAuthAccounts(), nextAccount]);
        return { success: true };
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number } })?.response?.status;
        if (status === 409) {
          return { success: false, reason: 'duplicate-email' };
        }
        console.error('Registration error:', error);
        return { success: false, reason: 'invalid-input' };
      }
    },

    logout(): void {
      writeLocalStorage(LOGIN_STATE_STORAGE_KEY, 'false');
      this.isLoggedIn = false;
      this.user = null;
    },

    setAvatar(avatar: string): void {
      if (!writeLocalStorage(PROFILE_AVATAR_STORAGE_KEY, avatar)) {
        removeLocalStorage(FULL_PROFILE_AVATAR_STORAGE_KEY);
        writeLocalStorage(PROFILE_AVATAR_STORAGE_KEY, avatar);
      }

      if (this.user) {
        this.user = {
          ...this.user,
          avatar,
        };
      }
    },

    updateProfile(profile: UserProfileUpdate): void {
      if (!this.user) {
        return;
      }

      this.user = {
        ...this.user,
        ...profile,
      };
      persistUserProfile(getProfileFields(this.user));
    },
  },
});
