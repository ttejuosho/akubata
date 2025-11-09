/**
 * src/context/AuthContext.jsx
 *
 * AuthProvider component — wraps the app and provides authentication state.
 * Handles login, signup, logout, password flows, and user persistence using JWT.
 * Exports only the React component (AuthProvider).
 */
// | File              | Responsibility                                                                                     |
// | ----------------- | -------------------------------------------------------------------------------------------------- |
// | `AuthContext.jsx` | Defines and provides authentication context — exports only React components                        |
// | `useAuth.js`      | Hook to consume that context anywhere in the app                                                   |

import { createContext, useState, useEffect } from "react";
import api from "../api/axios";
import { toast } from "react-hot-toast";

// Create the AuthContext (not exported directly for consumption)
const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Check current user on app load
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await api.get("/auth/me");
        setUser(data.user);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, []);

  // 🔹 Login
  const login = async (emailAddress, password) => {
    try {
      const { data } = await api.post("/auth/login", {
        emailAddress,
        password,
      });
      if (data?.token) localStorage.setItem("token", data.token);
      setUser(data.user);
      toast.success("Login successful!");
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Login failed");
      throw err;
    }
  };

  // 🔹 Signup
  const signup = async (formData) => {
    try {
      const { data } = await api.post("/auth/signup", formData);
      if (data?.token) localStorage.setItem("token", data.token);
      setUser(data.user);
      toast.success("Welcome to Akubata!");
      return data;
    } catch (err) {
      toast.error(err.response?.data?.message || "Signup failed");
      throw err;
    }
  };

  // 🔹 Logout
  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      setUser(null);
      toast.success("Logged out");
    }
  };

  // 🔹 Forgot Password
  const forgotPassword = async (emailAddress) => {
    try {
      const { data } = await api.post("/auth/forgot-password", {
        emailAddress,
      });
      toast.success(data.message || "Password reset email sent!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send email");
    }
  };

  // 🔹 Reset Password
  const resetPassword = async (token, newPassword, confirmPassword) => {
    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, {
        newPassword,
        confirmPassword,
      });
      toast.success(data.message || "Password reset successful!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed");
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    signup,
    logout,
    forgotPassword,
    resetPassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export { AuthProvider, AuthContext };
