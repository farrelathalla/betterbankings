"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import {
  Home,
  Briefcase,
  FileText,
  TrendingUp,
  Building2,
  BarChart3,
  LineChart,
  Bell,
  Settings,
  User,
  LogOut,
  Menu,
  X,
  Calculator,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import Logo from "@/public/logo.webp";

// Define navigation items based on new design
const NAV_SECTIONS = [
  {
    title: "QUICK ACCESS",
    items: [
      { label: "Home", href: "/", icon: Home },
      {
        label: "Advisory Services",
        href: "/advisory-services",
        icon: Briefcase,
      },
      { label: "Basel Center", href: "/basel-center", icon: FileText },
      {
        label: "BetterBankings Angle",
        href: "/betterbankings-angle",
        icon: TrendingUp,
      },
    ],
  },
  {
    title: "B-FORESIGHT",
    items: [
      {
        label: "Banking Industry Data",
        href: "/banking-data",
        icon: Building2,
      },
      { label: "Risk Indicator", href: "/risk-indicator", icon: BarChart3 },
      { label: "Bank Performance", href: "/bank-performance", icon: LineChart },
    ],
  },
  {
    title: "TOOLS",
    items: [{ label: "Calculator", href: "/count", icon: Calculator }],
  },
  {
    title: "ACCOUNT",
    items: [
      { label: "Notification", href: "/notifications", icon: Bell },
      { label: "Settings", href: "/settings", icon: Settings },
      // { label: "Profile", href: "/profile", icon: User },
    ],
  },
];

interface SidebarProps {
  isAuthenticated?: boolean;
}

export default function Sidebar({ isAuthenticated = false }: SidebarProps) {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  // Handle Resize for Mobile Check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-[#E1E7EF] font-sans">
      {/* Header / Logo */}
      <div className="p-6 border-b border-[#E1E7EF]">
        <Image src={Logo} alt="Logo" width={150} height={150} />
      </div>

      {/* Scrollable Nav Content */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8">
        {NAV_SECTIONS.map((section) => (
          <div key={section.title}>
            <h3 className="text-xs font-bold text-[#64748B] mb-4 uppercase tracking-wider px-3">
              {section.title}
            </h3>
            <nav className="flex flex-col gap-1">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => isMobile && setIsOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 group",
                      isActive
                        ? "bg-[#E0E7FF] text-[#14213D]"
                        : "text-[#64748B] hover:bg-gray-50 hover:text-[#14213D]"
                    )}
                  >
                    <Icon
                      className={cn(
                        "w-5 h-5",
                        isActive
                          ? "text-[#14213D]"
                          : "text-[#94A3B8] group-hover:text-[#14213D]"
                      )}
                    />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
        ))}

        {/* Admin Section - Only visible to admins */}
        {user?.role === "admin" && (
          <div>
            <h3 className="text-xs font-bold text-purple-600 mb-4 uppercase tracking-wider px-3">
              ADMIN
            </h3>
            <nav className="flex flex-col gap-1">
              <Link
                href="/admin/basel"
                onClick={() => isMobile && setIsOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 group",
                  pathname.startsWith("/admin")
                    ? "bg-purple-100 text-purple-700"
                    : "text-[#64748B] hover:bg-purple-50 hover:text-purple-700"
                )}
              >
                <Settings
                  className={cn(
                    "w-5 h-5",
                    pathname.startsWith("/admin")
                      ? "text-purple-700"
                      : "text-[#94A3B8] group-hover:text-purple-700"
                  )}
                />
                Basel CMS
              </Link>
            </nav>
          </div>
        )}
      </div>

      {/* Footer / Logout or Sign In */}
      <div className="p-4 border-t border-[#E1E7EF]">
        {loading ? (
          <div className="flex items-center justify-center py-3">
            <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
          </div>
        ) : user ? (
          <button
            onClick={async () => {
              setIsSigningOut(true);
              await signOut();
              setIsSigningOut(false);
              if (isMobile) setIsOpen(false);
            }}
            disabled={isSigningOut}
            className="w-full"
          >
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg font-semibold transition-colors cursor-pointer text-[#64748B] hover:bg-red-50 hover:text-red-600"
            >
              {isSigningOut ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Signing out...
                </>
              ) : (
                <>
                  <LogOut className="w-5 h-5" />
                  Log Out
                </>
              )}
            </motion.div>
          </button>
        ) : (
          <Link href="/auth" onClick={() => isMobile && setIsOpen(false)}>
            <motion.div
              whileHover={{ x: 4 }}
              className="flex items-center gap-3 px-3 py-3 rounded-lg font-semibold transition-colors cursor-pointer text-[#14213D] bg-gray-100 hover:bg-gray-200"
            >
              <User className="w-5 h-5" />
              Sign In
            </motion.div>
          </Link>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger Button */}
      {isMobile && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-md border border-gray-100 text-[#14213D]"
        >
          <Menu className="w-6 h-6" />
        </button>
      )}

      {/* Desktop Sidebar (Fixed) */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-[280px] z-40">
        <SidebarContent />
      </aside>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black z-50"
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 h-full w-[280px] z-50 bg-white shadow-2xl"
            >
              <SidebarContent />
              {/* Close Button Inside Drawer */}
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
