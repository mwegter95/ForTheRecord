import private_party from '../images/private-party.jpg';
import corporate_event from '../images/corporate-event.jpg';
import community_event from '../images/community-event.jpg';
import React from "react";
import "./Events.scss";

const Events = () => {
  return (
    <div className="events-page">
      <div className="content-container">
        <h1>Events</h1>
        <p className="intro-text">Soundtracking unforgettable experiences.</p>
        <div className="card-grid">
          <div className="info-card">
            <div className="card-photo">
              <img
                src={corporate_event}
                alt="Corporate Event"
              />
            </div>
            <div className="card-body">
              <h5 className="card-title">Corporate Event</h5>
              <p className="card-text">
                Professional audio for keynotes, panels, and corporate parties.
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="card-photo">
              <img
                src={private_party}
                alt="Birthday Party"
              />
            </div>
            <div className="card-body">
              <h5 className="card-title">Private Party</h5>
              <p className="card-text">
                Make birthdays and private parties unforgettable.
              </p>
            </div>
          </div>

          <div className="info-card">
            <div className="card-photo">
              <img
                src={community_event}
                alt="Community Event"
              />
            </div>
            <div className="card-body">
              <h5 className="card-title">Community Event</h5>
              <p className="card-text">
                Vibrant music setups for local and public celebrations.
              </p>
            </div>
          </div>
        </div>

        <div className="cta" style={{ textAlign: "center", marginTop: "2rem" }}>
          <a href="/booknow" className="cta-button">
            Book Your Event
          </a>
        </div>
      </div>
    </div>
  );
};

export default Events;
