import React, { useState } from "react";
import {
  MapPin,
  Phone,
  Mail,
  Clock,
  Send,
  Sparkles,
  Award,
  HeartHandshake,
  CheckCircle2
} from "lucide-react";
import "../css/aboutus.css";

function About() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    service: "general",
    message: ""
  });

  const [formStatus, setFormStatus] = useState({
    submitted: false,
    loading: false,
    error: ""
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.message) {
      setFormStatus({
        submitted: false,
        loading: false,
        error: "Ju lutem plotësoni të gjitha fushat e detyrueshme."
      });

      return;
    }

    setFormStatus({
      submitted: false,
      loading: true,
      error: ""
    });

    await new Promise((resolve) => setTimeout(resolve, 1000));

    setFormStatus({
      submitted: true,
      loading: false,
      error: ""
    });

    setFormData({
      name: "",
      email: "",
      phone: "",
      service: "general",
      message: ""
    });
  };

  return (
    <main className="about-page">

      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="about-hero">

        <div className="about-hero-content">

          <span className="hero-eyebrow">
            KUJDES • ELEGANCË • PËRVOJË
          </span>

          <h1>
            Bukuria fillon me
            <span> kujdesin ndaj vetes.</span>
          </h1>

          <p className="hero-subtitle">
            Një hapësirë moderne bukurie ku profesionalizmi,
            kujdesi personal dhe eleganca bashkohen në një
            eksperiencë të krijuar për ju.
          </p>

          <div className="hero-line"></div>

        </div>

      </section>


      {/* =====================================================
          RRETH NESH
      ===================================================== */}

      <section className="about-story-section">

        <div className="about-story-intro">

          <span className="section-tag">
            RRETH NESH
          </span>

          <h2>
            Bukuria që fillon
            <span> me kujdesin.</span>
          </h2>

        </div>


        <div className="about-story-content">

          <p>
            Ne krijojmë një hapësirë ku kujdesi për veten,
            profesionalizmi dhe qetësia bashkohen natyrshëm.
            Për ne, një vizitë në sallon nuk është thjesht një
            shërbim, por një moment që i kushtohet vetes.
          </p>

          <p>
            Nga kujdesi për flokët dhe thonjtë, deri te trajtimet
            për lëkurën, çdo shërbim realizohet me vëmendje ndaj
            detajeve dhe përshtatet sipas dëshirave dhe nevojave
            të secilit klient.
          </p>

        </div>

      </section>


      {/* =====================================================
          STATISTIKAT
      ===================================================== */}

      <section className="about-stats-section">

        <div className="about-stat">
          <span className="stat-number">5+</span>
          <span className="stat-label">VITE PËRVOJË</span>
        </div>

        <div className="about-stat">
          <span className="stat-number">2K+</span>
          <span className="stat-label">KLIENTË TË KËNAQUR</span>
        </div>

        <div className="about-stat">
          <span className="stat-number">15+</span>
          <span className="stat-label">SHËRBIME</span>
        </div>

        <div className="about-stat">
          <span className="stat-number">100%</span>
          <span className="stat-label">PËRKUSHTIM</span>
        </div>

      </section>


      {/* =====================================================
          VLERAT TONA
      ===================================================== */}

      <section className="principles-section">

        <div className="section-header">

          <span className="section-tag">
            VLERAT TONA
          </span>

          <h2>
            Standardi që
            <span> na udhëheq.</span>
          </h2>

          <p>
            Çdo detaj është pjesë e përvojës që duam
            të krijojmë për ju.
          </p>

        </div>


        <div className="about-grid">

          <div className="about-box">

            <div className="about-box-icon">
              <Award size={25} strokeWidth={1.5} />
            </div>

            <span className="about-box-number">
              01
            </span>

            <h3>
              Profesionalizëm
            </h3>

            <p>
              Punojmë me përkushtim, përvojë dhe standarde
              të larta për t'ju ofruar një shërbim profesional
              në çdo vizitë.
            </p>

          </div>


          <div className="about-box">

            <div className="about-box-icon">
              <Sparkles size={25} strokeWidth={1.5} />
            </div>

            <span className="about-box-number">
              02
            </span>

            <h3>
              Cilësi
            </h3>

            <p>
              Zgjedhim me kujdes produktet dhe mënyrën e punës,
              duke i kushtuar rëndësi çdo detaji të shërbimit.
            </p>

          </div>


          <div className="about-box">

            <div className="about-box-icon">
              <HeartHandshake size={25} strokeWidth={1.5} />
            </div>

            <span className="about-box-number">
              03
            </span>

            <h3>
              Kujdes personal
            </h3>

            <p>
              Besojmë se çdo klient është unik. Prandaj,
              shërbimet tona përshtaten me nevojat dhe
              dëshirat tuaja.
            </p>

          </div>

        </div>

      </section>


      {/* =====================================================
          KONTAKT
      ===================================================== */}

      <section className="contact-section">

        <div className="contact-grid">


          {/* INFORMACIONI */}

          <div className="contact-info-col">

            <span className="section-tag">
              NA KONTAKTONI
            </span>

            <h2>
              Jemi këtu
              <span> për ju.</span>
            </h2>

            <p className="contact-intro">
              Keni një pyetje, dëshironi të rezervoni një
              termin apo thjesht dëshironi të dini më shumë?
              Na kontaktoni dhe do të jemi të lumtur t'ju ndihmojmë.
            </p>


            <div className="contact-info-list">

              <div className="contact-info-card">

                <div className="contact-icon">
                  <MapPin size={19} strokeWidth={1.5} />
                </div>

                <div>
                  <span>ADRESA</span>
                  <p>
                    Bulevardi i Bukurisë 123
                    <br />
                    Prishtinë, Kosovë
                  </p>
                </div>

              </div>


              <div className="contact-info-card">

                <div className="contact-icon">
                  <Phone size={19} strokeWidth={1.5} />
                </div>

                <div>
                  <span>TELEFONI</span>
                  <p>
                    +383 44 000 000
                    <br />
                    Hënë – Shtunë, 09:00 – 19:00
                  </p>
                </div>

              </div>


              <div className="contact-info-card">

                <div className="contact-icon">
                  <Mail size={19} strokeWidth={1.5} />
                </div>

                <div>
                  <span>EMAIL</span>
                  <p>
                    info@beautysalon.com
                    <br />
                    rezervime@beautysalon.com
                  </p>
                </div>

              </div>


              <div className="contact-info-card">

                <div className="contact-icon">
                  <Clock size={19} strokeWidth={1.5} />
                </div>

                <div>
                  <span>ORARI I PUNËS</span>
                  <p>
                    E Hënë – E Shtunë: 09:00 – 19:00
                    <br />
                    E Diel: Mbyllur
                  </p>
                </div>

              </div>

            </div>

          </div>


          {/* FORMULARI */}

          <div className="contact-form-col">

            {formStatus.submitted ? (

              <div className="form-success">

                <div className="success-icon">
                  <CheckCircle2 size={32} strokeWidth={1.5} />
                </div>

                <span className="success-label">
                  MESAZHI U DËRGUA
                </span>

                <h3>
                  Faleminderit!
                </h3>

                <p>
                  Mesazhi juaj u dërgua me sukses.
                  Do t'ju kontaktojmë sa më shpejt.
                </p>

                <button
                  type="button"
                  className="success-reset"
                  onClick={() =>
                    setFormStatus({
                      submitted: false,
                      loading: false,
                      error: ""
                    })
                  }
                >
                  Dërgo një mesazh tjetër
                </button>

              </div>

            ) : (

              <form
                className="contact-form"
                onSubmit={handleSubmit}
              >

                <div className="form-heading">

                  <span>
                    NA SHKRUANI
                  </span>

                  <h3>
                    Si mund t'ju
                    <em> ndihmojmë?</em>
                  </h3>

                </div>


                {formStatus.error && (
                  <div className="form-error">
                    {formStatus.error}
                  </div>
                )}


                <div className="form-row">

                  <div className="form-group">

                    <label htmlFor="name">
                      Emri dhe mbiemri *
                    </label>

                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="Shkruani emrin tuaj"
                    />

                  </div>


                  <div className="form-group">

                    <label htmlFor="email">
                      Email *
                    </label>

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="emri@email.com"
                    />

                  </div>

                </div>


                <div className="form-row">

                  <div className="form-group">

                    <label htmlFor="phone">
                      Numri i telefonit
                    </label>

                    <input
                      id="phone"
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      placeholder="+383 44 000 000"
                    />

                  </div>


                  <div className="form-group">

                    <label htmlFor="service">
                      Për çfarë na kontaktoni?
                    </label>

                    <select
                      id="service"
                      name="service"
                      value={formData.service}
                      onChange={handleInputChange}
                    >
                      <option value="general">
                        Pyetje e përgjithshme
                      </option>

                      <option value="appointment">
                        Rezervim termini
                      </option>

                      <option value="hair">
                        Flokët
                      </option>

                      <option value="skin">
                        Kujdesi për lëkurën
                      </option>

                      <option value="nails">
                        Thonjtë
                      </option>

                    </select>

                  </div>

                </div>


                <div className="form-group">

                  <label htmlFor="message">
                    Mesazhi *
                  </label>

                  <textarea
                    id="message"
                    name="message"
                    rows="5"
                    value={formData.message}
                    onChange={handleInputChange}
                    placeholder="Shkruani mesazhin tuaj..."
                  />

                </div>


                <button
                  type="submit"
                  className="contact-submit"
                  disabled={formStatus.loading}
                >

                  {formStatus.loading ? (
                    <>
                      Duke dërguar...
                    </>
                  ) : (
                    <>
                      Dërgo mesazhin
                      <Send size={17} strokeWidth={1.6} />
                    </>
                  )}

                </button>

              </form>

            )}

          </div>

        </div>

      </section>

    </main>
  );
}

export default About;