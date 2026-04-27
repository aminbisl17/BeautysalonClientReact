import React, { useEffect, useState } from "react";
import { fetchServices } from "../javascript/APIs/ServicesAPI";
import { ExceptionHandler } from "../javascript/Exceptions/ExceptionHandler";

function Home() {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all");

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

  // FILTER LOGIC
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

  return (
    <div>

      {/* HERO SECTION */}
      <div
        className="text-white d-flex align-items-center justify-content-center"
        style={{
          height: "55vh",
          background: "linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url('https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          textAlign: "center",
        }}
      >
        <div>
          <h1 className="display-4 fw-bold">Beauty Salon ✨</h1>
          <p className="lead">
            Hair • Nails • Skincare • Makeup
          </p>

          <button className="btn btn-primary btn-lg mt-3">
            Book Appointment
          </button>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="container py-4 text-center">

        <div className="btn-group">

          <button
            className={`btn btn-sm ${activeFilter === "all" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => filterServices("all")}
          >
            All
          </button>

          <button
            className={`btn btn-sm ${activeFilter === "hair" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => filterServices("hair")}
          >
            Hair
          </button>

          <button
            className={`btn btn-sm ${activeFilter === "nail" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => filterServices("nail")}
          >
            Nails
          </button>

          <button
            className={`btn btn-sm ${activeFilter === "skin" ? "btn-dark" : "btn-outline-dark"}`}
            onClick={() => filterServices("skin")}
          >
            Skin
          </button>

        </div>

      </div>

      {/* SERVICES */}
      <div className="container pb-5">

        {loading && (
          <div className="text-center">
            <div className="spinner-border text-primary"></div>
            <p>Loading services...</p>
          </div>
        )}

        <div className="row g-4">

          {filtered.map((ser) => (
            <div className="col-md-4" key={ser.ID}>

              <div className="card border-0 shadow-sm h-100">

                {/* IMAGE */}
                {ser.imageURL ? (
                  <img
                    src={ser.imageURL}
                    className="card-img-top"
                    style={{ height: "220px", objectFit: "cover" }}
                    alt="service"
                  />
                ) : (
                  <div className="bg-light d-flex align-items-center justify-content-center"
                    style={{ height: "220px", fontSize: "40px" }}>
                    💇‍♀️
                  </div>
                )}

                <div className="card-body">

                  <h5 className="fw-bold">{ser.emri_sherbimit}</h5>

                  <p className="text-muted small">
                    {ser.pershkrimi}
                  </p>

                  <div className="d-flex justify-content-between align-items-center">

                    <span className="badge bg-secondary">
                      ⏱ {ser.kohezgjatja}
                    </span>

                    <span className="fw-bold text-primary">
                      €{ser.qmimi_baze}
                    </span>

                  </div>

                  {ser.zbritja > 0 && (
                    <span className="badge bg-danger mt-2">
                      -{ser.zbritja}% OFF
                    </span>
                  )}

                  <button className="btn btn-outline-primary w-100 mt-3">
                    Book Now
                  </button>

                </div>

              </div>

            </div>
          ))}

        </div>

      </div>

    </div>
  );
}

export default Home;