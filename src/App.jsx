import React, { useState } from "react";
import Navigation from './components/Navigation';
import Home from './components/Home';
import LoginView from "./components/Login";
import About from './components/AboutUs';
import Profile from "./components/Profile";

function App() {
  const [view, setView] = useState("home");

  const handleNavClick = (e, newView) => {
    e.preventDefault();
    setView(newView);
  };

  return (
    <div>
      <Navigation onNavClick={handleNavClick} />

      <div style={{ marginTop: "80px", padding: "20px" }}>
        {view === "home" && <Home />}
        {view === "about" && <About />}
        {view === "login" && <LoginView />}
        {view === "profile" && <Profile />}
      </div>
    </div>
  );
}

export default App;
