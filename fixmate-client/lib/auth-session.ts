export type AuthRole = "customer" | "technician" | "admin";

export interface AuthUser {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  area?: string;
  bio?: string;
  image?: string;
  role?: AuthRole;
}

export const AUTH_SESSION_CHANGE_EVENT = "fixmate:auth-session-change";

export function isAuthRole(role: unknown): role is AuthRole {
  return role === "customer" || role === "technician" || role === "admin";
}

export function getDashboardPath(role?: AuthRole): string {
  return `/dashboard/${role ?? "customer"}`;
}

const AUTH_TOKEN_KEY = "fixmate_token";
const AUTH_USER_KEY = "fixmate_user";

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(AUTH_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function getAuthUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(AUTH_USER_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthUser;
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}

export function setAuthSession(
  token?: string | null,
  user?: AuthUser | null,
) {
  if (typeof window === "undefined") return;
  try {
    if (token) {
      window.localStorage.setItem(AUTH_TOKEN_KEY, token);
    } else {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
    }

    if (user) {
      window.localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    } else {
      window.localStorage.removeItem(AUTH_USER_KEY);
    }
  } catch {
    // localStorage unavailable -> ignore
  }
  window.dispatchEvent(new Event(AUTH_SESSION_CHANGE_EVENT));
}

export function clearAuthSession() {
  setAuthSession(null, null);
}
