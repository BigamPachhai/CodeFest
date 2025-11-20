import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { Loader2 } from "lucide-react";

const ProtectedRoute = ({
  children,
  requireAdmin = false,
  requireDepartment = false,
}) => {
  const { user, loading, isAuthenticated } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-nepali-blue animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check admin role requirement
  if (requireAdmin && user.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p>You need administrator privileges to access this page.</p>
          </div>
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    );
  }

  // Check department role requirement
  if (requireDepartment && !["admin", "department"].includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <h2 className="text-xl font-bold mb-2">Access Denied</h2>
            <p>You need department staff privileges to access this page.</p>
          </div>
          <Navigate to="/dashboard" replace />
        </div>
      </div>
    );
  }

  // Check if user is verified (for regular users)
  if (user.role === "user" && user.verificationStatus !== "verified") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded-lg mb-4">
            <h2 className="text-xl font-bold mb-2">
              Account Verification Required
            </h2>
            <p>
              Your account is pending verification. You'll be able to access all
              features once verified.
            </p>
          </div>
          <p className="text-gray-600 mb-4">
            Current status:{" "}
            <span className="font-semibold capitalize">
              {user.verificationStatus}
            </span>
          </p>
          <button
            onClick={() => (window.location.href = "/")}
            className="bg-nepali-blue text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  // If all checks pass, render the children
  return children;
};

export default ProtectedRoute;
