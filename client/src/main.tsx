import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "sonner";

import App from "@/App";
import { SplashGate } from "@/components/SplashGate";
import { AuthProvider } from "@/contexts/AuthContext";
import { CentersProvider } from "@/contexts/CentersContext";
import { migrateStorageOnce } from "@/lib/migrateStorage";

import "@/index.css";

migrateStorageOnce();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <CentersProvider>
          <SplashGate>
            <App />
          </SplashGate>
          <Toaster richColors closeButton position="top-right" />
        </CentersProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
