import React, { useEffect, useState } from "react";

const Profile = () => {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Get user details from sessionStorage
    const storedData = sessionStorage.getItem("userDetails");
    if (storedData) {
      setUserData(JSON.parse(storedData));
    }
  }, []);

  if (!userData) return <p>Loading profile...</p>;

  return (
    <div className="profile-container" style={{ padding: "20px" }}>
      <h1>Profile</h1>

      <div style={{ marginBottom: "10px" }}>
        <strong>Emri:</strong> {userData.emri}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Mbiemri:</strong> {userData.mbiemri}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Username:</strong> {userData.username}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Email:</strong> {userData.email}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Gjinia:</strong> {userData.gjinia}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Numri i Telefonit:</strong> {userData.numriTelefonit}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Data e Regjistrimit:</strong>{" "}
        {new Date(userData.dataRegjistrimit).toLocaleString()}
      </div>
      <div style={{ marginBottom: "10px" }}>
        <strong>Pershkrimi:</strong>{" "}
        {userData.pershkrimi ? userData.pershkrimi : "Nuk ka të dhëna"}
      </div>

      <div style={{ marginTop: "20px" }}>
        <strong>Client History:</strong>
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