import React, { useState, useRef, useEffect, useCallback } from "react";
import useSEO from "../hooks/useSEO";
import generateContractPDF from "./generateContractPDF";
import "./Contract.scss";

// ─── Google Apps Script web app URL ─────────────────────────
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbz24yfqfuiotdBIZA0-qgVwDmNG5LZ8axbnU0exctJrZCyEoxowSnYtWKiZKKau0Jlb/exec";

// ─── Service rates ───────────────────────────────────────────
export const RATES = {
  setupTeardown: 200, // flat
  reception:     100, // $/hr
  cocktail:       75, // $/hr
  dinner:         75, // $/hr
  ceremony:      100, // $/hr
  ceremonyMic:   150, // flat
  dancefloor:    175, // flat
  uplighting6:   275, // 6 units
  uplighting12:  550, // 12 units
  mileage:      0.50, // $/mi (round trip)
};

export const calcSubtotal = (f) => {
  let t = 0;
  if (f.setupTeardown)       t += RATES.setupTeardown;
  t += (parseFloat(f.receptionHours) || 0) * RATES.reception;
  t += (parseFloat(f.cocktailHours)  || 0) * RATES.cocktail;
  t += (parseFloat(f.dinnerHours)    || 0) * RATES.dinner;
  t += (parseFloat(f.ceremonyHours)  || 0) * RATES.ceremony;
  if (f.ceremonyMic)         t += RATES.ceremonyMic;
  if (f.dancefloor)          t += RATES.dancefloor;
  if (f.uplighting === "6")  t += RATES.uplighting6;
  if (f.uplighting === "12") t += RATES.uplighting12;
  t += (parseFloat(f.mileageMiles) || 0) * RATES.mileage;
  return t;
};

// ─── Inline SVG icons ────────────────────────────────────────
const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconSend = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
  </svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const IconAlertCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);
const IconLock = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// ─── Signature Pad ───────────────────────────────────────────
const SignaturePad = ({ onSignatureChange }) => {
  const canvasRef = useRef(null);
  const isDrawing = useRef(false);
  const lastPoint = useRef(null);

  const getPos = useCallback((e) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const touch = e.touches ? e.touches[0] : e;
    return {
      x: (touch.clientX - rect.left) * scaleX,
      y: (touch.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDraw = useCallback((e) => {
    e.preventDefault();
    isDrawing.current = true;
    lastPoint.current = getPos(e);
  }, [getPos]);

  const draw = useCallback((e) => {
    if (!isDrawing.current) return;
    e.preventDefault();
    const ctx = canvasRef.current.getContext("2d");
    const pos = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastPoint.current.x, lastPoint.current.y);
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#0a1128";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPoint.current = pos;
  }, [getPos]);

  const endDraw = useCallback(() => {
    if (isDrawing.current) {
      isDrawing.current = false;
      lastPoint.current = null;
      if (onSignatureChange) onSignatureChange(canvasRef.current.toDataURL("image/png"));
    }
  }, [onSignatureChange]);

  const clear = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (onSignatureChange) onSignatureChange("");
  }, [onSignatureChange]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const preventScroll = (e) => { if (isDrawing.current) e.preventDefault(); };
    canvas.addEventListener("touchmove", preventScroll, { passive: false });
    return () => canvas.removeEventListener("touchmove", preventScroll);
  }, []);

  return (
    <div className="signature-pad">
      <canvas
        ref={canvasRef}
        width={600}
        height={160}
        onMouseDown={startDraw}
        onMouseMove={draw}
        onMouseUp={endDraw}
        onMouseLeave={endDraw}
        onTouchStart={startDraw}
        onTouchMove={draw}
        onTouchEnd={endDraw}
      />
      <div className="signature-pad__line" />
      <button type="button" className="signature-pad__clear" onClick={clear}>
        <IconTrash /> Clear
      </button>
    </div>
  );
};

