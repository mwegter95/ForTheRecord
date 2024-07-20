import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./Navbar.scss";

const TopNavbar = ({ user, handleLogout }) => {
  return (
    <Navbar expand="lg" className="navbar-custom">
      <Container>
        <Navbar.Brand href="/">DJ Synfinity</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <LinkContainer to="/">
              <Nav.Link data-action="home">Home</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/about">
              <Nav.Link data-action="about">About</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/contact">
              <Nav.Link data-action="contact">Contact</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/booknow">
              <Nav.Link data-action="booknow" className="book-now">
                Book Now!
              </Nav.Link>
            </LinkContainer>
            {!user ? (
              <>
                <LinkContainer to="/signup">
                  <Nav.Link>Sign Up</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/login">
                  <Nav.Link>Log In</Nav.Link>
                </LinkContainer>
              </>
            ) : (
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
