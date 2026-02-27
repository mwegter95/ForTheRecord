import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import PortraitMe from "../images/Portrait_me.jpeg";
import AshleyAndMe from "../images/Ashley_and_me.jpeg";
import "./About.scss";

export default function About() {
  useEffect(() => {
    window.lucide?.createIcons();
  }, []);

  return (
    <div className="about-page">
      {/* Hero Banner */}
      <section className="about-hero">
        <h1 className="section-title">The Story Behind the Sound</h1>
        <p className="section-description">
          My audio obsession isn't just a career—it's who I am. Every wedding,
          every event, every moment matters enough to get it right.
        </p>
      </section>

      {/* Origin Story Section */}
      <section className="origin-story">
        <div className="origin-grid">
          <div className="origin-content">
            <h2 className="section-header">The Moment Everything Changed</h2>
            <p>
              I'll never forget attending a wedding where the DJ had all the
              right gear but completely lacked the technique to use it. The
              audio was echoey, distant, and plagued by feedback. Guests would
              tilt their heads toward the speakers, confused. The emotional
              moments were muddy. The dance floor felt flat.
            </p>
            <p>
              Walking out of that reception, something clicked: great equipment
              means nothing without mastery. I realized then that my technical
              obsession—my endless tinkering, my ear for audio, my refusal to
              settle for "good enough"—was exactly what weddings needed.
            </p>

            <div className="story-highlight">
              <p className="highlight-quote">
                "Perfect sound isn't about expensive gear. It's about knowing
                exactly how to use it."
              </p>
            </div>

            <p>
              The name "For the Record" captures this perfectly. It means
              creating moments worth remembering—moments that stick with your
              guests long after the last song plays. It means getting it on the
              record, in the books, done right the first time.
            </p>
            <p>
              This obsession shows up in the small things too. I once ran over
              to politely ask a groundskeeper to pause mowing during a ceremony
              I was attending. Not because it was my event, but because good
              audio deserves respect. That's the mindset I bring to every
              wedding: relentless attention to the details that make the
              difference.
            </p>
          </div>

          <div className="origin-image">
            <img src={PortraitMe} alt="Michael Wegter, DJ Synfinity" />
          </div>
        </div>
      </section>

      {/* Journey Timeline Section */}
      <section className="journey-section">
        <h2
          className="section-header"
          style={{
            color: "#F8F6F1",
            textAlign: "center",
            marginBottom: "3rem",
          }}
        >
          My Journey
        </h2>
        <div className="timeline-grid">
          <div className="timeline-card">
            <h3>Elementary School</h3>
            <p>
              Started playing saxophone and fell in love with music production
              using FL Studio in 3rd grade.
            </p>
          </div>

          <div className="timeline-card">
            <h3>St. Olaf College</h3>
            <p>
              Earned a BA in Music in 2018, deepening my technical and creative
              foundation.
            </p>
          </div>

          <div className="timeline-card">
            <h3>Shanghai</h3>
            <p>
              DJed club nights internationally, learning to read rooms and adapt
              to any crowd.
            </p>
          </div>

          <div className="timeline-card">
            <h3>Founded For the Record</h3>
            <p>
              Brought my obsession with audio excellence and technical mastery
              to Minnesota weddings.
            </p>
          </div>

          <div className="timeline-card">
            <h3>Today</h3>
            <p>
              9+ years of DJ experience, countless happy couples, and an
              unrelenting commitment to perfect sound.
            </p>
          </div>
        </div>
      </section>

      {/* What Drives Me Section */}
      <section className="what-drives-me">
        <div className="drives-grid">
          <div className="drives-content">
            <h2 className="section-header">More Than Just a DJ</h2>
            <p>
              Audio isn't something I do. It's who I am. I'm the person who
              brings an equalizer for the car, tweaks home office speakers
              obsessively, and travels with audio gear just to test it in new
              environments. I'll spend a karaoke night analyzing mic placement
              instead of just singing.
            </p>
            <p>
              This isn't some quirk I've learned to tolerate—it's the foundation
              of what makes me great at what I do. When you hire For the Record,
              you're not just getting a DJ with equipment. You're getting
              someone whose brain never stops thinking about how to make your
              audio experience better.
            </p>
            <p className="drives-emphasis">
              <strong>Audio is never an afterthought.</strong> It's the
              invisible force that makes your wedding feel premium, polished,
              and perfectly executed. And I'll lose sleep making sure it's
              right.
            </p>
          </div>

          <div className="drives-image">
            <img src={AshleyAndMe} alt="Michael and Ashley" />
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <h2
          className="section-header"
          style={{ textAlign: "center", marginBottom: "3rem" }}
        >
          What I Stand For
        </h2>
        <div className="values-grid">
          <div className="value-card">
            <i data-lucide="volume-2"></i>
            <h3>Audio Excellence</h3>
            <p>
              Crystal clear ceremony audio, dynamic reception entertainment, and
              flawless technical execution. No compromise.
            </p>
          </div>

          <div className="value-card">
            <i data-lucide="eye-off"></i>
            <h3>Invisible Professionalism</h3>
            <p>
              I'm the expert you'll barely notice—until you do, because
              everything sounds incredible and runs smoothly.
            </p>
          </div>

          <div className="value-card">
            <i data-lucide="handshake"></i>
            <h3>Partnership & Ease</h3>
            <p>
              Your stress is my priority. Quick responses, clear communication,
              and handling every audio detail so you don't have to.
            </p>
          </div>

          <div className="value-card">
            <i data-lucide="music"></i>
            <h3>Fun & Energy</h3>
            <p>
              I genuinely love getting people on the dance floor and creating
              moments that last a lifetime.
            </p>
          </div>

          <div className="value-card">
            <i data-lucide="shield-check"></i>
            <h3>Integrity</h3>
            <p>
              What you see is what you get. No surprises, no hidden fees, no
              cutting corners. Ever.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="about-cta">
        <h2
          className="section-header"
          style={{ color: "#F8F6F1", marginBottom: "1rem" }}
        >
          Ready to Chat?
        </h2>
        <p
          style={{ color: "#F8F6F1", marginBottom: "2rem", fontSize: "1.1rem" }}
        >
          Let's talk about your wedding and what perfect sound means for your
          day.
        </p>
        <Link to="/get-in-touch" className="cta-button">
          Get In Touch
        </Link>
      </section>
    </div>
  );
}
