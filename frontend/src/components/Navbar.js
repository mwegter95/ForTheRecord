import React from "react";
import { Navbar, Nav, Container } from "react-bootstrap";
import { NavLink } from "react-router-dom";
import { LinkContainer } from "react-router-bootstrap";
import "./Navbar.scss";

const TopNavbar = ({ user, handleLogout }) => {
  return (
    <Navbar expand="lg" className="navbar-custom">
      <Container>
        <Navbar.Brand href="#home">For The Record</Navbar.Brand>
        <Navbar.Toggle
          aria-controls="basic-navbar-nav"
          className="custom-toggler"
        />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ml-auto">
            <LinkContainer to="/" exact>
              <Nav.Link as={NavLink} to="/" activeClassName="active">
                Home
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/about">
              <Nav.Link as={NavLink} to="/about" activeClassName="active">
                About
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/weddings">
              <Nav.Link as={NavLink} to="/weddings" activeClassName="active">
                Weddings
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/events">
              <Nav.Link as={NavLink} to="/events" activeClassName="active">
                Events
              </Nav.Link>
            </LinkContainer>
            <LinkContainer to="/whyus">
              <Nav.Link as={NavLink} to="/whyus" activeClassName="active">
                Why Us?
              </Nav.Link>
            </LinkContainer>
            {!user ? (
              <>
                <LinkContainer to="/login">
                  <Nav.Link as={NavLink} to="/login" activeClassName="active">
                    Log In
                  </Nav.Link>
                </LinkContainer>
                <LinkContainer to="/signup">
                  <Nav.Link as={NavLink} to="/signup" activeClassName="active">
                    Sign Up
                  </Nav.Link>
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
              <Nav.Link
                as={NavLink}
                to="/booknow"
                activeClassName="active"
                className="book-now"
              >
                Book Now!
              </Nav.Link>
            </LinkContainer>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopNavbar;
