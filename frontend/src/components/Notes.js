import React, { useState, useEffect, useCallback, useRef } from "react";
import "./Notes.scss";

// ─── Config ────────────────────────────────────────────────────────────────────
// Paste your deployed Google Apps Script URL here after deployment.
// Leave blank to use localStorage only.
const NOTES_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbzp_tnX3dumD8v4Dwp_ElV6H5h5XFgp6ZHoVojEhXWqC4iLg7C9RttFWZUtQOAF4Nfdjw/exec";
const STORAGE_KEY      = "ftr_client_notes";
const SAVE_DELAY       = 1500; // ms debounce before writing to Sheets

// ─── Section / field definitions ───────────────────────────────────────────────
// wide:true → field spans both grid columns (textarea, long text)
const SECTIONS = [
  {
    key: "eventInfo",
    label: "Event Info",
    fields: [
      { key: "venue",          label: "Venue",                        type: "text",     placeholder: "The Nicollet Island Pavilion",        wide: true },
      { key: "address",        label: "Address",                      type: "text",     placeholder: "1 Nicollet Island, Minneapolis, MN",  wide: true },
      { key: "guestCount",     label: "Guest Count",                  type: "text",     placeholder: "200" },
      { key: "phone",          label: "Client Phone",                 type: "text",     placeholder: "(612) 555-0100" },
      { key: "email",          label: "Client Email",                 type: "text",     placeholder: "couple@email.com" },
      { key: "calendarMarked", label: "Marked in Google Calendar",    type: "checkbox" },
    ],
  },
  {
    key: "services",
    label: "Services",
    fields: [
      { key: "receptionHours",  label: "Reception Hours",             type: "text",     placeholder: "5:00 PM – 10:00 PM" },
      { key: "ceremonyHours",   label: "Ceremony Hours",              type: "text",     placeholder: "3:00 PM – 3:30 PM" },
      { key: "cocktailHours",   label: "Cocktail Hours",              type: "text",     placeholder: "3:30 PM – 5:00 PM" },
      { key: "uplighting",      label: "Uplighting",                  type: "select",   options: ["None", "6 units", "12 units"] },
      { key: "setupTeardown",   label: "Setup & Teardown",            type: "checkbox" },
      { key: "ceremonyMic",     label: "Ceremony Mic",                type: "checkbox" },
      { key: "dancefloor",      label: "Dance Floor",                 type: "checkbox" },
    ],
  },
  {
    key: "timeline",
    label: "Timeline",
    fields: [
      { key: "guestsArrive",   label: "Guests Arrive",                type: "text",     placeholder: "4:30 PM" },
      { key: "musicStart",     label: "Music Start",                  type: "text",     placeholder: "5:00 PM" },
      { key: "dinnerTime",     label: "Dinner Time",                  type: "text",     placeholder: "6:00 PM" },
      { key: "danceTime",      label: "Dancing Starts",               type: "text",     placeholder: "7:30 PM" },
      { key: "musicEnd",       label: "Music End",                    type: "text",     placeholder: "10:00 PM" },
      { key: "otherEvents",    label: "Other Events / Notes",         type: "textarea", placeholder: "Cocktail hour in lobby, cake cutting at 8 PM…", wide: true },
    ],
  },
  {
    key: "weddingParty",
    label: "Wedding Party",
    fields: [
      { key: "brideName",      label: "Bride's Full Name",            type: "text",     placeholder: "Emily Johnson" },
      { key: "groomName",      label: "Groom's Full Name",            type: "text",     placeholder: "Jake Johnson" },
      { key: "introduceAs",    label: "Introduce Couple As",          type: "text",     placeholder: "Mr. & Mrs. Johnson",                wide: true },
      { key: "introSong",      label: "Intro Song",                   type: "text",     placeholder: "Song – Artist",                     wide: true },
      { key: "bestMan",        label: "Best Man",                     type: "text",     placeholder: "Name" },
      { key: "maidOfHonor",    label: "Maid of Honor",                type: "text",     placeholder: "Name" },
      { key: "partyAnnounced", label: "Wedding Party Announcement Order", type: "textarea", placeholder: "Names in the order they'll be announced…", wide: true },
    ],
  },
  {
    key: "specialDances",
    label: "Special Dances",
    fields: [
      { key: "firstDance",         label: "First Dance",              type: "text",     placeholder: "Song – Artist",  wide: true },
      { key: "fatherDaughter",     label: "Father / Daughter",        type: "text",     placeholder: "Song – Artist",  wide: true },
      { key: "motherSon",          label: "Mother / Son",             type: "text",     placeholder: "Song – Artist",  wide: true },
      { key: "weddingPartyDance",  label: "Wedding Party Dance",      type: "text",     placeholder: "Song – Artist",  wide: true },
      { key: "otherDances",        label: "Other Dances",             type: "textarea", placeholder: "Any other special dances or notes…", wide: true },
    ],
  },
  {
    key: "announcements",
    label: "Announcements",
    fields: [
      { key: "toastsWhen",     label: "Toasts (who & when)",          type: "text",     placeholder: "Best Man after dinner, MOH before cake…", wide: true },
      { key: "announceSeated", label: "Announce Guests Seated",       type: "checkbox" },
      { key: "cakeCutting",    label: "Cake Cutting",                 type: "checkbox" },
      { key: "dollarDance",    label: "Dollar Dance",                 type: "checkbox" },
      { key: "bouquetToss",    label: "Bouquet Toss",                 type: "checkbox" },
      { key: "garterToss",     label: "Garter Toss",                  type: "checkbox" },
    ],
  },
  {
    key: "music",
    label: "Music",
    fields: [
      { key: "playlistLink",   label: "Playlist Link",                type: "text",     placeholder: "Spotify / Apple Music URL",          wide: true },
      { key: "songsToPlay",    label: "Must-Play Songs",              type: "textarea", placeholder: "Songs to make sure get played…",     wide: true },
      { key: "songsNotToPlay", label: "Do Not Play",                  type: "textarea", placeholder: "Songs or artists to avoid…",         wide: true },
      { key: "genreNotes",     label: "Genre / Vibe Notes",           type: "textarea", placeholder: "Top 40, no country, heavy on 80s hits…", wide: true },
    ],
  },
  {
    key: "generalNotes",
    label: "General Notes",
    fields: [
      { key: "notes", label: "Notes", type: "textarea",
        placeholder: "Anything else to remember — venue quirks, coordinator contact, special requests, parking situation…",
        wide: true },
    ],
  },
];

