import React, { useEffect, useState, useRef } from "react"; // Added useRef here
import { fetchServices, fetchServiceAtributes } from "../javascript/APIs/ServicesAPI";
import { ExceptionHandler } from "../javascript/Exceptions/ExceptionHandler";
import "../css/home.css";

function Home() {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");
const [selectedAttribute, setSelectedAttribute] = useState(null);
  // DIALOG & ATTRIBUTE STATES
  const [selectedService, setSelectedService] = useState(null);
  const [attributes, setAttributes] = useState([]);
  const [loadingAttributes, setLoadingAttributes] = useState(false);
const [attributeSearch, setAttributeSearch] = useState("");
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

  const sortedAttributes = [...attributes].sort((a, b) => {
  const aDiscount = Number(a.zbritja || 0);
  const bDiscount = Number(b.zbritja || 0);

  return bDiscount - aDiscount; // highest discount first
});
return (
  <div className="home-wrapper">
    <div className="hero-banner">
      <div className="hero-content">
        <h1> Luxury Salon✨</h1>
        <p>Hair • Nails • Skincare • Makeup</p>
        <button className="hero-btn">Vendos termin!</button>
      </div>
    </div>

    <div className="home-container">

      {/* SPECIAL OFFERS */}
      {discountedServices.length > 0 && (
        <section style={{ marginBottom: "30px" }}>
          <div className="slider-header-block">
            <h2 style={{ fontSize: "22px", fontWeight: "800", margin: 0 }}>
              Ofertat speciale 🔥
            </h2>
            <span className="slider-subtitle-badge">
              Oferta me kohë të limituar
            </span>
          </div>

          <div className="discount-slider hide-scrollbar" ref={sliderRef}>
            {discountedServices.map((ser) => {
              const base = Number(ser.qmimi_baze || 0);
              const discount = Number(ser.zbritja || 0);
              const livePrice = base * (1 - discount / 100);

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

                      {discount > 0 && (
                        <span className="discount">-{discount}% OFF</span>
                      )}
                    </div>

                    <div className="card-content">
                      <h2>{ser.emri_sherbimit}</h2>
                      <p>{ser.pershkrimi || "Exclusive treatment tier offer."}</p>

                      <div className="service-info slider-item-pricing-box">
                        <span>⏱ Kohëzgjatja {
    `${String(Math.floor(ser.kohezgjatja / 60)).padStart(2, "0")}:` +
    `${String(ser.kohezgjatja % 60).padStart(2, "0")}:00`
  }</span>

                        <div>
                          {discount > 0 && (
                            <span className="price-strike">€{base}</span>
                          )}
                          <span className="price discount-active">
                            €{livePrice.toFixed(2)}
                          </span>
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

      {/* FILTER BAR */}
      <div className="filter-bar-container">
        <h4 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "12px" }}>
          Eksploro të gjitha trajtimet!
        </h4>

        <div className="filter-pills-row hide-scrollbar">
          {["all", "Flokët", "Thonjët", "Lëkura"].map((type) => (
            <button
              key={type}
              className={`filter-pill ${activeFilter === type ? "active" : ""}`}
              onClick={() => filterServices(type)}
            >
              {type === "all" ? "⚡ Të gjitha shërbimet" : type}
            </button>
          ))}
        </div>
      </div>

      {/* SERVICES GRID */}
      <main>
        {loading && (
          <div className="loading">Loading our premium catalog...</div>
        )}

        <div className="services-grid">
          {filtered.length > 0 ? (
            filtered.map((ser) => {
              const base = Number(ser.qmimi_baze || 0);
              const discount = Number(ser.zbritja || 0);
              const livePrice = base * (1 - discount / 100);

              return (
                <div
                  className="service-card"
                  key={ser.ID}
                  onClick={() => handleServiceClick(ser)}
                >
                  <div className="card-img-wrapper">
                    {ser.imageURL ? (
                      <img src={ser.imageURL} className="service-image" alt="Service" />
                    ) : (
                      <div className="service-fallback">💇‍♀️</div>
                    )}

                    {discount > 0 && (
                      <span className="discount">-{discount}% OFF</span>
                    )}
                  </div>

                  <div className="card-content">
                    <h2>{ser.emri_sherbimit}</h2>
                    <p>{ser.pershkrimi}</p>

                    <div className="service-info">
                      <span>⏱  {
    `${String(Math.floor(ser.kohezgjatja / 60)).padStart(2, "0")}:` +
    `${String(ser.kohezgjatja % 60).padStart(2, "0")}:00`
  }
  </span>

                      <div>
                        {discount > 0 && (
                          <span className="price-strike">€{base}</span>
                        )}

                        <span className={`price ${discount > 0 ? "discount-active" : ""}`}>
                          €{livePrice.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button className="view-details-btn">
                      Shiko opsionet
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            !loading && (
              <div className="empty-state">
                <h3>No services found</h3>
                <p style={{ color: "#6b7280", fontSize: "14px" }}>
                  Try tweaking your filter context rules.
                </p>
              </div>
            )
          )}
        </div>
      </main>

      {/* SERVICE MODAL */}
      {selectedService && (
        <div className="custom-modal-overlay" onClick={closeDialog}>
          <div className="custom-modal-sheet" onClick={(e) => e.stopPropagation()}>

            <div className="modal-sheet-header">
              <h3>{selectedService.emri_sherbimit}</h3>
              <button className="modal-close-btn" onClick={closeDialog}>✕</button>
            </div>

            <div className="modal-sheet-body">

              {selectedService.fetchedModalImage && (
                <img
                  src={selectedService.fetchedModalImage}
                  className="modal-hero-img"
                  alt="Modal Visual"
                />
              )}

              {selectedService.pershkrimi && (
                <p className="modal-description">
                  {selectedService.pershkrimi}
                </p>
              )}

              <div className="modal-base-metrics">
                <div className="metric-pill">
                  <label>Çmimi</label>
                  <span>
                    €
                    {(
                      Number(selectedService.qmimi_baze || 0) *
                      (1 - Number(selectedService.zbritja || 0) / 100)
                    ).toFixed(2)}
                  </span>
                </div>

                <div className="metric-pill">
                  <label>Kohëzgjatja</label>
                  <span>
  ⏱ {
    `${String(Math.floor(selectedService.kohezgjatja / 60)).padStart(2, "0")}:` +
    `${String(selectedService.kohezgjatja % 60).padStart(2, "0")}:00`
  }
</span>
                </div>
              </div>

              {/* ATTRIBUTES HEADER */}
              <h4 className="attributes-section-title">
                🪄 Kategoria
              </h4>

              {/* ATTRIBUTE SEARCH BAR */}
              <div className="attr-searchbar">
                <input
                  type="text"
                  placeholder="Kërko kategori..."
                  value={attributeSearch}
                  onChange={(e) => setAttributeSearch(e.target.value)}
                />
              </div>

              {loadingAttributes ? (
                <div className="loading" style={{ padding: "10px" }}>
                  Updating current options...
                </div>
              ) : attributes.length > 0 ? (
                <div className="attributes-list">

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
  className={`attr-item-card ${discount > 0 ? "has-discount" : ""}`}
  key={attr.id_atributit}
  onClick={() => setSelectedAttribute(attr)}
  style={{ cursor: "pointer" }}
>
                          <div className="attr-left">
                            <h5>{attr.opsioni}</h5>

                            {attr.pershkrimi && <p>{attr.pershkrimi}</p>}

                            <span>⏱ Kohëzgjatja {`${String(Math.floor(attr.kohezgjatja / 60)).padStart(2, "0")}:` +
    `${String(attr.kohezgjatja % 60).padStart(2, "0")}:00`} </span>

                            {discount > 0 && (
  <span className="discount-badge pulse">
    🔥 -{discount}%
  </span>
)}
                          </div>

                          <div className="attr-right">
                            {discount > 0 && (
                              <span className="price-strike">€{base}</span>
                            )}

                            <span className={`price ${discount > 0 ? "discount-active" : ""}`}>
                              €{livePrice.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              ) : (
                <p style={{ color: "#6b7280", fontSize: "13px", textAlign: "center" }}>
                  Pako standart
                </p>
              )}

            </div>

            <div className="modal-sheet-footer">
              <button className="modal-btn secondary" onClick={closeDialog}>
                Anulo
              </button>
              <button className="modal-btn primary">
                Krijo termin!
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ATTRIBUTE MODAL */}
      {selectedAttribute && (
        <div
          className="attr-modal-overlay"
          onClick={() => setSelectedAttribute(null)}
        >
          <div className="attr-modal" onClick={(e) => e.stopPropagation()}>

            <h3>{selectedAttribute.opsioni}</h3>

            {selectedAttribute.pershkrimi && (
              <p>{selectedAttribute.pershkrimi}</p>
            )}

            <div className="attr-details">
              <p>
                <strong>Kohëzgjatja:</strong>    `${String(Math.floor(selectedAttribute.kohezgjatja / 60)).padStart(2, "0")}:` +
    `${String(selectedAttribute.kohezgjatja % 60).padStart(2, "0")}:00`  min
              </p>

              <p>
                <strong>Price:</strong> €
                {Number(selectedAttribute.qmimi || 0).toFixed(2)}
              </p>

              {selectedAttribute.zbritja > 0 && (
                <p className="discount">
                  <strong>Zbritje:</strong> -{selectedAttribute.zbritja}%
                </p>
              )}
            </div>

            <button onClick={() => setSelectedAttribute(null)}>
              kthehu
            </button>

          </div>
        </div>
      )}

    </div>
  </div>
);
}

export default Home;