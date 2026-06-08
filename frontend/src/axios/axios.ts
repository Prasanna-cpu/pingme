import * as axios from "axios";

// In development we rely on the Vite dev server proxy to forward /api and /auth
// to the backend so requests are same-origin and cookies work correctly.
export const axiosInstance = axios.create({
    baseURL : import.meta.env.MODE === "development" ? '' : "/",
    withCredentials : true,
})