import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import WeddingCeremonyAudio from "../images/wedding-ceremony-audio.jpg";
import "./Services.scss";

export default function Services() {
  useEffect(() => {
    window.lucide?.createIcons();
  }, []);

  return (
    <div className="services-page">
      {/* Hero Banner */}
      <section className="services-hero">
        <h1 className="section-title">
          Complete Wedding & Event Entertainment
        </h1>
        <p className="section-description">
          Whatever your budget, we have a package for you. Expert audio,
          unforgettable energy, stress-free partnership.
        </p>
      </section>

      {/* Wedding Services Section */}
      <section className="wedding-services">
        <div className="wedding-grid">
          <div className="wedding-image">
            <img
              src={WeddingCeremonyAudio}
              alt="Professional wedding audio setup"
            />
          </div>

          <div className="wedding-content">
            <h2 className="section-header">Wedding Entertainment</h2>
            <p>
              Your wedding deserves sound that matches the importance of the
              moment. From crystal-clear ceremony audio to a reception that
              keeps your guests dancing all night, I handle every technical
              detail so you can focus on enjoying your day.
            </p>
            <p>
              I work closely with you to understand your vision and your music
              preferences. Whether your friends are Beyonce fans, classic rock
              devotees, or an eclectic mix, I'll craft a setlist that keeps
              energy high and moments meaningful. No cookie-cutter DJ
              playlists—just the songs that matter to you.
            </p>

            <div className="service-list">
              <div className="service-item">
                <i data-lucide="check-circle"></i>
                <span>Ceremony Audio Setup & Management</span>
              </div>
              <div className="service-item">
                <i data-lucide="check-circle"></i>
                <span>Reception Entertainment & DJing</span>
              </div>
              <div className="service-item">
                <i data-lucide="check-circle"></i>
                <span>Professional MCing & Announcements</span>
              </div>
              <div className="service-item">
                <i data-lucide="check-circle"></i>
                <span>Wireless Microphones</span>
              </div>
              <div className="service-item">
                <i data-lucide="check-circle"></i>
                <span>Custom Playlist Curation</span>
              </div>
              <div className="service-item">
                <i data-lucide="check-circle"></i>
                <span>Coordination with Other Vendors</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The Difference Section */}
      <section className="difference-section">
        <h2
          className="section-header"
          style={{
            color: "#F8F6F1",
            textAlign: "center",
            marginBottom: "3rem",
          }}
        >
          The For the Record Difference
        </h2>

        <div className="difference-grid">
          <div className="difference-card">
            <i data-lucide="radio"></i>
            <h3>Perfect Ceremony Audio</h3>
            <p>
              I arrive early to test audio in your actual space, position
              microphones for clarity, and monitor every moment. No feedback, no
              dead spots, no surprises. Just clear, beautiful sound for your
              vows.
            </p>
          </div>

          <div className="difference-card">
            <i data-lucide="music"></i>
            <h3>Your Music, Your Way</h3>
            <p>
              I'm not bound to wedding DJ clichés. Tell me your taste, your
              story, your energy level and I'll read the room in real time. Want
              indie rock? 90s nostalgia? A mix of everything? I adapt.
            </p>
          </div>

          <div className="difference-card">
            <i data-lucide="smile"></i>
            <h3>Easeful Partnership</h3>
            <p>
              Quick responses, clear communication, and someone who actually
              cares about your day. I handle all audio logistics so you have
              zero stress. That's what partnership looks like.
            </p>
          </div>
        </div>
      </section>

      {/* Event Services Section */}
      <section className="event-services">
        <h2
          className="section-header"
          style={{ textAlign: "center", marginBottom: "3rem" }}
        >
          Beyond Weddings
        </h2>
        <p
          style={{
            textAlign: "center",
            marginBottom: "2rem",
            maxWidth: "700px",
            margin: "0 auto 2rem",
          }}
        >
          I DJ all kinds of celebrations. Here's what else I can help with.
        </p>

        <div className="event-grid">
          <div className="event-card">
            <i data-lucide="briefcase"></i>
            <h3>Corporate Events</h3>
            <p>
              Professional audio for conferences, galas, holiday parties, and
              team celebrations. Polished, reliable, and perfectly sound.
            </p>
          </div>

          <div className="event-card">
            <i data-lucide="cake"></i>
            <h3>Private Parties</h3>
            <p>
              Birthdays, anniversaries, graduation parties—whatever the
              occasion, I'll create the perfect soundtrack and energy for your
              guests.
            </p>
          </div>

          <div className="event-card">
            <i data-lucide="users"></i>
            <h3>Community Events</h3>
            <p>
              Block parties, fundraisers, festivals, and community celebrations
              with audio that reaches and energizes everyone.
            </p>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="packages-section">
        <h2
          className="section-header"
          style={{ textAlign: "center", marginBottom: "1rem" }}
        >
          What Can Be Included in Your Package
        </h2>
        <p
          style={{
            textAlign: "center",
            marginBottom: "3rem",
            maxWidth: "800px",
            margin: "0 auto 3rem",
            fontSize: "1.1rem",
          }}
        >
          We work with you to create a custom package that fits your vision.
          Every wedding is unique, and we have options for any budget.
        </p>

        <div
          className="service-list"
          style={{
            maxWidth: "700px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "1rem",
          }}
        >
          <div className="service-item">
            <i data-lucide="check-circle"></i>
            <span>Ceremony Audio Setup & Management</span>
          </div>
          <div className="service-item">
            <i data-lucide="check-circle"></i>
            <span>Reception Entertainment & DJing (4-8+ hours)</span>
          </div>
          <div className="service-item">
            <i data-lucide="check-circle"></i>
            <span>Professional MCing & Announcements</span>
          </div>
          <div className="service-item">
            <i data-lucide="check-circle"></i>
            <span>Wireless Microphones (Multiple Units)</span>
          </div>
          <div className="service-item">
            <i data-lucide="check-circle"></i>
            <span>Custom Playlist Curation</span>
          </div>
          <div className="service-item">
            <i data-lucide="check-circle"></i>
            <span>Dance Floor Lighting</span>
          </div>
          <div className="service-item">
            <i data-lucide="check-circle"></i>
            <span>Ambient Uplighting</span>
          </div>
          <div className="service-item">
            <i data-lucide="check-circle"></i>
            <span>Premium Sound Equipment</span>
          </div>
          <div className="service-item">
            <i data-lucide="check-circle"></i>
            <span>Vendor Coordination</span>
          </div>
          <div className="service-item">
            <i data-lucide="check-circle"></i>
            <span>Pre-Wedding Consultation & Planning</span>
          </div>
          <div className="service-item">
            <i data-lucide="check-circle"></i>
            <span>Ceremony Rehearsal Support</span>
          </div>
        </div>

        <p
          style={{
            textAlign: "center",
            margin: "3rem 0 0",
            fontSize: "1.1rem",
            fontWeight: "500",
          }}
        >
          Let's chat about your needs and build the perfect package for your
          day.
        </p>
      </section>

      {/* CTA Section */}
      <section className="services-cta">
        <h2
          className="section-header"
          style={{ color: "#0A1128", marginBottom: "1rem" }}
        >
          Let's Talk About Your Day
        </h2>
        <p
          style={{ color: "#2D3142", marginBottom: "2rem", fontSize: "1.1rem" }}
        >
          Ready to book amazing sound for your wedding or event? Get in touch
          and let's make it happen.
        </p>
        <Link to="/get-in-touch" className="cta-button">
          Get In Touch
        </Link>
      </section>
    </div>
  );
}
