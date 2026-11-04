import React from 'react';
import { Box, Typography, Stack, LinearProgress } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const DashboardMockup = ({ onLaunchDemo }) => {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 580,
        mx: 'auto',
        perspective: '1000px',
      }}
    >
      {/* Ambient Glow Behind Mockup */}
      <Box
        sx={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '85%',
          height: '85%',
          background: 'radial-gradient(circle, rgba(139, 92, 246, 0.35) 0%, rgba(99, 102, 241, 0.15) 50%, transparent 70%)',
          filter: 'blur(45px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      {/* Main Dark Dashboard Window */}
      <Box
        onClick={onLaunchDemo}
        sx={{
          position: 'relative',
          zIndex: 1,
          background: '#0d1224',
          borderRadius: '20px',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          boxShadow: '0 25px 60px -15px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(99, 102, 241, 0.15)',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)',
          '&:hover': {
            transform: 'translateY(-4px) scale(1.01)',
            boxShadow: '0 30px 70px -12px rgba(99, 102, 241, 0.28), 0 0 0 1px rgba(139, 92, 246, 0.35)',
          },
        }}
      >
        {/* Window Header Bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            px: 2,
            py: 1.2,
            background: 'rgba(255, 255, 255, 0.03)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.07)',
          }}
        >
          {/* 3 Window Dots */}
          <Stack direction="row" spacing={0.8} alignItems="center">
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <Box sx={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
          </Stack>

          {/* Search / Status Bar */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              px: 1.8,
              py: 0.3,
              borderRadius: '9999px',
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
            }}
          >
            <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: '#10b981', mr: 1 }} />
            <Typography sx={{ fontSize: '0.68rem', color: '#94a3b8', letterSpacing: '0.04em' }}>
              volunplan.ai / live-dispatch-v2
            </Typography>
          </Box>

          <Typography sx={{ fontSize: '0.65rem', color: '#64748b' }}>
            Live Sync
          </Typography>
        </Box>

        {/* Dashboard Content */}
        <Box sx={{ p: 2.2 }}>
          {/* Top Charts Row */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', sm: '1fr 1.35fr' },
              gap: 1.8,
              mb: 1.8,
            }}
          >
            {/* Donut Chart Widget */}
            <Box
              sx={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '14px',
                p: 1.8,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', mb: 1, fontWeight: 600, width: '100%' }}>
                Skill Gap Allocation
              </Typography>
              <Box sx={{ position: 'relative', width: 110, height: 110 }}>
                <svg width="110" height="110" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="rgba(255, 255, 255, 0.06)"
                    strokeWidth="12"
                  />
                  {/* Purple segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#8b5cf6"
                    strokeWidth="12"
                    strokeDasharray="251.2"
                    strokeDashoffset="75"
                    strokeLinecap="round"
                    transform="rotate(-90 50 50)"
                  />
                  {/* Cyan segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#06b6d4"
                    strokeWidth="12"
                    strokeDasharray="251.2"
                    strokeDashoffset="180"
                    strokeLinecap="round"
                    transform="rotate(60 50 50)"
                  />
                  {/* Pink segment */}
                  <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="transparent"
                    stroke="#ec4899"
                    strokeWidth="12"
                    strokeDasharray="251.2"
                    strokeDashoffset="220"
                    strokeLinecap="round"
                    transform="rotate(160 50 50)"
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
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc' }}>
                    89%
                  </Typography>
                  <Typography sx={{ fontSize: '0.58rem', color: '#94a3b8' }}>
                    Covered
                  </Typography>
                </Box>
              </Box>

              {/* Bar indicator below donut */}
              <Stack direction="row" spacing={1.5} mt={1.4} sx={{ width: '100%' }}>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.62rem', color: '#94a3b8' }}>EMT Lead</Typography>
                  <Box sx={{ height: 4, width: '100%', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, mt: 0.3 }}>
                    <Box sx={{ height: '100%', width: '92%', bgcolor: '#06b6d4', borderRadius: 2 }} />
                  </Box>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: '0.62rem', color: '#94a3b8' }}>Bilingual</Typography>
                  <Box sx={{ height: 4, width: '100%', bgcolor: 'rgba(255,255,255,0.1)', borderRadius: 2, mt: 0.3 }}>
                    <Box sx={{ height: '100%', width: '84%', bgcolor: '#8b5cf6', borderRadius: 2 }} />
                  </Box>
                </Box>
              </Stack>
            </Box>

            {/* Glowing Neon Mountain Wave Area Chart */}
            <Box
              sx={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '14px',
                p: 1.8,
                border: '1px solid rgba(255, 255, 255, 0.06)',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                  Deployment Trajectory
                </Typography>
                <Typography sx={{ fontSize: '0.65rem', color: '#10b981', fontWeight: 700 }}>
                  +34.2% Peak
                </Typography>
              </Box>

              {/* SVG Glowing Area Chart */}
              <Box sx={{ width: '100%', height: 110, mt: 0.5, position: 'relative' }}>
                <svg width="100%" height="100%" viewBox="0 0 240 100" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="waveGlow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#ec4899" stopOpacity="0.75" />
                      <stop offset="40%" stopColor="#8b5cf6" stopOpacity="0.45" />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                    </linearGradient>
                    <linearGradient id="waveLine" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#a855f7" />
                      <stop offset="50%" stopColor="#ec4899" />
                      <stop offset="100%" stopColor="#f43f5e" />
                    </linearGradient>
                  </defs>
                  {/* Grid Lines */}
                  <line x1="0" y1="25" x2="240" y2="25" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <line x1="0" y1="55" x2="240" y2="55" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />
                  <line x1="0" y1="85" x2="240" y2="85" stroke="rgba(255,255,255,0.06)" strokeDasharray="3 3" />

                  {/* Filled Area */}
                  <path
                    d="M0,85 Q30,80 50,60 T100,55 T150,20 T190,45 T240,15 L240,100 L0,100 Z"
                    fill="url(#waveGlow)"
                  />
                  {/* Stroke Line */}
                  <path
                    d="M0,85 Q30,80 50,60 T100,55 T150,20 T190,45 T240,15"
                    fill="none"
                    stroke="url(#waveLine)"
                    strokeWidth="3.2"
                    strokeLinecap="round"
                  />
                  {/* Peak Marker Dot */}
                  <circle cx="150" cy="20" r="4.5" fill="#f43f5e" stroke="#ffffff" strokeWidth="2" />
                  <circle cx="240" cy="15" r="4" fill="#ec4899" />
                </svg>
              </Box>

              {/* Chart Footnote */}
              <Stack direction="row" justifyContent="space-between" mt={1}>
                <Typography sx={{ fontSize: '0.62rem', color: '#64748b' }}>08:00 AM</Typography>
                <Typography sx={{ fontSize: '0.62rem', color: '#64748b' }}>12:00 PM</Typography>
                <Typography sx={{ fontSize: '0.62rem', color: '#64748b' }}>04:00 PM</Typography>
                <Typography sx={{ fontSize: '0.62rem', color: '#64748b' }}>08:00 PM</Typography>
              </Stack>
            </Box>
          </Box>

          {/* Bottom 3 Mini Metric Cards */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 1.5,
            }}
          >
            {/* Card 1: Active Crews (Orange) */}
            <Box
              sx={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                p: 1.2,
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                Active Crews
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', my: 0.3 }}>
                48
              </Typography>
              <Box sx={{ height: 18, width: '100%' }}>
                <svg width="100%" height="18" viewBox="0 0 60 18">
                  <path
                    d="M0,15 L15,12 L30,6 L45,8 L60,2"
                    fill="none"
                    stroke="#f97316"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </Box>
            </Box>

            {/* Card 2: Critical Zones (Cyan) */}
            <Box
              sx={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                p: 1.2,
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                Zone Relief
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', my: 0.3 }}>
                94%
              </Typography>
              <Stack direction="row" spacing={0.4} alignItems="flex-end" sx={{ height: 18 }}>
                {[6, 10, 8, 14, 12, 18].map((h, i) => (
                  <Box
                    key={i}
                    sx={{
                      flex: 1,
                      height: `${h}px`,
                      bgcolor: '#06b6d4',
                      borderRadius: '2px',
                    }}
                  />
                ))}
              </Stack>
            </Box>

            {/* Card 3: AI Speed (Purple) */}
            <Box
              sx={{
                background: 'rgba(255, 255, 255, 0.03)',
                borderRadius: '12px',
                p: 1.2,
                border: '1px solid rgba(255, 255, 255, 0.06)',
              }}
            >
              <Typography sx={{ fontSize: '0.65rem', color: '#94a3b8' }}>
                Dispatch Lag
              </Typography>
              <Typography sx={{ fontSize: '0.95rem', fontWeight: 800, color: '#f8fafc', my: 0.3 }}>
                1.4s
              </Typography>
              <Box sx={{ height: 18, width: '100%' }}>
                <svg width="100%" height="18" viewBox="0 0 60 18">
                  <path
                    d="M0,16 Q15,4 30,12 T60,4"
                    fill="none"
                    stroke="#8b5cf6"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>

      {/* Floating Match Rate Card (Top Right) */}
      <Box
        sx={{
          position: 'absolute',
          top: -16,
          right: { xs: 8, sm: -16 },
          zIndex: 3,
          background: '#ffffff',
          borderRadius: '14px',
          p: '10px 16px',
          boxShadow: '0 16px 36px -6px rgba(0, 0, 0, 0.16), 0 0 0 1px rgba(226, 232, 240, 0.9)',
          minWidth: 140,
          animation: 'floatBadge 4s ease-in-out infinite',
          '@keyframes floatBadge': {
            '0%, 100%': { transform: 'translateY(0px)' },
            '50%': { transform: 'translateY(-6px)' },
          },
        }}
      >
        <Stack direction="row" spacing={0.8} alignItems="center" mb={0.4}>
          <CheckCircleIcon sx={{ fontSize: 15, color: '#10b981' }} />
          <Typography
            sx={{
              fontSize: '0.62rem',
              fontWeight: 800,
              color: '#64748b',
              letterSpacing: '0.06em',
            }}
          >
            MATCH RATE
          </Typography>
        </Stack>

        <Typography
          sx={{
            fontSize: '1.45rem',
            fontWeight: 800,
            color: '#0f172a',
            lineHeight: 1.15,
            mb: 0.6,
          }}
        >
          98.4%
        </Typography>

        <Box sx={{ width: '100%', bgcolor: '#e2e8f0', height: 5, borderRadius: 3, overflow: 'hidden' }}>
          <Box
            sx={{
              width: '98.4%',
              height: '100%',
              background: 'linear-gradient(90deg, #10b981 0%, #34d399 100%)',
              borderRadius: 3,
            }}
          />
        </Box>
      </Box>
    </Box>
  );
};

