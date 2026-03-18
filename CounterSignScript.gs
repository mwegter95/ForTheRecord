/**
 * For the Record — Countersign Email Handler
 * ─────────────────────────────────────────────────────
 * Google Apps Script web app that receives a countersigned
 * contract PDF from the DJ portal and:
 *   1. Emails the CLIENT the fully countersigned PDF.
 *   2. Emails YOU a confirmation copy.
 *
 * SETUP INSTRUCTIONS (one-time):
 *   1. Go to https://script.google.com → New project
 *   2. Paste this entire file into the editor, replacing any existing code
 *   3. Click Deploy → New deployment
 *      - Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   4. Click Deploy → copy the web app URL
 *   5. Paste that URL into CounterSign.js at the COUNTERSIGN_SCRIPT_URL constant
 *   6. Rebuild and redeploy the React site
 *
 * NOTE ON SENDING FROM ALIAS:
 *   michael@fortherecordmn.com must be set up as a verified "Send mail as"
 *   alias in Gmail → Settings → Accounts and Import → Send mail as.
 *   If not verified, Google silently falls back to mwegter95@gmail.com.
 *
 * Every time you change this script, create a NEW deployment
 * (not update the existing one) and update the URL in CounterSign.js.
 */

// ── Your email addresses ─────────────────────────────────────
var DJ_FROM  = "michael@fortherecordmn.com";   // verified "Send mail as" alias
var DJ_INBOX = "mwegter95@gmail.com";           // actual Gmail inbox
var DJ_NAME  = "Michael Wegter — For the Record";

// ── Handle POST from the countersign page ────────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Decode the base64 PDF into a blob
    var pdfBytes = Utilities.base64Decode(data.pdf_base64);
    var pdfBlob  = Utilities.newBlob(pdfBytes, "application/pdf", data.pdf_filename);

    // ── 1. Send fully executed copy to client ──────────────
    GmailApp.sendEmail(
      data.client_email,
      "Your Fully Executed Wedding DJ Contract — For the Record",
      "",
      {
        from:        DJ_FROM,
        name:        DJ_NAME,
        replyTo:     DJ_FROM,
        htmlBody:    buildClientEmail(data),
        attachments: [pdfBlob],
      }
    );

    // ── 2. Confirmation copy to DJ ─────────────────────────
    GmailApp.sendEmail(
      DJ_INBOX,
      "✅ Countersigned & Sent: " + data.client_email,
      "",
      {
        from:        DJ_FROM,
        replyTo:     DJ_FROM,
        htmlBody:    buildDJConfirmEmail(data),
        attachments: [pdfBlob],
      }
    );

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error: " + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Required for CORS preflight ─────────────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Email to client: fully executed contract ──────────────────
function buildClientEmail(d) {
  return [
    "<div style='font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a'>",
    "<div style='background:#0a1128;padding:24px 32px;border-radius:8px 8px 0 0'>",
    "  <h2 style='margin:0;color:#c9a86a;font-size:20px;letter-spacing:1px'>FOR THE RECORD</h2>",
    "  <p style='margin:4px 0 0;color:#fff;font-size:13px'>Wedding DJ Services</p>",
    "</div>",
    "<div style='background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px'>",
    "  <h3 style='margin:0 0 16px;color:#0a1128'>Your Fully Executed Contract</h3>",
    "  <p>Great news — your Wedding DJ Services Agreement is now fully executed!</p>",
    "  <p>Both you and Michael Wegter (For the Record) have signed. " +
       "The fully countersigned copy is attached to this email. " +
       "Please save it for your records.</p>",
    "  <p style='margin:24px 0 8px'>Looking forward to being part of your big day. " +
       "Feel free to reach out anytime:</p>",
    "  <p style='margin:4px 0'><a href='mailto:" + esc(DJ_FROM) + "' style='color:#c9a86a'>" + esc(DJ_FROM) + "</a></p>",
    "  <p style='margin:4px 0 24px'><a href='tel:6123897005' style='color:#c9a86a'>(612) 389-7005</a></p>",
    "  <p style='margin:0;font-size:12px;color:#9ca3af'>For the Record · fortherecordmn.com · Minnesota</p>",
    "  <p style='margin:4px 0 0;font-size:12px;color:#9ca3af'>Countersigned by DJ on " + esc(d.countersign_date) + "</p>",
    "</div>",
    "</div>",
  ].join("\n");
}

// ── Confirmation email to DJ ──────────────────────────────────
function buildDJConfirmEmail(d) {
  return [
    "<div style='font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a'>",
    "<div style='background:#0a1128;padding:24px 32px;border-radius:8px 8px 0 0'>",
    "  <h2 style='margin:0;color:#c9a86a;font-size:20px;letter-spacing:1px'>FOR THE RECORD</h2>",
    "  <p style='margin:4px 0 0;color:#fff;font-size:13px'>Countersign Confirmation</p>",
    "</div>",
    "<div style='background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px'>",
    "  <h3 style='margin:0 0 16px;color:#0a1128'>Contract Countersigned ✓</h3>",
    "  <p>You countersigned the contract and the fully executed copy was sent to:</p>",
    "  <p><strong>" + esc(d.client_email) + "</strong></p>",
    "  <p>The countersigned PDF is also attached to this email for your records.</p>",
    "  <table style='width:100%;border-collapse:collapse;font-size:14px;margin-top:16px'>",
    "    <tr style='border-bottom:1px solid #f3f4f6'>",
    "      <td style='padding:10px 0;color:#6b7280;width:160px'>Client Email</td>",
    "      <td style='padding:10px 0'>" + esc(d.client_email) + "</td>",
    "    </tr>",
    "    <tr style='border-bottom:1px solid #f3f4f6'>",
    "      <td style='padding:10px 0;color:#6b7280'>Countersigned By</td>",
    "      <td style='padding:10px 0;font-weight:600'>" + esc(d.dj_name) + "</td>",
    "    </tr>",
    "    <tr>",
    "      <td style='padding:10px 0;color:#6b7280'>Date</td>",
    "      <td style='padding:10px 0'>" + esc(d.countersign_date) + "</td>",
    "    </tr>",
    "  </table>",
    "  <p style='margin:24px 0 0;font-size:12px;color:#9ca3af'>For the Record · fortherecordmn.com</p>",
    "</div>",
    "</div>",
  ].join("\n");
}

// ── HTML escape helper ───────────────────────────────────────
function esc(str) {
  if (!str) return "—";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
