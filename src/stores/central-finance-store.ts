import { defineStore } from 'pinia';

export interface FundSourceRequest {
  id: string;
  requestId: string;
  date: string;
  faculty: string;
  project: string;
  description?: string;
  amount?: number;
  contactName?: string;
  contactPhone?: string;
  documents?: { name: string; url: string; type: string }[];
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
        description:
          'โครงการอบรมเชิงปฏิบัติการเพื่อพัฒนาทักษะทางด้านปัญญาประดิษฐ์ให้กับบุคคลทั่วไปและศิษย์เก่า เพื่อส่งเสริมการเรียนรู้ตลอดชีวิตและการปรับตัวในยุคดิจิทัล โดยเน้นการใช้ Generative AI ในการทำงาน',
        amount: 150000,
        contactName: 'ดร.สมชาย ใจดี',
        contactPhone: '081-234-5678',
        documents: [
          { name: 'โครงการพัฒนาทักษะ_AI.pdf', url: '#', type: 'pdf' },
          { name: 'ประมาณการงบประมาณ.xlsx', url: '#', type: 'excel' },
        ],
        status: 'completed',
      },
      {
        id: '2',
        requestId: 'REQ-2569-002',
        date: '2026-05-02',
        faculty: 'คณะวิทยาศาสตร์',
        project: 'ขอเพิ่มแหล่งเงินทุนวิจัยนวัตกรรมสีเขียว',
        description:
          'การวิจัยและพัฒนาวัสดุทางเลือกที่เป็นมิตรต่อสิ่งแวดล้อมเพื่อใช้ในอุตสาหกรรมก่อสร้าง โดยมุ่งเน้นการลดการปล่อยก๊าซคาร์บอนไดออกไซด์ในกระบวนการผลิต',
        amount: 450000,
        contactName: 'ผศ.ดร.กมลลักษณ์ รัตนเดช',
        contactPhone: '089-876-5432',
        documents: [{ name: 'proposal_green_innovation.pdf', url: '#', type: 'pdf' }],
        status: 'processing',
      },
      {
        id: '3',
        requestId: 'REQ-2569-003',
        date: '2026-05-05',
        faculty: 'คณะพยาบาลศาสตร์',
        project: 'โครงการฝึกอบรมการดูแลผู้สูงอายุระยะยาว',
        description:
          'หลักสูตรประกาศนียบัตรระยะสั้นเพื่อผลิตผู้ดูแลผู้สูงอายุที่มีคุณภาพ รองรับสังคมสูงวัยของประเทศไทย โดยเน้นการฝึกปฏิบัติจริงในสถานพยาบาล',
        amount: 280000,
        contactName: 'อ.วิภาวรรณ สุขุม',
        contactPhone: '082-345-6789',
        status: 'new',
      },
      {
        id: '4',
        requestId: 'REQ-2569-004',
        date: '2026-05-06',
        faculty: 'คณะบริหารธุรกิจ',
        project: 'จัดซื้อครุภัณฑ์คอมพิวเตอร์เพื่อการเรียนการสอน',
        description:
          'เนื่องด้วยครุภัณฑ์คอมพิวเตอร์เดิมมีอายุการใช้งานมากกว่า 5 ปี ไม่รองรับซอฟต์แวร์วิเคราะห์ข้อมูลขั้นสูง จึงมีความจำเป็นต้องจัดซื้อคอมพิวเตอร์ประสิทธิภาพสูงจำนวน 40 เครื่อง',
        amount: 1200000,
        contactName: 'นายธีรเทพ มงคล',
        contactPhone: '085-432-1098',
        status: 'rejected',
      },
      {
        id: '5',
        requestId: 'REQ-2569-005',
        date: '2026-05-07',
        faculty: 'สำนักคอมพิวเตอร์',
        project: 'พัฒนาระบบเครือข่ายความเร็วสูงภายในมหาวิทยาลัย',
        description:
          'โครงการขยายความจุโครงข่ายหลัก (Core Network) ของมหาวิทยาลัยให้รองรับปริมาณการใช้งานที่เพิ่มขึ้นอย่างรวดเร็วจากการเรียนการสอนออนไลน์และการใช้งานคลาวด์',
        amount: 3500000,
        contactName: 'คุณศิริชัย ตั้งมั่น',
        contactPhone: '086-789-0123',
        status: 'new',
      },
      {
        id: '6',
        requestId: 'REQ-2569-006',
        date: '2026-05-08',
        faculty: 'คณะวิศวกรรมศาสตร์',
        project: 'โครงการอบรมเทคโนโลยีหุ่นยนต์อุตสาหกรรม',
        description:
          'การจัดอบรมให้ความรู้ด้านการเขียนโปรแกรมหุ่นยนต์อุตสาหกรรม (ABB/Kuka) สำหรับนักศึกษาและบุคคลากรในภาคตะวันออก เพื่อเพิ่มศักยภาพการผลิตในเขต EEC',
        amount: 600000,
        contactName: 'รศ.ดร.มนูญ เผ่าพงศ์',
        contactPhone: '084-567-8901',
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
