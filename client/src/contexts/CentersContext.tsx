import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  createCenter as apiCreateCenter,
  deleteCenter as apiDeleteCenter,
  fetchCenters,
  updateCenter as apiUpdateCenter,
} from "@/services/api/centers";
import type { WashCenter } from "@/types";

type CentersContextValue = {
  centers: WashCenter[];
  loading: boolean;
  error: string | null;
  refreshCenters: () => Promise<void>;
  createCenter: (center: WashCenter) => Promise<void>;
  updateCenter: (center: WashCenter) => Promise<void>;
  deleteCenter: (id: string) => Promise<void>;
};

const CentersContext = createContext<CentersContextValue | null>(null);

export function CentersProvider({ children }: { children: ReactNode }) {
  const [centers, setCenters] = useState<WashCenter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshCenters = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchCenters();
      setCenters(list);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load centers");
      setCenters([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCenters();
  }, [refreshCenters]);

  const createCenter = useCallback(async (center: WashCenter) => {
    const created = await apiCreateCenter(center);
    setCenters((prev) => [...prev, created]);
  }, []);

  const updateCenter = useCallback(async (center: WashCenter) => {
    const updated = await apiUpdateCenter(center);
    setCenters((prev) =>
      prev.map((c) => (c.id === updated.id ? updated : c))
    );
  }, []);

  const deleteCenter = useCallback(async (id: string) => {
    await apiDeleteCenter(id);
    setCenters((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const value = useMemo(
    () => ({
      centers,
      loading,
      error,
      refreshCenters,
      createCenter,
      updateCenter,
      deleteCenter,
    }),
    [
      centers,
      loading,
      error,
      refreshCenters,
      createCenter,
      updateCenter,
      deleteCenter,
    ]
  );

  return (
    <CentersContext.Provider value={value}>{children}</CentersContext.Provider>
  );
}

export function useCenters() {
  const ctx = useContext(CentersContext);
  if (!ctx) throw new Error("useCenters must be used within CentersProvider");
  return ctx;
}
