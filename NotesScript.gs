// ════════════════════════════════════════════════════════════════════════════
//  NotesScript.gs — For the Record DJ · Client Notes Backend
//  Deploy as: Extensions → Apps Script → Deploy → New Deployment
//    Type: Web App | Execute as: Me | Who has access: Anyone
// ════════════════════════════════════════════════════════════════════════════

const SUMMARY_SHEET = "Summary";

// Column headers for the Summary sheet (front tab)
const SUMMARY_HEADERS = [
  "ID",
  "Couple Names",
  "Wedding Date",
  "Venue",
  "Calendar Marked",
  "Last Updated",
];

// All field keys written to each per-client sheet (row 1 = headers, row 2 = values)
// MUST match the field keys defined in Notes.js SECTIONS (plus top-level fields)
const CLIENT_FIELDS = [
  "id",
  "coupleNames",
  "weddingDate",
  "createdAt",
  "updatedAt",
  // Event Info
  "venue",
  "address",
  "guestCount",
  "phone",
  "email",
  "calendarMarked",
  // Services
  "setupTeardown",
  "receptionHours",
  "ceremonyHours",
  "cocktailHours",
  "ceremonyMic",
  "dancefloor",
  "uplighting",
  // Timeline
  "musicStart",
  "musicEnd",
  "guestsArrive",
  "dinnerTime",
  "danceTime",
  "otherEvents",
  // Wedding Party
  "brideName",
  "groomName",
  "introduceAs",
  "introSong",
  "bestMan",
  "maidOfHonor",
  "partyAnnounced",
  // Special Dances
  "firstDance",
  "fatherDaughter",
  "motherSon",
  "weddingPartyDance",
  "otherDances",
  // Announcements
  "toastsWhen",
  "announceSeated",
  "cakeCutting",
  "dollarDance",
  "bouquetToss",
  "garterToss",
  // Music
  "playlistLink",
  "songsToPlay",
  "songsNotToPlay",
  "genreNotes",
  // General Notes
  "notes",
];

// Boolean field keys (stored as TRUE/FALSE strings in Sheets)
const BOOLEAN_KEYS = [
  "calendarMarked",
  "setupTeardown",
  "ceremonyMic",
  "dancefloor",
  "announceSeated",
  "cakeCutting",
  "dollarDance",
  "bouquetToss",
  "garterToss",
];

// ── One-time fix: reset font colors on existing Summary rows ─────────────────
// Run once from the Apps Script editor if rows already have black text.
function fixSummaryColors() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const summary = ss.getSheetByName(SUMMARY_SHEET);
  if (!summary) return;
  const lastRow = summary.getLastRow();
  if (lastRow < 2) return;
  const range = summary.getRange(2, 1, lastRow - 1, SUMMARY_HEADERS.length);
  range.setFontColor("#f8f6f1");
}

// ── Entry points ─────────────────────────────────────────────────────────────

function doGet(e) {
  return handleRequest(e, null);
}

function doPost(e) {
  let body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (_) {}
  return handleRequest(e, body);
}

