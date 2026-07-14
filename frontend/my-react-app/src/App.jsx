import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/login.jsx";
import Register from "./Components/register.jsx";
import Home from "./Components/home.jsx";
import Doctor from "./Components/doctors.jsx";

function App() {
  const token = localStorage.getItem("token");

  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route path="/" element={token ? <Home /> : <Navigate to="/login" replace />} />
        <Route path="/doctors" element={<Doctor />} />
      </Routes>
    </>
  );
}

export default App;
