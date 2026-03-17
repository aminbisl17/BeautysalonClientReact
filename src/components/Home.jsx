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
      const data = await fetchServices(); // your API call
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
      <h1>Our Services</h1>

      {loading ? (
        <p>Loading...</p>
      ) : services.length === 0 ? (
        <p>No services available</p>
      ) : (
        <div className="services-grid">
          {services.map((ser) => (
            <div className="service-card" key={ser.ID}>
              <h2>{ser.emri_sherbimit}</h2>
              <p>{ser.pershkrimi}</p>
              <p>
                Duration: {ser.kohezgjatja} | Price: {ser.qmimi_baze} |{" "}
                Discount: {ser.zbritja}
              </p>
              <p>Status: {ser.is_active ? "Active" : "Inactive"}</p>
              <p>
                Created: {new Date(ser.created_at).toLocaleDateString()} | Updated:{" "}
                {new Date(ser.update_at).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Home;