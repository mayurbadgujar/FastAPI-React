import { useState} from "react";
import api from "../api";

export default function Register() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const register = async () => {
        try {
            const response = await api.post("/auth/register", {
                username,
                email,
                password,
            });
            if (response.status === 201) {
                alert(response.data.message || "Registration successful! Please log in.");
                window.location.href = "/login";
            }
        } catch (error) {
            console.error("Error registering user:", error);
            const message = error?.response?.data?.detail || "Registration failed";
            alert(message);
        }
    };

    return (
        <div className="container mt-5" style={{ maxWidth: 400 }}>
            <h2>Register</h2>
            <input
                type="text"
                className="form-control mb-3"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="email"
                className="form-control mb-3"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="password"
                className="form-control mb-3"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button className="btn btn-primary w-100" onClick={register}>
                Register
            </button>
        </div>
    );
}
