import React, { useEffect } from 'react';
import Navbar from './Navbar';
import HeroSection from './HeroSection';
import AboutSection from './AboutSection';
import MissionSection from './MissionSection';
import TestimonialsSection from './TestimonialsSection';
import ContactSection from './ContactSection';
import Footer from './Footer';

export default function HomePage() {
  // Smooth scroll behavior for the page
  useEffect(() => {
    document.documentElement.style.scrollBehavior = 'smooth';
    return () => {
      document.documentElement.style.scrollBehavior = '';
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f0f7ff] overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <MissionSection />
      <TestimonialsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}

