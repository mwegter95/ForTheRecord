// ─────────────────────────────────────────────────────────────
// generateContractPDF.js
// Loads jsPDF from CDN at runtime and generates a signed
// wedding DJ contract PDF without adding to the build bundle.
// ─────────────────────────────────────────────────────────────

const JSPDF_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js";

function loadjsPDF() {
  return new Promise((resolve, reject) => {
    if (window.jspdf && window.jspdf.jsPDF) {
      resolve(window.jspdf.jsPDF);
      return;
    }
    const script = document.createElement("script");
    script.src = JSPDF_CDN;
    script.onload = () => resolve(window.jspdf.jsPDF);
    script.onerror = () => reject(new Error("Failed to load jsPDF"));
    document.head.appendChild(script);
  });
}

function fmt12h(t) {
  if (!t) return "—";
  const [h, m] = t.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

function fmtDate(d) {
  if (!d) return "—";
  const date = new Date(d + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// Color constants [R, G, B]
const NAVY    = [10, 17, 40];
const GOLD    = [201, 168, 106];
const MUTED   = [107, 114, 128];
const CHARCOAL = [45, 49, 66];
const LIGHT   = [209, 213, 219];

async function generateContractPDF(form, signature, signedDate) {
  const jsPDF = await loadjsPDF();

  const doc = new jsPDF({ unit: "pt", format: "letter" });

  const PW = 612;     // page width
  const PH = 792;     // page height
  const M  = 56;      // margin
  const CW = PW - M * 2; // content width

  let y = M;

  // ── Page footer ───────────────────────────────────────────
  const addFooter = () => {
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.line(M, PH - 40, PW - M, PH - 40);

    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...MUTED);
    doc.text("For the Record  •  fortherecordmn.com", M, PH - 27);
    doc.text(`Signed: ${signedDate}`, PW - M, PH - 27, { align: "right" });

    const n = doc.internal.getNumberOfPages();
    doc.text(
      `Page ${doc.internal.getCurrentPageInfo().pageNumber} of ${n}`,
      PW / 2,
      PH - 14,
      { align: "center" }
    );
  };

  // ── Page break guard ──────────────────────────────────────
  const pb = (needed = 36) => {
    if (y + needed > PH - 60) {
      doc.addPage();
      y = M;
    }
  };

  // ── Section title ─────────────────────────────────────────
  const sectionTitle = (text) => {
    y += 12;
    pb(28);
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.5);
    doc.line(M, y + 2, M + CW, y + 2);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...NAVY);
    doc.text(text, M, y - 1);
    y += 14;
  };

  // ── Body text (wraps) ─────────────────────────────────────
  const body = (text, indent = 0, color = CHARCOAL) => {
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, CW - indent);
    pb(lines.length * 13 + 4);
    doc.text(lines, M + indent, y);
    y += lines.length * 13 + 4;
  };

  // ── Bullet ────────────────────────────────────────────────
  const bullet = (text) => {
    pb(24);
    doc.setFillColor(...GOLD);
    doc.circle(M + 6, y - 3, 2, "F");
    doc.setFontSize(9.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...CHARCOAL);
    const lines = doc.splitTextToSize(text, CW - 18);
    doc.text(lines, M + 16, y);
    y += lines.length * 13 + 2;
  };

  // ── Field rows ────────────────────────────────────────────
  const fieldRow = (fields) => {
    pb(28);
    const colW = CW / fields.length;
    fields.forEach((f, i) => {
      const x = M + i * colW;
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text(f.label.toUpperCase(), x, y);
      doc.setFontSize(9.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(...NAVY);
      doc.text(f.value || "—", x, y + 12);
    });
    y += 27;
  };

  // ═════════════════════════════════════════════════════════
  //  HEADER
  // ═════════════════════════════════════════════════════════
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text("Wedding DJ Services Agreement", PW / 2, y, { align: "center" });
  y += 10;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text(
    "FOR THE RECORD  •  MICHAEL WEGTER  •  michael@fortherecordmn.com  •  (612) 389-7005",
    PW / 2,
    y + 10,
    { align: "center" }
  );
  y += 22;

  doc.setDrawColor(...NAVY);
  doc.setLineWidth(1.5);
  doc.line(M, y, PW - M, y);
  y += 14;

  body(
    'This Agreement ("Agreement") is entered into between For the Record operated by Michael Wegter ("DJ") and the undersigned client(s) ("Client") for professional disc jockey and sound services at the wedding event described below. By signing, both parties agree to all terms herein.',
    0,
    [75, 85, 99]
  );
  y += 4;

  // ═════════════════════════════════════════════════════════
  //  1. EVENT DETAILS
  // ═════════════════════════════════════════════════════════
  sectionTitle("1. Event Details");
  fieldRow([{ label: "Client Name(s)", value: form.clientNames }]);
  fieldRow([
    { label: "Email", value: form.clientEmail },
    { label: "Phone", value: form.clientPhone },
  ]);
  fieldRow([
    { label: "Event Date", value: fmtDate(form.eventDate) },
    { label: "Estimated Guests", value: form.guestCount || "—" },
  ]);
  fieldRow([{ label: "Venue", value: form.venueName }]);
  if (form.venueAddress) {
    fieldRow([
      {
        label: "Address",
        value: `${form.venueAddress}, ${form.venueCity}, ${form.venueState} ${form.venueZip}`,
      },
    ]);
  }
  fieldRow([
    { label: "Music Start Time", value: fmt12h(form.startTime) },
    { label: "Music End Time",   value: fmt12h(form.endTime) },
  ]);

  // ═════════════════════════════════════════════════════════
  //  2. SERVICES
  // ═════════════════════════════════════════════════════════
  sectionTitle("2. Services Provided");
  bullet("Professional audio equipment and setup with backup gear");
  bullet("Music curation and live mixing for ceremony and/or reception");
  bullet("Wireless microphone(s) for announcements, speeches, and toasts");
  bullet("Arrival at least 2 hours before event start for setup and sound check");
  bullet("Teardown and equipment removal following the event");

  // ═════════════════════════════════════════════════════════
  //  3. SERVICES & COMPENSATION
  // ═════════════════════════════════════════════════════════
  sectionTitle("3. Services & Compensation");

  // Build service line items
  const RATES_LOCAL = {
    setupTeardown: 200,
    reception: 100, cocktail: 75, dinner: 75, ceremony: 100,
    ceremonyMic: 150, dancefloor: 150, uplighting6: 250, uplighting12: 500,
    mileage: 0.50,
  };
  const rHrs = parseFloat(form.receptionHours) || 0;
  const cHrs = parseFloat(form.cocktailHours)  || 0;
  const dHrs = parseFloat(form.dinnerHours)    || 0;
  const eHrs = parseFloat(form.ceremonyHours)  || 0;
  const svcItems = [];
  if (form.setupTeardown)   svcItems.push({ name: "Reception Setup & Teardown",       rate: "$200 flat",     qty: "1",        amt: RATES_LOCAL.setupTeardown });
  if (rHrs > 0) svcItems.push({ name: "Reception / Dance DJ",          rate: "$100/hr",       qty: `${rHrs} hrs`,  amt: rHrs * RATES_LOCAL.reception  });
  if (cHrs > 0) svcItems.push({ name: "Cocktail Hour Music",           rate: "$75/hr",        qty: `${cHrs} hrs`,  amt: cHrs * RATES_LOCAL.cocktail   });
  if (dHrs > 0) svcItems.push({ name: "Dinner Music",                  rate: "$75/hr",        qty: `${dHrs} hrs`,  amt: dHrs * RATES_LOCAL.dinner     });
  if (eHrs > 0) svcItems.push({ name: "Ceremony Music",                rate: "$100/hr",       qty: `${eHrs} hrs`,  amt: eHrs * RATES_LOCAL.ceremony   });
  if (form.ceremonyMic)         svcItems.push({ name: "Ceremony Mic & Speaker Setup",   rate: "$150 flat", qty: "1",        amt: RATES_LOCAL.ceremonyMic  });
  if (form.dancefloor)          svcItems.push({ name: "Reception Dancefloor Lighting",  rate: "$150 flat", qty: "1",        amt: RATES_LOCAL.dancefloor   });
  if (form.uplighting === "6")  svcItems.push({ name: "Ambient Uplighting",             rate: "$250 / 6 units", qty: "6 units",  amt: RATES_LOCAL.uplighting6  });
  if (form.uplighting === "12") svcItems.push({ name: "Ambient Uplighting",             rate: "$500 / 12 units", qty: "12 units", amt: RATES_LOCAL.uplighting12 });
  const mMi = parseFloat(form.mileageMiles) || 0;
  if (mMi > 0) svcItems.push({ name: "Venue Mileage (round trip)", rate: "$0.50/mi", qty: `${mMi} mi`, amt: mMi * RATES_LOCAL.mileage });

  const subtotal = svcItems.reduce((s, r) => s + r.amt, 0);
  const discD    = parseFloat(form.discountDollar)  || 0;
  const discP    = parseFloat(form.discountPercent) || 0;
  const adjusted = Math.max(0, subtotal - discD);
  const deposit  = adjusted / 2;
  const balance  = Math.max(0, adjusted - deposit);

  // ── Draw service table ──────────────────────────────────
  const colN   = CW * 0.43;
  const colR   = CW * 0.16;
  // colQ = CW * 0.23; colAmt uses the remaining width
  const tRowH  = 20;
  const tHdrH  = 16;
  const tTotal = svcItems.length * tRowH + tHdrH;
  pb(tTotal + 100);

  const tStartY = y;

  // Header bar
  doc.setFillColor(10, 17, 40);
  doc.rect(M, y, CW, tHdrH, "F");
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text("SERVICE",  M + 6,                    y + 11);
  doc.text("RATE",     M + colN + 6,              y + 11);
  doc.text("QTY",      M + colN + colR + 6,       y + 11);
  doc.text("AMOUNT",   M + CW - 5,               y + 11, { align: "right" });
  y += tHdrH;

  // Data rows
  svcItems.forEach((row, i) => {
    if (i % 2 !== 0) {
      doc.setFillColor(249, 250, 251);
      doc.rect(M, y, CW, tRowH, "F");
    }
    // Name
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(45, 49, 66);
    doc.text(row.name, M + 6, y + 13);
    // Rate
    doc.setFontSize(8);
    doc.setTextColor(107, 114, 128);
    doc.text(row.rate, M + colN + 6, y + 13);
    // Qty
    doc.setFontSize(8.5);
    doc.setTextColor(45, 49, 66);
    doc.text(row.qty, M + colN + colR + 6, y + 13);
    // Amount
    doc.setFont("helvetica", "bold");
    doc.setTextColor(10, 17, 40);
    doc.text("$" + row.amt.toFixed(2), M + CW - 5, y + 13, { align: "right" });
    // Row divider
    doc.setDrawColor(209, 213, 219);
    doc.setLineWidth(0.25);
    doc.line(M, y + tRowH, M + CW, y + tRowH);
    y += tRowH;
  });

  // Table outer border
  doc.setDrawColor(209, 213, 219);
  doc.setLineWidth(0.5);
  doc.rect(M, tStartY, CW, y - tStartY);

  y += 6;

  // ── Totals ─────────────────────────────────────────────
  const totLX = M + Math.round(CW * 0.52);
  const totRX = M + CW;
  const totRowH = 16;

  const totRow = (label, value, opts) => {
    const o = opts || {};
    pb(20);
    if (o.bg) {
      doc.setFillColor(o.bg[0], o.bg[1], o.bg[2]);
      doc.rect(totLX - 4, y - 11, totRX - totLX + 9, totRowH, "F");
    }
    doc.setFontSize(o.sz || 9);
    doc.setFont("helvetica", o.bold ? "bold" : "normal");
    doc.setTextColor(o.labelColor ? o.labelColor[0] : 45, o.labelColor ? o.labelColor[1] : 49, o.labelColor ? o.labelColor[2] : 66);
    doc.text(label, totLX, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(o.valueColor ? o.valueColor[0] : 10, o.valueColor ? o.valueColor[1] : 17, o.valueColor ? o.valueColor[2] : 40);
    doc.text(value, totRX, y, { align: "right" });
    y += totRowH;
  };

  // Subtotal row
  totRow("Subtotal", "$" + subtotal.toFixed(2));

  // Discount rows (if any)
  if (discD > 0) {
    const dLabel = discP > 0 ? "Discount (" + discP + "%)" : "Discount";
    pb(20);
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(5, 150, 105);
    doc.text(dLabel, totLX, y);
    doc.setFont("helvetica", "bold");
    doc.text("-$" + discD.toFixed(2), totRX, y, { align: "right" });
    y += totRowH;

    // Adjusted total
    totRow("Adjusted Total", "$" + adjusted.toFixed(2), {
      bg: [253, 248, 235],
      bold: true,
    });
  }

  // Deposit
  totRow(
    "Deposit Due Upon Signing (50%)",
    "$" + deposit.toFixed(2),
    { sz: 8.5, labelColor: [107, 114, 128], valueColor: [107, 114, 128] }
  );

  // Balance due — dark highlight
  pb(22);
  doc.setFillColor(10, 17, 40);
  doc.rect(totLX - 4, y - 11, totRX - totLX + 9, 18, "F");
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(201, 168, 106);
  doc.text("Balance Due", totLX + 2, y);
  doc.setTextColor(255, 255, 255);
  doc.text("$" + balance.toFixed(2), totRX - 2, y, { align: "right" });
  y += 22;

  // Payment terms
  body(
    discD > 0
      ? `Deposit of 50% of the adjusted total ($${adjusted.toFixed(2)}) is due upon signing to reserve the date. Balance due no later than 14 days before the event. Payment accepted via cash, check, Venmo, or Zelle. Overtime beyond contracted hours: $150/hr.`
      : "Deposit of 50% is due upon signing to reserve the date. Balance due no later than 14 days before the event. Payment accepted via cash, check, Venmo, or Zelle. Overtime beyond contracted hours: $150/hr.",
    0,
    [75, 85, 99]
  );
  if (discP > 0) {
    body(
      `The ${discP}% discount applied herein will also be applied to any additional services or costs agreed upon beyond the contracted scope of this Agreement.`,
      0,
      [75, 85, 99]
    );
  }

  // ═════════════════════════════════════════════════════════
  //  4. CANCELLATION
  // ═════════════════════════════════════════════════════════
  sectionTitle("4. Cancellation & Refund Policy");
  bullet("60+ days before the event: Deposit is fully refundable.");
  bullet("Fewer than 60 days before the event: Deposit is non-refundable.");
  bullet(
    "If DJ cancels for any reason: Full deposit will be refunded and DJ will make reasonable efforts to help Client find a replacement."
  );

  // ═════════════════════════════════════════════════════════
  //  5. LIABILITY
  // ═════════════════════════════════════════════════════════
  sectionTitle("5. Limitation of Liability");
  body(
    "DJ shall not be held liable for any injury, damage, or loss to persons or property occurring at or in connection with the event venue. Client assumes responsibility for the safety of all guests and the condition of the event space. DJ's total liability under this Agreement shall not exceed the Total Fee paid by Client."
  );

  // ═════════════════════════════════════════════════════════
  //  6. FORCE MAJEURE
  // ═════════════════════════════════════════════════════════
  sectionTitle("6. Force Majeure");
  body(
    "Neither party shall be liable for failure to perform due to circumstances beyond their reasonable control, including but not limited to: severe weather, natural disasters, public health emergencies, venue closures, power failures, or government restrictions. The parties will work in good faith to reschedule. Any deposit paid will be applied to the rescheduled date or refunded in full if rescheduling is not possible within 12 months."
  );

  // ═════════════════════════════════════════════════════════
  //  7. EQUIPMENT & VENUE
  // ═════════════════════════════════════════════════════════
  sectionTitle("7. Equipment & Venue Access");
  body(
    "DJ requires access to the venue at least 2 hours prior to the event start for setup and sound check. Client is responsible for ensuring adequate electrical power (minimum two dedicated 15-amp circuits) and a suitable setup area. DJ is responsible for the care and transport of all DJ-provided equipment. DJ is not responsible for damage to equipment caused by venue conditions, guests, or third parties."
  );

  // ═════════════════════════════════════════════════════════
  //  8. PERFORMANCE
  // ═════════════════════════════════════════════════════════
  sectionTitle("8. Performance");
  body(
    "DJ will perform for the agreed-upon hours as specified in Section 1. Overtime beyond the contracted end time is available at $150/hr, subject to DJ availability, and must be agreed upon at the event. Breaks of reasonable length may be taken during the performance."
  );

  // ═════════════════════════════════════════════════════════
  //  9. GENERAL
  // ═════════════════════════════════════════════════════════
  sectionTitle("9. General Provisions");
  body(
    "This Agreement constitutes the entire agreement between the parties and supersedes all prior discussions. It shall be governed by the laws of the State of Minnesota. Any modifications must be in writing and signed by both parties. If any provision is found unenforceable, remaining provisions remain in full effect."
  );

  // ═════════════════════════════════════════════════════════
  //  10. AMENDMENT & SUPERSESSION
  // ═════════════════════════════════════════════════════════
  sectionTitle("10. Amendment & Supersession");
  body(
    "The parties acknowledge that the scope of services, event details, pricing, or other terms of this Agreement may evolve prior to the event date. This Agreement may be amended, updated, or superseded in its entirety by a subsequent written agreement executed by both parties. Upon execution of any such subsequent agreement pertaining to the same event described herein, the most recently executed agreement shall govern in all respects and shall render prior versions null and void as to any conflicting terms. No amendment shall be binding unless reduced to writing and agreed upon by both parties; provided, however, that verbal agreements confirmed in writing (including by email) by both parties shall constitute a valid amendment for purposes of this section."
  );

  // ═════════════════════════════════════════════════════════
  //  ADDITIONAL NOTES
  // ═════════════════════════════════════════════════════════
  if (form.specialNotes && form.specialNotes.trim()) {
    sectionTitle("Additional Notes");
    body(form.specialNotes);
  }

  // ═════════════════════════════════════════════════════════
  //  SIGNATURES
  // ═════════════════════════════════════════════════════════
  pb(200);
  sectionTitle("Signatures");
  body(
    "By signing below, the Client acknowledges having read, understood, and agreed to all terms and conditions of this Agreement.",
    0,
    [75, 85, 99]
  );
  y += 10;

  const sigBoxH = 88;
  const halfW   = (CW - 36) / 2;
  const djX     = M + halfW + 36;

  // ── Client sig box ──
  doc.setDrawColor(...LIGHT);
  doc.setLineWidth(0.5);
  doc.roundedRect(M, y, halfW, sigBoxH, 4, 4);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text("CLIENT SIGNATURE", M + 8, y + 14);

  if (signature) {
    try {
      doc.addImage(signature, "PNG", M + 6, y + 18, halfW - 12, 46);
    } catch (_) { /* signature may be empty */ }
  }

  doc.setDrawColor(...LIGHT);
  doc.line(M + 8, y + sigBoxH - 22, M + halfW - 8, y + sigBoxH - 22);

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...NAVY);
  doc.text(form.clientPrintedName || "—", M + 8, y + sigBoxH - 10);

  // ── DJ sig box ──
  doc.setDrawColor(...LIGHT);
  doc.setLineWidth(0.5);
  doc.roundedRect(djX, y, halfW, sigBoxH, 4, 4);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text("DJ — FOR THE RECORD", djX + 8, y + 14);

  doc.setFontSize(16);
  doc.setFont("helvetica", "bolditalic");
  doc.setTextColor(...NAVY);
  doc.text("Michael Wegter", djX + 8, y + 46);

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text("michael@fortherecordmn.com", djX + 8, y + 60);
  doc.text("(612) 389-7005", djX + 8, y + 72);

  doc.setFontSize(7.5);
  doc.setTextColor(156, 163, 175);
  doc.text("DJ will countersign upon receipt.", djX + 8, y + 83);

  y += sigBoxH + 14;

  doc.setFontSize(8.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...MUTED);
  doc.text(`Date signed by client: ${signedDate}`, M, y);

  // ── Footers on all pages ──
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    addFooter();
  }

  // ── Save & return base64 for email attachment ──
  const safeName = (form.clientNames || "Client")
    .replace(/[^a-zA-Z0-9]/g, "_")
    .replace(/_+/g, "_");
  const dateStr = (form.eventDate || "").replace(/-/g, "");
  const filename = `ForTheRecord_Contract_${safeName}_${dateStr}.pdf`;

  // Return base64 string (no data URI prefix) for email attachment
  const base64 = doc.output("datauristring").split(",")[1];
  return { filename, base64 };
}

export default generateContractPDF;
