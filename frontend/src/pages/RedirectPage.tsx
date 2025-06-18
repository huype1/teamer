import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/store/authReducer";

const RedirectPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get auth state from Redux
  const { isAuthenticated, loading, error: authError } = useSelector(
    (state: any) => state.auth
  );

  useEffect(() => {
    const handleAuth = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);

        // Check if there's an error from Cognito
        const errorParam = urlParams.get("error");
        const errorDescription = urlParams.get("error_description");

        if (errorParam) {
          console.error("Auth error:", errorParam, errorDescription);
          setError(`Authentication error: ${errorDescription || errorParam}`);
          setIsLoading(false);
          return;
        }

        const code = urlParams.get("code");
        if (!code) {
          setError("No authorization code received");
          setIsLoading(false);
          return;
        }

        // Dispatch login action and await its completion
        await dispatch(login(code));

        // Check localStorage to confirm token was saved
        const token = localStorage.getItem("token");
        if (token) {
          // Redirect to team page on successful login
          navigate("/team", { replace: true });
        } else {
          setError("Login failed: No token received");
        }
      } catch (err) {
        console.error("Login error:", err);
        setError("An unexpected error occurred during login");
      } finally {
        setIsLoading(false);
      }
    };

    handleAuth();
  }, [dispatch, navigate]);

  // Render loading state or error message
  return (
    <div className="flex flex-col items-center justify-center h-full w-full p-6">
      {isLoading && (
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4">Logging you in...</p>
        </div>
      )}

      {error && (
        <div className="text-center">
          <p className="text-red-500">{error}</p>
          <button
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
            onClick={() => navigate("/login", { replace: true })}
          >
            Back to Login
          </button>
        </div>
      )}
    </div>
  );
};

export default RedirectPage;
