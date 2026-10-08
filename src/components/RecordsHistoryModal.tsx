import React, { useState } from 'react';
import { X, Download, Trash2, CheckCircle2, Clock, Filter, AlertCircle } from 'lucide-react';
import { SubmissionRecord } from '../types';

interface RecordsHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: SubmissionRecord[];
  onClearRecords: () => void;
}

export const RecordsHistoryModal: React.FC<RecordsHistoryModalProps> = ({
  isOpen,
  onClose,
  records,
  onClearRecords,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'pengambilan' | 'kedatangan'>('all');

  if (!isOpen) return null;

  const filteredRecords = records.filter((r) => {
    if (filterType === 'all') return true;
    return r.type === filterType;
  });

  const handleExportCSV = () => {
    if (filteredRecords.length === 0) return;

    // Build CSV content
    const headers = [
      'Waktu Simpan',
      'ID Transaksi',
      'Tipe Form',
      'Tanggal Form',
      'Mesin',
      'Nama Pengambil',
      'No Item',
      'Nama Barang',
      'Kuantitas (Qty)',
      'Satuan (U/M)',
      'Keterangan',
      'No P.R.',
      'No P.O.',
      'Status Sync Sheets',
    ];

    const rows: string[][] = [];

    filteredRecords.forEach((rec) => {
      rec.items.forEach((item: any, idx: number) => {
        rows.push([
          rec.createdAt ? new Date(rec.createdAt).toLocaleString('id-ID') : '',
          rec.id,
          rec.type.toUpperCase(),
          rec.tanggal,
          rec.type === 'pengambilan' ? (rec as any).mesin || '-' : '-',
          rec.type === 'pengambilan' ? (rec as any).namaPengambil || '-' : '-',
          String(idx + 1),
          item.barang || '',
          String(item.qty || ''),
          item.unit || '',
          item.keterangan || '',
          rec.type === 'kedatangan' ? (item as any).noPR || '-' : '-',
          rec.type === 'kedatangan' ? (item as any).noPO || (item as any).noPE || '-' : '-',
          rec.syncedToSheets ? 'Tersinkron ke Sheets' : 'Lokal',
        ]);
      });
    });

    const csvContent =
      '\uFEFF' + // UTF-8 BOM so Excel opens Indonesian characters properly
      [headers.join(','), ...rows.map((r) => r.map((c) => `"${(c || '').replace(/"/g, '""')}"`).join(','))].join(
        '\r\n'
      );

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `KMI_Form_Transaksi_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-5xl max-h-[92vh] flex flex-col border border-stone-800 shadow-2xl overflow-hidden rounded-none">
        {/* Header */}
        <div className="px-5 py-3.5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div>
            <h2 className="text-base font-bold tracking-tight">
              Riwayat Pengisian Formulir Transaksi
            </h2>
            <p className="text-xs text-stone-300">
              Daftar form yang telah dikirim dan disinkronkan ke Google Spreadsheet
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-stone-300 hover:text-white hover:bg-stone-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="p-3 bg-stone-100 border-b border-stone-300 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-stone-500" />
            <span className="font-semibold text-stone-700">Filter Tipe:</span>
            <button
              onClick={() => setFilterType('all')}
              className={`px-2.5 py-1 font-bold ${
                filterType === 'all'
                  ? 'bg-stone-800 text-white'
                  : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
              }`}
            >
              Semua ({records.length})
            </button>
            <button
              onClick={() => setFilterType('pengambilan')}
              className={`px-2.5 py-1 font-bold ${
                filterType === 'pengambilan'
                  ? 'bg-rose-700 text-white'
                  : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
              }`}
            >
              Pengambilan ({records.filter((r) => r.type === 'pengambilan').length})
            </button>
            <button
              onClick={() => setFilterType('kedatangan')}
              className={`px-2.5 py-1 font-bold ${
                filterType === 'kedatangan'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-white text-stone-700 border border-stone-300 hover:bg-stone-50'
              }`}
            >
              Kedatangan ({records.filter((r) => r.type === 'kedatangan').length})
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              disabled={filteredRecords.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold disabled:opacity-50 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Download Excel / CSV
            </button>
            <button
              onClick={() => {
                if (confirm('Yakin ingin menghapus seluruh riwayat lokal?')) {
                  onClearRecords();
                }
              }}
              disabled={records.length === 0}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-stone-200 hover:bg-stone-300 text-stone-700 font-medium disabled:opacity-50 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus Riwayat
            </button>
          </div>
        </div>

        {/* Content Table */}
        <div className="flex-1 overflow-y-auto p-4 bg-stone-50">
          {filteredRecords.length > 0 ? (
            <div className="space-y-4">
              {filteredRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white border border-stone-300 shadow-2xs overflow-hidden"
                >
                  {/* Card Header */}
                  <div
                    className={`px-4 py-2.5 flex flex-wrap items-center justify-between gap-2 border-b text-xs ${
                      rec.type === 'pengambilan'
                        ? 'bg-rose-50 border-rose-200'
                        : 'bg-emerald-50 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`font-mono font-bold px-2 py-0.5 uppercase ${
                          rec.type === 'pengambilan'
                            ? 'bg-rose-200 text-rose-900'
                            : 'bg-emerald-200 text-emerald-900'
                        }`}
                      >
                        {rec.type === 'pengambilan' ? 'PENGAMBILAN' : 'KEDATANGAN'}
                      </span>
                      <span className="font-mono text-stone-600 font-semibold">{rec.id}</span>
                      <span className="text-stone-500">• Tanggal: {rec.tanggal}</span>
                      {rec.type === 'pengambilan' && (
                        <>
                          <span className="text-stone-700 font-medium">
                            • Mesin: {(rec as any).mesin || '-'}
                          </span>
                          <span className="text-stone-700 font-medium">
                            • Pengambil: {(rec as any).namaPengambil || '-'}
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {rec.syncedToSheets ? (
                        <span className="inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]">
                          <CheckCircle2 className="w-3 h-3" />
                          Tersinkron ke Sheets
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-amber-700 font-medium bg-amber-100 px-2 py-0.5 rounded-full text-[11px]">
                          <AlertCircle className="w-3 h-3" />
                          Tersimpan Lokal
                        </span>
                      )}
                      <span className="text-[11px] text-stone-400 font-mono">
                        {rec.createdAt ? new Date(rec.createdAt).toLocaleTimeString('id-ID') : ''}
                      </span>
                    </div>
                  </div>

                  {/* Card Items Table */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs divide-y divide-stone-200">
                      <thead className="bg-stone-50 text-stone-600 font-semibold">
                        <tr>
                          <th className="px-3 py-1.5 w-10 text-center">#</th>
                          <th className="px-3 py-1.5">Nama Barang</th>
                          <th className="px-3 py-1.5 w-24 text-right">Qty</th>
                          <th className="px-3 py-1.5 w-20 text-center">U/M</th>
                          <th className="px-3 py-1.5">Keterangan</th>
                          {rec.type === 'kedatangan' && (
                            <>
                              <th className="px-3 py-1.5 w-28">No P.R.</th>
                              <th className="px-3 py-1.5 w-28">No P.O.</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 text-stone-800">
                        {rec.items.map((item: any, idx: number) => (
                          <tr key={idx} className="hover:bg-stone-50/70">
                            <td className="px-3 py-1.5 text-center text-stone-400 font-mono">
                              {idx + 1}
                            </td>
                            <td className="px-3 py-1.5 font-medium text-stone-900">
                              {item.barang}
                            </td>
                            <td className="px-3 py-1.5 text-right font-mono font-bold">
                              {item.qty}
                            </td>
                            <td className="px-3 py-1.5 text-center font-mono text-blue-700 font-semibold">
                              [ {item.unit} ]
                            </td>
                            <td className="px-3 py-1.5 text-stone-600">
                              {item.keterangan || '-'}
                            </td>
                            {rec.type === 'kedatangan' && (
                              <>
                                <td className="px-3 py-1.5 font-mono text-stone-700">
                                   {item.noPR || '-'}
                                </td>
                                <td className="px-3 py-1.5 font-mono text-stone-700">
                                   {item.noPO || item.noPE || '-'}
                                </td>
                              </>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-white border border-stone-200">
              <Clock className="w-8 h-8 text-stone-300 mx-auto mb-2" />
              <p className="text-sm font-semibold text-stone-700">Belum ada riwayat formulir</p>
              <p className="text-xs text-stone-500 mt-1">
                Data yang diisi di formulir Pengambilan atau Kedatangan akan otomatis tercatat di sini.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 bg-stone-100 border-t border-stone-300 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-800 hover:bg-stone-900 text-white font-bold text-xs transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
