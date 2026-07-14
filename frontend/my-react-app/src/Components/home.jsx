import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/navbar.jsx";
import api from "../api";
import Doctors from "./doctors.jsx";

export default function Home() {
  const [user, setUser] = useState(null);
  const [response, setResponse] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const res = await api.get("/auth/current_user");
      setUser(res.data);
    } catch (error) {
      setUser(null);
      if (error?.response?.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        navigate("/login");
        return;
      }
      console.error("Failed to load current user:", error);
    }
  };

  const callEndpoint = async (method, url, data = null, config = {}) => {
    try {
      const res = await api.request({ method, url, data, ...config });
      setResponse({ status: res.status, data: res.data });
    } catch (error) {
      setResponse({
        status: error?.response?.status || "network error",
        data: error?.response?.data || error.message,
      });
      console.error("Endpoint error:", error);
    }
  };

  return (
    <>
      <Navbar />
    <Doctors/>
    </>
  );
}
