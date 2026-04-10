import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { usePortal } from "../context/PortalContext";
import "./Portal.scss";

const SEND_PASSWORD = process.env.REACT_APP_COUNTERSIGN_PASSWORD;

const NAV_ITEMS = [
  { to: "/portal/send-contract",  label: "Wedding Contract", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { to: "/portal/event-contract", label: "Event Contract",   icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" },
  { to: "/portal/payment",        label: "Send Payment",     icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
  { to: "/portal/meet-invite",    label: "Meet Invite",      icon: "M15 10l4.553-2.069A1 1 0 0121 8.883v6.234a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" },
  { to: "/portal/countersign",    label: "Countersign",      icon: "M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" },
  { to: "/portal/notes",          label: "Client Notes",     icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
];

// ─── Lock icon ────────────────────────────────────────────────────────────────
const IconLock = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
  </svg>
);

// ─── Portal component ─────────────────────────────────────────────────────────
const Portal = () => {
  const { authed, setAuthed } = usePortal();
  const [pwInput, setPwInput] = useState("");
  const [pwError, setPwError] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleAuth = (e) => {
    e.preventDefault();
    if (pwInput === SEND_PASSWORD) {
      setAuthed(true);
      navigate("/portal/send-contract");
    } else {
      setPwError("Incorrect password.");
      setPwInput("");
    }
  };

  // ── Password gate ─────────────────────────────────────────────────────────
  if (!authed) {
    return (
      <div className="portal-gate">
        <div className="portal-gate-card">
          <div className="portal-gate-icon"><IconLock /></div>
          <h1>For the Record</h1>
          <p>DJ Management Portal</p>
          <form onSubmit={handleAuth}>
            <input
              type="password"
              className="portal-gate-input"
              placeholder="Access code"
              value={pwInput}
              onChange={(e) => { setPwInput(e.target.value); setPwError(""); }}
              autoFocus
            />
            {pwError && <p className="portal-gate-error">{pwError}</p>}
            <button type="submit" className="portal-gate-btn">Enter Portal</button>
          </form>
        </div>
      </div>
    );
  }

  // ── Authenticated portal shell ────────────────────────────────────────────
  return (
    <div className="portal-shell">
      {/* Mobile sidebar toggle */}
      <button
        className="portal-mobile-toggle"
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          {sidebarOpen
            ? <><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>
            : <><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></>
          }
        </svg>
      </button>

      {/* Sidebar */}
      <aside className={`portal-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="portal-brand">
          <span className="portal-brand-name">For the Record</span>
          <span className="portal-brand-sub">DJ Portal</span>
        </div>

        <nav className="portal-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `portal-nav-item ${isActive ? "active" : ""}`}
              onClick={() => setSidebarOpen(false)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d={item.icon}/>
              </svg>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <button
          className="portal-signout"
          onClick={() => { setAuthed(false); navigate("/portal"); }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
          </svg>
          Sign Out
        </button>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="portal-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="portal-main">
        <Outlet />
      </main>
    </div>
  );
};

export default Portal;
