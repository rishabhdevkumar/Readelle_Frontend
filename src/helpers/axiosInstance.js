import axios from "axios";

const axiosInstance = axios.create(); 

axiosInstance.defaults.baseURL = import.meta.env.VITE_BACKEND_URL; 

axiosInstance.defaults.withCredentials = true; 

// ── Request: attach token from localStorage ──────────────────────
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("token") || localStorage.getItem("authToken");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        console.log("[Axios]", config.method?.toUpperCase(), config.url, "| token:", token ? "present" : "MISSING");
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ── Response: handle 401 (token expired / invalid) ───────────────
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            console.warn("[Axios] 401 Unauthorized — clearing token");
            localStorage.removeItem("token");
            // Redirect to login without importing navigate (works everywhere)
            window.location.href = "/login";
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;