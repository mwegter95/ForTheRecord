/**
 * For the Record — Google Meet Invite Email Sender
 * ─────────────────────────────────────────────────────────────────
 * Google Apps Script web app that:
 *   • LINK MODE   — sends a branded invite email using a Meet link you paste in
 *   • TIME MODE   — creates a real Google Calendar event (with Meet auto-generated)
 *                   on your calendar, then sends the branded invite with that link
 *
 * Accepts a JSON POST body with:
 *   client_email    — recipient email (required)
 *   client_name     — e.g. "Sarah & Jake" (optional)
 *   meet_link       — full Meet URL (link mode); leave blank for time mode
 *   event_date      — ISO date string "YYYY-MM-DD" (time mode)
 *   start_time      — "HH:MM" 24-hour (time mode)
 *   end_time        — "HH:MM" 24-hour, optional (time mode — defaults to +30 min)
 *   iana_timezone   — IANA tz string, e.g. "America/Chicago" (time mode)
 *   event_time      — human-readable time string for the email body (any mode)
 *   notes           — optional personal message
 *
 * SETUP INSTRUCTIONS (one-time):
 *   1. Go to https://script.google.com → New project
 *   2. Paste this entire file, replacing any existing code
 *   3. Enable the Calendar Advanced Service:
 *      Left sidebar → Services (+) → Google Calendar API → Add
 *      (This makes the "Calendar" namespace available for Meet link creation)
 *   4. AUTHORIZE ALL SCOPES — this is critical:
 *      - In the editor, select the "setup" function from the function dropdown
 *      - Click Run (▶)
 *      - Google will show an authorization screen — click "Review permissions"
 *      - Sign in and click "Allow" for Gmail AND Google Calendar access
 *      - You should see "Executed" in the log with no errors
 *      (If you skip this step, the web app will fail with a calendar permissions error)
 *   5. Click Deploy → New deployment
 *      - Type: Web app
 *      - Execute as: Me
 *      - Who has access: Anyone
 *   6. Click Deploy → copy the Web App URL
 *   7. Paste that URL into SendMeetInvite.js at SEND_MEET_SCRIPT_URL
 *   8. Rebuild and redeploy the React site
 *
 * RE-AUTHORIZATION (if you see a calendar permissions error):
 *   The web app runs with the OAuth scopes that were active when you last
 *   authorized it. If you added the Calendar Advanced Service after deploying,
 *   you need to re-authorize:
 *   1. Select the "setup" function and click Run (▶)
 *   2. Accept the new permissions (including Calendar)
 *   3. Create a NEW deployment (Deploy → New deployment) — do NOT update
 *      the existing one, as that reuses the old OAuth token
 *   4. Paste the new URL into SendMeetInvite.js and redeploy the site
 *
 * NOTE ON ALIAS:
 *   michael@fortherecordmn.com must be added as a verified "Send mail as"
 *   alias in Gmail → Settings → Accounts and Import → Send mail as.
 *   If not verified, Google silently falls back to mwegter95@gmail.com.
 *
 *   Every time you edit this file, create a NEW deployment (don't update
 *   the existing one) and paste the new URL into SendMeetInvite.js.
 */

// ── Your email config ─────────────────────────────────────────────────────────
var DJ_FROM  = "michael@fortherecordmn.com";   // verified "Send mail as" alias
var DJ_INBOX = "mwegter95@gmail.com";           // your actual Gmail inbox
var DJ_NAME  = "Michael Wegter \u2014 For the Record";

// ── One-time authorization setup — run this manually before deploying ─────────
// Select "setup" in the function dropdown and click Run (▶).
// This touches both Gmail and Calendar so Google presents a single consent
// screen covering all required scopes. Once authorized, create a NEW deployment.
function setup() {
  // Touch Gmail — triggers gmail.send scope
  GmailApp.getAliases();
  // Touch Calendar Advanced Service — triggers calendar.events scope
  var now = new Date();
  var end = new Date(now.getTime() + 30 * 60 * 1000);
  var test = Calendar.Events.insert({
    summary: "[Auth check — safe to delete]",
    start:   { dateTime: now.toISOString(),  timeZone: "America/Chicago" },
    end:     { dateTime: end.toISOString(),  timeZone: "America/Chicago" },
  }, "primary");
  // Clean it up immediately
  Calendar.Events.remove("primary", test.id);
  Logger.log("setup() complete — Gmail and Calendar scopes authorized. You can now create a new deployment.");
}

