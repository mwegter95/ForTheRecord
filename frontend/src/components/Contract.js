import React, { useState, useRef, useEffect, useCallback } from "react";
import useSEO from "../hooks/useSEO";
import generateContractPDF from "./generateContractPDF";
import "./Contract.scss";

// ─── Google Apps Script web app URL ─────────────────────────
// Paste your deployed Apps Script URL here after setup
const APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbwN0Tu9wjKtVCrN1_FlHodvujf3_Z-jSNIJvtahR6In2Y-hf7zFvZa7QstoeFi-H21U/exec";

// ─── Inline SVG icons (avoids Lucide DOM conflict) ──────────
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

// ─── Signature Pad ──────────────────────────────────────────
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
      if (onSignatureChange) {
        onSignatureChange(canvasRef.current.toDataURL("image/png"));
      }
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
    // Prevent scrolling while signing on mobile
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

// ─── Main Contract Component ────────────────────────────────
const Contract = () => {
  useSEO({
    title: "Wedding DJ Services Agreement | For the Record",
    description: "Review and sign your wedding DJ services agreement with For the Record.",
    canonical: "https://fortherecordmn.com/contract",
  });

  const [form, setForm] = useState({
    clientNames: "",
    clientEmail: "",
    clientPhone: "",
    eventDate: "",
    venueName: "",
    venueAddress: "",
    venueCity: "",
    venueState: "MN",
    venueZip: "",
    startTime: "",
    endTime: "",
    guestCount: "",
    totalFee: "",
    discountPercent: "",
    discountDollar: "",
    depositAmount: "",
    specialNotes: "",
    clientPrintedName: "",
  });

  const [signature, setSignature] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle"); // idle | sending | success | error
  const [errorMsg, setErrorMsg] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const updated = { ...prev, [name]: value };

      const total   = parseFloat(name === "totalFee"       ? value : updated.totalFee)       || 0;
      const discP   = parseFloat(name === "discountPercent" ? value : updated.discountPercent) || 0;
      const discD   = parseFloat(name === "discountDollar"  ? value : updated.discountDollar)  || 0;

      // Cross-calculate percent ↔ dollar
      if (name === "totalFee") {
        // Re-derive dollar from existing percent when base fee changes
        if (discP > 0) updated.discountDollar = total > 0 ? (total * discP / 100).toFixed(2) : "";
      }
      if (name === "discountPercent") {
        updated.discountDollar = total > 0 && discP > 0 ? (total * discP / 100).toFixed(2) : "";
      }
      if (name === "discountDollar") {
        updated.discountPercent = total > 0 && discD > 0
          ? ((discD / total) * 100).toFixed(1)
          : "";
      }

      // Recalculate deposit from adjusted total whenever any of these change
      if (["totalFee", "discountPercent", "discountDollar"].includes(name)) {
        const effectiveDiscD = name === "discountPercent"
          ? (total * discP / 100)
          : name === "discountDollar"
          ? discD
          : (parseFloat(updated.discountDollar) || 0);
        const adjusted = Math.max(0, total - effectiveDiscD);
        updated.depositAmount = adjusted > 0 ? (adjusted / 2).toFixed(2) : "";
      }

      return updated;
    });
  };

  const discountedTotal = () => {
    const total = parseFloat(form.totalFee) || 0;
    const discD = parseFloat(form.discountDollar) || 0;
    return Math.max(0, total - discD).toFixed(2);
  };

  const balanceDue = () => {
    const adjusted = parseFloat(discountedTotal()) || 0;
    const deposit  = parseFloat(form.depositAmount) || 0;
    return adjusted > deposit ? (adjusted - deposit).toFixed(2) : "0.00";
  };

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
      // 1. Generate signed PDF and capture base64 for email attachment
      const { filename: pdfFilename, base64: pdfBase64 } = await generateContractPDF(form, signature, signedDate);

      // 2. Send email with PDF attached via Google Apps Script
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
        total_fee:           form.totalFee ? `$${form.totalFee}` : "—",
        discount_percent:    form.discountPercent ? `${form.discountPercent}%` : "None",
        discount_dollar:     form.discountDollar ? `$${form.discountDollar}` : "None",
        adjusted_total:      (form.discountPercent || form.discountDollar) ? `$${discountedTotal()}` : `$${form.totalFee}`,
        deposit_amount:      form.depositAmount ? `$${form.depositAmount}` : "—",
        balance_due:         `$${balanceDue()}`,
        special_notes:       form.specialNotes || "None",
        client_printed_name: form.clientPrintedName,
        signed_date:         signedDate,
        pdf_base64:          pdfBase64,   // actual PDF attached in email
        pdf_filename:        pdfFilename,
      };

      // Send without Content-Type header so the browser avoids a CORS preflight
      const resp = await fetch(APPS_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error(`Apps Script responded with ${resp.status}`);
      setSubmitStatus("success");
    } catch (err) {
      console.error("Contract submission failed:", err);
      setErrorMsg("Something went wrong generating the PDF or sending the confirmation. Please try again or contact us directly.");
      setSubmitStatus("error");
    }
  };

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

  return (
    <div className="contract-page">
      <form className="contract-doc" onSubmit={handleSubmit}>
        {/* ─── HEADER ──────────────────────────── */}
        <div className="contract-header">
          <img src="/images/favicon-192.png" alt="For the Record" className="contract-header__logo" />
          <h1>Wedding DJ Services Agreement</h1>
          <p className="contract-header__sub">For the Record</p>
        </div>

        <p className="contract-intro">
          This Agreement ("Agreement") is entered into between <strong>For the Record</strong> operated
          by Michael Wegter ("DJ") and the undersigned client(s) ("Client") for professional disc jockey
          and sound services at the wedding event described below. By signing this Agreement, both parties
          agree to the terms and conditions set forth herein.
        </p>

        {/* ─── 1. EVENT DETAILS ────────────────── */}
        <h2 className="contract-section-title">1. Event Details</h2>

        <div className="contract-field-grid">
          <div className="contract-field contract-field--full">
            <label>Client Name(s) <span className="req">*</span></label>
            <input type="text" name="clientNames" value={form.clientNames} onChange={handleChange} placeholder="e.g. Jane Doe & John Smith" required />
          </div>
          <div className="contract-field">
            <label>Client Email <span className="req">*</span></label>
            <input type="email" name="clientEmail" value={form.clientEmail} onChange={handleChange} placeholder="email@example.com" required />
          </div>
          <div className="contract-field">
            <label>Client Phone <span className="req">*</span></label>
            <input type="tel" name="clientPhone" value={form.clientPhone} onChange={handleChange} placeholder="(555) 123-4567" required />
          </div>
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
            <input type="text" name="venueName" value={form.venueName} onChange={handleChange} placeholder="Venue name" required />
          </div>
          <div className="contract-field contract-field--full">
            <label>Venue Street Address</label>
            <input type="text" name="venueAddress" value={form.venueAddress} onChange={handleChange} placeholder="123 Main St" />
          </div>
          <div className="contract-field">
            <label>City</label>
            <input type="text" name="venueCity" value={form.venueCity} onChange={handleChange} placeholder="Minneapolis" />
          </div>
          <div className="contract-field contract-field--sm">
            <label>State</label>
            <input type="text" name="venueState" value={form.venueState} onChange={handleChange} placeholder="MN" maxLength={2} />
          </div>
          <div className="contract-field contract-field--sm">
            <label>Zip</label>
            <input type="text" name="venueZip" value={form.venueZip} onChange={handleChange} placeholder="55401" maxLength={10} />
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

        {/* ─── 2. SERVICES ─────────────────────── */}
        <h2 className="contract-section-title">2. Services Provided</h2>
        <p>DJ agrees to provide professional disc jockey and sound services for the Client's wedding event, including:</p>
        <ul className="contract-list">
          <li>Professional audio equipment and setup with backup gear</li>
          <li>Music curation and live mixing for ceremony and/or reception</li>
          <li>Wireless microphone(s) for announcements, speeches, and toasts</li>
          <li>Arrival at least 2 hours before event start for setup and sound check</li>
          <li>Teardown and equipment removal following the event</li>
        </ul>

        {/* ─── 3. COMPENSATION ─────────────────── */}
        <h2 className="contract-section-title">3. Compensation</h2>
        <div className="contract-field-grid">
          <div className="contract-field">
            <label>Base Fee ($) <span className="req">*</span></label>
            <input type="number" name="totalFee" value={form.totalFee} onChange={handleChange} placeholder="0.00" min="0" step="0.01" required />
          </div>
          <div className="contract-field">
            <label>Discount (%)</label>
            <input type="number" name="discountPercent" value={form.discountPercent} onChange={handleChange} placeholder="0" min="0" max="100" step="0.1" />
          </div>
          <div className="contract-field">
            <label>Discount ($)</label>
            <input type="number" name="discountDollar" value={form.discountDollar} onChange={handleChange} placeholder="0.00" min="0" step="0.01" />
          </div>
          {(form.discountPercent || form.discountDollar) && (
            <div className="contract-field">
              <label>Adjusted Total ($)</label>
              <input type="text" value={discountedTotal()} readOnly className="contract-field--readonly contract-field--highlight" />
            </div>
          )}
          <div className="contract-field">
            <label>Deposit — 50% ($)</label>
            <input type="number" name="depositAmount" value={form.depositAmount} onChange={handleChange} placeholder="Auto-calculated" min="0" step="0.01" readOnly className="contract-field--readonly" />
          </div>
          <div className="contract-field">
            <label>Balance Due ($)</label>
            <input type="text" value={balanceDue()} readOnly className="contract-field--readonly" />
          </div>
        </div>
        <p className="contract-note">
          A non-refundable deposit of 50% of the{form.discountPercent || form.discountDollar ? " adjusted" : ""} total
          is due upon signing this Agreement to reserve the date.
          The remaining balance is due no later than <strong>14 days before the event</strong>.
          Payment may be made via cash, check, Venmo, or Zelle.
          {(form.discountPercent) && (
            <> Any discount percentage applied in this agreement will also be applied
            to any additional services or costs agreed upon beyond the contracted scope.</>
          )}
        </p>

        {/* ─── 4. CANCELLATION ─────────────────── */}
        <h2 className="contract-section-title">4. Cancellation &amp; Refund Policy</h2>
        <ul className="contract-list">
          <li><strong>60+ days before the event:</strong> Deposit is fully refundable.</li>
          <li><strong>Fewer than 60 days before the event:</strong> Deposit is non-refundable.</li>
          <li><strong>If DJ cancels:</strong> Full deposit will be refunded and DJ will make reasonable efforts to help Client find a replacement.</li>
        </ul>

        {/* ─── 5. LIABILITY ────────────────────── */}
        <h2 className="contract-section-title">5. Limitation of Liability</h2>
        <p>
          DJ shall not be held liable for any injury, damage, or loss to persons or property occurring at or
          in connection with the event venue. Client assumes responsibility for the safety of all guests
          and the condition of the event space. DJ's total liability under this Agreement shall not exceed the
          Total Fee paid by Client.
        </p>

        {/* ─── 6. FORCE MAJEURE ────────────────── */}
        <h2 className="contract-section-title">6. Force Majeure</h2>
        <p>
          Neither party shall be liable for failure to perform due to circumstances beyond their reasonable control,
          including but not limited to: severe weather, natural disasters, public health emergencies, venue closures,
          power failures, or government restrictions. In such cases, the parties will work in good faith to reschedule
          the event. Any deposit paid will be applied to the rescheduled date or refunded in full if rescheduling
          is not possible within 12 months.
        </p>

        {/* ─── 7. EQUIPMENT & VENUE ────────────── */}
        <h2 className="contract-section-title">7. Equipment &amp; Venue Access</h2>
        <p>
          DJ requires access to the venue at least 2 hours prior to the event start for setup and sound check.
          Client is responsible for ensuring adequate electrical power (minimum two dedicated 15-amp circuits)
          and a suitable setup area. DJ is responsible for the care and transport of all DJ-provided equipment.
          DJ is not responsible for damage to equipment caused by venue conditions, guests, or third parties.
        </p>

        {/* ─── 8. PERFORMANCE ──────────────────── */}
        <h2 className="contract-section-title">8. Performance</h2>
        <p>
          DJ will perform for the agreed-upon hours as specified in Section 1. Overtime beyond the contracted
          end time is available at <strong>$150/hr</strong>, subject to DJ availability and must be
          agreed upon at the event. Breaks of reasonable length may be taken during the performance.
        </p>

        {/* ─── 9. GENERAL ──────────────────────── */}
        <h2 className="contract-section-title">9. General Provisions</h2>
        <p>
          This Agreement constitutes the entire agreement between the parties and supersedes all prior discussions.
          It shall be governed by the laws of the State of Minnesota. Any modifications to this Agreement must be
          in writing and agreed upon by both parties. If any provision of this Agreement is found unenforceable,
          the remaining provisions shall remain in full effect.
        </p>

        {/* ─── SPECIAL NOTES ───────────────────── */}
        <h2 className="contract-section-title">Additional Notes</h2>
        <div className="contract-field contract-field--full">
          <textarea
            name="specialNotes"
            value={form.specialNotes}
            onChange={handleChange}
            placeholder="Any additional agreements, special requests, or notes..."
            rows={3}
          />
        </div>

        {/* ─── SIGNATURES ──────────────────────── */}
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

        {/* ─── AGREEMENT CHECKBOX + SUBMIT ─────── */}
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
            {submitStatus === "sending" ? (
              "Submitting..."
            ) : (
              <><IconSend /> Sign &amp; Submit Agreement</>
            )}
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
