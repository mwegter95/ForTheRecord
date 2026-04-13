// ════════════════════════════════════════════════════════════════════════════
//  InvoiceEmailScript.gs — For the Record DJ · Deposit Invoice Emailer
//  Deploy as: Extensions → Apps Script → Deploy → New Deployment
//    Type: Web App | Execute as: Me | Who has access: Anyone
//  Then paste the Web App URL into INVOICE_SCRIPT_URL in Invoice.js
// ════════════════════════════════════════════════════════════════════════════

// Your email address — invoice CC/BCC goes here
const MICHAEL_EMAIL = "michael@fortherecordmn.com";

// ── Auth helper — run this once from the editor to grant Gmail scope ─────────
// Select "authorizeGmail" in the function dropdown and click Run.
// When the "Authorization required" dialog appears, click Review → Allow.
// After that, deploy a new version and you're done.
function authorizeGmail() {
  GmailApp.getInboxUnreadCount(); // trivial read — just triggers the OAuth prompt
  Logger.log("Gmail authorization granted.");
}

function doPost(e) {
  let data = {};
  try {
    data = JSON.parse(e.postData.contents);
  } catch (_) {}
  return handleInvoice(data);
}

function doGet(e) {
  // Allow a quick test ping: ?action=ping
  if ((e.parameter || {}).action === "ping") {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: true, message: "InvoiceEmailScript is live." }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput(
    JSON.stringify({ error: "GET not supported for invoice send." }),
  ).setMimeType(ContentService.MimeType.JSON);
}

