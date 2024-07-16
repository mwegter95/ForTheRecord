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

# Create the directory structure
mkdir -p backend/app/routes backend/app/models frontend/src/components

# Create requirements.txt
create_file "backend/requirements.txt" 'fastapi
uvicorn
pymongo'

# Create main.py
create_file "backend/app/main.py" 'from fastapi import FastAPI
from .routes.handler import router as handler_router

app = FastAPI()

app.include_router(handler_router)

@app.get("/")
def read_root():
    return {"message": "Welcome to For the Record DJing Service"}
'

# Create db.py
create_file "backend/app/db.py" 'from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["forthe_record"]
logs_collection = db["logs"]
'

# Create handler.py
create_file "backend/app/routes/handler.py" 'from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from ..db import logs_collection

router = APIRouter()

class LogEntry(BaseModel):
    action: str
    reaction: str

@router.post("/log")
async def log_entry(log: LogEntry):
    log_entry = log.dict()
    logs_collection.insert_one(log_entry)
    return {"message": "Log entry added"}
'

# Create log.py
create_file "backend/app/models/log.py" 'from pydantic import BaseModel

class LogEntry(BaseModel):
    action: str
    reaction: str
'

# Create package.json
create_file "frontend/package.json" '{
  "name": "forthe-record",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^17.0.2",
    "react-dom": "^17.0.2",
    "react-router-dom": "^5.2.0",
    "axios": "^0.21.1"
  },
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
'

# Create ErrorBoundary.js
create_file "frontend/src/components/ErrorBoundary.js" 'import React, { Component } from 'react';

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
create_file "frontend/src/components/Handler.js" 'import React from 'react';
import { BrowserRouter as Router, Route, Switch, Link } from 'react-router-dom';
import axios from 'axios';

class Handler extends React.Component {
  logAction(action, reaction) {
    axios.post('http://localhost:8000/log', { action, reaction })
      .then(response => console.log(response.data))
      .catch(error => console.error("There was an error logging the action!", error));
  }

  handleClick = (e) => {
    const action = e.target.getAttribute('data-action');
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
create_file "frontend/src/components/App.js" 'import React from 'react';
import Handler from './Handler';
import ErrorBoundary from './ErrorBoundary';

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
create_file "frontend/src/index.js" 'import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './components/App';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);
'

