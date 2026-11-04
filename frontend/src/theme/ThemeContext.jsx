import { useState, useMemo, useEffect } from 'react';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { buildAppTheme, THEME_PALETTES, DEFAULT_THEME } from './theme';
import { ThemeContext } from './useAppTheme';

export const AppThemeProvider = ({ children }) => {
  // Load saved preferences if available
  const [themeName, setThemeName] = useState(() => {
    return localStorage.getItem('skillgap_theme_name') || DEFAULT_THEME;
  });

  const [mode, setMode] = useState(() => {
    return localStorage.getItem('skillgap_theme_mode') || 'light';
  });

  const toggleMode = () => {
    setMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  useEffect(() => {
    localStorage.setItem('skillgap_theme_name', themeName);
  }, [themeName]);

  useEffect(() => {
    localStorage.setItem('skillgap_theme_mode', mode);
  }, [mode]);

  const activeTheme = useMemo(() => {
    return buildAppTheme(themeName, mode);
  }, [themeName, mode]);

  const contextValue = useMemo(() => {
    return {
      themeName,
      mode,
      setThemeName,
      toggleMode,
      availableThemes: THEME_PALETTES,
      currentPalette: THEME_PALETTES[themeName] || THEME_PALETTES[DEFAULT_THEME],
    };
  }, [themeName, mode]);

  return (
    <ThemeContext.Provider value={contextValue}>
      <ThemeProvider theme={activeTheme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
};
