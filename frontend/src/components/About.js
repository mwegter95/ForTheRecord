import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "./About.scss";
import portraitImage from "../images/Portrait_me.jpeg"; // Import the image

const About = () => {
  return (
    <Container className="about-page">
      <h1>About Us</h1>
      <Row className="about-content">
        <Col md={4}>
          <Card className="about-card">
            <Card.Img
              variant="top"
              src={portraitImage}
              className="card-img-top"
            />
          </Card>
        </Col>
        <Col md={8}>
          <Card className="about-card">
            <Card.Body>
              <Card.Title>DJ Synfinity</Card.Title>
              <Card.Text>
                Welcome to the world of DJ Synfinity. Our passion for music and
                commitment to excellence have made us one of the most
                sought-after DJ services in the area. We specialize in weddings,
                events, and parties, providing a tailored experience that keeps
                your guests dancing all night long.
              </Card.Text>
              <Card.Text>
                <strong>Our Story:</strong> It all started with a love for music
                and a desire to bring people together through unforgettable
                events. Over the years, we have perfected our craft, ensuring
                that every performance is better than the last.
              </Card.Text>
              <Card.Text>
                <strong>What We Offer:</strong> From state-of-the-art sound
                systems to a vast library of tracks spanning various genres, we
                have everything needed to make your event a success. Our team
                works closely with you to understand your preferences and
                deliver a personalized experience.
              </Card.Text>
              <Card.Text>
                <strong>Why Choose Us?</strong>
                <ul>
                  <li>
                    <strong>Professionalism:</strong> We pride ourselves on our
                    professionalism and reliability.
                  </li>
                  <li>
                    <strong>Experience:</strong> Years of experience in the
                    industry.
                  </li>
                  <li>
                    <strong>Flexibility:</strong> We cater to a wide range of
                    musical tastes and event styles.
                  </li>
                </ul>
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default About;
