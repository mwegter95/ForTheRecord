import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./Navbar.scss";

const TopNavbar = ({ user, handleLogout }) => {
  return (
    <Navbar className="navbar-custom">
      <Container>
        <Navbar.Brand href="/">DJ Synfinity</Navbar.Brand>
        <Nav className="ml-auto">
          <LinkContainer to="/">
            <Nav.Link>Home</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/about">
            <Nav.Link>About</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/weddings">
            <Nav.Link>Weddings</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/events">
            <Nav.Link>Events</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/whyus">
            <Nav.Link>Why Us?</Nav.Link>
          </LinkContainer>
          <LinkContainer to="/booknow">
            <Nav.Link className="book-now">Book Now!</Nav.Link>
          </LinkContainer>
          {!user ? (
            <>
              <LinkContainer to="/login">
                <Nav.Link>Log In</Nav.Link>
              </LinkContainer>
              <LinkContainer to="/signup">
                <Nav.Link>Sign Up</Nav.Link>
              </LinkContainer>
            </>
          ) : (
            <div className="user-section">
              <div className="user-initials">
                {user.firstName &&
                  user.lastName &&
                  `${user.firstName[0]}${user.lastName[0]}`}
              </div>
              <span className="user-name">
                {user.firstName} {user.lastName}
              </span>
              <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
            </div>
          )}
        </Nav>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
