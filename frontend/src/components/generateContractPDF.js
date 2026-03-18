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
  //  3. COMPENSATION
  // ═════════════════════════════════════════════════════════
  sectionTitle("3. Compensation");
  const total   = parseFloat(form.totalFee) || 0;
  const discD   = parseFloat(form.discountDollar) || 0;
  const discP   = parseFloat(form.discountPercent) || 0;
  const adjusted = Math.max(0, total - discD);
  const deposit = parseFloat(form.depositAmount) || 0;
  const balance = Math.max(0, adjusted - deposit).toFixed(2);

  if (discD > 0) {
    fieldRow([
      { label: "Base Fee",      value: `$${form.totalFee}` },
      { label: "Discount",      value: discP > 0
          ? `-$${discD.toFixed(2)} (${discP}%)`
          : `-$${discD.toFixed(2)}` },
      { label: "Adjusted Total", value: `$${adjusted.toFixed(2)}` },
    ]);
  } else {
    fieldRow([{ label: "Total Fee", value: `$${form.totalFee}` }]);
  }
  fieldRow([
    { label: "Deposit (50%)",  value: `$${form.depositAmount}` },
    { label: "Balance Due",    value: `$${balance}` },
    { label: "Overtime Rate",  value: "$150/hr" },
  ]);
  body(
    discD > 0
      ? `Deposit of 50% of the adjusted total ($${adjusted.toFixed(2)}) is due upon signing to reserve the date. Balance due no later than 14 days before the event. Payment accepted via cash, check, Venmo, or Zelle.`
      : "Deposit of 50% is due upon signing to reserve the date. Balance due no later than 14 days before the event. Payment accepted via cash, check, Venmo, or Zelle.",
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
