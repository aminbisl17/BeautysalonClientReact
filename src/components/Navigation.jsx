import React, { useState } from "react";
import "../css/Navbar.css";

function Navigation({ onNavClick, currentPath = "home" }) {
  const [isNavExpanded, setIsNavExpanded] = useState(false);
  // Track active tab locally if parent router state isn't active
  const [activeTab, setActiveTab] = useState(currentPath);

  const handleToggle = () => {
    setIsNavExpanded(!isNavExpanded);
  };

  const handleLinkClick = (e, target) => {
    e.preventDefault(); // Prevents default jump if using client routing
    setActiveTab(target); // Highlights selected button instantly
    setIsNavExpanded(false); // Closes mobile menu
    if (onNavClick) {
      onNavClick(e, target);
    }
  };

  // Helper to check active link
  const isActive = (tabName) => activeTab === tabName;

  return (
    <nav className="navbar navbar-expand-lg fixed-top bsn-navbar">
      <div className="container px-3 px-md-4">
        
        {/* BRAND LOGO */}
        <a 
          className="navbar-brand bsn-brand me-auto" 
          href="/" 
          onClick={(e) => handleLinkClick(e, "home")}
        >
          BEAUTY <span className="bsn-brand-serif">Salon</span>
        </a>

        {/* CUSTOM TOGGLER BUTTON */}
        <button
          className={`navbar-toggler bsn-toggler ${!isNavExpanded ? "collapsed" : ""}`}
          type="button"
          onClick={handleToggle}
          aria-controls="bsnNavMenu"
          aria-expanded={isNavExpanded}
          aria-label="Toggle navigation"
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* COLLAPSIBLE NAVIGATION CONTENT */}
        <div 
          className={`collapse navbar-collapse bsn-collapse ${isNavExpanded ? "show" : ""}`} 
          id="bsnNavMenu"
        >
          <ul className="navbar-nav ms-auto align-items-lg-center bsn-nav-list">
            
            <li className="nav-item">
              <a
                className={`nav-link bsn-nav-link ${isActive("home") ? "active" : ""}`}
                href="/"
                onClick={(e) => handleLinkClick(e, "home")}
              >
                Ballina
              </a>
            </li>

            <li className="nav-item">
              <a
                className={`nav-link bsn-nav-link ${isActive("about") ? "active" : ""}`}
                href="/about"
                onClick={(e) => handleLinkClick(e, "about")}
              >
                Rreth nesh
              </a>
            </li>

            <li className="nav-item mt-2 mt-lg-0">
              <a
                className={`nav-link bsn-profile-link ${isActive("login") ? "active" : ""}`}
                href="/login"
                onClick={(e) => handleLinkClick(e, "login")}
              >
                <span className="bsn-profile-dot"></span>
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