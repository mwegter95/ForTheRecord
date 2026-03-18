import React, { useState, useRef, useEffect, useCallback } from "react";
import useSEO from "../hooks/useSEO";
import "./CounterSign.scss";

// ─── Google Apps Script URL for countersign ──────────────────
// Paste your deployed CounterSign Apps Script URL here after setup
const COUNTERSIGN_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyBXpiURkxoACyvYO78txDC8bR5hgp_6MDlK3qZMn7jLg-iGaZfPhvf2l0Ie15NDTNFzA/exec";

// ─── pdf-lib CDN (for modifying PDFs) ────────────────────────
const PDFLIB_CDN = "https://unpkg.com/pdf-lib@1.17.1/dist/pdf-lib.min.js";

function loadPdfLib() {
  return new Promise((resolve, reject) => {
    if (window.PDFLib) { resolve(window.PDFLib); return; }
    const script = document.createElement("script");
    script.src = PDFLIB_CDN;
    script.onload = () => resolve(window.PDFLib);
    script.onerror = () => reject(new Error("Failed to load pdf-lib"));
    document.head.appendChild(script);
  });
}

// ─── PDF.js CDN (for rendering preview pages) ────────────────
const PDFJS_CDN        = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
const PDFJS_WORKER_CDN = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

function loadPdfJs() {
  return new Promise((resolve, reject) => {
    if (window.pdfjsLib) { resolve(window.pdfjsLib); return; }
    const script = document.createElement("script");
    script.src = PDFJS_CDN;
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
      resolve(window.pdfjsLib);
    };
    script.onerror = () => reject(new Error("Failed to load PDF.js"));
    document.head.appendChild(script);
  });
}

// ─── Inline SVG icons ────────────────────────────────────────
const IconCheck = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconTrash = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);
const IconUpload = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);
const IconAlertCircle = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
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

// ─── Password Gate ───────────────────────────────────────────
const PasswordGate = ({ onAuth }) => {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Password stored in .env.local as REACT_APP_COUNTERSIGN_PASSWORD (gitignored)
    if (pw === process.env.REACT_APP_COUNTERSIGN_PASSWORD) {
      onAuth();
    } else {
      setError(true);
      setPw("");
    }
  };

  return (
    <div className="cs-page cs-page--gate">
      <form className="cs-gate" onSubmit={handleSubmit}>
        <div className="cs-gate__logo">
          <img src="/images/favicon-192.png" alt="For the Record" />
        </div>
        <h2>DJ Portal</h2>
        <p>Enter your access code to countersign contracts.</p>
        <input
          type="password"
          value={pw}
          onChange={(e) => { setPw(e.target.value); setError(false); }}
          placeholder="Access code"
          autoFocus
          autoComplete="current-password"
        />
        {error && <p className="cs-gate__error">Incorrect code. Try again.</p>}
        <button type="submit">Continue</button>
      </form>
    </div>
  );
};

