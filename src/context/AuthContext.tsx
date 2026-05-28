/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";

import ApiClient from "../helper/apiclient";
import {
  clearAuthToken,
  clearRefreshToken,
  getRefreshToken,
  saveAuthToken,
  saveRefreshToken,
} from "../helper/store/AuthStorage";

interface User {
  id: string;
  email: string;
  full_name: string;
  is_active?: boolean;
  subscription_type?: "free" | "medium" | "premium";
}

interface Authresponse {
  success: boolean;
  statusCode?: number;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<Authresponse>;
  signup: (
    email: string,
    password: string,
    full_name: string,
  ) => Promise<Authresponse>;
  logout: () => Promise<void>;
  baseURL: string | undefined;
  globalLandSize: number;
  setGlobalLandSize: (size: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [globalLandSize, setGlobalLandSize] = useState<number>(0);
  const baseURL = ApiClient.defaults.baseURL;

  const bootstrap = async () => {
    try {
      setUser(null);
      // 2. Swapped to ApiClient to safely process background cookies/headers
      const { data } = await ApiClient.get("/auth/me");
      setUser(data || null);
    } catch (error) {
      console.warn(
        "Auth Context Bootstrap validation failed or session expired:",
        error,
      );
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    bootstrap();
  }, []);

  const login = async (
    email: string,
    password: string,
  ): Promise<Authresponse> => {
    setIsLoading(true);
    try {
      // 3. Changed to ApiClient to preserve base URL handling seamlessly
      const { data } = await axios.post(`${baseURL}/auth/login`, {
        email,
        password,
      });
      const newAccess = data?.access_token;
      const newRefresh = data?.refresh_token;
      await saveAuthToken(newAccess);
      await saveRefreshToken(newRefresh);
      ApiClient.defaults.headers.common["Authorization"] =
        `Bearer ${newAccess}`;
      await bootstrap();
      return { success: true };
    } catch (error: any) {
      const status = error?.response?.status;
      return {
        success: false,
        statusCode: status || 500,
        message:
          error?.response?.data?.message ??
          "Unable to log in. Please check your network credentials.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (
    email: string,
    password: string,
    full_name: string,
  ): Promise<Authresponse> => {
    setIsLoading(true);
    try {
      // 4. Cleaned syntax to utilize local relative ApiClient pathing safely
      await axios.post(`${baseURL}/auth/register`, {
        email,
        password,
        full_name,
      });
      return { success: true };
    } catch (err: any) {
      const status = err?.response?.status || 500;
      return {
        success: false,
        statusCode: status,
        message:
          err?.response?.data?.message ??
          "Registration failed. Please check parameters and try again.",
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const token = await getRefreshToken();
      await ApiClient.post("/auth/logout", {
        refresh_token: token,
      });
    } catch (error) {
      console.warn(
        "Backend logout notification session terminated with exception:",
        error,
      );
    } finally {
      await clearAuthToken();
      await clearRefreshToken();
      delete ApiClient.defaults.headers.common["Authorization"];
      setUser(null);
      setIsLoading(false);
      window.location.href = "/";
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    signup,
    logout,
    baseURL,
    globalLandSize,
    setGlobalLandSize,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
