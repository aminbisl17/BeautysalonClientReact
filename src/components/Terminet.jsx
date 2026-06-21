import { useEffect, useState } from "react";
import "../css/Termini.css";
import { fetchServices } from "../javascript/APIs/ServicesAPI";
import { fetchEmployees } from "../javascript/APIs/EmployeesAPI";
import { ExceptionHandler } from "../javascript/Exceptions/ExceptionHandler";
import OtpInput from "../components/OTPVerificationDialogue";

export default function Termini({ setView }) {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [employees, setEmployees] = useState([]);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
const [showConfirm, setShowConfirm] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);

  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [pendingBooking, setPendingBooking] = useState(null);
  const [authMode, setAuthMode] = useState(null);

  const [formData, setFormData] = useState({
    clientId: null,
    emri: "",
    mbiemri: "",
    numri_telefonit: "",
    employeeId: "",
    pershkrimi: "",
    dataCaktimit: "",
    detajetTermineve: [],
  });

  // ================= LOAD =================
  useEffect(() => {
    const storedUser = sessionStorage.getItem("userDetails");

    if (storedUser) {
      const user = JSON.parse(storedUser);

      setFormData((prev) => ({
        ...prev,
        clientId: user.id || null,
        emri: user.emri || "",
        mbiemri: user.mbiemri || "",
        numri_telefonit: user.numriTelefonit || "",
      }));
    }

    loadEmployees();
    loadServices();
  }, []);

  async function loadEmployees() {
    try {
      const data = await fetchEmployees();
      setEmployees(data || []);
    } catch (err) {
      ExceptionHandler(err);
    }
  }

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

  // ================= SEARCH =================
  const handleSearch = (e) => {
    const value = e.target.value;
    setSearch(value);

    if (!value.trim()) return setFiltered(services);

    setFiltered(
      services.filter((s) =>
        s.emri_sherbimit?.toLowerCase().includes(value.toLowerCase())
      )
    );
  };

  // ================= FORM =================
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };


  const createAppointment = async (booking) => {
  try {
    const token = sessionStorage.getItem("accessToken");

console.log(token);

const res = await fetch(
  "http://192.168.100.116:8000/api/mixed/terminet/create",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(booking),
    credentials: "include",
  }
);
    const text = await res.text();

    if (!res.ok) {
      alert(text || "Failed to create appointment");
      return;
    }

    alert("Termini u krijua!");
    setView("success");

  } catch (err) {
    console.error(err);
  }
};
  // ================= PRICE =================
  const getPrice = (service) => {
    const base = service.qmimi_baze || 0;
    const discount = service.zbritja || 0;
    return base - (base * discount) / 100;
  };

  // ================= SERVICES =================
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
          },
        ],
      }));
    }
  };

  const totalPrice = formData.detajetTermineve.reduce(
    (sum, item) => sum + item.pagesa,
    0
  );
const handleTerminetSubmit = async () => {
  try {
    const storedUser = sessionStorage.getItem("userDetails");
    const token = sessionStorage.getItem("accessToken");

    let user = storedUser ? JSON.parse(storedUser) : null;

    // =========================
    // IF USER EXISTS → SKIP OTP
    // =========================
    if (user?.id || formData.clientId) {
      const booking = {
        clientId: user.id,
        employeeId: formData.employeeId,
        pershkrimi: formData.pershkrimi,
        numri_tel: `+383${formData.numri_telefonit}`,
        dataCaktimit: formData.dataCaktimit,
        detajetTermineve: formData.detajetTermineve,
      };

      setPendingBooking(booking);
      setShowConfirm(true);
      return;
    }

    // =========================
    // NO USER → REGISTER FIRST
    // =========================
    const payload = {
      emri: formData.emri,
      mbiemri: formData.mbiemri,
      numri_telefonit: formData.numri_telefonit,
      gjinia: "m",
    };

    let res = await fetch(
      "http://192.168.100.116:8000/api/clients/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      }
    );

    let data = await res.json();

    if (!res.ok && data?.message?.includes("exists")) {
      res = await fetch(
        "http://192.168.100.116:8000/auth/login/client",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            numri_telefonit: `+383${formData.numri_telefonit}`,
          }),
          credentials: "include",
        }
      );

      data = await res.json();
    }

    if (!res.ok) {
      alert("Auth failed");
      return;
    }

    const newUser = data.user || data;

    sessionStorage.setItem("userDetails", JSON.stringify(newUser));

    const booking = {
      clientId: newUser.id,
      employeeId: formData.employeeId,
      pershkrimi: formData.pershkrimi,
      numri_tel: `+383${formData.numri_telefonit}`,
      dataCaktimit: formData.dataCaktimit,
      detajetTermineve: formData.detajetTermineve,
    };

    setPendingBooking(booking);

    setAuthMode("register");
    setShowOtp(true);
  } catch (err) {
    console.error(err);
    alert("Error");
  }
};
  // ================= OTP VERIFY =================
  const verifyOtp = async (otp) => {
    try {
      let user = JSON.parse(sessionStorage.getItem("userDetails"));

      if (authMode === "register") {
        const res = await fetch(
          "http://192.168.100.116:8000/api/clients/verify",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              otpcode: otp,
              numri_telefonit: `+383${formData.numri_telefonit}`,
            }),
            credentials: "include",
          }
        );

        const data = await res.json();
        if (!res.ok) return;

        user = data;
        sessionStorage.setItem("userDetails", JSON.stringify(user));
      }

      if (authMode === "login") {
        const token = sessionStorage.getItem("accessToken");

        const res = await fetch(
          "http://192.168.100.116:8000/api/clients/data",
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }
        );

        user = await res.json();
        sessionStorage.setItem("userDetails", JSON.stringify(user));
      }

      // CREATE APPOINTMENT
      const dto = {
        clientId: user.id,
        employeeId: pendingBooking.employeeId,
        pershkrimi: pendingBooking.pershkrimi,
        numri_tel: pendingBooking.numri_tel,
        dataCaktimit: pendingBooking.dataCaktimit,
        detajetTermineve: pendingBooking.detajetTermineve,
      };