const BOOLEAN_KEYS = new Set([
  "calendarMarked", "setupTeardown", "ceremonyMic", "dancefloor",
  "announceSeated", "cakeCutting", "dollarDance", "bouquetToss", "garterToss",
]);

// ─── Blank field defaults ───────────────────────────────────────────────────────
const blankFields = () => {
  const out = {};
  SECTIONS.forEach(s => s.fields.forEach(f => {
    if (BOOLEAN_KEYS.has(f.key)) out[f.key] = false;
    else if (f.type === "select") out[f.key] = f.options[0];
    else out[f.key] = "";
  }));
  return out;
};

// ─── New note factory ──────────────────────────────────────────────────────────
const newNote = () => ({
  id:          Date.now().toString(36) + Math.random().toString(36).slice(2),
  coupleNames: "",
  weddingDate: "",
  createdAt:   new Date().toISOString(),
  updatedAt:   new Date().toISOString(),
  ...blankFields(),
});

// ─── Local storage ─────────────────────────────────────────────────────────────
const loadLocal = () => {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; }
  catch { return []; }
};
const saveLocal = (notes) => {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)); }
  catch {}
};

// ─── Date / time helpers ───────────────────────────────────────────────────────
const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};
const fmtUpdated = (iso) => {
  const d   = new Date(iso);
  const sec = (Date.now() - d) / 1000;
  if (sec < 60)    return "Just now";
  if (sec < 3600)  return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
};

// ─── Google Sheets API helpers ─────────────────────────────────────────────────
const sheetsEnabled = () => !!NOTES_SCRIPT_URL;

const sheetsLoad = async () => {
  const res  = await fetch(`${NOTES_SCRIPT_URL}?action=load`);
  const data = await res.json();
  return data.notes || [];
};

const sheetsSave = async (note) => {
  await fetch(NOTES_SCRIPT_URL, {
    method: "POST",
    body:   JSON.stringify({ action: "save", ...note }),
  });
};

const sheetsDelete = async (id) => {
  await fetch(NOTES_SCRIPT_URL, {
    method: "POST",
    body:   JSON.stringify({ action: "delete", id }),
  });
};

