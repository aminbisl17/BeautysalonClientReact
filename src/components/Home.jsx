import React, { useEffect, useState, useRef } from "react";
import {
  fetchServices,
  fetchServiceAtributes
} from "../javascript/APIs/ServicesAPI";
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

      console.log("REFRESH STATUS:", res?.status);
      console.log("REFRESH OK:", res?.ok);

      if (!res || !res.ok) return;

      const accessToken = sessionStorage.getItem("accessToken");

      console.log("ACCESS TOKEN EXISTS:", !!accessToken);
      console.log("ACCESS TOKEN:", accessToken);

      if (!accessToken) return;

      const url = process.env.REACT_APP_CLIENT_GET_DATA;

      console.log("CLIENT DATA URL:", url);

      const userRes = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      console.log("CLIENT DATA STATUS:", userRes.status);

      if (!userRes.ok) {
        console.log("CLIENT DATA ERROR:", await userRes.text());
        return;
      }

      const userInfo = await userRes.json();

      console.log("CLIENT DATA:", userInfo);

      sessionStorage.setItem("userDetails", JSON.stringify(userInfo));

      if (!userRes.ok) return;
    } catch (err) {
      console.error(err);
      ExceptionHandler.handle(err);
    }
  }

  useEffect(() => {
    loadUserData();
    loadServices();
},[]);

