import React, { useEffect, useState, useRef } from "react"; // Added useRef here
import { fetchServices, fetchServiceAtributes } from "../javascript/APIs/ServicesAPI";
import { ExceptionHandler } from "../javascript/Exceptions/ExceptionHandler";
import "../css/home.css";

function Home() {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

  // DIALOG & ATTRIBUTE STATES
  const [selectedService, setSelectedService] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);

  // Reference hook to target the horizontal slider DOM container
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

  useEffect(() => {
    loadServices();
  }, []);

  // AUTOMATIC AUTO-PLAY SLIDER LOGIC
  useEffect(() => {
    // If there are no special deals or a user is viewing a modal, skip auto-scroll
    if (discountedServices.length === 0 || selectedService) return;

    const interval = setInterval(() => {
      const slider = sliderRef.current;
      if (!slider) return;

      // Calculate width of a single card dynamically
      const cardWidth = slider.querySelector(".discount-slider-item")?.offsetWidth || 300;
      const gap = 20; // Matches your gap in Home.css
      const step = cardWidth + gap;

      // If we've reached the absolute end of the slider contents, loop cleanly back to the beginning
      if (slider.scrollLeft + slider.offsetWidth >= slider.scrollWidth - 10) {
        slider.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        // Otherwise, move forward by exactly one item card index
        slider.scrollBy({ left: step, behavior: "smooth" });
      }
    }, 3000); // Transitions automatically every 4 seconds

    return () => clearInterval(interval); // Clean up track loop when component unmounts
  }, [discountedServices, selectedService]);

  const filterServices = (type) => {
    setActiveFilter(type);
    if (type === "all") {
      setFiltered(services);
    } else {
      setFiltered(
        services.filter((s) =>
          (s.emri_sherbimit || "").toLowerCase().includes(type)
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
  };

  return (
    <div className="home-wrapper">
      <div className="hero-banner">
        <div className="hero-content">
          <h1>Luxury Salon ✨</h1>
          <p>Hair • Nails • Skincare • Makeup</p>
          <button className="hero-btn">Book Appointment</button>
        </div>
      </div>

      <div className="home-container">
        
        {/* AUTOMATED AUTO-PLAY SLIDER BAR */}
        {discountedServices.length > 0 && (
          <section style={{ marginBottom: "30px" }}>
            <div className="slider-header-block">
              <h2 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>Special Offers 🔥</h2>
              <span className="slider-subtitle-badge">Limited Time Offers</span>
            </div>
            
            {/* Bound the slider container to our ref variable hook */}
            <div className="discount-slider hide-scrollbar" ref={sliderRef}>
              {discountedServices.map((ser) => {
                const livePrice = ser.qmimi_baze * (1 - ser.zbritja / 100);
                return (
                  <div 
                    className="discount-slider-item" 
                    key={`slider-${ser.ID}`}
                    onClick={() => handleServiceClick(ser)}
                  >
                    <div className="service-card" style={{ borderTop: "3px solid #ef4444" }}>
                      <div className="card-img-wrapper">
                        {ser.imageURL ? (
                          <img src={ser.imageURL} className="service-image" alt="Promo" />
                        ) : (
                          <div className="service-fallback discount-fallback-bg">💝</div>
                        )}
                        <span className="discount">-{ser.zbritja}% OFF</span>
                      </div>
                      
                      <div className="card-content">
                        <h2>{ser.emri_sherbimit}</h2>
                        <p>{ser.pershkrimi || "Exclusive treatment tier offer."}</p>
                        
                        <div className="service-info slider-item-pricing-box">
                          <span>⏱ {ser.kohezgjatja} min</span>
                          <div>
                            <span className="price-strike">€{ser.qmimi_baze}</span>
                            <span className="price discount-active">€{livePrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* EXPLORE ALL TREATMENTS FILTER PILLS BAR */}
        <div className="filter-bar-container">
          <h4 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "12px" }}>Explore All Treatments</h4>
          <div className="filter-pills-row hide-scrollbar">
            {["all", "hair", "nail", "skin"].map((type) => (
              <button
                key={type}
                className={`filter-pill ${activeFilter === type ? "active" : ""}`}
                onClick={() => filterServices(type)}
              >
                {type === "all" ? "⚡ All Services" : type}
              </button>
            ))}
          </div>
        </div>

        {/* CATALOGUE SELECTION SERVICES GRID */}
        <main>
          {loading && <div className="loading">Loading our premium catalog...</div>}

          <div className="services-grid">
            {filtered.length > 0 ? (
              filtered.map((ser) => {
                const hasDiscount = ser.zbritja > 0;
                const livePrice = ser.qmimi_baze * (1 - ser.zbritja / 100);
                
                return (
                  <div className="service-card" key={ser.ID} onClick={() => handleServiceClick(ser)}>
                    <div className="card-img-wrapper">
                      {ser.imageURL ? (
                        <img src={ser.imageURL} className="service-image" alt="Service" />
                      ) : (
                        <div className="service-fallback">💇‍♀️</div>
                      )}
                      {hasDiscount && <span className="discount">-{ser.zbritja}% OFF</span>}
                    </div>

                    <div className="card-content">
                      <h2>{ser.emri_sherbimit}</h2>
                      <p>{ser.pershkrimi}</p>

                      <div className="service-info">
                        <span>⏱ {ser.kohezgjatja} min</span>
                        <div>
                          {hasDiscount && <span className="price-strike">€{ser.qmimi_baze}</span>}
                          <span className={`price ${hasDiscount ? "discount-active" : ""}`}>
                            €{livePrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                      <button className="view-details-btn">View Options</button>
                    </div>
                  </div>
                );
              })
            ) : !loading && (
              <div className="empty-state">
                <h3>No services found</h3>
                <p style={{ color: "#6b7280", fontSize: "14px" }}>Try tweaking your filter context rules.</p>
              </div>
            )}
          </div>
        </main>

        {/* MODAL BOTTOM-SHEET DIALOG */}
        {selectedService && (
          <div className="custom-modal-overlay" onClick={closeDialog}>
            <div className="custom-modal-sheet" onClick={(e) => e.stopPropagation()}>
              
              <div className="modal-sheet-header">
                <h3>{selectedService.emri_sherbimit}</h3>
                <button className="modal-close-btn" onClick={closeDialog}>✕</button>
              </div>

              <div className="modal-sheet-body">
                {selectedService.fetchedModalImage && (
                  <img src={selectedService.fetchedModalImage} className="modal-hero-img" alt="Modal Visual" />
                )}
                
                <p className="modal-description">{selectedService.pershkrimi}</p>
                
                <div className="modal-base-metrics">
                  <div className="metric-pill">
                    <label>Price</label>
                    <span>€{(selectedService.qmimi_baze * (1 - selectedService.zbritja / 100)).toFixed(2)}</span>
                  </div>
                  <div className="metric-pill">
                    <label>Duration</label>
                    <span>⏱ {selectedService.kohezgjatja}m</span>
                  </div>
                </div>

                <h4 className="attributes-section-title">🪄 Available Configuration Layouts</h4>

                {loadingAttributes ? (
                  <div className="loading" style={{ padding: "10px" }}>Updating current options...</div>
                ) : attributes.length > 0 ? (
                  <div className="attributes-list">
                    {attributes.map((attr) => (
                      <div className="attr-item-card" key={attr.id_atributit}>
                        <div className="attr-left">
                          <h5>{attr.opsioni}</h5>
                          {attr.pershkrimi && <p>{attr.pershkrimi}</p>}
                          <span className="attr-duration-tag">⏱ {attr.kohezgjatja} min</span>
                        </div>
                        <div className="attr-right">
                          <span className="attr-price">€{attr.qmimi.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "#6b7280", fontSize: "13px", textAlign: "center" }}>
                    Standard base package configurations apply.
                  </p>
                )}
              </div>

              <div className="modal-sheet-footer">
                <button className="modal-btn secondary" onClick={closeDialog}>Cancel</button>
                <button className="modal-btn primary">Book Treatment</button>
              </div>

            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;