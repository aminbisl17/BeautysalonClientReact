import React from "react";
import "../css/Navbar.css";

function Navigation({ onNavClick }) {
  return (
    <nav className="navbar navbar-expand-lg sticky-top custom-navbar">
      <div className="container-fluid px-0">
        
        {/* LOGO */}
        <a className="navbar-brand fw-extrabold" href="/">
          Beauty<span style={{ color: "#db2777" }}>Salon</span> ✨
        </a>

        {/* MOBILE TOGGLER BUTTON */}
        <button
          className="navbar-toggler custom-toggler collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navMenu"
          aria-controls="navMenu"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          {/* Three explicit lines engineered for clean architectural rendering */}
          <span></span>
          <span></span>
          <span></span>
        </button>

        {/* NAVIGATION LINKS CONTAINER */}
        <div className="collapse navbar-collapse" id="navMenu">
          <ul className="navbar-nav ms-auto align-items-lg-center">
            
            <li className="nav-item">
              <a
                className="nav-link"
                href="/"
                onClick={(e) => onNavClick(e, "home")}
              >
                Home
              </a>
            </li>

            <li className="nav-item">
              <a
                className="nav-link"
                href="/about"
                onClick={(e) => onNavClick(e, "about")}
              >
                About Us
              </a>
            </li>

            <li className="nav-item">
              <a
                className="nav-link profile-nav-link text-center"
                href="/login"
                onClick={(e) => onNavClick(e, "login")}
              >
                Profile
              </a>
            </li>

          </ul>
        </div>

      </div>
    </nav>
  );
}

export default Navigation;