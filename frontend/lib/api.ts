import axios from "axios";
import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "./auth";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_DJANGO_API_URL || "http://localhost:8000/api"
})

api.interceptors.request.use((config) => {
    const accessToken = getAccessToken();
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {

        const originalRequest = error.config;
        const url: string = originalRequest?.url || "";
        const isAuthCall = ["/auth/login/", "/auth/register/", "/auth/refresh/"].some((p) => url.includes(p));

        if (error.response?.status === 401 && !originalRequest._retry && !isAuthCall) {
            originalRequest._retry = true;
            const refresh = getRefreshToken();
            if (refresh) {
                try {
                    const { data } = await api.post(`${api.defaults.baseURL}/auth/refresh/`, { refresh });
                    saveTokens(data.access, data.refresh);
                    return api(originalRequest);
                } catch {
                    // fall through logout below
                }
            }
            clearTokens();
            window.location.href = "/login?expired=1";
        }

        return Promise.reject(error);
    }
);

export default api;
