import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import SignUp from "./SignUp";
import Login from "./Login";
import Home from "./Home";
import About from "./About";
import Contact from "./Contact";
import BookNow from "./BookNow";
import TopNavbar from "./Navbar";
import Weddings from "./Weddings";
import Events from "./Events";

const Handler = () => {
  const [user, setUser] = useState(null);
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const userDetails = getUserDetailsFromToken(token);
      setUser(userDetails);
    }
  }, []);

  const handleLogin = (token, firstName, lastName) => {
    setUser({ token, firstName, lastName, role: "user" });
    localStorage.setItem("token", token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    setLoggedOut(true);
  };

  const getUserDetailsFromToken = () => ({
    firstName: "John",
    lastName: "Doe",
    role: "user",
  });

  if (loggedOut) return <Navigate to="/" />;

  return (
    <div>
      <TopNavbar user={user} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/booknow" element={<BookNow />} />
        <Route path="/weddings" element={<Weddings />} />
        <Route path="/events" element={<Events />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
      </Routes>
    </div>
  );
};

export default Handler;
