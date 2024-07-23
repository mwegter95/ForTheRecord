import React, { useState } from "react";
import { Form, Button, Container, Card, Alert } from "react-bootstrap";
import "./Contact.scss";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can handle form submission (e.g., send the data to a backend)
    setSubmitted(true);
  };

  return (
    <Container className="contact-page">
      <h1>Contact Us</h1>
      <div className="contact-card">
        <Card className="business-card">
          <Card.Body>
            <Card.Title>DJ Synfinity</Card.Title>
            <Card.Text>
              <strong>Email:</strong> info@djsynfinity.com
              <br />
              <strong>Phone:</strong> (123) 456-7890
              <br />
              <strong>Address:</strong> 123 DJ Street, Music City, NY 12345
              <br />
            </Card.Text>
            <Button variant="primary" href="/booknow">
              Book Now!
            </Button>
          </Card.Body>
        </Card>
      </div>
      {submitted ? (
        <Alert variant="success">
          <h4>Thank You!</h4>
          <p>Your message has been sent. We will get back to you soon.</p>
        </Alert>
      ) : (
        <Form onSubmit={handleSubmit} className="contact-form">
          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formEmail">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formMessage">
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows={3}
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Send
          </Button>
        </Form>
      )}
    </Container>
  );
};

export default Contact;
