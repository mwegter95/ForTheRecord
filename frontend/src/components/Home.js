import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import weddingDanceFloor2 from "../images/wedding-dance-floor2.png";
import weddingDanceFloor3 from "../images/wedding-dance-floor3.png";
import weddingCeremonyAudio2 from "../images/wedding-ceremony-audio2.jpg";
import weddingDanceFloor4 from "../images/wedding-dance-floor4.jpg";
import weddingDanceFloor from "../images/wedding-dance-floor.jpg";
import weddingCeremonyAudio from "../images/wedding-ceremony-audio.jpg";
import wedding1 from "../images/wedding1.jpg";
import "./Home.scss";

const Home = () => {
  // Initialize Lucide icons after component mounts
  useEffect(() => {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  }, []);

  return (
    <div className="home-page">
      {/* HERO SECTION */}
      <section className="hero" id="hero">
        <div className="container">
          <div className="hero-content">
            <div className="hero-text">
              <div className="hero-eyebrow">
                <i
                  data-lucide="map-pin"
                  style={{ width: "18px", height: "18px" }}
                ></i>
                Minnesota Wedding DJ
              </div>
              <h1>Audio-Obsessed DJ for Your Perfect Day</h1>
              <p className="hero-subtitle">
                Clear sound for precious moments. Unforgettable energy for your
                celebration. Stress-free partnership from planning to last
                dance.
              </p>

              <div className="hero-badges">
                <div className="badge">
                  <i
                    data-lucide="graduation-cap"
                    style={{ width: "20px", height: "20px" }}
                  ></i>
                  <span>BA in Music</span>
                </div>
                <div className="badge">
                  <i
                    data-lucide="music"
                    style={{ width: "20px", height: "20px" }}
                  ></i>
                  <span>9+ Years Experience</span>
                </div>
                <div className="badge">
                  <i
                    data-lucide="volume-2"
                    style={{ width: "20px", height: "20px" }}
                  ></i>
                  <span>Expert Audio Setup</span>
                </div>
              </div>

              <div className="hero-cta">
                <Link to="/get-in-touch" className="btn-primary">
                  Let's Chat About Your Day
                </Link>
                <a href="tel:(612)389-7005" className="btn-secondary">
                  <i
                    data-lucide="phone"
                    style={{ width: "18px", height: "18px" }}
                  ></i>
                  (612) 389-7005
                </a>
              </div>
            </div>

            <div className="hero-image-wrapper">
              <div className="hero-photo-accent"></div>
              <img
                src={weddingDanceFloor2}
                alt="Wedding dance floor"
                className="hero-photo"
              />
            </div>
          </div>
        </div>
      </section>

      {/* STORY SECTION */}
      <section className="story" id="story">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">
              The Story Behind For the Record
            </div>
            <h2>When Bad Audio Ruins Perfect Moments</h2>
          </div>

          <div className="story-content">
            <div className="story-text">
              <p>
                I've been to that wedding. You probably have too—where feedback screeches through heartfelt vows, or the back rows can't hear the officiant at all.
              </p>

              <div className="story-subsection">
                <h3>The Moment I Knew</h3>
                <p>
                  I once attended a wedding where everything was beautiful—the venue, the flowers, the couple's joy. But during the ceremony, feedback kept piercing through the vows. The audio was distant and echoey. It was painful to watch something so precious marred by preventable technical issues.
                </p>
                <p>
                  The DJ had all the right equipment. What they lacked was proper technique—knowing how to test in the space, position microphones correctly, and prevent feedback before it happens.
                </p>

                <div className="story-highlight">
                  "That's when I realized: audio obsession isn't just my hobby—it's what sets me apart. Perfect sound isn't about expensive gear. It's about knowing exactly how to use it."
                </div>
              </div>

              <div className="story-subsection" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h3 style={{ textAlign: 'center' }}>Why "For the Record"</h3>
                <p>
                  The name means "one for the books"—a moment worth remembering. But it can only be truly cherished if it's heard clearly. If speeches are muffled or music cuts out, it detracts from the entire experience.
                </p>
                <p>
                  <strong>At For the Record, we're committed to delivering flawless audio so your memories stay perfect.</strong> Every word, every laugh, every song—crystal clear. Because the best moments deserve to be heard the way they were lived.
                </p>
              </div>
            </div>

            <div className="story-image">
              <img src={wedding1} alt="Wedding celebration" />
            </div>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE SECTION */}
      <section className="why-choose">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">What Makes Us Different</div>
            <h2>Quality Audio. Fun Energy. Stress-Free Partnership.</h2>
          </div>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <i
                  data-lucide="volume-2"
                  style={{ width: "32px", height: "32px" }}
                ></i>
              </div>
              <h3>Perfect Audio, Every Time</h3>
              <p>
                No feedback. No crackling. No compromises. I obsess over audio
                the way you obsess over your vows—because every word matters.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i
                  data-lucide="music-2"
                  style={{ width: "32px", height: "32px" }}
                ></i>
              </div>
              <h3>Musical Expertise</h3>
              <p>
                A degree in music and 9+ years of wedding experience means I
                know how to build an unforgettable night, song by song.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <i
                  data-lucide="handshake"
                  style={{ width: "32px", height: "32px" }}
                ></i>
              </div>
              <h3>Stress-Free Partnership</h3>
              <p>
                From your first consultation to the last song, I'm your ally.
                You focus on enjoying your day. I handle the rest.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="testimonials" id="testimonials">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">What Couples Say</div>
            <h2>Real Stories From Real Days</h2>
          </div>

          <div className="testimonial-slide">
            <div className="testimonial-stars">
              {[...Array(5)].map((_, i) => (
                <i
                  key={i}
                  data-lucide="star"
                  style={{ width: "20px", height: "20px" }}
                ></i>
              ))}
            </div>
            <p className="testimonial-text">
              "Michael's attention to detail with the audio was incredible.
              Every moment of our ceremony came through perfectly. But what
              really stood out was his energy during the reception—he read the
              room, played what people wanted to hear, and kept the dance floor
              packed all night. This is what a real DJ should be."
            </p>
            <p className="testimonial-author">Sarah & Mike, Minneapolis, MN</p>
          </div>
        </div>
      </section>

      {/* GALLERY SECTION */}
      <section className="gallery" id="gallery">
        <div className="container">
          <div className="section-header">
            <div className="section-eyebrow">Recent Events</div>
            <h2>See The Magic</h2>
          </div>

          <div className="gallery-grid">
            <div className="gallery-item">
              <img
                src={weddingDanceFloor2}
                alt="Wedding dance floor celebration"
              />
            </div>
            <div className="gallery-item">
              <img src={weddingDanceFloor3} alt="Wedding reception dancing" />
            </div>
            <div className="gallery-item">
              <img
                src={weddingCeremonyAudio2}
                alt="Wedding ceremony audio setup"
              />
            </div>
            <div className="gallery-item">
              <img src={weddingDanceFloor4} alt="Dance floor energy" />
            </div>
            <div className="gallery-item">
              <img src={weddingDanceFloor} alt="Wedding celebration" />
            </div>
            <div className="gallery-item">
              <img src={weddingCeremonyAudio} alt="Ceremony audio and sound" />
            </div>
          </div>

          <div className="gallery-cta">
            <Link to="/gallery" className="view-link">
              View Full Gallery
              <i
                data-lucide="arrow-right"
                style={{ width: "18px", height: "18px" }}
              ></i>
            </Link>
          </div>
        </div>
      </section>

      {/* SERVICES SECTION */}
      <section className="services" id="services">
        <div className="container">
          <div className="services-content">
            <div className="services-image">
              <img src={weddingDanceFloor3} alt="DJ services and setup" />
            </div>

            <div className="services-list-wrapper">
              <h2>Everything You Get</h2>
              <ul className="services-list">
                <li>
                  <i
                    data-lucide="check-circle"
                    style={{ width: "24px", height: "24px" }}
                  ></i>
                  <span>
                    Personal consultation to understand your vision and music
                    taste
                  </span>
                </li>
                <li>
                  <i
                    data-lucide="check-circle"
                    style={{ width: "24px", height: "24px" }}
                  ></i>
                  <span>
                    Professional audio setup with backup equipment for ceremony
                    and reception
                  </span>
                </li>
                <li>
                  <i
                    data-lucide="check-circle"
                    style={{ width: "24px", height: "24px" }}
                  ></i>
                  <span>
                    Microphone support for speeches, toasts, and announcements
                  </span>
                </li>
                <li>
                  <i
                    data-lucide="check-circle"
                    style={{ width: "24px", height: "24px" }}
                  ></i>
                  <span>
                    10+ hours of carefully curated music for ceremony, cocktail
                    hour, and reception
                  </span>
                </li>
                <li>
                  <i
                    data-lucide="check-circle"
                    style={{ width: "24px", height: "24px" }}
                  ></i>
                  <span>
                    Real-time energy management from first dance to last song
                  </span>
                </li>
                <li>
                  <i
                    data-lucide="check-circle"
                    style={{ width: "24px", height: "24px" }}
                  ></i>
                  <span>Arrival 2 hours early for setup and sound check</span>
                </li>
                <li>
                  <i
                    data-lucide="check-circle"
                    style={{ width: "24px", height: "24px" }}
                  ></i>
                  <span>Teardown and equipment care the night of</span>
                </li>
              </ul>

              <div className="services-cta">
                <p>
                  <strong>Ready to hear the difference?</strong>
                </p>
                <p>
                  Let's talk about your perfect day and how we can make it sound
                  as amazing as it will be.
                </p>
                <Link to="/get-in-touch" className="btn-primary">
                  Get Started
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT CTA SECTION */}
      <section className="contact-cta">
        <div className="container">
          <div className="contact-cta-content">
            <h2>Let's Chat About Your Day</h2>
            <p>
              No pressure, no sales pitch. Just a conversation about your vision
              and how we can make it happen with crystal-clear audio and
              unforgettable energy.
            </p>

            <div className="contact-methods">
              <div className="contact-method">
                <i
                  data-lucide="phone"
                  style={{ width: "32px", height: "32px" }}
                ></i>
                <div>
                  <h3>Call Me</h3>
                  <a href="tel:(612)389-7005">(612) 389-7005</a>
                </div>
              </div>

              <div className="contact-method">
                <i
                  data-lucide="mail"
                  style={{ width: "32px", height: "32px" }}
                ></i>
                <div>
                  <h3>Email</h3>
                  <a href="mailto:michael@fortherecordmn.com">
                    michael@fortherecordmn.com
                  </a>
                </div>
              </div>
            </div>

            <Link to="/get-in-touch" className="btn-primary">
              Start Planning
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