function handleInvoice(data) {
  try {
    const clientNames = data.client_names || "Valued Client";
    const clientEmail = data.client_email || "";
    const eventDate = data.event_date || "—";
    const venueName = (data.venue_name && data.venue_name !== "—") ? data.venue_name : "";
    const depositPaid = data.deposit_paid || "$0.00";
    const remainingBalance = data.remaining_balance || "$0.00";
    const dueDate = data.due_date || "14 days before your event";
    const paymentLink = data.payment_link || "";
    const note = data.note || "";
    const pdfBase64 = data.pdf_base64 || "";
    const pdfFilename = data.pdf_filename || "FTR_Invoice.pdf";

    if (!clientEmail) throw new Error("No client email provided.");

    // ── Build HTML email body ─────────────────────────────────────────────
    const venueHtml = venueName ? `<br>at <strong>${venueName}</strong>` : "";

    const payLinkHtml = paymentLink
      ? `<p style="margin-top:16px;">
           <a href="${paymentLink}" style="
             display:inline-block;
             background:#0a1128;
             color:#c9a86a;
             padding:12px 28px;
             border-radius:8px;
             font-weight:700;
             text-decoration:none;
             font-family:sans-serif;
             font-size:15px;">
             Pay Remaining Balance, Due ${dueDate} &rarr;
           </a>
         </p>
         <p style="font-size:12px;color:#9ca3af;margin-top:6px;">
           Or copy this link: <a href="${paymentLink}" style="color:#c9a86a;">${paymentLink}</a>
         </p>`
      : "";

    const noteHtml = note
      ? `<p style="margin-top:16px;padding:12px 16px;background:#f9f7f3;border-left:3px solid #c9a86a;border-radius:4px;font-size:14px;color:#374151;">
           ${note}
         </p>`
      : "";

    const htmlBody = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#f3f4f6;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f3f4f6;padding:32px 16px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(0,0,0,.08);">

        <!-- Header -->
        <tr><td style="background:#0a1128;padding:28px 36px;">
          <h1 style="margin:0;font-family:Georgia,serif;font-size:22px;color:#c9a86a;font-weight:normal;">
            For the Record
          </h1>
          <p style="margin:4px 0 0;font-size:12px;color:#d1d5db;">DJ & Event Services · Minneapolis, MN</p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:36px;">
          <h2 style="margin:0 0 6px;font-family:Georgia,serif;font-size:20px;color:#0a1128;font-weight:normal;">
            Thank You for Your Deposit, ${clientNames}!
          </h2>
          <p style="margin:0 0 20px;font-size:14px;color:#6b7280;">
            Your deposit has been received and your date is officially confirmed${venueHtml}.
          </p>

          <!-- Invoice summary box -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#f9f7f3;border-radius:10px;overflow:hidden;margin-bottom:20px;">
            <tr style="background:#0a1128;">
              <td colspan="2" style="padding:12px 20px;">
                <span style="font-size:13px;color:#c9a86a;font-weight:700;letter-spacing:.05em;text-transform:uppercase;">
                  Invoice Summary
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding:12px 20px;font-size:14px;color:#374151;border-bottom:1px solid #e5e7eb;">Event Date</td>
              <td style="padding:12px 20px;font-size:14px;color:#0a1128;font-weight:600;text-align:right;border-bottom:1px solid #e5e7eb;">${eventDate}</td>
            </tr>
            ${
              venueName
                ? `<tr>
              <td style="padding:12px 20px;font-size:14px;color:#374151;border-bottom:1px solid #e5e7eb;">Venue</td>
              <td style="padding:12px 20px;font-size:14px;color:#0a1128;font-weight:600;text-align:right;border-bottom:1px solid #e5e7eb;">${venueName}</td>
            </tr>`
                : ""
            }
            <tr>
              <td style="padding:12px 20px;font-size:14px;color:#374151;border-bottom:1px solid #e5e7eb;">Deposit Received ✓</td>
              <td style="padding:12px 20px;font-size:14px;color:#059669;font-weight:700;text-align:right;border-bottom:1px solid #e5e7eb;">${depositPaid}</td>
            </tr>
            <tr>
              <td style="padding:14px 20px;font-size:15px;color:#0a1128;font-weight:700;">Remaining Balance</td>
              <td style="padding:14px 20px;font-size:16px;color:#c9a86a;font-weight:700;text-align:right;">${remainingBalance}</td>
            </tr>
            <tr>
              <td colspan="2" style="padding:6px 20px 14px;font-size:12px;color:#9ca3af;">
                Remaining balance is due by <strong>${dueDate}</strong>.
              </td>
            </tr>
          </table>

          <p style="font-size:14px;color:#374151;line-height:1.6;">
            Your full signed invoice is attached to this email. Please save it for your records.
          </p>

          ${payLinkHtml}
          ${noteHtml}

          <p style="font-size:14px;color:#374151;line-height:1.6;margin-top:20px;">
            Thank you for choosing For the Record — we can't wait to be part of your day! &#127925;
          </p>
          <p style="font-size:13px;color:#6b7280;margin-top:6px;">
            — Michael<br>
            <a href="mailto:michael@fortherecordmn.com" style="color:#c9a86a;text-decoration:none;">
              michael@fortherecordmn.com
            </a> · (612) 389-7005
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#0a1128;padding:16px 36px;text-align:center;">
          <p style="margin:0;font-size:11px;color:#6b7280;">
            For the Record DJ Services · Minneapolis, MN ·
            <a href="https://fortherecordmn.com" style="color:#c9a86a;text-decoration:none;">fortherecordmn.com</a>
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;

    // ── Attach PDF if provided ────────────────────────────────────────────
    const attachments = [];
    if (pdfBase64) {
      try {
        const pdfBytes = Utilities.base64Decode(pdfBase64);
        const pdfBlob = Utilities.newBlob(
          pdfBytes,
          "application/pdf",
          pdfFilename,
        );
        attachments.push(pdfBlob);
      } catch (attachErr) {
        Logger.log("PDF attachment error: " + attachErr.message);
        // Non-fatal — send email without attachment
      }
    }

    // ── Send to client ────────────────────────────────────────────────────
    // GmailApp is required to send from a verified alias (michael@fortherecordmn.com).
    // MailApp.sendEmail always falls back to mwegter95@gmail.com.
    const mailOptions = {
      from: MICHAEL_EMAIL,
      name: "Michael — For the Record",
      bcc: MICHAEL_EMAIL,
      htmlBody: htmlBody,
    };
    if (attachments.length > 0) mailOptions.attachments = attachments;

    GmailApp.sendEmail(
      clientEmail,
      `Deposit Received — For the Record DJ | ${clientNames}`,
      "",
      mailOptions,
    );

    return ContentService.createTextOutput(
      JSON.stringify({ success: true }),
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    Logger.log("InvoiceEmailScript error: " + err.message);
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.message }),
    ).setMimeType(ContentService.MimeType.JSON);
  }
}
