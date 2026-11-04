import { createTheme, alpha } from '@mui/material/styles';

/**
 * ============================================================================
 * THEME CONFIGURATION FILE: Volunteer Skill-Gap Deployment Planner
 * ============================================================================
 * 
 * HOW TO EASILY CHANGE OR ADD THEMES:
 * 1. Modify the primary/secondary colors in `THEME_PALETTES` below.
 * 2. To add a new theme, add an entry to `THEME_PALETTES` with light/dark values.
 * 3. Change `DEFAULT_THEME` to set the initial theme for the entire application.
 */

export const THEME_PALETTES = {
  volunplan: {
    name: 'VolunPlan Violet (Official)',
    description: 'Official VolunPlan violet-indigo & modern civic AI palette',
    swatch: '#6366f1',
    light: {
      primary: {
        main: '#6366f1',
        light: '#818cf8',
        dark: '#4f46e5',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#8b5cf6',
        light: '#a78bfa',
        dark: '#7c3aed',
        contrastText: '#ffffff',
      },
      background: {
        default: '#fcfbfe',
        paper: '#ffffff',
        subtle: '#f5f3ff',
      },
      accent: '#6366f1',
      warning: '#f59e0b',
      error: '#ef4444',
      success: '#10b981',
      info: '#06b6d4',
    },
    dark: {
      primary: {
        main: '#818cf8',
        light: '#a5b4fc',
        dark: '#6366f1',
        contrastText: '#0f172a',
      },
      secondary: {
        main: '#a78bfa',
        light: '#c4b5fd',
        dark: '#8b5cf6',
        contrastText: '#0f172a',
      },
      background: {
        default: '#0f172a',
        paper: '#13192f',
        subtle: '#1e293b',
      },
      accent: '#818cf8',
      warning: '#fbbf24',
      error: '#f87171',
      success: '#34d399',
      info: '#38bdf8',
    },
  },

  emerald: {
    name: 'Emerald Trust',
    description: 'Community, health, and humanitarian mission green',
    swatch: '#059669',
    light: {
      primary: {
        main: '#059669',
        light: '#34d399',
        dark: '#047857',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#0284c7',
        light: '#38bdf8',
        dark: '#0369a1',
        contrastText: '#ffffff',
      },
      background: {
        default: '#f8fafc',
        paper: '#ffffff',
        subtle: '#f1f5f9',
      },
      accent: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      success: '#10b981',
      info: '#06b6d4',
    },
    dark: {
      primary: {
        main: '#10b981',
        light: '#34d399',
        dark: '#059669',
        contrastText: '#0f172a',
      },
      secondary: {
        main: '#38bdf8',
        light: '#7dd3fc',
        dark: '#0284c7',
        contrastText: '#0f172a',
      },
      background: {
        default: '#091312',
        paper: '#10221e',
        subtle: '#152e29',
      },
      accent: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      success: '#34d399',
      info: '#22d3ee',
    },
  },

  ocean: {
    name: 'Ocean Sapphire',
    description: 'Crisp, operational deep blue & electric cyan',
    swatch: '#2563eb',
    light: {
      primary: {
        main: '#2563eb',
        light: '#60a5fa',
        dark: '#1d4ed8',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#0d9488',
        light: '#2dd4bf',
        dark: '#0f766e',
        contrastText: '#ffffff',
      },
      background: {
        default: '#f8fafc',
        paper: '#ffffff',
        subtle: '#f1f5f9',
      },
      accent: '#3b82f6',
      warning: '#f59e0b',
      error: '#ef4444',
      success: '#10b981',
      info: '#0ea5e9',
    },
    dark: {
      primary: {
        main: '#3b82f6',
        light: '#93c5fd',
        dark: '#1d4ed8',
        contrastText: '#0f172a',
      },
      secondary: {
        main: '#2dd4bf',
        light: '#5eead4',
        dark: '#0f766e',
        contrastText: '#0f172a',
      },
      background: {
        default: '#0b1120',
        paper: '#131d34',
        subtle: '#1c2948',
      },
      accent: '#60a5fa',
      warning: '#fbbf24',
      error: '#f87171',
      success: '#34d399',
      info: '#38bdf8',
    },
  },

  sunset: {
    name: 'Sunset Amber',
    description: 'Vibrant, warm civic response & emergency aid',
    swatch: '#ea580c',
    light: {
      primary: {
        main: '#ea580c',
        light: '#fb923c',
        dark: '#c2410c',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#7c3aed',
        light: '#a78bfa',
        dark: '#6d28d9',
        contrastText: '#ffffff',
      },
      background: {
        default: '#fffaf5',
        paper: '#ffffff',
        subtle: '#fef3e8',
      },
      accent: '#f97316',
      warning: '#d97706',
      error: '#e11d48',
      success: '#059669',
      info: '#0284c7',
    },
    dark: {
      primary: {
        main: '#f97316',
        light: '#fdba74',
        dark: '#c2410c',
        contrastText: '#0f172a',
      },
      secondary: {
        main: '#a78bfa',
        light: '#c4b5fd',
        dark: '#7c3aed',
        contrastText: '#0f172a',
      },
      background: {
        default: '#1c130c',
        paper: '#2a1a10',
        subtle: '#3d2516',
      },
      accent: '#fb923c',
      warning: '#f59e0b',
      error: '#fb7185',
      success: '#34d399',
      info: '#38bdf8',
    },
  },

  amethyst: {
    name: 'Amethyst Royal',
    description: 'Modern executive purple & tech-forward analytics',
    swatch: '#7c3aed',
    light: {
      primary: {
        main: '#7c3aed',
        light: '#a78bfa',
        dark: '#5b21b6',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#db2777',
        light: '#f472b6',
        dark: '#be185d',
        contrastText: '#ffffff',
      },
      background: {
        default: '#faf5ff',
        paper: '#ffffff',
        subtle: '#f3e8ff',
      },
      accent: '#8b5cf6',
      warning: '#f59e0b',
      error: '#ef4444',
      success: '#10b981',
      info: '#06b6d4',
    },
    dark: {
      primary: {
        main: '#a78bfa',
        light: '#c4b5fd',
        dark: '#7c3aed',
        contrastText: '#0f172a',
      },
      secondary: {
        main: '#f472b6',
        light: '#fbcfe8',
        dark: '#db2777',
        contrastText: '#0f172a',
      },
      background: {
        default: '#120d1c',
        paper: '#1e1430',
        subtle: '#2a1c44',
      },
      accent: '#c4b5fd',
      warning: '#fbbf24',
      error: '#f87171',
      success: '#34d399',
      info: '#22d3ee',
    },
  },
};