useEffect(() => {
  if (discountedServices.length === 0) {
    return;
  }

  let paused = false;

  const interval = setInterval(() => {
    const slider = sliderRef.current;

    if (!slider || paused) {
      return;
    }

    slider.scrollLeft += 2;

    const halfWidth = slider.scrollWidth / 2;

    if (
      halfWidth > 0 &&
      slider.scrollLeft >= halfWidth
    ) {
      slider.scrollLeft = 0;
    }
  }, 20);

  const slider = sliderRef.current;

  if (!slider) {
    return () => clearInterval(interval);
  }

  const pause = () => {
    paused = true;
  };

  const resume = () => {
    paused = false;
  };

  slider.addEventListener("touchstart", pause, {
    passive: true
  });

  slider.addEventListener("touchend", resume, {
    passive: true
  });

  slider.addEventListener("touchcancel", resume, {
    passive: true
  });

  return () => {
    clearInterval(interval);

    slider.removeEventListener(
      "touchstart",
      pause
    );

    slider.removeEventListener(
      "touchend",
      resume
    );

    slider.removeEventListener(
      "touchcancel",
      resume
    );
  };
}, [discountedServices.length]);
  /*
  useEffect(() => {
    if (discountedServices.length === 0 || selectedService) return;

    const interval = setInterval(() => {
      const slider = sliderRef.current;
      if (!slider) return;

      const cardWidth =
        slider.querySelector(".bsn-slider-item")?.offsetWidth || 300;

      const gap = 16;
      const step = cardWidth + gap;

      if (
        slider.scrollLeft + slider.offsetWidth >=
        slider.scrollWidth - 10
      ) {
        slider.scrollTo({
          left: 0,
          behavior: "smooth"
        });
      } else {
        slider.scrollBy({
          left: step,
          behavior: "smooth"
        });
      }
    }, 3500);

    return () => clearInterval(interval);
  }, [discountedServices, selectedService]);
*/
  const filterServices = (type) => {
    setActiveFilter(type);

    if (type === "all") {
      setFiltered(services);
    } else {
      setFiltered(
        services.filter((s) =>
          (s.emri_sherbimit || "")
            .toLowerCase()
            .includes(type.toLowerCase())
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
        setSelectedService((prev) => ({
          ...prev,
          fetchedModalImage: data.imageURL
        }));
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

    return `${String(hours).padStart(2, "0")}:${String(
      minutes
    ).padStart(2, "0")}h`;
  };


  return (
    <div className="bsn-home">

      {/* =========================================================
          HERO
      ========================================================= */}

      <section className="bsn-hero">

        <div className="bsn-hero-image" />

        <div className="bsn-hero-gradient" />

        <div className="bsn-hero-content">

          <div className="bsn-hero-topline">
            <span className="bsn-hero-dot" />
            BEAUTY · WELLNESS · EXPERIENCE
          </div>

          <h1>
            Your beauty,
            <br />
            <em>your moment.</em>
          </h1>

          <p>
            Zgjidh trajtimin tënd të preferuar,
            personalizoje dhe rezervo në pak sekonda.
          </p>

          <div className="bsn-hero-actions">
            <button
              className="bsn-hero-primary"
              onClick={() => setView("terminet")}
            >
              <span>Rezervo tani</span>
              <span className="bsn-arrow">↗</span>
            </button>

            <div className="bsn-hero-note">
              <span>✦</span>
              Eksperiencë premium
            </div>
          </div>

        </div>

        <div className="bsn-hero-bottom">
          <span>SCROLL TO EXPLORE</span>
          <div className="bsn-scroll-line" />
        </div>

      </section>


      {/* =========================================================
          CONTENT
      ========================================================= */}

      <main className="bsn-content">

        {/* INTRO */}
        <section className="bsn-intro">

          <div className="bsn-eyebrow">
            <span />
            OUR SERVICES
          </div>

          <div className="bsn-intro-row">

            <h2>
              Kujdesi që
              <br />
              <em>meriton.</em>
            </h2>

            <p>
              Nga flokët te thonjtë dhe kujdesi për lëkurën,
              zgjidh një eksperiencë të krijuar për ty.
            </p>

          </div>

        </section>


        {/* =========================================================
            OFFERS
        ========================================================= */}

        {discountedServices.length > 0 && (
          <section className="bsn-offers">

            <div className="bsn-section-top">

              <div>
                <div className="bsn-eyebrow bsn-eyebrow-sale">
                  <span />
                  LIMITED EDITION
                </div>

                <h2>Oferta speciale</h2>
              </div>

              <span className="bsn-section-count">
                {discountedServices.length} oferta
              </span>

            </div>


        <div className="bsn-offer-track-wrapper">

  <div
    className="bsn-offer-track"
  ref={sliderRef}
  >

                {[...discountedServices, ...discountedServices].map(
                  (ser, index) => {
                    const base = Number(ser.qmimi_baze || 0);
                    const discount = Number(ser.zbritja || 0);
                    const livePrice =
                      base * (1 - discount / 100);

                    return (
                      <article
                        className="bsn-offer-card bsn-slider-item"
                        key={`${ser.ID}-${index}`}
                        onClick={() => handleServiceClick(ser)}
                      >

                        <div className="bsn-offer-image">

                          {ser.imagePath ? (
                            <img
                              src={ser.imagePath}
                              alt={ser.emri_sherbimit}
                            />
                          ) : (
                            <div className="bsn-image-placeholder">
                              ✦
                            </div>
                          )}

                          <div className="bsn-offer-image-overlay" />

                          <span className="bsn-sale-pill">
                            -{discount}%
                          </span>

                          <span className="bsn-offer-label">
                            SPECIAL
                          </span>

                        </div>


                        <div className="bsn-offer-info">

                          <div>
                            <span className="bsn-card-kicker">
                              EXCLUSIVE TREATMENT
                            </span>

                            <h3>{ser.emri_sherbimit}</h3>
                          </div>

                          <div className="bsn-offer-bottom">

                            <span className="bsn-duration">
                              {formatDuration(ser.kohezgjatja)}
                            </span>

                            <div className="bsn-offer-price">
                              <del>€{base}</del>
                              <strong>
                                €{livePrice.toFixed(2)}
                              </strong>
                            </div>

                          </div>

                        </div>

                      </article>
                    );
                  }
                )}

              </div>

            </div>

          </section>
        )}


        {/* =========================================================
            FILTER / DISCOVERY
        ========================================================= */}

        <section className="bsn-discovery">

          <div className="bsn-discovery-heading">

            <div>
              <div className="bsn-eyebrow">
                <span />
                EXPLORE
              </div>

              <h2>Gjej trajtimin tënd.</h2>
            </div>

            <span className="bsn-result-count">
              {filtered.length} shërbime
            </span>

          </div>


          <div className="bsn-category-nav bsn-hide-scrollbar">

            {[
              {
                id: "all",
                label: "Të gjitha",
                icon: "✦"
              },
              {
                id: "Flokët",
                label: "Flokët",
                icon: "◌"
              },
              {
                id: "Thonjët",
                label: "Thonjët",
                icon: "◇"
              },
              {
                id: "Lëkura",
                label: "Lëkura",
                icon: "○"
              }
            ].map((category) => (

              <button
                key={category.id}
                className={`bsn-category ${
                  activeFilter === category.id
                    ? "active"
                    : ""
                }`}
                onClick={() =>
                  filterServices(category.id)
                }
              >

                <span className="bsn-category-icon">
                  {category.icon}
                </span>

                {category.label}

              </button>

            ))}

          </div>

        </section>


        {/* =========================================================
            SERVICES
        ========================================================= */}

        <section className="bsn-catalog">

          {loading && (
            <div className="bsn-loading">

              <div className="bsn-loading-ring" />

              <span>
                Duke përgatitur eksperiencën...
              </span>

            </div>
          )}


          {!loading && filtered.length > 0 && (

            <div className="bsn-service-list">

              {filtered.map((ser) => {

                const base = Number(
                  ser.qmimi_baze || 0
                );

                const discount = Number(
                  ser.zbritja || 0
                );

                const livePrice =
                  base * (1 - discount / 100);

                return (

                  <article
                    className="bsn-treatment-card"
                    key={ser.ID}
                    onClick={() =>
                      handleServiceClick(ser)
                    }
                  >

                    <div className="bsn-treatment-image">

                      {ser.imagePath ? (
                        <img
                          src={ser.imagePath}
                          alt={ser.emri_sherbimit}
                        />
                      ) : (
                        <div className="bsn-image-placeholder">
                          ✦
                        </div>
                      )}

                      <div className="bsn-treatment-gradient" />

                      {discount > 0 && (
                        <span className="bsn-treatment-sale">
                          -{discount}%
                        </span>
                      )}

                      <span className="bsn-treatment-open">
                        ↗
                      </span>

                    </div>


                    <div className="bsn-treatment-info">

                      <div className="bsn-treatment-main">

                        <span className="bsn-treatment-type">
                          BEAUTY TREATMENT
                        </span>

                        <h3>
                          {ser.emri_sherbimit}
                        </h3>

                        {ser.pershkrimi && (
                          <p>
                            {ser.pershkrimi}
                          </p>
                        )}

                      </div>


                      <div className="bsn-treatment-footer">

                        <div className="bsn-treatment-meta">

                          <span>
                            ◷ {formatDuration(
                              ser.kohezgjatja
                            )}
                          </span>

                        </div>


                        <div className="bsn-treatment-price">

                          {discount > 0 && (
                            <del>€{base}</del>
                          )}

                          <strong>
                            €{livePrice.toFixed(2)}
                          </strong>

                        </div>

                      </div>

                    </div>

                  </article>

                );
              })}

            </div>

          )}


          {!loading && filtered.length === 0 && (

            <div className="bsn-empty">

              <div className="bsn-empty-symbol">
                ◌
              </div>

              <h3>
                Nuk u gjet asnjë shërbim
              </h3>

              <p>
                Provoni një kategori tjetër.
              </p>

            </div>

          )}

        </section>

      </main>


      {/* =========================================================
          SERVICE MODAL
      ========================================================= */}

      {selectedService && (

        <div
          className="bsn-modal-backdrop"
          onClick={closeDialog}
        >

          <div
            className="bsn-service-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="bsn-modal-handle" />


            <div className="bsn-modal-top">

              <div>

                <span>
                  TREATMENT
                </span>

                <h3>
                  {selectedService.emri_sherbimit}
                </h3>

              </div>

              <button
                className="bsn-modal-close"
                onClick={closeDialog}
              >
                ×
              </button>

            </div>


            <div className="bsn-modal-content">

              {selectedService.imagePath && (

                <div className="bsn-modal-image">

                  <img
                    src={selectedService.imagePath}
                    alt="Preview"
                  />

                  <div className="bsn-modal-image-overlay" />

                </div>

              )}


              {selectedService.pershkrimi && (

                <p className="bsn-modal-description">
                  {selectedService.pershkrimi}
                </p>

              )}


              <div className="bsn-modal-highlights">

                <div>
                  <span>STARTING FROM</span>

                  <strong>
                    €
                    {(
                      Number(
                        selectedService.qmimi_baze || 0
                      ) *
                      (
                        1 -
                        Number(
                          selectedService.zbritja || 0
                        ) / 100
                      )
                    ).toFixed(2)}
                  </strong>
                </div>

                <div>
                  <span>DURATION</span>

                  <strong>
                    {formatDuration(
                      selectedService.kohezgjatja
                    )}
                  </strong>
                </div>

              </div>


              <div className="bsn-options-header">

                <div>

                  <span>PERSONALIZE</span>

                  <h4>
                    Zgjidh opsionin
                  </h4>

                </div>

                <div className="bsn-option-search">

                  <input
                    type="text"
                    placeholder="Kërko..."
                    value={attributeSearch}
                    onChange={(e) =>
                      setAttributeSearch(
                        e.target.value
                      )
                    }
                  />

                </div>

              </div>


              {loadingAttributes ? (

                <div className="bsn-modal-loading">

                  <div className="bsn-loading-ring" />

                  <span>
                    Duke përditësuar opsionet...
                  </span>

                </div>

              ) : attributes.length > 0 ? (

                <div className="bsn-options-list">

                  {sortedAttributes
                    .filter((attr) =>
                      attr.opsioni
                        ?.toLowerCase()
                        .includes(
                          attributeSearch.toLowerCase()
                        ) ||
                      attr.pershkrimi
                        ?.toLowerCase()
                        .includes(
                          attributeSearch.toLowerCase()
                        )
                    )
                    .map((attr) => {

                      const base = Number(
                        attr.qmimi || 0
                      );

                      const discount = Number(
                        attr.zbritja || 0
                      );

                      const livePrice =
                        base *
                        (1 - discount / 100);

                      return (

                        <button
                          className={`bsn-option ${
                            discount > 0
                              ? "has-discount"
                              : ""
                          }`}
                          key={attr.id_atributit}
                          onClick={() =>
                            setSelectedAttribute(attr)
                          }
                        >

                          <div className="bsn-option-check">
                            →
                          </div>

                          <div className="bsn-option-details">

                            <h5>
                              {attr.opsioni}
                            </h5>

                            {attr.pershkrimi && (
                              <p>
                                {attr.pershkrimi}
                              </p>
                            )}

                            <span>
                              ◷{" "}
                              {formatDuration(
                                attr.kohezgjatja
                              )}

                              {discount > 0 && (
                                <>
                                  {" · "}
                                  -{discount}%
                                </>
                              )}
                            </span>

                          </div>

                          <div className="bsn-option-price">

                            {discount > 0 && (
                              <del>
                                €{base}
                              </del>
                            )}

                            <strong>
                              €{livePrice.toFixed(2)}
                            </strong>

                          </div>

                        </button>

                      );
                    })}

                </div>

              ) : (

                <div className="bsn-standard-package">
                  <span>✦</span>
                  Pako standarde e integruar
                </div>

              )}

            </div>


            <div className="bsn-modal-actions">

              <button
                className="bsn-modal-cancel"
                onClick={closeDialog}
              >
                Mbyll
              </button>

              <button
                className="bsn-modal-book"
                onClick={() =>
                  setView("terminet")
                }
              >
                Rezervo termin
                <span>↗</span>
              </button>

            </div>

          </div>

        </div>

      )}


      {/* =========================================================
          ATTRIBUTE DETAILS MODAL
      ========================================================= */}

      {selectedAttribute && (

        <div
          className="bsn-modal-backdrop bsn-detail-backdrop"
          onClick={() =>
            setSelectedAttribute(null)
          }
        >

          <div
            className="bsn-detail-modal"
            onClick={(e) =>
              e.stopPropagation()
            }
          >

            <div className="bsn-modal-handle" />

            <div className="bsn-modal-top">

              <div>

                <span>OPTION</span>

                <h3>
                  {selectedAttribute.opsioni}
                </h3>

              </div>

              <button
                className="bsn-modal-close"
                onClick={() =>
                  setSelectedAttribute(null)
                }
              >
                ×
              </button>

            </div>


            <div className="bsn-detail-content">

              {selectedAttribute.pershkrimi && (

                <p className="bsn-modal-description">
                  {selectedAttribute.pershkrimi}
                </p>

              )}


              <div className="bsn-detail-stats">

                <div>
                  <span>DURATION</span>

                  <strong>
                    {formatDuration(
                      selectedAttribute.kohezgjatja
                    )}
                  </strong>
                </div>

                <div>
                  <span>BASE PRICE</span>

                  <strong>
                    €
                    {Number(
                      selectedAttribute.qmimi || 0
                    ).toFixed(2)}
                  </strong>
                </div>

                {selectedAttribute.zbritja > 0 && (

                  <div className="discount">

                    <span>DISCOUNT</span>

                    <strong>
                      -{selectedAttribute.zbritja}%
                    </strong>

                  </div>

                )}

              </div>

            </div>


            <div className="bsn-modal-actions">

              <button
                className="bsn-modal-book full"
                onClick={() =>
                  setSelectedAttribute(null)
                }
              >
                Kthehu
              </button>

            </div>

          </div>

        </div>

      )}

    </div>
  );
}

export default Home;