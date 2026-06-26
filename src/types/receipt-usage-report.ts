export interface ReceiptUsageItem {
  id: number;
  no: number;
  departmentCode: number;
  faculty: string;
  receiptNo: string;
  receiptFilename: string | null;
  receiptType: string | null;
  customerName: string;
  amount: number | string;
  effectiveDate: string;
  fiscalYear: string;
  courseName: string;
  collector: string;
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
