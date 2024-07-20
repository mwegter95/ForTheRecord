import React from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import "./Home.scss";
import PortraitMe from "../images/Portrait_me.jpeg";
import WeddingDance from "../images/wedding_dance_bouqet_toss.jpg";
import DJDecks from "../images/DJ_Decks.jpeg";

const Home = () => {
  return (
    <div id="home" className="hero">
      <div className="hero-content">
        <h1>For The Record</h1>
        <p>Exceptional audio expertise for your perfect sounding day.</p>
        <a href="#booknow" className="hero-button">
          Book Now!
        </a>
      </div>
      <Container className="cards-container">
        <Row>
          <Col md={4}>
            <Card className="info-card">
              <div className="card-photo portrait">
                <img src={PortraitMe} alt="About Us" />
              </div>
              <Card.Body>
                <Card.Title>About Us</Card.Title>
                <Card.Text>
                  Learn more about DJ Synfinity and our journey.
                </Card.Text>
                <Button variant="primary" href="#about">
                  Learn More
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="info-card">
              <div className="card-photo bouquet">
                <img src={WeddingDance} alt="Weddings" />
              </div>
              <Card.Body>
                <Card.Title>Weddings</Card.Title>
                <Card.Text>
                  Make your special day unforgettable with our DJ services.
                </Card.Text>
                <Button variant="primary" href="#weddings">
                  Learn More
                </Button>
              </Card.Body>
            </Card>
          </Col>
          <Col md={4}>
            <Card className="info-card">
              <div className="card-photo dj-decks">
                <img src={DJDecks} alt="Events" />
              </div>
              <Card.Body>
                <Card.Title>Events</Card.Title>
                <Card.Text>
                  We cater to all kinds of events, big or small.
                </Card.Text>
                <Button variant="primary" href="#events">
                  Learn More
                </Button>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Home;
