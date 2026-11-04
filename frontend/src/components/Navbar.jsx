import { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Tooltip,
  Chip,
  Avatar,
  useTheme,
  alpha,
  Divider,
} from '@mui/material';
import PaletteIcon from '@mui/icons-material/Palette';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import TuneIcon from '@mui/icons-material/Tune';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAppTheme } from '../theme/useAppTheme';

export const Navbar = ({ onOpenThemeDrawer, onRunOptimizer, isOptimizing, onBackToLanding }) => {
  const theme = useTheme();
  const { themeName, setThemeName, mode, toggleMode, availableThemes } = useAppTheme();
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenThemeMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseThemeMenu = () => {
    setAnchorEl(null);
  };

  const handleSelectTheme = (name) => {
    setThemeName(name);
    handleCloseThemeMenu();
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: theme.palette.mode === 'dark' 
          ? alpha(theme.palette.background.paper, 0.85) 
          : alpha('#ffffff', 0.85),
        backdropFilter: 'blur(16px)',
        borderBottom: `1px solid ${theme.palette.divider}`,
        color: theme.palette.text.primary,
        zIndex: theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ justifyContent: 'space-between', py: 1, px: { xs: 2, md: 4 } }}>
        {/* Brand & Identity */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.secondary.main} 100%)`,
              color: '#ffffff',
              boxShadow: `0 8px 16px -2px ${alpha(theme.palette.primary.main, 0.4)}`,
              transform: 'perspective(600px) rotateY(-8deg) rotateX(6deg)',
              transition: 'transform 0.3s ease',
              '&:hover': {
                transform: 'perspective(600px) rotateY(0deg) rotateX(0deg) scale(1.05)',
              },
            }}
          >
            <VolunteerActivismIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: { xs: '1rem', md: '1.2rem' }, lineHeight: 1.2 }}>
                VolunPlan <span style={{ color: theme.palette.primary.main }}>Platform</span>
              </Typography>
              <Chip
                label="LIVE DISPATCH"
                size="small"
                sx={{
                  height: 20,
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  letterSpacing: '0.05em',
                  bgcolor: alpha(theme.palette.primary.main, 0.12),
                  color: theme.palette.primary.main,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
                }}
              />
            </Box>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', fontSize: '0.75rem' }}>
              Skill-Gap Optimizer & Rapid Resource Engine
            </Typography>
          </Box>
        </Box>

        {/* Center / Right Controls */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: 1, sm: 1.5 } }}>
          {onBackToLanding && (
            <Button
              variant="outlined"
              size="small"
              onClick={onBackToLanding}
              startIcon={<ArrowBackIcon sx={{ fontSize: '16px !important' }} />}
              sx={{
                borderRadius: '9999px',
                borderColor: 'divider',
                color: 'text.primary',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.82rem',
                px: 1.8,
                py: 0.5,
                '&:hover': {
                  borderColor: theme.palette.primary.main,
                  color: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.05),
                },
              }}
            >
              Back to Home
            </Button>
          )}
          {/* Quick Optimizer Run Button */}
          <Button
            variant="contained"
            color="primary"
            startIcon={<PlayArrowIcon />}
            onClick={onRunOptimizer}
            disabled={isOptimizing}
            sx={{
              display: { xs: 'none', sm: 'inline-flex' },
              px: 2.2,
              borderRadius: 3,
            }}
          >
            {isOptimizing ? 'Evaluating Constraints...' : 'Run Match Optimizer'}
          </Button>

          {/* Theme Quick Switcher Menu */}
          <Tooltip title="Switch Theme Palette">
            <Button
              variant="outlined"
              size="small"
              onClick={handleOpenThemeMenu}
              startIcon={
                <Box
                  sx={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    bgcolor: availableThemes[themeName]?.swatch || theme.palette.primary.main,
                    boxShadow: '0 0 6px rgba(0,0,0,0.2)',
                  }}
                />
              }
              endIcon={<PaletteIcon fontSize="small" />}
              sx={{
                borderRadius: 3,
                borderColor: alpha(theme.palette.text.primary, 0.15),
                color: theme.palette.text.primary,
                display: { xs: 'none', md: 'inline-flex' },
              }}
            >
              {availableThemes[themeName]?.name || 'Theme'}
            </Button>
          </Tooltip>

          {/* Theme Switcher Dropdown */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleCloseThemeMenu}
            PaperProps={{
              sx: {
                borderRadius: 3,
                mt: 1.5,
                minWidth: 220,
                boxShadow: theme.shadows[4],
                border: `1px solid ${theme.palette.divider}`,
              },
            }}
          >
            <Box sx={{ px: 2, py: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                Color Palettes
              </Typography>
            </Box>
            <Divider sx={{ my: 0.5 }} />
            {Object.entries(availableThemes).map(([key, item]) => (
              <MenuItem
                key={key}
                onClick={() => handleSelectTheme(key)}
                selected={themeName === key}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  py: 1,
                  px: 2,
                  borderRadius: 1.5,
                  mx: 1,
                  mb: 0.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      width: 18,
                      height: 18,
                      borderRadius: '50%',
                      bgcolor: item.swatch,
                      border: '2px solid #fff',
                      boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                    }}
                  />
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: themeName === key ? 700 : 500 }}>
                      {item.name}
                    </Typography>
                  </Box>
                </Box>
                {themeName === key && <CheckCircleOutlinedIcon fontSize="small" color="primary" />}
              </MenuItem>
            ))}
          </Menu>

          {/* Dark / Light Mode Toggle */}
          <Tooltip title={`Switch to ${mode === 'light' ? 'Dark' : 'Light'} Mode`}>
            <IconButton
              onClick={toggleMode}
              sx={{
                bgcolor: alpha(theme.palette.text.primary, 0.05),
                '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.1) },
              }}
            >
              {mode === 'dark' ? (
                <LightModeIcon sx={{ color: '#f59e0b' }} />
              ) : (
                <DarkModeIcon sx={{ color: '#64748b' }} />
              )}
            </IconButton>
          </Tooltip>

          {/* Theme Drawer Settings Trigger */}
          <Tooltip title="Customize Theme & Visual Styles">
            <IconButton
              onClick={onOpenThemeDrawer}
              sx={{
                bgcolor: alpha(theme.palette.primary.main, 0.1),
                color: theme.palette.primary.main,
                '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
              }}
            >
              <TuneIcon />
            </IconButton>
          </Tooltip>

          {/* Coordinator Profile Avatar */}
          <Tooltip title="Coordinator: Rohit Kumar (Lead Planner)">
            <Avatar
              sx={{
                width: 38,
                height: 38,
                bgcolor: theme.palette.primary.main,
                fontWeight: 700,
                fontSize: '0.85rem',
                border: `2px solid ${alpha(theme.palette.primary.main, 0.3)}`,
                cursor: 'pointer',
              }}
            >
              RK
            </Avatar>
          </Tooltip>
        </Box>
      </Toolbar>
    </AppBar>
  );
};
