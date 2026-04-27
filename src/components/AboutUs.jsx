import React from "react";

function About() {
  return (
    <div>

      {/* HERO SECTION */}
      <div
        className="text-white d-flex align-items-center justify-content-center text-center"
        style={{
          height: "50vh",
          background:
            "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1522337660859-02fbefca4702')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div>
          <h1 className="display-4 fw-bold">About Us</h1>
          <p className="lead">Where beauty meets confidence ✨</p>
        </div>
      </div>

      {/* STORY SECTION */}
      <div className="container py-5">

        <div className="row align-items-center g-5">

          <div className="col-md-6">
            <h2 className="fw-bold mb-3">Our Story</h2>

            <p className="text-muted">
              We are a modern beauty salon focused on delivering high-end
              beauty experiences. From hair transformations to skincare
              treatments, we help you feel confident in your own skin.
            </p>

            <p className="text-muted">
              Our team combines creativity, experience, and passion to deliver
              personalized beauty care for every client.
            </p>
          </div>

          <div className="col-md-6">
            <div className="row g-3">

              <div className="col-6">
                <div className="p-4 bg-light text-center rounded shadow-sm">
                  <h3 className="fw-bold">5+</h3>
                  <small className="text-muted">Years Experience</small>
                </div>
              </div>

              <div className="col-6">
                <div className="p-4 bg-light text-center rounded shadow-sm">
                  <h3 className="fw-bold">2K+</h3>
                  <small className="text-muted">Happy Clients</small>
                </div>
              </div>

              <div className="col-6">
                <div className="p-4 bg-light text-center rounded shadow-sm">
                  <h3 className="fw-bold">15+</h3>
                  <small className="text-muted">Services</small>
                </div>
              </div>

              <div className="col-6">
                <div className="p-4 bg-light text-center rounded shadow-sm">
                  <h3 className="fw-bold">100%</h3>
                  <small className="text-muted">Satisfaction</small>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* FEATURES */}
        <div className="row mt-5 g-4">

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100 text-center p-4">

              <div className="fs-1">💄</div>
              <h5 className="mt-2 fw-bold">Beauty Experts</h5>
              <p className="text-muted">
                Skilled professionals with years of experience in beauty care.
              </p>

            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100 text-center p-4">

              <div className="fs-1">✨</div>
              <h5 className="mt-2 fw-bold">Premium Products</h5>
              <p className="text-muted">
                We use only high-quality and safe beauty products.
              </p>

            </div>
          </div>

          <div className="col-md-4">
            <div className="card border-0 shadow-sm h-100 text-center p-4">

              <div className="fs-1">💅</div>
              <h5 className="mt-2 fw-bold">Personal Care</h5>
              <p className="text-muted">
                Every client receives a tailored beauty experience.
              </p>

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default About;