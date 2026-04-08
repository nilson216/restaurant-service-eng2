"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  login: (user: User, accessToken: string) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Initial load from localStorage
    const storedUser = localStorage.getItem("user");
    const storedToken = localStorage.getItem("accessToken");

    if (storedUser && storedToken) {
      setUser(JSON.parse(storedUser));
      setAccessToken(storedToken);
    }
    setLoading(false);
  }, []);

  // Set up token refresh timer
  useEffect(() => {
    if (!accessToken) return;

    // Refresh token every 25 minutes (before it expires in 30)
    const refreshInterval = setInterval(async () => {
      await refreshAccessToken();
    }, 25 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [accessToken]);

  const login = (userData: User, token: string) => {
    setUser(userData);
    setAccessToken(token);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("accessToken", token);
  };

  const logout = async () => {
    setUser(null);
    setAccessToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("accessToken");
    
    // Clear cookie by calling a logout endpoint
    await fetch("/api/auth/logout", { method: "POST" });
    
    router.push("/login");
  };

  const refreshAccessToken = async () => {
    try {
      const res = await fetch("/api/auth/refresh", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setAccessToken(data.accessToken);
        localStorage.setItem("accessToken", data.accessToken);
        return data.accessToken;
      } else {
        logout();
        return null;
      }
    } catch (err) {
      console.error("Refresh token error:", err);
      logout();
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, accessToken, login, logout, refreshAccessToken }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
