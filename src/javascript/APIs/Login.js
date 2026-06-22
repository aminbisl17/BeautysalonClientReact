import { Alert } from "bootstrap";
import { ExceptionHandler } from "../Exceptions/ExceptionHandler";

export async function fetchRefreshToken() {
  try {
    const res = await fetch("http://192.168.100.116:8000/auth/refresh-token", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      const data = await res.json();
      sessionStorage.setItem("accessToken", data.accessToken);
    }
    
    return res; 
  } catch (err) {
    ExceptionHandler.handle(err);
    // Return a fake failed response object or null so the calling function doesn't crash
    return { ok: false }; 
  }
}