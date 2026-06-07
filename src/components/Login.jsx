import React, { useState, useEffect } from "react";
import "../css/login.css";
import {jwtDecode} from "jwt-decode";

function LoginView() {
  
  const [view, setView] = useState(() => {
  const storedUser = sessionStorage.getItem("userDetails");
  const token = sessionStorage.getItem("accessToken");
  if (storedUser && token) return "profile";
  return "checking";
});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const [numriTelefonit, setNumriTelefonit] = useState("");
  const [userData, setUserData] = useState( 
    {emri: "",
    mbiemri: "",
    numri_telefonit: "",
    email: "",
    gjinia: "m",
    emailVerified: false
});

  const [regData, setRegData] = useState({
    emri: "",
    mbiemri: "",
    numri_telefonit: "",
    email: "",
    gjinia: "f",

  });

  const [isEditing, setIsEditing] = useState(false);

const [editData, setEditData] = useState({
  emri: "",
  mbiemri: "",
  email: "",
  gjinia: "m",
});

const [verifyStep, setVerifyStep] = useState("choose");
// choose | emailInput | codeSent
const [showEmailVerify, setShowEmailVerify] = useState(false);
const [verifyEmail, setVerifyEmail] = useState(userData.email);
const [otp, setOtp] = useState("");

const [phoneError, setPhoneError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showHistoria, setShowHistoria] = useState(false);

useEffect(() => {
  const autoLogin = async () => {
    try {
  
      const res = await fetch("http://192.168.100.116:8000/auth/refresh-token", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
          
        sessionStorage.clear();
        setView("login");
        return;
      }

      const data = await res.json();
      sessionStorage.setItem("accessToken", data.accessToken);

      const clientId = jwtDecode(data.accessToken).id;

      const userRes = await fetch(
        "http://192.168.100.116:8000/api/clients/data",
        {
          headers: { Authorization: `Bearer ${data.accessToken}` },
          credentials: "include",
        }
      );

      if (!userRes.ok) {
  sessionStorage.clear();
  setView("login");
  return;
}

      const userInfo = await userRes.json();
      sessionStorage.setItem("userDetails", JSON.stringify(userInfo));

      setUserData(userInfo);
          console.log(userData);
      setEditData({
  emri: userInfo.emri || "",
  mbiemri: userInfo.mbiemri || "",
  email: userInfo.email || "",
  gjinia: userInfo.gjinia || "m"
});
      setView("profile");
    } catch (err) {
      console.error(err);
      setView("login");
    }
  };

  autoLogin();
}, []);
  // Manual login
const handleLogin = async (e) => {
  e.preventDefault();
  setError("");

  try {

    const res = await fetch("http://192.168.100.116:8000/auth/login/client", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
      numri_telefonit: `+383${numriTelefonit}`
      }),
      credentials: "include",
    });

    const text = await res.text();

    if (!res.ok) {
      setError(text || "Phone number not found");
      return;
    }
    // go to OTP screen
    setView("verify-login");

  } catch (err) {
    console.error(err);
    setError("Couldn't connect to server.");
  }
};


const sendVerificationCode = async () => {
  try {
    const res = await fetch("/api/send-verification-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: verifyEmail }),
    });

    if (!res.ok) {
      throw new Error("Failed to send code");
    }

    setVerifyStep("codeSent");
  } catch (err) {
    console.error(err);
    alert("Nuk u dërgua kodi. Provo përsëri.");
  }
};

const verifyEmailCode = async () => {
  try {
    const res = await fetch("/api/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: verifyEmail,
        code: otp,
      }),
    });

    if (!res.ok) {
      alert("Kodi është gabim ose ka skaduar");
      return;
    }

    alert("Email verified!");

    // reset everything cleanly
    setShowEmailVerify(false);
    setVerifyStep("choose");
    setOtp("");

  } catch (err) {
    console.error(err);
    alert("Gabim gjatë verifikimit");
  }
};

  const handleVerify = async (otp) => {
 //   e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://192.168.100.116:8000/api/clients/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        otpcode: otp,
        numri_telefonit: `+383${regData.numri_telefonit}`
      }),
      credentials: "include",
    });

    const text = await res.text(); // backend might return plain text
    if (!res.ok) {
      setError(text.message || "Verification failed");
      return;
    }

    alert("Verification successful! Please login now.");
    setView("login");           // back to login form
    setVerificationCode("");

  } catch (err) {
    console.error(err);
    setError("Something went wrong during verification.");
  }
};


