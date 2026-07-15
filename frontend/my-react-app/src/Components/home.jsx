import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../Navbar/navbar.jsx";
import api from "../api";
import Doctors from "./doctors.jsx";

export default function Home() {
  const [user, setUser] = useState(null);
  const [response, setResponse] = useState(null);
  const navigate = useNavigate();

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
      <Doctors />
    </>
  );
}
