import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "./About.scss";
import PortraitMe from "../images/Portrait_me.jpeg";
import AshleyAndMe from "../images/Ashley_and_me.jpeg";
import DJDecks from "../images/DJ_Decks.jpeg";

const About = () => {
  return (
    <div className="about-page">
      <Container className="about-container">
        <h1>About Us</h1>
        <div className="welcome-text">
          <h2>Welcome to For the Record</h2>
          <p>
            Welcome to For the Record! We are dedicated to providing the best DJ
            and audio experience for your events. Learn more about our journey,
            and what makes us unique.
          </p>
          <h2>WHY US?</h2>
          <p>
            For The Record is all about making sure your event's audio is
            sounding great and has no hiccups. Founded by Michael "DJ Synfinity"
            Wegter with the intention to root out bad audio at events, For The
            Record is dedicated to using passion and experience to provide great
            service, with a great sound, at a great rate.
          </p>
        </div>
        <Row className="about-row">
          <Col md={6} className="about-card-image">
            <img src={PortraitMe} alt="Our Team" />
          </Col>
          <Col md={6} className="about-card-text">
            <Card className="about-card">
              <Card.Body>
                <Card.Title>Our Team</Card.Title>
                <Card.Text>
                  Meet the people who make the magic happen. Here at For The
                  Record, we're a team of one! Michael is an experienced DJ and
                  event audio planner dedicated to making your event
                  unforgettable.
                  <ul>
                    <li>
                      <strong>Founder:</strong> Michael W started the company in
                      2024 with a vision to provide excellent audio for weddings
                      and events, so no one has to suffer bad audio during their
                      day. These memories will be for the record, and you want
                      them to sound great.
                    </li>
                    <li>
                      <strong>DJ Experience:</strong> Michael has over 9 years
                      of combined experience in the industry.
                    </li>
                    <li>
                      <strong>Specialties:</strong> We specialize in Audio and
                      Microphones, DJing, and MCing.
                    </li>
                    <li>
                      <strong>Education:</strong> Bachelor of Arts in Music from
                      St. Olaf College, 2018.
                    </li>
                  </ul>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="about-row">
          <Col md={12} className="about-card-text">
            <Card className="about-card">
              <Card.Body>
                <Card.Title>Our Journey</Card.Title>
                <Card.Text>
                  From humble beginnings to becoming a leading name in the DJ
                  industry, our journey is a testament to our passion and
                  dedication.
                  <img
                    src={AshleyAndMe}
                    alt="Our Journey"
                    className="embedded-photo"
                  />
                  <p>
                    It all started in 2024 when Michael decided to turn his
                    passion for audio and music into a professional service.
                    Over the years, we have achieved numerous milestones.
                  </p>
                  <p>
                    Today, we are proud to have served countless happy clients.
                    Our mission is to provide unparalleled audio experiences for
                    all events.
                  </p>
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="about-row">
          <Col md={12} className="about-card-text">
            <Card className="about-card">
              <Card.Img variant="top" src={DJDecks} alt="Our Events" />
              <Card.Body>
                <Card.Title>What We Offer</Card.Title>
                <Card.Text>
                  We provide a range of DJ services tailored to your needs. From
                  weddings to corporate events, we have you covered.
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
