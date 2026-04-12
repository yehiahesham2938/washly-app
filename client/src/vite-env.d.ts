/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Full API origin; when set, overrides VITE_API_HOST / VITE_API_PORT */
  readonly VITE_API_URL?: string;
  readonly VITE_API_HOST?: string;
  readonly VITE_API_PORT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
