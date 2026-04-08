import React, { useState } from "react";
import useSEO from "../hooks/useSEO";
import "./SendMeetInvite.scss";

// ─── Apps Script URL — deploy SendMeetInviteScript.gs and paste here ──────────
const SEND_MEET_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbx8z4D8MzgCkQd8P4XU7LBL0k5d5aFgW1EPLQvGbJEwLHZrIOoFUrw2Z-qPikmfkLe4/exec"; // ← paste your deployed web app URL here

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
const IconVideo = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
  </svg>
);
const IconLink = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
);
const IconClock = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

// ─── Timezone options (label shown to user, iana sent to script) ──────────────
const TIMEZONES = [
  { label: "CST — Central Standard",   iana: "America/Chicago"      },
  { label: "CDT — Central Daylight",   iana: "America/Chicago"      },
  { label: "EST — Eastern Standard",   iana: "America/New_York"     },
  { label: "EDT — Eastern Daylight",   iana: "America/New_York"     },
  { label: "MST — Mountain Standard",  iana: "America/Denver"       },
  { label: "MDT — Mountain Daylight",  iana: "America/Denver"       },
  { label: "PST — Pacific Standard",   iana: "America/Los_Angeles"  },
  { label: "PDT — Pacific Daylight",   iana: "America/Los_Angeles"  },
];

// ─── Format date helper ───────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-US", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
}

// ─── Format time helper ───────────────────────────────────────────────────────
function formatTime(timeStr) {
  if (!timeStr) return "";
  const [h, m] = timeStr.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour   = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
}

