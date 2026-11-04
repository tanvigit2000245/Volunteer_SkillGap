import React from 'react';
import { Box, Typography } from '@mui/material';

export const PlannerStatsRow = ({
  totalVolunteers = 1284,
  staffingCoverage = 82,
  activeGaps = 12,
  pendingReviews = 45,
}) => {
  const stats = [
    {
      id: 'volunteers',
      label: 'TOTAL VOLUNTEERS',
      value: totalVolunteers.toLocaleString(),
      valueColor: '#0f172a',
      iconBg: '#eff2fe',
      isAlert: false,
    },
    {
      id: 'coverage',
      label: 'STAFFING COVERAGE',
      value: `${staffingCoverage}%`,
      valueColor: '#0f172a',
      iconBg: '#ecfdf5',
      isAlert: false,
    },
    {
      id: 'gaps',
      label: 'ACTIVE SKILL GAPS',
      value: activeGaps,
      valueColor: '#dc2626',
      iconBg: '#fef2f2',
      isAlert: activeGaps > 0,
    },
    {
      id: 'reviews',
      label: 'PENDING REVIEWS',
      value: pendingReviews,
      valueColor: '#0f172a',
      iconBg: '#fffbeb',
      isAlert: false,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
        gap: 2.5,
        mb: 4,
      }}
    >
      {stats.map((item) => (
        <Box
          key={item.id}
          sx={{
            bgcolor: '#ffffff',
            borderRadius: '22px',
            p: 3,
            display: 'flex',
            alignItems: 'center',
            gap: 2.2,
            position: 'relative',
            border: item.isAlert
              ? '1.5px solid rgba(239, 68, 68, 0.4)'
              : '1px solid rgba(226, 232, 240, 0.8)',
            boxShadow: item.isAlert
              ? '0 12px 35px -6px rgba(239, 68, 68, 0.28), 0 2px 8px rgba(0, 0, 0, 0.02)'
              : '0 8px 24px -4px rgba(15, 23, 42, 0.05), 0 2px 6px rgba(0, 0, 0, 0.02)',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            '&:hover': {
              transform: 'translateY(-3px)',
              boxShadow: item.isAlert
                ? '0 16px 40px -6px rgba(239, 68, 68, 0.38)'
                : '0 12px 30px -4px rgba(99, 102, 241, 0.12)',
            },
          }}
        >
          {/* Squircle Soft Box on Left */}
          <Box
            sx={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              bgcolor: item.iconBg,
              flexShrink: 0,
              boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.03)',
            }}
          />

          {/* Stat Details */}
          <Box>
            <Typography
              sx={{
                fontSize: '0.68rem',
                fontWeight: 700,
                color: '#64748b',
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                mb: 0.4,
              }}
            >
              {item.label}
            </Typography>
            <Typography
              sx={{
                fontSize: '1.75rem',
                fontWeight: 800,
                color: item.valueColor,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
              }}
            >
              {item.value}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

