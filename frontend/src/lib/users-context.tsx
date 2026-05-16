import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import {
  assignUserDepartments,
  getUsers,
  registerUser,
  type BackendUser,
} from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/auth-context";

export interface SystemUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  docs: number;
  departmentIds: string[];
  createdAt: Date;
}

interface UsersContextType {
  users: SystemUser[];
  loading: boolean;
  refresh: () => Promise<void>;
  addUser: (email: string, password: string, role: UserRole) => Promise<void>;
  assignUserDepartments: (userId: string, departmentIds: string[]) => Promise<void>;
}

const UsersContext = createContext<UsersContextType | null>(null);

const toUser = (u: BackendUser): SystemUser => ({
  id: u.id,
  name: u.email.split("@")[0],
  email: u.email,
  role: u.roles?.includes("ROLE_ADMIN") ? "admin" : "user",
  docs: 0,
  departmentIds: u.departmentIds ?? [],
  createdAt: new Date(),
});

export function UsersProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const [users, setUsers] = useState<SystemUser[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated || !isAdmin) return;
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data.map(toUser));
    } catch (e) {
      console.error("Failed to load users", e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, isAdmin]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addUser = useCallback(async (email: string, password: string, role: UserRole) => {
    const roles = role === "admin" ? ["ROLE_ADMIN", "ROLE_USER"] : ["ROLE_USER"];
    await registerUser({ email, password, roles });
    await refresh();
  }, [refresh]);

  const assignDepts = useCallback(async (userId: string, departmentIds: string[]) => {
    await assignUserDepartments(userId, departmentIds);
    await refresh();
  }, [refresh]);

  return (
    <UsersContext.Provider
      value={{ users, loading, refresh, addUser, assignUserDepartments: assignDepts }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  const ctx = useContext(UsersContext);
  if (!ctx) throw new Error("useUsers must be used within UsersProvider");
  return ctx;
}
