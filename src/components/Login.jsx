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
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [userData, setUserData] = useState(null);
   
  // Registration state
  const [regData, setRegData] = useState({
    emri: "",
    mbiemri: "",
    numri_telefonit: "",
    pershkrimi: "",
    email: "",
    gjinia: "m",
    username: "",
    password: "",
  });

  // Verification code
  const [verificationCode, setVerificationCode] = useState("");
  const [tempUsername, setTempUsername] = useState(""); // store username for verification

useEffect(() => {
  const autoLogin = async () => {
    try {
      const res = await fetch("http://localhost:8000/auth/refresh-token", {
        method: "POST",
        credentials: "include",
      });

      if (!res.ok) {
        setView("login");
        return;
      }

      const data = await res.json();
      sessionStorage.setItem("accessToken", data.accessToken);

      const clientId = jwtDecode(data.accessToken).id;

      const userRes = await fetch(
        `http://localhost:8000/api/clients/${clientId}`,
        {
          headers: { Authorization: `Bearer ${data.accessToken}` },
          credentials: "include",
        }
      );

      if (!res.ok) {
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
      const res = await fetch("http://localhost:8000/auth/login/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
        credentials: "include",
      });
      if (res.status === 401) return setError("Invalid username or password");

      const data = await res.json();
      if (!data.ID || !data.token) return setError("Client does not exist");

      sessionStorage.setItem("accessToken", data.token);

      const userRes = await fetch(
        `http://localhost:8000/api/clients/${data.ID}`,
        {
          headers: { Authorization: `Bearer ${data.token}` },
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
      setView("profile");
    } catch (err) {
      console.error(err);
      setError("Something went wrong.");
    }
  };

  // Logout
  const handleLogout = () => {
    sessionStorage.clear();
    setUserData(null);
    setUsername("");
    setPassword("");
    setView("login");
  };
const handleRegister = async (e) => {
  e.preventDefault();
  setError("");
  try {
    const res = await fetch("http://localhost:8000/api/clients/register", {
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
    console.log(text); // "Client applied"

    // Move to verification form
    setTempUsername(regData.username);
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
      const res = await fetch("http://localhost:8000/api/clients/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        otpcode: verificationCode,
        username: tempUsername,
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
    setUsername(tempUsername);  // optionally prefill username
    setPassword("");
    setTempUsername("");
    setVerificationCode("");

  } catch (err) {
    console.error(err);
    setError("Something went wrong during verification.");
  }
};

if (view === "checking") return <p>Checking session...</p>;

  if (view === "profile" && userData) {
 return (
    <div className="profile-wrapper">
      <div className="profile-card">
        
        <div className="profile-header">
          <h1>My Profile</h1>
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        </div>

        <div className="profile-grid">
          <div className="profile-item">
            <span className="label">Emri</span>
            <span className="value">{userData.emri}</span>
          </div>

          <div className="profile-item">
            <span className="label">Mbiemri</span>
            <span className="value">{userData.mbiemri}</span>
          </div>

          <div className="profile-item">
            <span className="label">Username</span>
            <span className="value">{userData.username}</span>
          </div>

          <div className="profile-item">
            <span className="label">Email</span>
            <span className="value">{userData.email}</span>
          </div>

          <div className="profile-item">
            <span className="label">Gjinia</span>
            <span className="value">{userData.gjinia}</span>
          </div>

          <div className="profile-item">
            <span className="label">Numri i Telefonit</span>
            <span className="value">{userData.numriTelefonit}</span>
          </div>

          <div className="profile-item">
            <span className="label">Regjistruar</span>
            <span className="value">
              {new Date(userData.dataRegjistrimit).toLocaleString()}
            </span>
          </div>

          <div className="profile-item full">
            <span className="label">Përshkrimi</span>
            <span className="value">
              {userData.pershkrimi || "Nuk ka të dhëna"}
            </span>
          </div>
        </div>
      </div>
    </div>
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
          {["emri","mbiemri","numri_telefonit","pershkrimi","email","username","password"].map((field) => (
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

  // Login form
  return (
    <div className="login-container">
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        {error && <p className="error-message">{error}</p>}
        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label>Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit">Login</button>
      </form>
      <p style={{ marginTop: "10px" }}>
        Don't have an account?{" "}
        <span
          style={{ color: "blue", cursor: "pointer" }}
          onClick={() => setView("register")}
        >
          Create Account
        </span>
      </p>
    </div>
  );
}

export default LoginView;