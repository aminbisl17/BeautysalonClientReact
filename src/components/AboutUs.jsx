import React from "react";
import "../css/aboutus.css";

function About() {
  return (
    <div className="about-container">
      
      <div className="about-hero">
        <h1>About Us</h1>
        <p>Where beauty meets confidence ✨</p>
      </div>

      <div className="about-card">
        <h2>Who We Are</h2>
        <p>
          We are a modern beauty salon dedicated to providing premium services
          in hair, nails, skincare, and makeup. Our mission is to make every
          client feel confident, beautiful, and valued.
        </p>
      </div>

      <div className="about-grid">
        <div className="about-box">
          <h3>💄 Beauty Experts</h3>
          <p>Professional stylists with years of experience.</p>
        </div>

        <div className="about-box">
          <h3>✨ Premium Quality</h3>
          <p>We use only high-quality products and modern techniques.</p>
        </div>

        <div className="about-box">
          <h3>💅 Personalized Care</h3>
          <p>Every treatment is tailored to your needs.</p>
        </div>
      </div>

    </div>
  );
}

export default About;