// ─── Main component ────────────────────────────────────────────────────────────
const Notes = () => {
  const [notes,      setNotes]      = useState(loadLocal);
  const [selected,   setSelected]   = useState(null);   // note id
  const [search,     setSearch]     = useState("");
  const [confirm,    setConfirm]    = useState(null);   // id awaiting delete confirm
  const [saveStatus, setSaveStatus] = useState("");     // "saving" | "saved" | "error" | ""
  const [loading,    setLoading]    = useState(sheetsEnabled());

  const saveTimer = useRef(null);

  // ── Load from Sheets on mount ───────────────────────────────────────────────
  useEffect(() => {
    if (!sheetsEnabled()) return;
    sheetsLoad()
      .then(remote => {
        if (remote.length) {
          setNotes(remote);
          saveLocal(remote);
        }
      })
      .catch(err => console.error("Sheets load failed:", err))
      .finally(() => setLoading(false));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Persist to localStorage whenever notes change ───────────────────────────
  useEffect(() => { saveLocal(notes); }, [notes]);

  const currentNote = notes.find(n => n.id === selected) || null;

  // ── Debounced save to Google Sheets ────────────────────────────────────────
  const scheduleSave = useCallback((note) => {
    clearTimeout(saveTimer.current);
    setSaveStatus("saving");
    saveTimer.current = setTimeout(() => {
      if (!sheetsEnabled()) { setSaveStatus(""); return; }
      sheetsSave(note)
        .then(() => setSaveStatus("saved"))
        .catch(() => setSaveStatus("error"));
    }, SAVE_DELAY);
  }, []);

  // ── Update any field on the current note ───────────────────────────────────
  const updateField = useCallback((key, value) => {
    if (!currentNote) return;
    const now     = new Date().toISOString();
    const updated = { ...currentNote, [key]: value, updatedAt: now };
    setNotes(prev => prev.map(n => n.id === selected ? updated : n));
    scheduleSave(updated);
  }, [currentNote, selected, scheduleSave]);

  // ── New note ────────────────────────────────────────────────────────────────
  const handleNew = () => {
    const n = newNote();
    setNotes(prev => [n, ...prev]);
    setSelected(n.id);
    setSaveStatus("");
  };

  // ── Delete note ─────────────────────────────────────────────────────────────
  const handleDelete = (id) => {
    const remaining = notes.filter(n => n.id !== id);
    setNotes(remaining);
    if (selected === id) setSelected(remaining[0]?.id || null);
    setConfirm(null);
    setSaveStatus("");
    if (sheetsEnabled()) sheetsDelete(id).catch(err => console.error("Sheets delete failed:", err));
  };

  // ── Filtered + sorted list ──────────────────────────────────────────────────
  const filteredNotes = notes
    .filter(n => !search
      || n.coupleNames.toLowerCase().includes(search.toLowerCase())
      || (n.venue || "").toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  // ── Render a single field ───────────────────────────────────────────────────
  const renderField = (f) => {
    const val = currentNote
      ? currentNote[f.key] !== undefined
        ? currentNote[f.key]
        : (BOOLEAN_KEYS.has(f.key) ? false : f.type === "select" ? f.options[0] : "")
      : "";

    if (f.type === "checkbox") {
      return (
        <label key={f.key} className="notes-check-label">
          <input
            type="checkbox"
            className="notes-check-input"
            checked={!!val}
            onChange={e => updateField(f.key, e.target.checked)}
          />
          <span className="notes-check-box" />
          <span className="notes-check-text">{f.label}</span>
        </label>
      );
    }

    if (f.type === "select") {
      return (
        <div key={f.key} className={`notes-field-group${f.wide ? " full" : ""}`}>
          <label className="notes-label">{f.label}</label>
          <select
            className="notes-input notes-select"
            value={val}
            onChange={e => updateField(f.key, e.target.value)}
          >
            {f.options.map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        </div>
      );
    }

    if (f.type === "textarea") {
      return (
        <div key={f.key} className={`notes-field-group${f.wide ? " full" : ""}`}>
          <label className="notes-label">{f.label}</label>
          <textarea
            className="notes-textarea"
            placeholder={f.placeholder || ""}
            value={val}
            onChange={e => updateField(f.key, e.target.value)}
          />
        </div>
      );
    }

    // Default: text input
    return (
      <div key={f.key} className={`notes-field-group${f.wide ? " full" : ""}`}>
        <label className="notes-label">{f.label}</label>
        <input
          type="text"
          className="notes-input"
          placeholder={f.placeholder || ""}
          value={val}
          onChange={e => updateField(f.key, e.target.value)}
        />
      </div>
    );
  };

  // ── JSX ─────────────────────────────────────────────────────────────────────
  return (
    <div className="notes-page">

      {/* ── List panel ──────────────────────────────────────────────────────── */}
      <div className="notes-list-panel">
        <div className="notes-list-header">
          <h2>Client Notes</h2>
          <button className="notes-new-btn" onClick={handleNew}>+ New</button>
        </div>

        <div className="notes-search-wrap">
          <input
            type="text"
            className="notes-search"
            placeholder="Search couples or venues…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        {loading && <div className="notes-loading">Loading from Sheets…</div>}

        <div className="notes-list">
          {!loading && filteredNotes.length === 0 && (
            <div className="notes-empty-list">
              {search ? "No matches." : "No notes yet — create one!"}
            </div>
          )}
          {filteredNotes.map(n => (
            <div
              key={n.id}
              className={`notes-card${selected === n.id ? " active" : ""}`}
              onClick={() => { setSelected(n.id); setSaveStatus(""); }}
            >
              <div className="notes-card-top">
                <span className="notes-card-names">
                  {n.coupleNames || <em>Untitled couple</em>}
                </span>
                <span className="notes-card-updated">{fmtUpdated(n.updatedAt)}</span>
              </div>
              {n.weddingDate && <div className="notes-card-date">{fmtDate(n.weddingDate)}</div>}
              {n.venue       && <div className="notes-card-venue">{n.venue}</div>}
              {n.calendarMarked && <div className="notes-card-cal">📅 On calendar</div>}
            </div>
          ))}
        </div>
      </div>

      {/* ── Editor panel ────────────────────────────────────────────────────── */}
      <div className={`notes-editor-panel${currentNote ? " has-note" : ""}`}>
        {!currentNote ? (
          <div className="notes-editor-empty">
            <div className="notes-editor-empty-icon">📝</div>
            <p>Select a note or create a new one</p>
            <button className="notes-new-btn-lg" onClick={handleNew}>+ New Client Note</button>
          </div>
        ) : (
          <div className="notes-editor">

            {/* Top bar */}
            <div className="notes-editor-topbar">
              <span className={`notes-save-status${saveStatus ? " " + saveStatus : ""}`}>
                {saveStatus === "saving" && "Saving…"}
                {saveStatus === "saved"  && "✓ Saved"}
                {saveStatus === "error"  && "⚠ Save error"}
                {!saveStatus && (sheetsEnabled()
                  ? `Synced · ${fmtUpdated(currentNote.updatedAt)}`
                  : `Local · ${fmtUpdated(currentNote.updatedAt)}`
                )}
              </span>
              <button className="notes-delete-btn" onClick={() => setConfirm(currentNote.id)}>
                Delete
              </button>
            </div>

            {/* Scrollable editor body */}
            <div className="notes-editor-body">

              {/* ── Couple header (name + date) ──────────────────────────── */}
              <div className="notes-couple-header">
                <div className="notes-field-group full">
                  <label className="notes-label">Couple Names</label>
                  <input
                    type="text"
                    className="notes-input notes-input-hero"
                    placeholder="Emily & Jake Johnson"
                    value={currentNote.coupleNames}
                    onChange={e => updateField("coupleNames", e.target.value)}
                  />
                </div>
                <div className="notes-field-group">
                  <label className="notes-label">Wedding Date</label>
                  <input
                    type="date"
                    className="notes-input"
                    value={currentNote.weddingDate}
                    onChange={e => updateField("weddingDate", e.target.value)}
                  />
                </div>
              </div>

              {/* ── Sections ────────────────────────────────────────────── */}
              {SECTIONS.map(section => {
                const regularFields  = section.fields.filter(f => f.type !== "checkbox");
                const checkboxFields = section.fields.filter(f => f.type === "checkbox");

                return (
                  <div className="notes-section" key={section.key}>
                    <h3 className="notes-section-title">{section.label}</h3>
                    {regularFields.length > 0 && (
                      <div className="notes-section-grid">
                        {regularFields.map(f => renderField(f))}
                      </div>
                    )}
                    {checkboxFields.length > 0 && (
                      <div className="notes-checks-row">
                        {checkboxFields.map(f => renderField(f))}
                      </div>
                    )}
                  </div>
                );
              })}

            </div>
          </div>
        )}
      </div>

      {/* ── Delete confirmation modal ──────────────────────────────────────── */}
      {confirm && (
        <div className="notes-confirm-overlay" onClick={() => setConfirm(null)}>
          <div className="notes-confirm-card" onClick={e => e.stopPropagation()}>
            <h3>Delete this note?</h3>
            <p>
              {notes.find(n => n.id === confirm)?.coupleNames || "This note"} will be permanently
              removed{sheetsEnabled() ? " from Sheets and locally" : ""}.
            </p>
            <div className="notes-confirm-actions">
              <button className="notes-confirm-cancel" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="notes-confirm-delete" onClick={() => handleDelete(confirm)}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notes;