const handleLogout = async () => {
  const confirmLogout = window.confirm("Dëshironi të dilni?");
  if (!confirmLogout) return;

  try {
    const res = await fetch(
      "http://192.168.100.116:8000/auth/delete-refresh-token",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      }
    );

    // optional: read message for debugging
    await res.text();

  } catch (err) {
    console.error("Logout request failed:", err);
  } finally {
    // ALWAYS clear local state
    sessionStorage.clear();
    setNumriTelefonit("");
    setUserData({
  emri: "",
  mbiemri: "",
  numri_telefonit: "",
  email: "",
  gjinia: "m",
  emailVerified: false
});
    setView("login");
  }
};

const handleRegister = async (e) => {
  e.preventDefault();
  setError("");

  if (regData.numri_telefonit.length !== 8) {
  setPhoneError("Numri i telefonit duhet të ketë saktësisht 8 shifra");
  return;
}

  try {
    const payload = {
      ...regData,
      numri_telefonit: `+383${regData.numri_telefonit}`
    };

    console.log(payload);
    const res = await fetch("http://192.168.100.116:8000/api/clients/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });

    const text = await res.text();

    if (!res.ok) {
      setError(text || "Registration failed");
      return;
    }

    setVerificationCode("");
    setView("verify");

  } catch (err) {
    console.error(err);
    setError("Something went wrong during registration.");
  }
};
  // Verification
const handleAutoVerify = async (otp) => {
  setError("");

  try {
    const res = await fetch(
      "http://192.168.100.116:8000/auth/login/client/verify",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          otp,
         numri_telefonit : `+383${numriTelefonit}` }),
        credentials: "include",
      }
    );

     
    if (!res.ok) {
      const text = await res.text();
      setError(text.message || "Invalid OTP");
      setVerificationCode("");
      return;
    }

    const data = await res.json();

    sessionStorage.setItem("accessToken", data.token);

    const userRes = await fetch(
      "http://192.168.100.116:8000/api/clients/data",
      {
        headers: { Authorization: `Bearer ${data.token}` },
        credentials: "include",
      }
    );

    const userInfo = await userRes.json();
    sessionStorage.setItem("userDetails", JSON.stringify(userInfo));
setVerificationCode("");
    setUserData(userInfo);
    setEditData({
  emri: userInfo.emri || "",
  mbiemri: userInfo.mbiemri || "",
  email: userInfo.email || "",
  gjinia: userInfo.gjinia || "m",
});
    setView("profile");

  } catch (err) {
    console.error(err);
    setError("OTP verification failed.");
  }
};

const OTP_LENGTH = 6;

const handleOtpChange = (value, index) => {
  if (!/^\d*$/.test(value)) return;

  const otpArray = verificationCode.split("");

  otpArray[index] = value;

  const newOtp = otpArray.join("").padEnd(OTP_LENGTH, "");

  setVerificationCode(newOtp);
  if (value && index < OTP_LENGTH - 1) {
    document.getElementById(`otp-${index + 1}`)?.focus();
  }

  const isComplete =
    newOtp.split("").filter(Boolean).length === OTP_LENGTH;

  if (isComplete) {
    handleAutoVerify(newOtp);

  }
};

const handleOtpChangeRegister = (value, index) => {
  if (!/^\d*$/.test(value)) return;

  const otpArray = verificationCode.split("");

  otpArray[index] = value;

  const newOtp = otpArray.join("").padEnd(OTP_LENGTH, "");

  setVerificationCode(newOtp);
  if (value && index < OTP_LENGTH - 1) {
    document.getElementById(`otp-${index + 1}`)?.focus();
  }

  const isComplete =
    newOtp.split("").filter(Boolean).length === OTP_LENGTH;

  if (isComplete) {
    handleVerify(newOtp);

  }
};


const handleKeyDown = (e, index) => {
  // Go back when deleting
  if (
    e.key === "Backspace" &&
    !verificationCode[index] &&
    index > 0
  ) {
    document.getElementById(`otp-${index - 1}`)?.focus();
  }
};


const handleChange = (e) => {
  setEditData({
    ...editData,
    [e.target.name]: e.target.value,
  });
};

const handleSave = async () => {
  const confirmSave = window.confirm("Dëshiron të ruash ndryshimet?");
  if (!confirmSave) return;

  try {
    console.log(editData);
    const res = await fetch(
      "http://192.168.100.116:8000/api/clients/update",
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
        credentials: "include",
        body: JSON.stringify(editData),
      }
    );

    const message = await res.text();

    if (res.ok) {
      alert(message);
      setUserData( {
        emri: editData.emri,
    mbiemri: editData.mbiemri,
    email: editData.email,
      gjinia: editData.gjinia === "m" ? "Mashkull" : "Femer",
      });
      setIsEditing(false);
    } else {
      alert(message || "Gabim gjatë ruajtjes së të dhënave.");
    }
  } catch (err) {
    console.error(err);
    alert("Gabim në lidhje me serverin.");
  }
};


