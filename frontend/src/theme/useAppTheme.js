import { createContext, useContext } from 'react';
import { DEFAULT_THEME } from './theme';

export const ThemeContext = createContext({
  themeName: DEFAULT_THEME,
  mode: 'light',
  setThemeName: () => {},
  toggleMode: () => {},
  availableThemes: {},
});

export const useAppTheme = () => useContext(ThemeContext);

