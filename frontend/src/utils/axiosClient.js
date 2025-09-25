import axios from "axios";

console.log("BASE URL:", import.meta.env.VITE_BACKEND_URL); // ✅ Vite syntax

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_BACKEND_URL, // ✅ Vite syntax
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

export default axiosClient;
