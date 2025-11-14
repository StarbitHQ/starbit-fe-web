// lib/api.ts
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

/**
 * Helper to get auth token from cookies
 */
const getCookie = (name: string): string | null => {
  if (typeof document === 'undefined') return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
  return null;
};

export const api = {
  async get<T>(path: string): Promise<T> {
    const token = getCookie('auth_token');
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Request failed");
    }

    return res.json() as Promise<T>;
  },

  async post<T>(path: string, body: any): Promise<T> {
    const token = getCookie('auth_token');
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Request failed");
    }

    return res.json() as Promise<T>;
  },

  async patch<T>(path: string, body: any): Promise<T> {
    const token = getCookie('auth_token');
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

    const res = await fetch(url, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Request failed");
    }

    return res.json() as Promise<T>;
  },

  async delete<T>(path: string): Promise<T> {
    const token = getCookie('auth_token');
    if (!token) {
      throw new Error("No authentication token found");
    }

    const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

    const res = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message ?? "Request failed");
    }

    return res.json() as Promise<T>;
  },
};