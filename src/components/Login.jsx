import { useState, useEffect } from "react";
//import { useNavigate } from "react-router-dom";
import '../css/login.css';
import { ExceptionHandler } from "../javascript/Exceptions/ExceptionHandler";
import {jwtDecode} from "jwt-decode";

function LoginView() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(true); // track auto-login attempt // track backend errors
   // const navigate = useNavigate();

    useEffect(() => {
        const autoLogin = async () => {
            try {
                const res = await fetch(
                    "http://localhost:8000/auth/refresh-token",
                    { method: "POST", credentials: "include" }
                );

                if (!res.ok) {
                    setLoading(false);  // show form
                    return;
                }

                const data = await res.json();
                sessionStorage.setItem("accessToken", data.accessToken);

               // const decoded = jwtDecode(data.accessToken);
                 const clientId = (jwtDecode(data.accessToken)).id;

                const userRes = await fetch(
                    "http://localhost:8000/api/clients/" + clientId,
                    {
                        headers: { Authorization: `Bearer ${data.accessToken}` },
                        credentials: "include",
                    }
                );

                if (!userRes.ok) {
                   alert("Failed to fetch user data.");
                    setLoading(false);
                    return;
                }

                const userInfo = await userRes.json();
                sessionStorage.setItem("userDetails", JSON.stringify(userInfo));
                //navigate("/home"); 
                console.log(userInfo);
            } catch (err) {
                console.error(err);
                 ExceptionHandler.handle(err);
                setLoading(false); // show form
            }
        };

        autoLogin();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(
                "http://localhost:8000/auth/login/client",
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password }),
                    credentials: "include",
                }
            );

            if (response.status === 401) {
                alert("Invalid login");
                return;
            }

            const data = await response.json();
            sessionStorage.setItem("accessToken", data.token);

          //   const clientId = (jwtDecode(data.token)).id;

            const userRes = await fetch(
                "http://localhost:8000/api/clients/" + data.ID,
                {
                    headers: { Authorization: `Bearer ${data.token}` },
                    credentials: "include",
                }
            );

            if (!userRes.ok) {
                alert("Failed to fetch user data!");
                return;
            }

            const userInfo = await userRes.json();
            sessionStorage.setItem("userDetails", JSON.stringify(userInfo));

            console.log(userInfo);
            //navigate("/home");
        } catch (err) {
            console.error(err);
            ExceptionHandler.handle(err);
        }
    };

    if (loading) return <p>Checking session...</p>;

    return (
        <div className="login-container">
            <h1>Login</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>

                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default LoginView;