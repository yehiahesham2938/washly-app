import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { KEYS, getData, setData } from "@/services/storage";
import type { WashCenter } from "@/types";

type CentersContextValue = {
  centers: WashCenter[];
  setCenters: (next: WashCenter[]) => void;
  refresh: () => void;
};

const CentersContext = createContext<CentersContextValue | null>(null);

export function CentersProvider({ children }: { children: ReactNode }) {
  const [centers, setCentersState] = useState<WashCenter[]>(
    () => getData<WashCenter[]>(KEYS.centers) ?? []
  );

  const refresh = useCallback(() => {
    setCentersState(getData<WashCenter[]>(KEYS.centers) ?? []);
  }, []);

  useEffect(() => {
    const fn = () => refresh();
    window.addEventListener("washly-storage", fn);
    return () => window.removeEventListener("washly-storage", fn);
  }, [refresh]);

  const setCenters = useCallback((next: WashCenter[]) => {
    setData(KEYS.centers, next);
    setCentersState(next);
  }, []);

  const value = useMemo(
    () => ({ centers, setCenters, refresh }),
    [centers, setCenters, refresh]
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
