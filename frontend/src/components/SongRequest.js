import React, { useState } from "react";
import emailjs from "@emailjs/browser";
import useSEO from "../hooks/useSEO";
import "./SongRequest.scss";

// ── EmailJS credentials ──────────────────────────────────────────────
const SERVICE_ID = "service_gg499mn";
const TEMPLATE_ID = "template_u3ok5xh";
const PUBLIC_KEY = "LhsrdX3yXhmH9PHk7";

// ── Inline SVG icons (avoids Lucide DOM-injection clashing with React) ──
const IconMusic = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M9 18V5l12-2v13"/>
    <circle cx="6" cy="18" r="3"/>
    <circle cx="18" cy="16" r="3"/>
  </svg>
);

const IconInfo = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M12 16v-4"/>
    <path d="M12 8h.01"/>
  </svg>
);

const IconCheck = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const IconPlus = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14"/>
    <path d="M12 5v14"/>
  </svg>
);

const IconAlertCircle = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" x2="12" y1="8" y2="12"/>
    <line x1="12" x2="12.01" y1="16" y2="16"/>
  </svg>
);

const IconSend = ({ className }) => (
  <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"
    fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m22 2-7 20-4-9-9-4Z"/>
    <path d="M22 2 11 13"/>
  </svg>
);

// ── Component ────────────────────────────────────────────────────────
const SongRequest = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    password: "",
    songRequest: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useSEO({
    title: "Request a Song | For the Record – MN Wedding DJ",
    description:
      "Submit your song requests for your wedding! Enter the password from your wedding couple and request your favorite songs.",
    canonical: "https://fortherecordmn.com/request-a-song",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const templateParams = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      event_password: formData.password,
      song_request: formData.songRequest,
    };

    try {
      const result = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY,
      );
      console.log("EmailJS success:", result.text);

      setSubmitStatus("success");
      setIsSubmitting(false);

      // Keep name & password filled so guests can fire off multiple songs
      setFormData((prev) => ({ ...prev, songRequest: "" }));
    } catch (error) {
      console.error("EmailJS error:", error);
      setSubmitStatus("error");
      setIsSubmitting(false);

      setTimeout(() => setSubmitStatus(null), 5000);
    }
  };

  const resetForm = () => {
    setSubmitStatus(null);
  };

  return (
    <div className="song-request-page">
      {/* Hero */}
      <section className="song-request-hero">
        <div className="container">
          <div className="hero-icon-wrap">
            <IconMusic className="hero-icon" />
          </div>
          <h1 className="hero-title">Request a Song</h1>
          <p className="hero-subtitle">
            Got a song that'll get you on the dance floor? Drop your request
            below and we'll do our best to work it in!
          </p>
        </div>
      </section>

      {/* Form Section */}
      <section className="request-section">
        <div className="container">
          <div className="request-layout">

            {/* Instructions sidebar */}
            <div className="request-sidebar">
              <div className="sidebar-card how-it-works">
                <h3>How It Works</h3>
                <ol className="steps-list">
                  <li>
                    <div className="step-num">1</div>
                    <div>
                      <strong>Enter your name</strong>
                      <p>First and last name; this is so I can shout you out if your song gets played!</p>
                    </div>
                  </li>
                  <li>
                    <div className="step-num">2</div>
                    <div>
                      <strong>Enter the event password</strong>
                      <p>
                        The wedding couple will share a unique password with
                        their guests. Ask them if you don't have it!
                      </p>
                    </div>
                  </li>
                  <li>
                    <div className="step-num">3</div>
                    <div>
                      <strong>Request your song</strong>
                      <p>
                        Type the song title and artist, then hit submit. You can
                        send as many as you'd like!
                      </p>
                    </div>
                  </li>
                </ol>
              </div>

              <div className="sidebar-card note-card">
                <IconInfo className="note-icon" />
                <p>
                  Song requests help the DJ read the room. While we can't
                  guarantee every song will be played, your picks go straight to
                  the playlist queue!
                </p>
              </div>
            </div>

            {/* Form */}
            <div className="form-wrapper">
              {submitStatus === "success" ? (
                <div className="form-success-message">
                  <div className="success-icon">
                    <IconCheck className="success-check" />
                  </div>
                  <h2>Song Submitted!</h2>
                  <p>
                    Your request has been added to the playlist queue.
                    Want to add another?
                  </p>
                  <button className="btn-primary" onClick={resetForm}>
                    <IconPlus className="btn-icon" />
                    Request Another Song
                  </button>
                </div>
              ) : (
                <form className="song-form" onSubmit={handleSubmit}>
                  {submitStatus === "error" && (
                    <div className="form-error-message">
                      <IconAlertCircle className="error-icon" />
                      <p>
                        Something went wrong. Please try again in a moment.
                      </p>
                    </div>
                  )}

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="firstName" className="form-label">
                        First Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="firstName"
                        name="firstName"
                        className="form-input"
                        placeholder="Jane"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="lastName" className="form-label">
                        Last Name <span className="required">*</span>
                      </label>
                      <input
                        type="text"
                        id="lastName"
                        name="lastName"
                        className="form-input"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      Event Password <span className="required">*</span>
                    </label>
                    <input
                      type="text"
                      id="password"
                      name="password"
                      className="form-input"
                      placeholder="Enter the password from the couple"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <span className="form-hint">
                      Ask the bride or groom for this password
                    </span>
                  </div>

                  <div className="form-group">
                    <label htmlFor="songRequest" className="form-label">
                      Song Request(s) <span className="required">*</span>
                    </label>
                    <textarea
                      id="songRequest"
                      name="songRequest"
                      className="form-textarea"
                      placeholder={"Song Title - Artist\ne.g. September - Earth, Wind & Fire"}
                      rows="4"
                      value={formData.songRequest}
                      onChange={handleInputChange}
                      required
                    ></textarea>
                    <span className="form-hint">
                      You can request multiple songs — one per line
                    </span>
                  </div>

                  <button
                    type="submit"
                    className="form-submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      "Submitting..."
                    ) : (
                      <>
                        <IconSend className="btn-icon" />
                        Submit Request
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>

          </div>
        </div>
      </section>
    </div>
  );
};

export default SongRequest;
