import { useEffect, useState, type ReactNode } from "react";

import { WashlyBrandLoader } from "@/components/WashlyBrandLoader";
import { cn } from "@/lib/utils";

const MIN_VISIBLE_MS = 900;
const FADE_MS = 500;

/**
 * Full-screen splash with animated Washly mark. Fades out after a short delay
 * so the app can paint underneath without a blank flash.
 */
export function SplashGate({ children }: { children: ReactNode }) {
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show");

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("fade"), MIN_VISIBLE_MS);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase !== "fade") return;
    const t = window.setTimeout(() => setPhase("gone"), FADE_MS + 50);
    return () => window.clearTimeout(t);
  }, [phase]);

  return (
    <>
      {children}
      {phase !== "gone" ? (
        <div
          className={cn(
            "fixed inset-0 z-[100] flex flex-col items-center justify-center gap-5 bg-background transition-opacity duration-500 ease-out",
            phase === "fade" ? "pointer-events-none opacity-0" : "opacity-100"
          )}
          aria-hidden
        >
          <WashlyBrandLoader />
        </div>
      ) : null}
    </>
  );
}
