export interface MasterItem {
  id: string;
  code: string;
  name: string;
  category: string;
  defaultUnit: string;
  description?: string;
}

export interface MasterUnit {
  id: string;
  code: string;
  name: string;
  symbol?: string;
}

export interface ItemEntryPengambilan {
  id: string;
  barang: string;
  qty: string | number;
  unit: string;
  keterangan: string;
}

export interface PengambilanFormData {
  id?: string;
  type: 'pengambilan';
  tanggal: string;
  mesin: string;
  namaPengambil: string;
  items: ItemEntryPengambilan[];
  createdAt?: string;
  syncedToSheets?: boolean;
}

export interface ItemEntryKedatangan {
  id: string;
  barang: string;
  qty: string | number;
  unit: string;
  keterangan: string;
  noPR: string;
  noPE: string;
}

export interface KedatanganFormData {
  id?: string;
  type: 'kedatangan';
  tanggal: string;
  items: ItemEntryKedatangan[];
  createdAt?: string;
  syncedToSheets?: boolean;
}

export type SubmissionRecord = (PengambilanFormData | KedatanganFormData) & {
  id: string;
  createdAt: string;
  syncedToSheets: boolean;
  syncError?: string;
};

export interface AppSettings {
  webhookUrl: string;
  sheetNamePengambilan: string;
  sheetNameKedatangan: string;
  spreadsheetId?: string;
  companyName: string;
}
