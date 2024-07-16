#!/bin/bash

# Function to create a file with content and check its existence
create_file() {
    local filepath="$1"
    local content="$2"
    echo "$content" > "$filepath"
    if [ -f "$filepath" ]; then
        echo "File $filepath already exists. Updating content."
    else
        echo "$content" > "$filepath"
        if [ -f "$filepath" ]; then
            echo "File $filepath created successfully."
        else
            echo "Error: File $filepath could not be created." >&2
            exit 1
        fi
    fi
}

# Function to update a file and check its existence
update_file() {
    local filepath="$1"
    local content="$2"
    if [ -f "$filepath" ]; then
        echo "$content" > "$filepath"
        echo "File $filepath updated successfully."
    else
        echo "Error: File $filepath does not exist." >&2
        exit 1
    fi
}

# Step 1: Update FastAPI backend to include CORS configuration and RBAC
update_file "backend/app/main.py" 'from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routes.handler import router as handler_router
from .routes.auth import router as auth_router

app = FastAPI()

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Allow specific origins
    allow_credentials=True,
    allow_methods=["*"],  # Allow all methods
    allow_headers=["*"],  # Allow all headers
)

app.include_router(handler_router)
app.include_router(auth_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to For the Record DJing Service"}
'

# Create auth.py for FastAPI backend
create_file "backend/app/auth.py" 'from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from pydantic import BaseModel
from datetime import datetime, timedelta
from typing import Optional
from enum import Enum

# to get a string like this run: openssl rand -hex 32
SECRET_KEY = "your_secret_key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class Role(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    USER = "user"
    GUEST = "guest"

class User(BaseModel):
    username: str
    email: str
    hashed_password: str
    role: Role

class TokenData(BaseModel):
    username: Optional[str] = None

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = get_user(token_data.username)
    if user is None:
        raise credentials_exception
    return user

def get_user(username: str):
    # This should be replaced with your actual user lookup, e.g., database query
    user_dict = {"username": username, "role": Role.ADMIN}
    return User(**user_dict)
'

# Step 2: Update React index.js to use createRoot
update_file "frontend/src/index.js" 'import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
'

# Step 3: Update React Handler.js to use Routes and Route instead of Switch
update_file "frontend/src/components/Handler.js" 'import React from "react";
import { BrowserRouter as Router, Route, Routes, Link } from "react-router-dom";
import axios from "axios";
import SignUp from "./SignUp";
import Login from "./Login";

const ROLE_ADMIN = "admin";

class Handler extends React.Component {
  state = {
    user: null,
    logs: [],
  };

  componentDidMount() {
    // Simulate fetching user info, e.g., from an API or local storage
    const user = { username: "admin", role: ROLE_ADMIN };
    this.setState({ user });
  }

  logAction(action, reaction) {
    axios.post("http://localhost:8000/log", { action, reaction }, { headers: this.getAuthHeader() })
      .then(response => console.log(response.data))
      .catch(error => console.error("There was an error logging the action!", error));
  }

  getLogs() {
    axios.get("http://localhost:8000/logs", { headers: this.getAuthHeader() })
      .then(response => this.setState({ logs: response.data }))
      .catch(error => console.error("There was an error fetching the logs!", error));
  }

  handleClick = (e) => {
    const action = e.target.getAttribute("data-action");
    const reaction = "User clicked on " + action;
    this.logAction(action, reaction);
  }

  getAuthHeader() {
    // Implement your token retrieval logic here, e.g., from local storage
    const token = "your_jwt_token"; // This should be replaced with the actual token
    return { Authorization: `Bearer ${token}` };
  }

  render() {
    const { user, logs } = this.state;

    if (!user) return <div>Loading...</div>;

    return (
      <Router>
        <div>
          <nav>
            <ul>
              <li>
                <Link to="/" data-action="home" onClick={this.handleClick}>Home</Link>
              </li>
              <li>
                <Link to="/about" data-action="about" onClick={this.handleClick}>About</Link>
              </li>
              <li>
                <Link to="/contact" data-action="contact" onClick={this.handleClick}>Contact</Link>
              </li>
              {user.role === ROLE_ADMIN && (
                <li>
                  <Link to="/logs" onClick={() => this.getLogs()}>Logs</Link>
                </li>
              )}
              <li>
                <Link to="/signup">Sign Up</Link>
              </li>
              <li>
                <Link to="/login">Login</Link>
              </li>
            </ul>
          </nav>
          <Routes>
            <Route path="/about" element={<h2>About Us</h2>} />
            <Route path="/contact" element={<h2>Contact Us</h2>} />
            <Route path="/logs" element={user.role === ROLE_ADMIN ? (
              <div>
                <h2>Logs</h2>
                <pre>{JSON.stringify(logs, null, 2)}</pre>
              </div>
            ) : (
              <Navigate to="/" />
            )} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<h2>Welcome to For the Record</h2>} />
          </Routes>
        </div>
      </Router>
    );
  }
}

export default Handler;
'

# Create SignUp.js for React
create_file "frontend/src/components/SignUp.js" 'import React, { useState } from "react";
import axios from "axios";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/signup", {
        username,
        email,
        password,
        role
      });
      console.log(response.data);
    } catch (error) {
      console.error("Error signing up", error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Email"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Password"
        required
      />
      <select value={role} onChange={(e) => setRole(e.target.value)}>
        <option value="guest">Guest</option>
        <option value="user">User</option>
        <option value="admin">Admin</option>
        <option value="owner">Owner</option>
      </select>
      <button type="submit">Sign Up</button>
    </form>
  );
};

export default SignUp;
'

# Create Login.js for React
create_file "frontend/src/components/Login.js" 'import React, { useState } from "react";
import axios from "axios";

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:8000/login", {
        username,
        password
      });
      console.log(response.data);
      // Store token and redirect or handle login
    } catch (error) {
      console.error("Error logging in", error);
    }
  };

  return (
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
  );
};

export default Login;
'

