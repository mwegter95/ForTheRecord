import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./Navbar.scss";

const TopNavbar = ({ user, handleLogout }) => {
  return (
    <Navbar expand="lg" className="navbar-custom">
      <Container>
        <Navbar.Brand href="#home">DJ Synfinity</Navbar.Brand>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className="custom-toggler"
        />
        <Navbar.Collapse id="basic-navbar-nav">
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
              <>
                <Nav.Link disabled>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      backgroundColor: "#0078d4",
                      color: "white",
                      borderRadius: "50%",
                      width: "40px",
                      height: "40px",
                      justifyContent: "center",
                      marginRight: "10px",
                    }}
                  >
                    {user.firstName[0]}
                    {user.lastName[0]}
                  </div>
                  {user.firstName} {user.lastName}
                </Nav.Link>
                <Nav.Link onClick={handleLogout}>Logout</Nav.Link>
              </>
            )}
            <LinkContainer to="/booknow">
              <Nav.Link className="book-now">Book Now!</Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
