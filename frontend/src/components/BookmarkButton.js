import React, { useState, useEffect, useRef } from "react";
import "./BookmarkButton.scss";

const IconBookmark = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
  </svg>
);

const IconClose = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

function detectDevice() {
  const ua = navigator.userAgent;
  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /Android/.test(ua);
  const isMac = /Macintosh|MacIntel/.test(ua) && !isIOS;
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  if (isMac) return "mac";
  return "windows";
}

const BookmarkButton = ({ variant = "outline-navy", label = "Bookmark Us!", prefix = null }) => {
  const [showModal, setShowModal] = useState(false);
  const [device, setDevice] = useState("windows");
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [installed, setInstalled] = useState(false);
  const modalRef = useRef(null);

  useEffect(() => {
    setDevice(detectDevice());
  }, []);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    const installedHandler = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener("beforeinstallprompt", handler);
    window.addEventListener("appinstalled", installedHandler);
    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      window.removeEventListener("appinstalled", installedHandler);
    };
  }, []);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = showModal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [showModal]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") setShowModal(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setInstalled(true);
      setDeferredPrompt(null);
      setShowModal(false);
    }
  };

  const getContent = () => {
    if (device === "ios") return {
      title: "Add to Your Home Screen",
      subtitle: "Quick access on iPhone or iPad",
      steps: [
        <>Tap the <strong>Share</strong> button at the bottom of Safari — the box with an arrow pointing up</>,
        <>Scroll down and tap <strong>"Add to Home Screen"</strong></>,
        <>Tap <strong>"Add"</strong> in the top right — done!</>,
      ],
    };
    if (device === "android") return {
      title: deferredPrompt ? "Add to Home Screen" : "Save to Home Screen",
      subtitle: "Quick access on Android",
      steps: deferredPrompt ? [] : [
        <>Tap the <strong>menu (⋮)</strong> in the top right of Chrome</>,
        <>Tap <strong>"Add to Home Screen"</strong></>,
        <>Tap <strong>"Add"</strong> — done!</>,
      ],
    };
    if (device === "mac") return {
      title: "Bookmark This Page",
      subtitle: "Save for later on Mac",
      steps: [
        <>Press <strong>⌘ + D</strong> to instantly bookmark this page</>,
        <>Or click the <strong>star ☆</strong> in your browser's address bar</>,
      ],
    };
    return {
      title: "Bookmark This Page",
      subtitle: "Save for later on Windows",
      steps: [
        <>Press <strong>Ctrl + D</strong> to instantly bookmark this page</>,
        <>Or click the <strong>star ☆</strong> in your browser's address bar</>,
      ],
    };
  };

  const content = getContent();
  const isDesktop = device === "mac" || device === "windows";

  return (
    <>
      <button
        className={`bm-trigger bm-trigger--${variant}`}
        onClick={() => setShowModal(true)}
        aria-label="Save this page as a bookmark"
      >
        {prefix && <span className="bm-trigger__prefix">{prefix}</span>}
        {prefix && <span className="bm-trigger__sep"> — </span>}
        <IconBookmark />
        {label}
      </button>

      {showModal && (
        <div
          className="bm-overlay"
          onClick={() => setShowModal(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Bookmark instructions"
        >
          <div
            className="bm-modal"
            onClick={(e) => e.stopPropagation()}
            ref={modalRef}
          >
            <button
              className="bm-close"
              onClick={() => setShowModal(false)}
              aria-label="Close"
            >
              <IconClose />
            </button>

            <img
              src="/images/favicon-192.png"
              alt="For the Record"
              className="bm-modal__icon"
            />

            <h3 className="bm-modal__title">{content.title}</h3>
            <p className="bm-modal__subtitle">{content.subtitle}</p>

            {/* Android with native install prompt */}
            {device === "android" && deferredPrompt && !installed && (
              <button className="bm-modal__install-btn" onClick={handleInstall}>
                Add to Home Screen
              </button>
            )}

            {/* Success state */}
            {installed && (
              <p className="bm-modal__success">✓ Added to your home screen!</p>
            )}

            {/* Step-by-step instructions */}
            {content.steps.length > 0 && !installed && (
              <ol className="bm-modal__steps">
                {content.steps.map((step, i) => (
                  <li key={i} className="bm-modal__step">
                    <span className="bm-modal__step-num">{i + 1}</span>
                    <span className="bm-modal__step-text">{step}</span>
                  </li>
                ))}
              </ol>
            )}

            {/* Keyboard shortcut visual for desktop */}
            {isDesktop && (
              <div className="bm-modal__keyboard">
                <span className="bm-key">{device === "mac" ? "⌘" : "Ctrl"}</span>
                <span className="bm-plus">+</span>
                <span className="bm-key">D</span>
              </div>
            )}

            <p className="bm-modal__tagline">
              We'll be here when you're ready to make your day unforgettable.
            </p>
          </div>
        </div>
      )}
    </>
  );
};

export default BookmarkButton;