// ── Handle POST from the portal ───────────────────────────────────────────────
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var clientEmail   = data.client_email   || "";
    var clientName    = data.client_name    || "there";
    var meetLink      = data.meet_link      || "";
    var eventDate     = data.event_date     || "";   // YYYY-MM-DD
    var startTime     = data.start_time     || "";   // HH:MM
    var endTime       = data.end_time       || "";   // HH:MM
    var ianaTimezone  = data.iana_timezone  || "America/Chicago";
    var eventTime     = data.event_time     || "";   // display string
    var notes         = data.notes          || "";

    if (!clientEmail) throw new Error("client_email is required");

    // ── Time mode: create a real Calendar event and grab its Meet link ────────
    if (!meetLink && eventDate && startTime) {
      var created  = createCalendarEvent(clientName, clientEmail, eventDate, startTime, endTime, ianaTimezone, notes);
      meetLink     = created.meetLink;
    }

    var subject = "Your Consultation with For the Record"
      + (eventDate ? " — " + formatDisplayDate(eventDate) : "");

    // ── Send to the client ────────────────────────────────────────────────────
    GmailApp.sendEmail(
      clientEmail,
      subject,
      "",
      {
        from:     DJ_FROM,
        name:     DJ_NAME,
        replyTo:  DJ_FROM,
        htmlBody: buildClientEmail({ clientName, meetLink, eventDate, startTime, endTime, ianaTimezone, eventTime, notes }),
      }
    );

    // ── Send confirmation copy to Michael ─────────────────────────────────────
    GmailApp.sendEmail(
      DJ_INBOX,
      "Meet Invite Sent: " + clientName + (eventDate ? " \u2014 " + formatDisplayDate(eventDate) : ""),
      "",
      {
        from:     DJ_FROM,
        replyTo:  clientEmail,
        htmlBody: buildConfirmEmail({ clientName, clientEmail, meetLink, eventDate, eventTime, notes }),
      }
    );

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, meet_link: meetLink }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    Logger.log("Error: " + err.toString());
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// ── Required for CORS preflight ───────────────────────────────────────────────
function doGet(e) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "ok" }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ── Create a Google Calendar event with a Meet link ───────────────────────────
// Requires: Calendar Advanced Service enabled (Services → Google Calendar API)
function createCalendarEvent(clientName, clientEmail, dateStr, startStr, endStr, tz, notes) {
  // Build ISO datetimes — e.g. "2026-04-19T14:00:00"
  var startDT = dateStr + "T" + startStr + ":00";
  var endDT   = dateStr + "T" + (endStr || addMinutes(startStr, 30)) + ":00";

  var eventResource = {
    summary:     "Consultation — " + clientName + " | For the Record",
    description: "Google Meet consultation with " + clientName + "."
      + (clientEmail ? "\n\nClient email: " + clientEmail : "")
      + (notes       ? "\n\nNotes: " + notes               : ""),
    start:  { dateTime: startDT, timeZone: tz },
    end:    { dateTime: endDT,   timeZone: tz },
    // conferenceData instructs Google Calendar to auto-generate a Meet link
    conferenceData: {
      createRequest: {
        requestId:           Utilities.getUuid(),
        conferenceSolutionKey: { type: "hangoutsMeet" },
      },
    },
  };

  // conferenceDataVersion: 1 is required for Meet link generation
  var created  = Calendar.Events.insert(eventResource, "primary", { conferenceDataVersion: 1 });

  // Extract the Meet video link from the response
  var meetLink = "";
  try {
    var eps = created.conferenceData.entryPoints;
    for (var i = 0; i < eps.length; i++) {
      if (eps[i].entryPointType === "video") {
        meetLink = eps[i].uri;
        break;
      }
    }
  } catch (_) { /* conference data may not be ready immediately */ }

  return { meetLink: meetLink, eventId: created.id };
}

// ── Build a Google Calendar quick-add URL ─────────────────────────────────────
// Produces a pre-filled "Add to Calendar" link using local datetime + timezone.
// Format required by Google: YYYYMMDDTHHmmss (no dashes, no colons, no Z)
function buildCalendarUrl(eventDate, startTime, endTime, ianaTimezone, meetLink) {
  if (!eventDate || !startTime) return "";

  var startStr = eventDate.replace(/-/g, "") + "T" + startTime.replace(":", "") + "00";
  var endStr   = eventDate.replace(/-/g, "") + "T" + (endTime || addMinutes(startTime, 30)).replace(":", "") + "00";

  var title   = encodeURIComponent("Consultation \u2014 For the Record");
  var details = encodeURIComponent("Wedding & Event DJ consultation." + (meetLink ? "\n\nJoin: " + meetLink : ""));
  var tz      = encodeURIComponent(ianaTimezone || "America/Chicago");

  return "https://calendar.google.com/calendar/render?action=TEMPLATE"
    + "&text="    + title
    + "&dates="   + startStr + "/" + endStr
    + "&ctz="     + tz
    + "&details=" + details;
}

