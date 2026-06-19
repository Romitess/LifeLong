import type { CellHookData } from 'jspdf-autotable';
import type * as XLSX from 'xlsx';

export interface PdfExportConfig {
  filename: string;
  titles?: string[];
  titleStartY?: number;
  titleLineHeight?: number;
  head: string[][];
  body: (string | number | null)[][];
  columnStyles?: Record<number, unknown>;
  didParseCell?: (data: CellHookData) => void;
  orientation?: 'portrait' | 'landscape';
  styles?: Record<string, unknown>;
  headStyles?: Record<string, unknown>;
  startY?: number;
}

export interface ExcelExportConfig {
  filename: string;
  sheetName?: string;
  header?: string[];
  data?: (string | number | null)[][];
  rawWsData?: unknown[][];
  merges?: XLSX.Range[];
  cols?: XLSX.ColInfo[];
}

export interface CsvExportConfig {
  filename: string;
  headers: string[];
  data: (string | number | null)[][];
}
