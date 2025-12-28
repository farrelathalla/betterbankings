"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Carousel from "@/components/Carousel";
import {
  ArrowLeft,
  Mail,
  Eye,
  EyeOff,
  User,
  Phone,
  Building2,
  Briefcase,
  Loader2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EllipseYellow2 from "@/public/ellipse-yellow2.svg";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";

export default function AuthPage() {
  const router = useRouter();
  const { signIn, signUp, user, loading: authLoading } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    organization: "",
    password: "",
    confirmPassword: "",
  });

  // Redirect if already logged in (using useEffect to avoid setState during render)
  useEffect(() => {
    if (user && !authLoading) {
      router.push("/");
    }
  }, [user, authLoading, router]);

  // Show loading while checking auth or redirecting
  if (authLoading || (user && !authLoading)) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-[#14213D]" />
      </div>
    );
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
  };
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    const result = await signIn(formData.email, formData.password);
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Sign in failed");
    }
    setIsSubmitting(false);
  };
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsSubmitting(false);
      return;
    }
    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setIsSubmitting(false);
      return;
    }
    const result = await signUp({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      phone: formData.phone || undefined,
      position: formData.position || undefined,
      organization: formData.organization || undefined,
    });
    if (result.success) {
      router.push("/");
    } else {
      setError(result.error || "Sign up failed");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="h-screen w-full flex bg-white overflow-hidden">
      {/* Left Side - Carousel */}
      <div className="hidden lg:block flex-none h-screen relative z-0 w-auto overflow-hidden">
        <Carousel />
        {/* Logo overlay */}
        <div className="absolute top-8 left-8 z-20">
          <Link
            href="/"
            className="flex items-center gap-2 text-white hover:opacity-80 transition-opacity"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-bold tracking-tight text-xl">
              BetterBankings
            </span>
          </Link>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex-1 bg-white p-8 lg:p-12 py-20 flex flex-col relative overflow-y-auto overflow-x-hidden max-h-screen z-10">
        <Image
          src={EllipseYellow2}
          alt="Ellipse Yellow 2"
          className="absolute -top-[30%] -right-[15%]"
        />

        <div className="w-full py-12 mr-auto z-[20] my-auto">
          {/* Mobile Back Button */}
          <div className="lg:hidden mb-8">
            <Link
              href="/"
              className="inline-flex items-center justify-center w-10 h-10 rounded-full border border-gray-300 text-[#14213D] hover:bg-gray-50 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
          </div>

          <motion.div
            key={isSignUp ? "signup-header" : "signin-header"}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-8"
          >
            {isSignUp ? (
              <h1 className="text-4xl sm:text-5xl font-bold text-[#14213D] mb-2 tracking-tight">
                Create an <span className="text-[#F48C25]">Account</span>
              </h1>
            ) : (
              <>
                <h1 className="text-4xl sm:text-5xl font-bold text-[#14213D] mb-2 tracking-tight">
                  Start your <span className="text-[#F48C25]">Journey</span>
                </h1>
              </>
            )}
            <p className="text-gray-500 mt-4 text-lg">
              {isSignUp
                ? "Already have an account? "
                : "Don't have an account? "}
              {isSignUp ? (
                <button
                  onClick={() => {
                    setIsSignUp(false);
                    setError("");
                  }}
                  className="font-bold text-[#14213D] underline"
                >
                  Sign In
                </button>
              ) : (
                <button
                  onClick={() => {
                    setIsSignUp(true);
                    setError("");
                  }}
                  className="font-bold text-[#14213D] underline"
                >
                  Sign Up
                </button>
              )}
            </p>
          </motion.div>
          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm"
            >
              {error}
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {isSignUp ? (
              /* SIGN UP FORM */
              <motion.form
                key="signup-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-5"
                onSubmit={handleSignUp}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-[#14213D] mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Anderson"
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#14213D] mb-2">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john.anderson@bank.com"
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-bold text-[#14213D] mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+62 812 3456 7890"
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-[#14213D] mb-2">
                      Position
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        placeholder="Chief Risk Officer"
                        className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#14213D] mb-2">
                    Organization
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      name="organization"
                      value={formData.organization}
                      onChange={handleChange}
                      placeholder="National Bank Indonesia"
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#14213D] mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="********"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#14213D] mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="********"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full cursor-pointer bg-gradient-to-r from-[#1B2B4B] to-[#355189] text-white py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] duration-200 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>
              </motion.form>
            ) : (
              /* SIGN IN FORM (EXACT MATCH) */
              <motion.form
                key="signin-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
                onSubmit={handleSignIn}
              >
                <div>
                  <label className="block text-sm font-bold text-[#14213D] mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      placeholder="john.anderson@bank.com"
                      className="w-full pl-12 pr-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-[#14213D] mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      placeholder="••••••••"
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-400"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end text-sm">
                  <a
                    href="#"
                    className="text-[#555555] font-medium hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full cursor-pointer bg-gradient-to-r from-[#1B2B4B] to-[#355189] text-white py-4 rounded-lg font-semibold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Signing In...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </button>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
