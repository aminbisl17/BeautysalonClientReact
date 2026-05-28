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
  const [userData, setUserData] = useState(null);

  const [regData, setRegData] = useState({
    emri: "",
    mbiemri: "",
    numri_telefonit: "",
    email: "",
    gjinia: "m",

  });
const [phoneError, setPhoneError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showHistoria, setShowHistoria] = useState(false);

useEffect(() => {
  const autoLogin = async () => {
    try {
      console.log("works")
      const res = await fetch("http://192.168.100.116:8000/auth/refresh-token", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
            console.log("refresh");
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
        console.log("user");
  sessionStorage.clear();
  setView("login");
  return;
}

      const userInfo = await userRes.json();
      sessionStorage.setItem("userDetails", JSON.stringify(userInfo));

      setUserData(userInfo);
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


  const handleVerify = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch("http://192.168.100.116:8000/api/clients/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        otpcode: verificationCode,
      }),
      credentials: "include",
    });

    const text = await res.text(); // backend might return plain text
    if (!res.ok) {
      setError(text || "Verification failed");
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


  // Logout
  const handleLogout = async () => {
    sessionStorage.clear();
    setUserData(null);
 
      try {
    const res = await fetch("http://192.168.100.116:8000/auth/delete-refresh-token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });

    const text = await res.text(); // read response as text

    if (!res.ok) {
//      setError(text || "Registration failed");
      return;
    }

    // Registration successful, backend sent "Client applied"
//    console.log(text); // "Client applied"
  //  setVerificationCode("");
   // setView("verify");
 setView("login");
  } catch (err) {
    console.error(err);
  
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
        body: JSON.stringify({ otp }),
        credentials: "include",
      }
    );

    if (!res.ok) {
      const text = await res.text();
      setError(text || "Invalid OTP");
      setVerificationCode("");
      return;
    }

    const data = await res.json();
    sessionStorage.setItem("accessToken", data.token);

    // continue login flow here
    const userRes = await fetch(
      "http://192.168.100.116:8000/api/clients/data",
      {
        headers: { Authorization: `Bearer ${data.token}` },
        credentials: "include",
      }
    );

    const userInfo = await userRes.json();
    sessionStorage.setItem("userDetails", JSON.stringify(userInfo));

    setUserData(userInfo);
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

  // move focus
  if (value && index < OTP_LENGTH - 1) {
    document.getElementById(`otp-${index + 1}`)?.focus();
  }

  // ✅ check FULL OTP correctly
  const isComplete = newOtp.split("").filter(Boolean).length === OTP_LENGTH;

  if (isComplete) {
    handleAutoVerify(newOtp);
  }
};

if (view === "checking") return <p>Checking session...</p>;

  if (view === "profile" && userData) {
return (
  <>
    <div className="container py-5">

      <div className="row justify-content-center">
        <div className="col-12 col-md-8 col-lg-6">

          {/* MAIN CARD */}
          <div className="profile-card-modern shadow-lg">

            {/* HEADER */}
            <div className="profile-header-modern">

              <div className="avatar-modern">
                {userData.emri?.charAt(0)}
                {userData.mbiemri?.charAt(0)}
              </div>

              <div className="profile-name-block">
                <h3>{userData.emri} {userData.mbiemri}</h3>
              </div>

            </div>

            <hr />

            {/* INFO GRID */}
            <div className="info-grid">

              <div className="info-item">
                <span className="info-label">Gender</span>
                <span className="info-value">{userData.gjinia}</span>
              </div>

              <div className="info-item">
                <span className="info-label">Phone</span>
                <span className="info-value">{userData.numriTelefonit}</span>
              </div>

              <div className="info-item full">
                <span className="info-label">Email</span>
                <span className="info-value">{userData.email}</span>
              </div>

              <div className="info-item full">
                <span className="info-label">Registered</span>
                <span className="info-value">
                  {new Date(userData.dataRegjistrimit).toLocaleDateString()}
                </span>
              </div>

            </div>

            {/* ACTIONS */}
            <div className="profile-actions">

              <button
                className="btn btn-primary w-100"
                onClick={() => setShowHistoria(true)}
              >
                Historia
              </button>

              <button onClick={handleLogout} className="btn btn-danger w-100">
                Logout
              </button>

            </div>

          </div>

        </div>
      </div>

    </div>

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
        <form onSubmit={handleVerify}>
          {error && <p className="error-message">{error}</p>}
          <div className="form-group">
            <label>Verification Code</label>
            <input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              required
            />
          </div>
          <button type="submit">Verify</button>
        </form>
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
          <option value="m">Mashkull</option>
          <option value="f">Femër</option>
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