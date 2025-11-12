import React, {
  createContext,
  useState,
  useContext,
  useEffect,
  useMemo,
  useCallback,
  useRef,
} from "react";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";

// Tạo context cho authentication
const AuthContext = createContext(null);

// AuthProvider để bao quanh toàn bộ ứng dụng
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const navigate = useNavigate();

  const isCheckingRef = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
    };
  }, []);

  const getCurrentUser = useCallback(async () => {
    // Tránh multiple calls đồng thời
    if (isCheckingRef.current) {
      console.log("getCurrentUser already in progress, skipping");
      return user;
    }

    try {
      isCheckingRef.current = true;
      if (mounted.current) setIsChecking(true);

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("No access token found");
      }

      console.log("Fetching current user with token:", token.substring(0, 20) + "...");

      const response = await axios.get("http://localhost:8000/api/auth/me/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
        timeout: 10000,
      });

      console.log("Current user response:", response.data);
      const userData = response.data;

      if (mounted.current) {
        setUser(userData);
        setError(null); // Clear previous errors
      }

      return userData;
    } catch (error) {
      console.error("Error fetching current user:", error);

      if (error.response?.status === 401) {
        try {
          const isRefreshed = await refreshToken();
          if (isRefreshed && mounted.current) {
            // Thử lại với token mới
            const newToken = localStorage.getItem("access_token");
            const retryResponse = await axios.get("http://localhost:8000/api/auth/me/", {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
              timeout: 10000,
            });

            const userData = retryResponse.data;
            if (mounted.current) {
              setUser(userData);
              setError(null);
            }
            return userData;
          }
        } catch (retryError) {
          console.error("Token refresh failed:", retryError);
        }
      }

      if (mounted.current) {
        setUser(null);
        setError(error.response?.data?.detail || "Authentication failed");

        // Clear invalid tokens
        if (error.response?.status === 401) {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
      }

      throw error;
    } finally {
      isCheckingRef.current = false;
      if (mounted.current) setIsChecking(false);
    }
  }, []);

  const updateUser = useCallback((updatedUserData) => {
    console.log("Updating user data:", updatedUserData);
    if (mounted.current) {
      setUser((prev) => {
        if (!prev) return updatedUserData;
        return { ...prev, ...updatedUserData };
      });
    }
  }, []);

  const refreshToken = useCallback(async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      if (!refreshToken) {
        console.log("No refresh token available");
        return false;
      }

      console.log("Attempting to refresh token...");

      const response = await axios.post(
        "http://localhost:8000/api/auth/token/refresh/",
        {
          refresh: refreshToken,
        },
        {
          timeout: 10000,
        }
      );

      if (response.status === 200) {
        const data = response.data;
        localStorage.setItem("access_token", data.access);

        if (data.refresh) {
          localStorage.setItem("refresh_token", data.refresh);
        }

        console.log("Token refreshed successfully");
        return true;
      }

      return false;
    } catch (error) {
      console.error("Token refresh error:", error);

      if (error.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
      }

      return false;
    }
  }, []);

  const login = useCallback(
    async (emailOrCredentials, password) => {
      try {
        if (mounted.current) setError(null);

        // Xử lý 2 format: login(email, password) hoặc login({username, password})
        let credentials;
        if (typeof emailOrCredentials === "object") {
          credentials = emailOrCredentials;
        } else {
          credentials = {
            username: emailOrCredentials,
            password: password,
          };
        }

        console.log("Attempting login with:", { username: credentials.username });

        const response = await axios.post("http://localhost:8000/api/auth/login/", credentials, {
          timeout: 15000,
        });

        const data = response.data;
        console.log("Login response data:", data); // Debug log

        // Kiểm tra response từ backend
        if (!data.success) {
          throw new Error(data.message || "Login failed");
        }

        // Backend trả về access và refresh ở root level
        if (!data.access || !data.refresh) {
          console.error("Invalid token format in response:", data);
          throw new Error("Invalid response: missing tokens");
        }

        // Lưu tokens
        localStorage.setItem("access_token", data.access);
        localStorage.setItem("refresh_token", data.refresh);

        // Lưu user data nếu có
        if (data.user && mounted.current) {
          setUser(data.user);
          console.log("User data set from login response:", data.user);
        } else {
          // Nếu không có user data trong response, fetch từ API
          try {
            const userData = await getCurrentUser();
            console.log("Login successful, user data fetched:", userData);
          } catch (userError) {
            console.error("Error fetching user data after login:", userError);
            // Không fail login nếu không lấy được user data
          }
        }

        // Trả về format tương thích
        return typeof emailOrCredentials === "object" ? { success: true } : true;
      } catch (error) {
        console.error("Login error:", error);

        const errorMessage =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Login failed";

        if (mounted.current) setError(errorMessage);

        // Trả về format tương thích
        return typeof emailOrCredentials === "object"
          ? { success: false, error: errorMessage }
          : false;
      }
    },
    [getCurrentUser]
  );

  const register = useCallback(async (userData) => {
    try {
      if (mounted.current) setError(null);

      if (!userData.username || !userData.password || !userData.email) {
        throw new Error("Missing required fields");
      }

      const response = await axios.post("http://localhost:8000/api/auth/register/", userData, {
        timeout: 15000,
      });

      if (response.status === 201 || response.status === 200) {
        console.log("Registration successful");
        return { success: true };
      }

      return { success: false, error: "Registration failed" };
    } catch (error) {
      console.error("Register error:", error);

      const errorMessage =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        Object.values(error.response?.data || {})
          .flat()
          .join(", ") ||
        error.message ||
        "Registration failed";

      if (mounted.current) setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(() => {
    console.log("Logging out user");

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");

    if (mounted.current) {
      setUser(null);
      setError(null);
      setIsChecking(false);
    }

    isCheckingRef.current = false;
    navigate("/authentication/sign-in");
  }, [navigate]);

  useEffect(() => {
    const checkLoggedIn = async () => {
      try {
        const token = localStorage.getItem("access_token");
        if (!token) {
          console.log("No token found, user not authenticated");
          if (mounted.current) setLoading(false);
          return;
        }

        console.log("Checking authentication...");
        await getCurrentUser();
      } catch (error) {
        console.error("Auth check error:", error);

        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");

        if (mounted.current) {
          setUser(null);
          setError("Session expired. Please login again.");
        }
      } finally {
        if (mounted.current) setLoading(false);
      }
    };

    if (!user && !isCheckingRef.current) {
      checkLoggedIn();
    } else if (user && mounted.current) {
      setLoading(false);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      loading,
      error,
      isChecking,
      login,
      register,
      logout,
      refreshToken,
      getCurrentUser,
      updateUser,
      isAuthenticated: !!user,
    }),
    [
      user,
      loading,
      error,
      isChecking,
      login,
      register,
      logout,
      refreshToken,
      getCurrentUser,
      updateUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Kiểm tra props cho AuthProvider
AuthProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
