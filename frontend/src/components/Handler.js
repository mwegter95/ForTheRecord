import React, { useState, useEffect } from "react";
import { Route, Routes, Link, Navigate } from "react-router-dom";
import axios from "axios";
import SignUp from "./SignUp";
import Login from "./Login";
import Home from "./Home";
import About from "./About";
import BookNow from "./BookNow";
import TopNavbar from "./Navbar";

const ROLE_ADMIN = "admin";
const SECRET_KEY = "your_secret_key";

const Handler = () => {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
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

  const logAction = (action, reaction) => {
    axios
      .post(
        "http://localhost:8000/log",
        { action, reaction },
        { headers: { "secret-key": SECRET_KEY } }
      )
      .then((response) => console.log(response.data))
      .catch((error) =>
        console.error("There was an error logging the action!", error)
      );
  };

  const getLogs = () => {
    axios
      .get("http://localhost:8000/logs", { headers: getAuthHeader() })
      .then((response) => setLogs(response.data))
      .catch((error) =>
        console.error("There was an error fetching the logs!", error)
      );
  };

  const handleClick = (e) => {
    const action = e.target.getAttribute("data-action");
    const reaction = "User clicked on " + action;
    logAction(action, reaction);
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem("token");
    return { Authorization: `Bearer ${token}` };
  };

  const getUserDetailsFromToken = (token) => {
    return {
      firstName: "John",
      lastName: "Doe",
      role: "user",
    };
  };

  if (loggedOut) {
    return <Navigate to="/" />;
  }

  return (
    <div>
      <TopNavbar user={user} handleLogout={handleLogout} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<h2>Contact Us</h2>} />
        <Route path="/booknow" element={<BookNow />} />
        <Route
          path="/logs"
          element={
            user && user.role === ROLE_ADMIN ? (
              <div>
                <h2>Logs</h2>
                <pre>{JSON.stringify(logs, null, 2)}</pre>
              </div>
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login onLogin={handleLogin} />} />
      </Routes>
    </div>
  );
};

export default Handler;
