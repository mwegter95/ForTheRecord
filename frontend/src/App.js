import React from "react";
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

