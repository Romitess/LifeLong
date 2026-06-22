import { acceptHMRUpdate, defineStore } from 'pinia';
import type { CourseDetail } from 'src/types/course-detail';
import { useAuthStore } from './auth-store';

export interface CoursePaymentRecord {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  amount: number;
  paymentDate: string;
  status: string;
  method: string;
  receiptId: string;
  userId: string;
  taxId?: string;
  customerName?: string;
  customerAddress?: string;
  collectorName?: string;
}

interface CoursePaymentState {
  payments: CoursePaymentRecord[];
}

const STORAGE_KEY = 'lll-course-payments';
const MOCK_USER_ID = 'mock-student-user';

function readStoredPayments(): CoursePaymentRecord[] {
  if (typeof window === 'undefined') {
    return [];
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue) as CoursePaymentRecord[];
    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch {
    return [];
  }
}

function writeStoredPayments(payments: CoursePaymentRecord[]): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payments));
}

function buildPaymentId(isoDate: string): string {
  const compactDate = isoDate
    .replaceAll('-', '')
    .replaceAll(':', '')
    .replaceAll('.', '')
    .slice(2, 12);
  const suffix = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `PAY-${compactDate}-${suffix}`;
}

export const useCoursePaymentStore = defineStore('course-payment', {
  state: (): CoursePaymentState => ({
    payments: readStoredPayments(),
  }),

  getters: {
    myPayments: (state): CoursePaymentRecord[] => {
      const authStore = useAuthStore();
      const currentUserId = authStore.user?.id || MOCK_USER_ID;
      return state.payments
        .filter((payment) => payment.userId === currentUserId)
        .slice()
        .sort(
          (left, right) =>
            new Date(right.paymentDate).getTime() - new Date(left.paymentDate).getTime(),
        );
    },
  },

  actions: {
    recordPaidCourse(
      course: CourseDetail,
      payload: {
        receiptId: string;
        paymentDate?: string;
        method?: string;
        taxId?: string;
        customerName?: string;
        customerAddress?: string;
      },
    ): void {
      const paymentDate = payload.paymentDate ?? new Date().toISOString();
      const authStore = useAuthStore();
      const currentUserId = authStore.user?.id || MOCK_USER_ID;

      const nextPayment: CoursePaymentRecord = {
        id: buildPaymentId(paymentDate),
        courseId: course.id,
        courseCode: course.code,
        courseTitle: course.title,
        amount: course.isFree ? 0 : course.price,
        paymentDate,
        status: 'ชำระเงินสำเร็จ',
        method: payload.method ?? 'Thai QR Payment',
        receiptId: payload.receiptId,
        userId: currentUserId,
        ...(payload.taxId ? { taxId: payload.taxId } : {}),
        ...(payload.customerName ? { customerName: payload.customerName } : {}),
        ...(payload.customerAddress ? { customerAddress: payload.customerAddress } : {}),
      };

      const nextPayments = [
        nextPayment,
        ...this.payments.filter(
          (payment) => !(payment.courseId === course.id && payment.userId === currentUserId),
        ),
      ];

      this.payments = nextPayments;
      writeStoredPayments(nextPayments);
    },
  },
});

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useCoursePaymentStore, import.meta.hot));
}
