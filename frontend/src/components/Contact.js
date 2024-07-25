import React from "react";
import { Container, Card, Button } from "react-bootstrap";
import "./Contact.scss";

const Contact = () => {
  return (
    <Container className="contact-page">
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
              <strong>Note:</strong> Please call or text, and leave a message
              with your wedding date. I'll call back within 1-2 business days.
              <br />
            </Card.Text>
            <Button variant="primary" href="/booknow">
              Book Now!
            </Button>
          </Card.Body>
        </Card>
      </div>
    </Container>
  );
};

export default Contact;
