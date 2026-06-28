import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://blinktalk-c1cx.onrender.com/api",
  withCredentials: true,  // ✅ this sends cookies cross-origin
});