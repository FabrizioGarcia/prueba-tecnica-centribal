import { createContext, useContext, useEffect, useState } from "react";
import { fetchCurrentAgent, login as loginRequest, logout as logoutRequest } from "../api/auth";
import { getToken, setToken } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [agent, setAgent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!getToken()) {
      setLoading(false);
      return;
    }

    fetchCurrentAgent()
      .then(setAgent)
      .catch(() => setToken(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(email, password) {
    const data = await loginRequest(email, password);
    setToken(data.token);
    setAgent(data.agent);
  }

  async function logout() {
    try {
      await logoutRequest();
    } finally {
      setToken(null);
      setAgent(null);
    }
  }

  return (
    <AuthContext.Provider value={{ agent, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
