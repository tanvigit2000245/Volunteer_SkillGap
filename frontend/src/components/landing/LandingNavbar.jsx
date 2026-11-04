import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Stack,
  Typography,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

export const VolunPlanLogo = ({ size = 34 }) => (
  <Stack direction="row" spacing={1.2} alignItems="center" sx={{ cursor: 'pointer', userSelect: 'none' }}>
    <Box
      sx={{
        width: size,
        height: size,
        borderRadius: '9px',
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)',
        position: 'relative',
        flexShrink: 0,
      }}
    >
      <svg width={size * 0.65} height={size * 0.65} viewBox="0 0 24 24" fill="none">
        <path
          d="M6 7.5L12 17.5L18 7.5"
          stroke="#ffffff"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="5.5" r="1.8" fill="#ffffff" />
      </svg>
    </Box>
    <Typography
      variant="h6"
      sx={{
        fontWeight: 800,
        fontSize: '1.25rem',
        letterSpacing: '-0.02em',
        color: '#1e1b4b',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      Volun<span style={{ color: '#6366f1' }}>Plan</span>
    </Typography>
  </Stack>
);

export const LandingNavbar = ({ onGetStarted, onNavigateSection }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', id: 'home' },
    { label: 'What We Do', id: 'features' },
    { label: 'Reviews', id: 'reviews' },
    { label: 'About Us', id: 'about' },
    { label: 'Contact', id: 'contact' },
  ];

  const handleLinkClick = (id) => {
    setActiveSection(id);
    setMobileOpen(false);
    if (onNavigateSection) {
      onNavigateSection(id);
    } else {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <Box
      sx={{
        position: 'sticky',
        top: { xs: 12, md: 20 },
        zIndex: 1100,
        width: '100%',
        px: { xs: 2, md: 3 },
      }}
    >
      <Container maxWidth="lg" sx={{ px: { xs: 0, sm: 1 } }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: scrolled
              ? 'rgba(255, 255, 255, 0.94)'
              : 'rgba(255, 255, 255, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '9999px',
            border: '1px solid rgba(226, 232, 240, 0.85)',
            boxShadow: scrolled
              ? '0 12px 35px -8px rgba(99, 102, 241, 0.15), 0 4px 12px rgba(0, 0, 0, 0.04)'
              : '0 8px 30px -6px rgba(99, 102, 241, 0.08), 0 2px 8px rgba(0, 0, 0, 0.02)',
            py: { xs: 1, sm: 1.1 },
            px: { xs: 2, sm: 2.8 },
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          }}
        >
          {/* Brand Logo */}
          <Box onClick={() => handleLinkClick('home')}>
            <VolunPlanLogo />
          </Box>

          {/* Desktop Nav Links */}
          <Stack
            direction="row"
            spacing={{ md: 3, lg: 4 }}
            alignItems="center"
            sx={{ display: { xs: 'none', md: 'flex' } }}
          >
            {navLinks.map((link) => {
              const isActive = activeSection === link.id;
              return (
                <Typography
                  key={link.id}
                  onClick={() => handleLinkClick(link.id)}
                  sx={{
                    fontSize: '0.92rem',
                    fontWeight: isActive ? 700 : 500,
                    color: isActive ? '#4338ca' : '#475569',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      color: '#4338ca',
                    },
                    '&::after': isActive
                      ? {
                          content: '""',
                          position: 'absolute',
                          bottom: -4,
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '16px',
                          height: '2.5px',
                          borderRadius: '9999px',
                          background: '#6366f1',
                        }
                      : {},
                  }}
                >
                  {link.label}
                </Typography>
              );
            })}
          </Stack>

          {/* Right Action Button */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Button
              variant="contained"
              onClick={onGetStarted}
              sx={{
                background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                color: '#ffffff',
                borderRadius: '9999px',
                px: { xs: 2.2, sm: 3 },
                py: { xs: 0.85, sm: 1 },
                fontSize: { xs: '0.82rem', sm: '0.88rem' },
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 4px 16px rgba(99, 102, 241, 0.38)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)',
                  boxShadow: '0 6px 20px rgba(99, 102, 241, 0.5)',
                  transform: 'translateY(-1px)',
                },
              }}
            >
              Get Started
            </Button>

            {/* Mobile Menu Icon */}
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: 'flex', md: 'none' }, color: '#334155', p: 0.8 }}
            >
              <MenuIcon />
            </IconButton>
          </Stack>
        </Box>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="top"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            borderRadius: '0 0 24px 24px',
            p: 3,
            background: 'rgba(255, 255, 255, 0.98)',
            backdropFilter: 'blur(20px)',
          },
        }}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
          <VolunPlanLogo />
          <IconButton onClick={() => setMobileOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <List sx={{ pt: 1 }}>
          {navLinks.map((link) => (
            <ListItem key={link.id} disablePadding>
              <ListItemButton
                onClick={() => handleLinkClick(link.id)}
                sx={{
                  borderRadius: 2,
                  py: 1.2,
                  my: 0.3,
                  fontWeight: activeSection === link.id ? 700 : 500,
                  color: activeSection === link.id ? '#4f46e5' : '#1e293b',
                  background:
                    activeSection === link.id ? 'rgba(99, 102, 241, 0.08)' : 'transparent',
                }}
              >
                <ListItemText
                  primary={link.label}
                  primaryTypographyProps={{
                    fontWeight: activeSection === link.id ? 700 : 500,
                  }}
                />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Box mt={2}>
          <Button
            fullWidth
            variant="contained"
            onClick={() => {
              setMobileOpen(false);
              onGetStarted();
            }}
            endIcon={<ArrowForwardIcon />}
            sx={{
              background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
              color: '#ffffff',
              borderRadius: '9999px',
              py: 1.2,
              fontWeight: 600,
            }}
          >
            Get Started
          </Button>
        </Box>
      </Drawer>
    </Box>
  );
};