// ─── CounterSign Form ────────────────────────────────────────
const CounterSignForm = () => {
  const [pdfFile, setPdfFile]           = useState(null);
  const [pdfPages, setPdfPages]         = useState([]); // rendered page image URLs
  const [pdfRendering, setPdfRendering] = useState(false);
  const [clientEmail, setClientEmail]   = useState("");
  const [djName, setDjName]             = useState("Michael Wegter");
  const [signature, setSignature]       = useState("");
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [errorMsg, setErrorMsg]         = useState("");
  const fileInputRef = useRef(null);

  const renderPdfPages = useCallback(async (file) => {
    setPdfRendering(true);
    setPdfPages([]);
    try {
      const pdfjsLib   = await loadPdfJs();
      const arrayBuffer = await file.arrayBuffer();
      const pdf        = await pdfjsLib.getDocument({ data: new Uint8Array(arrayBuffer) }).promise;
      const pages      = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        const page     = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1.5 });
        const canvas   = document.createElement("canvas");
        canvas.width   = viewport.width;
        canvas.height  = viewport.height;
        await page.render({ canvasContext: canvas.getContext("2d"), viewport }).promise;
        pages.push(canvas.toDataURL("image/jpeg", 0.88));
      }
      setPdfPages(pages);
    } catch (err) {
      console.error("PDF preview failed:", err);
    } finally {
      setPdfRendering(false);
    }
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf") {
      setErrorMsg("Please select a PDF file.");
      return;
    }
    setErrorMsg("");
    setPdfFile(file);
    renderPdfPages(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!pdfFile) {
      setErrorMsg("Please upload the signed contract PDF.");
      setSubmitStatus("error");
      return;
    }
    if (!clientEmail) {
      setErrorMsg("Please enter the client's email address.");
      setSubmitStatus("error");
      return;
    }
    if (!signature) {
      setErrorMsg("Please draw your countersignature.");
      setSubmitStatus("error");
      return;
    }

    setSubmitStatus("sending");
    setErrorMsg("");

    const countersignDate = new Date().toLocaleDateString("en-US", {
      year: "numeric", month: "long", day: "numeric",
    });

    try {
      // ── Load pdf-lib ────────────────────────────────────
      const PDFLib = await loadPdfLib();
      const { PDFDocument, rgb, StandardFonts } = PDFLib;

      // ── Read uploaded PDF ────────────────────────────────
      const originalBytes = await pdfFile.arrayBuffer();
      const pdfDoc = await PDFDocument.load(originalBytes);

      // ── Embed DJ signature image ─────────────────────────
      // Convert data URL (PNG) to Uint8Array
      const sigDataUrl = signature;
      const sigBase64 = sigDataUrl.split(",")[1];
      const sigBytes = Uint8Array.from(atob(sigBase64), c => c.charCodeAt(0));
      const sigImage = await pdfDoc.embedPng(sigBytes);

      // ── Add a countersignature addendum page ─────────────
      const page = pdfDoc.addPage([612, 792]);
      const helveticaBold   = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helvetica       = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

      const NAVY   = rgb(10/255,  17/255,  40/255);
      const GOLD   = rgb(201/255, 168/255, 106/255);
      const MUTED  = rgb(107/255, 114/255, 128/255);
      const LIGHT  = rgb(209/255, 213/255, 219/255);
      const CHARCOAL = rgb(45/255, 49/255, 66/255);
      const PW = 612, PH = 792, M = 56;

      // ── Navy header bar ──────────────────────────────────
      page.drawRectangle({
        x: 0, y: PH - 70,
        width: PW, height: 70,
        color: NAVY,
      });
      page.drawText("FOR THE RECORD", {
        x: M, y: PH - 36,
        font: helveticaBold, size: 16,
        color: GOLD,
      });
      page.drawText("DJ Countersignature Addendum", {
        x: M, y: PH - 54,
        font: helvetica, size: 10,
        color: rgb(1, 1, 1),
      });

      // ── Gold divider ─────────────────────────────────────
      page.drawLine({
        start: { x: M, y: PH - 90 },
        end:   { x: PW - M, y: PH - 90 },
        thickness: 0.5,
        color: GOLD,
      });

      // ── Intro text ───────────────────────────────────────
      page.drawText("Countersignature Addendum", {
        x: M, y: PH - 116,
        font: helveticaBold, size: 13,
        color: NAVY,
      });

      const introText =
        "This addendum confirms that Michael Wegter, operating as For the Record (\"DJ\"),";
      const introText2 =
        "has reviewed and countersigned the Wedding DJ Services Agreement to which this";
      const introText3 =
        "addendum is attached. Both parties are bound by all terms of that Agreement.";

      page.drawText(introText,  { x: M, y: PH - 140, font: helvetica, size: 9.5, color: CHARCOAL });
      page.drawText(introText2, { x: M, y: PH - 154, font: helvetica, size: 9.5, color: CHARCOAL });
      page.drawText(introText3, { x: M, y: PH - 168, font: helvetica, size: 9.5, color: CHARCOAL });

      // ── Countersign date ─────────────────────────────────
      page.drawText("DATE COUNTERSIGNED", {
        x: M, y: PH - 202,
        font: helvetica, size: 7.5,
        color: MUTED,
      });
      page.drawText(countersignDate, {
        x: M, y: PH - 216,
        font: helveticaBold, size: 10,
        color: NAVY,
      });

      // ── DJ signature box ─────────────────────────────────
      const boxY = PH - 370;
      const boxW = 300;
      const boxH = 100;

      page.drawRectangle({
        x: M, y: boxY,
        width: boxW, height: boxH,
        borderColor: LIGHT, borderWidth: 0.5,
        color: rgb(1, 1, 1),
      });

      page.drawText("DJ COUNTERSIGNATURE — FOR THE RECORD", {
        x: M + 8, y: boxY + boxH - 16,
        font: helvetica, size: 7.5,
        color: MUTED,
      });

      // Draw signature image inside box
      const sigDims = sigImage.scaleToFit(boxW - 16, 56);
      page.drawImage(sigImage, {
        x: M + 8,
        y: boxY + boxH - 20 - sigDims.height,
        width: sigDims.width,
        height: sigDims.height,
      });

      // Signature line
      page.drawLine({
        start: { x: M + 8, y: boxY + 22 },
        end:   { x: M + boxW - 8, y: boxY + 22 },
        thickness: 0.5, color: LIGHT,
      });

      // Printed name
      page.drawText(djName, {
        x: M + 8, y: boxY + 10,
        font: helveticaBold, size: 9,
        color: NAVY,
      });

      // ── Contact info to the right of box ─────────────────
      const infoX = M + boxW + 28;
      page.drawText("Michael Wegter", {
        x: infoX, y: boxY + boxH - 20,
        font: helveticaBold, size: 10,
        color: NAVY,
      });
      page.drawText("For the Record", {
        x: infoX, y: boxY + boxH - 34,
        font: helveticaOblique, size: 9.5,
        color: MUTED,
      });
      page.drawText("michael@fortherecordmn.com", {
        x: infoX, y: boxY + boxH - 52,
        font: helvetica, size: 9,
        color: MUTED,
      });
      page.drawText("(612) 389-7005", {
        x: infoX, y: boxY + boxH - 66,
        font: helvetica, size: 9,
        color: MUTED,
      });
      page.drawText("fortherecordmn.com", {
        x: infoX, y: boxY + boxH - 80,
        font: helvetica, size: 9,
        color: MUTED,
      });

      // ── Footer ───────────────────────────────────────────
      page.drawLine({
        start: { x: M, y: 40 },
        end:   { x: PW - M, y: 40 },
        thickness: 0.5, color: GOLD,
      });
      page.drawText("For the Record  •  fortherecordmn.com", {
        x: M, y: 26,
        font: helvetica, size: 7.5,
        color: MUTED,
      });
      page.drawText(`Countersigned: ${countersignDate}`, {
        x: PW - M, y: 26,
        font: helvetica, size: 7.5,
        color: MUTED,
        maxWidth: 200,
      });

      // ── Save modified PDF ────────────────────────────────
      const modifiedBytes = await pdfDoc.save();

      // Convert to base64 without data URI prefix
      let binary = "";
      const chunk = 8192;
      for (let i = 0; i < modifiedBytes.length; i += chunk) {
        binary += String.fromCharCode(...modifiedBytes.subarray(i, i + chunk));
      }
      const base64 = btoa(binary);

      // Build a clean filename from the original
      const originalName = pdfFile.name.replace(/\.pdf$/i, "");
      const pdfFilename = originalName + "_Countersigned.pdf";

      // ── POST to Apps Script ──────────────────────────────
      const payload = {
        client_email:      clientEmail,
        dj_name:           djName,
        countersign_date:  countersignDate,
        pdf_base64:        base64,
        pdf_filename:      pdfFilename,
        original_filename: pdfFile.name,
      };

      const resp = await fetch(COUNTERSIGN_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (!resp.ok) throw new Error(`Apps Script responded with ${resp.status}`);
      setSubmitStatus("success");

    } catch (err) {
      console.error("Countersign submission failed:", err);
      setErrorMsg("Something went wrong. " + err.message);
      setSubmitStatus("error");
    }
  };

  if (submitStatus === "success") {
    return (
      <div className="cs-page">
        <div className="cs-card cs-success">
          <div className="cs-success__icon"><IconCheck /></div>
          <h2>Countersigned & Sent</h2>
          <p>The fully executed contract has been emailed to <strong>{clientEmail}</strong>.</p>
          <button className="cs-btn cs-btn--outline" onClick={() => {
            setPdfFile(null); setPdfPages([]); setClientEmail("");
            setSignature(""); setSubmitStatus("idle"); setErrorMsg("");
          }}>
            Countersign Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cs-page">
      <form className="cs-card" onSubmit={handleSubmit}>

        {/* ── Header ── */}
        <div className="cs-header">
          <img src="/images/favicon-192.png" alt="For the Record" className="cs-header__logo" />
          <h1>Countersign Contract</h1>
          <p className="cs-header__sub">For the Record — DJ Portal</p>
        </div>

        {/* ── Step 1: Upload PDF ── */}
        <div className="cs-section">
          <h2 className="cs-section__title">1. Upload Signed Contract</h2>
          <p className="cs-section__desc">Upload the PDF you received from the client.</p>

          <div
            className={`cs-upload ${pdfFile ? "cs-upload--loaded" : ""}`}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            {pdfFile ? (
              <div className="cs-upload__loaded">
                <span className="cs-upload__filename">{pdfFile.name}</span>
                <span className="cs-upload__change">Click to change</span>
              </div>
            ) : (
              <div className="cs-upload__prompt">
                <IconUpload />
                <span>Click to select PDF</span>
              </div>
            )}
          </div>

          {(pdfRendering || pdfPages.length > 0) && (
            <div className="cs-preview">
              {pdfRendering && (
                <p className="cs-preview__loading">Rendering pages…</p>
              )}
              {pdfPages.map((src, i) => (
                <img
                  key={i}
                  src={src}
                  alt={`Page ${i + 1}`}
                  className="cs-preview__page"
                />
              ))}
            </div>
          )}
        </div>

        {/* ── Step 2: Client email ── */}
        <div className="cs-section">
          <h2 className="cs-section__title">2. Client Email Address</h2>
          <p className="cs-section__desc">The countersigned PDF will be sent here.</p>
          <div className="cs-field">
            <label>Client Email <span className="req">*</span></label>
            <input
              type="email"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
              placeholder="client@example.com"
              required
            />
          </div>
        </div>

        {/* ── Step 3: Countersignature ── */}
        <div className="cs-section">
          <h2 className="cs-section__title">3. DJ Countersignature</h2>
          <p className="cs-section__desc">Sign below. This will be added to the PDF as a countersignature addendum.</p>
          <SignaturePad onSignatureChange={setSignature} />
          <div className="cs-field" style={{ marginTop: "0.75rem" }}>
            <label>Printed Name</label>
            <input
              type="text"
              value={djName}
              onChange={(e) => setDjName(e.target.value)}
              placeholder="Michael Wegter"
            />
          </div>
        </div>

        {/* ── Submit ── */}
        <div className="cs-submit-area">
          {submitStatus === "error" && (
            <div className="cs-error-msg">
              <IconAlertCircle /> {errorMsg}
            </div>
          )}
          <button
            type="submit"
            className="cs-btn cs-btn--primary"
            disabled={submitStatus === "sending"}
          >
            {submitStatus === "sending" ? "Processing…" : "Countersign & Send to Client"}
          </button>
          <p className="cs-submit-note">
            A countersignature addendum will be appended to the PDF and emailed to the client.
          </p>
        </div>

      </form>
    </div>
  );
};

// ─── Root Component ──────────────────────────────────────────
const CounterSign = () => {
  useSEO({
    title: "DJ Portal | For the Record",
    description: "Countersign wedding DJ contracts.",
    canonical: "https://fortherecordmn.com/countersign",
  });

  const [authed, setAuthed] = useState(false);

  if (!authed) {
    return <PasswordGate onAuth={() => setAuthed(true)} />;
  }
  return <CounterSignForm />;
};

export default CounterSign;
