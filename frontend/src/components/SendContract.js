import React, { useState, useCallback } from "react";
import useSEO from "../hooks/useSEO";
import { RATES, calcSubtotal } from "./Contract";
import "./SendContract.scss";

// ─── Apps Script URL — deploy SendContractScript.gs and paste here ───────────
const SEND_CONTRACT_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwX-CRXmcdxuKF8IpGofqYtXewPTpSmtMehmFDtkuNZlyovTWh9Dr_ICepz7-qYds3Xfw/exec"; // ← fill in after deploying

// ─── Password gate ────────────────────────────────────────────
const SEND_PASSWORD = process.env.REACT_APP_COUNTERSIGN_PASSWORD;

// ─── Inline SVG icons ────────────────────────────────────────
const IconLock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconLink = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);
const IconCopy = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconMail = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const IconCheck = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconQR = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
    <rect x="3" y="14" width="7" height="7"/>
    <path d="M14 14h.01M14 18h.01M18 14h.01M18 18h.01M18 22h.01M22 14h.01M22 18h.01M22 22h.01"/>
  </svg>
);

// ─── Main component ───────────────────────────────────────────
const SendContract = ({ portalMode = false }) => {
  useSEO({
    title: "Send Contract | For the Record",
    description: "DJ portal — generate a pre-filled contract link for clients.",
    canonical: "https://fortherecordmn.com/send-contract",
  });

  // ── Auth state ────────────────────────────────────────────
  const [authed,  setAuthed]  = useState(portalMode);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");

  // ── Form state ────────────────────────────────────────────
  const [form, setForm] = useState({
    clientEmail:     "",
    eventDate:       "",
    startTime:       "",
    endTime:         "",
    guestCount:      "",
    setupTeardown:   true,
    receptionHours:  "",
    cocktailHours:   "",
    dinnerHours:     "",
    ceremonyHours:   "",
    ceremonyMic:     false,
    dancefloor:      false,
    uplighting:      "none",
    mileageMiles:    "",
    discountPercent: "",
    discountDollar:  "",
    specialNotes:    "",
  });

  // ── Result / send state ───────────────────────────────────
  const [generatedLink, setGeneratedLink] = useState("");
  const [qrUrl,         setQrUrl]         = useState("");
  const [copied,        setCopied]        = useState(false);
  const [sendStatus,    setSendStatus]    = useState("idle"); // idle | sending | sent | error
  const [sendError,     setSendError]     = useState("");

  // ── Auth handler ──────────────────────────────────────────
  const handleAuth = (e) => {
    e.preventDefault();
    if (pwInput === SEND_PASSWORD) {
      setAuthed(true);
      setPwError("");
    } else {
      setPwError("Incorrect password.");
    }
  };

  // ── handleChange ─────────────────────────────────────────
  const handleChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    const v = type === "checkbox" ? checked : value;

    setForm((prev) => {
      const updated = { ...prev, [name]: v };
      const sub   = calcSubtotal(updated);
      const discP = parseFloat(name === "discountPercent" ? v : updated.discountPercent) || 0;
      const discD = parseFloat(name === "discountDollar"  ? v : updated.discountDollar)  || 0;

      if (name === "discountPercent") {
        updated.discountDollar = sub > 0 && discP > 0 ? (sub * discP / 100).toFixed(2) : "";
      }
      if (name === "discountDollar") {
        updated.discountPercent = sub > 0 && discD > 0 ? ((discD / sub) * 100).toFixed(1) : "";
      }
      const svcFields = ["setupTeardown","receptionHours","cocktailHours","dinnerHours","ceremonyHours","ceremonyMic","dancefloor","uplighting","mileageMiles"];
      if (svcFields.includes(name) && parseFloat(updated.discountPercent) > 0) {
        const newSub = calcSubtotal(updated);
        updated.discountDollar = newSub > 0
          ? (newSub * parseFloat(updated.discountPercent) / 100).toFixed(2)
          : "";
      }
      return updated;
    });

    // Reset output when form changes
    setGeneratedLink("");
    setQrUrl("");
    setCopied(false);
    setSendStatus("idle");
  }, []);

  // ── Derived totals ────────────────────────────────────────
  const sub      = calcSubtotal(form);
  const discD    = parseFloat(form.discountDollar) || 0;
  const adjusted = Math.max(0, sub - discD);
  const deposit  = (adjusted / 2).toFixed(2);
  const balance  = Math.max(0, adjusted - adjusted / 2).toFixed(2);

  // ── Format helpers ────────────────────────────────────────
  const fmtEventDate = () => {
    if (!form.eventDate) return "";
    return new Date(form.eventDate + "T00:00:00").toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });
  };

  // ── Generate link + QR ────────────────────────────────────
  const generateLink = () => {
    const payload = {
      eventDate:       form.eventDate,
      startTime:       form.startTime,
      endTime:         form.endTime,
      guestCount:      form.guestCount,
      setupTeardown:   form.setupTeardown,
      receptionHours:  form.receptionHours,
      cocktailHours:   form.cocktailHours,
      dinnerHours:     form.dinnerHours,
      ceremonyHours:   form.ceremonyHours,
      ceremonyMic:     form.ceremonyMic,
      dancefloor:      form.dancefloor,
      uplighting:      form.uplighting,
      mileageMiles:    form.mileageMiles,
      discountPercent: form.discountPercent,
      discountDollar:  form.discountDollar,
      specialNotes:    form.specialNotes,
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
    const link    = `${window.location.origin}/contract?pre=${encoded}`;
    setGeneratedLink(link);
    setCopied(false);
    setSendStatus("idle");

    // Generate QR code via qrserver.com
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(link)}&color=0a1128&bgcolor=ffffff&margin=1`;
    setQrUrl(qr);
  };

  // ── Copy to clipboard ─────────────────────────────────────
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generatedLink);
    } catch (_) {
      const el = document.createElement("textarea");
      el.value = generatedLink;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Send email via Apps Script ────────────────────────────
  const sendEmail = async () => {
    if (!form.clientEmail || !generatedLink) return;
    setSendStatus("sending");
    setSendError("");
    try {
      const resp = await fetch(SEND_CONTRACT_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          client_email:  form.clientEmail,
          contract_url:  generatedLink,
          event_date:    fmtEventDate(),
        }),
      });
      if (!resp.ok) throw new Error(`Status ${resp.status}`);
      setSendStatus("sent");
    } catch (err) {
      console.error("Send contract email failed:", err);
      setSendError("Couldn't send — copy the link manually.");
      setSendStatus("error");
    }
  };

  // ─────────────────────────────────────────────────────────
  // PASSWORD GATE
  // ─────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="sc-page sc-page--gate">
        <form className="sc-gate" onSubmit={handleAuth}>
          <div className="sc-gate__logo">
            <img src="/images/favicon-192.png" alt="For the Record" />
          </div>
          <h2>Send Contract</h2>
          <p>DJ portal — enter your password to continue.</p>
          <input
            type="password"
            placeholder="Password"
            value={pwInput}
            onChange={(e) => setPwInput(e.target.value)}
            autoFocus
          />
          {pwError && <p className="sc-gate__error">{pwError}</p>}
          <button type="submit">
            <IconLock /> Continue
          </button>
        </form>
      </div>
    );
  }

  // ─────────────────────────────────────────────────────────
  // MAIN FORM
  // ─────────────────────────────────────────────────────────
  return (
    <div className="sc-page">
      <div className="sc-card">

        {/* Header */}
        <div className="sc-header">
          <img src="/images/favicon-192.png" alt="For the Record" className="sc-header__logo" />
          <h1>Send a Contract</h1>
          <p className="sc-header__sub">Set up the event details and services, generate a personalized link, and send it to your client for signing.</p>
        </div>

        {/* ── Client & Event ──────────────────────────── */}
        <div className="sc-section">
          <h2 className="sc-section__title">Event Details</h2>
          <div className="sc-grid">
            <div className="sc-field sc-field--full">
              <label>Client Email <span className="req">*</span></label>
              <input type="email" name="clientEmail" value={form.clientEmail}
                onChange={handleChange} placeholder="client@example.com" />
            </div>
            <div className="sc-field">
              <label>Event Date</label>
              <input type="date" name="eventDate" value={form.eventDate} onChange={handleChange} />
            </div>
            <div className="sc-field">
              <label>Estimated Guests</label>
              <input type="number" name="guestCount" value={form.guestCount}
                onChange={handleChange} placeholder="150" />
            </div>
            <div className="sc-field">
              <label>Music Start Time</label>
              <input type="time" name="startTime" value={form.startTime} onChange={handleChange} />
            </div>
            <div className="sc-field">
              <label>Music End Time</label>
              <input type="time" name="endTime" value={form.endTime} onChange={handleChange} />
            </div>
          </div>
          <p className="sc-field-note">Venue details are left for the client to fill in.</p>
        </div>

        {/* ── Services ────────────────────────────────── */}
        <div className="sc-section">
          <h2 className="sc-section__title">Services &amp; Pricing</h2>

          <div className="sc-svc-table">
            <div className="sc-svc-header">
              <span className="sc-svc-name">Service</span>
              <span className="sc-svc-rate">Rate</span>
              <span className="sc-svc-qty">Qty</span>
              <span className="sc-svc-amt">Amount</span>
            </div>

            {/* Setup & Teardown */}
            <div className="sc-svc-row">
              <span className="sc-svc-name">Reception Setup &amp; Teardown</span>
              <span className="sc-svc-rate">$200 flat</span>
              <span className="sc-svc-qty">
                <label className="sc-svc-checkbox">
                  <input type="checkbox" name="setupTeardown" checked={form.setupTeardown} onChange={handleChange} />
                  <span>Include</span>
                </label>
              </span>
              <span className="sc-svc-amt">
                {form.setupTeardown ? "$200.00" : <span className="sc-svc-zero">—</span>}
              </span>
            </div>

            {[
              { name: "receptionHours", label: "Reception / Dance DJ", rate: "$100/hr", rateVal: RATES.reception },
              { name: "cocktailHours",  label: "Cocktail Hour Music",  rate: "$75/hr",  rateVal: RATES.cocktail  },
              { name: "dinnerHours",    label: "Dinner Music",         rate: "$75/hr",  rateVal: RATES.dinner    },
              { name: "ceremonyHours",  label: "Ceremony Music",       rate: "$100/hr", rateVal: RATES.ceremony  },
            ].map(({ name, label, rate, rateVal }) => (
              <div className="sc-svc-row" key={name}>
                <span className="sc-svc-name">{label}</span>
                <span className="sc-svc-rate">{rate}</span>
                <span className="sc-svc-qty">
                  <span className="sc-svc-input-wrap">
                    <input type="number" name={name} value={form[name]}
                      onChange={handleChange} min="0" step="0.5" placeholder="0" />
                    <span className="sc-svc-unit">hrs</span>
                  </span>
                </span>
                <span className="sc-svc-amt">
                  {(parseFloat(form[name]) || 0) * rateVal > 0
                    ? `$${((parseFloat(form[name]) || 0) * rateVal).toFixed(2)}`
                    : <span className="sc-svc-zero">—</span>}
                </span>
              </div>
            ))}

            <div className="sc-svc-row">
              <span className="sc-svc-name">Ceremony Mic &amp; Speaker Setup</span>
              <span className="sc-svc-rate">$150 flat</span>
              <span className="sc-svc-qty">
                <label className="sc-svc-checkbox">
                  <input type="checkbox" name="ceremonyMic" checked={form.ceremonyMic} onChange={handleChange} />
                  <span>Include</span>
                </label>
              </span>
              <span className="sc-svc-amt">
                {form.ceremonyMic ? "$150.00" : <span className="sc-svc-zero">—</span>}
              </span>
            </div>

            <div className="sc-svc-row">
              <span className="sc-svc-name">Reception Dancefloor Lighting</span>
              <span className="sc-svc-rate">$175 flat</span>
              <span className="sc-svc-qty">
                <label className="sc-svc-checkbox">
                  <input type="checkbox" name="dancefloor" checked={form.dancefloor} onChange={handleChange} />
                  <span>Include</span>
                </label>
              </span>
              <span className="sc-svc-amt">
                {form.dancefloor ? "$175.00" : <span className="sc-svc-zero">—</span>}
              </span>
            </div>

            <div className="sc-svc-row">
              <span className="sc-svc-name">Ambient Uplighting</span>
              <span className="sc-svc-rate">$275 / $550</span>
              <span className="sc-svc-qty">
                <div className="sc-svc-radio-group">
                  <label><input type="radio" name="uplighting" value="none"
                    checked={form.uplighting === "none"} onChange={handleChange} /> None</label>
                  <label><input type="radio" name="uplighting" value="6"
                    checked={form.uplighting === "6"} onChange={handleChange} /> 6 units ($275)</label>
                  <label><input type="radio" name="uplighting" value="12"
                    checked={form.uplighting === "12"} onChange={handleChange} /> 12 units ($550)</label>
                </div>
              </span>
              <span className="sc-svc-amt">
                {form.uplighting === "6"  ? "$275.00"
                  : form.uplighting === "12" ? "$550.00"
                  : <span className="sc-svc-zero">—</span>}
              </span>
            </div>

            {/* Venue Mileage */}
            <div className="sc-svc-row">
              <span className="sc-svc-name">Venue Mileage (round trip)</span>
              <span className="sc-svc-rate">$0.50/mi</span>
              <span className="sc-svc-qty">
                <span className="sc-svc-input-wrap">
                  <input type="number" name="mileageMiles" value={form.mileageMiles}
                    onChange={handleChange} min="0" step="1" placeholder="0" />
                  <span className="sc-svc-unit">mi</span>
                </span>
              </span>
              <span className="sc-svc-amt">
                {(parseFloat(form.mileageMiles) || 0) * RATES.mileage > 0
                  ? `$${((parseFloat(form.mileageMiles) || 0) * RATES.mileage).toFixed(2)}`
                  : <span className="sc-svc-zero">—</span>}
              </span>
            </div>
          </div>

          {/* Totals */}
          <div className="sc-totals">
            <div className="sc-totals__row">
              <span>Subtotal</span>
              <span>${sub.toFixed(2)}</span>
            </div>
            <div className="sc-totals__discount-inputs">
              <div className="sc-grid" style={{ marginBottom: 0 }}>
                <div className="sc-field">
                  <label>Discount (%)</label>
                  <input type="number" name="discountPercent" value={form.discountPercent}
                    onChange={handleChange} placeholder="0" min="0" max="100" step="0.1" />
                </div>
                <div className="sc-field">
                  <label>Discount ($)</label>
                  <input type="number" name="discountDollar" value={form.discountDollar}
                    onChange={handleChange} placeholder="0.00" min="0" step="0.01" />
                </div>
              </div>
            </div>
            {discD > 0 && (
              <>
                <div className="sc-totals__row sc-totals__row--discount">
                  <span>Discount{form.discountPercent ? ` (${form.discountPercent}%)` : ""}</span>
                  <span>−${discD.toFixed(2)}</span>
                </div>
                <div className="sc-totals__row sc-totals__row--adjusted">
                  <span>Adjusted Total</span>
                  <span>${adjusted.toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="sc-totals__row sc-totals__row--deposit">
              <span>Deposit (50%)</span>
              <span>${deposit}</span>
            </div>
            <div className="sc-totals__row sc-totals__row--balance">
              <span>Balance Due</span>
              <span>${balance}</span>
            </div>
          </div>

          <div className="sc-field sc-field--full" style={{ marginTop: "1rem" }}>
            <label>Additional Notes</label>
            <textarea name="specialNotes" value={form.specialNotes} onChange={handleChange}
              placeholder="Any special agreements, custom requests, or notes for the client..."
              rows={3} />
          </div>
        </div>

        {/* ── Generate + Result ───────────────────────── */}
        <div className="sc-generate-area">
          <button type="button" className="sc-btn sc-btn--primary" onClick={generateLink}>
            <IconLink /> Generate Contract Link
          </button>

          {generatedLink && (
            <div className="sc-result">

              {/* QR Code */}
              <div className="sc-qr">
                {qrUrl && (
                  <img
                    src={qrUrl}
                    alt="QR code for contract link"
                    width={240}
                    height={240}
                  />
                )}
                <div className="sc-qr__caption">
                  <IconQR />
                  <span>Show to client — scan to open &amp; sign</span>
                </div>
              </div>

              {/* Copy link */}
              <div className="sc-result__url-row">
                <input
                  type="text"
                  readOnly
                  value={generatedLink}
                  onClick={(e) => e.target.select()}
                />
                <button type="button" className="sc-btn sc-btn--outline" onClick={copyLink}>
                  {copied ? <><IconCheck /> Copied</> : <><IconCopy /> Copy Link</>}
                </button>
              </div>

              {/* Send email */}
              {form.clientEmail && (
                <div className="sc-result__send">
                  <button
                    type="button"
                    className={`sc-btn sc-btn--send${sendStatus === "sent" ? " sc-btn--sent" : ""}`}
                    onClick={sendEmail}
                    disabled={sendStatus === "sending" || sendStatus === "sent"}
                  >
                    {sendStatus === "sending" ? "Sending…"
                      : sendStatus === "sent"    ? <><IconCheck /> Email Sent to {form.clientEmail}</>
                      : <><IconMail /> Email Contract to {form.clientEmail}</>}
                  </button>
                  {sendStatus === "error" && (
                    <p className="sc-result__send-error">{sendError}</p>
                  )}
                </div>
              )}

            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default SendContract;
