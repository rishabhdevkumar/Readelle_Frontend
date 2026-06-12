import axios from "axios";

const axiosInstance = axios.create(); 

axiosInstance.defaults.baseURL = import.meta.env.VITE_BACKEND_URL; 
console.log("Backend URL:", import.meta.env.VITE_BACKEND_URL);

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
        // Check karein kya error login endpoint se aa rahi hai
        const isLoginAPI = error?.config?.url?.includes("/users/login");

        if (error?.response?.status === 401) {
            // Agar LOGIN API par 401 aaya hai (Invalid credentials), toh reload MAT karo
            if (isLoginAPI) {
                return Promise.reject(error);
            }

            // Kisi aur route (jaise dashboard, profile) par 401 aaye tabhi redirect karo
            console.warn("[Axios] 401 Unauthorized — clearing token");
            localStorage.removeItem("token");
            
            // Sirf tab redirect karein jab hum pehle se login page par na hon
            if (window.location.pathname !== "/login") {
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;