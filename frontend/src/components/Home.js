import { Link } from "react-router-dom";
import React from "react";
import { Card, Button, Container } from "react-bootstrap";
import "./Home.scss";

const Home = () => {
  return (
    <div id="home" className="hero">
      <div className="hero-content">
        <h1>For The Record</h1>
        <p>Exceptional audio expertise for your perfect sounding day.</p>
        <Link to="/booknow" className="hero-button">
          Book Now!
        </Link>
      </div>

      <Container className="cards-container">
        <Card className="info-card">
          <div className="card-photo portrait">
            <img src={"../../public/images/Portrait_me.jpeg"} alt="About Us" />
          </div>
          <Card.Body>
            <Card.Title>About Us</Card.Title>
            <Card.Text>
              Learn more about For The Record and our journey.
            </Card.Text>
            <Button variant="primary" href="/about">
              Learn More
            </Button>
          </Card.Body>
        </Card>

        <Card className="info-card">
          <div className="card-photo bouquet">
            <img src={"../../public/images/wedding_dance_bouqet_toss.jpg"} alt="Weddings" />
          </div>
          <Card.Body>
            <Card.Title>Weddings</Card.Title>
            <Card.Text>
              Make your special day unforgettable with our DJ services.
            </Card.Text>
            <Button variant="primary" href="weddings">
              Learn More
            </Button>
          </Card.Body>
        </Card>

        <Card className="info-card">
          <div className="card-photo dj-decks">
            <img src={"../../images/public/DJ_Decks.jpeg"} alt="Events" />
          </div>
          <Card.Body>
            <Card.Title>Events</Card.Title>
            <Card.Text>
              We cater to all kinds of events, big or small.
            </Card.Text>
            <Button variant="primary" href="events">
              Learn More
            </Button>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Home;