// ── Add minutes to "HH:MM" string ────────────────────────────────────────────
function addMinutes(timeStr, minutes) {
  var parts = timeStr.split(":");
  var total = parseInt(parts[0]) * 60 + parseInt(parts[1]) + minutes;
  var h = Math.floor(total / 60) % 24;
  var m = total % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

// ── Format "YYYY-MM-DD" → "Saturday, April 19, 2026" ─────────────────────────
function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  try {
    var parts = dateStr.split("-");
    var d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    var days   = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
    var months = ["January","February","March","April","May","June",
                  "July","August","September","October","November","December"];
    return days[d.getDay()] + ", " + months[d.getMonth()] + " " + d.getDate() + ", " + d.getFullYear();
  } catch (_) { return dateStr; }
}

// ── Email to client ───────────────────────────────────────────────────────────
function buildClientEmail(d) {
  var displayDate  = d.eventDate ? formatDisplayDate(d.eventDate) : "";
  var hasDetails   = displayDate || d.eventTime;
  var calendarUrl  = buildCalendarUrl(d.eventDate, d.startTime, d.endTime, d.ianaTimezone, d.meetLink);

  var detailsBlock = hasDetails
    ? [
        "<div style='background:#f9f7f4;border-left:3px solid #c9a86a;border-radius:4px;padding:16px 20px;margin:24px 0'>",
        displayDate
          ? "<div style='display:flex;align-items:flex-start;gap:16px;margin-bottom:" + (d.eventTime ? "12px" : "0") + "'>"
            + "<span style='font-size:18px;line-height:1.4'>&#x1F4C5;</span>"
            + "<div><p style='margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600'>Date</p>"
            + "<p style='margin:4px 0 0;font-size:15px;color:#0a1128;font-weight:600'>" + esc(displayDate) + "</p></div></div>"
          : "",
        d.eventTime
          ? "<div style='display:flex;align-items:flex-start;gap:16px'>"
            + "<span style='font-size:18px;line-height:1.4'>&#x1F550;</span>"
            + "<div><p style='margin:0;font-size:13px;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px;font-weight:600'>Time</p>"
            + "<p style='margin:4px 0 0;font-size:15px;color:#0a1128;font-weight:600'>" + esc(d.eventTime) + "</p></div></div>"
          : "",
        "</div>",
      ].join("\n")
    : "";

  var meetBlock = d.meetLink
    ? [
        "<div style='text-align:center;margin:28px 0'>",
        "  <a href='" + esc(d.meetLink) + "' style='display:inline-block;background:#0a1128;color:#c9a86a;text-decoration:none;"
          + "padding:14px 32px;border-radius:6px;font-size:15px;font-weight:700;letter-spacing:0.5px;font-family:Georgia,serif'>",
        "    Join the Meeting",
        "  </a>",
        "  <p style='margin:12px 0 0;font-size:12px;color:#9ca3af'>Or copy the link: "
          + "<a href='" + esc(d.meetLink) + "' style='color:#c9a86a;word-break:break-all'>" + esc(d.meetLink) + "</a></p>",
        calendarUrl
          ? "  <p style='margin:16px 0 0'>"
            + "<a href='" + esc(calendarUrl) + "' style='display:inline-block;color:#0a1128;text-decoration:none;"
            + "padding:9px 20px;border-radius:6px;font-size:13px;font-weight:600;border:1.5px solid #d1d5db;"
            + "font-family:Georgia,serif'>&#x1F4C5;&nbsp; Add to My Calendar</a></p>"
          : "",
        "</div>",
      ].join("\n")
    : "";

  var notesBlock = d.notes
    ? "<div style='background:#fff;border:1px solid #e5e7eb;border-radius:6px;padding:16px 20px;margin:24px 0'>"
      + "<p style='margin:0 0 6px;font-size:12px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:0.5px'>A note from Michael</p>"
      + "<p style='margin:0;font-size:14px;color:#374151;line-height:1.65'>" + esc(d.notes).replace(/\n/g, "<br>") + "</p>"
      + "</div>"
    : "";

  return [
    "<div style='font-family:Georgia,serif;max-width:580px;margin:0 auto;color:#1a1a1a'>",
    "<div style='background:#0a1128;padding:24px 32px;border-radius:8px 8px 0 0'>",
    "  <h2 style='margin:0;color:#c9a86a;font-size:20px;letter-spacing:1px;font-family:Georgia,serif'>FOR THE RECORD</h2>",
    "  <p style='margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px;font-family:Georgia,serif'>Wedding &amp; Event DJ Services</p>",
    "</div>",
    "<div style='background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px'>",
    "  <p style='font-size:16px;color:#0a1128;margin:0 0 8px'>Hi " + esc(d.clientName) + ",</p>",
    "  <p style='font-size:14px;color:#374151;line-height:1.7;margin:0 0 4px'>",
    "    I'm looking forward to connecting with you! Here are the details for our upcoming consultation.",
    "  </p>",
    detailsBlock,
    meetBlock,
    notesBlock,
    "  <p style='font-size:14px;color:#374151;line-height:1.7;margin:24px 0 0'>",
    "    Feel free to reply to this email with any questions beforehand — I'm happy to help.",
    "  </p>",
    "<div style='margin-top:28px;padding-top:20px;border-top:1px solid #f3f4f6'>",
    "  <p style='margin:0;font-size:14px;font-weight:700;color:#0a1128'>Michael Wegter</p>",
    "  <p style='margin:4px 0;font-size:13px;color:#c9a86a;font-weight:600'>For the Record — Wedding &amp; Event DJ</p>",
    "  <p style='margin:4px 0;font-size:12px;color:#9ca3af'>",
    "    <a href='mailto:michael@fortherecordmn.com' style='color:#9ca3af'>michael@fortherecordmn.com</a> &nbsp;·&nbsp; ",
    "    <a href='tel:6123897005' style='color:#9ca3af'>(612) 389-7005</a> &nbsp;·&nbsp; ",
    "    <a href='https://fortherecordmn.com' style='color:#9ca3af'>fortherecordmn.com</a>",
    "  </p>",
    "</div>",
    "</div>",
    "</div>",
  ].join("\n");
}

