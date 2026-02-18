import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [message, setMessage] = useState("Loading...");

  useEffect(() => {
    fetch("http://127.0.0.1:5000/")
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage("Backend not running ❌"));
  }, []);

  return (
    <div className="app">
      <h1>Data Dash Inc 🍔</h1>
      <p>{message}</p>
    </div>
  );
}

export default App;
