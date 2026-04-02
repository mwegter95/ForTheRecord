import React, { useState } from "react";
import useSEO from "../hooks/useSEO";
import "./SendPaymentRequest.scss";

// ─── Config — fill these in once ─────────────────────────────────────────────
const VENMO_USERNAME = "fortherecordmn"; // ← your Venmo @handle (no @)
const ZELLE_CONTACT = "mwegter95@gmail.com"; // ← phone or email registered with Zelle
const PAYPAL_CLIENT_ID =
  "ARlbzz6TTIG0HgC8GY4Ci-k2zjUhkRYn6S0_yFdun6WBfLa4XgzmgsMZwCnZGxtHQRGYHOWYWErFQTLq";

// ─── Google Apps Script URL ──────────────────────────────────────────────────
const SEND_PAYMENT_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwJN0Z0n7xPcCAagljKfoUtVtegv_hBtOrmr90b5XpzSTNtpJq0scU7nmG9Lp9CjhTKGA/exec";

// ─── Password gate ────────────────────────────────────────────────────────────
const SEND_PASSWORD = process.env.REACT_APP_COUNTERSIGN_PASSWORD;

// ─── Inline SVG icons ─────────────────────────────────────────────────────────
const IconLock = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const IconCopy = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconCheck = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconMail = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);

