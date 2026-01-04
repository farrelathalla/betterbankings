"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import {
  Loader2,
  User,
  Mail,
  Phone,
  Briefcase,
  Building2,
  Save,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading: authLoading, refreshUser } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    position: "",
    organization: "",
  });
  const [originalData, setOriginalData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    organization: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [message, setMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  // Fetch account data
  useEffect(() => {
    if (user) {
      fetchAccountData();
    }
  }, [user]);

  // Check for changes
  useEffect(() => {
    const changed =
      formData.name !== originalData.name ||
      formData.phone !== originalData.phone ||
      formData.position !== originalData.position ||
      formData.organization !== originalData.organization;
    setHasChanges(changed);
  }, [formData, originalData]);

  const fetchAccountData = async () => {
    try {
      const res = await fetch("/api/settings/account");
      const data = await res.json();
      if (data.user) {
        const userData = {
          name: data.user.name || "",
          email: data.user.email || "",
          phone: data.user.phone || "",
          position: data.user.position || "",
          organization: data.user.organization || "",
        };
        setFormData({
          name: userData.name,
          phone: userData.phone,
          position: userData.position,
          organization: userData.organization,
        });
        setOriginalData(userData);
      }
    } catch (error) {
      console.error("Error fetching account:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/settings/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage({ type: "success", text: "Changes saved successfully!" });
        setOriginalData({
          ...originalData,
          name: formData.name,
          phone: formData.phone,
          position: formData.position,
          organization: formData.organization,
        });
        refreshUser();
        setTimeout(() => setMessage(null), 3000);
      } else {
        setMessage({
          type: "error",
          text: data.error || "Failed to save changes",
        });
      }
    } catch (error) {
      console.error("Error saving account:", error);
      setMessage({ type: "error", text: "An error occurred" });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: originalData.name,
      phone: originalData.phone,
      position: originalData.position,
      organization: originalData.organization,
    });
    setMessage(null);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row">
        <Sidebar />
        <main className="w-full flex-1 lg:ml-[280px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#355189]" />
        </main>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row overflow-x-hidden">
      <Sidebar />

      <main className="w-full flex-1 lg:ml-[280px] relative">
        {/* Background decorations */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-indigo-50 rounded-full blur-[100px] opacity-60"></div>
        </div>

        <div className="relative z-10">
          {/* Header */}
          <div className="bg-[#1B2B4B] px-6 lg:px-12 py-10">
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
              Settings
            </h1>
            <p className="text-gray-300">
              Manage your account, preferences, and security settings
            </p>
          </div>

          {/* Content */}
          <div className="px-6 lg:px-12 py-8">
            <div className="flex flex-col lg:flex-row gap-8">
              {/* Settings Tabs */}
              <div className="lg:w-56 shrink-0">
                <div className="bg-white rounded-2xl border border-[#E1E7EF] p-2">
                  <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-gradient-to-r from-[#1B2B4B] to-[#355189] text-white">
                    <User className="w-4 h-4" />
                    Account
                  </button>
                </div>
              </div>

              {/* Account Settings Form */}
              <div className="flex-1">
                <div className="bg-white rounded-2xl border border-[#E1E7EF] p-6 lg:p-8">
                  <h2 className="text-xl font-bold text-[#14213D] mb-6">
                    Profile Information
                  </h2>

                  {/* Message */}
                  {message && (
                    <div
                      className={cn(
                        "mb-6 px-4 py-3 rounded-lg text-sm font-medium",
                        message.type === "success"
                          ? "bg-green-50 text-green-700 border border-green-200"
                          : "bg-red-50 text-red-700 border border-red-200"
                      )}
                    >
                      {message.text}
                    </div>
                  )}

                  {/* Avatar with Initials */}
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-[#F48C25] to-orange-500 rounded-full flex items-center justify-center">
                      <span className="text-xl font-bold text-white">
                        {getInitials(formData.name || "U")}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-[#14213D]">
                        {formData.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {originalData.email}
                      </p>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
                    {/* Full Name & Email */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-[#14213D] mb-2">
                          Full Name
                        </label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="John Anderson"
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#355189] outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#14213D] mb-2">
                          Email Address
                        </label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="email"
                            value={originalData.email}
                            disabled
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm bg-gray-50 text-gray-500 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Phone & Position */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-semibold text-[#14213D] mb-2">
                          Phone Number
                        </label>
                        <div className="relative">
                          <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                            placeholder="+62 812 3456 7890"
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#355189] outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[#14213D] mb-2">
                          Position
                        </label>
                        <div className="relative">
                          <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                          <input
                            type="text"
                            value={formData.position}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                position: e.target.value,
                              })
                            }
                            placeholder="Chief Risk Officer"
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#355189] outline-none"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Organization */}
                    <div>
                      <label className="block text-sm font-semibold text-[#14213D] mb-2">
                        Organization
                      </label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="text"
                          value={formData.organization}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              organization: e.target.value,
                            })
                          }
                          placeholder="National Bank Indonesia"
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#355189] outline-none"
                        />
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                      <button
                        onClick={handleCancel}
                        disabled={!hasChanges || saving}
                        className="px-6 py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                      >
                        <X className="w-4 h-4" />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={!hasChanges || saving}
                        className="px-6 py-2.5 bg-gradient-to-r from-[#1B2B4B] to-[#355189] text-white rounded-xl text-sm font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
                      >
                        {saving ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4" />
                            Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
