import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "./About.scss";
import Portrait_me from "../images/Portrait_me.jpeg";
import Ashley_and_me from "../images/Ashley_and_me.jpeg";
import DJ_Decks from "../images/DJ_Decks.jpeg";

const About = () => {
  return (
    <div className="about-page">
      <Container>
        <h1>About Us</h1>
        <p>
          Welcome to For the Record! We are dedicated to providing the best DJ
          experience for your events. Learn more about our journey, our team,
          and what makes us unique.
        </p>
        <Row>
          <Col md={12}>
            <Card className="about-card">
              <Card.Img variant="top" src={Portrait_me} alt="Our Team" />
              <Card.Body>
                <Card.Title>Our Team</Card.Title>
                <Card.Text>
                  Meet the people who make the magic happen. We are a team of
                  experienced DJs and event planners dedicated to making your
                  event unforgettable.
                  {/* Placeholder text for interview/mad libs */}
                  <ul>
                    <li>
                      <strong>Founder:</strong> [Founder Name] started the
                      company in [Year] with a vision to [Vision Statement].
                    </li>
                    <li>
                      <strong>DJ Experience:</strong> Our DJs have over [X]
                      years of combined experience in the industry.
                    </li>
                    <li>
                      <strong>Specialties:</strong> We specialize in [Specialty
                      1], [Specialty 2], and [Specialty 3].
                    </li>
                  </ul>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Card className="about-card">
              <Card.Body>
                <Card.Title>Our Journey</Card.Title>
                <Card.Text>
                  From humble beginnings to becoming a leading name in the DJ
                  industry, our journey is a testament to our passion and
                  dedication.
                  <img
                    src={Ashley_and_me}
                    alt="Our Journey"
                    className="embedded-photo"
                  />
                  {/* Placeholder text for interview/mad libs */}
                  <p>
                    It all started in [Year] when [Founder Name] decided to
                    [Founder’s Initial Steps]. Over the years, we have [Major
                    Milestones].
                  </p>
                  <p>
                    Today, we are proud to have [Achievements]. Our mission is
                    to [Mission Statement].
                  </p>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row>
          <Col md={12}>
            <Card className="about-card">
              <Card.Img variant="top" src={DJ_Decks} alt="Our Events" />
              <Card.Body>
                <Card.Title>What We Offer</Card.Title>
                <Card.Text>
                  We provide a range of DJ services tailored to your needs. From
                  weddings to corporate events, we have you covered.
                  {/* Placeholder text for interview/mad libs */}
                  <ul>
                    <li>
                      <strong>Weddings:</strong> Create unforgettable memories
                      with our wedding DJ services.
                    </li>
                    <li>
                      <strong>Corporate Events:</strong> Make your corporate
                      events more lively with our professional DJs.
                    </li>
                    <li>
                      <strong>Private Parties:</strong> Turn your private
                      parties into extraordinary events.
                    </li>
                  </ul>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default About;
