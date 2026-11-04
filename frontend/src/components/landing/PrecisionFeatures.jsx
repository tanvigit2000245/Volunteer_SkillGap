import React from 'react';
import { Box, Container, Typography, Stack } from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import HubIcon from '@mui/icons-material/Hub';
import DonutLargeIcon from '@mui/icons-material/DonutLarge';

export const PrecisionFeatures = () => {
  const features = [
    {
      id: 'skill-gap',
      icon: (
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            bgcolor: '#f5f3ff',
            color: '#6366f1',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2.5,
          }}
        >
          <InsightsIcon sx={{ fontSize: 26 }} />
        </Box>
      ),
      title: 'Skill-Gap Analysis',
      description:
        'Instantly identify shortages in specific critical missions and receive suggested matches based on volunteer talent pools.',
    },
    {
      id: 'real-time',
      icon: (
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            bgcolor: '#ede9fe',
            color: '#7c3aed',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2.5,
          }}
        >
          <HubIcon sx={{ fontSize: 26 }} />
        </Box>
      ),
      title: 'Real-Time Coverage',
      description:
        'Track and coordinate resources across all zones seamlessly with real-time updates and live dispatch status alerts.',
    },
    {
      id: 'ai-match',
      icon: (
        <Box
          sx={{
            width: 52,
            height: 52,
            borderRadius: '50%',
            bgcolor: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 2.5,
          }}
        >
          <DonutLargeIcon sx={{ fontSize: 26 }} />
        </Box>
      ),
      title: 'AI Candidate Match',
      description:
        'Autonomous match scoring assigns the best volunteers to emergencies based on location, availability, and background.',
    },
  ];

  return (
    <Box id="features" sx={{ py: { xs: 8, md: 12 }, position: 'relative' }}>
      <Container maxWidth="lg">
        {/* Section Header */}
        <Box sx={{ textAlign: 'center', maxWidth: 650, mx: 'auto', mb: { xs: 5, md: 7 } }}>
          <Typography
            variant="h2"
            sx={{
              fontSize: { xs: '2rem', sm: '2.5rem' },
              fontWeight: 800,
              color: '#0f172a',
              letterSpacing: '-0.02em',
              mb: 1.5,
            }}
          >
            Precision Deployment Features
          </Typography>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: '0.95rem', sm: '1.05rem' },
              color: '#64748b',
              lineHeight: 1.6,
            }}
          >
            Continuous real-time tracking, quality analytics and rapid deployment
            through intelligent automation.
          </Typography>
        </Box>

        {/* Feature Cards Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 3, md: 3.5 },
          }}
        >
          {features.map((item) => (
            <Box
              key={item.id}
              sx={{
                bgcolor: '#ffffff',
                borderRadius: '24px',
                p: { xs: 3.5, sm: 4 },
                border: '1px solid #f1f3f9',
                boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
                transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                '&:hover': {
                  transform: 'translateY(-6px)',
                  borderColor: 'rgba(99, 102, 241, 0.35)',
                  boxShadow: '0 20px 40px -12px rgba(99, 102, 241, 0.12)',
                },
              }}
            >
              {item.icon}

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '1.18rem',
                  color: '#0f172a',
                  mb: 1.5,
                }}
              >
                {item.title}
              </Typography>

              <Typography
                variant="body2"
                sx={{
                  fontSize: '0.92rem',
                  color: '#64748b',
                  lineHeight: 1.65,
                }}
              >
                {item.description}
              </Typography>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