// ── Confirmation copy to Michael ──────────────────────────────────────────────
function buildConfirmEmail(d) {
  var displayDate = d.eventDate ? formatDisplayDate(d.eventDate) : "";
  return [
    "<div style='font-family:Georgia,serif;max-width:580px;margin:0 auto;color:#1a1a1a'>",
    "<div style='background:#0a1128;padding:24px 32px;border-radius:8px 8px 0 0'>",
    "  <h2 style='margin:0;color:#c9a86a;font-size:20px;letter-spacing:1px'>FOR THE RECORD</h2>",
    "  <p style='margin:4px 0 0;color:rgba(255,255,255,0.75);font-size:13px'>Meet Invite Confirmation</p>",
    "</div>",
    "<div style='background:#fff;padding:32px;border:1px solid #e5e7eb;border-top:none;border-radius:0 0 8px 8px'>",
    "  <h3 style='margin:0 0 16px;color:#0a1128;font-size:16px'>Invite sent successfully ✓</h3>",
    "  <table style='width:100%;border-collapse:collapse;font-size:14px'>",
    trow("Client",  d.clientName),
    trow("Email",   "<a href='mailto:" + esc(d.clientEmail) + "'>" + esc(d.clientEmail) + "</a>"),
    displayDate    ? trow("Date",  displayDate)    : "",
    d.eventTime    ? trow("Time",  d.eventTime)    : "",
    d.meetLink     ? trow("Link",  "<a href='" + esc(d.meetLink) + "'>" + esc(d.meetLink) + "</a>") : "",
    d.notes        ? trow("Note",  d.notes)        : "",
    "  </table>",
    "</div>",
    "</div>",
  ].join("\n");
}

// ── Table row helper ──────────────────────────────────────────────────────────
function trow(label, value) {
  return "<tr style='border-bottom:1px solid #f3f4f6'>"
    + "<td style='padding:10px 0;color:#6b7280;width:80px;vertical-align:top'>" + label + "</td>"
    + "<td style='padding:10px 0;font-weight:500'>" + value + "</td>"
    + "</tr>";
}

// ── HTML escape helper ────────────────────────────────────────────────────────
function esc(str) {
  if (!str) return "";
  return String(str)
    .replace(/&/g,  "&amp;")
    .replace(/</g,  "&lt;")
    .replace(/>/g,  "&gt;")
    .replace(/"/g,  "&quot;");
}
