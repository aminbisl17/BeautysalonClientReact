export async function fetchRefreshToken() {
  try {
    const res = await fetch(process.env.REACT_APP_REFRESH_TOKEN, {
      method: "POST",
      credentials: "include",
    });

    console.log("[refresh] status:", res.status);

    if (!res.ok) return res;

    const data = await res.json();
    console.log("[refresh] response keys:", Object.keys(data));

    const token = data.accessToken || data.token || data.access_token;
    if (!token) {
      console.warn("[refresh] no token in response:", data);
      return { ok: false };
    }

    sessionStorage.setItem("accessToken", token);
    return res;
  } catch (err) {
    console.error("[refresh] network/CORS error:", err);
    ExceptionHandler.handle(err);
    return { ok: false };
  }
}

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
      if (!accessToken || accessToken === "undefined") return null;

      const userRes = await fetch(process.env.REACT_APP_CLIENT_GET_DATA, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      console.log("[userData] status:", userRes.status);
      if (!userRes.ok) return null;

      const userInfo = await userRes.json();
      console.log("[userData] keys:", Object.keys(userInfo));
      sessionStorage.setItem("userDetails", JSON.stringify(userInfo));
      return userInfo;
    })().finally(() => {
      userPromise = null;
    });
  }
  return userPromise;
}