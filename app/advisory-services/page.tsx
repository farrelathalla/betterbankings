"use client";

import Sidebar from "@/components/Sidebar";
import AdvisoryHero from "@/components/AdvisoryHero";
import AdvisoryServicesList from "@/components/AdvisoryServicesList";
import AdvisoryProducts from "@/components/AdvisoryProducts";
import AdvisoryCTA from "@/components/AdvisoryCTA";
import Footer from "@/components/Footer";
import Image from "next/image";
import EllipseBlue from "@/public/ellipse-blue.svg";
import EllipseYellow from "@/public/ellipse-yellow.svg";

export default function AdvisoryServices() {
  return (
    <div className="min-h-screen bg-[#fcfaf9] flex flex-col lg:flex-row overflow-x-hidden">
      {/* Sidebar - Fixed */}
      <Sidebar />

      {/* Main Content - Offset by Sidebar Width on Desktop */}
      <main className="w-full flex-1 lg:ml-[280px] relative">
        {/* Background Gradients - Subtle */}
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-orange-100 rounded-full blur-[100px] opacity-60"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[600px] h-[600px] bg-blue-50 rounded-full blur-[100px] opacity-60"></div>
        </div>

        <div className="relative z-10 flex flex-col">
          <AdvisoryHero />
          <AdvisoryServicesList />
          <AdvisoryProducts />
          <AdvisoryCTA />
          <Footer />
        </div>
      </main>
    </div>
  );
}
