import React, { useState, useEffect } from "react";
import { Route, Routes, Navigate } from "react-router-dom";
import axios from "axios";
import SignUp from "./SignUp";
import Login from "./Login";
import TopNavbar from "./Navbar";
import Home from "./Home";
import "./Handler.scss";

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
    localStorage.setItem("firstName", firstName);
    localStorage.setItem("lastName", lastName);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("firstName");
    localStorage.removeItem("lastName");
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
    const firstName = localStorage.getItem("firstName");
    const lastName = localStorage.getItem("lastName");
    return {
      firstName: firstName || "FirstName",
      lastName: lastName || "LastName",
      role: "user",
    };
  };

  if (loggedOut) {
    return <Navigate to="/" />;
  }

  return (
    <div className="app-container">
      <TopNavbar user={user} handleLogout={handleLogout} />
      <Routes>
        <Route path="/about" element={<h2>About Us</h2>} />
        <Route path="/contact" element={<h2>Contact Us</h2>} />
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
        <Route path="/" element={<Home />} />
      </Routes>
    </div>
  );
};

export default Handler;
