/**
 * Nhận dữ liệu form "Xác nhận tham dự" và ghi vào Google Sheet.
 * Cách cài đặt: xem README.md, mục "Kết nối form với Google Sheets".
 */
const SHEET_NAME = 'RSVP';
const HEADERS = ['Thời gian', 'Họ tên', 'Tham dự', 'Số người', 'Sự kiện', 'Lời chúc', 'Tên trên link mời'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = ss.getSheetByName(SHEET_NAME) || ss.insertSheet(SHEET_NAME);
    if (sheet.getLastRow() === 0) sheet.appendRow(HEADERS);

    const p = e.parameter || {};
    sheet.appendRow([
      new Date(),
      clean(p.name),
      clean(p.attend),
      clean(p.guests),
      clean(p.events),
      clean(p.message),
      clean(p.invitedAs),
    ]);

    return ContentService.createTextOutput(JSON.stringify({ ok: true }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

// Cắt độ dài và chặn chuỗi bắt đầu bằng = + - @ để Sheet không hiểu nhầm là công thức
function clean(value) {
  const s = String(value || '').slice(0, 500);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}
