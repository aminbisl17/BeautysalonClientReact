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

  const employees = [
    { id: 10, name: "Arta" },
    { id: 11, name: "Sara" },
    { id: 12, name: "Diona" },
  ];

  const services = [
    {
      id: 4,
      name: "Haircut",
      kohezgjatja: "00:30:00",
      pagesa: 5.0,
    },
    {
      id: 7,
      name: "Hair Coloring",
      kohezgjatja: "00:45:00",
      pagesa: 10.0,
    },
    {
      id: 8,
      name: "Makeup",
      kohezgjatja: "01:00:00",
      pagesa: 15.0,
    },
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleServiceToggle = (service) => {
    const exists = formData.detajetTermineve.find(
      (item) => item.sherbimetId === service.id
    );

    if (exists) {
      setFormData({
        ...formData,
        detajetTermineve: formData.detajetTermineve.filter(
          (item) => item.sherbimetId !== service.id
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
          },
        ],
      });
    }
  };

  const totalPrice = formData.detajetTermineve.reduce(
    (sum, item) => sum + item.pagesa,
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      ...formData,
      employeeId: Number(formData.employeeId),
    };

    console.log(payload);
  };

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-9">
          <div className="booking-card shadow-lg">
            <div className="booking-header text-center">
              <h2>✨ Schedule Appointment</h2>
              <p>Choose your stylist, services and time</p>
            </div>

            <form onSubmit={handleSubmit} className="p-4">
              <div className="row g-4">
                {/* Left Side */}
                <div className="col-md-6">
                  <label className="form-label">Select Employee</label>
                  <select
                    className="form-select"
                    name="employeeId"
                    value={formData.employeeId}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Choose...</option>
                    {employees.map((employee) => (
                      <option key={employee.id} value={employee.id}>
                        {employee.name}
                      </option>
                    ))}
                  </select>

                  <label className="form-label mt-3">Phone Number</label>
                  <input
                    type="text"
                    className="form-control"
                    name="numri_tel"
                    placeholder="+383..."
                    value={formData.numri_tel}
                    onChange={handleChange}
                    required
                  />

                  <label className="form-label mt-3">Appointment Date</label>
                  <input
                    type="datetime-local"
                    className="form-control"
                    name="dataCaktimit"
                    value={formData.dataCaktimit}
                    onChange={handleChange}
                    required
                  />

                  <label className="form-label mt-3">Description</label>
                  <textarea
                    className="form-control"
                    rows="4"
                    name="pershkrimi"
                    placeholder="Special requests..."
                    value={formData.pershkrimi}
                    onChange={handleChange}
                  />
                </div>

                {/* Right Side */}
                <div className="col-md-6">
                  <h5 className="mb-3">Choose Services</h5>

                  <div className="services-wrapper">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className={`service-box ${
                          formData.detajetTermineve.find(
                            (s) => s.sherbimetId === service.id
                          )
                            ? "selected"
                            : ""
                        }`}
                        onClick={() => handleServiceToggle(service)}
                      >
                        <h6>{service.name}</h6>
                        <p>⏱ {service.kohezgjatja}</p>
                        <span>€{service.pagesa}</span>
                      </div>
                    ))}
                  </div>

                  <div className="summary-box mt-4">
                    <h5>Booking Summary</h5>
                    {formData.detajetTermineve.length === 0 ? (
                      <p>No services selected.</p>
                    ) : (
                      <>
                        {formData.detajetTermineve.map((item, index) => (
                          <div key={index} className="summary-item">
                            <span>Service #{item.sherbimetId}</span>
                            <span>€{item.pagesa}</span>
                          </div>
                        ))}

                        <hr />

                        <div className="summary-total">
                          <strong>Total:</strong>
                          <strong>€{totalPrice}</strong>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button className="btn booking-btn w-100 mt-4">
                Confirm Appointment
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}