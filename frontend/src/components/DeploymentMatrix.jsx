import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  LinearProgress,
  Divider,
  Button,
  Avatar,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  useTheme,
  alpha,
  Tooltip,
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import PlaceIcon from '@mui/icons-material/Place';
import ScheduleIcon from '@mui/icons-material/Schedule';
import TranslateIcon from '@mui/icons-material/Translate';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import EditNoteIcon from '@mui/icons-material/EditNote';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export const DeploymentMatrix = ({ locations, volunteers, onManualOverride }) => {
  const theme = useTheme();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [overrideVolunteerId, setOverrideVolunteerId] = useState('');
  const [justification, setJustification] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const availableVolunteers = volunteers.filter((v) => v.status === 'Available');

  const handleOpenOverride = (loc) => {
    setSelectedLocation(loc);
    setOverrideVolunteerId(availableVolunteers[0]?.id || '');
    setJustification('');
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleConfirmOverride = () => {
    if (!overrideVolunteerId || !justification.trim()) return;
    onManualOverride(selectedLocation.id, overrideVolunteerId, justification);
    setDialogOpen(false);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800 }}>
            Operational Deployment Matrix
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Real-time multi-location constraint status, skill sufficiency, and staffing targets
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {locations.map((loc) => {
          const fillPercentage = Math.min(100, Math.round((loc.assignedCount / loc.requiredHeadcount) * 100));
          const hasGaps = loc.skillGaps.length > 0;

          return (
            <Grid key={loc.id} size={{ xs: 12, lg: 6 }}>
              <Card
                className="card-3d-hover"
                sx={{
                  borderRadius: 4,
                  border: hasGaps
                    ? `1px solid ${alpha(theme.palette.error.main, 0.4)}`
                    : `1px solid ${alpha(theme.palette.success.main, 0.3)}`,
                  background: hasGaps
                    ? `linear-gradient(180deg, ${alpha(theme.palette.error.main, 0.04)} 0%, ${theme.palette.background.paper} 100%)`
                    : theme.palette.background.paper,
                  boxShadow: hasGaps
                    ? `0 12px 28px -8px ${alpha(theme.palette.error.main, 0.15)}`
                    : `0 12px 28px -8px ${alpha(theme.palette.primary.main, 0.08)}`,
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Top Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Chip
                          label={loc.category}
                          size="small"
                          sx={{
                            fontWeight: 700,
                            fontSize: '0.7rem',
                            bgcolor: alpha(theme.palette.primary.main, 0.1),
                            color: theme.palette.primary.main,
                          }}
                        />
                        <Chip
                          label={loc.id}
                          size="small"
                          variant="outlined"
                          sx={{ fontSize: '0.7rem', fontWeight: 600 }}
                        />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary' }}>
                        {loc.name}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mt: 0.5, color: 'text.secondary' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.8rem' }}>
                          <PlaceIcon sx={{ fontSize: 16 }} />
                          {loc.address}
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.8rem' }}>
                          <ScheduleIcon sx={{ fontSize: 16 }} />
                          {loc.shift}
                        </Box>
                      </Box>
                    </Box>

                    <Chip
                      icon={hasGaps ? <WarningIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" />}
                      label={hasGaps ? `${loc.skillGaps.length} Skill Deficit` : 'Coverage Optimal'}
                      color={hasGaps ? 'error' : 'success'}
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>

                  {/* Headcount Progress */}
                  <Box sx={{ my: 2.5 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.8 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        Staffing Headcount Fulfillment
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: hasGaps ? 'error.main' : 'success.main' }}>
                        {loc.assignedCount} / {loc.requiredHeadcount} Volunteers ({fillPercentage}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={fillPercentage}
                      sx={{
                        height: 8,
                        borderRadius: 4,
                        bgcolor: alpha(theme.palette.text.primary, 0.08),
                        '& .MuiLinearProgress-bar': {
                          borderRadius: 4,
                          bgcolor: hasGaps ? theme.palette.warning.main : theme.palette.success.main,
                        },
                      }}
                    />
                  </Box>

                  {/* Requirements Matrix: Languages & Mobility */}
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mb: 2 }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 0.8,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.secondary.main, 0.08),
                        color: theme.palette.secondary.main,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      <TranslateIcon sx={{ fontSize: 18 }} />
                      Languages: {loc.mandatoryLanguages.join(', ')}
                    </Box>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 0.8,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette.info.main, 0.08),
                        color: theme.palette.info.main,
                        fontSize: '0.8rem',
                        fontWeight: 600,
                      }}
                    >
                      <DirectionsRunIcon sx={{ fontSize: 18 }} />
                      Mobility Required: {loc.mobilityLevel}
                    </Box>
                  </Box>

                  {/* Required Skills Thresholds */}
                  <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary', textTransform: 'uppercase' }}>
                    Required Task Proficiencies (Min Threshold 1-5):
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.8, mb: 2.5 }}>
                    {loc.requiredSkills.map((sk, idx) => (
                      <Chip
                        key={idx}
                        label={`${sk.name} (Lvl ≥ ${sk.minProficiency})`}
                        size="small"
                        sx={{
                          fontWeight: 600,
                          bgcolor: alpha(theme.palette.text.primary, 0.05),
                          border: `1px solid ${alpha(theme.palette.text.primary, 0.1)}`,
                        }}
                      />
                    ))}
                  </Stack>

                  {/* Skill Gaps Breakdown (Explainability) */}
                  {hasGaps && (
                    <Box
                      sx={{
                        p: 1.8,
                        borderRadius: 2.5,
                        bgcolor: alpha(theme.palette.error.main, 0.07),
                        border: `1px dashed ${alpha(theme.palette.error.main, 0.3)}`,
                        mb: 2.5,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'error.main', mb: 0.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                        <WarningIcon fontSize="small" /> Explainable Skill-Gap Diagnostics:
                      </Typography>
                      {loc.skillGaps.map((gap) => (
                        <Box key={gap.id} sx={{ mt: 1 }}>
                          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary' }}>
                            • {gap.skill}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', pl: 1.5 }}>
                            {gap.reason}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  )}

                  <Divider sx={{ my: 2 }} />

                  {/* Assigned Volunteers & Action */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        Deployed ({loc.assignedVolunteers.length}):
                      </Typography>
                      <Stack direction="row" spacing={-0.8}>
                        {loc.assignedVolunteers.map((v, i) => (
                          <Tooltip key={i} title={`${v.name} (${v.role})`}>
                            <Avatar
                              sx={{
                                width: 28,
                                height: 28,
                                fontSize: '0.7rem',
                                bgcolor: theme.palette.primary.main,
                                border: '2px solid #fff',
                              }}
                            >
                              {v.name.charAt(0)}
                            </Avatar>
                          </Tooltip>
                        ))}
                      </Stack>
                    </Box>

                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<EditNoteIcon />}
                      onClick={() => handleOpenOverride(loc)}
                      sx={{ borderRadius: 2 }}
                    >
                      Manual Override
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Manual Override Dialog with Mandatory Audit Logging */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Coordinator Manual Override: {selectedLocation?.name}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>
            According to governance rules (Project Spec MCA-SP-029), all manual overrides require explicit operational justification and are logged with coordinator credentials.
          </Typography>

          <TextField
            select
            fullWidth
            label="Select Candidate from Available Pool"
            value={overrideVolunteerId}
            onChange={(e) => setOverrideVolunteerId(e.target.value)}
            sx={{ mb: 3 }}
          >
            {availableVolunteers.length > 0 ? (
              availableVolunteers.map((vol) => (
                <MenuItem key={vol.id} value={vol.id}>
                  {vol.name} - {vol.title} (Match: {vol.matchScore}%)
                </MenuItem>
              ))
            ) : (
              <MenuItem disabled value="">
                No available volunteers in pool
              </MenuItem>
            )}
          </TextField>

          <TextField
            fullWidth
            multiline
            rows={3}
            label="Operational Justification (Mandatory Audit Trail)"
            placeholder="e.g., Stationed at triage check-in desk; certified under supervisory waiver."
            value={justification}
            onChange={(e) => setJustification(e.target.value)}
            helperText="Recorded permanently in Coordinator Audit Log"
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancel
          </Button>
          <Button
            variant="contained"
            color="primary"
            startIcon={<PersonAddIcon />}
            disabled={!overrideVolunteerId || !justification.trim()}
            onClick={handleConfirmOverride}
          >
            Confirm & Log Override
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};
