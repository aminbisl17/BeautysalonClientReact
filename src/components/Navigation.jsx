import React, { useState } from "react";
import "../css/Navbar.css";

function Navigation({ onNavClick }) {
  const [isNavExpanded, setIsNavExpanded] = useState(false);

  const handleToggle = () => {
    setIsNavExpanded(!isNavExpanded);
  };

  const handleLinkClick = (e, target) => {
    setIsNavExpanded(false); 
    if (onNavClick) {
      onNavClick(e, target);
    }
  };

  return (
    <nav className="navbar navbar-expand-lg sticky-top custom-navbar">
      <div className="container px-4">
        
        {/* LOGO - Elegant Editorial Typography */}
        <a className="navbar-brand" href="/">
          BEAUTY <span className="logo-serif">Salon</span>
        </a>

        {/* MINIMALIST LINE TOGGLER */}
        <button
          className={`navbar-toggler custom-toggler ${!isNavExpanded ? "collapsed" : ""}`}
          type="button"
          onClick={handleToggle}
          aria-controls="navMenu"
          aria-expanded={isNavExpanded}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
        </button>

        {/* NAVIGATION LINKS CONTAINER */}
        <div 
          className={`collapse navbar-collapse ${isNavExpanded ? "show" : ""}`} 
          id="navMenu"
        >
          <ul className="navbar-nav ms-auto align-items-lg-center">
            
            <li className="nav-item">
              <a
                className="nav-link"
                href="/"
                onClick={(e) => handleLinkClick(e, "home")}
              >
                Ballina
              </a>
            </li>

            <li className="nav-item">
              <a
                className="nav-link"
                href="/about"
                onClick={(e) => handleLinkClick(e, "about")}
              >
                Rreth nesh
              </a>
            </li>

            <li className="nav-item">
              <a
                className="nav-link profile-nav-link text-center"
                href="/login"
                onClick={(e) => handleLinkClick(e, "login")}
              >
                PROFILI
              </a>
            </li>

          </ul>
        </div>

      </div>
    </nav>
  );
}

export default Navigation;