// ─────────────────────────────────────────────────────────────────────────────
// generateInvoicePDF.js
// Generates a paid-deposit invoice PDF using jsPDF (loaded from CDN).
// Returns { filename: string, base64: string }
// ─────────────────────────────────────────────────────────────────────────────

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

// ── Color helpers ──────────────────────────────────────────────────────────────
const NAVY = [10, 17, 40];
const GOLD = [201, 168, 106];
const CREAM = [248, 246, 241];
const MUTED = [107, 114, 128];
const LIGHT = [229, 231, 235];
const GREEN = [5, 150, 105];
const AMBER = [180, 120, 20];

function setFill(doc, rgb) {
  doc.setFillColor(...rgb);
}
function setDraw(doc, rgb) {
  doc.setDrawColor(...rgb);
}
function setFont(doc, rgb) {
  doc.setTextColor(...rgb);
}

function fmtMoney(n) {
  return (
    "$" +
    parseFloat(n || 0)
      .toFixed(2)
      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")
  );
}

function fmtDate(iso) {
  if (!iso) return "—";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function addDays(isoDate, days) {
  const d = new Date(isoDate + "T00:00:00");
  d.setDate(d.getDate() + days);
  return d;
}

function dueDateStr(isoEventDate) {
  if (!isoEventDate) return "14 days before your event";
  const due = addDays(isoEventDate, -14);
  return due.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── Invoice number ─────────────────────────────────────────────────────────────
function invoiceNum() {
  const d = new Date();
  const yr = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.floor(Math.random() * 900 + 100);
  return `FTR-${yr}${mo}${day}-${rand}`;
}

// ── Main export ────────────────────────────────────────────────────────────────
async function generateInvoicePDF(params) {
  const {
    clientNames,
    clientEmail,
    eventDate, // "YYYY-MM-DD"
    venueName,
    totalAmount, // number or string
    depositPaid, // number or string
    paymentDate, // "YYYY-MM-DD" (when deposit was received)
    remainingBalance, // number or string (optional — computed if omitted)
    remainingPayUrl, // URL for paying remaining balance (optional)
    note, // optional extra note
  } = params;

  const jsPDF = await loadjsPDF();

  const total = parseFloat(totalAmount || 0);
  const deposit = parseFloat(depositPaid || 0);
  const balance =
    parseFloat(remainingBalance) >= 0
      ? parseFloat(remainingBalance)
      : Math.max(0, total - deposit);
  const invNum = invoiceNum();
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const dueDate = dueDateStr(eventDate);

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "pt",
    format: "letter",
  });
  const W = doc.internal.pageSize.getWidth(); // 612 pt
  // const H = doc.internal.pageSize.getHeight(); // 792 pt
  const MARGIN = 54;

  let y = 0; // running y cursor

  // ── Header bar ────────────────────────────────────────────────────────────────
  setFill(doc, NAVY);
  doc.rect(0, 0, W, 90, "F");

  // Brand name
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  setFont(doc, GOLD);
  doc.text("For the Record", MARGIN, 42);

  // Tagline
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  setFont(doc, CREAM);
  doc.text("DJ & Event Services · Minneapolis, MN", MARGIN, 60);

  // "INVOICE" label (right side)
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  setFont(doc, GOLD);
  doc.text("INVOICE", W - MARGIN, 52, { align: "right" });

  y = 110;

  // ── Invoice meta (right column) ────────────────────────────────────────────
  const metaX = W / 2 + 20;

  const metaLines = [
    ["Invoice #:", invNum],
    ["Date:", today],
    ["Event Date:", fmtDate(eventDate)],
  ];

  doc.setFontSize(9);
  metaLines.forEach(([lbl, val]) => {
    doc.setFont("helvetica", "bold");
    setFont(doc, MUTED);
    doc.text(lbl, metaX, y);
    doc.setFont("helvetica", "normal");
    setFont(doc, NAVY);
    doc.text(val, metaX + 75, y);
    y += 16;
  });

  // ── Bill to (left column) ─────────────────────────────────────────────────
  let billY = 110;
  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  setFont(doc, MUTED);
  doc.text("BILL TO", MARGIN, billY);
  billY += 16;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  setFont(doc, NAVY);
  doc.text(clientNames || "—", MARGIN, billY);
  billY += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setFont(doc, MUTED);
  if (clientEmail) {
    doc.text(clientEmail, MARGIN, billY);
    billY += 14;
  }
  if (venueName) {
    doc.text(venueName, MARGIN, billY);
    billY += 14;
  }

  y = Math.max(y, billY) + 24;

  // ── Divider ───────────────────────────────────────────────────────────────
  setDraw(doc, GOLD);
  doc.setLineWidth(1.5);
  doc.line(MARGIN, y, W - MARGIN, y);
  y += 20;

  // ── Table header ─────────────────────────────────────────────────────────
  const col = { desc: MARGIN, status: 320, amount: W - MARGIN };

  setFill(doc, [238, 232, 220]); // very light gold-tinted cream
  doc.rect(MARGIN - 6, y - 14, W - MARGIN * 2 + 12, 22, "F");

  doc.setFontSize(9);
  doc.setFont("helvetica", "bold");
  setFont(doc, NAVY);
  doc.text("DESCRIPTION", col.desc, y);
  doc.text("STATUS", col.status, y);
  doc.text("AMOUNT", col.amount, y, { align: "right" });
  y += 24;

  // ── Row helper ────────────────────────────────────────────────────────────
  const tableRow = (
    desc,
    subDesc,
    statusLabel,
    statusColor,
    amount,
    paidOn,
  ) => {
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    setFont(doc, NAVY);
    doc.text(desc, col.desc, y);

    // Status badge
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    setFont(doc, statusColor);
    doc.text(statusLabel, col.status, y);

    // Amount
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    setFont(doc, NAVY);
    doc.text(amount, col.amount, y, { align: "right" });
    y += 14;

    // Sub description
    if (subDesc) {
      doc.setFontSize(8.5);
      doc.setFont("helvetica", "normal");
      setFont(doc, MUTED);
      doc.text(subDesc, col.desc, y);
      y += 12;
    }

    // Paid-on date
    if (paidOn) {
      doc.setFontSize(8);
      doc.setFont("helvetica", "italic");
      setFont(doc, statusColor);
      doc.text(paidOn, col.desc, y);
      y += 12;
    }

    // Light row separator
    setDraw(doc, LIGHT);
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y + 4, W - MARGIN, y + 4);
    y += 18;
  };

  // Deposit row
  tableRow(
    "Deposit — 50% of Total",
    `Full contract total: ${fmtMoney(total)}`,
    "✓  PAID",
    GREEN,
    fmtMoney(deposit),
    paymentDate ? `Received ${fmtDate(paymentDate)}` : null,
  );

  // Balance row
  tableRow(
    "Remaining Balance",
    `Due by ${dueDate}`,
    balance > 0 ? "OUTSTANDING" : "✓  PAID IN FULL",
    balance > 0 ? AMBER : GREEN,
    fmtMoney(balance),
    null,
  );

  y += 10;

  // ── Total box ────────────────────────────────────────────────────────────
  setFill(doc, NAVY);
  doc.roundedRect(W - MARGIN - 180, y, 180, 50, 6, 6, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  setFont(doc, CREAM);
  doc.text("REMAINING DUE", W - MARGIN - 90, y + 17, { align: "center" });

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  setFont(doc, GOLD);
  doc.text(fmtMoney(balance), W - MARGIN - 90, y + 38, { align: "center" });

  y += 70;

  // ── Payment instructions ──────────────────────────────────────────────────
  if (balance > 0) {
    setFill(doc, [245, 242, 235]);
    doc.roundedRect(
      MARGIN,
      y,
      W - MARGIN * 2,
      remainingPayUrl ? 100 : 60,
      6,
      6,
      "F",
    );

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9.5);
    setFont(doc, NAVY);
    doc.text("Payment Options", MARGIN + 14, y + 18);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setFont(doc, MUTED);
    doc.text(
      "Zelle: michael@fortherecordmn.com · Venmo: @fortherecordmn (2% fee)",
      MARGIN + 14,
      y + 34,
    );
    doc.text(
      "Credit / debit card: 3% processing fee applies",
      MARGIN + 14,
      y + 48,
    );

    if (remainingPayUrl) {
      // ── Clickable "Pay Remaining Balance" button ──
      const btnW = 220;
      const btnH = 28;
      const btnX = MARGIN + 14;
      const btnY = y + 60;
      setFill(doc, NAVY);
      doc.roundedRect(btnX, btnY, btnW, btnH, 5, 5, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9);
      setFont(doc, GOLD);
      doc.text("Pay Remaining Balance", btnX + btnW / 2, btnY + 18, {
        align: "center",
      });
      doc.link(btnX, btnY, btnW, btnH, { url: remainingPayUrl });
      y += 114;
    } else {
      y += 74;
    }
  }

  // ── Note ─────────────────────────────────────────────────────────────────
  if (note) {
    y += 8;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    setFont(doc, NAVY);
    doc.text("Note:", MARGIN, y);
    y += 14;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    setFont(doc, MUTED);
    const noteLines = doc.splitTextToSize(note, W - MARGIN * 2);
    doc.text(noteLines, MARGIN, y);
    y += noteLines.length * 13 + 10;
  }

  // ── Footer ────────────────────────────────────────────────────────────────
  const footerY = 750;
  setFill(doc, NAVY);
  doc.rect(0, footerY, W, 42, "F");

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  setFont(doc, CREAM);
  doc.text(
    "Thank you for choosing For the Record! · fortherecordmn.com · michael@fortherecordmn.com · (612) 389-7005",
    W / 2,
    footerY + 16,
    { align: "center" },
  );
  setFont(doc, GOLD);
  doc.text(
    "Questions? We're here to help make your day perfect.",
    W / 2,
    footerY + 30,
    { align: "center" },
  );

  // ── Export ────────────────────────────────────────────────────────────────
  const safeName = (clientNames || "Client")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .trim()
    .replace(/\s+/g, "_");
  const filename = `FTR_Invoice_${safeName}_${invNum}.pdf`;
  const base64 = doc.output("datauristring").split(",")[1];

  return { filename, base64, doc };
}

export default generateInvoicePDF;
