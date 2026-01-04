import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://betterbankings.com"),
  title: {
    default: "BetterBankings - Banking Regulation & Risk Management Platform",
    template: "%s | BetterBankings",
  },
  description:
    "Your comprehensive platform for banking regulation, Basel Framework compliance, risk management insights, and industry data. Expert advisory services for Southeast Asian banks.",
  keywords: [
    "BetterBankings",
    "Basel Framework",
    "Basel III",
    "Basel IV",
    "banking regulation",
    "risk management",
    "bank compliance",
    "regulatory compliance",
    "Southeast Asia banking",
    "Indonesia banking",
    "banking advisory",
    "credit risk",
    "operational risk",
    "liquidity risk",
  ],
  authors: [{ name: "BetterBankings" }],
  creator: "BetterBankings",
  publisher: "BetterBankings",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://betterbankings.com",
    siteName: "BetterBankings",
    title: "BetterBankings - Banking Regulation & Risk Management Platform",
    description:
      "Your comprehensive platform for banking regulation, Basel Framework compliance, risk management insights, and industry data.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BetterBankings Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BetterBankings - Banking Regulation Platform",
    description:
      "Expert banking regulation, Basel compliance, and risk management platform for Southeast Asia.",
    images: ["/og-image.png"],
  },
  manifest: "/site.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "android-chrome",
        url: "/android-chrome-192x192.png",
        sizes: "192x192",
      },
      {
        rel: "android-chrome",
        url: "/android-chrome-512x512.png",
        sizes: "512x512",
      },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "BetterBankings",
  },
  verification: {
    google: "your-google-verification-code", // Replace with actual code from Google Search Console
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${plusJakartaSans.variable} antialiased font-sans`}>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
