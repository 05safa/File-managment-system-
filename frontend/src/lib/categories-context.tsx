import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { createCategory, getCategories, type BackendCategory } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export interface Category {
  id: string;
  name: string;
}

interface CategoriesContextType {
  categories: Category[];
  loading: boolean;
  refresh: () => Promise<void>;
  addCategory: (name: string) => Promise<void>;
}

const CategoriesContext = createContext<CategoriesContextType | null>(null);

export function CategoriesProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (e) {
      console.error("Failed to load categories", e);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const addCategory = useCallback(async (name: string) => {
    const created: BackendCategory = await createCategory(name);
    setCategories((prev) => [...prev, created]);
  }, []);

  return (
    <CategoriesContext.Provider value={{ categories, loading, refresh, addCategory }}>
      {children}
    </CategoriesContext.Provider>
  );
}

export function useCategories() {
  const ctx = useContext(CategoriesContext);
  if (!ctx) throw new Error("useCategories must be used within CategoriesProvider");
  return ctx;
}