const token = sessionStorage.getItem("accessToken");

console.log(token);

const res = await fetch(
  "http://192.168.100.116:8000/api/mixed/terminet/create",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: token ? `Bearer ${token}` : "",
    },
    body: JSON.stringify(dto),
    credentials: "include",
  }
);
      if (!res.ok) return;

      setShowOtp(false);
      setPendingBooking(null);

      alert("Termini u krijua!");
      setView("success");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="termini-page">
      <div className="termini-container">

        {/* HEADER */}
        <div className="termini-header">
          <h1>✨ Book Your Appointment</h1>
          <p>Select services, time & stylist in seconds</p>
        </div>

        <div className="termini-grid">

          {/* LEFT SIDE */}
          <div className="termini-form">

            <div className="form-card">

              <label>👤 Emri</label>
              <input name="emri" value={formData.emri} onChange={handleChange} />

              <label>👤 Mbiemri</label>
              <input name="mbiemri" value={formData.mbiemri} onChange={handleChange} />

              <label>📞 Numri</label>
              <input name="numri_telefonit" value={formData.numri_telefonit} onChange={handleChange} />

              <label>📅 Date</label>
              <input type="datetime-local" name="dataCaktimit" value={formData.dataCaktimit} onChange={handleChange} />

              <label>📝 Notes</label>
              <textarea name="pershkrimi" value={formData.pershkrimi} onChange={handleChange} />

            </div>

            <h3>Services</h3>

            {loading ? (
              <p>Loading...</p>
            ) : (
              <div className="services-grid">
                {filtered.map((s) => (
                  <div
                    key={s.ID}
                    className="service-card"
                    onClick={() => handleServiceToggle(s)}
                  >
                    <h4>{s.emri_sherbimit}</h4>
                    <p>€{getPrice(s)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDE */}
          <div className="termini-summary">

            <h3>Summary</h3>

            {formData.detajetTermineve.map((s, i) => (
              <p key={i}>{s.name} - €{s.pagesa}</p>
            ))}

            <h4>Total: €{totalPrice}</h4>

            <button className="confirm-btn" onClick={handleTerminetSubmit}>
              Confirm Appointment
            </button>

          </div>
        </div>
      </div>

{showConfirm && (
  <div className="modal-overlay">
    <div className="modal-box">
      <h2>Confirm Appointment</h2>

      <p>Are you sure you want to book this appointment?</p>

      <button
        onClick={() => {
          createAppointment(pendingBooking);
          setShowConfirm(false);
        }}
      >
        Yes
      </button>

      <button onClick={() => setShowConfirm(false)}>
        Cancel
      </button>
    </div>
  </div>
)}
      {/* OTP MODAL */}
      {showOtp && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Verify OTP</h2>

            <OtpInput
              value={otpCode}
              onChange={setOtpCode}
              onComplete={verifyOtp}
            />
          </div>
        </div>
      )}

      {/* EMPLOYEE MODAL */}
      {showEmployeeModal && selectedEmployee && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Employee</h2>
            <p>{selectedEmployee.emri}</p>
            <button onClick={() => setShowEmployeeModal(false)}>Close</button>
          </div>
        </div>
      )}

    </div>
  );
}