import React from 'react';
import { Box, Typography, Stack, Button, Avatar, Chip } from '@mui/material';

export const CandidateCard = ({ candidate, onAssign }) => {
  const isAvailable = candidate.status === 'Available';
  const isAssigned = candidate.status === 'Assigned';

  const badgeBg = candidate.matchRate >= 90 ? '#10b981' : candidate.matchRate >= 80 ? '#f59e0b' : '#64748b';

  return (
    <Box
      sx={{
        bgcolor: '#ffffff',
        borderRadius: '20px',
        p: { xs: 2.2, sm: 2.6 },
        border: '1px solid rgba(226, 232, 240, 0.85)',
        boxShadow: '0 6px 20px -4px rgba(15, 23, 42, 0.04), 0 1px 4px rgba(0, 0, 0, 0.02)',
        mb: 2.2,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', sm: 'center' },
        gap: 2,
        transition: 'all 0.25s ease',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: '0 12px 30px -6px rgba(99, 102, 241, 0.1)',
          borderColor: '#c7d2fe',
        },
      }}
    >
      {/* Left: Avatar with Match Badge + Info */}
      <Stack direction="row" spacing={2.2} alignItems="center">
        {/* Avatar with Floating Match Badge */}
        <Box sx={{ position: 'relative', flexShrink: 0 }}>
          <Avatar
            src={candidate.avatarUrl}
            alt={candidate.name}
            sx={{
              width: 52,
              height: 52,
              borderRadius: '16px',
              bgcolor: '#e0e7ff',
              color: '#4338ca',
              fontWeight: 700,
            }}
          >
            {candidate.name.split(' ').map((n) => n[0]).join('')}
          </Avatar>

          {/* Match Score Badge */}
          <Box
            sx={{
              position: 'absolute',
              top: -6,
              right: -8,
              bgcolor: badgeBg,
              color: '#ffffff',
              borderRadius: '9999px',
              px: 0.7,
              py: 0.1,
              fontSize: '0.64rem',
              fontWeight: 800,
              boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
              border: '1.5px solid #ffffff',
            }}
          >
            {candidate.matchRate}%
          </Box>
        </Box>

        {/* Name, Credentials & Skills */}
        <Box>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: '1rem',
              color: '#0f172a',
              lineHeight: 1.25,
            }}
          >
            {candidate.name}
          </Typography>
          <Typography
            sx={{
              fontSize: '0.78rem',
              color: '#64748b',
              mt: 0.2,
              mb: 0.8,
            }}
          >
            {candidate.credentials}
          </Typography>

          {/* Skill Tag Pills */}
          <Stack direction="row" spacing={0.8} flexWrap="wrap" useFlexGap>
            {candidate.skills.map((skill) => (
              <Chip
                key={skill}
                label={skill}
                size="small"
                sx={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  bgcolor: '#f8fafc',
                  color: '#475569',
                  borderRadius: '6px',
                  border: '1px solid #e2e8f0',
                  height: 22,
                }}
              />
            ))}
          </Stack>
        </Box>
      </Stack>

      {/* Right: Assign / Status Action Button */}
      <Box sx={{ alignSelf: { xs: 'flex-end', sm: 'center' }, flexShrink: 0 }}>
        {isAssigned ? (
          <Button
            disabled
            variant="contained"
            size="small"
            sx={{
              bgcolor: '#dcfce7 !important',
              color: '#15803d !important',
              borderRadius: '9999px',
              px: 2.8,
              py: 0.85,
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              boxShadow: 'none',
            }}
          >
            Assigned ✓
          </Button>
        ) : isAvailable ? (
          <Button
            variant="contained"
            size="small"
            onClick={() => onAssign(candidate)}
            sx={{
              background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)',
              color: '#ffffff',
              borderRadius: '9999px',
              px: 2.8,
              py: 0.85,
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              boxShadow: '0 4px 14px rgba(67, 56, 202, 0.35)',
              transition: 'all 0.2s ease',
              '&:hover': {
                background: 'linear-gradient(135deg, #3730a3 0%, #4338ca 100%)',
                boxShadow: '0 6px 18px rgba(67, 56, 202, 0.45)',
                transform: 'translateY(-1px)',
              },
            }}
          >
            Assign Now
          </Button>
        ) : (
          <Button
            disabled
            variant="contained"
            size="small"
            sx={{
              bgcolor: '#f1f5f9 !important',
              color: '#94a3b8 !important',
              borderRadius: '9999px',
              px: 2.8,
              py: 0.85,
              fontSize: '0.78rem',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              boxShadow: 'none',
            }}
          >
            Not Available
          </Button>
        )}
      </Box>
    </Box>
  );
};

