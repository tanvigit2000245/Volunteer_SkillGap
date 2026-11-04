import React from 'react';
import { Box, Container, Typography, Button, Stack } from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import teamPhotoLocal from '../../assets/team_photo.png';
import handsPhotoLocal from '../../assets/hands_photo.png';

export const PassionPurposeSection = ({ onLearnStory }) => {
  const teamImg =
    'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=600&q=80';
  const handsImg =
    'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?auto=format&fit=crop&w=600&q=80';

  return (
    <Box id="about" sx={{ py: { xs: 8, md: 12 }, position: 'relative' }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1.05fr' },
            gap: { xs: 6, md: 8 },
            alignItems: 'center',
          }}
        >
          {/* Left Column: 2x2 Bento Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 2.5,
              maxWidth: 480,
              mx: { xs: 'auto', md: 0 },
              width: '100%',
            }}
          >
            {/* 1. Team Photo (Top Left) */}
            <Box
              sx={{
                borderRadius: '22px',
                overflow: 'hidden',
                height: { xs: 150, sm: 190 },
                boxShadow: '0 8px 24px -6px rgba(15, 23, 42, 0.12)',
                position: 'relative',
              }}
            >
              <Box
                component="img"
                src={teamImg}
                onError={(e) => {
                  e.target.src = teamPhotoLocal;
                }}
                alt="Volunteers Collaborating"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.4s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
            </Box>

            {/* 2. Stat Card: 500+ (Top Right) */}
            <Box
              sx={{
                bgcolor: '#ffffff',
                borderRadius: '22px',
                height: { xs: 150, sm: 190 },
                p: { xs: 2.5, sm: 3 },
                border: '1.5px solid #e0e7ff',
                boxShadow: '0 8px 25px -5px rgba(99, 102, 241, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 16px 32px -6px rgba(99, 102, 241, 0.18)',
                  borderColor: '#6366f1',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '2.2rem', sm: '2.8rem' },
                  fontWeight: 800,
                  color: '#6366f1',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  mb: 0.8,
                }}
              >
                500+
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Active Relief Missions
              </Typography>
            </Box>

            {/* 3. Stat Card: 10k+ (Bottom Left) */}
            <Box
              sx={{
                bgcolor: '#ffffff',
                borderRadius: '22px',
                height: { xs: 150, sm: 190 },
                p: { xs: 2.5, sm: 3 },
                border: '1.5px solid #e0e7ff',
                boxShadow: '0 8px 25px -5px rgba(99, 102, 241, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 16px 32px -6px rgba(99, 102, 241, 0.18)',
                  borderColor: '#6366f1',
                },
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '2.2rem', sm: '2.8rem' },
                  fontWeight: 800,
                  color: '#6366f1',
                  lineHeight: 1.1,
                  letterSpacing: '-0.02em',
                  mb: 0.8,
                }}
              >
                10k+
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: '#64748b',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                Volunteers Deployed
              </Typography>
            </Box>

            {/* 4. Hands Photo (Bottom Right) */}
            <Box
              sx={{
                borderRadius: '22px',
                overflow: 'hidden',
                height: { xs: 150, sm: 190 },
                boxShadow: '0 8px 24px -6px rgba(15, 23, 42, 0.12)',
                position: 'relative',
              }}
            >
              <Box
                component="img"
                src={handsImg}
                onError={(e) => {
                  e.target.src = handsPhotoLocal;
                }}
                alt="Volunteers Hands Together"
                sx={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  display: 'block',
                  transition: 'transform 0.4s ease',
                  '&:hover': {
                    transform: 'scale(1.05)',
                  },
                }}
              />
            </Box>
          </Box>

          {/* Right Column: Mission Narrative */}
          <Box sx={{ textAlign: { xs: 'center', md: 'left' } }}>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2.1rem', sm: '2.7rem' },
                fontWeight: 800,
                color: '#0f172a',
                lineHeight: 1.2,
                letterSpacing: '-0.02em',
                mb: 2.8,
              }}
            >
              Bridging the Gap Between{' '}
              <Box
                component="span"
                sx={{
                  color: '#6366f1',
                  fontWeight: 800,
                }}
              >
                Passion
              </Box>{' '}
              and{' '}
              <Box
                component="span"
                sx={{
                  color: '#8b5cf6',
                  fontWeight: 800,
                }}
              >
                Purpose
              </Box>
              .
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.98rem', md: '1.05rem' },
                color: '#475569',
                lineHeight: 1.75,
                mb: 2.2,
              }}
            >
              Every crisis response requires swift, dedicated action, but having
              willing hands without the required skills can stall relief
              operations. We believe every passionate volunteer deserves to be in
              the right place, at the right time, with the right purpose.
            </Typography>

            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.98rem', md: '1.05rem' },
                color: '#475569',
                lineHeight: 1.75,
                mb: 4.5,
              }}
            >
              Our platform bridges the disconnect between volunteer availability
              and actual mission demand, ensuring no volunteer’s talents are
              underutilized in times of urgent crisis.
            </Typography>

            {/* Dark Action Pill Button */}
            <Button
              variant="contained"
              onClick={onLearnStory}
              endIcon={<ArrowForwardIcon sx={{ fontSize: '18px !important' }} />}
              sx={{
                bgcolor: '#0f172a',
                color: '#ffffff',
                borderRadius: '9999px',
                px: 3.8,
                py: 1.35,
                fontSize: '0.92rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 8px 20px -4px rgba(15, 23, 42, 0.25)',
                transition: 'all 0.25s ease',
                '&:hover': {
                  bgcolor: '#1e293b',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 12px 24px -4px rgba(15, 23, 42, 0.35)',
                },
              }}
            >
              Learn Our Story
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