// ─── Service row helper ──────────────────────────────────────
const SvcRow = ({ label, rate, locked, children, total }) => (
  <div className="csvc-row">
    <span className="csvc-name">{label}</span>
    <span className="csvc-rate">{rate}</span>
    <span className="csvc-qty">{children}</span>
    <span className="csvc-total">{total > 0 ? `$${total.toFixed(2)}` : <span className="csvc-zero">—</span>}</span>
  </div>
);

// ─── Main Contract Component ─────────────────────────────────
const Contract = () => {
  useSEO({
    title: "Wedding DJ Services Agreement | For the Record",
    description: "Review and sign your wedding DJ services agreement with For the Record.",
    canonical: "https://fortherecordmn.com/contract",
  });

  const [isPreFilled, setIsPreFilled] = useState(false);

  const [form, setForm] = useState({
    // Client info — always editable
    clientNames:      "",
    clientEmail:      "",
    clientPhone:      "",
    clientPrintedName: "",
    // Event details — lockable when pre-filled
    eventDate:    "",
    venueName:    "",
    venueAddress: "",
    venueCity:    "",
    venueState:   "MN",
    venueZip:     "",
    startTime:    "",
    endTime:      "",
    guestCount:   "",
    // Services — lockable when pre-filled
    setupTeardown:  true,
    receptionHours: "",
    cocktailHours:  "",
    dinnerHours:    "",
    ceremonyHours:  "",
    ceremonyMic:    false,
    dancefloor:     false,
    uplighting:     "none", // "none" | "6" | "12"
    mileageMiles:   "",     // round-trip miles at $0.50/mi
    // Discount — lockable when pre-filled
    discountPercent: "",
    discountDollar:  "",
    // Notes — lockable when pre-filled
    specialNotes: "",
  });

  const [signature,    setSignature]    = useState("");
  const [agreed,       setAgreed]       = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [errorMsg,     setErrorMsg]     = useState("");

  // ── Parse pre-fill URL param on mount ─────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pre = params.get("pre");
    if (!pre) return;
    try {
      const data = JSON.parse(decodeURIComponent(atob(pre)));
      setForm((prev) => ({
        ...prev,
        eventDate:       data.eventDate       || "",
        venueName:       data.venueName       || "",
        venueAddress:    data.venueAddress    || "",
        venueCity:       data.venueCity       || "",
        venueState:      data.venueState      || "MN",
        venueZip:        data.venueZip        || "",
        startTime:       data.startTime       || "",
        endTime:         data.endTime         || "",
        guestCount:      data.guestCount      || "",
        setupTeardown:   data.setupTeardown !== undefined ? !!data.setupTeardown : true,
        receptionHours:  data.receptionHours  || "",
        cocktailHours:   data.cocktailHours   || "",
        dinnerHours:     data.dinnerHours     || "",
        ceremonyHours:   data.ceremonyHours   || "",
        ceremonyMic:     !!data.ceremonyMic,
        dancefloor:      !!data.dancefloor,
        uplighting:      data.uplighting      || "none",
        mileageMiles:    data.mileageMiles    || "",
        discountPercent: data.discountPercent || "",
        discountDollar:  data.discountDollar  || "",
        specialNotes:    data.specialNotes    || "",
      }));
      setIsPreFilled(true);
    } catch (e) {
      console.warn("Invalid pre-fill data in URL:", e);
    }
  }, []);

  // ── handleChange ─────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const v = type === "checkbox" ? checked : value;

    setForm((prev) => {
      const updated = { ...prev, [name]: v };
      const sub  = calcSubtotal(updated);
      const discP = parseFloat(name === "discountPercent" ? v : updated.discountPercent) || 0;
      const discD = parseFloat(name === "discountDollar"  ? v : updated.discountDollar)  || 0;

      // Cross-calculate discount percent ↔ dollar
      if (name === "discountPercent") {
        updated.discountDollar = sub > 0 && discP > 0 ? (sub * discP / 100).toFixed(2) : "";
      }
      if (name === "discountDollar") {
        updated.discountPercent = sub > 0 && discD > 0 ? ((discD / sub) * 100).toFixed(1) : "";
      }

      // When a service field changes, re-derive dollar from existing percent
      const svcFields = ["setupTeardown","receptionHours","cocktailHours","dinnerHours","ceremonyHours","ceremonyMic","dancefloor","uplighting","mileageMiles"];
      if (svcFields.includes(name) && parseFloat(updated.discountPercent) > 0) {
        const newSub = calcSubtotal(updated);
        updated.discountDollar = newSub > 0
          ? (newSub * parseFloat(updated.discountPercent) / 100).toFixed(2)
          : "";
      }

      return updated;
    });
  };

  // ── Derived price helpers ─────────────────────────────────
  const discountedTotal = () => {
    const sub  = calcSubtotal(form);
    const discD = parseFloat(form.discountDollar) || 0;
    return Math.max(0, sub - discD).toFixed(2);
  };

  const depositAmount = () => (parseFloat(discountedTotal()) / 2).toFixed(2);

  const balanceDue = () => {
    const adj = parseFloat(discountedTotal()) || 0;
    const dep = parseFloat(depositAmount()) || 0;
    return Math.max(0, adj - dep).toFixed(2);
  };

  const hasDiscount = !!(form.discountPercent || form.discountDollar);

  // ── Submit ────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!signature) {
      setErrorMsg("Please provide your signature before submitting.");
      setSubmitStatus("error");
      return;
    }
    if (!agreed) {
      setErrorMsg("Please confirm you have read and agree to the terms.");
      setSubmitStatus("error");
      return;
    }

    setSubmitStatus("sending");
    setErrorMsg("");

    const signedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });

    try {
      const { filename: pdfFilename, base64: pdfBase64 } =
        await generateContractPDF(form, signature, signedDate);

      const fmt12h = (t) => {
        if (!t) return "—";
        const [h, m] = t.split(":");
        const hour = parseInt(h, 10);
        return `${hour % 12 || 12}:${m} ${hour >= 12 ? "PM" : "AM"}`;
      };
      const fmtDate = (d) => {
        if (!d) return "—";
        return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
          year: "numeric", month: "long", day: "numeric",
        });
      };

      const sub = calcSubtotal(form);

      const payload = {
        client_names:        form.clientNames,
        client_email:        form.clientEmail,
        client_phone:        form.clientPhone,
        event_date:          fmtDate(form.eventDate),
        venue_name:          form.venueName,
        venue_address:       `${form.venueAddress}, ${form.venueCity}, ${form.venueState} ${form.venueZip}`,
        start_time:          fmt12h(form.startTime),
        end_time:            fmt12h(form.endTime),
        guest_count:         form.guestCount || "—",
        // Services
        setup_teardown:      form.setupTeardown  ? "Yes" : "No",
        reception_hours:     form.receptionHours || "0",
        cocktail_hours:      form.cocktailHours  || "0",
        dinner_hours:        form.dinnerHours    || "0",
        ceremony_hours:      form.ceremonyHours  || "0",
        ceremony_mic:        form.ceremonyMic    ? "Yes" : "No",
        dancefloor:          form.dancefloor     ? "Yes" : "No",
        uplighting:          form.uplighting === "6" ? "6 units" : form.uplighting === "12" ? "12 units" : "None",
        mileage_miles:       form.mileageMiles || "0",
        // Pricing
        subtotal:            `$${sub.toFixed(2)}`,
        discount_percent:    form.discountPercent ? `${form.discountPercent}%` : "None",
        discount_dollar:     form.discountDollar  ? `$${form.discountDollar}`  : "None",
        adjusted_total:      hasDiscount ? `$${discountedTotal()}` : `$${sub.toFixed(2)}`,
        deposit_amount:      `$${depositAmount()}`,
        balance_due:         `$${balanceDue()}`,
        special_notes:       form.specialNotes || "None",
        client_printed_name: form.clientPrintedName,
        signed_date:         signedDate,
        pdf_base64:          pdfBase64,
        pdf_filename:        pdfFilename,
      };

      const resp = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);

      // Apps Script returns 200 even on internal errors — check the body too
      let result;
      try { result = await resp.json(); } catch (_) { result = { success: true }; }
      if (result.success === false) {
        throw new Error(result.error || "Script reported failure");
      }

      setSubmitStatus("success");
    } catch (err) {
      console.error("Contract submission failed:", err);
      setErrorMsg(`Submission failed: ${err.message}. Please try again or email michael@fortherecordmn.com directly.`);
      setSubmitStatus("error");
    }
  };

  // ── Success screen ────────────────────────────────────────
  if (submitStatus === "success") {
    return (
      <div className="contract-page">
        <div className="contract-success">
          <div className="contract-success__icon"><IconCheck /></div>
          <h2>Agreement Signed Successfully</h2>
          <p>
            Thank you, {form.clientNames}! Your signed contract has been emailed to{" "}
            <strong>{form.clientEmail}</strong> — please save it for your records.
          </p>
          <p className="contract-success__note">
            Michael will countersign and send you a fully executed copy shortly. Questions?{" "}
            <a href="mailto:michael@fortherecordmn.com">michael@fortherecordmn.com</a>{" "}
            or <a href="tel:6123897005">(612) 389-7005</a>.
          </p>
        </div>
      </div>
    );
  }

  // ── Locked-field helper ───────────────────────────────────
  const locked = isPreFilled;

  return (
    <div className="contract-page">
      <form className="contract-doc" onSubmit={handleSubmit}>

        {/* ─── HEADER ─────────────────────────────────── */}
        <div className="contract-header">
          <img src="/images/favicon-192.png" alt="For the Record" className="contract-header__logo" />
          <h1>Wedding DJ Services Agreement</h1>
          <p className="contract-header__sub">For the Record</p>
        </div>

        {/* ─── PRE-FILL BANNER ─────────────────────────── */}
        {isPreFilled && (
          <div className="contract-prefill-banner">
            <IconLock />
            <p>This contract has been prepared for you by Michael at For the Record. The event details and pricing are set — please fill in your contact information below and sign to confirm your booking.</p>
          </div>
        )}

        <p className="contract-intro">
          This Agreement ("Agreement") is entered into between <strong>For the Record</strong> operated
          by Michael Wegter ("DJ") and the undersigned client(s) ("Client") for professional disc jockey
          and sound services at the wedding event described below. By signing this Agreement, both parties
          agree to the terms and conditions set forth herein.
        </p>

        {/* ─── 1. CLIENT INFORMATION ───────────────────── */}
        <h2 className="contract-section-title">1. Client Information</h2>
        <div className="contract-field-grid">
          <div className="contract-field contract-field--full">
            <label>Client Name(s) <span className="req">*</span></label>
            <input type="text" name="clientNames" value={form.clientNames} onChange={handleChange}
              placeholder="e.g. Jane Doe & John Smith" required />
          </div>
          <div className="contract-field">
            <label>Client Email <span className="req">*</span></label>
            <input type="email" name="clientEmail" value={form.clientEmail} onChange={handleChange}
              placeholder="email@example.com" required />
          </div>
          <div className="contract-field">
            <label>Client Phone <span className="req">*</span></label>
            <input type="tel" name="clientPhone" value={form.clientPhone} onChange={handleChange}
              placeholder="(555) 123-4567" required />
          </div>
        </div>

        {/* ─── 2. EVENT DETAILS ────────────────────────── */}
        <h2 className="contract-section-title">2. Event Details</h2>
        <div className="contract-field-grid">
          <div className="contract-field">
            <label>Event Date <span className="req">*</span></label>
            <input type="date" name="eventDate" value={form.eventDate} onChange={handleChange} required />
          </div>
          <div className="contract-field">
            <label>Estimated Guest Count</label>
            <input type="number" name="guestCount" value={form.guestCount} onChange={handleChange} placeholder="150" />
          </div>
          <div className="contract-field contract-field--full">
            <label>Venue Name <span className="req">*</span></label>
            <input type="text" name="venueName" value={form.venueName} onChange={handleChange}
              placeholder="Venue name" required />
          </div>
          <div className="contract-field contract-field--full">
            <label>Venue Street Address</label>
            <input type="text" name="venueAddress" value={form.venueAddress} onChange={handleChange}
              placeholder="123 Main St" />
          </div>
          <div className="contract-field">
            <label>City</label>
            <input type="text" name="venueCity" value={form.venueCity} onChange={handleChange}
              placeholder="Minneapolis" />
          </div>
          <div className="contract-field contract-field--sm">
            <label>State</label>
            <input type="text" name="venueState" value={form.venueState} onChange={handleChange}
              placeholder="MN" maxLength={2} />
          </div>
          <div className="contract-field contract-field--sm">
            <label>Zip</label>
            <input type="text" name="venueZip" value={form.venueZip} onChange={handleChange}
              placeholder="55401" maxLength={10} />
          </div>
          <div className="contract-field">
            <label>Music Start Time <span className="req">*</span></label>
            <input type="time" name="startTime" value={form.startTime} onChange={handleChange} required />
          </div>
          <div className="contract-field">
            <label>Music End Time <span className="req">*</span></label>
            <input type="time" name="endTime" value={form.endTime} onChange={handleChange} required />
          </div>
        </div>

        {/* ─── 3. SERVICES & COMPENSATION ──────────────── */}
        <h2 className="contract-section-title">
          3. Services &amp; Compensation {locked && <span className="contract-section-title__locked"><IconLock /> Set by DJ</span>}
        </h2>
        <p>DJ agrees to provide the following professional services for the Client's wedding event:</p>

        {/* Service line-item table */}
        <div className="csvc-table">
          <div className="csvc-header">
            <span className="csvc-name">Service</span>
            <span className="csvc-rate">Rate</span>
            <span className="csvc-qty">Qty</span>
            <span className="csvc-total">Amount</span>
          </div>

          {/* Reception Setup & Teardown */}
          <SvcRow
            label="Reception Setup & Teardown"
            rate="$200 flat"
            total={form.setupTeardown ? RATES.setupTeardown : 0}
          >
            {locked ? (
              <span className="csvc-qty-fixed">{form.setupTeardown ? "1" : "—"}</span>
            ) : (
              <label className="csvc-checkbox">
                <input type="checkbox" name="setupTeardown" checked={form.setupTeardown} onChange={handleChange} />
                <span>Include</span>
              </label>
            )}
          </SvcRow>

          {/* Reception / Dance DJ */}
          <SvcRow
            label="Reception / Dance DJ"
            rate="$100/hr"
            total={(parseFloat(form.receptionHours) || 0) * RATES.reception}
          >
            {locked ? (
              <span className="csvc-qty-fixed">{form.receptionHours || "—"} hrs</span>
            ) : (
              <span className="csvc-input-wrap">
                <input type="number" name="receptionHours" value={form.receptionHours}
                  onChange={handleChange} min="0" step="0.5" placeholder="0" />
                <span className="csvc-unit">hrs</span>
              </span>
            )}
          </SvcRow>

          {/* Cocktail Hour Music */}
          <SvcRow
            label="Cocktail Hour Music"
            rate="$75/hr"
            total={(parseFloat(form.cocktailHours) || 0) * RATES.cocktail}
          >
            {locked ? (
              <span className="csvc-qty-fixed">{form.cocktailHours || "—"} hrs</span>
            ) : (
              <span className="csvc-input-wrap">
                <input type="number" name="cocktailHours" value={form.cocktailHours}
                  onChange={handleChange} min="0" step="0.5" placeholder="0" />
                <span className="csvc-unit">hrs</span>
              </span>
            )}
          </SvcRow>

          {/* Dinner Music */}
          <SvcRow
            label="Dinner Music"
            rate="$75/hr"
            total={(parseFloat(form.dinnerHours) || 0) * RATES.dinner}
          >
            {locked ? (
              <span className="csvc-qty-fixed">{form.dinnerHours || "—"} hrs</span>
            ) : (
              <span className="csvc-input-wrap">
                <input type="number" name="dinnerHours" value={form.dinnerHours}
                  onChange={handleChange} min="0" step="0.5" placeholder="0" />
                <span className="csvc-unit">hrs</span>
              </span>
            )}
          </SvcRow>

          {/* Ceremony Music */}
          <SvcRow
            label="Ceremony Music"
            rate="$100/hr"
            total={(parseFloat(form.ceremonyHours) || 0) * RATES.ceremony}
          >
            {locked ? (
              <span className="csvc-qty-fixed">{form.ceremonyHours || "—"} hrs</span>
            ) : (
              <span className="csvc-input-wrap">
                <input type="number" name="ceremonyHours" value={form.ceremonyHours}
                  onChange={handleChange} min="0" step="0.5" placeholder="0" />
                <span className="csvc-unit">hrs</span>
              </span>
            )}
          </SvcRow>

          {/* Ceremony Mic & Speaker Setup */}
          <SvcRow
            label="Ceremony Mic & Speaker Setup"
            rate="$150 flat"
            total={form.ceremonyMic ? RATES.ceremonyMic : 0}
          >
            {locked ? (
              <span className="csvc-qty-fixed">{form.ceremonyMic ? "1" : "—"}</span>
            ) : (
              <label className="csvc-checkbox">
                <input type="checkbox" name="ceremonyMic" checked={form.ceremonyMic} onChange={handleChange} />
                <span>Include</span>
              </label>
            )}
          </SvcRow>

          {/* Reception Dancefloor Lighting */}
          <SvcRow
            label="Reception Dancefloor Lighting"
            rate="$175 flat"
            total={form.dancefloor ? RATES.dancefloor : 0}
          >
            {locked ? (
              <span className="csvc-qty-fixed">{form.dancefloor ? "1" : "—"}</span>
            ) : (
              <label className="csvc-checkbox">
                <input type="checkbox" name="dancefloor" checked={form.dancefloor} onChange={handleChange} />
                <span>Include</span>
              </label>
            )}
          </SvcRow>

          {/* Uplighting */}
          <SvcRow
            label="Ambient Uplighting"
            rate="$275 / $550"
            total={form.uplighting === "6" ? RATES.uplighting6 : form.uplighting === "12" ? RATES.uplighting12 : 0}
          >
            {locked ? (
              <span className="csvc-qty-fixed">
                {form.uplighting === "6" ? "6 units" : form.uplighting === "12" ? "12 units" : "—"}
              </span>
            ) : (
              <div className="csvc-radio-group">
                <label><input type="radio" name="uplighting" value="none"
                  checked={form.uplighting === "none"} onChange={handleChange} /> None</label>
                <label><input type="radio" name="uplighting" value="6"
                  checked={form.uplighting === "6"} onChange={handleChange} /> 6 units ($275)</label>
                <label><input type="radio" name="uplighting" value="12"
                  checked={form.uplighting === "12"} onChange={handleChange} /> 12 units ($550)</label>
              </div>
            )}
          </SvcRow>

          {/* Venue Mileage */}
          <SvcRow
            label="Venue Mileage (round trip)"
            rate="$0.50/mi"
            total={(parseFloat(form.mileageMiles) || 0) * RATES.mileage}
          >
            {locked ? (
              <span className="csvc-qty-fixed">
                {form.mileageMiles ? `${form.mileageMiles} mi` : "—"}
              </span>
            ) : (
              <span className="csvc-input-wrap">
                <input type="number" name="mileageMiles" value={form.mileageMiles}
                  onChange={handleChange} min="0" step="1" placeholder="0" />
                <span className="csvc-unit">mi</span>
              </span>
            )}
          </SvcRow>
        </div>

        {/* Totals */}
        <div className="contract-totals">
          <div className="contract-totals__row">
            <span>Subtotal</span>
            <span>${calcSubtotal(form).toFixed(2)}</span>
          </div>

          {/* Discount inputs — only shown when not pre-filled */}
          {!locked && (
            <div className="contract-totals__discount-inputs">
              <div className="contract-field-grid" style={{ marginBottom: 0 }}>
                <div className="contract-field">
                  <label>Discount (%)</label>
                  <input type="number" name="discountPercent" value={form.discountPercent}
                    onChange={handleChange} placeholder="0" min="0" max="100" step="0.1" />
                </div>
                <div className="contract-field">
                  <label>Discount ($)</label>
                  <input type="number" name="discountDollar" value={form.discountDollar}
                    onChange={handleChange} placeholder="0.00" min="0" step="0.01" />
                </div>
              </div>
            </div>
          )}

          {hasDiscount && (
            <>
              <div className="contract-totals__row contract-totals__row--discount">
                <span>Discount{form.discountPercent ? ` (${form.discountPercent}%)` : ""}</span>
                <span>−${parseFloat(form.discountDollar || 0).toFixed(2)}</span>
              </div>
              <div className="contract-totals__row contract-totals__row--adjusted">
                <span>Adjusted Total</span>
                <span>${discountedTotal()}</span>
              </div>
            </>
          )}

          <div className="contract-totals__row contract-totals__row--deposit">
            <span>Deposit (50%)</span>
            <span>${depositAmount()}</span>
          </div>
          <div className="contract-totals__row contract-totals__row--balance">
            <span>Balance Due</span>
            <span>${balanceDue()}</span>
          </div>
        </div>

        <p className="contract-note">
          A non-refundable deposit of 50% of the{hasDiscount ? " adjusted" : ""} total is due upon signing
          to reserve the date. The remaining balance is due no later than <strong>14 days before the event</strong>.
          Payment may be made via cash, check, Venmo, or Zelle.
          {form.discountPercent && (
            <> Any discount percentage applied in this agreement will also be applied to any additional
            services or costs agreed upon beyond the contracted scope.</>
          )}
        </p>

        {/* ─── 4. CANCELLATION ─────────────────────────── */}
        <h2 className="contract-section-title">4. Cancellation &amp; Refund Policy</h2>
        <ul className="contract-list">
          <li><strong>60+ days before the event:</strong> Deposit is fully refundable.</li>
          <li><strong>Fewer than 60 days before the event:</strong> Deposit is non-refundable.</li>
          <li><strong>If DJ cancels:</strong> Full deposit will be refunded and DJ will make reasonable efforts to help Client find a replacement.</li>
        </ul>

        {/* ─── 5. LIABILITY ────────────────────────────── */}
        <h2 className="contract-section-title">5. Limitation of Liability</h2>
        <p>
          DJ shall not be held liable for any injury, damage, or loss to persons or property occurring at or
          in connection with the event venue. Client assumes responsibility for the safety of all guests
          and the condition of the event space. DJ's total liability under this Agreement shall not exceed the
          total fee paid by Client.
        </p>

        {/* ─── 6. FORCE MAJEURE ────────────────────────── */}
        <h2 className="contract-section-title">6. Force Majeure</h2>
        <p>
          Neither party shall be liable for failure to perform due to circumstances beyond their reasonable control,
          including but not limited to: severe weather, natural disasters, public health emergencies, venue closures,
          power failures, or government restrictions. In such cases, the parties will work in good faith to reschedule
          the event. Any deposit paid will be applied to the rescheduled date or refunded in full if rescheduling
          is not possible within 12 months.
        </p>

        {/* ─── 7. EQUIPMENT & VENUE ────────────────────── */}
        <h2 className="contract-section-title">7. Equipment &amp; Venue Access</h2>
        <p>
          DJ requires access to the venue at least 2 hours prior to the event start for setup and sound check.
          Client is responsible for ensuring adequate electrical power (minimum two dedicated 15-amp circuits)
          and a suitable setup area. DJ is responsible for the care and transport of all DJ-provided equipment.
          DJ is not responsible for damage to equipment caused by venue conditions, guests, or third parties.
        </p>

        {/* ─── 8. PERFORMANCE ──────────────────────────── */}
        <h2 className="contract-section-title">8. Performance</h2>
        <p>
          DJ will perform for the agreed-upon hours as specified in Section 2. Overtime beyond the contracted
          end time is available at <strong>$150/hr</strong>, subject to DJ availability and must be
          agreed upon at the event. Breaks of reasonable length may be taken during the performance.
        </p>

        {/* ─── 9. GENERAL ──────────────────────────────── */}
        <h2 className="contract-section-title">9. General Provisions</h2>
        <p>
          This Agreement constitutes the entire agreement between the parties and supersedes all prior discussions.
          It shall be governed by the laws of the State of Minnesota. Any modifications to this Agreement must be
          in writing and agreed upon by both parties. If any provision of this Agreement is found unenforceable,
          the remaining provisions shall remain in full effect.
        </p>

        {/* ─── 10. AMENDMENT & SUPERSESSION ────────────── */}
        <h2 className="contract-section-title">10. Amendment &amp; Supersession</h2>
        <p>
          The parties acknowledge that the scope of services, event details, pricing, or other terms of this
          Agreement may evolve prior to the event date. This Agreement may be amended, updated, or superseded
          in its entirety by a subsequent written agreement executed by both parties. Upon execution of any
          such subsequent agreement pertaining to the same event described herein, the most recently executed
          agreement shall govern in all respects and shall render prior versions null and void as to any
          conflicting terms. No amendment shall be binding unless reduced to writing and agreed upon by both
          parties; provided, however, that verbal agreements confirmed in writing (including by email) by
          both parties shall constitute a valid amendment for purposes of this section.
        </p>

        {/* ─── ADDITIONAL NOTES ────────────────────────── */}
        {(!locked || form.specialNotes) && (
          <>
            <h2 className="contract-section-title">Additional Notes</h2>
            <div className="contract-field contract-field--full">
              <textarea
                name="specialNotes"
                value={form.specialNotes}
                onChange={locked ? undefined : handleChange}
                readOnly={locked}
                className={locked ? "contract-field--readonly" : ""}
                placeholder="Any additional agreements, special requests, or notes..."
                rows={3}
              />
            </div>
          </>
        )}

        {/* ─── SIGNATURES ──────────────────────────────── */}
        <div className="contract-signatures">
          <h2 className="contract-section-title">Signatures</h2>
          <p className="contract-note">
            By signing below, the Client acknowledges that they have read, understand, and agree to all terms
            and conditions of this Agreement.
          </p>

          <div className="contract-sig-block">
            <div className="contract-sig-block__client">
              <h3>Client Signature</h3>
              <SignaturePad onSignatureChange={setSignature} />
              <div className="contract-field" style={{ marginTop: "0.75rem" }}>
                <label>Printed Name <span className="req">*</span></label>
                <input
                  type="text"
                  name="clientPrintedName"
                  value={form.clientPrintedName}
                  onChange={handleChange}
                  placeholder="Your full legal name"
                  required
                />
              </div>
              <p className="contract-sig-date">
                Date: {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </p>
            </div>

            <div className="contract-sig-block__dj">
              <h3>DJ — For the Record</h3>
              <p className="contract-sig-dj-name">Michael Wegter</p>
              <p className="contract-sig-dj-info">
                <a href="mailto:michael@fortherecordmn.com">michael@fortherecordmn.com</a><br />
                <a href="tel:6123897005">(612) 389-7005</a>
              </p>
              <p className="contract-sig-date contract-sig-date--pending">
                DJ will countersign upon receipt.
              </p>
            </div>
          </div>
        </div>

        {/* ─── SUBMIT ──────────────────────────────────── */}
        <div className="contract-submit-area">
          <label className="contract-agree">
            <input
              type="checkbox"
              checked={agreed}
              onChange={(e) => setAgreed(e.target.checked)}
            />
            <span>
              I have read and agree to all terms and conditions of this Wedding DJ Services Agreement.
            </span>
          </label>

          {submitStatus === "error" && (
            <div className="contract-error">
              <IconAlertCircle /> {errorMsg}
            </div>
          )}

          <button
            type="submit"
            className="contract-submit-btn"
            disabled={submitStatus === "sending"}
          >
            {submitStatus === "sending" ? "Submitting..." : <><IconSend /> Sign &amp; Submit Agreement</>}
          </button>

          <p className="contract-submit-note">
            A copy of this signed agreement will be emailed to both you and For the Record.
          </p>
        </div>

      </form>
    </div>
  );
};

export default Contract;
