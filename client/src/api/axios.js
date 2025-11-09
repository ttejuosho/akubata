/**
 * src/api/axios.js
 *
 * Central Axios instance for Akubata Inventory System.
 * Automatically includes credentials for JWT cookie auth
 * and handles base URL configuration.
 */

import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.AKUBATA_API_URL || "http://localhost:5001/api", // backend URL
  withCredentials: true, // allows sending cookies with requests
  headers: {
    "Content-Type": "application/json",
  },
});

export default api;

// Sample usage:
// import api from "../api/axios";

// // Example: login
// export const loginUser = async (email, password) => {
//   const { data } = await api.post("/auth/login", { email, password });
//   if (data?.token) localStorage.setItem("token", data.token); // optional
//   return data;
// };
