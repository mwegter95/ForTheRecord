import React from "react";
import "./Events.scss";

const Events = () => {
  return (
    <div className="events-page">
      <div className="hero-section">
        <h1>Events</h1>
        <p>Soundtracking unforgettable experiences.</p>
      </div>
      <div className="content-section">
        <div className="card-grid">
          <div className="event-card">
            <img
              src="https://images.pexels.com/photos/1679825/pexels-photo-1679825.jpeg"
              alt="Corporate Event"
            />
            <p>Professional audio for keynotes, panels & brand activations.</p>
          </div>
          <div className="event-card">
            <img
              src="https://images.pexels.com/photos/1679825/pexels-photo-1679825.jpeg"
              alt="Birthday Party"
            />
            <p>Make birthdays and private parties unforgettable.</p>
          </div>
          <div className="event-card">
            <img
              src="https://images.pexels.com/photos/1679825/pexels-photo-1679825.jpeg"
              alt="Community Event"
            />
            <p>Vibrant music setups for local and public celebrations.</p>
          </div>
        </div>
        <div className="cta">
          <a href="/booknow" className="cta-button">
            Book Your Event
          </a>
        </div>
      </div>
    </div>
  );
};

export default Events;
