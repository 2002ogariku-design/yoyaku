// xlsx is loaded via CDN script tag in index.html
// This shim exposes the global XLSX object with basic types

declare global {
  interface Window {
    XLSX: XLSXStatic;
  }
}

export interface XLSXStatic {
  read(data: Uint8Array, opts: { type: string }): WorkBook;
  utils: {
    sheet_to_json<T>(ws: WorkSheet, opts?: { defval?: unknown }): T[];
  };
}

export interface WorkBook {
  SheetNames: string[];
  Sheets: Record<string, WorkSheet>;
}

export type WorkSheet = Record<string, unknown>;

export function getXLSX(): XLSXStatic {
  return (window as unknown as { XLSX: XLSXStatic }).XLSX;
}
