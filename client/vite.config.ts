import path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig(({ mode }) => {
  const root = __dirname;
  const env = loadEnv(mode, root, "");
  const apiTarget =
    env.VITE_API_URL?.replace(/\/$/, "") ||
    `http://${env.VITE_API_HOST ?? "localhost"}:${env.VITE_API_PORT ?? "5000"}`;

  return {
    plugins: [react()],
    server: {
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    /** Same as dev — `vite preview` does not use `server` by default */
    preview: {
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
