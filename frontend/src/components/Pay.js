import React, { useState, useEffect, useRef } from "react";
import useSEO from "../hooks/useSEO";
import "./Pay.scss";
import ccVisa from "../images/cc-visa.svg";
import ccMastercard from "../images/cc-mastercard.svg";
import ccAmex from "../images/cc-amex.svg";
import ccDiscover from "../images/cc-discover.svg";
import ccPaypal from "../images/cc-paypal.svg";

// ─── Config ── keep in sync with SendPaymentRequest.js ───────────────────────
const VENMO_USERNAME = "fortherecordmn";
const ZELLE_CONTACT = "mwegter95@gmail.com";
const PAYPAL_CLIENT_ID =
  "ARlbzz6TTIG0HgC8GY4Ci-k2zjUhkRYn6S0_yFdun6WBfLa4XgzmgsMZwCnZGxtHQRGYHOWYWErFQTLq";

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) =>
  Number(n).toLocaleString("en-US", { style: "currency", currency: "USD" });

const decodePayload = () => {
  try {
    const params = new URLSearchParams(window.location.search);
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
  const name = payload?.name || "";
  const base = parseFloat(payload?.amount) || 0;
  const note = payload?.note || "For the Record";

  const venmoFee = (base * 0.02).toFixed(2);
  const venmoAmt = (base * 1.02).toFixed(2);
  const cardFee = (base * 0.03).toFixed(2);
  const cardAmt = (base * 1.03).toFixed(2);

  const [activeSection, setActiveSection] = useState(null);
  const [zelleCopied, setZelleCopied] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [paypalError, setPaypalError] = useState("");
  const [paypalCancelled, setPaypalCancelled] = useState(false);
  const [paypalCapturing, setPaypalCapturing] = useState(false);
  const [paypalSuccess, setPaypalSuccess] = useState(false);
  const [paypalRenderKey, setPaypalRenderKey] = useState(0);
  const paypalContainerRef = useRef(null);
  const paypalRendered = useRef(false);

  useSEO({
    title: "Payment | For the Record MN DJ",
    description: "Secure payment for For the Record DJ services.",
    canonical: "https://fortherecordmn.com/pay",
  });

  // ── Load PayPal SDK when card section is opened ───────────────────────────
  useEffect(() => {
    if (
      activeSection !== "card" ||
      paypalLoaded ||
      PAYPAL_CLIENT_ID === "YOUR_PAYPAL_CLIENT_ID_HERE"
    )
      return;

    const script = document.createElement("script");
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&components=buttons&disable-funding=venmo,paylater,credit&vault=false`;
    script.async = true;
    script.onload = () => setPaypalLoaded(true);
    script.onerror = () =>
      setPaypalError(
        "Could not load payment processor. Please try another option.",
      );
    document.body.appendChild(script);

    return () => {
      // leave script in DOM for subsequent renders
    };
  }, [activeSection, paypalLoaded]);

  // ── Render PayPal card button once SDK is ready ───────────────────────────
  useEffect(() => {
    if (!paypalLoaded || paypalRendered.current || !paypalContainerRef.current)
      return;
    if (!window.paypal) return;

    paypalRendered.current = true;

    const orderConfig = {
      createOrder: (data, actions) =>
        actions.order.create({
          purchase_units: [
            {
              amount: {
                value: String(Number(cardAmt).toFixed(2)),
                currency_code: "USD",
              },
              description: note,
            },
          ],
          application_context: { shipping_preference: "NO_SHIPPING" },
        }),
      onApprove: async (data, actions) => {
        setPaypalCapturing(true);
        try {
          await actions.order.capture();
          setPaypalSuccess(true);
        } catch (err) {
          console.error("PayPal capture error:", err);
          setPaypalError(
            "Your payment was not captured. Please try again or contact us.",
          );
        } finally {
          setPaypalCapturing(false);
        }
      },
      onCancel: () => {
        setPaypalCancelled(true);
      },
      onError: (err) => {
        console.error("PayPal error:", err);
        setPaypalCapturing(false);
        setPaypalError(
          "Something went wrong with the payment form. Please try again.",
        );
      },
    };

    // Credit / debit card
    window.paypal
      .Buttons({
        ...orderConfig,
        fundingSource: window.paypal.FUNDING.CARD,
        style: { shape: "rect", color: "black", label: "pay", height: 48 },
      })
      .render(paypalContainerRef.current);

    // Apple Pay / Google Pay — only render if eligible (requires PPCP Advanced onboarding)
    [window.paypal.FUNDING.APPLEPAY, window.paypal.FUNDING.GOOGLEPAY].forEach(
      (source) => {
        if (!source) return;
        const btn = window.paypal.Buttons({
          ...orderConfig,
          fundingSource: source,
          style: { height: 48 },
        });
        if (btn.isEligible()) btn.render(paypalContainerRef.current);
      },
    );
  }, [paypalLoaded, cardAmt, note, paypalRenderKey]);

  // ── Venmo deep link ───────────────────────────────────────────────────────
  const venmoHref = `venmo://paycharge?txn=pay&recipients=${VENMO_USERNAME}&amount=${venmoAmt}&note=${encodeURIComponent(note)}`;
  const venmoWeb = `https://venmo.com/u/${VENMO_USERNAME}?txn=pay&amount=${venmoAmt}&note=${encodeURIComponent(note).replace(/%20/g, "+")}`;

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

  const toggle = (section) => {
    setActiveSection((prev) => (prev === section ? null : section));
  };

  const retryPaypal = () => {
    setPaypalError("");
    setPaypalCancelled(false);
    setPaypalCapturing(false);
    paypalRendered.current = false;
    if (paypalContainerRef.current) paypalContainerRef.current.innerHTML = "";
    setPaypalRenderKey((k) => k + 1);
  };

  // ── Invalid / missing link ────────────────────────────────────────────────
  if (!payload || base <= 0) {
    return (
      <div className="pay-page pay-invalid">
        <div className="pay-invalid-card">
          <div className="pay-invalid-icon">🔗</div>
          <h1>Payment Link Not Found</h1>
          <p>
            This link appears to be invalid or incomplete. Please check with For
            the Record for a valid payment link.
          </p>
          <a
            href="mailto:michael@fortherecordmn.com"
            className="pay-btn-outline"
          >
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
        <div
          className={`pay-option-card ${activeSection === "zelle" ? "open" : ""}`}
        >
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
              <span className="pay-chevron">
                {activeSection === "zelle" ? "▲" : "▼"}
              </span>
            </div>
          </button>

          {activeSection === "zelle" && (
            <div className="pay-option-body">
              <ol className="pay-zelle-steps">
                <li>Open your banking app</li>
                <li>
                  Navigate to <strong>Send Money</strong> or{" "}
                  <strong>Transfers</strong>
                </li>
                <li>
                  Select <strong>Zelle</strong>
                </li>
                <li>
                  Enter the recipient:
                  <div
                    className="pay-zelle-contact"
                    style={{ marginTop: "0.5rem" }}
                  >
                    <span>{ZELLE_CONTACT}</span>
                    <button className="pay-copy-btn" onClick={copyZelle}>
                      {zelleCopied ? "✓ Copied" : "Copy"}
                    </button>
                  </div>
                </li>
                <li>
                  Enter the amount: <strong>{fmt(base)}</strong>
                </li>
                <li>
                  Add memo: <strong>{note}</strong>
                </li>
                <li>Confirm and send</li>
              </ol>
              <p className="pay-sub-note">
                Most major banks have Zelle built in — look under "Send Money"
                or "Pay &amp; Transfer."
              </p>
            </div>
          )}
        </div>

        {/* ── 2. Venmo ──────────────────────────────────────────────────── */}
        <div
          className={`pay-option-card ${activeSection === "venmo" ? "open" : ""}`}
        >
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
              <span className="pay-chevron">
                {activeSection === "venmo" ? "▲" : "▼"}
              </span>
            </div>
          </button>

          {activeSection === "venmo" && (
            <div className="pay-option-body">
              <p className="pay-instructions">
                Tap below to open Venmo — the amount and memo will be
                pre-filled.
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
                <div
                  className="pay-detail-row"
                  style={{
                    borderTop: "1px solid rgba(10, 17, 40, 0.1)",
                    paddingTop: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                >
                  <span>
                    <strong>Total:</strong>
                  </span>
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
        <div
          className={`pay-option-card ${activeSection === "card" ? "open" : ""}`}
        >
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
              <span className="pay-chevron">
                {activeSection === "card" ? "▲" : "▼"}
              </span>
            </div>
          </button>

          {activeSection === "card" && (
            <div className="pay-option-body">
              {paypalSuccess ? (
                <div className="pay-success">
                  <div className="pay-success-icon">✓</div>
                  <h3>Payment Received!</h3>
                  <p>
                    Thank you{name ? `, ${name}` : ""}! Your payment of{" "}
                    <strong>{fmt(cardAmt)}</strong> was processed successfully.
                  </p>
                  <p style={{ marginTop: "0.5rem" }}>
                    You'll receive a receipt from PayPal to the email you
                    entered during checkout.
                  </p>
                  <p style={{ marginTop: "0.5rem" }}>
                    We'll be in touch shortly to confirm your booking.
                    Questions?{" "}
                    <a href="mailto:michael@fortherecordmn.com">
                      michael@fortherecordmn.com
                    </a>
                  </p>
                </div>
              ) : (
                <>
                  <div
                    className="pay-zelle-details"
                    style={{ marginBottom: "1.25rem" }}
                  >
                    <div className="pay-detail-row">
                      <span>Base amount:</span>
                      <strong>{fmt(base)}</strong>
                    </div>
                    <div className="pay-detail-row">
                      <span>Processing fee (3%):</span>
                      <strong>{fmt(cardFee)}</strong>
                    </div>
                    <div
                      className="pay-detail-row"
                      style={{
                        borderTop: "1px solid rgba(10, 17, 40, 0.1)",
                        paddingTop: "0.5rem",
                        marginTop: "0.5rem",
                      }}
                    >
                      <span>
                        <strong>Total:</strong>
                      </span>
                      <strong>{fmt(cardAmt)}</strong>
                    </div>
                    <div className="pay-detail-row">
                      <span>Memo:</span>
                      <strong>{note}</strong>
                    </div>
                  </div>

                  {PAYPAL_CLIENT_ID === "YOUR_PAYPAL_CLIENT_ID_HERE" ? (
                    <div className="pay-config-warning">
                      ⚠ Card payments not yet configured. Please use Zelle or
                      Venmo.
                    </div>
                  ) : paypalError ? (
                    <div className="pay-error-state">
                      <p className="pay-config-warning">{paypalError}</p>
                      <p
                        className="pay-sub-note"
                        style={{ marginTop: "0.5rem" }}
                      >
                        No charge was made. You can try again or{" "}
                        <a href="mailto:michael@fortherecordmn.com">
                          contact us
                        </a>
                        .
                      </p>
                      <button
                        className="pay-btn-outline"
                        style={{ marginTop: "1rem" }}
                        onClick={retryPaypal}
                      >
                        Try Again
                      </button>
                    </div>
                  ) : paypalCancelled ? (
                    <div className="pay-error-state">
                      <p className="pay-sub-note">
                        Payment was not submitted — your card was not charged.
                      </p>
                      <button
                        className="pay-btn-outline"
                        style={{ marginTop: "1rem" }}
                        onClick={retryPaypal}
                      >
                        Try Again
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="pay-paypal-badge">
                        <div className="pay-paypal-badge-row">
                          <span className="pay-paypal-badge-label">
                            Accepting
                          </span>
                          <img
                            src={ccVisa}
                            alt="Visa"
                            className="pay-card-logo"
                          />
                          <img
                            src={ccMastercard}
                            alt="Mastercard"
                            className="pay-card-logo"
                          />
                          <img
                            src={ccAmex}
                            alt="Amex"
                            className="pay-card-logo"
                          />
                          <img
                            src={ccDiscover}
                            alt="Discover"
                            className="pay-card-logo"
                          />
                        </div>
                        <div className="pay-paypal-badge-provider">
                          <span className="pay-paypal-badge-label">
                            With this secure credit card payment portal provided
                            by
                          </span>
                          <img
                            src={ccPaypal}
                            alt="PayPal"
                            className="pay-card-logo pay-card-logo-paypal"
                          />
                        </div>
                      </div>
                      {paypalCapturing && (
                        <div className="pay-capturing">
                          <span className="pay-capturing-spinner" />
                          Processing your payment… do not close this page.
                        </div>
                      )}
                      {!paypalLoaded && !paypalCapturing && (
                        <div className="pay-loading">Loading payment form…</div>
                      )}
                      <div
                        ref={paypalContainerRef}
                        className="pay-paypal-container"
                        style={
                          paypalCapturing
                            ? { opacity: 0.4, pointerEvents: "none" }
                            : {}
                        }
                      />
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
        <p className="pay-footer-contact">
          Questions?{" "}
          <a href="mailto:michael@fortherecordmn.com">
            michael@fortherecordmn.com
          </a>{" "}
          · <a href="tel:+16123897005">(612) 389-7005</a>
        </p>
      </div>
    </div>
  );
};

export default Pay;
