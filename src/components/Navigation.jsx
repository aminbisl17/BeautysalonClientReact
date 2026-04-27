import React from "react";
import "../css/Navbar.css"
function Navigation({ onNavClick }) {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark shadow-sm px-3 custom-navbar">

      {/* LOGO */}
      <a className="navbar-brand fw-bold text-white" href="/">
        BeautySalon 
      </a>

      {/* MOBILE TOGGLE */}
      <button
        className="navbar-toggler"
        type="button"
        data-bs-toggle="collapse"
        data-bs-target="#navMenu"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      {/* LINKS */}
      <div className="collapse navbar-collapse" id="navMenu">

        <ul className="navbar-nav ms-auto gap-2">

          <li className="nav-item">
            <a className="nav-link text-white" href="/" onClick={(e) => onNavClick(e, "home")}>
              Home
            </a>
          </li>

          <li className="nav-item">
            <a className="nav-link text-white" href="/about" onClick={(e) => onNavClick(e, "about")}>
              About Us
            </a>
          </li>

          <li className="nav-item">
            <a className="nav-link text-white" href="/login" onClick={(e) => onNavClick(e, "login")}>
              Profile
            </a>
          </li>

        </ul>

      </div>

    </nav>
  );
}

export default Navigation;