import wedding_dance_bouqet_toss from "../images/wedding_dance_bouqet_toss.jpg";
import Portrait_me from "../images/Portrait_me.jpeg";
import DJ_Decks from "../images/DJ_Decks.jpeg";
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
        <a href="/book-now.html" className="hero-button">
          Book Now!
        </a>
      </div>

      <Container className="cards-container">
        <Card className="info-card">
          <div className="card-photo portrait">
            <img src={Portrait_me} alt="About Us" />
          </div>
          <Card.Body>
            <Card.Title>About Us</Card.Title>
            <Card.Text>
              Learn more about For The Record and our journey.
            </Card.Text>
            <Button as={Link} to="/about" variant="primary">
              Learn More
            </Button>
          </Card.Body>
        </Card>

        <Card className="info-card">
          <div className="card-photo bouquet">
            <img src={wedding_dance_bouqet_toss} alt="Weddings" />
          </div>
          <Card.Body>
            <Card.Title>Weddings</Card.Title>
            <Card.Text>
              Make your special day unforgettable with our DJ services.
            </Card.Text>
            <Button as={Link} to="/weddings" variant="primary">
              Learn More
            </Button>
          </Card.Body>
        </Card>

        <Card className="info-card">
          <div className="card-photo dj-decks">
            <img src={DJ_Decks} alt="Events" />
          </div>
          <Card.Body>
            <Card.Title>Events</Card.Title>
            <Card.Text>
              We cater to all kinds of events, big or small.
            </Card.Text>
            <Button as={Link} to="/events" variant="primary">
              Learn More
            </Button>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Home;
