import React, { useEffect, useState } from "react";
import "../css/profile.css";

const Profile = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const storedData = sessionStorage.getItem("userDetails");
    if (storedData) setUserData(JSON.parse(storedData));
  }, []);

  if (!userData) return <p className="loading">Loading profile...</p>;

  return (
    <div className="profile-container">
      <h1>My Profile</h1>

      <div className="profile-info">
        <label>Emri:</label> <span>{userData.emri}</span>
        <label>Mbiemri:</label> <span>{userData.mbiemri}</span>
        <label>Username:</label> <span>{userData.username}</span>
        <label>Email:</label> <span>{userData.email}</span>
        <label>Gjinia:</label> <span>{userData.gjinia}</span>
        <label>Numri i Telefonit:</label> <span>{userData.numriTelefonit}</span>
        <label>Data e Regjistrimit:</label>{" "}
        <span>{new Date(userData.dataRegjistrimit).toLocaleString()}</span>
        <label>Pershkrimi:</label>{" "}
        <span>{userData.pershkrimi || "Nuk ka të dhëna"}</span>
      </div>

      <div className="client-history">
        <h2>Client History</h2>
        {userData.clientHistory.length === 0 ? (
          <p>Nuk ka histori</p>
        ) : (
          <ul>
            {userData.clientHistory.map((item, index) => (
              <li key={index}>{JSON.stringify(item)}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Profile;