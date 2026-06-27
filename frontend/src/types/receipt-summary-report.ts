export interface ReceiptSummaryItem {
  id: number;
  no: number;
  faculty: string;
  facultyEn: string | null;
  receiptNo: string;
  customerName: string;
  customerNameEn: string | null;
  amount: number | string;
  effectiveDate: string;
  learnerName: string;
  courseName: string;
  courseNameEn: string | null;
  collector: string;
  collectorNameEn: string | null;
  status: string;
  cancelBy?: string;
  cancelDate?: string;
}

export interface ReceiptSummaryFilters {
  faculty: string;
  receiptDateStart: string;
  receiptDateEnd: string;
  effectiveDateStart: string;
  effectiveDateEnd: string;
}

export interface ReceiptSummaryResponse {
  success: boolean;
  total: number;
  data: ReceiptSummaryItem[];
}
