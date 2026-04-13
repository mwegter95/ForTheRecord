import React, { useState } from "react";
import generateInvoicePDF from "./generateInvoicePDF";
import "./Invoice.scss";

// ─── Google Apps Script URL ────────────────────────────────────────────────────
const INVOICE_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyMv6tHxxXxMBkQgg_BJnYT89XbKVEaYWLa-9O1XGVr7OltKUR09oCQvSRjK68yv2Gl/exec";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const todayISO = () => new Date().toISOString().slice(0, 10);

const fmtMoney = (n) =>
  "$" + parseFloat(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const fmtDateLong = (iso) => {
  if (!iso) return "—";
  return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
};

const dueDateStr = (eventDate) => {
  if (!eventDate) return "";
  const d = new Date(eventDate + "T00:00:00");
  d.setDate(d.getDate() - 14);
  return d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
};

// ─── Component ────────────────────────────────────────────────────────────────
const Invoice = () => {
  const [form, setForm] = useState({
    clientNames:    "",
    clientEmail:    "",
    venueName:      "",
    eventDate:      "",
    paymentDate:    todayISO(),
    totalAmount:    "",
    depositPaid:    "",
    includePayLink: true,
    note:           "",
  });

  const [status, setStatus] = useState("idle"); // idle | generating | sending | success | error
  const [errMsg, setErrMsg] = useState("");

  // ── Derived values ─────────────────────────────────────────────────────────
  const total   = parseFloat(form.totalAmount || 0);
  const deposit = parseFloat(form.depositPaid || 0);
  const balance = Math.max(0, total - deposit);
  const dueLabel = dueDateStr(form.eventDate);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const v = type === "checkbox" ? checked : value;

    setForm((prev) => {
      const next = { ...prev, [name]: v };
      if (name === "totalAmount") {
        const t = parseFloat(value) || 0;
        const prevDep = parseFloat(prev.depositPaid) || 0;
        const prevTotal = parseFloat(prev.totalAmount) || 0;
        if (!prev.depositPaid || Math.abs(prevDep - prevTotal / 2) < 0.01) {
          next.depositPaid = t > 0 ? (t / 2).toFixed(2) : "";
        }
      }
      return next;
    });
  };

  // ── Build remaining-balance pay URL ────────────────────────────────────────
  const buildPayUrl = () => {
    if (!form.includePayLink || balance <= 0) return "";
    try {
      const payload = {
        name:   form.clientNames,
        email:  form.clientEmail,
        amount: balance.toFixed(2),
        note:   `Remaining balance for ${form.clientNames ? `${form.clientNames} wedding` : "your wedding"}`,
      };
      return `${window.location.origin}/pay?p=${btoa(encodeURIComponent(JSON.stringify(payload)))}`;
    } catch { return ""; }
  };

  // ── Download PDF preview ───────────────────────────────────────────────────
  const handlePreview = async () => {
    setStatus("generating");
    setErrMsg("");
    try {
      const result = await generateInvoicePDF({
        ...form, remainingBalance: balance, remainingPayUrl: buildPayUrl(),
      });
      result.doc.save(result.filename);
      setStatus("idle");
    } catch (err) {
      setErrMsg(`PDF error: ${err.message}`);
      setStatus("error");
    }
  };

  // ── Send email ─────────────────────────────────────────────────────────────
  const handleSend = async () => {
    if (!form.clientNames)  { setErrMsg("Client name is required.");  setStatus("error"); return; }
    if (!form.clientEmail)  { setErrMsg("Client email is required."); setStatus("error"); return; }

    setStatus("generating");
    setErrMsg("");

    try {
      const payUrl = buildPayUrl();
      const result = await generateInvoicePDF({
        ...form, remainingBalance: balance, remainingPayUrl: payUrl,
      });

      setStatus("sending");

      const payload = {
        client_names:      form.clientNames,
        client_email:      form.clientEmail,
        event_date:        fmtDateLong(form.eventDate),
        venue_name:        form.venueName || "—",
        deposit_paid:      fmtMoney(deposit),
        remaining_balance: fmtMoney(balance),
        due_date:          dueLabel || "14 days before your event",
        payment_link:      payUrl || "",
        note:              form.note || "",
        pdf_base64:        result.base64,
        pdf_filename:      result.filename,
      };

      const resp = await fetch(INVOICE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });
      if (!resp.ok) throw new Error(`Server responded ${resp.status}`);
      let json;
      try { json = await resp.json(); } catch { json = { success: true }; }
      if (json.success === false) throw new Error(json.error || "Script error");

      setStatus("success");
    } catch (err) {
      setErrMsg(err.message);
      setStatus("error");
    }
  };

  // ── Success ────────────────────────────────────────────────────────────────
  if (status === "success") {
    return (
      <div className="inv-page">
        <div className="inv-card inv-success">
          <div className="inv-success-icon">✓</div>
          <h2>Invoice Sent!</h2>
          <p>
            Thank-you email with deposit invoice sent to <strong>{form.clientEmail}</strong>.
          </p>
          {dueLabel && balance > 0 && (
            <p className="inv-success-balance">
              Remaining <strong>{fmtMoney(balance)}</strong> due by <strong>{dueLabel}</strong>.
            </p>
          )}
          <button
            className="inv-btn-secondary"
            onClick={() => { setStatus("idle"); setErrMsg(""); }}
          >
            Send Another
          </button>
        </div>
      </div>
    );
  }

  const busy = status === "generating" || status === "sending";

  return (
    <div className="inv-page">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <div className="inv-header">
        <h1>Deposit Invoice</h1>
        <p>Generate and send a thank-you email with a paid deposit receipt and remaining balance info.</p>
      </div>

      {/* ── Form card ─────────────────────────────────────────────────────── */}
      <div className="inv-card">

        {/* Client */}
        <div className="inv-section">
          <h3 className="inv-section-title">Client</h3>
          <div className="inv-grid">
            <div className="inv-field span2">
              <label className="inv-label">Couple / Client Names</label>
              <input type="text" name="clientNames" className="inv-input"
                placeholder="Emily & Jake Johnson"
                value={form.clientNames} onChange={handleChange} />
            </div>
            <div className="inv-field">
              <label className="inv-label">Client Email</label>
              <input type="email" name="clientEmail" className="inv-input"
                placeholder="couple@email.com"
                value={form.clientEmail} onChange={handleChange} />
            </div>
            <div className="inv-field">
              <label className="inv-label">Venue <span className="inv-optional">(optional)</span></label>
              <input type="text" name="venueName" className="inv-input"
                placeholder="The Nicollet Island Pavilion"
                value={form.venueName} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* Event + Payment Date */}
        <div className="inv-section">
          <h3 className="inv-section-title">Dates</h3>
          <div className="inv-grid">
            <div className="inv-field">
              <label className="inv-label">Wedding / Event Date</label>
              <input type="date" name="eventDate" className="inv-input inv-date"
                value={form.eventDate} onChange={handleChange} />
              {dueLabel && (
                <span className="inv-hint">Balance due by {dueLabel}</span>
              )}
            </div>
            <div className="inv-field">
              <label className="inv-label">Deposit Received Date</label>
              <input type="date" name="paymentDate" className="inv-input inv-date"
                value={form.paymentDate} onChange={handleChange} />
              <span className="inv-hint">Shown as "paid on" date on invoice</span>
            </div>
          </div>
        </div>

        {/* Amounts */}
        <div className="inv-section">
          <h3 className="inv-section-title">Amounts</h3>
          <div className="inv-grid">
            <div className="inv-field">
              <label className="inv-label">Total Contract Amount</label>
              <div className="inv-money-wrap">
                <span className="inv-dollar">$</span>
                <input type="number" name="totalAmount" className="inv-input inv-input-money"
                  placeholder="0.00" min="0" step="0.01"
                  value={form.totalAmount} onChange={handleChange} />
              </div>
            </div>
            <div className="inv-field">
              <label className="inv-label">Deposit Paid</label>
              <div className="inv-money-wrap">
                <span className="inv-dollar">$</span>
                <input type="number" name="depositPaid" className="inv-input inv-input-money"
                  placeholder="0.00" min="0" step="0.01"
                  value={form.depositPaid} onChange={handleChange} />
              </div>
            </div>
          </div>

          {(total > 0 || deposit > 0) && (
            <div className="inv-balance-box">
              <div className="inv-balance-row">
                <span>Total</span><span>{fmtMoney(total)}</span>
              </div>
              <div className="inv-balance-row paid">
                <span>Deposit paid</span><span>− {fmtMoney(deposit)}</span>
              </div>
              <div className="inv-balance-row remaining">
                <span>Remaining balance</span><span>{fmtMoney(balance)}</span>
              </div>
              {dueLabel && (
                <div className="inv-balance-row due">
                  <span>Due by</span><span>{dueLabel}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Options */}
        <div className="inv-section">
          <h3 className="inv-section-title">Options</h3>

          <label className="inv-check">
            <input
              type="checkbox"
              name="includePayLink"
              checked={form.includePayLink}
              onChange={handleChange}
            />
            Include a payment link for the remaining balance on the invoice
          </label>

          <div className="inv-field" style={{ marginTop: "1.25rem" }}>
            <label className="inv-label">Note <span className="inv-optional">(optional)</span></label>
            <textarea
              name="note"
              className="inv-input inv-textarea"
              placeholder="Any extra message to include in the email or on the invoice…"
              value={form.note}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Error */}
        {status === "error" && errMsg && (
          <div className="inv-error">{errMsg}</div>
        )}

        {/* Actions */}
        <div className="inv-actions">
          <button className="inv-btn-secondary" onClick={handlePreview} disabled={busy}>
            {status === "generating" ? "Generating…" : "Download PDF Preview"}
          </button>
          <button className="inv-btn-primary" onClick={handleSend} disabled={busy}>
            {status === "generating" ? "Generating PDF…"
              : status === "sending" ? "Sending…"
              : "Send Thank You + Invoice"}
          </button>
        </div>

      </div>
    </div>
  );
};

export default Invoice;
