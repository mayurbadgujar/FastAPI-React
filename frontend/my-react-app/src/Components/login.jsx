import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import api from "../api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const token = localStorage.getItem("token");
  const storedUser = localStorage.getItem("user");
  const isAuthenticated = token && storedUser;
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const login = async () => {
    try {
      const response = await api.post("/auth/login", {
        username,
        password,
      });

      const token = response.data.access_token;
      if (token) {
        localStorage.setItem("token", token);
      }
      if (response.data.user) {
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }

      navigate("/");
    } catch (error) {
      console.error(error);
      const message = error?.response?.data?.detail || "Login failed";
      alert(message);
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: 400 }}>
      <h3>Login</h3>

      <input
        className="form-control mb-3"
        type="text"
        placeholder="Username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
      />

      <input
        className="form-control mb-3"
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <button className="btn btn-primary w-100" onClick={login}>
        Login
      </button>
      <Link to="/auth/register" className="btn btn-link w-100 mt-2">
        Don't have an account? Register
      </Link>
    </div>
  );
}
