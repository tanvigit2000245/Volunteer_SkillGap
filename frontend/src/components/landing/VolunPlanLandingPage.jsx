import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Fab, Tooltip } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { LandingNavbar } from './LandingNavbar';
import { HeroSection } from './HeroSection';
import { PrecisionFeatures } from './PrecisionFeatures';
import { TestimonialsSection } from './TestimonialsSection';
import { PassionPurposeSection } from './PassionPurposeSection';
import { ContactSection } from './ContactSection';
import { LandingFooter } from './LandingFooter';
import { LiveDemoModal } from './LiveDemoModal';

export const VolunPlanLandingPage = () => {
  const [demoOpen, setDemoOpen] = useState(false);
  const navigate = useNavigate();

  const handleScrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleGetStarted = () => {
    navigate('/auth');
  };

  const handleWatchDemo = () => {
    setDemoOpen(true);
  };

  const handleLearnStory = () => {
    handleScrollToSection('about');
  };

  const handlePlatformClick = () => {
    navigate('/auth');
  };

  const handleLaunchDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100vh',
        bgcolor: '#fcfbfe',
        color: '#0f172a',
        overflowX: 'hidden',
      }}
    >
      {/* Background Ambient Violet & Lavender Glow Blobs */}
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: { xs: 350, md: 650 },
          height: { xs: 350, md: 650 },
          background:
            'radial-gradient(circle, rgba(168, 85, 247, 0.16) 0%, rgba(216, 180, 254, 0.08) 45%, transparent 70%)',
          filter: 'blur(50px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          top: '18%',
          left: 0,
          width: { xs: 300, md: 550 },
          height: { xs: 300, md: 550 },
          background:
            'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(224, 231, 255, 0.05) 50%, transparent 70%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: 'fixed',
          bottom: '15%',
          right: '5%',
          width: { xs: 300, md: 600 },
          height: { xs: 300, md: 600 },
          background:
            'radial-gradient(circle, rgba(139, 92, 246, 0.10) 0%, transparent 65%)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Main Page Layout */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>
        {/* 1. Header / Navbar */}
        <LandingNavbar
          onGetStarted={handleGetStarted}
          onNavigateSection={handleScrollToSection}
        />

        {/* 2. Hero Section */}
        <HeroSection
          onStartTrial={handleGetStarted}
          onWatchDemo={handleWatchDemo}
        />

        {/* 3. Precision Deployment Features */}
        <PrecisionFeatures />

        {/* 4. Trusted by Coordinators (Testimonials) */}
        <TestimonialsSection />

        {/* 5. Passion & Purpose (Bento Grid) */}
        <PassionPurposeSection onLearnStory={handleLearnStory} />

        {/* 6. Ready to Optimize? (Contact Form) */}
        <ContactSection />

        {/* 7. Footer */}
        <LandingFooter
          onPlatformClick={handlePlatformClick}
          onNavigateSection={handleScrollToSection}
        />
      </Box>

      {/* Interactive Live Demo Modal */}
      <LiveDemoModal
        open={demoOpen}
        onClose={() => setDemoOpen(false)}
        onLaunchFullApp={handleLaunchDashboard}
      />

      {/* Floating Quick Switcher to Live Dispatch Engine */}
      <Tooltip title="Launch Live Dispatch Engine" placement="left">
        <Fab
          variant="extended"
          onClick={handleGetStarted}
          sx={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 1000,
            background: 'linear-gradient(135deg, #1e1b4b 0%, #0f172a 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '0.84rem',
            px: 2.8,
            boxShadow: '0 8px 24px rgba(15, 23, 42, 0.35)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            '&:hover': {
              background: 'linear-gradient(135deg, #312e81 0%, #1e1b4b 100%)',
              transform: 'scale(1.03)',
            },
          }}
        >
          <DashboardIcon sx={{ mr: 1, fontSize: 19, color: '#818cf8' }} />
          Dispatch Engine
        </Fab>
      </Tooltip>
    </Box>
  );
};
