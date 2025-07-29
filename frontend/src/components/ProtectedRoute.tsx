import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { TypedUseSelectorHook } from "react-redux";
import type { RootState } from "@/store";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * ProtectedRoute component that checks if user is authenticated.
 * If not authenticated, redirects to login page with return URL.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAppSelector((state) => state.auth);
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    const returnUrl = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/login?returnUrl=${returnUrl}`} replace />;
  }

  // If authenticated, render the protected content
  return <>{children}</>;
};

export default ProtectedRoute; 