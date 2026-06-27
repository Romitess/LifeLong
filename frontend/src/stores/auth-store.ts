import { defineStore } from 'pinia';
import axios from 'axios';
import { api } from 'src/boot/axios';
import { getDefaultAvatarUrl, getImageUrl, validateImageFile } from 'src/services/image.service';

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
  facId?: number | null;
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
  avatarSeed?: string;
}

export interface RegisterLearnerPayload {
  firstNameTh: string;
  lastNameTh: string;
  firstNameEn: string;
  lastNameEn: string;
  phone: string;
  email: string;
  password: string;
  citizenId?: string;
}

export interface AuthActionResult {
  success: boolean;
  reason?: 'duplicate-email' | 'duplicate-citizen-id' | 'invalid-input';
}

interface StoredAuthAccount extends User {
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
const TOKEN_SESSION_KEY = 'lll-token';

function readSessionToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    let token = window.localStorage.getItem(TOKEN_SESSION_KEY);
    if (!token) {
      token = window.sessionStorage.getItem(TOKEN_SESSION_KEY);
      if (token) {
        window.localStorage.setItem(TOKEN_SESSION_KEY, token);
        window.sessionStorage.removeItem(TOKEN_SESSION_KEY);
      }
    }
    return token;
  } catch {
    return null;
  }
}

function writeSessionToken(token: string): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(TOKEN_SESSION_KEY, token);
  } catch {
    // ignore
  }
}

function removeSessionToken(): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(TOKEN_SESSION_KEY);
  } catch {
    // ignore
  }
}
export type UserProfileUpdate = Pick<
  User,
  'firstNameTh' | 'lastNameTh' | 'firstNameEn' | 'lastNameEn' | 'phone'
>;

interface ProfileResponse {
  id: number;
  studentCode: string | null;
  userCode: string | null;
  firstNameTh: string | null;
  lastNameTh: string | null;
  firstNameEn: string | null;
  lastNameEn: string | null;
  phone: string | null;
  imageUrl: string | null;
  avatarSeed: string;
}

// removed: AUTH_DEMO_ACCOUNTS — no longer used; kept export to avoid breaking imports temporarily
export const AUTH_DEMO_ACCOUNTS: AuthDemoAccount[] = [];

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

function createDefaultAvatar(seed: string): string {
  return getDefaultAvatarUrl(seed);
}

