/**
 * For the Record — Send Payment Request Email Handler
 * ─────────────────────────────────────────────────────────────
 * Google Apps Script web app that receives a POST from the
 * /send-payment-request DJ portal and sends the client a
 * beautifully designed email with a payment link and clear
 * fee breakdown for each payment option.
 *
 * SETUP INSTRUCTIONS (one-time):
 *   1. Go to https://script.google.com → New project
 *   2. Paste this entire file into the editor
 *   3. Click Deploy → New deployment
 *      - Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   4. Click Deploy → copy the web app URL
 *   5. Paste that URL into SendPaymentRequest.js at SEND_PAYMENT_SCRIPT_URL
 *   6. Rebuild and redeploy the React site
 *
 * NOTE: michael@fortherecordmn.com must be a verified "Send mail as"
 * alias in your Gmail settings for the from field to work.
 * Gmail → Settings → See all settings → Accounts and Import → Send mail as
 */

// ── Email addresses ───────────────────────────────────────────
var DJ_FROM = "michael@fortherecordmn.com"; // verified "Send mail as" alias
var DJ_NAME = "Michael — For the Record";

// ── Payment config (must match frontend) ──────────────────────
var VENMO_USERNAME = "fortherecordmn";
var ZELLE_CONTACT = "mwegter95@gmail.com";

// ── Handle POST from the /send-payment-request page ───────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var clientEmail = data.client_email;
    var clientName = data.client_name;
    var amount = parseFloat(data.amount);
    var note = data.note || "";
    var paymentUrl = data.payment_url;

    if (!clientEmail || !clientName || !amount || !paymentUrl) {
      throw new Error("Missing required fields");
    }

    var subject = "Payment Request — For the Record";

    GmailApp.sendEmail(clientEmail, subject, "", {
      from: DJ_FROM,
      name: DJ_NAME,
      replyTo: DJ_FROM,
      htmlBody: buildEmail(clientName, amount, note, paymentUrl),
    });

    return ContentService.createTextOutput(
      JSON.stringify({ success: true }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log("Error: " + err.toString());
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.toString() }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}

// ── CORS preflight ────────────────────────────────────────────
function doGet(e) {
  return ContentService.createTextOutput(
    JSON.stringify({ status: "ok" }),
  ).setMimeType(ContentService.MimeType.JSON);
}

// ── Email template ────────────────────────────────────────────
function buildEmail(clientName, amount, note, paymentUrl) {
  var baseAmt = amount.toFixed(2);
  var venmoAmt = (amount * 1.02).toFixed(2);
  var venmoFee = (amount * 0.02).toFixed(2);
  var cardAmt = (amount * 1.03).toFixed(2);
  var cardFee = (amount * 0.03).toFixed(2);

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
    "    Payment Request",
    "  </h2>",

    "  <p style='margin:0 0 14px;font-size:15px;color:#374151;line-height:1.7'>",
    "    Hi " + esc(clientName) + ",",
    "  </p>",

    "  <p style='margin:0 0 14px;font-size:15px;color:#374151;line-height:1.7'>",
    "    Thank you for booking with For the Record! Here is your secure payment link for:",
    "  </p>",

    // ── Amount box
    "  <div style='background:#f8f7f4;border:1px solid #e5e7eb;border-radius:6px;padding:20px;margin:0 0 28px;text-align:center'>",
    "    <p style='margin:0 0 8px;font-size:13px;color:#6b7280;letter-spacing:1px'>AMOUNT</p>",
    "    <p style='margin:0;font-size:32px;color:#0a1128;font-weight:400'>$" +
      baseAmt +
      "</p>",
    note
      ? "    <p style='margin:12px 0 0;font-size:14px;color:#6b7280;font-style:italic'>" +
        esc(note) +
        "</p>"
      : "",
    "  </div>",

    "  <p style='margin:0 0 24px;font-size:15px;color:#374151;line-height:1.7'>",
    "    Click the button below to view your payment link with all available options:",
    "  </p>",

    // ── CTA Button
    "  <table width='100%' cellpadding='0' cellspacing='0'><tr><td align='center' style='padding-bottom:32px'>",
    "    <a href='" + paymentUrl + "'",
    "       style='display:inline-block;background:#0a1128;color:#c9a86a;text-decoration:none;",
    "              padding:18px 44px;border-radius:50px;font-family:Georgia,serif;",
    "              font-size:16px;font-weight:400;letter-spacing:1px;",
    "              border:1px solid #c9a86a'>",
    "      Go to Payment Page &rarr;",
    "    </a>",
    "  </td></tr></table>",

    // ── Payment options breakdown
    "  <div style='background:#f8f7f4;border:1px solid #e5e7eb;border-radius:6px;padding:24px;margin:0 0 32px'>",
    "    <p style='margin:0 0 16px;font-size:13px;color:#6b7280;letter-spacing:1px;text-transform:uppercase'>Payment Options Available</p>",

    // Zelle
    "    <div style='margin:0 0 14px'>",
    "      <p style='margin:0 0 4px;font-size:15px;color:#0a1128;font-weight:600'>Zelle (no fee)</p>",
    "      <p style='margin:0;font-size:14px;color:#6b7280'>",
    "        <strong style='color:#0a1128'>$" +
      baseAmt +
      "</strong> → send to " +
      esc(ZELLE_CONTACT),
    "      </p>",
    "    </div>",

    // Venmo
    "    <div style='margin:0 0 14px'>",
    "      <p style='margin:0 0 4px;font-size:15px;color:#0a1128;font-weight:600'>Venmo (2% processing fee)</p>",
    "      <p style='margin:0;font-size:14px;color:#6b7280'>",
    "        <strong style='color:#0a1128'>$" +
      venmoAmt +
      "</strong> (incl. $" +
      venmoFee +
      " fee) → @" +
      esc(VENMO_USERNAME),
    "      </p>",
    "    </div>",

    // Credit Card
    "    <div style='margin:0 0 16px'>",
    "      <p style='margin:0 0 4px;font-size:15px;color:#0a1128;font-weight:600'>Credit or Debit Card (3% processing fee)</p>",
    "      <p style='margin:0;font-size:14px;color:#6b7280'>",
    "        <strong style='color:#0a1128'>$" +
      cardAmt +
      "</strong> (incl. $" +
      cardFee +
      " fee)",
    "      </p>",
    "    </div>",

    // ── Link inside box
    "    <div style='border-top:1px solid #e5e7eb;padding-top:14px'>",
    "      <a href='" +
      paymentUrl +
      "' style='font-size:14px;color:#c9a86a;text-decoration:underline;font-family:Georgia,serif'>Go to payment page to easily pay &rarr;</a>",
    "    </div>",

    "  </div>",

    // ── Divider
    "  <hr style='border:none;border-top:1px solid #f0f1f3;margin:0 0 28px'>",

    // ── Fallback link
    "  <p style='margin:0 0 6px;font-size:12px;color:#9ca3af;line-height:1.6'>",
    "    Button not working? Copy and paste this link into your browser:",
    "  </p>",
    "  <p style='margin:0 0 32px;font-size:11px;color:#9ca3af;word-break:break-all;line-height:1.6'>",
    "    " + esc(paymentUrl),
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

    "</table>", // inner
    "</td></tr>",
    "</table>", // outer
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