const handleCancel = () => {
  const confirmCancel = window.confirm("Dëshiron të anulosh ndryshimet?");

  if (!confirmCancel) return;

  setEditData({
    emri: userData.emri,
    mbiemri: userData.mbiemri,
    email: userData.email,
    gjinia: userData.gjinia,
  });

  setIsEditing(false);
};

if (view === "checking") return <p>Checking session...</p>;

  if (view === "profile" && userData) {
return (
  <>
<div className="profile-page">

  <div className="profile-container">

    <div className="profile-card">

      {/* HEADER */}
      <div className="profile-header">

        <div className="avatar">
          {userData.emri?.charAt(0)}
          {userData.mbiemri?.charAt(0)}
        </div>

        <div className="profile-title">
          <h2>{userData.emri} {userData.mbiemri}</h2>
          <span className="subtitle">Profili i klientit</span>
        </div>

      </div>

      {/* INFO SECTION */}
<div className="profile-info">

  {/* GJINIA */}
  <div className="info-row">
    <span className="label">Gjinia</span>

    {isEditing ? (
      <select
        name="gjinia"
        value={editData.gjinia}
        onChange={handleChange}
      >
        <option value="m">Mashkull</option>
        <option value="f">Femer</option>
      </select>
    ) : (
      <span className="value">{userData.gjinia}</span>
    )}
  </div>

  {/* NUMRI (NOT EDITABLE) */}
  <div className="info-row">
    <span className="label">Numri i telefonit</span>
    <span className="value">{userData.numriTelefonit}</span>
  </div>

  {/* EMAIL */}
  <div className="info-row full">
    <span className="label">Email</span>

    {isEditing ? (
      <input
        type="email"
        name="email"
        value={editData.email}
        onChange={handleChange}
      />
    ) : (
      <span className="value">{userData.email}</span>
    )}
  </div>

  {/* EMRI + MBIEMRI */}
  <div className="info-row full">
    <span className="label">Emri</span>

    {isEditing ? (
      <input
        name="emri"
        value={editData.emri}
        onChange={handleChange}
      />
    ) : (
      <span className="value">{userData.emri}</span>
    )}
  </div>

  <div className="info-row full">
    <span className="label">Mbiemri</span>

    {isEditing ? (
      <input
        name="mbiemri"
        value={editData.mbiemri}
        onChange={handleChange}
      />
    ) : (
      <span className="value">{userData.mbiemri}</span>
    )}
  </div>

  {/* DATE (NOT EDITABLE) */}
  <div className="info-row full">
    <span className="label">Data e regjistrimit</span>
    <span className="value">
      {new Date(userData.dataRegjistrimit).toLocaleDateString()}
    </span>
  </div>

</div>

      {/* ACTIONS */}
<div className="profile-actions">

{!userData.emailVerified && (
  <button
    className="btn-primary"
    onClick={() => setShowEmailVerify(true)}
  >
    ✉️ Verifiko Email
  </button>
)}

  {!isEditing ? (
    <button
      className="btn-primary"
      onClick={() => setIsEditing(true)}
    >
      Ndrysho të dhënat
    </button>
  ) : (
    <>
      <button className="btn-primary" onClick={handleSave}>
        Ruaj ndryshimet
      </button>

      <button className="btn-danger" onClick={handleCancel}>
        Anulo
      </button>
    </>
  )}

  <button
    className="btn-primary"
    onClick={() => setShowHistoria(true)}
  >
    📖 Historia ime
  </button>

  <button
    className="btn-danger"
    onClick={handleLogout}
  >
    🚪 Dil nga llogaria
  </button>

</div>

    </div>

  </div>

</div>

{showEmailVerify && (
  <div className="modal-backdrop-custom">
    <div className="modal-box">

      <div className="modal-header">
        <h5>Verifikimi i Email-it</h5>
        <button
          className="btn-close"
          onClick={() => {
            setShowEmailVerify(false);
            setVerifyStep("choose");
            setOtp("");
          }}
        />
      </div>

      <div className="modal-body">

        {/* STEP 1 */}
        {verifyStep === "choose" && (
          <div>
            <p>Dëshiron ta përdorim këtë email për verifikim?</p>

            <div className="mb-3 p-2 border rounded">
              <strong>{userData.email}</strong>
            </div>

            <div className="d-flex gap-2">
              <button
                className="btn btn-success w-50"
                onClick={sendVerificationCode}
              >
                Po
              </button>

              <button
                className="btn btn-secondary w-50"
                onClick={() => setVerifyStep("emailInput")}
              >
                Jo
              </button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {verifyStep === "emailInput" && (
          <div>
            <p>Shkruaj email të ri</p>

            <input
              type="email"
              value={verifyEmail}
              onChange={(e) => setVerifyEmail(e.target.value)}
              className="form-control mb-3"
            />

            <button
              className="btn btn-primary w-100"
              onClick={sendVerificationCode}
            >
              Dërgo kodin
            </button>
          </div>
        )}

        {/* STEP 3 */}
        {verifyStep === "codeSent" && (
          <div>
            <p>Shkruaj kodin e verifikimit</p>

            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="form-control mb-3"
            />

            <button
              className="btn btn-success w-100"
              onClick={verifyEmailCode}
            >
              Verifiko
            </button>
          </div>
        )}

      </div>
    </div>
  </div>
)}

    {/* MODAL OUTSIDE CONTAINER BUT STILL INSIDE RETURN */}
 {showHistoria && (
  <div className="modal-backdrop-custom">
    <div className="modal-box">

      {/* HEADER */}
      <div className="modal-header">
        <h5 className="m-0">Historia</h5>
        <button
          className="btn-close"
          onClick={() => setShowHistoria(false)}
        />
      </div>

      {/* BODY WITH TABLE */}
      <div className="modal-body">

        <div className="table-responsive">
          <table className="table table-hover align-middle">

            <thead className="table-light">
              <tr>
                <th>Date</th>
                <th>Service</th>
                <th>Status</th>
              </tr>
            </thead>

            <tbody>
              <tr>
                <td>2026-05-20</td>
                <td>Haircut</td>
                <td><span className="badge bg-success">Done</span></td>
              </tr>

              <tr>
                <td>2026-05-18</td>
                <td>Shaving</td>
                <td><span className="badge bg-warning text-dark">Pending</span></td>
              </tr>

              <tr>
                <td>2026-05-15</td>
                <td>Beard Trim</td>
                <td><span className="badge bg-success">Done</span></td>
              </tr>
            </tbody>

          </table>
        </div>

      </div>

      {/* FOOTER */}
      <div className="modal-footer">
        <button
          className="btn btn-secondary w-100"
          onClick={() => setShowHistoria(false)}
        >
          Close
        </button>
      </div>

    </div>
  </div>
)}
  </>
);
  }

  // Verification form
  if (view === "verify") {
    return (
    <div className="login-container">

     <h1>Shkruaj kodin e verifikimit</h1>
        <p>Një kod verifikimi është dërguar në numrin {numriTelefonit}</p>

    {error && <p className="error-message">{error}</p>}

    <label>Shkruaj kodin verifikues</label>

    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
      {Array.from({ length: OTP_LENGTH }).map((_, index) => (
        <input
  key={index}
  id={`otp-${index}`}
  type="text"
  maxLength="1"
  value={verificationCode[index] || ""}
  onChange={(e) => handleOtpChangeRegister(e.target.value, index)}
  onKeyDown={(e) => handleKeyDown(e, index)}
  inputMode="numeric"
  style={{
    width: "45px",
    height: "55px",
    textAlign: "center",
    fontSize: "22px",
    border: "none",
    borderBottom: "2px solid #ccc",
    outline: "none"
  }}
/>
      ))}
    </div>
  </div>
    );
  }

  // Registration form
  if (view === "register") {
return (
  <div className="login-container">
    <h1>Krijo llogari</h1>

    <form onSubmit={handleRegister}>
      {error && <p className="error-message">{error}</p>}

      {/* EMRI */}
      <div className="form-group">
        <label>Emri</label>
        <input
          type="text"
          value={regData.emri}
          onChange={(e) => {
            const value = e.target.value.replace(/[^a-zA-ZëËçÇ\s]/g, "");
            setRegData({ ...regData, emri: value });
          }}
          required
        />
      </div>

      {/* MBIEMRI */}
      <div className="form-group">
        <label>Mbiemri</label>
        <input
          type="text"
          value={regData.mbiemri}
          onChange={(e) => {
            const value = e.target.value.replace(/[^a-zA-ZëËçÇ\s]/g, "");
            setRegData({ ...regData, mbiemri: value });
          }}
          required
        />
      </div>

      {/* PHONE +383 SAME LOGIC */}
     <div className="form-group">
  <label>Numri i telefonit</label>

  <div style={{ display: "flex", alignItems: "center" }}>
    <span
      style={{
        padding: "10px",
        background: "#f1f1f1",
        border: "1px solid #ccc",
        borderRight: "none",
        borderRadius: "5px 0 0 5px"
      }}
    >
      +383
    </span>

    <input
      type="text"
      value={regData.numri_telefonit}
      onChange={(e) => {
        let value = e.target.value;

        value = value.replace(/\D/g, "");

        if (value.startsWith("0")) {
          value = value.substring(1);
        }

        if (value.length > 8) return;

        setRegData({ ...regData, numri_telefonit: value });

        // LIVE VALIDATION
        if (value.length > 0 && value.length < 8) {
          setPhoneError("Numri duhet të ketë saktësisht 8 shifra");
        } else {
          setPhoneError("");
        }
      }}
      placeholder="4xxxxxxx"
      required
      maxLength={8}
      style={{
        borderRadius: "0 5px 5px 0",
        flex: 1
      }}
    />
  </div>

  {/* ERROR MESSAGE */}
  {phoneError && (
    <small style={{ color: "red", marginTop: "5px", display: "block" }}>
      {phoneError}
    </small>
  )}
</div>
      {/* EMAIL OPTIONAL */}
      <div className="form-group">
        <label>Email (optional)</label>
        <input
          type="email"
          value={regData.email}
          onChange={(e) =>
            setRegData({ ...regData, email: e.target.value })
          }
        />
      </div>

      {/* GJINIA */}
      <div className="form-group">
        <label>Gjinia</label>
        <select
          value={regData.gjinia}
          onChange={(e) =>
            setRegData({ ...regData, gjinia: e.target.value })
          }
        >
          <option value="f">Femër</option>
          <option value="m">Mashkull</option>
        </select>
      </div>

      <button type="submit">Apliko!</button>

      <p style={{ marginTop: "10px" }}>
        Keni llogari?{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => setView("login")}
        >
          Kyçu
        </span>
      </p>
    </form>
  </div>

);
 
  }

  if (view === "verify-login") {
return (
  <div className="login-container">
    <h1>Kyçu</h1>

    {error && <p className="error-message">{error}</p>}

    <label>Shkruaj kodin verifikues</label>

    <div style={{ display: "flex", gap: "10px", justifyContent: "center" }}>
      {Array.from({ length: OTP_LENGTH }).map((_, index) => (
        <input
  key={index}
  id={`otp-${index}`}
  type="text"
  maxLength="1"
  value={verificationCode[index] || ""}
  onChange={(e) => handleOtpChange(e.target.value, index)}
  onKeyDown={(e) => handleKeyDown(e, index)}
  inputMode="numeric"
  style={{
    width: "45px",
    height: "55px",
    textAlign: "center",
    fontSize: "22px",
    border: "none",
    borderBottom: "2px solid #ccc",
    outline: "none"
  }}
/>
      ))}
    </div>
  </div>
);
}

return (
  <div className="login-container">
    <h1>Kyçu</h1>

    <form onSubmit={handleLogin}>
      {error && <p className="error-message">{error}</p>}

      <div className="form-group">
        <label>Shkruaj numrin e telefonit!</label>

        <div style={{ display: "flex", alignItems: "center" }}>
          <span
            style={{
              padding: "10px",
              background: "#f1f1f1",
              border: "1px solid #ccc",
              borderRight: "none",
              borderRadius: "5px 0 0 5px"
            }}
          >
            +383
          </span>

          <input
            type="text"
            value={numriTelefonit}
            onChange={(e) => {
              let value = e.target.value;

              // Allow only numbers
              value = value.replace(/\D/g, "");

              // Remove leading 0
              if (value.startsWith("0")) {
                value = value.substring(1);
              }

               value = value.slice(0, 8);
              setNumriTelefonit(value);
            }}
            placeholder="4xxxxxxx"
            required
             maxLength={8}
            style={{
              borderRadius: "0 5px 5px 0",
              flex: 1
            }}
          />
        </div>
      </div>

      <button type="submit">Dërgo kodin verifikues!</button>
    </form>
       <p style={{ marginTop: "15px", textAlign: "center" }}>
      Nuk ke llogari?{" "}
      <span
        onClick={() => setView("register")}
        style={{
          color: "blue",
          cursor: "pointer",
          fontWeight: "500"
        }}
      >
        Krijo llogari
      </span>
    </p>
  </div>
);
}

export default LoginView;