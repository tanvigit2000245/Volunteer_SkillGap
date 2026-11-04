import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Slider,
  Switch,
  FormControlLabel,
  Button,
  LinearProgress,
  Chip,
  Paper,
  Stack,
  useTheme,
  alpha,
} from '@mui/material';
import PsychologyIcon from '@mui/icons-material/Psychology';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

export const OptimizerSimulator = ({ onRunOptimization, isOptimizing, lastScore = 94.6 }) => {
  const theme = useTheme();
  const [proficiencyWeight, setProficiencyWeight] = useState(80);
  const [experienceWeight, setExperienceWeight] = useState(60);
  const [strictLanguage, setStrictLanguage] = useState(true);
  const [allowShiftBuffer, setAllowShiftBuffer] = useState(false);
  const [optimizationLogs, setOptimizationLogs] = useState([
    'Constraint Solver initialized (MILP Formulation v2.1).',
    'Loaded 10 volunteer candidate vectors across 4 service centers.',
    'Hard constraints parsed: language fluency, mandatory mobility, shift overlap = 0.',
    'System ready for optimization iteration.',
  ]);

  const handleSimulate = () => {
    setOptimizationLogs((prev) => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Triggering optimizer run with Proficiency Weight=${proficiencyWeight}%, Strict Language=${strictLanguage}...`,
      `[${new Date().toLocaleTimeString()}] Formulating constraint matrix: 24 decision variables, 16 eligibility bounds...`,
      `[${new Date().toLocaleTimeString()}] Evaluating candidate Mateo Hernandez for Spanish & First Aid constraints... MATCH FOUND.`,
      `[${new Date().toLocaleTimeString()}] Feasible integer solution reached in 142ms. Objective score: 98.4.`,
    ]);
    onRunOptimization({
      proficiencyWeight,
      experienceWeight,
      strictLanguage,
      allowShiftBuffer,
    });
  };

  const handleResetLogs = () => {
    setOptimizationLogs([
      'Constraint Solver reset to baseline parameters.',
      'Awaiting coordinator execution command.',
    ]);
  };

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 800 }}>
          Constraint-Matching Optimizer Simulator
        </Typography>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          Tune objective weights and relaxation bounds for the integer programming solver
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Controls Configuration Panel */}
        <Grid size={{ xs: 12, md: 5 }}>
          <Card
            className="card-3d-hover"
            sx={{
              borderRadius: 4,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              boxShadow: `0 10px 25px -5px ${alpha(theme.palette.primary.main, 0.1)}`,
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                <Box
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 2.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.12),
                    color: theme.palette.primary.main,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <PsychologyIcon />
                </Box>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                    Solver Objective Weights
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Multi-criteria Pareto prioritization
                  </Typography>
                </Box>
              </Box>

              {/* Slider 1: Proficiency */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Skill Proficiency Threshold Weight
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.primary.main }}>
                    {proficiencyWeight}%
                  </Typography>
                </Box>
                <Slider
                  value={proficiencyWeight}
                  onChange={(e, val) => setProficiencyWeight(val)}
                  valueLabelDisplay="auto"
                  min={10}
                  max={100}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Higher values penalize candidates below target skill tier (1-5).
                </Typography>
              </Box>

              {/* Slider 2: Experience */}
              <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Experience Balance Weight
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
                    {experienceWeight}%
                  </Typography>
                </Box>
                <Slider
                  value={experienceWeight}
                  onChange={(e, val) => setExperienceWeight(val)}
                  valueLabelDisplay="auto"
                  color="secondary"
                  min={0}
                  max={100}
                />
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Blends veteran leaders with developing volunteers at each site.
                </Typography>
              </Box>

              {/* Hard vs Soft Constraints toggles */}
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, mb: 3 }}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={strictLanguage}
                      onChange={(e) => setStrictLanguage(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Enforce Hard Language Constraints
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Zero tolerance for unverified translation fluency
                      </Typography>
                    </Box>
                  }
                />

                <FormControlLabel
                  control={
                    <Switch
                      checked={allowShiftBuffer}
                      onChange={(e) => setAllowShiftBuffer(e.target.checked)}
                      color="primary"
                    />
                  }
                  label={
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Allow ±30min Shift Transition Buffer
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Relaxes boundary constraint for back-to-back shifts
                      </Typography>
                    </Box>
                  }
                />
              </Box>

              {/* Action Buttons */}
              <Stack direction="row" spacing={2}>
                <Button
                  fullWidth
                  variant="contained"
                  color="primary"
                  startIcon={<PlayArrowIcon />}
                  onClick={handleSimulate}
                  disabled={isOptimizing}
                  sx={{ py: 1.2, borderRadius: 3 }}
                >
                  {isOptimizing ? 'Solving LP Model...' : 'Execute Optimizer'}
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleResetLogs}
                  disabled={isOptimizing}
                  sx={{ borderRadius: 3, px: 2 }}
                >
                  <RestartAltIcon />
                </Button>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Solver Execution Telemetry & Live Terminal */}
        <Grid size={{ xs: 12, md: 7 }}>
          <Card
            sx={{
              borderRadius: 4,
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              bgcolor: theme.palette.mode === 'dark' ? '#0d131f' : '#0f172a',
              color: '#f8fafc',
              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
              boxShadow: '0 12px 30px rgba(0,0,0,0.4)',
            }}
          >
            <CardContent sx={{ p: 3, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Terminal Title Bar */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#ef4444' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#f59e0b' }} />
                  <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: '#10b981' }} />
                  <Typography variant="caption" sx={{ ml: 1, fontFamily: 'monospace', color: '#94a3b8' }}>
                    engine: /optimization_engine/solver.py
                  </Typography>
                </Box>
                <Chip
                  icon={<CheckCircleOutlinedIcon sx={{ color: '#10b981 !important' }} />}
                  label={`Score: ${lastScore}%`}
                  size="small"
                  sx={{
                    bgcolor: alpha('#10b981', 0.2),
                    color: '#10b981',
                    fontWeight: 700,
                    fontFamily: 'monospace',
                  }}
                />
              </Box>

              {isOptimizing && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress sx={{ borderRadius: 2, height: 6 }} />
                </Box>
              )}

              {/* Console Output */}
              <Paper
                elevation={0}
                sx={{
                  flexGrow: 1,
                  p: 2,
                  bgcolor: 'transparent',
                  fontFamily: 'Consolas, Monaco, "Courier New", Courier, monospace',
                  fontSize: '0.82rem',
                  lineHeight: 1.7,
                  color: '#93c5fd',
                  overflowY: 'auto',
                  maxHeight: 320,
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 2,
                }}
              >
                {optimizationLogs.map((log, i) => (
                  <Box key={i} sx={{ display: 'flex', gap: 1 }}>
                    <Typography
                      component="span"
                      sx={{ color: '#64748b', fontSize: 'inherit', fontFamily: 'inherit' }}
                    >
                      {String(i + 1).padStart(2, '0')}:
                    </Typography>
                    <Typography
                      component="span"
                      sx={{
                        color: log.includes('MATCH FOUND')
                          ? '#34d399'
                          : log.includes('Hard constraints')
                          ? '#fbbf24'
                          : '#93c5fd',
                        fontSize: 'inherit',
                        fontFamily: 'inherit',
                      }}
                    >
                      {log}
                    </Typography>
                  </Box>
                ))}
              </Paper>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};
