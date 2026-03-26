import "../css/home.css";
import React, { useEffect, useState } from "react";
import { fetchServices } from "../javascript/APIs/ServicesAPI";
import { ExceptionHandler } from "../javascript/Exceptions/ExceptionHandler";

function Home() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);


  async function loadServices() {
    try {
      setLoading(true);
      const data = await fetchServices();
      setServices(data);
    } catch (err) {
      ExceptionHandler(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadServices();
  }, []);

   return (
    <div className="home-container">
      <div className="home-header">
        <h1>Our Services</h1>
        <p>Discover premium beauty treatments</p>
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : services.length === 0 ? (
        <p className="loading">No services available</p>
      ) : (
        <div className="services-grid">
          {services.map((ser) => (
            <div className="service-card" key={ser.ID}>
              {ser.imageURL ? (
                <img
                  src={ser.imageURL}
                  alt="Service"
                  className="service-image"
                />
              ) : (
                <div className="service-fallback">💄</div>
              )}

              <h2>{ser.emri_sherbimit}</h2>
              <p>{ser.pershkrimi}</p>

              <div className="service-info">
                <span>⏱ {ser.kohezgjatja}</span>
                <span className="price">€{ser.qmimi_baze}</span>
              </div>

              {ser.zbritja > 0 && (
                <div className="discount">-{ser.zbritja}% OFF</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;