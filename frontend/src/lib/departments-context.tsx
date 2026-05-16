import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { createDepartment, deleteDepartment, getDepartments, type BackendDepartment } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export interface Department {
  id: string;
  name: string;
  description: string;
  userCount: number;
  createdAt: Date;
}

interface DepartmentsContextType {
  departments: Department[];
  loading: boolean;
  refresh: () => Promise<void>;
  addDepartment: (name: string, description: string) => Promise<void>;
  deleteDepartment: (id: string) => Promise<void>;
}

const DepartmentsContext = createContext<DepartmentsContextType | null>(null);

const toDepartment = (d: BackendDepartment): Department => ({
  id: d.id,
  name: d.name,
  description: d.description,
  userCount: d.userCount,
  createdAt: new Date(),
});

export function DepartmentsProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await getDepartments();
      setDepartments(data.map(toDepartment));
    } catch (e) {
      console.error("Failed to load departments", e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addDepartment = useCallback(async (name: string, description: string) => {
    const created = await createDepartment(name, description);
    setDepartments((prev) => [...prev, toDepartment(created)]);
  }, []);

  const deleteDepartmentFn = useCallback(async (id: string) => {
    await deleteDepartment(id);
    setDepartments((prev) => prev.filter((d) => d.id !== id));
  }, []);

  return (
    <DepartmentsContext.Provider
      value={{
        departments,
        loading,
        refresh,
        addDepartment,
        deleteDepartment: deleteDepartmentFn,
      }}
    >
      {children}
    </DepartmentsContext.Provider>
  );
}

export function useDepartments() {
  const ctx = useContext(DepartmentsContext);
  if (!ctx) throw new Error("useDepartments must be used within DepartmentsProvider");
  return ctx;
}
