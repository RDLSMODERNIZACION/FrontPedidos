// src/lib/auth.ts
"use client";

export type AuthState = {
  token: string | null;
  user?: any | null;
  expiresAt?: number | null;
};

const AUTH_KEY = "auth";
const TOKEN_KEYS = ["token", "access_token", "idToken", "jwt", "bearer"];

const isBrowser = () => typeof window !== "undefined";

export function loadAuth(): AuthState | null {
  if (!isBrowser()) return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const token =
        typeof parsed?.token === "string" && parsed.token.trim()
          ? parsed.token
          : guessTokenFromFlatStorage();
      return { token, user: parsed?.user ?? null, expiresAt: parsed?.expiresAt ?? null };
    }
  } catch {}
  const token = guessTokenFromFlatStorage();
  if (token) return { token, user: null, expiresAt: null };
  return null;
}

export function saveAuth(next: AuthState) {
  if (!isBrowser()) return;
  const token = next.token ?? null;
  try {
    localStorage.setItem(
      AUTH_KEY,
      JSON.stringify({ token, user: next.user ?? null, expiresAt: next.expiresAt ?? null })
    );
    if (token) localStorage.setItem("token", token);
    else localStorage.removeItem("token");
  } catch {}
}

export function clearAuth() {
  if (!isBrowser()) return;
  try {
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem("token");
    // por si alguna vez se usaron otras claves
    TOKEN_KEYS.forEach((k) => localStorage.removeItem(k));
  } catch {}
}

function guessTokenFromFlatStorage(): string | null {
  for (const k of TOKEN_KEYS) {
    try {
      const v = localStorage.getItem(k);
      if (v && v.trim()) return v;
    } catch {}
  }
  return null;
}
