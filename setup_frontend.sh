#!/bin/bash

# Function to create a file with content and check its existence
create_file() {
    local filepath="$1"
    local content="$2"
    echo "$content" > "$filepath"
    if [ -f "$filepath" ]; then
        echo "File $filepath created successfully."
    else
        echo "Error: File $filepath could not be created." >&2
        exit 1
    fi
}

# Step 1: Create React App
npx create-react-app frontend

# Step 2: Navigate to frontend directory
cd frontend

# Step 3: Install dependencies
npm install react-router-dom axios ajv@^6.12.6 ajv-keywords@^3.5.2

# Step 4: Create necessary directories and files

# Create components directory
mkdir -p src/components

# Create ErrorBoundary.js
create_file "src/components/ErrorBoundary.js" 'import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.log("Logging error:", error, errorInfo);
    // You can also log the error to an error reporting service
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;
'

# Create Handler.js
create_file "src/components/Handler.js" 'import React from "react";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import axios from "axios";

class Handler extends React.Component {
  logAction(action, reaction) {
    axios.post("http://localhost:8000/log", { action, reaction })
      .then(response => console.log(response.data))
      .catch(error => console.error("There was an error logging the action!", error));
  }

  handleClick = (e) => {
    const action = e.target.getAttribute("data-action");
    const reaction = "User clicked on " + action;
    this.logAction(action, reaction);
  }

  render() {
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
            </ul>
          </nav>
          <Switch>
            <Route path="/about">
              <h2>About Us</h2>
            </Route>
            <Route path="/contact">
              <h2>Contact Us</h2>
            </Route>
            <Route path="/">
              <h2>Welcome to For the Record</h2>
            </Route>
          </Switch>
        </div>
      </Router>
    );
  }
}

export default Handler;
'

# Create App.js
create_file "src/App.js" 'import React from "react";
import Handler from "./components/Handler";
import ErrorBoundary from "./components/ErrorBoundary";

function App() {
  return (
    <ErrorBoundary>
      <Handler />
    </ErrorBoundary>
  );
}

export default App;
'

# Create index.js
create_file "src/index.js" 'import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);
'

# Create index.css
create_file "src/index.css" '/* Add any global styles for your application here */
body {
  font-family: Arial, sans-serif;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
'

# Create public/index.html
create_file "public/index.html" '<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>For the Record</title>
</head>
<body>
  <noscript>You need to enable JavaScript to run this app.</noscript>
  <div id="root"></div>
</body>
</html>
'

