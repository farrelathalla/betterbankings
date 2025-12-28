"use client";
import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/hooks/useAuth";
import {
  Calculator,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Infinity,
} from "lucide-react";
import Link from "next/link";
export default function CountPage() {
  const { user, loading: authLoading } = useAuth();
  const [a, setA] = useState<string>("");
  const [b, setB] = useState<string>("");
  const [result, setResult] = useState<number | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [remainingClicks, setRemainingClicks] = useState<number | null>(null);
  const [unlimited, setUnlimited] = useState(false);
  // Fetch initial status
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const response = await fetch("/api/count/status");
        const data = await response.json();
        setUnlimited(data.unlimited);
        setRemainingClicks(data.remainingClicks);
      } catch (err) {
        console.error("Failed to fetch status:", err);
      }
    };
    if (!authLoading) {
      fetchStatus();
    }
  }, [authLoading, user]);
  const handleCalculate = async () => {
    // Validate inputs
    const numA = parseFloat(a);
    const numB = parseFloat(b);
    if (isNaN(numA) || isNaN(numB)) {
      setError("Please enter valid numbers for both A and B");
      return;
    }
    setIsCalculating(true);
    setError(null);
    setResult(null);
    try {
      const response = await fetch("/api/count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ a: numA, b: numB }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error || "Calculation failed");
        if (data.remainingClicks !== undefined) {
          setRemainingClicks(data.remainingClicks);
        }
        return;
      }
      setResult(data.result);
      setUnlimited(data.unlimited);
      if (data.remainingClicks !== undefined) {
        setRemainingClicks(data.remainingClicks);
      }
    } catch (err) {
      console.error("Calculate error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsCalculating(false);
    }
  };
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCalculate();
    }
  };
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row overflow-x-hidden">
      {/* Sidebar */}
      <Sidebar />
      {/* Main Content */}
      <main className="w-full flex-1 lg:ml-[280px] relative">
        {/* Background Gradients */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] bg-purple-50 rounded-full blur-[100px] opacity-60"></div>
          <div className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
        </div>
        <div className="relative z-10 px-6 lg:px-12 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl lg:text-4xl font-bold text-[#14213D] mb-2">
              Simple <span className="text-[#F48C25]">Calculator</span>
            </h1>
            <p className="text-gray-500">
              Add two numbers together.{" "}
              {!user && "Free users get 3 calculations per day."}
            </p>
          </div>
          <div className="max-w-xl">
            {/* Rate Limit Status Card */}
            <div
              className={`mb-6 p-4 rounded-xl border ${
                unlimited
                  ? "bg-green-50 border-green-200"
                  : remainingClicks === 0
                  ? "bg-red-50 border-red-200"
                  : "bg-blue-50 border-blue-200"
              }`}
            >
              <div className="flex items-center gap-3">
                {unlimited ? (
                  <>
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <Infinity className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-800">
                        Unlimited Access
                      </p>
                      <p className="text-sm text-green-600">
                        You have unlimited calculations as a logged-in user
                      </p>
                    </div>
                  </>
                ) : remainingClicks === 0 ? (
                  <>
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-red-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-red-800">
                        Daily Limit Reached
                      </p>
                      <p className="text-sm text-red-600">
                        <Link href="/auth" className="underline font-medium">
                          Sign in
                        </Link>{" "}
                        for unlimited access
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Calculator className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-blue-800">
                        {remainingClicks} Calculation
                        {remainingClicks !== 1 ? "s" : ""} Remaining
                      </p>
                      <p className="text-sm text-blue-600">
                        <Link href="/auth" className="underline font-medium">
                          Sign in
                        </Link>{" "}
                        for unlimited access
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
            {/* Calculator Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-[#E1E7EF] p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-[#1B2B4B] to-[#355189] rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#14213D]">
                    Addition Calculator
                  </h2>
                  <p className="text-sm text-gray-500">
                    Enter two numbers to add
                  </p>
                </div>
              </div>
              <div className="space-y-5">
                {/* Input A */}
                <div>
                  <label className="block text-sm font-bold text-[#14213D] mb-2">
                    Variable A
                  </label>
                  <input
                    type="number"
                    value={a}
                    onChange={(e) => {
                      setA(e.target.value);
                      setError(null);
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter first number"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-400 text-lg"
                  />
                </div>
                {/* Input B */}
                <div>
                  <label className="block text-sm font-bold text-[#14213D] mb-2">
                    Variable B
                  </label>
                  <input
                    type="number"
                    value={b}
                    onChange={(e) => {
                      setB(e.target.value);
                      setError(null);
                    }}
                    onKeyPress={handleKeyPress}
                    placeholder="Enter second number"
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all hover:border-gray-400 text-lg"
                  />
                </div>
                {/* Error Message */}
                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
                {/* Calculate Button */}
                <button
                  onClick={handleCalculate}
                  disabled={
                    isCalculating || (!unlimited && remainingClicks === 0)
                  }
                  className="w-full py-4 bg-gradient-to-r from-[#1B2B4B] to-[#355189] text-white rounded-lg font-semibold text-lg hover:opacity-90 transition-all shadow-lg hover:shadow-xl active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isCalculating ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    <>
                      <Calculator className="w-5 h-5" />
                      Calculate A + B
                    </>
                  )}
                </button>
                {/* Result */}
                {result !== null && (
                  <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-semibold text-green-800">
                        Result
                      </span>
                    </div>
                    <p className="text-4xl font-bold text-[#14213D]">
                      {result}
                    </p>
                    <p className="text-sm text-gray-500 mt-2">
                      {a} + {b} = {result}
                    </p>
                  </div>
                )}
              </div>
            </div>
            {/* Info Card */}
            <div className="mt-6 p-6 rounded-2xl bg-gradient-to-br from-[#1B2B4B] to-[#355189] text-white">
              <h3 className="font-bold mb-3">About Rate Limiting</h3>
              <p className="text-sm text-white/80 leading-relaxed">
                Free users are limited to 3 calculations per day. This resets at
                midnight UTC. Sign in to get unlimited access to this calculator
                and other premium features.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
