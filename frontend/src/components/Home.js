import React from "react";
import { Card, Button, Container, Row, Col } from "react-bootstrap";
import "./Home.scss";

const Home = () => {
  return (
    <div id="home" className="hero">
      <div className="hero-content">
        <h1>For the Record</h1>
        <p>Your Premier DJ Experience</p>
        <a href="#booknow" className="hero-button">
          Book Now!
        </a>
      </div>
      <Container className="cards-container">
        <Row>
          <Col md={4}>
            <Card className="info-card">
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
