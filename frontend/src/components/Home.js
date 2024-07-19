import React from "react";
import { LinkContainer } from "react-router-bootstrap";
import "./Home.scss";

const Home = () => {
  return (
    <div className="hero">
      <div className="hero-content">
        <h1>For the Record</h1>
        <p>Your Premier DJ Experience</p>
        <LinkContainer to="/booknow">
          <button className="hero-button">Book Now!</button>
        </LinkContainer>
      </div>
    </div>
  );
};

export default Home;
