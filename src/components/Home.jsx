import React, { useEffect, useState, useRef } from "react";
import { fetchServices, fetchServiceAtributes } from "../javascript/APIs/ServicesAPI";
import { ExceptionHandler } from "../javascript/Exceptions/ExceptionHandler";
import "../css/home.css";
import { fetchRefreshToken } from "../javascript/APIs/Login";

function Home({ setView }) {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedAttribute, setSelectedAttribute] = useState(null);
  const [selectedService, setSelectedService] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [attributeSearch, setAttributeSearch] = useState("");
  
  const sliderRef = useRef(null);
  const discountedServices = services.filter((ser) => ser.zbritja > 0);

  async function loadServices() {
    try {
      setLoading(true);
      const data = await fetchServices();
      setServices(data);
      setFiltered(data);
    } catch (err) {
      ExceptionHandler(err);
    } finally {
      setLoading(false);
    }
  }

  async function loadUserData() {
    try {
      const res = await fetchRefreshToken();
      if (!res || !res.ok) return;

      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) return;

      const userRes = await fetch("http://192.168.100.116:8000/api/clients/data", {
        headers: { Authorization: `Bearer ${accessToken}` },
        credentials: "include",
      });

      if (!userRes.ok) return;

      const userInfo = await userRes.json();
      sessionStorage.setItem("userDetails", JSON.stringify(userInfo));
    } catch (err) {
      ExceptionHandler.handle(err);
    }
  }

  useEffect(() => {
    loadUserData();
    loadServices();
  }, []);

  useEffect(() => {
    if (discountedServices.length === 0 || selectedService) return;

    const interval = setInterval(() => {
      const slider = sliderRef.current;
      if (!slider) return;

      const cardWidth = slider.querySelector(".bsn-slider-item")?.offsetWidth || 300;
      const gap = 16; 
      const step = cardWidth + gap;

      if (slider.scrollLeft + slider.offsetWidth >= slider.scrollWidth - 10) {
        slider.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        slider.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [discountedServices, selectedService]);

  const filterServices = (type) => {
    setActiveFilter(type);
    if (type === "all") {
      setFiltered(services);
    } else {
      setFiltered(
        services.filter((s) =>
          (s.emri_sherbimit || "").toLowerCase().includes(type.toLowerCase())
        )
      );
    }
  };

  const handleServiceClick = async (service) => {
    setSelectedService(service);
    setLoadingAttributes(true);
    setAttributes([]);
    try {
      const data = await fetchServiceAtributes(service.ID);
      setAttributes(data.atributet || []);
      if (data.imageURL) {
        setSelectedService(prev => ({ ...prev, fetchedModalImage: data.imageURL }));
      }
    } catch (err) {
      setAttributes([]);
    } finally {
      setLoadingAttributes(false);
    }
  };

  const closeDialog = () => {
    setSelectedService(null);
    setAttributes([]);
    setAttributeSearch("");
  };

  const sortedAttributes = [...attributes].sort((a, b) => {
    return Number(b.zbritja || 0) - Number(a.zbritja || 0);
  });

  const formatDuration = (mins) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}h`;
  };

  return (
    <div className="bsn-home-wrapper">
      {/* HERO BANNER */}
      <section className="bsn-hero-banner">
        <div className="bsn-hero-overlay"></div>
        <div className="bsn-hero-content">
          <span className="bsn-hero-badge">EXPERIENCE PRESTIGE</span>
          <h1>Luxury Salon<span className="bsn-accent-sparkle">✨</span></h1>
          <p className="bsn-hero-tags">Hair • Nails • Skincare • Makeup</p>
          <button className="bsn-hero-btn" onClick={() => setView("terminet")}>
            Vendos termin
          </button>
        </div>
      </section>

      <div className="bsn-home-container">
        {/* SPECIAL OFFERS */}
        {discountedServices.length > 0 && (
          <section className="bsn-offers-section">
            <div className="bsn-section-header">
              <div>
                <h2>Ofertat speciale 🔥</h2>
                <p className="bsn-section-subtitle">Oferta me kohë të limituar vetëm për ju</p>
              </div>
            </div>

            <div className="bsn-discount-slider bsn-hide-scrollbar" ref={sliderRef}>
              {discountedServices.map((ser) => {
                const base = Number(ser.qmimi_baze || 0);
                const discount = Number(ser.zbritja || 0);
                const livePrice = base * (1 - discount / 100);

                return (
                  <article 
                    className="bsn-slider-item" 
                    key={`slider-${ser.ID}`}
                    onClick={() => handleServiceClick(ser)}
                  >
                    <div className="bsn-service-card bsn-promo-card">
                      <div className="bsn-card-img-wrapper">
                        {ser.imageURL ? (
                          <img src={ser.imageURL} className="bsn-service-image" alt={ser.emri_sherbimit} />
                        ) : (
                          <div className="bsn-service-fallback bsn-discount-fallback-bg">💝</div>
                        )}
                        <span className="bsn-discount-badge">-{discount}%</span>
                      </div>

                      <div className="bsn-card-content">
                        <h3>{ser.emri_sherbimit}</h3>
                        <p>{ser.pershkrimi || "Exclusive treatment tier offer."}</p>
                        
                        <div className="bsn-card-meta">
                          <span className="bsn-duration-tag">⏱ {formatDuration(ser.kohezgjatja)}</span>
                          <div className="bsn-price-wrapper">
                            <span className="bsn-price-strike">€{base}</span>
                            <span className="bsn-price bsn-text-accent">€{livePrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {/* FILTER BAR */}
        <section className="bsn-filter-section">
          <div className="bsn-section-header">
            <h2>Eksploro të gjitha trajtimet</h2>
          </div>
          <div className="bsn-filter-pills-row bsn-hide-scrollbar">
            {[
              { id: "all", label: "⚡ Të gjitha shërbimet" },
              { id: "Flokët", label: "Flokët" },
              { id: "Thonjët", label: "Thonjët" },
              { id: "Lëkura", label: "Lëkura" }
            ].map((category) => (
              <button
                key={category.id}
                className={`bsn-filter-pill ${activeFilter === category.id ? "bsn-active" : ""}`}
                onClick={() => filterServices(category.id)}
              >
                {category.label}
              </button>
            ))}
          </div>
        </section>

        {/* MAIN SERVICES GRID */}
        <main className="bsn-main-catalog">
          {loading && (
            <div className="bsn-loading-state">
              <div className="bsn-spinner"></div>
              <p>Duke ngarkuar katalogun premium...</p>
            </div>
          )}

          <div className="bsn-services-grid">
            {filtered.length > 0 ? (
              filtered.map((ser) => {
                const base = Number(ser.qmimi_baze || 0);
                const discount = Number(ser.zbritja || 0);
                const livePrice = base * (1 - discount / 100);

                return (
                  <article 
                    className="bsn-service-card" 
                    key={ser.ID}
                    onClick={() => handleServiceClick(ser)}
                  >
                    <div className="bsn-card-img-wrapper">
                      {ser.imageURL ? (
                        <img src={ser.imageURL} className="bsn-service-image" alt={ser.emri_sherbimit} />
                      ) : (
                        <div className="bsn-service-fallback">💇‍♀️</div>
                      )}
                      {discount > 0 && <span className="bsn-discount-badge">-{discount}%</span>}
                    </div>

                    <div className="bsn-card-content">
                      <h3>{ser.emri_sherbimit}</h3>
                      <p>{ser.pershkrimi}</p>

                      <div className="bsn-card-meta">
                        <span className="bsn-duration-tag">⏱ {formatDuration(ser.kohezgjatja)}</span>
                        <div className="bsn-price-wrapper">
                          {discount > 0 && <span className="bsn-price-strike">€{base}</span>}
                          <span className="bsn-price">€{livePrice.toFixed(2)}</span>
                        </div>
                      </div>

                      <button className="bsn-view-details-btn">Shiko opsionet</button>
                    </div>
                  </article>
                );
              })
            ) : (
              !loading && (
                <div className="bsn-empty-state">
                  <h3>Nuk u gjet asnjë shërbim</h3>
                  <p>Provoni të ndryshoni filtrat tuaj.</p>
                </div>
              )
            )}
          </div>
        </main>

        {/* SERVICE OPTIONS MODAL */}
        {selectedService && (
          <div className="bsn-modal-overlay" onClick={closeDialog}>
            <div className="bsn-modal-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="bsn-modal-header">
                <h3>{selectedService.emri_sherbimit}</h3>
                <button className="bsn-modal-close-btn" onClick={closeDialog}>✕</button>
              </div>

              <div className="bsn-modal-body">
                {selectedService.fetchedModalImage && (
                  <div className="bsn-modal-hero-container">
                    <img src={selectedService.fetchedModalImage} className="bsn-modal-hero-img" alt="Preview" />
                  </div>
                )}

                {selectedService.pershkrimi && (
                  <p className="bsn-modal-description">{selectedService.pershkrimi}</p>
                )}

                <div className="bsn-modal-base-metrics">
                  <div className="bsn-metric-pill">
                    <label>Çmimi Fillestar</label>
                    <span>
                      €{(Number(selectedService.qmimi_baze || 0) * (1 - Number(selectedService.zbritja || 0) / 100)).toFixed(2)}
                    </span>
                  </div>
                  <div className="bsn-metric-pill">
                    <label>Kohëzgjatja</label>
                    <span>⏱ {formatDuration(selectedService.kohezgjatja)}</span>
                  </div>
                </div>

                <div className="bsn-category-selection-header">
                  <h4>🪄 Zgjidhni Kategorinë / Variantet</h4>
                  <div className="bsn-attr-searchbar">
                    <input
                      type="text"
                      placeholder="Kërko kategori..."
                      value={attributeSearch}
                      onChange={(e) => setAttributeSearch(e.target.value)}
                    />
                  </div>
                </div>

                {loadingAttributes ? (
                  <div className="bsn-modal-loading">
                    <div className="bsn-spinner-sm"></div>
                    <p>Duke përditësuar opsionet...</p>
                  </div>
                ) : attributes.length > 0 ? (
                  <div className="bsn-attributes-list">
                    {sortedAttributes
                      .filter((attr) =>
                        attr.opsioni?.toLowerCase().includes(attributeSearch.toLowerCase()) ||
                        attr.pershkrimi?.toLowerCase().includes(attributeSearch.toLowerCase())
                      )
                      .map((attr) => {
                        const base = Number(attr.qmimi || 0);
                        const discount = Number(attr.zbritja || 0);
                        const livePrice = base * (1 - discount / 100);

                        return (
                          <div
                            className={`bsn-attr-item-card ${discount > 0 ? "bsn-has-discount" : ""}`}
                            key={attr.id_atributit}
                            onClick={() => setSelectedAttribute(attr)}
                          >
                            <div className="bsn-attr-left">
                              <h5>{attr.opsioni}</h5>
                              {attr.pershkrimi && <p>{attr.pershkrimi}</p>}
                              <span className="bsn-duration-sub-tag">⏱ {formatDuration(attr.kohezgjatja)}</span>
                              {discount > 0 && <span className="bsn-badge-discount-tag">🔥 -{discount}%</span>}
                            </div>
                            <div className="bsn-attr-right">
                              {discount > 0 && <span className="bsn-price-strike">€{base}</span>}
                              <span className="bsn-price">€{livePrice.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                ) : (
                  <div className="bsn-standard-package-msg">Pako standarde e integruar</div>
                )}
              </div>

              <div className="bsn-modal-footer">
                <button className="bsn-modal-btn bsn-secondary" onClick={closeDialog}>Anulo</button>
                <button className="bsn-modal-btn bsn-primary" onClick={() => setView("terminet")}>Krijo termin!</button>
              </div>
            </div>
          </div>
        )}

        {/* DETAILED ATTRIBUTE MODAL */}
        {selectedAttribute && (
          <div className="bsn-modal-overlay" onClick={() => setSelectedAttribute(null)}>
            <div className="bsn-modal-sheet" onClick={(e) => e.stopPropagation()}>
              <div className="bsn-modal-header">
                <h3>{selectedAttribute.opsioni}</h3>
                <button className="bsn-modal-close-btn" onClick={() => setSelectedAttribute(null)}>✕</button>
              </div>
              <div className="bsn-modal-body">
                {selectedAttribute.pershkrimi && <p className="bsn-attr-description">{selectedAttribute.pershkrimi}</p>}
                <div className="bsn-attr-detail-grid">
                  <div className="bsn-detail-row">
                    <span>Kohëzgjatja:</span>
                    <strong>{formatDuration(selectedAttribute.kohezgjatja)}</strong>
                  </div>
                  <div className="bsn-detail-row">
                    <span>Çmimi bazë:</span>
                    <strong>€{Number(selectedAttribute.qmimi || 0).toFixed(2)}</strong>
                  </div>
                  {selectedAttribute.zbritja > 0 && (
                    <div className="bsn-detail-row bsn-discount-row">
                      <span>Zbritje speciale:</span>
                      <strong className="bsn-text-accent">-{selectedAttribute.zbritja}%</strong>
                    </div>
                  )}
                </div>
              </div>
              <div className="bsn-modal-footer">
                <button className="bsn-modal-btn bsn-primary" onClick={() => setSelectedAttribute(null)}>Kthehu</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;