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
  department: string;
  role:
    | 'student'
    | 'staff'
    | 'external'
    | 'instructor'
    | 'teach'
    | 'admin'
    | 'finance'
    | 'central_finance';
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

const PROFILE_AVATAR_STORAGE_KEY = 'lll-profile-avatar';
const FULL_PROFILE_AVATAR_STORAGE_KEY = 'lll-profile-avatar-full';
const USER_PROFILE_STORAGE_KEY = 'lll-user-profile';
const AUTH_ACCOUNTS_STORAGE_KEY = 'lll-auth-accounts';
const CURRENT_USER_EMAIL_STORAGE_KEY = 'userEmail';
const LOGIN_STATE_STORAGE_KEY = 'isLoggedIn';
const DEFAULT_PROFILE_AVATAR = 'https://api.dicebear.com/7.x/avataaars/svg?seed=Natthaphong';

export type UserProfileUpdate = Pick<
  User,
  'firstNameTh' | 'lastNameTh' | 'firstNameEn' | 'lastNameEn' | 'phone'
>;

type StoredUserProfile = UserProfileUpdate;

const MOCK_USER_BASE: Omit<User, 'avatar'> = {
  id: 'mock-student-user',
  studentId: 'C6901355',
  firstNameTh: 'ณัฐพงศ์',
  lastNameTh: 'ไม่อยู่',
  firstNameEn: 'NATTHAPHONG',
  lastNameEn: 'MAIYOO',
  email: 'student@go.buu.ac.th',
  phone: '0812345678',
  faculty: 'คณะวิทยาการสารสนเทศ',
  department: 'สาขาวิทยาการคอมพิวเตอร์',
  role: 'student',
};

const MOCK_INSTRUCTOR_BASE: Omit<User, 'avatar'> = {
  id: 'mock-instructor-user',
  studentId: 'T1234567',
  firstNameTh: 'อ.นิติธร',
  lastNameTh: 'ใจดี',
  firstNameEn: 'NITITHORN',
  lastNameEn: 'JAIDEE',
  email: 'teach@go.buu.ac.th',
  phone: '0898765432',
  faculty: 'คณะวิทยาการสารสนเทศ',
  department: 'สาขาวิทยาการคอมพิวเตอร์',
  role: 'teach',
};

const MOCK_INSTRUCTOR_1_BASE: Omit<User, 'avatar'> = {
  id: 'mock-instructor-teach1-user',
  studentId: 'T7654321',
  firstNameTh: 'อ.พิชชา',
  lastNameTh: 'แสงวิจัย',
  firstNameEn: 'PITCHA',
  lastNameEn: 'SAENGWIJAI',
  email: 'teach1@go.buu.ac.th',
  phone: '0887654321',
  faculty: 'คณะวิทยาศาสตร์',
  department: 'ภาควิชาคณิตศาสตร์และสถิติ',
  role: 'teach',
};

const MOCK_ADMIN_BASE: Omit<User, 'avatar'> = {
  id: 'mock-admin-user',
  studentId: 'ADM0001',
  firstNameTh: 'ผู้ดูแล',
  lastNameTh: 'ระบบ',
  firstNameEn: 'SYSTEM',
  lastNameEn: 'ADMIN',
  email: 'admin@go.buu.ac.th',
  phone: '038102222',
  faculty: 'สำนักบริหารระบบ',
  department: 'BUU Lifelong Learning Platform',
  role: 'admin',
};

const MOCK_FINANCE_BASE: Omit<User, 'avatar'> = {
  id: 'mock-finance-user',
  studentId: 'FIN0001',
  firstNameTh: 'สมศรี',
  lastNameTh: 'การเงิน',
  firstNameEn: 'SOMSRI',
  lastNameEn: 'FINANCE',
  email: 'finance@go.buu.ac.th',
  phone: '038101111',
  faculty: 'คอมพิวเตอร์และเทคโนโลยี',
  department: 'งานคลังและพัสดุ',
  role: 'finance',
};

