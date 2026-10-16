import React, { useState, useEffect, useCallback } from "react";
import Navigation from './components/Navigation';
import Home from './components/Home';
import LoginView from "./components/Login";
import Termini from "./components/Terminet";
import About from './components/AboutUs';
import "bootstrap/dist/css/bootstrap.min.css";
import 'bootstrap/dist/js/bootstrap.bundle.min';

const VALID_VIEWS = ["home", "about", "login", "terminet"];

const getViewFromHash = () => {
  const h = window.location.hash.replace("#", "");
  return VALID_VIEWS.includes(h) ? h : "home";
};

function App() {
  const [view, setViewState] = useState(getViewFromHash);

const setView = useCallback((next) => {
  if (!VALID_VIEWS.includes(next)) return;
  if (getViewFromHash() !== next) {
    window.history.pushState({ view: next }, "", `#${next}`);
  }
  setViewState(next);
  window.scrollTo(0, 0);
}, []);
  // Back / Forward buttons
  useEffect(() => {
    const onPop = () => setViewState(getViewFromHash());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const handleNavClick = (e, newView) => {
    e.preventDefault();
    setView(newView);
  };

  return (
    <div className="app-shell">
      <Navigation onNavClick={handleNavClick} />
      <div className="app-main">
        {view === "home" && <Home setView={setView} />}
        {view === "about" && <About />}
        {view === "login" && <LoginView />}
        {view === "terminet" && <Termini setView={setView} />}
      </div>
    </div>
  );
}

export default App;