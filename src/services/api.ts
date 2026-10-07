import { MasterItem, MasterUnit, AppSettings, SubmissionRecord, PengambilanFormData, KedatanganFormData } from '../types';
import { INITIAL_MASTER_ITEMS, INITIAL_MASTER_UNITS, DEFAULT_SETTINGS } from '../data/initialMasterData';

const STORAGE_KEYS = {
  ITEMS: 'kmi_master_items',
  UNITS: 'kmi_master_units',
  SETTINGS: 'kmi_app_settings',
  RECORDS: 'kmi_submission_records',
};

// ================= MASTER ITEMS =================
export async function getMasterItems(): Promise<MasterItem[]> {
  try {
    const res = await fetch('/api/master/items');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend unavailable, using localStorage for items:', err);
  }

  const stored = localStorage.getItem(STORAGE_KEYS.ITEMS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  // Save initial master items to storage
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(INITIAL_MASTER_ITEMS));
  // Send to backend in background
  fetch('/api/master/items', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(INITIAL_MASTER_ITEMS),
  }).catch(() => {});

  return INITIAL_MASTER_ITEMS;
}

export async function saveMasterItems(items: MasterItem[]): Promise<boolean> {
  localStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  try {
    const res = await fetch('/api/master/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(items),
    });
    return res.ok;
  } catch {
    return true; // Still saved in localStorage
  }
}

// ================= MASTER UNITS =================
export async function getMasterUnits(): Promise<MasterUnit[]> {
  try {
    const res = await fetch('/api/master/units');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(data));
        return data;
      }
    }
  } catch (err) {
    console.warn('Backend unavailable, using localStorage for units:', err);
  }

  const stored = localStorage.getItem(STORAGE_KEYS.UNITS);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      // ignore
    }
  }

  localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(INITIAL_MASTER_UNITS));
  fetch('/api/master/units', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(INITIAL_MASTER_UNITS),
  }).catch(() => {});

  return INITIAL_MASTER_UNITS;
}

export async function saveMasterUnits(units: MasterUnit[]): Promise<boolean> {
  localStorage.setItem(STORAGE_KEYS.UNITS, JSON.stringify(units));
  try {
    const res = await fetch('/api/master/units', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(units),
    });
    return res.ok;
  } catch {
    return true;
  }
}

// ================= SETTINGS =================
export async function getAppSettings(): Promise<AppSettings> {
  try {
    const res = await fetch('/api/settings');
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(data));
      return data;
    }
  } catch {
    // fallback
  }

  const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
  if (stored) {
    try {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    } catch {
      // ignore
    }
  }

  return DEFAULT_SETTINGS;
}

export async function saveAppSettings(settings: AppSettings): Promise<boolean> {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  try {
    const res = await fetch('/api/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    return res.ok;
  } catch {
    return true;
  }
}

// ================= TEST CONNECTION =================
export async function testSheetsConnection(webhookUrl: string): Promise<{
  success: boolean;
  message: string;
  details?: any;
}> {
  try {
    const res = await fetch('/api/test-sheets', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ webhookUrl }),
    });
    return await res.json();
  } catch (err: any) {
    // Attempt direct ping if backend is not responding
    try {
      const direct = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'ping', type: 'test' }),
      });
      const text = await direct.text();
      return {
        success: direct.ok,
        message: direct.ok
          ? 'Koneksi langsung ke Google Apps Script berhasil!'
          : `Gagal dengan status ${direct.status}`,
        details: text,
      };
    } catch (directErr: any) {
      return {
        success: false,
        message: `Koneksi gagal: ${err.message || directErr.message || 'CORS / URL tidak valid'}`,
      };
    }
  }
}

// ================= SUBMIT FORM =================
export async function submitFormData(
  formData: PengambilanFormData | KedatanganFormData
): Promise<{
  success: boolean;
  synced: boolean;
  message: string;
  record?: SubmissionRecord;
}> {
  const localSettings = await getAppSettings();

  try {
    const res = await fetch('/api/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...formData,
        webhookUrl: localSettings.webhookUrl,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      saveRecordLocally(data.record || {
        ...formData,
        id: data.transactionId || `TRX-${Date.now()}`,
        createdAt: new Date().toISOString(),
        syncedToSheets: data.synced,
      });
      return data;
    }
  } catch (err) {
    console.warn('Backend /api/submit failed, trying direct or local save:', err);
  }

  // Fallback: If backend is unreachable, try direct fetch if webhookUrl is present
  const transactionId = `TRX-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const now = new Date().toISOString();
  let synced = false;
  let syncMsg = 'Data tersimpan di perangkat lokal.';

  if (localSettings.webhookUrl) {
    try {
      const payload = {
        ...formData,
        action: 'submit',
        transactionId,
        timestamp: now,
        sheetName:
          formData.type === 'pengambilan'
            ? localSettings.sheetNamePengambilan
            : localSettings.sheetNameKedatangan,
      };
      await fetch(localSettings.webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        mode: 'no-cors', // standard workaround for direct browser to Google Apps Script
      });
      synced = true;
      syncMsg = 'Data berhasil dikirim ke Google Spreadsheet!';
    } catch (e: any) {
      syncMsg = `Data tersimpan lokal, pengiriman spreadsheet gagal: ${e.message}`;
    }
  }

  const fallbackRecord: SubmissionRecord = {
    ...formData,
    id: transactionId,
    createdAt: now,
    syncedToSheets: synced,
    syncError: synced ? undefined : 'Tersimpan offline',
  };

  saveRecordLocally(fallbackRecord);

  return {
    success: true,
    synced,
    message: syncMsg,
    record: fallbackRecord,
  };
}

// ================= LOCAL STORAGE RECORDS =================
export function getLocalRecords(): SubmissionRecord[] {
  const stored = localStorage.getItem(STORAGE_KEYS.RECORDS);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveRecordLocally(record: SubmissionRecord) {
  const current = getLocalRecords();
  const updated = [record, ...current.filter((r) => r.id !== record.id)].slice(0, 500);
  localStorage.setItem(STORAGE_KEYS.RECORDS, JSON.stringify(updated));
}

export function clearLocalRecords() {
  localStorage.removeItem(STORAGE_KEYS.RECORDS);
  fetch('/api/records', { method: 'DELETE' }).catch(() => {});
}
