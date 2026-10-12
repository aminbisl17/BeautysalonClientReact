
import { ExceptionHandler } from "../Exceptions/ExceptionHandler";

export async function fetchRefreshToken() {
  try {
    const res = await fetch(process.env.REACT_APP_REFRESH_TOKEN, {
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

let userPromise = null;

export function getUserData(force = false) {
  const cached = sessionStorage.getItem("userDetails");
  if (cached && !force) return Promise.resolve(JSON.parse(cached));

  if (!userPromise || force) {
    userPromise = (async () => {
      const res = await fetchRefreshToken();
      if (!res || !res.ok) {
        sessionStorage.removeItem("userDetails");
        return null;
      }

      const accessToken = sessionStorage.getItem("accessToken");
      if (!accessToken) return null;

      const userRes = await fetch(process.env.REACT_APP_CLIENT_GET_DATA, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
      if (!userRes.ok) return null;

      const userInfo = await userRes.json();
      sessionStorage.setItem("userDetails", JSON.stringify(userInfo));
      return userInfo;
    })().finally(() => {
      userPromise = null;
    });
  }
  return userPromise;
}