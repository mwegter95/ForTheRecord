/**
 * For the Record — Send Contract Email Handler
 * ─────────────────────────────────────────────────────────────
 * Google Apps Script web app that receives a POST from the
 * /send-contract DJ portal and sends the client a beautifully
 * designed email with a button linking directly to their
 * personalized, pre-filled contract signing page.
 *
 * SETUP INSTRUCTIONS (one-time):
 *   1. Go to https://script.google.com → New project
 *   2. Paste this entire file into the editor
 *   3. Click Deploy → New deployment
 *      - Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   4. Click Deploy → copy the web app URL
 *   5. Paste that URL into SendContract.js at SEND_CONTRACT_SCRIPT_URL
 *   6. Rebuild and redeploy the React site
 *
 * NOTE: michael@fortherecordmn.com must be a verified "Send mail as"
 * alias in your Gmail settings for the from field to work.
 * Gmail → Settings → See all settings → Accounts and Import → Send mail as
 */

// ── Email addresses ───────────────────────────────────────────
var DJ_FROM  = "michael@fortherecordmn.com"; // verified "Send mail as" alias
var DJ_NAME  = "Michael — For the Record";

// ── Handle POST from the /send-contract page ─────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var clientEmail   = data.client_email;
    var contractUrl   = data.contract_url;
    var eventDate     = data.event_date     || "";
    var contractType  = data.contract_type  || "wedding"; // "wedding" | "event"

    if (!clientEmail || !contractUrl) {
      throw new Error("Missing required fields: client_email or contract_url");
    }

    var subject, htmlBody;

    if (contractType === "event") {
      subject = eventDate
        ? "Your Event DJ Contract — " + eventDate + " | For the Record"
        : "Your Event DJ Contract is Ready | For the Record";
      htmlBody = buildEventEmail(contractUrl, eventDate);
    } else {
      subject = eventDate
        ? "Your Wedding DJ Contract — " + eventDate + " | For the Record"
        : "Your Wedding DJ Contract is Ready | For the Record";
      htmlBody = buildEmail(contractUrl, eventDate);
    }

    GmailApp.sendEmail(
      clientEmail,
      subject,
      "",
      {
        from:     DJ_FROM,
        name:     DJ_NAME,
        replyTo:  DJ_FROM,
        htmlBody: htmlBody,
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

// ── CORS preflight ────────────────────────────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Email template ────────────────────────────────────────────
function buildEmail(contractUrl, eventDate) {
  var dateStr = eventDate ? " for <strong>" + esc(eventDate) + "</strong>" : "";
  var bodyLines = [
    "<!DOCTYPE html>",
    "<html><head><meta charset='UTF-8'></head>",
    "<body style='margin:0;padding:0;background:#f3f2ee;font-family:Georgia,serif'>",

    // ── Outer wrapper
    "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f3f2ee;padding:40px 16px'>",
    "<tr><td align='center'>",
    "<table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%'>",

    // ── Header
    "<tr><td style='background:#0a1128;border-radius:8px 8px 0 0;padding:36px 40px;text-align:center'>",
    "  <p style='margin:0 0 6px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.5)'>Wedding DJ Services</p>",
    "  <h1 style='margin:0;font-family:Georgia,serif;font-size:28px;color:#c9a86a;letter-spacing:2px;font-weight:400'>FOR THE RECORD</h1>",
    "  <div style='margin:16px auto 0;width:40px;height:1px;background:#c9a86a;opacity:0.5'></div>",
    "</td></tr>",

    // ── Body
    "<tr><td style='background:#ffffff;padding:48px 48px 40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb'>",

    "  <h2 style='margin:0 0 20px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#0a1128;line-height:1.3'>",
    "    Your Contract is Ready to Sign",
    "  </h2>",

    "  <p style='margin:0 0 14px;font-size:15px;color:#374151;line-height:1.7'>",
    "    Hi there,",
    "  </p>",

    "  <p style='margin:0 0 14px;font-size:15px;color:#374151;line-height:1.7'>",
    "    Michael has prepared your personalized Wedding DJ Services Agreement" + dateStr + ". ",
    "    Your event details and selected services are already filled in — ",
    "    just add your contact information and signature to confirm your booking.",
    "  </p>",

    "  <p style='margin:0 0 36px;font-size:15px;color:#374151;line-height:1.7'>",
    "    Click the button below to review and sign:",
    "  </p>",

    // ── CTA Button
    "  <table width='100%' cellpadding='0' cellspacing='0'><tr><td align='center' style='padding-bottom:40px'>",
    "    <a href='" + contractUrl + "'",
    "       style='display:inline-block;background:#0a1128;color:#c9a86a;text-decoration:none;",
    "              padding:18px 44px;border-radius:50px;font-family:Georgia,serif;",
    "              font-size:16px;font-weight:400;letter-spacing:1px;",
    "              border:1px solid #c9a86a'>",
    "      Review &amp; Sign Your Contract &rarr;",
    "    </a>",
    "  </td></tr></table>",

    // ── Divider
    "  <hr style='border:none;border-top:1px solid #f0f1f3;margin:0 0 28px'>",

    // ── Fallback link
    "  <p style='margin:0 0 6px;font-size:12px;color:#9ca3af;line-height:1.6'>",
    "    Button not working? Copy and paste this link into your browser:",
    "  </p>",
    "  <p style='margin:0 0 32px;font-size:11px;color:#9ca3af;word-break:break-all;line-height:1.6'>",
    "    " + esc(contractUrl),
    "  </p>",

    // ── Divider
    "  <hr style='border:none;border-top:1px solid #f0f1f3;margin:0 0 24px'>",

    // ── Contact
    "  <p style='margin:0;font-size:14px;color:#374151;line-height:1.7'>",
    "    Questions? I'm happy to help —",
    "  </p>",
    "  <p style='margin:6px 0 0;font-size:14px;line-height:1.7'>",
    "    <a href='mailto:michael@fortherecordmn.com' style='color:#c9a86a;text-decoration:none'>michael@fortherecordmn.com</a>",
    "    &nbsp;&middot;&nbsp;",
    "    <a href='tel:6123897005' style='color:#c9a86a;text-decoration:none'>(612) 389-7005</a>",
    "  </p>",

    "</td></tr>",

    // ── Footer
    "<tr><td style='background:#f8f7f4;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;",
    "               padding:20px 40px;text-align:center'>",
    "  <p style='margin:0;font-size:11px;color:#9ca3af;letter-spacing:0.5px'>",
    "    For the Record &nbsp;&middot;&nbsp; fortherecordmn.com &nbsp;&middot;&nbsp; Minnesota",
    "  </p>",
    "</td></tr>",

    "</table>",  // inner
    "</td></tr>",
    "</table>",  // outer
    "</body></html>",
  ];

  return bodyLines.join("\n");
}

// ── HTML escape helper ────────────────────────────────────────
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Event contract email template ────────────────────────────
function buildEventEmail(contractUrl, eventDate) {
  var dateStr = eventDate ? " for <strong>" + esc(eventDate) + "</strong>" : "";
  var bodyLines = [
    "<!DOCTYPE html>",
    "<html><head><meta charset='UTF-8'></head>",
    "<body style='margin:0;padding:0;background:#f3f2ee;font-family:Georgia,serif'>",

    "<table width='100%' cellpadding='0' cellspacing='0' style='background:#f3f2ee;padding:40px 16px'>",
    "<tr><td align='center'>",
    "<table width='600' cellpadding='0' cellspacing='0' style='max-width:600px;width:100%'>",

    // ── Header
    "<tr><td style='background:#0a1128;border-radius:8px 8px 0 0;padding:36px 40px;text-align:center'>",
    "  <p style='margin:0 0 6px;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:rgba(255,255,255,0.5)'>Event DJ Services</p>",
    "  <h1 style='margin:0;font-family:Georgia,serif;font-size:28px;color:#c9a86a;letter-spacing:2px;font-weight:400'>FOR THE RECORD</h1>",
    "  <div style='margin:16px auto 0;width:40px;height:1px;background:#c9a86a;opacity:0.5'></div>",
    "</td></tr>",

    // ── Body
    "<tr><td style='background:#ffffff;padding:48px 48px 40px;border-left:1px solid #e5e7eb;border-right:1px solid #e5e7eb'>",

    "  <h2 style='margin:0 0 20px;font-family:Georgia,serif;font-size:22px;font-weight:400;color:#0a1128;line-height:1.3'>",
    "    Your Event Contract is Ready to Sign",
    "  </h2>",

    "  <p style='margin:0 0 14px;font-size:15px;color:#374151;line-height:1.7'>Hi there,</p>",

    "  <p style='margin:0 0 14px;font-size:15px;color:#374151;line-height:1.7'>",
    "    Michael has prepared your personalized Event DJ Services Agreement" + dateStr + ". ",
    "    Your event details and selected services are already filled in — ",
    "    just add your contact information and signature to confirm your booking.",
    "  </p>",

    "  <p style='margin:0 0 36px;font-size:15px;color:#374151;line-height:1.7'>",
    "    Click the button below to review and sign:",
    "  </p>",

    // ── CTA Button
    "  <table width='100%' cellpadding='0' cellspacing='0'><tr><td align='center' style='padding-bottom:40px'>",
    "    <a href='" + contractUrl + "'",
    "       style='display:inline-block;background:#0a1128;color:#c9a86a;text-decoration:none;",
    "              padding:18px 44px;border-radius:50px;font-family:Georgia,serif;",
    "              font-size:16px;font-weight:400;letter-spacing:1px;",
    "              border:1px solid #c9a86a'>",
    "      Review &amp; Sign Your Contract &rarr;",
    "    </a>",
    "  </td></tr></table>",

    "  <hr style='border:none;border-top:1px solid #f0f1f3;margin:0 0 28px'>",

    "  <p style='margin:0 0 6px;font-size:12px;color:#9ca3af;line-height:1.6'>",
    "    Button not working? Copy and paste this link into your browser:",
    "  </p>",
    "  <p style='margin:0 0 32px;font-size:11px;color:#9ca3af;word-break:break-all;line-height:1.6'>",
    "    " + esc(contractUrl),
    "  </p>",

    "  <hr style='border:none;border-top:1px solid #f0f1f3;margin:0 0 24px'>",

    "  <p style='margin:0;font-size:14px;color:#374151;line-height:1.7'>",
    "    Questions? I'm happy to help —",
    "  </p>",
    "  <p style='margin:6px 0 0;font-size:14px;line-height:1.7'>",
    "    <a href='mailto:michael@fortherecordmn.com' style='color:#c9a86a;text-decoration:none'>michael@fortherecordmn.com</a>",
    "    &nbsp;&middot;&nbsp;",
    "    <a href='tel:6123897005' style='color:#c9a86a;text-decoration:none'>(612) 389-7005</a>",
    "  </p>",

    "</td></tr>",

    // ── Footer
    "<tr><td style='background:#f8f7f4;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px;",
    "               padding:20px 40px;text-align:center'>",
    "  <p style='margin:0;font-size:11px;color:#9ca3af;letter-spacing:0.5px'>",
    "    For the Record &nbsp;&middot;&nbsp; fortherecordmn.com &nbsp;&middot;&nbsp; Minnesota",
    "  </p>",
    "</td></tr>",

    "</table>",
    "</td></tr>",
    "</table>",
    "</body></html>",
  ];

  return bodyLines.join("\n");
}
