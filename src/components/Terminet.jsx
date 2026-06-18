import { useEffect, useState } from "react";
import "../css/Termini.css";
import { fetchServices, fetchServiceAtributes } from "../javascript/APIs/ServicesAPI";
import { ExceptionHandler } from "../javascript/Exceptions/ExceptionHandler";
// make sure these exist in your project
// import { fetchServices } from "...";
// import { ExceptionHandler } from "...";

export default function Termini() {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(false);
const [search, setSearch] = useState("");
  const [formData, setFormData] = useState({
    clientId: 16,
    employeeId: "",
    pershkrimi: "",
    numri_tel: "",
    dataCaktimit: "",
    detajetTermineve: [],
  });

  const employees = [
    { id: 10, name: "Arta - Hair Stylist ✂️" },
    { id: 11, name: "Sara - Nail Artist 💅" },
    { id: 12, name: "Diona - Makeup Artist 💄" },
  ];

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

  const handleSearch = (e) => {
  const value = e.target.value;
  setSearch(value);

  if (!value.trim()) {
    setFiltered(services);
    return;
  }

  const filteredData = services.filter((s) =>
    s.emri_sherbimit?.toLowerCase().includes(value.toLowerCase())
  );

  setFiltered(filteredData);
};

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const getPrice = (service) => {
    const base = service.qmimi_baze || 0;
    const discount = service.zbritja || 0;
    return base - (base * discount) / 100;
  };

  const handleServiceToggle = (service) => {
    const exists = formData.detajetTermineve.find(
      (s) => s.sherbimetId === service.ID
    );

    const price = getPrice(service);

    if (exists) {
      setFormData({
        ...formData,
        detajetTermineve: formData.detajetTermineve.filter(
          (s) => s.sherbimetId !== service.ID
        ),
      });
    } else {
      setFormData({
        ...formData,
        detajetTermineve: [
          ...formData.detajetTermineve,
          {
            sherbimetId: service.ID,
            atributetId: null,
            kohezgjatja: service.kohezgjatja,
            pagesa: price,
            name: service.emri_sherbimit,
            imagePath: service.imageURL,
          },
        ],
      });
    }
  };

  const totalPrice = formData.detajetTermineve.reduce(
    (sum, item) => sum + item.pagesa,
    0
  );

  return (
    <div className="termini-page">
      <div className="termini-container">

        {/* HEADER */}
        <div className="termini-header">
          <h1>✨ Book Your Appointment</h1>
          <p>Select services, time & stylist in seconds</p>
        </div>

        <div className="termini-grid">

          {/* LEFT */}
          <div className="termini-form">

            <div className="form-card">
              <label>👩‍🎨 Select Stylist</label>
              <select
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
              >
                <option value="">Choose stylist</option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.name}
                  </option>
                ))}
              </select>

              <label>📞 Phone Number</label>
              <input
                name="numri_tel"
                placeholder="+383..."
                value={formData.numri_tel}
                onChange={handleChange}
              />

              <label>📅 Date & Time</label>
              <input
                type="datetime-local"
                name="dataCaktimit"
                value={formData.dataCaktimit}
                onChange={handleChange}
              />

              <label>📝 Notes</label>
              <textarea
                name="pershkrimi"
                placeholder="Any special request..."
                value={formData.pershkrimi}
                onChange={handleChange}
              />
            </div>

            {/* SERVICES */}

            <h3 className="section-title">Available Services</h3>


<div className="search-bar mb-3">
  <div className="input-group shadow-sm">
    <span className="input-group-text bg-white">🔍</span>

    <input
      type="text"
      className="form-control"
      placeholder="Search services..."
      value={search}
      onChange={handleSearch}
    />

    {search && (
      <button
        className="btn btn-outline-secondary"
        onClick={() => {
          setSearch("");
          setFiltered(services);
        }}
      >
        ✕
      </button>
    )}
  </div>
</div>

            {loading ? (
              <p>Loading services...</p>
            ) : (
              <div className="services-grid">
                {filtered.map((s) => {
                  const selected = formData.detajetTermineve.some(
                    (x) => x.sherbimetId === s.ID
                  );

                  const price = getPrice(s);

                  return (
                    <div
                      key={s.ID}
                      className={`service-card ${selected ? "active" : ""}`}
                      onClick={() => handleServiceToggle(s)}
                    >
                      {s.imagePath && (
                        <img
                          src={s.imageURL}
                          alt={s.emri_sherbimit}
                          className="service-img"
                        />
                      )}

                      <h4>{s.emri_sherbimit}</h4>

                      {s.pershkrimi && <p>{s.pershkrimi}</p>}

                      <p>⏱ {s.kohezgjatja} min</p>

                      {s.zbritja > 0 && (
                        <span className="discount">-{s.zbritja}% OFF</span>
                      )}

                      <span className="price">
                        €{price.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT SUMMARY */}
          <div className="termini-summary">

            <div className="summary-card sticky">
              <h3>📋 Booking Summary</h3>

              {formData.detajetTermineve.length === 0 ? (
                <p className="empty">No services selected yet</p>
              ) : (
                <>
                  {formData.detajetTermineve.map((s, i) => (
                    <div key={i} className="summary-item">
                      <span>{s.name}</span>
                      <span>€{s.pagesa.toFixed(2)}</span>
                    </div>
                  ))}

                  <hr />

                  <div className="total">
                    <strong>Total</strong>
                    <strong>€{totalPrice.toFixed(2)}</strong>
                  </div>
                </>
              )}

              <button className="confirm-btn">
                Confirm Appointment
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}