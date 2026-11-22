import { authClient } from "./auth-client";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/$/, "");

export class ApiError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status: number, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let cache: { token: string; exp: number } | null = null;
export const clearTokenCache = () => { cache = null; };

async function getToken(force = false): Promise<string | null> {
  if (!force && cache && cache.exp > Date.now() + 30_000) return cache.token;
  const { data, error } = await authClient.token();
  if (error || !data?.token) return null;
  let exp = Date.now() + 10 * 60_000;
  try {
    const b64 = data.token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    exp = JSON.parse(atob(b64)).exp * 1000;
  } catch {}
  cache = { token: data.token, exp };
  return data.token;
}

type Opts = { method?: string; body?: unknown; auth?: boolean; form?: FormData };

export async function api<T = any>(path: string, opts: Opts = {}): Promise<T> {
  const { method = "GET", body, auth = true, form } = opts;
  const run = async (force: boolean) => {
    const headers: Record<string, string> = {};
    if (auth) {
      const t = await getToken(force);
      if (!t) throw new ApiError("Please sign in to continue", 401);
      headers.Authorization = `Bearer ${t}`;
    }
    if (body !== undefined) headers["Content-Type"] = "application/json";
    return fetch(`${API_URL}${path}`, { method, headers, body: form ?? (body !== undefined ? JSON.stringify(body) : undefined) });
  };
  let res: Response;
  try {
    res = await run(false);
    if (res.status === 401 && auth) res = await run(true); // token may have just expired
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError("Cannot reach the server. Check your connection and try again.", 0);
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) throw new ApiError(data?.message ?? `Request failed (${res.status})`, res.status, data?.code);
  return data as T;
}

export async function uploadImage(file: File): Promise<string> {
  const form = new FormData();
  form.append("images", file);
  const r = await api<{ urls: string[] }>("/api/upload", { method: "POST", form });
  return r.urls[0];
}

export const errMsg = (e: unknown) => (e instanceof Error ? e.message : "Something went wrong");
