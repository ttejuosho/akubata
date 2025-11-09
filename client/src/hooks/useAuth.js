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

// Sample usage:
// import { useAuth } from "../hooks/useAuth";

// function Dashboard() {
//   const { user, logout } = useAuth();

//   return (
//     <div className="p-4">
//       <h1>Welcome, {user?.name}</h1>
//       <button
//         onClick={logout}
//         className="bg-blue-600 text-white px-4 py-2 rounded"
//       >
//         Logout
//       </button>
//     </div>
//   );
// }
