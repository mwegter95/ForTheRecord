import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [countdown, setCountdown] = useState(3);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/login", {
        username,
        password,
      });
      const { access_token, first_name, last_name } = response.data;
      onLogin(access_token, first_name, last_name);
      setMessage("Login successful! Redirecting...");
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev === 1) {
            clearInterval(countdownInterval);
            navigate("/");
          }
          return prev - 1;
        });
      }, 1000);
    } catch (error) {
      setMessage("Error logging in");
      console.error("Error logging in", error);
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          required
        />
        <button type="submit">Login</button>
      </form>
      {message && (
        <div>
          {message} {countdown > 0 && `(${countdown})`}
        </div>
      )}
    </div>
  );
};

export default Login;
