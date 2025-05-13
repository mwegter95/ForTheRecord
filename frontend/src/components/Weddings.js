import wedding3 from '../images/wedding3.jpg';
import wedding2 from '../images/wedding2.jpg';
import wedding1 from '../images/wedding1.jpg';
import React from "react";
import { Container, Card } from "react-bootstrap";
import "./Weddings.scss";
import { Button } from "react-bootstrap";
import { Link } from "react-router-dom";

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
              <img src={wedding1} alt="Wedding DJ Setup" />
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
              <img src={wedding2} alt="Wedding Reception Dancing" />
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
              <img src={wedding3} alt="Wedding Party" />
            </div>
            <Card.Body>
              <Card.Title>Custom Playlists</Card.Title>
              <Card.Text>
                We work with you to build a personalized soundtrack you and your
                guests will love.
              </Card.Text>
            </Card.Body>
          </Card>
          <div className="cta full-width">
            <Button
              as={Link}
              to="/booknow"
              variant="primary"
              className="full-width-btn"
            >
              Book Now!
            </Button>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Weddings;
