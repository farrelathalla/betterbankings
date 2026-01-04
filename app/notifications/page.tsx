"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Footer from "@/components/Footer";
import { useAuth } from "@/hooks/useAuth";
import { Filter, ExternalLink, Loader2, Bell, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface Notification {
  id: string;
  title: string;
  description: string;
  category: string;
  link: string | null;
  createdAt: string;
  isRead: boolean;
}

const FILTER_OPTIONS = ["All", "Unread", "Content", "Data", "Regulation"];

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("All");
  const [markingAllRead, setMarkingAllRead] = useState(false);

  // Auth check
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth");
    }
  }, [user, authLoading, router]);

  const fetchNotifications = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (activeFilter === "Unread") {
        params.set("unread", "true");
      } else if (activeFilter !== "All") {
        params.set("category", activeFilter);
      }

      const res = await fetch(`/api/notifications?${params.toString()}`);
      const data = await res.json();
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "PUT" });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };

  const handleMarkAllAsRead = async () => {
    setMarkingAllRead(true);
    try {
      await fetch("/api/notifications/read-all", { method: "POST" });
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error("Error marking all as read:", error);
    } finally {
      setMarkingAllRead(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  if (authLoading) {
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
              Notification
            </h1>
            <p className="text-gray-300">
              Stay updated with the latest alerts, reports, and updates
            </p>
          </div>

          {/* Content */}
          <div className="px-6 lg:px-12 py-8">
            {/* Filter Section */}
            <div className="bg-white rounded-2xl border border-[#E1E7EF] p-5 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#14213D]">
                  <Filter className="w-4 h-4" />
                  Filter by
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllAsRead}
                    disabled={markingAllRead}
                    className="flex items-center gap-1.5 text-sm text-[#355189] hover:text-[#1B2B4B] font-medium disabled:opacity-50"
                  >
                    {markingAllRead ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCheck className="w-4 h-4" />
                    )}
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                {FILTER_OPTIONS.map((filter) => (
                  <button
                    key={filter}
                    onClick={() => setActiveFilter(filter)}
                    className={cn(
                      "px-4 py-2 rounded-lg text-sm font-medium transition-all",
                      activeFilter === filter
                        ? "bg-gradient-to-r from-[#1B2B4B] to-[#355189] text-white shadow-md"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-[#355189] hover:text-[#355189]"
                    )}
                  >
                    {filter}
                    {filter === "Unread" && unreadCount > 0 && (
                      <span className="ml-1.5 px-1.5 py-0.5 bg-[#F48C25] text-white text-xs rounded-full">
                        {unreadCount}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Notifications List */}
            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-[#355189]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E1E7EF] p-12 text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-[#14213D] mb-2">
                  No notifications
                </h3>
                <p className="text-gray-500">
                  {activeFilter === "Unread"
                    ? "You have read all your notifications"
                    : "Check back later for new updates"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => {
                      if (!notification.isRead) {
                        handleMarkAsRead(notification.id);
                      }
                    }}
                    className={cn(
                      "bg-white rounded-2xl p-5 transition-all cursor-pointer",
                      notification.isRead
                        ? "border border-[#E1E7EF]"
                        : "border-2 border-[#F48C25] shadow-sm"
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        {/* Title with unread dot */}
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-lg font-bold text-[#14213D]">
                            {notification.title}
                          </h3>
                          {!notification.isRead && (
                            <span className="w-2.5 h-2.5 bg-[#F48C25] rounded-full shrink-0"></span>
                          )}
                        </div>

                        {/* Category & Time */}
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-xs font-medium text-[#355189] bg-[#E0E7FF] px-2.5 py-1 rounded-full">
                            {notification.category}
                          </span>
                          <span className="text-xs text-gray-400">
                            {formatTimeAgo(notification.createdAt)}
                          </span>
                        </div>

                        {/* Description */}
                        <p className="text-sm text-gray-600 leading-relaxed">
                          {notification.description}
                        </p>
                      </div>

                      {/* Link button */}
                      {notification.link && (
                        <Link
                          href={notification.link}
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0 p-2 text-[#355189] hover:bg-[#E0E7FF] rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-5 h-5" />
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <Footer />
      </main>
    </div>
  );
}