function resolveAvatar(imageUrl: unknown, fallbackSeed: string): string {
  return typeof imageUrl === 'string' && imageUrl.trim()
    ? getImageUrl(imageUrl.trim())
    : createDefaultAvatar(fallbackSeed);
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

    return parsedValue.filter(isStoredAuthAccount).map(({ ...account }) => {
      // Strip legacy password field if present from old localStorage data
      const cleaned = account as Record<string, unknown>;
      delete cleaned['password'];
      return { ...cleaned, email: normalizeEmail(account.email) } as StoredAuthAccount;
    });
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

function createUserFromAccount(account: StoredAuthAccount): User {
  return {
    id: account.id,
    studentId: account.studentId,
    firstNameTh: account.firstNameTh,
    lastNameTh: account.lastNameTh,
    firstNameEn: account.firstNameEn,
    lastNameEn: account.lastNameEn,
    email: account.email,
    phone: account.phone,
    faculty: account.faculty,
    facName: account.facName ?? null,
    facId: account.facId ?? null,
    department: account.department,
    role: account.role,
    ...(account.username !== undefined ? { username: account.username } : {}),
    ...(account.avatarSeed !== undefined ? { avatarSeed: account.avatarSeed } : {}),
    avatar: account.avatar || createDefaultAvatar(account.avatarSeed || account.email),
  };
}

function updateStoredAccount(email: string, updates: Partial<StoredAuthAccount>): void {
  const normalizedEmail = normalizeEmail(email);
  const accounts = readStoredAuthAccounts();
  const index = accounts.findIndex((account) => account.email === normalizedEmail);
  if (index === -1) return;
  const existing = accounts[index];
  if (!existing) return;
  accounts[index] = { ...existing, ...updates };
  writeStoredAuthAccounts(accounts);
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
      token: readSessionToken(),
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
    },

    async login(
      username: string,
      password: string,
    ): Promise<{
      success: boolean;
      errorType?: 'rate-limit' | 'account-locked' | 'invalid-credentials' | 'other';
    }> {
      try {
        const response = await api.post('/api/auth/login', {
          username,
          password,
        });

        const apiUser = response.data.user;
        const avatarSeed = apiUser.avatarSeed || `lll-user-${apiUser.id}`;

        // Map API User to Frontend User model
        const account: StoredAuthAccount = {
          id: String(apiUser.id),
          studentId:
            apiUser.studentCode || apiUser.userCode || 'EXT' + String(apiUser.id).padStart(7, '0'),
          firstNameTh: apiUser.firstNameTh || apiUser.username,
          lastNameTh: apiUser.lastNameTh || '',
          firstNameEn: apiUser.firstNameEn || apiUser.username.toUpperCase(),
          lastNameEn: apiUser.lastNameEn || apiUser.role.toUpperCase(),
          email: apiUser.email,
          phone: apiUser.phone || '',
          faculty: 'Lifelong Learning',
          facName: apiUser.facName ?? null,
          facId: apiUser.facId ?? null,
          department: apiUser.role,
          role: ((): User['role'] => {
            const r = apiUser.role.toLowerCase();
            if (r === 'admin') return 'admin';
            if (r === 'instructor' || r === 'teach') return 'teach';
            if (r === 'finance') return 'finance';
            if (r === 'central_finance' || r === 'central-finance' || r === 'central finance')
              return 'central_finance';
            if (r === 'lifelong2') return 'lifelong2';
            return 'student';
          })(),
          username: apiUser.username,
          avatarSeed,
          avatar: resolveAvatar(apiUser.imageUrl ?? apiUser.avatar, avatarSeed),
          createdAt: new Date().toISOString(),
          source: 'registered',
        };

        const receivedToken = (response.data.token as string) ?? null;
        this.token = receivedToken;
        if (receivedToken) writeSessionToken(receivedToken);

        // persist so session survives refresh (no password stored)
        const others = readStoredAuthAccounts().filter((a) => a.email !== account.email);
        writeStoredAuthAccounts([...others, account]);
        this.setAuthenticatedUser(account);
        return { success: true };
      } catch (error) {
        console.error('Login error:', error);
        if (axios.isAxiosError(error)) {
          if (error.response?.status === 429) {
            return { success: false, errorType: 'rate-limit' };
          }
          if (error.response?.status === 401) {
            if (error.response.data?.message === 'ACCOUNT_LOCKED') {
              return { success: false, errorType: 'account-locked' };
            }
            return { success: false, errorType: 'invalid-credentials' };
          }
        }
        return { success: false, errorType: 'other' };
      }
    },

    async registerLearner(payload: RegisterLearnerPayload): Promise<AuthActionResult> {
      const email = normalizeEmail(payload.email);
      const password = payload.password.trim();

      if (!email || !password) {
        return { success: false, reason: 'invalid-input' };
      }

      try {
        const body: Record<string, string> = {
          firstNameTh: payload.firstNameTh.trim(),
          lastNameTh: payload.lastNameTh.trim(),
          firstNameEn: payload.firstNameEn.trim(),
          lastNameEn: payload.lastNameEn.trim(),
          phone: payload.phone.trim(),
          email,
          password,
        };
        if (payload.citizenId?.trim()) body.citizenId = payload.citizenId.trim();
        const response = await api.post('/api/auth/register', body);

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
          avatarSeed: `lll-user-${apiUser.id}`,
          avatar: createDefaultAvatar(`lll-user-${apiUser.id}`),
          createdAt,
          source: 'registered',
        };

        writeStoredAuthAccounts([...readStoredAuthAccounts(), nextAccount]);
        return { success: true };
      } catch (error: unknown) {
        const status = (error as { response?: { status?: number; data?: { message?: string } } })
          ?.response?.status;
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? '';
        if (status === 409) {
          if (message.toLowerCase().includes('citizen')) {
            return { success: false, reason: 'duplicate-citizen-id' };
          }
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
      this.token = null;
      removeSessionToken();
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
        updateStoredAccount(this.user.email, { avatar });
      }
    },

    async uploadAvatar(file: File): Promise<void> {
      if (!this.user) {
        return;
      }
      validateImageFile(file);

      const formData = new FormData();
      formData.append('file', file);
      const { data } = await api.patch<{ imageUrl: string | null }>(
        '/api/profile/image',
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        },
      );
      this.setAvatar(resolveAvatar(data.imageUrl, this.user.avatarSeed || this.user.email));
    },

    async deleteAvatar(): Promise<void> {
      if (!this.user) {
        return;
      }
      await api.delete('/api/profile/image');
      this.setAvatar(createDefaultAvatar(this.user.avatarSeed || this.user.email));
    },

    async fetchProfile(): Promise<void> {
      if (!this.user) {
        return;
      }

      const { data } = await api.get<ProfileResponse>('/api/profile');
      this.applyProfileResponse(data);
    },

    async updateProfile(profile: UserProfileUpdate): Promise<void> {
      if (!this.user) {
        return;
      }

      const { data } = await api.patch<ProfileResponse>('/api/profile', profile);
      this.applyProfileResponse(data);
    },

    applyProfileResponse(profile: ProfileResponse): void {
      if (!this.user) {
        return;
      }

      const avatarSeed = profile.avatarSeed || this.user.avatarSeed || this.user.email;
      const avatar = resolveAvatar(profile.imageUrl, avatarSeed);
      this.user = {
        ...this.user,
        avatarSeed,
        studentId: profile.studentCode || profile.userCode || this.user.studentId,
        firstNameTh: profile.firstNameTh ?? '',
        lastNameTh: profile.lastNameTh ?? '',
        firstNameEn: profile.firstNameEn ?? '',
        lastNameEn: profile.lastNameEn ?? '',
        phone: profile.phone ?? '',
        avatar,
      };
      removeLocalStorage(USER_PROFILE_STORAGE_KEY);
      updateStoredAccount(this.user.email, {
        studentId: this.user.studentId,
        firstNameTh: this.user.firstNameTh,
        lastNameTh: this.user.lastNameTh,
        firstNameEn: this.user.firstNameEn,
        lastNameEn: this.user.lastNameEn,
        phone: this.user.phone,
        avatarSeed,
        avatar,
      });
    },
  },
});
