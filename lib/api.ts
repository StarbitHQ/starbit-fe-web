// lib/api.ts — FINAL VERSION (the one that actually works)
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

const getCookie = (name: string): string | null => {
  if (typeof document === "undefined") return null;
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()?.split(";").shift() || null;
  return null;
};

const defaultHeaders = () => {
  const token = getCookie("auth_token");
  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    "X-Requested-With": "XMLHttpRequest", // ← Laravel Sanctum needs this
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

export const api = {
  async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${API_BASE_URL}${path.startsWith("/") ? path : `/${path}`}`;

    const res = await fetch(url, {
      ...options,
      credentials: "include", // ← THIS SENDS COOKIES (session + XSRF + your auth_token)
      headers: {
        ...defaultHeaders(),
        ...(options.headers || {}),
      },
    });

    // Handle 401 → redirect to login
    if (res.status === 401) {
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }

    if (!res.ok) {
      let errorMessage = "Request failed";
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
      } catch {}
      throw new Error(errorMessage);
    }

    // Handle empty response (204 No Content)
    if (res.status === 204) return {} as T;

    return res.json();
  },

  get<T>(path: string) {
    return this.request<T>(path, { method: "GET" });
  },

  post<T>(path: string, body?: any) {
    return this.request<T>(path, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  patch<T>(path: string, body?: any) {
    return this.request<T>(path, {
      method: "PATCH",
      body: body ? JSON.stringify(body) : undefined,
    });
  },

  delete<T>(path: string) {
    return this.request<T>(path, { method: "DELETE" });
  },
};