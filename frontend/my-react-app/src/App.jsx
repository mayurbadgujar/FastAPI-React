import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./Components/login.jsx";
import Register from "./Components/register.jsx";
import Home from "./Components/home.jsx";
import Doctor from "./Components/doctors/doctors.jsx";
import Patients from "./Components/patient/patients.jsx";
import MainLayout from "./Components/layout/MainLayout.jsx";
import ProtectedRoute from "./Components/layout/ProtectedRoute.jsx";
import About from "./Components/about.jsx";
import Contact from "./Components/contact.jsx";
import { ROLES } from "./constants/roles.js";

function App() {
  return (
    <MainLayout>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/auth/register" element={<Register />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctors"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN, ROLES.DOCTOR, ROLES.PATIENT]}>
              <Doctor />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patients"
          element={
            <ProtectedRoute roles={[ROLES.ADMIN, ROLES.DOCTOR]}>
              <Patients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/about"
          element={
            <ProtectedRoute>
              <About />
            </ProtectedRoute>
          }
        />
        <Route
          path="/contact"
          element={
            <ProtectedRoute>
              <Contact />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
