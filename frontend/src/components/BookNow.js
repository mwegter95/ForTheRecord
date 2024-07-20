import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "./BookNow.scss";

const BookNow = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    date: new Date(),
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      date: date,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you can handle form submission (e.g., send the data to a backend)
    setSubmitted(true);
  };

  return (
    <Container className="book-now-container">
      {submitted ? (
        <Alert variant="success">
          <h4>Thank You!</h4>
          <p>
            We will check on the date and give you a phone call within 1-2
            business days.
          </p>
        </Alert>
      ) : (
        <Form onSubmit={handleSubmit}>
          <h1>Book Now</h1>
          <Form.Group controlId="formFirstName">
            <Form.Label>First Name</Form.Label>
            <Form.Control
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formLastName">
            <Form.Label>Last Name</Form.Label>
            <Form.Control
              type="text"
              name="lastName"
              value={formData.lastName}
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
          <Form.Group controlId="formPhone">
            <Form.Label>Phone Number</Form.Label>
            <Form.Control
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              required
            />
          </Form.Group>
          <Form.Group controlId="formDate">
            <Form.Label>Date</Form.Label>
            <DatePicker
              selected={formData.date}
              onChange={handleDateChange}
              className="form-control"
              required
            />
          </Form.Group>
          <Button variant="primary" type="submit">
            Submit
          </Button>
        </Form>
      )}
    </Container>
  );
};

export default BookNow;
