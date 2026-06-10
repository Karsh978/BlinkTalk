import axios from "axios";

export const axiosInstance = axios.create({
  baseURL:import.meta.env.VITE_API_URL,
  withCredentials: true, // Ye cookies bhejne ke liye zaroori hai
});