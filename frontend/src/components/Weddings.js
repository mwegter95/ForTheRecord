import React from "react";
import { Container, Card, Row, Col } from "react-bootstrap";
import "./Weddings.scss";

const Weddings = () => {
  return (
    <div className="page-wrapper weddings-page">
      <Container className="content-container">
        <h1>Weddings</h1>
        <p className="intro-text">
          Your big day deserves flawless sound and unforgettable vibes. We
          specialize in weddings of all sizes, customizing every detail to match
          your dream celebration.
        </p>
        <div className="card-grid">
          <Card className="info-card">
            <div className="card-photo">
              <img src="/images/wedding1.jpg" alt="Wedding DJ Setup" />
            </div>
            <Card.Body>
              <Card.Title>Ceremony Audio</Card.Title>
              <Card.Text>
                Crystal-clear microphones and music cues for your most important
                vows.
              </Card.Text>
            </Card.Body>
          </Card>

          <Card className="info-card">
            <div className="card-photo">
              <img src="/images/wedding2.jpg" alt="Wedding Reception Dancing" />
            </div>
            <Card.Body>
              <Card.Title>Reception Entertainment</Card.Title>
              <Card.Text>
                From grand entrance to last dance, we keep the energy high and
                the dancefloor packed.
              </Card.Text>
            </Card.Body>
          </Card>

          <Card className="info-card">
            <div className="card-photo">
              <img src="/images/wedding3.jpg" alt="Wedding Party" />
            </div>
            <Card.Body>
              <Card.Title>Custom Playlists</Card.Title>
              <Card.Text>
                We work with you to build a personalized soundtrack you and your
                guests will never forget.
              </Card.Text>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default Weddings;
