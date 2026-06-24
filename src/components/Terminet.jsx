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

      const [data, setData] = useState(null);
  const [formData, setFormData] = useState({
    clientId: null,
    emri: "",
    mbiemri: "",
    numri_telefonit: "",
    employeeId: "", // Tracks selected employee ID
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
        numri_telefonit: user.numri_telefonit || user.numriTelefonit || "",
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
      ExceptionHandler.handle(err);
    }
  }

  async function loadServices() {
    try {
      setLoading(true);
      const data = await fetchServices();
      setServices(data);
      setFiltered(data);
    } catch (err) {
      ExceptionHandler.handle(err);
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
      alert("Error parsing appointment response.");
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

  // ================= SUBMIT PIPELINE =================
  const handleTerminetSubmit = async () => {
    try {
      // 1. Core Front-End Input Validation
      if (!formData.employeeId || formData.employeeId === "") {
        alert("Ju lutem zgjedhni një punëtor!");
        return;
      }
      if (!formData.dataCaktimit) {
        alert("Ju lutem zgjedhni datën dhe kohën!");
        return;
      }
      if (formData.detajetTermineve.length === 0) {
        alert("Ju lutem zgjedhni të paktën një shërbim!");
        return;
      }

      const storedUser = sessionStorage.getItem("userDetails");
      let user = storedUser ? JSON.parse(storedUser) : null;

      // 2. Normalizer: Appends seconds string to HTML datetime format so Spring ISO parser survives
      let formattedDate = formData.dataCaktimit;
      if (formattedDate && formattedDate.split(":").length === 2) {
        formattedDate += ":00";
      }

      // Payload building helper to maintain consistent structures
      const buildBookingPayload = (targetClientId) => ({
        clientId: Number(targetClientId),
        employeeId: Number(formData.employeeId),
        pershkrimi: formData.pershkrimi,
        numri_tel: `+383${formData.numri_telefonit}`,
        dataCaktimit: formattedDate,
        detajetTermineve: formData.detajetTermineve.map(s => ({
          sherbimetId: s.sherbimetId,
          atributetId: s.atributetId,
          kohezgjatja: s.kohezgjatja,
          pagesa: s.pagesa
        })),
      });

      // =====================================
      // IF USER ALREADY LOGGED IN → SKIP OTP
      // =====================================
      if (user?.id || formData.clientId) {
        const booking = buildBookingPayload(user?.id || formData.clientId);
        setPendingBooking(booking);
        setShowConfirm(true);
        return;
      }

      // =====================================
      // NO USER → REGISTER / LOGIN PIPELINE
      // =====================================
      const payload = {
        emri: formData.emri,
        mbiemri: formData.mbiemri,
        numri_telefonit: formData.numri_telefonit,
        gjinia: "m",
      };

      let res = await fetch("http://192.168.100.116:8000/api/clients/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      // If user exists, transition smoothly over into verification login sequence
      if (!res.ok && res.status == 400) {
        res = await fetch("http://192.168.100.116:8000/auth/login/client", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            numri_telefonit: `+383${formData.numri_telefonit}`,
          }),
          credentials: "include",
        });

      setData(await res.json());
      }

        // data = await res.json();

      if (!res.ok) {
        alert("Autentikimi dështoi!");
        return;
      }

      const newUser = data.user || data;
      sessionStorage.setItem("userDetails", JSON.stringify(newUser));

      // Fixed: Passing newUser.id directly to dynamic builder safely
      const booking = buildBookingPayload(newUser.id);
      
      setPendingBooking(booking);
      setAuthMode("register");
      setShowOtp(true);
    } catch (err) {
      console.error(err);
      alert("Ndodhi një gabim gjatë procesimit.");
    }
  };

  // ================= OTP VERIFY =================

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
        if (!res.ok) {
          alert("Kodi OTP i pasaktë!");
          return;
        }

        user = data;
        sessionStorage.setItem("userDetails", JSON.stringify(user));
      }

      // Format date right here to protect against state loss
      let formattedDate = formData.dataCaktimit;
      if (formattedDate && formattedDate.split(":").length === 2) {
        formattedDate += ":00";
      }

      // SAFE & DIRECT MAPPING: Pull fresh variables directly from formData 
      // instead of risking stale data inside pendingBooking state
      const dto = {
        clientId: Number(user?.id || user?.ID || formData.clientId),
        employeeId: Number(formData.employeeId),
        pershkrimi: formData.pershkrimi,
        numri_tel: `+383${formData.numri_telefonit}`, // Hardcoded fallback match to your DTO field
        dataCaktimit: formattedDate,
        detajetTermineve: formData.detajetTermineve.map(s => ({
          sherbimetId: Number(s.sherbimetId),
          atributetId: s.atributetId ? Number(s.atributetId) : null,
          kohezgjatja: Number(s.kohezgjatja),
          pagesa: Number(s.pagesa)
        })),
      };

      const token = sessionStorage.getItem("accessToken");

      const resAppointment = await fetch(
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

      if (!resAppointment.ok) {
        const errText = await resAppointment.text();
        alert(errText || "Dështoi krijimi i terminit.");
        return;
      }

      setShowOtp(false);
      setPendingBooking(null);

      alert("Termini u krijua!");
      setView("success");
    } catch (err) {
      console.error("Error inside verifyOtp workflow: ", err);
      alert("Ndodhi një gabim gjatë verifikimit të OTP.");
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

              {/* EMPLOYEE SELECT DROPDOWN */}
              <label>💇‍♂️ Zgjidh Punëtorin (Stylist)</label>
              <select 
                name="employeeId" 
                value={formData.employeeId} 
                onChange={handleChange}
                className="employee-select"
              >
                <option value="">-- Zgjidh Punëtorin --</option>
                {employees.map((emp) => (
                  <option key={emp.ID} value={emp.ID}>
                    {emp.emri} {emp.mbiemri}
                  </option>
                ))}
              </select>

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
            <button onClick={() => setShowConfirm(false)}>Cancel</button>
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
    </div>
  );
}