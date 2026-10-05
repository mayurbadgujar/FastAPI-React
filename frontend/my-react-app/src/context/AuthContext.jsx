import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import {
  canManageDoctors,
  canManagePatients,
  canViewDoctors,
  canViewPatients,
} from "../utils/permissions";

const AuthContext = createContext(null);

function readStoredUser() {
  const raw = localStorage.getItem("user");
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    localStorage.removeItem("user");
    return null;
  }
}

export function AuthProvider({ children }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(readStoredUser);
  const [loading, setLoading] = useState(Boolean(localStorage.getItem("token")));

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      setUser(null);
      setLoading(false);
      return null;
    }

    try {
      const res = await api.get("/auth/current_user");
      setUser(res.data);
      localStorage.setItem("user", JSON.stringify(res.data));
      return res.data;
    } catch {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = useCallback(
    async (username, password) => {
      const response = await api.post("/auth/login", { username, password });
      const token = response.data.access_token;
      if (token) {
        localStorage.setItem("token", token);
      }
      if (response.data.user) {
        setUser(response.data.user);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      }
      return response.data.user;
    },
    [],
  );

  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    navigate("/login");
  }, [navigate]);

  const value = useMemo(() => {
    const role = user?.role ?? null;
    return {
      user,
      role,
      loading,
      isAuthenticated: Boolean(user && localStorage.getItem("token")),
      login,
      logout,
      refreshUser,
      permissions: {
        canViewDoctors: canViewDoctors(role),
        canManageDoctors: canManageDoctors(role),
        canViewPatients: canViewPatients(role),
        canManagePatients: canManagePatients(role),
      },
    };
  }, [user, loading, login, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
