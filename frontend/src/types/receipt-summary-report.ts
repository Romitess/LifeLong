export interface ReceiptSummaryItem {
  id: number;
  no: number;
  faculty: string;
  receiptNo: string;
  customerName: string;
  amount: number | string;
  effectiveDate: string;
  learnerName: string;
  courseName: string;
  collector: string;
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
