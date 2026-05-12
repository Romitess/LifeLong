import { defineStore } from 'pinia';

export interface FundSourceRequest {
  id: string;
  requestId: string;
  date: string;
  faculty: string;
  project: string;
  status: 'new' | 'processing' | 'completed' | 'rejected';
}

export interface FundSource {
  id: string;
  fundCode: string;
  fundType: string;
  fiscalYear: string;
  nameTh: string;
  nameEn?: string;
  description?: string;
  createdAt: string;
}

export interface NotificationLog {
  id: string;
  fundCode: string;
  sentTo: string;
  note: string;
  approvedBy: string;
  sentAt: string;
}

export const useCentralFinanceStore = defineStore('central-finance', {
  state: () => ({
    // Mock requests from faculties
    requests: [
      {
        id: '1',
        requestId: 'REQ-2569-001',
        date: '2026-05-01',
        faculty: 'คณะวิทยาการสารสนเทศ',
        project: 'โครงการพัฒนาทักษะ AI สำหรับบุคคลทั่วไป',
        status: 'completed',
      },
      {
        id: '2',
        requestId: 'REQ-2569-002',
        date: '2026-05-02',
        faculty: 'คณะวิทยาศาสตร์',
        project: 'ขอเพิ่มแหล่งเงินทุนวิจัยนวัตกรรมสีเขียว',
        status: 'processing',
      },
      {
        id: '3',
        requestId: 'REQ-2569-003',
        date: '2026-05-05',
        faculty: 'คณะพยาบาลศาสตร์',
        project: 'โครงการฝึกอบรมการดูแลผู้สูงอายุระยะยาว',
        status: 'new',
      },
      {
        id: '4',
        requestId: 'REQ-2569-004',
        date: '2026-05-06',
        faculty: 'คณะบริหารธุรกิจ',
        project: 'จัดซื้อครุภัณฑ์คอมพิวเตอร์เพื่อการเรียนการสอน',
        status: 'rejected',
      },
      {
        id: '5',
        requestId: 'REQ-2569-005',
        date: '2026-05-07',
        faculty: 'สำนักคอมพิวเตอร์',
        project: 'พัฒนาระบบเครือข่ายความเร็วสูงภายในมหาวิทยาลัย',
        status: 'new',
      },
      {
        id: '6',
        requestId: 'REQ-2569-006',
        date: '2026-05-08',
        faculty: 'คณะวิศวกรรมศาสตร์',
        project: 'โครงการอบรมเทคโนโลยีหุ่นยนต์อุตสาหกรรม',
        status: 'new',
      },
    ] as FundSourceRequest[],

    // Issued fund source codes
    fundSources: [
      {
        id: '1',
        fundCode: 'BG-2568-001',
        fundType: 'BG',
        fiscalYear: '2568',
        nameTh: 'เงินงบประมาณเพื่อการบริหารจัดการทั่วไป',
        createdAt: '2026-01-10',
      },
    ] as FundSource[],

    // History logs of sent notifications
    notificationLogs: [] as NotificationLog[],
  }),

  actions: {
    addFundSource(fundSource: Omit<FundSource, 'id' | 'createdAt'>) {
      const newSource: FundSource = {
        ...fundSource,
        id: Date.now().toString(),
        createdAt: new Date().toISOString().split('T')[0]!,
      };
      this.fundSources.push(newSource);
      return newSource;
    },

    updateRequestStatus(requestId: string, status: FundSourceRequest['status']) {
      const request = this.requests.find((r) => r.id === requestId);
      if (request) {
        request.status = status;
      }
    },

    addNotificationLog(log: Omit<NotificationLog, 'id' | 'sentAt'>) {
      const newLog: NotificationLog = {
        ...log,
        id: Date.now().toString(),
        sentAt: new Date().toISOString(),
      };
      this.notificationLogs.push(newLog);
      return newLog;
    },
  },
});