// ─── Main component ───────────────────────────────────────────────────────────
const SendMeetInvite = () => {
  useSEO({
    title: "Send Meet Invite | For the Record",
    description: "DJ portal — send a branded Google Meet invite to a client.",
    canonical: "https://fortherecordmn.com/portal/meet-invite",
  });

  // ── Mode: "link" (paste meet URL) or "time" (enter date/time) ────────────
  const [mode, setMode] = useState("link");

  // ── Form state ────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    clientName:  "",
    clientEmail: "",
    meetLink:    "",
    eventDate:   "",
    startTime:   "",
    endTime:     "",
    timezone:    TIMEZONES[0].iana,  // "America/Chicago"
    timezoneLabel: TIMEZONES[0].label.split(" — ")[0], // "CST"
    notes:       "",
  });

  // ── Send state ────────────────────────────────────────────────────────────
  const [sendStatus, setSendStatus] = useState("idle"); // idle | sending | sent | error
  const [sendError,  setSendError]  = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "timezone") {
      // Store both IANA tz and short display label
      const tz = TIMEZONES.find((t) => t.iana === value) || TIMEZONES[0];
      setForm((prev) => ({
        ...prev,
        timezone: value,
        timezoneLabel: tz.label.split(" — ")[0],
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    setSendStatus("idle");
    setSendError("");
  };

  // ── Derived display strings ───────────────────────────────────────────────
  const displayDate = formatDate(form.eventDate);
  const displayTime = (() => {
    if (!form.startTime) return "";
    const start = formatTime(form.startTime);
    const end   = form.endTime ? formatTime(form.endTime) : "";
    return end
      ? `${start} – ${end} ${form.timezoneLabel}`
      : `${start} ${form.timezoneLabel}`;
  })();

  // ── Validation ────────────────────────────────────────────────────────────
  const isValid = (() => {
    if (!form.clientEmail) return false;
    if (mode === "link" && !form.meetLink) return false;
    if (mode === "time" && !form.eventDate && !form.startTime) return false;
    return true;
  })();

  // ── Send ──────────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!isValid) return;
    setSendStatus("sending");
    setSendError("");

    const payload = {
      client_email:   form.clientEmail,
      client_name:    form.clientName || "there",
      meet_link:      mode === "link" ? form.meetLink : "",
      // raw fields for Calendar event creation (time mode)
      event_date:     mode === "time" ? form.eventDate  : "",
      start_time:     mode === "time" ? form.startTime  : "",
      end_time:       mode === "time" ? form.endTime    : "",
      iana_timezone:  mode === "time" ? form.timezone   : "",
      // human-readable time string for the email body
      event_time:     mode === "time" ? displayTime     : "",
      notes:          form.notes,
    };

    if (!SEND_MEET_SCRIPT_URL) {
      setSendError("Script URL not set — deploy SendMeetInviteScript.gs and paste the URL at the top of this file.");
      setSendStatus("error");
      return;
    }

    try {
      const resp = await fetch(SEND_MEET_SCRIPT_URL, {
        method: "POST",
        body:   JSON.stringify(payload),
      });

      let result;
      try {
        result = await resp.json();
      } catch (_) {
        throw new Error("Unexpected response from script — check that the deployment URL is correct.");
      }

      if (!result.success) {
        throw new Error(result.error || "Script returned an error.");
      }

      setSendStatus("sent");
    } catch (err) {
      console.error("Send Meet invite failed:", err);
      setSendError(err.message || "Couldn't send — check the script URL or try again.");
      setSendStatus("error");
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="mi-page">
      <div className="mi-card">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div className="mi-header">
          <img src="/images/favicon-192.png" alt="For the Record" className="mi-header__logo" />
          <h1>Send a Meet Invite</h1>
          <p className="mi-header__sub">
            Send a beautiful branded Google Meet invitation to your client from michael@fortherecordmn.com.
          </p>
        </div>

        {/* ── Mode toggle ─────────────────────────────────────────────────── */}
        <div className="mi-section">
          <h2 className="mi-section__title">Meeting Setup</h2>
          <div className="mi-mode-toggle">
            <button
              type="button"
              className={`mi-mode-btn${mode === "link" ? " active" : ""}`}
              onClick={() => { setMode("link"); setSendStatus("idle"); }}
            >
              <IconLink /> Paste a Meet Link
            </button>
            <button
              type="button"
              className={`mi-mode-btn${mode === "time" ? " active" : ""}`}
              onClick={() => { setMode("time"); setSendStatus("idle"); }}
            >
              <IconClock /> Enter Date &amp; Time
            </button>
          </div>

          {/* Link mode */}
          {mode === "link" && (
            <div className="mi-field mi-field--full mi-field--mt">
              <label>Google Meet Link <span className="req">*</span></label>
              <input
                type="url"
                name="meetLink"
                value={form.meetLink}
                onChange={handleChange}
                placeholder="https://meet.google.com/xxx-xxxx-xxx"
                autoComplete="off"
              />
              <p className="mi-field-note">
                Create the event in Google Calendar first, then paste the Meet link here.
              </p>
            </div>
          )}

          {mode === "time" && (
            <p className="mi-field-note mi-field-note--info">
              The script will create a real event on your Google Calendar and auto-generate the Meet link, then send it to your client.
            </p>
          )}

          {/* Time mode */}
          {mode === "time" && (
            <div className="mi-grid mi-grid--mt">
              <div className="mi-field mi-field--full">
                <label>Event Date</label>
                <input
                  type="date"
                  name="eventDate"
                  value={form.eventDate}
                  onChange={handleChange}
                />
              </div>
              <div className="mi-field">
                <label>Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  value={form.startTime}
                  onChange={handleChange}
                />
              </div>
              <div className="mi-field">
                <label>End Time <span className="mi-optional">(optional)</span></label>
                <input
                  type="time"
                  name="endTime"
                  value={form.endTime}
                  onChange={handleChange}
                />
              </div>
              <div className="mi-field">
                <label>Timezone</label>
                <select name="timezone" value={form.timezone} onChange={handleChange}>
                  {TIMEZONES.map((tz) => (
                    <option key={tz.label} value={tz.iana}>{tz.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* ── Recipient ───────────────────────────────────────────────────── */}
        <div className="mi-section">
          <h2 className="mi-section__title">Recipient</h2>
          <div className="mi-grid">
            <div className="mi-field">
              <label>Client Name <span className="mi-optional">(optional)</span></label>
              <input
                type="text"
                name="clientName"
                value={form.clientName}
                onChange={handleChange}
                placeholder="Sarah &amp; Jake"
              />
            </div>
            <div className="mi-field">
              <label>Client Email <span className="req">*</span></label>
              <input
                type="email"
                name="clientEmail"
                value={form.clientEmail}
                onChange={handleChange}
                placeholder="client@example.com"
              />
            </div>
          </div>
        </div>

        {/* ── Personal note ────────────────────────────────────────────────── */}
        <div className="mi-section">
          <h2 className="mi-section__title">
            Personal Note <span className="mi-optional">— optional</span>
          </h2>
          <div className="mi-field mi-field--full">
            <textarea
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder={'Add a personal message... e.g. "Feel free to jot down any song ideas beforehand - I\'d love to hear them!"'}
              rows={3}
            />
          </div>
        </div>

        {/* ── Email preview ─────────────────────────────────────────────────── */}
        {(form.clientEmail || (mode === "link" ? form.meetLink : (form.eventDate || form.startTime))) && (
          <div className="mi-section mi-section--preview">
            <h2 className="mi-section__title">Preview</h2>
            <div className="mi-preview">
              <div className="mi-preview__header">
                <span className="mi-preview__label">To</span>
                <span>{form.clientEmail || "—"}</span>
              </div>
              <div className="mi-preview__header mi-preview__header--sub">
                <span className="mi-preview__label">Subject</span>
                <span>Your Consultation with For the Record{displayDate ? ` — ${displayDate}` : ""}</span>
              </div>
              <div className="mi-preview__body">
                <p>Hi {form.clientName || "there"},</p>
                <p>I'm looking forward to connecting with you! Here are the details for our upcoming consultation.</p>

                {(mode === "time" && (displayDate || displayTime)) && (
                  <div className="mi-preview__details">
                    {displayDate && (
                      <div className="mi-preview__detail-row">
                        <span className="mi-preview__emoji">📅</span>
                        <div>
                          <p className="mi-preview__detail-label">Date</p>
                          <p className="mi-preview__detail-val">{displayDate}</p>
                        </div>
                      </div>
                    )}
                    {displayTime && (
                      <div className="mi-preview__detail-row">
                        <span className="mi-preview__emoji">🕐</span>
                        <div>
                          <p className="mi-preview__detail-label">Time</p>
                          <p className="mi-preview__detail-val">{displayTime}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {mode === "link" && form.meetLink && (
                  <div className="mi-preview__meet-btn">
                    <span>Join the Meeting</span>
                  </div>
                )}

                {form.notes && (
                  <div className="mi-preview__note">
                    <p className="mi-preview__note-label">A note from Michael</p>
                    <p>{form.notes}</p>
                  </div>
                )}

                <p>Feel free to reply to this email with any questions beforehand — I'm happy to help.</p>
                <div className="mi-preview__sig">
                  <strong>Michael Wegter</strong>
                  <span>For the Record — Wedding &amp; Event DJ</span>
                  <span>michael@fortherecordmn.com · (612) 389-7005</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Send area ─────────────────────────────────────────────────────── */}
        <div className="mi-send-area">
          <button
            type="button"
            className={`mi-btn mi-btn--send${sendStatus === "sent" ? " mi-btn--sent" : ""}`}
            onClick={handleSend}
            disabled={!isValid || sendStatus === "sending" || sendStatus === "sent"}
          >
            {sendStatus === "sending" ? (
              "Sending…"
            ) : sendStatus === "sent" ? (
              <><IconCheck /> Invite Sent to {form.clientEmail}</>
            ) : (
              <><IconMail /> Send Invite to {form.clientEmail || "Client"}</>
            )}
          </button>

          {!SEND_MEET_SCRIPT_URL && sendStatus !== "sent" && (
            <p className="mi-send-area__warning">
              ⚠️ Script URL not set — deploy <code>SendMeetInviteScript.gs</code> and paste the URL into <code>SendMeetInvite.js</code>.
            </p>
          )}

          {sendStatus === "error" && (
            <p className="mi-send-area__error">{sendError}</p>
          )}
        </div>

      </div>
    </div>
  );
};

export default SendMeetInvite;
