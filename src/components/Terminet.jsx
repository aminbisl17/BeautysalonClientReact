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
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
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
      let rawPhone = user.numri_telefonit || user.numriTelefonit || "";

      if (rawPhone.startsWith("+383")) {
        rawPhone = rawPhone.replace("+383", "");
      } else if (rawPhone.startsWith("383")) {
        rawPhone = rawPhone.substring(3);
      }
      
      if (rawPhone.startsWith("0")) {
        rawPhone = rawPhone.substring(1);
      }

      setFormData((prev) => ({
        ...prev,
        clientId: user.id || null,
        emri: user.emri || "",
        mbiemri: user.mbiemri || "",
        numri_telefonit: rawPhone.trim(),
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

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

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
      if (!formData.employeeId) return alert("Zgjidhni punëtorin!");
      if (!formData.dataCaktimit) return alert("Zgjidhni datën!");
      if (!formData.detajetTermineve.length) return alert("Zgjidhni të paktën një shërbim!");

      const stored = sessionStorage.getItem("userDetails");
      const user = stored ? JSON.parse(stored) : null;
      const isLoggedIn = Boolean(user?.id);

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

        alert("Termini u krijua me sukses!");
        setView("success");
        return;
      }

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

      if (registerRes.ok) {
        setAuthMode("register");
        setShowOtp(true);
        return;
      }

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
        alert("As regjistrimi dhe as kyçja (login) nuk funksionuan!");
        return;
      }

      setAuthMode("login");
      setShowOtp(true);
    } catch (err) {
      console.error(err);
      alert("Ndodhi një gabim gjatë procesit.");
    }
  };

  const verifyOtp = async (otp) => {
    try {
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
        alert("Kodi OTP është gabim!");
        return;
      }

      const userRes = await fetch(
        "http://192.168.100.116:8000/api/clients/data",
        {
          headers: { Authorization: `Bearer ${data.token}` },
          credentials: "include",
        }
      );

      const userInfo = await userRes.json();
      sessionStorage.setItem("userDetails", JSON.stringify(userInfo));
      const booking = buildBookingPayload(userInfo.id);
      sessionStorage.setItem("accessToken", data.token);

      const resAppointment = await fetch(
        "http://192.168.100.116:8000/api/mixed/terminet/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${data.token}`,
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
      setView("success");
    } catch (err) {
      console.error(err);
      alert("Gabim gjatë verifikimit të OTP-së.");
    }
  };

  return (
    <div className="termini-page">
      <div className="termini-container">
        
        <div className="termini-header">
          <h1>✨ Rezervo një Termini</h1>
          <p>Kujdesuni për veten me një seancë bukurie luksoze. Zgjidhni shërbimin, stilistin dhe kohën tuaj.</p>
        </div>

        <div className="termini-grid">
          
          {/* LEFT COLUMN: Input Info & Service Selector */}
          <div className="termini-main-content">
            
            <div className="form-section-card">
              <h2 className="section-title">1. Të dhënat tuaja personale</h2>
              <div className="input-group-grid">
                <div className="input-box">
                  <label>Emri</label>
                  <input name="emri" value={formData.emri} onChange={handleChange} placeholder="Filan" />
                </div>
                
                <div className="input-box">
                  <label>Mbiemri</label>
                  <input name="mbiemri" value={formData.mbiemri} onChange={handleChange} placeholder="Fisteku" />
                </div>
              </div>

              <div className="input-box">
                <label>Numri i telefonit</label>
                <div className="phone-input-wrapper">
                  <span className="phone-prefix">+383</span>
                  <input
                    type="text"
                    name="numri_telefonit"
                    value={formData.numri_telefonit}
                    onChange={(e) => {
                      let value = e.target.value.replace(/\D/g, "");
                      if (value.startsWith("0")) value = value.substring(1);
                      value = value.slice(0, 8);
                      setFormData((prev) => ({ ...prev, numri_telefonit: value }));
                    }}
                    placeholder="4xxxxxxx"
                    required
                  />
                </div>
              </div>

              <div className="input-group-grid">
                <div className="input-box">
                  <label>Zgjidhni Stilistin</label>
                  <select name="employeeId" value={formData.employeeId} onChange={handleChange}>
                    <option value="">Zgjidhni një anëtar të stafit</option>
                    {employees.map((e) => (
                      <option key={e.ID} value={e.ID}>
                        {e.emri} {e.mbiemri}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="input-box">
                  <label>Data dhe Ora e Preferuar</label>
                  <input
                    type="datetime-local"
                    name="dataCaktimit"
                    value={formData.dataCaktimit}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="input-box">
                <label>Shënime të Veçanta / Përshkrimi</label>
                <textarea
                  name="pershkrimi"
                  value={formData.pershkrimi}
                  onChange={handleChange}
                  placeholder="Çfarëdo preference apo kushti që duhet të dimë?"
                />
              </div>
            </div>

            {/* SERVICES CARD */}
            <div className="form-section-card">
              <div className="services-section-header">
                <h2 className="section-title">2. Zgjidhni Shërbimet</h2>
                <input 
                  type="text" 
                  className="services-search"
                  placeholder="🔍 Kërko flokë, thonj, grim..."
                  value={search}
                  onChange={handleSearch}
                />
              </div>

              {loading ? (
                <div className="spinner-wrapper"><div className="spinner"></div><p>Duke ngarkuar katalogun...</p></div>
              ) : (
                <div className="services-modern-grid">
                  {filtered.map((s) => {
                    const isSelected = formData.detajetTermineve.some((item) => item.sherbimetId === s.ID);
                    return (
                      <div
                        key={s.ID}
                        className={`service-modern-card ${isSelected ? "selected" : ""}`}
                        onClick={() => handleServiceToggle(s)}
                      >
                        <div className="service-image-container">
                          <img 
                            src={s.imageURL || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop"} 
                            alt={s.emri_sherbimit} 
                            onError={(e) => {
                              e.target.src = "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop";
                            }}
                          />
                          {isSelected && <div className="selected-badge">✓</div>}
                        </div>
                        <div className="service-details">
                          <h4>{s.emri_sherbimit}</h4>
                          <div className="service-meta">
                            <span className="duration">⏱ {s.kohezgjatja || 30} min</span>
                            <span className="price">€{getPrice(s)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Modern Floating Summary Widget */}
          <div className="termini-sidebar">
            <div className="summary-widget">
              <h3>Përmbledhja e Terminit</h3>
              
              {formData.detajetTermineve.length === 0 ? (
                <p className="empty-summary-text">Asnjë shërbim nuk është zgjedhur ende. Ju lutemi klikoni mbi kartat e shërbimeve për të krijuar seancën tuaj.</p>
              ) : (
                <div className="summary-items-list">
                  {formData.detajetTermineve.map((s, i) => (
                    <div key={i} className="summary-item">
                      <span>{s.name}</span>
                      <strong>€{s.pagesa}</strong>
                    </div>
                  ))}
                </div>
              )}

              <div className="summary-divider"></div>

              <div className="summary-total">
                <span>Totali i Përgjithshëm</span>
                <span className="total-amount">€{totalPrice}</span>
              </div>

              <button className="book-now-btn" onClick={handleTerminetSubmit}>
                Konfirmo Terminin
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* MODERN OTP MODAL */}
      {showOtp && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>Verifikimi i Sigurisë</h2>
            <p>Ne kemi dërguar një kod verifikimi në numrin tuaj të celularit.</p>

            <div className="otp-container-slot">
              <OtpInput value={otpCode} onChange={setOtpCode} onComplete={verifyOtp} />
            </div>

            <button
              className="cancel-btn"
              onClick={() => {
                setShowOtp(false);
                setOtpCode("");
              }}
            >
              Anulo
            </button>
          </div>
        </div>
      )}
    </div>
  );
}