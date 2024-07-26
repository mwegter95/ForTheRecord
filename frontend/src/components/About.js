import React from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import "./About.scss";
import PortraitMe from "../images/Portrait_me.jpeg";
import AshleyAndMe from "../images/Ashley_and_me.jpeg";
import DJDecks from "../images/DJ_Decks.jpeg";

const About = () => {
  return (
    <div className="about-page">
      <Container>
        <h1 className="about-us-heading">About Us</h1>
        <div className="about-header">
          <div className="about-header-content">
            <h2>Welcome to For the Record!</h2>
            <p>
              We are dedicated to providing the best DJ and audio experience for
              your events. Learn more about our journey, and what makes us
              unique.
            </p>
            <h2>WHY US?</h2>
            <p>
              For The Record is all about making sure your event's audio is
              sounding great and has no hiccups. Founded by Michael "DJ
              Synfinity" Wegter with the intention to root out bad audio at
              events, For The Record is dedicated to using passion and
              experience to provide great service, with a great sound, at a
              great rate.
            </p>
          </div>
          <img
            src={PortraitMe}
            alt="Michael Wegter"
            className="about-header-image"
          />
        </div>
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="about-card">
              <Card.Body>
                <Card.Title>Our Team</Card.Title>
                <Card.Text>
                  <ul>
                    <li>
                      <strong>Founder:</strong> Michael Wegter started the
                      company in 2024 with a vision to provide excellent audio
                      for weddings and events.
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
        <Row className="justify-content-center">
          <Col md={8}>
            <Card className="about-card">
              <Card.Body>
                <Card.Title>Our Journey</Card.Title>
                <Card.Text>
                  Michael started making music in elementary school, as a
                  saxophonist at school and a music producer at home in 3rd
                  grade when his brother introduced FL Studio to him. In
                  college, in Shanghai, the club DJ atmosphere struck Michael,
                  and he bought a DJ controller when he got back to the states.
                  Now he's DJed dozens of events, and is excited to host yours!
                  With an ear and a degree for music, and a passion for making
                  great audio experiences, Michael wants your day to be sounding
                  perfect.
                </Card.Text>
                <img
                  src={AshleyAndMe}
                  alt="Our Journey"
                  className="embedded-photo"
                />
              </Card.Body>
            </Card>
          </Col>
        </Row>
        <Row className="justify-content-center">
          <Col md={8}>
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
