import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Button,
  Card,
  CardContent,
  Radio,
  useTheme,
  alpha,
  Alert,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PaletteIcon from '@mui/icons-material/Palette';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import CodeIcon from '@mui/icons-material/Code';
import { useAppTheme } from '../theme/useAppTheme';

export const ThemeDrawer = ({ open, onClose }) => {
  const theme = useTheme();
  const { themeName, setThemeName, mode, toggleMode, availableThemes } = useAppTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: 400 },
          p: 3,
          bgcolor: theme.palette.background.paper,
        },
      }}
    >
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, 0.12),
              color: theme.palette.primary.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <PaletteIcon />
          </Box>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 800 }}>
              Theme Settings
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              Custom theme presets & styles
            </Typography>
          </Box>
        </Box>
        <IconButton onClick={onClose} size="small">
          <CloseIcon />
        </IconButton>
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Info notice about separate theme file */}
      <Alert
        severity="info"
        icon={<CodeIcon />}
        sx={{
          mb: 3,
          borderRadius: 2.5,
          fontSize: '0.8rem',
          bgcolor: alpha(theme.palette.info.main, 0.08),
          border: `1px solid ${alpha(theme.palette.info.main, 0.2)}`,
        }}
      >
        <strong>Theme configuration file:</strong>
        <br />
        <code>src/theme/theme.js</code>
        <br />
        Edit <code>THEME_PALETTES</code> to modify or add any colors, shadows, and fonts.
      </Alert>

      {/* Color Mode Section */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Appearance Mode
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          fullWidth
          variant={mode === 'light' ? 'contained' : 'outlined'}
          color={mode === 'light' ? 'primary' : 'inherit'}
          startIcon={<LightModeIcon />}
          onClick={() => mode !== 'light' && toggleMode()}
          sx={{ py: 1.2, borderRadius: 2.5 }}
        >
          Light
        </Button>
        <Button
          fullWidth
          variant={mode === 'dark' ? 'contained' : 'outlined'}
          color={mode === 'dark' ? 'primary' : 'inherit'}
          startIcon={<DarkModeIcon />}
          onClick={() => mode !== 'dark' && toggleMode()}
          sx={{ py: 1.2, borderRadius: 2.5 }}
        >
          Dark
        </Button>
      </Box>

      {/* Palette Selection */}
      <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1.5, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        Select Color Palette
      </Typography>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 3 }}>
        {Object.entries(availableThemes).map(([key, item]) => {
          const isSelected = themeName === key;
          const paletteData = item[mode];

          return (
            <Card
              key={key}
              onClick={() => setThemeName(key)}
              sx={{
                borderRadius: 3,
                border: isSelected
                  ? `2px solid ${item.swatch}`
                  : `1px solid ${theme.palette.divider}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                bgcolor: isSelected ? alpha(item.swatch, 0.05) : 'transparent',
                '&:hover': {
                  borderColor: item.swatch,
                  transform: 'translateY(-2px)',
                },
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2" sx={{ fontWeight: isSelected ? 800 : 600 }}>
                    {item.name}
                  </Typography>
                  <Radio checked={isSelected} size="small" sx={{ color: item.swatch, '&.Mui-checked': { color: item.swatch } }} />
                </Box>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1.5 }}>
                  {item.description}
                </Typography>

                {/* Swatch chips */}
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: paletteData.primary.main,
                      border: '2px solid #fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    }}
                    title={`Primary: ${paletteData.primary.main}`}
                  />
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: paletteData.secondary.main,
                      border: '2px solid #fff',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
                    }}
                    title={`Secondary: ${paletteData.secondary.main}`}
                  />
                  <Box
                    sx={{
                      width: 24,
                      height: 24,
                      borderRadius: '50%',
                      bgcolor: paletteData.background.default,
                      border: '1px solid #ccc',
                    }}
                    title={`Background: ${paletteData.background.default}`}
                  />
                </Box>
              </CardContent>
            </Card>
          );
        })}
      </Box>

      {/* Code Sample Box */}
      <Box sx={{ mt: 'auto', p: 2, borderRadius: 2.5, bgcolor: alpha(theme.palette.text.primary, 0.03), border: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="caption" sx={{ fontWeight: 700, display: 'block', mb: 0.5 }}>
          Quick Tweak Example in theme.js:
        </Typography>
        <Typography
          variant="caption"
          component="pre"
          sx={{
            fontFamily: 'monospace',
            color: 'text.secondary',
            fontSize: '0.72rem',
            whiteSpace: 'pre-wrap',
          }}
        >
          {`// In src/theme/theme.js:
THEME_PALETTES.custom = {
  name: 'Custom',
  light: { primary: { main: '#YOUR_COLOR' } }
};`}
        </Typography>
      </Box>
    </Drawer>
  );
};
