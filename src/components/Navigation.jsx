import React from "react";

import "../css/Navbar.css";

function Navigation({ onNavClick }) {
  return (
    <nav className="navbar">
      <div className="logo">BeautySalon</div>
      <ul className="nav-links">
        <li><a href="/" onClick={(e) => onNavClick(e, "home")}>Home</a></li>
        <li><a href="/about" onClick={(e) => onNavClick(e, "about")}>About Us</a></li>
         <li><a href="/login" onClick={(e) => onNavClick(e, "login")}>Profile</a></li>
      </ul>
    </nav>
  );
}

export default Navigation;