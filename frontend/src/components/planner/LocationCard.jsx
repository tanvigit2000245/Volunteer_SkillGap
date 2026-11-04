import React from 'react';
import { Box, Typography, Stack, Chip } from '@mui/material';

export const CircularGauge = ({ percentage = 90, color = '#4338ca', size = 56 }) => {
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Box sx={{ position: 'relative', width: size, height: size, flexShrink: 0 }}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Typography
          sx={{
            fontSize: '0.78rem',
            fontWeight: 800,
            color: '#0f172a',
          }}
        >
          {percentage}%
        </Typography>
      </Box>
    </Box>
  );
};

export const LocationCard = ({ location }) => {
  const isOptimal = location.percentage >= 100 || !location.skillGapAlert;
  const ringColor = isOptimal ? '#10b981' : '#4338ca';
  const borderColor = isOptimal ? 'rgba(16, 185, 129, 0.85)' : 'rgba(239, 68, 68, 0.85)';

  return (
    <Box
      sx={{
        bgcolor: '#ffffff',
        borderRadius: '22px',
        p: { xs: 2.5, sm: 3.2 },
        border: `2px solid ${borderColor}`,
        boxShadow: isOptimal
          ? '0 8px 24px -4px rgba(16, 185, 129, 0.12), 0 2px 6px rgba(0, 0, 0, 0.02)'
          : '0 10px 30px -4px rgba(239, 68, 68, 0.15), 0 2px 6px rgba(0, 0, 0, 0.02)',
        mb: 2.8,
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: isOptimal
            ? '0 14px 35px -6px rgba(16, 185, 129, 0.22)'
            : '0 16px 40px -6px rgba(239, 68, 68, 0.25)',
        },
      }}
    >
      {/* Top Header Row: Site info & Circular Gauge */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          mb: location.skillGapAlert ? 2.2 : 2.5,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{
              fontWeight: 800,
              fontSize: '1.15rem',
              color: '#0f172a',
              lineHeight: 1.25,
            }}
          >
            {location.name}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.8rem',
              color: '#64748b',
              mt: 0.3,
            }}
          >
            Site ID: {location.siteId}
          </Typography>
        </Box>

        <CircularGauge percentage={location.percentage} color={ringColor} size={54} />
      </Box>

      {/* Inner Skill-Gap Alert Box if present */}
      {location.skillGapAlert && (
        <Box
          sx={{
            bgcolor: '#fef2f2',
            border: '1px solid #fee2e2',
            borderRadius: '14px',
            p: 2,
            mb: 2.5,
          }}
        >
          <Typography
            sx={{
              fontSize: '0.88rem',
              fontWeight: 800,
              color: '#dc2626',
              mb: 0.4,
            }}
          >
            Skill-Gap Alert
          </Typography>
          <Typography
            sx={{
              fontSize: '0.82rem',
              color: '#991b1b',
              lineHeight: 1.5,
            }}
          >
            {location.skillGapAlert}
          </Typography>
        </Box>
      )}

      {/* Tags Row */}
      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
        {location.tags.map((tag) => (
          <Chip
            key={tag.label}
            label={tag.label}
            size="small"
            sx={{
              fontSize: '0.74rem',
              fontWeight: 700,
              bgcolor: tag.bg || '#f1f5f9',
              color: tag.color || '#475569',
              borderRadius: '9999px',
              border: `1px solid ${tag.border || 'transparent'}`,
              height: 26,
            }}
          />
        ))}
      </Stack>
    </Box>
  );
};

