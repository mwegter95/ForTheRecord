import React, { useState, useEffect } from "react";
import emailjs from "@emailjs/browser";
import "./GetInTouch.scss";

const SERVICE_ID = "service_gg499mn";
const TEMPLATE_ID = "template_rkyxp9c";
const PUBLIC_KEY = "LhsrdX3yXhmH9PHk7";

const GetInTouch = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    weddingDate: "",
    message: "",
    source: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    window.lucide?.createIcons();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const templateParams = {
      first_name: formData.firstName,
      last_name: formData.lastName,
      email: formData.email,
      phone: formData.phone,
      date: formData.weddingDate,
      source: formData.source || "Not specified",
      message: formData.message || "No additional details provided",
    };

    try {
      const result = await emailjs.send(
        SERVICE_ID,
        TEMPLATE_ID,
        templateParams,
        PUBLIC_KEY,
      );
      console.log("EmailJS success:", result.text);

      // Fire Google Ads conversion tracking
      if (typeof window.gtag === "function") {
        window.gtag("event", "conversion", {
          send_to: "AW-17945236375/IOV8CIy21_cbEJen-uxC",
        });
      }

      // Show inline success state
      setSubmitStatus("success");
      setIsSubmitting(false);

      // Reset form data
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        weddingDate: "",
        message: "",
        source: "",
      });
    } catch (error) {
      console.error("EmailJS error:", error);
      setSubmitStatus("error");
      setIsSubmitting(false);

      // Clear error message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    }
  };

  const trustBadges = [
    { icon: "clock", text: "24-Hour Response" },
    { icon: "shield-check", text: "No Obligation" },
    { icon: "sparkles", text: "Custom Packages" },
  ];

  return (
    <div className="get-in-touch-page">
      {/* Hero Section */}
      <section className="get-in-touch-hero">
        <div className="container">
          <h1 className="hero-title">Let's Make Your Day Unforgettable</h1>
          <p className="hero-subtitle">
            Fill out the form below and we'll respond within 24 hours—no
            pressure, just a friendly conversation about making your day
            perfect.
          </p>

          {/* Trust Badges */}
          <div className="trust-badges">
            {trustBadges.map((badge, index) => (
              <div key={index} className="trust-badge">
                <i data-lucide={badge.icon} className="badge-icon"></i>
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Contact Section */}
      <section className="contact-section">
        <div className="container">
          <div className="contact-layout">
            {/* Contact Form */}
            <div className="form-wrapper">
              {submitStatus === "success" ? (
                <div className="form-success-message">
                  <div className="success-icon">✓</div>
                  <h2>Thank You!</h2>
                  <p>
                    We received your message and we're <strong>excited to connect with you</strong>!
                    You'll hear from us within 24 hours to discuss your event and how we can make it unforgettable.
                  </p>
                  <div className="success-next-steps">
                    <h3>What Happens Next?</h3>
                    <p>
                      We'll review your details and reach out to discuss your vision,
                      answer any questions, and create a custom package that fits your needs and budget.
                    </p>
                    <p>No pressure, no obligation—just a friendly conversation about making your day perfect.</p>
                  </div>
                  <div className="success-contact">
                    <p>Need to reach us right away?</p>
                    <p>
                      <a href="tel:+16123897005">(612) 389-7005</a> · <a href="mailto:michael@fortherecordmn.com">michael@fortherecordmn.com</a>
                    </p>
                  </div>
                  <button className="btn-primary" onClick={() => setSubmitStatus(null)}>
                    Send Another Message
                  </button>
                </div>
              ) : (
              <form className="contact-form" onSubmit={handleSubmit}>
                {submitStatus === "error" && (
                  <div className="form-error-message">
                    <i data-lucide="alert-circle"></i>
                    <p>
                      Oops! Something went wrong. Please try again or call us at
                      (612) 389-7005.
                    </p>
                  </div>
                )}

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="firstName" className="form-label">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      className="form-input"
                      placeholder="Sarah"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="lastName" className="form-label">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      className="form-input"
                      placeholder="Johnson"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-input"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone" className="form-label">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    className="form-input"
                    placeholder="(763) 555-1234"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="weddingDate" className="form-label">
                    Wedding Date
                  </label>
                  <input
                    type="date"
                    id="weddingDate"
                    name="weddingDate"
                    className="form-input"
                    value={formData.weddingDate}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="source" className="form-label">
                    How did you hear about us? (Optional)
                  </label>
                  <select
                    id="source"
                    name="source"
                    className="form-select"
                    value={formData.source}
                    onChange={handleInputChange}
                  >
                    <option value="">Select an option</option>
                    <option value="friend-referral">
                      Friend or Family Referral
                    </option>
                    <option value="google">Google Search</option>
                    <option value="instagram">Instagram</option>
                    <option value="wedding-planner">Wedding Planner</option>
                    <option value="wedding-vendor">Wedding Vendor</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">
                    Tell us about your day (Optional)
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    className="form-textarea"
                    placeholder="Your venue, music style, vision... anything you'd like us to know!"
                    rows="5"
                    value={formData.message}
                    onChange={handleInputChange}
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="form-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Sending..." : "Send Message"}
                </button>
              </form>
              )}
            </div>

            {/* Sidebar Content */}
            <div className="contact-sidebar">
              {/* What to Expect Card */}
              <div className="sidebar-card what-to-expect">
                <h3>What to Expect</h3>
                <ul className="expectations-list">
                  <li>
                    <i data-lucide="check"></i>
                    <span>Quick, friendly response within 24 hours</span>
                  </li>
                  <li>
                    <i data-lucide="check"></i>
                    <span>A no-pressure conversation about your vision</span>
                  </li>
                  <li>
                    <i data-lucide="check"></i>
                    <span>
                      A custom package tailored to your needs and budget
                    </span>
                  </li>
                  <li>
                    <i data-lucide="check"></i>
                    <span>A reliable partner from planning to last dance</span>
                  </li>
                </ul>
              </div>

              {/* Contact Info Card */}
              <div className="sidebar-card contact-info">
                <h3>Get In Touch</h3>
                <div className="contact-method">
                  <i data-lucide="phone"></i>
                  <div>
                    <p className="contact-label">Call us</p>
                    <a href="tel:(612)389-7005" className="contact-link">
                      (612) 389-7005
                    </a>
                  </div>
                </div>
                <div className="contact-method">
                  <i data-lucide="mail"></i>
                  <div>
                    <p className="contact-label">Email us</p>
                    <a
                      href="mailto:michael@fortherecordmn.com"
                      className="contact-link"
                    >
                      michael@fortherecordmn.com
                    </a>
                  </div>
                </div>
                <p className="availability-note">
                  <i data-lucide="calendar"></i>
                  Available for 2026-2027 weddings
                </p>
              </div>

              {/* Testimonial Card */}
              <div className="sidebar-card testimonial">
                <i data-lucide="quote"></i>
                <p className="testimonial-text">
                  "Working with For the Record made our reception unforgettable.
                  The music was perfect, the transitions were seamless, and we
                  could tell how much they cared about our day."
                </p>
                <p className="testimonial-author">— Sarah & Michael, 2024</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom CTA */}
      <section className="bottom-cta-section">
        <div className="container">
          <div className="bottom-cta-content">
            <h2>Prefer to call?</h2>
            <p>We'd love to hear from you.</p>
            <a href="tel:(612)389-7005" className="btn-primary">
              <i data-lucide="phone"></i>
              (612) 389-7005
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default GetInTouch;
