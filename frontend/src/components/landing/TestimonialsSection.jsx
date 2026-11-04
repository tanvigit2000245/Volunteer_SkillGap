import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Stack,
  IconButton,
  Avatar,
  Rating,
} from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

export const TestimonialsSection = () => {
  const [scrollIndex, setScrollIndex] = useState(0);

  const testimonials = [
    {
      id: 1,
      rating: 5,
      quote:
        '“Skill-Gap analysis drastically cut our dispatch delays. We always deploy the right skilled hands on time now.”',
      author: 'Sarah Jenkins',
      title: 'Head of Disaster Response, RedCross',
      avatarUrl:
        'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&q=80',
      initials: 'SJ',
    },
    {
      id: 2,
      rating: 5,
      quote:
        '“The automated volunteer allocation changed everything. Fast, intuitive, and accurate even in peak relief crisis.”',
      author: 'Marcus Chen',
      title: 'Operations Director, FoodBank Global',
      avatarUrl:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      initials: 'MC',
    },
    {
      id: 3,
      rating: 5,
      quote:
        '“Real-time tracking of volunteers gave our field team complete confidence and transparency across all operational sites.”',
      author: 'Elena Rodriguez',
      title: 'Chief Volunteer Officer, HopeWorks',
      avatarUrl:
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=120&q=80',
      initials: 'ER',
    },
  ];

  const handleNext = () => {
    setScrollIndex((prev) => (prev + 1) % testimonials.length);
  };

  const handlePrev = () => {
    setScrollIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <Box id="reviews" sx={{ py: { xs: 8, md: 11 }, position: 'relative' }}>
      <Container maxWidth="lg">
        {/* Header Row: Title & Navigation */}
        <Box
          sx={{
            display: 'flex',
            alignItems: { xs: 'flex-start', sm: 'flex-end' },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            mb: { xs: 4, md: 6 },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              variant="h2"
              sx={{
                fontSize: { xs: '2rem', sm: '2.5rem' },
                fontWeight: 800,
                color: '#0f172a',
                letterSpacing: '-0.02em',
                mb: 1,
              }}
            >
              Trusted by Coordinators
            </Typography>
            <Typography
              variant="body1"
              sx={{
                fontSize: { xs: '0.95rem', sm: '1.02rem' },
                color: '#64748b',
              }}
            >
              Hear from organizations that rely on our platform daily.
            </Typography>
          </Box>

          {/* Carousel Arrows */}
          <Stack direction="row" spacing={1.5} alignItems="center">
            <IconButton
              onClick={handlePrev}
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                color: '#475569',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#f8fafc',
                  borderColor: '#6366f1',
                  color: '#6366f1',
                },
              }}
            >
              <ChevronLeftIcon />
            </IconButton>
            <IconButton
              onClick={handleNext}
              sx={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                border: '1px solid #e2e8f0',
                bgcolor: '#ffffff',
                color: '#475569',
                transition: 'all 0.2s ease',
                '&:hover': {
                  bgcolor: '#f8fafc',
                  borderColor: '#6366f1',
                  color: '#6366f1',
                },
              }}
            >
              <ChevronRightIcon />
            </IconButton>
          </Stack>
        </Box>

        {/* Testimonial Cards Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
            gap: { xs: 3, md: 3.5 },
          }}
        >
          {testimonials.map((t) => (
            <Box
              key={t.id}
              sx={{
                bgcolor: '#ffffff',
                borderRadius: '24px',
                p: { xs: 3.5, sm: 4 },
                border: '1px solid #f1f3f9',
                boxShadow: '0 4px 20px -2px rgba(15, 23, 42, 0.04)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                transition: 'all 0.35s ease',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: '0 18px 36px -8px rgba(99, 102, 241, 0.1)',
                  borderColor: 'rgba(99, 102, 241, 0.25)',
                },
              }}
            >
              <Box>
                {/* 5 Stars */}
                <Rating
                  value={t.rating}
                  readOnly
                  sx={{
                    color: '#f59e0b',
                    fontSize: '1.25rem',
                    mb: 2.5,
                  }}
                />

                {/* Quote */}
                <Typography
                  variant="body1"
                  sx={{
                    fontSize: '0.96rem',
                    color: '#334155',
                    lineHeight: 1.65,
                    fontStyle: 'italic',
                    mb: 3.5,
                  }}
                >
                  {t.quote}
                </Typography>
              </Box>

              {/* Author Info */}
              <Stack direction="row" spacing={1.8} alignItems="center">
                <Avatar
                  src={t.avatarUrl}
                  alt={t.author}
                  sx={{
                    width: 44,
                    height: 44,
                    bgcolor: '#e0e7ff',
                    color: '#4338ca',
                    fontWeight: 700,
                    fontSize: '0.9rem',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                  }}
                >
                  {t.initials}
                </Avatar>
                <Box>
                  <Typography
                    variant="subtitle2"
                    sx={{
                      fontWeight: 700,
                      color: '#0f172a',
                      fontSize: '0.92rem',
                    }}
                  >
                    {t.author}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{
                      color: '#64748b',
                      fontSize: '0.78rem',
                      display: 'block',
                    }}
                  >
                    {t.title}
                  </Typography>
                </Box>
              </Stack>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

