import React, { useState } from "react";
import Navigation from './components/Navigation';
import Home from './components/Home';
import LoginView from "./components/Login";
import Termini from "./components/Terminet";
import About from './components/AboutUs';
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min';
function App() {
  const [view, setView] = useState("home");

  const handleNavClick = (e, newView) => {
    e.preventDefault();
    setView(newView);
  };

  return (
    <div>
      <Navigation onNavClick={handleNavClick} />
      <div>
        {view === "home" && <Home setView={setView} />}
        {view === "about" && <About />}
        {view === "login" && <LoginView />}
        {view === "terminet" && <Termini />}
      </div>
    </div>
  );
}

export default App;
