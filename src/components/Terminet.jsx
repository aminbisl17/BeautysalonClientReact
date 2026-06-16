import { useState } from "react";
import "../css/Termini.css";

export default function Termini() {
  const [formData, setFormData] = useState({
    clientId: 16,
    employeeId: "",
    pershkrimi: "",
    numri_tel: "",
    dataCaktimit: "",
    detajetTermineve: [],
  });

  // REALISTIC EMPLOYEES
  const employees = [
    { id: 10, name: "Arta - Hair Stylist ✂️" },
    { id: 11, name: "Sara - Nail Artist 💅" },
    { id: 12, name: "Diona - Makeup Artist 💄" },
  ];

  // MORE REALISTIC SERVICE DATA
  const services = [
    {
      id: 4,
      name: "Haircut & Styling",
      kohezgjatja: 30,
      pagesa: 12,
      icon: "✂️",
    },
    {
      id: 7,
      name: "Hair Coloring Premium",
      kohezgjatja: 90,
      pagesa: 35,
      icon: "🎨",
    },
    {
      id: 8,
      name: "Bridal Makeup",
      kohezgjatja: 60,
      pagesa: 45,
      icon: "💄",
    },
    {
      id: 9,
      name: "Manicure Deluxe",
      kohezgjatja: 45,
      pagesa: 18,
      icon: "💅",
    },
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleServiceToggle = (service) => {
    const exists = formData.detajetTermineve.find(
      (s) => s.sherbimetId === service.id
    );

    if (exists) {
      setFormData({
        ...formData,
        detajetTermineve: formData.detajetTermineve.filter(
          (s) => s.sherbimetId !== service.id
        ),
      });
    } else {
      setFormData({
        ...formData,
        detajetTermineve: [
          ...formData.detajetTermineve,
          {
            sherbimetId: service.id,
            atributetId: null,
            kohezgjatja: service.kohezgjatja,
            pagesa: service.pagesa,
            name: service.name,
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

          {/* LEFT FORM */}
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

            <div className="services-grid">
              {services.map((s) => {
                const selected = formData.detajetTermineve.some(
                  (x) => x.sherbimetId === s.id
                );

                return (
                  <div
                    key={s.id}
                    className={`service-card ${selected ? "active" : ""}`}
                    onClick={() => handleServiceToggle(s)}
                  >
                    <div className="service-icon">{s.icon}</div>
                    <h4>{s.name}</h4>
                    <p>⏱ {s.kohezgjatja} min</p>
                    <span>€{s.pagesa}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT SUMMARY (STICKY) */}
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
                      <span>€{s.pagesa}</span>
                    </div>
                  ))}

                  <hr />

                  <div className="total">
                    <strong>Total</strong>
                    <strong>€{totalPrice}</strong>
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