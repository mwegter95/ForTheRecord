import React, { useState } from "react";
import { Form, Button, Container, Alert } from "react-bootstrap";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import useEmail from "../hooks/useEmail";
import "./BookNow.scss";

const BookNow = () => {
  const { status, sendEmail } = useEmail();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    date: new Date(),
  });

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
    sendEmail(formData);
  };

  return (
    <div className="book-now-page">
      <Container className="book-now-container">
        {status.state === "success" ? (
          <Alert variant="success">
            <h4>Thank You!</h4>
            <p>
              We will check on the date and give you a phone call within 1–2
              business days.
            </p>
          </Alert>
        ) : (
          <>
            <div className="info-box">
              <p>
                This form is only for inquiring about availability and getting
                on the schedule. If you're the first to inquire for a date and
                it's available, you'll be added to the calendar! You will recieve a call in 1-2 business days to discuss event needs, desires, and pricing. This is all free and no obligation! Then you get time to decide and hopefully pick us for a great rate, great audio, and great times.
              </p>
            </div>

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
                <Form.Label>Date of Event</Form.Label>
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
              {status.state === "error" && (
                <Alert variant="danger" className="mt-3">
                  {status.message}
                </Alert>
              )}
            </Form>
          </>
        )}
      </Container>
    </div>
  );
};

export default BookNow;
