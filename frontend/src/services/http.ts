import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // ถ้า backend ใช้ cookie session
});

/**
 * ✅ ADD THIS REQUEST INTERCEPTOR
 * attach logged-in user id to every request
 */
http.interceptors.request.use((config) => {
  const raw = localStorage.getItem("user");
  if (raw) {
    try {
      const session = JSON.parse(raw);
      if (session?.id) {
        config.headers = config.headers ?? {};
        config.headers["x-user-id"] = session.id;
      }
    } catch {
      // ignore malformed localStorage
    }
  }
  return config;
});

/**
 * existing response interceptor (keep this)
 */
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    const requestUrl = String(err?.config?.url ?? "");
    const isLoginRequest = requestUrl.includes("/api/login");

    // Redirect to login on unauthorized requests,
    // but keep failed login attempts on the same page.
    if (status === 401 && !isLoginRequest) {
      localStorage.removeItem("user"); // optional but recommended
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
