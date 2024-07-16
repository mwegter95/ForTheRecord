import React, { useState, useEffect } from "react";
import { Route, Routes, Link, Navigate } from "react-router-dom";
import axios from "axios";
import SignUp from "./SignUp";
import Login from "./Login";

const ROLE_ADMIN = "admin";
const SECRET_KEY = "your_secret_key";

const Handler = () => {
  const [user, setUser] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loggedOut, setLoggedOut] = useState(false);

  useEffect(() => {
    // Check if there's a token in localStorage
    const token = localStorage.getItem("token");
    if (token) {
      // Assuming you have a way to get user details from the token
      const userDetails = getUserDetailsFromToken(token);
      setUser(userDetails);
    }
  }, []);

  const handleLogin = (token, firstName, lastName) => {
    setUser({ token, firstName, lastName, role: "user" }); // Assuming default role as 'user'
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
    // Mock function to decode token and get user details
    // Replace with actual implementation
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
      <nav>
        <ul>
          <li>
            <Link to="/" data-action="home" onClick={handleClick}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/about" data-action="about" onClick={handleClick}>
              About
            </Link>
          </li>
          <li>
            <Link to="/contact" data-action="contact" onClick={handleClick}>
              Contact
            </Link>
          </li>
          {user && user.role === ROLE_ADMIN && (
            <li>
              <Link to="/logs" onClick={getLogs}>
                Logs
              </Link>
            </li>
          )}
          {!user ? (
            <>
              <li>
                <Link to="/signup">Sign Up</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
            </>
          ) : (
            <>
              <li>
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
                <span>
                  {user.firstName} {user.lastName}
                </span>
              </li>
              <li>
                <button onClick={handleLogout}>Logout</button>
              </li>
            </>
          )}
        </ul>
      </nav>
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
        <Route path="/" element={<h2>Welcome to For the Record</h2>} />
      </Routes>
    </div>
  );
};

export default Handler;