export const DEFAULT_THEME = 'volunplan';

/**
 * Build dynamic MUI theme given themeName and color mode ('light' | 'dark')
 */
export const buildAppTheme = (themeName = DEFAULT_THEME, mode = 'light') => {
  const paletteConfig = THEME_PALETTES[themeName] || THEME_PALETTES[DEFAULT_THEME];
  const colors = paletteConfig[mode];
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: colors.primary,
      secondary: colors.secondary,
      background: {
        default: colors.background.default,
        paper: colors.background.paper,
      },
      text: {
        primary: isDark ? '#f1f5f9' : '#0f172a',
        secondary: isDark ? '#94a3b8' : '#64748b',
      },
      success: { main: colors.success },
      warning: { main: colors.warning },
      error: { main: colors.error },
      info: { main: colors.info },
      divider: isDark ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.07)',
    },
    typography: {
      fontFamily: [
        'Plus Jakarta Sans',
        'Inter',
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        'sans-serif',
      ].join(','),
      h1: { fontWeight: 800, letterSpacing: '-0.025em' },
      h2: { fontWeight: 700, letterSpacing: '-0.02em' },
      h3: { fontWeight: 700, letterSpacing: '-0.015em' },
      h4: { fontWeight: 700, letterSpacing: '-0.01em' },
      h5: { fontWeight: 600, letterSpacing: '-0.005em' },
      h6: { fontWeight: 600 },
      subtitle1: { fontWeight: 500 },
      subtitle2: { fontWeight: 500, fontSize: '0.875rem' },
      body1: { fontSize: '0.9375rem', lineHeight: 1.6 },
      body2: { fontSize: '0.85rem', lineHeight: 1.5 },
      button: { textTransform: 'none', fontWeight: 600 },
    },
    shape: {
      borderRadius: 14,
    },
    shadows: [
      'none',
      isDark ? '0 2px 8px rgba(0, 0, 0, 0.4)' : '0 2px 8px rgba(15, 23, 42, 0.04)',
      isDark ? '0 4px 14px rgba(0, 0, 0, 0.5)' : '0 4px 14px rgba(15, 23, 42, 0.06)',
      isDark ? '0 8px 24px rgba(0, 0, 0, 0.55)' : '0 8px 24px rgba(15, 23, 42, 0.08)',
      isDark ? '0 12px 32px rgba(0, 0, 0, 0.6)' : '0 12px 32px rgba(15, 23, 42, 0.10)',
      ...Array(20).fill(
        isDark ? '0 16px 40px rgba(0, 0, 0, 0.65)' : '0 16px 40px rgba(15, 23, 42, 0.12)'
      ),
    ],
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: colors.background.default,
            transition: 'background-color 0.3s ease, color 0.3s ease',
            scrollbarWidth: 'thin',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            backgroundImage: 'none',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.08)' : '1px solid rgba(0, 0, 0, 0.06)',
            boxShadow: isDark
              ? '0 10px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5)'
              : '0 10px 25px -5px rgba(15, 23, 42, 0.05), 0 8px 10px -6px rgba(15, 23, 42, 0.02)',
            transition: 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: isDark
                ? `0 16px 32px -4px rgba(0, 0, 0, 0.7), 0 0 20px -2px ${alpha(colors.primary.main, 0.2)}`
                : `0 16px 32px -4px rgba(15, 23, 42, 0.1), 0 0 20px -2px ${alpha(colors.primary.main, 0.15)}`,
            },
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            padding: '8px 18px',
            fontWeight: 600,
            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
          },
          containedPrimary: {
            background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.primary.dark} 100%)`,
            boxShadow: `0 4px 14px ${alpha(colors.primary.main, 0.35)}`,
            '&:hover': {
              background: `linear-gradient(135deg, ${colors.primary.light} 0%, ${colors.primary.main} 100%)`,
              boxShadow: `0 6px 20px ${alpha(colors.primary.main, 0.5)}`,
              transform: 'translateY(-1px)',
            },
          },
          containedSecondary: {
            background: `linear-gradient(135deg, ${colors.secondary.main} 0%, ${colors.secondary.dark} 100%)`,
            boxShadow: `0 4px 14px ${alpha(colors.secondary.main, 0.35)}`,
            '&:hover': {
              transform: 'translateY(-1px)',
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 600,
            borderRadius: 8,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
    },
  });
};

