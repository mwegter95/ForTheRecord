import React from "react";
import { Container, Card, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import "./Contact.scss";

const Contact = () => {
  return (
    <div className="contact-page">
      <Container>
        <h1>Contact Us</h1>
        <div className="contact-card">
          <Card className="business-card">
            <Card.Body>
              <Card.Title>For The Record</Card.Title>
              <Card.Text>
                <strong>Email:</strong> michael@fortherecordmn.com
                <br />
                <strong>Phone:</strong> 763-496-7006
                <br />
                Please call or text, leave a message with your event or wedding
                date. I'll call back within 1-2 business days.
              </Card.Text>
              <Button as={Link} to="/booknow" variant="primary">
                Book Now!
              </Button>
            </Card.Body>
          </Card>
        </div>
      </Container>
    </div>
  );
};

export default Contact;
