// src/lib/auth.ts
'use client';

export type AuthUser = {
  username: string;
  secretaria: string;      // nombre amigable (lo que hoy usas en forms)
  secretaria_id?: number;  // opcional si luego filtras por id
};

export type AuthState = {
  token: string;
  user: AuthUser;
};

const LS_KEY = 'auth_state_v1';

export function saveAuth(state: AuthState) {
  localStorage.setItem(LS_KEY, JSON.stringify(state));
}

export function loadAuth(): AuthState | null {
  try {
    const raw = localStorage.getItem(LS_KEY);
    return raw ? JSON.parse(raw) as AuthState : null;
  } catch { return null; }
}

export function clearAuth() {
  localStorage.removeItem(LS_KEY);
}
