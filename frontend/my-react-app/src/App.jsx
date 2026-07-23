import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./Components/login.jsx";
import Register from "./Components/register.jsx";
import Home from "./Components/home.jsx";
import Doctor from "./Components/doctors/doctors.jsx";
import NavigationBar from "./Navbar/navbar.jsx";
import About from "./Components/about.jsx";
import Contact from "./Components/contact.jsx";

function App() {
  const token = localStorage.getItem("token");
  const location = useLocation();
  const hideNavbar = ["/login", "/auth/register"].includes(location.pathname);

  return (
    <>
      {!hideNavbar && <NavigationBar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route
          path="/"
          element={token ? <Home /> : <Navigate to="/login" replace />}
        />
        <Route path="/doctors" element={<Doctor />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
    </>
  );
}

export default App;