function handleRequest(e, body) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const params = e.parameter || {};
  // Action can come from query string (GET) or body (POST)
  const action = params.action || (body && body.action) || "";

  try {
    let result;
    if (action === "load") {
      result = loadAllNotes(ss);
    } else if (action === "save") {
      const note = body || {};
      result = saveNote(ss, note);
    } else if (action === "delete") {
      const id = params.id || (body && body.id) || "";
      result = deleteNote(ss, id);
    } else {
      result = { error: "Unknown action: " + action };
    }

    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(
      ContentService.MimeType.JSON,
    );
  } catch (err) {
    return ContentService.createTextOutput(
      JSON.stringify({ error: err.message }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function ensureSummarySheet(ss) {
  let sheet = ss.getSheetByName(SUMMARY_SHEET);
  if (!sheet) {
    // Insert as the very first sheet
    sheet = ss.insertSheet(SUMMARY_SHEET, 0);
    sheet.appendRow(SUMMARY_HEADERS);
    sheet
      .getRange(1, 1, 1, SUMMARY_HEADERS.length)
      .setFontWeight("bold")
      .setBackground("#0a1128")
      .setFontColor("#c9a86a");
    sheet.setFrozenRows(1);
    sheet.setColumnWidth(1, 220); // ID column (wide enough to see)
    sheet.setColumnWidth(2, 220); // Couple Names
    sheet.setColumnWidth(3, 120); // Wedding Date
    sheet.setColumnWidth(4, 200); // Venue
  }
  return sheet;
}

// Find the per-client sheet whose id field matches `id`
function findClientSheet(ss, id) {
  if (!id) return null;
  const sheets = ss.getSheets();
  for (const sheet of sheets) {
    if (sheet.getName() === SUMMARY_SHEET) continue;
    const lastRow = sheet.getLastRow();
    if (lastRow < 2) continue;
    const lastCol = sheet.getLastColumn();
    if (lastCol < 1) continue;
    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const idColIdx = headers.indexOf("id");
    if (idColIdx < 0) continue;
    const idVal = sheet.getRange(2, idColIdx + 1).getValue();
    if (String(idVal) === String(id)) return sheet;
  }
  return null;
}

// Truncate couple name to a safe sheet name (max 31 chars, no special chars)
function sheetNameFor(coupleNames) {
  const base = (coupleNames || "Unnamed Client")
    .replace(/[\/\\?*\[\]:]/g, "")
    .trim();
  return base.substring(0, 31) || "Unnamed Client";
}

// Find a unique sheet name (appends number if collision)
function uniqueSheetName(ss, desired, excludeSheet) {
  let name = desired;
  let n = 1;
  while (true) {
    const existing = ss.getSheetByName(name);
    if (!existing || existing === excludeSheet) return name;
    name = desired.substring(0, 28) + " " + n;
    n++;
  }
}

// ── Load ──────────────────────────────────────────────────────────────────────

function loadAllNotes(ss) {
  ensureSummarySheet(ss);
  const notes = [];
  const sheets = ss.getSheets();

  for (const sheet of sheets) {
    if (sheet.getName() === SUMMARY_SHEET) continue;
    const lastRow = sheet.getLastRow();
    const lastCol = sheet.getLastColumn();
    if (lastRow < 2 || lastCol < 1) continue;

    const headers = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
    const values = sheet.getRange(2, 1, 1, lastCol).getValues()[0];

    const note = {};
    headers.forEach((key, i) => {
      const raw = values[i];
      const k = String(key);
      if (BOOLEAN_KEYS.indexOf(k) >= 0) {
        note[k] = raw === true || raw === "TRUE" || raw === "true";
      } else if (raw instanceof Date) {
        // Sheets auto-converts date strings to Date objects; reformat as yyyy-MM-dd
        note[k] = Utilities.formatDate(
          raw,
          Session.getScriptTimeZone(),
          "yyyy-MM-dd",
        );
      } else {
        note[k] = raw === null || raw === undefined ? "" : String(raw);
      }
    });

    // Only include notes that have an id
    if (note.id) notes.push(note);
  }

  return { notes };
}

// ── Save ──────────────────────────────────────────────────────────────────────

function saveNote(ss, note) {
  if (!note.id) return { error: "Note missing id" };
  ensureSummarySheet(ss);

  // Find or create client sheet
  let sheet = findClientSheet(ss, note.id);

  if (!sheet) {
    const desired = sheetNameFor(note.coupleNames);
    const safeName = uniqueSheetName(ss, desired, null);
    sheet = ss.insertSheet(safeName);

    // Move client sheet to position 1 (after Summary at 0)
    const summaryPos = ss.getSheetByName(SUMMARY_SHEET).getIndex();
    ss.moveActiveSheet(summaryPos + 1);
  } else {
    // Rename sheet if coupleNames changed
    const desired = sheetNameFor(note.coupleNames);
    const safeName = uniqueSheetName(ss, desired, sheet);
    if (sheet.getName() !== safeName) {
      sheet.setName(safeName);
    }
  }

  // Build headers + values arrays
  const headers = CLIENT_FIELDS;
  const values = CLIENT_FIELDS.map((k) => {
    const v = note[k];
    if (v === undefined || v === null) return "";
    return v;
  });

  // Write to sheet (expand columns if needed)
  const numCols = headers.length;
  if (sheet.getMaxColumns() < numCols) {
    sheet.insertColumnsAfter(
      sheet.getMaxColumns(),
      numCols - sheet.getMaxColumns(),
    );
  }

  sheet.getRange(1, 1, 1, numCols).setValues([headers]);
  sheet.getRange(2, 1, 1, numCols).setValues([values]);

  // Style header row
  sheet
    .getRange(1, 1, 1, numCols)
    .setFontWeight("bold")
    .setBackground("#0a1128")
    .setFontColor("#c9a86a");
  sheet.setFrozenRows(1);

  // Update summary tab
  updateSummary(ss, note);

  return { success: true };
}

// ── Delete ─────────────────────────────────────────────────────────────────────

function deleteNote(ss, id) {
  if (!id) return { error: "Missing id" };

  const sheet = findClientSheet(ss, id);
  if (sheet) {
    ss.deleteSheet(sheet);
  }

  // Remove from Summary
  const summary = ensureSummarySheet(ss);
  const lastRow = summary.getLastRow();
  if (lastRow >= 2) {
    const data = summary.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = data.length - 1; i >= 0; i--) {
      if (String(data[i][0]) === String(id)) {
        summary.deleteRow(i + 2); // +2: header row + 0-indexed
      }
    }
  }

  return { success: true };
}

// ── Update Summary tab ────────────────────────────────────────────────────────

function updateSummary(ss, note) {
  const summary = ensureSummarySheet(ss);
  const lastRow = summary.getLastRow();
  let rowIdx = -1; // 1-indexed sheet row, -1 = not found

  if (lastRow >= 2) {
    const ids = summary.getRange(2, 1, lastRow - 1, 1).getValues();
    for (let i = 0; i < ids.length; i++) {
      if (String(ids[i][0]) === String(note.id)) {
        rowIdx = i + 2; // +2: header row + 0-indexed
        break;
      }
    }
  }

  const rowData = [
    note.id || "",
    note.coupleNames || "",
    note.weddingDate || "",
    note.venue || "",
    note.calendarMarked ? "✓" : "",
    note.updatedAt || new Date().toISOString(),
  ];

  if (rowIdx > 0) {
    summary
      .getRange(rowIdx, 1, 1, rowData.length)
      .setValues([rowData])
      .setFontColor("#f8f6f1");
  } else {
    summary.appendRow(rowData);
    // Style new row
    const newRow = summary.getLastRow();
    const rowRange = summary.getRange(newRow, 1, 1, rowData.length);
    rowRange.setFontColor("#f8f6f1");
    if (newRow % 2 === 0) {
      rowRange.setBackground("#0f1b35");
    }
  }
}
