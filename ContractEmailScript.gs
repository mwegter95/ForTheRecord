/**
 * For the Record — Contract Email Handler
 * ─────────────────────────────────────────────────────
 * Google Apps Script web app that receives a signed contract
 * submission from fortherecordmn.com, then:
 *   1. Emails YOU (mwegter95@gmail.com) with the signed
 *      PDF attached so you can countersign and reply.
 *   2. Emails the CLIENT a confirmation with their copy attached.
 *
 * SETUP INSTRUCTIONS (one-time):
 *   1. Go to https://script.google.com → New project
 *   2. Paste this entire file into the editor, replacing any existing code
 *   3. Click Deploy → New deployment
 *      - Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   4. Click Deploy → copy the web app URL
 *   5. Paste that URL into Contract.js at the APPS_SCRIPT_URL constant
 *   6. Rebuild and redeploy the React site
 *
 * NOTE ON SENDING FROM ALIAS:
 *   GmailApp.sendEmail supports a "from" field for verified aliases.
 *   For this to work, michael@fortherecordmn.com must be set up as a
 *   verified "Send mail as" alias in your Gmail settings:
 *   Gmail → Settings → See all settings → Accounts and Import → Send mail as.
 *   If the alias is not verified, Google will silently fall back to
 *   sending from mwegter95@gmail.com.
 *
 * Every time you change this script, create a NEW deployment
 * (not update the existing one) and update the URL in Contract.js.
 */

// ── Your email addresses ─────────────────────────────────────
var DJ_FROM   = "michael@fortherecordmn.com";  // verified "Send mail as" alias
var DJ_INBOX  = "mwegter95@gmail.com";          // fallback / actual Gmail inbox
var DJ_NAME   = "Michael Wegter — For the Record";

