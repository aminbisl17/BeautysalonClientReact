
import React, { useState } from "react";
import Navigation from './components/Navigation';
import Home from './components/Home';
import Login from './components/Login';
import About from './components/AboutUs';

function App() {
  const [view, setView] = useState("home");

  const handleNavClick = (e, newView) => {
    e.preventDefault(); // prevent full page reload
    setView(newView);
  };

  return (
    <div>
      <Navigation onNavClick={handleNavClick} />

      <div style={{ marginTop: "80px", padding: "20px" }}>
        {view === "home" && <Home />}
        {view === "about" && <About />}
        {view === "login" && <Login />}
      </div>
    </div>
  );
}

export default App;