// ─── Main component ───────────────────────────────────────────────────────────
const SendPaymentRequest = ({ portalMode = false }) => {
  useSEO({
    title: "Send Payment Request | For the Record",
    description: "DJ portal — send a payment request link to a client.",
    canonical: "https://fortherecordmn.com/send-payment-request",
  });

  const [authed, setAuthed] = useState(portalMode);
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");

  const [form, setForm] = useState({
    clientName: "",
    clientEmail: "",
    amount: "",
    note: "",
  });

  const [generatedLink, setGeneratedLink] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const [emailSending, setEmailSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [emailError, setEmailError] = useState("");

  // ── Auth ─────────────────────────────────────────────────────────────────
  const handleAuth = (e) => {
    e.preventDefault();
    if (pwInput === SEND_PASSWORD) {
      setAuthed(true);
      setPwError("");
    } else {
      setPwError("Incorrect password.");
    }
  };

  // ── Form change ───────────────────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEmailSent(false);
    setEmailError("");
    setForm((prev) => ({ ...prev, [name]: value }));
    setGeneratedLink("");
    setQrUrl("");
    setCopied(false);
  };

  // ── Generate link ─────────────────────────────────────────────────────────
  const generateLink = () => {
    const amt = parseFloat(form.amount);
    if (!form.clientName || !amt || amt <= 0) return;
    const payload = {
      name: form.clientName.trim(),
      amount: amt.toFixed(2),
      note: form.note.trim() || `For the Record – ${form.clientName.trim()}`,
    };
    const encoded = btoa(encodeURIComponent(JSON.stringify(payload)));
    const link = `${window.location.origin}/pay?p=${encoded}`;
    setGeneratedLink(link);
    setCopied(false);
    const qr = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(link)}&color=0a1128&bgcolor=ffffff&margin=1`;
    setQrUrl(qr);
  };

  // ── Copy ──────────────────────────────────────────────────────────────────
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

  // ── Send email via Google Apps Script ─────────────────────────────────────
  const sendEmail = async () => {
    if (!form.clientEmail || !generatedLink) return;

    setEmailSending(true);
    setEmailError("");
    setEmailSent(false);

    try {
      const response = await fetch(SEND_PAYMENT_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          client_email: form.clientEmail,
          client_name: form.clientName,
          amount: parseFloat(form.amount),
          note: form.note,
          payment_url: generatedLink,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setEmailSent(true);
        setTimeout(() => setEmailSent(false), 5000);
      } else {
        throw new Error(result.error || "Failed to send email");
      }
    } catch (err) {
      console.error("Email send error:", err);
      setEmailError(err.message || "Failed to send email. Please try again.");
    } finally {
      setEmailSending(false);
    }
  };

  // ─── Password gate UI ─────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="spr-page">
        <div className="spr-auth-card">
          <div className="spr-auth-icon">
            <IconLock />
          </div>
          <h1>Payment Request Portal</h1>
          <p>Enter your access code to continue.</p>
          <form onSubmit={handleAuth}>
            <input
              type="password"
              className="spr-input"
              placeholder="Access code"
              value={pwInput}
              onChange={(e) => setPwInput(e.target.value)}
              autoFocus
            />
            {pwError && <p className="spr-pw-error">{pwError}</p>}
            <button type="submit" className="spr-btn-primary">
              Unlock
            </button>
          </form>
        </div>
      </div>
    );
  }

  const amt = parseFloat(form.amount) || 0;

  // ─── Main UI ──────────────────────────────────────────────────────────────
  return (
    <div className="spr-page">
      <div className="spr-header">
        <h1>Send Payment Request</h1>
        <p>Fill in the details and send your client a secure payment link.</p>
      </div>

      <div className="spr-layout">
        {/* ── Form ────────────────────────────────────────────────────────── */}
        <div className="spr-form-card">
          <div className="spr-form-group">
            <label>Client Name</label>
            <input
              type="text"
              name="clientName"
              className="spr-input"
              placeholder="Emily & Jake Johnson"
              value={form.clientName}
              onChange={handleChange}
            />
          </div>

          <div className="spr-form-group">
            <label>
              Client Email <span className="spr-optional">(for mailto)</span>
            </label>
            <input
              type="email"
              name="clientEmail"
              className="spr-input"
              placeholder="client@email.com"
              value={form.clientEmail}
              onChange={handleChange}
            />
          </div>

          <div className="spr-form-group">
            <label>
              Amount{" "}
              <span className="spr-optional">(base, before any fees)</span>
            </label>
            <div className="spr-amount-wrap">
              <span className="spr-dollar">$</span>
              <input
                type="number"
                name="amount"
                className="spr-input spr-amount-input"
                placeholder="500.00"
                min="1"
                step="0.01"
                value={form.amount}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="spr-form-group">
            <label>Note / Memo</label>
            <input
              type="text"
              name="note"
              className="spr-input"
              placeholder="Wedding Deposit – Johnson 6/14/26"
              value={form.note}
              onChange={handleChange}
            />
          </div>

          {/* Fee preview */}
          {amt > 0 && (
            <div className="spr-fee-preview">
              <div className="spr-fee-row">
                <span>Zelle (no fee)</span>
                <strong>${amt.toFixed(2)}</strong>
              </div>
              <div className="spr-fee-row">
                <span>Venmo (+2%)</span>
                <strong>${(amt * 1.02).toFixed(2)}</strong>
              </div>
              <div className="spr-fee-row">
                <span>Credit Card (+3%)</span>
                <strong>${(amt * 1.03).toFixed(2)}</strong>
              </div>
            </div>
          )}

          <button
            className="spr-btn-primary spr-generate-btn"
            onClick={generateLink}
            disabled={!form.clientName || !form.amount}
          >
            Generate Payment Link
          </button>
        </div>

        {/* ── Output ──────────────────────────────────────────────────────── */}
        {generatedLink && (
          <div className="spr-output-card">
            <h3>Your Payment Link</h3>

            <div className="spr-link-box">
              <span className="spr-link-text">{generatedLink}</span>
            </div>

            <div className="spr-actions">
              <button className="spr-btn-secondary" onClick={copyLink}>
                {copied ? (
                  <>
                    <IconCheck /> Copied!
                  </>
                ) : (
                  <>
                    <IconCopy /> Copy Link
                  </>
                )}
              </button>
              <button
                className={`spr-btn-secondary ${emailSent ? "spr-btn-success" : ""}`}
                onClick={sendEmail}
                disabled={
                  !form.clientEmail ||
                  emailSending ||
                  SEND_PAYMENT_SCRIPT_URL ===
                    "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE"
                }
                title={
                  !form.clientEmail
                    ? "Add client email to send"
                    : SEND_PAYMENT_SCRIPT_URL ===
                        "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE"
                      ? "Configure Google Apps Script URL first"
                      : ""
                }
              >
                {emailSending ? (
                  <>⏳ Sending...</>
                ) : emailSent ? (
                  <>
                    <IconCheck /> Email Sent!
                  </>
                ) : (
                  <>
                    <IconMail /> Send Email
                  </>
                )}
              </button>
            </div>

            {emailError && (
              <div className="spr-email-error">⚠ {emailError}</div>
            )}

            {qrUrl && (
              <div className="spr-qr">
                <p className="spr-qr-label">QR Code</p>
                <img
                  src={qrUrl}
                  alt="Payment link QR code"
                  width="220"
                  height="220"
                />
              </div>
            )}

            <div className="spr-config-note">
              <strong>Config check:</strong> Venmo @{VENMO_USERNAME} · Zelle{" "}
              {ZELLE_CONTACT}
              {PAYPAL_CLIENT_ID === "YOUR_PAYPAL_CLIENT_ID_HERE" && (
                <span className="spr-warning">
                  {" "}
                  · ⚠ PayPal Client ID not set
                </span>
              )}
              {SEND_PAYMENT_SCRIPT_URL ===
                "YOUR_GOOGLE_SCRIPT_WEB_APP_URL_HERE" && (
                <span className="spr-warning">
                  {" "}
                  · ⚠ Email script URL not set
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SendPaymentRequest;
