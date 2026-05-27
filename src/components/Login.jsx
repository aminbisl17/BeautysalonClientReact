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
   
  // Registration state
  const [regData, setRegData] = useState({
    emri: "",
    mbiemri: "",
    numri_telefonit: "",
    email: "",
    gjinia: "m",
 //   username: "",
  //  password: "",
  });

  // Verification code
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
      numri_telefonit: numriTelefonit
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

const handleLoginVerify = async (e) => {
  e.preventDefault();
  setError("");

  try {
    const res = await fetch("http://192.168.100.116:8000/auth/login/client/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({

        otp: verificationCode,
      }),
      credentials: "include",
    });

    if (!res.ok) {
      const text = await res.text();
      setError(text || "Invalid OTP");
      //console.log(res.status);
      return;
    }

    const data = await res.json(); 
    // expecting { token: "..." }

    sessionStorage.setItem("accessToken", data.token);

    const decoded = jwtDecode(data.token);
    const userId = decoded.id;

    const userRes = await fetch(
      "http://192.168.100.116:8000/api/clients/data",
      {
        headers: { Authorization: `Bearer ${data.token}` },
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
  try {
    const res = await fetch("http://192.168.100.116:8000/api/clients/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(regData),
      credentials: "include",
    });

    const text = await res.text(); // read response as text

    if (!res.ok) {
      setError(text || "Registration failed");
      return;
    }

    // Registration successful, backend sent "Client applied"
//    console.log(text); // "Client applied"
    setVerificationCode("");
    setView("verify");

  } catch (err) {
    console.error(err);
    setError("Something went wrong during registration.");
  }
};
  // Verification
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
        <h1>Enter Verification Code</h1>
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
        <h1>Create Account</h1>
        <form onSubmit={handleRegister}>
          {error && <p className="error-message">{error}</p>}
          {["emri","mbiemri","numri_telefonit","email","username","password"].map((field) => (
            <div key={field} className="form-group">
              <label>{field}</label>
              <input
                type={field === "password" ? "password" : "text"}
                value={regData[field]}
                onChange={(e) =>
                  setRegData({ ...regData, [field]: e.target.value })
                }
                required
              />
            </div>
          ))}
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
          <button type="submit">Register</button>
          <p style={{ marginTop: "10px" }}>
            Already have an account?{" "}
            <span
              style={{ color: "blue", cursor: "pointer" }}
              onClick={() => setView("login")}
            >
              Login
            </span>
          </p>
        </form>
      </div>
    );
  }

  if (view === "verify-login") {
  return (
    <div className="login-container">
      <h1>Enter OTP (Login)</h1>

      <form onSubmit={handleLoginVerify}>
        {error && <p className="error-message">{error}</p>}

        <div className="form-group">
          <label>OTP Code</label>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>
    </div>
  );
}

  // Login form
  return (
  <div className="login-container">
  <h1>Login</h1>

  <form onSubmit={handleLogin}>
    {error && <p className="error-message">{error}</p>}

    <div className="form-group">
      <label>Numri i telefonit</label>
   <input
  type="text"
  value={numriTelefonit}
  onChange={(e) => setNumriTelefonit(e.target.value)}
  required
/>
    </div>

    <button type="submit">Send OTP</button>
  </form>
</div>
  );
}

export default LoginView;