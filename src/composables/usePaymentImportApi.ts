import { api } from 'boot/axios';

export type ImportAndGeneratePayload = {
  records: {
    learnerRef: string;
    applicationRef: string;
    payerName: string;
    paymentDate: string; // DD-MM-YYYY
    paymentTime: string;
    amount: number;
  }[];
  receiptType: 'R' | 'D';
  createdBy: 'S' | 'P';
  creatorUserId: number;
  creatorIp: string;
  creatorDevice: string;
};

export interface ImportAndGenerateResponse {
  summary: {
    totalImported: number;
    totalReceiptGenerated: number;
    totalSkipped: number;
    totalFailed: number;
    errors?: string[];
  };
  receipts: ReceiptSummary[];
}

export type ReceiptSummary = {
  enrollReceiptId: number;
  receiptId: number;
  receiptFilename: string;
  receiptType: 'R' | 'D';
};

export function usePaymentImportApi() {
  const importAndGenerate = async (payload: ImportAndGeneratePayload) => {
    const response = await api.post<ImportAndGenerateResponse>(
      '/api/lltenrollreceipt/import-and-generate',
      payload,
    );
    return response.data;
  };

  const getReceiptFile = async (enrollReceiptId: number) => {
    const response = await api.get(`/api/lltenrollreceipt/${enrollReceiptId}/receipt-file`);
    return response.data;
  };

  return { importAndGenerate, getReceiptFile };
}
