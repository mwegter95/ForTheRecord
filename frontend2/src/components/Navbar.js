// src/components/Navbar.js
import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import "./Navbar.scss";

const TopNavbar = () => {
  return (
    <Navbar expand="lg" className="navbar-custom">
      <Container>
        <Navbar.Brand href="#home">DJ Synfinity</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#about">About</Nav.Link>
            <Nav.Link href="#weddings">Weddings</Nav.Link>
            <Nav.Link href="#events">Events</Nav.Link>
            <Nav.Link href="#whyus">Why Us?</Nav.Link>
            <Nav.Link href="#login">Log In</Nav.Link>
            <Nav.Link href="#booknow" className="book-now">
              Book Now!
            </Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
