/** Backend origin: `VITE_API_URL` if set, else `http://{VITE_API_HOST}:{VITE_API_PORT}` (defaults: localhost:5000). */
function resolveApiBase(): string {
  const full = import.meta.env.VITE_API_URL?.trim();
  if (full) return full.replace(/\/$/, "");
  const host = (import.meta.env.VITE_API_HOST ?? "localhost").trim();
  const port = (import.meta.env.VITE_API_PORT ?? "5000").trim();
  return `http://${host}:${port}`;
}

const BASE = resolveApiBase();

export const TOKEN_KEY = "washly_token";

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

function joinBase(path: string): string {
  if (path.startsWith("http")) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${BASE}${p}`;
}

async function readErrorMessage(res: Response): Promise<string> {
  try {
    const data = (await res.json()) as { message?: string; detail?: string };
    if (data?.message && data?.detail) return `${data.message} ${data.detail}`;
    if (data?.message) return data.message;
    if (data?.detail) return data.detail;
  } catch {
    // ignore
  }
  return res.statusText || "Request failed";
}

/** JSON fetch with Bearer token when present. Paths are relative to `VITE_API_URL` (e.g. `/api/...`). */
export async function apiRequest(
  path: string,
  init: RequestInit = {}
): Promise<Response> {
  const url = joinBase(path);
  const headers = new Headers(init.headers);
  const token = getStoredToken();
  if (token && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (
    init.body != null &&
    !(init.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {
    headers.set("Content-Type", "application/json");
  }
  return fetch(url, { ...init, headers });
}

export async function getJSON<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await apiRequest(path, init);
  if (res.status === 401) {
    setStoredToken(null);
  }
  if (!res.ok) {
    throw new Error(await readErrorMessage(res));
  }
  if (res.status === 204) {
    return undefined as T;
  }
  return res.json() as Promise<T>;
}

export async function parseError(res: Response): Promise<string> {
  return readErrorMessage(res);
}
