import { useEffect, useState, useRef } from "react";
import "../css/terminet.css";
import {
  fetchServices,
  fetchServiceAtributes,
} from "../javascript/APIs/ServicesAPI";
import { fetchEmployees } from "../javascript/APIs/EmployeesAPI";
import { ExceptionHandler } from "../javascript/Exceptions/ExceptionHandler";
import OtpInput from "../components/OTPVerificationDialogue";
import AppointmentDateTimePicker from "./CustomizedCalendar";

export default function Termini({ setView }) {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingEmployeeId, setPendingEmployeeId] = useState(null);
  const [employeesList, setEmployeesList] = useState([]);
  const [selectedEmployeeData, setSelectedEmployeeData] = useState(null);
  const [selectedAvailability, setSelectedAvailability] = useState(null);
const [fieldErrors, setFieldErrors] = useState({
  emri: false,
  mbiemri: false,
  numri_telefonit: false,
});
  // Ruajmë të dhënat e disponueshmërisë të kthyeshme nga API
  const [employeeAvailability, setEmployeeAvailability] = useState(null);

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [otpCode, setOtpCode] = useState("");

  // Configurator Drawer States
  const [selectedService, setSelectedService] = useState(null);
  const [selectedAttribute, setSelecedAttribute] = useState(null);
  const [attributeSearch, setAttributeSearch] = useState("");
  const [loadingAttributes, setLoadingAttributes] = useState(false);
  const [selectedAttributes, setSelectedAttributes] = useState([]);
  const [attributesList, setAttributesList] = useState([]);
  
  const tempDateRef = useRef("");
  const tempTimeRef = useRef("");

  const [formData, setFormData] = useState({
    clientId: null,
    emri: "",
    mbiemri: "",
    numri_telefonit: "",
    email: "",
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
        email: user.email || "",
        numri_telefonit: rawPhone.trim(),
      }));
    }

    loadEmployees();
  }, []);

  
  const handleEmployeeChange = async (e) => {
  const chosenId = Number(e.target.value);

  // Clear services immediately so old employee data vanishes instantly
  setServices([]);
  setFiltered([]);
  setEmployeeAvailability(null);

  if (!chosenId) {
    setFormData((prev) => ({ ...prev, employeeId: "", detajetTermineve: [] }));
    setSelectedEmployeeData(null);
    return;
  }

  const token = sessionStorage.getItem("accessToken");

  // If already authenticated, proceed as usual
  if (token) {
    setFormData((prev) => ({ ...prev, employeeId: chosenId, detajetTermineve: [] }));
    const matchedStaff = employeesList.find((emp) => Number(emp.ID) === chosenId || Number(emp.id) === chosenId);
    setSelectedEmployeeData(matchedStaff || null);
    await fetchEmployeeDetails(chosenId, token);
    return;
  }

  // --- UNAUTHENTICATED FLOW ---
  // Validate required personal details before triggering OTP
const errors = {
  emri: !formData.emri.trim(),
  mbiemri: !formData.mbiemri.trim(),
  numri_telefonit: !formData.numri_telefonit.trim(),
};

setFieldErrors(errors);

if (Object.values(errors).some(Boolean)) {
  return;
}
  // Save the intended employee choice temporarily
  setPendingEmployeeId(chosenId);

  try {
    setLoading(true);
    const registerRes = await fetch(
     process.env.REACT_APP_CLIENT_FAST_LOGIN_REGISTER,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emri: formData.emri,
          mbiemri: formData.mbiemri,
          numri_telefonit: `+383${formData.numri_telefonit}`,
          email: formData.email || "",
          gjinia: "m",
        }),
      }
    );

    if (registerRes.ok) {
      setShowOtp(true);
    } else {
      alert("Dështoi regjistrimi i shpejtë. Ju lutemi kontrolloni të dhënat.");
      setPendingEmployeeId(null);
    }
  } catch (err) {
    console.error("Gabim gjatë fast-login:", err);
    alert("Ndodhi një gabim gjatë lidhjes me serverin.");
    setPendingEmployeeId(null);
  } finally {
    setLoading(false);
  }
};
 
