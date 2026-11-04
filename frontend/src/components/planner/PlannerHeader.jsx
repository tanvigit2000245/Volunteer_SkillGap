import React, { useState } from 'react';
import {
  Box,
  Typography,
  Stack,
  Button,
  Menu,
  MenuItem,
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

export const PlannerHeader = ({ onUpdateView, isRefreshing }) => {
  const [date, setDate] = useState('Oct 24, 2023');
  const [region, setRegion] = useState('Northeast Region');
  const [shift, setShift] = useState('Afternoon Shift');

  // Menus
  const [regionAnchor, setRegionAnchor] = useState(null);
  const [shiftAnchor, setShiftAnchor] = useState(null);
  const [dateAnchor, setDateAnchor] = useState(null);

  const regionOptions = ['Northeast Region', 'Metro Emergency Hub', 'Coastal Relief District', 'West Valley'];
  const shiftOptions = ['Morning Shift', 'Afternoon Shift', 'Night Emergency'];
  const dateOptions = ['Oct 24, 2023', 'Oct 25, 2023', 'Oct 26, 2023', 'Live Current'];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: { xs: 'column', md: 'row' },
        justifyContent: 'space-between',
        alignItems: { xs: 'flex-start', md: 'center' },
        gap: 2.5,
        mb: 3.5,
      }}
    >
      {/* Title & Subtitle */}
      <Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 800,
            fontSize: { xs: '1.65rem', sm: '1.9rem' },
            color: '#0f172a',
            letterSpacing: '-0.025em',
            lineHeight: 1.2,
          }}
        >
          Deployment Planner
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: '#64748b',
            fontSize: '0.9rem',
            mt: 0.5,
          }}
        >
          Real-time volunteer skill-gap analysis
        </Typography>
      </Box>

      {/* Pill Filters & Update View Button Bar */}
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.2}
        alignItems="center"
        sx={{
          bgcolor: '#ffffff',
          p: '6px 8px',
          borderRadius: '9999px',
          boxShadow: '0 6px 20px -4px rgba(15, 23, 42, 0.05)',
          border: '1px solid rgba(226, 232, 240, 0.8)',
          width: { xs: '100%', sm: 'auto' },
        }}
      >
        {/* Date Selector Pill */}
        <Button
          size="small"
          onClick={(e) => setDateAnchor(e.currentTarget)}
          sx={{
            color: '#334155',
            fontSize: '0.82rem',
            fontWeight: 600,
            textTransform: 'none',
            px: 1.8,
            py: 0.6,
            borderRadius: '9999px',
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
            '&:hover': { bgcolor: '#f1f5f9' },
          }}
        >
          {date}
        </Button>
        <Menu
          anchorEl={dateAnchor}
          open={Boolean(dateAnchor)}
          onClose={() => setDateAnchor(null)}
          PaperProps={{ sx: { borderRadius: 3, mt: 1 } }}
        >
          {dateOptions.map((opt) => (
            <MenuItem
              key={opt}
              onClick={() => {
                setDate(opt);
                setDateAnchor(null);
              }}
              sx={{ fontSize: '0.84rem', fontWeight: 600 }}
            >
              {opt}
            </MenuItem>
          ))}
        </Menu>

        {/* Region Selector Pill */}
        <Button
          size="small"
          endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '16px !important' }} />}
          onClick={(e) => setRegionAnchor(e.currentTarget)}
          sx={{
            color: '#334155',
            fontSize: '0.82rem',
            fontWeight: 600,
            textTransform: 'none',
            px: 1.8,
            py: 0.6,
            borderRadius: '9999px',
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
            '&:hover': { bgcolor: '#f1f5f9' },
          }}
        >
          {region}
        </Button>
        <Menu
          anchorEl={regionAnchor}
          open={Boolean(regionAnchor)}
          onClose={() => setRegionAnchor(null)}
          PaperProps={{ sx: { borderRadius: 3, mt: 1 } }}
        >
          {regionOptions.map((opt) => (
            <MenuItem
              key={opt}
              onClick={() => {
                setRegion(opt);
                setRegionAnchor(null);
              }}
              sx={{ fontSize: '0.84rem', fontWeight: 600 }}
            >
              {opt}
            </MenuItem>
          ))}
        </Menu>

        {/* Shift Selector Pill */}
        <Button
          size="small"
          endIcon={<KeyboardArrowDownIcon sx={{ fontSize: '16px !important' }} />}
          onClick={(e) => setShiftAnchor(e.currentTarget)}
          sx={{
            color: '#334155',
            fontSize: '0.82rem',
            fontWeight: 600,
            textTransform: 'none',
            px: 1.8,
            py: 0.6,
            borderRadius: '9999px',
            bgcolor: '#f8fafc',
            border: '1px solid #e2e8f0',
            '&:hover': { bgcolor: '#f1f5f9' },
          }}
        >
          {shift}
        </Button>
        <Menu
          anchorEl={shiftAnchor}
          open={Boolean(shiftAnchor)}
          onClose={() => setShiftAnchor(null)}
          PaperProps={{ sx: { borderRadius: 3, mt: 1 } }}
        >
          {shiftOptions.map((opt) => (
            <MenuItem
              key={opt}
              onClick={() => {
                setShift(opt);
                setShiftAnchor(null);
              }}
              sx={{ fontSize: '0.84rem', fontWeight: 600 }}
            >
              {opt}
            </MenuItem>
          ))}
        </Menu>

        {/* Update View Pill Button */}
        <Button
          variant="contained"
          size="small"
          onClick={onUpdateView}
          disabled={isRefreshing}
          sx={{
            background: 'linear-gradient(135deg, #4338ca 0%, #4f46e5 100%)',
            color: '#ffffff',
            borderRadius: '9999px',
            px: 2.8,
            py: 0.8,
            fontSize: '0.84rem',
            fontWeight: 700,
            textTransform: 'none',
            boxShadow: '0 4px 14px rgba(67, 56, 202, 0.4)',
            transition: 'all 0.2s ease',
            '&:hover': {
              background: 'linear-gradient(135deg, #3730a3 0%, #4338ca 100%)',
              boxShadow: '0 6px 18px rgba(67, 56, 202, 0.5)',
              transform: 'translateY(-1px)',
            },
          }}
        >
          {isRefreshing ? 'Refreshing...' : 'Update View'}
        </Button>
      </Stack>
    </Box>
  );
};

