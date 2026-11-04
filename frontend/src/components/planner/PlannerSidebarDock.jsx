import React from 'react';
import { Box, Stack, IconButton, Tooltip, Avatar } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewQuiltIcon from '@mui/icons-material/ViewQuilt';
import PeopleIcon from '@mui/icons-material/People';
import PsychologyIcon from '@mui/icons-material/Psychology';
import HistoryIcon from '@mui/icons-material/History';
import HomeIcon from '@mui/icons-material/Home';

export const PlannerSidebarDock = ({
  activeTab = 'planner',
  onSelectTab,
  onBackToLanding,
}) => {
  const dockItems = [
    { id: 'planner', label: 'Deployment Planner', icon: <DashboardIcon fontSize="small" /> },
    { id: 'matrix', label: 'All Sites & Matrix', icon: <ViewQuiltIcon fontSize="small" /> },
    { id: 'volunteers', label: 'Volunteer Directory', icon: <PeopleIcon fontSize="small" /> },
    { id: 'optimizer', label: 'AI Match Simulator', icon: <PsychologyIcon fontSize="small" /> },
    { id: 'audit', label: 'Audit Logs', icon: <HistoryIcon fontSize="small" /> },
  ];

  return (
    <Box
      sx={{
        width: 72,
        bgcolor: '#ffffff',
        borderRadius: '26px',
        py: 2.2,
        px: 1.2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 12px 35px -6px rgba(15, 23, 42, 0.06), 0 2px 6px rgba(0, 0, 0, 0.02)',
        border: '1px solid rgba(226, 232, 240, 0.85)',
        minHeight: { xs: 480, md: 540 },
        position: { xs: 'static', md: 'sticky' },
        top: 24,
        flexShrink: 0,
      }}
    >
      {/* Top Dock Icon Stack */}
      <Stack spacing={1.6} alignItems="center" sx={{ width: '100%' }}>
        {dockItems.map((item, index) => {
          const isActive = activeTab === item.id;
          return (
            <Tooltip key={item.id} title={item.label} placement="right" arrow>
              <Box
                onClick={() => onSelectTab(item.id)}
                sx={{
                  width: 44,
                  height: 44,
                  borderRadius: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
                  background: isActive
                    ? 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)'
                    : '#f8fafc',
                  color: isActive ? '#ffffff' : '#64748b',
                  boxShadow: isActive
                    ? '0 6px 18px rgba(79, 70, 229, 0.38)'
                    : 'inset 0 1px 2px rgba(0, 0, 0, 0.04)',
                  border: isActive
                    ? 'none'
                    : '1px solid rgba(226, 232, 240, 0.7)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    color: isActive ? '#ffffff' : '#4338ca',
                    bgcolor: isActive
                      ? 'linear-gradient(135deg, #3730a3 0%, #4f46e5 100%)'
                      : '#edf2fe',
                    borderColor: '#c7d2fe',
                  },
                }}
              >
                {item.icon}
              </Box>
            </Tooltip>
          );
        })}
      </Stack>

      {/* Bottom Profile Avatar & Home button */}
      <Stack spacing={1.5} alignItems="center" sx={{ width: '100%' }}>
        {/* Home / Back to Landing */}
        {onBackToLanding && (
          <Tooltip title="Back to Landing Page" placement="right" arrow>
            <IconButton
              onClick={onBackToLanding}
              size="small"
              sx={{
                width: 38,
                height: 38,
                borderRadius: '12px',
                bgcolor: '#f1f5f9',
                color: '#64748b',
                '&:hover': {
                  bgcolor: '#fee2e2',
                  color: '#dc2626',
                },
              }}
            >
              <HomeIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        {/* User Profile Avatar with Colorful Gradient Ring */}
        <Tooltip title="Dispatcher Profile: Marcus (Online)" placement="right" arrow>
          <Box
            sx={{
              p: '2px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #f43f5e 0%, #a855f7 50%, #06b6d4 100%)',
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(168, 85, 247, 0.35)',
              transition: 'transform 0.2s ease',
              '&:hover': {
                transform: 'scale(1.08)',
              },
            }}
          >
            <Avatar
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=80&q=80"
              alt="Dispatcher Avatar"
              sx={{
                width: 36,
                height: 36,
                border: '2px solid #ffffff',
              }}
            />
          </Box>
        </Tooltip>
      </Stack>
    </Box>
  );
};

