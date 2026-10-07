export const GOOGLE_APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT UNTUK GOOGLE SPREADSHEET (PT KMI Wire and Cable Tbk)
 * =========================================================================
 * Panduan Pemasangan:
 * 1. Buka Google Spreadsheet Anda di Google Drive.
 * 2. Klik menu "Ekstensi" (Extensions) > "Apps Script".
 * 3. Hapus semua kode yang ada di Code.gs, lalu Salin & Tempel seluruh kode ini.
 * 4. Klik ikon "Simpan" (Ctrl+S / Cmd+S).
 * 5. Klik tombol biru "Terapkan" (Deploy) di kanan atas > "Deployment Baru" (New Deployment).
 * 6. Pada ikon gerigi "Pilih jenis", pilih "Aplikasi Web" (Web app).
 * 7. Isi:
 *    - Deskripsi: KMI Form Webhook
 *    - Jalankan sebagai (Execute as): Saya (email Anda)
 *    - Siapa yang memiliki akses (Who has access): SIAPA SAJA (Anyone)  <-- PENTING!
 * 8. Klik "Terapkan" (Deploy) & Berikan izin (Review Permissions).
 * 9. Salin URL Aplikasi Web yang diberikan (berakhiran /exec).
 * 10. Masukkan URL tersebut ke Pengaturan Spreadsheet di aplikasi web ini!
 */

function setupSheetsIfMissing(ss) {
  // 1. Sheet Pengambilan
  var sheetPengambilan = ss.getSheetByName('Pengambilan');
  if (!sheetPengambilan) {
    sheetPengambilan = ss.insertSheet('Pengambilan');
    sheetPengambilan.appendRow([
      'Waktu Simpan',
      'ID Transaksi',
      'Tanggal Form',
      'Mesin',
      'Nama Pengambil',
      'No Item',
      'Nama Barang',
      'Kuantitas (Qty)',
      'Satuan (U/M)',
      'Keterangan Pemakaian'
    ]);
    sheetPengambilan.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#fce8e6');
    sheetPengambilan.setFrozenRows(1);
  }

  // 2. Sheet Kedatangan
  var sheetKedatangan = ss.getSheetByName('Kedatangan');
  if (!sheetKedatangan) {
    sheetKedatangan = ss.insertSheet('Kedatangan');
    sheetKedatangan.appendRow([
      'Waktu Simpan',
      'ID Transaksi',
      'Tanggal Form',
      'No Item',
      'Nama Barang',
      'Kuantitas (Qty)',
      'Satuan (U/M)',
      'Keterangan',
      'No P.R.',
      'No P.E.'
    ]);
    sheetKedatangan.getRange(1, 1, 1, 10).setFontWeight('bold').setBackground('#e6f4ea');
    sheetKedatangan.setFrozenRows(1);
  }
}

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.tryLock(30000);

  try {
    var rawData = e.postData.contents;
    var data = JSON.parse(rawData);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    setupSheetsIfMissing(ss);

    // Ping / Test connection
    if (data.action === 'ping' || data.type === 'test') {
      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        message: 'Google Apps Script berhasil terhubung ke spreadsheet!',
        spreadsheetName: ss.getName(),
        timestamp: new Date().toISOString()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    var timestamp = new Date();
    var formattedTimestamp = Utilities.formatDate(timestamp, Session.getScriptTimeZone(), "yyyy-MM-dd HH:mm:ss");
    var transactionId = data.transactionId || ('TRX-' + new Date().getTime());

    if (data.type === 'pengambilan') {
      var sheet = ss.getSheetByName(data.sheetName || 'Pengambilan');
      if (!sheet) {
        sheet = ss.insertSheet(data.sheetName || 'Pengambilan');
      }

      var items = data.items || [];
      for (var i = 0; i < items.length; i++) {
        var item = items[i];
        sheet.appendRow([
          formattedTimestamp,
          transactionId,
          data.tanggal || '',
          data.mesin || '',
          data.namaPengambil || '',
          (i + 1),
          item.barang || '',
          item.qty || '',
          item.unit || '',
          item.keterangan || ''
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        type: 'pengambilan',
        transactionId: transactionId,
        rowCount: items.length,
        message: 'Data pengambilan berhasil ditambahkan ke sheet ' + sheet.getName()
      })).setMimeType(ContentService.MimeType.JSON);

    } else if (data.type === 'kedatangan') {
      var sheetK = ss.getSheetByName(data.sheetName || 'Kedatangan');
      if (!sheetK) {
        sheetK = ss.insertSheet(data.sheetName || 'Kedatangan');
      }

      var itemsK = data.items || [];
      for (var j = 0; j < itemsK.length; j++) {
        var it = itemsK[j];
        sheetK.appendRow([
          formattedTimestamp,
          transactionId,
          data.tanggal || '',
          (j + 1),
          it.barang || '',
          it.qty || '',
          it.unit || '',
          it.keterangan || '',
          it.noPR || '',
          it.noPE || ''
        ]);
      }

      return ContentService.createTextOutput(JSON.stringify({
        status: 'success',
        type: 'kedatangan',
        transactionId: transactionId,
        rowCount: itemsK.length,
        message: 'Data kedatangan berhasil ditambahkan ke sheet ' + sheetK.getName()
      })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: 'Tipe formulir tidak dikenali: ' + data.type
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({
    status: 'online',
    message: 'Webhook Google Apps Script untuk Form PT KMI Wire and Cable Tbk aktif.'
  })).setMimeType(ContentService.MimeType.JSON);
}
`;
