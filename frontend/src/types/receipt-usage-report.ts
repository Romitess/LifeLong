export interface ReceiptUsageItem {
  id: number;
  no: number;
  departmentCode: number;
  faculty: string;
  facultyEn: string | null;
  receiptNo: string;
  receiptFilename: string | null;
  receiptType: string | null;
  customerName: string;
  customerNameEn: string | null;
  amount: number | string;
  effectiveDate: string;
  fiscalYear: string;
  courseName: string;
  courseNameEn: string | null;
  collector: string;
  collectorNameEn: string | null;
  status: string;
  cancelBy?: string;
  cancelDate?: string;
}

export interface ReceiptUsageFilters {
  fiscalYear: string;
  receiptDateStart: string;
  receiptDateEnd: string;
  faculty: string;
  courseName: string;
  customerName: string;
  collector: string;
  receiptNo: string;
  status: string;
}

export interface ReceiptUsageResponse {
  success: boolean;
  total: number;
  data: ReceiptUsageItem[];
}
