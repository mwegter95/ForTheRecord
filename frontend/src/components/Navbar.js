import React, { useState } from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./Navbar.scss";
// import DJIcon from "../images/dj-icon.svg";

const TopNavbar = ({ user, handleLogout }) => {
  const [expanded, setExpanded] = useState(false);

  const closeMenu = () => setExpanded(false);

  return (
    <Navbar
      expand="lg"
      className="navbar-custom"
      expanded={expanded}
      onToggle={setExpanded}
    >
      <Container>
        <LinkContainer to="/">
          <Navbar.Brand onClick={closeMenu} className="navbar-logo">
            {/* <img src={DJIcon} alt="DJ icon" className="logo-icon" /> */}
            For The Record
          </Navbar.Brand>
        </LinkContainer>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className="custom-toggler"
        >
          <span className="navbar-toggler-icon">
            <span></span>
          </span>
        </Navbar.Toggle>
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <LinkContainer to="/">
              <Nav.Link onClick={closeMenu} data-action="home">
                Home
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/about">
              <Nav.Link onClick={closeMenu} data-action="about">
                About
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/weddings">
              <Nav.Link onClick={closeMenu} data-action="weddings">
                Weddings
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/events">
              <Nav.Link onClick={closeMenu} data-action="events">
                Events
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/contact">
              <Nav.Link onClick={closeMenu} data-action="contact">
                Contact
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/booknow">
              <Nav.Link
                onClick={closeMenu}
                data-action="booknow"
                className="book-now"
              >
                Book Now! / Inquire Dates
              </Nav.Link>
            </LinkContainer>
            {/* {!user ? (
              <>
                <LinkContainer to="/signup">
                  <Nav.Link onClick={closeMenu}>Sign Up</Nav.Link>
                </LinkContainer>
                <LinkContainer to="/login">
                  <Nav.Link onClick={closeMenu}>Log In</Nav.Link>
                </LinkContainer>
              </>
            ) : (
              <Nav.Link
                onClick={() => {
                  closeMenu();
                  handleLogout();
                }}
              >
                Logout
              </Nav.Link>
            )} */}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
