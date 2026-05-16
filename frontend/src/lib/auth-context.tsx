import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { login as apiLogin, setAuthToken, getAuthToken, type AuthLoginResponse } from "@/lib/api";

export type UserRole = "admin" | "user";

export interface User {
  id: string;
  email: string;
  username: string;
  role: UserRole;
  departmentIds: string[];
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function mapAuthResponse(res: AuthLoginResponse): User {
  const isAdmin = res.roles?.includes("ROLE_ADMIN") ?? false;
  return {
    id: res.userId,
    email: res.email,
    username: res.email.split("@")[0],
    role: isAdmin ? "admin" : "user",
    departmentIds: res.departmentIds ?? [],
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      const roles: string[] = payload.roles ?? [];
      setUser({
        id: payload.userId,
        email: payload.sub,
        username: payload.sub?.split("@")[0] ?? "",
        role: roles.includes("ROLE_ADMIN") ? "admin" : "user",
        departmentIds: payload.departmentIds ?? [],
      });
    } catch {
      setAuthToken(null);
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiLogin(email, password);
    setAuthToken(res.token);
    setUser(mapAuthResponse(res));
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user && !!getAuthToken(),
        isAdmin: user?.role === "admin",
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
