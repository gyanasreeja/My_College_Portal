/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState } from "react";
import api from "../api/client";

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const rolePrefix = (role) =>
  role === "student" ? "/student" : role === "admin" ? "/admin" : "/staff";

export const homeFor = (role) =>
  role === "student" ? "/student" : role === "admin" ? "/admin" : "/staff/attendance";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [role, setRole] = useState(localStorage.getItem("role"));

  const login = async (email, password) => {
    const form = new URLSearchParams({ username: email, password });
    const { data } = await api.post("/auth/login", form);
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("role", data.role);
    setToken(data.access_token);
    setRole(data.role);
    return data.role;
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    setToken(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ token, role, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}