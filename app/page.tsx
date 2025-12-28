"use client";

import Sidebar from "@/components/Sidebar";
import Hero from "@/components/Hero";
import StatsSection from "@/components/StatsSection";
import MissionSection from "@/components/MissionSection";
import ServicesSection from "@/components/ServicesSection";
import WhySection from "@/components/WhySection";
import CTASection from "@/components/CTASection";
import Footer from "@/components/Footer";
import Image from "next/image";
import LineHome from "@/public/line-home.svg";
import EllipseBlue from "@/public/ellipse-blue.svg";
import EllipseYellow from "@/public/ellipse-yellow.svg";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col lg:flex-row overflow-x-hidden">
      {/* Sidebar - Fixed */}
      <Sidebar />

      {/* Main Content - Offset by Sidebar Width on Desktop */}
      <main className="w-full flex-1 lg:ml-[280px] relative">
        <Image
          src={EllipseBlue}
          alt="Ellipse Blue"
          className="absolute -top-[5%] -left-[25%] lg:-left-[10%] opacity-70"
        />
        <Image
          src={EllipseYellow}
          alt="Ellipse Yellow"
          className="absolute top-[10%] scale-150 lg:scale-100 lg:top-[5%] -right-[17%]"
        />

        <Image
          src={LineHome}
          alt="Line Home"
          className="absolute bottom-[15%] w-full"
        />
        <div className="flex flex-col">
          <Hero />
          <StatsSection />
          <MissionSection />
          <ServicesSection />
          <WhySection />
          <CTASection />
          <Footer />
        </div>
      </main>
    </div>
  );
}
