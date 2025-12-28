"use client";
import React, { createContext, useState, useEffect, useCallback } from "react";
export interface User {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  position: string | null;
  organization: string | null;
  role: string;
}
export interface SignUpData {
  email: string;
  password: string;
  name: string;
  phone?: string;
  position?: string;
  organization?: string;
}
export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (
    email: string,
    password: string
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (data: SignUpData) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const refreshUser = useCallback(async () => {
    try {
      const response = await fetch("/api/auth/me");
      const data = await response.json();
      setUser(data.user || null);
    } catch (error) {
      console.error("Failed to fetch user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);
  const signIn = async (email: string, password: string) => {
    try {
      const response = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || "Sign in failed" };
      }
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error("Sign in error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };
  const signUp = async (signUpData: SignUpData) => {
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(signUpData),
      });
      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.error || "Sign up failed" };
      }
      setUser(data.user);
      return { success: true };
    } catch (error) {
      console.error("Sign up error:", error);
      return { success: false, error: "An unexpected error occurred" };
    }
  };
  const signOut = async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      setUser(null);
    } catch (error) {
      console.error("Sign out error:", error);
    }
  };
  return (
    <AuthContext.Provider
      value={{ user, loading, signIn, signUp, signOut, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}
