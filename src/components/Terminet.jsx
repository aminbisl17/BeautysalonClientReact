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
  const [showOtp, setShowOtp] = useState(false);

  const [otpCode, setOtpCode] = useState("");
  const [pendingBooking, setPendingBooking] = useState(null);
  const [authMode, setAuthMode] = useState(null); // "login" | "register"

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

  // ================= DATE FORMAT =================
  const formatDate = (value) => {
    if (!value) return null;
    if (value.split(":").length === 3) return value;
    if (value.split(":").length === 2) return `${value}:00`;
    return value;
  };

  // ================= PAYLOAD BUILDER =================
  const buildBookingPayload = (clientId) => ({
    clientId: Number(clientId),
    employeeId: Number(formData.employeeId),
    pershkrimi: formData.pershkrimi,
    numri_tel: formData.numri_telefonit,
    dataCaktimit: formatDate(formData.dataCaktimit),
    detajetTermineve: formData.detajetTermineve.map((s) => ({
      sherbimetId: Number(s.sherbimetId),
      atributetId: s.atributetId ? Number(s.atributetId) : null,
      kohezgjatja: Number(s.kohezgjatja),
      pagesa: Number(s.pagesa),
    })),
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
        numri_telefonit:
          user.numri_telefonit || user.numriTelefonit || "",
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

  // ================= FORM =================
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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

  // ================= PRICE =================
  const getPrice = (service) => {
    const base = service.qmimi_baze || 0;
    const discount = service.zbritja || 0;
    return base - (base * discount) / 100;
  };

  // ================= SERVICE TOGGLE =================
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
    if (!formData.employeeId)
      return alert("Zgjidh punëtorin!");
    if (!formData.dataCaktimit)
      return alert("Zgjidh datën!");
    if (!formData.detajetTermineve.length)
      return alert("Zgjidh shërbime!");

    const stored = sessionStorage.getItem("userDetails");
    const user = stored ? JSON.parse(stored) : null;

    const isLoggedIn = Boolean(user?.id);

    // ===============================
    // CASE 1: USER EXISTS → DIRECT BOOKING (NO OTP)
    // ===============================
    if (isLoggedIn) {
      const booking = buildBookingPayload(user.id || formData.clientId);

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
        }
      );

      const data = await res.text();

      if (!res.ok) {
        alert(data || "Dështoi krijimi i terminit.");
        return;
      }

      alert("Termini u krijua!");
      setView("success");
      return;
    }

    // ===============================
    // CASE 2: NEW USER → REGISTER FIRST
    // ===============================
    const registerRes = await fetch(
      "http://192.168.100.116:8000/api/clients/register",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emri: formData.emri,
          mbiemri: formData.mbiemri,
          numri_telefonit: formData.numri_telefonit,
           email: "",
          gjinia: "m",
        }),
      }
    );

    // REGISTER SUCCESS → OTP REGISTER FLOW
    if (registerRes.ok) {
      setAuthMode("register");
      setShowOtp(true);
      return;
    }

    // ===============================
    // REGISTER FAILED → LOGIN FLOW
    // ===============================
    const loginRes = await fetch(
      "http://192.168.100.116:8000/auth/login/client",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numri_telefonit: formData.numri_telefonit,
        }),
      }
    );

    if (!loginRes.ok) {
      alert("As regjistrimi as login nuk funksionuan!");
      return;
    }

    setAuthMode("login");
    setShowOtp(true);

  } catch (err) {
    console.error(err);
    alert("Gabim gjatë procesit.");
  }
};

 const verifyOtp = async (otp) => {
  try {
    console.log(authMode);
    const endpoint =
      authMode === "login"
        ? "http://192.168.100.116:8000/auth/login/client/verify"
        : "http://192.168.100.116:8000/api/clients/verify";

    const payload = {
      otpcode: otp,
      numri_telefonit: formData.numri_telefonit,
    };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert("OTP gabim!");
      return;
    }

   // const user = data.user || data;

   
      const userRes = await fetch(
        "http://192.168.100.116:8000/api/clients/data",
        {
          headers: { Authorization: `Bearer ${data.token}` },
          credentials: "include",
        }
      );

       const userInfo = await userRes.json();
    sessionStorage.setItem("userDetails", JSON.stringify(userInfo));

    // create booking after successful verification
    const booking = buildBookingPayload(userInfo.id);

    sessionStorage.setItem("accessToken", data.token);


    const resAppointment = await fetch(
      "http://192.168.100.116:8000/api/mixed/terminet/create",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:`Bearer ${data.token}`,
        },
        body: JSON.stringify(booking),
      }
    );

    if (!resAppointment.ok) {
      const err = await resAppointment.text();
      alert(err || "Dështoi krijimi i terminit.");
      return;
    }

    setShowOtp(false);
    setPendingBooking(null);
  //  setView("success");
  } catch (err) {
    console.error(err);
    alert("Gabim në OTP verification.");
  }
};

  // ================= UI =================
  return (
    <div className="termini-page">
      <div className="termini-container">

        <div className="termini-header">
          <h1>✨ Book Appointment</h1>
          <p>Zgjidh shërbime, punëtor dhe kohë</p>
        </div>

        <div className="termini-grid">

          {/* LEFT SIDE */}
          <div className="termini-form">
            <div className="form-card">

              <label>Emri</label>
              <input name="emri" value={formData.emri} onChange={handleChange} />

              <label>Mbiemri</label>
              <input name="mbiemri" value={formData.mbiemri} onChange={handleChange} />

              <label>Numri</label>
              <input name="numri_telefonit" value={formData.numri_telefonit} onChange={handleChange} />

              <label>Punëtori</label>
              <select name="employeeId" value={formData.employeeId} onChange={handleChange}>
                <option value="">Zgjidh</option>
                {employees.map((e) => (
                  <option key={e.ID} value={e.ID}>
                    {e.emri} {e.mbiemri}
                  </option>
                ))}
              </select>

              <label>Data</label>
              <input
                type="datetime-local"
                name="dataCaktimit"
                value={formData.dataCaktimit}
                onChange={handleChange}
              />

              <label>Përshkrimi</label>
              <textarea
                name="pershkrimi"
                value={formData.pershkrimi}
                onChange={handleChange}
              />
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
              <p key={i}>
                {s.name} - €{s.pagesa}
              </p>
            ))}

            <h4>Total: €{totalPrice}</h4>

            <button onClick={handleTerminetSubmit}>
              Confirm Appointment
            </button>
          </div>

        </div>
      </div>

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

      <button
        className="cancel-btn"
        onClick={() => {
          setShowOtp(false);
          setOtpCode("");
        }}
      >
        Cancel
      </button>
    </div>
  </div>
)}
    </div>
  );
}