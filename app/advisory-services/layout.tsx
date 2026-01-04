import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Advisory Services - Banking Consulting & Regulatory Support",
  description:
    "Expert banking advisory services including regulatory compliance, risk management consulting, Basel implementation support, and strategic advisory for banks in Southeast Asia.",
  keywords: [
    "banking advisory",
    "banking consulting",
    "regulatory compliance",
    "risk management consulting",
    "Basel implementation",
    "bank consulting",
    "Southeast Asia banking",
    "Indonesia banking consultant",
  ],
  openGraph: {
    title: "Advisory Services - Banking Consulting & Regulatory Support",
    description:
      "Expert banking advisory services including regulatory compliance and risk management consulting.",
  },
};

export default function AdvisoryServicesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