const MOCK_CENTRAL_FINANCE_BASE: Omit<User, 'avatar'> = {
  id: 'mock-central-finance-user',
  studentId: 'CFIN001',
  firstNameTh: 'เจ้าหน้าที่',
  lastNameTh: 'การเงินกองคลัง',
  firstNameEn: 'CENTRAL',
  lastNameEn: 'FINANCE',
  email: 'central-finance@go.buu.ac.th',
  phone: '038103333',
  faculty: 'กองคลัง',
  department: 'งานบริหารการเงิน',
  role: 'central_finance',
};

const DEFAULT_AUTH_ACCOUNTS: StoredAuthAccount[] = [
  {
    ...MOCK_USER_BASE,
    email: MOCK_USER_BASE.email.toLowerCase(),
    avatar: DEFAULT_PROFILE_AVATAR,
    password: '111111',
    createdAt: '2026-01-01T00:00:00.000Z',
    source: 'mock',
  },
  {
    ...MOCK_INSTRUCTOR_BASE,
    email: MOCK_INSTRUCTOR_BASE.email.toLowerCase(),
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nitithorn',
    password: '111111',
    createdAt: '2026-01-01T00:00:00.000Z',
    source: 'mock',
  },
  {
    ...MOCK_INSTRUCTOR_1_BASE,
    email: MOCK_INSTRUCTOR_1_BASE.email.toLowerCase(),
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Pitcha',
    password: '111111',
    createdAt: '2026-01-01T00:00:00.000Z',
    source: 'mock',
  },
  {
    ...MOCK_ADMIN_BASE,
    email: MOCK_ADMIN_BASE.email.toLowerCase(),
    avatar: 'https://api.dicebear.com/7.x/bottts-neutral/svg?seed=BUU-LLL-Admin',
    password: '111111',
    createdAt: '2026-01-01T00:00:00.000Z',
    source: 'mock',
  },
  {
    ...MOCK_FINANCE_BASE,
    email: MOCK_FINANCE_BASE.email.toLowerCase(),
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=SomsriFinance',
    password: '111111',
    createdAt: '2026-01-01T00:00:00.000Z',
    source: 'mock',
  },
  {
    ...MOCK_CENTRAL_FINANCE_BASE,
    email: MOCK_CENTRAL_FINANCE_BASE.email.toLowerCase(),
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=CentralFinance',
    password: '111111',
    createdAt: '2026-01-01T00:00:00.000Z',
    source: 'mock',
  },
];

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
    value === 'central_finance'
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
  return [...DEFAULT_AUTH_ACCOUNTS, ...readStoredAuthAccounts()];
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
    department: account.department,
    role: account.role,
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
          department: apiUser.role,
          role: apiUser.role.toLowerCase() === 'instructor' ? 'instructor' : 'student',
          username: apiUser.username,
          avatar: createDefaultAvatar(apiUser.email),
          password: password,
          createdAt: new Date().toISOString(),
          source: 'mock',
        };

        this.setAuthenticatedUser(account);
        return true;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      }
    },

    registerLearner(payload: RegisterLearnerPayload): AuthActionResult {
      const email = normalizeEmail(payload.email);
      const password = payload.password.trim();

      if (!email || !password) {
        return { success: false, reason: 'invalid-input' };
      }

      if (findAuthAccountByEmail(email)) {
        return { success: false, reason: 'duplicate-email' };
      }

      const createdAt = new Date().toISOString();
      const nextAccount: StoredAuthAccount = {
        id: `registered-${Date.now()}`,
        studentId: `EXT${Date.now().toString().slice(-7)}`,
        firstNameTh: payload.firstNameTh.trim(),
        lastNameTh: payload.lastNameTh.trim(),
        firstNameEn: payload.firstNameEn.trim().toUpperCase(),
        lastNameEn: payload.lastNameEn.trim().toUpperCase(),
        email,
        phone: payload.phone.trim(),
        faculty: 'บุคคลทั่วไป',
        department: 'Lifelong Learning',
        role: 'external',
        avatar: createDefaultAvatar(email),
        password,
        createdAt,
        source: 'registered',
      };

      writeStoredAuthAccounts([...readStoredAuthAccounts(), nextAccount]);
      return { success: true };
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
