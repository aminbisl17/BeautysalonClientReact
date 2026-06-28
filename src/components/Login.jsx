import React, { useState, useEffect } from "react";
import "../css/login.css";
import { jwtDecode } from "jwt-decode";
import OtpInput from "../components/OTPVerificationDialogue";
import { fetchRefreshToken } from "../javascript/APIs/Login";

function LoginView() {
  const [view, setView] = useState(() => {
    const storedUser = sessionStorage.getItem("userDetails");
    const token = sessionStorage.getItem("accessToken");
    if (storedUser && token) return "profile";
    return "checking";
  });
  
  const [error, setError] = useState("");
  const [numriTelefonit, setNumriTelefonit] = useState("");
  const [expandedRow, setExpandedRow] = useState(null);
  const [userData, setUserData] = useState({
    emri: "",
    mbiemri: "",
    numri_telefonit: "",
    email: "",
    emailVerified: false,
    clientHistory: [],
  });

  const [regData, setRegData] = useState({
    emri: "",
    mbiemri: "",
    numri_telefonit: "",
    email: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ emri: "", mbiemri: "", email: "" });

  const [verifyStep, setVerifyStep] = useState("choose"); // choose | emailInput | codeSent
  const [showEmailVerify, setShowEmailVerify] = useState(false);
  const [verifyEmail, setVerifyEmail] = useState("");
  const [otp, setOtp] = useState("");

  const [phoneError, setPhoneError] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [showHistoria, setShowHistoria] = useState(false);

  useEffect(() => {
    const autoLogin = async () => {
      try {
        await fetchRefreshToken();
        const accessToken = sessionStorage.getItem("accessToken");
        if (!accessToken) {
          setView("login");
          return;
        }

        const userRes = await fetch("http://192.168.100.116:8000/api/clients/data", {
          headers: { Authorization: `Bearer ${accessToken}` },
          credentials: "include",
        });

        if (!userRes.ok) {
          sessionStorage.clear();
          setView("login");
          return;
        }

        const userInfo = await userRes.json();
        sessionStorage.setItem("userDetails", JSON.stringify(userInfo));

        setUserData(userInfo);
        setVerifyEmail(userInfo.email || "");
        setEditData({
          emri: userInfo.emri || "",
          mbiemri: userInfo.mbiemri || "",
          email: userInfo.email || "",
        });
        setView("profile");
      } catch (err) {
        console.error(err);
        setView("login");
      }
    };
    autoLogin();
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("http://192.168.100.116:8000/auth/login/client", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ numri_telefonit: `+383${numriTelefonit}` }),
        credentials: "include",
      });

      const text = await res.text();
      if (!res.ok) {
        setError(text || "Numri i telefonit nuk u gjet");
        return;
      }
      setView("verify-login");
    } catch (err) {
      console.error(err);
      setError("Nuk u mundësua lidhje me serverin.");
    }
  };

  const fetchUserData = async () => {
    try {
      const token = sessionStorage.getItem("accessToken");
      const userRes = await fetch("http://192.168.100.116:8000/api/clients/data", {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });

      if (!userRes.ok) throw new Error("Failed to fetch user data");

      const userInfo = await userRes.json();
      sessionStorage.setItem("userDetails", JSON.stringify(userInfo));
      setUserData(userInfo);
    } catch (err) {
      console.error("fetchUserData error:", err);
    }
  };

  const sendVerificationCode = async (targetEmail) => {
    const emailToVerify = typeof targetEmail === "string" ? targetEmail : verifyEmail;
    const token = sessionStorage.getItem("accessToken");

    if (!emailToVerify || emailToVerify.trim() === "") {
      setError("Email është i zbrazët");
      return;
    }

    try {
      const res = await fetch("http://192.168.100.116:8000/api/clients/send/email-verification-request", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: emailToVerify }),
      });

      if (!res.ok) throw new Error("Failed to send code");
      setVerifyEmail(emailToVerify);
      setVerifyStep("codeSent");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Nuk u dërgua kodi. Provo përsëri.");
    }
  };

  const verifyEmailCode = async () => {
    const token = sessionStorage.getItem("accessToken");
    try {
      const res = await fetch("http://192.168.100.116:8000/api/clients/verify/email", {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: verifyEmail, otp: otp }),
      });

      if (!res.ok) {
        setError("Kodi është gabim ose ka skaduar");
        return;
      }

      setUserData((prev) => ({ ...prev, emailVerified: true }));
      setShowEmailVerify(false);
      setVerifyStep("choose");
      setOtp("");
      setError("");
    } catch (err) {
      console.error(err);
      setError("Gabim gjatë verifikimit");
    }
  };

  const handleVerify = async (code) => {
    setError("");
    try {
      const res = await fetch("http://192.168.100.116:8000/api/clients/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          otpcode: code,
          numri_telefonit: `+383${regData.numri_telefonit}`,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.json();
        setError(text.message || "Verifikimi dështoi");
        return;
      }

      setView("login");
      setVerificationCode("");
    } catch (err) {
      console.error(err);
      setError("Diçka shkoi gabim gjatë verifikimit.");
    }
  };

  const handleLogout = async () => {
    if (!window.confirm("Dëshironi të dilni?")) return;
    try {
      await fetch("http://192.168.100.116:8000/auth/delete-refresh-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      sessionStorage.clear();
      setNumriTelefonit("");
      setUserData({ emri: "", mbiemri: "", numri_telefonit: "", email: "", emailVerified: false });
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
      const payload = { ...regData, numri_telefonit: `+383${regData.numri_telefonit}` };
      const res = await fetch("http://192.168.100.116:8000/api/clients/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      const text = await res.text();
      if (!res.ok) {
        setError(text || "Regjistrimi dështoi");
        return;
      }

      setVerificationCode("");
      setView("verify");
    } catch (err) {
      console.error(err);
      setError("Diçka shkoi gabim gjatë regjistrimit.");
    }
  };

  const handleAutoVerify = async (code) => {
    setError("");
    try {
      const res = await fetch("http://192.168.100.116:8000/auth/login/client/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otpcode: code, numri_telefonit: `+383${numriTelefonit}` }),
        credentials: "include",
      });

      if (!res.ok) {
        const text = await res.text();
        setError(text.message || "OTP i pasaktë");
        setVerificationCode("");
        return;
      }

      const data = await res.json();
      sessionStorage.setItem("accessToken", data.token);

      const userRes = await fetch("http://192.168.100.116:8000/api/clients/data", {
        headers: { Authorization: `Bearer ${data.token}` },
        credentials: "include",
      });

      const userInfo = await userRes.json();
      sessionStorage.setItem("userDetails", JSON.stringify(userInfo));
      setVerificationCode("");
      setUserData(userInfo);
      setVerifyEmail(userInfo.email || "");
      setEditData({
        emri: userInfo.emri || "",
        mbiemri: userInfo.mbiemri || "",
        email: userInfo.email || "",
      });
      setView("profile");
    } catch (err) {
      console.error(err);
      setError("Verifikimi i OTP dështoi.");
    }
  };

  const handleChange = (e) => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    if (!window.confirm("Dëshiron të ruash ndryshimet?")) return;
    try {
      const res = await fetch("http://192.168.100.116:8000/api/clients/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("accessToken")}`,
        },
        credentials: "include",
        body: JSON.stringify(editData),
      });

      if (res.ok) {
        await fetchUserData();
        setIsEditing(false);
      } else {
        const msg = await res.text();
        setError(msg || "Gabim gjatë ruajtjes së të dhënave.");
      }
    } catch (err) {
      console.error(err);
      setError("Gabim në lidhje me serverin.");
    }
  };

  if (view === "checking") {
    return (
      <div className="auth-wrapper checking-view">
        <div className="spinner"></div>
        <p>Po verifikohet sesioni...</p>
      </div>
    );
  }

  if (view === "profile" && userData) {
    return (
      <div className="profile-page animate-fade-in">
        <div className="profile-container">
          <div className="profile-card">
            <div className="profile-card-header">
              <div className="avatar-badge">
                {userData.emri?.charAt(0)}
                {userData.mbiemri?.charAt(0)}
              </div>
              <div className="profile-meta-title">
                <h2>{userData.emri} {userData.mbiemri}</h2>
                <span className="subtitle-tag">Profili i klientit</span>
              </div>
            </div>

            <div className="profile-fields-grid">
              <div className="field-box">
                <label>Numri i telefonit</label>
                <div className="disabled-value-box">{userData.numri_telefonit || userData.numriTelefonit}</div>
              </div>

              <div className="field-box">
                <label>Email</label>
                {isEditing ? (
                  <input type="email" name="email" value={editData.email} onChange={handleChange} className="auth-input" />
                ) : (
                  <div className="disabled-value-box d-flex justify-between align-items-center">
                    <span>{userData.email || "—"}</span>
                    {userData.email && (
                      <span className={`status-badge-inline ${userData.emailVerified ? "verified" : "unverified"}`}>
                        {userData.emailVerified ? "I Verifikuar" : "I Paverifikuar"}
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="field-box">
                <label>Emri</label>
                {isEditing ? (
                  <input type="text" name="emri" value={editData.emri} onChange={handleChange} className="auth-input" />
                ) : (
                  <div className="disabled-value-box">{userData.emri}</div>
                )}
              </div>

              <div className="field-box">
                <label>Mbiemri</label>
                {isEditing ? (
                  <input type="text" name="mbiemri" value={editData.mbiemri} onChange={handleChange} className="auth-input" />
                ) : (
                  <div className="disabled-value-box">{userData.mbiemri}</div>
                )}
              </div>

              <div className="field-box full-width-row">
                <label>Data e regjistrimit</label>
                <div className="disabled-value-box">
                  {userData.dataRegjistrimit ? new Date(userData.dataRegjistrimit).toLocaleDateString("sq-AL") : "—"}
                </div>
              </div>
            </div>

            {error && <p className="error-banner">{error}</p>}

            <div className="profile-action-matrix">
              {userData.email && !userData.emailVerified && !isEditing && (
                <button className="auth-btn action-verify" onClick={() => { setError(""); setShowEmailVerify(true); }}>
                  ✉️ Verifiko Email-in
                </button>
              )}

              {!isEditing ? (
                <button className="auth-btn action-edit" onClick={() => setIsEditing(true)}>
                  Ndrysho të dhënat
                </button>
              ) : (
                <>
                  <button className="auth-btn action-save" onClick={handleSave}>Ruaj ndryshimet</button>
                  <button className="auth-btn action-cancel" onClick={() => { setIsEditing(false); setError(""); }}>Anulo</button>
                </>
              )}

              <button className="auth-btn action-history" onClick={() => setShowHistoria(true)}>📖 Historia ime</button>
              <button className="auth-btn action-logout" onClick={handleLogout}>Dil nga llogaria</button>
            </div>
          </div>
        </div>

        {/* EMAIL VERIFICATION MODAL */}
        {showEmailVerify && (
          <div className="custom-modal-backdrop">
            <div className="custom-modal-surface">
              <div className="modal-surface-header">
                <h3>Verifikimi i Email-it</h3>
                <button className="modal-close-trigger" onClick={() => { setShowEmailVerify(false); setVerifyStep("choose"); setOtp(""); setError(""); }}>&times;</button>
              </div>
              <div className="modal-surface-body">
                {error && <p className="error-banner">{error}</p>}
                
                {verifyStep === "choose" && (
                  <div className="step-container">
                    <p>Dëshironi ta verifikoni këtë adresë email-i?</p>
                    <div className="highlighted-email-box">{userData.email}</div>
                    <div className="modal-flex-buttons">
                      <button className="auth-btn action-save" onClick={() => sendVerificationCode(userData.email)}>Po, dërgo kodin</button>
                      <button className="auth-btn action-cancel" onClick={() => setVerifyStep("emailInput")}>Jo, ndrysho email-in</button>
                    </div>
                  </div>
                )}

                {verifyStep === "emailInput" && (
                  <div className="step-container">
                    <label className="input-field-label">Shkruaj adresën e re</label>
                    <input type="email" value={verifyEmail} onChange={(e) => setVerifyEmail(e.target.value)} className="auth-input mb-4" placeholder="emri@shembull.com" />
                    <button className="auth-btn action-edit" onClick={sendVerificationCode}>Dërgo kodin verifikues</button>
                  </div>
                )}

                {verifyStep === "codeSent" && (
                  <div className="step-container">
                    <p>Kodi gjashtëshifror u dërgua te <strong>{verifyEmail}</strong></p>
                    <input type="text" value={otp} onChange={(e) => setOtp(e.target.value)} className="auth-input numeric-otp-field mb-4" placeholder="000000" maxLength={6} />
                    <button className="auth-btn action-save" onClick={verifyEmailCode}>Verifiko Adresën</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SERVICES HISTORY MODAL */}
        {showHistoria && (
          <div className="custom-modal-backdrop">
            <div className="custom-modal-surface history-wide-surface">
              <div className="modal-surface-header">
                <h3>Historia e Shërbimeve</h3>
                <button className="modal-close-trigger" onClick={() => { setShowHistoria(false); setExpandedRow(null); }}>&times;</button>
              </div>
              <div className="modal-surface-body custom-scrollbar">
                {userData.clientHistory && userData.clientHistory.length > 0 ? (
                  <div className="history-cards-container">
                    {userData.clientHistory.map((entry, index) => {
                      const isExpanded = expandedRow === index;
                      const uniqueServices = Array.from(new Set(entry.detajet?.map((d) => d.emri_sherbimit).filter(Boolean)));
                      const totalCost = entry.detajet?.reduce((sum, d) => sum + (d.pagesa || 0), 0) || 0;

                      return (
                        <div key={entry.idHistoriku || index} className={`history-item-row-card ${isExpanded ? "expanded" : ""}`}>
                          <div className="history-item-summary-trigger" onClick={() => setExpandedRow(isExpanded ? null : index)}>
                            <div className="history-meta-left">
                              <span className="history-timestamp">
                                {entry.data_sherbimit ? new Date(entry.data_sherbimit).toLocaleDateString("sq-AL", { year: "numeric", month: "short", day: "numeric" }) : "—"}
                              </span>
                              <div className="history-badges-flex">
                                {uniqueServices.map((name, i) => (
                                  <span key={i} className="service-rendered-tag">{name}</span>
                                ))}
                              </div>
                            </div>
                            <div className="history-meta-right">
                              <span className="history-assigned-provider">{entry.emri_mbiemri_punonjesit || "—"}</span>
                              <span className="history-total-price">{totalCost.toFixed(2)} €</span>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="history-item-details-drawer animate-slide-down">
                              <div className="details-drawer-inner">
                                <h4>Specifikimi i detajuar i takimit</h4>
                                {entry.detajet && entry.detajet.length > 0 ? (
                                  <div className="details-subgrid">
                                    {entry.detajet.map((sub, i) => (
                                      <div key={i} className="detail-item-sub-card">
                                        <div className="sub-card-left">
                                          <div className="sub-card-title-line">
                                            <span className="category-marker">{sub.emri_sherbimit}</span>
                                            <h5>{sub.emri_atributit}</h5>
                                          </div>
                                          <p>{sub.pershkrimi || "Nuk ka përshkrim shtesë."}</p>
                                        </div>
                                        <div className="sub-card-right">+{sub.pagesa ? sub.pagesa.toFixed(2) : "0.00"} €</div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="no-data-text">Nuk ka të dhëna specifike për këtë shërbim.</p>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-history-state">Nuk u gjet asnjë histori shërbimesh për këtë llogari.</div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Auth Layout wrapper for Login, Register and OTP validation
  return (
    <div className="auth-wrapper page-center animate-fade-in">
      <div className="auth-card">
        {view === "login" && (
          <>
            <h2>Kyçu në Llogari</h2>
            <form onSubmit={handleLogin}>
              {error && <p className="error-banner">{error}</p>}
              <div className="auth-field-wrapper">
                <label>Numri i telefonit</label>
                <div className="prefix-input-combo">
                  <span className="combo-prefix">+383</span>
                  <input type="text" value={numriTelefonit} onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.startsWith("0")) val = val.substring(1);
                    setNumriTelefonit(val.slice(0, 8));
                  }} placeholder="4xxxxxxx" required maxLength={8} className="auth-combo-input" />
                </div>
              </div>
              <button type="submit" className="auth-btn btn-submit-primary">Dërgo kodin verifikues</button>
            </form>
            <p className="auth-switch-view-footer">Nuk ke llogari? <span onClick={() => { setView("register"); setError(""); setPhoneError(""); }}>Krijo llogari</span></p>
          </>
        )}

        {view === "register" && (
          <>
            <h2>Krijo Llogari të Re</h2>
            <form onSubmit={handleRegister}>
              {error && <p className="error-banner">{error}</p>}
              
              <div className="auth-field-wrapper">
                <label>Emri</label>
                <input type="text" value={regData.emri} onChange={(e) => setRegData({ ...regData, emri: e.target.value.replace(/[^a-zA-ZëËçÇ\s]/g, "") })} required className="auth-input" />
              </div>

              <div className="auth-field-wrapper">
                <label>Mbiemri</label>
                <input type="text" value={regData.mbiemri} onChange={(e) => setRegData({ ...regData, mbiemri: e.target.value.replace(/[^a-zA-ZëËçÇ\s]/g, "") })} required className="auth-input" />
              </div>

              <div className="auth-field-wrapper">
                <label>Numri i telefonit</label>
                <div className="prefix-input-combo">
                  <span className="combo-prefix">+383</span>
                  <input type="text" value={regData.numri_telefonit} onChange={(e) => {
                    let val = e.target.value.replace(/\D/g, "");
                    if (val.startsWith("0")) val = val.substring(1);
                    if (val.length > 8) return;
                    setRegData({ ...regData, numri_telefonit: val });
                    setPhoneError(val.length > 0 && val.length < 8 ? "Numri duhet të ketë saktësisht 8 shifra" : "");
                  }} placeholder="4xxxxxxx" required maxLength={8} className="auth-combo-input" />
                </div>
                {phoneError && <small className="field-inline-error">{phoneError}</small>}
              </div>

              <div className="auth-field-wrapper">
                <label>Email (Opsionale)</label>
                <input type="email" value={regData.email} onChange={(e) => setRegData({ ...regData, email: e.target.value })} className="auth-input" />
              </div>

              <button type="submit" className="auth-btn btn-submit-primary">Krijo llogari</button>
            </form>
            <p className="auth-switch-view-footer">Keni llogari? <span onClick={() => { setView("login"); setError(""); }}>Kyçu</span></p>
          </>
        )}

        {(view === "verify" || view === "verify-login") && (
          <>
            <h2>Verifikimi i Sigurisë</h2>
            <p className="auth-view-description">Shkruani kodin e dërguar në numrin tuaj të telefonit.</p>
            {error && <p className="error-banner">{error}</p>}
            <div className="otp-injection-slot">
              <OtpInput value={verificationCode} onChange={setVerificationCode} onComplete={(code) => view === "verify" ? handleVerify(code) : handleAutoVerify(code)} />
            </div>
            <button className="auth-btn action-cancel mt-4" onClick={() => { setView("login"); setVerificationCode(""); setError(""); }}>Anulo</button>
          </>
        )}
      </div>
    </div>
  );
}

export default LoginView;