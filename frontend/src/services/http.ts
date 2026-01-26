import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true, // ถ้า backend ใช้ cookie session
});

// ถ้าใช้ JWT แทน cookie ให้ uncomment และ set token ใน localStorage
// http.interceptors.request.use((config) => {
//   const token = localStorage.getItem("token");
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

http.interceptors.response.use(
  (res) => res,
  (err) => {
    // ถ้า backend ส่ง 401 ให้เด้งไปหน้า login
    if (err?.response?.status === 401) {
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);
