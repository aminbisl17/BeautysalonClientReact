import { useEffect, useState } from "react";
import "../css/Termini.css";
import { fetchServices } from "../javascript/APIs/ServicesAPI";
import { fetchEmployees } from "../javascript/APIs/EmployeesAPI";
import { ExceptionHandler } from "../javascript/Exceptions/ExceptionHandler";

export default function Termini() {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");

  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  const [formData, setFormData] = useState({
    clientId: 16,
    employeeId: "",
    pershkrimi: "",
    numri_tel: "",
    dataCaktimit: "",
    detajetTermineve: [],
  });

  // ---------------- EMPLOYEES ----------------
  async function loadEmployees() {
    try {
      const data = await fetchEmployees();
      setEmployees(data || []);
    } catch (err) {
      ExceptionHandler(err);
    }
  }

  // ---------------- SERVICES ----------------
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
    loadEmployees();
    loadServices();
  }, []);

  // ---------------- SEARCH ----------------
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) {
      setFiltered(services);
      return;
    }

    setFiltered(
      services.filter((s) =>
        s.emri_sherbimit?.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  // ---------------- FORM ----------------
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // ---------------- PRICE ----------------
  const getPrice = (service) => {
    const base = service.qmimi_baze || 0;
    const discount = service.zbritja || 0;
    return base - (base * discount) / 100;
  };

  // ---------------- SERVICES TOGGLE ----------------
  const handleServiceToggle = (service) => {
    const exists = formData.detajetTermineve.find(
      (s) => s.sherbimetId === service.ID
    );

    const price = getPrice(service);

    if (exists) {
      setFormData((prev) => ({
        ...prev,
        detajetTermineve: prev.detajetTermineve.filter(
          (s) => s.sherbimetId !== service.ID
        ),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        detajetTermineve: [
          ...prev.detajetTermineve,
          {
            sherbimetId: service.ID,
            atributetId: null,
            kohezgjatja: service.kohezgjatja,
            pagesa: price,
            name: service.emri_sherbimit,
            imagePath: service.imageURL,
          },
        ],
      }));
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

              {/* EMPLOYEES */}
          <label>👩‍🎨 Select Stylist</label>

<div className="dropdown-wrapper">
  <select
    name="employeeId"
    value={formData.employeeId}
    onChange={(e) =>
      setFormData((prev) => ({
        ...prev,
        employeeId: Number(e.target.value),
      }))
    }
  >
    <option value="">Choose stylist</option>

    {employees.map((e) => (
      <option key={e.ID} value={e.ID}>
        {e.emri} {e.mbiemri}
      </option>
    ))}
  </select>

  {/* View Profile Button */}
  <button
    type="button"
    disabled={!formData.employeeId}
    onClick={() => {
      const emp = employees.find(
        (x) => x.ID === formData.employeeId
      );
      if (emp) {
        setSelectedEmployee(emp);
        setShowEmployeeModal(true);
      }
    }}
  >
    View Profile
  </button>
</div>
              {/* PHONE */}
              <label>📞 Phone Number</label>
              <input
                name="numri_tel"
                placeholder="+383..."
                value={formData.numri_tel}
                onChange={handleChange}
              />

              {/* DATE */}
              <label>📅 Date & Time</label>
              <input
                type="datetime-local"
                name="dataCaktimit"
                value={formData.dataCaktimit}
                onChange={handleChange}
              />

              {/* NOTES */}
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
                      {s.imageURL && (
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

                      <span className="price">€{price.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* RIGHT */}
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

      {/* MODAL */}
      {showEmployeeModal && selectedEmployee && (
        <div
          className="modal-overlay"
          onClick={() => setShowEmployeeModal(false)}
        >
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>👤 Employee Profile</h2>

            <p>
              <strong>Name:</strong>{" "}
              {selectedEmployee.emri} {selectedEmployee.mbiemri}
            </p>
            <p>
              <strong>Email:</strong> {selectedEmployee.email}
            </p>
            <p>
              <strong>Phone:</strong> {selectedEmployee.numri_telefonit}
            </p>

            <p>
              <strong>Description:</strong>{" "}
              {selectedEmployee.pershkrimi || "No description available"}
            </p>

            <button
              className="close-btn"
              onClick={() => setShowEmployeeModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}