// ── Handle POST from the website ────────────────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    // Decode the base64 PDF into a blob
    var pdfBytes = Utilities.base64Decode(data.pdf_base64);
    var pdfBlob  = Utilities.newBlob(pdfBytes, "application/pdf", data.pdf_filename);

    // ── 1. Email to you with PDF attached ─────────────────
    GmailApp.sendEmail(
      DJ_INBOX,
      "✍️ Signed Contract: " + data.client_names + " — " + data.event_date,
      "",
      {
        from:        DJ_FROM,
        replyTo:     data.client_email,
        htmlBody:    buildDJEmail(data),
        attachments: [pdfBlob],
      }
    );

    // ── 2. Confirmation email to client with their copy ───
    GmailApp.sendEmail(
      data.client_email,
      "Your Wedding DJ Contract — For the Record",
      "",
      {
        from:        DJ_FROM,
        name:        DJ_NAME,
        replyTo:     DJ_FROM,
        htmlBody:    buildClientEmail(data),
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

// ── Email to Michael ─────────────────────────────────────────
function buildDJEmail(d) {
  return [
    "<div style='font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a'>",
    "<div style='background:#0a1128;padding:24px 32px;border-radius:8px 8px 0 0'>",
    "  <h2 style='margin:0;color:#c9a86a;font-size:20px;letter-spacing:1px'>FOR THE RECORD</h2>",
    "  <p style='margin:4px 0 0;color:#fff;font-size:13px'>Wedding DJ Services Agreement</p>",
    "</div>",
    "<div style='background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px'>",
    "  <h3 style='margin:0 0 20px;color:#0a1128'>New Signed Contract Received</h3>",
    "  <p style='margin:0 0 16px'>The PDF is attached — review, countersign via the countersign page, and the client will receive a fully executed copy.</p>",
    "  <table style='width:100%;border-collapse:collapse;font-size:14px'>",
    "    <tr style='border-bottom:1px solid #f3f4f6'>",
    "      <td style='padding:10px 0;color:#6b7280;width:140px'>Client</td>",
    "      <td style='padding:10px 0;font-weight:600'>" + esc(d.client_names) + "</td>",
    "    </tr>",
    "    <tr style='border-bottom:1px solid #f3f4f6'>",
    "      <td style='padding:10px 0;color:#6b7280'>Email</td>",
    "      <td style='padding:10px 0'><a href='mailto:" + esc(d.client_email) + "'>" + esc(d.client_email) + "</a></td>",
    "    </tr>",
    "    <tr style='border-bottom:1px solid #f3f4f6'>",
    "      <td style='padding:10px 0;color:#6b7280'>Phone</td>",
    "      <td style='padding:10px 0'>" + esc(d.client_phone) + "</td>",
    "    </tr>",
    "    <tr style='border-bottom:1px solid #f3f4f6'>",
    "      <td style='padding:10px 0;color:#6b7280'>Event Date</td>",
    "      <td style='padding:10px 0;font-weight:600'>" + esc(d.event_date) + "</td>",
    "    </tr>",
    "    <tr style='border-bottom:1px solid #f3f4f6'>",
    "      <td style='padding:10px 0;color:#6b7280'>Venue</td>",
    "      <td style='padding:10px 0'>" + esc(d.venue_name) + "</td>",
    "    </tr>",
    "    <tr style='border-bottom:1px solid #f3f4f6'>",
    "      <td style='padding:10px 0;color:#6b7280'>Time</td>",
    "      <td style='padding:10px 0'>" + esc(d.start_time) + " – " + esc(d.end_time) + "</td>",
    "    </tr>",
    buildPricingRows(d),
    "    <tr style='border-bottom:1px solid #f3f4f6'>",
    "      <td style='padding:10px 0;color:#6b7280'>Deposit (50%)</td>",
    "      <td style='padding:10px 0'>" + esc(d.deposit_amount) + "</td>",
    "    </tr>",
    "    <tr style='border-bottom:1px solid #f3f4f6'>",
    "      <td style='padding:10px 0;color:#6b7280'>Balance Due</td>",
    "      <td style='padding:10px 0'>" + esc(d.balance_due) + "</td>",
    "    </tr>",
    d.special_notes && d.special_notes !== "None"
      ? "<tr><td style='padding:10px 0;color:#6b7280;vertical-align:top'>Notes</td>" +
        "<td style='padding:10px 0'>" + esc(d.special_notes) + "</td></tr>"
      : "",
    "  </table>",
    "  <p style='margin:24px 0 0;font-size:12px;color:#9ca3af'>Signed by client on " + esc(d.signed_date) + " · fortherecordmn.com</p>",
    "</div>",
    "</div>",
  ].join("\n");
}

// ── Confirmation email to client ─────────────────────────────
function buildClientEmail(d) {
  return [
    "<div style='font-family:Georgia,serif;max-width:600px;margin:0 auto;color:#1a1a1a'>",
    "<div style='background:#0a1128;padding:24px 32px;border-radius:8px 8px 0 0'>",
    "  <h2 style='margin:0;color:#c9a86a;font-size:20px;letter-spacing:1px'>FOR THE RECORD</h2>",
    "  <p style='margin:4px 0 0;color:#fff;font-size:13px'>Wedding DJ Services</p>",
    "</div>",
    "<div style='background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px'>",
    "  <h3 style='margin:0 0 16px;color:#0a1128'>Your Contract Has Been Received</h3>",
    "  <p>Hi " + esc(d.client_names) + ",</p>",
    "  <p>Thank you for signing your Wedding DJ Services Agreement with For the Record! " +
       "A copy of your signed contract is attached to this email for your records.</p>",
    "  <p>Here's a summary of your booking:</p>",
    "  <table style='width:100%;border-collapse:collapse;font-size:14px'>",
    "    <tr style='border-bottom:1px solid #f3f4f6'>",
    "      <td style='padding:10px 0;color:#6b7280;width:140px'>Event Date</td>",
    "      <td style='padding:10px 0;font-weight:600'>" + esc(d.event_date) + "</td>",
    "    </tr>",
    "    <tr style='border-bottom:1px solid #f3f4f6'>",
    "      <td style='padding:10px 0;color:#6b7280'>Venue</td>",
    "      <td style='padding:10px 0'>" + esc(d.venue_name) + "</td>",
    "    </tr>",
    "    <tr style='border-bottom:1px solid #f3f4f6'>",
    "      <td style='padding:10px 0;color:#6b7280'>Time</td>",
    "      <td style='padding:10px 0'>" + esc(d.start_time) + " – " + esc(d.end_time) + "</td>",
    "    </tr>",
    buildPricingRows(d),
    "    <tr style='border-bottom:1px solid #f3f4f6'>",
    "      <td style='padding:10px 0;color:#6b7280'>Deposit Due</td>",
    "      <td style='padding:10px 0;font-weight:600'>" + esc(d.deposit_amount) + " (due upon signing)</td>",
    "    </tr>",
    "    <tr>",
    "      <td style='padding:10px 0;color:#6b7280'>Balance Due</td>",
    "      <td style='padding:10px 0'>" + esc(d.balance_due) + " (14 days before event)</td>",
    "    </tr>",
    "  </table>",
    "  <p style='margin:24px 0 0'>Michael will review, countersign, and send you a fully executed copy shortly. " +
       "In the meantime, feel free to reach out with any questions:</p>",
    "  <p style='margin:8px 0'><a href='mailto:michael@fortherecordmn.com' style='color:#c9a86a'>michael@fortherecordmn.com</a></p>",
    "  <p style='margin:4px 0 24px'><a href='tel:6123897005' style='color:#c9a86a'>(612) 389-7005</a></p>",
    "  <p style='margin:0;font-size:12px;color:#9ca3af'>For the Record · fortherecordmn.com · Minnesota</p>",
    "</div>",
    "</div>",
  ].join("\n");
}

// ── Pricing rows (shared by both emails) ────────────────────
// Builds itemized service rows + subtotal + optional discount + adjusted total.
// Deposit & balance rows are added separately in each email template.
function buildPricingRows(d) {
  var rs  = "border-bottom:1px solid #f3f4f6";
  var lbl = "padding:10px 0;color:#6b7280;width:150px;vertical-align:top";
  var val = "padding:10px 0";
  var rows = [];

  function svcHourly(label, hoursStr, rate) {
    var hrs = parseFloat(hoursStr) || 0;
    if (hrs <= 0) return;
    var amt = hrs * rate;
    rows.push(
      "<tr style='" + rs + "'>" +
      "<td style='" + lbl + "'>" + esc(label) + "</td>" +
      "<td style='" + val + "'>" + hrs + " hr" + (hrs !== 1 ? "s" : "") +
      " &times; $" + rate + "/hr = <strong>$" + amt.toFixed(2) + "</strong></td>" +
      "</tr>"
    );
  }

  function svcFlat(label, amt) {
    rows.push(
      "<tr style='" + rs + "'>" +
      "<td style='" + lbl + "'>" + esc(label) + "</td>" +
      "<td style='" + val + "'>Flat rate — <strong>$" + amt.toFixed(2) + "</strong></td>" +
      "</tr>"
    );
  }

  if (d.setup_teardown === "Yes") svcFlat("Reception Setup & Teardown", 200);
  svcHourly("Reception / Dance DJ",         d.reception_hours, 100);
  svcHourly("Cocktail Hour Music",           d.cocktail_hours,   75);
  svcHourly("Dinner Music",                  d.dinner_hours,     75);
  svcHourly("Ceremony Music",                d.ceremony_hours,  100);
  if (d.ceremony_mic === "Yes") svcFlat("Ceremony Mic & Speaker Setup", 150);
  if (d.dancefloor   === "Yes") svcFlat("Reception Dancefloor Lighting", 175);
  if (d.uplighting   === "6 units")  svcFlat("Ambient Uplighting (6 units)", 275);
  if (d.uplighting   === "12 units") svcFlat("Ambient Uplighting (12 units)", 550);
  var mMi = parseFloat(d.mileage_miles) || 0;
  if (mMi > 0) {
    rows.push(
      "<tr style='" + rs + "'>" +
      "<td style='" + lbl + "'>Venue Mileage (round trip)</td>" +
      "<td style='" + val + "'>" + mMi + " mi &times; $0.50/mi = <strong>$" + (mMi * 0.50).toFixed(2) + "</strong></td>" +
      "</tr>"
    );
  }

  // Subtotal
  rows.push(
    "<tr style='" + rs + "'>" +
    "<td style='padding:10px 0;font-weight:700;color:#0a1128'>Subtotal</td>" +
    "<td style='padding:10px 0;font-weight:700'>" + esc(d.subtotal) + "</td>" +
    "</tr>"
  );

  // Discount + adjusted total (if applicable)
  var hasDiscount = (d.discount_percent !== "None" || d.discount_dollar !== "None");
  if (hasDiscount) {
    var discLabel = d.discount_percent !== "None"
      ? "Discount (" + esc(d.discount_percent) + ")"
      : "Discount";
    var discAmt = d.discount_dollar !== "None" ? "&minus;" + esc(d.discount_dollar) : "";
    rows.push(
      "<tr style='" + rs + "'>" +
      "<td style='padding:10px 0;color:#059669'>" + discLabel + "</td>" +
      "<td style='padding:10px 0;color:#059669;font-weight:600'>" + discAmt + "</td>" +
      "</tr>"
    );
    rows.push(
      "<tr style='" + rs + "'>" +
      "<td style='padding:10px 0;font-weight:700;color:#0a1128'>Adjusted Total</td>" +
      "<td style='padding:10px 0;font-weight:700'>" + esc(d.adjusted_total) + "</td>" +
      "</tr>"
    );
  }

  return rows.join("\n");
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
