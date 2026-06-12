import React from "react";
import "../css/aboutus.css";

function About() {
  return (
    <div className="about-page-wrapper">
      <div className="about-container">

        {/* HERO SECTION */}
        <div className="about-hero">
          <h1>The Salon <span className="title-accent">Essence</span></h1>
          <p>Where beauty meets meticulous craft</p>
        </div>

        {/* EDITORIAL SPLIT SECTION */}
        <div className="about-split-layout">
          
          {/* LEFT: Our Narrative */}
          <div className="about-story-side">
            <span className="subtitle">The Sanctuary</span>
            <h2>Our Story</h2>
            <p>
              We are a modern beauty salon focused on delivering high-end beauty experiences. 
              From hair transformations to bespoke skincare treatments, we map our techniques 
              carefully to help you feel entirely at home in your own skin.
            </p>
            <p>
              Our dedicated team combines editorial creativity and technical expertise to treat 
              your beauty canvas with uncompromising personal care, using industry-leading methodologies.
            </p>
          </div>

          {/* RIGHT: Minimalist Stats Blocks */}
          <div className="about-stats-side">
            
            <div className="stat-item">
              <h4 style={{ color: "#be185d" }}>5+</h4>
              <p>Years Excellence</p>
            </div>

            <div className="stat-item">
              <h4>2K+</h4>
              <p>Happy Clients</p>
            </div>

            <div className="stat-item">
              <h4>15+</h4>
              <p>Premium Services</p>
            </div>

            <div className="stat-item">
              <h4 style={{ color: "#be185d" }}>100%</h4>
              <p>Satisfaction</p>
            </div>

          </div>

        </div>

        {/* CORE VALUED PRINCIPLES SECTION */}
        <div className="pillar-section-title">Our Foundational Standards</div>

        <div className="about-grid">

          <div className="about-box">
            <div className="value-icon-container">💄</div>
            <h3>Beauty Experts</h3>
            <p>Highly trained professionals with a deep structural understanding of modern style trends and individual design profiles.</p>
          </div>

          <div className="about-box">
            <div className="value-icon-container">✨</div>
            <h3>Premium Products</h3>
            <p>We work strictly with clinically safe, tier-one luxury products to treat and protect your hair and skin health carefully.</p>
          </div>

          <div className="about-box">
            <div className="value-icon-container">💅</div>
            <h3>Personal Care</h3>
            <p>No cookie-cutter routines. Every consultation begins with a personal assessment intake form to build a look customized to you.</p>
          </div>

        </div>

      </div>
    </div>
  );
}

export default About;