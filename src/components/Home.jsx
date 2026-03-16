// src/views/Home.jsx
import React, { useEffect, useState } from "react";
import { fetchServices } from "../javascript/APIs/ServicesAPI";
import { ExceptionHandler } from "../javascript/Exceptions/ExceptionHandler";

function Home() {


  const [Services, setServices] = useState([]);
  useEffect(() => {
   loadServices();
  }, []);

  async function loadServices() {
    try{
      const data = await fetchServices();

      setServices(data);
    } catch(err){
      ExceptionHandler(err);
    }
  }
  return (
    <div>
      <h1>Home View</h1>
      {Services.map((ser)=>(
          <tr 
      key={ser.ID}
   //   onClick={() => onSelect?.(ser)}
    > 
      <td>{ser.ID}</td>
      <td>{ser.emri_sherbimit}</td>
      <td>{ser.is_active ? "Yes" : "No"}</td>
      <td>{ser.kohezgjatja}</td>
      <td>{ser.pershkrimi}</td>
      <td>{ser.qmimi_baze}</td>
      <td>{ser.zbritja}</td>
      <td>{new Date(ser.created_at).toLocaleString()}</td>
      <td>{new Date(ser.update_at).toLocaleString()}</td>
    </tr>
      ))}
    </div>
  );
}

export default Home;