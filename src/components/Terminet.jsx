import { useEffect, useState } from "react";
import "../css/terminet.css";
import { fetchServices, fetchServiceAtributes } from "../javascript/APIs/ServicesAPI";
import { fetchEmployees } from "../javascript/APIs/EmployeesAPI";
import { ExceptionHandler } from "../javascript/Exceptions/ExceptionHandler";
import OtpInput from "../components/OTPVerificationDialogue";

export default function Termini({ setView }) {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);

  // FIX: Storing full roster in employeesList, and the chosen individual in selectedEmployeeData
  const [employeesList, setEmployeesList] = useState([]);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [authMode, setAuthMode] = useState(null); // "login" | "register"

  // Configurator Drawer States
  const [selectedService, setSelectedService] = useState(null);
  const [attributeSearch, setAttributeSearch] = useState("");
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState([]); // Array of IDs: e.g., [1, 4]
  const [attributesList, setAttributesList] = useState([]);

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

  const formatDate = (value) => {
    if (!value) return null;
    if (value.split(":").length === 3) return value;
    if (value.split(":").length === 2) return `${value}:00`;
    return value;
  };

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

  // FIX: Fixed state setter mutation mix-up here
  const handleEmployeeChange = (e) => {
    const chosenId = Number(e.target.value);

    setFormData((prev) => ({ ...prev, employeeId: chosenId }));

    const matchedStaff = employeesList.find((emp) => emp.ID === chosenId);
    setSelectedEmployeeData(matchedStaff || null);
  };

  // FIX: Set the fetched roster list into employeesList instead of preview placeholder
  async function loadEmployees() {
    try {
      const data = await fetchEmployees();
      setEmployeesList(data || []);
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

  const handleServiceCardClick = async (service) => {
    const exists = formData.detajetTermineve.find(
      (s) => s.sherbimetId === service.ID
    );

    if (exists) {
      setFormData((prev) => ({
        ...prev,
        detajetTermineve: prev.detajetTermineve.filter(
          (s) => s.sherbimetId !== service.ID
        ),
      }));
    } else {
      setSelectedService(service);
      setSelectedAttributes([]);
      setAttributeSearch("");
      setAttributesList([]);
      setLoadingAttributes(true);

      try {
        const data = await fetchServiceAtributes(service.ID);
        setAttributesList(data?.atributet || data || []);
      } catch (err) {
        console.error("Gabim gjatë marrjes së atributeve:", err);
        setAttributesList([]);
      } finally {
        setLoadingAttributes(false);
      }
    }
  };

const handleConfirmSelection = (item) => { setFormData((prev) => ({ ...prev, detajetTermineve: [...prev.detajetTermineve, item], })); setSelectedService(null); }; const closeDialog = () => { setSelectedService(null); }; const totalPrice = formData.detajetTermineve.reduce( (sum, item) => sum + item.pagesa, 0 );


  const handleTerminetSubmit = async () => {
    try {
      if (!formData.employeeId) return alert("Zgjidhni punëtorin!");
      if (!formData.dataCaktimit) return alert("Zgjidhni datën!");
      if (!formData.detajetTermineve.length)
        return alert("Zgjidhni të paktën një shërbim!");

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
        numri_telefonit: `+383${formData.numri_telefonit}`,
      };

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const data = await res.json().catch(() => ({}));

      console.log(authMode + ' ' + formData.numri_telefonit + ' ' + data.token);
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
      setView("home");
    } catch (err) {
      console.error(err);
      alert("Gabim gjatë verifikimit të OTP-së.");
    }
  };

  const toggleAttribute = (id) => {
    setSelectedAttributes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="termini-page">
      <div className="termini-container">
        <div className="termini-header">
          <h1>
            REZERVO NJË <span className="title-serif">Termin</span>
          </h1>
          <p>
            Zgjidhni shërbimet tuaja, stafin e preferuar dhe kohën ideale për
            trajtimin tuaj.
          </p>
        </div>

        <div className="termini-grid">
          {/* LEFT COLUMN */}
          <div className="termini-main-content">
            {/* Seksioni 01: Detajet Personale */}
            <div className="form-section-card">
              <h2 className="section-title">01. Detajet Personale</h2>
              <div className="input-group-grid">
                <div className="input-box">
                  <label>Emri</label>
                  <input
                    name="emri"
                    value={formData.emri}
                    onChange={handleChange}
                    placeholder="Filan"
                  />
                </div>
                <div className="input-box">
                  <label>Mbiemri</label>
                  <input
                    name="mbiemri"
                    value={formData.mbiemri}
                    onChange={handleChange}
                    placeholder="Fisteku"
                  />
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
                      setFormData((prev) => ({
                        ...prev,
                        numri_telefonit: value,
                      }));
                    }}
                    placeholder="4xxxxxxx"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Seksioni: Zgjedh Stafin */}
            <div className="form-section-card">
              <h3 className="section-title">Zgjedh Stafin</h3>
              <div className="input-box">
                <label>Stafi i disponueshëm</label>
                <select
                  value={formData.employeeId || ""}
                  onChange={handleEmployeeChange}
                >
                  <option value="">Zgjedh një profesionist...</option>
                  {employeesList.map((emp) => (
                    <option key={emp.ID} value={emp.ID}>
                      {emp.emri} {emp.mbiemri}
                    </option>
                  ))}
                </select>
              </div>

              {/* DYNAMIC EMPLOYEE PROFILE CARD */}
              {selectedEmployeeData && (
                <div className="employee-profile-preview animate-fade-in">
                  <div className="employee-avatar-badge">
                    {selectedEmployeeData.emri?.charAt(0)}
                    {selectedEmployeeData.mbiemri?.charAt(0)}
                  </div>
                  <div className="employee-profile-info">
                    <h4>
                      {selectedEmployeeData.emri} {selectedEmployeeData.mbiemri}
                    </h4>
                    <span className="employee-role-tag">
                      Specialist i Çertifikuar
                    </span>
                    <p className="employee-bio">
                      {selectedEmployeeData.pershkrimi || ""}
                    </p>
                    <div className="employee-contact-meta">
                      <div className="meta-item">
                        <span className="meta-label">Telefon:</span>
                        <span className="meta-value">
                          {selectedEmployeeData.numri_telefonit}
                        </span>
                      </div>
                      <div className="meta-item">
                        <span className="meta-label">Email:</span>
                        <span className="meta-value">
                          {selectedEmployeeData.email}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Seksioni: Data, Ora dhe Shënimet */}
        <div className="form-section-card">
  <label className="section-title">Data dhe Ora</label>

  <div className="datetime-grid">
    {/* DATE */}
    <div className="input-box">
      <label>Data</label>
      <input
        type="date"
        name="data"
        value={formData.data}
        onChange={handleChange}
      />
    </div>

    {/* TIME */}
    <div className="input-box">
      <label>Ora</label>
      <input
        type="time"
        name="ora"
        value={formData.ora}
        onChange={handleChange}
      />
    </div>
  </div>


              <div className="input-box">
                <label>Shënime Specifike</label>
                <textarea
                  name="pershkrimi"
                  value={formData.pershkrimi}
                  onChange={handleChange}
                  placeholder="Shkruani çfarëdo preference ose kërkese të veçantë këtu..."
                />
              </div>
            </div>

            {/* SERVICES CARD */}
            <div className="form-section-card">
              <div className="services-section-header">
                <h2 className="section-title">02. Përzgjedhja e Shërbimeve</h2>
                <div className="search-wrapper">
                  <input
                    type="text"
                    className="services-search"
                    placeholder="KËRKO SHËRBIMIN..."
                    value={search}
                    onChange={handleSearch}
                  />
                </div>
              </div>

              {loading ? (
                <div className="spinner-wrapper">
                  <div className="spinner"></div>
                  <p>Duke ngarkuar katalogun...</p>
                </div>
              ) : (
                <div className="services-modern-grid">
                  {filtered.map((s) => {
                    const isSelected = formData.detajetTermineve.some(
                      (item) => item.sherbimetId === s.ID
                    );
                    return (
                      <div
                        key={s.ID}
                        className={`service-modern-card ${
                          isSelected ? "selected" : ""
                        }`}
                        onClick={() => handleServiceCardClick(s)}
                      >
                        <div className="service-image-container">
                          <img
                            src={
                              s.imageURL ||
                              "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop"
                            }
                            alt={s.emri_sherbimit}
                            onError={(e) => {
                              e.target.src =
                                "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop";
                            }}
                          />
                          {isSelected && (
                            <div className="selected-indicator">
                              <span>ZGJEDHUR</span>
                            </div>
                          )}
                        </div>
                        <div className="service-details">
                          <h4>{s.emri_sherbimit}</h4>
                          <div className="service-meta">
                            <span className="duration">
                              {s.kohezgjatja || 30} MIN
                            </span>
                            <span className="price">
                              EUR {getPrice(s).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN SIDEBAR */}
          <div className="termini-sidebar">
            <div className="summary-widget">
              <h3>PËRMBLEDHJA</h3>
              {formData.detajetTermineve.length === 0 ? (
                <p className="empty-summary-text">
                  Asnjë shërbim nuk është përzgjedhur. Klikoni mbi shërbimet e
                  mësipërme për të ndërtuar seancën tuaj.
                </p>
              ) : (
                <div className="summary-items-list">
                  {formData.detajetTermineve.map((s, i) => (
                    <div key={i} className="summary-item">
                      <span className="summary-item-name">{s.name}</span>
                      <span className="summary-item-price">
                        EUR {Number(s.pagesa).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="summary-divider"></div>
              <div className="summary-total">
                <span>TOTALI</span>
                <span className="total-amount">
                  EUR {totalPrice.toFixed(2)}
                </span>
              </div>

              <button
                className="book-now-btn"
                onClick={handleTerminetSubmit}
              >
                KONFIRMO REZERVIMIN
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DYNAMIC EDITORIAL CONFIGURATOR SIDE SHEET */}
  {selectedService && (
  <div className="custom-modal-overlay" onClick={closeDialog}>
    <div
      className="custom-modal-sheet"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="custom-modal-header">
        <div>
          <span className="custom-modal-subtitle">Configurimi i Shërbimit</span>
          <h3 className="custom-modal-title">{selectedService.emri_sherbimit}</h3>
        </div>

        <button
          className="custom-modal-close-btn"
          onClick={closeDialog}
        >
          ✕
        </button>
      </div>

      <div className="custom-modal-body">
        <div className="custom-modal-hero-wrapper">
          <img
            src={selectedService.imageURL}
            className="custom-modal-hero-img"
            alt={selectedService.emri_sherbimit}
          />
        </div>

        {selectedService.pershkrimi && (
          <p className="custom-modal-description">
            {selectedService.pershkrimi}
          </p>
        )}

        <div className="custom-modal-metrics">
          <div className="custom-modal-metric-pill">
            <label>ÇMIMI BAZË</label>
            <span>EUR {getPrice(selectedService).toFixed(2)}</span>
          </div>

          <div className="custom-modal-metric-pill">
            <label>KOHËZGJATJA</label>
            <span>{selectedService.kohezgjatja || 30} MIN</span>
          </div>
        </div>

        <h4 className="custom-modal-section-title">
          Zgjidhni Atributet / Variantet
        </h4>

        <div className="custom-modal-searchbar">
          <input
            type="text"
            placeholder="KËRKO ME EMËR..."
            value={attributeSearch}
            onChange={(e) => setAttributeSearch(e.target.value)}
          />
        </div>

<div className="custom-modal-attributes-list">
  {attributesList
    .filter((attr) =>
      attr.opsioni
        ?.toLowerCase()
        .includes(attributeSearch.toLowerCase())
    )
    .map((attr) => {
      const basePrice = Number(attr.qmimi || 0);
      const discount = Number(attr.zbritja || 0);
      const activePrice =
        basePrice - (basePrice * discount) / 100;

      const isSelected = selectedAttributes.includes(
        attr.id_atributit
      );

      return (
        <div
          className={`custom-modal-attr-card ${
            isSelected ? "selected" : ""
          }`}
          key={attr.id_atributit}
          onClick={() => toggleAttribute(attr.id_atributit)}
        >
          <div className="custom-modal-attr-left">
            <h5>{attr.opsioni}</h5>
          </div>

          <div className="custom-modal-attr-right">
            <span className="custom-modal-attr-price">
              EUR {activePrice.toFixed(2)}
            </span>
          </div>
        </div>
      );
    })}
</div>
      </div>

      <div className="custom-modal-footer">
      <button
  className="custom-modal-btn custom-modal-btn-primary"
  onClick={() => {
    // if no attribute selected, add base service
    if (selectedAttributes.length === 0) {
      handleConfirmSelection({
        sherbimetId: selectedService.ID,
        atributetId: null,
        kohezgjatja: selectedService.kohezgjatja || 30,
        pagesa: getPrice(selectedService),
        name: selectedService.emri_sherbimit,
      });
      return;
    }

    // add one item for each selected attribute
    selectedAttributes.forEach((attrId) => {
      const attr = attributesList.find(
        (a) => a.id_atributit === attrId
      );

      if (attr) {
        const basePrice = Number(attr.qmimi || 0);
        const discount = Number(attr.zbritja || 0);
        const activePrice =
          basePrice - (basePrice * discount) / 100;

        handleConfirmSelection({
          sherbimetId: selectedService.ID,
          atributetId: attr.id_atributit,
          kohezgjatja:
            Number(attr.kohezgjatja) ||
            Number(selectedService.kohezgjatja) ||
            30,
          pagesa: activePrice,
          name: `${selectedService.emri_sherbimit} - ${attr.opsioni}`,
        });
      }
    });
  }}
>
  SHTO NË REZERVIM
</button>
      </div>
    </div>
  </div>
)}

      {/* OTP AUTHENTICATION DIALOGUE MODAL */}
      {showOtp && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h2>VERIFIKIMI</h2>
            <p>Kodi i sigurisë është dërguar në numrin tuaj të telefonit.</p>
            <div className="otp-container-slot">
              <OtpInput
                value={otpCode}
                onChange={setOtpCode}
                onComplete={verifyOtp}
              />
            </div>
            <button
              className="cancel-btn"
              onClick={() => {
                setShowOtp(false);
                setOtpCode("");
              }}
            >
              ANULO
            </button>
          </div>
        </div>
      )}
    </div>
  );
}