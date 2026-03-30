import React from 'react';
import CloudBackground from '../components/layout/CloudBackground';
import Hero from '../components/sections/Hero'; 
import AppShowcase from '../components/sections/AppShowcase'; 
import RoleSelection from '../components/sections/RoleSelection';
import Features from '../components/sections/Features';
import Footer from '../components/layout/Footer';

export default function Home() {
  return (
    <div className="relative min-h-screen bg-[#f0f9ff] overflow-x-hidden text-slate-900">
      
      {/* FIXED CLOUD BACKGROUND */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <CloudBackground />
      </div>

      {/* SCROLLING CONTENT */}
      <div className="relative z-10 flex flex-col w-full">
        
        {/* HERO SECTION */}
        <section className="min-h-screen flex flex-col justify-center pt-20 pb-0">
          <Hero />
        </section>

        {/* INTERACTIVE TOGGLE SHOWCASE */}
        <AppShowcase />

        {/* REST OF YOUR PAGE CONTENT */}
        {/* THE FIX: Added -mt-16 (mobile) and lg:-mt-48 (desktop) to yank this whole section UP and eat the gap! */}
        <section className="relative z-20 w-full max-w-7xl mx-auto px-6 -mt-16 lg:-mt-48 pb-20 flex flex-col gap-12 lg:gap-24">
          <RoleSelection />
          <Features />
        </section>
        
        {/* FOOTER */}
        <div className="relative z-20 w-full">
          <Footer />
        </div>

      </div>
    </div>
  );
}