import React from "react";
import "../css/Navbar.css";

function Navigation({ onNavClick }) {
  return (
  //  <nav className="navbar navbar-expand-lg navbar-dark custom-navbar shadow-sm px-3">
<nav className="navbar navbar-expand-lg navbar-dark shadow-sm px-3 custom-navbar sticky-top">
      {/* LOGO */}
      <a className="navbar-brand fw-bold" href="/">
        BeautySalon
      </a>

      {/* MOBILE BUTTON */}
<button
  className="navbar-toggler custom-toggler"
  type="button"
  data-bs-toggle="collapse"
  data-bs-target="#navMenu"
  aria-controls="navMenu"
  aria-expanded="false"
  aria-label="Toggle navigation"
>
  <span className="navbar-toggler-icon"></span>
</button>

      {/* MENU */}
      <div className="collapse navbar-collapse" id="navMenu">

        <ul className="navbar-nav ms-auto text-center">

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
              className="nav-link"
              href="/login"
              onClick={(e) => onNavClick(e, "login")}
            >
              Profile
            </a>
          </li>

        </ul>

      </div>

    </nav>
  );
}

export default Navigation;