const fetchEmployeeDetails = async (employeeId, token) => {
  try {
    setLoading(true);

    const refreshToken = sessionStorage.getItem("refreshToken");
    const headers = { "Content-Type": "application/json" };

    if (token) headers["Authorization"] = `Bearer ${token}`;
    if (refreshToken) headers["Refresh-Token"] = refreshToken;

    const res = await fetch(
      `${process.env.REACT_APP_TERMINET_EMPLOYEE_DETAILS}/${employeeId}`,
      { method: "GET", headers }
    );

    if (!res.ok) {
      throw new Error(`Kodi i gabimit: ${res.status}`);
    }

    const data = await res.json();

const rawDates = data.dates || data.availability || [];

const parsedDates = Array.isArray(rawDates)
  ? rawDates.map((d) =>
      typeof d === "string"
        ? d.replace(/-/g, "/")
        : d
    )
  : rawDates;

setEmployeeAvailability(parsedDates);

// Services are date-dependent.
// Do NOT use data.services/data.sherbimet here.
setServices([]);
setFiltered([]);

  } catch (err) {
    console.error("Gabim gjatë marrjes së të dhënave të punëtorit:", err);
    // Clear state on error so previous services don't persist
    setServices([]);
    setFiltered([]);
    setEmployeeAvailability(null);
  } finally {
    setLoading(false);
  }
};
  async function loadEmployees() {
    try {
      const data = await fetchEmployees();
      console.log(data);
      setEmployeesList(data || []);
    } catch (err) {
      ExceptionHandler.handle(err);
    }
  }

