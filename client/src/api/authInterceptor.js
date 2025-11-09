/**
 * src/api/authInterceptor.js
 *
 * Adds Authorization headers automatically if JWT exists.
 * Also refreshes token or redirects to login on 401 errors.
 */

import api from "./axios.js";

// Add token to headers before each request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token"); // if using header-based JWT
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle expired tokens or unauthorized requests
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized or expired token, redirecting to login...");
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
