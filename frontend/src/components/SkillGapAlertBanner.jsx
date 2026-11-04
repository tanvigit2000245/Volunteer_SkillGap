import {
  Box,
  Paper,
  Typography,
  Button,
  Chip,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

export const SkillGapAlertBanner = ({ totalGaps, onQuickResolve }) => {
  const theme = useTheme();

  if (totalGaps === 0) {
    return (
      <Paper
        elevation={0}
        sx={{
          mb: 4,
          p: 2.5,
          borderRadius: 3.5,
          border: `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
          background: `linear-gradient(90deg, ${alpha(theme.palette.success.main, 0.12)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              bgcolor: alpha(theme.palette.success.main, 0.15),
              color: theme.palette.success.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <CheckCircleIcon sx={{ fontSize: 26 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'text.primary' }}>
              All Constraints Fulfilled - Zero Skill Gaps Detected
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              Every active site has verified language, proficiency, and mobility eligibility coverage.
            </Typography>
          </Box>
        </Box>
        <Chip
          label="STATUS: OPTIMAL DEPLOYMENT"
          color="success"
          variant="filled"
          sx={{ fontWeight: 700, borderRadius: 2 }}
        />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        mb: 4,
        p: 2.5,
        borderRadius: 3.5,
        border: `1px solid ${alpha(theme.palette.error.main, 0.35)}`,
        background: `linear-gradient(135deg, ${alpha(theme.palette.error.main, 0.08)} 0%, ${alpha(theme.palette.background.paper, 0.9)} 100%)`,
        boxShadow: `0 8px 24px -4px ${alpha(theme.palette.error.main, 0.1)}`,
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: { xs: 'flex-start', md: 'center' },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Box
            className="pulse-critical"
            sx={{
              width: 46,
              height: 46,
              borderRadius: 3,
              bgcolor: alpha(theme.palette.error.main, 0.15),
              color: theme.palette.error.main,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <WarningAmberIcon sx={{ fontSize: 28 }} />
          </Box>
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', mb: 0.5 }}>
              <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                {totalGaps} Skill-Gap Bottlenecks Require Coordinator Action
              </Typography>
              <Chip
                label="HARD CONSTRAINT FAILURES"
                size="small"
                color="error"
                sx={{ fontWeight: 800, height: 22 }}
              />
            </Box>
            <Typography variant="body2" sx={{ color: 'text.secondary', maxWidth: 750 }}>
              Metro Emergency Shelter lacks certified <strong>Spanish Medical Translation</strong> and <strong>First Aid Lvl 4+</strong>.
              Volunteer pool contains candidate <strong>Mateo Hernandez</strong> who meets 100% of these criteria.
            </Typography>
          </Box>
        </Box>

        <Stack direction="row" spacing={1.5} sx={{ alignSelf: { xs: 'stretch', md: 'center' } }}>
          <Button
            variant="contained"
            color="error"
            startIcon={<AutoFixHighIcon />}
            onClick={onQuickResolve}
            sx={{
              borderRadius: 3,
              px: 2.5,
              whiteSpace: 'nowrap',
              boxShadow: `0 4px 14px ${alpha(theme.palette.error.main, 0.4)}`,
            }}
          >
            Auto-Resolve Gaps
          </Button>
        </Stack>
      </Box>
    </Paper>
  );
};
