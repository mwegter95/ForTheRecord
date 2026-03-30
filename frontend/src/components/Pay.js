import React, { useState, useEffect, useRef } from "react";
import useSEO from "../hooks/useSEO";
import "./Pay.scss";

// ─── Config ── keep in sync with SendPaymentRequest.js ───────────────────────
const VENMO_USERNAME  = "fortherecordmn";
const ZELLE_CONTACT   = "mwegter95@gmail.com";
const PAYPAL_CLIENT_ID = "ARlbzz6TTIG0HgC8GY4Ci-k2zjUhkRYn6S0_yFdun6WBfLa4XgzmgsMZwCnZGxtHQRGYHOWYWErFQTLq";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) =>
  Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" });

const decodePayload = () => {
  try {
    const params  = new URLSearchParams(window.location.search);
    const encoded = params.get("p");
    if (!encoded) return null;
    return JSON.parse(decodeURIComponent(atob(encoded)));
  } catch (_) {
    return null;
  }
};

// ─── Main component ───────────────────────────────────────────────────────────
const Pay = () => {
  const payload = decodePayload();
  const name    = payload?.name   || "";
  const base    = parseFloat(payload?.amount) || 0;
  const note    = payload?.note   || "For the Record";

  const venmoFee = (base * 0.02).toFixed(2);
  const venmoAmt = (base * 1.02).toFixed(2);
  const cardFee  = (base * 0.03).toFixed(2);
  const cardAmt  = (base * 1.03).toFixed(2);

  const [activeSection, setActiveSection] = useState(null);
  const [zelleCopied,   setZelleCopied]   = useState(false);
  const [paypalLoaded,  setPaypalLoaded]  = useState(false);
  const [paypalError,   setPaypalError]   = useState("");
  const [paypalSuccess, setPaypalSuccess] = useState(false);
  const paypalContainerRef = useRef(null);
  const paypalRendered     = useRef(false);

  useSEO({
    title: "Payment | For the Record MN DJ",
    description: "Secure payment for For the Record DJ services.",
    canonical: "https://fortherecordmn.com/pay",
  });

  // ── Load PayPal SDK when card section is opened ───────────────────────────
  useEffect(() => {
    if (activeSection !== "card" || paypalLoaded || PAYPAL_CLIENT_ID === "YOUR_PAYPAL_CLIENT_ID_HERE") return;

    const script    = document.createElement("script");
    script.src      = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&components=buttons&disable-funding=venmo,paylater,credit&vault=false`;
    script.async    = true;
    script.onload   = () => setPaypalLoaded(true);
    script.onerror  = () => setPaypalError("Could not load payment processor. Please try another option.");
    document.body.appendChild(script);

    return () => {
      // leave script in DOM for subsequent renders
    };
  }, [activeSection, paypalLoaded]);

  // ── Render PayPal card button once SDK is ready ───────────────────────────
  useEffect(() => {
    if (!paypalLoaded || paypalRendered.current || !paypalContainerRef.current) return;
    if (!window.paypal) return;

    paypalRendered.current = true;

    const orderConfig = {
      createOrder: (data, actions) =>
        actions.order.create({
          purchase_units: [{ amount: { value: cardAmt }, description: note }],
          application_context: { shipping_preference: "NO_SHIPPING" },
        }),
      onApprove: (data, actions) =>
        actions.order.capture().then(() => setPaypalSuccess(true)),
      onError: (err) => {
        console.error("PayPal error:", err);
        setPaypalError("Payment failed. Please try again or choose another method.");
      },
    };

    // Credit / debit card
    window.paypal.Buttons({
      ...orderConfig,
      fundingSource: window.paypal.FUNDING.CARD,
      style: { shape: "rect", color: "black", label: "pay", height: 48 },
    }).render(paypalContainerRef.current);

    // Apple Pay / Google Pay — only render if eligible (requires PPCP Advanced onboarding)
    [window.paypal.FUNDING.APPLEPAY, window.paypal.FUNDING.GOOGLEPAY].forEach((source) => {
      if (!source) return;
      const btn = window.paypal.Buttons({ ...orderConfig, fundingSource: source, style: { height: 48 } });
      if (btn.isEligible()) btn.render(paypalContainerRef.current);
    });
  }, [paypalLoaded, cardAmt, note]);

  // ── Venmo deep link ───────────────────────────────────────────────────────
  const venmoHref = `venmo://paycharge?txn=pay&recipients=${VENMO_USERNAME}&amount=${venmoAmt}&note=${encodeURIComponent(note)}`;
  const venmoWeb  = `https://venmo.com/u/${VENMO_USERNAME}`;

  // ── Copy Zelle contact ────────────────────────────────────────────────────
  const copyZelle = async () => {
    try {
      await navigator.clipboard.writeText(ZELLE_CONTACT);
    } catch (_) {
      const el = document.createElement("textarea");
      el.value = ZELLE_CONTACT;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setZelleCopied(true);
    setTimeout(() => setZelleCopied(false), 2500);
  };

  const toggle = (section) =>
    setActiveSection((prev) => (prev === section ? null : section));

  // ── Invalid / missing link ────────────────────────────────────────────────
  if (!payload || base <= 0) {
    return (
      <div className="pay-page pay-invalid">
        <div className="pay-invalid-card">
          <div className="pay-invalid-icon">🔗</div>
          <h1>Payment Link Not Found</h1>
          <p>This link appears to be invalid or incomplete. Please check with For the Record for a valid payment link.</p>
          <a href="mailto:michael@fortherecordmn.com" className="pay-btn-outline">
            Contact Us
          </a>
        </div>
      </div>
    );
  }

  // ── Main ──────────────────────────────────────────────────────────────────
  return (
    <div className="pay-page">
      {/* Header */}
      <div className="pay-header">
        <div className="pay-brand">For the Record</div>
        <h1 className="pay-title">Secure Payment</h1>
        {name && <p className="pay-client">For {name}</p>}
        <div className="pay-amount-badge">{fmt(base)}</div>
        {note && <p className="pay-note">{note}</p>}
      </div>

      {/* Options */}
      <div className="pay-options">

        {/* ── 1. Zelle ──────────────────────────────────────────────────── */}
        <div className={`pay-option-card ${activeSection === "zelle" ? "open" : ""}`}>
          <button className="pay-option-header" onClick={() => toggle("zelle")}>
            <div className="pay-option-left">
              <span className="pay-option-rank">1</span>
              <div>
                <span className="pay-option-name">Zelle</span>
                <span className="pay-option-tag no-fee">No fee</span>
              </div>
            </div>
            <div className="pay-option-right">
              <span className="pay-option-amount">{fmt(base)}</span>
              <span className="pay-chevron">{activeSection === "zelle" ? "▲" : "▼"}</span>
            </div>
          </button>

          {activeSection === "zelle" && (
            <div className="pay-option-body">
              <p className="pay-instructions">
                Open your bank's app and send via Zelle to:
              </p>
              <div className="pay-zelle-contact">
                <span>{ZELLE_CONTACT}</span>
                <button className="pay-copy-btn" onClick={copyZelle}>
                  {zelleCopied ? "✓ Copied" : "Copy"}
                </button>
              </div>
              <div className="pay-zelle-details">
                <div className="pay-detail-row">
                  <span>Amount:</span>
                  <strong>{fmt(base)}</strong>
                </div>
                <div className="pay-detail-row">
                  <span>Memo:</span>
                  <strong>{note}</strong>
                </div>
              </div>
              <a
                href="zelle://"
                className="pay-btn-primary"
                rel="noopener noreferrer"
              >
                Open Zelle App
              </a>
              <p className="pay-sub-note">
                Most major banks support Zelle — look for it in your bank's mobile app under "Send Money."
              </p>
            </div>
          )}
        </div>

        {/* ── 2. Venmo ──────────────────────────────────────────────────── */}
        <div className={`pay-option-card ${activeSection === "venmo" ? "open" : ""}`}>
          <button className="pay-option-header" onClick={() => toggle("venmo")}>
            <div className="pay-option-left">
              <span className="pay-option-rank">2</span>
              <div>
                <span className="pay-option-name">Venmo</span>
                <span className="pay-option-tag small-fee">2% fee</span>
              </div>
            </div>
            <div className="pay-option-right">
              <span className="pay-option-amount">{fmt(venmoAmt)}</span>
              <span className="pay-chevron">{activeSection === "venmo" ? "▲" : "▼"}</span>
            </div>
          </button>

          {activeSection === "venmo" && (
            <div className="pay-option-body">
              <p className="pay-instructions">
                Tap below to open Venmo — the amount and memo will be pre-filled.
              </p>
              <div className="pay-zelle-details">
                <div className="pay-detail-row">
                  <span>To:</span>
                  <strong>@{VENMO_USERNAME}</strong>
                </div>
                <div className="pay-detail-row">
                  <span>Base amount:</span>
                  <strong>{fmt(base)}</strong>
                </div>
                <div className="pay-detail-row">
                  <span>Service fee (2%):</span>
                  <strong>{fmt(venmoFee)}</strong>
                </div>
                <div className="pay-detail-row" style={{ borderTop: '1px solid rgba(10, 17, 40, 0.1)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                  <span><strong>Total:</strong></span>
                  <strong>{fmt(venmoAmt)}</strong>
                </div>
                <div className="pay-detail-row">
                  <span>Memo:</span>
                  <strong>{note}</strong>
                </div>
              </div>
              <a
                href={venmoHref}
                className="pay-btn-venmo"
                rel="noopener noreferrer"
              >
                Pay with Venmo
              </a>
              <p className="pay-sub-note">
                Don't have the app?{" "}
                <a href={venmoWeb} target="_blank" rel="noopener noreferrer">
                  Pay on Venmo.com
                </a>
              </p>
            </div>
          )}
        </div>

        {/* ── 3. Credit Card ────────────────────────────────────────────── */}
        <div className={`pay-option-card ${activeSection === "card" ? "open" : ""}`}>
          <button className="pay-option-header" onClick={() => toggle("card")}>
            <div className="pay-option-left">
              <span className="pay-option-rank">3</span>
              <div>
                <span className="pay-option-name">Credit or Debit Card</span>
                <span className="pay-option-tag card-fee">3% fee</span>
              </div>
            </div>
            <div className="pay-option-right">
              <span className="pay-option-amount">{fmt(cardAmt)}</span>
              <span className="pay-chevron">{activeSection === "card" ? "▲" : "▼"}</span>
            </div>
          </button>

          {activeSection === "card" && (
            <div className="pay-option-body">
              {paypalSuccess ? (
                <div className="pay-success">
                  <div className="pay-success-icon">✓</div>
                  <h3>Payment Received!</h3>
                  <p>Thank you! We'll be in touch shortly to confirm your booking.</p>
                </div>
              ) : (
                <>
                  <div className="pay-zelle-details" style={{ marginBottom: "1.25rem" }}>
                    <div className="pay-detail-row">
                      <span>Base amount:</span>
                      <strong>{fmt(base)}</strong>
                    </div>
                    <div className="pay-detail-row">
                      <span>Processing fee (3%):</span>
                      <strong>{fmt(cardFee)}</strong>
                    </div>
                    <div className="pay-detail-row" style={{ borderTop: '1px solid rgba(10, 17, 40, 0.1)', paddingTop: '0.5rem', marginTop: '0.5rem' }}>
                      <span><strong>Total:</strong></span>
                      <strong>{fmt(cardAmt)}</strong>
                    </div>
                    <div className="pay-detail-row">
                      <span>Memo:</span>
                      <strong>{note}</strong>
                    </div>
                  </div>

                  {PAYPAL_CLIENT_ID === "YOUR_PAYPAL_CLIENT_ID_HERE" ? (
                    <div className="pay-config-warning">
                      ⚠ Card payments not yet configured. Please use Zelle or Venmo.
                    </div>
                  ) : paypalError ? (
                    <div className="pay-config-warning">{paypalError}</div>
                  ) : (
                    <>
                      {!paypalLoaded && (
                        <div className="pay-loading">Loading payment form…</div>
                      )}
                      <div ref={paypalContainerRef} className="pay-paypal-container" />
                    </>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="pay-footer">
        <p>Questions? <a href="mailto:michael@fortherecordmn.com">michael@fortherecordmn.com</a> · <a href="tel:+16123897005">(612) 389-7005</a></p>
      </div>
    </div>
  );
};

export default Pay;
