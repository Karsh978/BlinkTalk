import axios from "axios";

export const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://blinktalk-o5h0.onrender.com",
  withCredentials: true,  // ✅ this sends cookies cross-origin
});