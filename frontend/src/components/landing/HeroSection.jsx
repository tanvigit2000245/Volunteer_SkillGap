import React from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Chip,
} from '@mui/material';
import PlayCircleOutlinedIcon from '@mui/icons-material/PlayCircleOutlined';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import { DashboardMockup } from './DashboardMockup';

export const HeroSection = ({ onStartTrial, onWatchDemo }) => {
  return (
    <Box
      id="home"
      sx={{
        pt: { xs: 5, md: 8 },
        pb: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.05fr 1fr' },
            gap: { xs: 6, md: 5 },
            alignItems: 'center',
          }}
        >
          {/* Left Column: Headlines & CTA */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            {/* Top Badge */}
            <Chip
              icon={
                <AutoAwesomeIcon
                  sx={{
                    fontSize: '14px !important',
                    color: '#6366f1 !important',
                  }}
                />
              }
              label="AI-POWERED VOLUNTEER DISPATCH"
              sx={{
                mb: 3,
                px: 1,
                py: 0.5,
                bgcolor: 'rgba(99, 102, 241, 0.08)',
                color: '#6366f1',
                fontWeight: 700,
                fontSize: '0.73rem',
                letterSpacing: '0.05em',
                borderRadius: '9999px',
                border: '1px solid rgba(99, 102, 241, 0.22)',
              }}
            />

            {/* Main Headline */}
            <Typography
              variant="h1"
              sx={{
                fontSize: { xs: '2.4rem', sm: '3.2rem', md: '3.75rem' },
                fontWeight: 800,
                lineHeight: { xs: 1.15, sm: 1.12 },
                letterSpacing: '-0.03em',
                color: '#0f172a',
                mb: 2.5,
              }}
            >
              Bridge the{' '}
              <Box
                component="span"
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 60%, #a855f7 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  display: 'inline-block',
                }}
              >
                Skill–Gap
              </Box>
              <br />
              in Your Volunteer
              <br />
              Force.
            </Typography>

            {/* Subtitle */}
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '1rem', md: '1.08rem' },
                lineHeight: 1.65,
                color: '#64748b',
                mb: 4,
                maxWidth: { xs: '100%', md: 470 },
                mx: { xs: 'auto', md: 0 },
              }}
            >
              Automatically match high-impact volunteers to critical missions with
              real-time tracking, predictive skill-gap analytics, & rapid deployment
              planner.
            </Typography>

            {/* CTA Buttons */}
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent={{ xs: 'center', md: 'flex-start' }}
              alignItems="center"
            >
              <Button
                variant="contained"
                onClick={onStartTrial}
                sx={{
                  background: 'linear-gradient(135deg, #6366f1 0%, #7c3aed 100%)',
                  color: '#ffffff',
                  borderRadius: '9999px',
                  px: 4,
                  py: 1.4,
                  fontSize: '0.96rem',
                  fontWeight: 700,
                  textTransform: 'none',
                  boxShadow: '0 10px 24px -4px rgba(99, 102, 241, 0.45)',
                  width: { xs: '100%', sm: 'auto' },
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #4f46e5 0%, #6d28d9 100%)',
                    boxShadow: '0 14px 28px -4px rgba(99, 102, 241, 0.55)',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Start Free Trial
              </Button>

              <Button
                variant="outlined"
                onClick={onWatchDemo}
                startIcon={<PlayCircleOutlinedIcon sx={{ color: '#6366f1' }} />}
                sx={{
                  borderRadius: '9999px',
                  borderColor: 'rgba(203, 213, 225, 0.9)',
                  color: '#1e293b',
                  bgcolor: '#ffffff',
                  px: 3.2,
                  py: 1.35,
                  fontSize: '0.94rem',
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.03)',
                  width: { xs: '100%', sm: 'auto' },
                  transition: 'all 0.25s ease',
                  '&:hover': {
                    borderColor: '#6366f1',
                    bgcolor: 'rgba(99, 102, 241, 0.04)',
                    color: '#4f46e5',
                    transform: 'translateY(-1px)',
                  },
                }}
              >
                Watch Demo
              </Button>
            </Stack>
          </Box>

          {/* Right Column: Dashboard Graphic */}
          <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
            <DashboardMockup onLaunchDemo={onWatchDemo} />
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

