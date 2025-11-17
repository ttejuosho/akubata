/**
 * src/hooks/useAuth.js
 *
 * Custom hook to consume AuthContext easily throughout the app.
 */

import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
