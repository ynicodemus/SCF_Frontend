// src/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "https://scf-backend-92qq.onrender.com",
});

// ✅ Laging adminToken lang ang gagamitin
api.interceptors.request.use(
  (config) => {
    // wag isama token kung login endpoint
    if (config.url.includes("/admins/login")) {
      return config;
    }

    const token = localStorage.getItem("adminToken");
    if (token) {
      config.headers.Authorization = `Token ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = "/AdminLogin";
    }
    return Promise.reject(error);
  }
);

export default api;
