import React, { useState, useEffect } from 'react';
import './GetInTouch.scss';

const GetInTouch = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    weddingDate: '',
    message: '',
    source: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);

  useEffect(() => {
    window.lucide?.createIcons();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Placeholder for EmailJS integration
    // In production, replace with actual EmailJS call
    console.log('Form submitted:', formData);

    // Simulate submission delay
    setTimeout(() => {
      setSubmitStatus('success');
      setIsSubmitting(false);
      setFormData({
        name: '',
        email: '',
        phone: '',
        weddingDate: '',
        message: '',
        source: ''
      });

      // Clear success message after 5 seconds
      setTimeout(() => {
        setSubmitStatus(null);
      }, 5000);
    }, 1000);
  };

  const trustBadges = [
    { icon: 'clock', text: '24-Hour Response' },
    { icon: 'shield-check', text: 'No Obligation' },
    { icon: 'sparkles', text: 'Custom Packages' }
  ];

  return (
    <div className="get-in-touch-page">
      {/* Hero Section */}
      <section className="get-in-touch-hero">
        <div className="container">
          <h1 className="hero-title">Let's Make Your Day Unforgettable</h1>
          <p className="hero-subtitle">
            Fill out the form below and we'll respond within 24 hours—no pressure,
            just a friendly conversation about making your day perfect.
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
              <form className="contact-form" onSubmit={handleSubmit}>
                {submitStatus === 'success' && (
                  <div className="form-success-message">
                    <i data-lucide="check-circle"></i>
                    <p>Thanks for reaching out! We'll be in touch within 24 hours.</p>
                  </div>
                )}

                <div className="form-group">
                  <label htmlFor="name" className="form-label">Your Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-input"
                    placeholder="e.g., Sarah & Michael"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address</label>
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
                  <label htmlFor="phone" className="form-label">Phone Number</label>
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
                  <label htmlFor="weddingDate" className="form-label">Wedding Date</label>
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
                  <label htmlFor="source" className="form-label">How did you hear about us? (Optional)</label>
                  <select
                    id="source"
                    name="source"
                    className="form-select"
                    value={formData.source}
                    onChange={handleInputChange}
                  >
                    <option value="">Select an option</option>
                    <option value="friend-referral">Friend or Family Referral</option>
                    <option value="google">Google Search</option>
                    <option value="instagram">Instagram</option>
                    <option value="wedding-planner">Wedding Planner</option>
                    <option value="wedding-vendor">Wedding Vendor</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="message" className="form-label">Tell us about your day (Optional)</label>
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
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
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
                    <span>A custom package tailored to your needs and budget</span>
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
                    <a href="tel:(612)389-7005" className="contact-link">(612) 389-7005</a>
                  </div>
                </div>
                <div className="contact-method">
                  <i data-lucide="mail"></i>
                  <div>
                    <p className="contact-label">Email us</p>
                    <a href="mailto:michael@fortherecordmn.com" className="contact-link">michael@fortherecordmn.com</a>
                  </div>
                </div>
                <p className="availability-note">
                  <i data-lucide="calendar"></i>
                  Available for 2025-2026 weddings
                </p>
              </div>

              {/* Testimonial Card */}
              <div className="sidebar-card testimonial">
                <i data-lucide="quote"></i>
                <p className="testimonial-text">
                  "Working with For the Record made our reception unforgettable. The music was perfect, the transitions were seamless, and we could tell how much they cared about our day."
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