const handleChange = (e) => {
  
    const { name, value } = e.target;

  if (fieldErrors[name]) {
    setFieldErrors((prev) => ({
      ...prev,
      [name]: false,
    }));
  }

  if (name === "data") {
    tempDateRef.current = value;

    const availability = getAvailabilityForDate(value);
    setSelectedAvailability(availability);
  }

  if (name === "ora") {
    tempTimeRef.current = value;
  }

  setFormData((prev) => {
    const updatedDate = name === "data" ? value : tempDateRef.current;
    const updatedTime = name === "ora" ? value : tempTimeRef.current;

    let combinedDataCaktimit = "";

    if (updatedDate && updatedTime) {
      combinedDataCaktimit = `${updatedDate}T${
        updatedTime.length === 5 ? updatedTime + ":00" : updatedTime
      }`;
    }

      return {
        ...prev,
        [name]: value,
        dataCaktimit: combinedDataCaktimit,
      };
    });
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
        s.emri_sherbimit?.toLowerCase().includes(value.toLowerCase()),
      ),
    );
  };

  const getPrice = (service) => {
    const base = service.qmimi_baze || 0;
    const discount = service.zbritja || 0;
    return base - (base * discount) / 100;
  };

  const handleServiceCardClick = async (service) => {
    const exists = formData.detajetTermineve.find(
      (s) => s.sherbimetId === service.ID,
    );

    if (exists) {
      setFormData((prev) => ({
        ...prev,
        detajetTermineve: prev.detajetTermineve.filter(
          (s) => s.sherbimetId !== service.ID,
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


  const formatDuration = (mins) => {
    const hours = Math.floor(mins / 60);
    const minutes = mins % 60;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}h`;
  };

  const handleConfirmSelection = (item) => {
    setFormData((prev) => ({
      ...prev,
      detajetTermineve: [...prev.detajetTermineve, item],
    }));
    setSelectedService(null);
  };

  const closeDialog = () => {
    setSelectedService(null);
  };

  const totalPrice = formData.detajetTermineve.reduce(
    (sum, item) => sum + item.pagesa,
    0,
  );

  const getAvailabilityForDate = (selectedDate) => {
  if (!employeeAvailability) return null;

  const date = new Date(selectedDate);

  // JS: Sunday=0 ... Saturday=6
  const jsDay = date.getDay();

  // Backend: Monday=1 ... Sunday=7
  const dayOfWeek = jsDay === 0 ? 7 : jsDay;

  for (const period of employeeAvailability) {
    if (
      selectedDate >= period.start_date &&
      selectedDate <= period.end_date
    ) {
      const detail = period.availabilityDetails.find(
        d => d.day_of_week === dayOfWeek
      );

      if (detail) {
        return detail;
      }
    }
  }

  return null;
};

const getAvailabilityPeriodForDate = (selectedDate) => {
  if (!selectedDate || !employeeAvailability) return null;

  return employeeAvailability.find((period) => {
    return (
      selectedDate >= period.start_date &&
      selectedDate <= period.end_date
    );
  }) || null;
};

const filterServicesForDate = (selectedDate) => {
  if (!selectedDate || !employeeAvailability) {
    setServices([]);
    setFiltered([]);
    return;
  }

  const period = getAvailabilityPeriodForDate(selectedDate);

  if (!period) {
    setServices([]);
    setFiltered([]);
    return;
  }

  const dateServices = period.sherbimetDisplay || [];

  setServices(dateServices);

  // Apply existing search as well
  if (search.trim()) {
    setFiltered(
      dateServices.filter((service) =>
        service.emri_sherbimit
          ?.toLowerCase()
          .includes(search.toLowerCase())
      )
    );
  } else {
    setFiltered(dateServices);
  }
};

const availableDates = [];

if (employeeAvailability) {
  employeeAvailability.forEach((period) => {
    let current = new Date(period.start_date);
    const end = new Date(period.end_date);

    while (current <= end) {
      const jsDay = current.getDay();
      const day = jsDay === 0 ? 7 : jsDay;

      const exists = period.availabilityDetails.some(
        (d) => d.day_of_week === day
      );

      if (exists) {
        availableDates.push(current.toISOString().split("T")[0]);
      }

      current.setDate(current.getDate() + 1);
    }
  });
}

const handleDateTimeChange = ({ data, ora, dataCaktimit }) => {
  // Find availability for the newly selected date
  const availability = getAvailabilityForDate(data);

  setSelectedAvailability(availability);

  // Filter services belonging to that date's availability period
  filterServicesForDate(data);

  setFormData((prev) => ({
    ...prev,
    data,
    ora,
    dataCaktimit,
    // Clear previously selected services because they may
    // not be available on the new date
    detajetTermineve: []
  }));
};


const handleDateChange = (e) => {
  const date = e.target.value;

  const availability = getAvailabilityForDate(date);

  setSelectedAvailability(availability);

  // Filter services according to the selected date
  filterServicesForDate(date);

  setFormData(prev => ({
    ...prev,
    data: date,
    ora: "",
    detajetTermineve: []
  }));
};


const generateTimes = (start, end) => {
    const result = [];

    let current = new Date(`1970-01-01T${start}`);
    const finish = new Date(`1970-01-01T${end}`);

    while (current < finish) {
        result.push(
            current.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: false
            })
        );

        current.setMinutes(current.getMinutes() + 15);
    }

    return result;
};

const availableTimes = selectedAvailability
    ? generateTimes(
        selectedAvailability.start_time,
        selectedAvailability.end_time
      )
    : [];

  const handleTerminetSubmit = async () => {
    try {
      if (!formData.employeeId) return alert("Zgjidhni punëtorin!");
      if (!formData.dataCaktimit) return alert("Zgjidhni datën!");
      if (!formData.detajetTermineve.length)
        return alert("Zgjidhni të paktën një shërbim!");

      const stored = sessionStorage.getItem("userDetails");
      const user = stored ? JSON.parse(stored) : null;
      const isLoggedIn = Boolean(user?.id);
      if (
        isLoggedIn &&
        `+383${formData.numri_telefonit}` == user.numriTelefonit
      ) {
        const booking = buildBookingPayload(user.id || formData.clientId);
        const token = sessionStorage.getItem("accessToken");

        const res = await fetch(
          process.env.REACT_APP_TERMINET_CREATE,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: token ? `Bearer ${token}` : "",
            },
            body: JSON.stringify(booking),
          },
        );

        const data = await res.text();
        if (!res.ok) {
          alert(data || "Dështoi krijimi i terminit.");
          return;
        }

        alert("Termini u krijua me sukses!");
        setFormData({
          clientId: null,
          emri: "",
          mbiemri: "",
          numri_telefonit: "",
          email: "",
          employeeId: "",
          pershkrimi: "",
          dataCaktimit: "",
          detajetTermineve: [],
        });
        return;
      }

      const registerRes = await fetch(
        process.env.REACT_APP_CLIENT_FAST_LOGIN_REGISTER,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            emri: formData.emri,
            mbiemri: formData.mbiemri,
            numri_telefonit: `+383${formData.numri_telefonit}`,
            email: "",
            gjinia: "m",
          }),
        },
      );

      if (registerRes.ok) {
        setShowOtp(true);
        return;
      }
    } catch (err) {
      console.error(err);
      alert("Ndodhi një gabim gjatë procesit.");
    }
  };

  const verifyOtp = async (otp) => {
  try {
    const payload = {
      otpcode: otp,
      numri_telefonit: `+383${formData.numri_telefonit}`,
    };

    const res = await fetch(
      process.env.REACT_APP_CLIENT_FAST_LOGIN_VERIFY,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      }
    );

    if (!res.ok) {
      alert("Kodi OTP është gabim!");
      return;
    }

    const data = await res.json().catch(() => ({}));

    // Save tokens in sessionStorage
    sessionStorage.setItem("accessToken", data.token);
    if (data.refreshToken) {
      sessionStorage.setItem("refreshToken", data.refreshToken);
    }

    // Get user info
    const userRes = await fetch(process.env.REACT_APP_CLIENT_GET_DATA, {
      headers: { Authorization: `Bearer ${data.token}` },
      credentials: "include",
    });

    const userInfo = await userRes.json();
    sessionStorage.setItem("userDetails", JSON.stringify(userInfo));

    setShowOtp(false);
    setOtpCode("");

    // Automatically set the selected employee after OTP succeeds
    const targetEmpId = pendingEmployeeId || formData.employeeId;
    if (targetEmpId) {
      setFormData((prev) => ({ ...prev, employeeId: targetEmpId }));
      const matchedStaff = employeesList.find(
        (emp) => Number(emp.ID) === targetEmpId || Number(emp.id) === targetEmpId
      );
      setSelectedEmployeeData(matchedStaff || null);
      await fetchEmployeeDetails(targetEmpId, data.token);
      setPendingEmployeeId(null);
    }
  } catch (err) {
    console.error(err);
    alert("Gabim gjatë verifikimit të OTP-së.");
  }
};

  const toggleAttribute = (id) => {
    setSelectedAttributes((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  
 return (
    <div className="termini-page">
      {/* Mobile-Optimized Top Header */}
      <header className="termini-header">
        <span className="badge-pill">Sallon Bukurie</span>
        <h1>
          REZERVO <span className="title-serif">Terminin</span>
        </h1>
        <p>Zgjidhni stafin, shërbimet dhe kohën tuaj ideale</p>
      </header>

      <main className="termini-container">
        <div className="termini-grid">
          {/* MAIN FORM COLUMN */}
          <div className="termini-main-content">
            
            {/* STEP 01: Detajet Personale */}
            <section className="form-section-card">
              <div className="section-title-wrapper">
                <span className="step-badge">1</span>
                <div>
                  <h2 className="section-title">Detajet Personale</h2>
                  <p className="section-subtitle">Ju lutemi plotësoni të dhënat tuaja</p>
                </div>
              </div>

              <div className="input-group-grid">
                <div className="input-box">
                  <label>Emri</label>
               <input
  type="text"
  name="emri"
  value={formData.emri}
  onChange={handleChange}
  placeholder="Emri"
  className={fieldErrors.emri ? "input-error" : ""}
/>

{fieldErrors.emri && (
  <small className="error-text">
    Ju lutemi shkruani emrin.
  </small>
)}
                </div>
                <div className="input-box">
                  <label>Mbiemri</label>
                  <input
  type="text"
  name="mbiemri"
  value={formData.mbiemri}
  onChange={handleChange}
  placeholder="Mbiemri"
  className={fieldErrors.mbiemri ? "input-error" : ""}
/>

{fieldErrors.mbiemri && (
  <small className="error-text">
    Ju lutemi shkruani mbiemrin.
  </small>
)}
                </div>
              </div>

              <div className="input-box">
                <label>Numri i telefonit *</label>
                <div className="phone-input-wrapper">
                  <span className="phone-prefix">+383</span>
                <input
  type="tel"
  inputMode="numeric"
  name="numri_telefonit"
  value={formData.numri_telefonit}
  className={fieldErrors.numri_telefonit ? "input-error" : ""}
                  
                    onChange={(e) => {
  let value = e.target.value.replace(/\D/g, "");
  if (value.startsWith("0")) value = value.substring(1);
  value = value.slice(0, 8);

  setFormData((prev) => ({
    ...prev,
    numri_telefonit: value,
  }));

  if (fieldErrors.numri_telefonit) {
    setFieldErrors((prev) => ({
      ...prev,
      numri_telefonit: false,
    }));
  }
}}
                    placeholder="4XXXXXXX"
                    required
                  />
                  {fieldErrors.numri_telefonit && (
  <small className="error-text">
    Ju lutemi shkruani numrin e telefonit.
  </small>
)}
                </div>
              </div>

              <div className="input-box">
                <label>
                  Email <span className="optional-tag">(Opsionale)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email || ""}
                  onChange={handleChange}
                  placeholder="shembull@email.com"
                />
              </div>
            </section>

            {/* STEP 02: Zgjedh Stafin */}
            <section className="form-section-card">
              <div className="section-title-wrapper">
                <span className="step-badge">2</span>
                <div>
                  <h2 className="section-title">Zgjedh Stafin</h2>
                  <p className="section-subtitle">Përzgjidhni profesionistin tuaj</p>
                </div>
              </div>

              {/* Mobile-Friendly Horizontal Staff Selector */}
              <div className="staff-tiles-scroll">
                {employeesList.map((emp) => {
                  const isEmpSelected = formData.employeeId === emp.ID;
                  return (
                    <div
                      key={emp.ID}
                      className={`staff-tile-card ${isEmpSelected ? "selected" : ""}`}
                      onClick={() => {
                        // Trigger synthetic change or custom function
                        handleEmployeeChange({ target: { value: emp.ID } });
                      }}
                    >
                      <div className="staff-avatar">
                        {emp.emri?.charAt(0)}{emp.mbiemri?.charAt(0)}
                      </div>
                      <span className="staff-name">{emp.emri}</span>
                      <span className="staff-role">Specialist</span>
                      {isEmpSelected && <span className="staff-check">✓</span>}
                    </div>
                  );
                })}
              </div>

              {/* Selected Staff Info Card */}
              {selectedEmployeeData && (
                <div className="employee-profile-preview animate-fade-in">
                  <div className="employee-profile-info">
                    <p className="employee-bio">
                      {selectedEmployeeData.pershkrimi || "Staf i kualifikuar për shërbimet e bukurisë."}
                    </p>
                    <div className="employee-contact-meta">
                      {selectedEmployeeData.numri_telefonit && (
                        <span>📞 {selectedEmployeeData.numri_telefonit}</span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* CONDITIONAL STEPS: Visible after choosing staff */}
            {formData.employeeId ? (
              <>
                {/* STEP 03: Data & Ora */}
            <section className="form-section-card animate-fade-in">
  <div className="section-title-wrapper">
    <span className="step-badge">3</span>
    <div>
      <h2 className="section-title">Data dhe Ora</h2>
      <p className="section-subtitle">Zgjidhni kohën e përshtatshme</p>
    </div>
  </div>

  {/* Replaced <div className="datetime-grid"> with component */}
  <AppointmentDateTimePicker
    availabilityData={{ dates: employeeAvailability }} // Pass backend availability object here
    valueData={formData.data}
    valueOra={formData.ora}
    onChange={handleDateTimeChange}
    slotDuration={15} // 15-minute slot steps
  />

  <div className="input-box" style={{ marginTop: '1rem' }}>
    <label>Shënime Specifike</label>
    <textarea
      name="pershkrimi"
      rows={2}
      value={formData.pershkrimi}
      onChange={handleChange}
      placeholder="Preferenca ose kërkesa të veçanta..."
    />
  </div>
</section>

                {/* STEP 04: Shërbimet */}
                <section className="form-section-card animate-fade-in">
                  <div className="services-section-header">
                    <div className="section-title-wrapper">
                      <span className="step-badge">4</span>
                      <div>
                        <h2 className="section-title">Shërbimet</h2>
                        <p className="section-subtitle">Zgjidhni një apo më shumë shërbime</p>
                      </div>
                    </div>

                    <div className="search-wrapper">
                      <input
                        type="text"
                        className="services-search"
                        placeholder="🔍 Kërko shërbimin..."
                        value={search}
                        onChange={handleSearch}
                      />
                    </div>
                  </div>

                  {loading ? (
                    <div className="spinner-wrapper">
                      <div className="spinner"></div>
                      <p>Duke ngarkuar shërbimet...</p>
                    </div>
                  ) : filtered.length === 0 ? (
                    <div className="empty-state">
                      <p>Nuk u gjet asnjë shërbim me këtë kërkim.</p>
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
                            className={`service-modern-card ${isSelected ? "selected" : ""}`}
                            onClick={() => handleServiceCardClick(s)}
                          >
                            <div className="service-image-container">
                            <img
  src={
    s.imagePath
      ? s.imagePath.startsWith("data:") || s.imagePath.startsWith("http")
        ? s.imagePath
        : `data:image/png;base64,${s.imagePath}`
      : "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop"
  }
  alt={s.emri_sherbimit || "Sherbimi"}
  onError={(e) => {
    e.currentTarget.onerror = null; // Prevents infinite loops if fallback fails
    e.currentTarget.src =
      "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=600&auto=format&fit=crop";
  }}
/>
                              {isSelected && (
                                <div className="selected-indicator">
                                  <span>✓ ZGJEDHUR</span>
                                </div>
                              )}
                            </div>
                            <div className="service-details">
                              <h4>{s.emri_sherbimit}</h4>
                              <div className="service-meta">
                                <span className="duration">
                                  ⏱ {formatDuration(s.kohezgjatja) || 0} min
                                </span>
                                <span className="price">
                                  €{getPrice(s).toFixed(2)}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>
              </>
            ) : (
              <div className="form-section-card empty-prompt-card">
                <p>👈 Zgjidhni më sipër punëtorin për të parë orarin dhe shërbimet.</p>
              </div>
            )}
          </div>

          {/* DESKTOP SIDEBAR */}
          <aside className="termini-sidebar">
            <div className="summary-widget">
              <h3>PËRMBLEDHJA</h3>
              {formData.detajetTermineve.length === 0 ? (
                <p className="empty-summary-text">
                  Zgjidhni shërbimet e dëshiruara për të vazhduar rezervimin.
                </p>
              ) : (
                <div className="summary-items-list">
                  {formData.detajetTermineve.map((s, i) => (
                    <div key={i} className="summary-item">
                      <span className="summary-item-name">{s.name}</span>
                      <span className="summary-item-price">
                        €{Number(s.pagesa).toFixed(2)}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              <div className="summary-divider"></div>
              <div className="summary-total">
                <span>TOTALI</span>
                <span className="total-amount">
                  €{totalPrice.toFixed(2)}
                </span>
              </div>

              <button
                className="book-now-btn"
                disabled={formData.detajetTermineve.length === 0}
                onClick={() => setShowConfirmation(true)}
              >
                KONFIRMO REZERVIMIN
              </button>
            </div>
          </aside>
        </div>
      </main>

      {/* MOBILE FLOATING BOTTOM ACTION BAR */}
      <div className="mobile-sticky-bar">
        <div className="mobile-total-info">
          <span className="mobile-total-price">€{totalPrice.toFixed(2)}</span>
          <span className="mobile-item-count">
            {formData.detajetTermineve.length} {formData.detajetTermineve.length === 1 ? 'shërbim' : 'shërbime'}
          </span>
        </div>
        <button
          className="mobile-book-btn"
          disabled={formData.detajetTermineve.length === 0}
          onClick={() => setShowConfirmation(true)}
        >
          Konfirmo
        </button>
      </div>

      {/* CONFIRMATION DIALOG MODAL */}
      {showConfirmation && (
        <div className="modal-overlay" onClick={() => setShowConfirmation(false)}>
          <div className="confirm-dialog" onClick={(e) => e.stopPropagation()}>
            <div className="modal-drag-handle"></div>
            <div className="confirm-dialog-header">
              <div className="confirm-dialog-icon">✓</div>
              <h2 className="confirm-dialog-title">Konfirmo Rezervimin</h2>
              <p className="confirm-dialog-description">
                Rishikoni detajet e takimit tuaj përpara se të vazhdoni.
              </p>
            </div>

            <div className="confirm-dialog-body">
              <div className="confirm-summary">
                <div className="confirm-summary-row">
                  <span>Shërbimet:</span>
                  <strong>{formData.detajetTermineve.length} shërbim(e)</strong>
                </div>

                <div className="confirm-summary-row">
                  <span>Stafi:</span>
                  <strong>
                    {selectedEmployeeData
                      ? `${selectedEmployeeData.emri} ${selectedEmployeeData.mbiemri}`
                      : "-"}
                  </strong>
                </div>

                <div className="confirm-summary-row">
                  <span>Data & Ora:</span>
                  <strong>
                    {tempDateRef.current || formData.data || "-"} @ {tempTimeRef.current || formData.ora || "-"}
                  </strong>
                </div>

                <div className="confirm-total">
                  <span>Totali i pagesës</span>
                  <span>€{totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            <div className="confirm-dialog-footer">
              <button
                className="confirm-btn-secondary"
                onClick={() => setShowConfirmation(false)}
              >
                Kthehu
              </button>

              <button
                className="confirm-btn-primary"
                onClick={() => {
                  setShowConfirmation(false);
                  handleTerminetSubmit();
                }}
              >
                Përfundo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SERVICE ATTRIBUTES SHEET */}
      {selectedService && (
        <div className="custom-modal-overlay" onClick={closeDialog}>
          <div
            className="custom-modal-sheet"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-drag-handle"></div>
            <div className="custom-modal-header">
              <div>
                <span className="custom-modal-subtitle">Konfigurimi</span>
                <h3 className="custom-modal-title">
                  {selectedService.emri_sherbimit}
                </h3>
              </div>

              <button className="custom-modal-close-btn" onClick={closeDialog}>
                ✕
              </button>
            </div>

            <div className="custom-modal-body">
              {selectedService.imageURL && (
                <img
                  src={selectedService.imageURL}
                  className="custom-modal-hero-img"
                  alt={selectedService.emri_sherbimit}
                />
              )}

              <div className="custom-modal-metrics">
                <div className="custom-modal-metric-pill">
                  <label>ÇMIMI BAZË</label>
                  <span>€{getPrice(selectedService).toFixed(2)}</span>
                </div>

                <div className="custom-modal-metric-pill">
                  <label>KOHËZGJATJA</label>
                  <span>
                    {formatDuration(selectedService.kohezgjatja) || 0} Min
                  </span>
                </div>
              </div>

              <h4 className="custom-modal-section-title">Variantet / Opsionet</h4>

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
                    const activePrice = basePrice - (basePrice * discount) / 100;
                    const isSelected = selectedAttributes.includes(attr.id_atributit);

                    return (
                      <div
                        className={`custom-modal-attr-card ${isSelected ? "selected" : ""}`}
                        key={attr.id_atributit}
                        onClick={() => toggleAttribute(attr.id_atributit)}
                      >
                        <div className="custom-modal-attr-left">
                          <h5>{attr.opsioni}</h5>
                        </div>

                        <div className="custom-modal-attr-right">
                          <span className="custom-modal-attr-price">
                            €{activePrice.toFixed(2)}
                          </span>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>

            <div className="custom-modal-footer">
              <button
                className="custom-modal-btn-primary"
                onClick={() => {
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

                  selectedAttributes.forEach((attrId) => {
                    const attr = attributesList.find((a) => a.id_atributit === attrId);
                    if (attr) {
                      const basePrice = Number(attr.qmimi || 0);
                      const discount = Number(attr.zbritja || 0);
                      const activePrice = basePrice - (basePrice * discount) / 100;

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
  <div className="modal-overlay otp-modal-overlay">
    <div className="modal-box otp-dialog-box animate-slide-up">
      <div className="modal-drag-handle"></div>
      
      <div className="otp-header">
        <div className="otp-icon">🔒</div>
        <h2>VERIFIKIMI</h2>
        <p>Kodi i sigurisë është dërguar me SMS në numrin tuaj të telefonit.</p>
      </div>

      <div className="otp-container-slot">
        <OtpInput
          value={otpCode}
          onChange={setOtpCode}
          onComplete={verifyOtp}
        />
      </div>

      <div className="otp-actions">
        <button
          type="button"
          className="otp-cancel-btn"
          onClick={() => {
            setShowOtp(false);
            setOtpCode("");
          }}
        >
          ANULO
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
